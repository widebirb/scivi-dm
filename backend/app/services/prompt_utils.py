import re
import torch

# regex for spec chars
_P_ESCAPED     = r"\\[\\()\[\]]"           # \( \) \[ \] \\ keep as literal
_P_OPEN_PAREN  = r"\("                     # start of (…) group, weight × 1.1
_P_OPEN_BRACK  = r"\["                     # start of […] group, weight × 0.91
_P_WEIGHT_CLOSE = r":\s*([+-]?[\d.]+)\s*\)"  # :1.2), explicit weight + close paren
_P_CLOSE_PAREN = r"\)"                     # plain close-paren
_P_CLOSE_BRACK = r"]"                      # plain close-bracket
_P_TEXT_RUN    = r"[^\\()\[\]:]+"          # run of ordinary characters
_P_LONE_COLON  = r":"                      # stray colon, treated as text

_RE_ATTENTION = re.compile(
    "|".join([
        _P_ESCAPED, _P_OPEN_PAREN, _P_OPEN_BRACK, _P_WEIGHT_CLOSE,
        _P_CLOSE_PAREN, _P_CLOSE_BRACK, _P_TEXT_RUN, _P_LONE_COLON,
    ])
)

_ROUND_MULT = 1.1
_SQUARE_MULT = 1.0 / 1.1

def parse_prompt_attention(text: str) -> list[tuple[str, float]]:
    res: list[tuple[str, float]] = []
    round_stack: list[int] = []   
    square_stack: list[int] = []  

    def _scale_range(start: int, multiplier: float) -> None:
        for i in range(start, len(res)):
            res[i] = (res[i][0], res[i][1] * multiplier)

    for m in _RE_ATTENTION.finditer(text):
        token = m.group(0)
        explicit_weight = m.group(1)

        if token.startswith("\\"):
            res.append((token[1:], 1.0))
        elif token == "(":
            round_stack.append(len(res))
        elif token == "[":
            square_stack.append(len(res))
        elif explicit_weight is not None and round_stack:
            _scale_range(round_stack.pop(), float(explicit_weight))
        elif token == ")" and round_stack:
            _scale_range(round_stack.pop(), _ROUND_MULT)
        elif token == "]" and square_stack:
            _scale_range(square_stack.pop(), _SQUARE_MULT)
        elif token:
            res.append((token, 1.0))

    # Unmatched brackets apply their default multipliers
    for pos in round_stack:
        _scale_range(pos, _ROUND_MULT)
    for pos in square_stack:
        _scale_range(pos, _SQUARE_MULT)

    if not res:
        res = [("", 1.0)]

    # Merge consecutive entries that share the same weight
    merged: list[tuple[str, float]] = [res[0]]
    for text_part, w in res[1:]:
        if w == merged[-1][1]:
            merged[-1] = (merged[-1][0] + text_part, w)
        else:
            merged.append((text_part, w))

    return merged

# Tokenisation with per-token weight tracking
def _tokenize_with_weights(
    tokenizer,
    weighted_parts: list[tuple[str, float]],
    max_length: int = 77,
) -> tuple[list[int], list[float]]:
    """
    Tokenise weighted text parts into a single max_length-length sequence.
    """
    token_ids: list[int] = []
    token_weights: list[float] = []

    for text_part, weight in weighted_parts:
        ids = tokenizer(text_part, add_special_tokens=False).input_ids
        token_ids.extend(ids)
        token_weights.extend([weight] * len(ids))

    # Content slots: max_length minus BOS and EOS
    content_len = max_length - 2
    token_ids = token_ids[:content_len]
    token_weights = token_weights[:content_len]

    # Pad content to content_len
    pad_id = tokenizer.pad_token_id or tokenizer.eos_token_id
    pad_needed = content_len - len(token_ids)
    token_ids.extend([pad_id] * pad_needed)
    token_weights.extend([1.0] * pad_needed)

    # Wrap with BOS and EOS (weight = 1.0, never scaled)
    token_ids = [tokenizer.bos_token_id] + token_ids + [tokenizer.eos_token_id]
    token_weights = [1.0] + token_weights + [1.0]

    return token_ids, token_weights


# Single-chunk encoder
def _build_causal_mask(bsz: int, seq_len: int, dtype: torch.dtype, device: str) -> torch.Tensor:
    """Upper-triangular causal mask expected by CLIPEncoder (transformers < 4.40)."""
    mask = torch.empty(bsz, 1, seq_len, seq_len, dtype=dtype, device=device)
    mask.fill_(torch.finfo(dtype).min)
    mask.triu_(1)
    return mask


def _build_causal_mask(bsz: int, seq_len: int, dtype: torch.dtype, device: str) -> torch.Tensor:
    """Upper-triangular causal mask expected by CLIPEncoder (transformers < 4.40)."""
    mask = torch.empty(bsz, 1, seq_len, seq_len, dtype=dtype, device=device)
    mask.fill_(torch.finfo(dtype).min)
    mask.triu_(1)
    return mask


def _encode_chunk(
    tokenizer,
    text_encoder,
    weighted_parts: list[tuple[str, float]],
    device: str,
) -> tuple[torch.Tensor, torch.Tensor | None]:
    max_len = tokenizer.model_max_length  # 77 for SDXL

    token_ids, token_weights = _tokenize_with_weights(tokenizer, weighted_parts, max_len)
    input_ids = torch.tensor([token_ids], dtype=torch.long, device=device)
    weights_t = torch.tensor([token_weights], device=device).unsqueeze(-1)  # [1, max_len, 1]
    weights_t = torch.tensor([token_weights], device=device).unsqueeze(-1)  # [1, max_len, 1]

    text_model = text_encoder.text_model
    text_model = text_encoder.text_model

    with torch.no_grad():
        bsz, seq_len = input_ids.shape

        token_embeds = text_model.embeddings.token_embedding(input_ids)  # [1, max_len, dim]
        token_embeds = token_embeds * weights_t.to(token_embeds.dtype)

        position_ids = torch.arange(seq_len, device=device).unsqueeze(0)
        position_embeds = text_model.embeddings.position_embedding(position_ids)

        embeds = token_embeds + position_embeds  # [1, max_len, dim]

        causal_mask = _build_causal_mask(bsz, seq_len, embeds.dtype, device)

        encoder_out = text_model.encoder(
            inputs_embeds=embeds,
            causal_attention_mask=causal_mask,
            output_hidden_states=True,
            return_dict=True,
            return_dict=True,
        )


    hidden = encoder_out.hidden_states[-2]  # [1, max_len, hidden_dim]
    hidden = encoder_out.hidden_states[-2]  # [1, max_len, hidden_dim]

    pooled: torch.Tensor | None = None
    if hasattr(text_encoder, "text_projection"):
        last_hidden = text_model.final_layer_norm(encoder_out.last_hidden_state)
        eos_pos = input_ids.argmax(dim=-1)          # EOS has the highest token ID in CLIP
        pooled = text_encoder.text_projection(
            last_hidden[torch.arange(bsz, device=device), eos_pos]
        )                                            # [1, 1280]
    pooled: torch.Tensor | None = None
    if hasattr(text_encoder, "text_projection"):
        last_hidden = text_model.final_layer_norm(encoder_out.last_hidden_state)
        eos_pos = input_ids.argmax(dim=-1)          # EOS has the highest token ID in CLIP
        pooled = text_encoder.text_projection(
            last_hidden[torch.arange(bsz, device=device), eos_pos]
        )                                            # [1, 1280]

    return hidden, pooled



# Full SDXL prompt encoder  (BREAK + weighting, both text encoders)
def encode_sdxl_prompt(
    pipeline,
    prompt: str,
    device: str,
) -> tuple[torch.Tensor, torch.Tensor]:
    """
    Encode an SDXL prompt with BREAK support 
    """
    # Case-sensitive, whole-word split on BREAK
    chunks = re.split(r"\bBREAK\b", prompt)

    hidden_l_chunks: list[torch.Tensor] = []   # CLIP-L  2nd to the last states
    hidden_g_chunks: list[torch.Tensor] = []   # OpenCLIP-G 2nd to the last states
    pooled_output: torch.Tensor | None = None

    for i, chunk in enumerate(chunks):
        chunk = chunk.strip()
        # Parse attention weights, empty chunk single PAD window
        weighted_parts = parse_prompt_attention(chunk) if chunk else [("", 1.0)]

        # CLIP-L  (text_encoder / tokenizer)
        h_l, _ = _encode_chunk(
            pipeline.tokenizer,
            pipeline.text_encoder,
            weighted_parts,
            device,
        )

        # OpenCLIP-G  (text_encoder_2 / tokenizer_2)
        h_g, pooled = _encode_chunk(
            pipeline.tokenizer_2,
            pipeline.text_encoder_2,
            weighted_parts,
            device,
        )

        hidden_l_chunks.append(h_l)
        hidden_g_chunks.append(h_g)

        # Only the first chunk's pooled output is used 
        if i == 0 and pooled is not None:
            pooled_output = pooled

    # Concatenate chunks along the sequence dimension
    combined_l = torch.cat(hidden_l_chunks, dim=1)   
    combined_g = torch.cat(hidden_g_chunks, dim=1)   

    # Concatenate along the feature dimension 
    prompt_embeds = torch.cat([combined_l, combined_g], dim=-1)

    # if every chunk was empty, text_encoder_2 had nothing to pool.
    if pooled_output is None:
        pooled_output = torch.zeros(
            1, 1280, dtype=combined_g.dtype, device=device
        )

    return prompt_embeds, pooled_output


# Convenience wrapper used by real_inference.py
def build_prompt_embeds(
    pipeline,
    prompt: str,
    negative_prompt: str,
    device: str,
) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Encode both the positive and negative prompts and pad them to the same sequence length 
    """
    pos_embeds, pos_pooled = encode_sdxl_prompt(pipeline, prompt or "", device)
    neg_embeds, neg_pooled = encode_sdxl_prompt(pipeline, negative_prompt or "", device)

    # Pad the shorter sequence with zeros so both have the same seq_len
    pos_len, neg_len = pos_embeds.shape[1], neg_embeds.shape[1]
    feat_dim = pos_embeds.shape[-1]

    if pos_len > neg_len:
        pad = torch.zeros(1, pos_len - neg_len, feat_dim, dtype=neg_embeds.dtype, device=device)
        neg_embeds = torch.cat([neg_embeds, pad], dim=1)
    elif neg_len > pos_len:
        pad = torch.zeros(1, neg_len - pos_len, feat_dim, dtype=pos_embeds.dtype, device=device)
        pos_embeds = torch.cat([pos_embeds, pad], dim=1)

    return pos_embeds, neg_embeds, pos_pooled, neg_pooled

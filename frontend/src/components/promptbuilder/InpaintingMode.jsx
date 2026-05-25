import { useState } from "react";

function buildNegativeTag(text, weight) {
    if (!text.trim()) return "";
    if (weight === 1.0) return text.trim();
    return `(${text.trim()}:${weight.toFixed(1)})`;
}

export default function InpaintingMode({ onCopy, onApply }) {
    const [variations, setVariations] = useState([""]);
    const [negTags, setNegTags] = useState([{ text: "", weight: 1 }]);

    function addVariation() {
        if (variations.length >= 3) return;
        setVariations((v) => [...v, ""]);
    }

    function updateVariation(i, value) {
        setVariations((v) => v.map((item, idx) => idx === i ? value : item));
    }

    function removeVariation(i) {
        setVariations((v) => v.filter((_, idx) => idx !== i));
    }

    function addNegTag() {
        setNegTags((t) => [...t, { text: "", weight: 1 }]);
    }

    function updateNegTag(i, field, value) {
        setNegTags((t) => t.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
    }

    function removeNegTag(i) {
        setNegTags((t) => t.filter((_, idx) => idx !== i));
    }

    const filledVariations = variations.filter((v) => v.trim());
    const assembledPrompt = filledVariations.join(", ");

    const assembledNegative = negTags
        .map((t) => buildNegativeTag(t.text, t.weight))
        .filter(Boolean)
        .join(", ");

    function handleCopy() {
        const parts = [];
        if (assembledPrompt) parts.push(assembledPrompt);
        if (assembledNegative) parts.push(`Negative: ${assembledNegative}`);
        navigator.clipboard.writeText(parts.join("\n\n"));
        onCopy?.();
    }

    return (
        <div className="flex gap-4 h-full min-h-0">

            {/* Left - inputs */}
            <div className="flex flex-col gap-4 w-96 overflow-y-auto pr-2 shrink-0">

                {/* Prompt variations */}
                <div className="rounded p-3 flex flex-col gap-2 bg-bg border border-dim">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent-fg">
                            Prompt Variations
                        </span>
                        <span className="text-xs text-tx-muted">
                            {variations.length}/3
                        </span>
                    </div>

                    <p className="text-xs text-tx-muted">
                        Repeat the same feature in 2 - 3 different phrasings. Repetition is important since the model has little context.
                    </p>

                    {variations.map((v, i) => (
                        <div key={i} className="flex gap-1 items-start">
                            <div className="flex flex-col flex-1 gap-0.5">
                                <span className="text-xs text-tx-muted">
                                    phrasing {i + 1}
                                </span>
                                <textarea
                                    rows={2}
                                    value={v}
                                    onChange={(e) => updateVariation(i, e.target.value)}
                                    placeholder="Describe the feature you're inpainting..."
                                    className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none bg-surface border border-bd text-tx focus:border-accent transition-colors"
                                />
                            </div>
                            {variations.length > 1 && (
                                <button
                                    onClick={() => removeVariation(i)}
                                    className="mt-5 text-xs transition-colors text-tx-muted hover:text-danger"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {variations.length < 3 && (
                        <button
                            onClick={addVariation}
                            className="text-xs py-1.5 rounded transition-colors btn-dashed"
                        >
                            + add variation
                        </button>
                    )}
                </div>

                {/* Negative tags with weight */}
                <div className="rounded p-3 flex flex-col gap-2 bg-bg border border-dim">
                    <span className="text-xs font-semibold uppercase tracking-wider text-danger">
                        Negative Tags
                    </span>
                    <p className="text-xs text-tx-muted">
                        Things to exclude.
                    </p>

                    {negTags.map((tag, i) => (
                        <div key={i} className="flex gap-1 items-center">
                            <input
                                type="text"
                                value={tag.text}
                                onChange={(e) => updateNegTag(i, "text", e.target.value)}
                                placeholder="teeth, blurry, deformed"
                                className="flex-1 min-w-0 rounded px-2 py-1.5 text-xs focus:outline-none bg-surface border border-bd text-tx focus:border-danger transition-colors"
                            />

                            {negTags.length > 1 && (
                                <button
                                    onClick={() => removeNegTag(i)}
                                    className="text-xs transition-colors shrink-0 text-tx-muted hover:text-danger"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addNegTag}
                        className="text-xs py-1 rounded transition-colors btn-dashed btn-dashed-danger"
                    >
                        + add tag
                    </button>
                </div>

            </div>

            {/* Right - preview */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">

                <span className="text-xs uppercase tracking-widest text-tx-muted">
                    Preview
                </span>

                <div className="flex-1 rounded p-3 text-xs overflow-y-auto font-mono leading-relaxed bg-bg border border-dim text-tx-dim pre-wrap break-words">
                    {assembledPrompt || (
                        <span className="text-tx-muted">
                            Fill in the variations on the left to see the assembled prompt here.
                        </span>
                    )}
                </div>

                {assembledNegative && (
                    <div>
                        <p className="text-xs mb-1 text-danger">Negative:</p>
                        <div className="rounded p-3 text-xs font-mono bg-bg border border-danger/40 text-tx-dim">
                            {assembledNegative}
                        </div>
                    </div>
                )}
                {/* Rules reminder */}
                <div className="rounded p-3 text-xs flex flex-col gap-1 bg-accent-dim border border-accent">
                    <p className="font-semibold text-accent-fg">Inpainting rules</p>
                    <p className="text-tx-dim">· Only describe the masked region, no age, style, background</p>
                    <p className="text-tx-dim">· Repeat the feature 2 - 3x in different phrasings</p>
                    <p className="text-tx-dim">· BREAK is optional</p>
                </div>

                <div className="flex gap-2 w-full">
                    <button
                        onClick={handleCopy}
                        disabled={!assembledPrompt}
                        className="flex-1 py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-generate disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Copy Prompt
                    </button>
                    <button
                        onClick={() => onApply?.(assembledPrompt, assembledNegative)}
                        disabled={!assembledPrompt}
                        className="flex-1 py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-apply disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Apply Prompt
                    </button>
                </div>
            </div>
        </div>
    );
}
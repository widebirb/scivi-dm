import { useState } from "react";
import { CHUNKS } from "./config";

function applyWeight(keyword, weight) {
    if (weight === null) return keyword;
    return `(${keyword}:${weight.toFixed(1)})`;
}

function assembleChunk(tags, freeText) {
    const parts = [];
    tags.forEach((tag) => {
        parts.push(applyWeight(tag.label, tag.weight));
    });
    if (freeText.trim()) parts.push(freeText.trim());
    return parts.join(", ");
}

let tagIdCounter = 0;
function newTagId() { return `tag_${++tagIdCounter}`; }

export default function GenerationMode({ onCopy, onApply }) {
    // Each chunk: { text: string, tags: [{ id, label, weight }] }
    const [chunks, setChunks] = useState(
        Object.fromEntries(CHUNKS.map((c) => [c.id, { text: "", tags: [] }]))
    );
    const [negativePrompt, setNegativePrompt] = useState("");

    //Tag operations

    function addTag(chunkId, label) {
        // Don't add duplicates
        if (chunks[chunkId].tags.some((t) => t.label === label)) return;
        setChunks((prev) => ({
            ...prev,
            [chunkId]: {
                ...prev[chunkId],
                tags: [...prev[chunkId].tags, { id: newTagId(), label, weight: null }],
            },
        }));
    }

    function removeTag(chunkId, tagId) {
        setChunks((prev) => ({
            ...prev,
            [chunkId]: {
                ...prev[chunkId],
                tags: prev[chunkId].tags.filter((t) => t.id !== tagId),
            },
        }));
    }

    function updateText(chunkId, text) {
        setChunks((prev) => ({
            ...prev,
            [chunkId]: { ...prev[chunkId], text },
        }));
    }

    // Assembly
    const assembledChunks = CHUNKS
        .map((c) => assembleChunk(chunks[c.id].tags, chunks[c.id].text))
        .filter(Boolean);

    const fullPrompt = assembledChunks.join(" //BREAK//\n");

    function handleCopy() {
        const output = negativePrompt.trim()
            ? `${fullPrompt}\n\nNegative: ${negativePrompt}`
            : fullPrompt;
        navigator.clipboard.writeText(output);
        onCopy?.();
    }

    return (
        <div className="flex gap-4 h-full min-h-0">

            {/* Left - chunk inputs */}
            <div className="flex flex-col gap-3 w-96 overflow-y-auto pr-2 shrink-0">

                {CHUNKS.map((chunk) => {
                    const chunkData = chunks[chunk.id];
                    const activeTags = chunkData.tags;

                    return (
                        <div
                            key={chunk.id}
                            className="rounded p-3 flex flex-col gap-2 bg-bg border border-dim"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-accent-fg">
                                    {chunk.label}
                                </span>
                            </div>

                            {/* Hint */}
                            <p className="text-xs text-tx-muted">{chunk.hint}</p>

                            {/* Active tags with individual weight controls */}
                            {activeTags.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    {activeTags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-dim"
                                        >
                                            {/* Tag label */}
                                            <span className="flex-1 text-xs min-w-0 truncate text-tx-dim">
                                                {tag.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Freeform textarea (user manages their own syntax here) */}
                            <textarea
                                rows={2}
                                value={chunkData.text}
                                onChange={(e) => updateText(chunk.id, e.target.value)}
                                placeholder={chunk.placeholder}
                                className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none bg-surface border border-bd text-tx focus:border-accent transition-colors"
                            />

                            {/* Suggestion chips (click to add as a weighted tag) */}
                            <div className="flex flex-wrap gap-1">
                                {chunk.suggestions.map((tag) => {
                                    const isActive = activeTags.some((t) => t.label === tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => isActive ? removeTag(chunk.id, activeTags.find(t => t.label === tag).id) : addTag(chunk.id, tag)}
                                            className={`px-2 py-0.5 rounded-full text-xs chip-suggestion ${isActive ? "is-active" : ""}`}
                                        >
                                            {isActive ? "✓ " : "+ "}{tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Negative prompt */}
                <div className="rounded p-3 flex flex-col gap-2 bg-bg border border-dim">
                    <span className="text-xs font-semibold uppercase tracking-wider text-danger">
                        Negative Prompt
                    </span>
                    <p className="text-xs text-tx-muted">
                        Things to exclude.
                    </p>
                    <textarea
                        rows={2}
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g. blurry, deformed, bad anatomy"
                        className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none bg-surface border border-bd text-tx focus:border-danger transition-colors"
                    />
                </div>

            </div>

            {/* Right - preview */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-tx-muted">
                        Preview
                    </span>
                    <span className="text-xs text-tx-muted">
                        {assembledChunks.length} chunk{assembledChunks.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="flex-1 rounded p-3 text-xs overflow-y-auto font-mono leading-relaxed bg-bg border border-dim text-tx-dim pre-wrap break-words">
                    {fullPrompt || (
                        <span className="text-tx-muted">
                            Add chips or type in sections on the left to see the assembled prompt. //BREAK// separators are inserted automatically between chunks.
                        </span>
                    )}
                </div>

                {negativePrompt && (
                    <div>
                        <p className="text-xs mb-1 text-danger">Negative:</p>
                        <div className="rounded p-3 text-xs bg-bg border border-danger/40 text-tx-dim">
                            {negativePrompt}
                        </div>
                    </div>
                )}

                <div className="rounded p-3 text-xs flex flex-col gap-1 bg-accent-dim border border-accent">
                    <p className="font-semibold text-accent-fg">Prompting Guide</p>
                    <p className="text-tx-dim">· First keywords carry most weight - subject + style first</p>
                    <p className="text-tx-dim">· //BREAK// separates 75-token chunks to avoid attention competition</p>
                    <p className="text-tx-dim">· Stubborn features: repeat across chunks</p>
                </div>

                <div className="flex gap-2 w-full">
                    <button
                        onClick={handleCopy}
                        disabled={!fullPrompt}
                        className="flex-1 py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-generate disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Copy Prompt
                    </button>
                    <button
                        onClick={() => onApply?.(fullPrompt, negativePrompt)}
                        disabled={!fullPrompt}
                        className="flex-1 py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-apply disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Apply Prompt
                    </button>
                </div>
            </div>
        </div>
    );
}
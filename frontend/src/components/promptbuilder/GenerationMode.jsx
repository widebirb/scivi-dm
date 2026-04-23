import { useState } from "react";
import { CHUNKS, WEIGHT_OPTIONS } from "./config";

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

    function setTagWeight(chunkId, tagId, weight) {
        setChunks((prev) => ({
            ...prev,
            [chunkId]: {
                ...prev[chunkId],
                tags: prev[chunkId].tags.map((t) =>
                    t.id === tagId ? { ...t, weight } : t
                ),
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
                            className="rounded p-3 flex flex-col gap-2"
                            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-dim)" }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-text)" }}>
                                    {chunk.label}
                                </span>

                            </div>

                            {/* Hint */}
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{chunk.hint}</p>

                            {/* Active tags with individual weight controls */}
                            {activeTags.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    {activeTags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded"
                                            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
                                        >
                                            {/* Tag label */}
                                            <span className="flex-1 text-xs min-w-0 truncate" style={{ color: "var(--text-dim)" }}>
                                                {/* {tag.weight !== null
                                                    ? <span style={{ color: "var(--accent-text)" }}>({tag.label}:{tag.weight.toFixed(1)})</span>
                                                    : tag.label
                                                } */}
                                                {tag.label}
                                            </span>

                                            {/* Weight selector 
                                            <select
                                                value={tag.weight === null ? "null" : tag.weight}
                                                onChange={(e) => setTagWeight(
                                                    chunk.id,
                                                    tag.id,
                                                    e.target.value === "null" ? null : Number(e.target.value)
                                                )}
                                                className="text-xs rounded px-1 py-0.5 focus:outline-none shrink-0"
                                                style={{
                                                    backgroundColor: "var(--bg-raised)",
                                                    border: `1px solid ${tag.weight !== null ? "var(--accent)" : "var(--border)"}`,
                                                    color: tag.weight !== null ? "var(--accent-text)" : "var(--text-muted)",
                                                    width: "90px",
                                                }}
                                            >
                                                {WEIGHT_OPTIONS.map((w) => (
                                                    <option key={w.label} value={w.value === null ? "null" : w.value}>
                                                        {w.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => removeTag(chunk.id, tag.id)}
                                                className="text-xs shrink-0 transition-colors"
                                                style={{ color: "var(--text-muted)" }}
                                                onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                                                onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                                            >
                                                ✕
                                            </button>
                                            */}
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
                                className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text)",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                            />

                            {/* Suggestion chips (click to add as a weighted tag) */}
                            <div className="flex flex-wrap gap-1">
                                {chunk.suggestions.map((tag) => {
                                    const isActive = activeTags.some((t) => t.label === tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => isActive ? removeTag(chunk.id, activeTags.find(t => t.label === tag).id) : addTag(chunk.id, tag)}
                                            className="px-2 py-0.5 rounded-full text-xs transition-colors"
                                            style={{
                                                backgroundColor: isActive ? "var(--accent-dim)" : "var(--bg-raised)",
                                                border: `1px solid ${isActive ? "var(--accent)" : "var(--border-dim)"}`,
                                                color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.borderColor = "var(--accent)";
                                                    e.currentTarget.style.color = "var(--accent-text)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.borderColor = "var(--border-dim)";
                                                    e.currentTarget.style.color = "var(--text-muted)";
                                                }
                                            }}
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
                <div
                    className="rounded p-3 flex flex-col gap-2"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-dim)" }}
                >
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                        Negative Prompt
                    </span>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Things to exclude.
                    </p>
                    <textarea
                        rows={2}
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g. blurry, deformed, bad anatomy"
                        className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#ef4444"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                </div>

            </div>

            {/* Right - preview */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        Preview
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {assembledChunks.length} chunk{assembledChunks.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div
                    className="flex-1 rounded p-3 text-xs overflow-y-auto font-mono leading-relaxed"
                    style={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border-dim)",
                        color: "var(--text-dim)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {fullPrompt || (
                        <span style={{ color: "var(--text-muted)" }}>
                            Add chips or type in sections on the left to see the assembled prompt. //BREAK// separators are inserted automatically between chunks.
                        </span>
                    )}
                </div>

                {negativePrompt && (
                    <div>
                        <p className="text-xs mb-1" style={{ color: "#ef4444" }}>Negative:</p>
                        <div
                            className="rounded p-3 text-xs"
                            style={{ backgroundColor: "var(--bg)", border: "1px solid #fca5a5", color: "var(--text-dim)" }}
                        >
                            {negativePrompt}
                        </div>
                    </div>
                )}

                <div
                    className="rounded p-3 text-xs flex flex-col gap-1"
                    style={{ backgroundColor: "var(--accent-dim)", border: "1px solid var(--accent)" }}
                >
                    <p className="font-semibold" style={{ color: "var(--accent-text)" }}>Prompting Guide</p>
                    <p style={{ color: "var(--text-dim)" }}>· First keywords carry most weight - subject + style first</p>
                    <p style={{ color: "var(--text-dim)" }}>· //BREAK// separates 75-token chunks to avoid attention competition</p>
                    <p style={{ color: "var(--text-dim)" }}>· Stubborn features: repeat across chunks</p>
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
                        className="flex-1 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent-text)", border: "1px solid var(--accent)" }}
                        onMouseEnter={(e) => {
                            if (fullPrompt) {
                                e.currentTarget.style.backgroundColor = "var(--accent)";
                                e.currentTarget.style.color = "var(--generate-text)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (fullPrompt) {
                                e.currentTarget.style.backgroundColor = "var(--accent-dim)";
                                e.currentTarget.style.color = "var(--accent-text)";
                            }
                        }}
                    >
                        Apply Prompt
                    </button>
                </div>
            </div>
        </div>
    );
}
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

export default function GenerationMode({ onCopy }) {
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

                            {/* Suggestion chips (click to add as a weighted tag) */}
                            <div className="flex flex-wrap gap-1">
                                {chunk.suggestions.map((tag) => {
                                    const isActive = activeTags.some((t) => t.label === tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => isActive ? removeTag(chunk.id, activeTags.find(t => t.label === tag).id) : addTag(chunk.id, tag)}
                                            className="px-2 py-0.5 rounded-sm text-xs transition-colors"
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

            </div>

        </div>
    );
}
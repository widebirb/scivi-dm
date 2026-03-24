import { useState } from "react";
import { WEIGHT_PRESETS } from "./config";


function buildNegativeTag(text, weight) {
    if (!text.trim()) return "";
    if (weight === 1.0) return text.trim();
    return `(${text.trim()}:${weight.toFixed(1)})`;
}

export default function InpaintingMode({ onCopy }) {
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
                <div
                    className="rounded p-3 flex flex-col gap-2"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-dim)" }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-text)" }}>
                            Prompt Variations
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {variations.length}/3
                        </span>
                    </div>

                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Repeat the same feature in 2–3 different phrasings. The model has little context in a small masked area, repetition is important.
                    </p>

                    {variations.map((v, i) => (
                        <div key={i} className="flex gap-1 items-start">
                            <div className="flex flex-col flex-1 gap-0.5">
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    phrasing {i + 1}
                                </span>
                                <textarea
                                    rows={2}
                                    value={v}
                                    onChange={(e) => updateVariation(i, e.target.value)}
                                    placeholder="Describe the feature you're inpainting..."
                                    className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none"
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text)",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                                />
                            </div>
                            {variations.length > 1 && (
                                <button
                                    onClick={() => removeVariation(i)}
                                    className="mt-5 text-xs transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {variations.length < 3 && (
                        <button
                            onClick={addVariation}
                            className="text-xs py-1.5 rounded transition-colors"
                            style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--accent)";
                                e.currentTarget.style.color = "var(--accent-text)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.color = "var(--text-muted)";
                            }}
                        >
                            + add variation
                        </button>
                    )}
                </div>

                {/* Negative tags with weight */}
                <div
                    className="rounded p-3 flex flex-col gap-2"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border-dim)" }}
                >
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                        Negative Tags
                    </span>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Inpainting negatives should be heavily weighted.
                    </p>

                    {negTags.map((tag, i) => (
                        <div key={i} className="flex gap-1 items-center">
                            <input
                                type="text"
                                value={tag.text}
                                onChange={(e) => updateNegTag(i, "text", e.target.value)}
                                placeholder="e.g. teeth, blurry, deformed"
                                className="flex-1 min-w-0 rounded px-2 py-1.5 text-xs focus:outline-none"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text)",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#ef4444"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                            />
                            <select
                                value={tag.weight}
                                onChange={(e) => updateNegTag(i, "weight", Number(e.target.value))}
                                className="rounded px-1 py-1.5 text-xs focus:outline-none"
                                style={{
                                    backgroundColor: "var(--bg-raised)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-dim)",
                                    width: "80px",
                                }}
                            >
                                {WEIGHT_PRESETS.map((w) => (
                                    <option key={w} value={w}>{w === 1.0 ? ":1" : `:${w.toFixed(1)}`}</option>
                                ))}
                            </select>

                            {negTags.length > 1 && (
                                <button
                                    onClick={() => removeNegTag(i)}
                                    className="text-xs transition-colors shrink-0"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addNegTag}
                        className="text-xs py-1 rounded transition-colors"
                        style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#ef4444";
                            e.currentTarget.style.color = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-muted)";
                        }}
                    >
                        + add tag
                    </button>
                </div>

            </div>

            {/* Right - preview */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">

                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Preview
                </span>

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
                    {assembledPrompt || (
                        <span style={{ color: "var(--text-muted)" }}>
                            Fill in the variations on the left to see the assembled prompt here.
                        </span>
                    )}
                </div>

                {assembledNegative && (
                    <div>
                        <p className="text-xs mb-1" style={{ color: "#ef4444" }}>Negative:</p>
                        <div
                            className="rounded p-3 text-xs font-mono"
                            style={{ backgroundColor: "var(--bg)", border: "1px solid #fca5a5", color: "var(--text-dim)" }}
                        >
                            {assembledNegative}
                        </div>
                    </div>
                )}
                {/* Rules reminder */}
                <div
                    className="rounded p-3 text-xs flex flex-col gap-1"
                    style={{ backgroundColor: "var(--accent-dim)", border: "1px solid var(--accent)" }}
                >
                    <p className="font-semibold" style={{ color: "var(--accent-text)" }}>Inpainting rules</p>
                    <p style={{ color: "var(--text-dim)" }}>· Only describe the masked region - no age, style, background</p>
                    <p style={{ color: "var(--text-dim)" }}>· Repeat the feature 2–3× in different phrasings</p>
                    <p style={{ color: "var(--text-dim)" }}>· BREAK is optional - inpaint prompts are short</p>
                    <p style={{ color: "var(--text-dim)" }}>· Weight negatives aggressively: <code>teeth:1.7</code> not just <code>teeth</code></p>
                </div>

                <button
                    onClick={handleCopy}
                    disabled={!assembledPrompt}
                    className="w-full py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-generate disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Copy Prompt
                </button>
            </div>
        </div>
    );
}
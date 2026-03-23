import { useState } from "react";
import { REGIONS, REGION_HINTS, WEIGHT_PRESETS } from "./config";


function buildNegativeTag(text, weight) {
    if (!text.trim()) return "";
    if (weight === 1.0) return text.trim();
    return `(${text.trim()}:${weight.toFixed(1)})`;
}

export default function InpaintingMode({ onCopy }) {
    const [region, setRegion] = useState(null);
    const [variations, setVariations] = useState([""]);
    const [negTags, setNegTags] = useState([{ text: "", weight: 1.7 }]);

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
                            style={{
                                backgroundColor: "var(--bg)",
                                border: "1px solid #fca5a5",
                                color: "var(--text-dim)",
                            }}
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
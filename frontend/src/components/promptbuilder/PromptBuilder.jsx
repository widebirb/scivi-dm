import { useState } from "react";
import GenerationMode from "./GenerationMode";
import InpaintingMode from "./InpaintingMode";

export default function PromptBuilder({ isOpen, onClose }) {
    const [mode, setMode] = useState("generation"); // "generation" | "inpainting"
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    function handleCopy() {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed z-50 flex flex-col rounded-lg shadow-2xl"
                style={{
                    top: "5vh",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(1100px, 95vw)",
                    height: "88vh",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b shrink-0"
                    style={{ borderColor: "var(--border-dim)" }}
                >
                    <div className="flex items-center gap-8">
                        <span
                            className="text-sm font-semibold uppercase tracking-widest"
                            style={{ color: "var(--accent-text)" }}
                        >
                            Prompt (something not called builder)
                        </span>

                        {/* idk where to put this  */}
                        {copied && (
                            <span
                                className="text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: "var(--accent2-dim)", color: "var(--accent2-text)" }}
                            >
                                ✓ copied
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mode toggle */}
                        <div className="flex rounded overflow-hidden">
                            {[
                                { id: "generation", label: "Generation" },
                                { id: "inpainting", label: "Inpainting" },
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors mx-1"
                                    style={{
                                        backgroundColor: mode === m.id ? "var(--accent)" : "var(--bg-raised)",
                                        color: mode === m.id ? "var(--generate-text)" : "var(--text-muted)",
                                    }}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="text-xl transition-colors px-2"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) => e.target.style.color = "var(--text)"}
                            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                        >
                            x
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden p-5">
                    {mode === "generation" && <GenerationMode onCopy={handleCopy} />}
                    {mode === "inpainting" && <InpaintingMode onCopy={handleCopy} />}
                </div>

            </div>
        </>
    );
}
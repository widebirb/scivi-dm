import { useState } from "react";
import GenerationMode from "./GenerationMode";
import InpaintingMode from "./InpaintingMode";

export default function PromptBuilder({ isOpen, onClose, onApply }) {
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
                className="fixed inset-0 z-40 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed z-50 flex flex-col rounded-lg shadow-2xl bg-surface border border-bd top-[5vh] left-1/2 -translate-x-1/2 w-[min(1100px,95vw)] h-[88vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-dim shrink-0">
                    <div className="flex items-center gap-8">
                        <span className="text-sm font-semibold uppercase tracking-widest text-accent-fg">
                            Promptinator
                        </span>

                        {/* idk where to put this  */}
                        {copied && (
                            <span className="text-xs px-2 py-1 rounded bg-accent2-dim text-accent2-fg">
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
                                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors mx-1 rounded ${
                                        mode === m.id
                                            ? "bg-accent text-gen-fg"
                                            : "bg-raised text-tx-muted hover:text-tx-dim"
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="text-xl transition-colors px-2 text-tx-muted hover:text-tx"
                        >
                            x
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden p-5">
                    {mode === "generation" && <GenerationMode onCopy={handleCopy} onApply={onApply} />}
                    {mode === "inpainting" && <InpaintingMode onCopy={handleCopy} onApply={onApply} />}
                </div>

            </div>
        </>
    );
}
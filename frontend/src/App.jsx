import { useState, useEffect } from "react";
import { useGeneration } from "./hooks/useGeneration";
import ParameterControl from "./components/controls/ParameterControl";
import InpaintParameters from "./components/controls/InpaintParameters";
import CompositeCanvas from "./components/canvas/CompositeCanvas";
import VersionControl from "./components/history/VersionControl";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GeneratingOverlay from "./components/GeneratingOverlay";
import GuidePage from "./pages/GuidePage";
import PromptBuilder from "./components/promptbuilder/PromptBuilder";

export default function App() {
    const {
        isLoading, error,
        activeVersion, versions,
        parameters,
        setParameters, handleGenerate, handleInpaint, // much cleaner
        rollback, clear,
    } = useGeneration();

    const [page, setPage] = useState(null);
    const [inpaintParams, setInpaintParams] = useState({
        denoising_strength: 0.75,
        mask_blur: 4,
    });
    const [promptBuilderOpen, setPromptBuilderOpen] = useState(false);

    // Local error state allows user to dismiss the prompt modal
    const [localError, setLocalError] = useState(null);
    useEffect(() => {
        if (error) setLocalError(error);
    }, [error]);

    // Elapsed timer
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => { clearInterval(interval); setElapsed(0); };
    }, [isLoading]);

    function onInpaint(imageData, maskData) {
        handleInpaint(imageData, maskData, inpaintParams);
    }

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--bg)" }}
        >
            <Header onNavigate={setPage} currentPage={page} />

            {/* Page routing */}
            {page === "guide" && <GuidePage />}

            {/* Main workspace */}
            {page === null && (
                <div className="flex flex-1 overflow-hidden p-4 gap-4">

                    {/* Left sdierbar */}
                    <aside
                        className="w-96 shrink-0 flex flex-col overflow-y-auto overflow-x-hidden border rounded-xl shadow-sm"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <div className="flex-1 p-4">
                            <ParameterControl value={parameters} onChange={setParameters} disabled={isLoading} />
                        </div>

                        {/* Generate Button */}
                        <div
                            className="p-4 border-t shrink-0 flex flex-col gap-2"
                            style={{ borderColor: "var(--border-dim)" }}
                        >
                            <button
                                onClick={() => setPromptBuilderOpen(true)}
                                className="w-full py-2 rounded text-xs uppercase tracking-wider transition-colors"
                                style={{
                                    border: "1px solid var(--accent)",
                                    color: "var(--accent-text)",
                                    backgroundColor: "var(--accent-dim)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--accent)";
                                    e.currentTarget.style.color = "var(--generate-text)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--accent-dim)";
                                    e.currentTarget.style.color = "var(--accent-text)";
                                }}
                            >
                                promptinator
                            </button>

                            <button
                                onClick={() => { setLocalError(null); handleGenerate(); }}
                                disabled={isLoading}
                                className="w-full py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-generate"
                            >
                                {isLoading ? `generating... ${elapsed}s` : "generate"}
                            </button>
                        </div>
                    </aside>

                    {/* Center (canvas)*/}
                    <main
                        className="flex-1 flex items-start justify-center gap-4 py-2 overflow-auto"
                        style={{ backgroundColor: "var(--bg)" }}
                    >
                        {/* Canvas column para mawala yung matabang scrollbar sa baba*/}
                        <div className="flex flex-col gap-3 shrink-0">
                            {/* Metadata Chips */}
                            {activeVersion && (
                                <div
                                    className="flex gap-4 pb-3"
                                    style={{ borderBottom: "1px solid var(--border-dim)" }}
                                >
                                    {activeVersion.generationTime && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded border-2" style={{ borderColor: "green" }}>
                                            <span className="text-[12px] uppercase font-bold tracking-wider" style={{ color: "green" }}>Time</span>
                                            <span className="text-[12px] font-bold tracking-wider" style={{ color: "green" }}>{activeVersion.generationTime.toFixed(2)}s</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Seed</span>
                                        <span className="text-xs font-mono" style={{ color: "var(--accent2-text)" }}>{activeVersion.parameters.seed}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Steps</span>
                                        <span className="text-xs font-mono" style={{ color: "var(--accent2-text)" }}>{activeVersion.parameters.steps}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>CFG</span>
                                        <span className="text-xs font-mono" style={{ color: "var(--accent2-text)" }}>{activeVersion.parameters.cfg_scale}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Res</span>
                                        <span className="text-xs font-mono" style={{ color: "var(--accent2-text)" }}>{activeVersion.parameters.width}×{activeVersion.parameters.height}</span>
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <GeneratingOverlay visible={isLoading} elapsed={elapsed} />
                                <CompositeCanvas
                                    key={activeVersion?.versionId}
                                    imageData={activeVersion?.imageData}
                                    onInpaint={onInpaint}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/*History column - scroll bar pmo*/}
                        <div
                            className={`w-48 shrink-0 flex flex-col rounded border overflow-hidden transition-opacity ${isLoading ? "opacity-40 pointer-events-none" : ""}`}
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-dim)",
                                maxHeight: "600px",
                            }}
                        >
                            <div
                                className="px-3 py-2 text-xs uppercase tracking-widest border-b shrink-0"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text-muted)" }}
                            >
                                History
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                <VersionControl
                                    versions={versions}
                                    activeVersion={activeVersion}
                                    onRollback={rollback}
                                    onClear={clear}
                                />
                            </div>
                        </div>
                    </main>

                    {/* inpaint params*/}
                    <aside
                        className="w-56 shrink-0 flex flex-col border rounded-xl shadow-sm overflow-y-auto p-4"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center mt-1">
                                <span className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--text-dim)" }}>
                                    Inpaint Options
                                </span>
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-dim)" }}>
                                    How to inpaint
                                </span>
                                <div className="tooltip-wrap relative">
                                    <span
                                        className="flex items-center justify-center text-[9px] font-bold w-[16px] h-[16px] rounded-full border cursor-help transition-colors"
                                        style={{
                                            color: "var(--text-muted)",
                                            borderColor: "var(--border)",
                                        }}
                                        onMouseEnter={(e) => { e.target.style.color = "var(--text)"; e.target.style.borderColor = "var(--text-dim)"; }}
                                        onMouseLeave={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.borderColor = "var(--border)"; }}
                                    >
                                        ?
                                    </span>
                                    <span
                                        className="tooltip-box"
                                        style={{
                                            maxWidth: "180px",
                                            whiteSpace: "normal",
                                            textAlign: "left",
                                            right: 0,
                                            left: "auto",
                                            zIndex: 50
                                        }}
                                    >
                                        Paint a mask over the area to change, then click Inpaint Selection on the canvas.
                                    </span>
                                </div>
                            </div>

                            <InpaintParameters onChange={setInpaintParams} disabled={isLoading} />
                        </div>
                    </aside>

                </div>
            )}

            <Footer />

            {/* Error Modal */}
            {localError && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px]" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
                    <div className="p-5 rounded-xl shadow-lg border flex flex-col gap-3 max-w-sm w-full mx-4" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2" style={{ color: "#ef4444" }}>
                            <span className="font-bold text-lg">⚠</span>
                            <span className="font-semibold text-sm">Generation Error</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{localError}</p>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => setLocalError(null)}
                                className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                                style={{ backgroundColor: "var(--bg-raised)", color: "var(--text)" }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "var(--border)"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "var(--bg-raised)"}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Builder modal */}
            <PromptBuilder
                isOpen={promptBuilderOpen}
                onClose={() => setPromptBuilderOpen(false)}
                onApply={(prompt, negativePrompt) => {
                    setParameters((prev) => {
                        const base = prev || { width: 1024, height: 1024, sampler: "DPM++ 2M Karras", steps: 20, cfg_scale: 7, seed: -1 };
                        return { ...base, prompt, negative_prompt: negativePrompt || "" };
                    });
                    setPromptBuilderOpen(false);
                }}
            />
        </div>
    );
}
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
        <div className="h-screen flex flex-col overflow-hidden bg-bg">
            <Header onNavigate={setPage} currentPage={page} />

            {/* Page routing */}
            {page === "guide" && <GuidePage />}

            {/* Main workspace */}
            {page === null && (
                <div className="flex flex-1 overflow-hidden p-4 gap-4">

                    {/* Left sdierbar */}
                    <aside className="w-96 shrink-0 flex flex-col overflow-y-auto overflow-x-hidden border border-dim bg-surface rounded-xl shadow-sm">
                        <div className="flex-1 p-4">
                            <ParameterControl value={parameters} onChange={setParameters} disabled={isLoading} />
                        </div>

                        {/* Generate Button */}
                        <div className="p-4 border-t border-dim shrink-0 flex flex-col gap-2">
                            <button
                                onClick={() => setPromptBuilderOpen(true)}
                                className="w-full py-2 rounded text-xs uppercase tracking-wider btn-prompt"
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
                    <main className="flex-1 flex items-start justify-center gap-4 py-2 overflow-auto bg-bg">
                        {/* Canvas column para mawala yung matabang scrollbar sa baba*/}
                        <div className="flex flex-col gap-3 shrink-0">
                            {/* Metadata Chips */}
                            {activeVersion && (
                                <div className="flex gap-4 pb-3 border-b border-dim">
                                    {activeVersion.generationTime && (
                                        <div className="metadata-chip-time flex items-center gap-1.5 px-2 py-1 rounded">
                                            <span className="text-[12px] uppercase font-bold tracking-wider">Time</span>
                                            <span className="text-[12px] font-bold tracking-wider">{activeVersion.generationTime.toFixed(2)}s</span>
                                        </div>
                                    )}

                                    <div className="metadata-chip flex items-center gap-1.5 px-2 py-0.5 rounded">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-tx-muted">Seed</span>
                                        <span className="text-xs font-mono text-accent2-fg">{activeVersion.parameters.seed}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1.5 px-2 py-0.5 rounded">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-tx-muted">Steps</span>
                                        <span className="text-xs font-mono text-accent2-fg">{activeVersion.parameters.steps}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1.5 px-2 py-0.5 rounded">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-tx-muted">CFG</span>
                                        <span className="text-xs font-mono text-accent2-fg">{activeVersion.parameters.cfg_scale}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1.5 px-2 py-0.5 rounded">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-tx-muted">Res</span>
                                        <span className="text-xs font-mono text-accent2-fg">{activeVersion.parameters.width}×{activeVersion.parameters.height}</span>
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
                        <div className={`w-48 shrink-0 flex flex-col rounded border border-dim bg-surface overflow-hidden transition-opacity max-h-[600px] ${isLoading ? "opacity-40 pointer-events-none" : ""}`}>
                            <div className="px-3 py-2 text-xs uppercase tracking-widest border-b border-dim text-tx-muted shrink-0">
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
                    <aside className="w-56 shrink-0 flex flex-col border border-dim bg-surface rounded-xl shadow-sm overflow-y-auto p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center mt-1">
                                <span className="text-sm uppercase tracking-[0.2em] font-semibold text-tx-dim">
                                    Inpaint Options
                                </span>
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs uppercase tracking-wider font-medium text-tx-dim">
                                    How to inpaint
                                </span>
                                <div className="tooltip-wrap relative">
                                    <span className="flex items-center justify-center text-[9px] font-bold w-[16px] h-[16px] rounded-full border cursor-help tooltip-help-btn">
                                        ?
                                    </span>
                                    <span className="tooltip-box">
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
                <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px] bg-[var(--overlay-bg)]">
                    <div className="p-5 rounded-xl shadow-lg border border-bd bg-surface flex flex-col gap-3 max-w-sm w-full mx-4">
                        <div className="flex items-center gap-2 text-danger">
                            <span className="font-bold text-lg">⚠</span>
                            <span className="font-semibold text-sm">Generation Error</span>
                        </div>
                        <p className="text-sm leading-relaxed text-tx-dim">{localError}</p>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => setLocalError(null)}
                                className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors bg-raised text-tx hover:bg-bd"
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
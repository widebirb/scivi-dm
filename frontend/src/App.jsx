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
import AboutPage from "./pages/AboutPage";

export default function App() {
    const {
        isLoading, error,
        activeVersion, versions,
        setParameters, handleGenerate, handleInpaint, // much cleaner
        rollback, clear,
    } = useGeneration();

    const [page, setPage] = useState(null);
    const [inpaintParams, setInpaintParams] = useState({
        denoising_strength: 0.75,
        mask_blur: 4,
    });

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
            style={{ fontFamily: "var(--font-mono)", backgroundColor: "var(--bg)" }}
        >
            <Header onNavigate={setPage} currentPage={page} />

            {/* Page routing */}
            {page === "guide" && <GuidePage />}
            {page === "about" && <AboutPage />}


            {/* Main workspace */}
            {page === null && (
                <div className="flex flex-1 overflow-hidden">

                    {/*Left sdierbar*/}
                    <aside
                        className="w-80 shrink-0 flex flex-col overflow-y-auto overflow-x-hidden border-r"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <div className="flex-1 p-4">
                            <ParameterControl onChange={setParameters} disabled={isLoading} />
                        </div>

                        {/*Generate Button*/}
                        <div
                            className="p-4 border-t shrink-0 flex flex-col gap-2"
                            style={{ borderColor: "var(--border-dim)" }}
                        >
                            {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full py-2.5 rounded text-sm font-semibold uppercase tracking-wider btn-generate"
                            >
                                {isLoading ? `generating... ${elapsed}s` : "generate"}
                            </button>
                        </div>
                    </aside>

                    {/* Center (canvas)*/}
                    <main
                        className="flex-1 flex items-start justify-center gap-4 p-6 overflow-auto py-2"
                        style={{ backgroundColor: "var(--bg)" }}
                    >
                        {/* Canvas column para mawala yung matabang scrollbar sa baba*/}
                        <div className="flex flex-col gap-3 shrink-0">
                            {/* Metadata */}
                            {activeVersion && (
                                <div
                                    className="flex gap-4 text-xs pb-2"
                                    style={{ borderBottom: "1px solid var(--border-dim)", color: "var(--text-muted)" }}
                                >
                                    <span>seed <span style={{ color: "var(--accent-text)" }}>{activeVersion.parameters.seed}</span></span>
                                    <span>steps {activeVersion.parameters.steps}</span>
                                    <span>cfg {activeVersion.parameters.cfg_scale}</span>
                                    <span>{activeVersion.parameters.width}×{activeVersion.parameters.height}</span>
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
                            className="w-48 shrink-0 flex flex-col rounded border overflow-hidden"
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

                    {/* Right — inpaint params now*/}
                    <aside
                        className="w-56 shrink-0 flex flex-col border-l overflow-y-auto p-4"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <div className="flex flex-col gap-4">
                            <div>
                                <p
                                    className="text-xs uppercase tracking-[0.15em] mb-3 pb-2"
                                    style={{ borderBottom: "1px solid var(--border-dim)", color: "var(--text-muted)" }}
                                >
                                    Inpaint Options
                                </p>
                                <InpaintParameters onChange={setInpaintParams} disabled={isLoading} />
                            </div>

                            <div
                                className="text-xs p-3 rounded"
                                style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-muted)" }}
                            >
                                <p className="mb-1" style={{ color: "var(--text-dim)" }}>How to inpaint</p>
                                <p>Paint a mask over the area to change, then click Inpaint Selection on the canvas.</p>
                            </div>
                        </div>
                    </aside>

                </div>
            )}

            <Footer />
        </div>
    );
}
import { useState, useEffect } from "react";
import { useGeneration } from "./hooks/useGeneration";
import ParameterControl from "./components/controls/ParameterControl";
import CompositeCanvas from "./components/canvas/CompositeCanvas";
import VersionControl from "./components/history/VersionControl";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GeneratingOverlay from "./components/GeneratingOverlay";

export default function App() {
    const {
        isLoading,
        error,
        activeVersion,
        versions,
        setParameters,
        handleGenerate,
        handleInpaint,
        rollback,
        clear,
    } = useGeneration();

    const [page, setPage] = useState(null); // null = workspace, "guide", "about"

    // Elapsed timer
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => { clearInterval(interval); setElapsed(0); };
    }, [isLoading]);

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{ fontFamily: "var(--font-mono)", backgroundColor: "var(--bg)" }}
        >
            <Header onNavigate={setPage} currentPage={page} />

            {/*Page routing*/}
            {page === "guide" && <GuidePage />}
            {page === "about" && <AboutPage />}

            {/*Main workspace*/}
            {page === null && (
                <div className="flex flex-1 overflow-hidden">

                    {/*Left sidebar*/}
                    <aside
                        className="w-64 shrink-0 flex flex-col overflow-y-auto border-r"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <div className="flex-1 p-4">
                            <ParameterControl onChange={setParameters} disabled={isLoading} />
                        </div>

                        {/* Generate button */}
                        <div
                            className="p-4 border-t flex flex-col gap-2 shrink-0"
                            style={{ borderColor: "var(--border-dim)" }}
                        >
                            {error && (
                                <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
                            )}
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
                        className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto gap-3"
                        style={{ backgroundColor: "var(--bg)" }}
                    >
                        {/* Metadata */}
                        {activeVersion && (
                            <div
                                className="w-full max-w-xl flex gap-4 text-xs pb-3"
                                style={{
                                    borderBottom: "1px solid var(--border-dim)",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <span>seed <span style={{ color: "var(--accent-text)" }}>{activeVersion.parameters.seed}</span></span>
                                <span>steps {activeVersion.parameters.steps}</span>
                                <span>cfg {activeVersion.parameters.cfg_scale}</span>
                                <span className="truncate">{activeVersion.parameters.sampler}</span>
                                <span className="ml-auto">{activeVersion.parameters.width}×{activeVersion.parameters.height}</span>
                            </div>
                        )}

                        <div className="relative">
                            <GeneratingOverlay visible={isLoading} elapsed={elapsed} />
                            <CompositeCanvas
                                key={activeVersion?.versionId}
                                imageData={activeVersion?.imageData}
                                onInpaint={handleInpaint}
                                disabled={isLoading}
                            />
                        </div>
                    </main>

                    {/* Right sidebar (history)*/}
                    <aside
                        className="w-52 shrink-0 flex flex-col overflow-hidden border-l p-3"
                        style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                    >
                        <VersionControl
                            versions={versions}
                            activeVersion={activeVersion}
                            onRollback={rollback}
                            onClear={clear}
                        />
                    </aside>
                </div>
            )}

            <Footer />
        </div>
    );
}
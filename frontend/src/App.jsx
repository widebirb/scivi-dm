import { useState, useEffect } from "react";
import { useGeneration } from "./hooks/useGeneration";
import ParameterControl from "./components/controls/ParameterControl";
import InpaintParameters from "./components/controls/InpaintParameters";
import CompositeCanvas from "./components/canvas/CompositeCanvas";
import VersionControl from "./components/history/VersionControl";
import GeneratingOverlay from "./components/StatusBar";
import StatusBar from "./components/StatusBar";

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

    const [inpaintParams, setInpaintParams] = useState({
        denoising_strength: 0.75,
        mask_blur: 4,
    });

    const [tab, setTab] = useState("generate");

    // counts up while isLoading is true
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
            className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >

            {/*Left panel*/}
            <aside className="w-74 shrink-0 flex flex-col border-r border-zinc-800 overflow-y-auto">

                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-semibold tracking-widest uppercase text-zinc-100">scivi-dm</h1>
                        <p className="text-zinc-600 text-xs mt-0.5">facial composite generation</p>
                    </div>
                    <StatusBar />
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-zinc-800">
                    {["generate", "inpaint"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${tab === t
                                ? "text-zinc-100 border-b border-zinc-100 -mb-px"
                                : "text-zinc-600 hover:text-zinc-400"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Panel content */}
                <div className="flex flex-col gap-4 p-4 flex-1">
                    <ParameterControl onChange={setParameters} disabled={isLoading} />
                    {tab === "inpaint" && (
                        <InpaintParameters onChange={setInpaintParams} disabled={isLoading} />
                    )}
                </div>

                {/* Generate button pinned to bottom */}
                <div className="p-4 border-t border-zinc-800 flex flex-col gap-2">
                    {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
                    {tab === "generate" && (
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded font-mono text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? `generating... ${elapsed}s` : "generate"}
                        </button>
                    )}
                    {tab === "inpaint" && (
                        <p className="text-zinc-600 text-xs font-mono text-center">
                            draw on canvas then click inpaint selection
                        </p>
                    )}
                </div>
            </aside>

            {/*Center (canvas)*/}
            <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4 overflow-hidden">

                {activeVersion && (
                    <div className="w-full max-w-xl flex gap-4 font-mono text-xs text-zinc-500 border-b border-zinc-800 pb-3">
                        <span><span className="text-zinc-600">seed</span> {activeVersion.parameters.seed}</span>
                        <span><span className="text-zinc-600">steps</span> {activeVersion.parameters.steps}</span>
                        <span><span className="text-zinc-600">cfg</span> {activeVersion.parameters.cfg_scale}</span>
                        <span><span className="text-zinc-600">sampler</span> {activeVersion.parameters.sampler}</span>
                        <span className="ml-auto">{activeVersion.parameters.width}×{activeVersion.parameters.height}</span>
                    </div>
                )}

                {/* Canvas wrapped in relative container for overlay positioning */}
                <div className="relative">
                    <GeneratingOverlay visible={isLoading} elapsed={elapsed} />
                    <CompositeCanvas
                        key={activeVersion?.versionId}
                        imageData={activeVersion?.imageData}
                        onInpaint={onInpaint}
                        disabled={isLoading}
                    />
                </div>
            </main>

            {/*Right panel (history)*/}
            <aside className="w-56 shrink-0 border-l border-zinc-800 flex flex-col overflow-y-auto p-4">
                <VersionControl
                    versions={versions}
                    activeVersion={activeVersion}
                    onRollback={rollback}
                    onClear={clear}
                />
            </aside>

        </div>
    );
}
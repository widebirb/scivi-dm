import { useGeneration } from "./hooks/useGeneration";
import ParameterControl from "./components/controls/ParameterControl";
import CompositeCanvas from "./components/canvas/CompositeCanvas";

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
    } = useGeneration();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex gap-6 p-6">

            {/* Left — parameters */}
            <div className="flex flex-col gap-4">
                <ParameterControl onChange={setParameters} disabled={isLoading} />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-2 bg-zinc-100 text-zinc-900 rounded font-mono text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading ? "generating..." : "generate"}
                </button>
                {error && (
                    <p className="text-red-400 text-xs font-mono">{error}</p>
                )}
            </div>

            {/* Center — canvas */}
            <div className="flex-1 flex flex-col gap-3">
                <CompositeCanvas
                    key={activeVersion?.versionId}
                    imageData={activeVersion?.imageData}
                    onInpaint={handleInpaint}
                    disabled={isLoading}
                />

                {/* Active version metadata */}
                {activeVersion && (
                    <div className="bg-zinc-900 border border-zinc-700 rounded p-3 font-mono text-xs text-zinc-400 space-y-1">
                        <p><span className="text-zinc-500">seed</span> {activeVersion.parameters.seed}</p>
                        <p><span className="text-zinc-500">steps</span> {activeVersion.parameters.steps} · <span className="text-zinc-500">cfg</span> {activeVersion.parameters.cfg_scale}</p>
                        <p><span className="text-zinc-500">sampler</span> {activeVersion.parameters.sampler}</p>
                        <p className="text-zinc-500">{new Date(activeVersion.timestamp).toLocaleTimeString()}</p>
                    </div>
                )}
            </div>

            {/* Right — version history */}
            <div className="w-48 flex flex-col gap-2">
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">History</span>
                {versions.length === 0 && (
                    <p className="text-zinc-700 text-xs font-mono">empty</p>
                )}
                {[...versions].reverse().map((v) => (
                    <button
                        key={v.versionId}
                        onClick={() => rollback(v.versionId)}
                        className={`text-left p-2 rounded border text-xs font-mono transition-colors ${activeVersion?.versionId === v.versionId
                            ? "border-zinc-400 bg-zinc-800 text-zinc-100"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                            }`}
                    >
                        <p className="truncate">{v.label}</p>
                        <p className="text-zinc-600">{new Date(v.timestamp).toLocaleTimeString()}</p>
                    </button>
                ))}
            </div>

        </div>
    );
}
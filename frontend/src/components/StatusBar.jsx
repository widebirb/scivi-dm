import { useHealth } from "../hooks/useHealth";

const STATUS_STYLES = {
    loading: "bg-zinc-600",
    up: "bg-emerald-500",
    down: "bg-red-500",
};

export default function StatusBar() {
    const { status, mode, modelsLoaded } = useHealth();

    return (
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">

            {/* Status dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[status]}`} />

            {/* Label */}
            {status === "loading" && <span>connecting...</span>}
            {status === "down" && <span className="text-red-400">backend offline</span>}
            {status === "up" && (
                <span>
                    {mode === "fake" ? "fake inference" : "model ready"}
                    {mode === "real" && !modelsLoaded && (
                        <span className="text-yellow-500 ml-1">· loading models</span>
                    )}
                </span>
            )}
        </div>
    );
}
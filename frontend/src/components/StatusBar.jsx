import { useHealth } from "../hooks/useHealth";

const STATUS_STYLES = {
    loading: "bg-tx-muted",
    up: "bg-status-up",
    down: "bg-danger",
};

export default function StatusBar() {
    const { status, mode, modelsLoaded } = useHealth();

    return (
        <div className="flex items-center gap-2 font-mono text-xs text-tx-muted">

            {/* Status dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[status]}`} />

            {/* Label */}
            {status === "loading" && <span>connecting...</span>}
            {status === "down" && <span className="text-danger">backend offline</span>}
            {status === "up" && (
                <span>
                    {mode === "fake" ? "fake inference" : "model ready"}
                    {mode === "real" && !modelsLoaded && (
                        <span className="text-warning ml-1">· loading models</span>
                    )}
                </span>
            )}
        </div>
    );
}
import { useState, useEffect } from "react";
import { checkHealth } from "../api/client";

export function useHealth() {
    const [status, setStatus] = useState("loading");
    const [mode, setMode] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function ping() {
            try {
                const data = await checkHealth();
                if (!cancelled) {
                    setStatus("up");
                    setMode(data.mode);
                    setModelsLoaded(data.models_loaded);
                }
            } catch {
                if (!cancelled) setStatus("down");
            }
        }

        ping();
        const interval = setInterval(ping, 10_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    return { status, mode, modelsLoaded };
}
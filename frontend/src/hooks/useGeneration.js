import { useState, useCallback } from "react";
import { generate } from "../api/client";
import { useVersions } from "./useVersions";

export function useGeneration() {
    const [parameters, setParameters] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { versions, activeVersion, save, rollback, clear } = useVersions();

    const handleGenerate = useCallback(async () => {
        if (!parameters?.prompt?.trim()) {
            setError("Prompt is required.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await generate(parameters);
            save(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [parameters, save]);

    return {
        // state
        parameters,
        isLoading,
        error,

        // current image + history (from useVersions)
        activeVersion,
        versions,

        // actions
        setParameters,
        handleGenerate,
        rollback,
        clear,
    };
}
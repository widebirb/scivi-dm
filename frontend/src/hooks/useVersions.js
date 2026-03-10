import { useState, useEffect, useCallback } from "react";
import {
    subscribe,
    saveVersion,
    getVersions,
    getVersion,
    clearHistory,
} from "../store/versionStore";

export function useVersions() {
    const [versions, setVersions] = useState(getVersions());
    const [activeVersionId, setActiveVersionId] = useState(null);

    // any save from anywhere re-renders this hook
    useEffect(() => {
        const unsub = subscribe(setVersions);
        return unsub;
    }, []);

    const save = useCallback((generationResponse) => {
        const { version_id, image_data, used_parameters } = generationResponse;

        // parentId is the current active version 
        const saved = saveVersion({
            versionId: version_id,
            imageData: image_data,
            parameters: used_parameters,
            parentId: activeVersionId,
        });

        setActiveVersionId(saved.versionId);
        return saved;
    }, [activeVersionId]);

    const rollback = useCallback((versionId) => {
        const version = getVersion(versionId);
        if (!version) return null;
        setActiveVersionId(versionId);
        return version;
    }, []);

    const clear = useCallback(() => {
        clearHistory();
        setActiveVersionId(null);
    }, []);

    const activeVersion = activeVersionId
        ? getVersion(activeVersionId)
        : versions[versions.length - 1] || null;

    return {
        versions,
        activeVersion,
        save,
        rollback,
        clear,
    };
}
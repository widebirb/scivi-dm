let versions = [];
let listeners = [];

function notify() {
    listeners.forEach((fn) => fn([...versions]));
}

export function subscribe(fn) {
    listeners.push(fn);
    return () => {
        listeners = listeners.filter((l) => l !== fn);
    };
}

export function saveVersion({ versionId, imageData, parameters, parentId = null, generationTime = null }) {
    const version = {
        versionId,
        timestamp: new Date().toISOString(),
        imageData,
        parameters,
        parentId,
        generationTime,
        label: `v${versions.length + 1} — ${parameters.prompt.slice(0, 30) || "no prompt"}`,
    };
    versions = [...versions, version];
    notify();
    return version;
}

export function getVersions() {
    return [...versions];
}

export function getVersion(versionId) {
    return versions.find((v) => v.versionId === versionId) || null;
}

export function clearHistory() {
    versions = [];
    notify();
}
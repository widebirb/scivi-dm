import { useState } from "react";

export default function VersionControl({ versions, activeVersion, onRollback, onClear }) {
    const [expandedId, setExpandedId] = useState(null);

    function toggleExpand(versionId) {
        setExpandedId((prev) => (prev === versionId ? null : versionId));
    }

    if (versions.length === 0) {
        return (
            <div className="flex flex-col gap-2">
                <Header onClear={onClear} hasVersions={false} />
                <p className="text-zinc-700 font-mono text-xs">no history yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Header onClear={onClear} hasVersions={versions.length > 0} />

            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[70vh] pr-1">
                {[...versions].reverse().map((v) => {
                    const isActive = activeVersion?.versionId === v.versionId;
                    const isExpanded = expandedId === v.versionId;

                    return (
                        <div
                            key={v.versionId}
                            className={`rounded border transition-colors ${isActive
                                ? "border-zinc-400 bg-zinc-800"
                                : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                                }`}
                        >
                            {/* Main row */}
                            <div className="flex gap-2 p-2">
                                {/* Thumbnail */}
                                <button
                                    onClick={() => onRollback?.(v.versionId)}
                                    className="shrink-0"
                                    title="load this version"
                                >
                                    <img
                                        src={v.imageData}
                                        alt={v.label}
                                        className="w-12 h-12 object-cover rounded border border-zinc-700"
                                    />
                                </button>

                                {/* Info */}
                                <button
                                    onClick={() => onRollback?.(v.versionId)}
                                    className="flex-1 text-left min-w-0"
                                >
                                    <p className={`text-xs font-mono truncate ${isActive ? "text-zinc-100" : "text-zinc-300"}`}>
                                        {v.label}
                                    </p>
                                    <p className="text-zinc-600 text-xs font-mono">
                                        {new Date(v.timestamp).toLocaleTimeString()}
                                    </p>
                                    <p className="text-zinc-600 text-xs font-mono">
                                        seed {v.parameters.seed}
                                    </p>
                                </button>

                                {/* Expand toggle */}
                                <button
                                    onClick={() => toggleExpand(v.versionId)}
                                    className="text-zinc-600 hover:text-zinc-400 text-xs font-mono self-start pt-0.5 transition-colors"
                                    title="show parameters"
                                >
                                    {isExpanded ? "▲" : "▼"}
                                </button>
                            </div>

                            {/* Expanded parameters */}
                            {isExpanded && (
                                <div className="px-2 pb-2 border-t border-zinc-700 pt-2 font-mono text-xs text-zinc-500 space-y-0.5">
                                    <p><span className="text-zinc-600">prompt</span> {v.parameters.prompt || "—"}</p>
                                    {v.parameters.negative_prompt && (
                                        <p><span className="text-zinc-600">neg</span> {v.parameters.negative_prompt}</p>
                                    )}
                                    <p>
                                        <span className="text-zinc-600">res</span> {v.parameters.width}×{v.parameters.height}
                                        {" · "}
                                        <span className="text-zinc-600">steps</span> {v.parameters.steps}
                                        {" · "}
                                        <span className="text-zinc-600">cfg</span> {v.parameters.cfg_scale}
                                    </p>
                                    <p><span className="text-zinc-600">sampler</span> {v.parameters.sampler}</p>
                                    {v.parentId && (
                                        <p className="text-zinc-700">branched from previous</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Header({ onClear, hasVersions }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">History</span>
            {hasVersions && (
                <button
                    onClick={onClear}
                    className="text-xs font-mono text-zinc-600 hover:text-red-400 transition-colors"
                >
                    clear all
                </button>
            )}
        </div>
    );
}
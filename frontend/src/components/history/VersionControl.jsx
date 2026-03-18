import { useState } from "react";

export default function VersionControl({ versions, activeVersion, onRollback, onClear }) {
    const [expandedId, setExpandedId] = useState(null);

    function toggleExpand(id) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    return (
        <div className="flex flex-col gap-2 h-full">

            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <span className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                    History
                </span>
                {versions.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => e.target.style.color = "#f87171"}
                        onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                    >
                        clear
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px shrink-0" style={{ backgroundColor: "var(--border-dim)" }} />

            {/* List */}
            {versions.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>no history yet</p>
            ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-0.5">
                    {[...versions].reverse().map((v) => {
                        const isActive = activeVersion?.versionId === v.versionId;
                        const isExpanded = expandedId === v.versionId;

                        return (
                            <div
                                key={v.versionId}
                                className="rounded transition-colors"
                                style={{
                                    border: `1px solid ${isActive ? "var(--accent)" : "var(--border-dim)"}`,
                                    backgroundColor: isActive ? "var(--accent-dim)" : "var(--bg-surface)",
                                }}
                            >
                                {/* Main row */}
                                <div className="flex gap-2 p-2">
                                    <button onClick={() => onRollback?.(v.versionId)} className="shrink-0">
                                        <img
                                            src={v.imageData}
                                            alt={v.label}
                                            className="w-10 h-10 object-cover rounded composite-image"
                                            style={{ border: "1px solid var(--border-dim)" }}
                                        />
                                    </button>

                                    <button
                                        onClick={() => onRollback?.(v.versionId)}
                                        className="flex-1 text-left min-w-0"
                                    >
                                        <p
                                            className="text-xs truncate"
                                            style={{ color: isActive ? "var(--accent-text)" : "var(--text-dim)" }}
                                        >
                                            {v.label}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {new Date(v.timestamp).toLocaleTimeString()}
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => toggleExpand(v.versionId)}
                                        className="text-xs self-start pt-0.5 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                        onMouseEnter={(e) => e.target.style.color = "var(--text-dim)"}
                                        onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                                    >
                                        {isExpanded ? "▲" : "▼"}
                                    </button>
                                </div>

                                {/* Expanded params */}
                                {isExpanded && (
                                    <div
                                        className="px-2 pb-2 pt-2 text-xs space-y-0.5 border-t"
                                        style={{ borderColor: "var(--border-dim)", color: "var(--text-muted)" }}
                                    >
                                        <p><span style={{ color: "var(--text-muted)" }}>prompt </span>
                                            <span style={{ color: "var(--text-dim)" }}>{v.parameters.prompt || "—"}</span>
                                        </p>
                                        <p>
                                            <span style={{ color: "var(--text-muted)" }}>seed </span>
                                            <span style={{ color: "var(--accent-text)" }}>{v.parameters.seed}</span>
                                        </p>
                                        <p>
                                            {v.parameters.width}×{v.parameters.height}
                                            {" · "}steps {v.parameters.steps}
                                            {" · "}cfg {v.parameters.cfg_scale}
                                        </p>
                                        <p style={{ color: "var(--text-muted)" }}>{v.parameters.sampler}</p>
                                        {v.parentId && (
                                            <p style={{ color: "var(--text-muted)" }}>↳ branched</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
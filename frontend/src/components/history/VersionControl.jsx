import { useState } from "react";

export default function VersionControl({ versions, activeVersion, onRollback, onClear }) {
    const [expandedId, setExpandedId] = useState(null);

    if (versions.length === 0) {
        return <p className="text-xs" style={{ color: "var(--text-muted)" }}>no history yet</p>;
    }

    return (
        <div className="flex flex-col gap-1.5">
            {versions.length > 0 && (
                <button
                    onClick={onClear}
                    className="text-xs text-right mb-1 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                >
                    clear all
                </button>
            )}

            {[...versions].reverse().map((v) => {
                const isActive = activeVersion?.versionId === v.versionId;
                const isExpanded = expandedId === v.versionId;

                return (
                    <div
                        key={v.versionId}
                        className="rounded transition-colors"
                        style={{
                            border: `1px solid ${isActive ? "var(--accent)" : "var(--border-dim)"}`,
                            backgroundColor: isActive ? "var(--accent-dim)" : "var(--bg)",
                        }}
                    >
                        <div className="flex gap-2 p-1.5">
                            <button onClick={() => onRollback?.(v.versionId)} className="shrink-0">
                                <img
                                    src={v.imageData}
                                    alt={v.label}
                                    className="w-10 h-10 object-cover rounded composite-image"
                                    style={{ border: "1px solid var(--border-dim)" }}
                                />
                            </button>

                            <button onClick={() => onRollback?.(v.versionId)} className="flex-1 text-left min-w-0">
                                <p className="text-xs truncate" style={{ color: isActive ? "var(--accent-text)" : "var(--text-dim)" }}>
                                    {v.label}
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {new Date(v.timestamp).toLocaleTimeString()}
                                </p>
                            </button>

                            <button
                                onClick={() => setExpandedId((p) => p === v.versionId ? null : v.versionId)}
                                className="text-xs self-start pt-0.5 transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => e.target.style.color = "var(--text-dim)"}
                                onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                            >
                                {isExpanded ? "▲" : "▼"}
                            </button>
                        </div>

                        {isExpanded && (
                            <div
                                className="px-2 pb-2 pt-1.5 text-xs space-y-0.5 border-t"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text-muted)" }}
                            >
                                <p style={{ color: "var(--text-dim)" }}>{v.parameters.prompt || "—"}</p>
                                <p>seed <span style={{ color: "var(--accent-text)" }}>{v.parameters.seed}</span></p>
                                <p>{v.parameters.width}×{v.parameters.height} · {v.parameters.steps}st · cfg{v.parameters.cfg_scale}</p>
                                {v.parentId && <p>↳ branched</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
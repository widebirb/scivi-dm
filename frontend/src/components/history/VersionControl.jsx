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
                                className="px-2 pb-2 pt-2 space-y-1.5 border-t"
                                style={{ borderColor: "var(--border-dim)" }}
                            >
                                <p style={{ color: "var(--text-dim)" }} className="text-xs leading-relaxed">{v.parameters.prompt || "—"}</p>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Seed</span>
                                        <span className="text-[10px] font-mono" style={{ color: "var(--accent-text)" }}>{v.parameters.seed}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Steps</span>
                                        <span className="text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>{v.parameters.steps}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>CFG</span>
                                        <span className="text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>{v.parameters.cfg_scale}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-dim)" }}>
                                        <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Res</span>
                                        <span className="text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>{v.parameters.width}×{v.parameters.height}</span>
                                    </div>
                                </div>
                                {v.parentId && <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>↳ branched</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
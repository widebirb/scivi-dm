import { useState } from "react";

export default function VersionControl({ versions, activeVersion, onRollback, onClear }) {
    const [expandedId, setExpandedId] = useState(null);

    if (versions.length === 0) {
        return <p className="text-xs text-tx-muted">no history yet</p>;
    }

    return (
        <div className="flex flex-col gap-1.5">
            {versions.length > 0 && (
                <button
                    onClick={onClear}
                    className="text-xs text-right mb-1 transition-colors text-tx-muted hover:text-danger"
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
                        className={`rounded transition-colors border ${isActive ? "border-accent bg-accent-dim" : "border-dim bg-bg"}`}
                    >
                        <div className="flex gap-2 p-1.5">
                            <button onClick={() => onRollback?.(v.versionId)} className="shrink-0">
                                <img
                                    src={v.imageData}
                                    alt={v.label}
                                    className="w-10 h-10 object-cover rounded composite-image border border-dim"
                                />
                            </button>

                            <button onClick={() => onRollback?.(v.versionId)} className="flex-1 text-left min-w-0">
                                <p className={`text-xs truncate ${isActive ? "text-accent-fg" : "text-tx-dim"}`}>
                                    {v.label}
                                </p>
                                <p className="text-xs text-tx-muted">
                                    {new Date(v.timestamp).toLocaleTimeString()}
                                </p>
                            </button>

                            <button
                                onClick={() => setExpandedId((p) => p === v.versionId ? null : v.versionId)}
                                className="text-xs self-start pt-0.5 transition-colors text-tx-muted hover:text-tx-dim"
                            >
                                {isExpanded ? "▲" : "▼"}
                            </button>
                        </div>

                        {isExpanded && (
                            <div className="px-2 pb-2 pt-2 space-y-1.5 border-t border-dim">
                                <p className="text-xs leading-relaxed text-tx-dim">{v.parameters.prompt || "—"}</p>
                                {v.parameters.negative_prompt && (
                                    <p className="text-xs leading-relaxed italic text-tx-muted">
                                        negative_prompt = {v.parameters.negative_prompt}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">Seed</span>
                                        <span className="text-[10px] font-mono text-accent-fg">{v.parameters.seed}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">Steps</span>
                                        <span className="text-[10px] font-mono text-tx-dim">{v.parameters.steps}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">CFG</span>
                                        <span className="text-[10px] font-mono text-tx-dim">{v.parameters.cfg_scale}</span>
                                    </div>
                                    <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">Res</span>
                                        <span className="text-[10px] font-mono text-tx-dim">{v.parameters.width}×{v.parameters.height}</span>
                                    </div>
                                    {v.generationTime && (
                                        <div className="metadata-chip-time flex items-center gap-1 px-1.5 py-0.5 rounded">
                                            <span className="text-[9px] uppercase font-bold tracking-wider">Time</span>
                                            <span className="text-[10px] font-bold tracking-wider">{v.generationTime.toFixed(2)}s</span>
                                        </div>
                                    )}
                                    {v.inpaintParams && (
                                        <>
                                            <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                                <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">Denoise</span>
                                                <span className="text-[10px] font-mono text-accent-fg">{v.inpaintParams.denoising_strength.toFixed(2)}</span>
                                            </div>
                                            <div className="metadata-chip flex items-center gap-1 px-1.5 py-0.5 rounded">
                                                <span className="text-[9px] uppercase font-bold tracking-wider text-tx-muted">Blur</span>
                                                <span className="text-[10px] font-mono text-accent-fg">{v.inpaintParams.mask_blur}px</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {v.maskData && (
                                    <div className="pt-1">
                                        <p className="text-[9px] uppercase tracking-wider mb-1 text-tx-muted">Mask</p>
                                        <img
                                            src={v.maskData}
                                            alt="inpaint mask"
                                            className="w-full rounded composite-image border border-dim opacity-85"
                                        />
                                    </div>
                                )}
                                {v.parentId && <p className="text-[10px] pt-1 text-tx-muted">↳ branched</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
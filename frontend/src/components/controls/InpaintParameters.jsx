import { useState } from "react";

const DEFAULTS = {
    denoising_strength: 0.75,
    mask_blur: 4,
};

export default function InpaintParameters({ onChange, disabled = false }) {
    const [params, setParams] = useState(DEFAULTS);

    function update(field, value) {
        const next = { ...params, [field]: value };
        setParams(next);
        onChange?.(next);
    }

    const denoisingHint =
        params.denoising_strength < 0.4 ? "subtle - stays close to original" :
            params.denoising_strength > 0.85 ? "aggressive - may ignore original" :
                "balanced";

    return (
        <div className="flex flex-col gap-3 text-xs" style={{ fontFamily: "var(--font-mono)" }}>

            {/* Denoising Strength */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <label className="uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                        Denoising — {params.denoising_strength.toFixed(2)}
                    </label>
                    <span style={{ color: "var(--text-muted)" }}>{denoisingHint}</span>
                </div>
                <input
                    type="range" min={0} max={1} step={0.01}
                    value={params.denoising_strength}
                    onChange={(e) => update("denoising_strength", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full disabled:opacity-40"
                    style={{ accentColor: "var(--accent2)" }}
                />
            </div>

            {/* Mask Blur */}
            <div className="flex flex-col gap-1">
                <label className="uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                    Mask Blur — {params.mask_blur}px
                </label>
                <input
                    type="range" min={0} max={64} step={1}
                    value={params.mask_blur}
                    onChange={(e) => update("mask_blur", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full disabled:opacity-40"
                    style={{ accentColor: "var(--accent2)" }}
                />
                <p style={{ color: "var(--text-muted)" }}>softens mask edges to reduce seams</p>
            </div>

        </div>
    );
}
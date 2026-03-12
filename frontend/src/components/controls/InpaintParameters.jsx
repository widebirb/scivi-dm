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

    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg font-mono text-sm text-zinc-100 w-72">

            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <span className="text-xs uppercase tracking-widest text-zinc-400">Inpaint Options</span>
                <button
                    onClick={() => { setParams(DEFAULTS); onChange?.(DEFAULTS); }}
                    disabled={disabled}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                    reset
                </button>
            </div>

            {/* Denoising Strength */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">
                    Denoising Strength — {params.denoising_strength.toFixed(2)}
                </label>
                <input
                    type="range"
                    min={0} max={1} step={0.01}
                    value={params.denoising_strength}
                    onChange={(e) => update("denoising_strength", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full accent-zinc-400 disabled:opacity-40"
                />
                {/* Contextual hint — this is the most confusing parameter for new users */}
                <p className="text-zinc-600 text-xs">
                    {params.denoising_strength < 0.4
                        ? "subtle — stays close to original"
                        : params.denoising_strength > 0.85
                            ? "aggressive — may ignore original"
                            : "balanced"}
                </p>
            </div>

            {/* Mask Blur */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">
                    Mask Blur — {params.mask_blur}px
                </label>
                <input
                    type="range"
                    min={0} max={64} step={1}
                    value={params.mask_blur}
                    onChange={(e) => update("mask_blur", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full accent-zinc-400 disabled:opacity-40"
                />
                <p className="text-zinc-600 text-xs">
                    softens mask edges to reduce hard seams
                </p>
            </div>

        </div>
    );
}
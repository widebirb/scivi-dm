import { useState } from "react";

const SAMPLERS = [
    "DPM++ 2M Karras",
    "DPM++ SDE Karras",
    "Euler a",
    "Euler",
    "DDIM",
];

//presets
const RESOLUTIONS = [
    { label: "512 × 512", width: 512, height: 512 },
    { label: "768 × 768", width: 768, height: 768 },
    { label: "512 × 768", width: 512, height: 768 },
    { label: "768 × 512", width: 768, height: 512 },
    { label: "1024 × 1024", width: 1024, height: 1024 },
];


const DEFAULTS = {
    prompt: "",
    negative_prompt: "",
    width: 512,
    height: 512,
    sampler: "DPM++ 2M Karras",
    steps: 20,
    cfg_scale: 7,
    seed: -1,
};

export default function ParameterControl({ onChange, disabled = false }) {
    const [params, setParams] = useState(DEFAULTS);

    function update(field, value) {
        const next = { ...params, [field]: value };
        setParams(next);
        onChange?.(next);
    }

    function handleResolution(e) {
        const res = RESOLUTIONS.find((r) => r.label === e.target.value);
        if (!res) return;
        const next = { ...params, width: res.width, height: res.height };
        setParams(next);
        onChange?.(next);
    }

    function randomizeSeed() {
        update("seed", Math.floor(Math.random() * 2 ** 32));
    }

    const currentResLabel =
        RESOLUTIONS.find(
            (r) => r.width === params.width && r.height === params.height
        )?.label || "Custom";

    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg font-mono text-sm text-zinc-100 w-72">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <span className="text-xs uppercase tracking-widest text-zinc-400">Parameters</span>
                <button
                    onClick={() => { setParams(DEFAULTS); onChange?.(DEFAULTS); }}
                    disabled={disabled}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                    reset
                </button>
            </div>

            {/* Prompt */}
            <Field label="Prompt">
                <textarea
                    rows={3}
                    value={params.prompt}
                    onChange={(e) => update("prompt", e.target.value)}
                    disabled={disabled}
                    placeholder="describe the subject..."
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-400 disabled:opacity-40"
                />
            </Field>

            {/* Negative Prompt */}
            <Field label="Negative Prompt">
                <textarea
                    rows={2}
                    value={params.negative_prompt}
                    onChange={(e) => update("negative_prompt", e.target.value)}
                    disabled={disabled}
                    placeholder="what to avoid..."
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-400 disabled:opacity-40"
                />
            </Field>

            {/* Resolution */}
            <Field label="Resolution">
                <select
                    value={currentResLabel}
                    onChange={handleResolution}
                    disabled={disabled}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400 disabled:opacity-40"
                >
                    {RESOLUTIONS.map((r) => (
                        <option key={r.label} value={r.label}>{r.label}</option>
                    ))}
                </select>
            </Field>

            {/* Sampler */}
            <Field label="Sampler">
                <select
                    value={params.sampler}
                    onChange={(e) => update("sampler", e.target.value)}
                    disabled={disabled}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400 disabled:opacity-40"
                >
                    {SAMPLERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </Field>

            {/* Steps */}
            <Field label={`Steps — ${params.steps}`}>
                <input
                    type="range"
                    min={1} max={40} step={1}
                    value={params.steps}
                    onChange={(e) => update("steps", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full accent-zinc-400 disabled:opacity-40"
                />
            </Field>

            {/* CFG Scale */}
            <Field label={`CFG Scale — ${params.cfg_scale.toFixed(1)}`}>
                <input
                    type="range"
                    min={1} max={30} step={0.5}
                    value={params.cfg_scale}
                    onChange={(e) => update("cfg_scale", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full accent-zinc-400 disabled:opacity-40"
                />
            </Field>

            {/* Seed */}
            <Field label="Seed">
                <div className="flex gap-1">
                    <input
                        type="number"
                        value={params.seed}
                        onChange={(e) => update("seed", Number(e.target.value))}
                        disabled={disabled}
                        className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400 disabled:opacity-40"
                    />
                    <button
                        onClick={randomizeSeed}
                        disabled={disabled}
                        title="random seed"
                        className="px-2 bg-zinc-800 border border-zinc-600 rounded text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 transition-colors disabled:opacity-40"
                    >
                        ↺
                    </button>
                    <button
                        onClick={() => update("seed", -1)}
                        disabled={disabled}
                        title="set to random (-1)"
                        className="px-2 bg-zinc-800 border border-zinc-600 rounded text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 transition-colors disabled:opacity-40 text-xs"
                    >
                        rnd
                    </button>
                </div>
                <p className="text-zinc-600 text-xs mt-1">-1 = random each run</p>
            </Field>

        </div>
    );
}

// small wrapper so every field has consistent label + spacing
function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}
import { useState } from "react";

const SAMPLERS = [
    "DPM++ 2M Karras",
    "DPM++ SDE Karras",
    "Euler a",
    "Euler",
    "DDIM",
];

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

const TOOLTIPS = {
    prompt: "Describe what to generate. More detail = more accurate results.",
    negative_prompt: "Describe what to avoid or exclude from the output.",
    resolution: "Output image dimensions. Higher = slower and more VRAM.",
    sampler: "Algorithm used for denoising. DPM++ 2M Karras is a safe default.",
    steps: "More steps = more refined output, but slower. 20–30 is usually enough.",
    cfg_scale: "How strictly the model follows your prompt. Higher = more literal.",
    seed: "Controls randomness. Same seed + same params = same image. -1 = random.",
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
        RESOLUTIONS.find((r) => r.width === params.width && r.height === params.height)?.label || "Custom";

    return (
        <div className="flex flex-col gap-4">

            <SectionLabel>Generation</SectionLabel>

            <Field label="Prompt" tooltip={TOOLTIPS.prompt}>
                <textarea
                    rows={3}
                    value={params.prompt}
                    onChange={(e) => update("prompt", e.target.value)}
                    disabled={disabled}
                    placeholder="describe the subject..."
                    className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none disabled:opacity-40"
                    style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
            </Field>

            <Field label="Negative Prompt" tooltip={TOOLTIPS.negative_prompt}>
                <textarea
                    rows={2}
                    value={params.negative_prompt}
                    onChange={(e) => update("negative_prompt", e.target.value)}
                    disabled={disabled}
                    placeholder="what to avoid..."
                    className="w-full rounded px-2 py-1.5 text-xs resize-none focus:outline-none disabled:opacity-40"
                    style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
            </Field>

            <Field label="Resolution" tooltip={TOOLTIPS.resolution}>
                <Select value={currentResLabel} onChange={handleResolution} disabled={disabled}>
                    {RESOLUTIONS.map((r) => (
                        <option key={r.label} value={r.label}>{r.label}</option>
                    ))}
                </Select>
            </Field>

            <Field label="Sampler" tooltip={TOOLTIPS.sampler}>
                <Select value={params.sampler} onChange={(e) => update("sampler", e.target.value)} disabled={disabled}>
                    {SAMPLERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Select>
            </Field>

            <Field label="Steps" tooltip={TOOLTIPS.steps} valueReadout={params.steps}>
                <input
                    type="range" min={1} max={150} step={1}
                    value={params.steps}
                    onChange={(e) => update("steps", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full disabled:opacity-40"
                />
            </Field>

            <Field label="CFG Scale" tooltip={TOOLTIPS.cfg_scale} valueReadout={params.cfg_scale.toFixed(1)}>
                <input
                    type="range" min={1} max={30} step={0.5}
                    value={params.cfg_scale}
                    onChange={(e) => update("cfg_scale", Number(e.target.value))}
                    disabled={disabled}
                    className="w-full disabled:opacity-40"
                />
            </Field>

            <Field label="Seed" tooltip={TOOLTIPS.seed}>
                <div className="flex gap-1 min-w-0">
                    <input
                        type="number"
                        value={params.seed}
                        onChange={(e) => update("seed", Number(e.target.value))}
                        disabled={disabled}
                        className="min-w-0 w-full rounded px-2 py-1.5 text-xs focus:outline-none disabled:opacity-40"
                        style={{
                            backgroundColor: "var(--bg-raised)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                    <IconButton onClick={randomizeSeed} disabled={disabled} title="randomize seed">↺</IconButton>
                    <IconButton onClick={() => update("seed", -1)} disabled={disabled} title="set to -1 (random)">−1</IconButton>
                </div>
            </Field>

            {/* Reset */}
            <button
                onClick={() => { setParams(DEFAULTS); onChange?.(DEFAULTS); }}
                disabled={disabled}
                className="text-xs text-left transition-colors disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.target.style.color = "#f87171"}
                onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
            >
                ↺ reset parameters
            </button>

        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <div className="flex items-center justify-center mb-1 mt-1">
            <span className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--text-dim)" }}>
                {children}
            </span>
        </div>
    );
}

function Field({ label, tooltip, valueReadout, children }) {
    return (
        <div className="flex flex-col min-w-0 gap-2">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                    <label className="text-xs uppercase tracking-wider font-medium truncate" style={{ color: "var(--text-dim)" }}>
                        {label}
                    </label>
                    {tooltip && (
                        <div className="tooltip-wrap relative shrink-0">
                            <span 
                                className="flex items-center justify-center text-[9px] font-bold w-[16px] h-[16px] rounded-full border cursor-help transition-colors" 
                                style={{ 
                                    color: "var(--text-muted)", 
                                    borderColor: "var(--border)",
                                }}
                                onMouseEnter={(e) => { e.target.style.color = "var(--text)"; e.target.style.borderColor = "var(--text-dim)"; }}
                                onMouseLeave={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.borderColor = "var(--border)"; }}
                            >
                                ?
                            </span>
                            <span 
                                className="tooltip-box" 
                                style={{ 
                                    maxWidth: "200px", 
                                    whiteSpace: "normal", 
                                    textAlign: "left",
                                    left: "0",
                                    zIndex: 50
                                }}
                            >
                                {tooltip}
                            </span>
                        </div>
                    )}
                </div>
                {valueReadout && (
                    <span 
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded shadow-sm border" 
                        style={{ 
                            backgroundColor: "var(--bg-surface)", 
                            borderColor: "var(--border-dim)", 
                            color: "var(--accent-text)" 
                        }}
                    >
                        {valueReadout}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function Select({ value, onChange, disabled, children }) {
    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full rounded px-2 py-1.5 text-xs focus:outline-none disabled:opacity-40"
            style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text)",
            }}
        >
            {children}
        </select>
    );
}

function IconButton({ onClick, disabled, title, children }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="px-2 rounded text-xs transition-colors disabled:opacity-40"
            style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
        >
            {children}
        </button>
    );
}
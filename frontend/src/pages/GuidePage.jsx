export default function GuidePage() {
    const sections = [
        {
            title: "01 / Generate",
            steps: [
                "Enter a prompt describing the facial composite you want to generate.",
                "Optionally add a negative prompt for things to avoid (e.g. 'blurry, deformed').",
                "Adjust resolution, sampler, steps, and CFG scale as needed.",
                "Set a seed or leave at -1 for a random result.",
                "Click Generate. The result appears in the canvas.",
            ],
        },
        {
            title: "02 / Inpaint",
            steps: [
                "After generating an image, switch to the Inpaint tool on the canvas toolbar.",
                "Use the paint brush to mark the region you want to modify.",
                "Use erase to remove parts of the mask. [ and ] adjust brush size.",
                "Expand Inpaint Options to adjust denoising strength and mask blur.",
                "Click Inpaint Selection to regenerate only the masked area.",
            ],
        },
        {
            title: "03 / Version History",
            steps: [
                "Every generation is saved automatically in the history panel on the right.",
                "Click any thumbnail to load that version back to the canvas.",
                "Expand a version entry to see the exact parameters used.",
                "The seed shown is always the resolved value — use it to reproduce the exact result.",
            ],
        },
        {
            title: "04 / Theme",
            steps: [
                "Use the theme toggle in the header to switch between Color and Mono modes.",
                "Mono mode applies a grayscale filter to the UI accents and composite images.",
                "Useful for printing — 2 pesos per page instead of 10.",
            ],
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8" style={{ color: "var(--text)" }}>
            <div className="max-w-2xl mx-auto">

                <div className="mb-8">
                    <h1
                        className="text-lg font-semibold tracking-widest uppercase mb-1"
                        style={{ color: "var(--accent-text)" }}
                    >
                        Guide
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        How to use SCIVI-DM for facial composite generation.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2
                                className="text-xs uppercase tracking-[0.2em] mb-3 pb-2"
                                style={{
                                    color: "var(--accent-text)",
                                    borderBottom: "1px solid var(--border-dim)",
                                }}
                            >
                                {section.title}
                            </h2>
                            <ol className="flex flex-col gap-2">
                                {section.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="shrink-0 text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span style={{ color: "var(--text-dim)" }}>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default function GuidePage() {
    const sections = [
        {
            title: "01 / Generate",
            steps: [
                "67"
            ],
        },
        {
            title: "02 / Inpaint",
            steps: [
                "67"
            ],
        },
        {
            title: "03 / Version History",
            steps: [
                " 67",
            ],
        },
        {
            title: "04 / Theme",
            steps: [
                " 67",
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
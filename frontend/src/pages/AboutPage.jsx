const TECH = [
    { name: "React 18", role: "Frontend framework" },
    { name: "Vite 5", role: "Build tool" },
    { name: "Tailwind CSS 3", role: "Utility styling" },
    { name: "react-konva", role: "Canvas / mask drawing" },
    { name: "FastAPI", role: "Backend API" },
    { name: "Diffusers", role: "Inference pipeline" },
    { name: "JuggernautXL v9", role: "Base generation model" },
    { name: "JuggernautXL Inpaint", role: "Inpainting model" },
    { name: "Docker", role: "Containerization" },
    { name: "Vast.ai", role: "GPU compute" },
];

export default function AboutPage() {
    return (
        <div className="flex-1 overflow-y-auto p-8" style={{ color: "var(--text)" }}>
            <div className="max-w-2xl mx-auto flex flex-col gap-10">

                {/* System */}
                <section>
                    <SectionTitle>SCIVI-DM</SectionTitle>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        uhm
                    </p>
                </section>

                {/* Technologies */}
                <section>
                    <SectionTitle>Technologies</SectionTitle>
                    <div className="flex flex-col gap-1">
                        {TECH.map((t) => (
                            <div
                                key={t.name}
                                className="flex items-center justify-between py-1.5 px-2 rounded text-xs"
                                style={{ borderBottom: "1px solid var(--border-dim)" }}
                            >
                                <span style={{ color: "var(--accent-text)" }}>{t.name}</span>
                                <span style={{ color: "var(--text-muted)" }}>{t.role}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Acknowledgements */}
                <section>
                    <SectionTitle>Acknowledgements</SectionTitle>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        what do I put here
                    </p>
                </section>

                {/* License */}
                <section>
                    <SectionTitle>License</SectionTitle>
                    <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                        don't know yet
                    </p>
                </section>

            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2
            className="text-xs uppercase tracking-[0.2em] mb-3 pb-2"
            style={{
                color: "var(--accent-text)",
                borderBottom: "1px solid var(--border-dim)",
            }}
        >
            {children}
        </h2>
    );
}
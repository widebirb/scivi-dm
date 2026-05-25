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
        <div className="flex-1 overflow-y-auto p-8 text-tx">
            <div className="max-w-2xl mx-auto flex flex-col gap-10">

                {/* System */}
                <section>
                    <SectionTitle>SCIVI-DM</SectionTitle>
                    <p className="text-sm leading-relaxed text-tx-dim">
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
                                className="flex items-center justify-between py-1.5 px-2 rounded text-xs border-b border-dim"
                            >
                                <span className="text-accent-fg">{t.name}</span>
                                <span className="text-tx-muted">{t.role}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Acknowledgements */}
                <section>
                    <SectionTitle>Acknowledgements</SectionTitle>
                    <p className="text-sm leading-relaxed text-tx-dim">
                        what do I put here
                    </p>
                </section>

                {/* License */}
                <section>
                    <SectionTitle>License</SectionTitle>
                    <p className="text-sm text-tx-dim">
                        don't know yet
                    </p>
                </section>

            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 className="text-xs uppercase tracking-[0.2em] mb-3 pb-2 text-accent-fg border-b border-dim">
            {children}
        </h2>
    );
}
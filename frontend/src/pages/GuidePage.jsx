import { sections } from './guideContent';

export default function GuidePage() {

    const renderSection = (section) => {
        if (section.type === "steps") {
            return (
                <ol className="flex flex-col gap-2">
                    {section.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                            <span
                                className="shrink-0 text-xs mt-0.5 tabular-nums"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span style={{ color: "var(--text-dim)" }}>{item}</span>
                        </li>
                    ))}
                </ol>
            );
        }

        if (section.type === "rules") {
            return (
                <ul className="flex flex-col gap-2">
                    {section.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                            <span
                                className="shrink-0 mt-1.5"
                                style={{
                                    width: "4px",
                                    height: "4px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--text-muted)",
                                    flexShrink: 0,
                                    marginTop: "6px",
                                }}
                            />
                            <span style={{ color: "var(--text-dim)" }}>{item}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        if (section.type === "params") {
            return (
                <div className="flex flex-col gap-4">
                    {section.items.map((param, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-1 pl-3"
                            style={{ borderLeft: "1px solid var(--border-dim)" }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-semibold tracking-wide uppercase"
                                    style={{ color: "var(--accent-text)" }}
                                >
                                    {param.name}
                                </span>
                                {param.type !== "issue" && (
                                    <span
                                        className="text-xs px-1.5 py-0.5 rounded"
                                        style={{
                                            color: "var(--text-muted)",
                                            backgroundColor: "var(--bg-subtle, rgba(255,255,255,0.04))",
                                            border: "1px solid var(--border-dim)",
                                            fontSize: "10px",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {param.type}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                                {param.description}
                            </p>
                            {param.note && (
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    - {param.note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

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
                        How to use.
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
                            {renderSection(section)}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
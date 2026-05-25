import { sections } from './guideContent';

export default function GuidePage() {

    const renderSection = (section) => {
        if (section.type === "steps") {
            return (
                <ol className="flex flex-col gap-2">
                    {section.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                            <span className="shrink-0 text-xs mt-0.5 tabular-nums text-tx-muted">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-tx-dim">{item}</span>
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
                            <span className="shrink-0 w-1 h-1 rounded-full bg-tx-muted mt-1.5" />
                            <span className="text-tx-dim">{item}</span>
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
                            className="flex flex-col gap-1 pl-3 border-l border-dim"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-wide uppercase text-accent-fg">
                                    {param.name}
                                </span>
                                {param.type !== "issue" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-dim text-tx-muted bg-subtle tracking-wider">
                                        {param.type}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-tx-dim">
                                {param.description}
                            </p>
                            {param.note && (
                                <p className="text-xs mt-1 text-tx-muted">
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
        <div className="flex-1 overflow-y-auto p-8 text-tx">
            <div className="max-w-2xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-lg font-semibold tracking-widest uppercase mb-1 text-accent-fg">
                        Guide
                    </h1>
                    <p className="text-sm text-tx-muted">
                        How to use.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-xs uppercase tracking-[0.2em] mb-3 pb-2 text-accent-fg border-b border-dim">
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
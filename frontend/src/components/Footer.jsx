export default function Footer() {

    return (
        <footer
            className="h-7 shrink-0 flex items-center justify-between px-5 py-5 border-t text-xs"
            style={{
                borderColor: "var(--border-dim)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-muted)",
            }}
        >
            {/* idk yet */}
            <div className="flex items-center gap-4">
                <span
                    className="px-1 py-0.5 rounded text-xs mr-1"
                    style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-dim)" }}
                >what to put here</span>
            </div>

            {/* Label */}
            <span className="tracking-widest uppercase text-xs" style={{ color: "var(--text-muted)" }}>
                scivi-dm · v0.2.0
            </span>
        </footer>
    );
}
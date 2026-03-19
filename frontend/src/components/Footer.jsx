export default function Footer() {
    return (
        <footer
            className="h-7 shrink-0 flex items-center justify-between px-5 py-5 border-t text-xs"
            style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
        >
            {/* idk yet */}
            <div className="flex items-center gap-4">
                <span
                    className="px-1.5 py-0.5 rounded mr-1"
                    style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                > what to put here
                </span>
            </div>
            <span className="tracking-widest uppercase">scivi-dm · v0.2</span>
        </footer>
    );
}
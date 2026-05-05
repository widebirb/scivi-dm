export default function Footer() {
    return (
        <footer
            className="h-7 shrink-0 flex items-center justify-between px-5 py-5 border-t text-xs"
            style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
        >
            {/* idk yet */}
            <div className="flex items-center gap-4">
            </div>
            <span className="tracking-widest uppercase">scivi-dm · v0.3.1</span>
        </footer>
    );
}
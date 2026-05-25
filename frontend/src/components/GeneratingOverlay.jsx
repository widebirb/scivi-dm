export default function GeneratingOverlay({ visible, elapsed = 0 }) {
    if (!visible) return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded z-10 bg-bg/90">
            <div className="spinner w-7 h-7 mb-1" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tx-dim">generating</p>
            <p className="text-xs text-tx-muted">{elapsed}s</p>
        </div>
    );
}
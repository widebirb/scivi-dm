export default function GeneratingOverlay({ visible, elapsed = 0 }) {
    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded z-10"
            style={{ backgroundColor: "rgba(244,244,245,0.88)" }}
        >
            <div className="w-32 h-px rounded overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                <div
                    className="h-full rounded"
                    style={{ backgroundColor: "var(--accent)", animation: "slide 1.4s ease-in-out infinite" }}
                />
            </div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>generating</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{elapsed}s</p>
            <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); width: 60%; }
          50%  { transform: translateX(120%);  width: 60%; }
          100% { transform: translateX(120%);  width: 60%; }
        }
      `}</style>
        </div>
    );
}
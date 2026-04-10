export default function GeneratingOverlay({ visible, elapsed = 0 }) {
    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded z-10"
            style={{ backgroundColor: "rgba(244,244,245,0.88)" }}
        >
            <div 
                className="w-7 h-7 rounded-full mb-1" 
                style={{ 
                    border: "2px solid var(--border-dim)", 
                    borderTopColor: "var(--text)", 
                    animation: "spin 0.8s linear infinite" 
                }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-dim)" }}>generating</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{elapsed}s</p>
            <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
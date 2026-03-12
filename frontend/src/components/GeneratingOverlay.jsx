export default function GeneratingOverlay({ visible, elapsed = 0 }) {
    if (!visible) return null;

    return (
        <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center gap-3 rounded-lg z-10">

            {/* Pulsing bar */}
            <div className="w-32 h-0.5 bg-zinc-800 rounded overflow-hidden">
                <div
                    className="h-full bg-zinc-400 rounded"
                    style={{
                        animation: "slide 1.4s ease-in-out infinite",
                    }}
                />
            </div>

            <p className="font-mono text-xs text-zinc-400">generating</p>
            <p className="font-mono text-xs text-zinc-600">{elapsed}s</p>


            {/*idek this was possible*/}
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
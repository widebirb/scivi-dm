import { useTheme } from "../context/ThemeContext";
import StatusBar from "./StatusBar";

export default function Header({ onNavigate, currentPage }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-dim bg-surface">
            {/* wordmark */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onNavigate(null)}
                    className="flex items-center gap-2 group"
                >
                    {/* two overlapping brackets, terminal-ish */}
                    <span className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${currentPage === null ? "text-accent-fg" : "text-tx"}`}>
                        SCIVI<span className="text-accent-fg">-DM</span>
                    </span>
                </button>

                <span className="text-xs hidden sm:block text-tx-muted" />

                <StatusBar />
            </div>

            {/* nav + theme toggle */}
            <nav className="flex items-center gap-1">
                {["guide"].map((page) => (
                    <button
                        key={page}
                        onClick={() => onNavigate(currentPage === page ? null : page)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded transition-colors ${
                            currentPage === page
                                ? "text-accent-fg bg-accent-dim"
                                : "text-tx-muted hover:text-tx-dim bg-transparent"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Divider */}
                <span className="w-px h-4 mx-1 bg-bd" />

                {/* Theme toggle */}
                <div className="tooltip-wrap">
                    <button
                        onClick={toggleTheme}
                        className="px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 text-tx-muted hover:text-tx-dim"
                    >
                        <span className="uppercase tracking-wider">{theme === "colored" ? "color" : "Gray"}</span>
                    </button>
                    <span className="tooltip-box">
                        {theme === "colored" ? "switch to mono / grayscale" : "switch to color"}
                    </span>
                </div>
            </nav>
        </header>
    );
}
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import StatusBar from "./StatusBar";

export default function Header({ onNavigate, currentPage }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header
            className="h-12 shrink-0 flex items-center justify-between px-5 border-b"
            style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
        >
            {/* wordmark */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onNavigate(null)}
                    className="flex items-center gap-2 group"
                >
                    {/* two overlapping brackets, terminal-ish */}
                    <span
                        className="text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
                        style={{ color: currentPage === null ? "var(--accent-text)" : "var(--text)" }}
                    >
                        SCIVI<span style={{ color: "var(--accent-text)" }}>-DM</span>
                    </span>
                </button>

                <span
                    className="text-xs hidden sm:block"
                    style={{ color: "var(--text-muted)" }}
                >
                </span>

                <StatusBar />
            </div>

            {/* nav + theme toggle */}
            <nav className="flex items-center gap-1">
                {["guide"].map((page) => (
                    <button
                        key={page}
                        onClick={() => onNavigate(currentPage === page ? null : page)}
                        className="px-3 py-1.5 text-xs uppercase tracking-wider rounded transition-colors"
                        style={{
                            color: currentPage === page ? "var(--accent-text)" : "var(--text-muted)",
                            backgroundColor: currentPage === page ? "var(--accent-dim)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                            if (currentPage !== page) e.target.style.color = "var(--text-dim)";
                        }}
                        onMouseLeave={(e) => {
                            if (currentPage !== page) e.target.style.color = "var(--text-muted)";
                        }}
                    >
                        {page}
                    </button>
                ))}

                {/* Divider */}
                <span className="w-px h-4 mx-1" style={{ backgroundColor: "var(--border)" }} />

                {/* Theme toggle */}
                <div className="tooltip-wrap">
                    <button
                        onClick={toggleTheme}
                        className="px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
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
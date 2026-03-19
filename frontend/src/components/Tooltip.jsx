import { useState } from "react";

export default function Tooltip({ content, children }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && content && (
                <div
                    className="absolute left-0 bottom-full mb-2 z-50 pointer-events-none z-40"
                    style={{ minWidth: "160px", maxWidth: "240px" }}
                >
                    <div
                        className="text-xs leading-relaxed px-2.5 py-2 rounded"
                        style={{
                            background: "var(--bg-2)",
                            border: "1px solid var(--bd-2)",
                            color: "var(--tx-1)",
                            fontFamily: "var(--font)",
                        }}
                    >
                        {content}
                    </div>
                    {/* Arrow */}
                    <div
                        className="w-2 h-2 rotate-45 ml-2"
                        style={{
                            background: "var(--bg-2)",
                            borderRight: "1px solid var(--bd-2)",
                            borderBottom: "1px solid var(--bd-2)",
                            marginTop: "-5px",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
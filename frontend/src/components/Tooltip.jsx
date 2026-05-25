export default function Tooltip({ content, children, position = "bottom" }) {
    if (!content) return children;

    const wrapClass = position === "right" ? "tooltip-wrap tooltip-right" : "tooltip-wrap";

    return (
        <span className={wrapClass}>
            {children}
            <span className="tooltip-box">
                {content}
            </span>
        </span>
    );
}
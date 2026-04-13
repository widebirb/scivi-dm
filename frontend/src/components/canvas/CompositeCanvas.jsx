import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

const CANVAS_SIZE = 512;
const MIN_BRUSH = 4;
const MAX_BRUSH = 80;

export default function CompositeCanvas({ imageData, onInpaint, disabled = false }) {
    const stageRef = useRef(null);
    const imageLayerRef = useRef(null);
    const mainImageRef = useRef(null);

    const [tool, setTool] = useState("paint");
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [hasMask, setHasMask] = useState(false);
    const [isGrayscale, setIsGrayscale] = useState(false);

    const [konvaImage] = useImage(imageData || "");

    useEffect(() => {
        if (mainImageRef.current) {
            if (isGrayscale) {
                mainImageRef.current.cache();
            } else {
                mainImageRef.current.clearCache();
            }
        }
    }, [isGrayscale, konvaImage]);

    const handleExport = useCallback(() => {
        if (!stageRef.current) return;
        const uri = stageRef.current.toDataURL({ pixelRatio: 1 });
        const link = document.createElement("a");
        link.download = "scivi-export.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    function getPointerPos() {
        return stageRef.current.getPointerPosition();
    }

    function handleMouseDown() {
        if (!imageData || disabled) return;
        setIsDrawing(true);
        const pos = getPointerPos();
        setLines((prev) => [...prev, { tool, brushSize, points: [pos.x, pos.y] }]);
    }

    function handleMouseMove() {
        if (!isDrawing) return;
        const pos = getPointerPos();
        setLines((prev) => {
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] };
            last.points = [...last.points, pos.x, pos.y];
            updated[updated.length - 1] = last;
            return updated;
        });
        setHasMask(true);
    }

    function handleMouseUp() { setIsDrawing(false); }
    function clearMask() { setLines([]); setHasMask(false); }

    const exportMask = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return null;

        // Create an offscreen canvas, same size as the stage
        const offscreen = document.createElement("canvas");
        offscreen.width = CANVAS_SIZE;
        offscreen.height = CANVAS_SIZE;
        const ctx = offscreen.getContext("2d");

        // Fill black background, this is the "keep" area
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw each stroke as pure white, this is the "repaint" area
        lines.forEach((line) => {
            if (line.tool === "erase") return; // erased areas stay black
            if (line.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = line.brushSize;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.moveTo(line.points[0], line.points[1]);
            for (let i = 2; i < line.points.length; i += 2) {
                ctx.lineTo(line.points[i], line.points[i + 1]);
            }
            ctx.stroke();
        });

        return offscreen.toDataURL("image/png");
    }, [lines]);

    function handleInpaintSubmit() {
        if (!hasMask) return;
        const maskDataURL = exportMask();
        if (!maskDataURL) return;
        onInpaint?.(imageData, maskDataURL);
    }

    // Expose hasMask and submit to parent via a stable ref if needed
    const cursor = tool === "paint" ? "crosshair" : "cell";

    return (
        <div className="flex flex-col gap-2">

            {/* Toolbar */}
            <div
                className="flex items-center gap-3 px-2 py-1.5 rounded text-xs"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
            >
                {/* Tool toggle */}
                <div className="flex rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    {["paint", "erase"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            disabled={disabled}
                            className="px-3 py-1 text-xs transition-colors disabled:opacity-40"
                            style={{
                                backgroundColor: tool === t ? "var(--accent)" : "var(--bg-raised)",
                                color: tool === t ? "var(--generate-text)" : "var(--text-dim)",
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Brush size */}
                <div className="flex items-center gap-2 flex-1">
                    <span style={{ color: "var(--text-muted)" }}>brush</span>
                    <input
                        type="range" min={MIN_BRUSH} max={MAX_BRUSH}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        disabled={disabled}
                        className="flex-1 disabled:opacity-40"
                        style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="w-6 text-right" style={{ color: "var(--text-dim)" }}>{brushSize}</span>
                </div>

                {/* Filters */}
                <button
                    onClick={() => setIsGrayscale((prev) => !prev)}
                    disabled={!imageData || disabled}
                    className="text-xs transition-colors disabled:opacity-30 w-10 text-center"
                    style={{ color: isGrayscale ? "var(--accent)" : "var(--text-muted)" }}
                    onMouseEnter={(e) => { if (!isGrayscale) e.target.style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { if (!isGrayscale) e.target.style.color = "var(--text-muted)"; }}
                >
                    {isGrayscale ? "color" : "gray"}
                </button>

                <button
                    onClick={clearMask}
                    disabled={disabled || !hasMask}
                    className="text-xs transition-colors disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                >
                    clear
                </button>

                <button
                    onClick={handleExport}
                    disabled={!imageData || disabled}
                    className="text-xs transition-colors disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.target.style.color = "var(--text)"}
                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                >
                    export
                </button>
            </div>

            {/* Stage */}
            <div
                className="rounded overflow-hidden scanlines"
                style={{
                    cursor,
                    width: CANVAS_SIZE,
                    height: CANVAS_SIZE,
                    border: "1px solid var(--border)",
                }}
            >
                <Stage
                    ref={stageRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ background: "#f4f4f5" }}
                >
                    <Layer ref={imageLayerRef}>
                        {konvaImage ? (
                            <KonvaImage
                                ref={mainImageRef}
                                image={konvaImage}
                                width={CANVAS_SIZE}
                                height={CANVAS_SIZE}
                                filters={isGrayscale ? [Konva.Filters.Grayscale] : []}
                            />
                        ) : (
                            <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#e4e4e7" />
                        )}
                    </Layer>

                    <Layer>
                        <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="transparent" />
                        {lines.map((line, i) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke={line.tool === "paint" ? "rgba(86,37,126,0.5)" : "rgba(244,244,245,0.9)"}
                                strokeWidth={line.brushSize}
                                tension={0.4}
                                lineCap="round"
                                lineJoin="round"
                                globalCompositeOperation={line.tool === "erase" ? "destination-out" : "source-over"}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>

            {/* Inpaint options*/}
            {imageData && (
                <button
                    onClick={handleInpaintSubmit}
                    disabled={disabled || !hasMask}
                    className="w-full py-2 rounded text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        border: "1px solid var(--accent)",
                        color: hasMask && !disabled ? "var(--generate-text)" : "var(--accent-text)",
                        backgroundColor: hasMask && !disabled ? "var(--accent)" : "transparent",
                    }}
                >
                    {disabled ? "generating..." : hasMask ? "inpaint selection" : "draw a mask first"}
                </button>
            )}

            {!imageData && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    generate an image first to enable inpainting
                </p>
            )}
        </div>
    );
}
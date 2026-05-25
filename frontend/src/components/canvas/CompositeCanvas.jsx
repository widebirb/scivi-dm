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
        if (!konvaImage) return;

        const nativeW = konvaImage.naturalWidth || konvaImage.width || CANVAS_SIZE;
        const nativeH = konvaImage.naturalHeight || konvaImage.height || CANVAS_SIZE;

        const offscreen = document.createElement("canvas");
        offscreen.width = nativeW;
        offscreen.height = nativeH;
        const ctx = offscreen.getContext("2d");
        ctx.drawImage(konvaImage, 0, 0, nativeW, nativeH);

        const uri = offscreen.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "scivi-export.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [konvaImage]);

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

        // Use the actual image resolution as the mask size so they always match
        const maskW = konvaImage ? konvaImage.naturalWidth || konvaImage.width : CANVAS_SIZE;
        const maskH = konvaImage ? konvaImage.naturalHeight || konvaImage.height : CANVAS_SIZE;

        // Scale factor from canvas display coords → actual image pixels
        const scaleX = maskW / CANVAS_SIZE;
        const scaleY = maskH / CANVAS_SIZE;

        // Create an offscreen canvas at the real image resolution
        const offscreen = document.createElement("canvas");
        offscreen.width = maskW;
        offscreen.height = maskH;
        const ctx = offscreen.getContext("2d");

        // Fill black background, this is the "keep" area
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, maskW, maskH);

        // Draw each stroke as pure white, this is the "repaint" area
        lines.forEach((line) => {
            if (line.tool === "erase") return; // erased areas stay black
            if (line.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = line.brushSize * Math.max(scaleX, scaleY);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.moveTo(line.points[0] * scaleX, line.points[1] * scaleY);
            for (let i = 2; i < line.points.length; i += 2) {
                ctx.lineTo(line.points[i] * scaleX, line.points[i + 1] * scaleY);
            }
            ctx.stroke();
        });

        return offscreen.toDataURL("image/png");
    }, [lines, konvaImage]);

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
            <div className="flex items-center gap-3 px-2 py-1.5 rounded text-xs bg-surface border border-dim">
                {/* Tool toggle */}
                <div className="flex rounded overflow-hidden border border-bd">
                    {["paint", "erase"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            disabled={disabled}
                            className={`px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                                tool === t
                                    ? "bg-accent text-gen-fg"
                                    : "bg-raised text-tx-dim hover:text-tx"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Brush size */}
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-tx-muted">brush</span>
                    <input
                        type="range" min={MIN_BRUSH} max={MAX_BRUSH}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        disabled={disabled}
                        className="flex-1 disabled:opacity-40"
                        style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="w-6 text-right text-tx-dim">{brushSize}</span>
                </div>

                {/* Filters */}
                <button
                    onClick={() => setIsGrayscale((prev) => !prev)}
                    disabled={!imageData || disabled}
                    className={`text-xs transition-colors disabled:opacity-30 w-10 text-center ${
                        isGrayscale
                            ? "text-accent-fg font-semibold"
                            : "text-tx-muted hover:text-tx"
                    }`}
                >
                    {isGrayscale ? "color" : "gray"}
                </button>

                <button
                    onClick={clearMask}
                    disabled={disabled || !hasMask}
                    className="text-xs transition-colors disabled:opacity-30 text-tx-muted hover:text-danger"
                >
                    clear
                </button>

                <button
                    onClick={handleExport}
                    disabled={!imageData || disabled}
                    className="text-xs transition-colors disabled:opacity-30 text-tx-muted hover:text-tx"
                >
                    export
                </button>
            </div>

            {/* Stage */}
            <div
                className="rounded overflow-hidden scanlines border border-bd w-[512px] h-[512px]"
                style={{ cursor }}
            >
                <Stage
                    ref={stageRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="bg-bg"
                >
                    <StageRefHack
                        imageLayerRef={imageLayerRef}
                        mainImageRef={mainImageRef}
                        konvaImage={konvaImage}
                        isGrayscale={isGrayscale}
                        lines={lines}
                    />
                </Stage>
            </div>

            {/* Inpaint options*/}
            {imageData && (
                <button
                    onClick={handleInpaintSubmit}
                    disabled={disabled || !hasMask}
                    className={`w-full py-2 rounded text-xs transition-colors btn-inpaint ${hasMask && !disabled ? "has-mask" : ""}`}
                >
                    {disabled ? "generating..." : hasMask ? "inpaint selection" : "draw a mask first"}
                </button>
            )}

            {!imageData && (
                <p className="text-xs text-center text-tx-muted">
                    generate an image first to enable inpainting
                </p>
            )}
        </div>
    );
}

// Stage contains only layers as direct children, this is helper component to comply with react-konva rules
function StageRefHack({ imageLayerRef, mainImageRef, konvaImage, isGrayscale, lines }) {
    return (
        <>
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
        </>
    );
}
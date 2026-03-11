import { useRef, useState, useEffect, useCallback } from "react"; // useEffect kept for keyboard listener
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import useImage from "use-image";

const CANVAS_SIZE = 512; // display size in px, independent of actual image resolution
const MIN_BRUSH = 4;
const MAX_BRUSH = 80;

export default function CompositeCanvas({ imageData, onInpaint, disabled = false }) {
    const stageRef = useRef(null);
    const maskLayerRef = useRef(null);
    const imageLayerRef = useRef(null);

    const [tool, setTool] = useState("paint"); // "paint" | "erase"
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [hasMask, setHasMask] = useState(false);

    const [konvaImage] = useImage(imageData || "");

    // [ and ] keys for brush size — Photoshop muscle memory
    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === "[") setBrushSize((s) => Math.max(MIN_BRUSH, s - 4));
            if (e.key === "]") setBrushSize((s) => Math.min(MAX_BRUSH, s + 4));
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    function getPointerPos() {
        const stage = stageRef.current;
        const pos = stage.getPointerPosition();
        return pos;
    }

    function handleMouseDown() {
        if (!imageData || disabled) return;
        setIsDrawing(true);
        const pos = getPointerPos();
        setLines((prev) => [
            ...prev,
            { tool, brushSize, points: [pos.x, pos.y] },
        ]);
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

    function handleMouseUp() {
        setIsDrawing(false);
    }

    function clearMask() {
        setLines([]);
        setHasMask(false);
    }

    const exportMask = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return null;

        // Hide image, reveal black bg
        imageLayerRef.current.hide();
        const dataURL = stage.toDataURL({
            mimeType: "image/png",
            pixelRatio: 1,
        });
        imageLayerRef.current.show();

        return dataURL;
    }, []);

    async function handleInpaintSubmit() {
        if (!hasMask) return;
        const maskDataURL = exportMask();
        if (!maskDataURL) return;
        onInpaint?.(imageData, maskDataURL);
    }

    const cursor = tool === "paint" ? "crosshair" : "cell";

    return (
        <div className="flex flex-col gap-3">

            {/* Toolbar */}
            <div className="flex items-center gap-3 font-mono text-xs">

                {/* Tool toggle */}
                <div className="flex border border-zinc-700 rounded overflow-hidden">
                    {["paint", "erase"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            disabled={disabled}
                            className={`px-3 py-1.5 transition-colors disabled:opacity-40 ${tool === t
                                ? "bg-zinc-100 text-zinc-900"
                                : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Brush size */}
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-zinc-500">brush</span>
                    <input
                        type="range"
                        min={MIN_BRUSH}
                        max={MAX_BRUSH}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        disabled={disabled}
                        className="flex-1 accent-zinc-400 disabled:opacity-40"
                    />
                    <span className="text-zinc-400 w-6 text-right">{brushSize}</span>
                </div>

                <span className="text-zinc-700">[ ]</span>

                {/* Clear */}
                <button
                    onClick={clearMask}
                    disabled={disabled || !hasMask}
                    className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                    clear
                </button>
            </div>

            {/* Stage */}
            <div
                className="border border-zinc-700 rounded-lg overflow-hidden"
                style={{ cursor, width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
                <Stage
                    ref={stageRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ background: "#000" }}
                >
                    {/* Layer 1 — image */}
                    <Layer ref={imageLayerRef}>
                        {konvaImage && (
                            <KonvaImage
                                image={konvaImage}
                                width={CANVAS_SIZE}
                                height={CANVAS_SIZE}
                            />
                        )}
                        {!konvaImage && (
                            // Black fill for mask export background
                            <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#000" />
                        )}
                    </Layer>

                    {/* Layer 2 — mask strokes */}
                    <Layer ref={maskLayerRef}>
                        {/* Black fill ensures mask background is solid for export */}
                        <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="transparent" />

                        {lines.map((line, i) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke={line.tool === "paint" ? "rgba(255,60,60,0.55)" : "black"}
                                strokeWidth={line.brushSize}
                                tension={0.4}
                                lineCap="round"
                                lineJoin="round"
                                globalCompositeOperation={
                                    line.tool === "erase" ? "destination-out" : "source-over"
                                }
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>

            {/* Inpaint submit */}
            {imageData && (
                <button
                    onClick={handleInpaintSubmit}
                    disabled={disabled || !hasMask}
                    className="w-full py-2 border border-zinc-600 text-zinc-300 rounded font-mono text-sm hover:border-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {disabled ? "generating..." : "inpaint selection"}
                </button>
            )}

            {!imageData && (
                <p className="text-zinc-700 font-mono text-xs text-center">
                    generate an image first to enable inpainting
                </p>
            )}
        </div>
    );
}
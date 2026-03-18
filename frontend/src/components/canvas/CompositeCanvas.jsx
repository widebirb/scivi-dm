import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import useImage from "use-image";
import InpaintParameters from "../controls/InpaintParameters";

const CANVAS_SIZE = 512;
const MIN_BRUSH = 4;
const MAX_BRUSH = 80;

const INPAINT_DEFAULTS = { denoising_strength: 0.75, mask_blur: 4 };

export default function CompositeCanvas({ imageData, onInpaint, disabled = false }) {
    const stageRef = useRef(null);
    const imageLayerRef = useRef(null);
    const maskLayerRef = useRef(null);

    const [tool, setTool] = useState("paint");
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [hasMask, setHasMask] = useState(false);
    const [inpaintOpen, setInpaintOpen] = useState(false);
    const [inpaintParams, setInpaintParams] = useState(INPAINT_DEFAULTS);

    const [konvaImage] = useImage(imageData || "");


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
        imageLayerRef.current.hide();
        const dataURL = stage.toDataURL({ mimeType: "image/png", pixelRatio: 1 });
        imageLayerRef.current.show();
        return dataURL;
    }, []);

    function handleInpaintSubmit() {
        if (!hasMask) return;
        const maskDataURL = exportMask();
        if (!maskDataURL) return;
        onInpaint?.(imageData, maskDataURL, inpaintParams);
    }

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

                {/* Clear mask */}
                <button
                    onClick={clearMask}
                    disabled={disabled || !hasMask}
                    className="text-xs transition-colors disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.target.style.color = "#f87171"}
                    onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                >
                    clear
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
                    style={{ background: "#000" }}
                >
                    <Layer ref={imageLayerRef}>
                        {konvaImage ? (
                            <KonvaImage image={konvaImage} width={CANVAS_SIZE} height={CANVAS_SIZE} className="composite-image" />
                        ) : (
                            <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#000" />
                        )}
                    </Layer>

                    <Layer ref={maskLayerRef}>
                        <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="transparent" />
                        {lines.map((line, i) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke={line.tool === "paint" ? "rgba(86,37,126,0.6)" : "black"}
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
                <div
                    className="rounded text-xs"
                    style={{ border: "1px solid var(--border-dim)", backgroundColor: "var(--bg-surface)" }}
                >
                    {/* Collapsible header */}
                    <button
                        onClick={() => setInpaintOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-3 py-2 transition-colors"
                        style={{ color: "var(--text-dim)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                    >
                        <span className="uppercase tracking-wider">Inpaint Options</span>
                        <span
                            className="px-1 py-1 rounded text-xs mr-1"
                            style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-dim)" }}
                        >{inpaintOpen ? "close" : "open"}</span>
                    </button>

                    {inpaintOpen && (
                        <div className="px-3 pb-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
                            <div className="pt-3">
                                <InpaintParameters onChange={setInpaintParams} disabled={disabled} />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="px-3 pb-3">
                        <button
                            onClick={handleInpaintSubmit}
                            disabled={disabled || !hasMask}
                            className="w-full py-2 rounded text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                border: "1px solid var(--accent)",
                                color: "var(--accent-text)",
                                backgroundColor: hasMask && !disabled ? "var(--accent-dim)" : "transparent",
                            }}
                        >
                            {disabled ? "generating..." : hasMask ? "inpaint selection" : "draw a mask first"}
                        </button>
                    </div>
                </div>
            )}

            {!imageData && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    generate an image first to enable inpainting
                </p>
            )}
        </div>
    );
}
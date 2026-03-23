import { useState } from "react";
import GenerationMode from "./GenerationMode";
import InpaintingMode from "./InpaintingMode";

export default function PromptBuilder({ isOpen, onClose }) {

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed z-50 flex flex-col rounded-lg shadow-2xl"
                style={{
                    top: "5vh",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(1100px, 95vw)",
                    height: "88vh",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                }}
            >

            </div>
        </>
    );
}
import React from "react";

export default function Splash({ fadingOut }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F2F0E2", zIndex: 9999,
        opacity: fadingOut ? 0 : 1, transition: "opacity 0.4s ease",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <img
        src="/yourbite-logo.png"
        alt="YourBite"
        style={{ width: "60%", maxWidth: 260, animation: "splash-pulse 1.4s ease-in-out infinite" }}
      />
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

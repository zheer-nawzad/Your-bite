import React, { useState } from "react";

// The logo is a small (~60 KB) copy that is preloaded in index.html, and it only
// appears once fully loaded — so it never draws half-finished on refresh.
export default function Splash({ fadingOut }) {
  const [loaded, setLoaded] = useState(false);
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
        src="/logo-splash.png"
        alt="YourBite"
        width="640" height="123"
        decoding="async"
        onLoad={() => setLoaded(true)}
        ref={(el) => { if (el && el.complete && el.naturalWidth && !loaded) setLoaded(true); }}
        style={{
          width: "60%", maxWidth: 260, height: "auto",
          opacity: loaded ? 1 : 0, transition: "opacity 0.25s ease",
          animation: loaded ? "splash-pulse 1.4s ease-in-out infinite" : "none",
        }}
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

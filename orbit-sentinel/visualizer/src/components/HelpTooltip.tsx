import React, { useState } from "react";

export default function HelpTooltip({ text, wide }: { text: string; wide?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span tabIndex={0} role="button" aria-label={text}
        style={{
          width: 14, height: 14, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, cursor: "help",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--text-tertiary)",
          transition: "all 0.15s ease",
          marginLeft: 4, lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.15)"; e.currentTarget.style.color = "var(--accent-blue)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
      >?</span>
      {show && (
        <div style={{
          position: "absolute", left: "50%", bottom: "calc(100% + 6px)", transform: "translateX(-50%)",
          zIndex: 1000, width: wide ? 260 : 180,
          padding: "6px 10px", borderRadius: 6,
          background: "rgba(8,9,13,0.95)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.4,
          textAlign: "left", fontWeight: 400,
          animation: "fadeSlideUp 0.15s ease",
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(255,255,255,0.1)",
          }} />
        </div>
      )}
    </span>
  );
}

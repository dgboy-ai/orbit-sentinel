import React, { useState, useRef, useCallback } from "react";

export default function HelpTooltip({ text, wide }: { text: string; wide?: boolean }) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: "fixed", left: -9999, top: -9999,
  });

  const showWithPos = useCallback(() => {
    setShow(true);
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipW = wide ? 260 : 180;
    const idealLeft = rect.left + rect.width / 2 - tipW / 2;
    const clampedLeft = Math.max(8, Math.min(idealLeft, window.innerWidth - tipW - 8));
    setTooltipStyle({
      position: "fixed",
      left: clampedLeft,
      bottom: window.innerHeight - rect.top + 10,
    });
  }, [wide]);

  const hide = useCallback(() => setShow(false), []);

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={showWithPos}
      onMouseLeave={hide}
      onFocus={showWithPos}
      onBlur={hide}
    >
      <span ref={triggerRef} tabIndex={0} role="button" aria-label={`Help: ${text}`}
        style={{
          width: 14, height: 14, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, cursor: "help",
          background: "var(--overlay-06)", border: "1px solid var(--overlay-10)",
          color: "var(--text-tertiary)",
          transition: "all 0.15s ease",
          marginLeft: 4, lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.15)"; e.currentTarget.style.color = "var(--accent-blue)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-06)"; e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--overlay-10)"; }}
      >?</span>
      {show && (
        <div style={{
          ...tooltipStyle,
          zIndex: 1000, width: wide ? 260 : 180,
          padding: "6px 10px", borderRadius: 6,
          background: "rgba(8,9,13,0.95)", backdropFilter: "blur(12px)",
          border: "1px solid var(--overlay-10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4,
          textAlign: "left", fontWeight: 400,
          animation: "fadeSlideUp 0.15s ease",
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: 16,
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: "5px solid var(--overlay-10)",
          }} />
        </div>
      )}
    </span>
  );
}

import React, { useRef, useCallback } from "react";

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

export default function TiltCard({ children, style, className, maxTilt = 6, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ tiltX: 0, tiltY: 0, mouseX: 0, mouseY: 0, width: 0, height: 0 });

  const updateTransform = useCallback(() => {
    if (!ref.current) return;
    const { tiltX, tiltY } = stateRef.current;
    ref.current.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01,1.01,1.01)`;
    if (glare) {
      const glareX = (tiltY / maxTilt + 1) / 2;
      const glareY = (tiltX / maxTilt + 1) / 2;
      ref.current.style.setProperty("--glare-opacity", "0.15");
      ref.current.style.setProperty("--glare-x", `${glareX * 100}%`);
      ref.current.style.setProperty("--glare-y", `${glareY * 100}%`);
    }
  }, [maxTilt, glare]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    stateRef.current = {
      tiltX: -((y - centerY) / centerY) * maxTilt,
      tiltY: ((x - centerX) / centerX) * maxTilt,
      mouseX: x, mouseY: y, width: rect.width, height: rect.height,
    };
    updateTransform();
  }, [maxTilt, updateTransform]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    stateRef.current = { tiltX: 0, tiltY: 0, mouseX: 0, mouseY: 0, width: 0, height: 0 };
    ref.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (glare) ref.current.style.setProperty("--glare-opacity", "0");
  }, [glare]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.15s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
        position: "relative",
        ...(glare ? {
          "--glare-opacity": "0",
          "--glare-x": "50%",
          "--glare-y": "50%",
          backgroundImage: `radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.06) 0%, transparent 60%)`,
        } as React.CSSProperties : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

import React, { useEffect, useState } from "react";

const COLORS = ["#60a5fa", "#22c55e", "#eab308", "#a78bfa", "#f97316", "#22d3ee", "#f472b6"];

function particleStyle(i: number): React.CSSProperties {
  const color = COLORS[i % COLORS.length];
  const left = 10 + Math.random() * 80;
  const delay = Math.random() * 0.5;
  const dur = 1.5 + Math.random() * 2;
  const size = 4 + Math.random() * 6;
  const shape = i % 3 === 0 ? "50%" : "2px";
  return {
    position: "fixed", top: -10, left: `${left}%`, zIndex: 10000,
    width: size, height: size * (i % 2 === 0 ? 1 : 0.6), borderRadius: shape,
    background: color, pointerEvents: "none",
    animation: `confettiFall ${dur}s ${delay}s ease-in forwards`,
    boxShadow: `0 0 4px ${color}66`,
  };
}

export default function ConfettiCelebration() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => i)
  );
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden="true">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.3); opacity: 0; }
        }
      `}</style>
      {particles.map(i => <div key={i} style={particleStyle(i)} />)}
    </div>
  );
}

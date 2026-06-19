import { useState, useEffect } from "react";

export default function ScanLine() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), 1200);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden", opacity: active ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: "40%",
        background: "linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 40%, transparent 100%)",
        animation: active ? "scanLine 1.2s ease-in-out forwards" : "none",
      }} />
    </div>
  );
}

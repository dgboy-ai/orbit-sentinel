import React, { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; life: number; maxLife: number;
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const MAX = 20;
    particlesRef.current = [];

    function spawnParticle() {
      return {
        x: Math.random() * (canvas?.width ?? 1920),
        y: (canvas?.height ?? 1080) + 20,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -(0.1 + Math.random() * 0.15),
        size: 0.5 + Math.random() * 1,
        alpha: 0.15 + Math.random() * 0.25,
        life: 0, maxLife: 120 + Math.random() * 180,
      };
    }

    for (let i = 0; i < MAX; i++) {
      const p = spawnParticle();
      p.y = Math.random() * (canvas?.height ?? 1080);
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        p.life++;
        const lifeRatio = p.life / p.maxLife;
        const fadeAlpha = p.alpha * (1 - lifeRatio) * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${fadeAlpha})`;
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > (canvas.width + 20)) {
          particles[i] = spawnParticle();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}

import { useState, useEffect, useRef } from "react";

export function useAnimatedValue(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const t0 = performance.now() + delay;
    let raf: number;

    function tick(now: number) {
      if (!mountedRef.current) return;
      const elapsed = now - t0;
      if (elapsed <= 0) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => { mountedRef.current = false; cancelAnimationFrame(raf); };
  }, [target, duration, delay]);

  return value;
}

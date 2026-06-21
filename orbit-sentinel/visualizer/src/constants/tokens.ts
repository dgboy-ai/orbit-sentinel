/* ───────── Design Tokens ───────── */

/* Colors — complements utils/colors.ts (risk colors) */
export const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
  info: "#60a5fa",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  pink: "#f472b6",
  orange: "#fb923c",
  emerald: "#34d399",
  indigo: "#818cf8",
  amber: "#fbbf24",
  white: "#ffffff",
  gray: "#8b8fa3",
  grayLight: "#8b949e",
  nearBlack: "#08090d",
} as const;

/* Z-index scale */
export const Z = {
  base: 1,
  dropdown: 10,
  sticky: 50,
  modal: 100,
  overlay: 200,
  toast: 999,
  tooltip: 1000,
  tour: 9998,
  onboarding: 9999,
  confetti: 10000,
} as const;

/* Animation presets */
export const ANIM = {
  fadeSlideUp: {
    xfast: "fadeSlideUp 0.2s ease",
    fast: "fadeSlideUp 0.3s ease",
    medium: "fadeSlideUp 0.4s ease",
    slow: "fadeSlideUp 0.5s ease",
  },
  fadeSlideDown: {
    fast: "fadeSlideDown 0.2s ease",
    medium: "fadeSlideDown 0.3s ease",
    slow: "fadeSlideDown 0.5s ease",
  },
  float: {
    slow: "float 6s ease-in-out infinite",
    medium: "float 8s ease-in-out infinite",
  },
  pulseGlow: "pulseGlow 4s ease-in-out infinite",
  pulseDot: {
    fast: "pulseDot 0.8s ease-in-out infinite",
    medium: "pulseDot 1s ease-in-out infinite",
    slow: "pulseDot 2s ease-in-out infinite",
  },
  shimmer: "shimmer 1.5s ease-in-out infinite",
  spin: "spin 0.6s linear infinite",
  /* Staggered entrance helpers — use: `${ANIM.fadeSlideUp.med} ${DELAY.stagger * i}s both` */
  delay: {
    fast: "0.05s",
    med: "0.08s",
    normal: "0.12s",
    relaxed: "0.2s",
    slow: "0.35s",
    slowest: "0.5s",
  },
} as const;

/* Font size scale (React inline style accepts number = px) */
export const FONT = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  "2xl": 18,
  "3xl": 19,
  "4xl": 22,
  "5xl": 28,
  "6xl": 30,
  hero: 42,
} as const;

/* Spacing scale (4px grid) */
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

/* Padding shortcuts */
export const PAD = {
  tight: "4px 8px",
  compact: "6px 12px",
  default: "8px 20px",
  loose: "10px 18px",
  wide: "8px 24px",
} as const;

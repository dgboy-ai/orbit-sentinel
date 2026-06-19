const SS_KEY = "orbit-vs";

export function ssRead<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(`${SS_KEY}-${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function ssWrite(key: string, value: unknown) {
  try {
    sessionStorage.setItem(`${SS_KEY}-${key}`, JSON.stringify(value));
  } catch { /* sessionStorage may be blocked */ }
}

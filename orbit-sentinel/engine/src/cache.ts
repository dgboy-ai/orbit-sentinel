const store = new Map<string, { data: unknown; expiresAt: number }>();
const DEFAULT_TTL_MS = 30 * 60 * 1000;

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  if (store.size > 100) {
    const oldest = store.entries().next().value;
    if (oldest) store.delete(oldest[0]);
  }
}

export function cacheClear(): void {
  store.clear();
}

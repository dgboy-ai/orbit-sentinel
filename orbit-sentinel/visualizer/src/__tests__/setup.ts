import "@testing-library/jest-dom/vitest";

// Polyfill IntersectionObserver for jsdom (used by ImpactReport scroll detection)
if (typeof IntersectionObserver === "undefined") {
  class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
}

import { describe, it, expect } from "vitest";
import { SimilarityEngine } from "../src/memory/similarity.js";
import type { MemoryRecord } from "../src/types.js";

describe("SimilarityEngine", () => {
  const engine = new SimilarityEngine();

  const history: MemoryRecord[] = [
    {
      mrIid: 42, mrTitle: "Fix auth bug", mrAuthor: "alice",
      filesChanged: ["src/auth.ts", "src/utils.ts"], labels: ["bug", "auth"],
      outcome: "incident", description: "Fixed JWT validation bug", timestamp: "2025-01-01",
    },
    {
      mrIid: 43, mrTitle: "Add feature flag", mrAuthor: "bob",
      filesChanged: ["src/feature.ts"], labels: ["feature"],
      outcome: "success", description: "Added feature flag system", timestamp: "2025-01-02",
    },
    {
      mrIid: 44, mrTitle: "Fix auth bug v2", mrAuthor: "alice",
      filesChanged: ["src/auth.ts"], labels: ["bug"],
      outcome: "rollback", description: "Second JWT fix attempt", timestamp: "2025-01-03",
    },
  ];

  it("finds similar records by file overlap", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["src/auth.ts", "src/utils.ts"] },
      history,
      5,
    );
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].mrIid).toBe(42);
  });

  it("respects limit parameter", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["src/auth.ts"] },
      history,
      1,
    );
    expect(matches.length).toBe(1);
  });

  it("returns 0 similarity for unrelated files", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["unrelated/file.py"] },
      history,
      5,
    );
    for (const m of matches) {
      expect(m.similarity).toBe(0);
    }
  });

  it("scores by label overlap", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["src/auth.ts"], labels: ["bug", "auth"] },
      history,
      5,
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].similarity).toBeGreaterThan(0);
  });

  it("computes similarity between 0 and 1", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["src/auth.ts", "src/utils.ts"] },
      history,
      5,
    );
    for (const m of matches) {
      expect(m.similarity).toBeGreaterThanOrEqual(0);
      expect(m.similarity).toBeLessThanOrEqual(1);
    }
  });

  it("includes outcome in match result", () => {
    const matches = engine.findSimilarByContent(
      { filesChanged: ["src/feature.ts"] },
      history,
      5,
    );
    expect(matches[0].outcome).toBe("success");
  });
});

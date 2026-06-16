import type { MemoryRecord, HistoricalMatch } from "../types.js";

interface ChangeEvent {
  filesChanged: string[];
  labels?: string[];
  description?: string;
}

export class SimilarityEngine {
  findSimilarByContent(
    currentChange: ChangeEvent,
    history: MemoryRecord[],
    limit = 5,
  ): HistoricalMatch[] {
    const scored: Array<{ match: HistoricalMatch; score: number }> = [];

    for (const record of history) {
      let score = 0;

      const fileOverlap = this.jaccardSimilarity(
        new Set(currentChange.filesChanged.map((f) => f.toLowerCase())),
        new Set(record.filesChanged.map((f) => f.toLowerCase())),
      );
      score += fileOverlap * 0.5;

      if (currentChange.labels && record.labels.length > 0) {
        const labelOverlap = this.jaccardSimilarity(
          new Set(currentChange.labels.map((l) => l.toLowerCase())),
          new Set(record.labels.map((l) => l.toLowerCase())),
        );
        score += labelOverlap * 0.2;
      }

      if (currentChange.description && record.description) {
        const descOverlap = this.textSimilarity(
          currentChange.description,
          record.description,
        );
        score += descOverlap * 0.3;
      }

      scored.push({
        match: {
          mrIid: record.mrIid,
          mrTitle: record.mrTitle,
          similarity: Math.round(score * 100) / 100,
          outcome: record.outcome,
          timestamp: record.timestamp,
        },
        score,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.match);
  }

  private jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;
    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
  }

  private textSimilarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const bWords = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    return this.jaccardSimilarity(aWords, bWords);
  }
}

export const similarityEngine = new SimilarityEngine();

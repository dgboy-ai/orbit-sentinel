import { queryEngine } from "../orbit/queries.js";
import type { MemoryRecord, HistoricalMatch } from "../types.js";

export class MemoryStore {
  async findHistoricalMatches(
    projectPath: string,
    changedFiles: string[],
    limit = 10,
  ): Promise<HistoricalMatch[]> {
    const matches: HistoricalMatch[] = [];

    for (const filePath of changedFiles) {
      const result = await queryEngine.findHistoricalMRs(projectPath, filePath);
      if (result.result.rows) {
        for (const row of result.result.rows as Array<Record<string, unknown>>) {
          const mr = row["mr"] as { properties: Record<string, unknown> } | undefined;
          if (mr?.properties) {
            matches.push({
              mrIid: (mr.properties["iid"] as number) ?? 0,
              mrTitle: (mr.properties["title"] as string) ?? "",
              similarity: this.computeSimilarity(filePath, mr.properties),
              outcome: this.inferOutcome(mr.properties),
              timestamp: (mr.properties["created_at"] as string) ?? "",
            });
          }
        }
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);
    return matches.slice(0, limit);
  }

  async findRecordsByFile(filePath: string): Promise<MemoryRecord[]> {
    const records: MemoryRecord[] = [];

    const historicalResult = await queryEngine.findHistoricalMRs("", filePath);
    if (historicalResult.result.rows) {
      for (const row of historicalResult.result.rows as Array<Record<string, unknown>>) {
        const mr = row["mr"] as { properties: Record<string, unknown> } | undefined;
        const project = row["p"] as { properties: Record<string, unknown> } | undefined;

        if (mr?.properties) {
          records.push({
            mrIid: (mr.properties["iid"] as number) ?? 0,
            mrTitle: (mr.properties["title"] as string) ?? "",
            mrAuthor: (mr.properties["author"] as string) ?? "unknown",
            filesChanged: [filePath],
            labels: ((mr.properties["labels"] as string[]) ?? []).map(String),
            outcome: this.inferOutcome(mr.properties),
            description: (mr.properties["description"] as string) ?? "",
            timestamp: (mr.properties["created_at"] as string) ?? "",
          });
        }
      }
    }

    return records;
  }

  async findSimilarChanges(definitionFqn: string): Promise<HistoricalMatch[]> {
    const matches: HistoricalMatch[] = [];

    const result = await queryEngine.findSimilarChanges(definitionFqn);
    if (result.result.rows) {
      for (const row of result.result.rows as Array<Record<string, unknown>>) {
        const mr = row["mr"] as { properties: Record<string, unknown> } | undefined;
        if (mr?.properties) {
          matches.push({
            mrIid: (mr.properties["iid"] as number) ?? 0,
            mrTitle: (mr.properties["title"] as string) ?? "",
            similarity: 0.7,
            outcome: (mr.properties["state"] as string) === "merged" ? "success" : "unknown",
            timestamp: (mr.properties["created_at"] as string) ?? "",
          });
        }
      }
    }

    return matches;
  }

  async findIncidentsByFile(filePath: string): Promise<MemoryRecord[]> {
    const records: MemoryRecord[] = [];

    const result = await queryEngine.findIncidentsConnectedToFile(filePath);
    if (result.result.rows) {
      for (const row of result.result.rows as Array<Record<string, unknown>>) {
        const inc = row["inc"] as { properties: Record<string, unknown> } | undefined;
        if (inc?.properties) {
          records.push({
            mrIid: 0,
            mrTitle: (inc.properties["title"] as string) ?? "",
            mrAuthor: "",
            filesChanged: [filePath],
            labels: ["incident"],
            outcome: "incident",
            incidentId: (inc.properties["iid"] as number) ?? undefined,
            description: (inc.properties["title"] as string) ?? "",
            timestamp: (inc.properties["created_at"] as string) ?? "",
          });
        }
      }
    }

    return records;
  }

  private computeSimilarity(
    filePath: string,
    properties: Record<string, unknown>,
  ): number {
    let score = 0.5;
    const title = (properties["title"] as string) ?? "";
    const description = (properties["description"] as string) ?? "";
    const fileName = filePath.split("/").pop() ?? "";

    if (title.toLowerCase().includes(fileName.toLowerCase())) {
      score += 0.2;
    }
    if (description.toLowerCase().includes(fileName.toLowerCase())) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private inferOutcome(properties: Record<string, unknown>): MemoryRecord["outcome"] {
    const state = (properties["state"] as string) ?? "";
    const labels = (properties["labels"] as string[]) ?? [];
    const title = (properties["title"] as string) ?? "";

    if (labels.some((l) => l.toLowerCase().includes("rollback") || l.toLowerCase().includes("revert"))) {
      return "rollback";
    }
    if (labels.some((l) => l.toLowerCase().includes("incident") || l.toLowerCase().includes("bug"))) {
      return "incident";
    }
    if (state === "merged") {
      return "success";
    }
    return "fix_required";
  }
}

export const memoryStore = new MemoryStore();

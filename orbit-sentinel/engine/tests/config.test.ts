import { describe, it, expect } from "vitest";
import { getConfig } from "../src/config.js";

describe("getConfig", () => {
  it("returns default config when no env vars set", () => {
    const config = getConfig();
    expect(config.gitlabHost).toBe("gitlab.com");
    expect(config.orbitApiEndpoint).toBe("https://gitlab.com/api/v4/orbit");
    expect(config.orbitTokenEnvVar).toBe("GITLAB_ACCESS_TOKEN");
    expect(config.maxTraversalDepth).toBe(5);
    expect(config.maxHistoricalMatches).toBe(10);
  });

  it("has valid risk thresholds", () => {
    const config = getConfig();
    expect(config.riskThresholds.low).toBeLessThan(config.riskThresholds.medium);
    expect(config.riskThresholds.medium).toBeLessThan(config.riskThresholds.high);
    expect(config.riskThresholds.low).toBeGreaterThan(0);
    expect(config.riskThresholds.high).toBeLessThanOrEqual(1);
  });

  it("has valid simulation defaults", () => {
    const config = getConfig();
    expect(config.simulationDefaults.maxPathDepth).toBeGreaterThan(0);
    expect(config.simulationDefaults.neighborMaxDepth).toBeGreaterThan(0);
  });
});

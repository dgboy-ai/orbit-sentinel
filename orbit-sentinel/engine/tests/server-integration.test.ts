import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

describe("Server API integration", () => {
  let app: any;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.DEMO_MODE = "true";
    const mod = await import("../src/server.js");
    app = mod.app;
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeTruthy();
  });

  it("POST /api/analyze rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing");
  });

  it("POST /api/analyze rejects partial fields", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ projectPath: "test/project" });
    expect(res.status).toBe(400);
  });

  it("POST /api/analyze uses fallback when no Orbit token available", { timeout: 15000 }, async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({
        projectId: 83381762,
        projectPath: "gitlab-ai-hackathon/transcend/39251857",
        mrIid: 10,
        mrTitle: "MR !10: test-sentinel-analysis",
        changedFiles: ["src/main.ts"],
        changeDescription: "Test analysis",
      });
    // Without GITLAB_ACCESS_TOKEN, the engine falls back to file-based analysis
    // Returns 200 with fallback flag and empty digital twin
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report.fallback).toBe(true);
    expect(res.body.demoMode).toBe(true);
  });

  it("POST /api/analyze-with-creds rejects without token", async () => {
    const res = await request(app)
      .post("/api/analyze-with-creds")
      .send({
        projectPath: "gitlab-ai-hackathon/transcend/39251857",
        mrIid: 10,
        mrTitle: "test",
        changedFiles: ["src/main.ts"],
        changeDescription: "test",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("token");
  });

  it("POST /api/probe-mr-files rejects without projectPath", async () => {
    const res = await request(app)
      .post("/api/probe-mr-files")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("required");
  });

  it("POST /api/raw-orbit rejects without query", async () => {
    const res = await request(app)
      .post("/api/raw-orbit")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("query");
  });

  it("GET /api/demo returns valid visualization data", async () => {
    const res = await request(app).get("/api/demo");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report).toBeTruthy();
    expect(res.body.report.graph).toBeTruthy();
    expect(Array.isArray(res.body.report.graph.nodes)).toBe(true);
    expect(res.body.report.graph.nodes.length).toBeGreaterThan(0);
    expect(res.body.report.riskData).toBeTruthy();
    expect(res.body.demoMode).toBe(true);
  });

  it("reports 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLOW_PATH = path.resolve(__dirname, "../../flow/orbit-sentinel-flow.yaml");

describe("Duo flow YAML", () => {
  let flowContent: string;
  let flow: Record<string, unknown>;

  it("file exists", () => {
    expect(fs.existsSync(FLOW_PATH)).toBe(true);
  });

  it("parses as valid YAML", async () => {
    flowContent = fs.readFileSync(FLOW_PATH, "utf-8");
    const { default: yaml } = await import("js-yaml");
    flow = yaml.load(flowContent) as Record<string, unknown>;
    expect(flow).toBeTruthy();
    expect(typeof flow).toBe("object");
  });

  it("has version field", () => {
    expect(flow.version).toBe("v1");
  });

  it("has components section", () => {
    const components = flow.components as Array<Record<string, unknown>>;
    expect(Array.isArray(components)).toBe(true);
    expect(components.length).toBeGreaterThan(0);
    expect(components[0].name).toBe("orbit_sentinel");
    expect(components[0].type).toBe("AgentComponent");
  });

  it("has toolset with all 3 required tools", () => {
    const components = flow.components as Array<Record<string, unknown>>;
    const toolset = components[0].toolset as string[];
    expect(toolset).toContain("get_graph_schema");
    expect(toolset).toContain("query_graph");
    expect(toolset).toContain("create_merge_request_note");
    expect(toolset.length).toBe(3);
  });

  it("has prompts section with sentinel_prompt", () => {
    const prompts = flow.prompts as Array<Record<string, unknown>>;
    expect(Array.isArray(prompts)).toBe(true);
    const prompt = prompts.find((p: Record<string, unknown>) => p.prompt_id === "sentinel_prompt");
    expect(prompt).toBeTruthy();
    expect(prompt.name).toBe("Orbit Sentinel Prompt");
  });

  it("prompt template contains all 8 steps", () => {
    const prompts = flow.prompts as Array<Record<string, unknown>>;
    const prompt = prompts.find((p: Record<string, unknown>) => p.prompt_id === "sentinel_prompt");
    const template = prompt.prompt_template as { system: string };
    const system = template.system;
    const stepNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const n of stepNumbers) {
      expect(system).toContain(`${n}.`);
    }
    expect(system).toContain("get_graph_schema");
    expect(system).toContain("query_graph");
    expect(system).toContain("create_merge_request_note");
    expect(system).toContain("neighbors");
    expect(system).toContain("path_finding");
    expect(system).toContain("traversal");
    expect(system).toContain("aggregation");
  });

  it("has flow section with entry_point", () => {
    const flowSection = flow.flow as Record<string, unknown>;
    expect(flowSection).toBeTruthy();
    expect(flowSection.entry_point).toBe("orbit_sentinel");
  });

  it("has routers section", () => {
    const routers = flow.routers as Array<Record<string, unknown>>;
    expect(Array.isArray(routers)).toBe(true);
    expect(routers[0].from).toBe("orbit_sentinel");
    expect(routers[0].to).toBe("end");
  });

  it("prompt uses all 4 Orbit query types", () => {
    const prompts = flow.prompts as Array<Record<string, unknown>>;
    const prompt = prompts.find((p: Record<string, unknown>) => p.prompt_id === "sentinel_prompt");
    const template = prompt.prompt_template as { system: string };
    const system = template.system;
    expect(system).toContain("query_type\":\"neighbors");
    expect(system).toContain("query_type\":\"path_finding");
    expect(system).toContain("query_type\":\"traversal");
    expect(system).toContain("query_type\":\"aggregation");
  });

  it("has inputs section with required context", () => {
    const components = flow.components as Array<Record<string, unknown>>;
    const inputs = components[0].inputs as string[];
    expect(inputs).toContain("context:goal");
    expect(inputs).toContain("context:mr_iid");
    expect(inputs).toContain("context:changed_files");
  });
});

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = path.resolve(__dirname, "../../.gitlab/duo/skill.yml");
const MCP_PATH = path.resolve(__dirname, "../../.gitlab/duo/mcp.json");

describe("Duo Agent configuration files", () => {
  it("skill.yml exists and has valid structure", async () => {
    expect(fs.existsSync(SKILL_PATH)).toBe(true);
    const content = fs.readFileSync(SKILL_PATH, "utf-8");
    const { default: yaml } = await import("js-yaml");
    const skill = yaml.load(content) as Record<string, any>;
    
    expect(skill).toBeTruthy();
    expect(skill.category).toBe("code_review");
    expect(Array.isArray(skill.capabilities)).toBe(true);
    expect(skill.capabilities.length).toBeGreaterThan(0);
  });

  it("mcp.json exists and contains correct JSON structure", () => {
    expect(fs.existsSync(MCP_PATH)).toBe(true);
    const content = fs.readFileSync(MCP_PATH, "utf-8");
    const mcp = JSON.parse(content);
    
    expect(mcp).toBeTruthy();
    expect(mcp.mcp_servers || mcp.mcpServers || mcp.name || mcp.url || mcp.id || mcp.mcpId).toBeDefined();
  });
});

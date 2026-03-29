import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const run = (args: string) =>
  execSync(`bun ${path.join(SRC, "run_formatted.js")} ${args}`, {
    cwd: ROOT,
    timeout: 15000,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  }).trim();

const runOriginal = (args: string) =>
  execSync(`bun ${path.join(SRC, "run.js")} ${args}`, {
    cwd: ROOT,
    timeout: 15000,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  }).trim();

const runSplit = (args: string) =>
  execSync(`bun ${path.join(SRC, "run_split.js")} ${args}`, {
    cwd: ROOT,
    timeout: 15000,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  }).trim();

describe("formatted bundle", () => {
  it("should print the correct version", () => {
    expect(run("--version")).toBe("2.1.87 (Claude Code)");
  });

  it("should match the original version output", () => {
    expect(run("--version")).toBe(runOriginal("--version"));
  });

  it("should show help", () => {
    const help = run("--help");
    expect(help).toContain("Usage: claude");
    expect(help).toContain("--model");
    expect(help).toContain("--print");
  });

  it("should match original help output", () => {
    expect(run("--help")).toBe(runOriginal("--help"));
  });

  it("should list agents", () => {
    const agents = run("agents");
    expect(agents).toContain("active agents");
    expect(agents).toContain("general-purpose");
    expect(agents).toContain("Explore");
  });

  it("should match original agents output", () => {
    expect(run("agents")).toBe(runOriginal("agents"));
  });
});

describe("split bundle", () => {
  it("should print the correct version", () => {
    expect(runSplit("--version")).toBe("2.1.87 (Claude Code)");
  });

  it("should match the original version output", () => {
    expect(runSplit("--version")).toBe(runOriginal("--version"));
  });

  it("should show help", () => {
    const help = runSplit("--help");
    expect(help).toContain("Usage: claude");
    expect(help).toContain("--model");
    expect(help).toContain("--print");
  });

  it("should match original help output", () => {
    expect(runSplit("--help")).toBe(runOriginal("--help"));
  });

  it("should list agents", () => {
    const agents = runSplit("agents");
    expect(agents).toContain("active agents");
    expect(agents).toContain("general-purpose");
    expect(agents).toContain("Explore");
  });

  it("should match original agents output", () => {
    expect(runSplit("agents")).toBe(runOriginal("agents"));
  });
});

describe("formatted bundle file integrity", () => {
  it("should exist and be non-empty", () => {
    const stat = fs.statSync(path.join(SRC, "cli_formatted.js"));
    expect(stat.size).toBeGreaterThan(10_000_000); // > 10 MB
  });

  it("should have more lines than the minified version", () => {
    const formatted = fs.readFileSync(path.join(SRC, "cli_formatted.js"), "utf8");
    const patched = fs.readFileSync(path.join(SRC, "cli_patched.js"), "utf8");
    const formattedLines = formatted.split("\n").length;
    const patchedLines = patched.split("\n").length;
    expect(formattedLines).toBeGreaterThan(patchedLines * 10);
  });

  it("should still contain all tool definitions", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_formatted.js"), "utf8");
    for (const tool of ["Read", "Bash", "Edit", "Write", "Glob", "Grep", "Agent", "WebFetch", "WebSearch"]) {
      expect(content).toContain(`"${tool}"`);
    }
  });

  it("should still contain all native module requires", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_formatted.js"), "utf8");
    for (const mod of ["image-processor.node", "audio-capture.node", "computer-use-input.node", "computer-use-swift.node"]) {
      expect(content).toContain(mod);
    }
  });

  it("should contain the build metadata", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_formatted.js"), "utf8");
    expect(content).toContain("VERSION");
    expect(content).toContain("2.1.87");
    expect(content).toContain("@anthropic-ai/claude-code");
  });
});

describe("split bundle file integrity", () => {
  it("cli_split.js should exist and be smaller than cli_formatted.js", () => {
    const splitStat = fs.statSync(path.join(SRC, "cli_split.js"));
    const formattedStat = fs.statSync(path.join(SRC, "cli_formatted.js"));
    expect(splitStat.size).toBeGreaterThan(1_000_000); // > 1 MB
    expect(splitStat.size).toBeLessThan(formattedStat.size);
  });

  it("should have extracted vendor files", () => {
    const vendorDir = path.join(SRC, "vendor");
    expect(fs.existsSync(vendorDir)).toBe(true);
    const categories = fs.readdirSync(vendorDir);
    expect(categories.length).toBeGreaterThanOrEqual(5);
    expect(categories).toContain("hljs");
    expect(categories).toContain("proto");
    expect(categories).toContain("react");
  });

  it("cli_split.js should contain eval() references to extracted files", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_split.js"), "utf8");
    expect(content).toContain('eval(require("fs").readFileSync');
    expect(content).toContain("vendor/proto/");
    expect(content).toContain("vendor/hljs/");
    expect(content).toContain("vendor/react/");
  });

  it("should still contain all tool definitions in the split bundle", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_split.js"), "utf8");
    for (const tool of ["Read", "Bash", "Edit", "Write", "Glob", "Grep", "Agent", "WebFetch", "WebSearch"]) {
      expect(content).toContain(`"${tool}"`);
    }
  });

  it("should have extracted G() section bodies", () => {
    const sectionsDir = path.join(SRC, "sections");
    expect(fs.existsSync(sectionsDir)).toBe(true);
    const files = fs.readdirSync(sectionsDir);
    expect(files.length).toBeGreaterThanOrEqual(50);
  });

  it("cli_split.js should contain eval() references to sections", () => {
    const content = fs.readFileSync(path.join(SRC, "cli_split.js"), "utf8");
    expect(content).toContain("sections/");
  });
});

describe("zone markers", () => {
  const content = fs.readFileSync(path.join(SRC, "cli_split.js"), "utf8");
  const lines = content.split("\n");

  const zoneNames = [
    "ZONE 1: RUNTIME & SDK",
    "ZONE 2: VALIDATION & CONFIG",
    "ZONE 3: CLOUD PROVIDERS & AUTH",
    "ZONE 4: UI FRAMEWORK & RENDERING",
    "ZONE 5: TOOLS & PERMISSIONS",
    "ZONE 6: CONVERSATION & COMMANDS",
    "ZONE 7: SYSTEM PROMPT, SESSION & APP",
    "ZONE 8: REPL, SKILLS & CLI ENTRY",
  ];

  it("should contain all 8 zone markers", () => {
    for (const zone of zoneNames) {
      expect(content).toContain(zone);
    }
  });

  it("zone markers should appear in order", () => {
    const positions = zoneNames.map(z => content.indexOf(z));
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});

describe("zone-map.json", () => {
  it("should exist and be valid JSON", () => {
    const mapPath = path.join(SRC, "zone-map.json");
    expect(fs.existsSync(mapPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    expect(data).toBeDefined();
    expect(data.zones).toBeDefined();
  });

  it("should contain 8 zones", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "zone-map.json"), "utf8"));
    expect(data.zones.length).toBe(8);
  });

  it("zones should cover all lines without gaps", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "zone-map.json"), "utf8"));
    for (let i = 1; i < data.zones.length; i++) {
      expect(data.zones[i].startLine).toBe(data.zones[i - 1].endLine + 1);
    }
    expect(data.zones[data.zones.length - 1].endLine).toBe(data.totalLines);
  });

  it("each zone should have exports, functions, or classes", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "zone-map.json"), "utf8"));
    for (const z of data.zones) {
      const total = z.exports.length + z.functions.length + z.asyncFunctions.length + z.classes.length;
      expect(total).toBeGreaterThan(0);
    }
  });
});

describe("name-map.json", () => {
  it("should exist and be valid JSON", () => {
    const mapPath = path.join(SRC, "name-map.json");
    expect(fs.existsSync(mapPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    expect(data).toBeDefined();
  });

  it("should have at least 2500 named symbols", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "name-map.json"), "utf8"));
    expect(Object.keys(data).length).toBeGreaterThanOrEqual(5000);
  });

  it("should contain key Claude Code symbols", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "name-map.json"), "utf8"));
    const values = Object.values(data).flat();
    expect(values).toContain("REPL");
    expect(values).toContain("authLogin");
    expect(values).toContain("main");
    expect(values).toContain("scanForSecrets");
  });

  it("should contain G() block labels", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "name-map.json"), "utf8"));
    const initLabels = Object.values(data).filter(v => typeof v === "string" && v.startsWith("init("));
    expect(initLabels.length).toBeGreaterThanOrEqual(500);
  });

  it("should have auto-labels covering all G() blocks", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "name-map.json"), "utf8"));
    const gLabels = Object.values(data).filter(v =>
      typeof v === "string" && (
        v.startsWith("init(") || v.startsWith("deps(") || v.startsWith("block(") ||
        v.startsWith("refs(") || v.startsWith("telemetry(") || v.startsWith("component(")
      )
    );
    expect(gLabels.length).toBeGreaterThanOrEqual(3000);
  });
});

describe("dep-graph.json", () => {
  it("should exist and be valid JSON", () => {
    const mapPath = path.join(SRC, "dep-graph.json");
    expect(fs.existsSync(mapPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    expect(data).toBeDefined();
    expect(data.nodes).toBeDefined();
  });

  it("should have 3000+ nodes and 10000+ edges", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "dep-graph.json"), "utf8"));
    expect(data.totalNodes).toBeGreaterThanOrEqual(3000);
    expect(data.totalEdges).toBeGreaterThanOrEqual(10000);
  });

  it("should have zone summary for all 8 zones", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "dep-graph.json"), "utf8"));
    expect(Object.keys(data.zoneSummary).length).toBe(8);
  });

  it("should have cross-zone edges", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "dep-graph.json"), "utf8"));
    expect(data.crossZoneEdges.length).toBeGreaterThan(0);
  });
});

describe("react-components.json", () => {
  it("should exist and be valid JSON", () => {
    const mapPath = path.join(SRC, "react-components.json");
    expect(fs.existsSync(mapPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    expect(data).toBeDefined();
    expect(data.components).toBeDefined();
  });

  it("should have 500+ React components", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "react-components.json"), "utf8"));
    expect(data.totalComponents).toBeGreaterThanOrEqual(500);
  });

  it("should contain known UI components", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "react-components.json"), "utf8"));
    const names = data.components.map((c: any) => c.readableName).filter(Boolean);
    expect(names).toContain("App");
    expect(names).toContain("DiffDialog");
    expect(names).toContain("Doctor");
  });

  it("should have component() labels in name-map", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "name-map.json"), "utf8"));
    const compLabels = Object.values(data).filter(v => typeof v === "string" && v.startsWith("component("));
    expect(compLabels.length).toBeGreaterThanOrEqual(300);
  });

  it("should have labeled at least 70% of React components", () => {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, "react-components.json"), "utf8"));
    expect(data.labeledComponents / data.totalComponents).toBeGreaterThanOrEqual(0.70);
  });
});

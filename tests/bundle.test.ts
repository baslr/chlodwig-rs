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

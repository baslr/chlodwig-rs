#!/usr/bin/env bun
/**
 * Auto-labels unlabeled G() blocks in name-map.json using multiple heuristics.
 *
 * Heuristics (in priority order):
 *   H1: Section file has descriptive prefix from rename-modules.js
 *   H2: J_() export block follows directly after G() block → label from exports
 *   H3: Section file content analysis (telemetry events, keywords, strings)
 *   H4: Inline block content analysis (keywords, name-map refs)
 *   H5: Dependency label propagation (deps labeled → derive label)
 *   H6: Zone-based fallback for trivial blocks
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const DEP_GRAPH = path.join(ROOT, "src", "dep-graph.json");
const ZONE_MAP = path.join(ROOT, "src", "zone-map.json");

const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");
const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
const depGraph = JSON.parse(fs.readFileSync(DEP_GRAPH, "utf8"));
const zoneMap = JSON.parse(fs.readFileSync(ZONE_MAP, "utf8"));

// --- Parse all G() blocks ---
const gBlockRe = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/;
const gBlocks = new Map(); // name → { startLine, endLine, zone, body }

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(gBlockRe);
  if (!m) continue;

  const indent = m[1];
  const name = m[2];
  const closePattern = `${indent}});`;

  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === closePattern) {
      // Get body text (inline or section file)
      let body = "";
      const bodyLines = lines.slice(i + 1, j);

      // Check if it's an eval stub
      const evalMatch = bodyLines[0]?.match(/sections\/([^"]+)\.js/);
      if (evalMatch) {
        const sectionFile = path.join(SECTIONS, `${evalMatch[1]}.js`);
        if (fs.existsSync(sectionFile)) {
          body = fs.readFileSync(sectionFile, "utf8");
        }
      } else {
        body = bodyLines.join("\n");
      }

      gBlocks.set(name, {
        startLine: i + 1,
        endLine: j + 1,
        lineCount: j - i - 1,
        body,
        sectionFile: evalMatch ? evalMatch[1] : null,
        zone: getZone(i + 1),
      });
      i = j;
      break;
    }
  }
}

function getZone(lineNum) {
  for (const z of zoneMap.zones) {
    if (lineNum >= z.startLine && lineNum <= z.endLine) return z.zone;
  }
  return 0;
}

const zoneNames = {
  1: "runtime",
  2: "validation",
  3: "cloud-providers",
  4: "ui-framework",
  5: "tools",
  6: "conversation",
  7: "session-app",
  8: "repl-cli",
};

console.log(`Loaded ${gBlocks.size} G() blocks, ${Object.keys(nameMap).length} name-map entries\n`);

// Count already labeled
let alreadyLabeled = 0;
for (const name of gBlocks.keys()) {
  if (nameMap[name]) alreadyLabeled++;
}
console.log(`Already labeled: ${alreadyLabeled} / ${gBlocks.size} (${(alreadyLabeled / gBlocks.size * 100).toFixed(1)}%)\n`);

// --- Heuristic stats ---
const stats = {};
function recordLabel(name, label, heuristic) {
  if (nameMap[name]) return false; // Already labeled
  nameMap[name] = label;
  if (!stats[heuristic]) stats[heuristic] = 0;
  stats[heuristic]++;
  return true;
}

// ===================================================================
// H1: Section file descriptive prefix (from rename-modules.js)
// ===================================================================
// Files like "tool-use--ao6.js", "bedrock-runtime.js" already have names
console.log("H1: Section file descriptive prefixes...");

for (const [name, info] of gBlocks) {
  if (nameMap[name]) continue;
  if (!info.sectionFile) continue;

  // Get the actual filename on disk (may have been renamed)
  const sectionRef = info.sectionFile;

  // Check if the filename contains a descriptive prefix (has a hyphen)
  if (sectionRef.includes("-")) {
    // Extract the prefix (before -- if present, otherwise the whole name)
    let prefix = sectionRef;
    if (prefix.includes("--")) {
      prefix = prefix.split("--")[0];
    }
    // Remove _ci suffix
    prefix = prefix.replace(/_ci$/, "");
    recordLabel(name, `init(${prefix})`, "H1");
  }
}

// ===================================================================
// H2: J_() export block following G() block
// ===================================================================
// Pattern: var X = G(() => {...}); var MOD = {}; J_(MOD, { readable: () => hash })
// The J_() block gives us export names → label from most descriptive export
console.log("H2: J_() export proximity...");

const j_Re = /^\s*J_\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\{/;
const exportRe = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\(\)\s*=>\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

// Build a map: J_() module → line, exports
const j_Blocks = new Map();
for (let i = 0; i < lines.length; i++) {
  const jm = lines[i].match(j_Re);
  if (!jm) continue;

  const modName = jm[1];
  // Collect the full J_() block
  let block = "";
  let depth = 0;
  for (let j = i; j < lines.length && j < i + 200; j++) {
    block += lines[j] + "\n";
    for (const ch of lines[j]) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
    }
    if (depth <= 0) break;
  }

  const exports = [];
  let em;
  while ((em = exportRe.exec(block)) !== null) {
    exports.push({ name: em[1], target: em[2] });
  }

  if (exports.length > 0) {
    j_Blocks.set(i, { modName, exports, line: i + 1 });
  }
}

// For each G() block, look for J_() within 5 lines after its end
for (const [name, info] of gBlocks) {
  if (nameMap[name]) continue;

  // Find the closest J_() block after this G() block's end
  for (const [jLine, jInfo] of j_Blocks) {
    if (jLine >= info.endLine - 1 && jLine <= info.endLine + 10) {
      // Found a J_() block near the end of this G() block
      const exportNames = jInfo.exports
        .map(e => e.name)
        .filter(n => n !== "default" && n !== "__esModule" && n.length > 3);

      if (exportNames.length > 0) {
        // Pick the most descriptive export name
        exportNames.sort((a, b) => b.length - a.length);
        // Use camelCase → kebab for the label
        const label = camelToKebab(exportNames[0]);
        recordLabel(name, `init(${label})`, "H2");
      }
      break;
    }
  }
}

// ===================================================================
// H3: Content analysis — telemetry events, string patterns, keywords
// ===================================================================
console.log("H3: Content analysis (telemetry, strings, keywords)...");

function analyzeContent(code) {
  const labels = [];

  // Telemetry events: tengu_*
  const tenguMatches = code.match(/tengu_[a-z_]+/g);
  if (tenguMatches) {
    // Extract the most specific telemetry prefix
    const prefixes = tenguMatches.map(t => {
      const parts = t.replace("tengu_", "").split("_");
      return parts.slice(0, 2).join("-");
    });
    const counts = {};
    for (const p of prefixes) counts[p] = (counts[p] || 0) + 1;
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (best) labels.push({ label: `telemetry(${best[0]})`, priority: 10 });
  }

  // Error class patterns
  const errorClasses = code.match(/class\s+\w+\s+extends\s+(?:Error|[A-Z]\w*Error)/g);
  if (errorClasses) {
    // Try to find the readable name
    const className = errorClasses[0].match(/class\s+(\w+)/)?.[1];
    if (className && nameMap[className]) {
      const readable = Array.isArray(nameMap[className]) ? nameMap[className][0] : nameMap[className];
      labels.push({ label: `init(${camelToKebab(readable)})`, priority: 9 });
    }
  }

  // Tool definitions
  const toolMatch = code.match(/name:\s*"((?:File|Bash|Glob|Grep|Agent|Web|Notebook|Skill|Advisor|Computer|Cron)\w*)"/);
  if (toolMatch) labels.push({ label: `init(${camelToKebab(toolMatch[1])})`, priority: 9 });

  // Slash command definitions
  if (code.includes("SlashCommand") || code.match(/command:\s*"\/\w+"/))
    labels.push({ label: "init(slash-command)", priority: 7 });

  // MCP patterns
  if (code.includes("McpServer") || code.includes("mcp_server") || code.match(/mcp[_.](?:client|server)/i))
    labels.push({ label: "init(mcp)", priority: 7 });

  // Permission patterns
  if (code.includes("PermissionRequest") || code.includes("permissionMode") || code.includes("askPermission"))
    labels.push({ label: "init(permissions)", priority: 7 });

  // OAuth/Auth patterns
  if (code.includes("oauth") || code.includes("OAuth") || code.includes("accessToken") || code.includes("refreshToken"))
    labels.push({ label: "init(auth)", priority: 6 });

  // React component patterns
  const jsxCount = (code.match(/createElement/g) || []).length;
  if (jsxCount >= 3) labels.push({ label: "init(react-component)", priority: 5 });

  // Git patterns
  if (code.includes("gitExe") || code.includes("git ") || code.includes("parseGitRemote"))
    labels.push({ label: "init(git)", priority: 6 });

  // Compaction
  if (code.includes("compact") || code.includes("Compact") || code.includes("summaryMessages"))
    labels.push({ label: "init(compaction)", priority: 7 });

  // Bridge/CCR
  if (code.includes("bridge") || code.includes("Bridge") || code.includes("CCR") || code.includes("ccr"))
    labels.push({ label: "init(bridge)", priority: 7 });

  // Voice
  if (code.includes("voice") || code.includes("Voice") || code.includes("microphone"))
    labels.push({ label: "init(voice)", priority: 7 });

  // Sandbox
  if (code.includes("sandbox") || code.includes("Sandbox") || code.includes("seatbelt"))
    labels.push({ label: "init(sandbox)", priority: 7 });

  // Diff/patch
  if (code.includes("applyDiff") || code.includes("diffLines") || code.includes("patchFile"))
    labels.push({ label: "init(diff)", priority: 7 });

  // Onboarding
  if (code.includes("onboarding") || code.includes("Onboarding") || code.includes("firstRun"))
    labels.push({ label: "init(onboarding)", priority: 7 });

  // Session
  if (code.includes("sessionId") || code.includes("SessionManager") || code.includes("switchSession"))
    labels.push({ label: "init(session)", priority: 6 });

  // Streaming/SSE
  if (code.includes("StreamEvent") || code.includes("eventStream") || code.includes("ServerSentEvent"))
    labels.push({ label: "init(streaming)", priority: 6 });

  // Bedrock
  if (code.includes("Bedrock") || code.includes("bedrock") || code.includes("BedrockRuntime"))
    labels.push({ label: "init(bedrock)", priority: 7 });

  // Vertex
  if (code.includes("Vertex") || code.includes("vertex") || code.includes("googleapis"))
    labels.push({ label: "init(vertex)", priority: 7 });

  // MSAL/Azure
  if (code.includes("MSAL") || code.includes("msal") || code.includes("AzureCloud"))
    labels.push({ label: "init(azure-auth)", priority: 7 });

  // AWS
  if (code.includes("AWS_") || code.includes("AwsRegion") || code.includes("SignatureV4"))
    labels.push({ label: "init(aws)", priority: 6 });

  // Cron/Schedule
  if (code.includes("cron") || code.includes("Cron") || code.includes("schedule"))
    labels.push({ label: "init(cron)", priority: 6 });

  // Hooks
  if (code.includes("PreToolUse") || code.includes("PostToolUse") || code.includes("hookExec"))
    labels.push({ label: "init(hooks)", priority: 7 });

  // Teams
  if (code.includes("teammate") || code.includes("Teammate") || code.includes("TeamCreate"))
    labels.push({ label: "init(teams)", priority: 7 });

  // Skills
  if (code.includes("skill") || code.includes("Skill") || code.includes("skillify"))
    labels.push({ label: "init(skills)", priority: 7 });

  // System prompt
  if (code.includes("systemPrompt") || code.includes("SystemPrompt") || code.includes("buildSystemPrompt"))
    labels.push({ label: "init(system-prompt)", priority: 7 });

  // Memory/CLAUDE.md
  if (code.includes("CLAUDE.md") || code.includes("memories") || code.includes("claudeMd"))
    labels.push({ label: "init(memory)", priority: 7 });

  // Extension/MCPB
  if (code.includes("extension") || code.includes("Extension") || code.includes("mcpb"))
    labels.push({ label: "init(extension)", priority: 6 });

  // Worktree
  if (code.includes("worktree") || code.includes("Worktree"))
    labels.push({ label: "init(worktree)", priority: 7 });

  // LSP
  if (code.includes("LanguageServer") || code.includes("diagnostic") || code.includes("textDocument/"))
    labels.push({ label: "init(lsp)", priority: 7 });

  // Notebook
  if (code.includes("notebook") || code.includes("Notebook") || code.includes("ipynb"))
    labels.push({ label: "init(notebook)", priority: 7 });

  // Config
  if (code.includes("globalConfig") || code.includes("projectConfig") || code.includes("settings.json"))
    labels.push({ label: "init(config)", priority: 6 });

  // Return highest priority label
  labels.sort((a, b) => b.priority - a.priority);
  return labels.length > 0 ? labels[0].label : null;
}

for (const [name, info] of gBlocks) {
  if (nameMap[name]) continue;
  if (!info.body || info.body.length < 50) continue;

  const label = analyzeContent(info.body);
  if (label) recordLabel(name, label, "H3");
}

// ===================================================================
// H4: Name-map reference clustering
// ===================================================================
console.log("H4: Name-map reference clustering...");

for (const [name, info] of gBlocks) {
  if (nameMap[name]) continue;
  if (!info.body || info.body.length < 100) continue;

  // Find all identifiers in the body that are in name-map
  const identRe = /\b([a-zA-Z_$][a-zA-Z0-9_$]{2,})\b/g;
  const refs = new Set();
  let im;
  while ((im = identRe.exec(info.body)) !== null) {
    const readable = nameMap[im[1]];
    if (readable && typeof readable === "string" && !readable.startsWith("init(") && !readable.startsWith("module(") && readable !== "default" && readable.length > 4) {
      refs.add(readable);
    }
  }

  if (refs.size >= 2) {
    // Pick the longest/most descriptive reference
    const sorted = [...refs].sort((a, b) => b.length - a.length);
    const label = `refs(${camelToKebab(sorted[0])})`;
    recordLabel(name, label, "H4");
  }
}

// ===================================================================
// H5: Dependency label propagation
// ===================================================================
console.log("H5: Dependency label propagation...");

// Run 3 iterations to cascade labels
for (let iter = 0; iter < 3; iter++) {
  let newLabels = 0;
  for (const [name, nodeInfo] of Object.entries(depGraph.nodes)) {
    if (nameMap[name]) continue;

    const deps = nodeInfo.deps || [];
    if (deps.length === 0) continue;

    // Collect labels from dependencies
    const depLabels = [];
    for (const dep of deps) {
      const label = nameMap[dep];
      if (label && typeof label === "string") {
        // Extract the meaningful part
        let core = label;
        if (core.startsWith("init(")) core = core.slice(5, -1);
        else if (core.startsWith("refs(")) core = core.slice(5, -1);
        else if (core.startsWith("telemetry(")) core = core.slice(10, -1);
        else if (core.startsWith("deps(")) continue; // Don't propagate zone-only labels
        else if (core === "default" || core.length < 3) continue;

        depLabels.push(core);
      }
    }

    if (depLabels.length < 2) continue;

    // Count frequency of dep labels
    const counts = {};
    for (const l of depLabels) counts[l] = (counts[l] || 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    // Only label if there's a dominant theme (most common label appears 2+ times)
    if (sorted[0][1] >= 2) {
      if (recordLabel(name, `deps(${sorted[0][0]})`, "H5")) newLabels++;
    }
  }
  if (newLabels === 0) break;
  console.log(`  Iteration ${iter + 1}: ${newLabels} new labels`);
}

// ===================================================================
// H6: Zone-based fallback for remaining unlabeled blocks
// ===================================================================
console.log("H6: Zone-based fallback...");

for (const [name, info] of gBlocks) {
  if (nameMap[name]) continue;

  const zoneName = zoneNames[info.zone] || `zone-${info.zone}`;

  if (info.lineCount <= 5) {
    // Trivial block — just dep calls and simple assignments
    recordLabel(name, `deps(${zoneName})`, "H6-trivial");
  } else {
    recordLabel(name, `block(${zoneName})`, "H6-zone");
  }
}

// ===================================================================
// Write updated name-map.json
// ===================================================================
const sortedMap = Object.fromEntries(
  Object.entries(nameMap).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(NAME_MAP, JSON.stringify(sortedMap, null, 2) + "\n");

// --- Report ---
console.log(`\n${"=".repeat(60)}`);
console.log("Auto-labeling results:\n");

let totalNew = 0;
for (const [h, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${h.padEnd(20)} ${String(count).padStart(5)} labels`);
  totalNew += count;
}

console.log(`\n  ${"TOTAL NEW".padEnd(20)} ${String(totalNew).padStart(5)} labels`);
console.log(`  ${"Previously".padEnd(20)} ${String(alreadyLabeled).padStart(5)} labels`);
console.log(`  ${"Grand total".padEnd(20)} ${String(alreadyLabeled + totalNew).padStart(5)} / ${gBlocks.size} G() blocks`);
console.log(`  ${"Coverage".padEnd(20)} ${((alreadyLabeled + totalNew) / gBlocks.size * 100).toFixed(1)}%`);

// name-map total
console.log(`\n  name-map.json: ${Object.keys(sortedMap).length} entries`);

// --- Label distribution by zone ---
console.log("\nLabels by zone:");
const byZone = {};
for (const [name, info] of gBlocks) {
  const z = info.zone;
  if (!byZone[z]) byZone[z] = { total: 0, labeled: 0 };
  byZone[z].total++;
  if (nameMap[name]) byZone[z].labeled++;
}
for (let z = 1; z <= 8; z++) {
  if (!byZone[z]) continue;
  const pct = (byZone[z].labeled / byZone[z].total * 100).toFixed(1);
  console.log(`  Zone ${z} (${zoneNames[z]}): ${byZone[z].labeled}/${byZone[z].total} (${pct}%)`);
}

// --- Sample labels by heuristic ---
console.log("\nSample labels:");
const samples = {};
for (const [name, info] of gBlocks) {
  const label = nameMap[name];
  if (!label || typeof label !== "string") continue;
  for (const prefix of ["init(", "refs(", "deps(", "telemetry(", "block("]) {
    if (label.startsWith(prefix)) {
      if (!samples[prefix]) samples[prefix] = [];
      if (samples[prefix].length < 5) samples[prefix].push({ name, label });
    }
  }
}
for (const [prefix, items] of Object.entries(samples)) {
  console.log(`\n  ${prefix}...) examples:`);
  for (const { name, label } of items) {
    console.log(`    ${name.padEnd(10)} → ${label}`);
  }
}

// Helper
function camelToKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

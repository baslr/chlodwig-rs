#!/usr/bin/env bun
/**
 * Builds a dependency graph from G() block initialization calls.
 *
 * Each G(() => { ... }) block calls other G() initializers at its start:
 *   var DW = G(() => { RR7(); pR7(); ... actual code ... });
 *
 * The calls at the start (bare function calls with no args) are dependencies.
 * This script builds a DAG and generates dep-graph.json.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");
const OUT = path.join(ROOT, "src", "dep-graph.json");

const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");

// Load name-map for readable labels
const nameMap = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "name-map.json"), "utf8"));

// Load zone-map for zone assignment
const zoneMap = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "zone-map.json"), "utf8"));

function getZone(lineNum) {
  for (const z of zoneMap.zones) {
    if (lineNum >= z.startLine && lineNum <= z.endLine) return z.zone;
  }
  return 0;
}

// --- Parse all G() blocks ---
const gBlockRe = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/;
const gBlocks = new Map(); // name → { line, deps[], zone }

// Set of all G() block names (to know which calls are G()-deps vs normal function calls)
const allGNames = new Set();

// First pass: collect all G() names
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(gBlockRe);
  if (m) allGNames.add(m[2]);
}

console.log(`Found ${allGNames.size} G() blocks\n`);

// Second pass: parse dependencies
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(gBlockRe);
  if (!m) continue;

  const indent = m[1];
  const name = m[2];
  const closePattern = `${indent}});`;
  const deps = [];

  // Find end
  let endIdx = -1;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === closePattern) { endIdx = j; break; }
  }
  if (endIdx === -1) continue;

  // Collect dependency calls from the body
  // Deps are bare calls: "    NAME();" — only identifier + () at the right indent
  // They appear at the start of the block before any real code
  const bodyIndent = indent + "  ";

  // Check if body is an eval() stub (extracted section)
  const bodyLine = lines[i + 1];
  if (bodyLine && bodyLine.includes("eval(require")) {
    // Read the extracted section file to get its deps
    const evalMatch = bodyLine.match(/sections\/([^"]+)\.js/);
    if (evalMatch) {
      const sectionFile = path.join(SECTIONS, `${evalMatch[1]}.js`);
      if (fs.existsSync(sectionFile)) {
        const sectionLines = fs.readFileSync(sectionFile, "utf8").split("\n");
        for (const sl of sectionLines) {
          const depMatch = sl.match(/^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(\);?\s*$/);
          if (depMatch && allGNames.has(depMatch[1])) {
            deps.push(depMatch[1]);
          } else {
            break; // Stop at first non-dep line
          }
        }
      }
    }
  } else {
    // Inline body — scan lines
    for (let j = i + 1; j < endIdx; j++) {
      const depMatch = lines[j].match(/^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(\);?\s*$/);
      if (depMatch && allGNames.has(depMatch[1])) {
        deps.push(depMatch[1]);
      } else {
        break; // Stop at first non-dep line
      }
    }
  }

  gBlocks.set(name, {
    line: i + 1,
    zone: getZone(i + 1),
    deps,
    label: nameMap[name] || null,
  });

  i = endIdx;
}

console.log(`Parsed ${gBlocks.size} G() blocks with dependencies\n`);

// --- Build graph ---
const graph = {
  generatedAt: new Date().toISOString(),
  totalNodes: gBlocks.size,
  totalEdges: 0,
  nodes: {},
  zoneSummary: {},
  crossZoneEdges: [],
};

let totalEdges = 0;
for (const [name, info] of gBlocks) {
  graph.nodes[name] = {
    line: info.line,
    zone: info.zone,
    label: info.label,
    deps: info.deps,
    depCount: info.deps.length,
  };
  totalEdges += info.deps.length;
}
graph.totalEdges = totalEdges;

// --- Zone dependency matrix ---
const zoneDeps = {}; // zoneA → { zoneB: count }
for (let i = 1; i <= 8; i++) {
  zoneDeps[i] = {};
  for (let j = 1; j <= 8; j++) zoneDeps[i][j] = 0;
}

for (const [name, info] of gBlocks) {
  const srcZone = info.zone;
  for (const dep of info.deps) {
    const depInfo = gBlocks.get(dep);
    if (depInfo) {
      const dstZone = depInfo.zone;
      zoneDeps[srcZone][dstZone]++;
      if (srcZone !== dstZone) {
        graph.crossZoneEdges.push({ from: name, to: dep, fromZone: srcZone, toZone: dstZone });
      }
    }
  }
}

// Zone summary
for (let i = 1; i <= 8; i++) {
  const zoneBlocks = [...gBlocks.entries()].filter(([, v]) => v.zone === i);
  const totalDeps = zoneBlocks.reduce((s, [, v]) => s + v.deps.length, 0);
  const crossZone = Object.entries(zoneDeps[i])
    .filter(([z]) => parseInt(z) !== i)
    .filter(([, c]) => c > 0)
    .map(([z, c]) => ({ zone: parseInt(z), count: c }))
    .sort((a, b) => b.count - a.count);

  graph.zoneSummary[i] = {
    name: zoneMap.zones[i - 1]?.name || `Zone ${i}`,
    blocks: zoneBlocks.length,
    totalDeps,
    internalDeps: zoneDeps[i][i],
    crossZoneDeps: crossZone,
  };
}

fs.writeFileSync(OUT, JSON.stringify(graph, null, 2) + "\n");

// --- Stats ---
console.log(`dep-graph.json: ${graph.totalNodes} nodes, ${graph.totalEdges} edges\n`);

// Nodes with most deps
const topDeps = [...gBlocks.entries()]
  .sort((a, b) => b[1].deps.length - a[1].deps.length)
  .slice(0, 15);

console.log("G() blocks with most dependencies:");
for (const [name, info] of topDeps) {
  const label = info.label ? ` (${info.label})` : "";
  console.log(`  ${name.padEnd(10)} Z${info.zone}  ${String(info.deps.length).padStart(3)} deps${label}`);
}

// Most depended-on (fan-in)
const fanIn = new Map();
for (const [, info] of gBlocks) {
  for (const dep of info.deps) {
    fanIn.set(dep, (fanIn.get(dep) || 0) + 1);
  }
}
const topFanIn = [...fanIn.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log("\nMost depended-on G() blocks (fan-in):");
for (const [name, count] of topFanIn) {
  const info = gBlocks.get(name);
  const label = info?.label ? ` (${info.label})` : "";
  const zone = info ? `Z${info.zone}` : "?";
  console.log(`  ${name.padEnd(10)} ${zone}  ${String(count).padStart(3)} dependents${label}`);
}

// Orphan blocks (no deps, not depended on)
const depended = new Set(fanIn.keys());
const orphans = [...gBlocks.entries()]
  .filter(([name, info]) => info.deps.length === 0 && !depended.has(name));
console.log(`\nOrphan blocks (no deps, not depended on): ${orphans.length}`);

// Zone dependency matrix
console.log("\nZone dependency matrix (rows depend on columns):");
const zoneNames = zoneMap.zones.map(z => z.name.split(":")[0].trim().replace("ZONE ", "Z"));
console.log("         " + zoneNames.map(z => z.padStart(6)).join(""));
for (let i = 1; i <= 8; i++) {
  const row = zoneNames.map((_, j) => {
    const val = zoneDeps[i][j + 1];
    return val > 0 ? String(val).padStart(6) : "     .";
  }).join("");
  console.log(`  ${zoneNames[i - 1].padEnd(6)} ${row}`);
}

// Cross-zone summary
console.log("\nCross-zone dependencies (zone → depends on zones):");
for (let i = 1; i <= 8; i++) {
  const cross = graph.zoneSummary[i].crossZoneDeps;
  if (cross.length === 0) continue;
  const deps = cross.map(d => `Z${d.zone}(${d.count})`).join(", ");
  console.log(`  Zone ${i} → ${deps}`);
}

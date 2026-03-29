#!/usr/bin/env bun
/**
 * Identifies React components in cli_split.js and extracted sections.
 *
 * Detection strategies:
 *   1. React Compiler cache: `alias.c(N)` — strongest signal (494 functions)
 *   2. createElement usage: functions containing createElement calls
 *   3. Hook usage: useState, useEffect, useMemo, useCallback, useRef
 *   4. React.memo wrappers
 *
 * Output: Updates name-map.json with component labels and generates
 *         src/react-components.json with a detailed component registry.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const ZONE_MAP = path.join(ROOT, "src", "zone-map.json");
const OUT = path.join(ROOT, "src", "react-components.json");

const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");
const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
const zoneMap = JSON.parse(fs.readFileSync(ZONE_MAP, "utf8"));

function getZone(lineNum) {
  for (const z of zoneMap.zones) {
    if (lineNum >= z.startLine && lineNum <= z.endLine) return z.zone;
  }
  return 0;
}

const zoneNames = {
  1: "Runtime & SDK",
  2: "Validation & Config",
  3: "Cloud Providers & Auth",
  4: "UI Framework & Rendering",
  5: "Tools & Permissions",
  6: "Conversation & Commands",
  7: "System Prompt, Session & App",
  8: "REPL, Skills & CLI Entry",
};

// --- Find all function definitions ---
// Patterns:
//   function NAME(H) { ... }
//   function NAME({ prop1, prop2 }) { ... }
//   NAME = function (H) { ... }
//   NAME = React.memo(function (H) { ... })

const funcStartRe = /^(\s*)(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
const memoRe = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\w+\.(?:default\.)?memo\(\s*function\s*\(/;

console.log("Scanning for React components...\n");

// --- Phase 1: Find all function boundaries ---
const functions = []; // { name, startLine, endLine, indent, body, source }

// Inline functions in cli_split.js
for (let i = 0; i < lines.length; i++) {
  let funcName = null;
  let indent = "";

  const fm = lines[i].match(funcStartRe);
  if (fm) {
    indent = fm[1];
    funcName = fm[2];
  }

  if (!fm) {
    const mm = lines[i].match(memoRe);
    if (mm) {
      indent = "  ";
      funcName = mm[1];
    }
  }

  if (!funcName) continue;

  // Find end of function — count braces
  let depth = 0;
  let endLine = -1;
  for (let j = i; j < lines.length && j < i + 2000; j++) {
    for (const ch of lines[j]) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
    }
    if (depth === 0 && j > i) {
      endLine = j;
      break;
    }
  }
  if (endLine === -1) continue;

  const body = lines.slice(i, endLine + 1).join("\n");
  functions.push({
    name: funcName,
    startLine: i + 1,
    endLine: endLine + 1,
    lineCount: endLine - i + 1,
    body,
    zone: getZone(i + 1),
    source: "inline",
  });

  // Don't skip — nested functions should also be found
}

// Also scan section files for functions
const sectionDir = path.join(ROOT, "src", "sections");
if (fs.existsSync(sectionDir)) {
  for (const file of fs.readdirSync(sectionDir).filter(f => f.endsWith(".js"))) {
    const filePath = path.join(sectionDir, file);
    const sectionContent = fs.readFileSync(filePath, "utf8");
    const sectionLines = sectionContent.split("\n");

    for (let i = 0; i < sectionLines.length; i++) {
      const fm = sectionLines[i].match(funcStartRe);
      const mm = sectionLines[i].match(memoRe);
      const funcName = fm?.[2] || mm?.[1];
      if (!funcName) continue;

      let depth = 0;
      let endLine = -1;
      for (let j = i; j < sectionLines.length && j < i + 2000; j++) {
        for (const ch of sectionLines[j]) {
          if (ch === "{") depth++;
          if (ch === "}") depth--;
        }
        if (depth === 0 && j > i) { endLine = j; break; }
      }
      if (endLine === -1) continue;

      const body = sectionLines.slice(i, endLine + 1).join("\n");
      functions.push({
        name: funcName,
        startLine: i + 1,
        endLine: endLine + 1,
        lineCount: endLine - i + 1,
        body,
        zone: 0,
        source: `sections/${file}`,
      });
    }
  }
}

console.log(`Found ${functions.length} function definitions\n`);

// --- Phase 2: Classify React components ---
const components = [];

for (const func of functions) {
  const signals = [];
  let score = 0;

  // Signal 1: React Compiler cache — .c(N) where N is a number
  const compilerCache = func.body.match(/\w+\.c\(\d+\)/g);
  if (compilerCache) {
    signals.push(`compiler-cache(${compilerCache.length})`);
    score += 10;
  }

  // Signal 2: createElement calls
  const ceCount = (func.body.match(/\.createElement\(/g) || []).length;
  if (ceCount > 0) {
    signals.push(`createElement(${ceCount})`);
    score += Math.min(ceCount * 2, 8);
  }

  // Signal 3: Hook usage
  const hooks = [];
  if (func.body.includes("useState(") || func.body.match(/\biX\(/)) hooks.push("useState");
  if (func.body.includes("useEffect(") || func.body.match(/\bpOH\(/)) hooks.push("useEffect");
  if (func.body.includes("useRef(") || func.body.match(/\bu5\$/)) hooks.push("useRef");
  if (func.body.includes("useCallback(")) hooks.push("useCallback");
  if (func.body.includes("useMemo(")) hooks.push("useMemo");
  if (func.body.includes("useContext(")) hooks.push("useContext");
  if (func.body.includes("useSyncExternalStore(")) hooks.push("useSyncExternalStore");
  // Also check for aliased hooks that are common in the codebase
  if (func.body.match(/\bY_\(/)) hooks.push("zustand-selector");

  if (hooks.length > 0) {
    signals.push(`hooks(${hooks.join(",")})`);
    score += hooks.length * 3;
  }

  // Signal 4: React.memo wrapper
  if (func.body.match(/\.memo\(\s*function/)) {
    signals.push("memo");
    score += 5;
  }

  // Signal 5: Returns createElement
  if (func.body.match(/return\s+\w+\.(?:default\.)?createElement\(/)) {
    signals.push("returns-jsx");
    score += 5;
  }

  // Signal 6: Destructured props pattern common in components
  if (func.body.match(/^\s*(?:function\s+\w+|var\s+\w+\s*=\s*\w+\.memo\(function)\s*\(\s*\{/m)) {
    signals.push("destructured-props");
    score += 2;
  }

  // Signal 7: Uses Ink primitives (Box=m/hD, Text=L/d3)
  const inkPrimitives = [];
  if (func.body.match(/createElement\(\s*(?:hD|m)\s*,/)) inkPrimitives.push("Box");
  if (func.body.match(/createElement\(\s*(?:d3|L)\s*,/)) inkPrimitives.push("Text");
  if (func.body.match(/createElement\(\s*Jiq\s*,/)) inkPrimitives.push("Button");
  if (func.body.match(/createElement\(\s*vq\s*,/)) inkPrimitives.push("Link");
  if (inkPrimitives.length > 0) {
    signals.push(`ink(${inkPrimitives.join(",")})`);
    score += inkPrimitives.length * 2;
  }

  // Must have at least some React signal
  if (score < 5) continue;

  // Get readable name if available
  const readable = nameMap[func.name];
  const readableName = readable
    ? (Array.isArray(readable) ? readable[0] : readable)
    : null;

  // Determine component type
  let type = "component";
  if (signals.includes("memo")) type = "memo-component";
  if (hooks.length > 0 && ceCount === 0) type = "hook";
  if (func.body.includes("createContext(")) type = "context-provider";

  components.push({
    name: func.name,
    readableName,
    type,
    zone: func.zone,
    source: func.source,
    startLine: func.startLine,
    lineCount: func.lineCount,
    score,
    signals,
    hooks,
    ceCount,
    inkPrimitives,
  });
}

// Deduplicate by name (keep highest score)
const byName = new Map();
for (const c of components) {
  if (!byName.has(c.name) || byName.get(c.name).score < c.score) {
    byName.set(c.name, c);
  }
}
const uniqueComponents = [...byName.values()].sort((a, b) => b.score - a.score);

console.log(`Found ${uniqueComponents.length} React components/hooks\n`);

// --- Phase 3: Find containing G() blocks and label them ---
const gBlockRe = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/;
const gBlockRanges = []; // { name, startLine, endLine }

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(gBlockRe);
  if (!m) continue;
  const indent = m[1];
  const name = m[2];
  const closePattern = `${indent}});`;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === closePattern) {
      gBlockRanges.push({ name, startLine: i + 1, endLine: j + 1 });
      i = j;
      break;
    }
  }
}

// For each component, find which G() block contains it OR is the nearest preceding G() block
let gBlocksLabeled = 0;
for (const comp of uniqueComponents) {
  if (comp.source !== "inline") continue;

  // Strategy 1: Find containing G() block
  let containingG = gBlockRanges.find(g =>
    comp.startLine >= g.startLine && comp.endLine <= g.endLine
  );

  // Strategy 2: Find nearest preceding G() block (component defined right after G block)
  if (!containingG) {
    let bestG = null;
    for (const g of gBlockRanges) {
      if (g.endLine <= comp.startLine && g.endLine >= comp.startLine - 5) {
        if (!bestG || g.endLine > bestG.endLine) bestG = g;
      }
    }
    containingG = bestG;
  }

  // Strategy 3: Find nearest G() block within 50 lines before
  if (!containingG) {
    let bestG = null;
    for (const g of gBlockRanges) {
      if (g.endLine <= comp.startLine && g.endLine >= comp.startLine - 50) {
        if (!bestG || g.endLine > bestG.endLine) bestG = g;
      }
    }
    containingG = bestG;
  }

  if (!containingG) continue;

  comp.gBlock = containingG.name;

  // Update name-map with component info
  // Upgrade label if it's a low-quality label (zone fallback, generic init, etc.)
  const existing = nameMap[containingG.name];
  const isLowQuality = !existing ||
    (typeof existing === "string" && (
      existing.startsWith("deps(") ||
      existing.startsWith("block(") ||
      existing === "init(call)" ||
      existing === "init(default)" ||
      existing.startsWith("init(react-component")
    ));

  if (isLowQuality) {
    const label = comp.readableName && comp.readableName !== "call" && comp.readableName !== "default"
      ? `component(${comp.readableName})`
      : `component(${comp.name})`;
    nameMap[containingG.name] = label;
    gBlocksLabeled++;
  }
}

// Also label G() blocks for components in sections
for (const comp of uniqueComponents) {
  if (comp.source === "inline") continue;

  // Find the eval stub in cli_split.js that loads this section
  const sectionName = comp.source.replace("sections/", "").replace(".js", "");
  const evalStubLine = lines.findIndex(l => l.includes(`sections/${sectionName}.js`));
  if (evalStubLine === -1) continue;

  // Find containing G() block
  const containingG = gBlockRanges.find(g =>
    evalStubLine + 1 >= g.startLine && evalStubLine + 1 <= g.endLine
  );
  if (!containingG) continue;

  comp.gBlock = containingG.name;

  const existing = nameMap[containingG.name];
  if (!existing || (typeof existing === "string" && (
    existing.startsWith("deps(") || existing.startsWith("block(")
  ))) {
    const label = comp.readableName
      ? `component(${comp.readableName})`
      : `component(${comp.name})`;
    nameMap[containingG.name] = label;
    gBlocksLabeled++;
  }
}

// --- Phase 4: Write outputs ---

// Update name-map.json
const sortedMap = Object.fromEntries(
  Object.entries(nameMap).sort(([a], [b]) => a.localeCompare(b))
);
fs.writeFileSync(NAME_MAP, JSON.stringify(sortedMap, null, 2) + "\n");

// Write react-components.json
const registry = {
  generatedAt: new Date().toISOString(),
  totalComponents: uniqueComponents.length,
  totalByType: {},
  totalByZone: {},
  components: uniqueComponents.map(c => ({
    name: c.name,
    readableName: c.readableName,
    type: c.type,
    zone: c.zone,
    zoneName: zoneNames[c.zone] || c.source,
    source: c.source,
    line: c.startLine,
    lines: c.lineCount,
    score: c.score,
    signals: c.signals,
    hooks: c.hooks,
    ceCount: c.ceCount,
    gBlock: c.gBlock || null,
  })),
};

// Aggregate stats
for (const c of uniqueComponents) {
  registry.totalByType[c.type] = (registry.totalByType[c.type] || 0) + 1;
  const zn = zoneNames[c.zone] || c.source;
  registry.totalByZone[zn] = (registry.totalByZone[zn] || 0) + 1;
}

fs.writeFileSync(OUT, JSON.stringify(registry, null, 2) + "\n");

// --- Report ---
console.log(`${"=".repeat(60)}`);
console.log("React Component Detection Results\n");

console.log("By type:");
for (const [type, count] of Object.entries(registry.totalByType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type.padEnd(20)} ${String(count).padStart(5)}`);
}

console.log("\nBy zone:");
for (const [zone, count] of Object.entries(registry.totalByZone).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${zone.padEnd(40)} ${String(count).padStart(5)}`);
}

console.log(`\nG() blocks labeled with component info: ${gBlocksLabeled}`);
console.log(`name-map.json: ${Object.keys(sortedMap).length} entries`);
console.log(`react-components.json: ${uniqueComponents.length} components`);

// Top 30 components by score
console.log("\nTop 30 components (by score):");
for (const c of uniqueComponents.slice(0, 30)) {
  const name = c.readableName || c.name;
  const zone = c.zone ? `Z${c.zone}` : c.source.slice(0, 20);
  const sig = c.signals.slice(0, 3).join(", ");
  console.log(`  ${name.padEnd(35)} ${zone.padEnd(8)} score=${String(c.score).padStart(3)}  ${sig}`);
}

// Named components
const named = uniqueComponents.filter(c => c.readableName);
console.log(`\n${named.length} components with readable names:`);
for (const c of named.sort((a, b) => a.readableName.localeCompare(b.readableName)).slice(0, 50)) {
  const zone = c.zone ? `Z${c.zone}` : c.source.slice(0, 15);
  console.log(`  ${c.readableName.padEnd(40)} ${zone.padEnd(8)} ${c.type}`);
}
if (named.length > 50) console.log(`  ... +${named.length - 50} more`);

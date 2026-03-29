#!/usr/bin/env bun
/**
 * Parses all J_() export bindings in cli_split.js to build:
 *   1. name-map.json — hash→readableName dictionary for all exported symbols
 *   2. Enriched zone-map.json — adds nameMap per zone
 *
 * J_() patterns:
 *   J_(moduleHash, { readableName: () => funcHash, ... });
 *   Single-line or multi-line.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const NAME_MAP_OUT = path.join(ROOT, "src", "name-map.json");
const ZONE_MAP = path.join(ROOT, "src", "zone-map.json");

const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");

// --- Parse all J_() blocks ---
// Strategy: find lines starting with J_( and collect until );
const j_starts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/^\s*J_\(/)) {
    j_starts.push(i);
  }
}

const bindings = []; // { module, exports: [{ name, target, line }], line }

for (const start of j_starts) {
  // Collect the full J_() call (may span multiple lines)
  let block = "";
  let end = start;
  let depth = 0;
  for (let i = start; i < lines.length && i < start + 200; i++) {
    block += lines[i] + "\n";
    for (const ch of lines[i]) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
    }
    end = i;
    if (depth <= 0) break;
  }

  // Parse: J_(ModuleName, { exportName: () => target, ... })
  const moduleMatch = block.match(/J_\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\{/);
  if (!moduleMatch) continue;

  const moduleName = moduleMatch[1];
  const exports = [];

  // Find all "name: () => target" patterns
  const exportRe = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\(\)\s*=>\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let m;
  while ((m = exportRe.exec(block)) !== null) {
    exports.push({ name: m[1], target: m[2] });
  }

  if (exports.length > 0) {
    bindings.push({ module: moduleName, exports, line: start + 1 }); // 1-indexed
  }
}

console.log(`Found ${bindings.length} J_() export blocks with ${bindings.reduce((s, b) => s + b.exports.length, 0)} total bindings\n`);

// --- Build hash→name map ---
// Multiple exports may map to the same target; keep all names
const hashToNames = new Map(); // target → Set of readable names
const moduleToExports = new Map(); // module → [{ name, target }]

for (const b of bindings) {
  moduleToExports.set(b.module, { exports: b.exports, line: b.line });

  for (const e of b.exports) {
    if (!hashToNames.has(e.target)) {
      hashToNames.set(e.target, new Set());
    }
    hashToNames.get(e.target).add(e.name);
  }
}

// Also add module→name mappings: if a module exports "default: () => X",
// then X is the module's default export
for (const b of bindings) {
  const defaultExport = b.exports.find(e => e.name === "default");
  if (defaultExport) {
    if (!hashToNames.has(b.module)) {
      hashToNames.set(b.module, new Set());
    }
    hashToNames.get(b.module).add(`module(${defaultExport.target})`);
  }
}

// --- Build name-map.json ---
const nameMap = {};
for (const [hash, names] of hashToNames) {
  const nameArr = [...names];
  nameMap[hash] = nameArr.length === 1 ? nameArr[0] : nameArr;
}

// Sort by key for readability
const sorted = Object.fromEntries(
  Object.entries(nameMap).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(NAME_MAP_OUT, JSON.stringify(sorted, null, 2) + "\n");

console.log(`name-map.json: ${Object.keys(sorted).length} entries`);

// Show some stats
let singleName = 0, multiName = 0;
for (const v of Object.values(sorted)) {
  if (Array.isArray(v)) multiName++;
  else singleName++;
}
console.log(`  ${singleName} single-name, ${multiName} multi-name\n`);

// --- Show top examples ---
console.log("Sample mappings (hash → readable name):\n");
const interesting = Object.entries(sorted)
  .filter(([k, v]) => !Array.isArray(v) && v !== "default" && v.length > 5)
  .slice(0, 40);

for (const [hash, name] of interesting) {
  console.log(`  ${hash.padEnd(12)} → ${name}`);
}

// --- Enrich zone-map.json ---
if (fs.existsSync(ZONE_MAP)) {
  const zoneData = JSON.parse(fs.readFileSync(ZONE_MAP, "utf8"));

  // Add nameMap to each zone's exports
  for (const zone of zoneData.zones) {
    zone.nameMap = {};
    for (const exp of zone.exports) {
      const modInfo = moduleToExports.get(exp.module);
      if (modInfo) {
        for (const e of modInfo.exports) {
          zone.nameMap[e.target] = e.name;
        }
      }
    }
    zone.namedSymbols = Object.keys(zone.nameMap).length;
  }

  // Add global summary
  zoneData.nameMapEntries = Object.keys(sorted).length;
  zoneData.nameMapFile = "name-map.json";

  fs.writeFileSync(ZONE_MAP, JSON.stringify(zoneData, null, 2) + "\n");
  console.log(`\nEnriched zone-map.json with per-zone nameMaps`);

  for (const z of zoneData.zones) {
    console.log(`  Zone ${z.zone}: ${z.namedSymbols} named symbols`);
  }
}

// --- Module summary ---
console.log(`\nModules with most exports:`);
const modSorted = [...moduleToExports.entries()]
  .sort((a, b) => b[1].exports.length - a[1].exports.length)
  .slice(0, 15);

for (const [mod, info] of modSorted) {
  const names = info.exports.slice(0, 5).map(e => e.name).join(", ");
  const more = info.exports.length > 5 ? ` ... +${info.exports.length - 5} more` : "";
  console.log(`  ${mod.padEnd(8)} (${String(info.exports.length).padStart(3)} exports, L${info.line}): ${names}${more}`);
}

// --- G() block labeling ---
// Find G() blocks and label them by which named functions they contain
console.log(`\nLabeling G() blocks by contained named symbols...`);

const gBlockRe2 = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/;
const gBlockLabels = {}; // gBlockName → { label, namedSymbols }
let gLabeled = 0;

for (let i = 0; i < lines.length; i++) {
  const gm = lines[i].match(gBlockRe2);
  if (!gm) continue;

  const indent = gm[1];
  const gName = gm[2];
  const closePattern = `${indent}});`;

  // Find end of G() block
  let endIdx = -1;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === closePattern) { endIdx = j; break; }
  }
  if (endIdx === -1) continue;

  // Find all function/class names inside this G() block that have readable names
  const namedInBlock = [];
  const funcInBlockRe = /^\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
  const classInBlockRe = /^\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;

  for (let j = i + 1; j < endIdx; j++) {
    const fm = lines[j].match(funcInBlockRe);
    if (fm && sorted[fm[1]]) {
      namedInBlock.push(sorted[fm[1]]);
    }
    const cm = lines[j].match(classInBlockRe);
    if (cm && sorted[cm[1]]) {
      const v = sorted[cm[1]];
      namedInBlock.push(Array.isArray(v) ? v[0] : v);
    }
  }

  // Also check assignments: varName = ... where varName is in name-map
  const assignRe = /^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/;
  for (let j = i + 1; j < endIdx; j++) {
    const am = lines[j].match(assignRe);
    if (am && sorted[am[1]] && !namedInBlock.includes(sorted[am[1]])) {
      const v = sorted[am[1]];
      namedInBlock.push(Array.isArray(v) ? v[0] : v);
    }
  }

  if (namedInBlock.length > 0) {
    // Pick a label: most descriptive named symbol (longest name, or first)
    const unique = [...new Set(namedInBlock)];
    const label = unique.sort((a, b) => b.length - a.length)[0];
    gBlockLabels[gName] = { label, symbols: unique.slice(0, 10), line: i + 1 };
    gLabeled++;

    // Also add to hashToNames
    if (!sorted[gName]) {
      sorted[gName] = `init(${label})`;
    }
  }

  i = endIdx;
}

console.log(`  Labeled ${gLabeled} of ${Object.keys(gBlockLabels).length > 0 ? gLabeled : 0} G() blocks\n`);

// Rewrite name-map with G() block labels
fs.writeFileSync(NAME_MAP_OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`Updated name-map.json: ${Object.keys(sorted).length} entries`);

// --- Coverage summary ---
const funcRe2 = /^  (?:async )?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm;
let fTotal = 0, fNamed = 0;
let fm;
while ((fm = funcRe2.exec(content)) !== null) {
  fTotal++;
  if (sorted[fm[1]]) fNamed++;
}

const classRe2 = /^  class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/gm;
let cTotal = 0, cNamed = 0;
while ((fm = classRe2.exec(content)) !== null) {
  cTotal++;
  if (sorted[fm[1]]) cNamed++;
}

const gRe2 = /^\s*var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/gm;
let gTotal = 0, gNamed = 0;
while ((fm = gRe2.exec(content)) !== null) {
  gTotal++;
  if (sorted[fm[1]]) gNamed++;
}

console.log(`\nCoverage:`);
console.log(`  Functions: ${fNamed}/${fTotal} (${(fNamed/fTotal*100).toFixed(1)}%)`);
console.log(`  Classes:   ${cNamed}/${cTotal} (${(cNamed/cTotal*100).toFixed(1)}%)`);
console.log(`  G() blocks: ${gNamed}/${gTotal} (${(gNamed/gTotal*100).toFixed(1)}%)`);
console.log(`  Total named symbols: ${Object.keys(sorted).length}`);


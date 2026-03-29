#!/usr/bin/env bun
/**
 * Scans cli_split.js for zone markers and generates zone-map.json
 * with per-zone metadata (exports, functions, classes, G() blocks).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const OUT = path.join(ROOT, "src", "zone-map.json");

const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");

// --- Find zone markers ---
const zoneRe = /^\s*\/\/\s+ZONE\s+(\d+):\s+(.+)$/;
const zoneStarts = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(zoneRe);
  if (m) {
    zoneStarts.push({ num: parseInt(m[1]), name: m[2].trim(), startLine: i + 1 }); // 1-indexed
  }
}

if (zoneStarts.length === 0) {
  console.error("No zone markers found in cli_split.js");
  process.exit(1);
}

// --- Build zones with end lines ---
const zones = zoneStarts.map((z, i) => ({
  ...z,
  endLine: i < zoneStarts.length - 1 ? zoneStarts[i + 1].startLine - 1 : lines.length,
}));

// --- Scan each zone ---
const exportRe = /J_\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\{([^}]+)\}\)/;
const funcRe = /^  (?:async )?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
const classRe = /^  class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
const gBlockRe = /^\s*var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\(\)\s*=>\s*\{$/;
const evalRe = /eval\(require\("fs"\)\.readFileSync.*?"([^"]+)"\)/;

const result = { generatedAt: new Date().toISOString(), totalLines: lines.length, zones: [] };

for (const zone of zones) {
  const z = {
    zone: zone.num,
    name: zone.name,
    startLine: zone.startLine,
    endLine: zone.endLine,
    lines: zone.endLine - zone.startLine + 1,
    exports: [],
    functions: [],
    asyncFunctions: [],
    classes: [],
    gBlocks: [],
    evalStubs: [],
  };

  for (let i = zone.startLine - 1; i < zone.endLine; i++) {
    const line = lines[i];

    // J_() exports
    const em = line.match(exportRe);
    if (em) {
      const names = em[2].match(/(\w+)\s*:\s*\(\)\s*=>\s*(\w+)/g) || [];
      const exports = names.map(n => {
        const parts = n.match(/(\w+)\s*:\s*\(\)\s*=>\s*(\w+)/);
        return parts ? parts[1] : n;
      });
      z.exports.push({ module: em[1], names: exports, line: i + 1 });
    }

    // function declarations
    const fm = line.match(funcRe);
    if (fm) {
      if (line.includes("async ")) {
        z.asyncFunctions.push({ name: fm[1], line: i + 1 });
      } else {
        z.functions.push({ name: fm[1], line: i + 1 });
      }
    }

    // class declarations
    const cm = line.match(classRe);
    if (cm) {
      z.classes.push({ name: cm[1], line: i + 1 });
    }

    // G() blocks
    const gm = line.match(gBlockRe);
    if (gm) {
      z.gBlocks.push({ name: gm[1], line: i + 1 });
    }

    // eval stubs
    const evm = line.match(evalRe);
    if (evm) {
      z.evalStubs.push({ file: evm[1], line: i + 1 });
    }
  }

  result.zones.push(z);
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");

console.log(`Zone map: ${OUT}`);
console.log(`  ${result.zones.length} zones, ${lines.length} total lines\n`);

for (const z of result.zones) {
  console.log(`  Zone ${z.zone}: ${z.name}`);
  console.log(`    Lines ${z.startLine.toLocaleString()}-${z.endLine.toLocaleString()} (${z.lines.toLocaleString()} lines)`);
  console.log(`    ${z.exports.length} exports, ${z.functions.length + z.asyncFunctions.length} functions, ${z.classes.length} classes, ${z.gBlocks.length} G() blocks, ${z.evalStubs.length} eval stubs`);
}

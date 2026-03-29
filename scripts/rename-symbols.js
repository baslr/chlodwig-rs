#!/usr/bin/env bun
/**
 * Renames minified hash identifiers to readable names in a COPY of the code.
 *
 * Input:  src/cli_split.js + src/sections/ + src/name-map.json
 * Output: src/readable/cli_split.js + src/readable/sections/ + rename-report.json
 *
 * The original files remain untouched — runtime stays functional.
 *
 * Strategy:
 *   Phase 1: Filter name-map to safe renameable entries (~2,500)
 *   Phase 2: Deduplicate collisions with $N suffix
 *   Phase 3: Apply all replacements (longest hash first) via regex
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");
const OUT_DIR = path.join(ROOT, "src", "readable");
const OUT_SECTIONS = path.join(OUT_DIR, "sections");

const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));

console.log(`Loaded name-map: ${Object.keys(nameMap).length} entries\n`);

// =====================================================================
// Phase 1: Filter to safe renameable entries
// =====================================================================

// Meta-label prefixes — these are NOT variable names
const META_PREFIXES = ["init(", "deps(", "block(", "component(", "refs(", "telemetry(", "module("];

// Hash identifiers to skip (single-char = too many false positives, JS keywords)
const SKIP_HASHES = new Set([
  // Single characters — thousands of false positive matches
  "L", "P", "W", "m", "e", "d", "r", "t", "n", "s", "i", "o", "a", "c", "u", "l", "f", "h", "p", "b", "g", "v", "k", "x", "y", "w", "j", "z", "q",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "M", "N", "O", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z",
  // JS keywords that happen to be hash names
  "of", "in", "do", "if", "is", "as", "or", "to", "on", "no", "an", "by", "up", "at", "go",
  // 2-char that collide with common patterns
  "id", "ok",
]);

// Values that are too generic to be useful identifiers
const SKIP_VALUES = new Set([
  "call", "default", "get", "set", "map", "from", "name", "type", "data",
  "value", "error", "result", "options", "config", "state", "action",
  "message", "event", "handler", "callback", "response", "request",
  "status", "length", "index", "key", "path", "url", "node",
  "string", "number", "object", "array", "parse", "util", "module",
  "apply", "bind", "constructor", "prototype", "toString", "valueOf",
  "hasOwnProperty", "isPrototypeOf", "then", "catch", "finally",
  "return", "throw", "yield", "async", "await", "class", "const",
  "let", "var", "new", "delete", "typeof", "instanceof", "void",
  "true", "false", "null", "undefined", "this", "super", "import",
  "export", "extends", "switch", "case", "break", "continue",
  "while", "for", "with", "try", "debugger", "arguments", "eval",
]);

const candidates = new Map(); // hash → readableName

for (const [hash, value] of Object.entries(nameMap)) {
  // Skip hashes in blocklist
  if (SKIP_HASHES.has(hash)) continue;

  // Get string value (first element if array)
  let name = Array.isArray(value) ? value[0] : value;
  if (typeof name !== "string") continue;

  // Skip meta-labels
  if (META_PREFIXES.some(p => name.startsWith(p))) continue;

  // Skip generic values
  if (SKIP_VALUES.has(name)) continue;
  if (SKIP_VALUES.has(name.toLowerCase())) continue;

  // Skip very short names (< 3 chars)
  if (name.length < 3) continue;

  // Skip names that start with a digit (not valid JS identifier)
  if (/^\d/.test(name)) continue;

  // Ensure the hash looks like a valid JS identifier
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(hash)) continue;

  // Ensure the readable name is a valid JS identifier
  // (some have spaces, dashes, etc. — make them safe)
  let safeName = name.replace(/[^a-zA-Z0-9_$]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!/^[a-zA-Z_$]/.test(safeName)) safeName = "_" + safeName;
  if (safeName.length < 3) continue;

  // Don't rename if hash === safeName (already readable)
  if (hash === safeName) continue;

  candidates.set(hash, safeName);
}

console.log(`Phase 1: ${candidates.size} candidate symbols (filtered from ${Object.keys(nameMap).length})\n`);

// =====================================================================
// Phase 2: Deduplicate — multiple hashes → same readable name
// =====================================================================

const nameCount = new Map(); // readableName → count
for (const name of candidates.values()) {
  nameCount.set(name, (nameCount.get(name) || 0) + 1);
}

// For duplicates, append $N suffix
const nameUsed = new Map(); // readableName → next suffix
const finalMap = new Map(); // hash → final unique name

for (const [hash, name] of candidates) {
  if (nameCount.get(name) === 1) {
    finalMap.set(hash, name);
  } else {
    const idx = (nameUsed.get(name) || 0) + 1;
    nameUsed.set(name, idx);
    if (idx === 1) {
      finalMap.set(hash, name);
    } else {
      finalMap.set(hash, `${name}$${idx}`);
    }
  }
}

const dupes = [...nameCount.entries()].filter(([, c]) => c > 1).length;
console.log(`Phase 2: ${finalMap.size} symbols after dedup (${dupes} duplicate names suffixed)\n`);

// =====================================================================
// Phase 3: Sort by hash length (longest first) and apply
// =====================================================================

// Sort: longest hash first → prevents substring collisions
const replacements = [...finalMap.entries()]
  .sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]));

console.log(`Phase 3: Applying ${replacements.length} replacements...\n`);

// Build a single mega-regex for efficient one-pass replacement
// Group replacements by length to build efficient alternation
function applyReplacements(content, replacements) {
  // For very large files, iterative regex is more reliable than mega-regex
  // Use word-boundary regex for each replacement
  let result = content;
  let applied = 0;

  for (const [hash, name] of replacements) {
    // Build regex with word boundaries
    // Escape special regex chars in hash ($ is common in hashes)
    const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "g");

    const before = result;
    result = result.replace(re, name);
    if (result !== before) applied++;
  }

  return { result, applied };
}

// --- Create output directory ---
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(OUT_SECTIONS, { recursive: true });

// --- Process cli_split.js ---
console.log("Processing cli_split.js...");
const splitContent = fs.readFileSync(SPLIT, "utf8");
const { result: renamedSplit, applied: splitApplied } = applyReplacements(splitContent, replacements);
fs.writeFileSync(path.join(OUT_DIR, "cli_split.js"), renamedSplit);
console.log(`  ✓ cli_split.js: ${splitApplied} symbols replaced`);

// --- Process section files ---
console.log("Processing sections...");
const sectionFiles = fs.existsSync(SECTIONS) ? fs.readdirSync(SECTIONS).filter(f => f.endsWith(".js")) : [];
let totalSectionApplied = 0;

for (const file of sectionFiles) {
  const content = fs.readFileSync(path.join(SECTIONS, file), "utf8");
  const { result: renamed, applied } = applyReplacements(content, replacements);
  fs.writeFileSync(path.join(OUT_SECTIONS, file), renamed);
  totalSectionApplied += applied > 0 ? 1 : 0;
}
console.log(`  ✓ ${sectionFiles.length} sections (${totalSectionApplied} with replacements)`);

// --- Write report ---
const report = {
  generatedAt: new Date().toISOString(),
  totalNameMapEntries: Object.keys(nameMap).length,
  totalCandidates: candidates.size,
  totalReplacements: replacements.length,
  duplicateNames: dupes,
  splitSymbolsReplaced: splitApplied,
  sectionsProcessed: sectionFiles.length,
  sectionsWithReplacements: totalSectionApplied,
  skippedMetaLabels: Object.values(nameMap).filter(v => {
    const s = Array.isArray(v) ? v[0] : v;
    return typeof s === "string" && META_PREFIXES.some(p => s.startsWith(p));
  }).length,
  skippedAmbiguous: [...Object.entries(nameMap)].filter(([h, v]) => {
    const s = Array.isArray(v) ? v[0] : v;
    return typeof s === "string" && (SKIP_VALUES.has(s) || SKIP_VALUES.has(s.toLowerCase()));
  }).length,
  topReplacements: replacements.slice(0, 50).map(([h, n]) => ({ hash: h, name: n })),
  sampleBefore: [],
  sampleAfter: [],
};

// Add before/after samples
const sampleHashes = replacements.filter(([h]) => h.length >= 3).slice(0, 10);
for (const [hash, name] of sampleHashes) {
  // Find a line containing this hash in the original
  const lines = splitContent.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(hash) && lines[i].length < 200) {
      report.sampleBefore.push({ line: i + 1, content: lines[i].trim().slice(0, 150) });
      const renamedLines = renamedSplit.split("\n");
      report.sampleAfter.push({ line: i + 1, content: renamedLines[i].trim().slice(0, 150) });
      break;
    }
  }
}

fs.writeFileSync(path.join(OUT_DIR, "rename-report.json"), JSON.stringify(report, null, 2) + "\n");

// --- Summary ---
console.log(`\n${"=".repeat(60)}`);
console.log("Symbol Renaming Complete\n");
console.log(`  Name-map entries:      ${Object.keys(nameMap).length}`);
console.log(`  Skipped meta-labels:   ${report.skippedMetaLabels}`);
console.log(`  Skipped ambiguous:     ${report.skippedAmbiguous}`);
console.log(`  Total replacements:    ${replacements.length}`);
console.log(`  Duplicate names:       ${dupes} (suffixed with $N)`);
console.log(`  cli_split.js symbols:  ${splitApplied}`);
console.log(`  Sections processed:    ${sectionFiles.length}`);
console.log(`\n  Output: src/readable/`);
console.log(`  Report: src/readable/rename-report.json`);

// Show samples
console.log("\nSample renames (before → after):");
for (let i = 0; i < Math.min(report.sampleBefore.length, 8); i++) {
  console.log(`\n  Line ${report.sampleBefore[i].line}:`);
  console.log(`  - ${report.sampleBefore[i].content}`);
  console.log(`  + ${report.sampleAfter[i].content}`);
}

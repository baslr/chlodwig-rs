#!/usr/bin/env bun
/**
 * Split cli_patched.js by extracting large d() modules into separate files.
 * Uses charCode-based bracket matching for performance on 12MB source.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PATCHED = path.join(ROOT, "src", "cli_patched.js");
const OUT = path.join(ROOT, "src", "cli_split.js");
const VENDOR_DIR = path.join(ROOT, "src", "vendor");
const CHUNKS_DIR = path.join(ROOT, "src", "chunks");

const THRESHOLD = 100 * 1024; // 100 KB

const content = fs.readFileSync(PATCHED, "utf8");
console.log(`Read source: ${(content.length / 1e6).toFixed(1)} MB\n`);

// --- Fast bracket matcher ---
function matchParen(src, openPos) {
  let depth = 0, i = openPos;
  while (i < src.length) {
    const c = src.charCodeAt(i);
    if (c === 40) depth++;       // (
    else if (c === 41) { depth--; if (depth === 0) return i; }  // )
    else if (c === 34 || c === 39) {  // " or '
      const q = c;
      i++;
      while (i < src.length && src.charCodeAt(i) !== q) {
        if (src.charCodeAt(i) === 92) i++;  // backslash escape
        i++;
      }
    }
    else if (c === 96) {  // ` template literal
      i++;
      let td = 0;
      while (i < src.length) {
        const cc = src.charCodeAt(i);
        if (cc === 92) { i += 2; continue; }
        if (cc === 96 && td === 0) break;
        if (cc === 36 && src.charCodeAt(i + 1) === 123) { td++; i += 2; continue; }
        if (cc === 125 && td > 0) { td--; }
        i++;
      }
    }
    i++;
  }
  return -1;
}

// --- Find d() modules ---
console.log("Finding d() modules...");
const re = /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*d\(/g;
const allModules = [];
let match;

while ((match = re.exec(content)) !== null) {
  const name = match[1];
  const varStart = match.index;
  const dParenPos = content.indexOf("d(", varStart + 4 + name.length);

  const closePos = matchParen(content, dParenPos);
  if (closePos === -1) continue;

  let stmtEnd = closePos + 1;
  if (content.charCodeAt(stmtEnd) === 59) stmtEnd++; // skip ;

  allModules.push({ name, start: varStart, end: stmtEnd, size: stmtEnd - varStart });
}

console.log(`Found ${allModules.length} d() modules\n`);

// Filter by size
const bigModules = allModules.filter(m => m.size >= THRESHOLD);
bigModules.sort((a, b) => b.size - a.size);
console.log(`Modules > ${THRESHOLD / 1024} KB: ${bigModules.length}\n`);

// --- Categorize ---
function categorize(mod) {
  const s = content.slice(mod.start, Math.min(mod.start + 500, mod.end));

  // hljs language defs have characteristic patterns
  if ((s.includes("$pattern") || s.includes("className") || s.includes("COMMENT(")) &&
      (s.includes(".exports=") || s.includes("keywords")))
    return "vendor/hljs";
  if (s.includes("highlightElement")) return "vendor/hljs";

  // AWS
  if (s.includes("CredentialsProvider") || s.includes("@aws-sdk") || s.includes("a.co/"))
    return "vendor/aws";
  // Zod
  if (s.includes("_zod") || s.includes("ZodError")) return "vendor/zod";
  // gRPC
  if (s.includes("LogVerbosity") || s.includes("ChannelCredentials")) return "vendor/grpc";
  // Protobuf
  if (s.includes("Reader") && s.includes("Writer") && (s.includes("varint") || s.includes("proto")))
    return "vendor/proto";

  return "chunks";
}

// Clean
fs.rmSync(VENDOR_DIR, { recursive: true, force: true });
fs.rmSync(CHUNKS_DIR, { recursive: true, force: true });

const extractions = [];
let totalExtracted = 0;

// Stats by category
const stats = {};

for (const mod of bigModules) {
  const dir = categorize(mod);
  const outDir = path.join(ROOT, "src", dir);
  fs.mkdirSync(outDir, { recursive: true });

  const moduleCode = content.slice(mod.start, mod.end);
  fs.writeFileSync(path.join(outDir, `${mod.name}.js`), moduleCode + "\n");

  extractions.push({ ...mod, dir });
  totalExtracted += mod.size;

  const cat = dir.split("/").pop();
  stats[cat] = (stats[cat] || { count: 0, size: 0 });
  stats[cat].count++;
  stats[cat].size += mod.size;
}

// Print summary by category
console.log("Extracted by category:");
for (const [cat, s] of Object.entries(stats).sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  ${cat.padEnd(12)} ${String(s.count).padStart(4)} modules  ${(s.size / 1024).toFixed(0).padStart(7)} KB`);
}
console.log(`  ${"TOTAL".padEnd(12)} ${String(extractions.length).padStart(4)} modules  ${(totalExtracted / 1024).toFixed(0).padStart(7)} KB (${(totalExtracted / content.length * 100).toFixed(0)}%)\n`);

// --- Build cli_split.js ---
extractions.sort((a, b) => a.start - b.start);

const parts = [];
let cursor = 0;

for (const ext of extractions) {
  parts.push(content.slice(cursor, ext.start));
  parts.push(`eval(require("fs").readFileSync(require("path").resolve(__dirname,"${ext.dir}/${ext.name}.js"),"utf8"))`);
  cursor = ext.end;
}
parts.push(content.slice(cursor));

const result = parts.join("");
fs.writeFileSync(OUT, result);

console.log(`Wrote src/cli_split.js: ${(result.length / 1e6).toFixed(1)} MB (was ${(content.length / 1e6).toFixed(1)} MB, saved ${((content.length - result.length) / 1e6).toFixed(1)} MB)`);

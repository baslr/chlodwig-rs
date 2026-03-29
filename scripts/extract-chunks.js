#!/usr/bin/env bun
/**
 * Split cli_formatted.js by extracting large d() modules.
 *
 * Uses line-based detection on formatted source:
 *  - Module start: line matching /^\s*var\s+(\w+)\s*=\s*d\(/
 *  - Module end:   line matching /^\s*\}\);$/ at same indent level
 *
 * Each extracted file contains the full `var XXX = d(...)` statement.
 * The split bundle evals the file to re-create the var in scope.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMATTED = path.join(ROOT, "src", "cli_formatted.js");
const OUT = path.join(ROOT, "src", "cli_split.js");

const THRESHOLD = 3 * 1024; // 3 KB

const content = fs.readFileSync(FORMATTED, "utf8");
const lines = content.split("\n");
console.log(`Read: ${(content.length / 1e6).toFixed(1)} MB, ${lines.length} lines\n`);

// --- Find d() modules by line scanning ---
const startRe = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*d\(/;
const modules = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(startRe);
  if (!m) continue;

  const indent = m[1];
  const name = m[2];
  const startLine = i;

  // Find closing `});` at same indent level
  const closePattern = `${indent}});`;
  let endLine = -1;

  for (let j = i + 1; j < lines.length; j++) {
    // Exact match: the line is exactly "  });" (same indent + "});")
    if (lines[j] === closePattern || lines[j] === closePattern + "\n") {
      endLine = j;
      break;
    }
  }

  if (endLine === -1) continue;

  // Calculate size (chars, including newlines)
  let size = 0;
  for (let j = startLine; j <= endLine; j++) {
    size += lines[j].length + 1; // +1 for newline
  }

  const lineCount = endLine - startLine + 1;
  modules.push({ name, startLine, endLine, size, lineCount, indent });

  // Skip past this module
  i = endLine;
}

console.log(`Found ${modules.length} d() modules\n`);

// --- Filter big ones ---
const big = modules.filter(m => m.size >= THRESHOLD);
big.sort((a, b) => b.size - a.size);

// --- Categorize ---
function categorize(mod) {
  // Sample broader: first 80 lines for better heuristics
  const sample = lines.slice(mod.startLine, Math.min(mod.startLine + 80, mod.endLine)).join("\n");
  // Also check whole module content for definitive keywords
  const full = lines.slice(mod.startLine, mod.endLine + 1).join("\n");

  // highlight.js language definitions (keywords, $pattern, etc.)
  if (sample.includes("$pattern") || sample.includes("COMMENT(") || (sample.includes("className") && sample.includes("begin")))
    if (sample.includes(".exports") || sample.includes("keywords") || sample.includes("variants"))
      return "vendor/hljs";
  if (sample.includes("highlightElement") || sample.includes("registerLanguage")) return "vendor/hljs";
  // hljs language data: long keyword lists with Cyrillic (1C), Mathematica builtins, ISBL constants
  if (full.includes("DECISION_BLOCK_") || full.includes("MONITOR_BLOCK_") || full.includes("NOTICE_BLOCK_")) return "vendor/hljs";
  if (full.includes("AbsoluteCorrelation") || full.includes("AccuracyGoal")) return "vendor/hljs";
  if (full.includes("\u0432\u0435\u0431\u043A\u043B\u0438\u0435\u043D\u0442") || full.includes("\u043D\u0430\u043A\u043B\u0438\u0435\u043D\u0442\u0435")) return "vendor/hljs";
  if (sample.includes("\u0410-\u042F") || sample.includes("\u0434\u0430\u043B\u0435\u0435")) return "vendor/hljs";
  if (full.includes("$pattern") && full.includes("keywords")) return "vendor/hljs";

  // AWS SDK
  if (sample.includes("CredentialsProvider") || sample.includes("@aws-sdk") || sample.includes("Bedrock")) return "vendor/aws";
  if (sample.includes("NodeDeprecationWarning") && sample.includes("AWS SDK")) return "vendor/aws";

  // gRPC
  if (sample.includes("LogVerbosity") || sample.includes("ChannelCredentials") || sample.includes("grpc")) return "vendor/grpc";

  // Protobuf
  if (sample.includes("protobuf") || sample.includes("FieldDescriptorProto")) return "vendor/proto";
  if (sample.includes("H.proto") && sample.includes("AnyValue")) return "vendor/proto";

  // Zod
  if (sample.includes("_zod") || sample.includes("ZodError")) return "vendor/zod";

  // Crypto / PKI / TLS (node-forge)
  if (sample.includes("ssh-") || sample.includes("cipher") || sample.includes("ECDH")) return "vendor/crypto";
  if (sample.includes("f$.pki") || sample.includes("f$.asn1") || sample.includes("forge")) return "vendor/crypto";
  if (sample.includes("hmac") && sample.includes("createBuffer")) return "vendor/crypto";

  // AJV
  if (sample.includes("ajv") || (sample.includes("$ref") && sample.includes("schema"))) return "vendor/ajv";

  // React / React DOM (Ink uses React)
  if (sample.includes("Minified React error") || sample.includes("react.element")) return "vendor/react";

  // HTML parser (parse5)
  if (sample.includes("TAG_NAMES") || sample.includes("NAMESPACES") || sample.includes("IN_BODY_MODE")) return "vendor/parse5";
  if (sample.includes("DTD") && sample.includes("HTML")) return "vendor/parse5";

  // HTML entities
  if (full.includes("Acirc") && full.includes("acirc")) return "vendor/entities";
  if (full.includes("CirclePlus") || (full.includes("59, 1,") && full.length > 40000)) return "vendor/entities";
  if (sample.match(/^\s+\d+:\s+\d+,$/m)) return "vendor/entities";

  // XML parser (fast-xml-parser)
  if (sample.includes("XMLBuilder") || sample.includes("XMLParser") || sample.includes("XMLValidator")) return "vendor/xml";

  return "chunks";
}

// --- Clean dirs ---
for (const d of ["vendor/hljs", "vendor/aws", "vendor/grpc", "vendor/proto", "vendor/zod", "vendor/crypto", "vendor/ajv", "vendor/react", "vendor/parse5", "vendor/entities", "vendor/xml", "vendor", "chunks"]) {
  fs.rmSync(path.join(ROOT, "src", d), { recursive: true, force: true });
}

// --- Extract ---
const extractions = [];
const cats = {};

for (const mod of big) {
  const cat = categorize(mod);
  const outDir = path.join(ROOT, "src", cat);
  fs.mkdirSync(outDir, { recursive: true });

  const code = lines.slice(mod.startLine, mod.endLine + 1).join("\n");
  fs.writeFileSync(path.join(outDir, `${mod.name}.js`), code + "\n");

  extractions.push({ ...mod, cat });
  if (!cats[cat]) cats[cat] = { count: 0, size: 0 };
  cats[cat].count++;
  cats[cat].size += mod.size;
}

// --- Summary ---
let totalSize = 0;
console.log(`Extracted ${extractions.length} modules > ${THRESHOLD / 1024} KB:\n`);
for (const [cat, info] of Object.entries(cats).sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  ${cat.padEnd(18)} ${String(info.count).padStart(3)} modules  ${(info.size / 1024).toFixed(0).padStart(7)} KB`);
  totalSize += info.size;
}
console.log(`  ${"TOTAL".padEnd(18)} ${String(extractions.length).padStart(3)} modules  ${(totalSize / 1024).toFixed(0).padStart(7)} KB  (${(totalSize / content.length * 100).toFixed(0)}% of source)\n`);

// --- Build cli_split.js ---
// Sort by line number
extractions.sort((a, b) => a.startLine - b.startLine);

// Check no overlaps
for (let i = 1; i < extractions.length; i++) {
  if (extractions[i].startLine <= extractions[i - 1].endLine) {
    console.error(`OVERLAP: ${extractions[i - 1].name}(L${extractions[i-1].startLine}-${extractions[i-1].endLine}) and ${extractions[i].name}(L${extractions[i].startLine}-${extractions[i].endLine})`);
    process.exit(1);
  }
}

const newLines = [];
let skip = -1;

for (let i = 0; i < lines.length; i++) {
  if (i <= skip) continue;

  const ext = extractions.find(e => e.startLine === i);
  if (ext) {
    newLines.push(`${ext.indent}/* [${ext.cat}/${ext.name}] */ eval(require("fs").readFileSync(require("path").resolve(__dirname, "${ext.cat}/${ext.name}.js"), "utf8"));`);
    skip = ext.endLine;
  } else {
    newLines.push(lines[i]);
  }
}

const result = newLines.join("\n");
fs.writeFileSync(OUT, result);

console.log(`Wrote src/cli_split.js:`);
console.log(`  Size:  ${(result.length / 1e6).toFixed(1)} MB (was ${(content.length / 1e6).toFixed(1)} MB, -${((content.length - result.length) / 1e6).toFixed(1)} MB)`);
console.log(`  Lines: ${newLines.length.toLocaleString()} (was ${lines.length.toLocaleString()}, -${(lines.length - newLines.length).toLocaleString()})`);

// --- List extracted files ---
console.log(`\nFiles created:`);
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) walk(path.join(dir, f.name));
    else {
      const rel = path.relative(ROOT, path.join(dir, f.name));
      const sz = fs.statSync(path.join(dir, f.name)).size;
      console.log(`  ${rel.padEnd(45)} ${(sz / 1024).toFixed(0).padStart(6)} KB`);
    }
  }
};
for (const d of ["src/vendor", "src/chunks"]) {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) walk(p);
}

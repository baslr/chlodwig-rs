#!/usr/bin/env bun
/**
 * Renames extracted files (sections/, chunks/, core/) from hash names
 * to readable names based on content analysis.
 *
 * Safe approach: collects ALL renames first, verifies ALL references exist
 * in cli_split.js, then applies atomically.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");

const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
let splitContent = fs.readFileSync(SPLIT, "utf8");

function camelToKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function bestNameForFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  // Strategy 1: Find named symbols via name-map
  const namedSymbols = [];
  const funcRe = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const classRe = /\bclass\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

  let m;
  while ((m = funcRe.exec(code)) !== null) {
    const readable = nameMap[m[1]];
    if (readable && readable !== "default") {
      const name = Array.isArray(readable) ? readable[0] : readable;
      if (!name.startsWith("init(") && !name.startsWith("module(") && name.length > 3) {
        namedSymbols.push(name);
      }
    }
  }
  while ((m = classRe.exec(code)) !== null) {
    const readable = nameMap[m[1]];
    if (readable && readable !== "default") {
      const name = Array.isArray(readable) ? readable[0] : readable;
      if (!name.startsWith("init(") && name.length > 3) {
        namedSymbols.push(name);
      }
    }
  }

  if (namedSymbols.length > 0) {
    const unique = [...new Set(namedSymbols)];
    unique.sort((a, b) => {
      const aIsPascal = /^[A-Z]/.test(a);
      const bIsPascal = /^[A-Z]/.test(b);
      if (aIsPascal && !bIsPascal) return -1;
      if (!aIsPascal && bIsPascal) return 1;
      return b.length - a.length;
    });
    return camelToKebab(unique[0]);
  }

  // Strategy 2: G()-block dependency calls → check if called blocks have labels
  // The first few lines of a section file are G()-dep calls like: RR7(); pR7();
  const depCalls = [];
  for (const line of code.split("\n").slice(0, 30)) {
    const dm = line.match(/^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(\);?\s*$/);
    if (dm) {
      const label = nameMap[dm[1]];
      if (label && typeof label === "string" && label.startsWith("init(")) {
        depCalls.push(label.slice(5, -1)); // Extract name from init(...)
      }
    } else if (depCalls.length > 0) {
      break; // Stop after dep calls end
    }
  }
  // If many deps reference a theme, use that
  if (depCalls.length > 0) {
    // Pick the most specific/longest dep label
    depCalls.sort((a, b) => b.length - a.length);
    return camelToKebab(depCalls[0]);
  }

  // Strategy 3: Distinctive string literals
  const stringHints = [];
  // Look for error class names, feature names, tool names
  const strPatterns = [
    /"((?:[A-Z][a-z]+){2,}(?:Error|Exception|Command|Tool|Client|Provider|Handler|Manager|Dialog|Component))"/g,
    /"((?:get|set|create|init|start|stop|run|check|validate|parse|build|render|fetch|load|save|update|delete|remove|clear|find|is)[A-Z][a-zA-Z]{4,})"/g,
    /description:\s*"([^"]{10,60})"/g,
  ];

  for (const re of strPatterns) {
    while ((m = re.exec(code)) !== null) {
      stringHints.push(m[1]);
    }
  }

  if (stringHints.length > 0) {
    // Prefer shorter, more specific names
    stringHints.sort((a, b) => a.length - b.length);
    const best = stringHints[0];
    if (best.length <= 40) {
      return camelToKebab(best);
    }
  }

  // Strategy 4: Module pattern keywords
  const keywords = [];
  if (code.includes("createElement") || code.includes("useState")) keywords.push("react-component");
  if (code.includes("MCP") || code.includes("mcp")) keywords.push("mcp");
  if (code.includes("permission") || code.includes("Permission")) keywords.push("permissions");
  if (code.includes("oauth") || code.includes("OAuth")) keywords.push("oauth");
  if (code.includes("telemetry") || code.includes("Telemetry") || code.includes("OTEL")) keywords.push("telemetry");
  if (code.includes("streaming") || code.includes("StreamEvent")) keywords.push("streaming");
  if (code.includes("conversation") || code.includes("Conversation")) keywords.push("conversation");
  if (code.includes("git ") || code.includes("gitExe")) keywords.push("git");
  if (code.includes("sandbox") || code.includes("Sandbox")) keywords.push("sandbox");
  if (code.includes("Bedrock") || code.includes("bedrock")) keywords.push("bedrock");
  if (code.includes("Vertex") || code.includes("vertex")) keywords.push("vertex");
  if (code.includes("REPL") || code.includes("repl")) keywords.push("repl");
  if (code.includes("voice") || code.includes("Voice")) keywords.push("voice");
  if (code.includes("hook") || code.includes("Hook")) keywords.push("hooks");
  if (code.includes("tool_use") || code.includes("ToolUse")) keywords.push("tool-use");
  if (code.includes("slash") || code.includes("SlashCommand")) keywords.push("slash-command");
  if (code.includes("onboarding") || code.includes("Onboarding")) keywords.push("onboarding");
  if (code.includes("session") || code.includes("Session")) keywords.push("session");
  if (code.includes("bridge") || code.includes("Bridge")) keywords.push("bridge");
  if (code.includes("extension") || code.includes("Extension")) keywords.push("extension");
  if (code.includes("cron") || code.includes("Cron") || code.includes("schedule")) keywords.push("cron");
  if (code.includes("diff") || code.includes("Diff") && code.includes("patch")) keywords.push("diff");

  if (keywords.length > 0) {
    // Only use keyword if it's specific enough (not overly generic)
    const generic = new Set(["react-component", "repl", "session", "hooks", "permissions", "mcp", "conversation", "git", "streaming"]);
    const specific = keywords.filter(k => !generic.has(k));
    if (specific.length > 0) return specific[0];
    // If only generic keywords, only use them if file is large (>15KB = likely a main module for that topic)
    if (code.length > 15000 && keywords.length > 0) return keywords[0];
  }

  return null;
}

// --- Collect all rename candidates ---
const dirs = ["sections", "chunks", "core"];
const renames = []; // { dir, oldBase, newBase }
const globalUsedNames = new Set();

for (const dir of dirs) {
  const fullDir = path.join(ROOT, "src", dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir).filter(f => f.endsWith(".js")).sort();

  for (const file of files) {
    const oldBase = path.basename(file, ".js");
    const filePath = path.join(fullDir, file);
    const newName = bestNameForFile(filePath);

    if (!newName) continue;

    // Deduplicate globally — use original hash as suffix instead of counter
    let finalName = newName;
    if (globalUsedNames.has(`${dir}/${finalName}`)) {
      finalName = `${newName}--${oldBase}`;
    }
    globalUsedNames.add(`${dir}/${finalName}`);

    renames.push({ dir, oldBase, newBase: finalName });
  }
}

console.log(`Found ${renames.length} files to rename\n`);

// --- Verify ALL old references exist in cli_split.js ---
let allFound = true;
for (const r of renames) {
  const oldRef = `${r.dir}/${r.oldBase}.js`;
  if (!splitContent.includes(oldRef)) {
    console.error(`ERROR: Reference not found in cli_split.js: ${oldRef}`);
    allFound = false;
  }
}
if (!allFound) {
  console.error("Aborting due to missing references");
  process.exit(1);
}

// --- Apply string replacements in cli_split.js ---
// Do all replacements at once to avoid partial state
for (const r of renames) {
  const oldRef = `${r.dir}/${r.oldBase}.js`;
  const newRef = `${r.dir}/${r.newBase}.js`;
  // Also update the comment: /* [sections/XXX] */ → /* [sections/newname] */
  const oldComment = `[${r.dir}/${r.oldBase}]`;
  const newComment = `[${r.dir}/${r.newBase}]`;

  splitContent = splitContent.split(oldRef).join(newRef);
  splitContent = splitContent.split(oldComment).join(newComment);
}

fs.writeFileSync(SPLIT, splitContent);
console.log(`Updated cli_split.js\n`);

// --- Rename physical files ---
for (const r of renames) {
  const oldPath = path.join(ROOT, "src", r.dir, `${r.oldBase}.js`);
  const newPath = path.join(ROOT, "src", r.dir, `${r.newBase}.js`);
  fs.renameSync(oldPath, newPath);
}

// --- Report ---
const byDir = {};
for (const r of renames) {
  if (!byDir[r.dir]) byDir[r.dir] = [];
  byDir[r.dir].push(r);
}

for (const [dir, items] of Object.entries(byDir)) {
  console.log(`${dir}/ (${items.length} renamed):`);
  for (const r of items.slice(0, 30)) {
    console.log(`  ${r.oldBase.padEnd(10)} → ${r.newBase}`);
  }
  if (items.length > 30) console.log(`  ... +${items.length - 30} more`);
  console.log();
}

// Summary
for (const dir of dirs) {
  const fullDir = path.join(ROOT, "src", dir);
  if (!fs.existsSync(fullDir)) continue;
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith(".js"));
  const renamed = files.filter(f => f.includes("-") || f.length > 8);
  console.log(`${dir}/: ${renamed.length} readable / ${files.length} total`);
}

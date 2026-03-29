#!/usr/bin/env bun
/**
 * Builds a function-level call graph from cli_split.js + sections.
 *
 * The existing dep-graph.json only tracks G()-block dependencies.
 * This script adds function→function call edges:
 *   - ~11,000 function nodes
 *   - ~60,000+ direct call edges
 *   - Hot-path discovery from entry points (REPL, main, authLogin)
 *   - Dead function detection
 *   - Cycle detection
 *
 * Output: src/call-graph.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const ZONE_MAP = path.join(ROOT, "src", "zone-map.json");
const OUT = path.join(ROOT, "src", "call-graph.json");

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

// =====================================================================
// Phase 1: Parse all function definitions
// =====================================================================
console.log("Phase 1: Parsing function definitions...");

const funcStartRe = /^(\s*)(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
const assignFuncRe = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\(/;
const arrowRe = /^\s*(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/;
const gBlockRe = /^\s*(?:var\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*G\(\s*\(\)\s*=>\s*\{/;

const functions = new Map(); // name → { startLine, endLine, zone, source, body }

function parseFunctions(sourceLines, source, lineOffset) {
  for (let i = 0; i < sourceLines.length; i++) {
    let funcName = null;

    const fm = sourceLines[i].match(funcStartRe);
    if (fm) funcName = fm[2];

    if (!funcName) {
      const am = sourceLines[i].match(assignFuncRe);
      if (am) funcName = am[1];
    }

    // G()-block initializers: var NAME = G(() => { ... })
    // These are the lazy module init closures — important for tracing imports
    if (!funcName) {
      const gm = sourceLines[i].match(gBlockRe);
      if (gm) funcName = gm[1];
    }

    // Skip arrows for now — too many false positives and tiny one-liners
    if (!funcName) continue;
    if (funcName.length < 2) continue;

    // Find end of function — count braces
    let depth = 0;
    let endLine = -1;
    for (let j = i; j < sourceLines.length && j < i + 3000; j++) {
      for (const ch of sourceLines[j]) {
        if (ch === "{") depth++;
        if (ch === "}") depth--;
      }
      if (depth === 0 && j > i) {
        endLine = j;
        break;
      }
    }
    if (endLine === -1) continue;

    const body = sourceLines.slice(i, endLine + 1).join("\n");
    const globalLine = lineOffset + i + 1;

    // Keep highest-scoring (longest) definition if duplicate
    const existing = functions.get(funcName);
    if (!existing || body.length > (existing.body?.length || 0)) {
      functions.set(funcName, {
        startLine: globalLine,
        endLine: lineOffset + endLine + 1,
        lineCount: endLine - i + 1,
        zone: source === "inline" ? getZone(globalLine) : 0,
        source,
        body,
      });
    }
  }
}

// Parse inline functions in cli_split.js
parseFunctions(lines, "inline", 0);

// Parse section files
if (fs.existsSync(SECTIONS)) {
  for (const file of fs.readdirSync(SECTIONS).filter(f => f.endsWith(".js"))) {
    const sContent = fs.readFileSync(path.join(SECTIONS, file), "utf8");
    const sLines = sContent.split("\n");
    parseFunctions(sLines, `sections/${file}`, 0);
  }
}

console.log(`  Found ${functions.size} function definitions\n`);

// =====================================================================
// Phase 2: Extract call sites per function
// =====================================================================
console.log("Phase 2: Extracting call sites...");

// JS builtins / noise to skip
const SKIP_CALLS = new Set([
  // JS keywords that look like calls
  "function", "if", "for", "while", "switch", "catch", "return", "throw",
  "typeof", "instanceof", "void", "delete", "new", "class", "async", "await",
  "import", "export", "yield", "debugger",
  // JS builtins
  "Array", "Object", "String", "Number", "Boolean", "Symbol", "BigInt",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "Proxy", "Reflect",
  "Date", "RegExp", "Error", "TypeError", "RangeError", "SyntaxError",
  "ReferenceError", "URIError", "EvalError", "Math", "JSON", "Intl",
  "parseInt", "parseFloat", "isNaN", "isFinite", "eval",
  "encodeURI", "decodeURI", "encodeURIComponent", "decodeURIComponent",
  "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "setImmediate", "clearImmediate", "queueMicrotask",
  // Common methods (skip — can't trace without receiver type)
  "require", "console", "process",
  // String/Array methods that appear as standalone due to destructuring
  "slice", "map", "filter", "push", "join", "includes", "match",
  "replace", "toString", "indexOf", "forEach", "reduce", "find",
  "some", "every", "concat", "split", "trim", "startsWith", "endsWith",
  "keys", "values", "entries", "assign", "create", "defineProperty",
  "getOwnPropertyNames", "hasOwnProperty", "isPrototypeOf",
  "from", "bind", "call", "apply", "then", "catch", "finally",
  "resolve", "reject", "all", "allSettled", "race", "any",
  "log", "warn", "error", "info", "debug", "trace",
  "exit", "cwd", "env", "argv", "stdin", "stdout", "stderr",
  "on", "off", "emit", "once", "removeListener", "addEventListener",
  "write", "read", "close", "end", "pipe", "destroy",
  "freeze", "seal", "preventExtensions", "is",
  "stringify", "parse",
]);

// Extract direct function calls from a body
function extractCalls(body) {
  const calls = new Set();
  const telemetry = [];
  const keybindings = [];

  // Direct calls: name( — but NOT .name( (method calls)
  const callRe = /(?<![.\w$])([a-zA-Z_$][a-zA-Z0-9_$]{1,})\s*\(/g;
  let m;
  while ((m = callRe.exec(body)) !== null) {
    const name = m[1];
    if (SKIP_CALLS.has(name)) continue;
    // Skip if preceded by dot (method call) — double check
    const before = body.charAt(m.index - 1);
    if (before === ".") continue;
    calls.add(name);
  }

  // Telemetry: Q("tengu_xxx", ...)
  const telRe = /\bQ\(\s*"(tengu_[a-z_]+)"/g;
  while ((m = telRe.exec(body)) !== null) {
    telemetry.push(m[1]);
  }

  // Keybindings: G$("ns:action")
  const kbRe = /G\$\(\s*"([a-z]+:[a-zA-Z]+)"/g;
  while ((m = kbRe.exec(body)) !== null) {
    keybindings.push(m[1]);
  }

  // Lazy-accessor imports: (init(), Rq(module)) or .then(() => (init(), module))
  // These are the cross-module import pattern in the bundled code.
  // We add the init function as a call edge — it triggers the G()-block init.
  const lazyRe = /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\(\),\s*(?:Rq\()?([a-zA-Z_$][a-zA-Z0-9_$]*)\)?\)/g;
  while ((m = lazyRe.exec(body)) !== null) {
    const initFn = m[1];
    if (!SKIP_CALLS.has(initFn)) calls.add(initFn);
  }

  // Destructured lazy imports: let { exportName: localVar } = await ...then(() => (init(), module))
  // The localVar is later called as localVar() — already caught by direct call regex.
  // But we also want to trace the destructured property to its source module.
  // Pattern: { name: local } = await Promise.resolve().then(() => (init(), module))
  const destructRe = /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(?::\s*[a-zA-Z_$][a-zA-Z0-9_$]*)?\s*\}\s*=\s*await\s+Promise\.resolve\(\)\.then\(\(\)\s*=>\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\(\),\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\)\)/g;
  while ((m = destructRe.exec(body)) !== null) {
    const exportedName = m[1];
    const initFn = m[2];
    if (!SKIP_CALLS.has(exportedName)) calls.add(exportedName);
    if (!SKIP_CALLS.has(initFn)) calls.add(initFn);
  }

  return { calls: [...calls], telemetry, keybindings };
}

let totalEdges = 0;
const funcNodes = new Map(); // name → node data
const calledByMap = new Map(); // name → Set of callers

for (const [name, info] of functions) {
  const { calls, telemetry, keybindings } = extractCalls(info.body);

  // Filter calls to only those that are known function definitions
  const resolvedCalls = calls.filter(c => functions.has(c) && c !== name);

  // Track calledBy
  for (const target of resolvedCalls) {
    if (!calledByMap.has(target)) calledByMap.set(target, new Set());
    calledByMap.get(target).add(name);
  }

  totalEdges += resolvedCalls.length;

  // Readable name from name-map
  const nmEntry = nameMap[name];
  const readable = nmEntry
    ? (Array.isArray(nmEntry) ? nmEntry[0] : nmEntry)
    : null;

  funcNodes.set(name, {
    name: readable && readable.length > 2 && !readable.startsWith("init(") && !readable.startsWith("deps(") && !readable.startsWith("block(")
      ? readable : name,
    hash: name,
    zone: info.zone,
    line: info.startLine,
    lines: info.lineCount,
    source: info.source,
    calls: resolvedCalls,
    callCount: resolvedCalls.length,
    telemetry,
    keybindings,
  });
}

// Add calledBy counts
for (const [name, node] of funcNodes) {
  const callers = calledByMap.get(name);
  node.callerCount = callers ? callers.size : 0;
  node.calledBy = callers ? [...callers] : [];
}

console.log(`  ${funcNodes.size} function nodes, ${totalEdges} call edges\n`);

// =====================================================================
// Phase 3: Hot-path discovery (BFS from entry points)
// =====================================================================
console.log("Phase 3: Discovering hot paths...");

const ENTRY_POINTS = ["dyK", "REPL", "main", "authLogin", "DoctorComponent", "scanForSecrets", "setup"];

// Build reverse name map: readable name → hash (for entry point lookup)
const readableToHash = new Map();
for (const [hash, node] of funcNodes) {
  if (node.name && node.name !== hash) {
    // If multiple hashes map to same readable name, prefer the one with more calls
    const existing = readableToHash.get(node.name);
    if (!existing || node.callCount > (funcNodes.get(existing)?.callCount || 0)) {
      readableToHash.set(node.name, hash);
    }
  }
}

// Resolve entry points to their hash names
function resolveEntryPoint(name) {
  if (funcNodes.has(name)) return name;
  const hash = readableToHash.get(name);
  if (hash && funcNodes.has(hash)) return hash;
  return null;
}

function bfsHotPaths(startName, maxDepth = 8) {
  const paths = [];
  const queue = [[startName]];
  const visited = new Set([startName]);
  let explored = 0;

  while (queue.length > 0 && explored < 500) {
    const currentPath = queue.shift();
    const current = currentPath[currentPath.length - 1];
    const node = funcNodes.get(current);
    if (!node) continue;
    explored++;

    if (currentPath.length >= 2) {
      paths.push([...currentPath]);
    }

    if (currentPath.length >= maxDepth) continue;

    // Explore callees, prioritize by callee's own call count
    const callees = node.calls
      .filter(c => !visited.has(c) && funcNodes.has(c))
      .sort((a, b) => (funcNodes.get(b)?.callCount || 0) - (funcNodes.get(a)?.callCount || 0))
      .slice(0, 15); // Limit branching

    for (const callee of callees) {
      visited.add(callee);
      queue.push([...currentPath, callee]);
    }
  }

  // Return top paths by depth
  return paths
    .sort((a, b) => b.length - a.length)
    .slice(0, 20)
    .map(p => ({
      path: p.map(name => funcNodes.get(name)?.name || name),
      hashes: p,
      depth: p.length,
    }));
}

const hotPaths = {};
for (const entry of ENTRY_POINTS) {
  const resolved = resolveEntryPoint(entry);
  if (resolved) {
    const label = entry; // Use readable name as key
    hotPaths[label] = bfsHotPaths(resolved);
    console.log(`  ${label}: ${hotPaths[label].length} paths (max depth ${hotPaths[label][0]?.depth || 0})`);
  } else {
    console.log(`  ${entry}: not found`);
  }
}

// =====================================================================
// Phase 4: Dead function detection
// =====================================================================
console.log("\nPhase 4: Detecting dead functions...");

// Entry points: functions with 0 callers that are NOT G()-block inits, React components,
// or exported functions
const deadFunctions = [];
const entryPointHashes = new Set(ENTRY_POINTS.map(e => resolveEntryPoint(e)).filter(Boolean));

for (const [name, node] of funcNodes) {
  if (node.callerCount === 0 && !entryPointHashes.has(name)) {
    // Check if it's an exported function (referenced in J_() blocks)
    // or a React component (has createElement calls)
    const isComponent = node.calls.some(c => c === "createElement") ||
                        (nameMap[name] && String(nameMap[name]).includes("Component"));
    if (!isComponent && node.lines > 5) {
      deadFunctions.push({
        name: node.name,
        hash: name,
        zone: node.zone,
        lines: node.lines,
        callCount: node.callCount,
      });
    }
  }
}

deadFunctions.sort((a, b) => b.lines - a.lines);
console.log(`  ${deadFunctions.length} potentially dead functions (0 callers, >5 lines)`);

// =====================================================================
// Phase 5: Cycle detection (limited DFS)
// =====================================================================
console.log("\nPhase 5: Detecting cycles...");

const cycles = [];
const globalVisited = new Set();

function findCycles(start) {
  const stack = [start];
  const stackSet = new Set([start]);
  const dfsVisited = new Set([start]);

  function dfs(current, depth) {
    if (depth > 10) return; // Limit depth
    const node = funcNodes.get(current);
    if (!node) return;

    for (const callee of node.calls) {
      if (stackSet.has(callee)) {
        // Found cycle!
        const cycleStart = stack.indexOf(callee);
        const cycle = stack.slice(cycleStart).concat(callee);
        if (cycle.length >= 3 && cycle.length <= 8) {
          cycles.push(cycle.map(n => funcNodes.get(n)?.name || n));
        }
        continue;
      }
      if (dfsVisited.has(callee) || globalVisited.has(callee)) continue;
      dfsVisited.add(callee);
      stack.push(callee);
      stackSet.add(callee);
      dfs(callee, depth + 1);
      stack.pop();
      stackSet.delete(callee);
    }
  }

  dfs(start, 0);
  for (const v of dfsVisited) globalVisited.add(v);
}

// Run cycle detection from top hub nodes
const sortedByOutgoing = [...funcNodes.entries()]
  .sort((a, b) => b[1].callCount - a[1].callCount)
  .slice(0, 200);

for (const [name] of sortedByOutgoing) {
  if (!globalVisited.has(name)) {
    findCycles(name);
  }
}

// Deduplicate cycles (same nodes, different rotation)
const uniqueCycles = [];
const cycleKeys = new Set();
for (const cycle of cycles) {
  const sorted = [...cycle.slice(0, -1)].sort().join(",");
  if (!cycleKeys.has(sorted)) {
    cycleKeys.add(sorted);
    uniqueCycles.push(cycle);
  }
}

console.log(`  ${uniqueCycles.length} unique cycles found`);

// =====================================================================
// Phase 6: Stats & output
// =====================================================================
console.log("\nPhase 6: Building output...");

// Top callers (most outgoing calls)
const topCallers = [...funcNodes.values()]
  .sort((a, b) => b.callCount - a.callCount)
  .slice(0, 30)
  .map(n => ({ name: n.name, hash: n.hash, zone: n.zone, outgoing: n.callCount, incoming: n.callerCount }));

// Top callees (most incoming calls)
const topCallees = [...funcNodes.values()]
  .sort((a, b) => b.callerCount - a.callerCount)
  .slice(0, 30)
  .map(n => ({ name: n.name, hash: n.hash, zone: n.zone, incoming: n.callerCount, outgoing: n.callCount }));

// Telemetry summary
const telemetryFunctions = [...funcNodes.values()]
  .filter(n => n.telemetry.length > 0)
  .map(n => ({ name: n.name, hash: n.hash, events: n.telemetry }));

// Keybinding summary
const keybindingFunctions = [...funcNodes.values()]
  .filter(n => n.keybindings.length > 0)
  .map(n => ({ name: n.name, hash: n.hash, bindings: n.keybindings }));

// Cross-module edges
let crossModuleEdges = 0;
for (const [name, node] of funcNodes) {
  for (const callee of node.calls) {
    const calleeNode = funcNodes.get(callee);
    if (calleeNode && calleeNode.zone !== node.zone && node.zone > 0 && calleeNode.zone > 0) {
      crossModuleEdges++;
    }
  }
}

// Build compact function index for JSON (skip body)
const functionIndex = {};
for (const [name, node] of funcNodes) {
  functionIndex[name] = {
    n: node.name,        // readable name
    z: node.zone,        // zone
    l: node.line,        // line number
    lc: node.lines,      // line count
    s: node.source,      // source
    c: node.calls,       // outgoing calls
    cb: node.calledBy,   // incoming callers
    co: node.callCount,  // outgoing count
    ci: node.callerCount, // incoming count
    t: node.telemetry.length > 0 ? node.telemetry : undefined,
    k: node.keybindings.length > 0 ? node.keybindings : undefined,
  };
}

const output = {
  generatedAt: new Date().toISOString(),
  totalFunctions: funcNodes.size,
  totalCallEdges: totalEdges,
  totalCrossModuleEdges: crossModuleEdges,

  stats: {
    topCallers,
    topCallees,
    avgCallsPerFunction: +(totalEdges / funcNodes.size).toFixed(1),
    avgCallersPerFunction: +(totalEdges / funcNodes.size).toFixed(1),
    telemetryFunctions: telemetryFunctions.length,
    keybindingFunctions: keybindingFunctions.length,
    deadFunctionCount: deadFunctions.length,
    cycleCount: uniqueCycles.length,
  },

  hotPaths,
  deadFunctions: deadFunctions.slice(0, 100), // Top 100 by line count
  cycles: uniqueCycles.slice(0, 50),

  telemetry: telemetryFunctions,
  keybindings: keybindingFunctions,

  functions: functionIndex,
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);

// --- Report ---
console.log(`\n${"=".repeat(60)}`);
console.log("Call-Graph Analysis Complete\n");

console.log(`  Functions:         ${funcNodes.size.toLocaleString()}`);
console.log(`  Call edges:        ${totalEdges.toLocaleString()}`);
console.log(`  Cross-module:      ${crossModuleEdges.toLocaleString()}`);
console.log(`  Avg calls/func:    ${(totalEdges / funcNodes.size).toFixed(1)}`);
console.log(`  Dead functions:    ${deadFunctions.length}`);
console.log(`  Cycles:            ${uniqueCycles.length}`);
console.log(`  Telemetry funcs:   ${telemetryFunctions.length}`);
console.log(`  Keybinding funcs:  ${keybindingFunctions.length}`);
console.log(`  Output:            src/call-graph.json (${sizeMB} MB)`);

console.log("\nTop 15 callers (most outgoing calls):");
for (const c of topCallers.slice(0, 15)) {
  console.log(`  ${c.name.padEnd(40)} → ${String(c.outgoing).padStart(4)} calls, ${String(c.incoming).padStart(4)} callers  (Z${c.zone})`);
}

console.log("\nTop 15 callees (most called functions):");
for (const c of topCallees.slice(0, 15)) {
  console.log(`  ${c.name.padEnd(40)} ← ${String(c.incoming).padStart(4)} callers, ${String(c.outgoing).padStart(4)} calls  (Z${c.zone})`);
}

if (uniqueCycles.length > 0) {
  console.log(`\nCycles (first ${Math.min(10, uniqueCycles.length)}):`);
  for (const cycle of uniqueCycles.slice(0, 10)) {
    console.log(`  ${cycle.join(" → ")}`);
  }
}

console.log("\nHot paths from entry points:");
for (const [entry, paths] of Object.entries(hotPaths)) {
  if (paths.length === 0) continue;
  console.log(`\n  ${entry} (${paths.length} paths, max depth ${paths[0].depth}):`);
  for (const p of paths.slice(0, 5)) {
    console.log(`    ${p.path.join(" → ")}`);
  }
}

console.log(`\nDead functions (top 10 by size):`);
for (const d of deadFunctions.slice(0, 10)) {
  console.log(`  ${d.name.padEnd(40)} ${String(d.lines).padStart(5)} lines  (Z${d.zone})`);
}

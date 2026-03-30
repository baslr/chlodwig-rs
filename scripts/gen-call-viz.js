#!/usr/bin/env bun
/**
 * Generates an interactive HTML visualization of the function call graph.
 *
 * Reads: call-graph.json, name-map.json, react-components.json
 * Output: src/call-graph.html (standalone, opens in any browser)
 *
 * Features:
 *   - Zone Chord Diagram: 8 zones with cross-zone call flows
 *   - Zone Force Graph: drill-down with directed edges (arrows)
 *   - Hot-Path Explorer: entry-point call chains
 *   - Cycle highlighting
 *   - Stats sidebar: top callers, top callees, dead functions
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CG_FILE = path.join(ROOT, "src", "call-graph.json");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const RC_FILE = path.join(ROOT, "src", "react-components.json");
const OUT = path.join(ROOT, "src", "call-graph.html");

const callGraph = JSON.parse(fs.readFileSync(CG_FILE, "utf8"));
const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
const rcData = JSON.parse(fs.readFileSync(RC_FILE, "utf8"));

console.log(`Building call-graph visualization: ${callGraph.totalFunctions} functions, ${callGraph.totalCallEdges} edges...`);

// --- Build zone flow matrix (8x8) from call edges ---
const zoneMatrix = Array.from({ length: 8 }, () => Array(8).fill(0));
const zoneCounts = Array(8).fill(0);

for (const [hash, func] of Object.entries(callGraph.functions)) {
  const fromZ = func.z;
  if (fromZ >= 1 && fromZ <= 8) {
    zoneCounts[fromZ - 1]++;
    for (const target of func.c) {
      const targetFunc = callGraph.functions[target];
      if (targetFunc) {
        const toZ = targetFunc.z;
        if (toZ >= 1 && toZ <= 8) {
          zoneMatrix[fromZ - 1][toZ - 1]++;
        }
      }
    }
  }
}

// --- Categorize functions ---
function categorize(hash, func) {
  // Check if it's a React component
  const comp = rcData.components.find(c => c.name === hash);
  if (comp) return "component";

  const nm = nameMap[hash];
  if (nm) {
    const nmStr = Array.isArray(nm) ? nm[0] : nm;
    if (nmStr.startsWith("init(")) return "init";
    if (nmStr.startsWith("deps(")) return "deps";
    if (nmStr.startsWith("block(")) return "block";
    if (nmStr.startsWith("refs(")) return "refs";
    if (nmStr.startsWith("telemetry(")) return "telemetry";
    if (nmStr.startsWith("component(")) return "component";
  }

  // Hooks (useXxx naming)
  if (func.n && func.n.startsWith("use")) return "hook";

  return "function";
}

// --- Build compact node list (filtered for viz) ---
// Include: functions with outgoing > 1 OR incoming > 2 OR lineCount >= 50
const significantSet = new Set();
for (const [hash, func] of Object.entries(callGraph.functions)) {
  if (func.co > 1 || func.ci > 2 || func.lc >= 50) {
    significantSet.add(hash);
  }
}

// Also include all nodes referenced in hot paths and cycles
for (const paths of Object.values(callGraph.hotPaths)) {
  for (const p of paths) {
    for (const h of p.hashes) significantSet.add(h);
  }
}
for (const cycle of callGraph.cycles) {
  // Cycles have readable names, need to reverse-lookup
  // They're stored as readable names, so we need to find them in hotPaths hashes
}

// Build cycle hash sets from the function index
const cycleNodeSets = [];
for (const cycle of callGraph.cycles) {
  // cycle is array of readable names — find the hashes
  const hashes = [];
  for (const name of cycle) {
    for (const [hash, func] of Object.entries(callGraph.functions)) {
      if (func.n === name) {
        hashes.push(hash);
        significantSet.add(hash);
        break;
      }
    }
  }
  if (hashes.length >= 2) cycleNodeSets.push(hashes);
}

const nodes = [];
for (const hash of significantSet) {
  const func = callGraph.functions[hash];
  if (!func) continue;
  const cat = categorize(hash, func);
  nodes.push({
    id: hash,
    n: func.n || hash,
    z: func.z,
    co: func.co,
    ci: func.ci,
    lc: func.lc,
    c: func.c.filter(t => significantSet.has(t)),
    cb: (func.cb || []).filter(t => significantSet.has(t)),
    cat,
    t: func.t, // telemetry
  });
}

console.log(`  Significant nodes: ${nodes.length} (of ${callGraph.totalFunctions})`);

// --- Top callers / callees ---
const topCallers = callGraph.stats.topCallers.slice(0, 20);
const topCallees = callGraph.stats.topCallees.slice(0, 20);

// --- Zone info ---
const zoneNames = [
  "Runtime & SDK",
  "Validation & Config",
  "Cloud Providers & Auth",
  "UI Framework & Rendering",
  "Tools & Permissions",
  "Conversation & Commands",
  "System Prompt, Session & App",
  "REPL, Skills & CLI Entry",
];

const zoneStats = zoneNames.map((name, i) => {
  const zoneNodes = nodes.filter(n => n.z === i + 1);
  const components = zoneNodes.filter(n => n.cat === "component").length;
  const hooks = zoneNodes.filter(n => n.cat === "hook").length;
  return {
    id: i + 1,
    name,
    total: zoneCounts[i],
    visible: zoneNodes.length,
    components,
    hooks,
    internalCalls: zoneMatrix[i][i],
    crossZoneCalls: zoneMatrix[i].reduce((s, v, j) => j !== i ? s + v : s, 0),
  };
});

// --- Hot paths (compact for viz) ---
const hotPathsViz = {};
for (const [entry, paths] of Object.entries(callGraph.hotPaths)) {
  hotPathsViz[entry] = paths.slice(0, 10).map(p => ({
    path: p.path,
    hashes: p.hashes,
    depth: p.depth,
  }));
}

// --- Build vizData ---
const vizData = {
  totalFunctions: callGraph.totalFunctions,
  totalEdges: callGraph.totalCallEdges,
  totalCrossModule: callGraph.totalCrossModuleEdges,
  visibleNodes: nodes.length,
  zoneMatrix,
  zoneNames,
  zoneStats,
  topCallers,
  topCallees,
  hotPaths: hotPathsViz,
  deadFunctions: callGraph.deadFunctions.slice(0, 30),
  cycles: callGraph.cycles.slice(0, 30),
  cycleHashes: cycleNodeSets.slice(0, 30),
  nodes: nodes.map(n => ({
    id: n.id, n: n.n, z: n.z, co: n.co, ci: n.ci, lc: n.lc,
    c: n.c, cb: n.cb, cat: n.cat,
    t: n.t && n.t.length > 0 ? n.t.slice(0, 3) : undefined,
  })),
  rcTotal: rcData.totalComponents,
  rcLabeled: rcData.labeledComponents,
  stats: callGraph.stats,
};

console.log(`  Viz data ready: ${nodes.length} nodes`);

// --- Generate HTML ---
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Claude Code 2.1.87 — Call Graph</title>
<script src="https://d3js.org/d3.v7.min.js"><\/script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; overflow: hidden; height: 100vh; }
#header { background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
#header h1 { font-size: 18px; font-weight: 600; color: #f0f6fc; }
#header .badge { background: #da3633; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
#header .stats { font-size: 13px; color: #8b949e; margin-left: auto; }
#nav { display: flex; gap: 8px; }
#nav button { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.15s; }
#nav button:hover { background: #30363d; }
#nav button.active { background: #1f6feb; border-color: #1f6feb; color: #fff; }
#search-box { background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 12px; border-radius: 6px; font-size: 13px; width: 200px; }
#search-box::placeholder { color: #484f58; }
#main { display: flex; height: calc(100vh - 52px); }
#viz { flex: 1; position: relative; overflow: hidden; }
#sidebar { width: 340px; background: #161b22; border-left: 1px solid #30363d; overflow-y: auto; padding: 16px; }
#sidebar h2 { font-size: 14px; font-weight: 600; color: #f0f6fc; margin: 16px 0 8px; }
#sidebar h2:first-child { margin-top: 0; }
.hub-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px; cursor: pointer; }
.hub-item:hover { color: #58a6ff; }
.hub-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.hub-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hub-count { color: #8b949e; font-variant-numeric: tabular-nums; }
.zone-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; margin: 2px 0; border-radius: 6px; font-size: 12px; cursor: pointer; transition: background 0.15s; }
.zone-item:hover { background: #21262d; }
.zone-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.zone-name { flex: 1; }
.zone-stat { color: #8b949e; font-variant-numeric: tabular-nums; font-size: 11px; }
.cycle-item { font-size: 11px; color: #f85149; padding: 3px 0; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cycle-item:hover { color: #ff7b72; }
.dead-item { font-size: 11px; color: #8b949e; padding: 2px 0; display: flex; gap: 6px; }
.dead-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dead-lines { color: #484f58; font-variant-numeric: tabular-nums; }
#tooltip { position: absolute; background: #1c2128; border: 1px solid #30363d; border-radius: 8px; padding: 12px; font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.15s; max-width: 380px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
#tooltip .tt-name { font-weight: 600; color: #f0f6fc; font-size: 14px; margin-bottom: 4px; }
#tooltip .tt-label { color: #8b949e; margin-bottom: 8px; }
#tooltip .tt-calls { color: #58a6ff; }
#tooltip .tt-callers { color: #3fb950; }
#tooltip .tt-zone { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 4px; }
#tooltip .tt-telemetry { color: #d29922; font-size: 11px; margin-top: 4px; }
#back-btn { display: none; position: absolute; top: 12px; left: 12px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; z-index: 10; }
#back-btn:hover { background: #30363d; }
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #8b949e; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; }
.hp-entry { font-size: 12px; color: #58a6ff; cursor: pointer; padding: 3px 0; }
.hp-entry:hover { color: #79c0ff; }
.hp-path { font-size: 10px; color: #8b949e; padding: 2px 0 2px 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
svg text { font-family: inherit; }
.chord-group text { fill: #c9d1d9; font-size: 11px; font-weight: 500; }
.node-label { fill: #8b949e; font-size: 9px; pointer-events: none; }
marker { overflow: visible; }
.section-toggle { font-size: 12px; color: #484f58; cursor: pointer; float: right; }
.section-toggle:hover { color: #8b949e; }
</style>
</head>
<body>
<div id="header">
  <h1>Claude Code 2.1.87</h1>
  <span class="badge">Call Graph</span>
  <div id="nav">
    <button class="active" onclick="showChord()">Zone Overview</button>
    <button onclick="showForce(0)">All Functions</button>
    <button onclick="showHotPaths()">Hot Paths</button>
    <input id="search-box" type="text" placeholder="Search functions..." oninput="onSearch(this.value)">
  </div>
  <div class="stats" id="header-stats"></div>
</div>
<div id="main">
  <div id="viz">
    <svg id="svg">
      <defs>
        <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,3 L0,6 Z" fill="#484f58"/>
        </marker>
        <marker id="arrow-hl" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,3 L0,6 Z" fill="#58a6ff"/>
        </marker>
      </defs>
    </svg>
    <button id="back-btn" onclick="showChord()">\\u2190 Back to Overview</button>
    <div id="tooltip"></div>
  </div>
  <div id="sidebar">
    <h2>Zones</h2>
    <div id="zone-list"></div>
    <h2>Top Callers <span class="section-toggle" id="toggle-callers" onclick="toggleSection('callers')">[hide]</span></h2>
    <div id="caller-list"></div>
    <h2>Top Callees <span class="section-toggle" id="toggle-callees" onclick="toggleSection('callees')">[hide]</span></h2>
    <div id="callee-list"></div>
    <h2>Hot Paths <span class="section-toggle" id="toggle-hotpaths" onclick="toggleSection('hotpaths')">[hide]</span></h2>
    <div id="hotpath-list"></div>
    <h2>Cycles (${callGraph.cycles.length}) <span class="section-toggle" id="toggle-cycles" onclick="toggleSection('cycles')">[show]</span></h2>
    <div id="cycle-list" style="display:none"></div>
    <h2>Dead Functions <span class="section-toggle" id="toggle-dead" onclick="toggleSection('dead')">[show]</span></h2>
    <div id="dead-list" style="display:none"></div>
    <h2>Legend</h2>
    <div class="legend" id="legend"></div>
    <h2>Summary</h2>
    <div id="summary"></div>
  </div>
</div>

<script>
const DATA = ${JSON.stringify(vizData)};

const ZONE_COLORS = [
  "#58a6ff", // 1 Runtime - blue
  "#3fb950", // 2 Validation - green
  "#d29922", // 3 Cloud/Auth - amber
  "#bc8cff", // 4 UI Framework - purple
  "#f78166", // 5 Tools - orange
  "#ff7b72", // 6 Conversation - red
  "#79c0ff", // 7 Session/App - light blue
  "#d2a8ff", // 8 REPL/CLI - light purple
];

const CAT_COLORS = {
  component: "#f78166",
  hook: "#79c0ff",
  init: "#58a6ff",
  deps: "#484f58",
  block: "#484f58",
  function: "#8b949e",
  refs: "#3fb950",
  telemetry: "#d29922",
};

// --- Sidebar ---
function buildSidebar() {
  document.getElementById("header-stats").textContent =
    DATA.totalFunctions.toLocaleString() + " functions \\u00b7 " +
    DATA.totalEdges.toLocaleString() + " calls \\u00b7 " +
    DATA.totalCrossModule.toLocaleString() + " cross-module";

  // Zone list
  const zl = document.getElementById("zone-list");
  zl.innerHTML = DATA.zoneStats.map((z, i) => \`
    <div class="zone-item" onclick="showForce(\${z.id})">
      <div class="zone-color" style="background:\${ZONE_COLORS[i]}"></div>
      <div class="zone-name">Z\${z.id}: \${z.name}</div>
      <div class="zone-stat">\${z.total}</div>
    </div>
  \`).join("");

  // Top Callers (most outgoing)
  const cl = document.getElementById("caller-list");
  cl.innerHTML = DATA.topCallers.map(h => \`
    <div class="hub-item" onclick="highlightNode('\${h.hash}')">
      <div class="hub-dot" style="background:\${ZONE_COLORS[(h.zone||1) - 1]}"></div>
      <div class="hub-name" title="\${h.name}">\${h.name}</div>
      <div class="hub-count">\\u2192 \${h.outgoing}</div>
    </div>
  \`).join("");

  // Top Callees (most incoming)
  const cle = document.getElementById("callee-list");
  cle.innerHTML = DATA.topCallees.map(h => \`
    <div class="hub-item" onclick="highlightNode('\${h.hash}')">
      <div class="hub-dot" style="background:\${ZONE_COLORS[(h.zone||1) - 1]}"></div>
      <div class="hub-name" title="\${h.name}">\${h.name}</div>
      <div class="hub-count">\\u2190 \${h.incoming}</div>
    </div>
  \`).join("");

  // Hot Paths
  const hp = document.getElementById("hotpath-list");
  hp.innerHTML = Object.entries(DATA.hotPaths).map(([entry, paths]) => {
    if (!paths || paths.length === 0) return "";
    return \`
      <div class="hp-entry" onclick="showHotPathForEntry('\${entry}')">\${entry} (\${paths.length} paths, depth \${paths[0]?.depth || 0})</div>
      \${paths.slice(0, 3).map(p => \`<div class="hp-path">\${p.path.join(" \\u2192 ")}</div>\`).join("")}
    \`;
  }).join("");

  // Cycles
  const cy = document.getElementById("cycle-list");
  cy.innerHTML = DATA.cycles.map((cycle, i) => \`
    <div class="cycle-item" onclick="highlightCycle(\${i})" title="\${cycle.join(' \\u2192 ')}">\${cycle.join(" \\u2192 ")}</div>
  \`).join("");

  // Dead functions
  const df = document.getElementById("dead-list");
  df.innerHTML = DATA.deadFunctions.map(d => \`
    <div class="dead-item">
      <div class="dead-name" title="\${d.name}">\${d.name}</div>
      <div class="dead-lines">\${d.lines}L</div>
      <div class="zone-stat">Z\${d.zone}</div>
    </div>
  \`).join("");

  // Legend
  const lg = document.getElementById("legend");
  lg.innerHTML = [
    ["Component", CAT_COLORS.component],
    ["Hook", CAT_COLORS.hook],
    ["G()-init", CAT_COLORS.init],
    ["Function", CAT_COLORS.function],
    ["Telemetry", CAT_COLORS.telemetry],
    ["Refs", CAT_COLORS.refs],
  ].map(([name, color]) => \`
    <div class="legend-item"><div class="legend-dot" style="background:\${color}"></div>\${name}</div>
  \`).join("");

  // Summary
  document.getElementById("summary").innerHTML = \`
    <div style="font-size:12px; color:#8b949e; line-height:1.8">
      <div>Total functions: <b style="color:#c9d1d9">\${DATA.totalFunctions.toLocaleString()}</b></div>
      <div>Total call edges: <b style="color:#c9d1d9">\${DATA.totalEdges.toLocaleString()}</b></div>
      <div>Cross-module: <b style="color:#c9d1d9">\${DATA.totalCrossModule.toLocaleString()}</b></div>
      <div>Visible nodes: <b style="color:#c9d1d9">\${DATA.visibleNodes.toLocaleString()}</b></div>
      <div>Avg calls/func: <b style="color:#c9d1d9">\${DATA.stats.avgCallsPerFunction}</b></div>
      <div>Cycles: <b style="color:#f85149">\${DATA.stats.cycleCount}</b></div>
      <div>Dead functions: <b style="color:#d29922">\${DATA.stats.deadFunctionCount}</b></div>
      <div>Telemetry funcs: <b style="color:#c9d1d9">\${DATA.stats.telemetryFunctions}</b></div>
      <div>Keybinding funcs: <b style="color:#c9d1d9">\${DATA.stats.keybindingFunctions}</b></div>
      <div>React components: <b style="color:#c9d1d9">\${DATA.rcTotal}</b> (\${DATA.rcLabeled} labeled)</div>
    </div>
  \`;
}

function toggleSection(name) {
  const el = document.getElementById(name + "-list");
  const btn = document.getElementById("toggle-" + name);
  if (el.style.display === "none") {
    el.style.display = "";
    btn.textContent = "[hide]";
  } else {
    el.style.display = "none";
    btn.textContent = "[show]";
  }
}

// --- Tooltip ---
const tooltip = document.getElementById("tooltip");
function showTooltip(x, y, html) {
  tooltip.innerHTML = html;
  tooltip.style.opacity = 1;
  const r = tooltip.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  tooltip.style.left = (x + r.width + 20 > vw ? x - r.width - 10 : x + 10) + "px";
  tooltip.style.top = (y + r.height + 20 > vh ? y - r.height - 10 : y + 10) + "px";
}
function hideTooltip() { tooltip.style.opacity = 0; }

// --- SVG setup ---
const svg = d3.select("#svg");
let currentView = "chord";
let currentZone = 0;
let simulation = null;

function resizeSvg() {
  const viz = document.getElementById("viz");
  svg.attr("width", viz.clientWidth).attr("height", viz.clientHeight);
}
window.addEventListener("resize", () => {
  resizeSvg();
  if (currentView === "chord") showChord();
  else if (currentView === "hotpaths") showHotPaths();
  else showForce(currentZone);
});
resizeSvg();

// --- Chord Diagram ---
function showChord() {
  currentView = "chord";
  currentZone = 0;
  document.getElementById("back-btn").style.display = "none";
  document.querySelectorAll("#nav button").forEach((b, i) => b.classList.toggle("active", i === 0));
  svg.selectAll("*:not(defs)").remove();
  if (simulation) { simulation.stop(); simulation = null; }

  const w = +svg.attr("width");
  const h = +svg.attr("height");
  const outerR = Math.min(w, h) / 2 - 80;
  const innerR = outerR - 30;

  const g = svg.append("g").attr("transform", \`translate(\${w/2},\${h/2})\`);

  const chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);
  const chords = chord(DATA.zoneMatrix);

  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon = d3.ribbon().radius(innerR);

  // Groups (zone arcs)
  const group = g.selectAll(".chord-group")
    .data(chords.groups)
    .join("g")
    .attr("class", "chord-group")
    .style("cursor", "pointer")
    .on("click", (e, d) => showForce(d.index + 1))
    .on("mouseover", function(e, d) {
      const z = DATA.zoneStats[d.index];
      showTooltip(e.clientX, e.clientY, \`
        <div class="tt-name" style="color:\${ZONE_COLORS[d.index]}">Zone \${d.index + 1}: \${z.name}</div>
        <div class="tt-label">\${z.total} functions (\${z.visible} significant)</div>
        <div>\${z.components} components \\u00b7 \${z.hooks} hooks</div>
        <div>\${z.internalCalls} internal calls</div>
        <div>\${z.crossZoneCalls} cross-zone calls</div>
        <div style="margin-top:6px; color:#58a6ff">Click to explore \\u2192</div>
      \`);
    })
    .on("mouseout", hideTooltip);

  group.append("path")
    .attr("d", arc)
    .attr("fill", (d) => ZONE_COLORS[d.index])
    .attr("stroke", "#0d1117")
    .attr("stroke-width", 2);

  // Zone labels
  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", "0.35em")
    .attr("transform", d => \`
      rotate(\${(d.angle * 180 / Math.PI - 90)})
      translate(\${outerR + 12})
      \${d.angle > Math.PI ? "rotate(180)" : ""}
    \`)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .text((d) => "Z" + (d.index + 1) + " " + DATA.zoneNames[d.index]);

  // Ribbons (cross-zone call flows)
  g.selectAll(".chord-ribbon")
    .data(chords)
    .join("path")
    .attr("class", "chord-ribbon")
    .attr("d", ribbon)
    .attr("fill", d => ZONE_COLORS[d.source.index])
    .attr("fill-opacity", 0.15)
    .attr("stroke", d => ZONE_COLORS[d.source.index])
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 0.5)
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill-opacity", 0.4).attr("stroke-opacity", 0.6);
      const fromZ = d.source.index + 1;
      const toZ = d.target.index + 1;
      const count = DATA.zoneMatrix[d.source.index][d.target.index];
      const countBack = DATA.zoneMatrix[d.target.index][d.source.index];
      showTooltip(e.clientX, e.clientY, \`
        <div class="tt-name">Zone \${fromZ} \\u2192 Zone \${toZ}</div>
        <div>\${count} calls</div>
        \${fromZ !== toZ ? \`<div style="color:#8b949e">Zone \${toZ} \\u2192 Zone \${fromZ}: \${countBack}</div>\` : ""}
      \`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill-opacity", 0.15).attr("stroke-opacity", 0.3);
      hideTooltip();
    });

  // Center text
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-1em")
    .attr("fill", "#f0f6fc")
    .attr("font-size", "20px")
    .attr("font-weight", "600")
    .text(DATA.totalFunctions.toLocaleString() + " functions");
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.5em")
    .attr("fill", "#8b949e")
    .attr("font-size", "14px")
    .text(DATA.totalEdges.toLocaleString() + " call edges");
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "2em")
    .attr("fill", "#484f58")
    .attr("font-size", "12px")
    .text(DATA.totalCrossModule.toLocaleString() + " cross-module");
}

// --- Force Graph ---
function showForce(zone) {
  currentView = "force";
  currentZone = zone;
  document.getElementById("back-btn").style.display = "block";
  document.querySelectorAll("#nav button").forEach((b, i) => b.classList.toggle("active", i === 1));
  svg.selectAll("*:not(defs)").remove();
  if (simulation) { simulation.stop(); simulation = null; }

  const w = +svg.attr("width");
  const h = +svg.attr("height");

  // Filter nodes
  let zoneNodes = zone === 0 ? [...DATA.nodes] : DATA.nodes.filter(n => n.z === zone);

  // For "all" view, only show most significant
  if (zone === 0 && zoneNodes.length > 500) {
    zoneNodes = zoneNodes.filter(n => n.co >= 3 || n.ci >= 5 || n.cat === "component" || n.cat === "hook");
  }
  // Per-zone: if still too many, filter further
  if (zoneNodes.length > 400) {
    zoneNodes = zoneNodes.filter(n => n.co >= 2 || n.ci >= 3 || n.lc >= 50);
  }

  const nodeMap = new Map(zoneNodes.map(n => [n.id, n]));

  // Build directed links
  const links = [];
  for (const n of zoneNodes) {
    for (const target of n.c) {
      if (nodeMap.has(target)) {
        links.push({ source: n.id, target: target });
      }
    }
  }

  // Sizing
  const maxCi = Math.max(...zoneNodes.map(n => n.ci), 1);
  const nodeR = (n) => Math.max(3, Math.sqrt(n.ci / maxCi) * 22 + (n.co > 20 ? 4 : 0));

  // Container group for zoom
  const container = svg.append("g");

  // Force simulation
  simulation = d3.forceSimulation(zoneNodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(0.08))
    .force("charge", d3.forceManyBody().strength(-40))
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("collision", d3.forceCollide().radius(d => nodeR(d) + 3))
    .force("x", d3.forceX(w / 2).strength(0.03))
    .force("y", d3.forceY(h / 2).strength(0.03));

  // Draw links (directed)
  const link = container.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#21262d")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.4)
    .attr("marker-end", "url(#arrow)");

  // Draw nodes
  const node = container.append("g")
    .selectAll("circle")
    .data(zoneNodes)
    .join("circle")
    .attr("r", d => nodeR(d))
    .attr("fill", d => zone === 0 ? ZONE_COLORS[d.z - 1] || "#8b949e" : (CAT_COLORS[d.cat] || "#8b949e"))
    .attr("fill-opacity", 0.8)
    .attr("stroke", d => zone === 0 ? ZONE_COLORS[d.z - 1] || "#8b949e" : (CAT_COLORS[d.cat] || "#8b949e"))
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.4)
    .style("cursor", "pointer")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill-opacity", 1).attr("stroke-opacity", 1).attr("stroke-width", 3);
      const outSet = new Set(d.c);
      const inSet = new Set(d.cb);
      node.attr("fill-opacity", n => n.id === d.id || outSet.has(n.id) || inSet.has(n.id) ? 1 : 0.12);
      link.attr("stroke-opacity", l => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.03)
          .attr("stroke", l => {
            if (l.source.id === d.id) return "#58a6ff"; // outgoing = blue
            if (l.target.id === d.id) return "#3fb950"; // incoming = green
            return "#21262d";
          })
          .attr("stroke-width", l => l.source.id === d.id || l.target.id === d.id ? 1.5 : 0.5)
          .attr("marker-end", l => l.source.id === d.id ? "url(#arrow-hl)" : "url(#arrow)");

      const callNames = d.c.slice(0, 8).map(t => { const nd = DATA.nodes.find(n => n.id === t); return nd ? nd.n : t; });
      const callerNames = d.cb.slice(0, 5).map(t => { const nd = DATA.nodes.find(n => n.id === t); return nd ? nd.n : t; });
      showTooltip(e.clientX, e.clientY, \`
        <div class="tt-name">\${d.n}</div>
        <div class="tt-zone" style="background:\${ZONE_COLORS[d.z-1]}30; color:\${ZONE_COLORS[d.z-1]}">Zone \${d.z}: \${DATA.zoneNames[d.z-1] || "?"}</div>
        <div class="tt-label">\${d.cat} \\u00b7 \${d.lc} lines</div>
        <div class="tt-calls">\\u2192 Calls \${d.co}: \${callNames.join(", ")}\${d.co > 8 ? " +" + (d.co - 8) + " more" : ""}</div>
        <div class="tt-callers">\\u2190 Called by \${d.ci}: \${callerNames.join(", ")}\${d.cb.length > 5 ? " +" + (d.cb.length - 5) + " more" : ""}</div>
        \${d.t ? \`<div class="tt-telemetry">Telemetry: \${d.t.join(", ")}</div>\` : ""}
      \`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill-opacity", 0.8).attr("stroke-width", 1.5).attr("stroke-opacity", 0.4);
      node.attr("fill-opacity", 0.8);
      link.attr("stroke-opacity", 0.4).attr("stroke", "#21262d").attr("stroke-width", 0.5).attr("marker-end", "url(#arrow)");
      hideTooltip();
    })
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  // Labels for significant nodes
  const labels = container.append("g")
    .selectAll("text")
    .data(zoneNodes.filter(n => n.ci >= 8 || n.co >= 15 || (n.cat === "component" && n.n.length < 30 && n.co >= 5)))
    .join("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", d => nodeR(d) + 12)
    .text(d => {
      let t = d.n;
      if (t.length > 25) t = t.slice(0, 22) + "\\u2026";
      return t;
    });

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.2, 6])
    .on("zoom", (e) => { container.attr("transform", e.transform); });
  svg.call(zoom);

  // Tick
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
    labels
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

  // Info text
  svg.append("text")
    .attr("x", 16)
    .attr("y", h - 16)
    .attr("fill", "#484f58")
    .attr("font-size", "12px")
    .text(zone === 0
      ? \`All zones \\u00b7 \${zoneNodes.length} nodes (filtered) \\u00b7 \${links.length} edges \\u00b7 Blue=outgoing Green=incoming\`
      : \`Zone \${zone}: \${DATA.zoneNames[zone - 1]} \\u00b7 \${zoneNodes.length} nodes \\u00b7 \${links.length} edges\`);
}

// --- Hot Paths View ---
function showHotPaths() {
  currentView = "hotpaths";
  document.getElementById("back-btn").style.display = "block";
  document.querySelectorAll("#nav button").forEach((b, i) => b.classList.toggle("active", i === 2));
  svg.selectAll("*:not(defs)").remove();
  if (simulation) { simulation.stop(); simulation = null; }

  const w = +svg.attr("width");
  const h = +svg.attr("height");
  const container = svg.append("g");

  // Collect unique nodes and edges from all hot paths
  const pathNodes = new Map();
  const pathEdges = [];
  const entryPoints = Object.keys(DATA.hotPaths);

  for (const [entry, paths] of Object.entries(DATA.hotPaths)) {
    for (const p of paths.slice(0, 5)) {
      for (let i = 0; i < p.hashes.length; i++) {
        if (!pathNodes.has(p.hashes[i])) {
          const nd = DATA.nodes.find(n => n.id === p.hashes[i]);
          pathNodes.set(p.hashes[i], {
            id: p.hashes[i],
            n: p.path[i],
            z: nd ? nd.z : 0,
            cat: nd ? nd.cat : "function",
            co: nd ? nd.co : 0,
            ci: nd ? nd.ci : 0,
            isEntry: i === 0,
            depth: i,
          });
        }
        if (i < p.hashes.length - 1) {
          pathEdges.push({ source: p.hashes[i], target: p.hashes[i + 1] });
        }
      }
    }
  }

  // Deduplicate edges
  const edgeSet = new Set();
  const uniqueEdges = [];
  for (const e of pathEdges) {
    const key = e.source + ">" + e.target;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      uniqueEdges.push(e);
    }
  }

  const hpNodes = [...pathNodes.values()];
  if (hpNodes.length === 0) {
    container.append("text")
      .attr("x", w/2).attr("y", h/2)
      .attr("text-anchor", "middle")
      .attr("fill", "#8b949e")
      .attr("font-size", "16px")
      .text("No hot paths available");
    return;
  }

  const maxCo = Math.max(...hpNodes.map(n => n.co), 1);
  const nodeR = (n) => n.isEntry ? 18 : Math.max(5, Math.sqrt(n.co / maxCo) * 16 + 3);

  // Force layout
  simulation = d3.forceSimulation(hpNodes)
    .force("link", d3.forceLink(uniqueEdges).id(d => d.id).distance(80).strength(0.15))
    .force("charge", d3.forceManyBody().strength(-120))
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("collision", d3.forceCollide().radius(d => nodeR(d) + 8))
    .force("x", d3.forceX(w / 2).strength(0.02))
    .force("y", d3.forceY(h / 2).strength(0.02));

  const link = container.append("g")
    .selectAll("line")
    .data(uniqueEdges)
    .join("line")
    .attr("stroke", "#58a6ff")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.5)
    .attr("marker-end", "url(#arrow-hl)");

  const node = container.append("g")
    .selectAll("circle")
    .data(hpNodes)
    .join("circle")
    .attr("r", d => nodeR(d))
    .attr("fill", d => d.isEntry ? "#f0f6fc" : ZONE_COLORS[d.z - 1] || "#8b949e")
    .attr("fill-opacity", d => d.isEntry ? 1 : 0.8)
    .attr("stroke", d => d.isEntry ? "#58a6ff" : ZONE_COLORS[d.z - 1] || "#8b949e")
    .attr("stroke-width", d => d.isEntry ? 3 : 1.5)
    .attr("stroke-opacity", 0.6)
    .style("cursor", "pointer")
    .on("mouseover", function(e, d) {
      showTooltip(e.clientX, e.clientY, \`
        <div class="tt-name">\${d.n}</div>
        <div class="tt-zone" style="background:\${ZONE_COLORS[d.z-1]}30; color:\${ZONE_COLORS[d.z-1] || '#8b949e'}">Zone \${d.z}: \${DATA.zoneNames[d.z-1] || "?"}</div>
        <div class="tt-label">\${d.cat}\${d.isEntry ? " \\u00b7 Entry Point" : ""}</div>
        <div>\\u2192 \${d.co} outgoing \\u00b7 \\u2190 \${d.ci} incoming</div>
      \`);
    })
    .on("mouseout", hideTooltip)
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  // All nodes get labels in hot path view
  const labels = container.append("g")
    .selectAll("text")
    .data(hpNodes)
    .join("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", d => nodeR(d) + 14)
    .attr("fill", d => d.isEntry ? "#f0f6fc" : "#8b949e")
    .attr("font-size", d => d.isEntry ? "12px" : "9px")
    .attr("font-weight", d => d.isEntry ? "600" : "400")
    .text(d => {
      let t = d.n;
      if (t.length > 30) t = t.slice(0, 27) + "\\u2026";
      return t;
    });

  // Zoom
  svg.call(d3.zoom().scaleExtent([0.2, 6]).on("zoom", (e) => { container.attr("transform", e.transform); }));

  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
    labels.attr("x", d => d.x).attr("y", d => d.y);
  });

  svg.append("text")
    .attr("x", 16).attr("y", h - 16)
    .attr("fill", "#484f58").attr("font-size", "12px")
    .text(\`Hot Paths \\u00b7 \${hpNodes.length} nodes \\u00b7 \${uniqueEdges.length} edges \\u00b7 Entry points: \${entryPoints.join(", ")}\`);
}

function showHotPathForEntry(entry) {
  showHotPaths();
  setTimeout(() => {
    document.getElementById("search-box").value = entry;
    onSearch(entry);
  }, 500);
}

// --- Search ---
function onSearch(query) {
  if (!query || query.length < 2) {
    svg.selectAll("circle").attr("fill-opacity", 0.8).attr("stroke-width", 1.5);
    return;
  }
  const q = query.toLowerCase();
  svg.selectAll("circle")
    .attr("fill-opacity", d => (d.n || "").toLowerCase().includes(q) ? 1 : 0.08)
    .attr("stroke-width", d => (d.n || "").toLowerCase().includes(q) ? 3 : 0.5);
}

function highlightNode(id) {
  const n = DATA.nodes.find(n => n.id === id);
  if (!n) return;
  if (currentView === "chord") showForce(n.z);
  setTimeout(() => {
    document.getElementById("search-box").value = n.n.slice(0, 30);
    onSearch(n.n.slice(0, 30));
  }, 500);
}

function highlightCycle(index) {
  const hashes = DATA.cycleHashes[index];
  if (!hashes || hashes.length === 0) return;
  const first = DATA.nodes.find(n => n.id === hashes[0]);
  if (first && currentView === "chord") showForce(first.z);
  setTimeout(() => {
    const name = DATA.cycles[index][0];
    document.getElementById("search-box").value = name.slice(0, 20);
    onSearch(name.slice(0, 20));
  }, 500);
}

// --- Init ---
buildSidebar();
showChord();
<\/script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
const size = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\nGenerated: src/call-graph.html (${size} KB)`);
console.log(`Open with: open src/call-graph.html`);

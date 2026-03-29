#!/usr/bin/env bun
/**
 * Generates an interactive HTML visualization of the dependency graph.
 *
 * Reads: dep-graph.json, name-map.json, react-components.json
 * Output: src/dep-graph.html (standalone, opens in any browser)
 *
 * Features:
 *   - Zone Chord Diagram: 8 zones with cross-zone dependency flows
 *   - Zone Force Graph: drill-down into individual zones
 *   - Stats sidebar: hub nodes, zone stats, component counts
 *   - Search & hover tooltips
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DEP_GRAPH = path.join(ROOT, "src", "dep-graph.json");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const RC_FILE = path.join(ROOT, "src", "react-components.json");
const OUT = path.join(ROOT, "src", "dep-graph.html");

const depGraph = JSON.parse(fs.readFileSync(DEP_GRAPH, "utf8"));
const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
const rcData = JSON.parse(fs.readFileSync(RC_FILE, "utf8"));

console.log(`Building visualization from ${depGraph.totalNodes} nodes, ${depGraph.totalEdges} edges...`);

// --- Build zone flow matrix (8x8) ---
const zoneMatrix = Array.from({ length: 8 }, () => Array(8).fill(0));
for (const edge of depGraph.crossZoneEdges) {
  zoneMatrix[edge.fromZone - 1][edge.toZone - 1]++;
}
// Add internal deps to diagonal
for (const [zId, zInfo] of Object.entries(depGraph.zoneSummary)) {
  zoneMatrix[parseInt(zId) - 1][parseInt(zId) - 1] = zInfo.internalDeps;
}

// --- Build compact node list ---
const nodes = [];
for (const [id, info] of Object.entries(depGraph.nodes)) {
  const nm = nameMap[id];
  let label = id;
  let category = "plain";

  if (nm) {
    const nmStr = Array.isArray(nm) ? nm[0] : nm;
    label = nmStr;
    if (nmStr.startsWith("init(")) category = "init";
    else if (nmStr.startsWith("deps(")) category = "deps";
    else if (nmStr.startsWith("block(")) category = "block";
    else if (nmStr.startsWith("component(")) category = "component";
    else if (nmStr.startsWith("refs(")) category = "refs";
    else if (nmStr.startsWith("telemetry(")) category = "telemetry";
    else if (nmStr.endsWith("Component") || nmStr.endsWith("Dialog") || nmStr.endsWith("Display")) category = "component";
  }

  nodes.push({
    id,
    z: info.zone,
    l: label,
    c: category,
    dc: info.depCount,
    d: info.deps,
  });
}

// Sort by depCount descending for hub list
const hubs = [...nodes].sort((a, b) => b.dc - a.dc).slice(0, 30);

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
  const zId = String(i + 1);
  const summary = depGraph.zoneSummary[zId];
  const zoneNodes = nodes.filter(n => n.z === i + 1);
  const components = zoneNodes.filter(n => n.c === "component").length;
  return {
    id: i + 1,
    name,
    nodes: summary.blocks,
    internalDeps: summary.internalDeps,
    crossZoneDeps: summary.crossZoneDeps.reduce((s, d) => s + d.count, 0),
    components,
  };
});

// --- React component count per zone ---
const rcByZone = {};
for (const comp of rcData.components) {
  const z = comp.zone || 0;
  rcByZone[z] = (rcByZone[z] || 0) + 1;
}

// --- Build vizData ---
const vizData = {
  totalNodes: depGraph.totalNodes,
  totalEdges: depGraph.totalEdges,
  crossZoneCount: depGraph.crossZoneEdges.length,
  zoneMatrix,
  zoneNames,
  zoneStats,
  hubs: hubs.map(h => ({ id: h.id, l: h.l, z: h.z, dc: h.dc, c: h.c })),
  nodes: nodes.map(n => ({ id: n.id, z: n.z, l: n.l, c: n.c, dc: n.dc, d: n.d })),
  rcByZone,
  rcTotal: rcData.totalComponents,
  rcLabeled: rcData.labeledComponents,
};

console.log(`Viz data: ${nodes.length} nodes, ${hubs.length} hubs`);

// --- Generate HTML ---
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Claude Code 2.1.87 — Architecture</title>
<script src="https://d3js.org/d3.v7.min.js"><\/script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; overflow: hidden; height: 100vh; }
#header { background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 24px; display: flex; align-items: center; gap: 16px; }
#header h1 { font-size: 18px; font-weight: 600; color: #f0f6fc; }
#header .badge { background: #238636; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
#header .stats { font-size: 13px; color: #8b949e; margin-left: auto; }
#nav { display: flex; gap: 8px; }
#nav button { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.15s; }
#nav button:hover { background: #30363d; }
#nav button.active { background: #1f6feb; border-color: #1f6feb; color: #fff; }
#search-box { background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 12px; border-radius: 6px; font-size: 13px; width: 200px; }
#search-box::placeholder { color: #484f58; }
#main { display: flex; height: calc(100vh - 52px); }
#viz { flex: 1; position: relative; overflow: hidden; }
#sidebar { width: 320px; background: #161b22; border-left: 1px solid #30363d; overflow-y: auto; padding: 16px; }
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
#tooltip { position: absolute; background: #1c2128; border: 1px solid #30363d; border-radius: 8px; padding: 12px; font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.15s; max-width: 350px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
#tooltip .tt-name { font-weight: 600; color: #f0f6fc; font-size: 14px; margin-bottom: 4px; }
#tooltip .tt-label { color: #8b949e; margin-bottom: 8px; }
#tooltip .tt-deps { color: #58a6ff; }
#tooltip .tt-zone { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 4px; }
#back-btn { display: none; position: absolute; top: 12px; left: 12px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; z-index: 10; }
#back-btn:hover { background: #30363d; }
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #8b949e; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; }
svg text { font-family: inherit; }
.chord-group text { fill: #c9d1d9; font-size: 11px; font-weight: 500; }
.node-label { fill: #8b949e; font-size: 9px; pointer-events: none; }
</style>
</head>
<body>
<div id="header">
  <h1>Claude Code 2.1.87</h1>
  <span class="badge">Architecture</span>
  <div id="nav">
    <button class="active" onclick="showChord()">Zone Overview</button>
    <button onclick="showForce(0)">All Nodes</button>
    <input id="search-box" type="text" placeholder="Search modules..." oninput="onSearch(this.value)">
  </div>
  <div class="stats" id="header-stats"></div>
</div>
<div id="main">
  <div id="viz">
    <svg id="svg"></svg>
    <button id="back-btn" onclick="showChord()">← Back to Overview</button>
    <div id="tooltip"></div>
  </div>
  <div id="sidebar">
    <h2>Zones</h2>
    <div id="zone-list"></div>
    <h2>Top Hub Modules</h2>
    <div id="hub-list"></div>
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
  init: "#58a6ff",
  component: "#f78166",
  deps: "#484f58",
  block: "#484f58",
  plain: "#8b949e",
  refs: "#3fb950",
  telemetry: "#d29922",
};

// --- Sidebar ---
function buildSidebar() {
  // Header stats
  document.getElementById("header-stats").textContent =
    DATA.totalNodes.toLocaleString() + " modules · " +
    DATA.totalEdges.toLocaleString() + " deps · " +
    DATA.rcTotal + " React components";

  // Zone list
  const zl = document.getElementById("zone-list");
  zl.innerHTML = DATA.zoneStats.map((z, i) => \`
    <div class="zone-item" onclick="showForce(\${z.id})">
      <div class="zone-color" style="background:\${ZONE_COLORS[i]}"></div>
      <div class="zone-name">Z\${z.id}: \${z.name}</div>
      <div class="zone-stat">\${z.nodes}</div>
    </div>
  \`).join("");

  // Hub list
  const hl = document.getElementById("hub-list");
  hl.innerHTML = DATA.hubs.map(h => \`
    <div class="hub-item" onclick="highlightNode('\${h.id}')">
      <div class="hub-dot" style="background:\${ZONE_COLORS[h.z - 1]}"></div>
      <div class="hub-name" title="\${h.l}">\${h.l}</div>
      <div class="hub-count">\${h.dc} deps</div>
    </div>
  \`).join("");

  // Legend
  const lg = document.getElementById("legend");
  lg.innerHTML = [
    ["init(...)", CAT_COLORS.init],
    ["component(...)", CAT_COLORS.component],
    ["deps/block", CAT_COLORS.deps],
    ["plain name", CAT_COLORS.plain],
    ["refs", CAT_COLORS.refs],
    ["telemetry", CAT_COLORS.telemetry],
  ].map(([name, color]) => \`
    <div class="legend-item"><div class="legend-dot" style="background:\${color}"></div>\${name}</div>
  \`).join("");

  // Summary
  document.getElementById("summary").innerHTML = \`
    <div style="font-size:12px; color:#8b949e; line-height:1.8">
      <div>Total nodes: <b style="color:#c9d1d9">\${DATA.totalNodes.toLocaleString()}</b></div>
      <div>Total edges: <b style="color:#c9d1d9">\${DATA.totalEdges.toLocaleString()}</b></div>
      <div>Cross-zone: <b style="color:#c9d1d9">\${DATA.crossZoneCount.toLocaleString()}</b></div>
      <div>React components: <b style="color:#c9d1d9">\${DATA.rcTotal}</b> (\${DATA.rcLabeled} labeled)</div>
      <div style="margin-top:8px">
        <b style="color:#c9d1d9">Zone Breakdown:</b>
      </div>
      \${DATA.zoneStats.map((z, i) => \`
        <div style="display:flex;gap:6px;align-items:center">
          <span style="color:\${ZONE_COLORS[i]}">■</span>
          <span style="flex:1">Z\${z.id}</span>
          <span>\${z.nodes} nodes</span>
          <span style="color:#484f58">|</span>
          <span>\${z.components} comp</span>
        </div>
      \`).join("")}
    </div>
  \`;
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

function resizeSvg() {
  const viz = document.getElementById("viz");
  svg.attr("width", viz.clientWidth).attr("height", viz.clientHeight);
}
window.addEventListener("resize", () => { resizeSvg(); if (currentView === "chord") showChord(); else showForce(currentZone); });
resizeSvg();

// --- Chord Diagram ---
function showChord() {
  currentView = "chord";
  currentZone = 0;
  document.getElementById("back-btn").style.display = "none";
  document.querySelectorAll("#nav button").forEach((b, i) => b.classList.toggle("active", i === 0));
  svg.selectAll("*").remove();

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
        <div class="tt-label">\${z.nodes} modules · \${z.components} components</div>
        <div>\${z.internalDeps} internal deps</div>
        <div>\${z.crossZoneDeps} cross-zone deps</div>
        <div style="margin-top:6px; color:#58a6ff">Click to explore →</div>
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

  // Ribbons (cross-zone flows)
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
        <div class="tt-name">Zone \${fromZ} → Zone \${toZ}</div>
        <div>\${count} dependencies</div>
        \${fromZ !== toZ ? \`<div style="color:#8b949e">Zone \${toZ} → Zone \${fromZ}: \${countBack}</div>\` : ""}
      \`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill-opacity", 0.15).attr("stroke-opacity", 0.3);
      hideTooltip();
    });

  // Center text
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.5em")
    .attr("fill", "#f0f6fc")
    .attr("font-size", "20px")
    .attr("font-weight", "600")
    .text(DATA.totalNodes.toLocaleString() + " modules");
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1em")
    .attr("fill", "#8b949e")
    .attr("font-size", "14px")
    .text(DATA.totalEdges.toLocaleString() + " dependencies");
}

// --- Force Graph ---
let currentZone = 0;
let simulation = null;

function showForce(zone) {
  currentView = "force";
  currentZone = zone;
  document.getElementById("back-btn").style.display = "block";
  document.querySelectorAll("#nav button").forEach((b, i) => b.classList.toggle("active", i === 1));
  svg.selectAll("*").remove();
  if (simulation) simulation.stop();

  const w = +svg.attr("width");
  const h = +svg.attr("height");

  // Filter nodes
  let zoneNodes = zone === 0 ? DATA.nodes : DATA.nodes.filter(n => n.z === zone);

  // For "all nodes" view, only show top nodes to avoid browser meltdown
  if (zone === 0 && zoneNodes.length > 600) {
    // Show nodes with depCount >= 3 or that are components
    zoneNodes = zoneNodes.filter(n => n.dc >= 3 || n.c === "component" || n.c === "init");
  }

  const nodeMap = new Map(zoneNodes.map(n => [n.id, n]));

  // Build links (only between visible nodes)
  const links = [];
  for (const n of zoneNodes) {
    for (const dep of n.d) {
      if (nodeMap.has(dep)) {
        links.push({ source: n.id, target: dep });
      }
    }
  }

  // Sizing
  const maxDc = Math.max(...zoneNodes.map(n => n.dc), 1);
  const nodeR = (n) => Math.max(3, Math.sqrt(n.dc / maxDc) * 20);

  // Force simulation
  simulation = d3.forceSimulation(zoneNodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(40).strength(0.1))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("collision", d3.forceCollide().radius(d => nodeR(d) + 2))
    .force("x", d3.forceX(w / 2).strength(0.03))
    .force("y", d3.forceY(h / 2).strength(0.03));

  // Draw links
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#21262d")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.5);

  // Draw nodes
  const node = svg.append("g")
    .selectAll("circle")
    .data(zoneNodes)
    .join("circle")
    .attr("r", d => nodeR(d))
    .attr("fill", d => zone === 0 ? ZONE_COLORS[d.z - 1] : (CAT_COLORS[d.c] || "#8b949e"))
    .attr("fill-opacity", 0.8)
    .attr("stroke", d => zone === 0 ? ZONE_COLORS[d.z - 1] : (CAT_COLORS[d.c] || "#8b949e"))
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.4)
    .style("cursor", "pointer")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill-opacity", 1).attr("stroke-opacity", 1).attr("stroke-width", 3);
      // Highlight connected nodes
      const connected = new Set(d.d);
      node.attr("fill-opacity", n => n.id === d.id || connected.has(n.id) ? 1 : 0.15);
      link.attr("stroke-opacity", l => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.05)
          .attr("stroke", l => l.source.id === d.id || l.target.id === d.id ? ZONE_COLORS[d.z - 1] : "#21262d")
          .attr("stroke-width", l => l.source.id === d.id || l.target.id === d.id ? 1.5 : 0.5);

      const depNames = d.d.slice(0, 10).map(dep => {
        const nm = DATA.nodes.find(n => n.id === dep);
        return nm ? nm.l : dep;
      });
      showTooltip(e.clientX, e.clientY, \`
        <div class="tt-name">\${d.l}</div>
        <div class="tt-zone" style="background:\${ZONE_COLORS[d.z-1]}30; color:\${ZONE_COLORS[d.z-1]}">Zone \${d.z}: \${DATA.zoneNames[d.z-1]}</div>
        <div class="tt-label">Category: \${d.c} · \${d.dc} dependencies</div>
        \${d.dc > 0 ? \`<div class="tt-deps">Deps: \${depNames.join(", ")}\${d.dc > 10 ? " +" + (d.dc - 10) + " more" : ""}</div>\` : ""}
      \`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill-opacity", 0.8).attr("stroke-width", 1.5).attr("stroke-opacity", 0.4);
      node.attr("fill-opacity", 0.8);
      link.attr("stroke-opacity", 0.5).attr("stroke", "#21262d").attr("stroke-width", 0.5);
      hideTooltip();
    })
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  // Labels for large nodes
  const labels = svg.append("g")
    .selectAll("text")
    .data(zoneNodes.filter(n => n.dc >= 10 || (n.c === "component" && n.l.length < 30)))
    .join("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", d => nodeR(d) + 12)
    .text(d => {
      let t = d.l;
      if (t.startsWith("init(")) t = t.slice(5, -1);
      if (t.startsWith("component(")) t = t.slice(10, -1);
      if (t.length > 25) t = t.slice(0, 22) + "…";
      return t;
    });

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])
    .on("zoom", (e) => {
      svg.selectAll("g").attr("transform", e.transform);
    });
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

  // Zone title
  svg.append("text")
    .attr("x", 16)
    .attr("y", h - 16)
    .attr("fill", "#484f58")
    .attr("font-size", "12px")
    .text(zone === 0
      ? \`All zones · \${zoneNodes.length} nodes shown (filtered: depCount ≥ 3 or component/init)\`
      : \`Zone \${zone}: \${DATA.zoneNames[zone - 1]} · \${zoneNodes.length} nodes · \${links.length} internal edges\`);
}

// --- Search ---
function onSearch(query) {
  if (!query || query.length < 2) {
    svg.selectAll("circle").attr("fill-opacity", 0.8).attr("stroke-width", 1.5);
    return;
  }
  const q = query.toLowerCase();
  svg.selectAll("circle")
    .attr("fill-opacity", d => d.l.toLowerCase().includes(q) ? 1 : 0.08)
    .attr("stroke-width", d => d.l.toLowerCase().includes(q) ? 3 : 0.5);
}

function highlightNode(id) {
  const n = DATA.nodes.find(n => n.id === id);
  if (!n) return;
  if (currentView === "chord") showForce(n.z);
  setTimeout(() => {
    document.getElementById("search-box").value = n.l.slice(0, 30);
    onSearch(n.l.slice(0, 30));
  }, 500);
}

// --- Init ---
buildSidebar();
showChord();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
const size = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\nGenerated: src/dep-graph.html (${size} KB)`);
console.log(`Open with: open src/dep-graph.html`);

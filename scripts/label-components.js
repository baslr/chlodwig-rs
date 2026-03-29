#!/usr/bin/env bun
/**
 * Labels React components with readable names by analyzing their content:
 *
 *   1. Dialog title: createElement(E6/t5, { title: "Login" }) → LoginDialog
 *   2. Dialog type: cD("elicitation") → ElicitationDialog
 *   3. Tab titles: { id: "discover", title: "Discover" } → DiscoverTab
 *   4. Notification text: Oq_("text", "key") → from key
 *   5. Telemetry events: tengu_plan_exit → PlanExit
 *   6. Settings labels: label: "Auto-compact" → SettingsPanel
 *   7. String props: recognizable UI strings
 *   8. Hook names from name-map
 *
 * Updates: name-map.json (component labels), react-components.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NAME_MAP = path.join(ROOT, "src", "name-map.json");
const RC_FILE = path.join(ROOT, "src", "react-components.json");
const SPLIT = path.join(ROOT, "src", "cli_split.js");
const SECTIONS = path.join(ROOT, "src", "sections");

const nameMap = JSON.parse(fs.readFileSync(NAME_MAP, "utf8"));
const rcData = JSON.parse(fs.readFileSync(RC_FILE, "utf8"));
const content = fs.readFileSync(SPLIT, "utf8");
const lines = content.split("\n");

// --- Read component bodies ---
function getComponentBody(comp) {
  if (comp.source === "inline") {
    return lines.slice(comp.line - 1, comp.line - 1 + comp.lines).join("\n");
  }
  // Section file
  const filePath = path.join(ROOT, "src", comp.source);
  if (fs.existsSync(filePath)) {
    const sLines = fs.readFileSync(filePath, "utf8").split("\n");
    return sLines.slice(comp.line - 1, comp.line - 1 + comp.lines).join("\n");
  }
  return "";
}

function kebabToPascal(s) {
  return s.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase());
}

function snakeToPascal(s) {
  return s.split("_").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) : s;
}

console.log(`Labeling ${rcData.components.length} React components...\n`);

let labeled = 0;
let alreadyNamed = 0;
const stats = {};

function recordLabel(comp, name, heuristic) {
  comp.derivedName = name;
  comp.nameSource = heuristic;
  if (!stats[heuristic]) stats[heuristic] = 0;
  stats[heuristic]++;
  labeled++;
}

for (const comp of rcData.components) {
  // Skip if already has a good readable name
  if (comp.readableName && comp.readableName !== "call" && comp.readableName !== "default") {
    alreadyNamed++;
    comp.derivedName = comp.readableName;
    comp.nameSource = "existing";
    continue;
  }

  const body = getComponentBody(comp);
  if (!body) continue;

  // --- H1: Dialog title strings ---
  // Pattern: createElement(E6/t5, { title: "Something" }) or title: "Something"
  const titleMatch = body.match(/title:\s*"([A-Z][^"]{3,50})"/);
  if (titleMatch) {
    const title = titleMatch[1]
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    if (title.length >= 4 && title.length <= 40) {
      // Add "Dialog" suffix if it looks like a dialog
      const isDialog = body.includes("onCancel") || body.includes("onClose") || body.includes("onDone");
      const suffix = isDialog ? "Dialog" : "";
      recordLabel(comp, truncate(title + suffix, 50), "H1-dialog-title");
      continue;
    }
  }

  // --- H2: cD() dialog type registration ---
  const cdMatch = body.match(/cD\("([a-z][-a-z0-9_]+)"\)/);
  if (cdMatch) {
    const name = kebabToPascal(cdMatch[1]);
    if (name.length >= 4) {
      recordLabel(comp, name + (name.endsWith("Dialog") ? "" : "Dialog"), "H2-dialog-type");
      continue;
    }
  }

  // --- H3: Notification key/type ---
  const notifyMatch = body.match(/Oq_\([^,]+,\s*"([a-z][-a-z0-9_]+)"\)/);
  if (notifyMatch) {
    const name = kebabToPascal(notifyMatch[1]);
    if (name.length >= 4) {
      recordLabel(comp, name + "Notification", "H3-notification");
      continue;
    }
  }

  // --- H4: Settings-like component (multiple label: strings) ---
  const labelMatches = body.match(/label:\s*"[^"]+"/g);
  if (labelMatches && labelMatches.length >= 3) {
    // Extract the most specific labels
    const labels = labelMatches.map(m => m.match(/"([^"]+)"/)?.[1]).filter(Boolean);
    if (labels.some(l => /compact|verbose|language|editor|theme|notification|permission|model/i.test(l))) {
      recordLabel(comp, "SettingsPanel", "H4-settings");
      continue;
    }
    if (labels.some(l => /discover|install|marketplace|plugin/i.test(l))) {
      recordLabel(comp, "PluginSettings", "H4-settings");
      continue;
    }
  }

  // --- H5: Tab container (has tab IDs/titles) ---
  const tabMatches = body.match(/(?:id|title):\s*"([A-Z][a-zA-Z]{2,20})"/g);
  if (tabMatches && tabMatches.length >= 2) {
    const tabs = tabMatches.map(m => m.match(/"([^"]+)"/)?.[1]).filter(Boolean);
    const uniqueTabs = [...new Set(tabs)];
    if (uniqueTabs.length >= 2) {
      // Use the first meaningful tab as base
      recordLabel(comp, uniqueTabs[0] + "TabView", "H5-tabs");
      continue;
    }
  }

  // --- H6: Telemetry event naming ---
  const tenguMatches = body.match(/tengu_([a-z_]+)/g);
  if (tenguMatches && tenguMatches.length >= 2) {
    // Find the most specific/unique telemetry prefix
    const prefixes = {};
    for (const t of tenguMatches) {
      const parts = t.replace("tengu_", "").split("_").slice(0, 3);
      const prefix = parts.join("_");
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
    const best = Object.entries(prefixes).sort((a, b) => b[1] - a[1])[0];
    if (best) {
      const name = snakeToPascal(best[0]);
      if (name.length >= 4 && name.length <= 35) {
        recordLabel(comp, name + "Component", "H6-telemetry");
        continue;
      }
    }
  }

  // --- H7: Recognizable UI string patterns ---
  // Look for distinctive string content
  const uiStrings = [];

  // "Some Action" button labels
  const actionMatch = body.match(/"((?:(?:Create|Delete|Edit|Add|Remove|Save|Cancel|Close|Submit|Accept|Decline|Approve|Reject|Enable|Disable|Configure|Update|Install|Uninstall|Confirm|Review|View|Show|Hide|Browse|Search|Filter|Reset|Clear|Undo|Retry|Back|Next|Finish|Skip|Login|Logout|Connect|Disconnect)\s+[A-Za-z ]{2,20}))"/);
  if (actionMatch) {
    const name = actionMatch[1].split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name.length >= 6 && name.length <= 40) {
      recordLabel(comp, name + "Dialog", "H7-action-string");
      continue;
    }
  }

  // "Something wants to..." / "Something needs..." patterns
  const wantsMatch = body.match(/"([A-Z][a-zA-Z ]+)\s+(?:wants to|needs|requires|is requesting)\s+/);
  if (wantsMatch) {
    const subject = wantsMatch[1].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (subject.length >= 4 && subject.length <= 30) {
      recordLabel(comp, subject + "RequestDialog", "H7-wants-string");
      continue;
    }
  }

  // Error/warning display strings
  const errorMatch = body.match(/"([A-Z][a-z]+ (?:error|warning|failed|not found|required|missing|invalid|unavailable|timeout)[^"]{0,20})"/i);
  if (errorMatch) {
    const name = errorMatch[1].replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/).slice(0, 4)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name.length >= 6 && name.length <= 40) {
      recordLabel(comp, name + "Display", "H7-error-string");
      continue;
    }
  }

  // --- H8: View state machine → component purpose ---
  const viewStates = body.match(/viewState[^=]*===?\s*"([a-z][-a-z0-9]+)"/g);
  if (viewStates && viewStates.length >= 2) {
    const states = viewStates.map(m => m.match(/"([^"]+)"/)?.[1]).filter(Boolean);
    if (states.length >= 2) {
      const domain = states[0].split("-")[0]; // e.g., "plugin" from "plugin-list"
      const name = domain.charAt(0).toUpperCase() + domain.slice(1);
      if (name.length >= 3 && name.length <= 20) {
        recordLabel(comp, name + "View", "H8-view-state");
        continue;
      }
    }
  }

  // --- H9: Props destructuring hints ---
  // Components with very specific prop names
  const propHints = {
    // Original H9 hints
    "toolUseConfirm": "ToolConfirm",
    "workerBadge": "WorkerBadge",
    "onAutoUpdaterResult": "AutoUpdater",
    "apiKeyStatus": "ApiKeyStatus",
    "mcpClients": "McpClients",
    "pastedContents": "PastedContent",
    "vimMode": "VimMode",
    "isSearchingHistory": "HistorySearch",
    "voiceInterimRange": "VoiceInput",
    "onExit": "Exit",
    "patch": "DiffPatch",
    "hookResult": "HookResult",
    "serverName": "McpServer",
    "checkpoint": "Checkpoint",
    "secretsResult": "SecretsResult",
    "providerInfo": "ProviderInfo",
    "sandboxInfo": "SandboxInfo",
    "requestedSchema": "SchemaForm",
    "costSummary": "CostSummary",
    "permissionMode": "PermissionMode",
    // H15: Extended prop hints
    "loadingStartTimeRef": "ActivitySpinner",
    "spinnerTip": "ActivitySpinner",
    "overrideMessage": "SimpleSpinner",
    "visibleOptionCount": "SelectList",
    "submitButtonText": "MultiSelect",
    "inputState": "TextInput",
    "terminalFocus": "TextInput",
    "selectedTab": "TabbedPanel",
    "onTabChange": "TabbedPanel",
    "tasksSelected": "TaskFooter",
    "teammateFooterIndex": "TeammateStatus",
    "onOpenRateLimitOptions": "RateLimit",
    "onResume": "ConversationResume",
    "diagnosticsPromise": "SystemDiagnostics",
    "leaderIsIdle": "TeammateSpinner",
    "isInSelectionMode": "SelectionMode",
    "decisionReason": "PermissionDecision",
    "responseChunks": "StreamingResponse",
    "diffContent": "DiffViewer",
    "fileContent": "FileViewer",
    "sandboxViolation": "SandboxViolation",
    "isFocused": "FocusableItem",
    "option": "SelectOption",
  };

  let propMatched = false;
  for (const [prop, label] of Object.entries(propHints)) {
    if (body.includes(prop + ":") || body.includes(prop + " ")) {
      // Only use if it's a primary prop (in the function signature)
      const sigEnd = body.indexOf("{", body.indexOf("function"));
      const sig = body.slice(0, Math.min(sigEnd + 200, body.length));
      if (sig.includes(prop)) {
        const isDialog = body.includes("onCancel") || body.includes("onClose") || body.includes("onDone");
        recordLabel(comp, label + (isDialog ? "Dialog" : "Component"), "H9-prop-hint");
        propMatched = true;
        break;
      }
    }
  }
  if (propMatched) continue;

  // --- H10: Inline createElement child text ---
  // Look for createElement(L, ..., "SomeText") where the text is descriptive
  const textChildren = [];
  const textRe = /createElement\(\s*(?:L|d3)\s*,\s*(?:\{[^}]*\}|null)\s*,\s*"([A-Z][^"]{4,30})"/g;
  let tm;
  while ((tm = textRe.exec(body)) !== null) {
    textChildren.push(tm[1]);
  }
  if (textChildren.length > 0) {
    // Pick the most descriptive text child
    const best = textChildren.sort((a, b) => b.length - a.length)[0];
    const name = best.replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/).slice(0, 4)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name.length >= 4 && name.length <= 35) {
      const isDialog = body.includes("onCancel") || body.includes("onClose");
      recordLabel(comp, name + (isDialog ? "Dialog" : "Component"), "H10-text-child");
      continue;
    }
  }

  // --- H11: gBlock → component(ReadableName) ---
  // If the G() block is already labeled component(PascalName) in name-map,
  // use that name directly (these were labeled by react-components.js from other components)
  if (comp.gBlock) {
    const gLabel = nameMap[comp.gBlock];
    if (typeof gLabel === "string" && gLabel.startsWith("component(")) {
      const inner = gLabel.slice(10, -1);
      // Only use if the inner name is a readable PascalCase name (not a hash like "aeH")
      if (/^[A-Z][a-z]/.test(inner) && inner.length > 4) {
        recordLabel(comp, inner, "H11-gblock-readable");
        continue;
      }
    }
  }

  // --- H12: gBlock → init(semantic-name) ---
  // If the G() block has an init(kebab-name) label, convert to PascalCase
  if (comp.gBlock) {
    const gLabel = nameMap[comp.gBlock];
    if (typeof gLabel === "string" && gLabel.startsWith("init(") && !gLabel.includes("react-component")) {
      const kebab = gLabel.slice(5, -1);
      if (kebab.length > 3) {
        const name = kebabToPascal(kebab);
        if (name.length >= 4) {
          recordLabel(comp, name + "Component", "H12-gblock-init");
          continue;
        }
      }
    }
  }

  // --- H12b: gBlock → refs/telemetry/deps labels ---
  // Extract domain from other label types
  if (comp.gBlock) {
    const gLabel = nameMap[comp.gBlock];
    if (typeof gLabel === "string") {
      let domain = null;
      if (gLabel.startsWith("refs(")) domain = gLabel.slice(5, -1);
      else if (gLabel.startsWith("telemetry(")) domain = gLabel.slice(10, -1);
      if (domain && domain.length > 3) {
        const name = kebabToPascal(domain);
        if (name.length >= 4 && name.length <= 40) {
          recordLabel(comp, name + "Component", "H12b-gblock-domain");
          continue;
        }
      }
    }
  }

  // --- H13: Keybinding Namespace ---
  // G$("namespace:action") calls reveal component domain
  const kbMatches = body.match(/G\$\("([a-z]+):[a-zA-Z]+"/g);
  if (kbMatches && kbMatches.length >= 1) {
    // Count namespaces
    const nsCounts = {};
    for (const m of kbMatches) {
      const ns = m.match(/"([a-z]+):/)?.[1];
      if (ns) nsCounts[ns] = (nsCounts[ns] || 0) + 1;
    }
    const bestNs = Object.entries(nsCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const nsMap = {
      chat: "Chat", voice: "Voice", tabs: "Tab",
      attachments: "Attachment", app: "App", navigation: "Navigation",
      editor: "Editor", vim: "Vim", search: "Search",
      repl: "Repl", history: "History",
    };
    if (bestNs && nsMap[bestNs]) {
      recordLabel(comp, nsMap[bestNs] + "Controls", "H13-keybinding");
      continue;
    }
  }

  // --- H14: Zustand Selectors ---
  // Y_((x) => x.fieldName) or UB_() — field names map to domains
  {
    const selectorRe14 = /(?:Y_|UB_)\([^)]*?\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const selectorFields14 = [];
    let sm14;
    while ((sm14 = selectorRe14.exec(body)) !== null) {
      selectorFields14.push(sm14[1]);
    }
    if (selectorFields14.length >= 1) {
      const domainMap14 = {
        tasks: "Task", teamContext: "Team", notifications: "Notification",
        effortValue: "Effort", expandedView: "ExpandedView",
        currentModel: "Model", viewSelectionMode: "ViewSelection",
        isLoading: "Loading", inputValue: "Input", messages: "Messages",
        conversationId: "Conversation", permissionMode: "Permission",
        isSearchingHistory: "HistorySearch", toolPermissionContext: "ToolPermission",
        activeProvider: "Provider", sandboxViolations: "Sandbox",
        costSummary: "Cost", voiceState: "Voice", selectedIndex: "Selection",
        viewingAgentTaskId: "AgentTask", teammateContext: "Teammate",
      };
      let zustandMatched = false;
      for (const [field, label] of Object.entries(domainMap14)) {
        if (selectorFields14.includes(field)) {
          recordLabel(comp, label + "Component", "H14-zustand");
          zustandMatched = true;
          break;
        }
      }
      if (zustandMatched) continue;
    }
  }

  // --- H16: Known Function Calls ---
  // Look up function calls in name-map for readable names (with or without args)
  {
    const callRe2 = /\b([a-zA-Z_$][a-zA-Z0-9_$]{2,})\(/g;
    const skipNames = new Set(["function", "if", "for", "while", "switch", "catch", "return",
      "createElement", "slice", "map", "filter", "push", "join", "includes", "match",
      "replace", "toString", "indexOf", "forEach", "reduce", "find", "some", "every",
      "concat", "split", "trim", "startsWith", "endsWith", "require", "Math", "Date",
      "JSON", "Object", "Array", "String", "Number", "Boolean", "Promise", "Error",
      "setTimeout", "setInterval", "clearTimeout", "clearInterval", "console", "log",
      "warn", "error", "keys", "values", "entries", "assign", "parse", "stringify",
      "resolve", "reject", "then", "catch", "finally", "from"]);
    const calls = new Map();
    let cm2;
    while ((cm2 = callRe2.exec(body)) !== null) {
      if (skipNames.has(cm2[1])) continue;
      const readable = nameMap[cm2[1]];
      if (readable && typeof readable === "string" && readable.length > 4 &&
          !readable.startsWith("init(") && !readable.startsWith("deps(") && !readable.startsWith("block(") &&
          !readable.startsWith("component(") && !readable.startsWith("refs(") &&
          !readable.startsWith("telemetry(") && readable !== "default" && readable !== "call") {
        calls.set(cm2[1], readable);
      }
    }
    if (calls.size > 0) {
      // Pick the longest/most specific readable name
      const best = [...calls.values()].sort((a, b) => b.length - a.length)[0];
      if (best.length >= 5) {
        const pascalBest = best.replace(/^([a-z])/, (_, c) => c.toUpperCase());
        recordLabel(comp, pascalBest + "Wrapper", "H16-function-call");
        continue;
      }
    }
  }

  // --- H17: Expanded Strings ---
  // Status/state strings that reveal component purpose
  const statusMatch = body.match(/"(Reconnecting|Disconnected|Loading|Initializing|Connecting|Processing|Searching|Indexing|Compacting|Resuming|Authenticating|Migrating)[^"]*"/);
  if (statusMatch) {
    recordLabel(comp, statusMatch[1] + "Display", "H17-status-string");
    continue;
  }

  // H17b: Descriptive long strings not caught by H10 (outside createElement)
  // Look for any "PascalCase long string" that's descriptive
  const descriptiveStrings = body.match(/"([A-Z][a-z]+ (?:[a-z]+ )?(?:failed|error|status|warning|not found|unavailable|required|missing|blocked|execution|installation|configured|recommendation|questions|confirmation|language|settings)[^"]{0,30})"/i);
  if (descriptiveStrings) {
    const words = descriptiveStrings[1].replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/).slice(0, 4);
    const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name.length >= 6 && name.length <= 40) {
      recordLabel(comp, name + "Display", "H17b-descriptive-string");
      continue;
    }
  }

  // H17c: description: "..." prop as naming source
  const descMatch = body.match(/description:\s*"([A-Z][^"]{8,50})"/);
  if (descMatch) {
    const words = descMatch[1].replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/).slice(0, 4);
    const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name.length >= 6 && name.length <= 40) {
      recordLabel(comp, name + "Component", "H17c-description");
      continue;
    }
  }

  // --- H18: Hook Body Patterns ---
  // For hook-type components: derive name from context/store usage
  if (comp.type === "hook") {
    const ctxMatch = body.match(/useContext\(([a-zA-Z_$]+)\)/);
    if (ctxMatch) {
      const ctxName = nameMap[ctxMatch[1]];
      if (ctxName && typeof ctxName === "string" && ctxName.length > 3) {
        const hookName = "use" + ctxName.replace(/Context$/, "").replace(/^[a-z]/, c => c.toUpperCase());
        recordLabel(comp, hookName, "H18-context-hook");
        continue;
      }
    }
    // Zustand store selector hook
    const storeField = body.match(/Y_\([^)]*=>\s*\w+\.([a-zA-Z_$]+)\)/);
    if (storeField) {
      const f = storeField[1];
      const hookName = "use" + f.charAt(0).toUpperCase() + f.slice(1);
      if (hookName.length >= 6) {
        recordLabel(comp, hookName, "H18-store-hook");
        continue;
      }
    }
  }
}

// --- Update react-components.json ---
rcData.labeledComponents = labeled + alreadyNamed;
rcData.labelSources = stats;
fs.writeFileSync(RC_FILE, JSON.stringify(rcData, null, 2) + "\n");

// --- Update name-map.json with component labels ---
let nmUpdated = 0;
for (const comp of rcData.components) {
  if (!comp.derivedName || !comp.gBlock) continue;
  const existing = nameMap[comp.gBlock];
  // Upgrade from generic component(hashName) to component(ReadableName)
  if (existing && typeof existing === "string" && existing.startsWith("component(")) {
    const currentName = existing.slice(10, -1);
    // Only upgrade if the new name is more descriptive
    if (comp.derivedName.length > currentName.length || /^[a-z]/.test(currentName)) {
      nameMap[comp.gBlock] = `component(${comp.derivedName})`;
      nmUpdated++;
    }
  }
}

// Also update function-level name-map entries
for (const comp of rcData.components) {
  if (!comp.derivedName) continue;
  if (!nameMap[comp.name] || nameMap[comp.name] === "call" || nameMap[comp.name] === "default") {
    nameMap[comp.name] = comp.derivedName;
    nmUpdated++;
  }
}

const sortedMap = Object.fromEntries(
  Object.entries(nameMap).sort(([a], [b]) => a.localeCompare(b))
);
fs.writeFileSync(NAME_MAP, JSON.stringify(sortedMap, null, 2) + "\n");

// --- Report ---
console.log(`${"=".repeat(60)}`);
console.log("React Component Labeling Results\n");

console.log(`Already named:    ${alreadyNamed}`);
console.log(`Newly labeled:    ${labeled}`);
console.log(`Still unlabeled:  ${rcData.components.length - labeled - alreadyNamed}`);
console.log(`Total coverage:   ${((labeled + alreadyNamed) / rcData.components.length * 100).toFixed(1)}%\n`);

console.log("By heuristic:");
for (const [h, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${h.padEnd(25)} ${String(count).padStart(4)}`);
}

console.log(`\nname-map.json updated: ${nmUpdated} entries`);
console.log(`name-map.json total: ${Object.keys(sortedMap).length} entries`);

// Show examples per heuristic
console.log("\nSample labels:");
const examples = {};
for (const comp of rcData.components) {
  if (!comp.nameSource || comp.nameSource === "existing") continue;
  if (!examples[comp.nameSource]) examples[comp.nameSource] = [];
  if (examples[comp.nameSource].length < 5) {
    examples[comp.nameSource].push({ name: comp.name, derived: comp.derivedName });
  }
}
for (const [h, items] of Object.entries(examples)) {
  console.log(`\n  ${h}:`);
  for (const { name, derived } of items) {
    console.log(`    ${name.padEnd(12)} → ${derived}`);
  }
}

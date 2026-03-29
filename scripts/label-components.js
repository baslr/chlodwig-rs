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

// Load call-graph for H19 (caller-context naming)
const CALL_GRAPH = path.join(ROOT, "src", "call-graph.json");
const callGraph = fs.existsSync(CALL_GRAPH)
  ? JSON.parse(fs.readFileSync(CALL_GRAPH, "utf8"))
  : null;

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

  // =================================================================
  // H22: Provider Pattern — .Provider in body → context provider
  // =================================================================
  {
    const providerRe = /([a-zA-Z_$][a-zA-Z0-9_$]*)\.Provider/g;
    const providers = [];
    let pm;
    while ((pm = providerRe.exec(body)) !== null) {
      providers.push(pm[1]);
    }
    if (providers.length > 0) {
      // Try to look up context name from name-map
      let providerName = null;
      for (const ctx of providers) {
        const nm = nameMap[ctx];
        if (nm && typeof nm === "string" && nm.length > 3 &&
            !nm.startsWith("init(") && !nm.startsWith("deps(") && !nm.startsWith("block(") &&
            !nm.startsWith("component(")) {
          providerName = nm.replace(/Context$/, "").replace(/^[a-z]/, c => c.toUpperCase());
          break;
        }
      }
      if (!providerName) {
        // Fallback: use first provider variable name
        providerName = providers[0];
      }
      if (providerName.length >= 2 && providerName.length <= 40) {
        recordLabel(comp, providerName + "Provider", "H22-provider");
        continue;
      }
    }
  }

  // =================================================================
  // H24: Suspense Wrapper — createElement(Suspense, ...) → lazy wrapper
  // =================================================================
  {
    const suspenseMatch = body.match(/createElement\(\s*(?:Suspense|[a-zA-Z_$]*Suspense)\s*,/);
    if (suspenseMatch) {
      // Try to find the lazy child rendered inside
      const lazyChildRe = /createElement\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,/g;
      const children = [];
      let lm;
      while ((lm = lazyChildRe.exec(body)) !== null) {
        const name = lm[1];
        if (name !== "Suspense" && name !== "L" && name !== "d3" && name !== "m" && name !== "hD") {
          const readable = nameMap[name];
          if (readable && typeof readable === "string" && readable.length > 4 &&
              !readable.startsWith("init(") && !readable.startsWith("block(")) {
            children.push(readable);
          }
        }
      }
      if (children.length > 0) {
        const best = children.sort((a, b) => b.length - a.length)[0];
        const pascal = best.replace(/^[a-z]/, c => c.toUpperCase());
        recordLabel(comp, pascal + "Lazy", "H24-suspense");
      } else {
        recordLabel(comp, "SuspenseWrapper", "H24-suspense");
      }
      continue;
    }
  }

  // =================================================================
  // H23: UI Symbol/Icon — uses oH.tick/warning/pointer/etc
  // =================================================================
  {
    const symbolRe = /oH\.([a-zA-Z_]+)/g;
    const symbols = [];
    let sym;
    while ((sym = symbolRe.exec(body)) !== null) {
      symbols.push(sym[1]);
    }
    if (symbols.length > 0 && comp.lines <= 30) {
      const symbolMap = {
        tick: "CheckMark", pointer: "ListPointer", warning: "Warning",
        spinner: "Spinner", checkbox: "Checkbox", checkboxChecked: "CheckboxChecked",
        checkboxUnchecked: "CheckboxUnchecked", radio: "Radio",
        radioChecked: "RadioChecked", chevronRight: "ChevronRight",
        chevronDown: "ChevronDown", chevronUp: "ChevronUp",
        arrowRight: "ArrowRight", arrowDown: "ArrowDown",
        dot: "Dot", dash: "Dash", star: "Star", heart: "Heart",
        info: "Info", error: "Error", success: "Success",
        cross: "Cross", plus: "Plus", minus: "Minus",
      };
      const best = symbols[0];
      const label = symbolMap[best] || (best.charAt(0).toUpperCase() + best.slice(1));
      recordLabel(comp, label + "Icon", "H23-symbol");
      continue;
    }
  }

  // =================================================================
  // H20: Known Hook Signatures — pattern match hook bodies
  // =================================================================
  if (comp.type === "hook" || (comp.lines <= 25 && !body.includes("createElement"))) {
    let hookMatched = false;
    const hookPatterns = [
      [/useSyncExternalStore/, "useStoreSelector"],
      [/activeOverlays/, "useOverlayRegistration"],
      [/addNotification|removeNotification/, "useNotification"],
      [/headerFocused|focusHeader|blurHeader/, "useHeaderFocus"],
      [/useLayoutEffect|useInsertionEffect/, null], // skip these generic hooks
      [/clipboard|copyToClipboard|navigator\.clipboard/, "useClipboard"],
      [/localStorage|sessionStorage/, "useStorage"],
      [/addEventListener.*resize|innerWidth|innerHeight/, "useWindowSize"],
      [/addEventListener.*keydown|addEventListener.*keyup/, "useKeyPress"],
      [/matchMedia|prefers-color-scheme/, "useMediaQuery"],
      [/IntersectionObserver/, "useIntersectionObserver"],
      [/MutationObserver/, "useMutationObserver"],
      [/AbortController/, "useAbortController"],
      [/\.focus\(\)|\.blur\(\)|focusRef/, "useFocusManagement"],
      [/scrollIntoView|scrollTop|scrollTo/, "useScroll"],
      [/animation|animate|transition|requestAnimationFrame/, "useAnimation"],
      [/debounce|setTimeout.*clearTimeout/, "useDebounce"],
      [/throttle/, "useThrottle"],
      [/polling|setInterval/, "usePolling"],
    ];
    for (const [re, name] of hookPatterns) {
      if (re.test(body)) {
        if (name) {
          recordLabel(comp, name, "H20-hook-sig");
          hookMatched = true;
        }
        break;
      }
    }
    if (hookMatched) continue;
  }

  // =================================================================
  // H25: Relaxed text matching — lowercase text in createElement
  // =================================================================
  {
    // Match createElement(L/d3, ..., "any text ≥10 chars") — including lowercase
    const relaxedTextRe = /createElement\(\s*(?:L|d3)\s*,\s*(?:\{[^}]*\}|null)\s*,\s*"([^"]{10,60})"/g;
    const allTexts = [];
    let rtm;
    while ((rtm = relaxedTextRe.exec(body)) !== null) {
      const text = rtm[1];
      // Skip pure punctuation, numbers, format strings
      if (/^[\W\d]+$/.test(text)) continue;
      if (text.includes("${") || text.includes("\\n") || text.includes("%s")) continue;
      // Must have at least 2 real words
      const words = text.trim().split(/\s+/).filter(w => w.length >= 2);
      if (words.length >= 2) {
        allTexts.push(text);
      }
    }
    if (allTexts.length > 0) {
      const best = allTexts.sort((a, b) => b.length - a.length)[0];
      const words = best.replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/).slice(0, 5)
        .filter(w => w.length >= 2)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      const name = words.join("");
      if (name.length >= 6 && name.length <= 40) {
        recordLabel(comp, name + "Display", "H25-relaxed-text");
        continue;
      }
    }
  }

  // =================================================================
  // H26: Conditional Guard — if (!x) return null at start
  // =================================================================
  {
    const guardRe = /if\s*\(\s*!([a-zA-Z_$][a-zA-Z0-9_$]*(?:\(\))?)\s*\)\s*return\s+null/;
    const guardMatch = body.match(guardRe);
    if (guardMatch && comp.lines <= 40) {
      const condition = guardMatch[1].replace(/\(\)$/, "");
      // Look up in name-map or derive from name
      let guardName = null;
      const nm = nameMap[condition];
      if (nm && typeof nm === "string" && nm.length > 4 &&
          !nm.startsWith("init(") && !nm.startsWith("deps(") && !nm.startsWith("block(")) {
        guardName = nm.replace(/^(is|has|get|should)/, "").replace(/^[a-z]/, c => c.toUpperCase());
      }
      if (!guardName) {
        guardName = condition
          .replace(/^(is|has|get|should)/, "")
          .replace(/^[a-z]/, c => c.toUpperCase());
      }
      if (guardName.length >= 3 && guardName.length <= 30) {
        recordLabel(comp, guardName + "Guard", "H26-guard");
        continue;
      }
    }
  }

  // =================================================================
  // H21: Child Composition — renders ≥2 labeled children
  // =================================================================
  {
    const ceRe = /createElement\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,/g;
    const childComponents = new Map(); // hash → readableName
    let cem;
    while ((cem = ceRe.exec(body)) !== null) {
      const child = cem[1];
      // Skip basic elements (Box, Text, etc.)
      if (["L", "d3", "m", "hD", "null", "undefined", "Suspense", "Fragment"].includes(child)) continue;
      // Look up in react-components for labeled children
      const childComp = rcData.components.find(c => c.name === child);
      if (childComp && (childComp.derivedName || childComp.readableName)) {
        const label = childComp.derivedName || childComp.readableName;
        childComponents.set(child, label);
      }
    }
    if (childComponents.size >= 2) {
      // Find common domain from child names
      const childNames = [...childComponents.values()];
      // Check for common suffix
      const suffixes = ["Dialog", "Component", "Display", "Controls", "Panel", "View", "Wrapper"];
      let domain = null;
      for (const suffix of suffixes) {
        const matching = childNames.filter(n => n.endsWith(suffix));
        if (matching.length >= 2) {
          // Extract common prefix from matching children
          const prefixes = matching.map(n => n.replace(new RegExp(suffix + "$"), ""));
          // Find longest common prefix
          let common = prefixes[0];
          for (let i = 1; i < prefixes.length; i++) {
            while (!prefixes[i].startsWith(common) && common.length > 0) {
              common = common.slice(0, -1);
            }
          }
          if (common.length >= 3) {
            domain = common + "Container";
            break;
          }
        }
      }
      if (!domain) {
        // Use the most common word from child names
        const wordCounts = {};
        for (const name of childNames) {
          // Split PascalCase into words
          const words = name.replace(/([A-Z])/g, " $1").trim().split(/\s+/);
          for (const w of words) {
            if (w.length >= 3) wordCounts[w] = (wordCounts[w] || 0) + 1;
          }
        }
        const bestWord = Object.entries(wordCounts).sort((a, b) => b[1] - a[1])[0];
        if (bestWord && bestWord[1] >= 2) {
          domain = bestWord[0] + "Container";
        }
      }
      if (domain && domain.length >= 6 && domain.length <= 40) {
        recordLabel(comp, domain, "H21-composition");
        continue;
      }
    }
  }

  // =================================================================
  // H19: Caller-Context — use call-graph calledBy for naming
  // =================================================================
  if (callGraph) {
    const cgNode = callGraph.functions[comp.name];
    if (cgNode && cgNode.cb && cgNode.cb.length > 0) {
      // Look up caller names
      const callerNames = [];
      for (const callerHash of cgNode.cb) {
        // Check if caller is a labeled component
        const callerComp = rcData.components.find(c => c.name === callerHash);
        if (callerComp && (callerComp.derivedName || callerComp.readableName)) {
          callerNames.push(callerComp.derivedName || callerComp.readableName);
          continue;
        }
        // Check call-graph for readable name
        const callerCg = callGraph.functions[callerHash];
        if (callerCg && callerCg.n && callerCg.n !== callerHash && callerCg.n.length > 3) {
          callerNames.push(callerCg.n);
          continue;
        }
        // Check name-map
        const nm = nameMap[callerHash];
        if (nm && typeof nm === "string" && nm.length > 4 &&
            !nm.startsWith("init(") && !nm.startsWith("deps(") && !nm.startsWith("block(") &&
            !nm.startsWith("component(")) {
          callerNames.push(nm);
        }
      }
      if (callerNames.length >= 1) {
        // Find common domain
        if (callerNames.length === 1) {
          // Single caller → ParentHelper
          const parent = callerNames[0]
            .replace(/(Dialog|Component|Display|Wrapper|Controls|Container)$/, "");
          if (parent.length >= 3 && parent.length <= 25) {
            const suffix = comp.type === "hook" ? "Hook" : "Helper";
            recordLabel(comp, parent + suffix, "H19-caller-context");
            continue;
          }
        } else {
          // Multiple callers — check for common prefix
          let common = callerNames[0];
          for (let i = 1; i < callerNames.length; i++) {
            while (!callerNames[i].startsWith(common) && common.length > 0) {
              common = common.slice(0, -1);
            }
          }
          if (common.length >= 3) {
            recordLabel(comp, common + "Shared", "H19-caller-context");
            continue;
          }
          // Fallback: use first caller
          const parent = callerNames[0]
            .replace(/(Dialog|Component|Display|Wrapper|Controls|Container)$/, "");
          if (parent.length >= 3) {
            recordLabel(comp, parent + "Helper", "H19-caller-context");
            continue;
          }
        }
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

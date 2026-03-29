    G4();
    H_();
    Dv();
    Q6();
    hwH();
    w38();
    KOH();
    r__();
    kx();
    yr();
    W8();
    K$H();
    y6();
    lX();
    jK();
    WG();
    l$();
    lf();
    H7();
    M9();
    uj();
    wA();
    ei();
    e7();
    t6();
    SB_();
    o9H();
    A38();
    (OZK = [
      {
        id: "new-user-warmup",
        content: async () =>
          "Start with small features or bug fixes, tell Claude to propose a plan, and verify its suggested edits",
        cooldownSessions: 3,
        async isRelevant() {
          return z_().numStartups < 10;
        },
      },
      {
        id: "plan-mode-for-complex-tasks",
        content: async () =>
          `Use Plan Mode to prepare for a complex request before making changes. Press ${xY("chat:cycleMode", "Chat", "shift+tab")} twice to enable.`,
        cooldownSessions: 5,
        isRelevant: async () => {
          let H = z_();
          return (H.lastPlanModeUse ? (Date.now() - H.lastPlanModeUse) / 86400000 : 1 / 0) > 7;
        },
      },
      {
        id: "default-permission-mode-config",
        content: async () => "Use /config to change your default permission mode (including Plan Mode)",
        cooldownSessions: 10,
        isRelevant: async () => {
          try {
            let H = z_(),
              _ = X8(),
              q = Boolean(H.lastPlanModeUse),
              $ = Boolean(_?.permissions?.defaultMode);
            return q && !$;
          } catch (H) {
            return N(`Failed to check default-permission-mode-config tip relevance: ${H}`, { level: "warn" }), !1;
          }
        },
      },
      {
        id: "git-worktrees",
        content: async () => "Use git worktrees to run multiple Claude sessions in parallel.",
        cooldownSessions: 10,
        isRelevant: async () => {
          try {
            let H = z_();
            return (await PjH()) <= 1 && H.numStartups > 50;
          } catch (H) {
            return !1;
          }
        },
      },
      {
        id: "color-when-multi-clauding",
        content: async () => "Running multiple Claude sessions? Use /color and /rename to tell them apart at a glance.",
        cooldownSessions: 10,
        isRelevant: async () => {
          if (H48()) return !1;
          return (await ol_()) >= 2;
        },
      },
      {
        id: "terminal-setup",
        content: async () =>
          a6.terminal === "Apple_Terminal"
            ? "Run /terminal-setup to enable convenient terminal integration like Option + Enter for new line and more"
            : "Run /terminal-setup to enable convenient terminal integration like Shift + Enter for new line and more",
        cooldownSessions: 10,
        async isRelevant() {
          let H = z_();
          if (a6.terminal === "Apple_Terminal") return !H.optionAsMetaKeyInstalled;
          return !H.shiftEnterKeyBindingInstalled;
        },
      },
      {
        id: "shift-enter",
        content: async () =>
          a6.terminal === "Apple_Terminal"
            ? "Press Option+Enter to send a multi-line message"
            : "Press Shift+Enter to send a multi-line message",
        cooldownSessions: 10,
        async isRelevant() {
          let H = z_();
          return Boolean(
            (a6.terminal === "Apple_Terminal" ? H.optionAsMetaKeyInstalled : H.shiftEnterKeyBindingInstalled) &&
              H.numStartups > 3,
          );
        },
      },
      {
        id: "shift-enter-setup",
        content: async () =>
          a6.terminal === "Apple_Terminal"
            ? "Run /terminal-setup to enable Option+Enter for new lines"
            : "Run /terminal-setup to enable Shift+Enter for new lines",
        cooldownSessions: 10,
        async isRelevant() {
          if (!LVH()) return !1;
          let H = z_();
          return !(a6.terminal === "Apple_Terminal" ? H.optionAsMetaKeyInstalled : H.shiftEnterKeyBindingInstalled);
        },
      },
      {
        id: "memory-command",
        content: async () => "Use /memory to view and manage Claude memory",
        cooldownSessions: 15,
        async isRelevant() {
          return z_().memoryUsageCount <= 0;
        },
      },
      {
        id: "theme-command",
        content: async () => "Use /theme to change the color theme",
        cooldownSessions: 20,
        isRelevant: async () => !0,
      },
      {
        id: "colorterm-truecolor",
        content: async () => "Try setting environment variable COLORTERM=truecolor for richer colors",
        cooldownSessions: 30,
        isRelevant: async () => !process.env.COLORTERM && $_.level < 3,
      },
      {
        id: "powershell-tool-env",
        content: async () => "Set CLAUDE_CODE_USE_POWERSHELL_TOOL=1 to enable the PowerShell tool (preview)",
        cooldownSessions: 10,
        isRelevant: async () => R6() === "windows" && process.env.CLAUDE_CODE_USE_POWERSHELL_TOOL === void 0,
      },
      {
        id: "status-line",
        content: async () => "Use /statusline to set up a custom status line that will display beneath the input box",
        cooldownSessions: 25,
        isRelevant: async () => X8().statusLine === void 0,
      },
      {
        id: "prompt-queue",
        content: async () => "Hit Enter to queue up additional messages while Claude is working.",
        cooldownSessions: 5,
        async isRelevant() {
          return z_().promptQueueUseCount <= 3;
        },
      },
      {
        id: "enter-to-steer-in-relatime",
        content: async () => "Send messages to Claude while it works to steer Claude in real-time",
        cooldownSessions: 20,
        isRelevant: async () => !0,
      },
      {
        id: "todo-list",
        content: async () =>
          "Ask Claude to create a todo list when working on complex tasks to track progress and remain on track",
        cooldownSessions: 20,
        isRelevant: async () => !0,
      },
      {
        id: "vscode-command-install",
        content: async () =>
          `Open the Command Palette (Cmd+Shift+P) and run "Shell Command: Install '${a6.terminal === "vscode" ? "code" : a6.terminal}' command in PATH" to enable IDE integration`,
        cooldownSessions: 0,
        async isRelevant() {
          if (!BrH()) return !1;
          if (R6() !== "macos") return !1;
          switch (a6.terminal) {
            case "vscode":
              return !(await PL7());
            case "cursor":
              return !(await ML7());
            case "windsurf":
              return !(await JL7());
            default:
              return !1;
          }
        },
      },
      {
        id: "ide-upsell-external-terminal",
        content: async () => "Connect Claude to your IDE \xB7 /ide",
        cooldownSessions: 4,
        async isRelevant() {
          if (sM()) return !1;
          if ((await OS_()).length !== 0) return !1;
          return (await XL7()).length > 0;
        },
      },
      {
        id: "install-github-app",
        content: async () => "Run /install-github-app to tag @claude right from your Github issues and PRs",
        cooldownSessions: 10,
        isRelevant: async () => !z_().githubActionSetupCount,
      },
      {
        id: "install-slack-app",
        content: async () => "Run /install-slack-app to use Claude in Slack",
        cooldownSessions: 10,
        isRelevant: async () => !z_().slackAppInstallCount,
      },
      {
        id: "permissions",
        content: async () => "Use /permissions to pre-approve and pre-deny bash, edit, and MCP tools",
        cooldownSessions: 10,
        async isRelevant() {
          return z_().numStartups > 10;
        },
      },
      {
        id: "drag-and-drop-images",
        content: async () => "Did you know you can drag and drop image files into your terminal?",
        cooldownSessions: 10,
        isRelevant: async () => !a6.isSSH(),
      },
      {
        id: "paste-images-mac",
        content: async () => "Paste images into Claude Code using control+v (not cmd+v!)",
        cooldownSessions: 10,
        isRelevant: async () => R6() === "macos",
      },
      {
        id: "double-esc",
        content: async () => "Double-tap esc to rewind the conversation to a previous point in time",
        cooldownSessions: 10,
        isRelevant: async () => !BO(),
      },
      {
        id: "double-esc-code-restore",
        content: async () => "Double-tap esc to rewind the code and/or conversation to a previous point in time",
        cooldownSessions: 10,
        isRelevant: async () => BO(),
      },
      {
        id: "continue",
        content: async () => "Run claude --continue or claude --resume to resume a conversation",
        cooldownSessions: 10,
        isRelevant: async () => !0,
      },
      {
        id: "rename-conversation",
        content: async () => "Name your conversations with /rename to find them easily in /resume later",
        cooldownSessions: 15,
        isRelevant: async () => Ra() && z_().numStartups > 10,
      },
      {
        id: "custom-commands",
        content: async () =>
          "Create skills by adding .md files to .claude/skills/ in your project or ~/.claude/skills/ for skills that work in any project",
        cooldownSessions: 15,
        async isRelevant() {
          return z_().numStartups > 10;
        },
      },
      {
        id: "shift-tab",
        content: async () =>
          `Hit ${xY("chat:cycleMode", "Chat", "shift+tab")} to cycle between default mode, auto-accept edit mode, and plan mode`,
        cooldownSessions: 10,
        isRelevant: async () => !0,
      },
      {
        id: "image-paste",
        content: async () => `Use ${xY("chat:imagePaste", "Chat", "ctrl+v")} to paste images from your clipboard`,
        cooldownSessions: 20,
        isRelevant: async () => !0,
      },
      {
        id: "custom-agents",
        content: async () =>
          "Use /agents to optimize specific tasks. Eg. Software Architect, Code Writer, Code Reviewer",
        cooldownSessions: 15,
        async isRelevant() {
          return z_().numStartups > 5;
        },
      },
      {
        id: "agent-flag",
        content: async () => "Use --agent <agent_name> to directly start a conversation with a subagent",
        cooldownSessions: 15,
        async isRelevant() {
          return z_().numStartups > 5;
        },
      },
      {
        id: "desktop-app",
        content: async () => "Run Claude Code locally or remotely using the Claude desktop app: clau.de/desktop",
        cooldownSessions: 15,
        isRelevant: async () => R6() !== "linux",
      },
      {
        id: "desktop-shortcut",
        content: async (H) => {
          return `Continue your session in Claude Code Desktop with ${h8("suggestion", H.theme)("/desktop")}`;
        },
        cooldownSessions: 15,
        isRelevant: async () => {
          if (!f38().enable_shortcut_tip) return !1;
          return !0;
        },
      },
      {
        id: "web-app",
        content: async () => "Run tasks in the cloud while you keep coding locally \xB7 clau.de/web",
        cooldownSessions: 15,
        isRelevant: async () => !0,
      },
      {
        id: "mobile-app",
        content: async () => "/mobile to use Claude Code from the Claude app on your phone",
        cooldownSessions: 15,
        isRelevant: async () => !0,
      },
      {
        id: "opusplan-mode-reminder",
        content: async () =>
          `Your default model setting is Opus Plan Mode. Press ${xY("chat:cycleMode", "Chat", "shift+tab")} twice to activate Plan Mode and plan with Claude Opus.`,
        cooldownSessions: 2,
        async isRelevant() {
          let H = z_(),
            q = bS() === "opusplan",
            $ = H.lastPlanModeUse ? (Date.now() - H.lastPlanModeUse) / 86400000 : 1 / 0;
          return q && $ > 3;
        },
      },
      {
        id: "frontend-design-plugin",
        content: async (H) => {
          return `Working with HTML/CSS? Install the frontend-design plugin:
${h8("suggestion", H.theme)(`/plugin install frontend-design@${Cf}`)}`;
        },
        cooldownSessions: 3,
        isRelevant: async (H) => Xg9("frontend-design", H, { filePath: /\.(html|css|htm)$/i }),
      },
      {
        id: "vercel-plugin",
        content: async (H) => {
          return `Working with Vercel? Install the vercel plugin:
${h8("suggestion", H.theme)(`/plugin install vercel@${Cf}`)}`;
        },
        cooldownSessions: 3,
        isRelevant: async (H) => Xg9("vercel", H, { filePath: /(?:^|[/\\])vercel\.json$/i, cli: ["vercel"] }),
      },
      {
        id: "effort-high-nudge",
        content: async (H) => {
          let q = h8("suggestion", H.theme)("/effort high");
          return B_("tengu_tide_elm", "off") === "copy_b"
            ? `Use ${q} for better one-shot answers. Claude thinks it through first.`
            : `Working on something tricky? ${q} gives better first answers`;
        },
        cooldownSessions: 3,
        isRelevant: async () => {
          if (!p5H()) return !1;
          if (!fy(X$())) return !1;
          if (k6("policySettings")?.effortLevel !== void 0) return !1;
          if (bOH() !== void 0) return !1;
          let H = v8().effortLevel;
          if (H === "high" || H === "max") return !1;
          return B_("tengu_tide_elm", "off") !== "off";
        },
      },
      {
        id: "subagent-fanout-nudge",
        content: async (H) => {
          let _ = h8("suggestion", H.theme);
          return B_("tengu_tern_alloy", "off") === "copy_b"
            ? `For big tasks, tell Claude to ${_("use subagents")}. They work in parallel and keep your main thread clean.`
            : `Say ${_('"fan out subagents"')} and Claude sends a team. Each one digs deep so nothing gets missed.`;
        },
        cooldownSessions: 3,
        isRelevant: async () => {
          if (!p5H()) return !1;
          return B_("tengu_tern_alloy", "off") !== "off";
        },
      },
      {
        id: "loop-command-nudge",
        content: async (H) => {
          let _ = h8("suggestion", H.theme);
          return B_("tengu_timber_lark", "off") === "copy_b"
            ? `Use ${_("/loop 5m check the deploy")} to run any prompt on a schedule. Set it and forget it.`
            : `${_("/loop")} runs any prompt on a recurring schedule. Great for monitoring deploys, babysitting PRs, or polling status.`;
        },
        cooldownSessions: 3,
        isRelevant: async () => {
          if (!p5H()) return !1;
          if (!Sv()) return !1;
          return B_("tengu_timber_lark", "off") !== "off";
        },
      },
      {
        id: "guest-passes",
        content: async (H) => {
          let _ = h8("claude", H.theme),
            q = r9H();
          return q
            ? `Share Claude Code and earn ${_(n9H(q))} of extra usage \xB7 ${_("/passes")}`
            : `You have free guest passes to share \xB7 ${_("/passes")}`;
        },
        cooldownSessions: 3,
        isRelevant: async () => {
          if (z_().hasVisitedPasses) return !1;
          let { eligible: _ } = jSH();
          return _;
        },
      },
      {
        id: "overage-credit",
        content: async (H) => {
          let _ = h8("claude", H.theme),
            q = yfH(),
            $ = q ? chH(q) : null;
          if (!$) return "";
          return `${_(`${$} in extra usage, on us`)} \xB7 third-party apps \xB7 ${_("/extra-usage")}`;
        },
        cooldownSessions: 3,
        isRelevant: async () => s68(),
      },
      {
        id: "feedback-command",
        content: async () => "Use /feedback to help us improve!",
        cooldownSessions: 15,
        async isRelevant() {
          return z_().numStartups > 5;
        },
      },
    ]),
      (TZK = []);

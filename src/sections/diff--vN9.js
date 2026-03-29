    PTH();
    pf();
    CO();
    g_();
    h_();
    j9();
    N_();
    q8();
    H7();
    e7();
    F_();
    (vL = require("fs/promises")), (yb = require("path"));
    (SfK = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".py": "Python",
      ".rb": "Ruby",
      ".go": "Go",
      ".rs": "Rust",
      ".java": "Java",
      ".md": "Markdown",
      ".json": "JSON",
      ".yaml": "YAML",
      ".yml": "YAML",
      ".sh": "Shell",
      ".css": "CSS",
      ".html": "HTML",
    }),
      (EfK = {
        debug_investigate: "Debug/Investigate",
        implement_feature: "Implement Feature",
        fix_bug: "Fix Bug",
        write_script_tool: "Write Script/Tool",
        refactor_code: "Refactor Code",
        configure_system: "Configure System",
        create_pr_commit: "Create PR/Commit",
        analyze_data: "Analyze Data",
        understand_codebase: "Understand Codebase",
        write_tests: "Write Tests",
        write_docs: "Write Docs",
        deploy_infra: "Deploy/Infra",
        warmup_minimal: "Cache Warmup",
        fast_accurate_search: "Fast/Accurate Search",
        correct_code_edits: "Correct Code Edits",
        good_explanations: "Good Explanations",
        proactive_help: "Proactive Help",
        multi_file_changes: "Multi-file Changes",
        handled_complexity: "Multi-file Changes",
        good_debugging: "Good Debugging",
        misunderstood_request: "Misunderstood Request",
        wrong_approach: "Wrong Approach",
        buggy_code: "Buggy Code",
        user_rejected_action: "User Rejected Action",
        claude_got_blocked: "Claude Got Blocked",
        user_stopped_early: "User Stopped Early",
        wrong_file_or_location: "Wrong File/Location",
        excessive_changes: "Excessive Changes",
        slow_or_verbose: "Slow/Verbose",
        tool_failed: "Tool Failed",
        user_unclear: "User Unclear",
        external_issue: "External Issue",
        frustrated: "Frustrated",
        dissatisfied: "Dissatisfied",
        likely_satisfied: "Likely Satisfied",
        satisfied: "Satisfied",
        happy: "Happy",
        unsure: "Unsure",
        neutral: "Neutral",
        delighted: "Delighted",
        single_task: "Single Task",
        multi_task: "Multi Task",
        iterative_refinement: "Iterative Refinement",
        exploration: "Exploration",
        quick_question: "Quick Question",
        fully_achieved: "Fully Achieved",
        mostly_achieved: "Mostly Achieved",
        partially_achieved: "Partially Achieved",
        not_achieved: "Not Achieved",
        unclear_from_transcript: "Unclear",
        unhelpful: "Unhelpful",
        slightly_helpful: "Slightly Helpful",
        moderately_helpful: "Moderately Helpful",
        very_helpful: "Very Helpful",
        essential: "Essential",
      });
    ifK = [
      {
        name: "project_areas",
        prompt: `Analyze this Claude Code usage data and identify project areas.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "areas": [
    {"name": "Area name", "session_count": N, "description": "2-3 sentences about what was worked on and how Claude Code was used."}
  ]
}

Include 4-5 areas. Skip internal CC operations.`,
        maxTokens: 8192,
      },
      {
        name: "interaction_style",
        prompt: `Analyze this Claude Code usage data and describe the user's interaction style.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "narrative": "2-3 paragraphs analyzing HOW the user interacts with Claude Code. Use second person 'you'. Describe patterns: iterate quickly vs detailed upfront specs? Interrupt often or let Claude run? Include specific examples. Use **bold** for key insights.",
  "key_pattern": "One sentence summary of most distinctive interaction style"
}`,
        maxTokens: 8192,
      },
      {
        name: "what_works",
        prompt: `Analyze this Claude Code usage data and identify what's working well for this user. Use second person ("you").

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence of context",
  "impressive_workflows": [
    {"title": "Short title (3-6 words)", "description": "2-3 sentences describing the impressive workflow or approach. Use 'you' not 'the user'."}
  ]
}

Include 3 impressive workflows.`,
        maxTokens: 8192,
      },
      {
        name: "friction_analysis",
        prompt: `Analyze this Claude Code usage data and identify friction points for this user. Use second person ("you").

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence summarizing friction patterns",
  "categories": [
    {"category": "Concrete category name", "description": "1-2 sentences explaining this category and what could be done differently. Use 'you' not 'the user'.", "examples": ["Specific example with consequence", "Another example"]}
  ]
}

Include 3 friction categories with 2 examples each.`,
        maxTokens: 8192,
      },
      {
        name: "suggestions",
        prompt: `Analyze this Claude Code usage data and suggest improvements.

## CC FEATURES REFERENCE (pick from these for features_to_try):
1. **MCP Servers**: Connect Claude to external tools, databases, and APIs via Model Context Protocol.
   - How to use: Run \`claude mcp add <server-name> -- <command>\`
   - Good for: database queries, Slack integration, GitHub issue lookup, connecting to internal APIs

2. **Custom Skills**: Reusable prompts you define as markdown files that run with a single /command.
   - How to use: Create \`.claude/skills/commit/SKILL.md\` with instructions. Then type \`/commit\` to run it.
   - Good for: repetitive workflows - /commit, /review, /test, /deploy, /pr, or complex multi-step workflows

3. **Hooks**: Shell commands that auto-run at specific lifecycle events.
   - How to use: Add to \`.claude/settings.json\` under "hooks" key.
   - Good for: auto-formatting code, running type checks, enforcing conventions

4. **Headless Mode**: Run Claude non-interactively from scripts and CI/CD.
   - How to use: \`claude -p "fix lint errors" --allowedTools "Edit,Read,Bash"\`
   - Good for: CI/CD integration, batch code fixes, automated reviews

5. **Task Agents**: Claude spawns focused sub-agents for complex exploration or parallel work.
   - How to use: Claude auto-invokes when helpful, or ask "use an agent to explore X"
   - Good for: codebase exploration, understanding complex systems

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "claude_md_additions": [
    {"addition": "A specific line or block to add to CLAUDE.md based on workflow patterns. E.g., 'Always run tests after modifying auth-related files'", "why": "1 sentence explaining why this would help based on actual sessions", "prompt_scaffold": "Instructions for where to add this in CLAUDE.md. E.g., 'Add under ## Testing section'"}
  ],
  "features_to_try": [
    {"feature": "Feature name from CC FEATURES REFERENCE above", "one_liner": "What it does", "why_for_you": "Why this would help YOU based on your sessions", "example_code": "Actual command or config to copy"}
  ],
  "usage_patterns": [
    {"title": "Short title", "suggestion": "1-2 sentence summary", "detail": "3-4 sentences explaining how this applies to YOUR work", "copyable_prompt": "A specific prompt to copy and try"}
  ]
}

IMPORTANT for claude_md_additions: PRIORITIZE instructions that appear MULTIPLE TIMES in the user data. If user told Claude the same thing in 2+ sessions (e.g., 'always run tests', 'use TypeScript'), that's a PRIME candidate - they shouldn't have to repeat themselves.

IMPORTANT for features_to_try: Pick 2-3 from the CC FEATURES REFERENCE above. Include 2-3 items for each category.`,
        maxTokens: 8192,
      },
      {
        name: "on_the_horizon",
        prompt: `Analyze this Claude Code usage data and identify future opportunities.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "intro": "1 sentence about evolving AI-assisted development",
  "opportunities": [
    {"title": "Short title (4-8 words)", "whats_possible": "2-3 ambitious sentences about autonomous workflows", "how_to_try": "1-2 sentences mentioning relevant tooling", "copyable_prompt": "Detailed prompt to try"}
  ]
}

Include 3 opportunities. Think BIG - autonomous workflows, parallel agents, iterating against tests.`,
        maxTokens: 8192,
      },
      ...[],
      {
        name: "fun_ending",
        prompt: `Analyze this Claude Code usage data and find a memorable moment.

RESPOND WITH ONLY A VALID JSON OBJECT:
{
  "headline": "A memorable QUALITATIVE moment from the transcripts - not a statistic. Something human, funny, or surprising.",
  "detail": "Brief context about when/where this happened"
}

Find something genuinely interesting or amusing from the session summaries.`,
        maxTokens: 8192,
      },
    ];
    (rfK = ["frustrated", "dissatisfied", "likely_satisfied", "satisfied", "happy", "unsure"]),
      (ofK = ["not_achieved", "partially_achieved", "mostly_achieved", "fully_achieved", "unclear_from_transcript"]);
    $wK = {
      type: "prompt",
      name: "insights",
      description: "Generate a report analyzing your Claude Code sessions",
      contentLength: 0,
      progressMessage: "analyzing your sessions",
      source: "builtin",
      async getPromptForCommand(H) {
        let _ = !1,
          q = [],
          $ = !1,
          { insights: K, htmlPath: O, data: T, remoteStats: z } = await ZN9({ collectRemote: _ }),
          A = `file://${O}`,
          f = "",
          Y = [
            T.total_sessions_scanned && T.total_sessions_scanned > T.total_sessions
              ? `${T.total_sessions_scanned.toLocaleString()} sessions total \xB7 ${T.total_sessions} analyzed`
              : `${T.total_sessions} sessions`,
            `${T.total_messages.toLocaleString()} messages`,
            `${Math.round(T.total_duration_hours)}h`,
            `${T.git_commits} commits`,
          ].join(" \xB7 "),
          D = "",
          j = K.at_a_glance,
          M = j
            ? `## At a Glance

${j.whats_working ? `**What's working:** ${j.whats_working} See _Impressive Things You Did_.` : ""}

${j.whats_hindering ? `**What's hindering you:** ${j.whats_hindering} See _Where Things Go Wrong_.` : ""}

${j.quick_wins ? `**Quick wins to try:** ${j.quick_wins} See _Features to Try_.` : ""}

${j.ambitious_workflows ? `**Ambitious workflows:** ${j.ambitious_workflows} See _On the Horizon_.` : ""}`
            : "_No insights generated_",
          P = `${`# Claude Code Insights

${Y}
${T.date_range.start} to ${T.date_range.end}
${D}
`}${M}

Your full shareable insights report is ready: ${A}${f}`;
        return [
          {
            type: "text",
            text: `The user just ran /insights to generate a usage report analyzing their Claude Code sessions.

Here is the full insights data:
${gH(K, null, 2)}

Report URL: ${A}
HTML file: ${O}
Facets directory: ${Ji_()}

Here is what the user sees:
${P}

Now output the following message exactly:

<message>
Your shareable insights report is ready:
${A}${f}

Want to dig into any section or try one of the suggestions?
</message>`,
          },
        ];
      },
    };
    KwK = $wK;

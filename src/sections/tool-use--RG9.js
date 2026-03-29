    u7();
    k_();
    TAH();
    vl_ = $6(
      function (H) {
        return {
          PreToolUse: {
            summary: "Before tool execution",
            description: `Input to command is JSON of tool call arguments.
Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to model and block tool call
Other exit codes - show stderr to user only but continue with tool call`,
            matcherMetadata: { fieldToMatch: "tool_name", values: H },
          },
          PostToolUse: {
            summary: "After tool execution",
            description: `Input to command is JSON with fields "inputs" (tool call arguments) and "response" (tool call response).
Exit code 0 - stdout shown in transcript mode (ctrl+o)
Exit code 2 - show stderr to model immediately
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "tool_name", values: H },
          },
          PostToolUseFailure: {
            summary: "After tool execution fails",
            description: `Input to command is JSON with tool_name, tool_input, tool_use_id, error, error_type, is_interrupt, and is_timeout.
Exit code 0 - stdout shown in transcript mode (ctrl+o)
Exit code 2 - show stderr to model immediately
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "tool_name", values: H },
          },
          Notification: {
            summary: "When notifications are sent",
            description: `Input to command is JSON with notification message and type.
Exit code 0 - stdout/stderr not shown
Other exit codes - show stderr to user only`,
            matcherMetadata: {
              fieldToMatch: "notification_type",
              values: [
                "permission_prompt",
                "idle_prompt",
                "auth_success",
                "elicitation_dialog",
                "elicitation_complete",
                "elicitation_response",
              ],
            },
          },
          UserPromptSubmit: {
            summary: "When the user submits a prompt",
            description: `Input to command is JSON with original user prompt text.
Exit code 0 - stdout shown to Claude
Exit code 2 - block processing, erase original prompt, and show stderr to user only
Other exit codes - show stderr to user only`,
          },
          SessionStart: {
            summary: "When a new session is started",
            description: `Input to command is JSON with session start source.
Exit code 0 - stdout shown to Claude
Blocking errors are ignored
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "source", values: ["startup", "resume", "clear", "compact"] },
          },
          Stop: {
            summary: "Right before Claude concludes its response",
            description: `Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to model and continue conversation
Other exit codes - show stderr to user only`,
          },
          StopFailure: {
            summary: "When the turn ends due to an API error",
            description:
              "Fires instead of Stop when an API error (rate limit, auth failure, etc.) ended the turn. Fire-and-forget \u2014 hook output and exit codes are ignored.",
            matcherMetadata: {
              fieldToMatch: "error",
              values: [
                "rate_limit",
                "authentication_failed",
                "billing_error",
                "invalid_request",
                "server_error",
                "max_output_tokens",
                "unknown",
              ],
            },
          },
          SubagentStart: {
            summary: "When a subagent (Agent tool call) is started",
            description: `Input to command is JSON with agent_id and agent_type.
Exit code 0 - stdout shown to subagent
Blocking errors are ignored
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "agent_type", values: [] },
          },
          SubagentStop: {
            summary: "Right before a subagent (Agent tool call) concludes its response",
            description: `Input to command is JSON with agent_id, agent_type, and agent_transcript_path.
Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to subagent and continue having it run
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "agent_type", values: [] },
          },
          PreCompact: {
            summary: "Before conversation compaction",
            description: `Input to command is JSON with compaction details.
Exit code 0 - stdout appended as custom compact instructions
Exit code 2 - block compaction
Other exit codes - show stderr to user only but continue with compaction`,
            matcherMetadata: { fieldToMatch: "trigger", values: ["manual", "auto"] },
          },
          PostCompact: {
            summary: "After conversation compaction",
            description: `Input to command is JSON with compaction details and the summary.
Exit code 0 - stdout shown to user
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "trigger", values: ["manual", "auto"] },
          },
          SessionEnd: {
            summary: "When a session is ending",
            description: `Input to command is JSON with session end reason.
Exit code 0 - command completes successfully
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "reason", values: ["clear", "logout", "prompt_input_exit", "other"] },
          },
          PermissionRequest: {
            summary: "When a permission dialog is displayed",
            description: `Input to command is JSON with tool_name, tool_input, and tool_use_id.
Output JSON with hookSpecificOutput containing decision to allow or deny.
Exit code 0 - use hook decision if provided
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "tool_name", values: H },
          },
          Setup: {
            summary: "Repo setup hooks for init and maintenance",
            description: `Input to command is JSON with trigger (init or maintenance).
Exit code 0 - stdout shown to Claude
Blocking errors are ignored
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "trigger", values: ["init", "maintenance"] },
          },
          TeammateIdle: {
            summary: "When a teammate is about to go idle",
            description: `Input to command is JSON with teammate_name and team_name.
Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to teammate and prevent idle (teammate continues working)
Other exit codes - show stderr to user only`,
          },
          TaskCreated: {
            summary: "When a task is being created",
            description: `Input to command is JSON with task_id, task_subject, task_description, teammate_name, and team_name.
Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to model and prevent task creation
Other exit codes - show stderr to user only`,
          },
          TaskCompleted: {
            summary: "When a task is being marked as completed",
            description: `Input to command is JSON with task_id, task_subject, task_description, teammate_name, and team_name.
Exit code 0 - stdout/stderr not shown
Exit code 2 - show stderr to model and prevent task completion
Other exit codes - show stderr to user only`,
          },
          Elicitation: {
            summary: "When an MCP server requests user input (elicitation)",
            description: `Input to command is JSON with mcp_server_name, message, and requested_schema.
Output JSON with hookSpecificOutput containing action (accept/decline/cancel) and optional content.
Exit code 0 - use hook response if provided
Exit code 2 - deny the elicitation
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "mcp_server_name", values: [] },
          },
          ElicitationResult: {
            summary: "After a user responds to an MCP elicitation",
            description: `Input to command is JSON with mcp_server_name, action, content, mode, and elicitation_id.
Output JSON with hookSpecificOutput containing optional action and content to override the response.
Exit code 0 - use hook response if provided
Exit code 2 - block the response (action becomes decline)
Other exit codes - show stderr to user only`,
            matcherMetadata: { fieldToMatch: "mcp_server_name", values: [] },
          },
          ConfigChange: {
            summary: "When configuration files change during a session",
            description: `Input to command is JSON with source (user_settings, project_settings, local_settings, policy_settings, skills) and file_path.
Exit code 0 - allow the change
Exit code 2 - block the change from being applied to the session
Other exit codes - show stderr to user only`,
            matcherMetadata: {
              fieldToMatch: "source",
              values: ["user_settings", "project_settings", "local_settings", "policy_settings", "skills"],
            },
          },
          InstructionsLoaded: {
            summary: "When an instruction file (CLAUDE.md or rule) is loaded",
            description: `Input to command is JSON with file_path, memory_type (User, Project, Local, Managed), load_reason (session_start, nested_traversal, path_glob_match, include, compact), globs (optional \u2014 the paths: frontmatter patterns that matched), trigger_file_path (optional \u2014 the file Claude touched that caused the load), and parent_file_path (optional \u2014 the file that @-included this one).
Exit code 0 - command completes successfully
Other exit codes - show stderr to user only
This hook is observability-only and does not support blocking.`,
            matcherMetadata: {
              fieldToMatch: "load_reason",
              values: ["session_start", "nested_traversal", "path_glob_match", "include", "compact"],
            },
          },
          WorktreeCreate: {
            summary: "Create an isolated worktree for VCS-agnostic isolation",
            description: `Input to command is JSON with name (suggested worktree slug).
Stdout should contain the absolute path to the created worktree directory.
Exit code 0 - worktree created successfully
Other exit codes - worktree creation failed`,
          },
          WorktreeRemove: {
            summary: "Remove a previously created worktree",
            description: `Input to command is JSON with worktree_path (absolute path to worktree).
Exit code 0 - worktree removed successfully
Other exit codes - show stderr to user only`,
          },
          CwdChanged: {
            summary: "After the working directory changes",
            description: `Input to command is JSON with old_cwd and new_cwd.
CLAUDE_ENV_FILE is set \u2014 write bash exports there to apply env to subsequent BashTool commands.
Hook output can include hookSpecificOutput.watchPaths (array of absolute paths) to register with the FileChanged watcher.
Exit code 0 - command completes successfully
Other exit codes - show stderr to user only`,
          },
          FileChanged: {
            summary: "When a watched file changes",
            description: `Input to command is JSON with file_path and event (change, add, unlink).
CLAUDE_ENV_FILE is set \u2014 write bash exports there to apply env to subsequent BashTool commands.
The matcher field specifies filenames to watch in the current directory (e.g. ".envrc|.env").
Hook output can include hookSpecificOutput.watchPaths (array of absolute paths) to dynamically update the watch list.
Exit code 0 - command completes successfully
Other exit codes - show stderr to user only`,
          },
        };
      },
      (H) => H.slice().sort().join(","),
    );

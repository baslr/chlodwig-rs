    VC_();
    l$();
    nkH();
    _AH();
    ez9 = [
      "Bash(git checkout --branch:*)",
      "Bash(git checkout -b:*)",
      "Bash(git add:*)",
      "Bash(git status:*)",
      "Bash(git push:*)",
      "Bash(git commit:*)",
      "Bash(gh pr create:*)",
      "Bash(gh pr edit:*)",
      "Bash(gh pr view:*)",
      "Bash(gh pr merge:*)",
      "ToolSearch",
      "mcp__slack__send_message",
      "mcp__claude_ai_Slack__slack_send_message",
    ];
    (Ie1 = {
      type: "prompt",
      name: "commit-push-pr",
      description: "Commit, push, and open a PR",
      allowedTools: ez9,
      get contentLength() {
        return HA9("main").length;
      },
      progressMessage: "creating commit and PR",
      source: "builtin",
      async getPromptForCommand(H, _) {
        let [q, $] = await Promise.all([mR(), hE7(_.getAppState)]),
          K = HA9(q, $),
          O = H?.trim();
        if (O)
          K += `

## Additional instructions from user

${O}`;
        return [
          {
            type: "text",
            text: await Tc(
              K,
              {
                ..._,
                getAppState() {
                  let z = _.getAppState();
                  return {
                    ...z,
                    toolPermissionContext: {
                      ...z.toolPermissionContext,
                      alwaysAllowRules: { ...z.toolPermissionContext.alwaysAllowRules, command: ez9 },
                    },
                  };
                },
              },
              "/commit-push-pr",
            ),
          },
        ];
      },
    }),
      (_A9 = Ie1);

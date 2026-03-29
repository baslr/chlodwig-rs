    VC_();
    nkH();
    _AH();
    Nz9 = ["Bash(git add:*)", "Bash(git status:*)", "Bash(git commit:*)"];
    (we1 = {
      type: "prompt",
      name: "commit",
      description: "Create a git commit",
      allowedTools: Nz9,
      contentLength: 0,
      progressMessage: "creating commit",
      source: "builtin",
      async getPromptForCommand(H, _) {
        let q = fe1();
        return [
          {
            type: "text",
            text: await Tc(
              q,
              {
                ..._,
                getAppState() {
                  let K = _.getAppState();
                  return {
                    ...K,
                    toolPermissionContext: {
                      ...K.toolPermissionContext,
                      alwaysAllowRules: { ...K.toolPermissionContext.alwaysAllowRules, command: Nz9 },
                    },
                  };
                },
              },
              "/commit",
            ),
          },
        ];
      },
    }),
      (hz9 = we1);

    Bk();
    ti();
    nkH();
    $09 = mQ_({
      name: "security-review",
      description: "Complete a security review of the pending changes on the current branch",
      progressMessage: "analyzing code changes for security risks",
      pluginName: "security-review",
      pluginCommand: "security-review",
      async getPromptWhileMarketplaceIsPrivate(H, _) {
        let q = yY(tKK),
          $ = gg(q.frontmatter["allowed-tools"]);
        return [
          {
            type: "text",
            text: await Tc(
              q.content,
              {
                ..._,
                getAppState() {
                  let O = _.getAppState();
                  return {
                    ...O,
                    toolPermissionContext: {
                      ...O.toolPermissionContext,
                      alwaysAllowRules: { ...O.toolPermissionContext.alwaysAllowRules, command: $ },
                    },
                  };
                },
              },
              "security-review",
            ),
          },
        ];
      },
    });

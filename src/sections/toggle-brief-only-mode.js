    x8();
    k_();
    t6();
    L_();
    XF();
    MI();
    (PAK = pH(() => h.object({ enable_slash_command: h.boolean() }))), (uv9 = { enable_slash_command: !1 });
    (WAK = {
      type: "local-jsx",
      name: "brief",
      description: "Toggle brief-only mode",
      isEnabled: () => {
        return XAK().enable_slash_command;
      },
      immediate: !0,
      load: () =>
        Promise.resolve({
          async call(H, _) {
            let $ = !_.getAppState().isBriefOnly;
            if ($ && !Cd_())
              return (
                Q("tengu_brief_mode_toggled", { enabled: !1, gated: !0, source: "slash_command" }),
                H("Brief tool is not enabled for your account", { display: "system" }),
                null
              );
            Cp($),
              _.setAppState((O) => {
                if (O.isBriefOnly === $) return O;
                return { ...O, isBriefOnly: $ };
              }),
              Q("tengu_brief_mode_toggled", { enabled: $, gated: !1, source: "slash_command" });
            let K = FL()
              ? void 0
              : [
                  `<system-reminder>
${$ ? `Brief mode is now enabled. Use the ${ojH} tool for all user-facing output \u2014 plain text outside it is hidden from the user's view.` : `Brief mode is now disabled. The ${ojH} tool is no longer available \u2014 reply with plain text.`}
</system-reminder>`,
                ];
            return (
              H($ ? "Brief-only mode enabled" : "Brief-only mode disabled", { display: "system", metaMessages: K }),
              null
            );
          },
        }),
    }),
      (GAK = WAK);

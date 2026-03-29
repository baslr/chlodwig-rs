    bq();
    c3();
    (lOK = {
      name: "sandbox",
      get description() {
        let H = j8.isSandboxingEnabled(),
          _ = j8.isAutoAllowBashIfSandboxedEnabled(),
          q = j8.areUnsandboxedCommandsAllowed(),
          $ = j8.areSandboxSettingsLockedByPolicy(),
          K = j8.checkDependencies().errors.length === 0,
          O;
        if (!K) O = oH.warning;
        else O = H ? oH.tick : oH.circle;
        let T = "sandbox disabled";
        if (H) (T = _ ? "sandbox enabled (auto-allow)" : "sandbox enabled"), (T += q ? ", fallback allowed" : "");
        if ($) T += " (managed)";
        return `${O} ${T} (\u23CE to configure)`;
      },
      argumentHint: 'exclude "command pattern"',
      get isHidden() {
        return !j8.isSupportedPlatform() || !j8.isPlatformInEnabledList();
      },
      immediate: !0,
      type: "local-jsx",
      load: () => Promise.resolve().then(() => (WL9(), XL9)),
    }),
      (GL9 = lOK);

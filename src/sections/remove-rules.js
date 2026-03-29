    x8();
    yJ();
    Vr6();
    (ZhH = pH(() => a7.enum(["userSettings", "projectSettings", "localSettings", "session", "cliArg"]))),
      (LhH = pH(() =>
        a7.discriminatedUnion("type", [
          a7.object({ type: a7.literal("addRules"), rules: a7.array($B_()), behavior: RhH(), destination: ZhH() }),
          a7.object({ type: a7.literal("replaceRules"), rules: a7.array($B_()), behavior: RhH(), destination: ZhH() }),
          a7.object({ type: a7.literal("removeRules"), rules: a7.array($B_()), behavior: RhH(), destination: ZhH() }),
          a7.object({ type: a7.literal("setMode"), mode: XX8(), destination: ZhH() }),
          a7.object({ type: a7.literal("addDirectories"), directories: a7.array(a7.string()), destination: ZhH() }),
          a7.object({ type: a7.literal("removeDirectories"), directories: a7.array(a7.string()), destination: ZhH() }),
        ]),
      ));

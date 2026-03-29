    k_();
    (wf9 = {
      name: "context",
      description: "Visualize current context usage as a colored grid",
      isEnabled: () => !o8(),
      type: "local-jsx",
      load: () => Promise.resolve().then(() => (Af9(), zf9)),
    }),
      (Yf9 = {
        type: "local",
        name: "context",
        supportsNonInteractive: !0,
        description: "Show current context usage",
        get isHidden() {
          return !o8();
        },
        isEnabled() {
          return o8();
        },
        load: () => Promise.resolve().then(() => (O88(), ff9)),
      });

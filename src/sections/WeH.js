    k_();
    W8();
    (g7H = {
      type: "local-jsx",
      name: "extra-usage",
      description: "Configure extra usage to keep working when limits are hit",
      isEnabled: () => Zs7() && !o8(),
      load: () => Promise.resolve().then(() => (Lo6(), Ws7)),
    }),
      (Ls7 = {
        type: "local",
        name: "extra-usage",
        supportsNonInteractive: !0,
        description: "Configure extra usage to keep working when limits are hit",
        isEnabled: () => Zs7() && o8(),
        get isHidden() {
          return !o8();
        },
        load: () => Promise.resolve().then(() => (Rs7(), Gs7)),
      });

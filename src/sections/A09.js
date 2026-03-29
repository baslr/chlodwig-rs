    jK();
    (eKK = { ghostty: "Ghostty", kitty: "Kitty", "iTerm.app": "iTerm2", WezTerm: "WezTerm" }),
      (H5K = {
        type: "local-jsx",
        name: "terminal-setup",
        description:
          a6.terminal === "Apple_Terminal"
            ? "Enable Option+Enter key binding for newlines and visual bell"
            : "Install Shift+Enter key binding for newlines",
        isHidden: a6.terminal !== null && a6.terminal in eKK,
        load: () => Promise.resolve().then(() => (hwH(), IO9)),
      }),
      (z09 = H5K);

    u7();
    ZxH();
    H_();
    n8();
    (tL8 = require("https")),
      (wS = $6(() => {
        let H = {};
        if (process.env.CLAUDE_CODE_CLIENT_CERT)
          try {
            (H.cert = f_().readFileSync(process.env.CLAUDE_CODE_CLIENT_CERT, { encoding: "utf8" })),
              N("mTLS: Loaded client certificate from CLAUDE_CODE_CLIENT_CERT");
          } catch (_) {
            N(`mTLS: Failed to load client certificate: ${_}`, { level: "error" });
          }
        if (process.env.CLAUDE_CODE_CLIENT_KEY)
          try {
            (H.key = f_().readFileSync(process.env.CLAUDE_CODE_CLIENT_KEY, { encoding: "utf8" })),
              N("mTLS: Loaded client key from CLAUDE_CODE_CLIENT_KEY");
          } catch (_) {
            N(`mTLS: Failed to load client key: ${_}`, { level: "error" });
          }
        if (process.env.CLAUDE_CODE_CLIENT_KEY_PASSPHRASE)
          (H.passphrase = process.env.CLAUDE_CODE_CLIENT_KEY_PASSPHRASE), N("mTLS: Using client key passphrase");
        if (Object.keys(H).length === 0) return;
        return H;
      })),
      (T3_ = $6(() => {
        let H = wS(),
          _ = ZI();
        if (!H && !_) return;
        let q = { ...H, ...(_ && { ca: _ }), keepAlive: !0 };
        return N("mTLS: Creating HTTPS agent with custom certificates"), new tL8.Agent(q);
      }));

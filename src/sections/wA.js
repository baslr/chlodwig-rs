    Z9();
    Tt();
    u7();
    t6();
    H_();
    g_();
    h_();
    j9();
    n8();
    l$();
    N_();
    Q6();
    F_();
    CZ_();
    zN();
    SGH();
    uj();
    NF();
    ei();
    dH8();
    SZ();
    cM();
    fx();
    UR();
    (S59 = require("fs/promises")), (v4 = require("path"));
    A__ = { GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "" };
    FW = $6(async (H) => {
      let _ = await gK(),
        q = _[H];
      if (!q)
        throw Error(
          `Marketplace '${H}' not found in configuration. Available marketplaces: ${Object.keys(_).join(", ")}`,
        );
      if (Zt(q.source) && !v4.isAbsolute(q.source.path))
        throw Error(
          `Marketplace "${H}" has a relative source path (${q.source.path}) ` +
            "in known_marketplaces.json \u2014 this is stale state from an older " +
            `Claude Code version. Run 'claude marketplace remove ${H}' and re-add it from the original project directory.`,
        );
      try {
        return await f__(q.installLocation);
      } catch (K) {
        N(`Cache corrupted or missing for marketplace ${H}, re-fetching from source: ${QH(K)}`, { level: "warn" });
      }
      let $;
      try {
        ({ marketplace: $ } = await FH8(q.source));
      } catch (K) {
        throw Error(`Failed to load marketplace "${H}" from source (${q.source.source}): ${QH(K)}`);
      }
      return (_[H].lastUpdated = new Date().toISOString()), await hF(_), $;
    });

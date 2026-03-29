    G4();
    NJ();
    u7();
    s$();
    L_();
    ql();
    lK();
    k_();
    Yf6();
    gJ();
    zPH();
    Gf6();
    qpH();
    OY6();
    JZ();
    y6();
    H_();
    g_();
    h_();
    j9();
    N_();
    dp();
    nHH();
    IW6();
    wKH();
    Q6();
    F_();
    (pW6 = require("child_process")), (QJ_ = require("fs/promises")), (qLq = require("path"));
    ge = WIH(async () => {
      let H = await gT4(),
        _ = await cT4();
      if (H || _) await _Kq();
      return _;
    }, BT4);
    vdH = WIH(async () => {
      return await QT4();
    }, UT4);
    HWH = $6(() => {
      if (K1()) return null;
      {
        let _ = tZq();
        if (_) {
          if (_.stdout) return { key: _.stdout, source: "/login managed key" };
        } else {
          let q = yh();
          try {
            let $ = aV(`security find-generic-password -a $USER -w -s "${q}"`);
            if ($) return { key: $, source: "/login managed key" };
          } catch ($) {
            AH($);
          }
        }
      }
      let H = z_();
      if (!H.primaryApiKey) return null;
      return { key: H.primaryApiKey, source: "/login managed key" };
    });
    t8 = $6(() => {
      if (K1()) return null;
      if (process.env.CLAUDE_CODE_OAUTH_TOKEN)
        return {
          accessToken: process.env.CLAUDE_CODE_OAUTH_TOKEN,
          refreshToken: null,
          expiresAt: null,
          scopes: ["user:inference"],
          subscriptionType: null,
          rateLimitTier: null,
        };
      let H = bw_();
      if (H)
        return {
          accessToken: H,
          refreshToken: null,
          expiresAt: null,
          scopes: ["user:inference"],
          subscriptionType: null,
          rateLimitTier: null,
        };
      try {
        let $ = C4().read()?.claudeAiOauth;
        if (!$?.accessToken) return null;
        return $;
      } catch (_) {
        return AH(_), null;
      }
    });
    uW6 = new Map();
    YLq = class YLq extends Error {};

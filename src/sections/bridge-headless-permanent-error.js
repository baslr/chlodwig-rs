    M0H();
    $i();
    t6();
    L_();
    H_();
    SO();
    g_();
    h_();
    K7();
    N_();
    uW();
    O8_();
    C7H();
    xy9();
    Da();
    ii_();
    ni_();
    Fy9();
    DAH();
    x8_();
    (Q8_ = require("crypto")),
      (l8_ = require("os")),
      (Y$H = require("path")),
      (z2K = {
        connInitialMs: 2000,
        connCapMs: 120000,
        connGiveUpMs: 600000,
        generalInitialMs: 500,
        generalCapMs: 30000,
        generalGiveUpMs: 600000,
      });
    w2K = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENETUNREACH", "EHOSTUNREACH"]);
    D2K = ["session", "same-dir", "worktree"];
    U8_ = class U8_ extends Error {
      constructor(H) {
        super(H);
        this.name = "BridgeHeadlessPermanentError";
      }
    };

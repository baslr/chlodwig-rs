    ZzH();
    cp6();
    NrH();
    Z9();
    s$();
    dD();
    g_();
    h_();
    N_();
    M9();
    nHH();
    wKH();
    F_();
    L_();
    oB6();
    gD();
    Ik7();
    trH();
    (gS_ = require("crypto")),
      (lk7 = require("fs/promises")),
      (ik7 = require("http")),
      (nk7 = require("path")),
      (rk7 = require("url")),
      (eB6 = u(iB6(), 1)),
      (Kw1 = ["state", "nonce", "code_challenge", "code_verifier", "code"]);
    Ow1 = new Set(["invalid_refresh_token", "expired_refresh_token", "token_expired"]);
    fr = class fr extends Error {
      constructor() {
        super("Authentication was cancelled");
        this.name = "AuthenticationCancelledError";
      }
    };

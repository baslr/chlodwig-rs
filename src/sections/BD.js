    u7();
    k_();
    I8();
    H_();
    g_();
    h_();
    zp6();
    n8();
    N_();
    Q6();
    JV_();
    (sG7 = require("crypto")), (PV_ = require("fs/promises")), (by = require("path"));
    PT = $6(function () {
      let q = v8().plansDirectory,
        $;
      if (q) {
        let K = X_(),
          O = by.resolve(K, q);
        if (!O.startsWith(K + by.sep) && O !== K)
          AH(Error(`plansDirectory must be within project root: ${q}`)), ($ = by.join(i6(), "plans"));
        else $ = O;
      } else $ = by.join(i6(), "plans");
      try {
        f_().mkdirSync($);
      } catch (K) {
        AH(K);
      }
      return $;
    });

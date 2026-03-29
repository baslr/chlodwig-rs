    Z9();
    u7();
    ZxH();
    H_();
    g_();
    LI();
    TF8 = u(RxH(), 1);
    UO6 = $6((H) => {
      let _ = require("undici"),
        q = wS(),
        $ = ZI(),
        K = { httpProxy: H, httpsProxy: H, noProxy: process.env.NO_PROXY || process.env.no_proxy };
      if (q || $) {
        let O = { ...(q && { cert: q.cert, key: q.key, passphrase: q.passphrase }), ...($ && { ca: $ }) };
        (K.connect = O), (K.requestTls = O);
      }
      return new _.EnvHttpProxyAgent(K);
    });

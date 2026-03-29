    u7();
    H_();
    g_();
    n8();
    ZI = $6(() => {
      let H = V2H("--use-system-ca") || V2H("--use-openssl-ca"),
        _ = process.env.NODE_EXTRA_CA_CERTS;
      if ((N(`CA certs: useSystemCA=${H}, extraCertsPath=${_}`), !H && !_)) return;
      let q = require("tls"),
        $ = [];
      if (H) {
        let K = q.getCACertificates,
          O = K?.("system");
        if (O && O.length > 0) $.push(...O), N(`CA certs: Loaded ${$.length} system CA certificates (--use-system-ca)`);
        else if (!K && !_) {
          N("CA certs: --use-system-ca set but system CA API unavailable, deferring to runtime");
          return;
        } else
          $.push(...q.rootCertificates),
            N(`CA certs: Loaded ${$.length} bundled root certificates as base (--use-system-ca fallback)`);
      } else $.push(...q.rootCertificates), N(`CA certs: Loaded ${$.length} bundled root certificates as base`);
      if (_)
        try {
          let K = f_().readFileSync(_, { encoding: "utf8" });
          $.push(K), N(`CA certs: Appended extra certificates from NODE_EXTRA_CA_CERTS (${_})`);
        } catch (K) {
          N(`CA certs: Failed to read NODE_EXTRA_CA_CERTS file (${_}): ${K}`, { level: "error" });
        }
      return $.length > 0 ? $ : void 0;
    });

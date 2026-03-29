    uA();
    WI();
    fZ8 = wO.hasStandardBrowserEnv
      ? {
          write(H, _, q, $, K, O, T) {
            if (typeof document > "u") return;
            let z = [`${H}=${encodeURIComponent(_)}`];
            if (Q_.isNumber(q)) z.push(`expires=${new Date(q).toUTCString()}`);
            if (Q_.isString($)) z.push(`path=${$}`);
            if (Q_.isString(K)) z.push(`domain=${K}`);
            if (O === !0) z.push("secure");
            if (Q_.isString(T)) z.push(`SameSite=${T}`);
            document.cookie = z.join("; ");
          },
          read(H) {
            if (typeof document > "u") return null;
            let _ = document.cookie.match(new RegExp("(?:^|; )" + H + "=([^;]*)"));
            return _ ? decodeURIComponent(_[1]) : null;
          },
          remove(H) {
            this.write(H, "", Date.now() - 86400000, "/");
          },
        }
      : {
          write() {},
          read() {
            return null;
          },
          remove() {},
        };

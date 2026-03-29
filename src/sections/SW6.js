    NJ();
    H_();
    j9();
    q_6();
    F_();
    wKH();
    UZq = {
      name: "keychain",
      read() {
        let H = hM.cache;
        if (Date.now() - H.cachedAt < Rf6) return H.data;
        try {
          let _ = yh(fKH),
            q = Kl(),
            $ = aV(`security find-generic-password -a "${q}" -w -s "${_}"`);
          if ($) {
            let K = i_($);
            return (hM.cache = { data: K, cachedAt: Date.now() }), K;
          }
        } catch (_) {}
        if (H.data !== null)
          return (
            N("[keychain] read failed; serving stale cache", { level: "warn" }),
            (hM.cache = { data: H.data, cachedAt: Date.now() }),
            H.data
          );
        return (hM.cache = { data: null, cachedAt: Date.now() }), null;
      },
      async readAsync() {
        let H = hM.cache;
        if (Date.now() - H.cachedAt < Rf6) return H.data;
        if (hM.readInFlight) return hM.readInFlight;
        let _ = hM.generation,
          q = uT4().then(($) => {
            if (_ === hM.generation) {
              if ($ === null && H.data !== null)
                N("[keychain] readAsync failed; serving stale cache", { level: "warn" });
              let K = $ ?? H.data;
              return (hM.cache = { data: K, cachedAt: Date.now() }), (hM.readInFlight = null), K;
            }
            return $;
          });
        return (hM.readInFlight = q), q;
      },
      update(H) {
        Kk();
        try {
          let _ = yh(fKH),
            q = Kl(),
            $ = gH(H),
            K = Buffer.from($, "utf-8").toString("hex"),
            O = `add-generic-password -U -a "${q}" -s "${_}" -X "${K}"
`,
            T;
          if (O.length <= IT4) T = E4H("security", ["-i"], { input: O, stdio: ["pipe", "pipe", "pipe"], reject: !1 });
          else
            N(`Keychain payload (${$.length}B JSON) exceeds security -i stdin limit; using argv`, { level: "warn" }),
              (T = E4H("security", ["add-generic-password", "-U", "-a", q, "-s", _, "-X", K], {
                stdio: ["ignore", "pipe", "pipe"],
                reject: !1,
              }));
          if (T.exitCode !== 0) return { success: !1 };
          return (hM.cache = { data: H, cachedAt: Date.now() }), { success: !0 };
        } catch (_) {
          return { success: !1 };
        }
      },
      delete() {
        Kk();
        try {
          let H = yh(fKH),
            _ = Kl();
          return aV(`security delete-generic-password -a "${_}" -s "${H}"`), !0;
        } catch (H) {
          return !1;
        }
      },
    };

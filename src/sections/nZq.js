    g_();
    h_();
    n8();
    F_();
    (lZq = require("fs")), (iZq = require("path"));
    EW6 = {
      name: "plaintext",
      read() {
        let { storagePath: H } = dJ_();
        try {
          let _ = f_().readFileSync(H, { encoding: "utf8" });
          return i_(_);
        } catch {
          return null;
        }
      },
      async readAsync() {
        let { storagePath: H } = dJ_();
        try {
          let _ = await f_().readFile(H, { encoding: "utf8" });
          return i_(_);
        } catch {
          return null;
        }
      },
      update(H) {
        try {
          let { storageDir: _, storagePath: q } = dJ_();
          try {
            f_().mkdirSync(_);
          } catch ($) {
            if (e6($) !== "EEXIST") throw $;
          }
          return (
            Ow(q, gH(H), { encoding: "utf8", flush: !1 }),
            lZq.chmodSync(q, 384),
            { success: !0, warning: "Warning: Storing credentials in plaintext." }
          );
        } catch {
          return { success: !1 };
        }
      },
      delete() {
        let { storagePath: H } = dJ_();
        try {
          return f_().unlinkSync(H), !0;
        } catch (_) {
          if (e6(_) === "ENOENT") return !0;
          return !1;
        }
      },
    };

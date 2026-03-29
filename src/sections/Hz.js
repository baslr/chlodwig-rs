    _X8();
    N_();
    dp();
    F_();
    (cjH = require("fs/promises")),
      (qX8 = XM(
        (H, _) => {
          try {
            return { ok: !0, value: JSON.parse(rp(H)) };
          } catch (q) {
            if (_) AH(q);
            return { ok: !1 };
          }
        },
        (H) => H,
        50,
      )),
      (y$ = Object.assign(
        function (_, q = !0) {
          if (!_) return null;
          let $ = qX8(_, q);
          return $.ok ? $.value : null;
        },
        { cache: qX8.cache },
      ));
    KX8 = (() => {
      if (typeof Bun > "u") return !1;
      let _ = Bun.JSONL;
      if (!_?.parseChunk) return !1;
      return _.parseChunk;
    })();

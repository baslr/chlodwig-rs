    RL_();
    (ZL_ = require("async_hooks")), (ttq = new ZL_.AsyncLocalStorage());
    xOH = {
      queue(H) {
        let _ = uOH(),
          { index: q } = _;
        _.hooksEffect.push(() => {
          _.hooksCleanup[q]?.();
          let $ = H(zS6());
          if ($ != null && typeof $ !== "function")
            throw new nQH("useEffect return value must be a cleanup function or nothing.");
          _.hooksCleanup[q] = $;
        });
      },
      run() {
        let H = uOH();
        AS6(() => {
          H.hooksEffect.forEach((_) => {
            _();
          }),
            (H.hooksEffect.length = 0);
        })();
      },
      clearAll() {
        let H = uOH();
        H.hooksCleanup.forEach((_) => {
          _?.();
        }),
          (H.hooksEffect.length = 0),
          (H.hooksCleanup.length = 0);
      },
    };

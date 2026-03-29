    TP6();
    TP6();
    (zP6 = u(require("process"))),
      (lgH = u(require("fs/promises"))),
      (O14 = (() => {
        let _;
        return async function () {
          if (_) return _;
          let q = "/etc/wsl.conf",
            $ = !1;
          try {
            await lgH.default.access(q, lgH.constants.F_OK), ($ = !0);
          } catch {}
          if (!$) return "/mnt/";
          let K = await lgH.default.readFile(q, { encoding: "utf8" }),
            O = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(K);
          if (!O) return "/mnt/";
          return (_ = O.groups.mountPoint.trim()), (_ = _.endsWith("/") ? _ : `${_}/`), _;
        };
      })());

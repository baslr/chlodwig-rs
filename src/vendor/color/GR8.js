  var GR8 = d((CJ, N5_) => {
    var FY$ = require("tty"),
      v5_ = require("util");
    CJ.init = oY$;
    CJ.log = iY$;
    CJ.formatArgs = QY$;
    CJ.save = nY$;
    CJ.load = rY$;
    CJ.useColors = UY$;
    CJ.destroy = v5_.deprecate(
      () => {},
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
    );
    CJ.colors = [6, 2, 3, 4, 5, 1];
    try {
      let H = XR8();
      if (H && (H.stderr || H).level >= 2)
        CJ.colors = [
          20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80,
          81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169,
          170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
          214, 215, 220, 221,
        ];
    } catch (H) {}
    CJ.inspectOpts = Object.keys(process.env)
      .filter((H) => {
        return /^debug_/i.test(H);
      })
      .reduce((H, _) => {
        let q = _.substring(6)
            .toLowerCase()
            .replace(/_([a-z])/g, (K, O) => {
              return O.toUpperCase();
            }),
          $ = process.env[_];
        if (/^(yes|on|true|enabled)$/i.test($)) $ = !0;
        else if (/^(no|off|false|disabled)$/i.test($)) $ = !1;
        else if ($ === "null") $ = null;
        else $ = Number($);
        return (H[q] = $), H;
      }, {});
    function UY$() {
      return "colors" in CJ.inspectOpts ? Boolean(CJ.inspectOpts.colors) : FY$.isatty(process.stderr.fd);
    }
    function QY$(H) {
      let { namespace: _, useColors: q } = this;
      if (q) {
        let $ = this.color,
          K = "\x1B[3" + ($ < 8 ? $ : "8;5;" + $),
          O = `  ${K};1m${_} \x1B[0m`;
        (H[0] =
          O +
          H[0]
            .split(`
`)
            .join(
              `
` + O,
            )),
          H.push(K + "m+" + N5_.exports.humanize(this.diff) + "\x1B[0m");
      } else H[0] = lY$() + _ + " " + H[0];
    }
    function lY$() {
      if (CJ.inspectOpts.hideDate) return "";
      return new Date().toISOString() + " ";
    }
    function iY$(...H) {
      return process.stderr.write(
        v5_.formatWithOptions(CJ.inspectOpts, ...H) +
          `
`,
      );
    }
    function nY$(H) {
      if (H) process.env.DEBUG = H;
      else delete process.env.DEBUG;
    }
    function rY$() {
      return process.env.DEBUG;
    }
    function oY$(H) {
      H.inspectOpts = {};
      let _ = Object.keys(CJ.inspectOpts);
      for (let q = 0; q < _.length; q++) H.inspectOpts[_[q]] = CJ.inspectOpts[_[q]];
    }
    N5_.exports = m$6()(CJ);
    var { formatters: WR8 } = N5_.exports;
    WR8.o = function (H) {
      return (
        (this.inspectOpts.colors = this.useColors),
        v5_
          .inspect(H, this.inspectOpts)
          .split(`
`)
          .map((_) => _.trim())
          .join(" ")
      );
    };
    WR8.O = function (H) {
      return (this.inspectOpts.colors = this.useColors), v5_.inspect(H, this.inspectOpts);
    };
  });

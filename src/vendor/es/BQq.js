  var BQq = d((Sb3, pQq) => {
    var lN4 = uQq(),
      iN4 = typeof process === "object" && process && typeof process.cwd === "function" ? process.cwd() : ".",
      mQq = []
        .concat(require("module").builtinModules, "bootstrap_node", "node")
        .map(
          (H) =>
            new RegExp(`(?:\\((?:node:)?${H}(?:\\.js)?:\\d+:\\d+\\)$|^\\s*at (?:node:)?${H}(?:\\.js)?:\\d+:\\d+$)`),
        );
    mQq.push(
      /\((?:node:)?internal\/[^:]+:\d+:\d+\)$/,
      /\s*at (?:node:)?internal\/[^:]+:\d+:\d+$/,
      /\/\.node-spawn-wrap-\w+-\w+\/node:\d+:\d+\)?$/,
    );
    class MN6 {
      constructor(H) {
        if (((H = { ignoredPackages: [], ...H }), "internals" in H === !1)) H.internals = MN6.nodeInternals();
        if ("cwd" in H === !1) H.cwd = iN4;
        (this._cwd = H.cwd.replace(/\\/g, "/")),
          (this._internals = [].concat(H.internals, nN4(H.ignoredPackages))),
          (this._wrapCallSite = H.wrapCallSite || !1);
      }
      static nodeInternals() {
        return [...mQq];
      }
      clean(H, _ = 0) {
        if (((_ = " ".repeat(_)), !Array.isArray(H)))
          H = H.split(`
`);
        if (!/^\s*at /.test(H[0]) && /^\s*at /.test(H[1])) H = H.slice(1);
        let q = !1,
          $ = null,
          K = [];
        return (
          H.forEach((O) => {
            if (((O = O.replace(/\\/g, "/")), this._internals.some((z) => z.test(O)))) return;
            let T = /^\s*at /.test(O);
            if (q) O = O.trimEnd().replace(/^(\s+)at /, "$1");
            else if (((O = O.trim()), T)) O = O.slice(3);
            if (((O = O.replace(`${this._cwd}/`, "")), O))
              if (T) {
                if ($) K.push($), ($ = null);
                K.push(O);
              } else (q = !0), ($ = O);
          }),
          K.map(
            (O) => `${_}${O}
`,
          ).join("")
        );
      }
      captureString(H, _ = this.captureString) {
        if (typeof H === "function") (_ = H), (H = 1 / 0);
        let { stackTraceLimit: q } = Error;
        if (H) Error.stackTraceLimit = H;
        let $ = {};
        Error.captureStackTrace($, _);
        let { stack: K } = $;
        return (Error.stackTraceLimit = q), this.clean(K);
      }
      capture(H, _ = this.capture) {
        if (typeof H === "function") (_ = H), (H = 1 / 0);
        let { prepareStackTrace: q, stackTraceLimit: $ } = Error;
        if (
          ((Error.prepareStackTrace = (T, z) => {
            if (this._wrapCallSite) return z.map(this._wrapCallSite);
            return z;
          }),
          H)
        )
          Error.stackTraceLimit = H;
        let K = {};
        Error.captureStackTrace(K, _);
        let { stack: O } = K;
        return Object.assign(Error, { prepareStackTrace: q, stackTraceLimit: $ }), O;
      }
      at(H = this.at) {
        let [_] = this.capture(1, H);
        if (!_) return {};
        let q = { line: _.getLineNumber(), column: _.getColumnNumber() };
        if ((xQq(q, _.getFileName(), this._cwd), _.isConstructor()))
          Object.defineProperty(q, "constructor", { value: !0, configurable: !0 });
        if (_.isEval()) q.evalOrigin = _.getEvalOrigin();
        if (_.isNative()) q.native = !0;
        let $;
        try {
          $ = _.getTypeName();
        } catch (T) {}
        if ($ && $ !== "Object" && $ !== "[object Object]") q.type = $;
        let K = _.getFunctionName();
        if (K) q.function = K;
        let O = _.getMethodName();
        if (O && K !== O) q.method = O;
        return q;
      }
      parseLine(H) {
        let _ = H && H.match(rN4);
        if (!_) return null;
        let q = _[1] === "new",
          $ = _[2],
          K = _[3],
          O = _[4],
          T = Number(_[5]),
          z = Number(_[6]),
          A = _[7],
          f = _[8],
          w = _[9],
          Y = _[10] === "native",
          D = _[11] === ")",
          j,
          M = {};
        if (f) M.line = Number(f);
        if (w) M.column = Number(w);
        if (D && A) {
          let J = 0;
          for (let P = A.length - 1; P > 0; P--)
            if (A.charAt(P) === ")") J++;
            else if (A.charAt(P) === "(" && A.charAt(P - 1) === " ") {
              if ((J--, J === -1 && A.charAt(P - 1) === " ")) {
                let X = A.slice(0, P - 1);
                (A = A.slice(P + 1)), ($ += ` (${X}`);
                break;
              }
            }
        }
        if ($) {
          let J = $.match(oN4);
          if (J) ($ = J[1]), (j = J[2]);
        }
        if ((xQq(M, A, this._cwd), q)) Object.defineProperty(M, "constructor", { value: !0, configurable: !0 });
        if (K) (M.evalOrigin = K), (M.evalLine = T), (M.evalColumn = z), (M.evalFile = O && O.replace(/\\/g, "/"));
        if (Y) M.native = !0;
        if ($) M.function = $;
        if (j && $ !== j) M.method = j;
        return M;
      }
    }
    function xQq(H, _, q) {
      if (_) {
        if (((_ = _.replace(/\\/g, "/")), _.startsWith(`${q}/`))) _ = _.slice(q.length + 1);
        H.file = _;
      }
    }
    function nN4(H) {
      if (H.length === 0) return [];
      let _ = H.map((q) => lN4(q));
      return new RegExp(`[/\\\\]node_modules[/\\\\](?:${_.join("|")})[/\\\\][^:]+:\\d+:\\d+`);
    }
    var rN4 = new RegExp(
        "^(?:\\s*at )?(?:(new) )?(?:(.*?) \\()?(?:eval at ([^ ]+) \\((.+?):(\\d+):(\\d+)\\), )?(?:(.+?):(\\d+):(\\d+)|(native))(\\)?)$",
      ),
      oN4 = /^(.*?) \[as (.*?)\]$/;
    pQq.exports = MN6;
  });

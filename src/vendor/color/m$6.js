  var m$6 = d((ztK, DR8) => {
    function bY$(H) {
      (q.debug = q),
        (q.default = q),
        (q.coerce = A),
        (q.disable = T),
        (q.enable = K),
        (q.enabled = z),
        (q.humanize = x$6()),
        (q.destroy = f),
        Object.keys(H).forEach((w) => {
          q[w] = H[w];
        }),
        (q.names = []),
        (q.skips = []),
        (q.formatters = {});
      function _(w) {
        let Y = 0;
        for (let D = 0; D < w.length; D++) (Y = (Y << 5) - Y + w.charCodeAt(D)), (Y |= 0);
        return q.colors[Math.abs(Y) % q.colors.length];
      }
      q.selectColor = _;
      function q(w) {
        let Y,
          D = null,
          j,
          M;
        function J(...P) {
          if (!J.enabled) return;
          let X = J,
            R = Number(new Date()),
            W = R - (Y || R);
          if (((X.diff = W), (X.prev = Y), (X.curr = R), (Y = R), (P[0] = q.coerce(P[0])), typeof P[0] !== "string"))
            P.unshift("%O");
          let Z = 0;
          (P[0] = P[0].replace(/%([a-zA-Z%])/g, (v, y) => {
            if (v === "%%") return "%";
            Z++;
            let E = q.formatters[y];
            if (typeof E === "function") {
              let S = P[Z];
              (v = E.call(X, S)), P.splice(Z, 1), Z--;
            }
            return v;
          })),
            q.formatArgs.call(X, P),
            (X.log || q.log).apply(X, P);
        }
        if (
          ((J.namespace = w),
          (J.useColors = q.useColors()),
          (J.color = q.selectColor(w)),
          (J.extend = $),
          (J.destroy = q.destroy),
          Object.defineProperty(J, "enabled", {
            enumerable: !0,
            configurable: !1,
            get: () => {
              if (D !== null) return D;
              if (j !== q.namespaces) (j = q.namespaces), (M = q.enabled(w));
              return M;
            },
            set: (P) => {
              D = P;
            },
          }),
          typeof q.init === "function")
        )
          q.init(J);
        return J;
      }
      function $(w, Y) {
        let D = q(this.namespace + (typeof Y > "u" ? ":" : Y) + w);
        return (D.log = this.log), D;
      }
      function K(w) {
        q.save(w), (q.namespaces = w), (q.names = []), (q.skips = []);
        let Y = (typeof w === "string" ? w : "").trim().replace(" ", ",").split(",").filter(Boolean);
        for (let D of Y)
          if (D[0] === "-") q.skips.push(D.slice(1));
          else q.names.push(D);
      }
      function O(w, Y) {
        let D = 0,
          j = 0,
          M = -1,
          J = 0;
        while (D < w.length)
          if (j < Y.length && (Y[j] === w[D] || Y[j] === "*"))
            if (Y[j] === "*") (M = j), (J = D), j++;
            else D++, j++;
          else if (M !== -1) (j = M + 1), J++, (D = J);
          else return !1;
        while (j < Y.length && Y[j] === "*") j++;
        return j === Y.length;
      }
      function T() {
        let w = [...q.names, ...q.skips.map((Y) => "-" + Y)].join(",");
        return q.enable(""), w;
      }
      function z(w) {
        for (let Y of q.skips) if (O(w, Y)) return !1;
        for (let Y of q.names) if (O(w, Y)) return !0;
        return !1;
      }
      function A(w) {
        if (w instanceof Error) return w.stack || w.message;
        return w;
      }
      function f() {
        console.warn(
          "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
        );
      }
      return q.enable(q.load()), q;
    }
    DR8.exports = bY$;
  });

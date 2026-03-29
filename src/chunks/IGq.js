  var IGq = d((c23, bGq) => {
    var EGq = KX6(),
      CGq = bGq.exports;
    (function () {
      function H(f) {
        return f < 10 ? "0" + f : f;
      }
      var _ =
          /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        q =
          /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        $,
        K,
        O = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" },
        T;
      function z(f) {
        return (
          (q.lastIndex = 0),
          q.test(f)
            ? '"' +
              f.replace(q, function (w) {
                var Y = O[w];
                return typeof Y === "string" ? Y : "\\u" + ("0000" + w.charCodeAt(0).toString(16)).slice(-4);
              }) +
              '"'
            : '"' + f + '"'
        );
      }
      function A(f, w) {
        var Y,
          D,
          j,
          M,
          J = $,
          P,
          X = w[f],
          R = X != null && (X instanceof EGq || EGq.isBigNumber(X));
        if (X && typeof X === "object" && typeof X.toJSON === "function") X = X.toJSON(f);
        if (typeof T === "function") X = T.call(w, f, X);
        switch (typeof X) {
          case "string":
            if (R) return X;
            else return z(X);
          case "number":
            return isFinite(X) ? String(X) : "null";
          case "boolean":
          case "null":
          case "bigint":
            return String(X);
          case "object":
            if (!X) return "null";
            if ((($ += K), (P = []), Object.prototype.toString.apply(X) === "[object Array]")) {
              M = X.length;
              for (Y = 0; Y < M; Y += 1) P[Y] = A(Y, X) || "null";
              return (
                (j =
                  P.length === 0
                    ? "[]"
                    : $
                      ? `[
` +
                        $ +
                        P.join(
                          `,
` + $,
                        ) +
                        `
` +
                        J +
                        "]"
                      : "[" + P.join(",") + "]"),
                ($ = J),
                j
              );
            }
            if (T && typeof T === "object") {
              M = T.length;
              for (Y = 0; Y < M; Y += 1)
                if (typeof T[Y] === "string") {
                  if (((D = T[Y]), (j = A(D, X)), j)) P.push(z(D) + ($ ? ": " : ":") + j);
                }
            } else
              Object.keys(X).forEach(function (W) {
                var Z = A(W, X);
                if (Z) P.push(z(W) + ($ ? ": " : ":") + Z);
              });
            return (
              (j =
                P.length === 0
                  ? "{}"
                  : $
                    ? `{
` +
                      $ +
                      P.join(
                        `,
` + $,
                      ) +
                      `
` +
                      J +
                      "}"
                    : "{" + P.join(",") + "}"),
              ($ = J),
              j
            );
        }
      }
      if (typeof CGq.stringify !== "function")
        CGq.stringify = function (f, w, Y) {
          var D;
          if ((($ = ""), (K = ""), typeof Y === "number")) for (D = 0; D < Y; D += 1) K += " ";
          else if (typeof Y === "string") K = Y;
          if (((T = w), w && typeof w !== "function" && (typeof w !== "object" || typeof w.length !== "number")))
            throw Error("JSON.stringify");
          return A("", { "": f });
        };
    })();
  });

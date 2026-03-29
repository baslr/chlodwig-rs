  var xGq = d((F23, uGq) => {
    var eM_ = null,
      Z54 =
        /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/,
      L54 =
        /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/,
      k54 = function (H) {
        var _ = {
          strict: !1,
          storeAsString: !1,
          alwaysParseAsBig: !1,
          useNativeBigInt: !1,
          protoAction: "error",
          constructorAction: "error",
        };
        if (H !== void 0 && H !== null) {
          if (H.strict === !0) _.strict = !0;
          if (H.storeAsString === !0) _.storeAsString = !0;
          if (
            ((_.alwaysParseAsBig = H.alwaysParseAsBig === !0 ? H.alwaysParseAsBig : !1),
            (_.useNativeBigInt = H.useNativeBigInt === !0 ? H.useNativeBigInt : !1),
            typeof H.constructorAction < "u")
          )
            if (
              H.constructorAction === "error" ||
              H.constructorAction === "ignore" ||
              H.constructorAction === "preserve"
            )
              _.constructorAction = H.constructorAction;
            else
              throw Error(
                `Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${H.constructorAction}`,
              );
          if (typeof H.protoAction < "u")
            if (H.protoAction === "error" || H.protoAction === "ignore" || H.protoAction === "preserve")
              _.protoAction = H.protoAction;
            else
              throw Error(
                `Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${H.protoAction}`,
              );
        }
        var q,
          $,
          K = {
            '"': '"',
            "\\": "\\",
            "/": "/",
            b: "\b",
            f: "\f",
            n: `
`,
            r: "\r",
            t: "\t",
          },
          O,
          T = function (J) {
            throw { name: "SyntaxError", message: J, at: q, text: O };
          },
          z = function (J) {
            if (J && J !== $) T("Expected '" + J + "' instead of '" + $ + "'");
            return ($ = O.charAt(q)), (q += 1), $;
          },
          A = function () {
            var J,
              P = "";
            if ($ === "-") (P = "-"), z("-");
            while ($ >= "0" && $ <= "9") (P += $), z();
            if ($ === ".") {
              P += ".";
              while (z() && $ >= "0" && $ <= "9") P += $;
            }
            if ($ === "e" || $ === "E") {
              if (((P += $), z(), $ === "-" || $ === "+")) (P += $), z();
              while ($ >= "0" && $ <= "9") (P += $), z();
            }
            if (((J = +P), !isFinite(J))) T("Bad number");
            else {
              if (eM_ == null) eM_ = KX6();
              if (P.length > 15) return _.storeAsString ? P : _.useNativeBigInt ? BigInt(P) : new eM_(P);
              else return !_.alwaysParseAsBig ? J : _.useNativeBigInt ? BigInt(J) : new eM_(J);
            }
          },
          f = function () {
            var J,
              P,
              X = "",
              R;
            if ($ === '"') {
              var W = q;
              while (z()) {
                if ($ === '"') {
                  if (q - 1 > W) X += O.substring(W, q - 1);
                  return z(), X;
                }
                if ($ === "\\") {
                  if (q - 1 > W) X += O.substring(W, q - 1);
                  if ((z(), $ === "u")) {
                    R = 0;
                    for (P = 0; P < 4; P += 1) {
                      if (((J = parseInt(z(), 16)), !isFinite(J))) break;
                      R = R * 16 + J;
                    }
                    X += String.fromCharCode(R);
                  } else if (typeof K[$] === "string") X += K[$];
                  else break;
                  W = q;
                }
              }
            }
            T("Bad string");
          },
          w = function () {
            while ($ && $ <= " ") z();
          },
          Y = function () {
            switch ($) {
              case "t":
                return z("t"), z("r"), z("u"), z("e"), !0;
              case "f":
                return z("f"), z("a"), z("l"), z("s"), z("e"), !1;
              case "n":
                return z("n"), z("u"), z("l"), z("l"), null;
            }
            T("Unexpected '" + $ + "'");
          },
          D,
          j = function () {
            var J = [];
            if ($ === "[") {
              if ((z("["), w(), $ === "]")) return z("]"), J;
              while ($) {
                if ((J.push(D()), w(), $ === "]")) return z("]"), J;
                z(","), w();
              }
            }
            T("Bad array");
          },
          M = function () {
            var J,
              P = Object.create(null);
            if ($ === "{") {
              if ((z("{"), w(), $ === "}")) return z("}"), P;
              while ($) {
                if (((J = f()), w(), z(":"), _.strict === !0 && Object.hasOwnProperty.call(P, J)))
                  T('Duplicate key "' + J + '"');
                if (Z54.test(J) === !0)
                  if (_.protoAction === "error") T("Object contains forbidden prototype property");
                  else if (_.protoAction === "ignore") D();
                  else P[J] = D();
                else if (L54.test(J) === !0)
                  if (_.constructorAction === "error") T("Object contains forbidden constructor property");
                  else if (_.constructorAction === "ignore") D();
                  else P[J] = D();
                else P[J] = D();
                if ((w(), $ === "}")) return z("}"), P;
                z(","), w();
              }
            }
            T("Bad object");
          };
        return (
          (D = function () {
            switch ((w(), $)) {
              case "{":
                return M();
              case "[":
                return j();
              case '"':
                return f();
              case "-":
                return A();
              default:
                return $ >= "0" && $ <= "9" ? A() : Y();
            }
          }),
          function (J, P) {
            var X;
            if (((O = J + ""), (q = 0), ($ = " "), (X = D()), w(), $)) T("Syntax error");
            return typeof P === "function"
              ? (function R(W, Z) {
                  var k,
                    v,
                    y = W[Z];
                  if (y && typeof y === "object")
                    Object.keys(y).forEach(function (E) {
                      if (((v = R(y, E)), v !== void 0)) y[E] = v;
                      else delete y[E];
                    });
                  return P.call(W, Z, y);
                })({ "": X }, "")
              : X;
          }
        );
      };
    uGq.exports = k54;
  });

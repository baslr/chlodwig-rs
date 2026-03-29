  var $c7 = d((tgO, qc7) => {
    qc7.exports = ir;
    ir.filename = null;
    ir.defaults = { keepCase: !1 };
    var UN1 = Xl6(),
      td7 = Tx_(),
      ed7 = qx_(),
      Hc7 = K7H(),
      QN1 = au_(),
      _c7 = pAH(),
      lN1 = Am(),
      iN1 = tu_(),
      nN1 = su_(),
      rN1 = O7H(),
      oN1 = BAH(),
      Wl6 = RP(),
      aN1 = /^[1-9][0-9]*$/,
      sN1 = /^-?[1-9][0-9]*$/,
      tN1 = /^0[x][0-9a-fA-F]+$/,
      eN1 = /^-?0[x][0-9a-fA-F]+$/,
      Hh1 = /^0[0-7]+$/,
      _h1 = /^-?0[0-7]+$/,
      qh1 = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,
      gc = /^[a-zA-Z_][a-zA-Z_0-9]*$/,
      dc = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/;
    function ir(H, _, q) {
      if (!(_ instanceof td7)) (q = _), (_ = new td7());
      if (!q) q = ir.defaults;
      var $ = q.preferTrailingComment || !1,
        K = UN1(H, q.alternateCommentMode || !1),
        O = K.next,
        T = K.push,
        z = K.peek,
        A = K.skip,
        f = K.cmnt,
        w = !0,
        Y,
        D,
        j,
        M = "proto2",
        J = _,
        P = [],
        X = {},
        R = q.keepCase
          ? function (t) {
              return t;
            }
          : Wl6.camelCase;
      function W() {
        P.forEach((t) => {
          (t._edition = M),
            Object.keys(X).forEach((s) => {
              if (t.getOption(s) !== void 0) return;
              t.setOption(s, X[s], !0);
            });
        });
      }
      function Z(t, s, OH) {
        var XH = ir.filename;
        if (!OH) ir.filename = null;
        return Error("illegal " + (s || "token") + " '" + t + "' (" + (XH ? XH + ", " : "") + "line " + K.line + ")");
      }
      function k() {
        var t = [],
          s;
        do {
          if ((s = O()) !== '"' && s !== "'") throw Z(s);
          t.push(O()), A(s), (s = z());
        } while (s === '"' || s === "'");
        return t.join("");
      }
      function v(t) {
        var s = O();
        switch (s) {
          case "'":
          case '"':
            return T(s), k();
          case "true":
          case "TRUE":
            return !0;
          case "false":
          case "FALSE":
            return !1;
        }
        try {
          return E(s, !0);
        } catch (OH) {
          if (t && dc.test(s)) return s;
          throw Z(s, "value");
        }
      }
      function y(t, s) {
        var OH, XH;
        do
          if (s && ((OH = z()) === '"' || OH === "'")) {
            var jH = k();
            if ((t.push(jH), M >= 2023)) throw Z(jH, "id");
          } else
            try {
              t.push([(XH = S(O())), A("to", !0) ? S(O()) : XH]);
            } catch (RH) {
              if (s && dc.test(OH) && M >= 2023) t.push(OH);
              else throw RH;
            }
        while (A(",", !0));
        var GH = { options: void 0 };
        (GH.setOption = function (RH, NH) {
          if (this.options === void 0) this.options = {};
          this.options[RH] = NH;
        }),
          g(
            GH,
            function (NH) {
              if (NH === "option") r(GH, NH), A(";");
              else throw Z(NH);
            },
            function () {
              vH(GH);
            },
          );
      }
      function E(t, s) {
        var OH = 1;
        if (t.charAt(0) === "-") (OH = -1), (t = t.substring(1));
        switch (t) {
          case "inf":
          case "INF":
          case "Inf":
            return OH * (1 / 0);
          case "nan":
          case "NAN":
          case "Nan":
          case "NaN":
            return NaN;
          case "0":
            return 0;
        }
        if (aN1.test(t)) return OH * parseInt(t, 10);
        if (tN1.test(t)) return OH * parseInt(t, 16);
        if (Hh1.test(t)) return OH * parseInt(t, 8);
        if (qh1.test(t)) return OH * parseFloat(t);
        throw Z(t, "number", s);
      }
      function S(t, s) {
        switch (t) {
          case "max":
          case "MAX":
          case "Max":
            return 536870911;
          case "0":
            return 0;
        }
        if (!s && t.charAt(0) === "-") throw Z(t, "id");
        if (sN1.test(t)) return parseInt(t, 10);
        if (eN1.test(t)) return parseInt(t, 16);
        if (_h1.test(t)) return parseInt(t, 8);
        throw Z(t, "id");
      }
      function x() {
        if (Y !== void 0) throw Z("package");
        if (((Y = O()), !dc.test(Y))) throw Z(Y, "name");
        (J = J.define(Y)), A(";");
      }
      function I() {
        var t = z(),
          s;
        switch (t) {
          case "weak":
            (s = j || (j = [])), O();
            break;
          case "public":
            O();
          default:
            s = D || (D = []);
            break;
        }
        (t = k()), A(";"), s.push(t);
      }
      function B() {
        if ((A("="), (M = k()), M < 2023)) throw Z(M, "syntax");
        A(";");
      }
      function p() {
        if ((A("="), (M = k()), !["2023"].includes(M))) throw Z(M, "edition");
        A(";");
      }
      function C(t, s) {
        switch (s) {
          case "option":
            return r(t, s), A(";"), !0;
          case "message":
            return c(t, s), !0;
          case "enum":
            return e(t, s), !0;
          case "service":
            return KH(t, s), !0;
          case "extend":
            return l(t, s), !0;
        }
        return !1;
      }
      function g(t, s, OH) {
        var XH = K.line;
        if (t) {
          if (typeof t.comment !== "string") t.comment = f();
          t.filename = ir.filename;
        }
        if (A("{", !0)) {
          var jH;
          while ((jH = O()) !== "}") s(jH);
          A(";", !0);
        } else {
          if (OH) OH();
          if ((A(";"), t && (typeof t.comment !== "string" || $))) t.comment = f(XH) || t.comment;
        }
      }
      function c(t, s) {
        if (!gc.test((s = O()))) throw Z(s, "type name");
        var OH = new ed7(s);
        if (
          (g(OH, function (jH) {
            if (C(OH, jH)) return;
            switch (jH) {
              case "map":
                _H(OH, jH);
                break;
              case "required":
                if (M !== "proto2") throw Z(jH);
              case "repeated":
                U(OH, jH);
                break;
              case "optional":
                if (M === "proto3") U(OH, "proto3_optional");
                else if (M !== "proto2") throw Z(jH);
                else U(OH, "optional");
                break;
              case "oneof":
                HH(OH, jH);
                break;
              case "extensions":
                y(OH.extensions || (OH.extensions = []));
                break;
              case "reserved":
                y(OH.reserved || (OH.reserved = []), !0);
                break;
              default:
                if (M === "proto2" || !dc.test(jH)) throw Z(jH);
                T(jH), U(OH, "optional");
                break;
            }
          }),
          t.add(OH),
          t === J)
        )
          P.push(OH);
      }
      function U(t, s, OH) {
        var XH = O();
        if (XH === "group") {
          i(t, s);
          return;
        }
        while (XH.endsWith(".") || z().startsWith(".")) XH += O();
        if (!dc.test(XH)) throw Z(XH, "type");
        var jH = O();
        if (!gc.test(jH)) throw Z(jH, "name");
        (jH = R(jH)), A("=");
        var GH = new Hc7(jH, S(O()), XH, s, OH);
        if (
          (g(
            GH,
            function (hH) {
              if (hH === "option") r(GH, hH), A(";");
              else throw Z(hH);
            },
            function () {
              vH(GH);
            },
          ),
          s === "proto3_optional")
        ) {
          var RH = new _c7("_" + jH);
          GH.setOption("proto3_optional", !0), RH.add(GH), t.add(RH);
        } else t.add(GH);
        if (t === J) P.push(GH);
      }
      function i(t, s) {
        if (M >= 2023) throw Z("group");
        var OH = O();
        if (!gc.test(OH)) throw Z(OH, "name");
        var XH = Wl6.lcFirst(OH);
        if (OH === XH) OH = Wl6.ucFirst(OH);
        A("=");
        var jH = S(O()),
          GH = new ed7(OH);
        GH.group = !0;
        var RH = new Hc7(XH, jH, OH, s);
        (RH.filename = ir.filename),
          g(GH, function (hH) {
            switch (hH) {
              case "option":
                r(GH, hH), A(";");
                break;
              case "required":
              case "repeated":
                U(GH, hH);
                break;
              case "optional":
                if (M === "proto3") U(GH, "proto3_optional");
                else U(GH, "optional");
                break;
              case "message":
                c(GH, hH);
                break;
              case "enum":
                e(GH, hH);
                break;
              case "reserved":
                y(GH.reserved || (GH.reserved = []), !0);
                break;
              default:
                throw Z(hH);
            }
          }),
          t.add(GH).add(RH);
      }
      function _H(t) {
        A("<");
        var s = O();
        if (oN1.mapKey[s] === void 0) throw Z(s, "type");
        A(",");
        var OH = O();
        if (!dc.test(OH)) throw Z(OH, "type");
        A(">");
        var XH = O();
        if (!gc.test(XH)) throw Z(XH, "name");
        A("=");
        var jH = new QN1(R(XH), S(O()), s, OH);
        g(
          jH,
          function (RH) {
            if (RH === "option") r(jH, RH), A(";");
            else throw Z(RH);
          },
          function () {
            vH(jH);
          },
        ),
          t.add(jH);
      }
      function HH(t, s) {
        if (!gc.test((s = O()))) throw Z(s, "name");
        var OH = new _c7(R(s));
        g(OH, function (jH) {
          if (jH === "option") r(OH, jH), A(";");
          else T(jH), U(OH, "optional");
        }),
          t.add(OH);
      }
      function e(t, s) {
        if (!gc.test((s = O()))) throw Z(s, "name");
        var OH = new lN1(s);
        if (
          (g(OH, function (jH) {
            switch (jH) {
              case "option":
                r(OH, jH), A(";");
                break;
              case "reserved":
                if ((y(OH.reserved || (OH.reserved = []), !0), OH.reserved === void 0)) OH.reserved = [];
                break;
              default:
                qH(OH, jH);
            }
          }),
          t.add(OH),
          t === J)
        )
          P.push(OH);
      }
      function qH(t, s) {
        if (!gc.test(s)) throw Z(s, "name");
        A("=");
        var OH = S(O(), !0),
          XH = { options: void 0 };
        (XH.getOption = function (jH) {
          return this.options[jH];
        }),
          (XH.setOption = function (jH, GH) {
            rN1.prototype.setOption.call(XH, jH, GH);
          }),
          (XH.setParsedOption = function () {
            return;
          }),
          g(
            XH,
            function (GH) {
              if (GH === "option") r(XH, GH), A(";");
              else throw Z(GH);
            },
            function () {
              vH(XH);
            },
          ),
          t.add(s, OH, XH.comment, XH.parsedOptions || XH.options);
      }
      function r(t, s) {
        var OH,
          XH,
          jH = !0;
        if (s === "option") s = O();
        while (s !== "=") {
          if (s === "(") {
            var GH = O();
            A(")"), (s = "(" + GH + ")");
          }
          if (jH) {
            if (((jH = !1), s.includes(".") && !s.includes("("))) {
              var RH = s.split(".");
              (OH = RH[0] + "."), (s = RH[1]);
              continue;
            }
            OH = s;
          } else XH = XH ? (XH += s) : s;
          s = O();
        }
        var NH = XH ? OH.concat(XH) : OH,
          hH = $H(t, NH);
        (XH = XH && XH[0] === "." ? XH.slice(1) : XH),
          (OH = OH && OH[OH.length - 1] === "." ? OH.slice(0, -1) : OH),
          fH(t, OH, hH, XH);
      }
      function $H(t, s) {
        if (A("{", !0)) {
          var OH = {};
          while (!A("}", !0)) {
            if (!gc.test((a = O()))) throw Z(a, "name");
            if (a === null) throw Z(a, "end of input");
            var XH,
              jH = a;
            if ((A(":", !0), z() === "{")) XH = $H(t, s + "." + a);
            else if (z() === "[") {
              XH = [];
              var GH;
              if (A("[", !0)) {
                do (GH = v(!0)), XH.push(GH);
                while (A(",", !0));
                if ((A("]"), typeof GH < "u")) DH(t, s + "." + a, GH);
              }
            } else (XH = v(!0)), DH(t, s + "." + a, XH);
            var RH = OH[jH];
            if (RH) XH = [].concat(RH).concat(XH);
            (OH[jH] = XH), A(",", !0), A(";", !0);
          }
          return OH;
        }
        var NH = v(!0);
        return DH(t, s, NH), NH;
      }
      function DH(t, s, OH) {
        if (J === t && /^features\./.test(s)) {
          X[s] = OH;
          return;
        }
        if (t.setOption) t.setOption(s, OH);
      }
      function fH(t, s, OH, XH) {
        if (t.setParsedOption) t.setParsedOption(s, OH, XH);
      }
      function vH(t) {
        if (A("[", !0)) {
          do r(t, "option");
          while (A(",", !0));
          A("]");
        }
        return t;
      }
      function KH(t, s) {
        if (!gc.test((s = O()))) throw Z(s, "service name");
        var OH = new iN1(s);
        if (
          (g(OH, function (jH) {
            if (C(OH, jH)) return;
            if (jH === "rpc") n(OH, jH);
            else throw Z(jH);
          }),
          t.add(OH),
          t === J)
        )
          P.push(OH);
      }
      function n(t, s) {
        var OH = f(),
          XH = s;
        if (!gc.test((s = O()))) throw Z(s, "name");
        var jH = s,
          GH,
          RH,
          NH,
          hH;
        if ((A("("), A("stream", !0))) RH = !0;
        if (!dc.test((s = O()))) throw Z(s);
        if (((GH = s), A(")"), A("returns"), A("("), A("stream", !0))) hH = !0;
        if (!dc.test((s = O()))) throw Z(s);
        (NH = s), A(")");
        var ZH = new nN1(jH, XH, GH, NH, RH, hH);
        (ZH.comment = OH),
          g(ZH, function (nH) {
            if (nH === "option") r(ZH, nH), A(";");
            else throw Z(nH);
          }),
          t.add(ZH);
      }
      function l(t, s) {
        if (!dc.test((s = O()))) throw Z(s, "reference");
        var OH = s;
        g(null, function (jH) {
          switch (jH) {
            case "required":
            case "repeated":
              U(t, jH, OH);
              break;
            case "optional":
              if (M === "proto3") U(t, "proto3_optional", OH);
              else U(t, "optional", OH);
              break;
            default:
              if (M === "proto2" || !dc.test(jH)) throw Z(jH);
              T(jH), U(t, "optional", OH);
              break;
          }
        });
      }
      var a;
      while ((a = O()) !== null)
        switch (a) {
          case "package":
            if (!w) throw Z(a);
            x();
            break;
          case "import":
            if (!w) throw Z(a);
            I();
            break;
          case "syntax":
            if (!w) throw Z(a);
            B();
            break;
          case "edition":
            if (!w) throw Z(a);
            p();
            break;
          case "option":
            r(J, a), A(";", !0);
            break;
          default:
            if (C(J, a)) {
              w = !1;
              continue;
            }
            throw Z(a);
        }
      return W(), (ir.filename = null), { package: Y, imports: D, weakImports: j, root: _ };
    }
  });

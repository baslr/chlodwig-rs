  var KX6 = d((SGq, tM_) => {
    (function (H) {
      var _,
        q = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
        $ = Math.ceil,
        K = Math.floor,
        O = "[BigNumber Error] ",
        T = O + "Number primitive has more than 15 significant digits: ",
        z = 100000000000000,
        A = 14,
        f = 9007199254740991,
        w = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 10000000000, 100000000000, 1000000000000, 10000000000000],
        Y = 1e7,
        D = 1e9;
      function j(k) {
        var v,
          y,
          E,
          S = (r.prototype = { constructor: r, toString: null, valueOf: null }),
          x = new r(1),
          I = 20,
          B = 4,
          p = -7,
          C = 21,
          g = -1e7,
          c = 1e7,
          U = !1,
          i = 1,
          _H = 0,
          HH = {
            prefix: "",
            groupSize: 3,
            secondaryGroupSize: 0,
            groupSeparator: ",",
            decimalSeparator: ".",
            fractionGroupSize: 0,
            fractionGroupSeparator: "\xA0",
            suffix: "",
          },
          e = "0123456789abcdefghijklmnopqrstuvwxyz",
          qH = !0;
        function r(n, l) {
          var a,
            t,
            s,
            OH,
            XH,
            jH,
            GH,
            RH,
            NH = this;
          if (!(NH instanceof r)) return new r(n, l);
          if (l == null) {
            if (n && n._isBigNumber === !0) {
              if (((NH.s = n.s), !n.c || n.e > c)) NH.c = NH.e = null;
              else if (n.e < g) NH.c = [(NH.e = 0)];
              else (NH.e = n.e), (NH.c = n.c.slice());
              return;
            }
            if ((jH = typeof n == "number") && n * 0 == 0) {
              if (((NH.s = 1 / n < 0 ? ((n = -n), -1) : 1), n === ~~n)) {
                for (OH = 0, XH = n; XH >= 10; XH /= 10, OH++);
                if (OH > c) NH.c = NH.e = null;
                else (NH.e = OH), (NH.c = [n]);
                return;
              }
              RH = String(n);
            } else {
              if (!q.test((RH = String(n)))) return E(NH, RH, jH);
              NH.s = RH.charCodeAt(0) == 45 ? ((RH = RH.slice(1)), -1) : 1;
            }
            if ((OH = RH.indexOf(".")) > -1) RH = RH.replace(".", "");
            if ((XH = RH.search(/e/i)) > 0) {
              if (OH < 0) OH = XH;
              (OH += +RH.slice(XH + 1)), (RH = RH.substring(0, XH));
            } else if (OH < 0) OH = RH.length;
          } else {
            if ((X(l, 2, e.length, "Base"), l == 10 && qH)) return (NH = new r(n)), vH(NH, I + NH.e + 1, B);
            if (((RH = String(n)), (jH = typeof n == "number"))) {
              if (n * 0 != 0) return E(NH, RH, jH, l);
              if (
                ((NH.s = 1 / n < 0 ? ((RH = RH.slice(1)), -1) : 1), r.DEBUG && RH.replace(/^0\.0*|\./, "").length > 15)
              )
                throw Error(T + n);
            } else NH.s = RH.charCodeAt(0) === 45 ? ((RH = RH.slice(1)), -1) : 1;
            (a = e.slice(0, l)), (OH = XH = 0);
            for (GH = RH.length; XH < GH; XH++)
              if (a.indexOf((t = RH.charAt(XH))) < 0) {
                if (t == ".") {
                  if (XH > OH) {
                    OH = GH;
                    continue;
                  }
                } else if (!s) {
                  if (
                    (RH == RH.toUpperCase() && (RH = RH.toLowerCase())) ||
                    (RH == RH.toLowerCase() && (RH = RH.toUpperCase()))
                  ) {
                    (s = !0), (XH = -1), (OH = 0);
                    continue;
                  }
                }
                return E(NH, String(n), jH, l);
              }
            if (((jH = !1), (RH = y(RH, l, 10, NH.s)), (OH = RH.indexOf(".")) > -1)) RH = RH.replace(".", "");
            else OH = RH.length;
          }
          for (XH = 0; RH.charCodeAt(XH) === 48; XH++);
          for (GH = RH.length; RH.charCodeAt(--GH) === 48; );
          if ((RH = RH.slice(XH, ++GH))) {
            if (((GH -= XH), jH && r.DEBUG && GH > 15 && (n > f || n !== K(n)))) throw Error(T + NH.s * n);
            if ((OH = OH - XH - 1) > c) NH.c = NH.e = null;
            else if (OH < g) NH.c = [(NH.e = 0)];
            else {
              if (((NH.e = OH), (NH.c = []), (XH = (OH + 1) % A), OH < 0)) XH += A;
              if (XH < GH) {
                if (XH) NH.c.push(+RH.slice(0, XH));
                for (GH -= A; XH < GH; ) NH.c.push(+RH.slice(XH, (XH += A)));
                XH = A - (RH = RH.slice(XH)).length;
              } else XH -= GH;
              for (; XH--; RH += "0");
              NH.c.push(+RH);
            }
          } else NH.c = [(NH.e = 0)];
        }
        (r.clone = j),
          (r.ROUND_UP = 0),
          (r.ROUND_DOWN = 1),
          (r.ROUND_CEIL = 2),
          (r.ROUND_FLOOR = 3),
          (r.ROUND_HALF_UP = 4),
          (r.ROUND_HALF_DOWN = 5),
          (r.ROUND_HALF_EVEN = 6),
          (r.ROUND_HALF_CEIL = 7),
          (r.ROUND_HALF_FLOOR = 8),
          (r.EUCLID = 9),
          (r.config = r.set =
            function (n) {
              var l, a;
              if (n != null)
                if (typeof n == "object") {
                  if (n.hasOwnProperty((l = "DECIMAL_PLACES"))) (a = n[l]), X(a, 0, D, l), (I = a);
                  if (n.hasOwnProperty((l = "ROUNDING_MODE"))) (a = n[l]), X(a, 0, 8, l), (B = a);
                  if (n.hasOwnProperty((l = "EXPONENTIAL_AT")))
                    if (((a = n[l]), a && a.pop)) X(a[0], -D, 0, l), X(a[1], 0, D, l), (p = a[0]), (C = a[1]);
                    else X(a, -D, D, l), (p = -(C = a < 0 ? -a : a));
                  if (n.hasOwnProperty((l = "RANGE")))
                    if (((a = n[l]), a && a.pop)) X(a[0], -D, -1, l), X(a[1], 1, D, l), (g = a[0]), (c = a[1]);
                    else if ((X(a, -D, D, l), a)) g = -(c = a < 0 ? -a : a);
                    else throw Error(O + l + " cannot be zero: " + a);
                  if (n.hasOwnProperty((l = "CRYPTO")))
                    if (((a = n[l]), a === !!a))
                      if (a)
                        if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) U = a;
                        else throw ((U = !a), Error(O + "crypto unavailable"));
                      else U = a;
                    else throw Error(O + l + " not true or false: " + a);
                  if (n.hasOwnProperty((l = "MODULO_MODE"))) (a = n[l]), X(a, 0, 9, l), (i = a);
                  if (n.hasOwnProperty((l = "POW_PRECISION"))) (a = n[l]), X(a, 0, D, l), (_H = a);
                  if (n.hasOwnProperty((l = "FORMAT")))
                    if (((a = n[l]), typeof a == "object")) HH = a;
                    else throw Error(O + l + " not an object: " + a);
                  if (n.hasOwnProperty((l = "ALPHABET")))
                    if (((a = n[l]), typeof a == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(a)))
                      (qH = a.slice(0, 10) == "0123456789"), (e = a);
                    else throw Error(O + l + " invalid: " + a);
                } else throw Error(O + "Object expected: " + n);
              return {
                DECIMAL_PLACES: I,
                ROUNDING_MODE: B,
                EXPONENTIAL_AT: [p, C],
                RANGE: [g, c],
                CRYPTO: U,
                MODULO_MODE: i,
                POW_PRECISION: _H,
                FORMAT: HH,
                ALPHABET: e,
              };
            }),
          (r.isBigNumber = function (n) {
            if (!n || n._isBigNumber !== !0) return !1;
            if (!r.DEBUG) return !0;
            var l,
              a,
              t = n.c,
              s = n.e,
              OH = n.s;
            H: if ({}.toString.call(t) == "[object Array]") {
              if ((OH === 1 || OH === -1) && s >= -D && s <= D && s === K(s)) {
                if (t[0] === 0) {
                  if (s === 0 && t.length === 1) return !0;
                  break H;
                }
                if (((l = (s + 1) % A), l < 1)) l += A;
                if (String(t[0]).length == l) {
                  for (l = 0; l < t.length; l++) if (((a = t[l]), a < 0 || a >= z || a !== K(a))) break H;
                  if (a !== 0) return !0;
                }
              }
            } else if (t === null && s === null && (OH === null || OH === 1 || OH === -1)) return !0;
            throw Error(O + "Invalid BigNumber: " + n);
          }),
          (r.maximum = r.max =
            function () {
              return DH(arguments, -1);
            }),
          (r.minimum = r.min =
            function () {
              return DH(arguments, 1);
            }),
          (r.random = (function () {
            var n = 9007199254740992,
              l =
                (Math.random() * n) & 2097151
                  ? function () {
                      return K(Math.random() * n);
                    }
                  : function () {
                      return ((Math.random() * 1073741824) | 0) * 8388608 + ((Math.random() * 8388608) | 0);
                    };
            return function (a) {
              var t,
                s,
                OH,
                XH,
                jH,
                GH = 0,
                RH = [],
                NH = new r(x);
              if (a == null) a = I;
              else X(a, 0, D);
              if (((XH = $(a / A)), U))
                if (crypto.getRandomValues) {
                  t = crypto.getRandomValues(new Uint32Array((XH *= 2)));
                  for (; GH < XH; )
                    if (((jH = t[GH] * 131072 + (t[GH + 1] >>> 11)), jH >= 9000000000000000))
                      (s = crypto.getRandomValues(new Uint32Array(2))), (t[GH] = s[0]), (t[GH + 1] = s[1]);
                    else RH.push(jH % 100000000000000), (GH += 2);
                  GH = XH / 2;
                } else if (crypto.randomBytes) {
                  t = crypto.randomBytes((XH *= 7));
                  for (; GH < XH; )
                    if (
                      ((jH =
                        (t[GH] & 31) * 281474976710656 +
                        t[GH + 1] * 1099511627776 +
                        t[GH + 2] * 4294967296 +
                        t[GH + 3] * 16777216 +
                        (t[GH + 4] << 16) +
                        (t[GH + 5] << 8) +
                        t[GH + 6]),
                      jH >= 9000000000000000)
                    )
                      crypto.randomBytes(7).copy(t, GH);
                    else RH.push(jH % 100000000000000), (GH += 7);
                  GH = XH / 7;
                } else throw ((U = !1), Error(O + "crypto unavailable"));
              if (!U) {
                for (; GH < XH; ) if (((jH = l()), jH < 9000000000000000)) RH[GH++] = jH % 100000000000000;
              }
              if (((XH = RH[--GH]), (a %= A), XH && a)) (jH = w[A - a]), (RH[GH] = K(XH / jH) * jH);
              for (; RH[GH] === 0; RH.pop(), GH--);
              if (GH < 0) RH = [(OH = 0)];
              else {
                for (OH = -1; RH[0] === 0; RH.splice(0, 1), OH -= A);
                for (GH = 1, jH = RH[0]; jH >= 10; jH /= 10, GH++);
                if (GH < A) OH -= A - GH;
              }
              return (NH.e = OH), (NH.c = RH), NH;
            };
          })()),
          (r.sum = function () {
            var n = 1,
              l = arguments,
              a = new r(l[0]);
            for (; n < l.length; ) a = a.plus(l[n++]);
            return a;
          }),
          (y = (function () {
            var n = "0123456789";
            function l(a, t, s, OH) {
              var XH,
                jH = [0],
                GH,
                RH = 0,
                NH = a.length;
              for (; RH < NH; ) {
                for (GH = jH.length; GH--; jH[GH] *= t);
                jH[0] += OH.indexOf(a.charAt(RH++));
                for (XH = 0; XH < jH.length; XH++)
                  if (jH[XH] > s - 1) {
                    if (jH[XH + 1] == null) jH[XH + 1] = 0;
                    (jH[XH + 1] += (jH[XH] / s) | 0), (jH[XH] %= s);
                  }
              }
              return jH.reverse();
            }
            return function (a, t, s, OH, XH) {
              var jH,
                GH,
                RH,
                NH,
                hH,
                ZH,
                bH,
                nH,
                __ = a.indexOf("."),
                SH = I,
                VH = B;
              if (__ >= 0)
                (NH = _H),
                  (_H = 0),
                  (a = a.replace(".", "")),
                  (nH = new r(t)),
                  (ZH = nH.pow(a.length - __)),
                  (_H = NH),
                  (nH.c = l(Z(J(ZH.c), ZH.e, "0"), 10, s, n)),
                  (nH.e = nH.c.length);
              (bH = l(a, t, s, XH ? ((jH = e), n) : ((jH = n), e))), (RH = NH = bH.length);
              for (; bH[--NH] == 0; bH.pop());
              if (!bH[0]) return jH.charAt(0);
              if (__ < 0) --RH;
              else
                (ZH.c = bH),
                  (ZH.e = RH),
                  (ZH.s = OH),
                  (ZH = v(ZH, nH, SH, VH, s)),
                  (bH = ZH.c),
                  (hH = ZH.r),
                  (RH = ZH.e);
              if (
                ((GH = RH + SH + 1),
                (__ = bH[GH]),
                (NH = s / 2),
                (hH = hH || GH < 0 || bH[GH + 1] != null),
                (hH =
                  VH < 4
                    ? (__ != null || hH) && (VH == 0 || VH == (ZH.s < 0 ? 3 : 2))
                    : __ > NH ||
                      (__ == NH && (VH == 4 || hH || (VH == 6 && bH[GH - 1] & 1) || VH == (ZH.s < 0 ? 8 : 7)))),
                GH < 1 || !bH[0])
              )
                a = hH ? Z(jH.charAt(1), -SH, jH.charAt(0)) : jH.charAt(0);
              else {
                if (((bH.length = GH), hH)) {
                  for (--s; ++bH[--GH] > s; ) if (((bH[GH] = 0), !GH)) ++RH, (bH = [1].concat(bH));
                }
                for (NH = bH.length; !bH[--NH]; );
                for (__ = 0, a = ""; __ <= NH; a += jH.charAt(bH[__++]));
                a = Z(a, RH, jH.charAt(0));
              }
              return a;
            };
          })()),
          (v = (function () {
            function n(t, s, OH) {
              var XH,
                jH,
                GH,
                RH,
                NH = 0,
                hH = t.length,
                ZH = s % Y,
                bH = (s / Y) | 0;
              for (t = t.slice(); hH--; )
                (GH = t[hH] % Y),
                  (RH = (t[hH] / Y) | 0),
                  (XH = bH * GH + RH * ZH),
                  (jH = ZH * GH + (XH % Y) * Y + NH),
                  (NH = ((jH / OH) | 0) + ((XH / Y) | 0) + bH * RH),
                  (t[hH] = jH % OH);
              if (NH) t = [NH].concat(t);
              return t;
            }
            function l(t, s, OH, XH) {
              var jH, GH;
              if (OH != XH) GH = OH > XH ? 1 : -1;
              else
                for (jH = GH = 0; jH < OH; jH++)
                  if (t[jH] != s[jH]) {
                    GH = t[jH] > s[jH] ? 1 : -1;
                    break;
                  }
              return GH;
            }
            function a(t, s, OH, XH) {
              var jH = 0;
              for (; OH--; ) (t[OH] -= jH), (jH = t[OH] < s[OH] ? 1 : 0), (t[OH] = jH * XH + t[OH] - s[OH]);
              for (; !t[0] && t.length > 1; t.splice(0, 1));
            }
            return function (t, s, OH, XH, jH) {
              var GH,
                RH,
                NH,
                hH,
                ZH,
                bH,
                nH,
                __,
                SH,
                VH,
                yH,
                sH,
                zH,
                WH,
                BH,
                EH,
                mH,
                FH = t.s == s.s ? 1 : -1,
                TH = t.c,
                wH = s.c;
              if (!TH || !TH[0] || !wH || !wH[0])
                return new r(
                  !t.s || !s.s || (TH ? wH && TH[0] == wH[0] : !wH) ? NaN : (TH && TH[0] == 0) || !wH ? FH * 0 : FH / 0,
                );
              if (((__ = new r(FH)), (SH = __.c = []), (RH = t.e - s.e), (FH = OH + RH + 1), !jH))
                (jH = z), (RH = M(t.e / A) - M(s.e / A)), (FH = (FH / A) | 0);
              for (NH = 0; wH[NH] == (TH[NH] || 0); NH++);
              if (wH[NH] > (TH[NH] || 0)) RH--;
              if (FH < 0) SH.push(1), (hH = !0);
              else {
                if (((WH = TH.length), (EH = wH.length), (NH = 0), (FH += 2), (ZH = K(jH / (wH[0] + 1))), ZH > 1))
                  (wH = n(wH, ZH, jH)), (TH = n(TH, ZH, jH)), (EH = wH.length), (WH = TH.length);
                (zH = EH), (VH = TH.slice(0, EH)), (yH = VH.length);
                for (; yH < EH; VH[yH++] = 0);
                if (((mH = wH.slice()), (mH = [0].concat(mH)), (BH = wH[0]), wH[1] >= jH / 2)) BH++;
                do {
                  if (((ZH = 0), (GH = l(wH, VH, EH, yH)), GH < 0)) {
                    if (((sH = VH[0]), EH != yH)) sH = sH * jH + (VH[1] || 0);
                    if (((ZH = K(sH / BH)), ZH > 1)) {
                      if (ZH >= jH) ZH = jH - 1;
                      (bH = n(wH, ZH, jH)), (nH = bH.length), (yH = VH.length);
                      while (l(bH, VH, nH, yH) == 1) ZH--, a(bH, EH < nH ? mH : wH, nH, jH), (nH = bH.length), (GH = 1);
                    } else {
                      if (ZH == 0) GH = ZH = 1;
                      (bH = wH.slice()), (nH = bH.length);
                    }
                    if (nH < yH) bH = [0].concat(bH);
                    if ((a(VH, bH, yH, jH), (yH = VH.length), GH == -1))
                      while (l(wH, VH, EH, yH) < 1) ZH++, a(VH, EH < yH ? mH : wH, yH, jH), (yH = VH.length);
                  } else if (GH === 0) ZH++, (VH = [0]);
                  if (((SH[NH++] = ZH), VH[0])) VH[yH++] = TH[zH] || 0;
                  else (VH = [TH[zH]]), (yH = 1);
                } while ((zH++ < WH || VH[0] != null) && FH--);
                if (((hH = VH[0] != null), !SH[0])) SH.splice(0, 1);
              }
              if (jH == z) {
                for (NH = 1, FH = SH[0]; FH >= 10; FH /= 10, NH++);
                vH(__, OH + (__.e = NH + RH * A - 1) + 1, XH, hH);
              } else (__.e = RH), (__.r = +hH);
              return __;
            };
          })());
        function $H(n, l, a, t) {
          var s, OH, XH, jH, GH;
          if (a == null) a = B;
          else X(a, 0, 8);
          if (!n.c) return n.toString();
          if (((s = n.c[0]), (XH = n.e), l == null))
            (GH = J(n.c)), (GH = t == 1 || (t == 2 && (XH <= p || XH >= C)) ? W(GH, XH) : Z(GH, XH, "0"));
          else if (
            ((n = vH(new r(n), l, a)),
            (OH = n.e),
            (GH = J(n.c)),
            (jH = GH.length),
            t == 1 || (t == 2 && (l <= OH || OH <= p)))
          ) {
            for (; jH < l; GH += "0", jH++);
            GH = W(GH, OH);
          } else if (((l -= XH), (GH = Z(GH, OH, "0")), OH + 1 > jH)) {
            if (--l > 0) for (GH += "."; l--; GH += "0");
          } else if (((l += OH - jH), l > 0)) {
            if (OH + 1 == jH) GH += ".";
            for (; l--; GH += "0");
          }
          return n.s < 0 && s ? "-" + GH : GH;
        }
        function DH(n, l) {
          var a,
            t,
            s = 1,
            OH = new r(n[0]);
          for (; s < n.length; s++)
            if (((t = new r(n[s])), !t.s || (a = P(OH, t)) === l || (a === 0 && OH.s === l))) OH = t;
          return OH;
        }
        function fH(n, l, a) {
          var t = 1,
            s = l.length;
          for (; !l[--s]; l.pop());
          for (s = l[0]; s >= 10; s /= 10, t++);
          if ((a = t + a * A - 1) > c) n.c = n.e = null;
          else if (a < g) n.c = [(n.e = 0)];
          else (n.e = a), (n.c = l);
          return n;
        }
        E = (function () {
          var n = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
            l = /^([^.]+)\.$/,
            a = /^\.([^.]+)$/,
            t = /^-?(Infinity|NaN)$/,
            s = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
          return function (OH, XH, jH, GH) {
            var RH,
              NH = jH ? XH : XH.replace(s, "");
            if (t.test(NH)) OH.s = isNaN(NH) ? null : NH < 0 ? -1 : 1;
            else {
              if (!jH) {
                if (
                  ((NH = NH.replace(n, function (hH, ZH, bH) {
                    return (RH = (bH = bH.toLowerCase()) == "x" ? 16 : bH == "b" ? 2 : 8), !GH || GH == RH ? ZH : hH;
                  })),
                  GH)
                )
                  (RH = GH), (NH = NH.replace(l, "$1").replace(a, "0.$1"));
                if (XH != NH) return new r(NH, RH);
              }
              if (r.DEBUG) throw Error(O + "Not a" + (GH ? " base " + GH : "") + " number: " + XH);
              OH.s = null;
            }
            OH.c = OH.e = null;
          };
        })();
        function vH(n, l, a, t) {
          var s,
            OH,
            XH,
            jH,
            GH,
            RH,
            NH,
            hH = n.c,
            ZH = w;
          if (hH) {
            H: {
              for (s = 1, jH = hH[0]; jH >= 10; jH /= 10, s++);
              if (((OH = l - s), OH < 0))
                (OH += A), (XH = l), (GH = hH[(RH = 0)]), (NH = K((GH / ZH[s - XH - 1]) % 10));
              else if (((RH = $((OH + 1) / A)), RH >= hH.length))
                if (t) {
                  for (; hH.length <= RH; hH.push(0));
                  (GH = NH = 0), (s = 1), (OH %= A), (XH = OH - A + 1);
                } else break H;
              else {
                GH = jH = hH[RH];
                for (s = 1; jH >= 10; jH /= 10, s++);
                (OH %= A), (XH = OH - A + s), (NH = XH < 0 ? 0 : K((GH / ZH[s - XH - 1]) % 10));
              }
              if (
                ((t = t || l < 0 || hH[RH + 1] != null || (XH < 0 ? GH : GH % ZH[s - XH - 1])),
                (t =
                  a < 4
                    ? (NH || t) && (a == 0 || a == (n.s < 0 ? 3 : 2))
                    : NH > 5 ||
                      (NH == 5 &&
                        (a == 4 ||
                          t ||
                          (a == 6 && ((OH > 0 ? (XH > 0 ? GH / ZH[s - XH] : 0) : hH[RH - 1]) % 10) & 1) ||
                          a == (n.s < 0 ? 8 : 7)))),
                l < 1 || !hH[0])
              ) {
                if (((hH.length = 0), t)) (l -= n.e + 1), (hH[0] = ZH[(A - (l % A)) % A]), (n.e = -l || 0);
                else hH[0] = n.e = 0;
                return n;
              }
              if (OH == 0) (hH.length = RH), (jH = 1), RH--;
              else (hH.length = RH + 1), (jH = ZH[A - OH]), (hH[RH] = XH > 0 ? K((GH / ZH[s - XH]) % ZH[XH]) * jH : 0);
              if (t)
                for (;;)
                  if (RH == 0) {
                    for (OH = 1, XH = hH[0]; XH >= 10; XH /= 10, OH++);
                    XH = hH[0] += jH;
                    for (jH = 1; XH >= 10; XH /= 10, jH++);
                    if (OH != jH) {
                      if ((n.e++, hH[0] == z)) hH[0] = 1;
                    }
                    break;
                  } else {
                    if (((hH[RH] += jH), hH[RH] != z)) break;
                    (hH[RH--] = 0), (jH = 1);
                  }
              for (OH = hH.length; hH[--OH] === 0; hH.pop());
            }
            if (n.e > c) n.c = n.e = null;
            else if (n.e < g) n.c = [(n.e = 0)];
          }
          return n;
        }
        function KH(n) {
          var l,
            a = n.e;
          if (a === null) return n.toString();
          return (l = J(n.c)), (l = a <= p || a >= C ? W(l, a) : Z(l, a, "0")), n.s < 0 ? "-" + l : l;
        }
        if (
          ((S.absoluteValue = S.abs =
            function () {
              var n = new r(this);
              if (n.s < 0) n.s = 1;
              return n;
            }),
          (S.comparedTo = function (n, l) {
            return P(this, new r(n, l));
          }),
          (S.decimalPlaces = S.dp =
            function (n, l) {
              var a,
                t,
                s,
                OH = this;
              if (n != null) {
                if ((X(n, 0, D), l == null)) l = B;
                else X(l, 0, 8);
                return vH(new r(OH), n + OH.e + 1, l);
              }
              if (!(a = OH.c)) return null;
              if (((t = ((s = a.length - 1) - M(this.e / A)) * A), (s = a[s]))) for (; s % 10 == 0; s /= 10, t--);
              if (t < 0) t = 0;
              return t;
            }),
          (S.dividedBy = S.div =
            function (n, l) {
              return v(this, new r(n, l), I, B);
            }),
          (S.dividedToIntegerBy = S.idiv =
            function (n, l) {
              return v(this, new r(n, l), 0, 1);
            }),
          (S.exponentiatedBy = S.pow =
            function (n, l) {
              var a,
                t,
                s,
                OH,
                XH,
                jH,
                GH,
                RH,
                NH,
                hH = this;
              if (((n = new r(n)), n.c && !n.isInteger())) throw Error(O + "Exponent not an integer: " + KH(n));
              if (l != null) l = new r(l);
              if (
                ((jH = n.e > 14), !hH.c || !hH.c[0] || (hH.c[0] == 1 && !hH.e && hH.c.length == 1) || !n.c || !n.c[0])
              )
                return (NH = new r(Math.pow(+KH(hH), jH ? n.s * (2 - R(n)) : +KH(n)))), l ? NH.mod(l) : NH;
              if (((GH = n.s < 0), l)) {
                if (l.c ? !l.c[0] : !l.s) return new r(NaN);
                if (((t = !GH && hH.isInteger() && l.isInteger()), t)) hH = hH.mod(l);
              } else if (
                n.e > 9 &&
                (hH.e > 0 ||
                  hH.e < -1 ||
                  (hH.e == 0
                    ? hH.c[0] > 1 || (jH && hH.c[1] >= 240000000)
                    : hH.c[0] < 80000000000000 || (jH && hH.c[0] <= 99999750000000)))
              ) {
                if (((OH = hH.s < 0 && R(n) ? -0 : 0), hH.e > -1)) OH = 1 / OH;
                return new r(GH ? 1 / OH : OH);
              } else if (_H) OH = $(_H / A + 2);
              if (jH) {
                if (((a = new r(0.5)), GH)) n.s = 1;
                RH = R(n);
              } else (s = Math.abs(+KH(n))), (RH = s % 2);
              NH = new r(x);
              for (;;) {
                if (RH) {
                  if (((NH = NH.times(hH)), !NH.c)) break;
                  if (OH) {
                    if (NH.c.length > OH) NH.c.length = OH;
                  } else if (t) NH = NH.mod(l);
                }
                if (s) {
                  if (((s = K(s / 2)), s === 0)) break;
                  RH = s % 2;
                } else if (((n = n.times(a)), vH(n, n.e + 1, 1), n.e > 14)) RH = R(n);
                else {
                  if (((s = +KH(n)), s === 0)) break;
                  RH = s % 2;
                }
                if (((hH = hH.times(hH)), OH)) {
                  if (hH.c && hH.c.length > OH) hH.c.length = OH;
                } else if (t) hH = hH.mod(l);
              }
              if (t) return NH;
              if (GH) NH = x.div(NH);
              return l ? NH.mod(l) : OH ? vH(NH, _H, B, XH) : NH;
            }),
          (S.integerValue = function (n) {
            var l = new r(this);
            if (n == null) n = B;
            else X(n, 0, 8);
            return vH(l, l.e + 1, n);
          }),
          (S.isEqualTo = S.eq =
            function (n, l) {
              return P(this, new r(n, l)) === 0;
            }),
          (S.isFinite = function () {
            return !!this.c;
          }),
          (S.isGreaterThan = S.gt =
            function (n, l) {
              return P(this, new r(n, l)) > 0;
            }),
          (S.isGreaterThanOrEqualTo = S.gte =
            function (n, l) {
              return (l = P(this, new r(n, l))) === 1 || l === 0;
            }),
          (S.isInteger = function () {
            return !!this.c && M(this.e / A) > this.c.length - 2;
          }),
          (S.isLessThan = S.lt =
            function (n, l) {
              return P(this, new r(n, l)) < 0;
            }),
          (S.isLessThanOrEqualTo = S.lte =
            function (n, l) {
              return (l = P(this, new r(n, l))) === -1 || l === 0;
            }),
          (S.isNaN = function () {
            return !this.s;
          }),
          (S.isNegative = function () {
            return this.s < 0;
          }),
          (S.isPositive = function () {
            return this.s > 0;
          }),
          (S.isZero = function () {
            return !!this.c && this.c[0] == 0;
          }),
          (S.minus = function (n, l) {
            var a,
              t,
              s,
              OH,
              XH = this,
              jH = XH.s;
            if (((n = new r(n, l)), (l = n.s), !jH || !l)) return new r(NaN);
            if (jH != l) return (n.s = -l), XH.plus(n);
            var GH = XH.e / A,
              RH = n.e / A,
              NH = XH.c,
              hH = n.c;
            if (!GH || !RH) {
              if (!NH || !hH) return NH ? ((n.s = -l), n) : new r(hH ? XH : NaN);
              if (!NH[0] || !hH[0]) return hH[0] ? ((n.s = -l), n) : new r(NH[0] ? XH : B == 3 ? -0 : 0);
            }
            if (((GH = M(GH)), (RH = M(RH)), (NH = NH.slice()), (jH = GH - RH))) {
              if ((OH = jH < 0)) (jH = -jH), (s = NH);
              else (RH = GH), (s = hH);
              s.reverse();
              for (l = jH; l--; s.push(0));
              s.reverse();
            } else {
              t = (OH = (jH = NH.length) < (l = hH.length)) ? jH : l;
              for (jH = l = 0; l < t; l++)
                if (NH[l] != hH[l]) {
                  OH = NH[l] < hH[l];
                  break;
                }
            }
            if (OH) (s = NH), (NH = hH), (hH = s), (n.s = -n.s);
            if (((l = (t = hH.length) - (a = NH.length)), l > 0)) for (; l--; NH[a++] = 0);
            l = z - 1;
            for (; t > jH; ) {
              if (NH[--t] < hH[t]) {
                for (a = t; a && !NH[--a]; NH[a] = l);
                --NH[a], (NH[t] += z);
              }
              NH[t] -= hH[t];
            }
            for (; NH[0] == 0; NH.splice(0, 1), --RH);
            if (!NH[0]) return (n.s = B == 3 ? -1 : 1), (n.c = [(n.e = 0)]), n;
            return fH(n, NH, RH);
          }),
          (S.modulo = S.mod =
            function (n, l) {
              var a,
                t,
                s = this;
              if (((n = new r(n, l)), !s.c || !n.s || (n.c && !n.c[0]))) return new r(NaN);
              else if (!n.c || (s.c && !s.c[0])) return new r(s);
              if (i == 9) (t = n.s), (n.s = 1), (a = v(s, n, 0, 3)), (n.s = t), (a.s *= t);
              else a = v(s, n, 0, i);
              if (((n = s.minus(a.times(n))), !n.c[0] && i == 1)) n.s = s.s;
              return n;
            }),
          (S.multipliedBy = S.times =
            function (n, l) {
              var a,
                t,
                s,
                OH,
                XH,
                jH,
                GH,
                RH,
                NH,
                hH,
                ZH,
                bH,
                nH,
                __,
                SH,
                VH = this,
                yH = VH.c,
                sH = (n = new r(n, l)).c;
              if (!yH || !sH || !yH[0] || !sH[0]) {
                if (!VH.s || !n.s || (yH && !yH[0] && !sH) || (sH && !sH[0] && !yH)) n.c = n.e = n.s = null;
                else if (((n.s *= VH.s), !yH || !sH)) n.c = n.e = null;
                else (n.c = [0]), (n.e = 0);
                return n;
              }
              if (((t = M(VH.e / A) + M(n.e / A)), (n.s *= VH.s), (GH = yH.length), (hH = sH.length), GH < hH))
                (nH = yH), (yH = sH), (sH = nH), (s = GH), (GH = hH), (hH = s);
              for (s = GH + hH, nH = []; s--; nH.push(0));
              (__ = z), (SH = Y);
              for (s = hH; --s >= 0; ) {
                (a = 0), (ZH = sH[s] % SH), (bH = (sH[s] / SH) | 0);
                for (XH = GH, OH = s + XH; OH > s; )
                  (RH = yH[--XH] % SH),
                    (NH = (yH[XH] / SH) | 0),
                    (jH = bH * RH + NH * ZH),
                    (RH = ZH * RH + (jH % SH) * SH + nH[OH] + a),
                    (a = ((RH / __) | 0) + ((jH / SH) | 0) + bH * NH),
                    (nH[OH--] = RH % __);
                nH[OH] = a;
              }
              if (a) ++t;
              else nH.splice(0, 1);
              return fH(n, nH, t);
            }),
          (S.negated = function () {
            var n = new r(this);
            return (n.s = -n.s || null), n;
          }),
          (S.plus = function (n, l) {
            var a,
              t = this,
              s = t.s;
            if (((n = new r(n, l)), (l = n.s), !s || !l)) return new r(NaN);
            if (s != l) return (n.s = -l), t.minus(n);
            var OH = t.e / A,
              XH = n.e / A,
              jH = t.c,
              GH = n.c;
            if (!OH || !XH) {
              if (!jH || !GH) return new r(s / 0);
              if (!jH[0] || !GH[0]) return GH[0] ? n : new r(jH[0] ? t : s * 0);
            }
            if (((OH = M(OH)), (XH = M(XH)), (jH = jH.slice()), (s = OH - XH))) {
              if (s > 0) (XH = OH), (a = GH);
              else (s = -s), (a = jH);
              a.reverse();
              for (; s--; a.push(0));
              a.reverse();
            }
            if (((s = jH.length), (l = GH.length), s - l < 0)) (a = GH), (GH = jH), (jH = a), (l = s);
            for (s = 0; l; ) (s = ((jH[--l] = jH[l] + GH[l] + s) / z) | 0), (jH[l] = z === jH[l] ? 0 : jH[l] % z);
            if (s) (jH = [s].concat(jH)), ++XH;
            return fH(n, jH, XH);
          }),
          (S.precision = S.sd =
            function (n, l) {
              var a,
                t,
                s,
                OH = this;
              if (n != null && n !== !!n) {
                if ((X(n, 1, D), l == null)) l = B;
                else X(l, 0, 8);
                return vH(new r(OH), n, l);
              }
              if (!(a = OH.c)) return null;
              if (((s = a.length - 1), (t = s * A + 1), (s = a[s]))) {
                for (; s % 10 == 0; s /= 10, t--);
                for (s = a[0]; s >= 10; s /= 10, t++);
              }
              if (n && OH.e + 1 > t) t = OH.e + 1;
              return t;
            }),
          (S.shiftedBy = function (n) {
            return X(n, -f, f), this.times("1e" + n);
          }),
          (S.squareRoot = S.sqrt =
            function () {
              var n,
                l,
                a,
                t,
                s,
                OH = this,
                XH = OH.c,
                jH = OH.s,
                GH = OH.e,
                RH = I + 4,
                NH = new r("0.5");
              if (jH !== 1 || !XH || !XH[0]) return new r(!jH || (jH < 0 && (!XH || XH[0])) ? NaN : XH ? OH : 1 / 0);
              if (((jH = Math.sqrt(+KH(OH))), jH == 0 || jH == 1 / 0)) {
                if (((l = J(XH)), (l.length + GH) % 2 == 0)) l += "0";
                if (((jH = Math.sqrt(+l)), (GH = M((GH + 1) / 2) - (GH < 0 || GH % 2)), jH == 1 / 0)) l = "5e" + GH;
                else (l = jH.toExponential()), (l = l.slice(0, l.indexOf("e") + 1) + GH);
                a = new r(l);
              } else a = new r(jH + "");
              if (a.c[0]) {
                if (((GH = a.e), (jH = GH + RH), jH < 3)) jH = 0;
                for (;;)
                  if (
                    ((s = a),
                    (a = NH.times(s.plus(v(OH, s, RH, 1)))),
                    J(s.c).slice(0, jH) === (l = J(a.c)).slice(0, jH))
                  ) {
                    if (a.e < GH) --jH;
                    if (((l = l.slice(jH - 3, jH + 1)), l == "9999" || (!t && l == "4999"))) {
                      if (!t) {
                        if ((vH(s, s.e + I + 2, 0), s.times(s).eq(OH))) {
                          a = s;
                          break;
                        }
                      }
                      (RH += 4), (jH += 4), (t = 1);
                    } else {
                      if (!+l || (!+l.slice(1) && l.charAt(0) == "5")) vH(a, a.e + I + 2, 1), (n = !a.times(a).eq(OH));
                      break;
                    }
                  }
              }
              return vH(a, a.e + I + 1, B, n);
            }),
          (S.toExponential = function (n, l) {
            if (n != null) X(n, 0, D), n++;
            return $H(this, n, l, 1);
          }),
          (S.toFixed = function (n, l) {
            if (n != null) X(n, 0, D), (n = n + this.e + 1);
            return $H(this, n, l);
          }),
          (S.toFormat = function (n, l, a) {
            var t,
              s = this;
            if (a == null)
              if (n != null && l && typeof l == "object") (a = l), (l = null);
              else if (n && typeof n == "object") (a = n), (n = l = null);
              else a = HH;
            else if (typeof a != "object") throw Error(O + "Argument not an object: " + a);
            if (((t = s.toFixed(n, l)), s.c)) {
              var OH,
                XH = t.split("."),
                jH = +a.groupSize,
                GH = +a.secondaryGroupSize,
                RH = a.groupSeparator || "",
                NH = XH[0],
                hH = XH[1],
                ZH = s.s < 0,
                bH = ZH ? NH.slice(1) : NH,
                nH = bH.length;
              if (GH) (OH = jH), (jH = GH), (GH = OH), (nH -= OH);
              if (jH > 0 && nH > 0) {
                (OH = nH % jH || jH), (NH = bH.substr(0, OH));
                for (; OH < nH; OH += jH) NH += RH + bH.substr(OH, jH);
                if (GH > 0) NH += RH + bH.slice(OH);
                if (ZH) NH = "-" + NH;
              }
              t = hH
                ? NH +
                  (a.decimalSeparator || "") +
                  ((GH = +a.fractionGroupSize)
                    ? hH.replace(new RegExp("\\d{" + GH + "}\\B", "g"), "$&" + (a.fractionGroupSeparator || ""))
                    : hH)
                : NH;
            }
            return (a.prefix || "") + t + (a.suffix || "");
          }),
          (S.toFraction = function (n) {
            var l,
              a,
              t,
              s,
              OH,
              XH,
              jH,
              GH,
              RH,
              NH,
              hH,
              ZH,
              bH = this,
              nH = bH.c;
            if (n != null) {
              if (((jH = new r(n)), (!jH.isInteger() && (jH.c || jH.s !== 1)) || jH.lt(x)))
                throw Error(O + "Argument " + (jH.isInteger() ? "out of range: " : "not an integer: ") + KH(jH));
            }
            if (!nH) return new r(bH);
            (l = new r(x)),
              (RH = a = new r(x)),
              (t = GH = new r(x)),
              (ZH = J(nH)),
              (OH = l.e = ZH.length - bH.e - 1),
              (l.c[0] = w[(XH = OH % A) < 0 ? A + XH : XH]),
              (n = !n || jH.comparedTo(l) > 0 ? (OH > 0 ? l : RH) : jH),
              (XH = c),
              (c = 1 / 0),
              (jH = new r(ZH)),
              (GH.c[0] = 0);
            for (;;) {
              if (((NH = v(jH, l, 0, 1)), (s = a.plus(NH.times(t))), s.comparedTo(n) == 1)) break;
              (a = t),
                (t = s),
                (RH = GH.plus(NH.times((s = RH)))),
                (GH = s),
                (l = jH.minus(NH.times((s = l)))),
                (jH = s);
            }
            return (
              (s = v(n.minus(a), t, 0, 1)),
              (GH = GH.plus(s.times(RH))),
              (a = a.plus(s.times(t))),
              (GH.s = RH.s = bH.s),
              (OH = OH * 2),
              (hH =
                v(RH, t, OH, B)
                  .minus(bH)
                  .abs()
                  .comparedTo(v(GH, a, OH, B).minus(bH).abs()) < 1
                  ? [RH, t]
                  : [GH, a]),
              (c = XH),
              hH
            );
          }),
          (S.toNumber = function () {
            return +KH(this);
          }),
          (S.toPrecision = function (n, l) {
            if (n != null) X(n, 1, D);
            return $H(this, n, l, 2);
          }),
          (S.toString = function (n) {
            var l,
              a = this,
              t = a.s,
              s = a.e;
            if (s === null)
              if (t) {
                if (((l = "Infinity"), t < 0)) l = "-" + l;
              } else l = "NaN";
            else {
              if (n == null) l = s <= p || s >= C ? W(J(a.c), s) : Z(J(a.c), s, "0");
              else if (n === 10 && qH) (a = vH(new r(a), I + s + 1, B)), (l = Z(J(a.c), a.e, "0"));
              else X(n, 2, e.length, "Base"), (l = y(Z(J(a.c), s, "0"), 10, n, t, !0));
              if (t < 0 && a.c[0]) l = "-" + l;
            }
            return l;
          }),
          (S.valueOf = S.toJSON =
            function () {
              return KH(this);
            }),
          (S._isBigNumber = !0),
          k != null)
        )
          r.set(k);
        return r;
      }
      function M(k) {
        var v = k | 0;
        return k > 0 || k === v ? v : v - 1;
      }
      function J(k) {
        var v,
          y,
          E = 1,
          S = k.length,
          x = k[0] + "";
        for (; E < S; ) {
          (v = k[E++] + ""), (y = A - v.length);
          for (; y--; v = "0" + v);
          x += v;
        }
        for (S = x.length; x.charCodeAt(--S) === 48; );
        return x.slice(0, S + 1 || 1);
      }
      function P(k, v) {
        var y,
          E,
          S = k.c,
          x = v.c,
          I = k.s,
          B = v.s,
          p = k.e,
          C = v.e;
        if (!I || !B) return null;
        if (((y = S && !S[0]), (E = x && !x[0]), y || E)) return y ? (E ? 0 : -B) : I;
        if (I != B) return I;
        if (((y = I < 0), (E = p == C), !S || !x)) return E ? 0 : !S ^ y ? 1 : -1;
        if (!E) return (p > C) ^ y ? 1 : -1;
        B = (p = S.length) < (C = x.length) ? p : C;
        for (I = 0; I < B; I++) if (S[I] != x[I]) return (S[I] > x[I]) ^ y ? 1 : -1;
        return p == C ? 0 : (p > C) ^ y ? 1 : -1;
      }
      function X(k, v, y, E) {
        if (k < v || k > y || k !== K(k))
          throw Error(
            O +
              (E || "Argument") +
              (typeof k == "number"
                ? k < v || k > y
                  ? " out of range: "
                  : " not an integer: "
                : " not a primitive number: ") +
              String(k),
          );
      }
      function R(k) {
        var v = k.c.length - 1;
        return M(k.e / A) == v && k.c[v] % 2 != 0;
      }
      function W(k, v) {
        return (k.length > 1 ? k.charAt(0) + "." + k.slice(1) : k) + (v < 0 ? "e" : "e+") + v;
      }
      function Z(k, v, y) {
        var E, S;
        if (v < 0) {
          for (S = y + "."; ++v; S += y);
          k = S + k;
        } else if (((E = k.length), ++v > E)) {
          for (S = y, v -= E; --v; S += y);
          k += S;
        } else if (v < E) k = k.slice(0, v) + "." + k.slice(v);
        return k;
      }
      if (((_ = j()), (_.default = _.BigNumber = _), typeof define == "function" && define.amd))
        define(function () {
          return _;
        });
      else if (typeof tM_ < "u" && tM_.exports) tM_.exports = _;
      else {
        if (!H) H = typeof self < "u" && self ? self : window;
        H.BigNumber = _;
      }
    })(SGq);
  });

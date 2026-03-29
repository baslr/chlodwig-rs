  var US = d((vT3, wPq) => {
    var Iq4 = /\s+/g;
    class IgH {
      constructor(H, _) {
        if (((_ = xq4(_)), H instanceof IgH))
          if (H.loose === !!_.loose && H.includePrerelease === !!_.includePrerelease) return H;
          else return new IgH(H.raw, _);
        if (H instanceof NJ6) return (this.raw = H.value), (this.set = [[H]]), (this.formatted = void 0), this;
        if (
          ((this.options = _),
          (this.loose = !!_.loose),
          (this.includePrerelease = !!_.includePrerelease),
          (this.raw = H.trim().replace(Iq4, " ")),
          (this.set = this.raw
            .split("||")
            .map((q) => this.parseRange(q.trim()))
            .filter((q) => q.length)),
          !this.set.length)
        )
          throw TypeError(`Invalid SemVer Range: ${this.raw}`);
        if (this.set.length > 1) {
          let q = this.set[0];
          if (((this.set = this.set.filter(($) => !APq($[0]))), this.set.length === 0)) this.set = [q];
          else if (this.set.length > 1) {
            for (let $ of this.set)
              if ($.length === 1 && Fq4($[0])) {
                this.set = [$];
                break;
              }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let H = 0; H < this.set.length; H++) {
            if (H > 0) this.formatted += "||";
            let _ = this.set[H];
            for (let q = 0; q < _.length; q++) {
              if (q > 0) this.formatted += " ";
              this.formatted += _[q].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(H) {
        let q = ((this.options.includePrerelease && dq4) | (this.options.loose && cq4)) + ":" + H,
          $ = zPq.get(q);
        if ($) return $;
        let K = this.options.loose,
          O = K ? Xk[YZ.HYPHENRANGELOOSE] : Xk[YZ.HYPHENRANGE];
        (H = H.replace(O, tq4(this.options.includePrerelease))),
          Nf("hyphen replace", H),
          (H = H.replace(Xk[YZ.COMPARATORTRIM], pq4)),
          Nf("comparator trim", H),
          (H = H.replace(Xk[YZ.TILDETRIM], Bq4)),
          Nf("tilde trim", H),
          (H = H.replace(Xk[YZ.CARETTRIM], gq4)),
          Nf("caret trim", H);
        let T = H.split(" ")
          .map((w) => Uq4(w, this.options))
          .join(" ")
          .split(/\s+/)
          .map((w) => sq4(w, this.options));
        if (K)
          T = T.filter((w) => {
            return Nf("loose invalid filter", w, this.options), !!w.match(Xk[YZ.COMPARATORLOOSE]);
          });
        Nf("range list", T);
        let z = new Map(),
          A = T.map((w) => new NJ6(w, this.options));
        for (let w of A) {
          if (APq(w)) return [w];
          z.set(w.value, w);
        }
        if (z.size > 1 && z.has("")) z.delete("");
        let f = [...z.values()];
        return zPq.set(q, f), f;
      }
      intersects(H, _) {
        if (!(H instanceof IgH)) throw TypeError("a Range is required");
        return this.set.some((q) => {
          return (
            fPq(q, _) &&
            H.set.some(($) => {
              return (
                fPq($, _) &&
                q.every((K) => {
                  return $.every((O) => {
                    return K.intersects(O, _);
                  });
                })
              );
            })
          );
        });
      }
      test(H) {
        if (!H) return !1;
        if (typeof H === "string")
          try {
            H = new mq4(H, this.options);
          } catch (_) {
            return !1;
          }
        for (let _ = 0; _ < this.set.length; _++) if (eq4(this.set[_], H, this.options)) return !0;
        return !1;
      }
    }
    wPq.exports = IgH;
    var uq4 = TPq(),
      zPq = new uq4(),
      xq4 = tj_(),
      NJ6 = ugH(),
      Nf = CgH(),
      mq4 = U0(),
      { safeRe: Xk, t: YZ, comparatorTrimReplace: pq4, tildeTrimReplace: Bq4, caretTrimReplace: gq4 } = LXH(),
      { FLAG_INCLUDE_PRERELEASE: dq4, FLAG_LOOSE: cq4 } = EgH(),
      APq = (H) => H.value === "<0.0.0-0",
      Fq4 = (H) => H.value === "",
      fPq = (H, _) => {
        let q = !0,
          $ = H.slice(),
          K = $.pop();
        while (q && $.length)
          (q = $.every((O) => {
            return K.intersects(O, _);
          })),
            (K = $.pop());
        return q;
      },
      Uq4 = (H, _) => {
        return (
          Nf("comp", H, _),
          (H = iq4(H, _)),
          Nf("caret", H),
          (H = Qq4(H, _)),
          Nf("tildes", H),
          (H = rq4(H, _)),
          Nf("xrange", H),
          (H = aq4(H, _)),
          Nf("stars", H),
          H
        );
      },
      DZ = (H) => !H || H.toLowerCase() === "x" || H === "*",
      Qq4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => lq4(q, _))
          .join(" ");
      },
      lq4 = (H, _) => {
        let q = _.loose ? Xk[YZ.TILDELOOSE] : Xk[YZ.TILDE];
        return H.replace(q, ($, K, O, T, z) => {
          Nf("tilde", H, $, K, O, T, z);
          let A;
          if (DZ(K)) A = "";
          else if (DZ(O)) A = `>=${K}.0.0 <${+K + 1}.0.0-0`;
          else if (DZ(T)) A = `>=${K}.${O}.0 <${K}.${+O + 1}.0-0`;
          else if (z) Nf("replaceTilde pr", z), (A = `>=${K}.${O}.${T}-${z} <${K}.${+O + 1}.0-0`);
          else A = `>=${K}.${O}.${T} <${K}.${+O + 1}.0-0`;
          return Nf("tilde return", A), A;
        });
      },
      iq4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => nq4(q, _))
          .join(" ");
      },
      nq4 = (H, _) => {
        Nf("caret", H, _);
        let q = _.loose ? Xk[YZ.CARETLOOSE] : Xk[YZ.CARET],
          $ = _.includePrerelease ? "-0" : "";
        return H.replace(q, (K, O, T, z, A) => {
          Nf("caret", H, K, O, T, z, A);
          let f;
          if (DZ(O)) f = "";
          else if (DZ(T)) f = `>=${O}.0.0${$} <${+O + 1}.0.0-0`;
          else if (DZ(z))
            if (O === "0") f = `>=${O}.${T}.0${$} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.0${$} <${+O + 1}.0.0-0`;
          else if (A)
            if ((Nf("replaceCaret pr", A), O === "0"))
              if (T === "0") f = `>=${O}.${T}.${z}-${A} <${O}.${T}.${+z + 1}-0`;
              else f = `>=${O}.${T}.${z}-${A} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.${z}-${A} <${+O + 1}.0.0-0`;
          else if ((Nf("no pr"), O === "0"))
            if (T === "0") f = `>=${O}.${T}.${z}${$} <${O}.${T}.${+z + 1}-0`;
            else f = `>=${O}.${T}.${z}${$} <${O}.${+T + 1}.0-0`;
          else f = `>=${O}.${T}.${z} <${+O + 1}.0.0-0`;
          return Nf("caret return", f), f;
        });
      },
      rq4 = (H, _) => {
        return (
          Nf("replaceXRanges", H, _),
          H.split(/\s+/)
            .map((q) => oq4(q, _))
            .join(" ")
        );
      },
      oq4 = (H, _) => {
        H = H.trim();
        let q = _.loose ? Xk[YZ.XRANGELOOSE] : Xk[YZ.XRANGE];
        return H.replace(q, ($, K, O, T, z, A) => {
          Nf("xRange", H, $, K, O, T, z, A);
          let f = DZ(O),
            w = f || DZ(T),
            Y = w || DZ(z),
            D = Y;
          if (K === "=" && D) K = "";
          if (((A = _.includePrerelease ? "-0" : ""), f))
            if (K === ">" || K === "<") $ = "<0.0.0-0";
            else $ = "*";
          else if (K && D) {
            if (w) T = 0;
            if (((z = 0), K === ">"))
              if (((K = ">="), w)) (O = +O + 1), (T = 0), (z = 0);
              else (T = +T + 1), (z = 0);
            else if (K === "<=")
              if (((K = "<"), w)) O = +O + 1;
              else T = +T + 1;
            if (K === "<") A = "-0";
            $ = `${K + O}.${T}.${z}${A}`;
          } else if (w) $ = `>=${O}.0.0${A} <${+O + 1}.0.0-0`;
          else if (Y) $ = `>=${O}.${T}.0${A} <${O}.${+T + 1}.0-0`;
          return Nf("xRange return", $), $;
        });
      },
      aq4 = (H, _) => {
        return Nf("replaceStars", H, _), H.trim().replace(Xk[YZ.STAR], "");
      },
      sq4 = (H, _) => {
        return Nf("replaceGTE0", H, _), H.trim().replace(Xk[_.includePrerelease ? YZ.GTE0PRE : YZ.GTE0], "");
      },
      tq4 = (H) => (_, q, $, K, O, T, z, A, f, w, Y, D) => {
        if (DZ($)) q = "";
        else if (DZ(K)) q = `>=${$}.0.0${H ? "-0" : ""}`;
        else if (DZ(O)) q = `>=${$}.${K}.0${H ? "-0" : ""}`;
        else if (T) q = `>=${q}`;
        else q = `>=${q}${H ? "-0" : ""}`;
        if (DZ(f)) A = "";
        else if (DZ(w)) A = `<${+f + 1}.0.0-0`;
        else if (DZ(Y)) A = `<${f}.${+w + 1}.0-0`;
        else if (D) A = `<=${f}.${w}.${Y}-${D}`;
        else if (H) A = `<${f}.${w}.${+Y + 1}-0`;
        else A = `<=${A}`;
        return `${q} ${A}`.trim();
      },
      eq4 = (H, _, q) => {
        for (let $ = 0; $ < H.length; $++) if (!H[$].test(_)) return !1;
        if (_.prerelease.length && !q.includePrerelease) {
          for (let $ = 0; $ < H.length; $++) {
            if ((Nf(H[$].semver), H[$].semver === NJ6.ANY)) continue;
            if (H[$].semver.prerelease.length > 0) {
              let K = H[$].semver;
              if (K.major === _.major && K.minor === _.minor && K.patch === _.patch) return !0;
            }
          }
          return !1;
        }
        return !0;
      };
  });

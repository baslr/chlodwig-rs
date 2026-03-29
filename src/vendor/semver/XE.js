  var XE = d((CC3, PUq) => {
    var ak4 = /\s+/g;
    class RUH {
      constructor(H, _) {
        if (((_ = tk4(_)), H instanceof RUH))
          if (H.loose === !!_.loose && H.includePrerelease === !!_.includePrerelease) return H;
          else return new RUH(H.raw, _);
        if (H instanceof Fv6) return (this.raw = H.value), (this.set = [[H]]), (this.formatted = void 0), this;
        if (
          ((this.options = _),
          (this.loose = !!_.loose),
          (this.includePrerelease = !!_.includePrerelease),
          (this.raw = H.trim().replace(ak4, " ")),
          (this.set = this.raw
            .split("||")
            .map((q) => this.parseRange(q.trim()))
            .filter((q) => q.length)),
          !this.set.length)
        )
          throw TypeError(`Invalid SemVer Range: ${this.raw}`);
        if (this.set.length > 1) {
          let q = this.set[0];
          if (((this.set = this.set.filter(($) => !MUq($[0]))), this.set.length === 0)) this.set = [q];
          else if (this.set.length > 1) {
            for (let $ of this.set)
              if ($.length === 1 && Ov4($[0])) {
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
        let q = ((this.options.includePrerelease && $v4) | (this.options.loose && Kv4)) + ":" + H,
          $ = jUq.get(q);
        if ($) return $;
        let K = this.options.loose,
          O = K ? Ck[ZZ.HYPHENRANGELOOSE] : Ck[ZZ.HYPHENRANGE];
        (H = H.replace(O, Jv4(this.options.includePrerelease))),
          Sf("hyphen replace", H),
          (H = H.replace(Ck[ZZ.COMPARATORTRIM], Hv4)),
          Sf("comparator trim", H),
          (H = H.replace(Ck[ZZ.TILDETRIM], _v4)),
          Sf("tilde trim", H),
          (H = H.replace(Ck[ZZ.CARETTRIM], qv4)),
          Sf("caret trim", H);
        let T = H.split(" ")
          .map((w) => Tv4(w, this.options))
          .join(" ")
          .split(/\s+/)
          .map((w) => Mv4(w, this.options));
        if (K)
          T = T.filter((w) => {
            return Sf("loose invalid filter", w, this.options), !!w.match(Ck[ZZ.COMPARATORLOOSE]);
          });
        Sf("range list", T);
        let z = new Map(),
          A = T.map((w) => new Fv6(w, this.options));
        for (let w of A) {
          if (MUq(w)) return [w];
          z.set(w.value, w);
        }
        if (z.size > 1 && z.has("")) z.delete("");
        let f = [...z.values()];
        return jUq.set(q, f), f;
      }
      intersects(H, _) {
        if (!(H instanceof RUH)) throw TypeError("a Range is required");
        return this.set.some((q) => {
          return (
            JUq(q, _) &&
            H.set.some(($) => {
              return (
                JUq($, _) &&
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
            H = new ek4(H, this.options);
          } catch (_) {
            return !1;
          }
        for (let _ = 0; _ < this.set.length; _++) if (Pv4(this.set[_], H, this.options)) return !0;
        return !1;
      }
    }
    PUq.exports = RUH;
    var sk4 = DUq(),
      jUq = new sk4(),
      tk4 = yG_(),
      Fv6 = ZUH(),
      Sf = WUH(),
      ek4 = AG(),
      { safeRe: Ck, t: ZZ, comparatorTrimReplace: Hv4, tildeTrimReplace: _v4, caretTrimReplace: qv4 } = c0H(),
      { FLAG_INCLUDE_PRERELEASE: $v4, FLAG_LOOSE: Kv4 } = XUH(),
      MUq = (H) => H.value === "<0.0.0-0",
      Ov4 = (H) => H.value === "",
      JUq = (H, _) => {
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
      Tv4 = (H, _) => {
        return (
          Sf("comp", H, _),
          (H = fv4(H, _)),
          Sf("caret", H),
          (H = zv4(H, _)),
          Sf("tildes", H),
          (H = Yv4(H, _)),
          Sf("xrange", H),
          (H = jv4(H, _)),
          Sf("stars", H),
          H
        );
      },
      LZ = (H) => !H || H.toLowerCase() === "x" || H === "*",
      zv4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => Av4(q, _))
          .join(" ");
      },
      Av4 = (H, _) => {
        let q = _.loose ? Ck[ZZ.TILDELOOSE] : Ck[ZZ.TILDE];
        return H.replace(q, ($, K, O, T, z) => {
          Sf("tilde", H, $, K, O, T, z);
          let A;
          if (LZ(K)) A = "";
          else if (LZ(O)) A = `>=${K}.0.0 <${+K + 1}.0.0-0`;
          else if (LZ(T)) A = `>=${K}.${O}.0 <${K}.${+O + 1}.0-0`;
          else if (z) Sf("replaceTilde pr", z), (A = `>=${K}.${O}.${T}-${z} <${K}.${+O + 1}.0-0`);
          else A = `>=${K}.${O}.${T} <${K}.${+O + 1}.0-0`;
          return Sf("tilde return", A), A;
        });
      },
      fv4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => wv4(q, _))
          .join(" ");
      },
      wv4 = (H, _) => {
        Sf("caret", H, _);
        let q = _.loose ? Ck[ZZ.CARETLOOSE] : Ck[ZZ.CARET],
          $ = _.includePrerelease ? "-0" : "";
        return H.replace(q, (K, O, T, z, A) => {
          Sf("caret", H, K, O, T, z, A);
          let f;
          if (LZ(O)) f = "";
          else if (LZ(T)) f = `>=${O}.0.0${$} <${+O + 1}.0.0-0`;
          else if (LZ(z))
            if (O === "0") f = `>=${O}.${T}.0${$} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.0${$} <${+O + 1}.0.0-0`;
          else if (A)
            if ((Sf("replaceCaret pr", A), O === "0"))
              if (T === "0") f = `>=${O}.${T}.${z}-${A} <${O}.${T}.${+z + 1}-0`;
              else f = `>=${O}.${T}.${z}-${A} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.${z}-${A} <${+O + 1}.0.0-0`;
          else if ((Sf("no pr"), O === "0"))
            if (T === "0") f = `>=${O}.${T}.${z}${$} <${O}.${T}.${+z + 1}-0`;
            else f = `>=${O}.${T}.${z}${$} <${O}.${+T + 1}.0-0`;
          else f = `>=${O}.${T}.${z} <${+O + 1}.0.0-0`;
          return Sf("caret return", f), f;
        });
      },
      Yv4 = (H, _) => {
        return (
          Sf("replaceXRanges", H, _),
          H.split(/\s+/)
            .map((q) => Dv4(q, _))
            .join(" ")
        );
      },
      Dv4 = (H, _) => {
        H = H.trim();
        let q = _.loose ? Ck[ZZ.XRANGELOOSE] : Ck[ZZ.XRANGE];
        return H.replace(q, ($, K, O, T, z, A) => {
          Sf("xRange", H, $, K, O, T, z, A);
          let f = LZ(O),
            w = f || LZ(T),
            Y = w || LZ(z),
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
          return Sf("xRange return", $), $;
        });
      },
      jv4 = (H, _) => {
        return Sf("replaceStars", H, _), H.trim().replace(Ck[ZZ.STAR], "");
      },
      Mv4 = (H, _) => {
        return Sf("replaceGTE0", H, _), H.trim().replace(Ck[_.includePrerelease ? ZZ.GTE0PRE : ZZ.GTE0], "");
      },
      Jv4 = (H) => (_, q, $, K, O, T, z, A, f, w, Y, D) => {
        if (LZ($)) q = "";
        else if (LZ(K)) q = `>=${$}.0.0${H ? "-0" : ""}`;
        else if (LZ(O)) q = `>=${$}.${K}.0${H ? "-0" : ""}`;
        else if (T) q = `>=${q}`;
        else q = `>=${q}${H ? "-0" : ""}`;
        if (LZ(f)) A = "";
        else if (LZ(w)) A = `<${+f + 1}.0.0-0`;
        else if (LZ(Y)) A = `<${f}.${+w + 1}.0-0`;
        else if (D) A = `<=${f}.${w}.${Y}-${D}`;
        else if (H) A = `<${f}.${w}.${+Y + 1}-0`;
        else A = `<=${A}`;
        return `${q} ${A}`.trim();
      },
      Pv4 = (H, _, q) => {
        for (let $ = 0; $ < H.length; $++) if (!H[$].test(_)) return !1;
        if (_.prerelease.length && !q.includePrerelease) {
          for (let $ = 0; $ < H.length; $++) {
            if ((Sf(H[$].semver), H[$].semver === Fv6.ANY)) continue;
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

  var WI6 = d((MHO, k37) => {
    var Zr4 = /\s+/g;
    class SiH {
      constructor(H, _) {
        if (((_ = kr4(_)), H instanceof SiH))
          if (H.loose === !!_.loose && H.includePrerelease === !!_.includePrerelease) return H;
          else return new SiH(H.raw, _);
        if (H instanceof GI6) return (this.raw = H.value), (this.set = [[H]]), (this.formatted = void 0), this;
        if (
          ((this.options = _),
          (this.loose = !!_.loose),
          (this.includePrerelease = !!_.includePrerelease),
          (this.raw = H.trim().replace(Zr4, " ")),
          (this.set = this.raw
            .split("||")
            .map((q) => this.parseRange(q.trim()))
            .filter((q) => q.length)),
          !this.set.length)
        )
          throw TypeError(`Invalid SemVer Range: ${this.raw}`);
        if (this.set.length > 1) {
          let q = this.set[0];
          if (((this.set = this.set.filter(($) => !Z37($[0]))), this.set.length === 0)) this.set = [q];
          else if (this.set.length > 1) {
            for (let $ of this.set)
              if ($.length === 1 && Er4($[0])) {
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
        let q = ((this.options.includePrerelease && Vr4) | (this.options.loose && Sr4)) + ":" + H,
          $ = R37.get(q);
        if ($) return $;
        let K = this.options.loose,
          O = K ? dZ[RG.HYPHENRANGELOOSE] : dZ[RG.HYPHENRANGE];
        (H = H.replace(O, dr4(this.options.includePrerelease))),
          mf("hyphen replace", H),
          (H = H.replace(dZ[RG.COMPARATORTRIM], Nr4)),
          mf("comparator trim", H),
          (H = H.replace(dZ[RG.TILDETRIM], hr4)),
          mf("tilde trim", H),
          (H = H.replace(dZ[RG.CARETTRIM], yr4)),
          mf("caret trim", H);
        let T = H.split(" ")
          .map((w) => Cr4(w, this.options))
          .join(" ")
          .split(/\s+/)
          .map((w) => gr4(w, this.options));
        if (K)
          T = T.filter((w) => {
            return mf("loose invalid filter", w, this.options), !!w.match(dZ[RG.COMPARATORLOOSE]);
          });
        mf("range list", T);
        let z = new Map(),
          A = T.map((w) => new GI6(w, this.options));
        for (let w of A) {
          if (Z37(w)) return [w];
          z.set(w.value, w);
        }
        if (z.size > 1 && z.has("")) z.delete("");
        let f = [...z.values()];
        return R37.set(q, f), f;
      }
      intersects(H, _) {
        if (!(H instanceof SiH)) throw TypeError("a Range is required");
        return this.set.some((q) => {
          return (
            L37(q, _) &&
            H.set.some(($) => {
              return (
                L37($, _) &&
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
            H = new vr4(H, this.options);
          } catch (_) {
            return !1;
          }
        for (let _ = 0; _ < this.set.length; _++) if (cr4(this.set[_], H, this.options)) return !0;
        return !1;
      }
    }
    k37.exports = SiH;
    var Lr4 = H37(),
      R37 = new Lr4(),
      kr4 = rv_(),
      GI6 = G37(),
      mf = hiH(),
      vr4 = DZH(),
      { safeRe: dZ, t: RG, comparatorTrimReplace: Nr4, tildeTrimReplace: hr4, caretTrimReplace: yr4 } = yiH(),
      { FLAG_INCLUDE_PRERELEASE: Vr4, FLAG_LOOSE: Sr4 } = nv_(),
      Z37 = (H) => H.value === "<0.0.0-0",
      Er4 = (H) => H.value === "",
      L37 = (H, _) => {
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
      Cr4 = (H, _) => {
        return (
          (H = H.replace(dZ[RG.BUILD], "")),
          mf("comp", H, _),
          (H = ur4(H, _)),
          mf("caret", H),
          (H = br4(H, _)),
          mf("tildes", H),
          (H = mr4(H, _)),
          mf("xrange", H),
          (H = Br4(H, _)),
          mf("stars", H),
          H
        );
      },
      cZ = (H) => !H || H.toLowerCase() === "x" || H === "*",
      br4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => Ir4(q, _))
          .join(" ");
      },
      Ir4 = (H, _) => {
        let q = _.loose ? dZ[RG.TILDELOOSE] : dZ[RG.TILDE];
        return H.replace(q, ($, K, O, T, z) => {
          mf("tilde", H, $, K, O, T, z);
          let A;
          if (cZ(K)) A = "";
          else if (cZ(O)) A = `>=${K}.0.0 <${+K + 1}.0.0-0`;
          else if (cZ(T)) A = `>=${K}.${O}.0 <${K}.${+O + 1}.0-0`;
          else if (z) mf("replaceTilde pr", z), (A = `>=${K}.${O}.${T}-${z} <${K}.${+O + 1}.0-0`);
          else A = `>=${K}.${O}.${T} <${K}.${+O + 1}.0-0`;
          return mf("tilde return", A), A;
        });
      },
      ur4 = (H, _) => {
        return H.trim()
          .split(/\s+/)
          .map((q) => xr4(q, _))
          .join(" ");
      },
      xr4 = (H, _) => {
        mf("caret", H, _);
        let q = _.loose ? dZ[RG.CARETLOOSE] : dZ[RG.CARET],
          $ = _.includePrerelease ? "-0" : "";
        return H.replace(q, (K, O, T, z, A) => {
          mf("caret", H, K, O, T, z, A);
          let f;
          if (cZ(O)) f = "";
          else if (cZ(T)) f = `>=${O}.0.0${$} <${+O + 1}.0.0-0`;
          else if (cZ(z))
            if (O === "0") f = `>=${O}.${T}.0${$} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.0${$} <${+O + 1}.0.0-0`;
          else if (A)
            if ((mf("replaceCaret pr", A), O === "0"))
              if (T === "0") f = `>=${O}.${T}.${z}-${A} <${O}.${T}.${+z + 1}-0`;
              else f = `>=${O}.${T}.${z}-${A} <${O}.${+T + 1}.0-0`;
            else f = `>=${O}.${T}.${z}-${A} <${+O + 1}.0.0-0`;
          else if ((mf("no pr"), O === "0"))
            if (T === "0") f = `>=${O}.${T}.${z}${$} <${O}.${T}.${+z + 1}-0`;
            else f = `>=${O}.${T}.${z}${$} <${O}.${+T + 1}.0-0`;
          else f = `>=${O}.${T}.${z} <${+O + 1}.0.0-0`;
          return mf("caret return", f), f;
        });
      },
      mr4 = (H, _) => {
        return (
          mf("replaceXRanges", H, _),
          H.split(/\s+/)
            .map((q) => pr4(q, _))
            .join(" ")
        );
      },
      pr4 = (H, _) => {
        H = H.trim();
        let q = _.loose ? dZ[RG.XRANGELOOSE] : dZ[RG.XRANGE];
        return H.replace(q, ($, K, O, T, z, A) => {
          mf("xRange", H, $, K, O, T, z, A);
          let f = cZ(O),
            w = f || cZ(T),
            Y = w || cZ(z),
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
          return mf("xRange return", $), $;
        });
      },
      Br4 = (H, _) => {
        return mf("replaceStars", H, _), H.trim().replace(dZ[RG.STAR], "");
      },
      gr4 = (H, _) => {
        return mf("replaceGTE0", H, _), H.trim().replace(dZ[_.includePrerelease ? RG.GTE0PRE : RG.GTE0], "");
      },
      dr4 = (H) => (_, q, $, K, O, T, z, A, f, w, Y, D) => {
        if (cZ($)) q = "";
        else if (cZ(K)) q = `>=${$}.0.0${H ? "-0" : ""}`;
        else if (cZ(O)) q = `>=${$}.${K}.0${H ? "-0" : ""}`;
        else if (T) q = `>=${q}`;
        else q = `>=${q}${H ? "-0" : ""}`;
        if (cZ(f)) A = "";
        else if (cZ(w)) A = `<${+f + 1}.0.0-0`;
        else if (cZ(Y)) A = `<${f}.${+w + 1}.0-0`;
        else if (D) A = `<=${f}.${w}.${Y}-${D}`;
        else if (H) A = `<${f}.${w}.${+Y + 1}-0`;
        else A = `<=${A}`;
        return `${q} ${A}`.trim();
      },
      cr4 = (H, _, q) => {
        for (let $ = 0; $ < H.length; $++) if (!H[$].test(_)) return !1;
        if (_.prerelease.length && !q.includePrerelease) {
          for (let $ = 0; $ < H.length; $++) {
            if ((mf(H[$].semver), H[$].semver === GI6.ANY)) continue;
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

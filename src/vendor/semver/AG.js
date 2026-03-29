  var AG = d((TC3, LFq) => {
    var VG_ = WUH(),
      { MAX_LENGTH: ZFq, MAX_SAFE_INTEGER: SG_ } = XUH(),
      { safeRe: EG_, t: CG_ } = c0H(),
      qk4 = yG_(),
      { compareIdentifiers: F0H } = Bv6();
    class gu {
      constructor(H, _) {
        if (((_ = qk4(_)), H instanceof gu))
          if (H.loose === !!_.loose && H.includePrerelease === !!_.includePrerelease) return H;
          else H = H.version;
        else if (typeof H !== "string") throw TypeError(`Invalid version. Must be a string. Got type "${typeof H}".`);
        if (H.length > ZFq) throw TypeError(`version is longer than ${ZFq} characters`);
        VG_("SemVer", H, _),
          (this.options = _),
          (this.loose = !!_.loose),
          (this.includePrerelease = !!_.includePrerelease);
        let q = H.trim().match(_.loose ? EG_[CG_.LOOSE] : EG_[CG_.FULL]);
        if (!q) throw TypeError(`Invalid Version: ${H}`);
        if (
          ((this.raw = H),
          (this.major = +q[1]),
          (this.minor = +q[2]),
          (this.patch = +q[3]),
          this.major > SG_ || this.major < 0)
        )
          throw TypeError("Invalid major version");
        if (this.minor > SG_ || this.minor < 0) throw TypeError("Invalid minor version");
        if (this.patch > SG_ || this.patch < 0) throw TypeError("Invalid patch version");
        if (!q[4]) this.prerelease = [];
        else
          this.prerelease = q[4].split(".").map(($) => {
            if (/^[0-9]+$/.test($)) {
              let K = +$;
              if (K >= 0 && K < SG_) return K;
            }
            return $;
          });
        (this.build = q[5] ? q[5].split(".") : []), this.format();
      }
      format() {
        if (((this.version = `${this.major}.${this.minor}.${this.patch}`), this.prerelease.length))
          this.version += `-${this.prerelease.join(".")}`;
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(H) {
        if ((VG_("SemVer.compare", this.version, this.options, H), !(H instanceof gu))) {
          if (typeof H === "string" && H === this.version) return 0;
          H = new gu(H, this.options);
        }
        if (H.version === this.version) return 0;
        return this.compareMain(H) || this.comparePre(H);
      }
      compareMain(H) {
        if (!(H instanceof gu)) H = new gu(H, this.options);
        return F0H(this.major, H.major) || F0H(this.minor, H.minor) || F0H(this.patch, H.patch);
      }
      comparePre(H) {
        if (!(H instanceof gu)) H = new gu(H, this.options);
        if (this.prerelease.length && !H.prerelease.length) return -1;
        else if (!this.prerelease.length && H.prerelease.length) return 1;
        else if (!this.prerelease.length && !H.prerelease.length) return 0;
        let _ = 0;
        do {
          let q = this.prerelease[_],
            $ = H.prerelease[_];
          if ((VG_("prerelease compare", _, q, $), q === void 0 && $ === void 0)) return 0;
          else if ($ === void 0) return 1;
          else if (q === void 0) return -1;
          else if (q === $) continue;
          else return F0H(q, $);
        } while (++_);
      }
      compareBuild(H) {
        if (!(H instanceof gu)) H = new gu(H, this.options);
        let _ = 0;
        do {
          let q = this.build[_],
            $ = H.build[_];
          if ((VG_("build compare", _, q, $), q === void 0 && $ === void 0)) return 0;
          else if ($ === void 0) return 1;
          else if (q === void 0) return -1;
          else if (q === $) continue;
          else return F0H(q, $);
        } while (++_);
      }
      inc(H, _, q) {
        if (H.startsWith("pre")) {
          if (!_ && q === !1) throw Error("invalid increment argument: identifier is empty");
          if (_) {
            let $ = `-${_}`.match(this.options.loose ? EG_[CG_.PRERELEASELOOSE] : EG_[CG_.PRERELEASE]);
            if (!$ || $[1] !== _) throw Error(`invalid identifier: ${_}`);
          }
        }
        switch (H) {
          case "premajor":
            (this.prerelease.length = 0), (this.patch = 0), (this.minor = 0), this.major++, this.inc("pre", _, q);
            break;
          case "preminor":
            (this.prerelease.length = 0), (this.patch = 0), this.minor++, this.inc("pre", _, q);
            break;
          case "prepatch":
            (this.prerelease.length = 0), this.inc("patch", _, q), this.inc("pre", _, q);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) this.inc("patch", _, q);
            this.inc("pre", _, q);
            break;
          case "release":
            if (this.prerelease.length === 0) throw Error(`version ${this.raw} is not a prerelease`);
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) this.major++;
            (this.minor = 0), (this.patch = 0), (this.prerelease = []);
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) this.minor++;
            (this.patch = 0), (this.prerelease = []);
            break;
          case "patch":
            if (this.prerelease.length === 0) this.patch++;
            this.prerelease = [];
            break;
          case "pre": {
            let $ = Number(q) ? 1 : 0;
            if (this.prerelease.length === 0) this.prerelease = [$];
            else {
              let K = this.prerelease.length;
              while (--K >= 0) if (typeof this.prerelease[K] === "number") this.prerelease[K]++, (K = -2);
              if (K === -1) {
                if (_ === this.prerelease.join(".") && q === !1)
                  throw Error("invalid increment argument: identifier already exists");
                this.prerelease.push($);
              }
            }
            if (_) {
              let K = [_, $];
              if (q === !1) K = [_];
              if (F0H(this.prerelease[0], _) === 0) {
                if (isNaN(this.prerelease[1])) this.prerelease = K;
              } else this.prerelease = K;
            }
            break;
          }
          default:
            throw Error(`invalid increment argument: ${H}`);
        }
        if (((this.raw = this.format()), this.build.length)) this.raw += `+${this.build.join(".")}`;
        return this;
      }
    }
    LFq.exports = gu;
  });

  var GP = d((Lu_) => {
    Object.defineProperty(Lu_, "__esModule", { value: !0 });
    Lu_.Metadata = void 0;
    var XL1 = DA(),
      WL1 = mK(),
      GL1 = Gu_(),
      RL1 = /^[:0-9a-z_.-]+$/,
      ZL1 = /^[ -~]*$/;
    function LL1(H) {
      return RL1.test(H);
    }
    function kL1(H) {
      return ZL1.test(H);
    }
    function QB7(H) {
      return H.endsWith("-bin");
    }
    function vL1(H) {
      return !H.startsWith("grpc-");
    }
    function Ru_(H) {
      return H.toLowerCase();
    }
    function UB7(H, _) {
      if (!LL1(H)) throw Error('Metadata key "' + H + '" contains illegal characters');
      if (_ !== null && _ !== void 0)
        if (QB7(H)) {
          if (!Buffer.isBuffer(_)) throw Error("keys that end with '-bin' must have Buffer values");
        } else {
          if (Buffer.isBuffer(_)) throw Error("keys that don't end with '-bin' must have String values");
          if (!kL1(_)) throw Error('Metadata string value "' + _ + '" contains illegal characters');
        }
    }
    class Zu_ {
      constructor(H = {}) {
        (this.internalRepr = new Map()), (this.opaqueData = new Map()), (this.options = H);
      }
      set(H, _) {
        (H = Ru_(H)), UB7(H, _), this.internalRepr.set(H, [_]);
      }
      add(H, _) {
        (H = Ru_(H)), UB7(H, _);
        let q = this.internalRepr.get(H);
        if (q === void 0) this.internalRepr.set(H, [_]);
        else q.push(_);
      }
      remove(H) {
        (H = Ru_(H)), this.internalRepr.delete(H);
      }
      get(H) {
        return (H = Ru_(H)), this.internalRepr.get(H) || [];
      }
      getMap() {
        let H = {};
        for (let [_, q] of this.internalRepr)
          if (q.length > 0) {
            let $ = q[0];
            H[_] = Buffer.isBuffer($) ? Buffer.from($) : $;
          }
        return H;
      }
      clone() {
        let H = new Zu_(this.options),
          _ = H.internalRepr;
        for (let [q, $] of this.internalRepr) {
          let K = $.map((O) => {
            if (Buffer.isBuffer(O)) return Buffer.from(O);
            else return O;
          });
          _.set(q, K);
        }
        return H;
      }
      merge(H) {
        for (let [_, q] of H.internalRepr) {
          let $ = (this.internalRepr.get(_) || []).concat(q);
          this.internalRepr.set(_, $);
        }
      }
      setOptions(H) {
        this.options = H;
      }
      getOptions() {
        return this.options;
      }
      toHttp2Headers() {
        let H = {};
        for (let [_, q] of this.internalRepr) {
          if (_.startsWith(":")) continue;
          H[_] = q.map(NL1);
        }
        return H;
      }
      toJSON() {
        let H = {};
        for (let [_, q] of this.internalRepr) H[_] = q;
        return H;
      }
      setOpaque(H, _) {
        this.opaqueData.set(H, _);
      }
      getOpaque(H) {
        return this.opaqueData.get(H);
      }
      static fromHttp2Headers(H) {
        let _ = new Zu_();
        for (let q of Object.keys(H)) {
          if (q.charAt(0) === ":") continue;
          let $ = H[q];
          try {
            if (QB7(q)) {
              if (Array.isArray($))
                $.forEach((K) => {
                  _.add(q, Buffer.from(K, "base64"));
                });
              else if ($ !== void 0)
                if (vL1(q))
                  $.split(",").forEach((K) => {
                    _.add(q, Buffer.from(K.trim(), "base64"));
                  });
                else _.add(q, Buffer.from($, "base64"));
            } else if (Array.isArray($))
              $.forEach((K) => {
                _.add(q, K);
              });
            else if ($ !== void 0) _.add(q, $);
          } catch (K) {
            let O = `Failed to add metadata entry ${q}: ${$}. ${(0, GL1.getErrorMessage)(K)}. For more information see https://github.com/grpc/grpc-node/issues/1173`;
            (0, XL1.log)(WL1.LogVerbosity.ERROR, O);
          }
        }
        return _;
      }
    }
    Lu_.Metadata = Zu_;
    var NL1 = (H) => {
      return Buffer.isBuffer(H) ? H.toString("base64") : H;
    };
  });

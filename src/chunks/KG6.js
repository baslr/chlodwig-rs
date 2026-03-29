  var KG6 = d((qg) => {
    Object.defineProperty(qg, "__esModule", { value: !0 });
    qg.defaultResource = qg.emptyResource = qg.resourceFromDetectedResource = qg.resourceFromAttributes = void 0;
    var edH = l9(),
      qG6 = P3(),
      H3H = a5H(),
      mw4 = _G6(),
      tdH = zbq();
    class HcH {
      _rawAttributes;
      _asyncAttributesPending = !1;
      _schemaUrl;
      _memoizedAttributes;
      static FromAttributeList(H, _) {
        let q = new HcH({}, _);
        return (
          (q._rawAttributes = Abq(H)),
          (q._asyncAttributesPending = H.filter(([$, K]) => (0, tdH.isPromiseLike)(K)).length > 0),
          q
        );
      }
      constructor(H, _) {
        let q = H.attributes ?? {};
        (this._rawAttributes = Object.entries(q).map(([$, K]) => {
          if ((0, tdH.isPromiseLike)(K)) this._asyncAttributesPending = !0;
          return [$, K];
        })),
          (this._rawAttributes = Abq(this._rawAttributes)),
          (this._schemaUrl = dw4(_?.schemaUrl));
      }
      get asyncAttributesPending() {
        return this._asyncAttributesPending;
      }
      async waitForAsyncAttributes() {
        if (!this.asyncAttributesPending) return;
        for (let H = 0; H < this._rawAttributes.length; H++) {
          let [_, q] = this._rawAttributes[H];
          this._rawAttributes[H] = [_, (0, tdH.isPromiseLike)(q) ? await q : q];
        }
        this._asyncAttributesPending = !1;
      }
      get attributes() {
        if (this.asyncAttributesPending)
          edH.diag.error("Accessing resource attributes before async attributes settled");
        if (this._memoizedAttributes) return this._memoizedAttributes;
        let H = {};
        for (let [_, q] of this._rawAttributes) {
          if ((0, tdH.isPromiseLike)(q)) {
            edH.diag.debug(`Unsettled resource attribute ${_} skipped`);
            continue;
          }
          if (q != null) H[_] ??= q;
        }
        if (!this._asyncAttributesPending) this._memoizedAttributes = H;
        return H;
      }
      getRawAttributes() {
        return this._rawAttributes;
      }
      get schemaUrl() {
        return this._schemaUrl;
      }
      merge(H) {
        if (H == null) return this;
        let _ = cw4(this, H),
          q = _ ? { schemaUrl: _ } : void 0;
        return HcH.FromAttributeList([...H.getRawAttributes(), ...this.getRawAttributes()], q);
      }
    }
    function $G6(H, _) {
      return HcH.FromAttributeList(Object.entries(H), _);
    }
    qg.resourceFromAttributes = $G6;
    function pw4(H, _) {
      return new HcH(H, _);
    }
    qg.resourceFromDetectedResource = pw4;
    function Bw4() {
      return $G6({});
    }
    qg.emptyResource = Bw4;
    function gw4() {
      return $G6({
        [H3H.ATTR_SERVICE_NAME]: (0, mw4.defaultServiceName)(),
        [H3H.ATTR_TELEMETRY_SDK_LANGUAGE]: qG6.SDK_INFO[H3H.ATTR_TELEMETRY_SDK_LANGUAGE],
        [H3H.ATTR_TELEMETRY_SDK_NAME]: qG6.SDK_INFO[H3H.ATTR_TELEMETRY_SDK_NAME],
        [H3H.ATTR_TELEMETRY_SDK_VERSION]: qG6.SDK_INFO[H3H.ATTR_TELEMETRY_SDK_VERSION],
      });
    }
    qg.defaultResource = gw4;
    function Abq(H) {
      return H.map(([_, q]) => {
        if ((0, tdH.isPromiseLike)(q))
          return [
            _,
            q.catch(($) => {
              edH.diag.debug("promise rejection for resource attribute: %s - %s", _, $);
              return;
            }),
          ];
        return [_, q];
      });
    }
    function dw4(H) {
      if (typeof H === "string" || H === void 0) return H;
      edH.diag.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", H);
      return;
    }
    function cw4(H, _) {
      let q = H?.schemaUrl,
        $ = _?.schemaUrl,
        K = q === void 0 || q === "",
        O = $ === void 0 || $ === "";
      if (K) return $;
      if (O) return q;
      if (q === $) return q;
      edH.diag.warn(
        'Schema URL merge conflict: old resource has "%s", updating resource has "%s". Resulting resource will have undefined Schema URL.',
        q,
        $,
      );
      return;
    }
  });

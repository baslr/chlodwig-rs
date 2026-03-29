  var Uv = d(($m) => {
    Object.defineProperty($m, "__esModule", { value: !0 });
    $m.EndpointMap = void 0;
    $m.isTcpSubchannelAddress = KsH;
    $m.subchannelAddressEqual = Bu_;
    $m.subchannelAddressToString = fg7;
    $m.stringToSubchannelAddress = mk1;
    $m.endpointEqual = pk1;
    $m.endpointToString = Bk1;
    $m.endpointHasAddress = wg7;
    var Ag7 = require("net");
    function KsH(H) {
      return "port" in H;
    }
    function Bu_(H, _) {
      if (!H && !_) return !0;
      if (!H || !_) return !1;
      if (KsH(H)) return KsH(_) && H.host === _.host && H.port === _.port;
      else return !KsH(_) && H.path === _.path;
    }
    function fg7(H) {
      if (KsH(H))
        if ((0, Ag7.isIPv6)(H.host)) return "[" + H.host + "]:" + H.port;
        else return H.host + ":" + H.port;
      else return H.path;
    }
    var xk1 = 443;
    function mk1(H, _) {
      if ((0, Ag7.isIP)(H)) return { host: H, port: _ !== null && _ !== void 0 ? _ : xk1 };
      else return { path: H };
    }
    function pk1(H, _) {
      if (H.addresses.length !== _.addresses.length) return !1;
      for (let q = 0; q < H.addresses.length; q++) if (!Bu_(H.addresses[q], _.addresses[q])) return !1;
      return !0;
    }
    function Bk1(H) {
      return "[" + H.addresses.map(fg7).join(", ") + "]";
    }
    function wg7(H, _) {
      for (let q of H.addresses) if (Bu_(q, _)) return !0;
      return !1;
    }
    function $sH(H, _) {
      if (H.addresses.length !== _.addresses.length) return !1;
      for (let q of H.addresses) {
        let $ = !1;
        for (let K of _.addresses)
          if (Bu_(q, K)) {
            $ = !0;
            break;
          }
        if (!$) return !1;
      }
      return !0;
    }
    class Yg7 {
      constructor() {
        this.map = new Set();
      }
      get size() {
        return this.map.size;
      }
      getForSubchannelAddress(H) {
        for (let _ of this.map) if (wg7(_.key, H)) return _.value;
        return;
      }
      deleteMissing(H) {
        let _ = [];
        for (let q of this.map) {
          let $ = !1;
          for (let K of H) if ($sH(K, q.key)) $ = !0;
          if (!$) _.push(q.value), this.map.delete(q);
        }
        return _;
      }
      get(H) {
        for (let _ of this.map) if ($sH(H, _.key)) return _.value;
        return;
      }
      set(H, _) {
        for (let q of this.map)
          if ($sH(H, q.key)) {
            q.value = _;
            return;
          }
        this.map.add({ key: H, value: _ });
      }
      delete(H) {
        for (let _ of this.map)
          if ($sH(H, _.key)) {
            this.map.delete(_);
            return;
          }
      }
      has(H) {
        for (let _ of this.map) if ($sH(H, _.key)) return !0;
        return !1;
      }
      clear() {
        this.map.clear();
      }
      *keys() {
        for (let H of this.map) yield H.key;
      }
      *values() {
        for (let H of this.map) yield H.value;
      }
      *entries() {
        for (let H of this.map) yield [H.key, H.value];
      }
    }
    $m.EndpointMap = Yg7;
  });

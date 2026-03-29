  var zFH = d((Vk) => {
    Object.defineProperty(Vk, "__esModule", { value: !0 });
    Vk.getSchemaRefs = Vk.resolveUrl = Vk.normalizeId = Vk._getFullPath = Vk.getFullPath = Vk.inlineRef = void 0;
    var pJ4 = W3(),
      BJ4 = WZ6(),
      gJ4 = axq(),
      dJ4 = new Set([
        "type",
        "format",
        "pattern",
        "maxLength",
        "minLength",
        "maxProperties",
        "minProperties",
        "maxItems",
        "minItems",
        "maximum",
        "minimum",
        "uniqueItems",
        "multipleOf",
        "required",
        "enum",
        "const",
      ]);
    function cJ4(H, _ = !0) {
      if (typeof H == "boolean") return !0;
      if (_ === !0) return !GZ6(H);
      if (!_) return !1;
      return sxq(H) <= _;
    }
    Vk.inlineRef = cJ4;
    var FJ4 = new Set(["$ref", "$recursiveRef", "$recursiveAnchor", "$dynamicRef", "$dynamicAnchor"]);
    function GZ6(H) {
      for (let _ in H) {
        if (FJ4.has(_)) return !0;
        let q = H[_];
        if (Array.isArray(q) && q.some(GZ6)) return !0;
        if (typeof q == "object" && GZ6(q)) return !0;
      }
      return !1;
    }
    function sxq(H) {
      let _ = 0;
      for (let q in H) {
        if (q === "$ref") return 1 / 0;
        if ((_++, dJ4.has(q))) continue;
        if (typeof H[q] == "object") (0, pJ4.eachItem)(H[q], ($) => (_ += sxq($)));
        if (_ === 1 / 0) return 1 / 0;
      }
      return _;
    }
    function txq(H, _ = "", q) {
      if (q !== !1) _ = O0H(_);
      let $ = H.parse(_);
      return exq(H, $);
    }
    Vk.getFullPath = txq;
    function exq(H, _) {
      return H.serialize(_).split("#")[0] + "#";
    }
    Vk._getFullPath = exq;
    var UJ4 = /#\/?$/;
    function O0H(H) {
      return H ? H.replace(UJ4, "") : "";
    }
    Vk.normalizeId = O0H;
    function QJ4(H, _, q) {
      return (q = O0H(q)), H.resolve(_, q);
    }
    Vk.resolveUrl = QJ4;
    var lJ4 = /^[a-z_][-a-z0-9._]*$/i;
    function iJ4(H, _) {
      if (typeof H == "boolean") return {};
      let { schemaId: q, uriResolver: $ } = this.opts,
        K = O0H(H[q] || _),
        O = { "": K },
        T = txq($, K, !1),
        z = {},
        A = new Set();
      return (
        gJ4(H, { allKeys: !0 }, (Y, D, j, M) => {
          if (M === void 0) return;
          let J = T + D,
            P = O[M];
          if (typeof Y[q] == "string") P = X.call(this, Y[q]);
          R.call(this, Y.$anchor), R.call(this, Y.$dynamicAnchor), (O[D] = P);
          function X(W) {
            let Z = this.opts.uriResolver.resolve;
            if (((W = O0H(P ? Z(P, W) : W)), A.has(W))) throw w(W);
            A.add(W);
            let k = this.refs[W];
            if (typeof k == "string") k = this.refs[k];
            if (typeof k == "object") f(Y, k.schema, W);
            else if (W !== O0H(J))
              if (W[0] === "#") f(Y, z[W], W), (z[W] = Y);
              else this.refs[W] = J;
            return W;
          }
          function R(W) {
            if (typeof W == "string") {
              if (!lJ4.test(W)) throw Error(`invalid anchor "${W}"`);
              X.call(this, `#${W}`);
            }
          }
        }),
        z
      );
      function f(Y, D, j) {
        if (D !== void 0 && !BJ4(Y, D)) throw w(j);
      }
      function w(Y) {
        return Error(`reference "${Y}" resolves to more than one schema`);
      }
    }
    Vk.getSchemaRefs = iJ4;
  });

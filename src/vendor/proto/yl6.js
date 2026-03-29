  var yl6 = d((HJ) => {
    Object.defineProperty(HJ, "__esModule", { value: !0 });
    HJ.loadFileDescriptorSetFromObject =
      HJ.loadFileDescriptorSetFromBuffer =
      HJ.fromJSON =
      HJ.loadSync =
      HJ.load =
      HJ.IdempotencyLevel =
      HJ.isAnyExtension =
      HJ.Long =
        void 0;
    var kh1 = zd7(),
      Fc = Yx_(),
      Nl6 = Pc7(),
      hl6 = kc7(),
      vh1 = vc7();
    HJ.Long = vh1;
    function Nh1(H) {
      return "@type" in H && typeof H["@type"] === "string";
    }
    HJ.isAnyExtension = Nh1;
    var Nc7;
    (function (H) {
      (H.IDEMPOTENCY_UNKNOWN = "IDEMPOTENCY_UNKNOWN"),
        (H.NO_SIDE_EFFECTS = "NO_SIDE_EFFECTS"),
        (H.IDEMPOTENT = "IDEMPOTENT");
    })((Nc7 = HJ.IdempotencyLevel || (HJ.IdempotencyLevel = {})));
    var hc7 = { longs: String, enums: String, bytes: String, defaults: !0, oneofs: !0, json: !0 };
    function hh1(H, _) {
      if (H === "") return _;
      else return H + "." + _;
    }
    function yh1(H) {
      return H instanceof Fc.Service || H instanceof Fc.Type || H instanceof Fc.Enum;
    }
    function Vh1(H) {
      return H instanceof Fc.Namespace || H instanceof Fc.Root;
    }
    function yc7(H, _) {
      let q = hh1(_, H.name);
      if (yh1(H)) return [[q, H]];
      else if (Vh1(H) && typeof H.nested < "u")
        return Object.keys(H.nested)
          .map(($) => {
            return yc7(H.nested[$], q);
          })
          .reduce(($, K) => $.concat(K), []);
      return [];
    }
    function Ll6(H, _) {
      return function ($) {
        return H.toObject(H.decode($), _);
      };
    }
    function kl6(H) {
      return function (q) {
        if (Array.isArray(q))
          throw Error(`Failed to serialize message: expected object with ${H.name} structure, got array instead`);
        let $ = H.fromObject(q);
        return H.encode($).finish();
      };
    }
    function Sh1(H) {
      return (H || []).reduce(
        (_, q) => {
          for (let [$, K] of Object.entries(q))
            switch ($) {
              case "uninterpreted_option":
                _.uninterpreted_option.push(q.uninterpreted_option);
                break;
              default:
                _[$] = K;
            }
          return _;
        },
        { deprecated: !1, idempotency_level: Nc7.IDEMPOTENCY_UNKNOWN, uninterpreted_option: [] },
      );
    }
    function Eh1(H, _, q, $) {
      let { resolvedRequestType: K, resolvedResponseType: O } = H;
      return {
        path: "/" + _ + "/" + H.name,
        requestStream: !!H.requestStream,
        responseStream: !!H.responseStream,
        requestSerialize: kl6(K),
        requestDeserialize: Ll6(K, q),
        responseSerialize: kl6(O),
        responseDeserialize: Ll6(O, q),
        originalName: kh1(H.name),
        requestType: vl6(K, q, $),
        responseType: vl6(O, q, $),
        options: Sh1(H.parsedOptions),
      };
    }
    function Ch1(H, _, q, $) {
      let K = {};
      for (let O of H.methodsArray) K[O.name] = Eh1(O, _, q, $);
      return K;
    }
    function vl6(H, _, q) {
      let $ = H.toDescriptor("proto3");
      return {
        format: "Protocol Buffer 3 DescriptorProto",
        type: $.$type.toObject($, hc7),
        fileDescriptorProtos: q,
        serialize: kl6(H),
        deserialize: Ll6(H, _),
      };
    }
    function bh1(H, _) {
      let q = H.toDescriptor("proto3");
      return {
        format: "Protocol Buffer 3 EnumDescriptorProto",
        type: q.$type.toObject(q, hc7),
        fileDescriptorProtos: _,
      };
    }
    function Ih1(H, _, q, $) {
      if (H instanceof Fc.Service) return Ch1(H, _, q, $);
      else if (H instanceof Fc.Type) return vl6(H, q, $);
      else if (H instanceof Fc.Enum) return bh1(H, $);
      else throw Error("Type mismatch in reflection object handling");
    }
    function Mx_(H, _) {
      let q = {};
      H.resolveAll();
      let K = H.toDescriptor("proto3").file.map((O) => Buffer.from(Nl6.FileDescriptorProto.encode(O).finish()));
      for (let [O, T] of yc7(H, "")) q[O] = Ih1(T, O, _, K);
      return q;
    }
    function Vc7(H, _) {
      _ = _ || {};
      let q = Fc.Root.fromDescriptor(H);
      return q.resolveAll(), Mx_(q, _);
    }
    function uh1(H, _) {
      return (0, hl6.loadProtosWithOptions)(H, _).then((q) => {
        return Mx_(q, _);
      });
    }
    HJ.load = uh1;
    function xh1(H, _) {
      let q = (0, hl6.loadProtosWithOptionsSync)(H, _);
      return Mx_(q, _);
    }
    HJ.loadSync = xh1;
    function mh1(H, _) {
      _ = _ || {};
      let q = Fc.Root.fromJSON(H);
      return q.resolveAll(), Mx_(q, _);
    }
    HJ.fromJSON = mh1;
    function ph1(H, _) {
      let q = Nl6.FileDescriptorSet.decode(H);
      return Vc7(q, _);
    }
    HJ.loadFileDescriptorSetFromBuffer = ph1;
    function Bh1(H, _) {
      let q = Nl6.FileDescriptorSet.fromObject(H);
      return Vc7(q, _);
    }
    HJ.loadFileDescriptorSetFromObject = Bh1;
    (0, hl6.addCommonProtos)();
  });

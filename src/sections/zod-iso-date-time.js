    gR();
    gR();
    M76();
    DK_();
    v76();
    (hK = G6("ZodType", (H, _) => {
      return (
        V4.init(H, _),
        (H.def = _),
        Object.defineProperty(H, "_def", { value: _ }),
        (H.check = (...q) => {
          return H.clone({
            ..._,
            checks: [
              ...(_.checks ?? []),
              ...q.map(($) =>
                typeof $ === "function" ? { _zod: { check: $, def: { check: "custom" }, onattach: [] } } : $,
              ),
            ],
          });
        }),
        (H.clone = (q, $) => Yh(H, q, $)),
        (H.brand = () => H),
        (H.register = (q, $) => {
          return q.add(H, $), H;
        }),
        (H.parse = (q, $) => R76(H, q, $, { callee: H.parse })),
        (H.safeParse = (q, $) => L76(H, q, $)),
        (H.parseAsync = async (q, $) => Z76(H, q, $, { callee: H.parseAsync })),
        (H.safeParseAsync = async (q, $) => k76(H, q, $)),
        (H.spa = H.safeParseAsync),
        (H.refine = (q, $) => H.check(uP8(q, $))),
        (H.superRefine = (q) => H.check(xP8(q))),
        (H.overwrite = (q) => H.check(jQ(q))),
        (H.optional = () => jf(H)),
        (H.nullable = () => JK_(H)),
        (H.nullish = () => jf(JK_(H))),
        (H.nonoptional = (q) => LP8(H, q)),
        (H.array = () => gq(H)),
        (H.or = (q) => xT([H, q])),
        (H.and = (q) => DuH(H, q)),
        (H.transform = (q) => PK_(H, a76(q))),
        (H.default = (q) => GP8(H, q)),
        (H.prefault = (q) => ZP8(H, q)),
        (H.catch = (q) => NP8(H, q)),
        (H.pipe = (q) => PK_(H, q)),
        (H.readonly = () => VP8(H)),
        (H.describe = (q) => {
          let $ = H.clone();
          return lp.add($, { description: q }), $;
        }),
        Object.defineProperty(H, "description", {
          get() {
            return lp.get(H)?.description;
          },
          configurable: !0,
        }),
        (H.meta = (...q) => {
          if (q.length === 0) return lp.get(H);
          let $ = H.clone();
          return lp.add($, q[0]), $;
        }),
        (H.isOptional = () => H.safeParse(void 0).success),
        (H.isNullable = () => H.safeParse(null).success),
        H
      );
    })),
      (h76 = G6("_ZodString", (H, _) => {
        o4H.init(H, _), hK.init(H, _);
        let q = H._zod.bag;
        (H.format = q.format ?? null),
          (H.minLength = q.minimum ?? null),
          (H.maxLength = q.maximum ?? null),
          (H.regex = (...$) => H.check(rIH(...$))),
          (H.includes = (...$) => H.check(sIH(...$))),
          (H.startsWith = (...$) => H.check(tIH(...$))),
          (H.endsWith = (...$) => H.check(eIH(...$))),
          (H.min = (...$) => H.check(Xt(...$))),
          (H.max = (...$) => H.check(IjH(...$))),
          (H.length = (...$) => H.check(ujH(...$))),
          (H.nonempty = (...$) => H.check(Xt(1, ...$))),
          (H.lowercase = ($) => H.check(oIH($))),
          (H.uppercase = ($) => H.check(aIH($))),
          (H.trim = () => H.check(quH())),
          (H.normalize = (...$) => H.check(_uH(...$))),
          (H.toLowerCase = () => H.check($uH())),
          (H.toUpperCase = () => H.check(KuH()));
      })),
      (zuH = G6("ZodString", (H, _) => {
        o4H.init(H, _),
          h76.init(H, _),
          (H.email = (q) => H.check(d1_(y76, q))),
          (H.url = (q) => H.check(l1_(V76, q))),
          (H.jwt = (q) => H.check(TK_(Q76, q))),
          (H.emoji = (q) => H.check(i1_(E76, q))),
          (H.guid = (q) => H.check(iIH(MK_, q))),
          (H.uuid = (q) => H.check(c1_(JQ, q))),
          (H.uuidv4 = (q) => H.check(F1_(JQ, q))),
          (H.uuidv6 = (q) => H.check(U1_(JQ, q))),
          (H.uuidv7 = (q) => H.check(Q1_(JQ, q))),
          (H.nanoid = (q) => H.check(n1_(C76, q))),
          (H.guid = (q) => H.check(iIH(MK_, q))),
          (H.cuid = (q) => H.check(r1_(b76, q))),
          (H.cuid2 = (q) => H.check(o1_(I76, q))),
          (H.ulid = (q) => H.check(a1_(u76, q))),
          (H.base64 = (q) => H.check($K_(c76, q))),
          (H.base64url = (q) => H.check(KK_(F76, q))),
          (H.xid = (q) => H.check(s1_(x76, q))),
          (H.ksuid = (q) => H.check(t1_(m76, q))),
          (H.ipv4 = (q) => H.check(e1_(p76, q))),
          (H.ipv6 = (q) => H.check(HK_(B76, q))),
          (H.cidrv4 = (q) => H.check(_K_(g76, q))),
          (H.cidrv6 = (q) => H.check(qK_(d76, q))),
          (H.e164 = (q) => H.check(OK_(U76, q))),
          (H.datetime = (q) => H.check(J76(q))),
          (H.date = (q) => H.check(P76(q))),
          (H.time = (q) => H.check(X76(q))),
          (H.duration = (q) => H.check(W76(q)));
      }));
    (bA = G6("ZodStringFormat", (H, _) => {
      xz.init(H, _), h76.init(H, _);
    })),
      (y76 = G6("ZodEmail", (H, _) => {
        p66.init(H, _), bA.init(H, _);
      }));
    MK_ = G6("ZodGUID", (H, _) => {
      x66.init(H, _), bA.init(H, _);
    });
    JQ = G6("ZodUUID", (H, _) => {
      m66.init(H, _), bA.init(H, _);
    });
    V76 = G6("ZodURL", (H, _) => {
      B66.init(H, _), bA.init(H, _);
    });
    E76 = G6("ZodEmoji", (H, _) => {
      g66.init(H, _), bA.init(H, _);
    });
    C76 = G6("ZodNanoID", (H, _) => {
      d66.init(H, _), bA.init(H, _);
    });
    b76 = G6("ZodCUID", (H, _) => {
      c66.init(H, _), bA.init(H, _);
    });
    I76 = G6("ZodCUID2", (H, _) => {
      F66.init(H, _), bA.init(H, _);
    });
    u76 = G6("ZodULID", (H, _) => {
      U66.init(H, _), bA.init(H, _);
    });
    x76 = G6("ZodXID", (H, _) => {
      Q66.init(H, _), bA.init(H, _);
    });
    m76 = G6("ZodKSUID", (H, _) => {
      l66.init(H, _), bA.init(H, _);
    });
    p76 = G6("ZodIPv4", (H, _) => {
      a66.init(H, _), bA.init(H, _);
    });
    B76 = G6("ZodIPv6", (H, _) => {
      s66.init(H, _), bA.init(H, _);
    });
    g76 = G6("ZodCIDRv4", (H, _) => {
      t66.init(H, _), bA.init(H, _);
    });
    d76 = G6("ZodCIDRv6", (H, _) => {
      e66.init(H, _), bA.init(H, _);
    });
    c76 = G6("ZodBase64", (H, _) => {
      _86.init(H, _), bA.init(H, _);
    });
    F76 = G6("ZodBase64URL", (H, _) => {
      q86.init(H, _), bA.init(H, _);
    });
    U76 = G6("ZodE164", (H, _) => {
      $86.init(H, _), bA.init(H, _);
    });
    Q76 = G6("ZodJWT", (H, _) => {
      K86.init(H, _), bA.init(H, _);
    });
    _P8 = G6("ZodCustomStringFormat", (H, _) => {
      O86.init(H, _), bA.init(H, _);
    });
    AuH = G6("ZodNumber", (H, _) => {
      x1_.init(H, _),
        hK.init(H, _),
        (H.gt = ($, K) => H.check(DQ($, K))),
        (H.gte = ($, K) => H.check(iL($, K))),
        (H.min = ($, K) => H.check(iL($, K))),
        (H.lt = ($, K) => H.check(YQ($, K))),
        (H.lte = ($, K) => H.check(tV($, K))),
        (H.max = ($, K) => H.check(tV($, K))),
        (H.int = ($) => H.check(N76($))),
        (H.safe = ($) => H.check(N76($))),
        (H.positive = ($) => H.check(DQ(0, $))),
        (H.nonnegative = ($) => H.check(iL(0, $))),
        (H.negative = ($) => H.check(YQ(0, $))),
        (H.nonpositive = ($) => H.check(tV(0, $))),
        (H.multipleOf = ($, K) => H.check(s4H($, K))),
        (H.step = ($, K) => H.check(s4H($, K))),
        (H.finite = () => H);
      let q = H._zod.bag;
      (H.minValue =
        Math.max(q.minimum ?? Number.NEGATIVE_INFINITY, q.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null),
        (H.maxValue =
          Math.min(q.maximum ?? Number.POSITIVE_INFINITY, q.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null),
        (H.isInt = (q.format ?? "").includes("int") || Number.isSafeInteger(q.multipleOf ?? 0.5)),
        (H.isFinite = !0),
        (H.format = q.format ?? null);
    });
    pjH = G6("ZodNumberFormat", (H, _) => {
      T86.init(H, _), AuH.init(H, _);
    });
    fuH = G6("ZodBoolean", (H, _) => {
      gIH.init(H, _), hK.init(H, _);
    });
    wuH = G6("ZodBigInt", (H, _) => {
      m1_.init(H, _),
        hK.init(H, _),
        (H.gte = ($, K) => H.check(iL($, K))),
        (H.min = ($, K) => H.check(iL($, K))),
        (H.gt = ($, K) => H.check(DQ($, K))),
        (H.gte = ($, K) => H.check(iL($, K))),
        (H.min = ($, K) => H.check(iL($, K))),
        (H.lt = ($, K) => H.check(YQ($, K))),
        (H.lte = ($, K) => H.check(tV($, K))),
        (H.max = ($, K) => H.check(tV($, K))),
        (H.positive = ($) => H.check(DQ(BigInt(0), $))),
        (H.negative = ($) => H.check(YQ(BigInt(0), $))),
        (H.nonpositive = ($) => H.check(tV(BigInt(0), $))),
        (H.nonnegative = ($) => H.check(iL(BigInt(0), $))),
        (H.multipleOf = ($, K) => H.check(s4H($, K)));
      let q = H._zod.bag;
      (H.minValue = q.minimum ?? null), (H.maxValue = q.maximum ?? null), (H.format = q.format ?? null);
    });
    l76 = G6("ZodBigIntFormat", (H, _) => {
      z86.init(H, _), wuH.init(H, _);
    });
    qP8 = G6("ZodSymbol", (H, _) => {
      A86.init(H, _), hK.init(H, _);
    });
    $P8 = G6("ZodUndefined", (H, _) => {
      f86.init(H, _), hK.init(H, _);
    });
    KP8 = G6("ZodNull", (H, _) => {
      w86.init(H, _), hK.init(H, _);
    });
    OP8 = G6("ZodAny", (H, _) => {
      Y86.init(H, _), hK.init(H, _);
    });
    TP8 = G6("ZodUnknown", (H, _) => {
      SjH.init(H, _), hK.init(H, _);
    });
    zP8 = G6("ZodNever", (H, _) => {
      D86.init(H, _), hK.init(H, _);
    });
    AP8 = G6("ZodVoid", (H, _) => {
      j86.init(H, _), hK.init(H, _);
    });
    WK_ = G6("ZodDate", (H, _) => {
      M86.init(H, _), hK.init(H, _), (H.min = ($, K) => H.check(iL($, K))), (H.max = ($, K) => H.check(tV($, K)));
      let q = H._zod.bag;
      (H.minDate = q.minimum ? new Date(q.minimum) : null), (H.maxDate = q.maximum ? new Date(q.maximum) : null);
    });
    fP8 = G6("ZodArray", (H, _) => {
      dIH.init(H, _),
        hK.init(H, _),
        (H.element = _.element),
        (H.min = (q, $) => H.check(Xt(q, $))),
        (H.nonempty = (q) => H.check(Xt(1, q))),
        (H.max = (q, $) => H.check(IjH(q, $))),
        (H.length = (q, $) => H.check(ujH(q, $))),
        (H.unwrap = () => H.element);
    });
    GK_ = G6("ZodObject", (H, _) => {
      J86.init(H, _),
        hK.init(H, _),
        Bq.defineLazy(H, "shape", () => _.shape),
        (H.keyof = () => dR(Object.keys(H._zod.def.shape))),
        (H.catchall = (q) => H.clone({ ...H._zod.def, catchall: q })),
        (H.passthrough = () => H.clone({ ...H._zod.def, catchall: Df() })),
        (H.loose = () => H.clone({ ...H._zod.def, catchall: Df() })),
        (H.strict = () => H.clone({ ...H._zod.def, catchall: XK_() })),
        (H.strip = () => H.clone({ ...H._zod.def, catchall: void 0 })),
        (H.extend = (q) => {
          return Bq.extend(H, q);
        }),
        (H.merge = (q) => Bq.merge(H, q)),
        (H.pick = (q) => Bq.pick(H, q)),
        (H.omit = (q) => Bq.omit(H, q)),
        (H.partial = (...q) => Bq.partial(s76, H, q[0])),
        (H.required = (...q) => Bq.required(t76, H, q[0]));
    });
    n76 = G6("ZodUnion", (H, _) => {
      p1_.init(H, _), hK.init(H, _), (H.options = _.options);
    });
    wP8 = G6("ZodDiscriminatedUnion", (H, _) => {
      n76.init(H, _), P86.init(H, _);
    });
    YP8 = G6("ZodIntersection", (H, _) => {
      X86.init(H, _), hK.init(H, _);
    });
    DP8 = G6("ZodTuple", (H, _) => {
      a4H.init(H, _), hK.init(H, _), (H.rest = (q) => H.clone({ ...H._zod.def, rest: q }));
    });
    r76 = G6("ZodRecord", (H, _) => {
      W86.init(H, _), hK.init(H, _), (H.keyType = _.keyType), (H.valueType = _.valueType);
    });
    jP8 = G6("ZodMap", (H, _) => {
      G86.init(H, _), hK.init(H, _), (H.keyType = _.keyType), (H.valueType = _.valueType);
    });
    MP8 = G6("ZodSet", (H, _) => {
      R86.init(H, _),
        hK.init(H, _),
        (H.min = (...q) => H.check(t4H(...q))),
        (H.nonempty = (q) => H.check(t4H(1, q))),
        (H.max = (...q) => H.check(bjH(...q))),
        (H.size = (...q) => H.check(nIH(...q)));
    });
    TuH = G6("ZodEnum", (H, _) => {
      Z86.init(H, _), hK.init(H, _), (H.enum = _.entries), (H.options = Object.values(_.entries));
      let q = new Set(Object.keys(_.entries));
      (H.extract = ($, K) => {
        let O = {};
        for (let T of $)
          if (q.has(T)) O[T] = _.entries[T];
          else throw Error(`Key ${T} not found in enum`);
        return new TuH({ ..._, checks: [], ...Bq.normalizeParams(K), entries: O });
      }),
        (H.exclude = ($, K) => {
          let O = { ..._.entries };
          for (let T of $)
            if (q.has(T)) delete O[T];
            else throw Error(`Key ${T} not found in enum`);
          return new TuH({ ..._, checks: [], ...Bq.normalizeParams(K), entries: O });
        });
    });
    JP8 = G6("ZodLiteral", (H, _) => {
      L86.init(H, _),
        hK.init(H, _),
        (H.values = new Set(_.values)),
        Object.defineProperty(H, "value", {
          get() {
            if (_.values.length > 1)
              throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
            return _.values[0];
          },
        });
    });
    PP8 = G6("ZodFile", (H, _) => {
      k86.init(H, _),
        hK.init(H, _),
        (H.min = (q, $) => H.check(t4H(q, $))),
        (H.max = (q, $) => H.check(bjH(q, $))),
        (H.mime = (q, $) => H.check(HuH(Array.isArray(q) ? q : [q], $)));
    });
    o76 = G6("ZodTransform", (H, _) => {
      cIH.init(H, _),
        hK.init(H, _),
        (H._zod.parse = (q, $) => {
          q.addIssue = (O) => {
            if (typeof O === "string") q.issues.push(Bq.issue(O, q.value, _));
            else {
              let T = O;
              if (T.fatal) T.continue = !1;
              T.code ?? (T.code = "custom"),
                T.input ?? (T.input = q.value),
                T.inst ?? (T.inst = H),
                T.continue ?? (T.continue = !0),
                q.issues.push(Bq.issue(T));
            }
          };
          let K = _.transform(q.value, q);
          if (K instanceof Promise)
            return K.then((O) => {
              return (q.value = O), q;
            });
          return (q.value = K), q;
        });
    });
    s76 = G6("ZodOptional", (H, _) => {
      v86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    XP8 = G6("ZodNullable", (H, _) => {
      N86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    WP8 = G6("ZodDefault", (H, _) => {
      h86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType), (H.removeDefault = H.unwrap);
    });
    RP8 = G6("ZodPrefault", (H, _) => {
      y86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    t76 = G6("ZodNonOptional", (H, _) => {
      V86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    kP8 = G6("ZodSuccess", (H, _) => {
      S86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    vP8 = G6("ZodCatch", (H, _) => {
      E86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType), (H.removeCatch = H.unwrap);
    });
    hP8 = G6("ZodNaN", (H, _) => {
      C86.init(H, _), hK.init(H, _);
    });
    e76 = G6("ZodPipe", (H, _) => {
      FIH.init(H, _), hK.init(H, _), (H.in = _.in), (H.out = _.out);
    });
    yP8 = G6("ZodReadonly", (H, _) => {
      b86.init(H, _), hK.init(H, _);
    });
    SP8 = G6("ZodTemplateLiteral", (H, _) => {
      I86.init(H, _), hK.init(H, _);
    });
    EP8 = G6("ZodLazy", (H, _) => {
      x86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.getter());
    });
    bP8 = G6("ZodPromise", (H, _) => {
      u86.init(H, _), hK.init(H, _), (H.unwrap = () => H._zod.def.innerType);
    });
    ZK_ = G6("ZodCustom", (H, _) => {
      m86.init(H, _), hK.init(H, _);
    });

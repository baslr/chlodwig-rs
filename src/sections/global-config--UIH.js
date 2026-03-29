    C1_();
    kjH();
    h1_();
    V1_();
    j4();
    I66();
    j4();
    (V4 = G6("$ZodType", (H, _) => {
      var q;
      H ?? (H = {}), (H._zod.def = _), (H._zod.bag = H._zod.bag || {}), (H._zod.version = b66);
      let $ = [...(H._zod.def.checks ?? [])];
      if (H._zod.traits.has("$ZodCheck")) $.unshift(H);
      for (let K of $) for (let O of K._zod.onattach) O(H);
      if ($.length === 0)
        (q = H._zod).deferred ?? (q.deferred = []),
          H._zod.deferred?.push(() => {
            H._zod.run = H._zod.parse;
          });
      else {
        let K = (O, T, z) => {
          let A = i4H(O),
            f;
          for (let w of T) {
            if (w._zod.when) {
              if (!w._zod.when(O)) continue;
            } else if (A) continue;
            let Y = O.issues.length,
              D = w._zod.check(O);
            if (D instanceof Promise && z?.async === !1) throw new fQ();
            if (f || D instanceof Promise)
              f = (f ?? Promise.resolve()).then(async () => {
                if ((await D, O.issues.length === Y)) return;
                if (!A) A = i4H(O, Y);
              });
            else {
              if (O.issues.length === Y) continue;
              if (!A) A = i4H(O, Y);
            }
          }
          if (f)
            return f.then(() => {
              return O;
            });
          return O;
        };
        H._zod.run = (O, T) => {
          let z = H._zod.parse(O, T);
          if (z instanceof Promise) {
            if (T.async === !1) throw new fQ();
            return z.then((A) => K(A, $, T));
          }
          return K(z, $, T);
        };
      }
      H["~standard"] = {
        validate: (K) => {
          try {
            let O = yjH(H, K);
            return O.success ? { value: O.data } : { issues: O.error?.issues };
          } catch (O) {
            return BIH(H, K).then((T) => (T.success ? { value: T.data } : { issues: T.error?.issues }));
          }
        },
        vendor: "zod",
        version: 1,
      };
    })),
      (o4H = G6("$ZodString", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = [...(H?._zod.bag?.patterns ?? [])].pop() ?? O66(H._zod.bag)),
          (H._zod.parse = (q, $) => {
            if (_.coerce)
              try {
                q.value = String(q.value);
              } catch (K) {}
            if (typeof q.value === "string") return q;
            return q.issues.push({ expected: "string", code: "invalid_type", input: q.value, inst: H }), q;
          });
      })),
      (xz = G6("$ZodStringFormat", (H, _) => {
        VjH.init(H, _), o4H.init(H, _);
      })),
      (x66 = G6("$ZodGUID", (H, _) => {
        _.pattern ?? (_.pattern = i_6), xz.init(H, _);
      })),
      (m66 = G6("$ZodUUID", (H, _) => {
        if (_.version) {
          let $ = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[_.version];
          if ($ === void 0) throw Error(`Invalid UUID version: "${_.version}"`);
          _.pattern ?? (_.pattern = n4H($));
        } else _.pattern ?? (_.pattern = n4H());
        xz.init(H, _);
      })),
      (p66 = G6("$ZodEmail", (H, _) => {
        _.pattern ?? (_.pattern = n_6), xz.init(H, _);
      })),
      (B66 = G6("$ZodURL", (H, _) => {
        xz.init(H, _),
          (H._zod.check = (q) => {
            try {
              let $ = q.value,
                K = new URL($),
                O = K.href;
              if (_.hostname) {
                if (((_.hostname.lastIndex = 0), !_.hostname.test(K.hostname)))
                  q.issues.push({
                    code: "invalid_format",
                    format: "url",
                    note: "Invalid hostname",
                    pattern: H66.source,
                    input: q.value,
                    inst: H,
                    continue: !_.abort,
                  });
              }
              if (_.protocol) {
                if (
                  ((_.protocol.lastIndex = 0),
                  !_.protocol.test(K.protocol.endsWith(":") ? K.protocol.slice(0, -1) : K.protocol))
                )
                  q.issues.push({
                    code: "invalid_format",
                    format: "url",
                    note: "Invalid protocol",
                    pattern: _.protocol.source,
                    input: q.value,
                    inst: H,
                    continue: !_.abort,
                  });
              }
              if (!$.endsWith("/") && O.endsWith("/")) q.value = O.slice(0, -1);
              else q.value = O;
              return;
            } catch ($) {
              q.issues.push({ code: "invalid_format", format: "url", input: q.value, inst: H, continue: !_.abort });
            }
          });
      })),
      (g66 = G6("$ZodEmoji", (H, _) => {
        _.pattern ?? (_.pattern = r_6()), xz.init(H, _);
      })),
      (d66 = G6("$ZodNanoID", (H, _) => {
        _.pattern ?? (_.pattern = Q_6), xz.init(H, _);
      })),
      (c66 = G6("$ZodCUID", (H, _) => {
        _.pattern ?? (_.pattern = g_6), xz.init(H, _);
      })),
      (F66 = G6("$ZodCUID2", (H, _) => {
        _.pattern ?? (_.pattern = d_6), xz.init(H, _);
      })),
      (U66 = G6("$ZodULID", (H, _) => {
        _.pattern ?? (_.pattern = c_6), xz.init(H, _);
      })),
      (Q66 = G6("$ZodXID", (H, _) => {
        _.pattern ?? (_.pattern = F_6), xz.init(H, _);
      })),
      (l66 = G6("$ZodKSUID", (H, _) => {
        _.pattern ?? (_.pattern = U_6), xz.init(H, _);
      })),
      (i66 = G6("$ZodISODateTime", (H, _) => {
        _.pattern ?? (_.pattern = K66(_)), xz.init(H, _);
      })),
      (n66 = G6("$ZodISODate", (H, _) => {
        _.pattern ?? (_.pattern = q66), xz.init(H, _);
      })),
      (r66 = G6("$ZodISOTime", (H, _) => {
        _.pattern ?? (_.pattern = $66(_)), xz.init(H, _);
      })),
      (o66 = G6("$ZodISODuration", (H, _) => {
        _.pattern ?? (_.pattern = l_6), xz.init(H, _);
      })),
      (a66 = G6("$ZodIPv4", (H, _) => {
        _.pattern ?? (_.pattern = o_6),
          xz.init(H, _),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag;
            $.format = "ipv4";
          });
      })),
      (s66 = G6("$ZodIPv6", (H, _) => {
        _.pattern ?? (_.pattern = a_6),
          xz.init(H, _),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag;
            $.format = "ipv6";
          }),
          (H._zod.check = (q) => {
            try {
              new URL(`http://[${q.value}]`);
            } catch {
              q.issues.push({ code: "invalid_format", format: "ipv6", input: q.value, inst: H, continue: !_.abort });
            }
          });
      })),
      (t66 = G6("$ZodCIDRv4", (H, _) => {
        _.pattern ?? (_.pattern = s_6), xz.init(H, _);
      })),
      (e66 = G6("$ZodCIDRv6", (H, _) => {
        _.pattern ?? (_.pattern = t_6),
          xz.init(H, _),
          (H._zod.check = (q) => {
            let [$, K] = q.value.split("/");
            try {
              if (!K) throw Error();
              let O = Number(K);
              if (`${O}` !== K) throw Error();
              if (O < 0 || O > 128) throw Error();
              new URL(`http://[${$}]`);
            } catch {
              q.issues.push({ code: "invalid_format", format: "cidrv6", input: q.value, inst: H, continue: !_.abort });
            }
          });
      }));
    _86 = G6("$ZodBase64", (H, _) => {
      _.pattern ?? (_.pattern = e_6),
        xz.init(H, _),
        H._zod.onattach.push((q) => {
          q._zod.bag.contentEncoding = "base64";
        }),
        (H._zod.check = (q) => {
          if (H86(q.value)) return;
          q.issues.push({ code: "invalid_format", format: "base64", input: q.value, inst: H, continue: !_.abort });
        });
    });
    (q86 = G6("$ZodBase64URL", (H, _) => {
      _.pattern ?? (_.pattern = y1_),
        xz.init(H, _),
        H._zod.onattach.push((q) => {
          q._zod.bag.contentEncoding = "base64url";
        }),
        (H._zod.check = (q) => {
          if (TJ8(q.value)) return;
          q.issues.push({ code: "invalid_format", format: "base64url", input: q.value, inst: H, continue: !_.abort });
        });
    })),
      ($86 = G6("$ZodE164", (H, _) => {
        _.pattern ?? (_.pattern = _66), xz.init(H, _);
      }));
    (K86 = G6("$ZodJWT", (H, _) => {
      xz.init(H, _),
        (H._zod.check = (q) => {
          if (zJ8(q.value, _.alg)) return;
          q.issues.push({ code: "invalid_format", format: "jwt", input: q.value, inst: H, continue: !_.abort });
        });
    })),
      (O86 = G6("$ZodCustomStringFormat", (H, _) => {
        xz.init(H, _),
          (H._zod.check = (q) => {
            if (_.fn(q.value)) return;
            q.issues.push({ code: "invalid_format", format: _.format, input: q.value, inst: H, continue: !_.abort });
          });
      })),
      (x1_ = G6("$ZodNumber", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = H._zod.bag.pattern ?? A66),
          (H._zod.parse = (q, $) => {
            if (_.coerce)
              try {
                q.value = Number(q.value);
              } catch (T) {}
            let K = q.value;
            if (typeof K === "number" && !Number.isNaN(K) && Number.isFinite(K)) return q;
            let O =
              typeof K === "number" ? (Number.isNaN(K) ? "NaN" : !Number.isFinite(K) ? "Infinity" : void 0) : void 0;
            return (
              q.issues.push({
                expected: "number",
                code: "invalid_type",
                input: K,
                inst: H,
                ...(O ? { received: O } : {}),
              }),
              q
            );
          });
      })),
      (T86 = G6("$ZodNumber", (H, _) => {
        J66.init(H, _), x1_.init(H, _);
      })),
      (gIH = G6("$ZodBoolean", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = f66),
          (H._zod.parse = (q, $) => {
            if (_.coerce)
              try {
                q.value = Boolean(q.value);
              } catch (O) {}
            let K = q.value;
            if (typeof K === "boolean") return q;
            return q.issues.push({ expected: "boolean", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (m1_ = G6("$ZodBigInt", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = T66),
          (H._zod.parse = (q, $) => {
            if (_.coerce)
              try {
                q.value = BigInt(q.value);
              } catch (K) {}
            if (typeof q.value === "bigint") return q;
            return q.issues.push({ expected: "bigint", code: "invalid_type", input: q.value, inst: H }), q;
          });
      })),
      (z86 = G6("$ZodBigInt", (H, _) => {
        P66.init(H, _), m1_.init(H, _);
      })),
      (A86 = G6("$ZodSymbol", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (typeof K === "symbol") return q;
            return q.issues.push({ expected: "symbol", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (f86 = G6("$ZodUndefined", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = Y66),
          (H._zod.values = new Set([void 0])),
          (H._zod.optin = "optional"),
          (H._zod.optout = "optional"),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (typeof K > "u") return q;
            return q.issues.push({ expected: "undefined", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (w86 = G6("$ZodNull", (H, _) => {
        V4.init(H, _),
          (H._zod.pattern = w66),
          (H._zod.values = new Set([null])),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (K === null) return q;
            return q.issues.push({ expected: "null", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (Y86 = G6("$ZodAny", (H, _) => {
        V4.init(H, _), (H._zod.parse = (q) => q);
      })),
      (SjH = G6("$ZodUnknown", (H, _) => {
        V4.init(H, _), (H._zod.parse = (q) => q);
      })),
      (D86 = G6("$ZodNever", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            return q.issues.push({ expected: "never", code: "invalid_type", input: q.value, inst: H }), q;
          });
      })),
      (j86 = G6("$ZodVoid", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (typeof K > "u") return q;
            return q.issues.push({ expected: "void", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (M86 = G6("$ZodDate", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            if (_.coerce)
              try {
                q.value = new Date(q.value);
              } catch (z) {}
            let K = q.value,
              O = K instanceof Date;
            if (O && !Number.isNaN(K.getTime())) return q;
            return (
              q.issues.push({
                expected: "date",
                code: "invalid_type",
                input: K,
                ...(O ? { received: "Invalid Date" } : {}),
                inst: H,
              }),
              q
            );
          });
      }));
    dIH = G6("$ZodArray", (H, _) => {
      V4.init(H, _),
        (H._zod.parse = (q, $) => {
          let K = q.value;
          if (!Array.isArray(K))
            return q.issues.push({ expected: "array", code: "invalid_type", input: K, inst: H }), q;
          q.value = Array(K.length);
          let O = [];
          for (let T = 0; T < K.length; T++) {
            let z = K[T],
              A = _.element._zod.run({ value: z, issues: [] }, $);
            if (A instanceof Promise) O.push(A.then((f) => oM8(f, q, T)));
            else oM8(A, q, T);
          }
          if (O.length) return Promise.all(O).then(() => q);
          return q;
        });
    });
    J86 = G6("$ZodObject", (H, _) => {
      V4.init(H, _);
      let q = VIH(() => {
        let Y = Object.keys(_.shape);
        for (let j of Y)
          if (!(_.shape[j] instanceof V4)) throw Error(`Invalid element at key "${j}": expected a Zod schema`);
        let D = b_6(_.shape);
        return { shape: _.shape, keys: Y, keySet: new Set(Y), numKeys: Y.length, optionalKeys: new Set(D) };
      });
      EO(H._zod, "propValues", () => {
        let Y = _.shape,
          D = {};
        for (let j in Y) {
          let M = Y[j]._zod;
          if (M.values) {
            D[j] ?? (D[j] = new Set());
            for (let J of M.values) D[j].add(J);
          }
        }
        return D;
      });
      let $ = (Y) => {
          let D = new b1_(["shape", "payload", "ctx"]),
            j = q.value,
            M = (R) => {
              let W = l4H(R);
              return `shape[${W}]._zod.run({ value: input[${W}], issues: [] }, ctx)`;
            };
          D.write("const input = payload.value;");
          let J = Object.create(null),
            P = 0;
          for (let R of j.keys) J[R] = `key_${P++}`;
          D.write("const newResult = {}");
          for (let R of j.keys)
            if (j.optionalKeys.has(R)) {
              let W = J[R];
              D.write(`const ${W} = ${M(R)};`);
              let Z = l4H(R);
              D.write(`
        if (${W}.issues.length) {
          if (input[${Z}] === undefined) {
            if (${Z} in input) {
              newResult[${Z}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${W}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${Z}, ...iss.path] : [${Z}],
              }))
            );
          }
        } else if (${W}.value === undefined) {
          if (${Z} in input) newResult[${Z}] = undefined;
        } else {
          newResult[${Z}] = ${W}.value;
        }
        `);
            } else {
              let W = J[R];
              D.write(`const ${W} = ${M(R)};`),
                D.write(`
          if (${W}.issues.length) payload.issues = payload.issues.concat(${W}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${l4H(R)}, ...iss.path] : [${l4H(R)}]
          })));`),
                D.write(`newResult[${l4H(R)}] = ${W}.value`);
            }
          D.write("payload.value = newResult;"), D.write("return payload;");
          let X = D.compile();
          return (R, W) => X(Y, R, W);
        },
        K,
        O = vjH,
        T = !vIH.jitless,
        A = T && E_6.value,
        f = _.catchall,
        w;
      H._zod.parse = (Y, D) => {
        w ?? (w = q.value);
        let j = Y.value;
        if (!O(j)) return Y.issues.push({ expected: "object", code: "invalid_type", input: j, inst: H }), Y;
        let M = [];
        if (T && A && D?.async === !1 && D.jitless !== !0) {
          if (!K) K = $(_.shape);
          Y = K(Y, D);
        } else {
          Y.value = {};
          let W = w.shape;
          for (let Z of w.keys) {
            let k = W[Z],
              v = k._zod.run({ value: j[Z], issues: [] }, D),
              y = k._zod.optin === "optional" && k._zod.optout === "optional";
            if (v instanceof Promise) M.push(v.then((E) => (y ? aM8(E, Y, Z, j) : I1_(E, Y, Z))));
            else if (y) aM8(v, Y, Z, j);
            else I1_(v, Y, Z);
          }
        }
        if (!f) return M.length ? Promise.all(M).then(() => Y) : Y;
        let J = [],
          P = w.keySet,
          X = f._zod,
          R = X.def.type;
        for (let W of Object.keys(j)) {
          if (P.has(W)) continue;
          if (R === "never") {
            J.push(W);
            continue;
          }
          let Z = X.run({ value: j[W], issues: [] }, D);
          if (Z instanceof Promise) M.push(Z.then((k) => I1_(k, Y, W)));
          else I1_(Z, Y, W);
        }
        if (J.length) Y.issues.push({ code: "unrecognized_keys", keys: J, input: j, inst: H });
        if (!M.length) return Y;
        return Promise.all(M).then(() => {
          return Y;
        });
      };
    });
    (p1_ = G6("$ZodUnion", (H, _) => {
      V4.init(H, _),
        EO(H._zod, "optin", () => (_.options.some((q) => q._zod.optin === "optional") ? "optional" : void 0)),
        EO(H._zod, "optout", () => (_.options.some((q) => q._zod.optout === "optional") ? "optional" : void 0)),
        EO(H._zod, "values", () => {
          if (_.options.every((q) => q._zod.values))
            return new Set(_.options.flatMap((q) => Array.from(q._zod.values)));
          return;
        }),
        EO(H._zod, "pattern", () => {
          if (_.options.every((q) => q._zod.pattern)) {
            let q = _.options.map(($) => $._zod.pattern);
            return new RegExp(`^(${q.map(($) => SIH($.source)).join("|")})$`);
          }
          return;
        }),
        (H._zod.parse = (q, $) => {
          let K = !1,
            O = [];
          for (let T of _.options) {
            let z = T._zod.run({ value: q.value, issues: [] }, $);
            if (z instanceof Promise) O.push(z), (K = !0);
            else {
              if (z.issues.length === 0) return z;
              O.push(z);
            }
          }
          if (!K) return sM8(O, q, H, $);
          return Promise.all(O).then((T) => {
            return sM8(T, q, H, $);
          });
        });
    })),
      (P86 = G6("$ZodDiscriminatedUnion", (H, _) => {
        p1_.init(H, _);
        let q = H._zod.parse;
        EO(H._zod, "propValues", () => {
          let K = {};
          for (let O of _.options) {
            let T = O._zod.propValues;
            if (!T || Object.keys(T).length === 0)
              throw Error(`Invalid discriminated union option at index "${_.options.indexOf(O)}"`);
            for (let [z, A] of Object.entries(T)) {
              if (!K[z]) K[z] = new Set();
              for (let f of A) K[z].add(f);
            }
          }
          return K;
        });
        let $ = VIH(() => {
          let K = _.options,
            O = new Map();
          for (let T of K) {
            let z = T._zod.propValues[_.discriminator];
            if (!z || z.size === 0)
              throw Error(`Invalid discriminated union option at index "${_.options.indexOf(T)}"`);
            for (let A of z) {
              if (O.has(A)) throw Error(`Duplicate discriminator value "${String(A)}"`);
              O.set(A, T);
            }
          }
          return O;
        });
        H._zod.parse = (K, O) => {
          let T = K.value;
          if (!vjH(T)) return K.issues.push({ code: "invalid_type", expected: "object", input: T, inst: H }), K;
          let z = $.value.get(T?.[_.discriminator]);
          if (z) return z._zod.run(K, O);
          if (_.unionFallback) return q(K, O);
          return (
            K.issues.push({
              code: "invalid_union",
              errors: [],
              note: "No matching discriminator",
              input: T,
              path: [_.discriminator],
              inst: H,
            }),
            K
          );
        };
      })),
      (X86 = G6("$ZodIntersection", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = q.value,
              O = _.left._zod.run({ value: K, issues: [] }, $),
              T = _.right._zod.run({ value: K, issues: [] }, $);
            if (O instanceof Promise || T instanceof Promise)
              return Promise.all([O, T]).then(([A, f]) => {
                return tM8(q, A, f);
              });
            return tM8(q, O, T);
          });
      }));
    a4H = G6("$ZodTuple", (H, _) => {
      V4.init(H, _);
      let q = _.items,
        $ = q.length - [...q].reverse().findIndex((K) => K._zod.optin !== "optional");
      H._zod.parse = (K, O) => {
        let T = K.value;
        if (!Array.isArray(T)) return K.issues.push({ input: T, inst: H, expected: "tuple", code: "invalid_type" }), K;
        K.value = [];
        let z = [];
        if (!_.rest) {
          let f = T.length > q.length,
            w = T.length < $ - 1;
          if (f || w)
            return (
              K.issues.push({
                input: T,
                inst: H,
                origin: "array",
                ...(f ? { code: "too_big", maximum: q.length } : { code: "too_small", minimum: q.length }),
              }),
              K
            );
        }
        let A = -1;
        for (let f of q) {
          if ((A++, A >= T.length)) {
            if (A >= $) continue;
          }
          let w = f._zod.run({ value: T[A], issues: [] }, O);
          if (w instanceof Promise) z.push(w.then((Y) => u1_(Y, K, A)));
          else u1_(w, K, A);
        }
        if (_.rest) {
          let f = T.slice(q.length);
          for (let w of f) {
            A++;
            let Y = _.rest._zod.run({ value: w, issues: [] }, O);
            if (Y instanceof Promise) z.push(Y.then((D) => u1_(D, K, A)));
            else u1_(Y, K, A);
          }
        }
        if (z.length) return Promise.all(z).then(() => K);
        return K;
      };
    });
    (W86 = G6("$ZodRecord", (H, _) => {
      V4.init(H, _),
        (H._zod.parse = (q, $) => {
          let K = q.value;
          if (!NjH(K)) return q.issues.push({ expected: "record", code: "invalid_type", input: K, inst: H }), q;
          let O = [];
          if (_.keyType._zod.values) {
            let T = _.keyType._zod.values;
            q.value = {};
            for (let A of T)
              if (typeof A === "string" || typeof A === "number" || typeof A === "symbol") {
                let f = _.valueType._zod.run({ value: K[A], issues: [] }, $);
                if (f instanceof Promise)
                  O.push(
                    f.then((w) => {
                      if (w.issues.length) q.issues.push(...lL(A, w.issues));
                      q.value[A] = w.value;
                    }),
                  );
                else {
                  if (f.issues.length) q.issues.push(...lL(A, f.issues));
                  q.value[A] = f.value;
                }
              }
            let z;
            for (let A in K) if (!T.has(A)) (z = z ?? []), z.push(A);
            if (z && z.length > 0) q.issues.push({ code: "unrecognized_keys", input: K, inst: H, keys: z });
          } else {
            q.value = {};
            for (let T of Reflect.ownKeys(K)) {
              if (T === "__proto__") continue;
              let z = _.keyType._zod.run({ value: T, issues: [] }, $);
              if (z instanceof Promise) throw Error("Async schemas not supported in object keys currently");
              if (z.issues.length) {
                q.issues.push({
                  origin: "record",
                  code: "invalid_key",
                  issues: z.issues.map((f) => Dh(f, $, $j())),
                  input: T,
                  path: [T],
                  inst: H,
                }),
                  (q.value[z.value] = z.value);
                continue;
              }
              let A = _.valueType._zod.run({ value: K[T], issues: [] }, $);
              if (A instanceof Promise)
                O.push(
                  A.then((f) => {
                    if (f.issues.length) q.issues.push(...lL(T, f.issues));
                    q.value[z.value] = f.value;
                  }),
                );
              else {
                if (A.issues.length) q.issues.push(...lL(T, A.issues));
                q.value[z.value] = A.value;
              }
            }
          }
          if (O.length) return Promise.all(O).then(() => q);
          return q;
        });
    })),
      (G86 = G6("$ZodMap", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (!(K instanceof Map))
              return q.issues.push({ expected: "map", code: "invalid_type", input: K, inst: H }), q;
            let O = [];
            q.value = new Map();
            for (let [T, z] of K) {
              let A = _.keyType._zod.run({ value: T, issues: [] }, $),
                f = _.valueType._zod.run({ value: z, issues: [] }, $);
              if (A instanceof Promise || f instanceof Promise)
                O.push(
                  Promise.all([A, f]).then(([w, Y]) => {
                    eM8(w, Y, q, T, K, H, $);
                  }),
                );
              else eM8(A, f, q, T, K, H, $);
            }
            if (O.length) return Promise.all(O).then(() => q);
            return q;
          });
      }));
    R86 = G6("$ZodSet", (H, _) => {
      V4.init(H, _),
        (H._zod.parse = (q, $) => {
          let K = q.value;
          if (!(K instanceof Set))
            return q.issues.push({ input: K, inst: H, expected: "set", code: "invalid_type" }), q;
          let O = [];
          q.value = new Set();
          for (let T of K) {
            let z = _.valueType._zod.run({ value: T, issues: [] }, $);
            if (z instanceof Promise) O.push(z.then((A) => HJ8(A, q)));
            else HJ8(z, q);
          }
          if (O.length) return Promise.all(O).then(() => q);
          return q;
        });
    });
    (Z86 = G6("$ZodEnum", (H, _) => {
      V4.init(H, _);
      let q = yIH(_.entries);
      (H._zod.values = new Set(q)),
        (H._zod.pattern = new RegExp(
          `^(${q
            .filter(($) => EIH.has(typeof $))
            .map(($) => (typeof $ === "string" ? wQ($) : $.toString()))
            .join("|")})$`,
        )),
        (H._zod.parse = ($, K) => {
          let O = $.value;
          if (H._zod.values.has(O)) return $;
          return $.issues.push({ code: "invalid_value", values: q, input: O, inst: H }), $;
        });
    })),
      (L86 = G6("$ZodLiteral", (H, _) => {
        V4.init(H, _),
          (H._zod.values = new Set(_.values)),
          (H._zod.pattern = new RegExp(
            `^(${_.values.map((q) => (typeof q === "string" ? wQ(q) : q ? q.toString() : String(q))).join("|")})$`,
          )),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (H._zod.values.has(K)) return q;
            return q.issues.push({ code: "invalid_value", values: _.values, input: K, inst: H }), q;
          });
      })),
      (k86 = G6("$ZodFile", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = q.value;
            if (K instanceof File) return q;
            return q.issues.push({ expected: "file", code: "invalid_type", input: K, inst: H }), q;
          });
      })),
      (cIH = G6("$ZodTransform", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            let K = _.transform(q.value, q);
            if ($.async)
              return (K instanceof Promise ? K : Promise.resolve(K)).then((T) => {
                return (q.value = T), q;
              });
            if (K instanceof Promise) throw new fQ();
            return (q.value = K), q;
          });
      })),
      (v86 = G6("$ZodOptional", (H, _) => {
        V4.init(H, _),
          (H._zod.optin = "optional"),
          (H._zod.optout = "optional"),
          EO(H._zod, "values", () => {
            return _.innerType._zod.values ? new Set([..._.innerType._zod.values, void 0]) : void 0;
          }),
          EO(H._zod, "pattern", () => {
            let q = _.innerType._zod.pattern;
            return q ? new RegExp(`^(${SIH(q.source)})?$`) : void 0;
          }),
          (H._zod.parse = (q, $) => {
            if (_.innerType._zod.optin === "optional") return _.innerType._zod.run(q, $);
            if (q.value === void 0) return q;
            return _.innerType._zod.run(q, $);
          });
      })),
      (N86 = G6("$ZodNullable", (H, _) => {
        V4.init(H, _),
          EO(H._zod, "optin", () => _.innerType._zod.optin),
          EO(H._zod, "optout", () => _.innerType._zod.optout),
          EO(H._zod, "pattern", () => {
            let q = _.innerType._zod.pattern;
            return q ? new RegExp(`^(${SIH(q.source)}|null)$`) : void 0;
          }),
          EO(H._zod, "values", () => {
            return _.innerType._zod.values ? new Set([..._.innerType._zod.values, null]) : void 0;
          }),
          (H._zod.parse = (q, $) => {
            if (q.value === null) return q;
            return _.innerType._zod.run(q, $);
          });
      })),
      (h86 = G6("$ZodDefault", (H, _) => {
        V4.init(H, _),
          (H._zod.optin = "optional"),
          EO(H._zod, "values", () => _.innerType._zod.values),
          (H._zod.parse = (q, $) => {
            if (q.value === void 0) return (q.value = _.defaultValue), q;
            let K = _.innerType._zod.run(q, $);
            if (K instanceof Promise) return K.then((O) => _J8(O, _));
            return _J8(K, _);
          });
      }));
    (y86 = G6("$ZodPrefault", (H, _) => {
      V4.init(H, _),
        (H._zod.optin = "optional"),
        EO(H._zod, "values", () => _.innerType._zod.values),
        (H._zod.parse = (q, $) => {
          if (q.value === void 0) q.value = _.defaultValue;
          return _.innerType._zod.run(q, $);
        });
    })),
      (V86 = G6("$ZodNonOptional", (H, _) => {
        V4.init(H, _),
          EO(H._zod, "values", () => {
            let q = _.innerType._zod.values;
            return q ? new Set([...q].filter(($) => $ !== void 0)) : void 0;
          }),
          (H._zod.parse = (q, $) => {
            let K = _.innerType._zod.run(q, $);
            if (K instanceof Promise) return K.then((O) => qJ8(O, H));
            return qJ8(K, H);
          });
      }));
    (S86 = G6("$ZodSuccess", (H, _) => {
      V4.init(H, _),
        (H._zod.parse = (q, $) => {
          let K = _.innerType._zod.run(q, $);
          if (K instanceof Promise)
            return K.then((O) => {
              return (q.value = O.issues.length === 0), q;
            });
          return (q.value = K.issues.length === 0), q;
        });
    })),
      (E86 = G6("$ZodCatch", (H, _) => {
        V4.init(H, _),
          (H._zod.optin = "optional"),
          EO(H._zod, "optout", () => _.innerType._zod.optout),
          EO(H._zod, "values", () => _.innerType._zod.values),
          (H._zod.parse = (q, $) => {
            let K = _.innerType._zod.run(q, $);
            if (K instanceof Promise)
              return K.then((O) => {
                if (((q.value = O.value), O.issues.length))
                  (q.value = _.catchValue({
                    ...q,
                    error: { issues: O.issues.map((T) => Dh(T, $, $j())) },
                    input: q.value,
                  })),
                    (q.issues = []);
                return q;
              });
            if (((q.value = K.value), K.issues.length))
              (q.value = _.catchValue({
                ...q,
                error: { issues: K.issues.map((O) => Dh(O, $, $j())) },
                input: q.value,
              })),
                (q.issues = []);
            return q;
          });
      })),
      (C86 = G6("$ZodNaN", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            if (typeof q.value !== "number" || !Number.isNaN(q.value))
              return q.issues.push({ input: q.value, inst: H, expected: "nan", code: "invalid_type" }), q;
            return q;
          });
      })),
      (FIH = G6("$ZodPipe", (H, _) => {
        V4.init(H, _),
          EO(H._zod, "values", () => _.in._zod.values),
          EO(H._zod, "optin", () => _.in._zod.optin),
          EO(H._zod, "optout", () => _.out._zod.optout),
          (H._zod.parse = (q, $) => {
            let K = _.in._zod.run(q, $);
            if (K instanceof Promise) return K.then((O) => $J8(O, _, $));
            return $J8(K, _, $);
          });
      }));
    b86 = G6("$ZodReadonly", (H, _) => {
      V4.init(H, _),
        EO(H._zod, "propValues", () => _.innerType._zod.propValues),
        EO(H._zod, "values", () => _.innerType._zod.values),
        EO(H._zod, "optin", () => _.innerType._zod.optin),
        EO(H._zod, "optout", () => _.innerType._zod.optout),
        (H._zod.parse = (q, $) => {
          let K = _.innerType._zod.run(q, $);
          if (K instanceof Promise) return K.then(KJ8);
          return KJ8(K);
        });
    });
    (I86 = G6("$ZodTemplateLiteral", (H, _) => {
      V4.init(H, _);
      let q = [];
      for (let $ of _.parts)
        if ($ instanceof V4) {
          if (!$._zod.pattern)
            throw Error(`Invalid template literal part, no pattern found: ${[...$._zod.traits].shift()}`);
          let K = $._zod.pattern instanceof RegExp ? $._zod.pattern.source : $._zod.pattern;
          if (!K) throw Error(`Invalid template literal part: ${$._zod.traits}`);
          let O = K.startsWith("^") ? 1 : 0,
            T = K.endsWith("$") ? K.length - 1 : K.length;
          q.push(K.slice(O, T));
        } else if ($ === null || C_6.has(typeof $)) q.push(wQ(`${$}`));
        else throw Error(`Invalid template literal part: ${$}`);
      (H._zod.pattern = new RegExp(`^${q.join("")}$`)),
        (H._zod.parse = ($, K) => {
          if (typeof $.value !== "string")
            return $.issues.push({ input: $.value, inst: H, expected: "template_literal", code: "invalid_type" }), $;
          if (((H._zod.pattern.lastIndex = 0), !H._zod.pattern.test($.value)))
            return (
              $.issues.push({
                input: $.value,
                inst: H,
                code: "invalid_format",
                format: "template_literal",
                pattern: H._zod.pattern.source,
              }),
              $
            );
          return $;
        });
    })),
      (u86 = G6("$ZodPromise", (H, _) => {
        V4.init(H, _),
          (H._zod.parse = (q, $) => {
            return Promise.resolve(q.value).then((K) => _.innerType._zod.run({ value: K, issues: [] }, $));
          });
      })),
      (x86 = G6("$ZodLazy", (H, _) => {
        V4.init(H, _),
          EO(H._zod, "innerType", () => _.getter()),
          EO(H._zod, "pattern", () => H._zod.innerType._zod.pattern),
          EO(H._zod, "propValues", () => H._zod.innerType._zod.propValues),
          EO(H._zod, "optin", () => H._zod.innerType._zod.optin),
          EO(H._zod, "optout", () => H._zod.innerType._zod.optout),
          (H._zod.parse = (q, $) => {
            return H._zod.innerType._zod.run(q, $);
          });
      })),
      (m86 = G6("$ZodCustom", (H, _) => {
        TY.init(H, _),
          V4.init(H, _),
          (H._zod.parse = (q, $) => {
            return q;
          }),
          (H._zod.check = (q) => {
            let $ = q.value,
              K = _.fn($);
            if (K instanceof Promise) return K.then((O) => OJ8(O, q, $, H));
            OJ8(K, q, $, H);
            return;
          });
      }));

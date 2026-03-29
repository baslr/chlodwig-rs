    kjH();
    V1_();
    j4();
    (TY = G6("$ZodCheck", (H, _) => {
      var q;
      H._zod ?? (H._zod = {}), (H._zod.def = _), (q = H._zod).onattach ?? (q.onattach = []);
    })),
      (nM8 = { number: "number", bigint: "bigint", object: "date" }),
      (S1_ = G6("$ZodCheckLessThan", (H, _) => {
        TY.init(H, _);
        let q = nM8[typeof _.value];
        H._zod.onattach.push(($) => {
          let K = $._zod.bag,
            O = (_.inclusive ? K.maximum : K.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
          if (_.value < O)
            if (_.inclusive) K.maximum = _.value;
            else K.exclusiveMaximum = _.value;
        }),
          (H._zod.check = ($) => {
            if (_.inclusive ? $.value <= _.value : $.value < _.value) return;
            $.issues.push({
              origin: q,
              code: "too_big",
              maximum: _.value,
              input: $.value,
              inclusive: _.inclusive,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (E1_ = G6("$ZodCheckGreaterThan", (H, _) => {
        TY.init(H, _);
        let q = nM8[typeof _.value];
        H._zod.onattach.push(($) => {
          let K = $._zod.bag,
            O = (_.inclusive ? K.minimum : K.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
          if (_.value > O)
            if (_.inclusive) K.minimum = _.value;
            else K.exclusiveMinimum = _.value;
        }),
          (H._zod.check = ($) => {
            if (_.inclusive ? $.value >= _.value : $.value > _.value) return;
            $.issues.push({
              origin: q,
              code: "too_small",
              minimum: _.value,
              input: $.value,
              inclusive: _.inclusive,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (M66 = G6("$ZodCheckMultipleOf", (H, _) => {
        TY.init(H, _),
          H._zod.onattach.push((q) => {
            var $;
            ($ = q._zod.bag).multipleOf ?? ($.multipleOf = _.value);
          }),
          (H._zod.check = (q) => {
            if (typeof q.value !== typeof _.value) throw Error("Cannot mix number and bigint in multiple_of check.");
            if (typeof q.value === "bigint" ? q.value % _.value === BigInt(0) : V_6(q.value, _.value) === 0) return;
            q.issues.push({
              origin: typeof q.value,
              code: "not_multiple_of",
              divisor: _.value,
              input: q.value,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (J66 = G6("$ZodCheckNumberFormat", (H, _) => {
        TY.init(H, _), (_.format = _.format || "float64");
        let q = _.format?.includes("int"),
          $ = q ? "int" : "number",
          [K, O] = I_6[_.format];
        H._zod.onattach.push((T) => {
          let z = T._zod.bag;
          if (((z.format = _.format), (z.minimum = K), (z.maximum = O), q)) z.pattern = z66;
        }),
          (H._zod.check = (T) => {
            let z = T.value;
            if (q) {
              if (!Number.isInteger(z)) {
                T.issues.push({ expected: $, format: _.format, code: "invalid_type", input: z, inst: H });
                return;
              }
              if (!Number.isSafeInteger(z)) {
                if (z > 0)
                  T.issues.push({
                    input: z,
                    code: "too_big",
                    maximum: Number.MAX_SAFE_INTEGER,
                    note: "Integers must be within the safe integer range.",
                    inst: H,
                    origin: $,
                    continue: !_.abort,
                  });
                else
                  T.issues.push({
                    input: z,
                    code: "too_small",
                    minimum: Number.MIN_SAFE_INTEGER,
                    note: "Integers must be within the safe integer range.",
                    inst: H,
                    origin: $,
                    continue: !_.abort,
                  });
                return;
              }
            }
            if (z < K)
              T.issues.push({
                origin: "number",
                input: z,
                code: "too_small",
                minimum: K,
                inclusive: !0,
                inst: H,
                continue: !_.abort,
              });
            if (z > O) T.issues.push({ origin: "number", input: z, code: "too_big", maximum: O, inst: H });
          });
      })),
      (P66 = G6("$ZodCheckBigIntFormat", (H, _) => {
        TY.init(H, _);
        let [q, $] = u_6[_.format];
        H._zod.onattach.push((K) => {
          let O = K._zod.bag;
          (O.format = _.format), (O.minimum = q), (O.maximum = $);
        }),
          (H._zod.check = (K) => {
            let O = K.value;
            if (O < q)
              K.issues.push({
                origin: "bigint",
                input: O,
                code: "too_small",
                minimum: q,
                inclusive: !0,
                inst: H,
                continue: !_.abort,
              });
            if (O > $) K.issues.push({ origin: "bigint", input: O, code: "too_big", maximum: $, inst: H });
          });
      })),
      (X66 = G6("$ZodCheckMaxSize", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.size !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
            if (_.maximum < $) q._zod.bag.maximum = _.maximum;
          }),
          (H._zod.check = (q) => {
            let $ = q.value;
            if ($.size <= _.maximum) return;
            q.issues.push({
              origin: CIH($),
              code: "too_big",
              maximum: _.maximum,
              input: $,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (W66 = G6("$ZodCheckMinSize", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.size !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
            if (_.minimum > $) q._zod.bag.minimum = _.minimum;
          }),
          (H._zod.check = (q) => {
            let $ = q.value;
            if ($.size >= _.minimum) return;
            q.issues.push({
              origin: CIH($),
              code: "too_small",
              minimum: _.minimum,
              input: $,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (G66 = G6("$ZodCheckSizeEquals", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.size !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag;
            ($.minimum = _.size), ($.maximum = _.size), ($.size = _.size);
          }),
          (H._zod.check = (q) => {
            let $ = q.value,
              K = $.size;
            if (K === _.size) return;
            let O = K > _.size;
            q.issues.push({
              origin: CIH($),
              ...(O ? { code: "too_big", maximum: _.size } : { code: "too_small", minimum: _.size }),
              inclusive: !0,
              exact: !0,
              input: q.value,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (R66 = G6("$ZodCheckMaxLength", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.length !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
            if (_.maximum < $) q._zod.bag.maximum = _.maximum;
          }),
          (H._zod.check = (q) => {
            let $ = q.value;
            if ($.length <= _.maximum) return;
            let O = bIH($);
            q.issues.push({
              origin: O,
              code: "too_big",
              maximum: _.maximum,
              inclusive: !0,
              input: $,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (Z66 = G6("$ZodCheckMinLength", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.length !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
            if (_.minimum > $) q._zod.bag.minimum = _.minimum;
          }),
          (H._zod.check = (q) => {
            let $ = q.value;
            if ($.length >= _.minimum) return;
            let O = bIH($);
            q.issues.push({
              origin: O,
              code: "too_small",
              minimum: _.minimum,
              inclusive: !0,
              input: $,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (L66 = G6("$ZodCheckLengthEquals", (H, _) => {
        TY.init(H, _),
          (H._zod.when = (q) => {
            let $ = q.value;
            return !Pt($) && $.length !== void 0;
          }),
          H._zod.onattach.push((q) => {
            let $ = q._zod.bag;
            ($.minimum = _.length), ($.maximum = _.length), ($.length = _.length);
          }),
          (H._zod.check = (q) => {
            let $ = q.value,
              K = $.length;
            if (K === _.length) return;
            let O = bIH($),
              T = K > _.length;
            q.issues.push({
              origin: O,
              ...(T ? { code: "too_big", maximum: _.length } : { code: "too_small", minimum: _.length }),
              inclusive: !0,
              exact: !0,
              input: q.value,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (VjH = G6("$ZodCheckStringFormat", (H, _) => {
        var q, $;
        if (
          (TY.init(H, _),
          H._zod.onattach.push((K) => {
            let O = K._zod.bag;
            if (((O.format = _.format), _.pattern)) O.patterns ?? (O.patterns = new Set()), O.patterns.add(_.pattern);
          }),
          _.pattern)
        )
          (q = H._zod).check ??
            (q.check = (K) => {
              if (((_.pattern.lastIndex = 0), _.pattern.test(K.value))) return;
              K.issues.push({
                origin: "string",
                code: "invalid_format",
                format: _.format,
                input: K.value,
                ...(_.pattern ? { pattern: _.pattern.toString() } : {}),
                inst: H,
                continue: !_.abort,
              });
            });
        else ($ = H._zod).check ?? ($.check = () => {});
      })),
      (k66 = G6("$ZodCheckRegex", (H, _) => {
        VjH.init(H, _),
          (H._zod.check = (q) => {
            if (((_.pattern.lastIndex = 0), _.pattern.test(q.value))) return;
            q.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: q.value,
              pattern: _.pattern.toString(),
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (v66 = G6("$ZodCheckLowerCase", (H, _) => {
        _.pattern ?? (_.pattern = D66), VjH.init(H, _);
      })),
      (N66 = G6("$ZodCheckUpperCase", (H, _) => {
        _.pattern ?? (_.pattern = j66), VjH.init(H, _);
      })),
      (h66 = G6("$ZodCheckIncludes", (H, _) => {
        TY.init(H, _);
        let q = wQ(_.includes),
          $ = new RegExp(typeof _.position === "number" ? `^.{${_.position}}${q}` : q);
        (_.pattern = $),
          H._zod.onattach.push((K) => {
            let O = K._zod.bag;
            O.patterns ?? (O.patterns = new Set()), O.patterns.add($);
          }),
          (H._zod.check = (K) => {
            if (K.value.includes(_.includes, _.position)) return;
            K.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "includes",
              includes: _.includes,
              input: K.value,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (y66 = G6("$ZodCheckStartsWith", (H, _) => {
        TY.init(H, _);
        let q = new RegExp(`^${wQ(_.prefix)}.*`);
        _.pattern ?? (_.pattern = q),
          H._zod.onattach.push(($) => {
            let K = $._zod.bag;
            K.patterns ?? (K.patterns = new Set()), K.patterns.add(q);
          }),
          (H._zod.check = ($) => {
            if ($.value.startsWith(_.prefix)) return;
            $.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "starts_with",
              prefix: _.prefix,
              input: $.value,
              inst: H,
              continue: !_.abort,
            });
          });
      })),
      (V66 = G6("$ZodCheckEndsWith", (H, _) => {
        TY.init(H, _);
        let q = new RegExp(`.*${wQ(_.suffix)}$`);
        _.pattern ?? (_.pattern = q),
          H._zod.onattach.push(($) => {
            let K = $._zod.bag;
            K.patterns ?? (K.patterns = new Set()), K.patterns.add(q);
          }),
          (H._zod.check = ($) => {
            if ($.value.endsWith(_.suffix)) return;
            $.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "ends_with",
              suffix: _.suffix,
              input: $.value,
              inst: H,
              continue: !_.abort,
            });
          });
      }));
    (S66 = G6("$ZodCheckProperty", (H, _) => {
      TY.init(H, _),
        (H._zod.check = (q) => {
          let $ = _.schema._zod.run({ value: q.value[_.property], issues: [] }, {});
          if ($ instanceof Promise) return $.then((K) => iM8(K, q, _.property));
          iM8($, q, _.property);
          return;
        });
    })),
      (E66 = G6("$ZodCheckMimeType", (H, _) => {
        TY.init(H, _);
        let q = new Set(_.mime);
        H._zod.onattach.push(($) => {
          $._zod.bag.mime = _.mime;
        }),
          (H._zod.check = ($) => {
            if (q.has($.value.type)) return;
            $.issues.push({ code: "invalid_value", values: _.mime, input: $.value.type, inst: H });
          });
      })),
      (C66 = G6("$ZodCheckOverwrite", (H, _) => {
        TY.init(H, _),
          (H._zod.check = (q) => {
            q.value = _.tx(q.value);
          });
      }));

    $W_();
    KW_();
    Ruq();
    KR6();
    ycH();
    (gD4 = /^c[^\s-]{8,}$/i),
      (dD4 = /^[0-9a-z]+$/),
      (cD4 = /^[0-9A-HJKMNP-TV-Z]{26}$/i),
      (FD4 = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i),
      (UD4 = /^[a-z0-9_-]{21}$/i),
      (QD4 = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
      (lD4 =
        /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/),
      (iD4 = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i),
      (rD4 =
        /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/),
      (oD4 =
        /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/),
      (aD4 =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/),
      (sD4 =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/),
      (tD4 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/),
      (eD4 = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/),
      (H24 = new RegExp(`^${kuq}$`));
    Ju = class Ju extends SK {
      _parse(H) {
        if (this._def.coerce) H.data = String(H.data);
        if (this._getType(H) !== Sq.string) {
          let K = this._getOrReturnCtx(H);
          return z7(K, { code: e8.invalid_type, expected: Sq.string, received: K.parsedType }), p$;
        }
        let q = new CX(),
          $ = void 0;
        for (let K of this._def.checks)
          if (K.kind === "min") {
            if (H.data.length < K.value)
              ($ = this._getOrReturnCtx(H, $)),
                z7($, {
                  code: e8.too_small,
                  minimum: K.value,
                  type: "string",
                  inclusive: !0,
                  exact: !1,
                  message: K.message,
                }),
                q.dirty();
          } else if (K.kind === "max") {
            if (H.data.length > K.value)
              ($ = this._getOrReturnCtx(H, $)),
                z7($, {
                  code: e8.too_big,
                  maximum: K.value,
                  type: "string",
                  inclusive: !0,
                  exact: !1,
                  message: K.message,
                }),
                q.dirty();
          } else if (K.kind === "length") {
            let O = H.data.length > K.value,
              T = H.data.length < K.value;
            if (O || T) {
              if ((($ = this._getOrReturnCtx(H, $)), O))
                z7($, {
                  code: e8.too_big,
                  maximum: K.value,
                  type: "string",
                  inclusive: !0,
                  exact: !0,
                  message: K.message,
                });
              else if (T)
                z7($, {
                  code: e8.too_small,
                  minimum: K.value,
                  type: "string",
                  inclusive: !0,
                  exact: !0,
                  message: K.message,
                });
              q.dirty();
            }
          } else if (K.kind === "email") {
            if (!iD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "email", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "emoji") {
            if (!OR6) OR6 = new RegExp(nD4, "u");
            if (!OR6.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "emoji", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "uuid") {
            if (!FD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "uuid", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "nanoid") {
            if (!UD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "nanoid", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "cuid") {
            if (!gD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "cuid", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "cuid2") {
            if (!dD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "cuid2", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "ulid") {
            if (!cD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "ulid", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "url")
            try {
              new URL(H.data);
            } catch {
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "url", code: e8.invalid_string, message: K.message }),
                q.dirty();
            }
          else if (K.kind === "regex") {
            if (((K.regex.lastIndex = 0), !K.regex.test(H.data)))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "regex", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "trim") H.data = H.data.trim();
          else if (K.kind === "includes") {
            if (!H.data.includes(K.value, K.position))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, {
                  code: e8.invalid_string,
                  validation: { includes: K.value, position: K.position },
                  message: K.message,
                }),
                q.dirty();
          } else if (K.kind === "toLowerCase") H.data = H.data.toLowerCase();
          else if (K.kind === "toUpperCase") H.data = H.data.toUpperCase();
          else if (K.kind === "startsWith") {
            if (!H.data.startsWith(K.value))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { code: e8.invalid_string, validation: { startsWith: K.value }, message: K.message }),
                q.dirty();
          } else if (K.kind === "endsWith") {
            if (!H.data.endsWith(K.value))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { code: e8.invalid_string, validation: { endsWith: K.value }, message: K.message }),
                q.dirty();
          } else if (K.kind === "datetime") {
            if (!Nuq(K).test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { code: e8.invalid_string, validation: "datetime", message: K.message }),
                q.dirty();
          } else if (K.kind === "date") {
            if (!H24.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { code: e8.invalid_string, validation: "date", message: K.message }),
                q.dirty();
          } else if (K.kind === "time") {
            if (!_24(K).test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { code: e8.invalid_string, validation: "time", message: K.message }),
                q.dirty();
          } else if (K.kind === "duration") {
            if (!lD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "duration", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "ip") {
            if (!q24(H.data, K.version))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "ip", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "jwt") {
            if (!$24(H.data, K.alg))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "jwt", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "cidr") {
            if (!K24(H.data, K.version))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "cidr", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "base64") {
            if (!tD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "base64", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else if (K.kind === "base64url") {
            if (!eD4.test(H.data))
              ($ = this._getOrReturnCtx(H, $)),
                z7($, { validation: "base64url", code: e8.invalid_string, message: K.message }),
                q.dirty();
          } else _5.assertNever(K);
        return { status: q.value, value: H.data };
      }
      _regex(H, _, q) {
        return this.refinement(($) => H.test($), { validation: _, code: e8.invalid_string, ...J9.errToObj(q) });
      }
      _addCheck(H) {
        return new Ju({ ...this._def, checks: [...this._def.checks, H] });
      }
      email(H) {
        return this._addCheck({ kind: "email", ...J9.errToObj(H) });
      }
      url(H) {
        return this._addCheck({ kind: "url", ...J9.errToObj(H) });
      }
      emoji(H) {
        return this._addCheck({ kind: "emoji", ...J9.errToObj(H) });
      }
      uuid(H) {
        return this._addCheck({ kind: "uuid", ...J9.errToObj(H) });
      }
      nanoid(H) {
        return this._addCheck({ kind: "nanoid", ...J9.errToObj(H) });
      }
      cuid(H) {
        return this._addCheck({ kind: "cuid", ...J9.errToObj(H) });
      }
      cuid2(H) {
        return this._addCheck({ kind: "cuid2", ...J9.errToObj(H) });
      }
      ulid(H) {
        return this._addCheck({ kind: "ulid", ...J9.errToObj(H) });
      }
      base64(H) {
        return this._addCheck({ kind: "base64", ...J9.errToObj(H) });
      }
      base64url(H) {
        return this._addCheck({ kind: "base64url", ...J9.errToObj(H) });
      }
      jwt(H) {
        return this._addCheck({ kind: "jwt", ...J9.errToObj(H) });
      }
      ip(H) {
        return this._addCheck({ kind: "ip", ...J9.errToObj(H) });
      }
      cidr(H) {
        return this._addCheck({ kind: "cidr", ...J9.errToObj(H) });
      }
      datetime(H) {
        if (typeof H === "string")
          return this._addCheck({ kind: "datetime", precision: null, offset: !1, local: !1, message: H });
        return this._addCheck({
          kind: "datetime",
          precision: typeof H?.precision > "u" ? null : H?.precision,
          offset: H?.offset ?? !1,
          local: H?.local ?? !1,
          ...J9.errToObj(H?.message),
        });
      }
      date(H) {
        return this._addCheck({ kind: "date", message: H });
      }
      time(H) {
        if (typeof H === "string") return this._addCheck({ kind: "time", precision: null, message: H });
        return this._addCheck({
          kind: "time",
          precision: typeof H?.precision > "u" ? null : H?.precision,
          ...J9.errToObj(H?.message),
        });
      }
      duration(H) {
        return this._addCheck({ kind: "duration", ...J9.errToObj(H) });
      }
      regex(H, _) {
        return this._addCheck({ kind: "regex", regex: H, ...J9.errToObj(_) });
      }
      includes(H, _) {
        return this._addCheck({ kind: "includes", value: H, position: _?.position, ...J9.errToObj(_?.message) });
      }
      startsWith(H, _) {
        return this._addCheck({ kind: "startsWith", value: H, ...J9.errToObj(_) });
      }
      endsWith(H, _) {
        return this._addCheck({ kind: "endsWith", value: H, ...J9.errToObj(_) });
      }
      min(H, _) {
        return this._addCheck({ kind: "min", value: H, ...J9.errToObj(_) });
      }
      max(H, _) {
        return this._addCheck({ kind: "max", value: H, ...J9.errToObj(_) });
      }
      length(H, _) {
        return this._addCheck({ kind: "length", value: H, ...J9.errToObj(_) });
      }
      nonempty(H) {
        return this.min(1, J9.errToObj(H));
      }
      trim() {
        return new Ju({ ...this._def, checks: [...this._def.checks, { kind: "trim" }] });
      }
      toLowerCase() {
        return new Ju({ ...this._def, checks: [...this._def.checks, { kind: "toLowerCase" }] });
      }
      toUpperCase() {
        return new Ju({ ...this._def, checks: [...this._def.checks, { kind: "toUpperCase" }] });
      }
      get isDatetime() {
        return !!this._def.checks.find((H) => H.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((H) => H.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((H) => H.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((H) => H.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((H) => H.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((H) => H.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((H) => H.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((H) => H.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((H) => H.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((H) => H.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((H) => H.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((H) => H.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((H) => H.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((H) => H.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((H) => H.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((H) => H.kind === "base64url");
      }
      get minLength() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "min") {
            if (H === null || _.value > H) H = _.value;
          }
        return H;
      }
      get maxLength() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "max") {
            if (H === null || _.value < H) H = _.value;
          }
        return H;
      }
    };
    Ju.create = (H) => {
      return new Ju({ checks: [], typeName: _4.ZodString, coerce: H?.coerce ?? !1, ...g1(H) });
    };
    f_H = class f_H extends SK {
      constructor() {
        super(...arguments);
        (this.min = this.gte), (this.max = this.lte), (this.step = this.multipleOf);
      }
      _parse(H) {
        if (this._def.coerce) H.data = Number(H.data);
        if (this._getType(H) !== Sq.number) {
          let K = this._getOrReturnCtx(H);
          return z7(K, { code: e8.invalid_type, expected: Sq.number, received: K.parsedType }), p$;
        }
        let q = void 0,
          $ = new CX();
        for (let K of this._def.checks)
          if (K.kind === "int") {
            if (!_5.isInteger(H.data))
              (q = this._getOrReturnCtx(H, q)),
                z7(q, { code: e8.invalid_type, expected: "integer", received: "float", message: K.message }),
                $.dirty();
          } else if (K.kind === "min") {
            if (K.inclusive ? H.data < K.value : H.data <= K.value)
              (q = this._getOrReturnCtx(H, q)),
                z7(q, {
                  code: e8.too_small,
                  minimum: K.value,
                  type: "number",
                  inclusive: K.inclusive,
                  exact: !1,
                  message: K.message,
                }),
                $.dirty();
          } else if (K.kind === "max") {
            if (K.inclusive ? H.data > K.value : H.data >= K.value)
              (q = this._getOrReturnCtx(H, q)),
                z7(q, {
                  code: e8.too_big,
                  maximum: K.value,
                  type: "number",
                  inclusive: K.inclusive,
                  exact: !1,
                  message: K.message,
                }),
                $.dirty();
          } else if (K.kind === "multipleOf") {
            if (O24(H.data, K.value) !== 0)
              (q = this._getOrReturnCtx(H, q)),
                z7(q, { code: e8.not_multiple_of, multipleOf: K.value, message: K.message }),
                $.dirty();
          } else if (K.kind === "finite") {
            if (!Number.isFinite(H.data))
              (q = this._getOrReturnCtx(H, q)), z7(q, { code: e8.not_finite, message: K.message }), $.dirty();
          } else _5.assertNever(K);
        return { status: $.value, value: H.data };
      }
      gte(H, _) {
        return this.setLimit("min", H, !0, J9.toString(_));
      }
      gt(H, _) {
        return this.setLimit("min", H, !1, J9.toString(_));
      }
      lte(H, _) {
        return this.setLimit("max", H, !0, J9.toString(_));
      }
      lt(H, _) {
        return this.setLimit("max", H, !1, J9.toString(_));
      }
      setLimit(H, _, q, $) {
        return new f_H({
          ...this._def,
          checks: [...this._def.checks, { kind: H, value: _, inclusive: q, message: J9.toString($) }],
        });
      }
      _addCheck(H) {
        return new f_H({ ...this._def, checks: [...this._def.checks, H] });
      }
      int(H) {
        return this._addCheck({ kind: "int", message: J9.toString(H) });
      }
      positive(H) {
        return this._addCheck({ kind: "min", value: 0, inclusive: !1, message: J9.toString(H) });
      }
      negative(H) {
        return this._addCheck({ kind: "max", value: 0, inclusive: !1, message: J9.toString(H) });
      }
      nonpositive(H) {
        return this._addCheck({ kind: "max", value: 0, inclusive: !0, message: J9.toString(H) });
      }
      nonnegative(H) {
        return this._addCheck({ kind: "min", value: 0, inclusive: !0, message: J9.toString(H) });
      }
      multipleOf(H, _) {
        return this._addCheck({ kind: "multipleOf", value: H, message: J9.toString(_) });
      }
      finite(H) {
        return this._addCheck({ kind: "finite", message: J9.toString(H) });
      }
      safe(H) {
        return this._addCheck({
          kind: "min",
          inclusive: !0,
          value: Number.MIN_SAFE_INTEGER,
          message: J9.toString(H),
        })._addCheck({ kind: "max", inclusive: !0, value: Number.MAX_SAFE_INTEGER, message: J9.toString(H) });
      }
      get minValue() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "min") {
            if (H === null || _.value > H) H = _.value;
          }
        return H;
      }
      get maxValue() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "max") {
            if (H === null || _.value < H) H = _.value;
          }
        return H;
      }
      get isInt() {
        return !!this._def.checks.find((H) => H.kind === "int" || (H.kind === "multipleOf" && _5.isInteger(H.value)));
      }
      get isFinite() {
        let H = null,
          _ = null;
        for (let q of this._def.checks)
          if (q.kind === "finite" || q.kind === "int" || q.kind === "multipleOf") return !0;
          else if (q.kind === "min") {
            if (_ === null || q.value > _) _ = q.value;
          } else if (q.kind === "max") {
            if (H === null || q.value < H) H = q.value;
          }
        return Number.isFinite(_) && Number.isFinite(H);
      }
    };
    f_H.create = (H) => {
      return new f_H({ checks: [], typeName: _4.ZodNumber, coerce: H?.coerce || !1, ...g1(H) });
    };
    w_H = class w_H extends SK {
      constructor() {
        super(...arguments);
        (this.min = this.gte), (this.max = this.lte);
      }
      _parse(H) {
        if (this._def.coerce)
          try {
            H.data = BigInt(H.data);
          } catch {
            return this._getInvalidInput(H);
          }
        if (this._getType(H) !== Sq.bigint) return this._getInvalidInput(H);
        let q = void 0,
          $ = new CX();
        for (let K of this._def.checks)
          if (K.kind === "min") {
            if (K.inclusive ? H.data < K.value : H.data <= K.value)
              (q = this._getOrReturnCtx(H, q)),
                z7(q, {
                  code: e8.too_small,
                  type: "bigint",
                  minimum: K.value,
                  inclusive: K.inclusive,
                  message: K.message,
                }),
                $.dirty();
          } else if (K.kind === "max") {
            if (K.inclusive ? H.data > K.value : H.data >= K.value)
              (q = this._getOrReturnCtx(H, q)),
                z7(q, {
                  code: e8.too_big,
                  type: "bigint",
                  maximum: K.value,
                  inclusive: K.inclusive,
                  message: K.message,
                }),
                $.dirty();
          } else if (K.kind === "multipleOf") {
            if (H.data % K.value !== BigInt(0))
              (q = this._getOrReturnCtx(H, q)),
                z7(q, { code: e8.not_multiple_of, multipleOf: K.value, message: K.message }),
                $.dirty();
          } else _5.assertNever(K);
        return { status: $.value, value: H.data };
      }
      _getInvalidInput(H) {
        let _ = this._getOrReturnCtx(H);
        return z7(_, { code: e8.invalid_type, expected: Sq.bigint, received: _.parsedType }), p$;
      }
      gte(H, _) {
        return this.setLimit("min", H, !0, J9.toString(_));
      }
      gt(H, _) {
        return this.setLimit("min", H, !1, J9.toString(_));
      }
      lte(H, _) {
        return this.setLimit("max", H, !0, J9.toString(_));
      }
      lt(H, _) {
        return this.setLimit("max", H, !1, J9.toString(_));
      }
      setLimit(H, _, q, $) {
        return new w_H({
          ...this._def,
          checks: [...this._def.checks, { kind: H, value: _, inclusive: q, message: J9.toString($) }],
        });
      }
      _addCheck(H) {
        return new w_H({ ...this._def, checks: [...this._def.checks, H] });
      }
      positive(H) {
        return this._addCheck({ kind: "min", value: BigInt(0), inclusive: !1, message: J9.toString(H) });
      }
      negative(H) {
        return this._addCheck({ kind: "max", value: BigInt(0), inclusive: !1, message: J9.toString(H) });
      }
      nonpositive(H) {
        return this._addCheck({ kind: "max", value: BigInt(0), inclusive: !0, message: J9.toString(H) });
      }
      nonnegative(H) {
        return this._addCheck({ kind: "min", value: BigInt(0), inclusive: !0, message: J9.toString(H) });
      }
      multipleOf(H, _) {
        return this._addCheck({ kind: "multipleOf", value: H, message: J9.toString(_) });
      }
      get minValue() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "min") {
            if (H === null || _.value > H) H = _.value;
          }
        return H;
      }
      get maxValue() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "max") {
            if (H === null || _.value < H) H = _.value;
          }
        return H;
      }
    };
    w_H.create = (H) => {
      return new w_H({ checks: [], typeName: _4.ZodBigInt, coerce: H?.coerce ?? !1, ...g1(H) });
    };
    BWH = class BWH extends SK {
      _parse(H) {
        if (this._def.coerce) H.data = Boolean(H.data);
        if (this._getType(H) !== Sq.boolean) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.boolean, received: q.parsedType }), p$;
        }
        return HG(H.data);
      }
    };
    BWH.create = (H) => {
      return new BWH({ typeName: _4.ZodBoolean, coerce: H?.coerce || !1, ...g1(H) });
    };
    M3H = class M3H extends SK {
      _parse(H) {
        if (this._def.coerce) H.data = new Date(H.data);
        if (this._getType(H) !== Sq.date) {
          let K = this._getOrReturnCtx(H);
          return z7(K, { code: e8.invalid_type, expected: Sq.date, received: K.parsedType }), p$;
        }
        if (Number.isNaN(H.data.getTime())) {
          let K = this._getOrReturnCtx(H);
          return z7(K, { code: e8.invalid_date }), p$;
        }
        let q = new CX(),
          $ = void 0;
        for (let K of this._def.checks)
          if (K.kind === "min") {
            if (H.data.getTime() < K.value)
              ($ = this._getOrReturnCtx(H, $)),
                z7($, {
                  code: e8.too_small,
                  message: K.message,
                  inclusive: !0,
                  exact: !1,
                  minimum: K.value,
                  type: "date",
                }),
                q.dirty();
          } else if (K.kind === "max") {
            if (H.data.getTime() > K.value)
              ($ = this._getOrReturnCtx(H, $)),
                z7($, {
                  code: e8.too_big,
                  message: K.message,
                  inclusive: !0,
                  exact: !1,
                  maximum: K.value,
                  type: "date",
                }),
                q.dirty();
          } else _5.assertNever(K);
        return { status: q.value, value: new Date(H.data.getTime()) };
      }
      _addCheck(H) {
        return new M3H({ ...this._def, checks: [...this._def.checks, H] });
      }
      min(H, _) {
        return this._addCheck({ kind: "min", value: H.getTime(), message: J9.toString(_) });
      }
      max(H, _) {
        return this._addCheck({ kind: "max", value: H.getTime(), message: J9.toString(_) });
      }
      get minDate() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "min") {
            if (H === null || _.value > H) H = _.value;
          }
        return H != null ? new Date(H) : null;
      }
      get maxDate() {
        let H = null;
        for (let _ of this._def.checks)
          if (_.kind === "max") {
            if (H === null || _.value < H) H = _.value;
          }
        return H != null ? new Date(H) : null;
      }
    };
    M3H.create = (H) => {
      return new M3H({ checks: [], coerce: H?.coerce || !1, typeName: _4.ZodDate, ...g1(H) });
    };
    ScH = class ScH extends SK {
      _parse(H) {
        if (this._getType(H) !== Sq.symbol) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.symbol, received: q.parsedType }), p$;
        }
        return HG(H.data);
      }
    };
    ScH.create = (H) => {
      return new ScH({ typeName: _4.ZodSymbol, ...g1(H) });
    };
    gWH = class gWH extends SK {
      _parse(H) {
        if (this._getType(H) !== Sq.undefined) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.undefined, received: q.parsedType }), p$;
        }
        return HG(H.data);
      }
    };
    gWH.create = (H) => {
      return new gWH({ typeName: _4.ZodUndefined, ...g1(H) });
    };
    dWH = class dWH extends SK {
      _parse(H) {
        if (this._getType(H) !== Sq.null) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.null, received: q.parsedType }), p$;
        }
        return HG(H.data);
      }
    };
    dWH.create = (H) => {
      return new dWH({ typeName: _4.ZodNull, ...g1(H) });
    };
    J3H = class J3H extends SK {
      constructor() {
        super(...arguments);
        this._any = !0;
      }
      _parse(H) {
        return HG(H.data);
      }
    };
    J3H.create = (H) => {
      return new J3H({ typeName: _4.ZodAny, ...g1(H) });
    };
    A_H = class A_H extends SK {
      constructor() {
        super(...arguments);
        this._unknown = !0;
      }
      _parse(H) {
        return HG(H.data);
      }
    };
    A_H.create = (H) => {
      return new A_H({ typeName: _4.ZodUnknown, ...g1(H) });
    };
    wg = class wg extends SK {
      _parse(H) {
        let _ = this._getOrReturnCtx(H);
        return z7(_, { code: e8.invalid_type, expected: Sq.never, received: _.parsedType }), p$;
      }
    };
    wg.create = (H) => {
      return new wg({ typeName: _4.ZodNever, ...g1(H) });
    };
    EcH = class EcH extends SK {
      _parse(H) {
        if (this._getType(H) !== Sq.undefined) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.void, received: q.parsedType }), p$;
        }
        return HG(H.data);
      }
    };
    EcH.create = (H) => {
      return new EcH({ typeName: _4.ZodVoid, ...g1(H) });
    };
    Pu = class Pu extends SK {
      _parse(H) {
        let { ctx: _, status: q } = this._processInputParams(H),
          $ = this._def;
        if (_.parsedType !== Sq.array)
          return z7(_, { code: e8.invalid_type, expected: Sq.array, received: _.parsedType }), p$;
        if ($.exactLength !== null) {
          let O = _.data.length > $.exactLength.value,
            T = _.data.length < $.exactLength.value;
          if (O || T)
            z7(_, {
              code: O ? e8.too_big : e8.too_small,
              minimum: T ? $.exactLength.value : void 0,
              maximum: O ? $.exactLength.value : void 0,
              type: "array",
              inclusive: !0,
              exact: !0,
              message: $.exactLength.message,
            }),
              q.dirty();
        }
        if ($.minLength !== null) {
          if (_.data.length < $.minLength.value)
            z7(_, {
              code: e8.too_small,
              minimum: $.minLength.value,
              type: "array",
              inclusive: !0,
              exact: !1,
              message: $.minLength.message,
            }),
              q.dirty();
        }
        if ($.maxLength !== null) {
          if (_.data.length > $.maxLength.value)
            z7(_, {
              code: e8.too_big,
              maximum: $.maxLength.value,
              type: "array",
              inclusive: !0,
              exact: !1,
              message: $.maxLength.message,
            }),
              q.dirty();
        }
        if (_.common.async)
          return Promise.all(
            [..._.data].map((O, T) => {
              return $.type._parseAsync(new Wu(_, O, _.path, T));
            }),
          ).then((O) => {
            return CX.mergeArray(q, O);
          });
        let K = [..._.data].map((O, T) => {
          return $.type._parseSync(new Wu(_, O, _.path, T));
        });
        return CX.mergeArray(q, K);
      }
      get element() {
        return this._def.type;
      }
      min(H, _) {
        return new Pu({ ...this._def, minLength: { value: H, message: J9.toString(_) } });
      }
      max(H, _) {
        return new Pu({ ...this._def, maxLength: { value: H, message: J9.toString(_) } });
      }
      length(H, _) {
        return new Pu({ ...this._def, exactLength: { value: H, message: J9.toString(_) } });
      }
      nonempty(H) {
        return this.min(1, H);
      }
    };
    Pu.create = (H, _) => {
      return new Pu({ type: H, minLength: null, maxLength: null, exactLength: null, typeName: _4.ZodArray, ...g1(_) });
    };
    RY = class RY extends SK {
      constructor() {
        super(...arguments);
        (this._cached = null), (this.nonstrict = this.passthrough), (this.augment = this.extend);
      }
      _getCached() {
        if (this._cached !== null) return this._cached;
        let H = this._def.shape(),
          _ = _5.objectKeys(H);
        return (this._cached = { shape: H, keys: _ }), this._cached;
      }
      _parse(H) {
        if (this._getType(H) !== Sq.object) {
          let A = this._getOrReturnCtx(H);
          return z7(A, { code: e8.invalid_type, expected: Sq.object, received: A.parsedType }), p$;
        }
        let { status: q, ctx: $ } = this._processInputParams(H),
          { shape: K, keys: O } = this._getCached(),
          T = [];
        if (!(this._def.catchall instanceof wg && this._def.unknownKeys === "strip")) {
          for (let A in $.data) if (!O.includes(A)) T.push(A);
        }
        let z = [];
        for (let A of O) {
          let f = K[A],
            w = $.data[A];
          z.push({
            key: { status: "valid", value: A },
            value: f._parse(new Wu($, w, $.path, A)),
            alwaysSet: A in $.data,
          });
        }
        if (this._def.catchall instanceof wg) {
          let A = this._def.unknownKeys;
          if (A === "passthrough")
            for (let f of T)
              z.push({ key: { status: "valid", value: f }, value: { status: "valid", value: $.data[f] } });
          else if (A === "strict") {
            if (T.length > 0) z7($, { code: e8.unrecognized_keys, keys: T }), q.dirty();
          } else if (A === "strip");
          else throw Error("Internal ZodObject error: invalid unknownKeys value.");
        } else {
          let A = this._def.catchall;
          for (let f of T) {
            let w = $.data[f];
            z.push({
              key: { status: "valid", value: f },
              value: A._parse(new Wu($, w, $.path, f)),
              alwaysSet: f in $.data,
            });
          }
        }
        if ($.common.async)
          return Promise.resolve()
            .then(async () => {
              let A = [];
              for (let f of z) {
                let w = await f.key,
                  Y = await f.value;
                A.push({ key: w, value: Y, alwaysSet: f.alwaysSet });
              }
              return A;
            })
            .then((A) => {
              return CX.mergeObjectSync(q, A);
            });
        else return CX.mergeObjectSync(q, z);
      }
      get shape() {
        return this._def.shape();
      }
      strict(H) {
        return (
          J9.errToObj,
          new RY({
            ...this._def,
            unknownKeys: "strict",
            ...(H !== void 0
              ? {
                  errorMap: (_, q) => {
                    let $ = this._def.errorMap?.(_, q).message ?? q.defaultError;
                    if (_.code === "unrecognized_keys") return { message: J9.errToObj(H).message ?? $ };
                    return { message: $ };
                  },
                }
              : {}),
          })
        );
      }
      strip() {
        return new RY({ ...this._def, unknownKeys: "strip" });
      }
      passthrough() {
        return new RY({ ...this._def, unknownKeys: "passthrough" });
      }
      extend(H) {
        return new RY({ ...this._def, shape: () => ({ ...this._def.shape(), ...H }) });
      }
      merge(H) {
        return new RY({
          unknownKeys: H._def.unknownKeys,
          catchall: H._def.catchall,
          shape: () => ({ ...this._def.shape(), ...H._def.shape() }),
          typeName: _4.ZodObject,
        });
      }
      setKey(H, _) {
        return this.augment({ [H]: _ });
      }
      catchall(H) {
        return new RY({ ...this._def, catchall: H });
      }
      pick(H) {
        let _ = {};
        for (let q of _5.objectKeys(H)) if (H[q] && this.shape[q]) _[q] = this.shape[q];
        return new RY({ ...this._def, shape: () => _ });
      }
      omit(H) {
        let _ = {};
        for (let q of _5.objectKeys(this.shape)) if (!H[q]) _[q] = this.shape[q];
        return new RY({ ...this._def, shape: () => _ });
      }
      deepPartial() {
        return mWH(this);
      }
      partial(H) {
        let _ = {};
        for (let q of _5.objectKeys(this.shape)) {
          let $ = this.shape[q];
          if (H && !H[q]) _[q] = $;
          else _[q] = $.optional();
        }
        return new RY({ ...this._def, shape: () => _ });
      }
      required(H) {
        let _ = {};
        for (let q of _5.objectKeys(this.shape))
          if (H && !H[q]) _[q] = this.shape[q];
          else {
            let K = this.shape[q];
            while (K instanceof Xu) K = K._def.innerType;
            _[q] = K;
          }
        return new RY({ ...this._def, shape: () => _ });
      }
      keyof() {
        return huq(_5.objectKeys(this.shape));
      }
    };
    RY.create = (H, _) => {
      return new RY({ shape: () => H, unknownKeys: "strip", catchall: wg.create(), typeName: _4.ZodObject, ...g1(_) });
    };
    RY.strictCreate = (H, _) => {
      return new RY({ shape: () => H, unknownKeys: "strict", catchall: wg.create(), typeName: _4.ZodObject, ...g1(_) });
    };
    RY.lazycreate = (H, _) => {
      return new RY({ shape: H, unknownKeys: "strip", catchall: wg.create(), typeName: _4.ZodObject, ...g1(_) });
    };
    cWH = class cWH extends SK {
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H),
          q = this._def.options;
        function $(K) {
          for (let T of K) if (T.result.status === "valid") return T.result;
          for (let T of K)
            if (T.result.status === "dirty") return _.common.issues.push(...T.ctx.common.issues), T.result;
          let O = K.map((T) => new Nk(T.ctx.common.issues));
          return z7(_, { code: e8.invalid_union, unionErrors: O }), p$;
        }
        if (_.common.async)
          return Promise.all(
            q.map(async (K) => {
              let O = { ..._, common: { ..._.common, issues: [] }, parent: null };
              return { result: await K._parseAsync({ data: _.data, path: _.path, parent: O }), ctx: O };
            }),
          ).then($);
        else {
          let K = void 0,
            O = [];
          for (let z of q) {
            let A = { ..._, common: { ..._.common, issues: [] }, parent: null },
              f = z._parseSync({ data: _.data, path: _.path, parent: A });
            if (f.status === "valid") return f;
            else if (f.status === "dirty" && !K) K = { result: f, ctx: A };
            if (A.common.issues.length) O.push(A.common.issues);
          }
          if (K) return _.common.issues.push(...K.ctx.common.issues), K.result;
          let T = O.map((z) => new Nk(z));
          return z7(_, { code: e8.invalid_union, unionErrors: T }), p$;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    cWH.create = (H, _) => {
      return new cWH({ options: H, typeName: _4.ZodUnion, ...g1(_) });
    };
    zW_ = class zW_ extends SK {
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H);
        if (_.parsedType !== Sq.object)
          return z7(_, { code: e8.invalid_type, expected: Sq.object, received: _.parsedType }), p$;
        let q = this.discriminator,
          $ = _.data[q],
          K = this.optionsMap.get($);
        if (!K)
          return (
            z7(_, { code: e8.invalid_union_discriminator, options: Array.from(this.optionsMap.keys()), path: [q] }), p$
          );
        if (_.common.async) return K._parseAsync({ data: _.data, path: _.path, parent: _ });
        else return K._parseSync({ data: _.data, path: _.path, parent: _ });
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      static create(H, _, q) {
        let $ = new Map();
        for (let K of _) {
          let O = wi(K.shape[H]);
          if (!O.length)
            throw Error(`A discriminator value for key \`${H}\` could not be extracted from all schema options`);
          for (let T of O) {
            if ($.has(T)) throw Error(`Discriminator property ${String(H)} has duplicate value ${String(T)}`);
            $.set(T, K);
          }
        }
        return new zW_({ typeName: _4.ZodDiscriminatedUnion, discriminator: H, options: _, optionsMap: $, ...g1(q) });
      }
    };
    FWH = class FWH extends SK {
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H),
          $ = (K, O) => {
            if (OW_(K) || OW_(O)) return p$;
            let T = TR6(K.value, O.value);
            if (!T.valid) return z7(q, { code: e8.invalid_intersection_types }), p$;
            if (TW_(K) || TW_(O)) _.dirty();
            return { status: _.value, value: T.data };
          };
        if (q.common.async)
          return Promise.all([
            this._def.left._parseAsync({ data: q.data, path: q.path, parent: q }),
            this._def.right._parseAsync({ data: q.data, path: q.path, parent: q }),
          ]).then(([K, O]) => $(K, O));
        else
          return $(
            this._def.left._parseSync({ data: q.data, path: q.path, parent: q }),
            this._def.right._parseSync({ data: q.data, path: q.path, parent: q }),
          );
      }
    };
    FWH.create = (H, _, q) => {
      return new FWH({ left: H, right: _, typeName: _4.ZodIntersection, ...g1(q) });
    };
    Yg = class Yg extends SK {
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H);
        if (q.parsedType !== Sq.array)
          return z7(q, { code: e8.invalid_type, expected: Sq.array, received: q.parsedType }), p$;
        if (q.data.length < this._def.items.length)
          return (
            z7(q, { code: e8.too_small, minimum: this._def.items.length, inclusive: !0, exact: !1, type: "array" }), p$
          );
        if (!this._def.rest && q.data.length > this._def.items.length)
          z7(q, { code: e8.too_big, maximum: this._def.items.length, inclusive: !0, exact: !1, type: "array" }),
            _.dirty();
        let K = [...q.data]
          .map((O, T) => {
            let z = this._def.items[T] || this._def.rest;
            if (!z) return null;
            return z._parse(new Wu(q, O, q.path, T));
          })
          .filter((O) => !!O);
        if (q.common.async)
          return Promise.all(K).then((O) => {
            return CX.mergeArray(_, O);
          });
        else return CX.mergeArray(_, K);
      }
      get items() {
        return this._def.items;
      }
      rest(H) {
        return new Yg({ ...this._def, rest: H });
      }
    };
    Yg.create = (H, _) => {
      if (!Array.isArray(H)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
      return new Yg({ items: H, typeName: _4.ZodTuple, rest: null, ...g1(_) });
    };
    CcH = class CcH extends SK {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H);
        if (q.parsedType !== Sq.object)
          return z7(q, { code: e8.invalid_type, expected: Sq.object, received: q.parsedType }), p$;
        let $ = [],
          K = this._def.keyType,
          O = this._def.valueType;
        for (let T in q.data)
          $.push({
            key: K._parse(new Wu(q, T, q.path, T)),
            value: O._parse(new Wu(q, q.data[T], q.path, T)),
            alwaysSet: T in q.data,
          });
        if (q.common.async) return CX.mergeObjectAsync(_, $);
        else return CX.mergeObjectSync(_, $);
      }
      get element() {
        return this._def.valueType;
      }
      static create(H, _, q) {
        if (_ instanceof SK) return new CcH({ keyType: H, valueType: _, typeName: _4.ZodRecord, ...g1(q) });
        return new CcH({ keyType: Ju.create(), valueType: H, typeName: _4.ZodRecord, ...g1(_) });
      }
    };
    bcH = class bcH extends SK {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H);
        if (q.parsedType !== Sq.map)
          return z7(q, { code: e8.invalid_type, expected: Sq.map, received: q.parsedType }), p$;
        let $ = this._def.keyType,
          K = this._def.valueType,
          O = [...q.data.entries()].map(([T, z], A) => {
            return {
              key: $._parse(new Wu(q, T, q.path, [A, "key"])),
              value: K._parse(new Wu(q, z, q.path, [A, "value"])),
            };
          });
        if (q.common.async) {
          let T = new Map();
          return Promise.resolve().then(async () => {
            for (let z of O) {
              let A = await z.key,
                f = await z.value;
              if (A.status === "aborted" || f.status === "aborted") return p$;
              if (A.status === "dirty" || f.status === "dirty") _.dirty();
              T.set(A.value, f.value);
            }
            return { status: _.value, value: T };
          });
        } else {
          let T = new Map();
          for (let z of O) {
            let { key: A, value: f } = z;
            if (A.status === "aborted" || f.status === "aborted") return p$;
            if (A.status === "dirty" || f.status === "dirty") _.dirty();
            T.set(A.value, f.value);
          }
          return { status: _.value, value: T };
        }
      }
    };
    bcH.create = (H, _, q) => {
      return new bcH({ valueType: _, keyType: H, typeName: _4.ZodMap, ...g1(q) });
    };
    P3H = class P3H extends SK {
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H);
        if (q.parsedType !== Sq.set)
          return z7(q, { code: e8.invalid_type, expected: Sq.set, received: q.parsedType }), p$;
        let $ = this._def;
        if ($.minSize !== null) {
          if (q.data.size < $.minSize.value)
            z7(q, {
              code: e8.too_small,
              minimum: $.minSize.value,
              type: "set",
              inclusive: !0,
              exact: !1,
              message: $.minSize.message,
            }),
              _.dirty();
        }
        if ($.maxSize !== null) {
          if (q.data.size > $.maxSize.value)
            z7(q, {
              code: e8.too_big,
              maximum: $.maxSize.value,
              type: "set",
              inclusive: !0,
              exact: !1,
              message: $.maxSize.message,
            }),
              _.dirty();
        }
        let K = this._def.valueType;
        function O(z) {
          let A = new Set();
          for (let f of z) {
            if (f.status === "aborted") return p$;
            if (f.status === "dirty") _.dirty();
            A.add(f.value);
          }
          return { status: _.value, value: A };
        }
        let T = [...q.data.values()].map((z, A) => K._parse(new Wu(q, z, q.path, A)));
        if (q.common.async) return Promise.all(T).then((z) => O(z));
        else return O(T);
      }
      min(H, _) {
        return new P3H({ ...this._def, minSize: { value: H, message: J9.toString(_) } });
      }
      max(H, _) {
        return new P3H({ ...this._def, maxSize: { value: H, message: J9.toString(_) } });
      }
      size(H, _) {
        return this.min(H, _).max(H, _);
      }
      nonempty(H) {
        return this.min(1, H);
      }
    };
    P3H.create = (H, _) => {
      return new P3H({ valueType: H, minSize: null, maxSize: null, typeName: _4.ZodSet, ...g1(_) });
    };
    pWH = class pWH extends SK {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H);
        if (_.parsedType !== Sq.function)
          return z7(_, { code: e8.invalid_type, expected: Sq.function, received: _.parsedType }), p$;
        function q(T, z) {
          return VcH({
            data: T,
            path: _.path,
            errorMaps: [_.common.contextualErrorMap, _.schemaErrorMap, uWH(), fi].filter((A) => !!A),
            issueData: { code: e8.invalid_arguments, argumentsError: z },
          });
        }
        function $(T, z) {
          return VcH({
            data: T,
            path: _.path,
            errorMaps: [_.common.contextualErrorMap, _.schemaErrorMap, uWH(), fi].filter((A) => !!A),
            issueData: { code: e8.invalid_return_type, returnTypeError: z },
          });
        }
        let K = { errorMap: _.common.contextualErrorMap },
          O = _.data;
        if (this._def.returns instanceof X3H) {
          let T = this;
          return HG(async function (...z) {
            let A = new Nk([]),
              f = await T._def.args.parseAsync(z, K).catch((D) => {
                throw (A.addIssue(q(z, D)), A);
              }),
              w = await Reflect.apply(O, this, f);
            return await T._def.returns._def.type.parseAsync(w, K).catch((D) => {
              throw (A.addIssue($(w, D)), A);
            });
          });
        } else {
          let T = this;
          return HG(function (...z) {
            let A = T._def.args.safeParse(z, K);
            if (!A.success) throw new Nk([q(z, A.error)]);
            let f = Reflect.apply(O, this, A.data),
              w = T._def.returns.safeParse(f, K);
            if (!w.success) throw new Nk([$(f, w.error)]);
            return w.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...H) {
        return new pWH({ ...this._def, args: Yg.create(H).rest(A_H.create()) });
      }
      returns(H) {
        return new pWH({ ...this._def, returns: H });
      }
      implement(H) {
        return this.parse(H);
      }
      strictImplement(H) {
        return this.parse(H);
      }
      static create(H, _, q) {
        return new pWH({
          args: H ? H : Yg.create([]).rest(A_H.create()),
          returns: _ || A_H.create(),
          typeName: _4.ZodFunction,
          ...g1(q),
        });
      }
    };
    UWH = class UWH extends SK {
      get schema() {
        return this._def.getter();
      }
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H);
        return this._def.getter()._parse({ data: _.data, path: _.path, parent: _ });
      }
    };
    UWH.create = (H, _) => {
      return new UWH({ getter: H, typeName: _4.ZodLazy, ...g1(_) });
    };
    QWH = class QWH extends SK {
      _parse(H) {
        if (H.data !== this._def.value) {
          let _ = this._getOrReturnCtx(H);
          return z7(_, { received: _.data, code: e8.invalid_literal, expected: this._def.value }), p$;
        }
        return { status: "valid", value: H.data };
      }
      get value() {
        return this._def.value;
      }
    };
    QWH.create = (H, _) => {
      return new QWH({ value: H, typeName: _4.ZodLiteral, ...g1(_) });
    };
    Y_H = class Y_H extends SK {
      _parse(H) {
        if (typeof H.data !== "string") {
          let _ = this._getOrReturnCtx(H),
            q = this._def.values;
          return z7(_, { expected: _5.joinValues(q), received: _.parsedType, code: e8.invalid_type }), p$;
        }
        if (!this._cache) this._cache = new Set(this._def.values);
        if (!this._cache.has(H.data)) {
          let _ = this._getOrReturnCtx(H),
            q = this._def.values;
          return z7(_, { received: _.data, code: e8.invalid_enum_value, options: q }), p$;
        }
        return HG(H.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        let H = {};
        for (let _ of this._def.values) H[_] = _;
        return H;
      }
      get Values() {
        let H = {};
        for (let _ of this._def.values) H[_] = _;
        return H;
      }
      get Enum() {
        let H = {};
        for (let _ of this._def.values) H[_] = _;
        return H;
      }
      extract(H, _ = this._def) {
        return Y_H.create(H, { ...this._def, ..._ });
      }
      exclude(H, _ = this._def) {
        return Y_H.create(
          this.options.filter((q) => !H.includes(q)),
          { ...this._def, ..._ },
        );
      }
    };
    Y_H.create = huq;
    lWH = class lWH extends SK {
      _parse(H) {
        let _ = _5.getValidEnumValues(this._def.values),
          q = this._getOrReturnCtx(H);
        if (q.parsedType !== Sq.string && q.parsedType !== Sq.number) {
          let $ = _5.objectValues(_);
          return z7(q, { expected: _5.joinValues($), received: q.parsedType, code: e8.invalid_type }), p$;
        }
        if (!this._cache) this._cache = new Set(_5.getValidEnumValues(this._def.values));
        if (!this._cache.has(H.data)) {
          let $ = _5.objectValues(_);
          return z7(q, { received: q.data, code: e8.invalid_enum_value, options: $ }), p$;
        }
        return HG(H.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    lWH.create = (H, _) => {
      return new lWH({ values: H, typeName: _4.ZodNativeEnum, ...g1(_) });
    };
    X3H = class X3H extends SK {
      unwrap() {
        return this._def.type;
      }
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H);
        if (_.parsedType !== Sq.promise && _.common.async === !1)
          return z7(_, { code: e8.invalid_type, expected: Sq.promise, received: _.parsedType }), p$;
        let q = _.parsedType === Sq.promise ? _.data : Promise.resolve(_.data);
        return HG(
          q.then(($) => {
            return this._def.type.parseAsync($, { path: _.path, errorMap: _.common.contextualErrorMap });
          }),
        );
      }
    };
    X3H.create = (H, _) => {
      return new X3H({ type: H, typeName: _4.ZodPromise, ...g1(_) });
    };
    Gu = class Gu extends SK {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === _4.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H),
          $ = this._def.effect || null,
          K = {
            addIssue: (O) => {
              if ((z7(q, O), O.fatal)) _.abort();
              else _.dirty();
            },
            get path() {
              return q.path;
            },
          };
        if (((K.addIssue = K.addIssue.bind(K)), $.type === "preprocess")) {
          let O = $.transform(q.data, K);
          if (q.common.async)
            return Promise.resolve(O).then(async (T) => {
              if (_.value === "aborted") return p$;
              let z = await this._def.schema._parseAsync({ data: T, path: q.path, parent: q });
              if (z.status === "aborted") return p$;
              if (z.status === "dirty") return j3H(z.value);
              if (_.value === "dirty") return j3H(z.value);
              return z;
            });
          else {
            if (_.value === "aborted") return p$;
            let T = this._def.schema._parseSync({ data: O, path: q.path, parent: q });
            if (T.status === "aborted") return p$;
            if (T.status === "dirty") return j3H(T.value);
            if (_.value === "dirty") return j3H(T.value);
            return T;
          }
        }
        if ($.type === "refinement") {
          let O = (T) => {
            let z = $.refinement(T, K);
            if (q.common.async) return Promise.resolve(z);
            if (z instanceof Promise)
              throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            return T;
          };
          if (q.common.async === !1) {
            let T = this._def.schema._parseSync({ data: q.data, path: q.path, parent: q });
            if (T.status === "aborted") return p$;
            if (T.status === "dirty") _.dirty();
            return O(T.value), { status: _.value, value: T.value };
          } else
            return this._def.schema._parseAsync({ data: q.data, path: q.path, parent: q }).then((T) => {
              if (T.status === "aborted") return p$;
              if (T.status === "dirty") _.dirty();
              return O(T.value).then(() => {
                return { status: _.value, value: T.value };
              });
            });
        }
        if ($.type === "transform")
          if (q.common.async === !1) {
            let O = this._def.schema._parseSync({ data: q.data, path: q.path, parent: q });
            if (!z_H(O)) return p$;
            let T = $.transform(O.value, K);
            if (T instanceof Promise)
              throw Error(
                "Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.",
              );
            return { status: _.value, value: T };
          } else
            return this._def.schema._parseAsync({ data: q.data, path: q.path, parent: q }).then((O) => {
              if (!z_H(O)) return p$;
              return Promise.resolve($.transform(O.value, K)).then((T) => ({ status: _.value, value: T }));
            });
        _5.assertNever($);
      }
    };
    Gu.create = (H, _, q) => {
      return new Gu({ schema: H, typeName: _4.ZodEffects, effect: _, ...g1(q) });
    };
    Gu.createWithPreprocess = (H, _, q) => {
      return new Gu({ schema: _, effect: { type: "preprocess", transform: H }, typeName: _4.ZodEffects, ...g1(q) });
    };
    Xu = class Xu extends SK {
      _parse(H) {
        if (this._getType(H) === Sq.undefined) return HG(void 0);
        return this._def.innerType._parse(H);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    Xu.create = (H, _) => {
      return new Xu({ innerType: H, typeName: _4.ZodOptional, ...g1(_) });
    };
    Yi = class Yi extends SK {
      _parse(H) {
        if (this._getType(H) === Sq.null) return HG(null);
        return this._def.innerType._parse(H);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    Yi.create = (H, _) => {
      return new Yi({ innerType: H, typeName: _4.ZodNullable, ...g1(_) });
    };
    iWH = class iWH extends SK {
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H),
          q = _.data;
        if (_.parsedType === Sq.undefined) q = this._def.defaultValue();
        return this._def.innerType._parse({ data: q, path: _.path, parent: _ });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    iWH.create = (H, _) => {
      return new iWH({
        innerType: H,
        typeName: _4.ZodDefault,
        defaultValue: typeof _.default === "function" ? _.default : () => _.default,
        ...g1(_),
      });
    };
    nWH = class nWH extends SK {
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H),
          q = { ..._, common: { ..._.common, issues: [] } },
          $ = this._def.innerType._parse({ data: q.data, path: q.path, parent: { ...q } });
        if (xWH($))
          return $.then((K) => {
            return {
              status: "valid",
              value:
                K.status === "valid"
                  ? K.value
                  : this._def.catchValue({
                      get error() {
                        return new Nk(q.common.issues);
                      },
                      input: q.data,
                    }),
            };
          });
        else
          return {
            status: "valid",
            value:
              $.status === "valid"
                ? $.value
                : this._def.catchValue({
                    get error() {
                      return new Nk(q.common.issues);
                    },
                    input: q.data,
                  }),
          };
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    nWH.create = (H, _) => {
      return new nWH({
        innerType: H,
        typeName: _4.ZodCatch,
        catchValue: typeof _.catch === "function" ? _.catch : () => _.catch,
        ...g1(_),
      });
    };
    IcH = class IcH extends SK {
      _parse(H) {
        if (this._getType(H) !== Sq.nan) {
          let q = this._getOrReturnCtx(H);
          return z7(q, { code: e8.invalid_type, expected: Sq.nan, received: q.parsedType }), p$;
        }
        return { status: "valid", value: H.data };
      }
    };
    IcH.create = (H) => {
      return new IcH({ typeName: _4.ZodNaN, ...g1(H) });
    };
    T24 = Symbol("zod_brand");
    AW_ = class AW_ extends SK {
      _parse(H) {
        let { ctx: _ } = this._processInputParams(H),
          q = _.data;
        return this._def.type._parse({ data: q, path: _.path, parent: _ });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ucH = class ucH extends SK {
      _parse(H) {
        let { status: _, ctx: q } = this._processInputParams(H);
        if (q.common.async)
          return (async () => {
            let K = await this._def.in._parseAsync({ data: q.data, path: q.path, parent: q });
            if (K.status === "aborted") return p$;
            if (K.status === "dirty") return _.dirty(), j3H(K.value);
            else return this._def.out._parseAsync({ data: K.value, path: q.path, parent: q });
          })();
        else {
          let $ = this._def.in._parseSync({ data: q.data, path: q.path, parent: q });
          if ($.status === "aborted") return p$;
          if ($.status === "dirty") return _.dirty(), { status: "dirty", value: $.value };
          else return this._def.out._parseSync({ data: $.value, path: q.path, parent: q });
        }
      }
      static create(H, _) {
        return new ucH({ in: H, out: _, typeName: _4.ZodPipeline });
      }
    };
    rWH = class rWH extends SK {
      _parse(H) {
        let _ = this._def.innerType._parse(H),
          q = ($) => {
            if (z_H($)) $.value = Object.freeze($.value);
            return $;
          };
        return xWH(_) ? _.then(($) => q($)) : q(_);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    rWH.create = (H, _) => {
      return new rWH({ innerType: H, typeName: _4.ZodReadonly, ...g1(_) });
    };
    z24 = { object: RY.lazycreate };
    (function (H) {
      (H.ZodString = "ZodString"),
        (H.ZodNumber = "ZodNumber"),
        (H.ZodNaN = "ZodNaN"),
        (H.ZodBigInt = "ZodBigInt"),
        (H.ZodBoolean = "ZodBoolean"),
        (H.ZodDate = "ZodDate"),
        (H.ZodSymbol = "ZodSymbol"),
        (H.ZodUndefined = "ZodUndefined"),
        (H.ZodNull = "ZodNull"),
        (H.ZodAny = "ZodAny"),
        (H.ZodUnknown = "ZodUnknown"),
        (H.ZodNever = "ZodNever"),
        (H.ZodVoid = "ZodVoid"),
        (H.ZodArray = "ZodArray"),
        (H.ZodObject = "ZodObject"),
        (H.ZodUnion = "ZodUnion"),
        (H.ZodDiscriminatedUnion = "ZodDiscriminatedUnion"),
        (H.ZodIntersection = "ZodIntersection"),
        (H.ZodTuple = "ZodTuple"),
        (H.ZodRecord = "ZodRecord"),
        (H.ZodMap = "ZodMap"),
        (H.ZodSet = "ZodSet"),
        (H.ZodFunction = "ZodFunction"),
        (H.ZodLazy = "ZodLazy"),
        (H.ZodLiteral = "ZodLiteral"),
        (H.ZodEnum = "ZodEnum"),
        (H.ZodEffects = "ZodEffects"),
        (H.ZodNativeEnum = "ZodNativeEnum"),
        (H.ZodOptional = "ZodOptional"),
        (H.ZodNullable = "ZodNullable"),
        (H.ZodDefault = "ZodDefault"),
        (H.ZodCatch = "ZodCatch"),
        (H.ZodPromise = "ZodPromise"),
        (H.ZodBranded = "ZodBranded"),
        (H.ZodPipeline = "ZodPipeline"),
        (H.ZodReadonly = "ZodReadonly");
    })(_4 || (_4 = {}));
    (l8 = Ju.create),
      (qE = f_H.create),
      (f24 = IcH.create),
      (w24 = w_H.create),
      (lJ = BWH.create),
      (Y24 = M3H.create),
      (D24 = ScH.create),
      (j24 = gWH.create),
      (M24 = dWH.create),
      (J24 = J3H.create),
      (P24 = A_H.create),
      (X24 = wg.create),
      (W24 = EcH.create),
      (vD = Pu.create),
      (ih = RY.create),
      (nh = RY.strictCreate),
      (W3H = cWH.create),
      (G24 = zW_.create),
      (R24 = FWH.create),
      (Z24 = Yg.create),
      (Ru = CcH.create),
      (L24 = bcH.create),
      (k24 = P3H.create),
      (v24 = pWH.create),
      (N24 = UWH.create),
      (h24 = QWH.create),
      (Zu = Y_H.create),
      (y24 = lWH.create),
      (V24 = X3H.create),
      (S24 = Gu.create),
      (E24 = Xu.create),
      (C24 = Yi.create),
      (b24 = Gu.createWithPreprocess),
      (I24 = ucH.create),
      (p24 = {
        string: (H) => Ju.create({ ...H, coerce: !0 }),
        number: (H) => f_H.create({ ...H, coerce: !0 }),
        boolean: (H) => BWH.create({ ...H, coerce: !0 }),
        bigint: (H) => w_H.create({ ...H, coerce: !0 }),
        date: (H) => M3H.create({ ...H, coerce: !0 }),
      }),
      (B24 = p$);

  var _k = d((G1) => {
    var YX$ = F16(),
      DX$ = (H, _, q = ($) => $) => H,
      jX$ = (H) => {
        switch (H) {
          case "true":
            return !0;
          case "false":
            return !1;
          default:
            throw Error(`Unable to parse boolean value "${H}"`);
        }
      },
      MX$ = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H === "number") {
          if (H === 0 || H === 1) cxH.warn(HO_(`Expected boolean, got ${typeof H}: ${H}`));
          if (H === 0) return !1;
          if (H === 1) return !0;
        }
        if (typeof H === "string") {
          let _ = H.toLowerCase();
          if (_ === "false" || _ === "true") cxH.warn(HO_(`Expected boolean, got ${typeof H}: ${H}`));
          if (_ === "false") return !1;
          if (_ === "true") return !0;
        }
        if (typeof H === "boolean") return H;
        throw TypeError(`Expected boolean, got ${typeof H}: ${H}`);
      },
      gxH = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H === "string") {
          let _ = parseFloat(H);
          if (!Number.isNaN(_)) {
            if (String(_) !== String(H)) cxH.warn(HO_(`Expected number but observed string: ${H}`));
            return _;
          }
        }
        if (typeof H === "number") return H;
        throw TypeError(`Expected number, got ${typeof H}: ${H}`);
      },
      JX$ = Math.ceil(340282346638528860000000000000000000000),
      e3_ = (H) => {
        let _ = gxH(H);
        if (_ !== void 0 && !Number.isNaN(_) && _ !== 1 / 0 && _ !== -1 / 0) {
          if (Math.abs(_) > JX$) throw TypeError(`Expected 32-bit float, got ${H}`);
        }
        return _;
      },
      dxH = (H) => {
        if (H === null || H === void 0) return;
        if (Number.isInteger(H) && !Number.isNaN(H)) return H;
        throw TypeError(`Expected integer, got ${typeof H}: ${H}`);
      },
      PX$ = dxH,
      Q16 = (H) => n16(H, 32),
      l16 = (H) => n16(H, 16),
      i16 = (H) => n16(H, 8),
      n16 = (H, _) => {
        let q = dxH(H);
        if (q !== void 0 && XX$(q, _) !== q) throw TypeError(`Expected ${_}-bit integer, got ${H}`);
        return q;
      },
      XX$ = (H, _) => {
        switch (_) {
          case 32:
            return Int32Array.of(H)[0];
          case 16:
            return Int16Array.of(H)[0];
          case 8:
            return Int8Array.of(H)[0];
        }
      },
      WX$ = (H, _) => {
        if (H === null || H === void 0) {
          if (_) throw TypeError(`Expected a non-null value for ${_}`);
          throw TypeError("Expected a non-null value");
        }
        return H;
      },
      xy8 = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H === "object" && !Array.isArray(H)) return H;
        let _ = Array.isArray(H) ? "array" : typeof H;
        throw TypeError(`Expected object, got ${_}: ${H}`);
      },
      GX$ = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H === "string") return H;
        if (["boolean", "number", "bigint"].includes(typeof H))
          return cxH.warn(HO_(`Expected string, got ${typeof H}: ${H}`)), String(H);
        throw TypeError(`Expected string, got ${typeof H}: ${H}`);
      },
      RX$ = (H) => {
        if (H === null || H === void 0) return;
        let _ = xy8(H),
          q = Object.entries(_)
            .filter(([, $]) => $ != null)
            .map(([$]) => $);
        if (q.length === 0) throw TypeError("Unions must have exactly one non-null member. None were found.");
        if (q.length > 1) throw TypeError(`Unions must have exactly one non-null member. Keys ${q} were not null.`);
        return _;
      },
      r16 = (H) => {
        if (typeof H == "string") return gxH(FMH(H));
        return gxH(H);
      },
      ZX$ = r16,
      my8 = (H) => {
        if (typeof H == "string") return e3_(FMH(H));
        return e3_(H);
      },
      LX$ = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g,
      FMH = (H) => {
        let _ = H.match(LX$);
        if (_ === null || _[0].length !== H.length) throw TypeError("Expected real number, got implicit NaN");
        return parseFloat(H);
      },
      o16 = (H) => {
        if (typeof H == "string") return py8(H);
        return gxH(H);
      },
      kX$ = o16,
      vX$ = o16,
      NX$ = (H) => {
        if (typeof H == "string") return py8(H);
        return e3_(H);
      },
      py8 = (H) => {
        switch (H) {
          case "NaN":
            return NaN;
          case "Infinity":
            return 1 / 0;
          case "-Infinity":
            return -1 / 0;
          default:
            throw Error(`Unable to parse float value: ${H}`);
        }
      },
      By8 = (H) => {
        if (typeof H === "string") return dxH(FMH(H));
        return dxH(H);
      },
      hX$ = By8,
      yX$ = (H) => {
        if (typeof H === "string") return Q16(FMH(H));
        return Q16(H);
      },
      dMH = (H) => {
        if (typeof H === "string") return l16(FMH(H));
        return l16(H);
      },
      gy8 = (H) => {
        if (typeof H === "string") return i16(FMH(H));
        return i16(H);
      },
      HO_ = (H) => {
        return String(TypeError(H).stack || H)
          .split(`
`)
          .slice(0, 5)
          .filter((_) => !_.includes("stackTraceWarning"))
          .join(`
`);
      },
      cxH = { warn: console.warn },
      VX$ = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      a16 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function SX$(H) {
      let _ = H.getUTCFullYear(),
        q = H.getUTCMonth(),
        $ = H.getUTCDay(),
        K = H.getUTCDate(),
        O = H.getUTCHours(),
        T = H.getUTCMinutes(),
        z = H.getUTCSeconds(),
        A = K < 10 ? `0${K}` : `${K}`,
        f = O < 10 ? `0${O}` : `${O}`,
        w = T < 10 ? `0${T}` : `${T}`,
        Y = z < 10 ? `0${z}` : `${z}`;
      return `${VX$[$]}, ${A} ${a16[q]} ${_} ${f}:${w}:${Y} GMT`;
    }
    var EX$ = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/),
      CX$ = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H !== "string") throw TypeError("RFC-3339 date-times must be expressed as strings");
        let _ = EX$.exec(H);
        if (!_) throw TypeError("Invalid RFC-3339 date-time value");
        let [q, $, K, O, T, z, A, f] = _,
          w = dMH(cMH($)),
          Y = TB(K, "month", 1, 12),
          D = TB(O, "day", 1, 31);
        return BxH(w, Y, D, { hours: T, minutes: z, seconds: A, fractionalMilliseconds: f });
      },
      bX$ = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/),
      IX$ = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H !== "string") throw TypeError("RFC-3339 date-times must be expressed as strings");
        let _ = bX$.exec(H);
        if (!_) throw TypeError("Invalid RFC-3339 date-time value");
        let [q, $, K, O, T, z, A, f, w] = _,
          Y = dMH(cMH($)),
          D = TB(K, "month", 1, 12),
          j = TB(O, "day", 1, 31),
          M = BxH(Y, D, j, { hours: T, minutes: z, seconds: A, fractionalMilliseconds: f });
        if (w.toUpperCase() != "Z") M.setTime(M.getTime() - iX$(w));
        return M;
      },
      uX$ = new RegExp(
        /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/,
      ),
      xX$ = new RegExp(
        /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/,
      ),
      mX$ = new RegExp(
        /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/,
      ),
      pX$ = (H) => {
        if (H === null || H === void 0) return;
        if (typeof H !== "string") throw TypeError("RFC-7231 date-times must be expressed as strings");
        let _ = uX$.exec(H);
        if (_) {
          let [q, $, K, O, T, z, A, f] = _;
          return BxH(dMH(cMH(O)), U16(K), TB($, "day", 1, 31), {
            hours: T,
            minutes: z,
            seconds: A,
            fractionalMilliseconds: f,
          });
        }
        if (((_ = xX$.exec(H)), _)) {
          let [q, $, K, O, T, z, A, f] = _;
          return cX$(
            BxH(gX$(O), U16(K), TB($, "day", 1, 31), { hours: T, minutes: z, seconds: A, fractionalMilliseconds: f }),
          );
        }
        if (((_ = mX$.exec(H)), _)) {
          let [q, $, K, O, T, z, A, f] = _;
          return BxH(dMH(cMH(f)), U16($), TB(K.trimLeft(), "day", 1, 31), {
            hours: O,
            minutes: T,
            seconds: z,
            fractionalMilliseconds: A,
          });
        }
        throw TypeError("Invalid RFC-7231 date-time value");
      },
      BX$ = (H) => {
        if (H === null || H === void 0) return;
        let _;
        if (typeof H === "number") _ = H;
        else if (typeof H === "string") _ = r16(H);
        else if (typeof H === "object" && H.tag === 1) _ = H.value;
        else
          throw TypeError(
            "Epoch timestamps must be expressed as floating point numbers or their string representation",
          );
        if (Number.isNaN(_) || _ === 1 / 0 || _ === -1 / 0)
          throw TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
        return new Date(Math.round(_ * 1000));
      },
      BxH = (H, _, q, $) => {
        let K = _ - 1;
        return (
          UX$(H, K, q),
          new Date(
            Date.UTC(
              H,
              K,
              q,
              TB($.hours, "hour", 0, 23),
              TB($.minutes, "minute", 0, 59),
              TB($.seconds, "seconds", 0, 60),
              lX$($.fractionalMilliseconds),
            ),
          )
        );
      },
      gX$ = (H) => {
        let _ = new Date().getUTCFullYear(),
          q = Math.floor(_ / 100) * 100 + dMH(cMH(H));
        if (q < _) return q + 100;
        return q;
      },
      dX$ = 1576800000000,
      cX$ = (H) => {
        if (H.getTime() - new Date().getTime() > dX$)
          return new Date(
            Date.UTC(
              H.getUTCFullYear() - 100,
              H.getUTCMonth(),
              H.getUTCDate(),
              H.getUTCHours(),
              H.getUTCMinutes(),
              H.getUTCSeconds(),
              H.getUTCMilliseconds(),
            ),
          );
        return H;
      },
      U16 = (H) => {
        let _ = a16.indexOf(H);
        if (_ < 0) throw TypeError(`Invalid month: ${H}`);
        return _ + 1;
      },
      FX$ = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      UX$ = (H, _, q) => {
        let $ = FX$[_];
        if (_ === 1 && QX$(H)) $ = 29;
        if (q > $) throw TypeError(`Invalid day for ${a16[_]} in ${H}: ${q}`);
      },
      QX$ = (H) => {
        return H % 4 === 0 && (H % 100 !== 0 || H % 400 === 0);
      },
      TB = (H, _, q, $) => {
        let K = gy8(cMH(H));
        if (K < q || K > $) throw TypeError(`${_} must be between ${q} and ${$}, inclusive`);
        return K;
      },
      lX$ = (H) => {
        if (H === null || H === void 0) return 0;
        return my8("0." + H) * 1000;
      },
      iX$ = (H) => {
        let _ = H[0],
          q = 1;
        if (_ == "+") q = 1;
        else if (_ == "-") q = -1;
        else throw TypeError(`Offset direction, ${_}, must be "+" or "-"`);
        let $ = Number(H.substring(1, 3)),
          K = Number(H.substring(4, 6));
        return q * ($ * 60 + K) * 60 * 1000;
      },
      cMH = (H) => {
        let _ = 0;
        while (_ < H.length - 1 && H.charAt(_) === "0") _++;
        if (_ === 0) return H;
        return H.slice(_);
      },
      I1H = function (_) {
        return Object.assign(new String(_), {
          deserializeJSON() {
            return JSON.parse(String(_));
          },
          toString() {
            return String(_);
          },
          toJSON() {
            return String(_);
          },
        });
      };
    I1H.from = (H) => {
      if (H && typeof H === "object" && (H instanceof I1H || "deserializeJSON" in H)) return H;
      else if (typeof H === "string" || Object.getPrototypeOf(H) === String.prototype) return I1H(String(H));
      return I1H(JSON.stringify(H));
    };
    I1H.fromObject = I1H.from;
    function nX$(H) {
      if (H.includes(",") || H.includes('"')) H = `"${H.replace(/"/g, '\\"')}"`;
      return H;
    }
    var s16 = "(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?",
      t16 = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)",
      e16 = "(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?",
      dy8 = "(\\d?\\d)",
      cy8 = "(\\d{4})",
      rX$ = new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/),
      oX$ = new RegExp(`^${s16}, ${dy8} ${t16} ${cy8} ${e16} GMT$`),
      aX$ = new RegExp(`^${s16}, ${dy8}-${t16}-(\\d\\d) ${e16} GMT$`),
      sX$ = new RegExp(`^${s16} ${t16} ( [1-9]|\\d\\d) ${e16} ${cy8}$`),
      tX$ = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      eX$ = (H) => {
        if (H == null) return;
        let _ = NaN;
        if (typeof H === "number") _ = H;
        else if (typeof H === "string") {
          if (!/^-?\d*\.?\d+$/.test(H)) throw TypeError("parseEpochTimestamp - numeric string invalid.");
          _ = Number.parseFloat(H);
        } else if (typeof H === "object" && H.tag === 1) _ = H.value;
        if (isNaN(_) || Math.abs(_) === 1 / 0) throw TypeError("Epoch timestamps must be valid finite numbers.");
        return new Date(Math.round(_ * 1000));
      },
      HW$ = (H) => {
        if (H == null) return;
        if (typeof H !== "string") throw TypeError("RFC3339 timestamps must be strings");
        let _ = rX$.exec(H);
        if (!_) throw TypeError(`Invalid RFC3339 timestamp format ${H}`);
        let [, q, $, K, O, T, z, , A, f] = _;
        uQ($, 1, 12), uQ(K, 1, 31), uQ(O, 0, 23), uQ(T, 0, 59), uQ(z, 0, 60);
        let w = new Date(
          Date.UTC(
            Number(q),
            Number($) - 1,
            Number(K),
            Number(O),
            Number(T),
            Number(z),
            Number(A) ? Math.round(parseFloat(`0.${A}`) * 1000) : 0,
          ),
        );
        if ((w.setUTCFullYear(Number(q)), f.toUpperCase() != "Z")) {
          let [, Y, D, j] = /([+-])(\d\d):(\d\d)/.exec(f) || [void 0, "+", 0, 0],
            M = Y === "-" ? 1 : -1;
          w.setTime(w.getTime() + M * (Number(D) * 60 * 60 * 1000 + Number(j) * 60 * 1000));
        }
        return w;
      },
      _W$ = (H) => {
        if (H == null) return;
        if (typeof H !== "string") throw TypeError("RFC7231 timestamps must be strings.");
        let _, q, $, K, O, T, z, A;
        if ((A = oX$.exec(H))) [, _, q, $, K, O, T, z] = A;
        else if ((A = aX$.exec(H))) ([, _, q, $, K, O, T, z] = A), ($ = (Number($) + 1900).toString());
        else if ((A = sX$.exec(H))) [, q, _, K, O, T, z, $] = A;
        if ($ && T) {
          let f = Date.UTC(
            Number($),
            tX$.indexOf(q),
            Number(_),
            Number(K),
            Number(O),
            Number(T),
            z ? Math.round(parseFloat(`0.${z}`) * 1000) : 0,
          );
          uQ(_, 1, 31), uQ(K, 0, 23), uQ(O, 0, 59), uQ(T, 0, 60);
          let w = new Date(f);
          return w.setUTCFullYear(Number($)), w;
        }
        throw TypeError(`Invalid RFC7231 date-time value ${H}.`);
      };
    function uQ(H, _, q) {
      let $ = Number(H);
      if ($ < _ || $ > q) throw Error(`Value ${$} out of range [${_}, ${q}]`);
    }
    function qW$(H, _, q) {
      if (q <= 0 || !Number.isInteger(q)) throw Error("Invalid number of delimiters (" + q + ") for splitEvery.");
      let $ = H.split(_);
      if (q === 1) return $;
      let K = [],
        O = "";
      for (let T = 0; T < $.length; T++) {
        if (O === "") O = $[T];
        else O += _ + $[T];
        if ((T + 1) % q === 0) K.push(O), (O = "");
      }
      if (O !== "") K.push(O);
      return K;
    }
    var $W$ = (H) => {
        let _ = H.length,
          q = [],
          $ = !1,
          K = void 0,
          O = 0;
        for (let T = 0; T < _; ++T) {
          let z = H[T];
          switch (z) {
            case '"':
              if (K !== "\\") $ = !$;
              break;
            case ",":
              if (!$) q.push(H.slice(O, T)), (O = T + 1);
              break;
          }
          K = z;
        }
        return (
          q.push(H.slice(O)),
          q.map((T) => {
            T = T.trim();
            let z = T.length;
            if (z < 2) return T;
            if (T[0] === '"' && T[z - 1] === '"') T = T.slice(1, z - 1);
            return T.replace(/\\"/g, '"');
          })
        );
      },
      uy8 = /^-?\d*(\.\d+)?$/;
    class _O_ {
      string;
      type;
      constructor(H, _) {
        if (((this.string = H), (this.type = _), !uy8.test(H)))
          throw Error(
            '@smithy/core/serde - NumericValue must only contain [0-9], at most one decimal point ".", and an optional negation prefix "-".',
          );
      }
      toString() {
        return this.string;
      }
      static [Symbol.hasInstance](H) {
        if (!H || typeof H !== "object") return !1;
        let _ = H;
        return _O_.prototype.isPrototypeOf(H) || (_.type === "bigDecimal" && uy8.test(_.string));
      }
    }
    function KW$(H) {
      return new _O_(String(H), "bigDecimal");
    }
    Object.defineProperty(G1, "generateIdempotencyToken", {
      enumerable: !0,
      get: function () {
        return YX$.v4;
      },
    });
    G1.LazyJsonString = I1H;
    G1.NumericValue = _O_;
    G1._parseEpochTimestamp = eX$;
    G1._parseRfc3339DateTimeWithOffset = HW$;
    G1._parseRfc7231DateTime = _W$;
    G1.copyDocumentWithTransform = DX$;
    G1.dateToUtcString = SX$;
    G1.expectBoolean = MX$;
    G1.expectByte = i16;
    G1.expectFloat32 = e3_;
    G1.expectInt = PX$;
    G1.expectInt32 = Q16;
    G1.expectLong = dxH;
    G1.expectNonNull = WX$;
    G1.expectNumber = gxH;
    G1.expectObject = xy8;
    G1.expectShort = l16;
    G1.expectString = GX$;
    G1.expectUnion = RX$;
    G1.handleFloat = kX$;
    G1.limitedParseDouble = o16;
    G1.limitedParseFloat = vX$;
    G1.limitedParseFloat32 = NX$;
    G1.logger = cxH;
    G1.nv = KW$;
    G1.parseBoolean = jX$;
    G1.parseEpochTimestamp = BX$;
    G1.parseRfc3339DateTime = CX$;
    G1.parseRfc3339DateTimeWithOffset = IX$;
    G1.parseRfc7231DateTime = pX$;
    G1.quoteHeader = nX$;
    G1.splitEvery = qW$;
    G1.splitHeader = $W$;
    G1.strictParseByte = gy8;
    G1.strictParseDouble = r16;
    G1.strictParseFloat = ZX$;
    G1.strictParseFloat32 = my8;
    G1.strictParseInt = hX$;
    G1.strictParseInt32 = yX$;
    G1.strictParseLong = By8;
    G1.strictParseShort = dMH;
  });

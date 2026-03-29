  var SG8 = d((qsK, VG8) => {
    var eK,
      Gw$ = z$6(),
      Rw$ = J08(),
      Zw$ = X08(),
      Lw$ = G08(),
      kw$ = Z08(),
      YMH = k08(),
      wMH = T5_(),
      vw$ = h08(),
      Nw$ = V08(),
      hw$ = E08(),
      yw$ = b08(),
      Vw$ = u08(),
      Sw$ = m08(),
      Ew$ = B08(),
      Cw$ = F08(),
      hG8 = Function,
      M$6 = function (H) {
        try {
          return hG8('"use strict"; return (' + H + ").constructor;")();
        } catch (_) {}
      },
      cuH = A$6(),
      bw$ = n08(),
      J$6 = function () {
        throw new wMH();
      },
      Iw$ = cuH
        ? (function () {
            try {
              return arguments.callee, J$6;
            } catch (H) {
              try {
                return cuH(arguments, "callee").get;
              } catch (_) {
                return J$6;
              }
            }
          })()
        : J$6,
      AMH = s08()(),
      SJ = LG8(),
      uw$ = Y$6(),
      xw$ = w$6(),
      yG8 = D$6(),
      FuH = f5_(),
      fMH = {},
      mw$ = typeof Uint8Array > "u" || !SJ ? eK : SJ(Uint8Array),
      w1H = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError > "u" ? eK : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer > "u" ? eK : ArrayBuffer,
        "%ArrayIteratorPrototype%": AMH && SJ ? SJ([][Symbol.iterator]()) : eK,
        "%AsyncFromSyncIteratorPrototype%": eK,
        "%AsyncFunction%": fMH,
        "%AsyncGenerator%": fMH,
        "%AsyncGeneratorFunction%": fMH,
        "%AsyncIteratorPrototype%": fMH,
        "%Atomics%": typeof Atomics > "u" ? eK : Atomics,
        "%BigInt%": typeof BigInt > "u" ? eK : BigInt,
        "%BigInt64Array%": typeof BigInt64Array > "u" ? eK : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array > "u" ? eK : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView > "u" ? eK : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": Rw$,
        "%eval%": eval,
        "%EvalError%": Zw$,
        "%Float16Array%": typeof Float16Array > "u" ? eK : Float16Array,
        "%Float32Array%": typeof Float32Array > "u" ? eK : Float32Array,
        "%Float64Array%": typeof Float64Array > "u" ? eK : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? eK : FinalizationRegistry,
        "%Function%": hG8,
        "%GeneratorFunction%": fMH,
        "%Int8Array%": typeof Int8Array > "u" ? eK : Int8Array,
        "%Int16Array%": typeof Int16Array > "u" ? eK : Int16Array,
        "%Int32Array%": typeof Int32Array > "u" ? eK : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": AMH && SJ ? SJ(SJ([][Symbol.iterator]())) : eK,
        "%JSON%": typeof JSON === "object" ? JSON : eK,
        "%Map%": typeof Map > "u" ? eK : Map,
        "%MapIteratorPrototype%": typeof Map > "u" || !AMH || !SJ ? eK : SJ(new Map()[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": Gw$,
        "%Object.getOwnPropertyDescriptor%": cuH,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise > "u" ? eK : Promise,
        "%Proxy%": typeof Proxy > "u" ? eK : Proxy,
        "%RangeError%": Lw$,
        "%ReferenceError%": kw$,
        "%Reflect%": typeof Reflect > "u" ? eK : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set > "u" ? eK : Set,
        "%SetIteratorPrototype%": typeof Set > "u" || !AMH || !SJ ? eK : SJ(new Set()[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? eK : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": AMH && SJ ? SJ(""[Symbol.iterator]()) : eK,
        "%Symbol%": AMH ? Symbol : eK,
        "%SyntaxError%": YMH,
        "%ThrowTypeError%": Iw$,
        "%TypedArray%": mw$,
        "%TypeError%": wMH,
        "%Uint8Array%": typeof Uint8Array > "u" ? eK : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? eK : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array > "u" ? eK : Uint16Array,
        "%Uint32Array%": typeof Uint32Array > "u" ? eK : Uint32Array,
        "%URIError%": vw$,
        "%WeakMap%": typeof WeakMap > "u" ? eK : WeakMap,
        "%WeakRef%": typeof WeakRef > "u" ? eK : WeakRef,
        "%WeakSet%": typeof WeakSet > "u" ? eK : WeakSet,
        "%Function.prototype.call%": FuH,
        "%Function.prototype.apply%": yG8,
        "%Object.defineProperty%": bw$,
        "%Object.getPrototypeOf%": uw$,
        "%Math.abs%": Nw$,
        "%Math.floor%": hw$,
        "%Math.max%": yw$,
        "%Math.min%": Vw$,
        "%Math.pow%": Sw$,
        "%Math.round%": Ew$,
        "%Math.sign%": Cw$,
        "%Reflect.getPrototypeOf%": xw$,
      };
    if (SJ)
      try {
        null.error;
      } catch (H) {
        (P$6 = SJ(SJ(H))), (w1H["%Error.prototype%"] = P$6);
      }
    var P$6,
      pw$ = function H(_) {
        var q;
        if (_ === "%AsyncFunction%") q = M$6("async function () {}");
        else if (_ === "%GeneratorFunction%") q = M$6("function* () {}");
        else if (_ === "%AsyncGeneratorFunction%") q = M$6("async function* () {}");
        else if (_ === "%AsyncGenerator%") {
          var $ = H("%AsyncGeneratorFunction%");
          if ($) q = $.prototype;
        } else if (_ === "%AsyncIteratorPrototype%") {
          var K = H("%AsyncGenerator%");
          if (K && SJ) q = SJ(K.prototype);
        }
        return (w1H[_] = q), q;
      },
      vG8 = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"],
      },
      UuH = duH(),
      Y5_ = w5_(),
      Bw$ = UuH.call(FuH, Array.prototype.concat),
      gw$ = UuH.call(yG8, Array.prototype.splice),
      NG8 = UuH.call(FuH, String.prototype.replace),
      D5_ = UuH.call(FuH, String.prototype.slice),
      dw$ = UuH.call(FuH, RegExp.prototype.exec),
      cw$ = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,
      Fw$ = /\\(\\)?/g,
      Uw$ = function (_) {
        var q = D5_(_, 0, 1),
          $ = D5_(_, -1);
        if (q === "%" && $ !== "%") throw new YMH("invalid intrinsic syntax, expected closing `%`");
        else if ($ === "%" && q !== "%") throw new YMH("invalid intrinsic syntax, expected opening `%`");
        var K = [];
        return (
          NG8(_, cw$, function (O, T, z, A) {
            K[K.length] = z ? NG8(A, Fw$, "$1") : T || O;
          }),
          K
        );
      },
      Qw$ = function (_, q) {
        var $ = _,
          K;
        if (Y5_(vG8, $)) (K = vG8[$]), ($ = "%" + K[0] + "%");
        if (Y5_(w1H, $)) {
          var O = w1H[$];
          if (O === fMH) O = pw$($);
          if (typeof O > "u" && !q)
            throw new wMH("intrinsic " + _ + " exists, but is not available. Please file an issue!");
          return { alias: K, name: $, value: O };
        }
        throw new YMH("intrinsic " + _ + " does not exist!");
      };
    VG8.exports = function (_, q) {
      if (typeof _ !== "string" || _.length === 0) throw new wMH("intrinsic name must be a non-empty string");
      if (arguments.length > 1 && typeof q !== "boolean") throw new wMH('"allowMissing" argument must be a boolean');
      if (dw$(/^%?[^%]*%?$/, _) === null)
        throw new YMH("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      var $ = Uw$(_),
        K = $.length > 0 ? $[0] : "",
        O = Qw$("%" + K + "%", q),
        T = O.name,
        z = O.value,
        A = !1,
        f = O.alias;
      if (f) (K = f[0]), gw$($, Bw$([0, 1], f));
      for (var w = 1, Y = !0; w < $.length; w += 1) {
        var D = $[w],
          j = D5_(D, 0, 1),
          M = D5_(D, -1);
        if ((j === '"' || j === "'" || j === "`" || M === '"' || M === "'" || M === "`") && j !== M)
          throw new YMH("property names with quotes must have matching quotes");
        if (D === "constructor" || !Y) A = !0;
        if (((K += "." + D), (T = "%" + K + "%"), Y5_(w1H, T))) z = w1H[T];
        else if (z != null) {
          if (!(D in z)) {
            if (!q) throw new wMH("base intrinsic for " + _ + " exists, but the property is not available.");
            return;
          }
          if (cuH && w + 1 >= $.length) {
            var J = cuH(z, D);
            if (((Y = !!J), Y && "get" in J && !("originalValue" in J.get))) z = J.get;
            else z = z[D];
          } else (Y = Y5_(z, D)), (z = z[D]);
          if (Y && !A) w1H[T] = z;
        }
      }
      return z;
    };
  });

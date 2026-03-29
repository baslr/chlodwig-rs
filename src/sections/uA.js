    ({ toString: dA$ } = Object.prototype),
      ({ getPrototypeOf: H$6 } = Object),
      ({ iterator: q5_, toStringTag: uW8 } = Symbol),
      ($5_ = ((H) => (_) => {
        let q = dA$.call(_);
        return H[q] || (H[q] = q.slice(8, -1).toLowerCase());
      })(Object.create(null))),
      ({ isArray: zMH } = Array),
      (TMH = K5_("undefined"));
    xW8 = PI("ArrayBuffer");
    (FA$ = K5_("string")),
      (oL = K5_("function")),
      (mW8 = K5_("number")),
      (lA$ = PI("Date")),
      (iA$ = PI("File")),
      (oA$ = PI("Blob")),
      (aA$ = PI("FileList"));
    (CW8 = tA$()),
      (bW8 = typeof CW8.FormData < "u" ? CW8.FormData : void 0),
      (Hf$ = PI("URLSearchParams")),
      ([_f$, qf$, $f$, Kf$] = ["ReadableStream", "Request", "Response", "Headers"].map(PI));
    f1H = (() => {
      if (typeof globalThis < "u") return globalThis;
      return typeof self < "u" ? self : typeof window < "u" ? window : global;
    })();
    (Df$ = ((H) => {
      return (_) => {
        return H && _ instanceof H;
      };
    })(typeof Uint8Array < "u" && H$6(Uint8Array))),
      (Jf$ = PI("HTMLFormElement")),
      (IW8 = (
        ({ hasOwnProperty: H }) =>
        (_, q) =>
          H.call(_, q)
      )(Object.prototype)),
      (Xf$ = PI("RegExp"));
    (vf$ = PI("AsyncFunction")),
      (dW8 = ((H, _) => {
        if (H) return setImmediate;
        return _
          ? ((q, $) => {
              return (
                f1H.addEventListener(
                  "message",
                  ({ source: K, data: O }) => {
                    if (K === f1H && O === q) $.length && $.shift()();
                  },
                  !1,
                ),
                (K) => {
                  $.push(K), f1H.postMessage(q, "*");
                }
              );
            })(`axios@${Math.random()}`, [])
          : (q) => setTimeout(q);
      })(typeof setImmediate === "function", oL(f1H.postMessage))),
      (hf$ =
        typeof queueMicrotask < "u" ? queueMicrotask.bind(f1H) : (typeof process < "u" && process.nextTick) || dW8),
      (Q_ = {
        isArray: zMH,
        isArrayBuffer: xW8,
        isBuffer: muH,
        isFormData: eA$,
        isArrayBufferView: cA$,
        isString: FA$,
        isNumber: mW8,
        isBoolean: UA$,
        isObject: puH,
        isPlainObject: _5_,
        isEmptyObject: QA$,
        isReadableStream: _f$,
        isRequest: qf$,
        isResponse: $f$,
        isHeaders: Kf$,
        isUndefined: TMH,
        isDate: lA$,
        isFile: iA$,
        isReactNativeBlob: nA$,
        isReactNative: rA$,
        isBlob: oA$,
        isRegExp: Xf$,
        isFunction: oL,
        isStream: sA$,
        isURLSearchParams: Hf$,
        isTypedArray: Df$,
        isFileList: aA$,
        forEach: BuH,
        merge: e96,
        extend: Tf$,
        trim: Of$,
        stripBOM: zf$,
        inherits: Af$,
        toFlatObject: ff$,
        kindOf: $5_,
        kindOfTest: PI,
        endsWith: wf$,
        toArray: Yf$,
        forEachEntry: jf$,
        matchAll: Mf$,
        isHTMLForm: Jf$,
        hasOwnProperty: IW8,
        hasOwnProp: IW8,
        reduceDescriptors: gW8,
        freezeMethods: Wf$,
        toObjectSet: Gf$,
        toCamelCase: Pf$,
        noop: Rf$,
        toFiniteNumber: Zf$,
        findKey: pW8,
        global: f1H,
        isContextDefined: BW8,
        isSpecCompliantForm: Lf$,
        toJSONObject: kf$,
        isAsyncFn: vf$,
        isThenable: Nf$,
        setImmediate: dW8,
        asap: hf$,
        isIterable: yf$,
      });

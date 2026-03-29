    uA();
    G5_();
    luH();
    Xh();
    D1H();
    WI();
    HB();
    y5_();
    K46();
    (hD$ = typeof XMLHttpRequest < "u"),
      (DZ8 =
        hD$ &&
        function (H) {
          return new Promise(function (q, $) {
            let K = S5_(H),
              O = K.data,
              T = zY.from(K.headers).normalize(),
              { responseType: z, onUploadProgress: A, onDownloadProgress: f } = K,
              w,
              Y,
              D,
              j,
              M;
            function J() {
              j && j(),
                M && M(),
                K.cancelToken && K.cancelToken.unsubscribe(w),
                K.signal && K.signal.removeEventListener("abort", w);
            }
            let P = new XMLHttpRequest();
            P.open(K.method.toUpperCase(), K.url, !0), (P.timeout = K.timeout);
            function X() {
              if (!P) return;
              let W = zY.from("getAllResponseHeaders" in P && P.getAllResponseHeaders()),
                k = {
                  data: !z || z === "text" || z === "json" ? P.responseText : P.response,
                  status: P.status,
                  statusText: P.statusText,
                  headers: W,
                  config: H,
                  request: P,
                };
              _B(
                function (y) {
                  q(y), J();
                },
                function (y) {
                  $(y), J();
                },
                k,
              ),
                (P = null);
            }
            if ("onloadend" in P) P.onloadend = X;
            else
              P.onreadystatechange = function () {
                if (!P || P.readyState !== 4) return;
                if (P.status === 0 && !(P.responseURL && P.responseURL.indexOf("file:") === 0)) return;
                setTimeout(X);
              };
            if (
              ((P.onabort = function () {
                if (!P) return;
                $(new eq("Request aborted", eq.ECONNABORTED, H, P)), (P = null);
              }),
              (P.onerror = function (Z) {
                let k = Z && Z.message ? Z.message : "Network Error",
                  v = new eq(k, eq.ERR_NETWORK, H, P);
                (v.event = Z || null), $(v), (P = null);
              }),
              (P.ontimeout = function () {
                let Z = K.timeout ? "timeout of " + K.timeout + "ms exceeded" : "timeout exceeded",
                  k = K.transitional || St;
                if (K.timeoutErrorMessage) Z = K.timeoutErrorMessage;
                $(new eq(Z, k.clarifyTimeoutError ? eq.ETIMEDOUT : eq.ECONNABORTED, H, P)), (P = null);
              }),
              O === void 0 && T.setContentType(null),
              "setRequestHeader" in P)
            )
              Q_.forEach(T.toJSON(), function (Z, k) {
                P.setRequestHeader(k, Z);
              });
            if (!Q_.isUndefined(K.withCredentials)) P.withCredentials = !!K.withCredentials;
            if (z && z !== "json") P.responseType = K.responseType;
            if (f) ([D, M] = vQ(f, !0)), P.addEventListener("progress", D);
            if (A && P.upload)
              ([Y, j] = vQ(A)), P.upload.addEventListener("progress", Y), P.upload.addEventListener("loadend", j);
            if (K.cancelToken || K.signal) {
              if (
                ((w = (W) => {
                  if (!P) return;
                  $(!W || W.type ? new Wh(null, H, P) : W), P.abort(), (P = null);
                }),
                K.cancelToken && K.cancelToken.subscribe(w),
                K.signal)
              )
                K.signal.aborted ? w() : K.signal.addEventListener("abort", w);
            }
            let R = _xH(K.url);
            if (R && wO.protocols.indexOf(R) === -1) {
              $(new eq("Unsupported protocol " + R + ":", eq.ERR_BAD_REQUEST, H));
              return;
            }
            P.send(O || null);
          });
        });

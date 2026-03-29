    uA();
    G5_();
    R5_();
    J5_();
    luH();
    Xh();
    D1H();
    WI();
    yR8();
    HB();
    ER8();
    mR8();
    H46();
    dR8();
    FR8();
    y5_();
    (tR8 = u(wR8(), 1)),
      (eR8 = u(require("http"))),
      (HZ8 = u(require("https"))),
      (q46 = u(require("http2"))),
      ($46 = u(require("util"))),
      (_Z8 = u(hR8(), 1)),
      (hQ = u(require("zlib"))),
      (NQ = u(require("stream"))),
      (qZ8 = require("events")),
      (nR8 = { flush: hQ.default.constants.Z_SYNC_FLUSH, finishFlush: hQ.default.constants.Z_SYNC_FLUSH }),
      (PD$ = {
        flush: hQ.default.constants.BROTLI_OPERATION_FLUSH,
        finishFlush: hQ.default.constants.BROTLI_OPERATION_FLUSH,
      }),
      (rR8 = Q_.isFunction(hQ.default.createBrotliDecompress)),
      ({ http: XD$, https: WD$ } = _Z8.default),
      (GD$ = /https:?/),
      (oR8 = wO.protocols.map((H) => {
        return H + ":";
      }));
    RD$ = new $Z8();
    (LD$ = typeof process < "u" && Q_.kindOf(process) === "process"),
      (ND$ = {
        request(H, _) {
          let q = H.protocol + "//" + H.hostname + ":" + (H.port || (H.protocol === "https:" ? 443 : 80)),
            { http2Options: $, headers: K } = H,
            O = RD$.getSession(q, $),
            {
              HTTP2_HEADER_SCHEME: T,
              HTTP2_HEADER_METHOD: z,
              HTTP2_HEADER_PATH: A,
              HTTP2_HEADER_STATUS: f,
            } = q46.default.constants,
            w = { [T]: H.protocol.replace(":", ""), [z]: H.method, [A]: H.path };
          Q_.forEach(K, (D, j) => {
            j.charAt(0) !== ":" && (w[j] = D);
          });
          let Y = O.request(w);
          return (
            Y.once("response", (D) => {
              let j = Y;
              D = Object.assign({}, D);
              let M = D[f];
              delete D[f], (j.headers = D), (j.statusCode = +M), _(j);
            }),
            Y
          );
        },
      }),
      (OZ8 =
        LD$ &&
        function (_) {
          return kD$(async function ($, K, O) {
            let { data: T, lookup: z, family: A, httpVersion: f = 1, http2Options: w } = _,
              { responseType: Y, responseEncoding: D } = _,
              j = _.method.toUpperCase(),
              M,
              J = !1,
              P;
            if (((f = +f), Number.isNaN(f)))
              throw TypeError(`Invalid protocol version: '${_.httpVersion}' is not a number`);
            if (f !== 1 && f !== 2) throw TypeError(`Unsupported protocol version '${f}'`);
            let X = f === 2;
            if (z) {
              let HH = cR8(z, (e) => (Q_.isArray(e) ? e : [e]));
              z = (e, qH, r) => {
                HH(e, qH, ($H, DH, fH) => {
                  if ($H) return r($H);
                  let vH = Q_.isArray(DH) ? DH.map((KH) => sR8(KH)) : [sR8(DH, fH)];
                  qH.all ? r($H, vH) : r($H, vH[0].address, vH[0].family);
                });
              };
            }
            let R = new qZ8.EventEmitter();
            function W(HH) {
              try {
                R.emit("abort", !HH || HH.type ? new Wh(null, _, P) : HH);
              } catch (e) {
                console.warn("emit error", e);
              }
            }
            R.once("abort", K);
            let Z = () => {
              if (_.cancelToken) _.cancelToken.unsubscribe(W);
              if (_.signal) _.signal.removeEventListener("abort", W);
              R.removeAllListeners();
            };
            if (_.cancelToken || _.signal) {
              if ((_.cancelToken && _.cancelToken.subscribe(W), _.signal))
                _.signal.aborted ? W() : _.signal.addEventListener("abort", W);
            }
            O((HH, e) => {
              if (((M = !0), e)) {
                (J = !0), Z();
                return;
              }
              let { data: qH } = HH;
              if (qH instanceof NQ.default.Readable || qH instanceof NQ.default.Duplex) {
                let r = NQ.default.finished(qH, () => {
                  r(), Z();
                });
              } else Z();
            });
            let k = j1H(_.baseURL, _.url, _.allowAbsoluteUrls),
              v = new URL(k, wO.hasBrowserEnv ? wO.origin : void 0),
              y = v.protocol || oR8[0];
            if (y === "data:") {
              if (_.maxContentLength > -1) {
                let e = String(_.url || k || "");
                if (_46(e) > _.maxContentLength)
                  return K(
                    new eq("maxContentLength size of " + _.maxContentLength + " exceeded", eq.ERR_BAD_RESPONSE, _),
                  );
              }
              let HH;
              if (j !== "GET")
                return _B($, K, { status: 405, statusText: "method not allowed", headers: {}, config: _ });
              try {
                HH = s$6(_.url, Y === "blob", { Blob: _.env && _.env.Blob });
              } catch (e) {
                throw eq.from(e, eq.ERR_BAD_REQUEST, _);
              }
              if (Y === "text") {
                if (((HH = HH.toString(D)), !D || D === "utf8")) HH = Q_.stripBOM(HH);
              } else if (Y === "stream") HH = NQ.default.Readable.from(HH);
              return _B($, K, { data: HH, status: 200, statusText: "OK", headers: new zY(), config: _ });
            }
            if (oR8.indexOf(y) === -1) return K(new eq("Unsupported protocol " + y, eq.ERR_BAD_REQUEST, _));
            let E = zY.from(_.headers).normalize();
            E.set("User-Agent", "axios/" + X1H, !1);
            let { onUploadProgress: S, onDownloadProgress: x } = _,
              I = _.maxRate,
              B = void 0,
              p = void 0;
            if (Q_.isSpecCompliantForm(T)) {
              let HH = E.getContentType(/boundary=([-_\w\d]{10,70})/i);
              T = xR8(
                T,
                (e) => {
                  E.set(e);
                },
                { tag: `axios-${X1H}-boundary`, boundary: (HH && HH[1]) || void 0 },
              );
            } else if (Q_.isFormData(T) && Q_.isFunction(T.getHeaders)) {
              if ((E.set(T.getHeaders()), !E.hasContentLength()))
                try {
                  let HH = await $46.default.promisify(T.getLength).call(T);
                  Number.isFinite(HH) && HH >= 0 && E.setContentLength(HH);
                } catch (HH) {}
            } else if (Q_.isBlob(T) || Q_.isFile(T))
              T.size && E.setContentType(T.type || "application/octet-stream"),
                E.setContentLength(T.size || 0),
                (T = NQ.default.Readable.from(h5_(T)));
            else if (T && !Q_.isStream(T)) {
              if (Buffer.isBuffer(T));
              else if (Q_.isArrayBuffer(T)) T = Buffer.from(new Uint8Array(T));
              else if (Q_.isString(T)) T = Buffer.from(T, "utf-8");
              else
                return K(
                  new eq(
                    "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
                    eq.ERR_BAD_REQUEST,
                    _,
                  ),
                );
              if ((E.setContentLength(T.length, !1), _.maxBodyLength > -1 && T.length > _.maxBodyLength))
                return K(new eq("Request body larger than maxBodyLength limit", eq.ERR_BAD_REQUEST, _));
            }
            let C = Q_.toFiniteNumber(E.getContentLength());
            if (Q_.isArray(I)) (B = I[0]), (p = I[1]);
            else B = p = I;
            if (T && (S || B)) {
              if (!Q_.isStream(T)) T = NQ.default.Readable.from(T, { objectMode: !1 });
              (T = NQ.default.pipeline([T, new e$6({ maxRate: Q_.toFiniteNumber(B) })], Q_.noop)),
                S && T.on("progress", aR8(T, WMH(C, vQ(GMH(S), !1, 3))));
            }
            let g = void 0;
            if (_.auth) {
              let HH = _.auth.username || "",
                e = _.auth.password || "";
              g = HH + ":" + e;
            }
            if (!g && v.username) {
              let { username: HH, password: e } = v;
              g = HH + ":" + e;
            }
            g && E.delete("authorization");
            let c;
            try {
              c = Y1H(v.pathname + v.search, _.params, _.paramsSerializer).replace(/^\?/, "");
            } catch (HH) {
              let e = Error(HH.message);
              return (e.config = _), (e.url = _.url), (e.exists = !0), K(e);
            }
            E.set("Accept-Encoding", "gzip, compress, deflate" + (rR8 ? ", br" : ""), !1);
            let U = {
              path: c,
              method: j,
              headers: E.toJSON(),
              agents: { http: _.httpAgent, https: _.httpsAgent },
              auth: g,
              protocol: y,
              family: A,
              beforeRedirect: ZD$,
              beforeRedirects: {},
              http2Options: w,
            };
            if ((!Q_.isUndefined(z) && (U.lookup = z), _.socketPath)) U.socketPath = _.socketPath;
            else
              (U.hostname = v.hostname.startsWith("[") ? v.hostname.slice(1, -1) : v.hostname),
                (U.port = v.port),
                KZ8(U, _.proxy, y + "//" + v.hostname + (v.port ? ":" + v.port : "") + U.path);
            let i,
              _H = GD$.test(U.protocol);
            if (((U.agent = _H ? _.httpsAgent : _.httpAgent), X)) i = ND$;
            else if (_.transport) i = _.transport;
            else if (_.maxRedirects === 0) i = _H ? HZ8.default : eR8.default;
            else {
              if (_.maxRedirects) U.maxRedirects = _.maxRedirects;
              if (_.beforeRedirect) U.beforeRedirects.config = _.beforeRedirect;
              i = _H ? WD$ : XD$;
            }
            if (_.maxBodyLength > -1) U.maxBodyLength = _.maxBodyLength;
            else U.maxBodyLength = 1 / 0;
            if (_.insecureHTTPParser) U.insecureHTTPParser = _.insecureHTTPParser;
            if (
              ((P = i.request(U, function (e) {
                if (P.destroyed) return;
                let qH = [e],
                  r = Q_.toFiniteNumber(e.headers["content-length"]);
                if (x || p) {
                  let vH = new e$6({ maxRate: Q_.toFiniteNumber(p) });
                  x && vH.on("progress", aR8(vH, WMH(r, vQ(GMH(x), !0, 3)))), qH.push(vH);
                }
                let $H = e,
                  DH = e.req || P;
                if (_.decompress !== !1 && e.headers["content-encoding"]) {
                  if (j === "HEAD" || e.statusCode === 204) delete e.headers["content-encoding"];
                  switch ((e.headers["content-encoding"] || "").toLowerCase()) {
                    case "gzip":
                    case "x-gzip":
                    case "compress":
                    case "x-compress":
                      qH.push(hQ.default.createUnzip(nR8)), delete e.headers["content-encoding"];
                      break;
                    case "deflate":
                      qH.push(new gR8()), qH.push(hQ.default.createUnzip(nR8)), delete e.headers["content-encoding"];
                      break;
                    case "br":
                      if (rR8) qH.push(hQ.default.createBrotliDecompress(PD$)), delete e.headers["content-encoding"];
                  }
                }
                $H = qH.length > 1 ? NQ.default.pipeline(qH, Q_.noop) : qH[0];
                let fH = {
                  status: e.statusCode,
                  statusText: e.statusMessage,
                  headers: new zY(e.headers),
                  config: _,
                  request: DH,
                };
                if (Y === "stream") (fH.data = $H), _B($, K, fH);
                else {
                  let vH = [],
                    KH = 0;
                  $H.on("data", function (l) {
                    if ((vH.push(l), (KH += l.length), _.maxContentLength > -1 && KH > _.maxContentLength))
                      (J = !0),
                        $H.destroy(),
                        W(
                          new eq(
                            "maxContentLength size of " + _.maxContentLength + " exceeded",
                            eq.ERR_BAD_RESPONSE,
                            _,
                            DH,
                          ),
                        );
                  }),
                    $H.on("aborted", function () {
                      if (J) return;
                      let l = new eq("stream has been aborted", eq.ERR_BAD_RESPONSE, _, DH);
                      $H.destroy(l), K(l);
                    }),
                    $H.on("error", function (l) {
                      if (P.destroyed) return;
                      K(eq.from(l, null, _, DH));
                    }),
                    $H.on("end", function () {
                      try {
                        let l = vH.length === 1 ? vH[0] : Buffer.concat(vH);
                        if (Y !== "arraybuffer") {
                          if (((l = l.toString(D)), !D || D === "utf8")) l = Q_.stripBOM(l);
                        }
                        fH.data = l;
                      } catch (l) {
                        return K(eq.from(l, null, _, fH.request, fH));
                      }
                      _B($, K, fH);
                    });
                }
                R.once("abort", (vH) => {
                  if (!$H.destroyed) $H.emit("error", vH), $H.destroy();
                });
              })),
              R.once("abort", (HH) => {
                if (P.close) P.close();
                else P.destroy(HH);
              }),
              P.on("error", function (e) {
                K(eq.from(e, null, _, P));
              }),
              P.on("socket", function (e) {
                e.setKeepAlive(!0, 60000);
              }),
              _.timeout)
            ) {
              let HH = parseInt(_.timeout, 10);
              if (Number.isNaN(HH)) {
                W(new eq("error trying to parse `config.timeout` to int", eq.ERR_BAD_OPTION_VALUE, _, P));
                return;
              }
              P.setTimeout(HH, function () {
                if (M) return;
                let qH = _.timeout ? "timeout of " + _.timeout + "ms exceeded" : "timeout exceeded",
                  r = _.transitional || St;
                if (_.timeoutErrorMessage) qH = _.timeoutErrorMessage;
                W(new eq(qH, r.clarifyTimeoutError ? eq.ETIMEDOUT : eq.ECONNABORTED, _, P));
              });
            } else P.setTimeout(0);
            if (Q_.isStream(T)) {
              let HH = !1,
                e = !1;
              T.on("end", () => {
                HH = !0;
              }),
                T.once("error", (qH) => {
                  (e = !0), P.destroy(qH);
                }),
                T.on("close", () => {
                  if (!HH && !e) W(new Wh("Request stream has been aborted", _, P));
                }),
                T.pipe(P);
            } else T && P.write(T), P.end();
          });
        });

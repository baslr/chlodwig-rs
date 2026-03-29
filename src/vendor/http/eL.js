  var eL = d((LxH) => {
    var jk8 = Ok8(),
      Mk8 = fk8(),
      f3_ = require("http"),
      w3_ = require("https"),
      Jk8 = require("stream"),
      a46 = require("http2"),
      ij$ = ["ECONNRESET", "EPIPE", "ETIMEDOUT"],
      Pk8 = (H) => {
        let _ = {};
        for (let q of Object.keys(H)) {
          let $ = H[q];
          _[q] = Array.isArray($) ? $.join(",") : $;
        }
        return _;
      },
      iR = { setTimeout: (H, _) => setTimeout(H, _), clearTimeout: (H) => clearTimeout(H) },
      wk8 = 1000,
      nj$ = (H, _, q = 0) => {
        if (!q) return -1;
        let $ = (K) => {
          let O = iR.setTimeout(() => {
              H.destroy(),
                _(
                  Object.assign(
                    Error(
                      `@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${q} ms.`,
                    ),
                    { name: "TimeoutError" },
                  ),
                );
            }, q - K),
            T = (z) => {
              if (z?.connecting)
                z.on("connect", () => {
                  iR.clearTimeout(O);
                });
              else iR.clearTimeout(O);
            };
          if (H.socket) T(H.socket);
          else H.on("socket", T);
        };
        if (q < 2000) return $(0), 0;
        return iR.setTimeout($.bind(null, wk8), wk8);
      },
      rj$ = (H, _, q = 0, $, K) => {
        if (q)
          return iR.setTimeout(() => {
            let O = `@smithy/node-http-handler - [${$ ? "ERROR" : "WARN"}] a request has exceeded the configured ${q} ms requestTimeout.`;
            if ($) {
              let T = Object.assign(Error(O), { name: "TimeoutError", code: "ETIMEDOUT" });
              H.destroy(T), _(T);
            } else
              (O += " Init client requestHandler with throwOnRequestTimeout=true to turn this into an error."),
                K?.warn?.(O);
          }, q);
        return -1;
      },
      oj$ = 3000,
      aj$ = (H, { keepAlive: _, keepAliveMsecs: q }, $ = oj$) => {
        if (_ !== !0) return -1;
        let K = () => {
          if (H.socket) H.socket.setKeepAlive(_, q || 0);
          else
            H.on("socket", (O) => {
              O.setKeepAlive(_, q || 0);
            });
        };
        if ($ === 0) return K(), 0;
        return iR.setTimeout(K, $);
      },
      Yk8 = 3000,
      sj$ = (H, _, q = 0) => {
        let $ = (K) => {
          let O = q - K,
            T = () => {
              H.destroy(),
                _(
                  Object.assign(
                    Error(
                      `@smithy/node-http-handler - the request socket timed out after ${q} ms of inactivity (configured by client requestHandler).`,
                    ),
                    { name: "TimeoutError" },
                  ),
                );
            };
          if (H.socket) H.socket.setTimeout(O, T), H.on("close", () => H.socket?.removeListener("timeout", T));
          else H.setTimeout(O, T);
        };
        if (0 < q && q < 6000) return $(0), 0;
        return iR.setTimeout($.bind(null, q === 0 ? 0 : Yk8), Yk8);
      },
      Dk8 = 6000;
    async function Xk8(H, _, q = Dk8, $ = !1) {
      let K = _.headers ?? {},
        O = K.Expect || K.expect,
        T = -1,
        z = !0;
      if (!$ && O === "100-continue")
        z = await Promise.race([
          new Promise((A) => {
            T = Number(iR.setTimeout(() => A(!0), Math.max(Dk8, q)));
          }),
          new Promise((A) => {
            H.on("continue", () => {
              iR.clearTimeout(T), A(!0);
            }),
              H.on("response", () => {
                iR.clearTimeout(T), A(!1);
              }),
              H.on("error", () => {
                iR.clearTimeout(T), A(!1);
              });
          }),
        ]);
      if (z) tj$(H, _.body);
    }
    function tj$(H, _) {
      if (_ instanceof Jk8.Readable) {
        _.pipe(H);
        return;
      }
      if (_) {
        if (Buffer.isBuffer(_) || typeof _ === "string") {
          H.end(_);
          return;
        }
        let q = _;
        if (typeof q === "object" && q.buffer && typeof q.byteOffset === "number" && typeof q.byteLength === "number") {
          H.end(Buffer.from(q.buffer, q.byteOffset, q.byteLength));
          return;
        }
        H.end(Buffer.from(_));
        return;
      }
      H.end();
    }
    var ej$ = 0;
    class Y3_ {
      config;
      configProvider;
      socketWarningTimestamp = 0;
      externalAgent = !1;
      metadata = { handlerProtocol: "http/1.1" };
      static create(H) {
        if (typeof H?.handle === "function") return H;
        return new Y3_(H);
      }
      static checkSocketUsage(H, _, q = console) {
        let { sockets: $, requests: K, maxSockets: O } = H;
        if (typeof O !== "number" || O === 1 / 0) return _;
        let T = 15000;
        if (Date.now() - T < _) return _;
        if ($ && K)
          for (let z in $) {
            let A = $[z]?.length ?? 0,
              f = K[z]?.length ?? 0;
            if (A >= O && f >= 2 * O)
              return (
                q?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${A} and ${f} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`),
                Date.now()
              );
          }
        return _;
      }
      constructor(H) {
        this.configProvider = new Promise((_, q) => {
          if (typeof H === "function")
            H()
              .then(($) => {
                _(this.resolveDefaultConfig($));
              })
              .catch(q);
          else _(this.resolveDefaultConfig(H));
        });
      }
      resolveDefaultConfig(H) {
        let {
            requestTimeout: _,
            connectionTimeout: q,
            socketTimeout: $,
            socketAcquisitionWarningTimeout: K,
            httpAgent: O,
            httpsAgent: T,
            throwOnRequestTimeout: z,
          } = H || {},
          A = !0,
          f = 50;
        return {
          connectionTimeout: q,
          requestTimeout: _,
          socketTimeout: $,
          socketAcquisitionWarningTimeout: K,
          throwOnRequestTimeout: z,
          httpAgent: (() => {
            if (O instanceof f3_.Agent || typeof O?.destroy === "function") return (this.externalAgent = !0), O;
            return new f3_.Agent({ keepAlive: !0, maxSockets: 50, ...O });
          })(),
          httpsAgent: (() => {
            if (T instanceof w3_.Agent || typeof T?.destroy === "function") return (this.externalAgent = !0), T;
            return new w3_.Agent({ keepAlive: !0, maxSockets: 50, ...T });
          })(),
          logger: console,
        };
      }
      destroy() {
        this.config?.httpAgent?.destroy(), this.config?.httpsAgent?.destroy();
      }
      async handle(H, { abortSignal: _, requestTimeout: q } = {}) {
        if (!this.config) this.config = await this.configProvider;
        return new Promise(($, K) => {
          let O = this.config,
            T = void 0,
            z = [],
            A = async (y) => {
              await T, z.forEach(iR.clearTimeout), $(y);
            },
            f = async (y) => {
              await T, z.forEach(iR.clearTimeout), K(y);
            };
          if (_?.aborted) {
            let y = Error("Request aborted");
            (y.name = "AbortError"), f(y);
            return;
          }
          let w = H.protocol === "https:",
            Y = H.headers ?? {},
            D = (Y.Expect ?? Y.expect) === "100-continue",
            j = w ? O.httpsAgent : O.httpAgent;
          if (D && !this.externalAgent) j = new (w ? w3_.Agent : f3_.Agent)({ keepAlive: !1, maxSockets: 1 / 0 });
          z.push(
            iR.setTimeout(
              () => {
                this.socketWarningTimestamp = Y3_.checkSocketUsage(j, this.socketWarningTimestamp, O.logger);
              },
              O.socketAcquisitionWarningTimeout ?? (O.requestTimeout ?? 2000) + (O.connectionTimeout ?? 1000),
            ),
          );
          let M = Mk8.buildQueryString(H.query || {}),
            J = void 0;
          if (H.username != null || H.password != null) {
            let y = H.username ?? "",
              E = H.password ?? "";
            J = `${y}:${E}`;
          }
          let P = H.path;
          if (M) P += `?${M}`;
          if (H.fragment) P += `#${H.fragment}`;
          let X = H.hostname ?? "";
          if (X[0] === "[" && X.endsWith("]")) X = H.hostname.slice(1, -1);
          else X = H.hostname;
          let R = { headers: H.headers, host: X, method: H.method, path: P, port: H.port, agent: j, auth: J },
            Z = (w ? w3_.request : f3_.request)(R, (y) => {
              let E = new jk8.HttpResponse({
                statusCode: y.statusCode || -1,
                reason: y.statusMessage,
                headers: Pk8(y.headers),
                body: y,
              });
              A({ response: E });
            });
          if (
            (Z.on("error", (y) => {
              if (ij$.includes(y.code)) f(Object.assign(y, { name: "TimeoutError" }));
              else f(y);
            }),
            _)
          ) {
            let y = () => {
              Z.destroy();
              let E = Error("Request aborted");
              (E.name = "AbortError"), f(E);
            };
            if (typeof _.addEventListener === "function") {
              let E = _;
              E.addEventListener("abort", y, { once: !0 }), Z.once("close", () => E.removeEventListener("abort", y));
            } else _.onabort = y;
          }
          let k = q ?? O.requestTimeout;
          z.push(nj$(Z, f, O.connectionTimeout)),
            z.push(rj$(Z, f, k, O.throwOnRequestTimeout, O.logger ?? console)),
            z.push(sj$(Z, f, O.socketTimeout));
          let v = R.agent;
          if (typeof v === "object" && "keepAlive" in v)
            z.push(aj$(Z, { keepAlive: v.keepAlive, keepAliveMsecs: v.keepAliveMsecs }));
          T = Xk8(Z, H, k, this.externalAgent).catch((y) => {
            return z.forEach(iR.clearTimeout), K(y);
          });
        });
      }
      updateHttpClientConfig(H, _) {
        (this.config = void 0),
          (this.configProvider = this.configProvider.then((q) => {
            return { ...q, [H]: _ };
          }));
      }
      httpHandlerConfigs() {
        return this.config ?? {};
      }
    }
    class Wk8 {
      sessions = [];
      constructor(H) {
        this.sessions = H ?? [];
      }
      poll() {
        if (this.sessions.length > 0) return this.sessions.shift();
      }
      offerLast(H) {
        this.sessions.push(H);
      }
      contains(H) {
        return this.sessions.includes(H);
      }
      remove(H) {
        this.sessions = this.sessions.filter((_) => _ !== H);
      }
      [Symbol.iterator]() {
        return this.sessions[Symbol.iterator]();
      }
      destroy(H) {
        for (let _ of this.sessions)
          if (_ === H) {
            if (!_.destroyed) _.destroy();
          }
      }
    }
    class Gk8 {
      constructor(H) {
        if (((this.config = H), this.config.maxConcurrency && this.config.maxConcurrency <= 0))
          throw RangeError("maxConcurrency must be greater than zero.");
      }
      config;
      sessionCache = new Map();
      lease(H, _) {
        let q = this.getUrlString(H),
          $ = this.sessionCache.get(q);
        if ($) {
          let z = $.poll();
          if (z && !this.config.disableConcurrency) return z;
        }
        let K = a46.connect(q);
        if (this.config.maxConcurrency)
          K.settings({ maxConcurrentStreams: this.config.maxConcurrency }, (z) => {
            if (z)
              throw Error(
                "Fail to set maxConcurrentStreams to " +
                  this.config.maxConcurrency +
                  "when creating new session for " +
                  H.destination.toString(),
              );
          });
        K.unref();
        let O = () => {
          K.destroy(), this.deleteSession(q, K);
        };
        if (
          (K.on("goaway", O),
          K.on("error", O),
          K.on("frameError", O),
          K.on("close", () => this.deleteSession(q, K)),
          _.requestTimeout)
        )
          K.setTimeout(_.requestTimeout, O);
        let T = this.sessionCache.get(q) || new Wk8();
        return T.offerLast(K), this.sessionCache.set(q, T), K;
      }
      deleteSession(H, _) {
        let q = this.sessionCache.get(H);
        if (!q) return;
        if (!q.contains(_)) return;
        q.remove(_), this.sessionCache.set(H, q);
      }
      release(H, _) {
        let q = this.getUrlString(H);
        this.sessionCache.get(q)?.offerLast(_);
      }
      destroy() {
        for (let [H, _] of this.sessionCache) {
          for (let q of _) {
            if (!q.destroyed) q.destroy();
            _.remove(q);
          }
          this.sessionCache.delete(H);
        }
      }
      setMaxConcurrentStreams(H) {
        if (H && H <= 0) throw RangeError("maxConcurrentStreams must be greater than zero.");
        this.config.maxConcurrency = H;
      }
      setDisableConcurrentStreams(H) {
        this.config.disableConcurrency = H;
      }
      getUrlString(H) {
        return H.destination.toString();
      }
    }
    class s46 {
      config;
      configProvider;
      metadata = { handlerProtocol: "h2" };
      connectionManager = new Gk8({});
      static create(H) {
        if (typeof H?.handle === "function") return H;
        return new s46(H);
      }
      constructor(H) {
        this.configProvider = new Promise((_, q) => {
          if (typeof H === "function")
            H()
              .then(($) => {
                _($ || {});
              })
              .catch(q);
          else _(H || {});
        });
      }
      destroy() {
        this.connectionManager.destroy();
      }
      async handle(H, { abortSignal: _, requestTimeout: q } = {}) {
        if (!this.config) {
          if (
            ((this.config = await this.configProvider),
            this.connectionManager.setDisableConcurrentStreams(this.config.disableConcurrentStreams || !1),
            this.config.maxConcurrentStreams)
          )
            this.connectionManager.setMaxConcurrentStreams(this.config.maxConcurrentStreams);
        }
        let { requestTimeout: $, disableConcurrentStreams: K } = this.config,
          O = q ?? $;
        return new Promise((T, z) => {
          let A = !1,
            f = void 0,
            w = async (S) => {
              await f, T(S);
            },
            Y = async (S) => {
              await f, z(S);
            };
          if (_?.aborted) {
            A = !0;
            let S = Error("Request aborted");
            (S.name = "AbortError"), Y(S);
            return;
          }
          let { hostname: D, method: j, port: M, protocol: J, query: P } = H,
            X = "";
          if (H.username != null || H.password != null) {
            let S = H.username ?? "",
              x = H.password ?? "";
            X = `${S}:${x}@`;
          }
          let R = `${J}//${X}${D}${M ? `:${M}` : ""}`,
            W = { destination: new URL(R) },
            Z = this.connectionManager.lease(W, {
              requestTimeout: this.config?.sessionTimeout,
              disableConcurrentStreams: K || !1,
            }),
            k = (S) => {
              if (K) this.destroySession(Z);
              (A = !0), Y(S);
            },
            v = Mk8.buildQueryString(P || {}),
            y = H.path;
          if (v) y += `?${v}`;
          if (H.fragment) y += `#${H.fragment}`;
          let E = Z.request({
            ...H.headers,
            [a46.constants.HTTP2_HEADER_PATH]: y,
            [a46.constants.HTTP2_HEADER_METHOD]: j,
          });
          if (
            (Z.ref(),
            E.on("response", (S) => {
              let x = new jk8.HttpResponse({ statusCode: S[":status"] || -1, headers: Pk8(S), body: E });
              if (((A = !0), w({ response: x }), K)) Z.close(), this.connectionManager.deleteSession(R, Z);
            }),
            O)
          )
            E.setTimeout(O, () => {
              E.close();
              let S = Error(`Stream timed out because of no activity for ${O} ms`);
              (S.name = "TimeoutError"), k(S);
            });
          if (_) {
            let S = () => {
              E.close();
              let x = Error("Request aborted");
              (x.name = "AbortError"), k(x);
            };
            if (typeof _.addEventListener === "function") {
              let x = _;
              x.addEventListener("abort", S, { once: !0 }), E.once("close", () => x.removeEventListener("abort", S));
            } else _.onabort = S;
          }
          E.on("frameError", (S, x, I) => {
            k(Error(`Frame type id ${S} in stream id ${I} has failed with code ${x}.`));
          }),
            E.on("error", k),
            E.on("aborted", () => {
              k(Error(`HTTP/2 stream is abnormally aborted in mid-communication with result code ${E.rstCode}.`));
            }),
            E.on("close", () => {
              if ((Z.unref(), K)) Z.destroy();
              if (!A) k(Error("Unexpected error: http2 request did not get a response"));
            }),
            (f = Xk8(E, H, O));
        });
      }
      updateHttpClientConfig(H, _) {
        (this.config = void 0),
          (this.configProvider = this.configProvider.then((q) => {
            return { ...q, [H]: _ };
          }));
      }
      httpHandlerConfigs() {
        return this.config ?? {};
      }
      destroySession(H) {
        if (!H.destroyed) H.destroy();
      }
    }
    class Rk8 extends Jk8.Writable {
      bufferedBytes = [];
      _write(H, _, q) {
        this.bufferedBytes.push(H), q();
      }
    }
    var HM$ = (H) => {
        if (_M$(H)) return qM$(H);
        return new Promise((_, q) => {
          let $ = new Rk8();
          H.pipe($),
            H.on("error", (K) => {
              $.end(), q(K);
            }),
            $.on("error", q),
            $.on("finish", function () {
              let K = new Uint8Array(Buffer.concat(this.bufferedBytes));
              _(K);
            });
        });
      },
      _M$ = (H) => typeof ReadableStream === "function" && H instanceof ReadableStream;
    async function qM$(H) {
      let _ = [],
        q = H.getReader(),
        $ = !1,
        K = 0;
      while (!$) {
        let { done: z, value: A } = await q.read();
        if (A) _.push(A), (K += A.length);
        $ = z;
      }
      let O = new Uint8Array(K),
        T = 0;
      for (let z of _) O.set(z, T), (T += z.length);
      return O;
    }
    LxH.DEFAULT_REQUEST_TIMEOUT = ej$;
    LxH.NodeHttp2Handler = s46;
    LxH.NodeHttpHandler = Y3_;
    LxH.streamCollector = HM$;
  });

  var vh8 = d((d3_) => {
    var Lh8 = Xh8(),
      jP$ = Zh8(),
      MP$ = xMH();
    function kh8(H, _) {
      return new Request(H, _);
    }
    function JP$(H = 0) {
      return new Promise((_, q) => {
        if (H)
          setTimeout(() => {
            let $ = Error(`Request did not complete within ${H} ms`);
            ($.name = "TimeoutError"), q($);
          }, H);
      });
    }
    var g3_ = { supported: void 0 };
    class S16 {
      config;
      configProvider;
      static create(H) {
        if (typeof H?.handle === "function") return H;
        return new S16(H);
      }
      constructor(H) {
        if (typeof H === "function") this.configProvider = H().then((_) => _ || {});
        else (this.config = H ?? {}), (this.configProvider = Promise.resolve(this.config));
        if (g3_.supported === void 0)
          g3_.supported = Boolean(typeof Request < "u" && "keepalive" in kh8("https://[::1]"));
      }
      destroy() {}
      async handle(H, { abortSignal: _, requestTimeout: q } = {}) {
        if (!this.config) this.config = await this.configProvider;
        let $ = q ?? this.config.requestTimeout,
          K = this.config.keepAlive === !0,
          O = this.config.credentials;
        if (_?.aborted) {
          let X = Error("Request aborted");
          return (X.name = "AbortError"), Promise.reject(X);
        }
        let T = H.path,
          z = jP$.buildQueryString(H.query || {});
        if (z) T += `?${z}`;
        if (H.fragment) T += `#${H.fragment}`;
        let A = "";
        if (H.username != null || H.password != null) {
          let X = H.username ?? "",
            R = H.password ?? "";
          A = `${X}:${R}@`;
        }
        let { port: f, method: w } = H,
          Y = `${H.protocol}//${A}${H.hostname}${f ? `:${f}` : ""}${T}`,
          D = w === "GET" || w === "HEAD" ? void 0 : H.body,
          j = { body: D, headers: new Headers(H.headers), method: w, credentials: O };
        if (this.config?.cache) j.cache = this.config.cache;
        if (D) j.duplex = "half";
        if (typeof AbortController < "u") j.signal = _;
        if (g3_.supported) j.keepalive = K;
        if (typeof this.config.requestInit === "function") Object.assign(j, this.config.requestInit(H));
        let M = () => {},
          J = kh8(Y, j),
          P = [
            fetch(J).then((X) => {
              let R = X.headers,
                W = {};
              for (let k of R.entries()) W[k[0]] = k[1];
              if (X.body == null)
                return X.blob().then((k) => ({
                  response: new Lh8.HttpResponse({ headers: W, reason: X.statusText, statusCode: X.status, body: k }),
                }));
              return {
                response: new Lh8.HttpResponse({
                  headers: W,
                  reason: X.statusText,
                  statusCode: X.status,
                  body: X.body,
                }),
              };
            }),
            JP$($),
          ];
        if (_)
          P.push(
            new Promise((X, R) => {
              let W = () => {
                let Z = Error("Request aborted");
                (Z.name = "AbortError"), R(Z);
              };
              if (typeof _.addEventListener === "function") {
                let Z = _;
                Z.addEventListener("abort", W, { once: !0 }), (M = () => Z.removeEventListener("abort", W));
              } else _.onabort = W;
            }),
          );
        return Promise.race(P).finally(M);
      }
      updateHttpClientConfig(H, _) {
        (this.config = void 0),
          (this.configProvider = this.configProvider.then((q) => {
            return (q[H] = _), q;
          }));
      }
      httpHandlerConfigs() {
        return this.config ?? {};
      }
    }
    var PP$ = async (H) => {
      if ((typeof Blob === "function" && H instanceof Blob) || H.constructor?.name === "Blob") {
        if (Blob.prototype.arrayBuffer !== void 0) return new Uint8Array(await H.arrayBuffer());
        return XP$(H);
      }
      return WP$(H);
    };
    async function XP$(H) {
      let _ = await GP$(H),
        q = MP$.fromBase64(_);
      return new Uint8Array(q);
    }
    async function WP$(H) {
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
    function GP$(H) {
      return new Promise((_, q) => {
        let $ = new FileReader();
        ($.onloadend = () => {
          if ($.readyState !== 2) return q(Error("Reader aborted too early"));
          let K = $.result ?? "",
            O = K.indexOf(","),
            T = O > -1 ? O + 1 : K.length;
          _(K.substring(T));
        }),
          ($.onabort = () => q(Error("Read aborted"))),
          ($.onerror = () => q($.error)),
          $.readAsDataURL(H);
      });
    }
    d3_.FetchHttpHandler = S16;
    d3_.keepAliveSupport = g3_;
    d3_.streamCollector = PP$;
  });

  var yGq = d((l0) => {
    var q54 =
        (l0 && l0.__createBinding) ||
        (Object.create
          ? function (H, _, q, $) {
              if ($ === void 0) $ = q;
              var K = Object.getOwnPropertyDescriptor(_, q);
              if (!K || ("get" in K ? !_.__esModule : K.writable || K.configurable))
                K = {
                  enumerable: !0,
                  get: function () {
                    return _[q];
                  },
                };
              Object.defineProperty(H, $, K);
            }
          : function (H, _, q, $) {
              if ($ === void 0) $ = q;
              H[$] = _[q];
            }),
      $54 =
        (l0 && l0.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      K54 =
        (l0 && l0.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) q54(_, H, q);
          }
          return $54(_, H), _;
        },
      b5H =
        (l0 && l0.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      O54 =
        (l0 && l0.__classPrivateFieldSet) ||
        function (H, _, q, $, K) {
          if ($ === "m") throw TypeError("Private method is not writable");
          if ($ === "a" && !K) throw TypeError("Private accessor was defined without a setter");
          if (typeof _ === "function" ? H !== _ || !K : !_.has(H))
            throw TypeError("Cannot write private member to an object whose class did not declare it");
          return $ === "a" ? K.call(H, q) : K ? (K.value = q) : _.set(H, q), q;
        },
      sM_ =
        (l0 && l0.__importDefault) ||
        function (H) {
          return H && H.__esModule ? H : { default: H };
        },
      EXH,
      C5H,
      XGq,
      kGq,
      vGq,
      NGq,
      oM_,
      WGq;
    Object.defineProperty(l0, "__esModule", { value: !0 });
    l0.Gaxios = void 0;
    var T54 = sM_(QP6()),
      z54 = require("https"),
      A54 = sM_(require("node-fetch")),
      f54 = sM_(require("querystring")),
      w54 = sM_(U0q()),
      GGq = require("url"),
      aM_ = nP6(),
      Y54 = a0q(),
      RGq = require("stream"),
      D54 = JGq(),
      ZGq = qX6(),
      j54 = J54() ? window.fetch : A54.default;
    function M54() {
      return typeof window < "u" && !!window;
    }
    function J54() {
      return M54() && !!window.fetch;
    }
    function P54() {
      return typeof Buffer < "u";
    }
    function LGq(H, _) {
      return !!hGq(H, _);
    }
    function hGq(H, _) {
      _ = _.toLowerCase();
      for (let q of Object.keys((H === null || H === void 0 ? void 0 : H.headers) || {}))
        if (_ === q.toLowerCase()) return H.headers[q];
      return;
    }
    class $X6 {
      constructor(H) {
        EXH.add(this),
          (this.agentCache = new Map()),
          (this.defaults = H || {}),
          (this.interceptors = {
            request: new ZGq.GaxiosInterceptorManager(),
            response: new ZGq.GaxiosInterceptorManager(),
          });
      }
      async request(H = {}) {
        return (
          (H = await b5H(this, EXH, "m", NGq).call(this, H)),
          (H = await b5H(this, EXH, "m", kGq).call(this, H)),
          b5H(this, EXH, "m", vGq).call(this, this._request(H))
        );
      }
      async _defaultAdapter(H) {
        let q = await (H.fetchImplementation || j54)(H.url, H),
          $ = await this.getResponseData(H, q);
        return this.translateResponse(H, q, $);
      }
      async _request(H = {}) {
        var _;
        try {
          let q;
          if (H.adapter) q = await H.adapter(H, this._defaultAdapter.bind(this));
          else q = await this._defaultAdapter(H);
          if (!H.validateStatus(q.status)) {
            if (H.responseType === "stream") {
              let $ = "";
              await new Promise((K) => {
                (q === null || q === void 0 ? void 0 : q.data).on("data", (O) => {
                  $ += O;
                }),
                  (q === null || q === void 0 ? void 0 : q.data).on("end", K);
              }),
                (q.data = $);
            }
            throw new aM_.GaxiosError(`Request failed with status code ${q.status}`, H, q);
          }
          return q;
        } catch (q) {
          let $ = q instanceof aM_.GaxiosError ? q : new aM_.GaxiosError(q.message, H, void 0, q),
            { shouldRetry: K, config: O } = await (0, Y54.getRetryConfig)($);
          if (K && O)
            return (
              ($.config.retryConfig.currentRetryAttempt = O.retryConfig.currentRetryAttempt),
              (H.retryConfig = (_ = $.config) === null || _ === void 0 ? void 0 : _.retryConfig),
              this._request(H)
            );
          throw $;
        }
      }
      async getResponseData(H, _) {
        switch (H.responseType) {
          case "stream":
            return _.body;
          case "json": {
            let q = await _.text();
            try {
              q = JSON.parse(q);
            } catch ($) {}
            return q;
          }
          case "arraybuffer":
            return _.arrayBuffer();
          case "blob":
            return _.blob();
          case "text":
            return _.text();
          default:
            return this.getResponseDataFromContentType(_);
        }
      }
      validateStatus(H) {
        return H >= 200 && H < 300;
      }
      paramsSerializer(H) {
        return f54.default.stringify(H);
      }
      translateResponse(H, _, q) {
        let $ = {};
        return (
          _.headers.forEach((K, O) => {
            $[O] = K;
          }),
          {
            config: H,
            data: q,
            headers: $,
            status: _.status,
            statusText: _.statusText,
            request: { responseURL: _.url },
          }
        );
      }
      async getResponseDataFromContentType(H) {
        let _ = H.headers.get("Content-Type");
        if (_ === null) return H.text();
        if (((_ = _.toLowerCase()), _.includes("application/json"))) {
          let q = await H.text();
          try {
            q = JSON.parse(q);
          } catch ($) {}
          return q;
        } else if (_.match(/^text\//)) return H.text();
        else return H.blob();
      }
      async *getMultipartRequest(H, _) {
        let q = `--${_}--`;
        for (let $ of H) {
          let K = $.headers["Content-Type"] || "application/octet-stream";
          if (
            (yield `--${_}\r
Content-Type: ${K}\r
\r
`,
            typeof $.content === "string")
          )
            yield $.content;
          else yield* $.content;
          yield `\r
`;
        }
        yield q;
      }
    }
    l0.Gaxios = $X6;
    (C5H = $X6),
      (EXH = new WeakSet()),
      (XGq = function (_, q = []) {
        var $, K;
        let O = new GGq.URL(_),
          T = [...q],
          z =
            ((K = ($ = process.env.NO_PROXY) !== null && $ !== void 0 ? $ : process.env.no_proxy) === null ||
            K === void 0
              ? void 0
              : K.split(",")) || [];
        for (let A of z) T.push(A.trim());
        for (let A of T)
          if (A instanceof RegExp) {
            if (A.test(O.toString())) return !1;
          } else if (A instanceof GGq.URL) {
            if (A.origin === O.origin) return !1;
          } else if (A.startsWith("*.") || A.startsWith(".")) {
            let f = A.replace(/^\*\./, ".");
            if (O.hostname.endsWith(f)) return !1;
          } else if (A === O.origin || A === O.hostname || A === O.href) return !1;
        return !0;
      }),
      (kGq = async function (_) {
        let q = Promise.resolve(_);
        for (let $ of this.interceptors.request.values()) if ($) q = q.then($.resolved, $.rejected);
        return q;
      }),
      (vGq = async function (_) {
        let q = Promise.resolve(_);
        for (let $ of this.interceptors.response.values()) if ($) q = q.then($.resolved, $.rejected);
        return q;
      }),
      (NGq = async function (_) {
        var q, $, K, O;
        let T = (0, T54.default)(!0, {}, this.defaults, _);
        if (!T.url) throw Error("URL is required.");
        let z = T.baseUrl || T.baseURL;
        if (z) T.url = z.toString() + T.url;
        if (
          ((T.paramsSerializer = T.paramsSerializer || this.paramsSerializer),
          T.params && Object.keys(T.params).length > 0)
        ) {
          let w = T.paramsSerializer(T.params);
          if (w.startsWith("?")) w = w.slice(1);
          let Y = T.url.toString().includes("?") ? "&" : "?";
          T.url = T.url + Y + w;
        }
        if (typeof _.maxContentLength === "number") T.size = _.maxContentLength;
        if (typeof _.maxRedirects === "number") T.follow = _.maxRedirects;
        if (((T.headers = T.headers || {}), T.multipart === void 0 && T.data)) {
          let w = typeof FormData > "u" ? !1 : (T === null || T === void 0 ? void 0 : T.data) instanceof FormData;
          if (w54.default.readable(T.data)) T.body = T.data;
          else if (P54() && Buffer.isBuffer(T.data)) {
            if (((T.body = T.data), !LGq(T, "Content-Type"))) T.headers["Content-Type"] = "application/json";
          } else if (typeof T.data === "object") {
            if (!w)
              if (hGq(T, "content-type") === "application/x-www-form-urlencoded") T.body = T.paramsSerializer(T.data);
              else {
                if (!LGq(T, "Content-Type")) T.headers["Content-Type"] = "application/json";
                T.body = JSON.stringify(T.data);
              }
          } else T.body = T.data;
        } else if (T.multipart && T.multipart.length > 0) {
          let w = (0, D54.v4)();
          T.headers["Content-Type"] = `multipart/related; boundary=${w}`;
          let Y = new RGq.PassThrough();
          (T.body = Y), (0, RGq.pipeline)(this.getMultipartRequest(T.multipart, w), Y, () => {});
        }
        if (
          ((T.validateStatus = T.validateStatus || this.validateStatus),
          (T.responseType = T.responseType || "unknown"),
          !T.headers.Accept && T.responseType === "json")
        )
          T.headers.Accept = "application/json";
        T.method = T.method || "GET";
        let A =
            T.proxy ||
            ((q = process === null || process === void 0 ? void 0 : process.env) === null || q === void 0
              ? void 0
              : q.HTTPS_PROXY) ||
            (($ = process === null || process === void 0 ? void 0 : process.env) === null || $ === void 0
              ? void 0
              : $.https_proxy) ||
            ((K = process === null || process === void 0 ? void 0 : process.env) === null || K === void 0
              ? void 0
              : K.HTTP_PROXY) ||
            ((O = process === null || process === void 0 ? void 0 : process.env) === null || O === void 0
              ? void 0
              : O.http_proxy),
          f = b5H(this, EXH, "m", XGq).call(this, T.url, T.noProxy);
        if (T.agent);
        else if (A && f) {
          let w = await b5H(C5H, C5H, "m", WGq).call(C5H);
          if (this.agentCache.has(A)) T.agent = this.agentCache.get(A);
          else (T.agent = new w(A, { cert: T.cert, key: T.key })), this.agentCache.set(A, T.agent);
        } else if (T.cert && T.key)
          if (this.agentCache.has(T.key)) T.agent = this.agentCache.get(T.key);
          else (T.agent = new z54.Agent({ cert: T.cert, key: T.key })), this.agentCache.set(T.key, T.agent);
        if (typeof T.errorRedactor !== "function" && T.errorRedactor !== !1) T.errorRedactor = aM_.defaultErrorRedactor;
        return T;
      }),
      (WGq = async function () {
        return (
          O54(
            this,
            C5H,
            b5H(this, C5H, "f", oM_) || (await Promise.resolve().then(() => K54(RxH()))).HttpsProxyAgent,
            "f",
            oM_,
          ),
          b5H(this, C5H, "f", oM_)
        );
      });
    oM_ = { value: void 0 };
  });

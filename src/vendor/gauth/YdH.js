  var YdH = d((H4) => {
    var u54 =
        (H4 && H4.__createBinding) ||
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
      x54 =
        (H4 && H4.__exportStar) ||
        function (H, _) {
          for (var q in H) if (q !== "default" && !Object.prototype.hasOwnProperty.call(_, q)) u54(_, H, q);
        };
    Object.defineProperty(H4, "__esModule", { value: !0 });
    H4.gcpResidencyCache =
      H4.METADATA_SERVER_DETECTION =
      H4.HEADERS =
      H4.HEADER_VALUE =
      H4.HEADER_NAME =
      H4.SECONDARY_HOST_ADDRESS =
      H4.HOST_ADDRESS =
      H4.BASE_PATH =
        void 0;
    H4.instance = c54;
    H4.project = F54;
    H4.universe = U54;
    H4.bulk = Q54;
    H4.isAvailable = i54;
    H4.resetIsAvailableCache = n54;
    H4.getGCPResidency = YX6;
    H4.setGCPResidency = HRq;
    H4.requestTimeout = _Rq;
    var fX6 = _u(),
      m54 = BGq(),
      p54 = OX6(),
      B54 = tGq();
    H4.BASE_PATH = "/computeMetadata/v1";
    H4.HOST_ADDRESS = "http://169.254.169.254";
    H4.SECONDARY_HOST_ADDRESS = "http://metadata.google.internal.";
    H4.HEADER_NAME = "Metadata-Flavor";
    H4.HEADER_VALUE = "Google";
    H4.HEADERS = Object.freeze({ [H4.HEADER_NAME]: H4.HEADER_VALUE });
    var eGq = B54.log("gcp metadata");
    H4.METADATA_SERVER_DETECTION = Object.freeze({
      "assume-present": "don't try to ping the metadata server, but assume it's present",
      none: "don't try to ping the metadata server, but don't try to use it either",
      "bios-only": "treat the result of a BIOS probe as canonical (don't fall back to pinging)",
      "ping-only": "skip the BIOS probe, and go straight to pinging",
    });
    function wX6(H) {
      if (!H) H = process.env.GCE_METADATA_IP || process.env.GCE_METADATA_HOST || H4.HOST_ADDRESS;
      if (!/^https?:\/\//.test(H)) H = `http://${H}`;
      return new URL(H4.BASE_PATH, H).href;
    }
    function g54(H) {
      Object.keys(H).forEach((_) => {
        switch (_) {
          case "params":
          case "property":
          case "headers":
            break;
          case "qs":
            throw Error("'qs' is not a valid configuration option. Please use 'params' instead.");
          default:
            throw Error(`'${_}' is not a valid configuration option.`);
        }
      });
    }
    async function wdH(H, _ = {}, q = 3, $ = !1) {
      let K = "",
        O = {},
        T = {};
      if (typeof H === "object") {
        let w = H;
        (K = w.metadataKey),
          (O = w.params || O),
          (T = w.headers || T),
          (q = w.noResponseRetries || q),
          ($ = w.fastFail || $);
      } else K = H;
      if (typeof _ === "string") K += `/${_}`;
      else {
        if ((g54(_), _.property)) K += `/${_.property}`;
        (T = _.headers || T), (O = _.params || O);
      }
      let z = $ ? d54 : fX6.request,
        A = {
          url: `${wX6()}/${K}`,
          headers: { ...H4.HEADERS, ...T },
          retryConfig: { noResponseRetries: q },
          params: O,
          responseType: "text",
          timeout: _Rq(),
        };
      eGq.info("instance request %j", A);
      let f = await z(A);
      if ((eGq.info("instance metadata is %s", f.data), f.headers[H4.HEADER_NAME.toLowerCase()] !== H4.HEADER_VALUE))
        throw Error(
          `Invalid response from metadata service: incorrect ${H4.HEADER_NAME} header. Expected '${H4.HEADER_VALUE}', got ${f.headers[H4.HEADER_NAME.toLowerCase()] ? `'${f.headers[H4.HEADER_NAME.toLowerCase()]}'` : "no header"}`,
        );
      if (typeof f.data === "string")
        try {
          return m54.parse(f.data);
        } catch (w) {}
      return f.data;
    }
    async function d54(H) {
      var _;
      let q = {
          ...H,
          url:
            (_ = H.url) === null || _ === void 0 ? void 0 : _.toString().replace(wX6(), wX6(H4.SECONDARY_HOST_ADDRESS)),
        },
        $ = !1,
        K = (0, fX6.request)(H)
          .then((T) => {
            return ($ = !0), T;
          })
          .catch((T) => {
            if ($) return O;
            else throw (($ = !0), T);
          }),
        O = (0, fX6.request)(q)
          .then((T) => {
            return ($ = !0), T;
          })
          .catch((T) => {
            if ($) return K;
            else throw (($ = !0), T);
          });
      return Promise.race([K, O]);
    }
    function c54(H) {
      return wdH("instance", H);
    }
    function F54(H) {
      return wdH("project", H);
    }
    function U54(H) {
      return wdH("universe", H);
    }
    async function Q54(H) {
      let _ = {};
      return (
        await Promise.all(
          H.map((q) => {
            return (async () => {
              let $ = await wdH(q),
                K = q.metadataKey;
              _[K] = $;
            })();
          }),
        ),
        _
      );
    }
    function l54() {
      return process.env.DETECT_GCP_RETRIES ? Number(process.env.DETECT_GCP_RETRIES) : 0;
    }
    var $J_;
    async function i54() {
      if (process.env.METADATA_SERVER_DETECTION) {
        let H = process.env.METADATA_SERVER_DETECTION.trim().toLocaleLowerCase();
        if (!(H in H4.METADATA_SERVER_DETECTION))
          throw RangeError(
            `Unknown \`METADATA_SERVER_DETECTION\` env variable. Got \`${H}\`, but it should be \`${Object.keys(H4.METADATA_SERVER_DETECTION).join("`, `")}\`, or unset`,
          );
        switch (H) {
          case "assume-present":
            return !0;
          case "none":
            return !1;
          case "bios-only":
            return YX6();
          case "ping-only":
        }
      }
      try {
        if ($J_ === void 0)
          $J_ = wdH("instance", void 0, l54(), !(process.env.GCE_METADATA_IP || process.env.GCE_METADATA_HOST));
        return await $J_, !0;
      } catch (H) {
        let _ = H;
        if (process.env.DEBUG_AUTH) console.info(_);
        if (_.type === "request-timeout") return !1;
        if (_.response && _.response.status === 404) return !1;
        else {
          if (
            !(_.response && _.response.status === 404) &&
            (!_.code ||
              !["EHOSTDOWN", "EHOSTUNREACH", "ENETUNREACH", "ENOENT", "ENOTFOUND", "ECONNREFUSED"].includes(_.code))
          ) {
            let q = "UNKNOWN";
            if (_.code) q = _.code;
            process.emitWarning(`received unexpected error = ${_.message} code = ${q}`, "MetadataLookupWarning");
          }
          return !1;
        }
      }
    }
    function n54() {
      $J_ = void 0;
    }
    H4.gcpResidencyCache = null;
    function YX6() {
      if (H4.gcpResidencyCache === null) HRq();
      return H4.gcpResidencyCache;
    }
    function HRq(H = null) {
      H4.gcpResidencyCache = H !== null ? H : (0, p54.detectGCPResidency)();
    }
    function _Rq() {
      return YX6() ? 0 : 3000;
    }
    x54(OX6(), H4);
  });

  var uX6 = d((WdH) => {
    Object.defineProperty(WdH, "__esModule", { value: !0 });
    WdH.OAuthClientAuthHandler = void 0;
    WdH.getErrorFromOAuthErrorResponse = n34;
    var bRq = require("querystring"),
      l34 = bXH(),
      i34 = ["PUT", "POST", "PATCH"];
    class IRq {
      constructor(H) {
        (this.clientAuthentication = H), (this.crypto = (0, l34.createCrypto)());
      }
      applyClientAuthenticationOptions(H, _) {
        if ((this.injectAuthenticatedHeaders(H, _), !_)) this.injectAuthenticatedRequestBody(H);
      }
      injectAuthenticatedHeaders(H, _) {
        var q;
        if (_) (H.headers = H.headers || {}), Object.assign(H.headers, { Authorization: `Bearer ${_}}` });
        else if (
          ((q = this.clientAuthentication) === null || q === void 0 ? void 0 : q.confidentialClientType) === "basic"
        ) {
          H.headers = H.headers || {};
          let $ = this.clientAuthentication.clientId,
            K = this.clientAuthentication.clientSecret || "",
            O = this.crypto.encodeBase64StringUtf8(`${$}:${K}`);
          Object.assign(H.headers, { Authorization: `Basic ${O}` });
        }
      }
      injectAuthenticatedRequestBody(H) {
        var _;
        if (
          ((_ = this.clientAuthentication) === null || _ === void 0 ? void 0 : _.confidentialClientType) ===
          "request-body"
        ) {
          let q = (H.method || "GET").toUpperCase();
          if (i34.indexOf(q) !== -1) {
            let $,
              K = H.headers || {};
            for (let O in K)
              if (O.toLowerCase() === "content-type" && K[O]) {
                $ = K[O].toLowerCase();
                break;
              }
            if ($ === "application/x-www-form-urlencoded") {
              H.data = H.data || "";
              let O = bRq.parse(H.data);
              Object.assign(O, {
                client_id: this.clientAuthentication.clientId,
                client_secret: this.clientAuthentication.clientSecret || "",
              }),
                (H.data = bRq.stringify(O));
            } else if ($ === "application/json")
              (H.data = H.data || {}),
                Object.assign(H.data, {
                  client_id: this.clientAuthentication.clientId,
                  client_secret: this.clientAuthentication.clientSecret || "",
                });
            else
              throw Error(
                `${$} content-types are not supported with ${this.clientAuthentication.confidentialClientType} client authentication`,
              );
          } else
            throw Error(
              `${q} HTTP method does not support ${this.clientAuthentication.confidentialClientType} client authentication`,
            );
        }
      }
      static get RETRY_CONFIG() {
        return { retry: !0, retryConfig: { httpMethodsToRetry: ["GET", "PUT", "POST", "HEAD", "OPTIONS", "DELETE"] } };
      }
    }
    WdH.OAuthClientAuthHandler = IRq;
    function n34(H, _) {
      let { error: q, error_description: $, error_uri: K } = H,
        O = `Error code ${q}`;
      if (typeof $ < "u") O += `: ${$}`;
      if (typeof K < "u") O += ` - ${K}`;
      let T = Error(O);
      if (_) {
        let z = Object.keys(_);
        if (_.stack) z.push("stack");
        z.forEach((A) => {
          if (A !== "message") Object.defineProperty(T, A, { value: _[A], writable: !1, enumerable: !0 });
        });
      }
      return T;
    }
  });

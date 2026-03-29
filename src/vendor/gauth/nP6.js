  var nP6 = d((lS) => {
    var c14 =
        (lS && lS.__importDefault) ||
        function (H) {
          return H && H.__esModule ? H : { default: H };
        },
      i0q;
    Object.defineProperty(lS, "__esModule", { value: !0 });
    lS.GaxiosError = lS.GAXIOS_ERROR_SYMBOL = void 0;
    lS.defaultErrorRedactor = r0q;
    var F14 = require("url"),
      lP6 = l0q(),
      n0q = c14(QP6());
    lS.GAXIOS_ERROR_SYMBOL = Symbol.for(`${lP6.pkg.name}-gaxios-error`);
    class iP6 extends Error {
      static [((i0q = lS.GAXIOS_ERROR_SYMBOL), Symbol.hasInstance)](H) {
        if (H && typeof H === "object" && lS.GAXIOS_ERROR_SYMBOL in H && H[lS.GAXIOS_ERROR_SYMBOL] === lP6.pkg.version)
          return !0;
        return Function.prototype[Symbol.hasInstance].call(iP6, H);
      }
      constructor(H, _, q, $) {
        var K;
        super(H);
        if (
          ((this.config = _),
          (this.response = q),
          (this.error = $),
          (this[i0q] = lP6.pkg.version),
          (this.config = (0, n0q.default)(!0, {}, _)),
          this.response)
        )
          this.response.config = (0, n0q.default)(!0, {}, this.response.config);
        if (this.response) {
          try {
            this.response.data = U14(
              this.config.responseType,
              (K = this.response) === null || K === void 0 ? void 0 : K.data,
            );
          } catch (O) {}
          this.status = this.response.status;
        }
        if ($ && "code" in $ && $.code) this.code = $.code;
        if (_.errorRedactor) _.errorRedactor({ config: this.config, response: this.response });
      }
    }
    lS.GaxiosError = iP6;
    function U14(H, _) {
      switch (H) {
        case "stream":
          return _;
        case "json":
          return JSON.parse(JSON.stringify(_));
        case "arraybuffer":
          return JSON.parse(Buffer.from(_).toString("utf8"));
        case "blob":
          return JSON.parse(_.text());
        default:
          return _;
      }
    }
    function r0q(H) {
      function q(O) {
        if (!O) return;
        for (let T of Object.keys(O)) {
          if (/^authentication$/i.test(T))
            O[T] = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
          if (/^authorization$/i.test(T))
            O[T] = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
          if (/secret/i.test(T)) O[T] = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
        }
      }
      function $(O, T) {
        if (typeof O === "object" && O !== null && typeof O[T] === "string") {
          let z = O[T];
          if (/grant_type=/i.test(z) || /assertion=/i.test(z) || /secret/i.test(z))
            O[T] = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
        }
      }
      function K(O) {
        if (typeof O === "object" && O !== null) {
          if ("grant_type" in O)
            O.grant_type = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
          if ("assertion" in O)
            O.assertion = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
          if ("client_secret" in O)
            O.client_secret = "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.";
        }
      }
      if (H.config) {
        q(H.config.headers), $(H.config, "data"), K(H.config.data), $(H.config, "body"), K(H.config.body);
        try {
          let O = new F14.URL("", H.config.url);
          if (O.searchParams.has("token"))
            O.searchParams.set("token", "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.");
          if (O.searchParams.has("client_secret"))
            O.searchParams.set(
              "client_secret",
              "<<REDACTED> - See `errorRedactor` option in `gaxios` for configuration>.",
            );
          H.config.url = O.toString();
        } catch (O) {}
      }
      if (H.response)
        r0q({ config: H.response.config }), q(H.response.headers), $(H.response, "data"), K(H.response.data);
      return H;
    }
  });

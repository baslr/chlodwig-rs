  var YNH = d((taH) => {
    Object.defineProperty(taH, "__esModule", { value: !0 });
    taH.ChannelCredentials = void 0;
    taH.createCertificateProviderChannelCredentials = FL1;
    var saH = require("tls"),
      Vu_ = Nu_(),
      kQ6 = GQ6(),
      nB7 = OL(),
      gL1 = qm(),
      dL1 = DA(),
      cL1 = mK();
    function LQ6(H, _) {
      if (H && !(H instanceof Buffer)) throw TypeError(`${_}, if provided, must be a Buffer.`);
    }
    class wNH {
      compose(H) {
        return new yu_(this, H);
      }
      static createSsl(H, _, q, $) {
        var K;
        if ((LQ6(H, "Root certificate"), LQ6(_, "Private key"), LQ6(q, "Certificate chain"), _ && !q))
          throw Error("Private key must be given with accompanying certificate chain");
        if (!_ && q) throw Error("Certificate chain must be given with accompanying private key");
        let O = (0, saH.createSecureContext)({
          ca:
            (K = H !== null && H !== void 0 ? H : (0, kQ6.getDefaultRootsData)()) !== null && K !== void 0 ? K : void 0,
          key: _ !== null && _ !== void 0 ? _ : void 0,
          cert: q !== null && q !== void 0 ? q : void 0,
          ciphers: kQ6.CIPHER_SUITES,
        });
        return new hu_(O, $ !== null && $ !== void 0 ? $ : {});
      }
      static createFromSecureContext(H, _) {
        return new hu_(H, _ !== null && _ !== void 0 ? _ : {});
      }
      static createInsecure() {
        return new vQ6();
      }
    }
    taH.ChannelCredentials = wNH;
    class vQ6 extends wNH {
      constructor() {
        super();
      }
      compose(H) {
        throw Error("Cannot compose insecure credentials");
      }
      _isSecure() {
        return !1;
      }
      _equals(H) {
        return H instanceof vQ6;
      }
      _createSecureConnector(H, _, q) {
        return {
          connect($) {
            return Promise.resolve({ socket: $, secure: !1 });
          },
          waitForReady: () => {
            return Promise.resolve();
          },
          getCallCredentials: () => {
            return q !== null && q !== void 0 ? q : Vu_.CallCredentials.createEmpty();
          },
          destroy() {},
        };
      }
    }
    function rB7(H, _, q, $) {
      var K, O;
      let T = { secureContext: H },
        z = q;
      if ("grpc.http_connect_target" in $) {
        let Y = (0, nB7.parseUri)($["grpc.http_connect_target"]);
        if (Y) z = Y;
      }
      let A = (0, gL1.getDefaultAuthority)(z),
        f = (0, nB7.splitHostPort)(A),
        w = (K = f === null || f === void 0 ? void 0 : f.host) !== null && K !== void 0 ? K : A;
      if (((T.host = w), _.checkServerIdentity)) T.checkServerIdentity = _.checkServerIdentity;
      if (_.rejectUnauthorized !== void 0) T.rejectUnauthorized = _.rejectUnauthorized;
      if (((T.ALPNProtocols = ["h2"]), $["grpc.ssl_target_name_override"])) {
        let Y = $["grpc.ssl_target_name_override"],
          D = (O = T.checkServerIdentity) !== null && O !== void 0 ? O : saH.checkServerIdentity;
        (T.checkServerIdentity = (j, M) => {
          return D(Y, M);
        }),
          (T.servername = Y);
      } else T.servername = w;
      if ($["grpc-node.tls_enable_trace"]) T.enableTrace = !0;
      return T;
    }
    class oB7 {
      constructor(H, _) {
        (this.connectionOptions = H), (this.callCredentials = _);
      }
      connect(H) {
        let _ = Object.assign({ socket: H }, this.connectionOptions);
        return new Promise((q, $) => {
          let K = (0, saH.connect)(_, () => {
            var O;
            if (((O = this.connectionOptions.rejectUnauthorized) !== null && O !== void 0 ? O : !0) && !K.authorized) {
              $(K.authorizationError);
              return;
            }
            q({ socket: K, secure: !0 });
          });
          K.on("error", (O) => {
            $(O);
          });
        });
      }
      waitForReady() {
        return Promise.resolve();
      }
      getCallCredentials() {
        return this.callCredentials;
      }
      destroy() {}
    }
    class hu_ extends wNH {
      constructor(H, _) {
        super();
        (this.secureContext = H), (this.verifyOptions = _);
      }
      _isSecure() {
        return !0;
      }
      _equals(H) {
        if (this === H) return !0;
        if (H instanceof hu_)
          return (
            this.secureContext === H.secureContext &&
            this.verifyOptions.checkServerIdentity === H.verifyOptions.checkServerIdentity
          );
        else return !1;
      }
      _createSecureConnector(H, _, q) {
        let $ = rB7(this.secureContext, this.verifyOptions, H, _);
        return new oB7($, q !== null && q !== void 0 ? q : Vu_.CallCredentials.createEmpty());
      }
    }
    class aaH extends wNH {
      constructor(H, _, q) {
        super();
        (this.caCertificateProvider = H),
          (this.identityCertificateProvider = _),
          (this.verifyOptions = q),
          (this.refcount = 0),
          (this.latestCaUpdate = void 0),
          (this.latestIdentityUpdate = void 0),
          (this.caCertificateUpdateListener = this.handleCaCertificateUpdate.bind(this)),
          (this.identityCertificateUpdateListener = this.handleIdentityCertitificateUpdate.bind(this)),
          (this.secureContextWatchers = []);
      }
      _isSecure() {
        return !0;
      }
      _equals(H) {
        var _, q;
        if (this === H) return !0;
        if (H instanceof aaH)
          return (
            this.caCertificateProvider === H.caCertificateProvider &&
            this.identityCertificateProvider === H.identityCertificateProvider &&
            ((_ = this.verifyOptions) === null || _ === void 0 ? void 0 : _.checkServerIdentity) ===
              ((q = H.verifyOptions) === null || q === void 0 ? void 0 : q.checkServerIdentity)
          );
        else return !1;
      }
      ref() {
        var H;
        if (this.refcount === 0)
          this.caCertificateProvider.addCaCertificateListener(this.caCertificateUpdateListener),
            (H = this.identityCertificateProvider) === null ||
              H === void 0 ||
              H.addIdentityCertificateListener(this.identityCertificateUpdateListener);
        this.refcount += 1;
      }
      unref() {
        var H;
        if (((this.refcount -= 1), this.refcount === 0))
          this.caCertificateProvider.removeCaCertificateListener(this.caCertificateUpdateListener),
            (H = this.identityCertificateProvider) === null ||
              H === void 0 ||
              H.removeIdentityCertificateListener(this.identityCertificateUpdateListener);
      }
      _createSecureConnector(H, _, q) {
        return (
          this.ref(),
          new aaH.SecureConnectorImpl(this, H, _, q !== null && q !== void 0 ? q : Vu_.CallCredentials.createEmpty())
        );
      }
      maybeUpdateWatchers() {
        if (this.hasReceivedUpdates()) {
          for (let H of this.secureContextWatchers) H(this.getLatestSecureContext());
          this.secureContextWatchers = [];
        }
      }
      handleCaCertificateUpdate(H) {
        (this.latestCaUpdate = H), this.maybeUpdateWatchers();
      }
      handleIdentityCertitificateUpdate(H) {
        (this.latestIdentityUpdate = H), this.maybeUpdateWatchers();
      }
      hasReceivedUpdates() {
        if (this.latestCaUpdate === void 0) return !1;
        if (this.identityCertificateProvider && this.latestIdentityUpdate === void 0) return !1;
        return !0;
      }
      getSecureContext() {
        if (this.hasReceivedUpdates()) return Promise.resolve(this.getLatestSecureContext());
        else
          return new Promise((H) => {
            this.secureContextWatchers.push(H);
          });
      }
      getLatestSecureContext() {
        var H, _;
        if (!this.latestCaUpdate) return null;
        if (this.identityCertificateProvider !== null && !this.latestIdentityUpdate) return null;
        try {
          return (0, saH.createSecureContext)({
            ca: this.latestCaUpdate.caCertificate,
            key: (H = this.latestIdentityUpdate) === null || H === void 0 ? void 0 : H.privateKey,
            cert: (_ = this.latestIdentityUpdate) === null || _ === void 0 ? void 0 : _.certificate,
            ciphers: kQ6.CIPHER_SUITES,
          });
        } catch (q) {
          return (0, dL1.log)(cL1.LogVerbosity.ERROR, "Failed to createSecureContext with error " + q.message), null;
        }
      }
    }
    aaH.SecureConnectorImpl = class {
      constructor(H, _, q, $) {
        (this.parent = H), (this.channelTarget = _), (this.options = q), (this.callCredentials = $);
      }
      connect(H) {
        return new Promise((_, q) => {
          let $ = this.parent.getLatestSecureContext();
          if (!$) {
            q(Error("Failed to load credentials"));
            return;
          }
          if (H.closed) q(Error("Socket closed while loading credentials"));
          let K = rB7($, this.parent.verifyOptions, this.channelTarget, this.options),
            O = Object.assign({ socket: H }, K),
            T = () => {
              q(Error("Socket closed"));
            },
            z = (f) => {
              q(f);
            },
            A = (0, saH.connect)(O, () => {
              var f;
              if (
                (A.removeListener("close", T),
                A.removeListener("error", z),
                ((f = this.parent.verifyOptions.rejectUnauthorized) !== null && f !== void 0 ? f : !0) && !A.authorized)
              ) {
                q(A.authorizationError);
                return;
              }
              _({ socket: A, secure: !0 });
            });
          A.once("close", T), A.once("error", z);
        });
      }
      async waitForReady() {
        await this.parent.getSecureContext();
      }
      getCallCredentials() {
        return this.callCredentials;
      }
      destroy() {
        this.parent.unref();
      }
    };
    function FL1(H, _, q) {
      return new aaH(H, _, q !== null && q !== void 0 ? q : {});
    }
    class yu_ extends wNH {
      constructor(H, _) {
        super();
        if (((this.channelCredentials = H), (this.callCredentials = _), !H._isSecure()))
          throw Error("Cannot compose insecure credentials");
      }
      compose(H) {
        let _ = this.callCredentials.compose(H);
        return new yu_(this.channelCredentials, _);
      }
      _isSecure() {
        return !0;
      }
      _equals(H) {
        if (this === H) return !0;
        if (H instanceof yu_)
          return (
            this.channelCredentials._equals(H.channelCredentials) && this.callCredentials._equals(H.callCredentials)
          );
        else return !1;
      }
      _createSecureConnector(H, _, q) {
        let $ = this.callCredentials.compose(q !== null && q !== void 0 ? q : Vu_.CallCredentials.createEmpty());
        return this.channelCredentials._createSecureConnector(H, _, $);
      }
    }
  });

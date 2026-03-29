  var lx_ = d((uNH) => {
    Object.defineProperty(uNH, "__esModule", { value: !0 });
    uNH.ServerCredentials = void 0;
    uNH.createCertificateProviderServerCredentials = qS1;
    uNH.createServerCredentialsWithInterceptors = $S1;
    var zi6 = GQ6();
    class INH {
      constructor(H, _) {
        (this.serverConstructorOptions = H),
          (this.watchers = new Set()),
          (this.latestContextOptions = null),
          (this.latestContextOptions = _ !== null && _ !== void 0 ? _ : null);
      }
      _addWatcher(H) {
        this.watchers.add(H);
      }
      _removeWatcher(H) {
        this.watchers.delete(H);
      }
      getWatcherCount() {
        return this.watchers.size;
      }
      updateSecureContextOptions(H) {
        this.latestContextOptions = H;
        for (let _ of this.watchers) _(this.latestContextOptions);
      }
      _isSecure() {
        return this.serverConstructorOptions !== null;
      }
      _getSecureContextOptions() {
        return this.latestContextOptions;
      }
      _getConstructorOptions() {
        return this.serverConstructorOptions;
      }
      _getInterceptors() {
        return [];
      }
      static createInsecure() {
        return new Ai6();
      }
      static createSsl(H, _, q = !1) {
        var $;
        if (H !== null && !Buffer.isBuffer(H)) throw TypeError("rootCerts must be null or a Buffer");
        if (!Array.isArray(_)) throw TypeError("keyCertPairs must be an array");
        if (typeof q !== "boolean") throw TypeError("checkClientCertificate must be a boolean");
        let K = [],
          O = [];
        for (let T = 0; T < _.length; T++) {
          let z = _[T];
          if (z === null || typeof z !== "object") throw TypeError(`keyCertPair[${T}] must be an object`);
          if (!Buffer.isBuffer(z.private_key)) throw TypeError(`keyCertPair[${T}].private_key must be a Buffer`);
          if (!Buffer.isBuffer(z.cert_chain)) throw TypeError(`keyCertPair[${T}].cert_chain must be a Buffer`);
          K.push(z.cert_chain), O.push(z.private_key);
        }
        return new fi6(
          { requestCert: q, ciphers: zi6.CIPHER_SUITES },
          {
            ca:
              ($ = H !== null && H !== void 0 ? H : (0, zi6.getDefaultRootsData)()) !== null && $ !== void 0
                ? $
                : void 0,
            cert: K,
            key: O,
          },
        );
      }
    }
    uNH.ServerCredentials = INH;
    class Ai6 extends INH {
      constructor() {
        super(null);
      }
      _getSettings() {
        return null;
      }
      _equals(H) {
        return H instanceof Ai6;
      }
    }
    class fi6 extends INH {
      constructor(H, _) {
        super(H, _);
        this.options = Object.assign(Object.assign({}, H), _);
      }
      _equals(H) {
        if (this === H) return !0;
        if (!(H instanceof fi6)) return !1;
        if (Buffer.isBuffer(this.options.ca) && Buffer.isBuffer(H.options.ca)) {
          if (!this.options.ca.equals(H.options.ca)) return !1;
        } else if (this.options.ca !== H.options.ca) return !1;
        if (Array.isArray(this.options.cert) && Array.isArray(H.options.cert)) {
          if (this.options.cert.length !== H.options.cert.length) return !1;
          for (let _ = 0; _ < this.options.cert.length; _++) {
            let q = this.options.cert[_],
              $ = H.options.cert[_];
            if (Buffer.isBuffer(q) && Buffer.isBuffer($)) {
              if (!q.equals($)) return !1;
            } else if (q !== $) return !1;
          }
        } else if (this.options.cert !== H.options.cert) return !1;
        if (Array.isArray(this.options.key) && Array.isArray(H.options.key)) {
          if (this.options.key.length !== H.options.key.length) return !1;
          for (let _ = 0; _ < this.options.key.length; _++) {
            let q = this.options.key[_],
              $ = H.options.key[_];
            if (Buffer.isBuffer(q) && Buffer.isBuffer($)) {
              if (!q.equals($)) return !1;
            } else if (q !== $) return !1;
          }
        } else if (this.options.key !== H.options.key) return !1;
        if (this.options.requestCert !== H.options.requestCert) return !1;
        return !0;
      }
    }
    class wi6 extends INH {
      constructor(H, _, q) {
        super({ requestCert: _ !== null, rejectUnauthorized: q, ciphers: zi6.CIPHER_SUITES });
        (this.identityCertificateProvider = H),
          (this.caCertificateProvider = _),
          (this.requireClientCertificate = q),
          (this.latestCaUpdate = null),
          (this.latestIdentityUpdate = null),
          (this.caCertificateUpdateListener = this.handleCaCertificateUpdate.bind(this)),
          (this.identityCertificateUpdateListener = this.handleIdentityCertitificateUpdate.bind(this));
      }
      _addWatcher(H) {
        var _;
        if (this.getWatcherCount() === 0)
          (_ = this.caCertificateProvider) === null ||
            _ === void 0 ||
            _.addCaCertificateListener(this.caCertificateUpdateListener),
            this.identityCertificateProvider.addIdentityCertificateListener(this.identityCertificateUpdateListener);
        super._addWatcher(H);
      }
      _removeWatcher(H) {
        var _;
        if ((super._removeWatcher(H), this.getWatcherCount() === 0))
          (_ = this.caCertificateProvider) === null ||
            _ === void 0 ||
            _.removeCaCertificateListener(this.caCertificateUpdateListener),
            this.identityCertificateProvider.removeIdentityCertificateListener(this.identityCertificateUpdateListener);
      }
      _equals(H) {
        if (this === H) return !0;
        if (!(H instanceof wi6)) return !1;
        return (
          this.caCertificateProvider === H.caCertificateProvider &&
          this.identityCertificateProvider === H.identityCertificateProvider &&
          this.requireClientCertificate === H.requireClientCertificate
        );
      }
      calculateSecureContextOptions() {
        var H;
        if (this.latestIdentityUpdate === null) return null;
        if (this.caCertificateProvider !== null && this.latestCaUpdate === null) return null;
        return {
          ca: (H = this.latestCaUpdate) === null || H === void 0 ? void 0 : H.caCertificate,
          cert: [this.latestIdentityUpdate.certificate],
          key: [this.latestIdentityUpdate.privateKey],
        };
      }
      finalizeUpdate() {
        let H = this.calculateSecureContextOptions();
        this.updateSecureContextOptions(H);
      }
      handleCaCertificateUpdate(H) {
        (this.latestCaUpdate = H), this.finalizeUpdate();
      }
      handleIdentityCertitificateUpdate(H) {
        (this.latestIdentityUpdate = H), this.finalizeUpdate();
      }
    }
    function qS1(H, _, q) {
      return new wi6(H, _, q);
    }
    class Yi6 extends INH {
      constructor(H, _) {
        super({});
        (this.childCredentials = H), (this.interceptors = _);
      }
      _isSecure() {
        return this.childCredentials._isSecure();
      }
      _equals(H) {
        if (!(H instanceof Yi6)) return !1;
        if (!this.childCredentials._equals(H.childCredentials)) return !1;
        if (this.interceptors.length !== H.interceptors.length) return !1;
        for (let _ = 0; _ < this.interceptors.length; _++) if (this.interceptors[_] !== H.interceptors[_]) return !1;
        return !0;
      }
      _getInterceptors() {
        return this.interceptors;
      }
      _addWatcher(H) {
        this.childCredentials._addWatcher(H);
      }
      _removeWatcher(H) {
        this.childCredentials._removeWatcher(H);
      }
      _getConstructorOptions() {
        return this.childCredentials._getConstructorOptions();
      }
      _getSecureContextOptions() {
        return this.childCredentials._getSecureContextOptions();
      }
    }
    function $S1(H, _) {
      return new Yi6(H, _);
    }
  });

  var yU7 = d((Hm_) => {
    Object.defineProperty(Hm_, "__esModule", { value: !0 });
    Hm_.FileWatcherCertificateProvider = void 0;
    var oS1 = require("fs"),
      aS1 = DA(),
      sS1 = mK(),
      tS1 = require("util"),
      eS1 = "certificate_provider";
    function ex_(H) {
      aS1.trace(sS1.LogVerbosity.DEBUG, eS1, H);
    }
    var Zi6 = (0, tS1.promisify)(oS1.readFile);
    class hU7 {
      constructor(H) {
        if (
          ((this.config = H),
          (this.refreshTimer = null),
          (this.fileResultPromise = null),
          (this.latestCaUpdate = void 0),
          (this.caListeners = new Set()),
          (this.latestIdentityUpdate = void 0),
          (this.identityListeners = new Set()),
          (this.lastUpdateTime = null),
          (H.certificateFile === void 0) !== (H.privateKeyFile === void 0))
        )
          throw Error("certificateFile and privateKeyFile must be set or unset together");
        if (H.certificateFile === void 0 && H.caCertificateFile === void 0)
          throw Error("At least one of certificateFile and caCertificateFile must be set");
        ex_("File watcher constructed with config " + JSON.stringify(H));
      }
      updateCertificates() {
        if (this.fileResultPromise) return;
        (this.fileResultPromise = Promise.allSettled([
          this.config.certificateFile ? Zi6(this.config.certificateFile) : Promise.reject(),
          this.config.privateKeyFile ? Zi6(this.config.privateKeyFile) : Promise.reject(),
          this.config.caCertificateFile ? Zi6(this.config.caCertificateFile) : Promise.reject(),
        ])),
          this.fileResultPromise.then(([H, _, q]) => {
            if (!this.refreshTimer) return;
            if (
              (ex_(
                "File watcher read certificates certificate " +
                  H.status +
                  ", privateKey " +
                  _.status +
                  ", CA certificate " +
                  q.status,
              ),
              (this.lastUpdateTime = new Date()),
              (this.fileResultPromise = null),
              H.status === "fulfilled" && _.status === "fulfilled")
            )
              this.latestIdentityUpdate = { certificate: H.value, privateKey: _.value };
            else this.latestIdentityUpdate = null;
            if (q.status === "fulfilled") this.latestCaUpdate = { caCertificate: q.value };
            else this.latestCaUpdate = null;
            for (let $ of this.identityListeners) $(this.latestIdentityUpdate);
            for (let $ of this.caListeners) $(this.latestCaUpdate);
          }),
          ex_("File watcher initiated certificate update");
      }
      maybeStartWatchingFiles() {
        if (!this.refreshTimer) {
          let H = this.lastUpdateTime ? new Date().getTime() - this.lastUpdateTime.getTime() : 1 / 0;
          if (H > this.config.refreshIntervalMs) this.updateCertificates();
          if (H > this.config.refreshIntervalMs * 2)
            (this.latestCaUpdate = void 0), (this.latestIdentityUpdate = void 0);
          (this.refreshTimer = setInterval(() => this.updateCertificates(), this.config.refreshIntervalMs)),
            ex_("File watcher started watching");
        }
      }
      maybeStopWatchingFiles() {
        if (this.caListeners.size === 0 && this.identityListeners.size === 0) {
          if (((this.fileResultPromise = null), this.refreshTimer))
            clearInterval(this.refreshTimer), (this.refreshTimer = null);
        }
      }
      addCaCertificateListener(H) {
        if ((this.caListeners.add(H), this.maybeStartWatchingFiles(), this.latestCaUpdate !== void 0))
          process.nextTick(H, this.latestCaUpdate);
      }
      removeCaCertificateListener(H) {
        this.caListeners.delete(H), this.maybeStopWatchingFiles();
      }
      addIdentityCertificateListener(H) {
        if ((this.identityListeners.add(H), this.maybeStartWatchingFiles(), this.latestIdentityUpdate !== void 0))
          process.nextTick(H, this.latestIdentityUpdate);
      }
      removeIdentityCertificateListener(H) {
        this.identityListeners.delete(H), this.maybeStopWatchingFiles();
      }
    }
    Hm_.FileWatcherCertificateProvider = hU7;
  });

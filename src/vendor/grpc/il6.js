  var il6 = d((FAH) => {
    Object.defineProperty(FAH, "__esModule", { value: !0 });
    FAH.DEFAULT_PORT = void 0;
    FAH.setup = xy1;
    var qF7 = qm(),
      Ql6 = require("dns"),
      Vy1 = NQ6(),
      ll6 = mK(),
      SNH = uAH(),
      Sy1 = GP(),
      Ey1 = DA(),
      Cy1 = mK(),
      Y7H = OL(),
      $F7 = require("net"),
      by1 = DNH(),
      KF7 = _F7(),
      Iy1 = "dns_resolver";
    function ic(H) {
      Ey1.trace(Cy1.LogVerbosity.DEBUG, Iy1, H);
    }
    FAH.DEFAULT_PORT = 443;
    var uy1 = 30000;
    class OF7 {
      constructor(H, _, q) {
        var $, K, O;
        if (
          ((this.target = H),
          (this.listener = _),
          (this.pendingLookupPromise = null),
          (this.pendingTxtPromise = null),
          (this.latestLookupResult = null),
          (this.latestServiceConfigResult = null),
          (this.continueResolving = !1),
          (this.isNextResolutionTimerRunning = !1),
          (this.isServiceConfigEnabled = !0),
          (this.returnedIpResult = !1),
          (this.alternativeResolver = new Ql6.promises.Resolver()),
          ic("Resolver constructed for target " + (0, Y7H.uriToString)(H)),
          H.authority)
        )
          this.alternativeResolver.setServers([H.authority]);
        let T = (0, Y7H.splitHostPort)(H.path);
        if (T === null) (this.ipResult = null), (this.dnsHostname = null), (this.port = null);
        else if ((0, $F7.isIPv4)(T.host) || (0, $F7.isIPv6)(T.host))
          (this.ipResult = [
            { addresses: [{ host: T.host, port: ($ = T.port) !== null && $ !== void 0 ? $ : FAH.DEFAULT_PORT }] },
          ]),
            (this.dnsHostname = null),
            (this.port = null);
        else
          (this.ipResult = null),
            (this.dnsHostname = T.host),
            (this.port = (K = T.port) !== null && K !== void 0 ? K : FAH.DEFAULT_PORT);
        if (((this.percentage = Math.random() * 100), q["grpc.service_config_disable_resolution"] === 1))
          this.isServiceConfigEnabled = !1;
        this.defaultResolutionError = {
          code: ll6.Status.UNAVAILABLE,
          details: `Name resolution failed for target ${(0, Y7H.uriToString)(this.target)}`,
          metadata: new Sy1.Metadata(),
        };
        let z = { initialDelay: q["grpc.initial_reconnect_backoff_ms"], maxDelay: q["grpc.max_reconnect_backoff_ms"] };
        (this.backoff = new by1.BackoffTimeout(() => {
          if (this.continueResolving) this.startResolutionWithBackoff();
        }, z)),
          this.backoff.unref(),
          (this.minTimeBetweenResolutionsMs =
            (O = q["grpc.dns_min_time_between_resolutions_ms"]) !== null && O !== void 0 ? O : uy1),
          (this.nextResolutionTimer = setTimeout(() => {}, 0)),
          clearTimeout(this.nextResolutionTimer);
      }
      startResolution() {
        if (this.ipResult !== null) {
          if (!this.returnedIpResult)
            ic("Returning IP address for target " + (0, Y7H.uriToString)(this.target)),
              setImmediate(() => {
                this.listener((0, SNH.statusOrFromValue)(this.ipResult), {}, null, "");
              }),
              (this.returnedIpResult = !0);
          this.backoff.stop(), this.backoff.reset(), this.stopNextResolutionTimer();
          return;
        }
        if (this.dnsHostname === null)
          ic("Failed to parse DNS address " + (0, Y7H.uriToString)(this.target)),
            setImmediate(() => {
              this.listener(
                (0, SNH.statusOrFromError)({
                  code: ll6.Status.UNAVAILABLE,
                  details: `Failed to parse DNS address ${(0, Y7H.uriToString)(this.target)}`,
                }),
                {},
                null,
                "",
              );
            }),
            this.stopNextResolutionTimer();
        else {
          if (this.pendingLookupPromise !== null) return;
          ic("Looking up DNS hostname " + this.dnsHostname), (this.latestLookupResult = null);
          let H = this.dnsHostname;
          if (
            ((this.pendingLookupPromise = this.lookup(H)),
            this.pendingLookupPromise.then(
              (_) => {
                if (this.pendingLookupPromise === null) return;
                (this.pendingLookupPromise = null),
                  (this.latestLookupResult = (0, SNH.statusOrFromValue)(_.map((K) => ({ addresses: [K] }))));
                let q = "[" + _.map((K) => K.host + ":" + K.port).join(",") + "]";
                ic("Resolved addresses for target " + (0, Y7H.uriToString)(this.target) + ": " + q);
                let $ = this.listener(this.latestLookupResult, {}, this.latestServiceConfigResult, "");
                this.handleHealthStatus($);
              },
              (_) => {
                if (this.pendingLookupPromise === null) return;
                ic("Resolution error for target " + (0, Y7H.uriToString)(this.target) + ": " + _.message),
                  (this.pendingLookupPromise = null),
                  this.stopNextResolutionTimer(),
                  this.listener(
                    (0, SNH.statusOrFromError)(this.defaultResolutionError),
                    {},
                    this.latestServiceConfigResult,
                    "",
                  );
              },
            ),
            this.isServiceConfigEnabled && this.pendingTxtPromise === null)
          )
            (this.pendingTxtPromise = this.resolveTxt(H)),
              this.pendingTxtPromise.then(
                (_) => {
                  if (this.pendingTxtPromise === null) return;
                  this.pendingTxtPromise = null;
                  let q;
                  try {
                    if (((q = (0, Vy1.extractAndSelectServiceConfig)(_, this.percentage)), q))
                      this.latestServiceConfigResult = (0, SNH.statusOrFromValue)(q);
                    else this.latestServiceConfigResult = null;
                  } catch ($) {
                    this.latestServiceConfigResult = (0, SNH.statusOrFromError)({
                      code: ll6.Status.UNAVAILABLE,
                      details: `Parsing service config failed with error ${$.message}`,
                    });
                  }
                  if (this.latestLookupResult !== null)
                    this.listener(this.latestLookupResult, {}, this.latestServiceConfigResult, "");
                },
                (_) => {},
              );
        }
      }
      handleHealthStatus(H) {
        if (H) this.backoff.stop(), this.backoff.reset();
        else this.continueResolving = !0;
      }
      async lookup(H) {
        if (KF7.GRPC_NODE_USE_ALTERNATIVE_RESOLVER) {
          ic("Using alternative DNS resolver.");
          let q = await Promise.allSettled([
            this.alternativeResolver.resolve4(H),
            this.alternativeResolver.resolve6(H),
          ]);
          if (q.every(($) => $.status === "rejected")) throw Error(q[0].reason);
          return q
            .reduce(($, K) => {
              return K.status === "fulfilled" ? [...$, ...K.value] : $;
            }, [])
            .map(($) => ({ host: $, port: +this.port }));
        }
        return (await Ql6.promises.lookup(H, { all: !0 })).map((q) => ({ host: q.address, port: +this.port }));
      }
      async resolveTxt(H) {
        if (KF7.GRPC_NODE_USE_ALTERNATIVE_RESOLVER)
          return ic("Using alternative DNS resolver."), this.alternativeResolver.resolveTxt(H);
        return Ql6.promises.resolveTxt(H);
      }
      startNextResolutionTimer() {
        var H, _;
        clearTimeout(this.nextResolutionTimer),
          (this.nextResolutionTimer = setTimeout(() => {
            if ((this.stopNextResolutionTimer(), this.continueResolving)) this.startResolutionWithBackoff();
          }, this.minTimeBetweenResolutionsMs)),
          (_ = (H = this.nextResolutionTimer).unref) === null || _ === void 0 || _.call(H),
          (this.isNextResolutionTimerRunning = !0);
      }
      stopNextResolutionTimer() {
        clearTimeout(this.nextResolutionTimer), (this.isNextResolutionTimerRunning = !1);
      }
      startResolutionWithBackoff() {
        if (this.pendingLookupPromise === null)
          (this.continueResolving = !1),
            this.backoff.runOnce(),
            this.startNextResolutionTimer(),
            this.startResolution();
      }
      updateResolution() {
        if (this.pendingLookupPromise === null)
          if (this.isNextResolutionTimerRunning || this.backoff.isRunning()) {
            if (this.isNextResolutionTimerRunning)
              ic('resolution update delayed by "min time between resolutions" rate limit');
            else ic("resolution update delayed by backoff timer until " + this.backoff.getEndTime().toISOString());
            this.continueResolving = !0;
          } else this.startResolutionWithBackoff();
      }
      destroy() {
        (this.continueResolving = !1),
          this.backoff.reset(),
          this.backoff.stop(),
          this.stopNextResolutionTimer(),
          (this.pendingLookupPromise = null),
          (this.pendingTxtPromise = null),
          (this.latestLookupResult = null),
          (this.latestServiceConfigResult = null),
          (this.returnedIpResult = !1);
      }
      static getDefaultAuthority(H) {
        return H.path;
      }
    }
    function xy1() {
      (0, qF7.registerResolver)("dns", OF7), (0, qF7.registerDefaultScheme)("dns");
    }
  });

  var jX = d((kM) => {
    var wY = wB(),
      qJH = ob8(),
      Te = g56(),
      YI8 = F16(),
      wI8 = E0(),
      Bk$ = AI8(),
      gk$ = fI8(),
      dk$ = (H, _) => {
        let q = H,
          $ = wY.NO_RETRY_INCREMENT,
          K = wY.RETRY_COST,
          O = wY.TIMEOUT_RETRY_COST,
          T = H,
          z = (Y) => (Y.name === "TimeoutError" ? O : K),
          A = (Y) => z(Y) <= T;
        return Object.freeze({
          hasRetryTokens: A,
          retrieveRetryTokens: (Y) => {
            if (!A(Y)) throw Error("No retry token available");
            let D = z(Y);
            return (T -= D), D;
          },
          releaseRetryTokens: (Y) => {
            (T += Y ?? $), (T = Math.min(T, q));
          },
        });
      },
      DI8 = (H, _) => Math.floor(Math.min(wY.MAXIMUM_RETRY_DELAY, Math.random() * 2 ** _ * H)),
      jI8 = (H) => {
        if (!H) return !1;
        return Te.isRetryableByTrait(H) || Te.isClockSkewError(H) || Te.isThrottlingError(H) || Te.isTransientError(H);
      },
      MI8 = (H) => {
        if (H instanceof Error) return H;
        if (H instanceof Object) return Object.assign(Error(), H);
        if (typeof H === "string") return Error(H);
        return Error(`AWS SDK error wrapper for ${H}`);
      };
    class t56 {
      maxAttemptsProvider;
      retryDecider;
      delayDecider;
      retryQuota;
      mode = wY.RETRY_MODES.STANDARD;
      constructor(H, _) {
        (this.maxAttemptsProvider = H),
          (this.retryDecider = _?.retryDecider ?? jI8),
          (this.delayDecider = _?.delayDecider ?? DI8),
          (this.retryQuota = _?.retryQuota ?? dk$(wY.INITIAL_RETRY_TOKENS));
      }
      shouldRetry(H, _, q) {
        return _ < q && this.retryDecider(H) && this.retryQuota.hasRetryTokens(H);
      }
      async getMaxAttempts() {
        let H;
        try {
          H = await this.maxAttemptsProvider();
        } catch (_) {
          H = wY.DEFAULT_MAX_ATTEMPTS;
        }
        return H;
      }
      async retry(H, _, q) {
        let $,
          K = 0,
          O = 0,
          T = await this.getMaxAttempts(),
          { request: z } = _;
        if (qJH.HttpRequest.isInstance(z)) z.headers[wY.INVOCATION_ID_HEADER] = YI8.v4();
        while (!0)
          try {
            if (qJH.HttpRequest.isInstance(z)) z.headers[wY.REQUEST_HEADER] = `attempt=${K + 1}; max=${T}`;
            if (q?.beforeRequest) await q.beforeRequest();
            let { response: A, output: f } = await H(_);
            if (q?.afterRequest) q.afterRequest(A);
            return (
              this.retryQuota.releaseRetryTokens($),
              (f.$metadata.attempts = K + 1),
              (f.$metadata.totalRetryDelay = O),
              { response: A, output: f }
            );
          } catch (A) {
            let f = MI8(A);
            if ((K++, this.shouldRetry(f, K, T))) {
              $ = this.retryQuota.retrieveRetryTokens(f);
              let w = this.delayDecider(
                  Te.isThrottlingError(f) ? wY.THROTTLING_RETRY_DELAY_BASE : wY.DEFAULT_RETRY_DELAY_BASE,
                  K,
                ),
                Y = ck$(f.$response),
                D = Math.max(Y || 0, w);
              (O += D), await new Promise((j) => setTimeout(j, D));
              continue;
            }
            if (!f.$metadata) f.$metadata = {};
            throw ((f.$metadata.attempts = K), (f.$metadata.totalRetryDelay = O), f);
          }
      }
    }
    var ck$ = (H) => {
      if (!qJH.HttpResponse.isInstance(H)) return;
      let _ = Object.keys(H.headers).find((O) => O.toLowerCase() === "retry-after");
      if (!_) return;
      let q = H.headers[_],
        $ = Number(q);
      if (!Number.isNaN($)) return $ * 1000;
      return new Date(q).getTime() - Date.now();
    };
    class JI8 extends t56 {
      rateLimiter;
      constructor(H, _) {
        let { rateLimiter: q, ...$ } = _ ?? {};
        super(H, $);
        (this.rateLimiter = q ?? new wY.DefaultRateLimiter()), (this.mode = wY.RETRY_MODES.ADAPTIVE);
      }
      async retry(H, _) {
        return super.retry(H, _, {
          beforeRequest: async () => {
            return this.rateLimiter.getSendToken();
          },
          afterRequest: (q) => {
            this.rateLimiter.updateClientSendingRate(q);
          },
        });
      }
    }
    var a56 = "AWS_MAX_ATTEMPTS",
      s56 = "max_attempts",
      Fk$ = {
        environmentVariableSelector: (H) => {
          let _ = H[a56];
          if (!_) return;
          let q = parseInt(_);
          if (Number.isNaN(q)) throw Error(`Environment variable ${a56} mast be a number, got "${_}"`);
          return q;
        },
        configFileSelector: (H) => {
          let _ = H[s56];
          if (!_) return;
          let q = parseInt(_);
          if (Number.isNaN(q)) throw Error(`Shared config file entry ${s56} mast be a number, got "${_}"`);
          return q;
        },
        default: wY.DEFAULT_MAX_ATTEMPTS,
      },
      Uk$ = (H) => {
        let { retryStrategy: _, retryMode: q, maxAttempts: $ } = H,
          K = wI8.normalizeProvider($ ?? wY.DEFAULT_MAX_ATTEMPTS);
        return Object.assign(H, {
          maxAttempts: K,
          retryStrategy: async () => {
            if (_) return _;
            if ((await wI8.normalizeProvider(q)()) === wY.RETRY_MODES.ADAPTIVE) return new wY.AdaptiveRetryStrategy(K);
            return new wY.StandardRetryStrategy(K);
          },
        });
      },
      PI8 = "AWS_RETRY_MODE",
      XI8 = "retry_mode",
      Qk$ = {
        environmentVariableSelector: (H) => H[PI8],
        configFileSelector: (H) => H[XI8],
        default: wY.DEFAULT_RETRY_MODE,
      },
      WI8 = () => (H) => async (_) => {
        let { request: q } = _;
        if (qJH.HttpRequest.isInstance(q))
          delete q.headers[wY.INVOCATION_ID_HEADER], delete q.headers[wY.REQUEST_HEADER];
        return H(_);
      },
      GI8 = {
        name: "omitRetryHeadersMiddleware",
        tags: ["RETRY", "HEADERS", "OMIT_RETRY_HEADERS"],
        relation: "before",
        toMiddleware: "awsAuthMiddleware",
        override: !0,
      },
      lk$ = (H) => ({
        applyToStack: (_) => {
          _.addRelativeTo(WI8(), GI8);
        },
      }),
      RI8 = (H) => (_, q) => async ($) => {
        let K = await H.retryStrategy(),
          O = await H.maxAttempts();
        if (ik$(K)) {
          K = K;
          let T = await K.acquireInitialRetryToken(q.partition_id),
            z = Error(),
            A = 0,
            f = 0,
            { request: w } = $,
            Y = qJH.HttpRequest.isInstance(w);
          if (Y) w.headers[wY.INVOCATION_ID_HEADER] = YI8.v4();
          while (!0)
            try {
              if (Y) w.headers[wY.REQUEST_HEADER] = `attempt=${A + 1}; max=${O}`;
              let { response: D, output: j } = await _($);
              return (
                K.recordSuccess(T),
                (j.$metadata.attempts = A + 1),
                (j.$metadata.totalRetryDelay = f),
                { response: D, output: j }
              );
            } catch (D) {
              let j = nk$(D);
              if (((z = MI8(D)), Y && gk$.isStreamingPayload(w)))
                throw (
                  ((q.logger instanceof Bk$.NoOpLogger ? console : q.logger)?.warn(
                    "An error was encountered in a non-retryable streaming request.",
                  ),
                  z)
                );
              try {
                T = await K.refreshRetryTokenForRetry(T, j);
              } catch (J) {
                if (!z.$metadata) z.$metadata = {};
                throw ((z.$metadata.attempts = A + 1), (z.$metadata.totalRetryDelay = f), z);
              }
              A = T.getRetryCount();
              let M = T.getRetryDelay();
              (f += M), await new Promise((J) => setTimeout(J, M));
            }
        } else {
          if (((K = K), K?.mode)) q.userAgent = [...(q.userAgent || []), ["cfg/retry-mode", K.mode]];
          return K.retry(_, $);
        }
      },
      ik$ = (H) =>
        typeof H.acquireInitialRetryToken < "u" &&
        typeof H.refreshRetryTokenForRetry < "u" &&
        typeof H.recordSuccess < "u",
      nk$ = (H) => {
        let _ = { error: H, errorType: rk$(H) },
          q = LI8(H.$response);
        if (q) _.retryAfterHint = q;
        return _;
      },
      rk$ = (H) => {
        if (Te.isThrottlingError(H)) return "THROTTLING";
        if (Te.isTransientError(H)) return "TRANSIENT";
        if (Te.isServerError(H)) return "SERVER_ERROR";
        return "CLIENT_ERROR";
      },
      ZI8 = { name: "retryMiddleware", tags: ["RETRY"], step: "finalizeRequest", priority: "high", override: !0 },
      ok$ = (H) => ({
        applyToStack: (_) => {
          _.add(RI8(H), ZI8);
        },
      }),
      LI8 = (H) => {
        if (!qJH.HttpResponse.isInstance(H)) return;
        let _ = Object.keys(H.headers).find((O) => O.toLowerCase() === "retry-after");
        if (!_) return;
        let q = H.headers[_],
          $ = Number(q);
        if (!Number.isNaN($)) return new Date($ * 1000);
        return new Date(q);
      };
    kM.AdaptiveRetryStrategy = JI8;
    kM.CONFIG_MAX_ATTEMPTS = s56;
    kM.CONFIG_RETRY_MODE = XI8;
    kM.ENV_MAX_ATTEMPTS = a56;
    kM.ENV_RETRY_MODE = PI8;
    kM.NODE_MAX_ATTEMPT_CONFIG_OPTIONS = Fk$;
    kM.NODE_RETRY_MODE_CONFIG_OPTIONS = Qk$;
    kM.StandardRetryStrategy = t56;
    kM.defaultDelayDecider = DI8;
    kM.defaultRetryDecider = jI8;
    kM.getOmitRetryHeadersPlugin = lk$;
    kM.getRetryAfterHint = LI8;
    kM.getRetryPlugin = ok$;
    kM.omitRetryHeadersMiddleware = WI8;
    kM.omitRetryHeadersMiddlewareOptions = GI8;
    kM.resolveRetryConfig = Uk$;
    kM.retryMiddleware = RI8;
    kM.retryMiddlewareOptions = ZI8;
  });

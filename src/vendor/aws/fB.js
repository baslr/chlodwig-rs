  var fB = d((eMH) => {
    var gZ$ = m$(),
      dZ$ = zB(),
      cZ$ = nE8(),
      AB = mA(),
      Kb8 = void 0;
    function FZ$(H) {
      if (H === void 0) return !0;
      return typeof H === "string" && H.length <= 50;
    }
    function UZ$(H) {
      let _ = gZ$.normalizeProvider(H.userAgentAppId ?? Kb8),
        { customUserAgent: q } = H;
      return Object.assign(H, {
        customUserAgent: typeof q === "string" ? [[q]] : q,
        userAgentAppId: async () => {
          let $ = await _();
          if (!FZ$($)) {
            let K = H.logger?.constructor?.name === "NoOpLogger" || !H.logger ? console : H.logger;
            if (typeof $ !== "string") K?.warn("userAgentAppId must be a string or undefined.");
            else if ($.length > 50) K?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
          }
          return $;
        },
      });
    }
    var QZ$ = /\d{12}\.ddb/;
    async function lZ$(H, _, q) {
      if (q.request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") AB.setFeature(H, "PROTOCOL_RPC_V2_CBOR", "M");
      if (typeof _.retryStrategy === "function") {
        let O = await _.retryStrategy();
        if (typeof O.acquireInitialRetryToken === "function")
          if (O.constructor?.name?.includes("Adaptive")) AB.setFeature(H, "RETRY_MODE_ADAPTIVE", "F");
          else AB.setFeature(H, "RETRY_MODE_STANDARD", "E");
        else AB.setFeature(H, "RETRY_MODE_LEGACY", "D");
      }
      if (typeof _.accountIdEndpointMode === "function") {
        let O = H.endpointV2;
        if (String(O?.url?.hostname).match(QZ$)) AB.setFeature(H, "ACCOUNT_ID_ENDPOINT", "O");
        switch (await _.accountIdEndpointMode?.()) {
          case "disabled":
            AB.setFeature(H, "ACCOUNT_ID_MODE_DISABLED", "Q");
            break;
          case "preferred":
            AB.setFeature(H, "ACCOUNT_ID_MODE_PREFERRED", "P");
            break;
          case "required":
            AB.setFeature(H, "ACCOUNT_ID_MODE_REQUIRED", "R");
            break;
        }
      }
      let K = H.__smithy_context?.selectedHttpAuthScheme?.identity;
      if (K?.$source) {
        let O = K;
        if (O.accountId) AB.setFeature(H, "RESOLVED_ACCOUNT_ID", "T");
        for (let [T, z] of Object.entries(O.$source ?? {})) AB.setFeature(H, T, z);
      }
    }
    var _b8 = "user-agent",
      x56 = "x-amz-user-agent",
      qb8 = " ",
      m56 = "/",
      iZ$ = /[^!$%&'*+\-.^_`|~\w]/g,
      nZ$ = /[^!$%&'*+\-.^_`|~\w#]/g,
      $b8 = "-",
      rZ$ = 1024;
    function oZ$(H) {
      let _ = "";
      for (let q in H) {
        let $ = H[q];
        if (_.length + $.length + 1 <= rZ$) {
          if (_.length) _ += "," + $;
          else _ += $;
          continue;
        }
        break;
      }
      return _;
    }
    var Ob8 = (H) => (_, q) => async ($) => {
        let { request: K } = $;
        if (!cZ$.HttpRequest.isInstance(K)) return _($);
        let { headers: O } = K,
          T = q?.userAgent?.map(lO_) || [],
          z = (await H.defaultUserAgentProvider()).map(lO_);
        await lZ$(q, H, $);
        let A = q;
        z.push(`m/${oZ$(Object.assign({}, q.__smithy_context?.features, A.__aws_sdk_context?.features))}`);
        let f = H?.customUserAgent?.map(lO_) || [],
          w = await H.userAgentAppId();
        if (w) z.push(lO_(["app", `${w}`]));
        let Y = dZ$.getUserAgentPrefix(),
          D = (Y ? [Y] : []).concat([...z, ...T, ...f]).join(qb8),
          j = [...z.filter((M) => M.startsWith("aws-sdk-")), ...f].join(qb8);
        if (H.runtime !== "browser") {
          if (j) O[x56] = O[x56] ? `${O[_b8]} ${j}` : j;
          O[_b8] = D;
        } else O[x56] = D;
        return _({ ...$, request: K });
      },
      lO_ = (H) => {
        let _ = H[0]
            .split(m56)
            .map((T) => T.replace(iZ$, $b8))
            .join(m56),
          q = H[1]?.replace(nZ$, $b8),
          $ = _.indexOf(m56),
          K = _.substring(0, $),
          O = _.substring($ + 1);
        if (K === "api") O = O.toLowerCase();
        return [K, O, q]
          .filter((T) => T && T.length > 0)
          .reduce((T, z, A) => {
            switch (A) {
              case 0:
                return z;
              case 1:
                return `${T}/${z}`;
              default:
                return `${T}#${z}`;
            }
          }, "");
      },
      Tb8 = {
        name: "getUserAgentMiddleware",
        step: "build",
        priority: "low",
        tags: ["SET_USER_AGENT", "USER_AGENT"],
        override: !0,
      },
      aZ$ = (H) => ({
        applyToStack: (_) => {
          _.add(Ob8(H), Tb8);
        },
      });
    eMH.DEFAULT_UA_APP_ID = Kb8;
    eMH.getUserAgentMiddlewareOptions = Tb8;
    eMH.getUserAgentPlugin = aZ$;
    eMH.resolveUserAgentConfig = UZ$;
    eMH.userAgentMiddleware = Ob8;
  });

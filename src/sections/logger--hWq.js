    EB();
    AHH();
    Kz();
    vX();
    y5H = z1(ml);
    tJ6 = {
      name: "imdsMsi",
      async isAvailable(H) {
        let { scopes: _, identityClient: q, getTokenOptions: $ } = H,
          K = zBH(_);
        if (!K) return y5H.info(`${ml}: Unavailable. Multiple scopes are not supported.`), !1;
        if (process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST) return !0;
        if (!q) throw Error("Missing IdentityClient");
        let O = _14(K);
        return J3.withSpan(
          "ManagedIdentityCredential-pingImdsEndpoint",
          $ !== null && $ !== void 0 ? $ : {},
          async (T) => {
            var z, A;
            O.tracingOptions = T.tracingOptions;
            let f = bh(O);
            (f.timeout = ((z = T.requestOptions) === null || z === void 0 ? void 0 : z.timeout) || 1000),
              (f.allowInsecureConnection = !0);
            let w;
            try {
              y5H.info(`${ml}: Pinging the Azure IMDS endpoint`), (w = await q.sendRequest(f));
            } catch (Y) {
              if (A2_(Y)) y5H.verbose(`${ml}: Caught error ${Y.name}: ${Y.message}`);
              return y5H.info(`${ml}: The Azure IMDS endpoint is unavailable`), !1;
            }
            if (w.status === 403) {
              if ((A = w.bodyAsText) === null || A === void 0 ? void 0 : A.includes("unreachable"))
                return (
                  y5H.info(`${ml}: The Azure IMDS endpoint is unavailable`), y5H.info(`${ml}: ${w.bodyAsText}`), !1
                );
            }
            return y5H.info(`${ml}: The Azure IMDS endpoint is available`), !0;
          },
        );
      },
    };

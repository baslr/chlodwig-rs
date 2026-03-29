  var ZQ7 = d((jm_) => {
    Object.defineProperty(jm_, "__esModule", { value: !0 });
    jm_.getOtlpGrpcConfigurationFromEnv = void 0;
    var XQ7 = P3(),
      asH = rsH(),
      CC1 = gr(),
      bC1 = require("fs"),
      IC1 = require("path"),
      GQ7 = l9();
    function li6(H, _) {
      if (H != null && H !== "") return H;
      if (_ != null && _ !== "") return _;
      return;
    }
    function uC1(H) {
      let _ = process.env[`OTEL_EXPORTER_OTLP_${H}_HEADERS`]?.trim(),
        q = process.env.OTEL_EXPORTER_OTLP_HEADERS?.trim(),
        $ = (0, XQ7.parseKeyPairsIntoRecord)(_),
        K = (0, XQ7.parseKeyPairsIntoRecord)(q);
      if (Object.keys($).length === 0 && Object.keys(K).length === 0) return;
      let O = Object.assign({}, K, $),
        T = (0, asH.createEmptyMetadata)();
      for (let [z, A] of Object.entries(O)) T.set(z, A);
      return T;
    }
    function xC1(H) {
      let _ = uC1(H);
      if (_ == null) return;
      return () => _;
    }
    function mC1(H) {
      let _ = process.env[`OTEL_EXPORTER_OTLP_${H}_ENDPOINT`]?.trim(),
        q = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
      return li6(_, q);
    }
    function pC1(H) {
      let _ = process.env[`OTEL_EXPORTER_OTLP_${H}_INSECURE`]?.toLowerCase().trim(),
        q = process.env.OTEL_EXPORTER_OTLP_INSECURE?.toLowerCase().trim();
      return li6(_, q) === "true";
    }
    function ii6(H, _, q) {
      let $ = process.env[H]?.trim(),
        K = process.env[_]?.trim(),
        O = li6($, K);
      if (O != null)
        try {
          return bC1.readFileSync(IC1.resolve(process.cwd(), O));
        } catch {
          GQ7.diag.warn(q);
          return;
        }
      else return;
    }
    function BC1(H) {
      return ii6(
        `OTEL_EXPORTER_OTLP_${H}_CLIENT_CERTIFICATE`,
        "OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE",
        "Failed to read client certificate chain file",
      );
    }
    function gC1(H) {
      return ii6(
        `OTEL_EXPORTER_OTLP_${H}_CLIENT_KEY`,
        "OTEL_EXPORTER_OTLP_CLIENT_KEY",
        "Failed to read client certificate private key file",
      );
    }
    function WQ7(H) {
      return ii6(
        `OTEL_EXPORTER_OTLP_${H}_CERTIFICATE`,
        "OTEL_EXPORTER_OTLP_CERTIFICATE",
        "Failed to read root certificate file",
      );
    }
    function RQ7(H) {
      let _ = gC1(H),
        q = BC1(H),
        $ = WQ7(H),
        K = _ != null && q != null;
      if ($ != null && !K)
        return (
          GQ7.diag.warn(
            "Client key and certificate must both be provided, but one was missing - attempting to create credentials from just the root certificate",
          ),
          (0, asH.createSslCredentials)(WQ7(H))
        );
      return (0, asH.createSslCredentials)($, _, q);
    }
    function dC1(H) {
      if (pC1(H)) return (0, asH.createInsecureCredentials)();
      return RQ7(H);
    }
    function cC1(H) {
      return {
        ...(0, CC1.getSharedConfigurationFromEnvironment)(H),
        metadata: xC1(H),
        url: mC1(H),
        credentials: (_) => {
          if (_.startsWith("http://"))
            return () => {
              return (0, asH.createInsecureCredentials)();
            };
          else if (_.startsWith("https://"))
            return () => {
              return RQ7(H);
            };
          return () => {
            return dC1(H);
          };
        },
      };
    }
    jm_.getOtlpGrpcConfigurationFromEnv = cC1;
  });

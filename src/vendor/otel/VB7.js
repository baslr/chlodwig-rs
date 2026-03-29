  var VB7 = d((fu_) => {
    Object.defineProperty(fu_, "__esModule", { value: !0 });
    fu_.getNodeHttpConfigurationFromEnvironment = void 0;
    var NZ1 = require("fs"),
      hZ1 = require("path"),
      Ic = P3(),
      Au_ = l9(),
      yZ1 = zQ6(),
      VZ1 = daH(),
      SZ1 = qu_();
    function EZ1(H) {
      let _ = (0, Ic.getStringFromEnv)(`OTEL_EXPORTER_OTLP_${H}_HEADERS`),
        q = (0, Ic.getStringFromEnv)("OTEL_EXPORTER_OTLP_HEADERS"),
        $ = (0, Ic.parseKeyPairsIntoRecord)(_),
        K = (0, Ic.parseKeyPairsIntoRecord)(q);
      if (Object.keys($).length === 0 && Object.keys(K).length === 0) return;
      return Object.assign({}, (0, Ic.parseKeyPairsIntoRecord)(q), (0, Ic.parseKeyPairsIntoRecord)(_));
    }
    function CZ1(H) {
      try {
        return new URL(H).toString();
      } catch {
        Au_.diag.warn(
          `Configuration: Could not parse environment-provided export URL: '${H}', falling back to undefined`,
        );
        return;
      }
    }
    function bZ1(H, _) {
      try {
        new URL(H);
      } catch {
        Au_.diag.warn(
          `Configuration: Could not parse environment-provided export URL: '${H}', falling back to undefined`,
        );
        return;
      }
      if (!H.endsWith("/")) H = H + "/";
      H += _;
      try {
        new URL(H);
      } catch {
        Au_.diag.warn(
          `Configuration: Provided URL appended with '${_}' is not a valid URL, using 'undefined' instead of '${H}'`,
        );
        return;
      }
      return H;
    }
    function IZ1(H) {
      let _ = (0, Ic.getStringFromEnv)("OTEL_EXPORTER_OTLP_ENDPOINT");
      if (_ === void 0) return;
      return bZ1(_, H);
    }
    function uZ1(H) {
      let _ = (0, Ic.getStringFromEnv)(`OTEL_EXPORTER_OTLP_${H}_ENDPOINT`);
      if (_ === void 0) return;
      return CZ1(_);
    }
    function AQ6(H, _, q) {
      let $ = (0, Ic.getStringFromEnv)(H),
        K = (0, Ic.getStringFromEnv)(_),
        O = $ ?? K;
      if (O != null)
        try {
          return NZ1.readFileSync(hZ1.resolve(process.cwd(), O));
        } catch {
          Au_.diag.warn(q);
          return;
        }
      else return;
    }
    function xZ1(H) {
      return AQ6(
        `OTEL_EXPORTER_OTLP_${H}_CLIENT_CERTIFICATE`,
        "OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE",
        "Failed to read client certificate chain file",
      );
    }
    function mZ1(H) {
      return AQ6(
        `OTEL_EXPORTER_OTLP_${H}_CLIENT_KEY`,
        "OTEL_EXPORTER_OTLP_CLIENT_KEY",
        "Failed to read client certificate private key file",
      );
    }
    function pZ1(H) {
      return AQ6(
        `OTEL_EXPORTER_OTLP_${H}_CERTIFICATE`,
        "OTEL_EXPORTER_OTLP_CERTIFICATE",
        "Failed to read root certificate file",
      );
    }
    function BZ1(H, _) {
      return {
        ...(0, yZ1.getSharedConfigurationFromEnvironment)(H),
        url: uZ1(H) ?? IZ1(_),
        headers: (0, VZ1.wrapStaticHeadersInFunction)(EZ1(H)),
        agentFactory: (0, SZ1.httpAgentFactoryFromOptions)({ keepAlive: !0, ca: pZ1(H), cert: xZ1(H), key: mZ1(H) }),
      };
    }
    fu_.getNodeHttpConfigurationFromEnvironment = BZ1;
  });

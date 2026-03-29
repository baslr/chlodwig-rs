  var NQ6 = d((HsH) => {
    Object.defineProperty(HsH, "__esModule", { value: !0 });
    HsH.validateRetryThrottling = sB7;
    HsH.validateServiceConfig = tB7;
    HsH.extractAndSelectServiceConfig = zk1;
    var tL1 = require("os"),
      Su_ = mK(),
      Eu_ = /^\d+(\.\d{1,9})?s$/,
      eL1 = "node";
    function Hk1(H) {
      if ("service" in H && H.service !== "") {
        if (typeof H.service !== "string")
          throw Error(`Invalid method config name: invalid service: expected type string, got ${typeof H.service}`);
        if ("method" in H && H.method !== "") {
          if (typeof H.method !== "string")
            throw Error(`Invalid method config name: invalid method: expected type string, got ${typeof H.service}`);
          return { service: H.service, method: H.method };
        } else return { service: H.service };
      } else {
        if ("method" in H && H.method !== void 0)
          throw Error("Invalid method config name: method set with empty or unset service");
        return {};
      }
    }
    function _k1(H) {
      if (!("maxAttempts" in H) || !Number.isInteger(H.maxAttempts) || H.maxAttempts < 2)
        throw Error("Invalid method config retry policy: maxAttempts must be an integer at least 2");
      if (!("initialBackoff" in H) || typeof H.initialBackoff !== "string" || !Eu_.test(H.initialBackoff))
        throw Error(
          "Invalid method config retry policy: initialBackoff must be a string consisting of a positive integer or decimal followed by s",
        );
      if (!("maxBackoff" in H) || typeof H.maxBackoff !== "string" || !Eu_.test(H.maxBackoff))
        throw Error(
          "Invalid method config retry policy: maxBackoff must be a string consisting of a positive integer or decimal followed by s",
        );
      if (!("backoffMultiplier" in H) || typeof H.backoffMultiplier !== "number" || H.backoffMultiplier <= 0)
        throw Error("Invalid method config retry policy: backoffMultiplier must be a number greater than 0");
      if (!("retryableStatusCodes" in H && Array.isArray(H.retryableStatusCodes)))
        throw Error("Invalid method config retry policy: retryableStatusCodes is required");
      if (H.retryableStatusCodes.length === 0)
        throw Error("Invalid method config retry policy: retryableStatusCodes must be non-empty");
      for (let _ of H.retryableStatusCodes)
        if (typeof _ === "number") {
          if (!Object.values(Su_.Status).includes(_))
            throw Error("Invalid method config retry policy: retryableStatusCodes value not in status code range");
        } else if (typeof _ === "string") {
          if (!Object.values(Su_.Status).includes(_.toUpperCase()))
            throw Error("Invalid method config retry policy: retryableStatusCodes value not a status code name");
        } else throw Error("Invalid method config retry policy: retryableStatusCodes value must be a string or number");
      return {
        maxAttempts: H.maxAttempts,
        initialBackoff: H.initialBackoff,
        maxBackoff: H.maxBackoff,
        backoffMultiplier: H.backoffMultiplier,
        retryableStatusCodes: H.retryableStatusCodes,
      };
    }
    function qk1(H) {
      if (!("maxAttempts" in H) || !Number.isInteger(H.maxAttempts) || H.maxAttempts < 2)
        throw Error("Invalid method config hedging policy: maxAttempts must be an integer at least 2");
      if ("hedgingDelay" in H && (typeof H.hedgingDelay !== "string" || !Eu_.test(H.hedgingDelay)))
        throw Error(
          "Invalid method config hedging policy: hedgingDelay must be a string consisting of a positive integer followed by s",
        );
      if ("nonFatalStatusCodes" in H && Array.isArray(H.nonFatalStatusCodes))
        for (let q of H.nonFatalStatusCodes)
          if (typeof q === "number") {
            if (!Object.values(Su_.Status).includes(q))
              throw Error("Invalid method config hedging policy: nonFatalStatusCodes value not in status code range");
          } else if (typeof q === "string") {
            if (!Object.values(Su_.Status).includes(q.toUpperCase()))
              throw Error("Invalid method config hedging policy: nonFatalStatusCodes value not a status code name");
          } else
            throw Error("Invalid method config hedging policy: nonFatalStatusCodes value must be a string or number");
      let _ = { maxAttempts: H.maxAttempts };
      if (H.hedgingDelay) _.hedgingDelay = H.hedgingDelay;
      if (H.nonFatalStatusCodes) _.nonFatalStatusCodes = H.nonFatalStatusCodes;
      return _;
    }
    function $k1(H) {
      var _;
      let q = { name: [] };
      if (!("name" in H) || !Array.isArray(H.name)) throw Error("Invalid method config: invalid name array");
      for (let $ of H.name) q.name.push(Hk1($));
      if ("waitForReady" in H) {
        if (typeof H.waitForReady !== "boolean") throw Error("Invalid method config: invalid waitForReady");
        q.waitForReady = H.waitForReady;
      }
      if ("timeout" in H)
        if (typeof H.timeout === "object") {
          if (!("seconds" in H.timeout) || typeof H.timeout.seconds !== "number")
            throw Error("Invalid method config: invalid timeout.seconds");
          if (!("nanos" in H.timeout) || typeof H.timeout.nanos !== "number")
            throw Error("Invalid method config: invalid timeout.nanos");
          q.timeout = H.timeout;
        } else if (typeof H.timeout === "string" && Eu_.test(H.timeout)) {
          let $ = H.timeout.substring(0, H.timeout.length - 1).split(".");
          q.timeout = { seconds: $[0] | 0, nanos: ((_ = $[1]) !== null && _ !== void 0 ? _ : 0) | 0 };
        } else throw Error("Invalid method config: invalid timeout");
      if ("maxRequestBytes" in H) {
        if (typeof H.maxRequestBytes !== "number") throw Error("Invalid method config: invalid maxRequestBytes");
        q.maxRequestBytes = H.maxRequestBytes;
      }
      if ("maxResponseBytes" in H) {
        if (typeof H.maxResponseBytes !== "number") throw Error("Invalid method config: invalid maxRequestBytes");
        q.maxResponseBytes = H.maxResponseBytes;
      }
      if ("retryPolicy" in H)
        if ("hedgingPolicy" in H)
          throw Error("Invalid method config: retryPolicy and hedgingPolicy cannot both be specified");
        else q.retryPolicy = _k1(H.retryPolicy);
      else if ("hedgingPolicy" in H) q.hedgingPolicy = qk1(H.hedgingPolicy);
      return q;
    }
    function sB7(H) {
      if (!("maxTokens" in H) || typeof H.maxTokens !== "number" || H.maxTokens <= 0 || H.maxTokens > 1000)
        throw Error("Invalid retryThrottling: maxTokens must be a number in (0, 1000]");
      if (!("tokenRatio" in H) || typeof H.tokenRatio !== "number" || H.tokenRatio <= 0)
        throw Error("Invalid retryThrottling: tokenRatio must be a number greater than 0");
      return { maxTokens: +H.maxTokens.toFixed(3), tokenRatio: +H.tokenRatio.toFixed(3) };
    }
    function Kk1(H) {
      if (!(typeof H === "object" && H !== null))
        throw Error(`Invalid loadBalancingConfig: unexpected type ${typeof H}`);
      let _ = Object.keys(H);
      if (_.length > 1) throw Error(`Invalid loadBalancingConfig: unexpected multiple keys ${_}`);
      if (_.length === 0) throw Error("Invalid loadBalancingConfig: load balancing policy name required");
      return { [_[0]]: H[_[0]] };
    }
    function tB7(H) {
      let _ = { loadBalancingConfig: [], methodConfig: [] };
      if ("loadBalancingPolicy" in H)
        if (typeof H.loadBalancingPolicy === "string") _.loadBalancingPolicy = H.loadBalancingPolicy;
        else throw Error("Invalid service config: invalid loadBalancingPolicy");
      if ("loadBalancingConfig" in H)
        if (Array.isArray(H.loadBalancingConfig))
          for (let $ of H.loadBalancingConfig) _.loadBalancingConfig.push(Kk1($));
        else throw Error("Invalid service config: invalid loadBalancingConfig");
      if ("methodConfig" in H) {
        if (Array.isArray(H.methodConfig)) for (let $ of H.methodConfig) _.methodConfig.push($k1($));
      }
      if ("retryThrottling" in H) _.retryThrottling = sB7(H.retryThrottling);
      let q = [];
      for (let $ of _.methodConfig)
        for (let K of $.name) {
          for (let O of q)
            if (K.service === O.service && K.method === O.method)
              throw Error(`Invalid service config: duplicate name ${K.service}/${K.method}`);
          q.push(K);
        }
      return _;
    }
    function Ok1(H) {
      if (!("serviceConfig" in H)) throw Error("Invalid service config choice: missing service config");
      let _ = { serviceConfig: tB7(H.serviceConfig) };
      if ("clientLanguage" in H)
        if (Array.isArray(H.clientLanguage)) {
          _.clientLanguage = [];
          for (let $ of H.clientLanguage)
            if (typeof $ === "string") _.clientLanguage.push($);
            else throw Error("Invalid service config choice: invalid clientLanguage");
        } else throw Error("Invalid service config choice: invalid clientLanguage");
      if ("clientHostname" in H)
        if (Array.isArray(H.clientHostname)) {
          _.clientHostname = [];
          for (let $ of H.clientHostname)
            if (typeof $ === "string") _.clientHostname.push($);
            else throw Error("Invalid service config choice: invalid clientHostname");
        } else throw Error("Invalid service config choice: invalid clientHostname");
      if ("percentage" in H)
        if (typeof H.percentage === "number" && 0 <= H.percentage && H.percentage <= 100) _.percentage = H.percentage;
        else throw Error("Invalid service config choice: invalid percentage");
      let q = ["clientLanguage", "percentage", "clientHostname", "serviceConfig"];
      for (let $ in H) if (!q.includes($)) throw Error(`Invalid service config choice: unexpected field ${$}`);
      return _;
    }
    function Tk1(H, _) {
      if (!Array.isArray(H)) throw Error("Invalid service config list");
      for (let q of H) {
        let $ = Ok1(q);
        if (typeof $.percentage === "number" && _ > $.percentage) continue;
        if (Array.isArray($.clientHostname)) {
          let K = !1;
          for (let O of $.clientHostname) if (O === tL1.hostname()) K = !0;
          if (!K) continue;
        }
        if (Array.isArray($.clientLanguage)) {
          let K = !1;
          for (let O of $.clientLanguage) if (O === eL1) K = !0;
          if (!K) continue;
        }
        return $.serviceConfig;
      }
      throw Error("No matching service config found");
    }
    function zk1(H, _) {
      for (let q of H)
        if (q.length > 0 && q[0].startsWith("grpc_config=")) {
          let $ = q.join("").substring(12),
            K = JSON.parse($);
          return Tk1(K, _);
        }
      return null;
    }
  });

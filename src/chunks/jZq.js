  var jZq = d((SX) => {
    var UHH =
        (SX && SX.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      AZq =
        (SX && SX.__classPrivateFieldSet) ||
        function (H, _, q, $, K) {
          if ($ === "m") throw TypeError("Private method is not writable");
          if ($ === "a" && !K) throw TypeError("Private accessor was defined without a setter");
          if (typeof _ === "function" ? H !== _ || !K : !_.has(H))
            throw TypeError("Cannot write private member to an object whose class did not declare it");
          return $ === "a" ? K.call(H, q) : K ? (K.value = q) : _.set(H, q), q;
        },
      QHH,
      nXH,
      rXH,
      DZq;
    Object.defineProperty(SX, "__esModule", { value: !0 });
    SX.GoogleAuth = SX.GoogleAuthExceptionMessages = SX.CLOUD_SDK_CLIENT_ID = void 0;
    var mO4 = require("child_process"),
      kdH = require("fs"),
      ZdH = YdH(),
      pO4 = require("os"),
      DW6 = require("path"),
      BO4 = bXH(),
      gO4 = MdH(),
      dO4 = LX6(),
      cO4 = kX6(),
      FO4 = vX6(),
      lXH = CX6(),
      fZq = bX6(),
      iXH = IX6(),
      UO4 = fW6(),
      LdH = FHH(),
      YW6 = iB(),
      wZq = zZq(),
      YZq = dHH();
    SX.CLOUD_SDK_CLIENT_ID = "764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com";
    SX.GoogleAuthExceptionMessages = {
      API_KEY_WITH_CREDENTIALS:
        "API Keys and Credentials are mutually exclusive authentication methods and cannot be used together.",
      NO_PROJECT_ID_FOUND: `Unable to detect a Project Id in the current environment. 
To learn more about authentication and Google APIs, visit: 
https://cloud.google.com/docs/authentication/getting-started`,
      NO_CREDENTIALS_FOUND: `Unable to find credentials in current environment. 
To learn more about authentication and Google APIs, visit: 
https://cloud.google.com/docs/authentication/getting-started`,
      NO_ADC_FOUND:
        "Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.",
      NO_UNIVERSE_DOMAIN_FOUND: `Unable to detect a Universe Domain in the current environment.
To learn more about Universe Domain retrieval, visit: 
https://cloud.google.com/compute/docs/metadata/predefined-metadata-keys`,
    };
    class jW6 {
      get isGCE() {
        return this.checkIsGCE;
      }
      constructor(H = {}) {
        if (
          (QHH.add(this),
          (this.checkIsGCE = void 0),
          (this.jsonContent = null),
          (this.cachedCredential = null),
          nXH.set(this, null),
          (this.clientOptions = {}),
          (this._cachedProjectId = H.projectId || null),
          (this.cachedCredential = H.authClient || null),
          (this.keyFilename = H.keyFilename || H.keyFile),
          (this.scopes = H.scopes),
          (this.clientOptions = H.clientOptions || {}),
          (this.jsonContent = H.credentials || null),
          (this.apiKey = H.apiKey || this.clientOptions.apiKey || null),
          this.apiKey && (this.jsonContent || this.clientOptions.credentials))
        )
          throw RangeError(SX.GoogleAuthExceptionMessages.API_KEY_WITH_CREDENTIALS);
        if (H.universeDomain) this.clientOptions.universeDomain = H.universeDomain;
      }
      setGapicJWTValues(H) {
        (H.defaultServicePath = this.defaultServicePath),
          (H.useJWTAccessWithScope = this.useJWTAccessWithScope),
          (H.defaultScopes = this.defaultScopes);
      }
      getProjectId(H) {
        if (H) this.getProjectIdAsync().then((_) => H(null, _), H);
        else return this.getProjectIdAsync();
      }
      async getProjectIdOptional() {
        try {
          return await this.getProjectId();
        } catch (H) {
          if (H instanceof Error && H.message === SX.GoogleAuthExceptionMessages.NO_PROJECT_ID_FOUND) return null;
          else throw H;
        }
      }
      async findAndCacheProjectId() {
        let H = null;
        if (
          (H || (H = await this.getProductionProjectId()),
          H || (H = await this.getFileProjectId()),
          H || (H = await this.getDefaultServiceProjectId()),
          H || (H = await this.getGCEProjectId()),
          H || (H = await this.getExternalAccountClientProjectId()),
          H)
        )
          return (this._cachedProjectId = H), H;
        else throw Error(SX.GoogleAuthExceptionMessages.NO_PROJECT_ID_FOUND);
      }
      async getProjectIdAsync() {
        if (this._cachedProjectId) return this._cachedProjectId;
        if (!this._findProjectIdPromise) this._findProjectIdPromise = this.findAndCacheProjectId();
        return this._findProjectIdPromise;
      }
      async getUniverseDomainFromMetadataServer() {
        var H;
        let _;
        try {
          (_ = await ZdH.universe("universe-domain")), _ || (_ = YW6.DEFAULT_UNIVERSE);
        } catch (q) {
          if (
            q &&
            ((H = q === null || q === void 0 ? void 0 : q.response) === null || H === void 0 ? void 0 : H.status) ===
              404
          )
            _ = YW6.DEFAULT_UNIVERSE;
          else throw q;
        }
        return _;
      }
      async getUniverseDomain() {
        let H = (0, YZq.originalOrCamelOptions)(this.clientOptions).get("universe_domain");
        try {
          (H !== null && H !== void 0) || (H = (await this.getClient()).universeDomain);
        } catch (_) {
          (H !== null && H !== void 0) || (H = YW6.DEFAULT_UNIVERSE);
        }
        return H;
      }
      getAnyScopes() {
        return this.scopes || this.defaultScopes;
      }
      getApplicationDefault(H = {}, _) {
        let q;
        if (typeof H === "function") _ = H;
        else q = H;
        if (_) this.getApplicationDefaultAsync(q).then(($) => _(null, $.credential, $.projectId), _);
        else return this.getApplicationDefaultAsync(q);
      }
      async getApplicationDefaultAsync(H = {}) {
        if (this.cachedCredential) return await UHH(this, QHH, "m", rXH).call(this, this.cachedCredential, null);
        let _;
        if (((_ = await this._tryGetApplicationCredentialsFromEnvironmentVariable(H)), _)) {
          if (_ instanceof lXH.JWT) _.scopes = this.scopes;
          else if (_ instanceof LdH.BaseExternalAccountClient) _.scopes = this.getAnyScopes();
          return await UHH(this, QHH, "m", rXH).call(this, _);
        }
        if (((_ = await this._tryGetApplicationCredentialsFromWellKnownFile(H)), _)) {
          if (_ instanceof lXH.JWT) _.scopes = this.scopes;
          else if (_ instanceof LdH.BaseExternalAccountClient) _.scopes = this.getAnyScopes();
          return await UHH(this, QHH, "m", rXH).call(this, _);
        }
        if (await this._checkIsGCE())
          return (H.scopes = this.getAnyScopes()), await UHH(this, QHH, "m", rXH).call(this, new dO4.Compute(H));
        throw Error(SX.GoogleAuthExceptionMessages.NO_ADC_FOUND);
      }
      async _checkIsGCE() {
        if (this.checkIsGCE === void 0) this.checkIsGCE = ZdH.getGCPResidency() || (await ZdH.isAvailable());
        return this.checkIsGCE;
      }
      async _tryGetApplicationCredentialsFromEnvironmentVariable(H) {
        let _ = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.google_application_credentials;
        if (!_ || _.length === 0) return null;
        try {
          return this._getApplicationCredentialsFromFilePath(_, H);
        } catch (q) {
          if (q instanceof Error)
            q.message = `Unable to read the credential file specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable: ${q.message}`;
          throw q;
        }
      }
      async _tryGetApplicationCredentialsFromWellKnownFile(H) {
        let _ = null;
        if (this._isWindows()) _ = process.env.APPDATA;
        else {
          let $ = process.env.HOME;
          if ($) _ = DW6.join($, ".config");
        }
        if (_) {
          if (((_ = DW6.join(_, "gcloud", "application_default_credentials.json")), !kdH.existsSync(_))) _ = null;
        }
        if (!_) return null;
        return await this._getApplicationCredentialsFromFilePath(_, H);
      }
      async _getApplicationCredentialsFromFilePath(H, _ = {}) {
        if (!H || H.length === 0) throw Error("The file path is invalid.");
        try {
          if (((H = kdH.realpathSync(H)), !kdH.lstatSync(H).isFile())) throw Error();
        } catch ($) {
          if ($ instanceof Error) $.message = `The file at ${H} does not exist, or it is not a file. ${$.message}`;
          throw $;
        }
        let q = kdH.createReadStream(H);
        return this.fromStream(q, _);
      }
      fromImpersonatedJSON(H) {
        var _, q, $, K;
        if (!H) throw Error("Must pass in a JSON object containing an  impersonated refresh token");
        if (H.type !== iXH.IMPERSONATED_ACCOUNT_TYPE)
          throw Error(`The incoming JSON object does not have the "${iXH.IMPERSONATED_ACCOUNT_TYPE}" type`);
        if (!H.source_credentials) throw Error("The incoming JSON object does not contain a source_credentials field");
        if (!H.service_account_impersonation_url)
          throw Error("The incoming JSON object does not contain a service_account_impersonation_url field");
        let O = this.fromJSON(H.source_credentials);
        if (((_ = H.service_account_impersonation_url) === null || _ === void 0 ? void 0 : _.length) > 256)
          throw RangeError(`Target principal is too long: ${H.service_account_impersonation_url}`);
        let T =
          ($ =
            (q = /(?<target>[^/]+):(generateAccessToken|generateIdToken)$/.exec(
              H.service_account_impersonation_url,
            )) === null || q === void 0
              ? void 0
              : q.groups) === null || $ === void 0
            ? void 0
            : $.target;
        if (!T) throw RangeError(`Cannot extract target principal from ${H.service_account_impersonation_url}`);
        let z = (K = this.getAnyScopes()) !== null && K !== void 0 ? K : [];
        return new iXH.Impersonated({
          ...H,
          sourceClient: O,
          targetPrincipal: T,
          targetScopes: Array.isArray(z) ? z : [z],
        });
      }
      fromJSON(H, _ = {}) {
        let q,
          $ = (0, YZq.originalOrCamelOptions)(_).get("universe_domain");
        if (H.type === fZq.USER_REFRESH_ACCOUNT_TYPE) (q = new fZq.UserRefreshClient(_)), q.fromJSON(H);
        else if (H.type === iXH.IMPERSONATED_ACCOUNT_TYPE) q = this.fromImpersonatedJSON(H);
        else if (H.type === LdH.EXTERNAL_ACCOUNT_TYPE)
          (q = UO4.ExternalAccountClient.fromJSON(H, _)), (q.scopes = this.getAnyScopes());
        else if (H.type === wZq.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE)
          q = new wZq.ExternalAccountAuthorizedUserClient(H, _);
        else (_.scopes = this.scopes), (q = new lXH.JWT(_)), this.setGapicJWTValues(q), q.fromJSON(H);
        if ($) q.universeDomain = $;
        return q;
      }
      _cacheClientFromJSON(H, _) {
        let q = this.fromJSON(H, _);
        return (this.jsonContent = H), (this.cachedCredential = q), q;
      }
      fromStream(H, _ = {}, q) {
        let $ = {};
        if (typeof _ === "function") q = _;
        else $ = _;
        if (q) this.fromStreamAsync(H, $).then((K) => q(null, K), q);
        else return this.fromStreamAsync(H, $);
      }
      fromStreamAsync(H, _) {
        return new Promise((q, $) => {
          if (!H) throw Error("Must pass in a stream containing the Google auth settings.");
          let K = [];
          H.setEncoding("utf8")
            .on("error", $)
            .on("data", (O) => K.push(O))
            .on("end", () => {
              try {
                try {
                  let O = JSON.parse(K.join("")),
                    T = this._cacheClientFromJSON(O, _);
                  return q(T);
                } catch (O) {
                  if (!this.keyFilename) throw O;
                  let T = new lXH.JWT({ ...this.clientOptions, keyFile: this.keyFilename });
                  return (this.cachedCredential = T), this.setGapicJWTValues(T), q(T);
                }
              } catch (O) {
                return $(O);
              }
            });
        });
      }
      fromAPIKey(H, _ = {}) {
        return new lXH.JWT({ ..._, apiKey: H });
      }
      _isWindows() {
        let H = pO4.platform();
        if (H && H.length >= 3) {
          if (H.substring(0, 3).toLowerCase() === "win") return !0;
        }
        return !1;
      }
      async getDefaultServiceProjectId() {
        return new Promise((H) => {
          (0, mO4.exec)("gcloud config config-helper --format json", (_, q) => {
            if (!_ && q)
              try {
                let $ = JSON.parse(q).configuration.properties.core.project;
                H($);
                return;
              } catch ($) {}
            H(null);
          });
        });
      }
      getProductionProjectId() {
        return (
          process.env.GCLOUD_PROJECT ||
          process.env.GOOGLE_CLOUD_PROJECT ||
          process.env.gcloud_project ||
          process.env.google_cloud_project
        );
      }
      async getFileProjectId() {
        if (this.cachedCredential) return this.cachedCredential.projectId;
        if (this.keyFilename) {
          let _ = await this.getClient();
          if (_ && _.projectId) return _.projectId;
        }
        let H = await this._tryGetApplicationCredentialsFromEnvironmentVariable();
        if (H) return H.projectId;
        else return null;
      }
      async getExternalAccountClientProjectId() {
        if (!this.jsonContent || this.jsonContent.type !== LdH.EXTERNAL_ACCOUNT_TYPE) return null;
        return await (await this.getClient()).getProjectId();
      }
      async getGCEProjectId() {
        try {
          return await ZdH.project("project-id");
        } catch (H) {
          return null;
        }
      }
      getCredentials(H) {
        if (H) this.getCredentialsAsync().then((_) => H(null, _), H);
        else return this.getCredentialsAsync();
      }
      async getCredentialsAsync() {
        let H = await this.getClient();
        if (H instanceof iXH.Impersonated) return { client_email: H.getTargetPrincipal() };
        if (H instanceof LdH.BaseExternalAccountClient) {
          let _ = H.getServiceAccountEmail();
          if (_) return { client_email: _, universe_domain: H.universeDomain };
        }
        if (this.jsonContent)
          return {
            client_email: this.jsonContent.client_email,
            private_key: this.jsonContent.private_key,
            universe_domain: this.jsonContent.universe_domain,
          };
        if (await this._checkIsGCE()) {
          let [_, q] = await Promise.all([ZdH.instance("service-accounts/default/email"), this.getUniverseDomain()]);
          return { client_email: _, universe_domain: q };
        }
        throw Error(SX.GoogleAuthExceptionMessages.NO_CREDENTIALS_FOUND);
      }
      async getClient() {
        if (this.cachedCredential) return this.cachedCredential;
        AZq(this, nXH, UHH(this, nXH, "f") || UHH(this, QHH, "m", DZq).call(this), "f");
        try {
          return await UHH(this, nXH, "f");
        } finally {
          AZq(this, nXH, null, "f");
        }
      }
      async getIdTokenClient(H) {
        let _ = await this.getClient();
        if (!("fetchIdToken" in _))
          throw Error(
            "Cannot fetch ID token in this environment, use GCE or set the GOOGLE_APPLICATION_CREDENTIALS environment variable to a service account credentials JSON file.",
          );
        return new cO4.IdTokenClient({ targetAudience: H, idTokenProvider: _ });
      }
      async getAccessToken() {
        return (await (await this.getClient()).getAccessToken()).token;
      }
      async getRequestHeaders(H) {
        return (await this.getClient()).getRequestHeaders(H);
      }
      async authorizeRequest(H) {
        H = H || {};
        let _ = H.url || H.uri,
          $ = await (await this.getClient()).getRequestHeaders(_);
        return (H.headers = Object.assign(H.headers || {}, $)), H;
      }
      async request(H) {
        return (await this.getClient()).request(H);
      }
      getEnv() {
        return (0, FO4.getEnv)();
      }
      async sign(H, _) {
        let q = await this.getClient(),
          $ = await this.getUniverseDomain();
        if (((_ = _ || `https://iamcredentials.${$}/v1/projects/-/serviceAccounts/`), q instanceof iXH.Impersonated))
          return (await q.sign(H)).signedBlob;
        let K = (0, BO4.createCrypto)();
        if (q instanceof lXH.JWT && q.key) return await K.sign(q.key, H);
        let O = await this.getCredentials();
        if (!O.client_email) throw Error("Cannot sign data without `client_email`.");
        return this.signBlob(K, O.client_email, H, _);
      }
      async signBlob(H, _, q, $) {
        let K = new URL($ + `${_}:signBlob`);
        return (
          await this.request({
            method: "POST",
            url: K.href,
            data: { payload: H.encodeBase64StringUtf8(q) },
            retry: !0,
            retryConfig: { httpMethodsToRetry: ["POST"] },
          })
        ).data.signedBlob;
      }
    }
    SX.GoogleAuth = jW6;
    (nXH = new WeakMap()),
      (QHH = new WeakSet()),
      (rXH = async function (_, q = process.env.GOOGLE_CLOUD_QUOTA_PROJECT || null) {
        let $ = await this.getProjectIdOptional();
        if (q) _.quotaProjectId = q;
        return (this.cachedCredential = _), { credential: _, projectId: $ };
      }),
      (DZq = async function () {
        if (this.jsonContent) return this._cacheClientFromJSON(this.jsonContent, this.clientOptions);
        else if (this.keyFilename) {
          let _ = DW6.resolve(this.keyFilename),
            q = kdH.createReadStream(_);
          return await this.fromStreamAsync(q, this.clientOptions);
        } else if (this.apiKey) {
          let _ = await this.fromAPIKey(this.apiKey, this.clientOptions);
          _.scopes = this.scopes;
          let { credential: q } = await UHH(this, QHH, "m", rXH).call(this, _);
          return q;
        } else {
          let { credential: _ } = await this.getApplicationDefaultAsync(this.clientOptions);
          return _;
        }
      });
    jW6.DefaultTransporter = gO4.DefaultTransporter;
  });

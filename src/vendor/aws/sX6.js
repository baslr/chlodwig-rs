  var sX6 = d((FXH) => {
    var PO4 =
        (FXH && FXH.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      kJ_,
      aRq;
    Object.defineProperty(FXH, "__esModule", { value: !0 });
    FXH.AwsClient = void 0;
    var XO4 = rX6(),
      WO4 = FHH(),
      GO4 = rRq(),
      oRq = dHH();
    class RdH extends WO4.BaseExternalAccountClient {
      constructor(H, _) {
        super(H, _);
        let q = (0, oRq.originalOrCamelOptions)(H),
          $ = q.get("credential_source"),
          K = q.get("aws_security_credentials_supplier");
        if (!$ && !K) throw Error("A credential source or AWS security credentials supplier must be specified.");
        if ($ && K) throw Error("Only one of credential source or AWS security credentials supplier can be specified.");
        if (K)
          (this.awsSecurityCredentialsSupplier = K),
            (this.regionalCredVerificationUrl = PO4(kJ_, kJ_, "f", aRq)),
            (this.credentialSourceType = "programmatic");
        else {
          let O = (0, oRq.originalOrCamelOptions)($);
          this.environmentId = O.get("environment_id");
          let T = O.get("region_url"),
            z = O.get("url"),
            A = O.get("imdsv2_session_token_url");
          (this.awsSecurityCredentialsSupplier = new GO4.DefaultAwsSecurityCredentialsSupplier({
            regionUrl: T,
            securityCredentialsUrl: z,
            imdsV2SessionTokenUrl: A,
          })),
            (this.regionalCredVerificationUrl = O.get("regional_cred_verification_url")),
            (this.credentialSourceType = "aws"),
            this.validateEnvironmentId();
        }
        (this.awsRequestSigner = null), (this.region = "");
      }
      validateEnvironmentId() {
        var H;
        let _ = (H = this.environmentId) === null || H === void 0 ? void 0 : H.match(/^(aws)(\d+)$/);
        if (!_ || !this.regionalCredVerificationUrl) throw Error('No valid AWS "credential_source" provided');
        else if (parseInt(_[2], 10) !== 1) throw Error(`aws version "${_[2]}" is not supported in the current build.`);
      }
      async retrieveSubjectToken() {
        if (!this.awsRequestSigner)
          (this.region = await this.awsSecurityCredentialsSupplier.getAwsRegion(this.supplierContext)),
            (this.awsRequestSigner = new XO4.AwsRequestSigner(async () => {
              return this.awsSecurityCredentialsSupplier.getAwsSecurityCredentials(this.supplierContext);
            }, this.region));
        let H = await this.awsRequestSigner.getRequestOptions({
            ...kJ_.RETRY_CONFIG,
            url: this.regionalCredVerificationUrl.replace("{region}", this.region),
            method: "POST",
          }),
          _ = [],
          q = Object.assign({ "x-goog-cloud-target-resource": this.audience }, H.headers);
        for (let $ in q) _.push({ key: $, value: q[$] });
        return encodeURIComponent(JSON.stringify({ url: H.url, method: H.method, headers: _ }));
      }
    }
    FXH.AwsClient = RdH;
    kJ_ = RdH;
    aRq = { value: "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15" };
    RdH.AWS_EC2_METADATA_IPV4_ADDRESS = "169.254.169.254";
    RdH.AWS_EC2_METADATA_IPV6_ADDRESS = "fd00:ec2::254";
  });

  var rRq = d((cXH) => {
    var ll =
        (cXH && cXH.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      Au,
      oX6,
      lRq,
      iRq,
      LJ_,
      aX6;
    Object.defineProperty(cXH, "__esModule", { value: !0 });
    cXH.DefaultAwsSecurityCredentialsSupplier = void 0;
    class nRq {
      constructor(H) {
        Au.add(this),
          (this.regionUrl = H.regionUrl),
          (this.securityCredentialsUrl = H.securityCredentialsUrl),
          (this.imdsV2SessionTokenUrl = H.imdsV2SessionTokenUrl),
          (this.additionalGaxiosOptions = H.additionalGaxiosOptions);
      }
      async getAwsRegion(H) {
        if (ll(this, Au, "a", LJ_)) return ll(this, Au, "a", LJ_);
        let _ = {};
        if (!ll(this, Au, "a", LJ_) && this.imdsV2SessionTokenUrl)
          _["x-aws-ec2-metadata-token"] = await ll(this, Au, "m", oX6).call(this, H.transporter);
        if (!this.regionUrl)
          throw Error('Unable to determine AWS region due to missing "options.credential_source.region_url"');
        let q = {
            ...this.additionalGaxiosOptions,
            url: this.regionUrl,
            method: "GET",
            responseType: "text",
            headers: _,
          },
          $ = await H.transporter.request(q);
        return $.data.substr(0, $.data.length - 1);
      }
      async getAwsSecurityCredentials(H) {
        if (ll(this, Au, "a", aX6)) return ll(this, Au, "a", aX6);
        let _ = {};
        if (this.imdsV2SessionTokenUrl)
          _["x-aws-ec2-metadata-token"] = await ll(this, Au, "m", oX6).call(this, H.transporter);
        let q = await ll(this, Au, "m", lRq).call(this, _, H.transporter),
          $ = await ll(this, Au, "m", iRq).call(this, q, _, H.transporter);
        return { accessKeyId: $.AccessKeyId, secretAccessKey: $.SecretAccessKey, token: $.Token };
      }
    }
    cXH.DefaultAwsSecurityCredentialsSupplier = nRq;
    (Au = new WeakSet()),
      (oX6 = async function (_) {
        let q = {
          ...this.additionalGaxiosOptions,
          url: this.imdsV2SessionTokenUrl,
          method: "PUT",
          responseType: "text",
          headers: { "x-aws-ec2-metadata-token-ttl-seconds": "300" },
        };
        return (await _.request(q)).data;
      }),
      (lRq = async function (_, q) {
        if (!this.securityCredentialsUrl)
          throw Error('Unable to determine AWS role name due to missing "options.credential_source.url"');
        let $ = {
          ...this.additionalGaxiosOptions,
          url: this.securityCredentialsUrl,
          method: "GET",
          responseType: "text",
          headers: _,
        };
        return (await q.request($)).data;
      }),
      (iRq = async function (_, q, $) {
        return (
          await $.request({
            ...this.additionalGaxiosOptions,
            url: `${this.securityCredentialsUrl}/${_}`,
            responseType: "json",
            headers: q,
          })
        ).data;
      }),
      (LJ_ = function () {
        return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || null;
      }),
      (aX6 = function () {
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
          return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            token: process.env.AWS_SESSION_TOKEN,
          };
        return null;
      });
  });

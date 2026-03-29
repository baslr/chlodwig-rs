    R5H();
    G5H();
    vf();
    fWq(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    i44 = `http://169.254.169.254${wWq}`;
    UgH = class UgH extends Wk {
      constructor(H, _, q, $, K, O) {
        super(H, _, q, $, K);
        this.identityEndpoint = O;
      }
      static tryCreate(H, _, q, $, K) {
        let O;
        if (process.env[e$.AZURE_POD_IDENTITY_AUTHORITY_HOST])
          H.info(
            `[Managed Identity] Environment variable ${e$.AZURE_POD_IDENTITY_AUTHORITY_HOST} for ${R4.IMDS} returned endpoint: ${process.env[e$.AZURE_POD_IDENTITY_AUTHORITY_HOST]}`,
          ),
            (O = UgH.getValidatedEnvVariableUrlString(
              e$.AZURE_POD_IDENTITY_AUTHORITY_HOST,
              `${process.env[e$.AZURE_POD_IDENTITY_AUTHORITY_HOST]}${wWq}`,
              R4.IMDS,
              H,
            ));
        else
          H.info(
            `[Managed Identity] Unable to find ${e$.AZURE_POD_IDENTITY_AUTHORITY_HOST} environment variable for ${R4.IMDS}, using the default endpoint.`,
          ),
            (O = i44);
        return new UgH(H, _, q, $, K, O);
      }
      createRequest(H, _) {
        let q = new xh(kf.GET, this.identityEndpoint);
        if (
          ((q.headers[Jk.METADATA_HEADER_NAME] = "true"),
          (q.queryParameters[Xj.API_VERSION] = n44),
          (q.queryParameters[Xj.RESOURCE] = H),
          _.idType !== WY.SYSTEM_ASSIGNED)
        )
          q.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(_.idType, !0)] = _.id;
        return (q.retryPolicy = new k5H()), q;
      }
    };

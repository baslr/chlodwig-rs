    G5H();
    vf();
    R5H(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    Z5H = class Z5H extends Wk {
      constructor(H, _, q, $, K, O, T) {
        super(H, _, q, $, K);
        (this.identityEndpoint = O), (this.identityHeader = T);
      }
      static getEnvironmentVariables() {
        let H = process.env[e$.IDENTITY_ENDPOINT],
          _ = process.env[e$.IDENTITY_HEADER];
        return [H, _];
      }
      static tryCreate(H, _, q, $, K) {
        let [O, T] = Z5H.getEnvironmentVariables();
        if (!O || !T)
          return (
            H.info(
              `[Managed Identity] ${R4.APP_SERVICE} managed identity is unavailable because one or both of the '${e$.IDENTITY_HEADER}' and '${e$.IDENTITY_ENDPOINT}' environment variables are not defined.`,
            ),
            null
          );
        let z = Z5H.getValidatedEnvVariableUrlString(e$.IDENTITY_ENDPOINT, O, R4.APP_SERVICE, H);
        return (
          H.info(
            `[Managed Identity] Environment variables validation passed for ${R4.APP_SERVICE} managed identity. Endpoint URI: ${z}. Creating ${R4.APP_SERVICE} managed identity.`,
          ),
          new Z5H(H, _, q, $, K, O, T)
        );
      }
      createRequest(H, _) {
        let q = new xh(kf.GET, this.identityEndpoint);
        if (
          ((q.headers[Jk.APP_SERVICE_SECRET_HEADER_NAME] = this.identityHeader),
          (q.queryParameters[Xj.API_VERSION] = m44),
          (q.queryParameters[Xj.RESOURCE] = H),
          _.idType !== WY.SYSTEM_ASSIGNED)
        )
          q.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(_.idType)] = _.id;
        return q;
      }
    };

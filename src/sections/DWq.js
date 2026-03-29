    R5H();
    G5H();
    vf(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    v5H = class v5H extends Wk {
      constructor(H, _, q, $, K, O, T) {
        super(H, _, q, $, K);
        (this.identityEndpoint = O), (this.identityHeader = T);
      }
      static getEnvironmentVariables() {
        let H = process.env[e$.IDENTITY_ENDPOINT],
          _ = process.env[e$.IDENTITY_HEADER],
          q = process.env[e$.IDENTITY_SERVER_THUMBPRINT];
        return [H, _, q];
      }
      static tryCreate(H, _, q, $, K, O) {
        let [T, z, A] = v5H.getEnvironmentVariables();
        if (!T || !z || !A)
          return (
            H.info(
              `[Managed Identity] ${R4.SERVICE_FABRIC} managed identity is unavailable because one or all of the '${e$.IDENTITY_HEADER}', '${e$.IDENTITY_ENDPOINT}' or '${e$.IDENTITY_SERVER_THUMBPRINT}' environment variables are not defined.`,
            ),
            null
          );
        let f = v5H.getValidatedEnvVariableUrlString(e$.IDENTITY_ENDPOINT, T, R4.SERVICE_FABRIC, H);
        if (
          (H.info(
            `[Managed Identity] Environment variables validation passed for ${R4.SERVICE_FABRIC} managed identity. Endpoint URI: ${f}. Creating ${R4.SERVICE_FABRIC} managed identity.`,
          ),
          O.idType !== WY.SYSTEM_ASSIGNED)
        )
          H.warning(
            `[Managed Identity] ${R4.SERVICE_FABRIC} user assigned managed identity is configured in the cluster, not during runtime. See also: https://learn.microsoft.com/en-us/azure/service-fabric/configure-existing-cluster-enable-managed-identity-token-service.`,
          );
        return new v5H(H, _, q, $, K, T, z);
      }
      createRequest(H, _) {
        let q = new xh(kf.GET, this.identityEndpoint);
        if (
          ((q.headers[Jk.ML_AND_SF_SECRET_HEADER_NAME] = this.identityHeader),
          (q.queryParameters[Xj.API_VERSION] = r44),
          (q.queryParameters[Xj.RESOURCE] = H),
          _.idType !== WY.SYSTEM_ASSIGNED)
        )
          q.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(_.idType)] = _.id;
        return q;
      }
    };

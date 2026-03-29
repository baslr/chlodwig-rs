    G5H();
    vf();
    R5H(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    a44 = `Only client id is supported for user-assigned managed identity in ${R4.MACHINE_LEARNING}.`;
    N5H = class N5H extends Wk {
      constructor(H, _, q, $, K, O, T) {
        super(H, _, q, $, K);
        (this.msiEndpoint = O), (this.secret = T);
      }
      static getEnvironmentVariables() {
        let H = process.env[e$.MSI_ENDPOINT],
          _ = process.env[e$.MSI_SECRET];
        return [H, _];
      }
      static tryCreate(H, _, q, $, K) {
        let [O, T] = N5H.getEnvironmentVariables();
        if (!O || !T)
          return (
            H.info(
              `[Managed Identity] ${R4.MACHINE_LEARNING} managed identity is unavailable because one or both of the '${e$.MSI_ENDPOINT}' and '${e$.MSI_SECRET}' environment variables are not defined.`,
            ),
            null
          );
        let z = N5H.getValidatedEnvVariableUrlString(e$.MSI_ENDPOINT, O, R4.MACHINE_LEARNING, H);
        return (
          H.info(
            `[Managed Identity] Environment variables validation passed for ${R4.MACHINE_LEARNING} managed identity. Endpoint URI: ${z}. Creating ${R4.MACHINE_LEARNING} managed identity.`,
          ),
          new N5H(H, _, q, $, K, O, T)
        );
      }
      createRequest(H, _) {
        let q = new xh(kf.GET, this.msiEndpoint);
        if (
          ((q.headers[Jk.METADATA_HEADER_NAME] = "true"),
          (q.headers[Jk.ML_AND_SF_SECRET_HEADER_NAME] = this.secret),
          (q.queryParameters[Xj.API_VERSION] = o44),
          (q.queryParameters[Xj.RESOURCE] = H),
          _.idType === WY.SYSTEM_ASSIGNED)
        )
          q.queryParameters[W5H.MANAGED_IDENTITY_CLIENT_ID_2017] = process.env[e$.DEFAULT_IDENTITY_CLIENT_ID];
        else if (_.idType === WY.USER_ASSIGNED_CLIENT_ID)
          q.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(_.idType, !1, !0)] = _.id;
        else throw Error(a44);
        return q;
      }
    };

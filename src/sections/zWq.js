    R5H();
    G5H();
    vf();
    PXH();
    w5H(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    L5H = class L5H extends Wk {
      constructor(H, _, q, $, K, O) {
        super(H, _, q, $, K);
        this.msiEndpoint = O;
      }
      static getEnvironmentVariables() {
        return [process.env[e$.MSI_ENDPOINT]];
      }
      static tryCreate(H, _, q, $, K, O) {
        let [T] = L5H.getEnvironmentVariables();
        if (!T)
          return (
            H.info(
              `[Managed Identity] ${R4.CLOUD_SHELL} managed identity is unavailable because the '${e$.MSI_ENDPOINT} environment variable is not defined.`,
            ),
            null
          );
        let z = L5H.getValidatedEnvVariableUrlString(e$.MSI_ENDPOINT, T, R4.CLOUD_SHELL, H);
        if (
          (H.info(
            `[Managed Identity] Environment variable validation passed for ${R4.CLOUD_SHELL} managed identity. Endpoint URI: ${z}. Creating ${R4.CLOUD_SHELL} managed identity.`,
          ),
          O.idType !== WY.SYSTEM_ASSIGNED)
        )
          throw M2(Gj_);
        return new L5H(H, _, q, $, K, T);
      }
      createRequest(H) {
        let _ = new xh(kf.POST, this.msiEndpoint);
        return (_.headers[Jk.METADATA_HEADER_NAME] = "true"), (_.bodyParameters[Xj.RESOURCE] = H), _;
      }
    };

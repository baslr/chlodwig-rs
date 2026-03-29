    wT();
    vf();
    PXH();
    sXq();
    tXq();
    w5H(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    W5H = {
      MANAGED_IDENTITY_CLIENT_ID_2017: "clientid",
      MANAGED_IDENTITY_CLIENT_ID: "client_id",
      MANAGED_IDENTITY_OBJECT_ID: "object_id",
      MANAGED_IDENTITY_RESOURCE_ID_IMDS: "msi_res_id",
      MANAGED_IDENTITY_RESOURCE_ID_NON_IMDS: "mi_res_id",
    };
    Wk.getValidatedEnvVariableUrlString = (H, _, q, $) => {
      try {
        return new R1(_).urlString;
      } catch (K) {
        throw (
          ($.info(
            `[Managed Identity] ${q} managed identity is unavailable because the '${H}' environment variable is malformed.`,
          ),
          M2(f5H[H]))
        );
      }
    };

    wT();
    w5H();
    vf(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    H_4 = {
      [Mj_]: "The file path in the WWW-Authenticate header does not contain a .key file.",
      [Jj_]: "The file path in the WWW-Authenticate header is not in a valid Windows or Linux Format.",
      [SHH]: "More than one ManagedIdentityIdType was provided.",
      [Pj_]: "The secret in the file on the file path in the WWW-Authenticate header is greater than 4096 bytes.",
      [Xj_]: "The platform is not supported by Azure Arc. Azure Arc only supports Windows and Linux.",
      [Vjq]: "A ManagedIdentityId id was not provided.",
      [f5H.AZURE_POD_IDENTITY_AUTHORITY_HOST]: `The Managed Identity's '${e$.AZURE_POD_IDENTITY_AUTHORITY_HOST}' environment variable is malformed.`,
      [f5H.IDENTITY_ENDPOINT]: `The Managed Identity's '${e$.IDENTITY_ENDPOINT}' environment variable is malformed.`,
      [f5H.IMDS_ENDPOINT]: `The Managed Identity's '${e$.IMDS_ENDPOINT}' environment variable is malformed.`,
      [f5H.MSI_ENDPOINT]: `The Managed Identity's '${e$.MSI_ENDPOINT}' environment variable is malformed.`,
      [Sjq]: "Authentication unavailable. The request to the managed identity endpoint timed out.",
      [Wj_]: "Azure Arc Managed Identities can only be system assigned.",
      [Gj_]: "Cloud Shell Managed Identities can only be system assigned.",
      [Rj_]: "Unable to create a Managed Identity source based on environment variables.",
      [XgH]: "Unable to read the secret file.",
      [Ejq]: "Service Fabric user assigned managed identity ClientId or ResourceId is not configurable at runtime.",
      [Zj_]:
        "A 401 response was received form the Azure Arc Managed Identity, but the www-authenticate header is missing.",
      [Lj_]:
        "A 401 response was received form the Azure Arc Managed Identity, but the www-authenticate header is in an unsupported format.",
    };
    pM6 = class pM6 extends l4 {
      constructor(H) {
        super(H, H_4[H]);
        (this.name = "ManagedIdentityError"), Object.setPrototypeOf(this, pM6.prototype);
      }
    };

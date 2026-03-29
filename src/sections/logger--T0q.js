    SM_();
    Kz();
    (R14 = z1(O0q)),
      (GP6 = {
        name: "tokenExchangeMsi",
        async isAvailable(H) {
          let _ = process.env,
            q = Boolean((H || _.AZURE_CLIENT_ID) && _.AZURE_TENANT_ID && process.env.AZURE_FEDERATED_TOKEN_FILE);
          if (!q)
            R14.info(
              `${O0q}: Unavailable. The environment variables needed are: AZURE_CLIENT_ID (or the client ID sent through the parameters), AZURE_TENANT_ID and AZURE_FEDERATED_TOKEN_FILE`,
            );
          return q;
        },
        async getToken(H, _ = {}) {
          let { scopes: q, clientId: $ } = H,
            K = {};
          return new Bl(
            Object.assign(
              Object.assign(
                {
                  clientId: $,
                  tenantId: process.env.AZURE_TENANT_ID,
                  tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE,
                },
                K,
              ),
              { disableInstanceDiscovery: !0 },
            ),
          ).getToken(q, _);
        },
      });

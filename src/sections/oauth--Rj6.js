    LHH();
    gA(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    (x2q = {
      endpointMetadata: {
        "login.microsoftonline.com": {
          token_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/token",
          jwks_uri: "https://login.microsoftonline.com/{tenantid}/discovery/v2.0/keys",
          issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
          authorization_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/authorize",
          end_session_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/logout",
        },
        "login.chinacloudapi.cn": {
          token_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/token",
          jwks_uri: "https://login.chinacloudapi.cn/{tenantid}/discovery/v2.0/keys",
          issuer: "https://login.partner.microsoftonline.cn/{tenantid}/v2.0",
          authorization_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/authorize",
          end_session_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/logout",
        },
        "login.microsoftonline.us": {
          token_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/token",
          jwks_uri: "https://login.microsoftonline.us/{tenantid}/discovery/v2.0/keys",
          issuer: "https://login.microsoftonline.us/{tenantid}/v2.0",
          authorization_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/authorize",
          end_session_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/logout",
        },
      },
      instanceDiscoveryMetadata: {
        metadata: [
          {
            preferred_network: "login.microsoftonline.com",
            preferred_cache: "login.windows.net",
            aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"],
          },
          {
            preferred_network: "login.partner.microsoftonline.cn",
            preferred_cache: "login.partner.microsoftonline.cn",
            aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"],
          },
          {
            preferred_network: "login.microsoftonline.de",
            preferred_cache: "login.microsoftonline.de",
            aliases: ["login.microsoftonline.de"],
          },
          {
            preferred_network: "login.microsoftonline.us",
            preferred_cache: "login.microsoftonline.us",
            aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"],
          },
          {
            preferred_network: "login-us.microsoftonline.com",
            preferred_cache: "login-us.microsoftonline.com",
            aliases: ["login-us.microsoftonline.com"],
          },
        ],
      },
    }),
      (Xj6 = x2q.endpointMetadata),
      (Wj6 = x2q.instanceDiscoveryMetadata),
      (Gj6 = new Set());
    Wj6.metadata.forEach((H) => {
      H.aliases.forEach((_) => {
        Gj6.add(_);
      });
    });

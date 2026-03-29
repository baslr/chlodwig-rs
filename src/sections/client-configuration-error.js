    pS();
    vl(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    (Ww = {
      [UKH]: "A redirect URI is required for all calls, and none has been set.",
      [EBH]: "Could not parse the given claims request object.",
      [QKH]:
        "Authority URIs must use https.  Please see here for valid authority configuration options: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options",
      [xB]: "URL could not be parsed into appropriate segments.",
      [lKH]: "URL was empty or null.",
      [iKH]:
        "Scopes cannot be passed as null, undefined or empty array because they are required to obtain an access token.",
      [WHH]: "Given claims parameter must be a stringified JSON object.",
      [nKH]: "Token request was empty and not found in cache.",
      [rKH]: "The logout request was null or undefined.",
      [CBH]: 'code_challenge_method passed is invalid. Valid values are "plain" and "S256".',
      [oKH]: "Both params: code_challenge and code_challenge_method are to be passed if to be sent in the request",
      [GHH]:
        "Invalid cloudDiscoveryMetadata provided. Must be a stringified JSON object containing tenant_discovery_endpoint and metadata fields",
      [aKH]:
        "Invalid authorityMetadata provided. Must by a stringified JSON object containing authorization_endpoint, token_endpoint, issuer fields.",
      [sKH]:
        "The provided authority is not a trusted authority. Please include this authority in the knownAuthorities config parameter.",
      [kl]: "Missing sshJwk in SSH certificate request. A stringified JSON Web Key is required when using the SSH authentication scheme.",
      [bBH]:
        "Missing sshKid in SSH certificate request. A string that uniquely identifies the public SSH key is required when using the SSH authentication scheme.",
      [IBH]:
        "Unable to find an authentication header containing server nonce. Either the Authentication-Info or WWW-Authenticate headers must be present in order to obtain a server nonce.",
      [uBH]: "Invalid authentication header provided",
      [xBH]:
        "Cannot set OIDCOptions parameter. Please change the protocol mode to OIDC or use a non-Microsoft authority.",
      [mBH]: "Cannot set allowPlatformBroker parameter to true when not in AAD protocol mode.",
      [pBH]:
        "Authority mismatch error. Authority provided in login request or PublicClientApplication config does not match the environment of the provided account. Please use a matching account or make an interactive request to login to this authority.",
      [gBH]:
        "Invalid authorize post body parameters provided. If you are using authorizePostBodyParameters, the request method must be POST. Please check the request method and parameters.",
      [BBH]:
        "Invalid request method for EAR protocol mode. The request method cannot be GET when using EAR protocol mode. Please change the request method to POST.",
    }),
      (Dj6 = {
        redirectUriNotSet: { code: UKH, desc: Ww[UKH] },
        claimsRequestParsingError: { code: EBH, desc: Ww[EBH] },
        authorityUriInsecure: { code: QKH, desc: Ww[QKH] },
        urlParseError: { code: xB, desc: Ww[xB] },
        urlEmptyError: { code: lKH, desc: Ww[lKH] },
        emptyScopesError: { code: iKH, desc: Ww[iKH] },
        invalidClaimsRequest: { code: WHH, desc: Ww[WHH] },
        tokenRequestEmptyError: { code: nKH, desc: Ww[nKH] },
        logoutRequestEmptyError: { code: rKH, desc: Ww[rKH] },
        invalidCodeChallengeMethod: { code: CBH, desc: Ww[CBH] },
        invalidCodeChallengeParams: { code: oKH, desc: Ww[oKH] },
        invalidCloudDiscoveryMetadata: { code: GHH, desc: Ww[GHH] },
        invalidAuthorityMetadata: { code: aKH, desc: Ww[aKH] },
        untrustedAuthority: { code: sKH, desc: Ww[sKH] },
        missingSshJwk: { code: kl, desc: Ww[kl] },
        missingSshKid: { code: bBH, desc: Ww[bBH] },
        missingNonceAuthenticationHeader: { code: IBH, desc: Ww[IBH] },
        invalidAuthenticationHeader: { code: uBH, desc: Ww[uBH] },
        cannotSetOIDCOptions: { code: xBH, desc: Ww[xBH] },
        cannotAllowPlatformBroker: { code: mBH, desc: Ww[mBH] },
        authorityMismatch: { code: pBH, desc: Ww[pBH] },
        invalidAuthorizePostBodyParameters: { code: gBH, desc: Ww[gBH] },
        invalidRequestMethodForEAR: { code: BBH, desc: Ww[BBH] },
      });
    qXH = class qXH extends l4 {
      constructor(H) {
        super(H, Ww[H]);
        (this.name = "ClientConfigurationError"), Object.setPrototypeOf(this, qXH.prototype);
      }
    };

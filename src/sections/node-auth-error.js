    wT(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    Wj = {
      invalidLoopbackAddressType: {
        code: "invalid_loopback_server_address_type",
        desc: "Loopback server address is not type string. This is unexpected.",
      },
      unableToLoadRedirectUri: {
        code: "unable_to_load_redirectUrl",
        desc: "Loopback server callback was invoked without a url. This is unexpected.",
      },
      noAuthCodeInResponse: {
        code: "no_auth_code_in_response",
        desc: "No auth code found in the server response. Please check your network trace to determine what happened.",
      },
      noLoopbackServerExists: { code: "no_loopback_server_exists", desc: "No loopback server exists yet." },
      loopbackServerAlreadyExists: {
        code: "loopback_server_already_exists",
        desc: "Loopback server already exists. Cannot create another.",
      },
      loopbackServerTimeout: {
        code: "loopback_server_timeout",
        desc: "Timed out waiting for auth code listener to be registered.",
      },
      stateNotFoundError: {
        code: "state_not_found",
        desc: "State not found. Please verify that the request originated from msal.",
      },
      thumbprintMissing: {
        code: "thumbprint_missing_from_client_certificate",
        desc: "Client certificate does not contain a SHA-1 or SHA-256 thumbprint.",
      },
      redirectUriNotSupported: {
        code: "redirect_uri_not_supported",
        desc: "RedirectUri is not supported in this scenario. Please remove redirectUri from the request.",
      },
    };
    Gw = class Gw extends l4 {
      constructor(H, _) {
        super(H, _);
        this.name = "NodeAuthError";
      }
      static createInvalidLoopbackAddressTypeError() {
        return new Gw(Wj.invalidLoopbackAddressType.code, `${Wj.invalidLoopbackAddressType.desc}`);
      }
      static createUnableToLoadRedirectUrlError() {
        return new Gw(Wj.unableToLoadRedirectUri.code, `${Wj.unableToLoadRedirectUri.desc}`);
      }
      static createNoAuthCodeInResponseError() {
        return new Gw(Wj.noAuthCodeInResponse.code, `${Wj.noAuthCodeInResponse.desc}`);
      }
      static createNoLoopbackServerExistsError() {
        return new Gw(Wj.noLoopbackServerExists.code, `${Wj.noLoopbackServerExists.desc}`);
      }
      static createLoopbackServerAlreadyExistsError() {
        return new Gw(Wj.loopbackServerAlreadyExists.code, `${Wj.loopbackServerAlreadyExists.desc}`);
      }
      static createLoopbackServerTimeoutError() {
        return new Gw(Wj.loopbackServerTimeout.code, `${Wj.loopbackServerTimeout.desc}`);
      }
      static createStateNotFoundError() {
        return new Gw(Wj.stateNotFoundError.code, Wj.stateNotFoundError.desc);
      }
      static createThumbprintMissingError() {
        return new Gw(Wj.thumbprintMissing.code, Wj.thumbprintMissing.desc);
      }
      static createRedirectUriNotSupportedError() {
        return new Gw(Wj.redirectUriNotSupported.code, Wj.redirectUriNotSupported.desc);
      }
    };

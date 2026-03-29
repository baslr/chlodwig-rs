    h7 = class h7 extends Error {
      constructor(H, _) {
        super(H, _);
        this.name = K26;
      }
    };
    cI = class cI extends Error {
      constructor(H, _, q) {
        let $ = {
          error: "unknown",
          errorDescription: "An unknown error occurred and no additional details are available.",
        };
        if (Es$(_)) $ = Lwq(_);
        else if (typeof _ === "string")
          try {
            let K = JSON.parse(_);
            $ = Lwq(K);
          } catch (K) {
            if (H === 400)
              $ = {
                error: "invalid_request",
                errorDescription: `The service indicated that the request was invalid.

${_}`,
              };
            else
              $ = {
                error: "unknown_error",
                errorDescription: `An unknown error has occurred. Response body:

${_}`,
              };
          }
        else
          $ = {
            error: "unknown_error",
            errorDescription: "An unknown error occurred and no additional details are available.",
          };
        super(
          `${$.error} Status code: ${H}
More details:
${$.errorDescription},`,
          q,
        );
        (this.statusCode = H), (this.errorResponse = $), (this.name = UpH);
      }
    };
    QpH = class QpH extends Error {
      constructor(H, _) {
        let q = H.join(`
`);
        super(`${_}
${q}`);
        (this.errors = H), (this.name = O26);
      }
    };
    FI = class FI extends Error {
      constructor(H) {
        super(H.message, H.cause ? { cause: H.cause } : void 0);
        (this.scopes = H.scopes),
          (this.getTokenOptions = H.getTokenOptions),
          (this.name = "AuthenticationRequiredError");
      }
    };

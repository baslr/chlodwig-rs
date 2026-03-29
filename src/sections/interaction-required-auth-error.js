    gA();
    pS();
    Hj_(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    (_jq = [yM6, VM6, SM6, hHH, t2_]),
      (yH4 = [
        "message_only",
        "additional_action",
        "basic_action",
        "user_password_expired",
        "consent_required",
        "bad_token",
      ]),
      (_j_ = {
        [NHH]: "No refresh token found in the cache. Please sign-in.",
        [wgH]:
          "The requested account is not available in the native broker. It may have been deleted or logged out. Please sign-in again using an interactive API.",
        [YgH]: "Refresh token has expired.",
        [hHH]:
          "Identity provider returned bad_token due to an expired or invalid refresh token. Please invoke an interactive API to resolve.",
        [t2_]:
          "`canShowUI` flag in Edge was set to false. User interaction required on web page. Please invoke an interactive API to resolve.",
      }),
      (EM6 = {
        noTokensFoundError: { code: NHH, desc: _j_[NHH] },
        native_account_unavailable: { code: wgH, desc: _j_[wgH] },
        bad_token: { code: hHH, desc: _j_[hHH] },
      });
    uh = class uh extends l4 {
      constructor(H, _, q, $, K, O, T, z) {
        super(H, _, q);
        Object.setPrototypeOf(this, uh.prototype),
          (this.timestamp = $ || d6.EMPTY_STRING),
          (this.traceId = K || d6.EMPTY_STRING),
          (this.correlationId = O || d6.EMPTY_STRING),
          (this.claims = T || d6.EMPTY_STRING),
          (this.name = "InteractionRequiredAuthError"),
          (this.errorNo = z);
      }
    };

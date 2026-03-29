    ZzH();
    x8();
    N_();
    F_();
    uS_ = bk7();
    Tr = class Tr extends Error {
      shouldClearIdToken;
      constructor(H, _) {
        super(H);
        (this.name = "XaaTokenExchangeError"), (this.shouldClearIdToken = _);
      }
    };
    nf1 = /"(access_token|refresh_token|id_token|assertion|subject_token|client_secret)"\s*:\s*"[^"]*"/g;
    (rf1 = pH(() =>
      h.object({
        access_token: h.string().optional(),
        issued_token_type: h.string().optional(),
        expires_in: h.coerce.number().optional(),
        scope: h.string().optional(),
      }),
    )),
      (of1 = pH(() =>
        h.object({
          access_token: h.string().min(1),
          token_type: h.string().default("Bearer"),
          expires_in: h.coerce.number().optional(),
          scope: h.string().optional(),
          refresh_token: h.string().optional(),
        }),
      ));

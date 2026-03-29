    rU();
    G4H();
    Qt_();
    W0();
    xp();
    $e_();
    ibH();
    N$_();
    ve_();
    xe_();
    ke_();
    ue_();
    Qt_();
    Kh();
    k$_();
    G4H();
    (pe_ = AO),
      (o$_ = new WeakMap()),
      (me_ = new WeakSet()),
      (sf8 = function () {
        return this.baseURL !== "https://api.anthropic.com";
      });
    AO.Anthropic = pe_;
    AO.HUMAN_PROMPT = tf8;
    AO.AI_PROMPT = ef8;
    AO.DEFAULT_TIMEOUT = 600000;
    AO.AnthropicError = q7;
    AO.APIError = rq;
    AO.APIConnectionError = TX;
    AO.APIConnectionTimeoutError = up;
    AO.APIUserAbortError = FK;
    AO.NotFoundError = W4H;
    AO.ConflictError = wbH;
    AO.RateLimitError = DbH;
    AO.BadRequestError = AbH;
    AO.AuthenticationError = X4H;
    AO.InternalServerError = jbH;
    AO.PermissionDeniedError = fbH;
    AO.UnprocessableEntityError = YbH;
    AO.toFile = V$_;
    OI = class OI extends AO {
      constructor() {
        super(...arguments);
        (this.completions = new as(this)),
          (this.messages = new Th(this)),
          (this.models = new g2H(this)),
          (this.beta = new G0(this));
      }
    };
    OI.Completions = as;
    OI.Messages = Th;
    OI.Models = g2H;
    OI.Beta = G0;

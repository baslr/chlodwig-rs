    Z9();
    jjH();
    L_();
    pf();
    h_();
    Rj();
    N_();
    eV_();
    Q6();
    ma6();
    zt6 = class zt6 extends Error {
      constructor(H) {
        super(`Claude Code is unable to fetch from ${H}`);
        this.name = "DomainBlockedError";
      }
    };
    At6 = class At6 extends Error {
      constructor(H) {
        super(
          `Unable to verify if domain ${H} is safe to fetch. This may be due to network restrictions or enterprise security policies blocking claude.ai.`,
        );
        this.name = "DomainCheckFailedError";
      }
    };
    O79 = class O79 extends Error {
      domain;
      constructor(H) {
        super(
          JSON.stringify({
            error_type: "EGRESS_BLOCKED",
            domain: H,
            message: `Access to ${H} is blocked by the network egress proxy.`,
          }),
        );
        this.domain = H;
        this.name = "EgressBlockedError";
      }
    };
    (ft6 = new UL({ maxSize: yU1, ttl: hU1 })), (wt6 = new UL({ max: 128, ttl: 300000 }));

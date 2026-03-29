    x8();
    k_();
    t6();
    L_();
    pf();
    sE();
    Rn();
    H_();
    g_();
    h_();
    q8();
    aC7();
    H7();
    Q6();
    mqH();
    F_();
    tX();
    q5();
    (AAH = require("fs/promises")), (fAH = require("path"));
    (zb7 = Tb7(eC7())), (wF6 = Tb7(Hb7()));
    (SP1 = pH(() => h.object({ thinking: h.string(), shouldBlock: h.boolean(), reason: h.string() }))),
      (EP1 = {
        type: "custom",
        name: qaH,
        description: "Report the security classification result for the agent action",
        input_schema: {
          type: "object",
          properties: {
            thinking: { type: "string", description: "Brief step-by-step reasoning." },
            shouldBlock: {
              type: "boolean",
              description: "Whether the action should be blocked (true) or allowed (false)",
            },
            reason: { type: "string", description: "Brief explanation of the classification decision" },
          },
          required: ["thinking", "shouldBlock", "reason"],
        },
      });

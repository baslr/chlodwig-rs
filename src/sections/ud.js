    ER();
    Tt();
    k_();
    W8();
    JZ();
    y6();
    N_();
    H7();
    L_();
    pf();
    aXH();
    viH();
    vx6();
    (M11 = [
      {
        rateLimitType: "five_hour",
        claimAbbrev: "5h",
        windowSeconds: 18000,
        thresholds: [{ utilization: 0.9, timePct: 0.72 }],
      },
      {
        rateLimitType: "seven_day",
        claimAbbrev: "7d",
        windowSeconds: 604800,
        thresholds: [
          { utilization: 0.75, timePct: 0.6 },
          { utilization: 0.5, timePct: 0.35 },
          { utilization: 0.25, timePct: 0.15 },
        ],
      },
    ]),
      (J11 = { "5h": "five_hour", "7d": "seven_day", overage: "overage" });
    (Av = { status: "allowed", unifiedRateLimitFallbackAvailable: !1, isUsingOverage: !1 }), (Wh_ = {});
    R8H = new Set();

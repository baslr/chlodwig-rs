    G4();
    u7();
    AIH();
    k_();
    cu();
    YE();
    o3H();
    qy();
    M0H();
    $i();
    L_();
    s1();
    H_();
    SO();
    g_();
    e7();
    JI();
    CC = require("fs");
    ob7 = $6(() => {
      if (
        (zt(() => {}),
        process.on("SIGINT", () => {
          if (process.argv.includes("-p") || process.argv.includes("--print")) return;
          n_("info", "shutdown_signal", { signal: "SIGINT" }), k9(0);
        }),
        process.on("SIGTERM", () => {
          n_("info", "shutdown_signal", { signal: "SIGTERM" }), k9(143);
        }),
        process.on("SIGHUP", () => {
          n_("info", "shutdown_signal", { signal: "SIGHUP" }), k9(129);
        }),
        process.stdin.isTTY)
      )
        (LF6 = setInterval(() => {
          if (!process.stdout.writable || !process.stdin.readable)
            clearInterval(LF6), n_("info", "shutdown_signal", { signal: "orphan_detected" }), k9(129);
        }, 30000)),
          LF6.unref();
      process.on("uncaughtException", (H) => {
        n_("error", "uncaught_exception", { error_name: H.name, error_message: H.message.slice(0, 2000) }),
          Q("tengu_uncaught_exception", { error_name: H.name });
      }),
        process.on("unhandledRejection", (H) => {
          let _ = H instanceof Error ? H.name : typeof H === "string" ? "string" : "unknown",
            q =
              H instanceof Error
                ? { error_name: H.name, error_message: H.message.slice(0, 2000), error_stack: H.stack?.slice(0, 4000) }
                : { error_message: String(H).slice(0, 2000) };
          n_("error", "unhandled_rejection", q), Q("tengu_unhandled_rejection", { error_name: _ });
        });
    });
    ab7 = class ab7 extends Error {
      constructor() {
        super("Cleanup timeout");
      }
    };

    A3();
    vy();
    loH();
    XH9();
    H_();
    N_();
    Iw();
    q8();
    TC();
    F_();
    xw();
    wP();
    bm();
    qyH = {
      name: "RemoteAgentTask",
      type: "remote_agent",
      async kill(H, _) {
        let q,
          $,
          K,
          O = !1;
        if (
          (Z4(H, _, (T) => {
            if (T.status !== "running") return T;
            return (
              (q = T.toolUseId),
              ($ = T.description),
              (K = T.sessionId),
              (O = !0),
              { ...T, status: "killed", notified: !0, endTime: Date.now() }
            );
          }),
          O)
        ) {
          if ((Yv(H, "stopped", { toolUseId: q, summary: $ }), K))
            QeH(K).catch((T) => N(`RemoteAgentTask archive failed: ${String(T)}`));
        }
        cf(H), N(`RemoteAgentTask ${H} killed, archiving session ${K ?? "unknown"}`);
      },
    };

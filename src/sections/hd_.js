    vd_();
    vy();
    wP();
    Nd_ = {
      name: "DreamTask",
      type: "dream",
      async kill(H, _) {
        let q;
        if (
          (Z4(H, _, ($) => {
            if ($.status !== "running") return $;
            return (
              $.abortController?.abort(),
              (q = $.priorMtime),
              { ...$, status: "killed", endTime: Date.now(), notified: !0, abortController: void 0 }
            );
          }),
          q !== void 0)
        )
          await kd_(q);
      },
    };

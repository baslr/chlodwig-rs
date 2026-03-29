    Z9();
    u7();
    L_();
    W8();
    H_();
    XT();
    s$();
    y6();
    Rj();
    N_();
    nx = $6(async () => {
      if (IT()) return { success: !1 };
      try {
        return {
          success: !0,
          data: (
            await ol(() => {
              let _ = ZD();
              if (_.error) throw Error(`Failed to get auth headers: ${_.error}`);
              return T6.get(`${m8().BASE_API_URL}/api/oauth/account/settings`, {
                headers: { ..._.headers, "User-Agent": Rw() },
              });
            })
          ).data,
        };
      } catch (H) {
        return AH(H), nx.cache.clear?.(), { success: !1 };
      }
    });
    dqH = $6(async () => {
      if (IT()) return { success: !1 };
      try {
        let H = await ol(() => {
            let O = ZD();
            if (O.error) throw Error(`Failed to get auth headers: ${O.error}`);
            return T6.get(`${m8().BASE_API_URL}/api/claude_code_grove`, {
              headers: { ...O.headers, "User-Agent": rS() },
              timeout: 3000,
            });
          }),
          { grove_enabled: _, domain_excluded: q, notice_is_grace_period: $, notice_reminder_frequency: K } = H.data;
        return {
          success: !0,
          data: {
            grove_enabled: _,
            domain_excluded: q ?? !1,
            notice_is_grace_period: $ ?? !0,
            notice_reminder_frequency: K,
          },
        };
      } catch (H) {
        return N(`Failed to fetch Grove notice config: ${H}`), { success: !1 };
      }
    });

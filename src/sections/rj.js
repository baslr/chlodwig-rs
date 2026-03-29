    Z9();
    s$();
    gJ();
    x8();
    W8();
    H_();
    k0();
    h_();
    N_();
    F_();
    (As7 = require("crypto")), (fs7 = [2000, 4000, 8000, 16000]), (Po6 = fs7.length);
    Yp1 = pH(() =>
      a7.object({
        id: a7.string(),
        title: a7.string(),
        description: a7.string(),
        status: a7.enum(["idle", "working", "waiting", "completed", "archived", "cancelled", "rejected"]),
        repo: a7
          .object({
            name: a7.string(),
            owner: a7.object({ login: a7.string() }),
            default_branch: a7.string().optional(),
          })
          .nullable(),
        turns: a7.array(a7.string()),
        created_at: a7.string(),
        updated_at: a7.string(),
      }),
    );

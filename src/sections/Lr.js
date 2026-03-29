    u7();
    k_();
    L_();
    ek();
    EoH();
    H_();
    lX();
    g_();
    h_();
    Bk();
    n8();
    z96();
    N_();
    ti();
    H7();
    nkH();
    _z();
    fI();
    ROH();
    HS();
    (yS7 = require("fs/promises")), (VS7 = u(C3H(), 1)), (s5 = require("path"));
    Tc6 = $6(async (H) => {
      let _ = s5.join(i6(), "skills"),
        q = s5.join(RM(), ".claude", "skills"),
        $ = fV6("skills", H);
      N(`Loading skills from: managed=${q}, user=${_}, project=[${$.join(", ")}]`);
      let K = X0(),
        O = wG("skills"),
        T = fD("projectSettings") && !O;
      if (K1()) {
        if (K.length === 0 || !T)
          return (
            N(
              `[bare] Skipping skill dir discovery (${K.length === 0 ? "no --add-dir" : "projectSettings disabled or skillsLocked"})`,
            ),
            []
          );
        return (await Promise.all(K.map((Z) => rkH(s5.join(Z, ".claude", "skills"), "projectSettings"))))
          .flat()
          .map((Z) => Z.skill);
      }
      let [z, A, f, w, Y] = await Promise.all([
          rkH(q, "policySettings"),
          fD("userSettings") && !O ? rkH(_, "userSettings") : Promise.resolve([]),
          T ? Promise.all($.map((W) => rkH(W, "projectSettings"))) : Promise.resolve([]),
          T ? Promise.all(K.map((W) => rkH(s5.join(W, ".claude", "skills"), "projectSettings"))) : Promise.resolve([]),
          O ? Promise.resolve([]) : bM1(H),
        ]),
        D = [...z, ...A, ...f.flat(), ...w.flat(), ...Y],
        j = await Promise.all(
          D.map(({ skill: W, filePath: Z }) => (W.type === "prompt" ? NM1(Z) : Promise.resolve(null))),
        ),
        M = new Map(),
        J = [];
      for (let W = 0; W < D.length; W++) {
        let Z = D[W];
        if (Z === void 0 || Z.skill.type !== "prompt") continue;
        let { skill: k } = Z,
          v = j[W];
        if (v === null || v === void 0) {
          J.push(k);
          continue;
        }
        let y = M.get(v);
        if (y !== void 0) {
          N(`Skipping duplicate skill '${k.name}' from ${k.source} (same file already loaded from ${y})`);
          continue;
        }
        M.set(v, k.source), J.push(k);
      }
      let P = D.length - J.length;
      if (P > 0) N(`Deduplicated ${P} skills (same file)`);
      let X = [],
        R = [];
      for (let W of J)
        if (W.type === "prompt" && W.paths && W.paths.length > 0 && !JC_.has(W.name)) R.push(W);
        else X.push(W);
      for (let W of R) okH.set(W.name, W);
      if (R.length > 0) N(`[skills] ${R.length} conditional skills stored (activated when matching files are touched)`);
      return (
        N(
          `Loaded ${J.length} unique skills (${X.length} unconditional, ${R.length} conditional, managed: ${z.length}, user: ${A.length}, project: ${f.flat().length}, additional: ${w.flat().length}, legacy commands: ${Y.length})`,
        ),
        X
      );
    });
    (qc6 = new Set()), (Zr = new Map()), (okH = new Map()), (JC_ = new Set()), (zc6 = []);
    hS7({ createSkillCommand: Kc6, parseSkillFrontmatterFields: $c6 });

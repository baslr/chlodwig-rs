    IL_();
    L3 = dOH((H, _) => {
      let { required: q, validate: $ = () => !0 } = H,
        K = On(H.theme),
        [O, T] = iX("idle"),
        [z = "", A] = iX(H.default),
        [f, w] = iX(),
        [Y, D] = iX(""),
        j = BOH({ status: O, theme: K });
      gOH(async (R, W) => {
        if (O !== "idle") return;
        if (lGH(R)) {
          let Z = Y || z;
          T("loading");
          let k = q && !Z ? "You must provide a value" : await $(Z);
          if (k === !0) D(Z), T("done"), _(Z);
          else W.write(Y), w(k || "You must provide a valid value"), T("idle");
        } else if (GL_(R) && !Y) A(void 0);
        else if (R.name === "tab" && !Y) A(void 0), W.clearLine(0), W.write(z), D(z);
        else D(W.line), w(void 0);
      });
      let M = K.style.message(H.message, O),
        J = Y;
      if (typeof H.transformer === "function") J = H.transformer(Y, { isFinal: O === "done" });
      else if (O === "done") J = K.style.answer(Y);
      let P;
      if (z && O !== "done" && !Y) P = K.style.defaultAnswer(z);
      let X = "";
      if (f) X = K.style.error(f);
      return [[j, M, P, J].filter((R) => R !== void 0).join(" "), X];
    });

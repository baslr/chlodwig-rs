    IL_();
    FT = dOH((H, _) => {
      let { transformer: q = (D) => (D ? "yes" : "no") } = H,
        [$, K] = iX("idle"),
        [O, T] = iX(""),
        z = On(H.theme),
        A = BOH({ status: $, theme: z });
      gOH((D, j) => {
        if (lGH(D)) {
          let M = H.default !== !1;
          if (/^(y|yes)/i.test(O)) M = !0;
          else if (/^(n|no)/i.test(O)) M = !1;
          T(q(M)), K("done"), _(M);
        } else T(j.line);
      });
      let f = O,
        w = "";
      if ($ === "done") f = z.style.answer(O);
      else w = ` ${z.style.defaultAnswer(H.default === !1 ? "y/N" : "Y/n")}`;
      let Y = z.style.message(H.message, $);
      return `${A} ${Y}${w} ${f}`;
    });

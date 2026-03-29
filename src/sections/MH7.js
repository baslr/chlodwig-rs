    IL_();
    NL_();
    (vS6 = u(vL_(), 1)),
      (jH7 = u(DH7(), 1)),
      (ux4 = {
        icon: { cursor: nGH.pointer },
        style: { disabled: (H) => vS6.default.dim(`- ${H}`), description: (H) => vS6.default.cyan(H) },
        helpMode: "auto",
      });
    xL_ = dOH((H, _) => {
      let { loop: q = !0, pageSize: $ = 7 } = H,
        K = J6H(!0),
        O = On(ux4, H.theme),
        [T, z] = iX("idle"),
        A = BOH({ status: T, theme: O }),
        f = J6H(),
        w = rQH(() => xx4(H.choices), [H.choices]),
        Y = rQH(() => {
          let k = w.findIndex(eGH),
            v = w.findLastIndex(eGH);
          if (k < 0) throw new nQH("[select prompt] No selectable choices. All choices are disabled.");
          return { first: k, last: v };
        }, [w]),
        D = rQH(() => {
          if (!("default" in H)) return -1;
          return w.findIndex((k) => eGH(k) && k.value === H.default);
        }, [H.default, w]),
        [j, M] = iX(D === -1 ? Y.first : D),
        J = w[j];
      gOH((k, v) => {
        if ((clearTimeout(f.current), lGH(k))) z("done"), _(J.value);
        else if (WL_(k) || qS6(k)) {
          if ((v.clearLine(0), q || (WL_(k) && j !== Y.first) || (qS6(k) && j !== Y.last))) {
            let y = WL_(k) ? -1 : 1,
              E = j;
            do E = (E + y + w.length) % w.length;
            while (!eGH(w[E]));
            M(E);
          }
        } else if (stq(k)) {
          v.clearLine(0);
          let y = Number(k.name) - 1,
            E = w[y];
          if (E != null && eGH(E)) M(y);
        } else if (GL_(k)) v.clearLine(0);
        else {
          let y = v.line.toLowerCase(),
            E = w.findIndex((S) => {
              if (cOH.isSeparator(S) || !eGH(S)) return !1;
              return S.name.toLowerCase().startsWith(y);
            });
          if (E >= 0) M(E);
          f.current = setTimeout(() => {
            v.clearLine(0);
          }, 700);
        }
      }),
        pOH(
          () => () => {
            clearTimeout(f.current);
          },
          [],
        );
      let P = O.style.message(H.message, T),
        X = "",
        R = "";
      if (O.helpMode === "always" || (O.helpMode === "auto" && K.current))
        if (((K.current = !1), w.length > $))
          R = `
${O.style.help("(Use arrow keys to reveal more choices)")}`;
        else X = O.style.help("(Use arrow keys)");
      let W = RS6({
        items: w,
        active: j,
        renderItem({ item: k, isActive: v }) {
          if (cOH.isSeparator(k)) return ` ${k.separator}`;
          if (k.disabled) {
            let S = typeof k.disabled === "string" ? k.disabled : "(disabled)";
            return O.style.disabled(`${k.name} ${S}`);
          }
          let y = v ? O.style.highlight : (S) => S,
            E = v ? O.icon.cursor : " ";
          return y(`${E} ${k.name}`);
        },
        pageSize: $,
        loop: q,
      });
      if (T === "done") return `${A} ${P} ${O.style.answer(J.short)}`;
      let Z = J.description
        ? `
${O.style.description(J.description)}`
        : "";
      return `${[A, P, X].filter(Boolean).join(" ")}
${W}${R}${Z}${jH7.default.cursorHide}`;
    });

  var S0 = d((mN8) => {
    var b1H = (H, _) => {
        let q = [];
        if (H) q.push(H);
        if (_) for (let $ of _) q.push($);
        return q;
      },
      dt = (H, _) => {
        return `${H || "anonymous"}${_ && _.length > 0 ? ` (a.k.a. ${_.join(",")})` : ""}`;
      },
      X16 = () => {
        let H = [],
          _ = [],
          q = !1,
          $ = new Set(),
          K = (Y) =>
            Y.sort((D, j) => uN8[j.step] - uN8[D.step] || xN8[j.priority || "normal"] - xN8[D.priority || "normal"]),
          O = (Y) => {
            let D = !1,
              j = (M) => {
                let J = b1H(M.name, M.aliases);
                if (J.includes(Y)) {
                  D = !0;
                  for (let P of J) $.delete(P);
                  return !1;
                }
                return !0;
              };
            return (H = H.filter(j)), (_ = _.filter(j)), D;
          },
          T = (Y) => {
            let D = !1,
              j = (M) => {
                if (M.middleware === Y) {
                  D = !0;
                  for (let J of b1H(M.name, M.aliases)) $.delete(J);
                  return !1;
                }
                return !0;
              };
            return (H = H.filter(j)), (_ = _.filter(j)), D;
          },
          z = (Y) => {
            return (
              H.forEach((D) => {
                Y.add(D.middleware, { ...D });
              }),
              _.forEach((D) => {
                Y.addRelativeTo(D.middleware, { ...D });
              }),
              Y.identifyOnResolve?.(w.identifyOnResolve()),
              Y
            );
          },
          A = (Y) => {
            let D = [];
            return (
              Y.before.forEach((j) => {
                if (j.before.length === 0 && j.after.length === 0) D.push(j);
                else D.push(...A(j));
              }),
              D.push(Y),
              Y.after.reverse().forEach((j) => {
                if (j.before.length === 0 && j.after.length === 0) D.push(j);
                else D.push(...A(j));
              }),
              D
            );
          },
          f = (Y = !1) => {
            let D = [],
              j = [],
              M = {};
            return (
              H.forEach((P) => {
                let X = { ...P, before: [], after: [] };
                for (let R of b1H(X.name, X.aliases)) M[R] = X;
                D.push(X);
              }),
              _.forEach((P) => {
                let X = { ...P, before: [], after: [] };
                for (let R of b1H(X.name, X.aliases)) M[R] = X;
                j.push(X);
              }),
              j.forEach((P) => {
                if (P.toMiddleware) {
                  let X = M[P.toMiddleware];
                  if (X === void 0) {
                    if (Y) return;
                    throw Error(
                      `${P.toMiddleware} is not found when adding ${dt(P.name, P.aliases)} middleware ${P.relation} ${P.toMiddleware}`,
                    );
                  }
                  if (P.relation === "after") X.after.push(P);
                  if (P.relation === "before") X.before.push(P);
                }
              }),
              K(D)
                .map(A)
                .reduce((P, X) => {
                  return P.push(...X), P;
                }, [])
            );
          },
          w = {
            add: (Y, D = {}) => {
              let { name: j, override: M, aliases: J } = D,
                P = { step: "initialize", priority: "normal", middleware: Y, ...D },
                X = b1H(j, J);
              if (X.length > 0) {
                if (X.some((R) => $.has(R))) {
                  if (!M) throw Error(`Duplicate middleware name '${dt(j, J)}'`);
                  for (let R of X) {
                    let W = H.findIndex((k) => k.name === R || k.aliases?.some((v) => v === R));
                    if (W === -1) continue;
                    let Z = H[W];
                    if (Z.step !== P.step || P.priority !== Z.priority)
                      throw Error(
                        `"${dt(Z.name, Z.aliases)}" middleware with ${Z.priority} priority in ${Z.step} step cannot be overridden by "${dt(j, J)}" middleware with ${P.priority} priority in ${P.step} step.`,
                      );
                    H.splice(W, 1);
                  }
                }
                for (let R of X) $.add(R);
              }
              H.push(P);
            },
            addRelativeTo: (Y, D) => {
              let { name: j, override: M, aliases: J } = D,
                P = { middleware: Y, ...D },
                X = b1H(j, J);
              if (X.length > 0) {
                if (X.some((R) => $.has(R))) {
                  if (!M) throw Error(`Duplicate middleware name '${dt(j, J)}'`);
                  for (let R of X) {
                    let W = _.findIndex((k) => k.name === R || k.aliases?.some((v) => v === R));
                    if (W === -1) continue;
                    let Z = _[W];
                    if (Z.toMiddleware !== P.toMiddleware || Z.relation !== P.relation)
                      throw Error(
                        `"${dt(Z.name, Z.aliases)}" middleware ${Z.relation} "${Z.toMiddleware}" middleware cannot be overridden by "${dt(j, J)}" middleware ${P.relation} "${P.toMiddleware}" middleware.`,
                      );
                    _.splice(W, 1);
                  }
                }
                for (let R of X) $.add(R);
              }
              _.push(P);
            },
            clone: () => z(X16()),
            use: (Y) => {
              Y.applyToStack(w);
            },
            remove: (Y) => {
              if (typeof Y === "string") return O(Y);
              else return T(Y);
            },
            removeByTag: (Y) => {
              let D = !1,
                j = (M) => {
                  let { tags: J, name: P, aliases: X } = M;
                  if (J && J.includes(Y)) {
                    let R = b1H(P, X);
                    for (let W of R) $.delete(W);
                    return (D = !0), !1;
                  }
                  return !0;
                };
              return (H = H.filter(j)), (_ = _.filter(j)), D;
            },
            concat: (Y) => {
              let D = z(X16());
              return D.use(Y), D.identifyOnResolve(q || D.identifyOnResolve() || (Y.identifyOnResolve?.() ?? !1)), D;
            },
            applyToStack: z,
            identify: () => {
              return f(!0).map((Y) => {
                let D = Y.step ?? Y.relation + " " + Y.toMiddleware;
                return dt(Y.name, Y.aliases) + " - " + D;
              });
            },
            identifyOnResolve(Y) {
              if (typeof Y === "boolean") q = Y;
              return q;
            },
            resolve: (Y, D) => {
              for (let j of f()
                .map((M) => M.middleware)
                .reverse())
                Y = j(Y, D);
              if (q) console.log(w.identify());
              return Y;
            },
          };
        return w;
      },
      uN8 = { initialize: 5, serialize: 4, build: 3, finalizeRequest: 2, deserialize: 1 },
      xN8 = { high: 3, normal: 2, low: 1 };
    mN8.constructStack = X16;
  });

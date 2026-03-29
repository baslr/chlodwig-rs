  var cpq = d((GL6) => {
    Object.defineProperty(GL6, "__esModule", { value: !0 });
    var J2 = PK(),
      P04 = {
        message: ({ schemaCode: H }) => J2.str`must match format "${H}"`,
        params: ({ schemaCode: H }) => J2._`{format: ${H}}`,
      },
      X04 = {
        keyword: "format",
        type: ["number", "string"],
        schemaType: "string",
        $data: !0,
        error: P04,
        code(H, _) {
          let { gen: q, data: $, $data: K, schema: O, schemaCode: T, it: z } = H,
            { opts: A, errSchemaPath: f, schemaEnv: w, self: Y } = z;
          if (!A.validateFormats) return;
          if (K) D();
          else j();
          function D() {
            let M = q.scopeValue("formats", { ref: Y.formats, code: A.code.formats }),
              J = q.const("fDef", J2._`${M}[${T}]`),
              P = q.let("fType"),
              X = q.let("format");
            q.if(
              J2._`typeof ${J} == "object" && !(${J} instanceof RegExp)`,
              () => q.assign(P, J2._`${J}.type || "string"`).assign(X, J2._`${J}.validate`),
              () => q.assign(P, J2._`"string"`).assign(X, J),
            ),
              H.fail$data((0, J2.or)(R(), W()));
            function R() {
              if (A.strictSchema === !1) return J2.nil;
              return J2._`${T} && !${X}`;
            }
            function W() {
              let Z = w.$async ? J2._`(${J}.async ? await ${X}(${$}) : ${X}(${$}))` : J2._`${X}(${$})`,
                k = J2._`(typeof ${X} == "function" ? ${Z} : ${X}.test(${$}))`;
              return J2._`${X} && ${X} !== true && ${P} === ${_} && !${k}`;
            }
          }
          function j() {
            let M = Y.formats[O];
            if (!M) {
              R();
              return;
            }
            if (M === !0) return;
            let [J, P, X] = W(M);
            if (J === _) H.pass(Z());
            function R() {
              if (A.strictSchema === !1) {
                Y.logger.warn(k());
                return;
              }
              throw Error(k());
              function k() {
                return `unknown format "${O}" ignored in schema at path "${f}"`;
              }
            }
            function W(k) {
              let v =
                  k instanceof RegExp
                    ? (0, J2.regexpCode)(k)
                    : A.code.formats
                      ? J2._`${A.code.formats}${(0, J2.getProperty)(O)}`
                      : void 0,
                y = q.scopeValue("formats", { key: O, ref: k, code: v });
              if (typeof k == "object" && !(k instanceof RegExp))
                return [k.type || "string", k.validate, J2._`${y}.validate`];
              return ["string", k, y];
            }
            function Z() {
              if (typeof M == "object" && !(M instanceof RegExp) && M.async) {
                if (!w.$async) throw Error("async format in sync schema");
                return J2._`await ${X}(${$})`;
              }
              return typeof P == "function" ? J2._`${X}(${$})` : J2._`${X}.test(${$})`;
            }
          }
        },
      };
    GL6.default = X04;
  });

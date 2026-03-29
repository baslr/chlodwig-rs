  var opq = d((kL6) => {
    Object.defineProperty(kL6, "__esModule", { value: !0 });
    var w0H = PK(),
      LL6 = npq(),
      rpq = QW_(),
      N04 = YFH(),
      h04 = W3(),
      y04 = {
        message: ({ params: { discrError: H, tagName: _ } }) =>
          H === LL6.DiscrError.Tag ? `tag "${_}" must be string` : `value of tag "${_}" must be in oneOf`,
        params: ({ params: { discrError: H, tag: _, tagName: q } }) => w0H._`{error: ${H}, tag: ${q}, tagValue: ${_}}`,
      },
      V04 = {
        keyword: "discriminator",
        type: "object",
        schemaType: "object",
        error: y04,
        code(H) {
          let { gen: _, data: q, schema: $, parentSchema: K, it: O } = H,
            { oneOf: T } = K;
          if (!O.opts.discriminator) throw Error("discriminator: requires discriminator option");
          let z = $.propertyName;
          if (typeof z != "string") throw Error("discriminator: requires propertyName");
          if ($.mapping) throw Error("discriminator: mapping is not supported");
          if (!T) throw Error("discriminator: requires oneOf keyword");
          let A = _.let("valid", !1),
            f = _.const("tag", w0H._`${q}${(0, w0H.getProperty)(z)}`);
          _.if(
            w0H._`typeof ${f} == "string"`,
            () => w(),
            () => H.error(!1, { discrError: LL6.DiscrError.Tag, tag: f, tagName: z }),
          ),
            H.ok(A);
          function w() {
            let j = D();
            _.if(!1);
            for (let M in j) _.elseIf(w0H._`${f} === ${M}`), _.assign(A, Y(j[M]));
            _.else(), H.error(!1, { discrError: LL6.DiscrError.Mapping, tag: f, tagName: z }), _.endIf();
          }
          function Y(j) {
            let M = _.name("valid"),
              J = H.subschema({ keyword: "oneOf", schemaProp: j }, M);
            return H.mergeEvaluated(J, w0H.Name), M;
          }
          function D() {
            var j;
            let M = {},
              J = X(K),
              P = !0;
            for (let Z = 0; Z < T.length; Z++) {
              let k = T[Z];
              if ((k === null || k === void 0 ? void 0 : k.$ref) && !(0, h04.schemaHasRulesButRef)(k, O.self.RULES)) {
                let y = k.$ref;
                if (((k = rpq.resolveRef.call(O.self, O.schemaEnv.root, O.baseId, y)), k instanceof rpq.SchemaEnv))
                  k = k.schema;
                if (k === void 0) throw new N04.default(O.opts.uriResolver, O.baseId, y);
              }
              let v = (j = k === null || k === void 0 ? void 0 : k.properties) === null || j === void 0 ? void 0 : j[z];
              if (typeof v != "object")
                throw Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${z}"`);
              (P = P && (J || X(k))), R(v, Z);
            }
            if (!P) throw Error(`discriminator: "${z}" must be required`);
            return M;
            function X({ required: Z }) {
              return Array.isArray(Z) && Z.includes(z);
            }
            function R(Z, k) {
              if (Z.const) W(Z.const, k);
              else if (Z.enum) for (let v of Z.enum) W(v, k);
              else throw Error(`discriminator: "properties/${z}" must have "const" or "enum"`);
            }
            function W(Z, k) {
              if (typeof Z != "string" || Z in M) throw Error(`discriminator: "${z}" values must be unique strings`);
              M[Z] = k;
            }
          }
        },
      };
    kL6.default = V04;
  });

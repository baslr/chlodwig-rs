  var imq = d((mX) => {
    Object.defineProperty(mX, "__esModule", { value: !0 });
    mX.CodeGen = mX.Name = mX.nil = mX.stringify = mX.str = mX._ = mX.KeywordCxt = void 0;
    var HX4 = wFH();
    Object.defineProperty(mX, "KeywordCxt", {
      enumerable: !0,
      get: function () {
        return HX4.KeywordCxt;
      },
    });
    var T0H = PK();
    Object.defineProperty(mX, "_", {
      enumerable: !0,
      get: function () {
        return T0H._;
      },
    });
    Object.defineProperty(mX, "str", {
      enumerable: !0,
      get: function () {
        return T0H.str;
      },
    });
    Object.defineProperty(mX, "stringify", {
      enumerable: !0,
      get: function () {
        return T0H.stringify;
      },
    });
    Object.defineProperty(mX, "nil", {
      enumerable: !0,
      get: function () {
        return T0H.nil;
      },
    });
    Object.defineProperty(mX, "Name", {
      enumerable: !0,
      get: function () {
        return T0H.Name;
      },
    });
    Object.defineProperty(mX, "CodeGen", {
      enumerable: !0,
      get: function () {
        return T0H.CodeGen;
      },
    });
    var _X4 = FW_(),
      Umq = YFH(),
      qX4 = wZ6(),
      MFH = QW_(),
      $X4 = PK(),
      JFH = zFH(),
      rW_ = TFH(),
      xZ6 = W3(),
      gmq = Wmq(),
      KX4 = Bmq(),
      Qmq = (H, _) => new RegExp(H, _);
    Qmq.code = "new RegExp";
    var OX4 = ["removeAdditional", "useDefaults", "coerceTypes"],
      TX4 = new Set([
        "validate",
        "serialize",
        "parse",
        "wrapper",
        "root",
        "schema",
        "keyword",
        "pattern",
        "formats",
        "validate$data",
        "func",
        "obj",
        "Error",
      ]),
      zX4 = {
        errorDataPath: "",
        format: "`validateFormats: false` can be used instead.",
        nullable: '"nullable" keyword is supported by default.',
        jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
        extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
        missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
        processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
        sourceCode: "Use option `code: {source: true}`",
        strictDefaults: "It is default now, see option `strict`.",
        strictKeywords: "It is default now, see option `strict`.",
        uniqueItems: '"uniqueItems" keyword is always validated.',
        unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
        cache: "Map is used as cache, schema object as key.",
        serialize: "Map is used as cache, schema object as key.",
        ajvErrors: "It is default now.",
      },
      AX4 = {
        ignoreKeywordsWithRef: "",
        jsPropertySyntax: "",
        unicode: '"minLength"/"maxLength" account for unicode characters by default.',
      },
      dmq = 200;
    function fX4(H) {
      var _, q, $, K, O, T, z, A, f, w, Y, D, j, M, J, P, X, R, W, Z, k, v, y, E, S;
      let x = H.strict,
        I = (_ = H.code) === null || _ === void 0 ? void 0 : _.optimize,
        B = I === !0 || I === void 0 ? 1 : I || 0,
        p = ($ = (q = H.code) === null || q === void 0 ? void 0 : q.regExp) !== null && $ !== void 0 ? $ : Qmq,
        C = (K = H.uriResolver) !== null && K !== void 0 ? K : KX4.default;
      return {
        strictSchema: (T = (O = H.strictSchema) !== null && O !== void 0 ? O : x) !== null && T !== void 0 ? T : !0,
        strictNumbers: (A = (z = H.strictNumbers) !== null && z !== void 0 ? z : x) !== null && A !== void 0 ? A : !0,
        strictTypes: (w = (f = H.strictTypes) !== null && f !== void 0 ? f : x) !== null && w !== void 0 ? w : "log",
        strictTuples: (D = (Y = H.strictTuples) !== null && Y !== void 0 ? Y : x) !== null && D !== void 0 ? D : "log",
        strictRequired: (M = (j = H.strictRequired) !== null && j !== void 0 ? j : x) !== null && M !== void 0 ? M : !1,
        code: H.code ? { ...H.code, optimize: B, regExp: p } : { optimize: B, regExp: p },
        loopRequired: (J = H.loopRequired) !== null && J !== void 0 ? J : dmq,
        loopEnum: (P = H.loopEnum) !== null && P !== void 0 ? P : dmq,
        meta: (X = H.meta) !== null && X !== void 0 ? X : !0,
        messages: (R = H.messages) !== null && R !== void 0 ? R : !0,
        inlineRefs: (W = H.inlineRefs) !== null && W !== void 0 ? W : !0,
        schemaId: (Z = H.schemaId) !== null && Z !== void 0 ? Z : "$id",
        addUsedSchema: (k = H.addUsedSchema) !== null && k !== void 0 ? k : !0,
        validateSchema: (v = H.validateSchema) !== null && v !== void 0 ? v : !0,
        validateFormats: (y = H.validateFormats) !== null && y !== void 0 ? y : !0,
        unicodeRegExp: (E = H.unicodeRegExp) !== null && E !== void 0 ? E : !0,
        int32range: (S = H.int32range) !== null && S !== void 0 ? S : !0,
        uriResolver: C,
      };
    }
    class oW_ {
      constructor(H = {}) {
        (this.schemas = {}),
          (this.refs = {}),
          (this.formats = {}),
          (this._compilations = new Set()),
          (this._loading = {}),
          (this._cache = new Map()),
          (H = this.opts = { ...H, ...fX4(H) });
        let { es5: _, lines: q } = this.opts.code;
        (this.scope = new $X4.ValueScope({ scope: {}, prefixes: TX4, es5: _, lines: q })),
          (this.logger = JX4(H.logger));
        let $ = H.validateFormats;
        if (
          ((H.validateFormats = !1),
          (this.RULES = (0, qX4.getRules)()),
          cmq.call(this, zX4, H, "NOT SUPPORTED"),
          cmq.call(this, AX4, H, "DEPRECATED", "warn"),
          (this._metaOpts = jX4.call(this)),
          H.formats)
        )
          YX4.call(this);
        if ((this._addVocabularies(), this._addDefaultMetaSchema(), H.keywords)) DX4.call(this, H.keywords);
        if (typeof H.meta == "object") this.addMetaSchema(H.meta);
        wX4.call(this), (H.validateFormats = $);
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        let { $data: H, meta: _, schemaId: q } = this.opts,
          $ = gmq;
        if (q === "id") ($ = { ...gmq }), ($.id = $.$id), delete $.$id;
        if (_ && H) this.addMetaSchema($, $[q], !1);
      }
      defaultMeta() {
        let { meta: H, schemaId: _ } = this.opts;
        return (this.opts.defaultMeta = typeof H == "object" ? H[_] || H : void 0);
      }
      validate(H, _) {
        let q;
        if (typeof H == "string") {
          if (((q = this.getSchema(H)), !q)) throw Error(`no schema with key or ref "${H}"`);
        } else q = this.compile(H);
        let $ = q(_);
        if (!("$async" in q)) this.errors = q.errors;
        return $;
      }
      compile(H, _) {
        let q = this._addSchema(H, _);
        return q.validate || this._compileSchemaEnv(q);
      }
      compileAsync(H, _) {
        if (typeof this.opts.loadSchema != "function") throw Error("options.loadSchema should be a function");
        let { loadSchema: q } = this.opts;
        return $.call(this, H, _);
        async function $(f, w) {
          await K.call(this, f.$schema);
          let Y = this._addSchema(f, w);
          return Y.validate || O.call(this, Y);
        }
        async function K(f) {
          if (f && !this.getSchema(f)) await $.call(this, { $ref: f }, !0);
        }
        async function O(f) {
          try {
            return this._compileSchemaEnv(f);
          } catch (w) {
            if (!(w instanceof Umq.default)) throw w;
            return T.call(this, w), await z.call(this, w.missingSchema), O.call(this, f);
          }
        }
        function T({ missingSchema: f, missingRef: w }) {
          if (this.refs[f]) throw Error(`AnySchema ${f} is loaded but ${w} cannot be resolved`);
        }
        async function z(f) {
          let w = await A.call(this, f);
          if (!this.refs[f]) await K.call(this, w.$schema);
          if (!this.refs[f]) this.addSchema(w, f, _);
        }
        async function A(f) {
          let w = this._loading[f];
          if (w) return w;
          try {
            return await (this._loading[f] = q(f));
          } finally {
            delete this._loading[f];
          }
        }
      }
      addSchema(H, _, q, $ = this.opts.validateSchema) {
        if (Array.isArray(H)) {
          for (let O of H) this.addSchema(O, void 0, q, $);
          return this;
        }
        let K;
        if (typeof H === "object") {
          let { schemaId: O } = this.opts;
          if (((K = H[O]), K !== void 0 && typeof K != "string")) throw Error(`schema ${O} must be string`);
        }
        return (
          (_ = (0, JFH.normalizeId)(_ || K)),
          this._checkUnique(_),
          (this.schemas[_] = this._addSchema(H, q, _, $, !0)),
          this
        );
      }
      addMetaSchema(H, _, q = this.opts.validateSchema) {
        return this.addSchema(H, _, !0, q), this;
      }
      validateSchema(H, _) {
        if (typeof H == "boolean") return !0;
        let q;
        if (((q = H.$schema), q !== void 0 && typeof q != "string")) throw Error("$schema must be a string");
        if (((q = q || this.opts.defaultMeta || this.defaultMeta()), !q))
          return this.logger.warn("meta-schema not available"), (this.errors = null), !0;
        let $ = this.validate(q, H);
        if (!$ && _) {
          let K = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log") this.logger.error(K);
          else throw Error(K);
        }
        return $;
      }
      getSchema(H) {
        let _;
        while (typeof (_ = Fmq.call(this, H)) == "string") H = _;
        if (_ === void 0) {
          let { schemaId: q } = this.opts,
            $ = new MFH.SchemaEnv({ schema: {}, schemaId: q });
          if (((_ = MFH.resolveSchema.call(this, $, H)), !_)) return;
          this.refs[H] = _;
        }
        return _.validate || this._compileSchemaEnv(_);
      }
      removeSchema(H) {
        if (H instanceof RegExp)
          return this._removeAllSchemas(this.schemas, H), this._removeAllSchemas(this.refs, H), this;
        switch (typeof H) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            let _ = Fmq.call(this, H);
            if (typeof _ == "object") this._cache.delete(_.schema);
            return delete this.schemas[H], delete this.refs[H], this;
          }
          case "object": {
            let _ = H;
            this._cache.delete(_);
            let q = H[this.opts.schemaId];
            if (q) (q = (0, JFH.normalizeId)(q)), delete this.schemas[q], delete this.refs[q];
            return this;
          }
          default:
            throw Error("ajv.removeSchema: invalid parameter");
        }
      }
      addVocabulary(H) {
        for (let _ of H) this.addKeyword(_);
        return this;
      }
      addKeyword(H, _) {
        let q;
        if (typeof H == "string") {
          if (((q = H), typeof _ == "object"))
            this.logger.warn("these parameters are deprecated, see docs for addKeyword"), (_.keyword = q);
        } else if (typeof H == "object" && _ === void 0) {
          if (((_ = H), (q = _.keyword), Array.isArray(q) && !q.length))
            throw Error("addKeywords: keyword must be string or non-empty array");
        } else throw Error("invalid addKeywords parameters");
        if ((XX4.call(this, q, _), !_)) return (0, xZ6.eachItem)(q, (K) => uZ6.call(this, K)), this;
        GX4.call(this, _);
        let $ = { ..._, type: (0, rW_.getJSONTypes)(_.type), schemaType: (0, rW_.getJSONTypes)(_.schemaType) };
        return (
          (0, xZ6.eachItem)(
            q,
            $.type.length === 0 ? (K) => uZ6.call(this, K, $) : (K) => $.type.forEach((O) => uZ6.call(this, K, $, O)),
          ),
          this
        );
      }
      getKeyword(H) {
        let _ = this.RULES.all[H];
        return typeof _ == "object" ? _.definition : !!_;
      }
      removeKeyword(H) {
        let { RULES: _ } = this;
        delete _.keywords[H], delete _.all[H];
        for (let q of _.rules) {
          let $ = q.rules.findIndex((K) => K.keyword === H);
          if ($ >= 0) q.rules.splice($, 1);
        }
        return this;
      }
      addFormat(H, _) {
        if (typeof _ == "string") _ = new RegExp(_);
        return (this.formats[H] = _), this;
      }
      errorsText(H = this.errors, { separator: _ = ", ", dataVar: q = "data" } = {}) {
        if (!H || H.length === 0) return "No errors";
        return H.map(($) => `${q}${$.instancePath} ${$.message}`).reduce(($, K) => $ + _ + K);
      }
      $dataMetaSchema(H, _) {
        let q = this.RULES.all;
        H = JSON.parse(JSON.stringify(H));
        for (let $ of _) {
          let K = $.split("/").slice(1),
            O = H;
          for (let T of K) O = O[T];
          for (let T in q) {
            let z = q[T];
            if (typeof z != "object") continue;
            let { $data: A } = z.definition,
              f = O[T];
            if (A && f) O[T] = lmq(f);
          }
        }
        return H;
      }
      _removeAllSchemas(H, _) {
        for (let q in H) {
          let $ = H[q];
          if (!_ || _.test(q)) {
            if (typeof $ == "string") delete H[q];
            else if ($ && !$.meta) this._cache.delete($.schema), delete H[q];
          }
        }
      }
      _addSchema(H, _, q, $ = this.opts.validateSchema, K = this.opts.addUsedSchema) {
        let O,
          { schemaId: T } = this.opts;
        if (typeof H == "object") O = H[T];
        else if (this.opts.jtd) throw Error("schema must be object");
        else if (typeof H != "boolean") throw Error("schema must be object or boolean");
        let z = this._cache.get(H);
        if (z !== void 0) return z;
        q = (0, JFH.normalizeId)(O || q);
        let A = JFH.getSchemaRefs.call(this, H, q);
        if (
          ((z = new MFH.SchemaEnv({ schema: H, schemaId: T, meta: _, baseId: q, localRefs: A })),
          this._cache.set(z.schema, z),
          K && !q.startsWith("#"))
        ) {
          if (q) this._checkUnique(q);
          this.refs[q] = z;
        }
        if ($) this.validateSchema(H, !0);
        return z;
      }
      _checkUnique(H) {
        if (this.schemas[H] || this.refs[H]) throw Error(`schema with key or id "${H}" already exists`);
      }
      _compileSchemaEnv(H) {
        if (H.meta) this._compileMetaSchema(H);
        else MFH.compileSchema.call(this, H);
        if (!H.validate) throw Error("ajv implementation error");
        return H.validate;
      }
      _compileMetaSchema(H) {
        let _ = this.opts;
        this.opts = this._metaOpts;
        try {
          MFH.compileSchema.call(this, H);
        } finally {
          this.opts = _;
        }
      }
    }
    oW_.ValidationError = _X4.default;
    oW_.MissingRefError = Umq.default;
    mX.default = oW_;
    function cmq(H, _, q, $ = "error") {
      for (let K in H) {
        let O = K;
        if (O in _) this.logger[$](`${q}: option ${K}. ${H[O]}`);
      }
    }
    function Fmq(H) {
      return (H = (0, JFH.normalizeId)(H)), this.schemas[H] || this.refs[H];
    }
    function wX4() {
      let H = this.opts.schemas;
      if (!H) return;
      if (Array.isArray(H)) this.addSchema(H);
      else for (let _ in H) this.addSchema(H[_], _);
    }
    function YX4() {
      for (let H in this.opts.formats) {
        let _ = this.opts.formats[H];
        if (_) this.addFormat(H, _);
      }
    }
    function DX4(H) {
      if (Array.isArray(H)) {
        this.addVocabulary(H);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (let _ in H) {
        let q = H[_];
        if (!q.keyword) q.keyword = _;
        this.addKeyword(q);
      }
    }
    function jX4() {
      let H = { ...this.opts };
      for (let _ of OX4) delete H[_];
      return H;
    }
    var MX4 = { log() {}, warn() {}, error() {} };
    function JX4(H) {
      if (H === !1) return MX4;
      if (H === void 0) return console;
      if (H.log && H.warn && H.error) return H;
      throw Error("logger must implement log, warn and error methods");
    }
    var PX4 = /^[a-z_$][a-z0-9_$:-]*$/i;
    function XX4(H, _) {
      let { RULES: q } = this;
      if (
        ((0, xZ6.eachItem)(H, ($) => {
          if (q.keywords[$]) throw Error(`Keyword ${$} is already defined`);
          if (!PX4.test($)) throw Error(`Keyword ${$} has invalid name`);
        }),
        !_)
      )
        return;
      if (_.$data && !("code" in _ || "validate" in _))
        throw Error('$data keyword must have "code" or "validate" function');
    }
    function uZ6(H, _, q) {
      var $;
      let K = _ === null || _ === void 0 ? void 0 : _.post;
      if (q && K) throw Error('keyword with "post" flag cannot have "type"');
      let { RULES: O } = this,
        T = K ? O.post : O.rules.find(({ type: A }) => A === q);
      if (!T) (T = { type: q, rules: [] }), O.rules.push(T);
      if (((O.keywords[H] = !0), !_)) return;
      let z = {
        keyword: H,
        definition: { ..._, type: (0, rW_.getJSONTypes)(_.type), schemaType: (0, rW_.getJSONTypes)(_.schemaType) },
      };
      if (_.before) WX4.call(this, T, z, _.before);
      else T.rules.push(z);
      (O.all[H] = z), ($ = _.implements) === null || $ === void 0 || $.forEach((A) => this.addKeyword(A));
    }
    function WX4(H, _, q) {
      let $ = H.rules.findIndex((K) => K.keyword === q);
      if ($ >= 0) H.rules.splice($, 0, _);
      else H.rules.push(_), this.logger.warn(`rule ${q} is not defined`);
    }
    function GX4(H) {
      let { metaSchema: _ } = H;
      if (_ === void 0) return;
      if (H.$data && this.opts.$data) _ = lmq(_);
      H.validateSchema = this.compile(_, !0);
    }
    var RX4 = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
    function lmq(H) {
      return { anyOf: [H, RX4] };
    }
  });

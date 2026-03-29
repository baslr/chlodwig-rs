  var YQH = d((Noq) => {
    var PC4 = rUH(),
      kGH = BR_(),
      LE = R3(),
      XC4 = $6H(),
      WC4 = H6H(),
      GC4 = Cy6(),
      RC4 = voq(),
      Iy6 = uR_(),
      ZC4 = Uh6(),
      LC4 = oUH(),
      uy6 = Fh6();
    class xy6 {
      constructor(H, _, q) {
        (this.commentBefore = null),
          (this.comment = null),
          (this.errors = []),
          (this.warnings = []),
          Object.defineProperty(this, LE.NODE_TYPE, { value: LE.DOC });
        let $ = null;
        if (typeof _ === "function" || Array.isArray(_)) $ = _;
        else if (q === void 0 && _) (q = _), (_ = void 0);
        let K = Object.assign(
          {
            intAsBigInt: !1,
            keepSourceTokens: !1,
            logLevel: "warn",
            prettyErrors: !0,
            strict: !0,
            stringKeys: !1,
            uniqueKeys: !0,
            version: "1.2",
          },
          q,
        );
        this.options = K;
        let { version: O } = K;
        if (q?._directives) {
          if (((this.directives = q._directives.atDocument()), this.directives.yaml.explicit))
            O = this.directives.yaml.version;
        } else this.directives = new uy6.Directives({ version: O });
        this.setSchema(O, q), (this.contents = H === void 0 ? null : this.createNode(H, $, q));
      }
      clone() {
        let H = Object.create(xy6.prototype, { [LE.NODE_TYPE]: { value: LE.DOC } });
        if (
          ((H.commentBefore = this.commentBefore),
          (H.comment = this.comment),
          (H.errors = this.errors.slice()),
          (H.warnings = this.warnings.slice()),
          (H.options = Object.assign({}, this.options)),
          this.directives)
        )
          H.directives = this.directives.clone();
        if (
          ((H.schema = this.schema.clone()),
          (H.contents = LE.isNode(this.contents) ? this.contents.clone(H.schema) : this.contents),
          this.range)
        )
          H.range = this.range.slice();
        return H;
      }
      add(H) {
        if (vGH(this.contents)) this.contents.add(H);
      }
      addIn(H, _) {
        if (vGH(this.contents)) this.contents.addIn(H, _);
      }
      createAlias(H, _) {
        if (!H.anchor) {
          let q = Iy6.anchorNames(this);
          H.anchor = !_ || q.has(_) ? Iy6.findNewAnchor(_ || "a", q) : _;
        }
        return new PC4.Alias(H.anchor);
      }
      createNode(H, _, q) {
        let $ = void 0;
        if (typeof _ === "function") (H = _.call({ "": H }, "", H)), ($ = _);
        else if (Array.isArray(_)) {
          let J = (X) => typeof X === "number" || X instanceof String || X instanceof Number,
            P = _.filter(J).map(String);
          if (P.length > 0) _ = _.concat(P);
          $ = _;
        } else if (q === void 0 && _) (q = _), (_ = void 0);
        let { aliasDuplicateObjects: K, anchorPrefix: O, flow: T, keepUndefined: z, onTagObj: A, tag: f } = q ?? {},
          { onAnchor: w, setAnchors: Y, sourceObjects: D } = Iy6.createNodeAnchors(this, O || "a"),
          j = {
            aliasDuplicateObjects: K ?? !0,
            keepUndefined: z ?? !1,
            onAnchor: w,
            onTagObj: A,
            replacer: $,
            schema: this.schema,
            sourceObjects: D,
          },
          M = LC4.createNode(H, f, j);
        if (T && LE.isCollection(M)) M.flow = !0;
        return Y(), M;
      }
      createPair(H, _, q = {}) {
        let $ = this.createNode(H, null, q),
          K = this.createNode(_, null, q);
        return new XC4.Pair($, K);
      }
      delete(H) {
        return vGH(this.contents) ? this.contents.delete(H) : !1;
      }
      deleteIn(H) {
        if (kGH.isEmptyPath(H)) {
          if (this.contents == null) return !1;
          return (this.contents = null), !0;
        }
        return vGH(this.contents) ? this.contents.deleteIn(H) : !1;
      }
      get(H, _) {
        return LE.isCollection(this.contents) ? this.contents.get(H, _) : void 0;
      }
      getIn(H, _) {
        if (kGH.isEmptyPath(H)) return !_ && LE.isScalar(this.contents) ? this.contents.value : this.contents;
        return LE.isCollection(this.contents) ? this.contents.getIn(H, _) : void 0;
      }
      has(H) {
        return LE.isCollection(this.contents) ? this.contents.has(H) : !1;
      }
      hasIn(H) {
        if (kGH.isEmptyPath(H)) return this.contents !== void 0;
        return LE.isCollection(this.contents) ? this.contents.hasIn(H) : !1;
      }
      set(H, _) {
        if (this.contents == null) this.contents = kGH.collectionFromPath(this.schema, [H], _);
        else if (vGH(this.contents)) this.contents.set(H, _);
      }
      setIn(H, _) {
        if (kGH.isEmptyPath(H)) this.contents = _;
        else if (this.contents == null) this.contents = kGH.collectionFromPath(this.schema, Array.from(H), _);
        else if (vGH(this.contents)) this.contents.setIn(H, _);
      }
      setSchema(H, _ = {}) {
        if (typeof H === "number") H = String(H);
        let q;
        switch (H) {
          case "1.1":
            if (this.directives) this.directives.yaml.version = "1.1";
            else this.directives = new uy6.Directives({ version: "1.1" });
            q = { resolveKnownTags: !1, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives) this.directives.yaml.version = H;
            else this.directives = new uy6.Directives({ version: H });
            q = { resolveKnownTags: !0, schema: "core" };
            break;
          case null:
            if (this.directives) delete this.directives;
            q = null;
            break;
          default: {
            let $ = JSON.stringify(H);
            throw Error(`Expected '1.1', '1.2' or null as first argument, but found: ${$}`);
          }
        }
        if (_.schema instanceof Object) this.schema = _.schema;
        else if (q) this.schema = new GC4.Schema(Object.assign(q, _));
        else throw Error("With a null YAML version, the { schema: Schema } option is required");
      }
      toJS({ json: H, jsonArg: _, mapAsMap: q, maxAliasCount: $, onAnchor: K, reviver: O } = {}) {
        let T = {
            anchors: new Map(),
            doc: this,
            keep: !H,
            mapAsMap: q === !0,
            mapKeyWarned: !1,
            maxAliasCount: typeof $ === "number" ? $ : 100,
          },
          z = WC4.toJS(this.contents, _ ?? "", T);
        if (typeof K === "function") for (let { count: A, res: f } of T.anchors.values()) K(f, A);
        return typeof O === "function" ? ZC4.applyReviver(O, { "": z }, "", z) : z;
      }
      toJSON(H, _) {
        return this.toJS({ json: !0, jsonArg: H, mapAsMap: !1, onAnchor: _ });
      }
      toString(H = {}) {
        if (this.errors.length > 0) throw Error("Document with errors cannot be stringified");
        if ("indent" in H && (!Number.isInteger(H.indent) || Number(H.indent) <= 0)) {
          let _ = JSON.stringify(H.indent);
          throw Error(`"indent" option must be a positive integer, not ${_}`);
        }
        return RC4.stringifyDocument(this, H);
      }
    }
    function vGH(H) {
      if (LE.isCollection(H)) return !0;
      throw Error("Expected a YAML collection as document contents");
    }
    Noq.Document = xy6;
  });

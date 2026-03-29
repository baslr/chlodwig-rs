  var HQH = d((oh6) => {
    var NS4 = uR_(),
      q6H = R3(),
      hS4 = aUH(),
      yS4 = eUH();
    function VS4(H, _) {
      let q = Object.assign(
          {
            blockQuote: !0,
            commentString: hS4.stringifyComment,
            defaultKeyType: null,
            defaultStringType: "PLAIN",
            directives: null,
            doubleQuotedAsJSON: !1,
            doubleQuotedMinMultiLineLength: 40,
            falseStr: "false",
            flowCollectionPadding: !0,
            indentSeq: !0,
            lineWidth: 80,
            minContentWidth: 20,
            nullStr: "null",
            simpleKeys: !1,
            singleQuote: null,
            trueStr: "true",
            verifyAliasOrder: !0,
          },
          H.schema.toStringOptions,
          _,
        ),
        $;
      switch (q.collectionStyle) {
        case "block":
          $ = !1;
          break;
        case "flow":
          $ = !0;
          break;
        default:
          $ = null;
      }
      return {
        anchors: new Set(),
        doc: H,
        flowCollectionPadding: q.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof q.indent === "number" ? " ".repeat(q.indent) : "  ",
        inFlow: $,
        options: q,
      };
    }
    function SS4(H, _) {
      if (_.tag) {
        let K = H.filter((O) => O.tag === _.tag);
        if (K.length > 0) return K.find((O) => O.format === _.format) ?? K[0];
      }
      let q = void 0,
        $;
      if (q6H.isScalar(_)) {
        $ = _.value;
        let K = H.filter((O) => O.identify?.($));
        if (K.length > 1) {
          let O = K.filter((T) => T.test);
          if (O.length > 0) K = O;
        }
        q = K.find((O) => O.format === _.format) ?? K.find((O) => !O.format);
      } else ($ = _), (q = H.find((K) => K.nodeClass && $ instanceof K.nodeClass));
      if (!q) {
        let K = $?.constructor?.name ?? ($ === null ? "null" : typeof $);
        throw Error(`Tag not resolved for ${K} value`);
      }
      return q;
    }
    function ES4(H, _, { anchors: q, doc: $ }) {
      if (!$.directives) return "";
      let K = [],
        O = (q6H.isScalar(H) || q6H.isCollection(H)) && H.anchor;
      if (O && NS4.anchorIsValid(O)) q.add(O), K.push(`&${O}`);
      let T = H.tag ?? (_.default ? null : _.tag);
      if (T) K.push($.directives.tagString(T));
      return K.join(" ");
    }
    function CS4(H, _, q, $) {
      if (q6H.isPair(H)) return H.toString(_, q, $);
      if (q6H.isAlias(H)) {
        if (_.doc.directives) return H.toString(_);
        if (_.resolvedAliases?.has(H)) throw TypeError("Cannot stringify circular structure without alias nodes");
        else {
          if (_.resolvedAliases) _.resolvedAliases.add(H);
          else _.resolvedAliases = new Set([H]);
          H = H.resolve(_.doc);
        }
      }
      let K = void 0,
        O = q6H.isNode(H) ? H : _.doc.createNode(H, { onTagObj: (A) => (K = A) });
      K ?? (K = SS4(_.doc.schema.tags, O));
      let T = ES4(O, K, _);
      if (T.length > 0) _.indentAtStart = (_.indentAtStart ?? 0) + T.length + 1;
      let z =
        typeof K.stringify === "function"
          ? K.stringify(O, _, q, $)
          : q6H.isScalar(O)
            ? yS4.stringifyString(O, _, q, $)
            : O.toString(_, q, $);
      if (!T) return z;
      return q6H.isScalar(O) || z[0] === "{" || z[0] === "["
        ? `${T} ${z}`
        : `${T}
${_.indent}${z}`;
    }
    oh6.createStringifyContext = VS4;
    oh6.stringify = CS4;
  });

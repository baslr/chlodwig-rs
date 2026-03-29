  var b27 = d((dqO, C27) => {
    var V27 = [
        "as",
        "in",
        "of",
        "if",
        "for",
        "while",
        "finally",
        "var",
        "new",
        "function",
        "do",
        "return",
        "void",
        "else",
        "break",
        "catch",
        "instanceof",
        "with",
        "throw",
        "case",
        "default",
        "try",
        "switch",
        "continue",
        "typeof",
        "delete",
        "let",
        "yield",
        "const",
        "class",
        "debugger",
        "async",
        "await",
        "static",
        "import",
        "from",
        "export",
        "extends",
      ],
      S27 = ["true", "false", "null", "undefined", "NaN", "Infinity"],
      Oq1 = [
        "Intl",
        "DataView",
        "Number",
        "Math",
        "Date",
        "String",
        "RegExp",
        "Object",
        "Function",
        "Boolean",
        "Error",
        "Symbol",
        "Set",
        "Map",
        "WeakSet",
        "WeakMap",
        "Proxy",
        "Reflect",
        "JSON",
        "Promise",
        "Float64Array",
        "Int16Array",
        "Int32Array",
        "Int8Array",
        "Uint16Array",
        "Uint32Array",
        "Float32Array",
        "Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "ArrayBuffer",
        "BigInt64Array",
        "BigUint64Array",
        "BigInt",
      ],
      Tq1 = ["EvalError", "InternalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"],
      zq1 = [
        "setInterval",
        "setTimeout",
        "clearInterval",
        "clearTimeout",
        "require",
        "exports",
        "eval",
        "isFinite",
        "isNaN",
        "parseFloat",
        "parseInt",
        "decodeURI",
        "decodeURIComponent",
        "encodeURI",
        "encodeURIComponent",
        "escape",
        "unescape",
      ],
      Aq1 = ["arguments", "this", "super", "console", "window", "document", "localStorage", "module", "global"],
      E27 = [].concat(zq1, Aq1, Oq1, Tq1);
    function fq1(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function y27(H) {
      return Xu6("(?=", H, ")");
    }
    function Xu6(...H) {
      return H.map((q) => fq1(q)).join("");
    }
    function wq1(H) {
      let _ = (Z, { after: k }) => {
          let v = "</" + Z[0].slice(1);
          return Z.input.indexOf(v, k) !== -1;
        },
        q = "[A-Za-z$_][0-9A-Za-z$_]*",
        $ = { begin: "<>", end: "</>" },
        K = {
          begin: /<[A-Za-z0-9\\._:-]+/,
          end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
          isTrulyOpeningTag: (Z, k) => {
            let v = Z[0].length + Z.index,
              y = Z.input[v];
            if (y === "<") {
              k.ignoreMatch();
              return;
            }
            if (y === ">") {
              if (!_(Z, { after: v })) k.ignoreMatch();
            }
          },
        },
        O = { $pattern: "[A-Za-z$_][0-9A-Za-z$_]*", keyword: V27, literal: S27, built_in: E27 },
        T = "[0-9](_?[0-9])*",
        z = "\\.([0-9](_?[0-9])*)",
        A = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",
        f = {
          className: "number",
          variants: [
            {
              begin:
                "(\\b(0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*)((\\.([0-9](_?[0-9])*))|\\.)?|(\\.([0-9](_?[0-9])*)))[eE][+-]?([0-9](_?[0-9])*)\\b",
            },
            {
              begin:
                "\\b(0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*)\\b((\\.([0-9](_?[0-9])*))\\b|\\.)?|(\\.([0-9](_?[0-9])*))\\b",
            },
            { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
            { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
            { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
            { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
            { begin: "\\b0[0-7]+n?\\b" },
          ],
          relevance: 0,
        },
        w = { className: "subst", begin: "\\$\\{", end: "\\}", keywords: O, contains: [] },
        Y = {
          begin: "html`",
          end: "",
          starts: { end: "`", returnEnd: !1, contains: [H.BACKSLASH_ESCAPE, w], subLanguage: "xml" },
        },
        D = {
          begin: "css`",
          end: "",
          starts: { end: "`", returnEnd: !1, contains: [H.BACKSLASH_ESCAPE, w], subLanguage: "css" },
        },
        j = { className: "string", begin: "`", end: "`", contains: [H.BACKSLASH_ESCAPE, w] },
        J = {
          className: "comment",
          variants: [
            H.COMMENT(/\/\*\*(?!\/)/, "\\*/", {
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+",
                  contains: [
                    { className: "type", begin: "\\{", end: "\\}", relevance: 0 },
                    {
                      className: "variable",
                      begin: "[A-Za-z$_][0-9A-Za-z$_]*(?=\\s*(-)|$)",
                      endsParent: !0,
                      relevance: 0,
                    },
                    { begin: /(?=[^\n])\s/, relevance: 0 },
                  ],
                },
              ],
            }),
            H.C_BLOCK_COMMENT_MODE,
            H.C_LINE_COMMENT_MODE,
          ],
        },
        P = [H.APOS_STRING_MODE, H.QUOTE_STRING_MODE, Y, D, j, f, H.REGEXP_MODE];
      w.contains = P.concat({ begin: /\{/, end: /\}/, keywords: O, contains: ["self"].concat(P) });
      let X = [].concat(J, w.contains),
        R = X.concat([{ begin: /\(/, end: /\)/, keywords: O, contains: ["self"].concat(X) }]),
        W = { className: "params", begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0, keywords: O, contains: R };
      return {
        name: "Javascript",
        aliases: ["js", "jsx", "mjs", "cjs"],
        keywords: O,
        exports: { PARAMS_CONTAINS: R },
        illegal: /#(?![$_A-z])/,
        contains: [
          H.SHEBANG({ label: "shebang", binary: "node", relevance: 5 }),
          { label: "use_strict", className: "meta", relevance: 10, begin: /^\s*['"]use (strict|asm)['"]/ },
          H.APOS_STRING_MODE,
          H.QUOTE_STRING_MODE,
          Y,
          D,
          j,
          J,
          f,
          {
            begin: Xu6(
              /[{,\n]\s*/,
              y27(Xu6(/(((\/\/.*$)|(\/\*(\*[^/]|[^*])*\*\/))\s*)*/, "[A-Za-z$_][0-9A-Za-z$_]*\\s*:")),
            ),
            relevance: 0,
            contains: [{ className: "attr", begin: "[A-Za-z$_][0-9A-Za-z$_]*" + y27("\\s*:"), relevance: 0 }],
          },
          {
            begin: "(" + H.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
            keywords: "return throw case",
            contains: [
              J,
              H.REGEXP_MODE,
              {
                className: "function",
                begin: "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + H.UNDERSCORE_IDENT_RE + ")\\s*=>",
                returnBegin: !0,
                end: "\\s*=>",
                contains: [
                  {
                    className: "params",
                    variants: [
                      { begin: H.UNDERSCORE_IDENT_RE, relevance: 0 },
                      { className: null, begin: /\(\s*\)/, skip: !0 },
                      { begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0, keywords: O, contains: R },
                    ],
                  },
                ],
              },
              { begin: /,/, relevance: 0 },
              { className: "", begin: /\s/, end: /\s*/, skip: !0 },
              {
                variants: [
                  { begin: $.begin, end: $.end },
                  { begin: K.begin, "on:begin": K.isTrulyOpeningTag, end: K.end },
                ],
                subLanguage: "xml",
                contains: [{ begin: K.begin, end: K.end, skip: !0, contains: ["self"] }],
              },
            ],
            relevance: 0,
          },
          {
            className: "function",
            beginKeywords: "function",
            end: /[{;]/,
            excludeEnd: !0,
            keywords: O,
            contains: ["self", H.inherit(H.TITLE_MODE, { begin: "[A-Za-z$_][0-9A-Za-z$_]*" }), W],
            illegal: /%/,
          },
          { beginKeywords: "while if switch catch for" },
          {
            className: "function",
            begin: H.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
            returnBegin: !0,
            contains: [W, H.inherit(H.TITLE_MODE, { begin: "[A-Za-z$_][0-9A-Za-z$_]*" })],
          },
          {
            variants: [{ begin: "\\.[A-Za-z$_][0-9A-Za-z$_]*" }, { begin: "\\$[A-Za-z$_][0-9A-Za-z$_]*" }],
            relevance: 0,
          },
          {
            className: "class",
            beginKeywords: "class",
            end: /[{;=]/,
            excludeEnd: !0,
            illegal: /[:"[\]]/,
            contains: [{ beginKeywords: "extends" }, H.UNDERSCORE_TITLE_MODE],
          },
          {
            begin: /\b(?=constructor)/,
            end: /[{;]/,
            excludeEnd: !0,
            contains: [H.inherit(H.TITLE_MODE, { begin: "[A-Za-z$_][0-9A-Za-z$_]*" }), "self", W],
          },
          {
            begin: "(get|set)\\s+(?=[A-Za-z$_][0-9A-Za-z$_]*\\()",
            end: /\{/,
            keywords: "get set",
            contains: [H.inherit(H.TITLE_MODE, { begin: "[A-Za-z$_][0-9A-Za-z$_]*" }), { begin: /\(\)/ }, W],
          },
          { begin: /\$[(.]/ },
        ],
      };
    }
    function Yq1(H) {
      let q = { beginKeywords: "namespace", end: /\{/, excludeEnd: !0 },
        $ = { beginKeywords: "interface", end: /\{/, excludeEnd: !0, keywords: "interface extends" },
        K = { className: "meta", relevance: 10, begin: /^\s*['"]use strict['"]/ },
        O = ["any", "void", "number", "boolean", "string", "object", "never", "enum"],
        T = [
          "type",
          "namespace",
          "typedef",
          "interface",
          "public",
          "private",
          "protected",
          "implements",
          "declare",
          "abstract",
          "readonly",
        ],
        z = { $pattern: "[A-Za-z$_][0-9A-Za-z$_]*", keyword: V27.concat(T), literal: S27, built_in: E27.concat(O) },
        A = { className: "meta", begin: "@[A-Za-z$_][0-9A-Za-z$_]*" },
        f = (D, j, M) => {
          let J = D.contains.findIndex((P) => P.label === j);
          if (J === -1) throw Error("can not find mode to replace");
          D.contains.splice(J, 1, M);
        },
        w = wq1(H);
      Object.assign(w.keywords, z),
        w.exports.PARAMS_CONTAINS.push(A),
        (w.contains = w.contains.concat([A, q, $])),
        f(w, "shebang", H.SHEBANG()),
        f(w, "use_strict", K);
      let Y = w.contains.find((D) => D.className === "function");
      return (Y.relevance = 0), Object.assign(w, { name: "TypeScript", aliases: ["ts", "tsx"] }), w;
    }
    C27.exports = Yq1;
  });

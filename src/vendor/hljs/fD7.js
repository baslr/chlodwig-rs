  var fD7 = d((AqO, AD7) => {
    function z81(H) {
      function _(k) {
        return k
          .map(function (v) {
            return v
              .split("")
              .map(function (y) {
                return "\\" + y;
              })
              .join("");
          })
          .join("|");
      }
      let q = "~?[a-z$_][0-9a-zA-Z$_]*",
        $ = "`?[A-Z$_][0-9a-zA-Z$_]*",
        K = "'?[a-z$_][0-9a-z$_]*",
        O = "\\s*:\\s*[a-z$_][0-9a-z$_]*(\\(\\s*(" + K + "\\s*(," + K + "\\s*)*)?\\))?",
        T = q + "(" + O + "){0,2}",
        z = "(" + _(["||", "++", "**", "+.", "*", "/", "*.", "/.", "..."]) + "|\\|>|&&|==|===)",
        A = "\\s+" + z + "\\s+",
        f = {
          keyword:
            "and as asr assert begin class constraint do done downto else end exception external for fun function functor if in include inherit initializer land lazy let lor lsl lsr lxor match method mod module mutable new nonrec object of open or private rec sig struct then to try type val virtual when while with",
          built_in: "array bool bytes char exn|5 float int int32 int64 list lazy_t|5 nativeint|5 ref string unit ",
          literal: "true false",
        },
        w =
          "\\b(0[xX][a-fA-F0-9_]+[Lln]?|0[oO][0-7_]+[Lln]?|0[bB][01_]+[Lln]?|[0-9][0-9_]*([Lln]|(\\.[0-9_]*)?([eE][-+]?[0-9_]+)?)?)",
        Y = { className: "number", relevance: 0, variants: [{ begin: w }, { begin: "\\(-" + w + "\\)" }] },
        D = { className: "operator", relevance: 0, begin: z },
        j = [{ className: "identifier", relevance: 0, begin: q }, D, Y],
        M = [
          H.QUOTE_STRING_MODE,
          D,
          {
            className: "module",
            begin: "\\b" + $,
            returnBegin: !0,
            end: ".",
            contains: [{ className: "identifier", begin: $, relevance: 0 }],
          },
        ],
        J = [
          {
            className: "module",
            begin: "\\b" + $,
            returnBegin: !0,
            end: ".",
            relevance: 0,
            contains: [{ className: "identifier", begin: $, relevance: 0 }],
          },
        ],
        P = {
          begin: q,
          end: "(,|\\n|\\))",
          relevance: 0,
          contains: [
            D,
            { className: "typing", begin: ":", end: "(,|\\n)", returnBegin: !0, relevance: 0, contains: J },
          ],
        },
        X = {
          className: "function",
          relevance: 0,
          keywords: f,
          variants: [
            {
              begin: "\\s(\\(\\.?.*?\\)|" + q + ")\\s*=>",
              end: "\\s*=>",
              returnBegin: !0,
              relevance: 0,
              contains: [{ className: "params", variants: [{ begin: q }, { begin: T }, { begin: /\(\s*\)/ }] }],
            },
            {
              begin: "\\s\\(\\.?[^;\\|]*\\)\\s*=>",
              end: "\\s=>",
              returnBegin: !0,
              relevance: 0,
              contains: [{ className: "params", relevance: 0, variants: [P] }],
            },
            { begin: "\\(\\.\\s" + q + "\\)\\s*=>" },
          ],
        };
      M.push(X);
      let R = {
          className: "constructor",
          begin: $ + "\\(",
          end: "\\)",
          illegal: "\\n",
          keywords: f,
          contains: [H.QUOTE_STRING_MODE, D, { className: "params", begin: "\\b" + q }],
        },
        W = {
          className: "pattern-match",
          begin: "\\|",
          returnBegin: !0,
          keywords: f,
          end: "=>",
          relevance: 0,
          contains: [R, D, { relevance: 0, className: "constructor", begin: $ }],
        },
        Z = {
          className: "module-access",
          keywords: f,
          returnBegin: !0,
          variants: [
            { begin: "\\b(" + $ + "\\.)+" + q },
            {
              begin: "\\b(" + $ + "\\.)+\\(",
              end: "\\)",
              returnBegin: !0,
              contains: [X, { begin: "\\(", end: "\\)", skip: !0 }].concat(M),
            },
            { begin: "\\b(" + $ + "\\.)+\\{", end: /\}/ },
          ],
          contains: M,
        };
      return (
        J.push(Z),
        {
          name: "ReasonML",
          aliases: ["re"],
          keywords: f,
          illegal: "(:-|:=|\\$\\{|\\+=)",
          contains: [
            H.COMMENT("/\\*", "\\*/", { illegal: "^(#,\\/\\/)" }),
            { className: "character", begin: "'(\\\\[^']+|[^'])'", illegal: "\\n", relevance: 0 },
            H.QUOTE_STRING_MODE,
            { className: "literal", begin: "\\(\\)", relevance: 0 },
            { className: "literal", begin: "\\[\\|", end: "\\|\\]", relevance: 0, contains: j },
            { className: "literal", begin: "\\[", end: "\\]", relevance: 0, contains: j },
            R,
            { className: "operator", begin: A, illegal: "-->", relevance: 0 },
            Y,
            H.C_LINE_COMMENT_MODE,
            W,
            X,
            {
              className: "module-def",
              begin: "\\bmodule\\s+" + q + "\\s+" + $ + "\\s+=\\s+\\{",
              end: /\}/,
              returnBegin: !0,
              keywords: f,
              relevance: 0,
              contains: [
                { className: "module", relevance: 0, begin: $ },
                { begin: /\{/, end: /\}/, skip: !0 },
              ].concat(M),
            },
            Z,
          ],
        }
      );
    }
    AD7.exports = z81;
  });

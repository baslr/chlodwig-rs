  var qw7 = d((A8O, _w7) => {
    var yZH = "[0-9](_*[0-9])*",
      ZN_ = `\\.(${yZH})`,
      LN_ = "[0-9a-fA-F](_*[0-9a-fA-F])*",
      p_1 = {
        className: "number",
        variants: [
          { begin: `(\\b(${yZH})((${ZN_})|\\.)?|(${ZN_}))[eE][+-]?(${yZH})[fFdD]?\\b` },
          { begin: `\\b(${yZH})((${ZN_})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${ZN_})[fFdD]?\\b` },
          { begin: `\\b(${yZH})[fFdD]\\b` },
          { begin: `\\b0[xX]((${LN_})\\.?|(${LN_})?\\.(${LN_}))[pP][+-]?(${yZH})[fFdD]?\\b` },
          { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
          { begin: `\\b0[xX](${LN_})[lL]?\\b` },
          { begin: "\\b0(_*[0-7])*[lL]?\\b" },
          { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" },
        ],
        relevance: 0,
      };
    function B_1(H) {
      let _ = {
          keyword:
            "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
          built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
          literal: "true false null",
        },
        q = {
          className: "keyword",
          begin: /\b(break|continue|return|this)\b/,
          starts: { contains: [{ className: "symbol", begin: /@\w+/ }] },
        },
        $ = { className: "symbol", begin: H.UNDERSCORE_IDENT_RE + "@" },
        K = { className: "subst", begin: /\$\{/, end: /\}/, contains: [H.C_NUMBER_MODE] },
        O = { className: "variable", begin: "\\$" + H.UNDERSCORE_IDENT_RE },
        T = {
          className: "string",
          variants: [
            { begin: '"""', end: '"""(?=[^"])', contains: [O, K] },
            { begin: "'", end: "'", illegal: /\n/, contains: [H.BACKSLASH_ESCAPE] },
            { begin: '"', end: '"', illegal: /\n/, contains: [H.BACKSLASH_ESCAPE, O, K] },
          ],
        };
      K.contains.push(T);
      let z = {
          className: "meta",
          begin:
            "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" +
            H.UNDERSCORE_IDENT_RE +
            ")?",
        },
        A = {
          className: "meta",
          begin: "@" + H.UNDERSCORE_IDENT_RE,
          contains: [{ begin: /\(/, end: /\)/, contains: [H.inherit(T, { className: "meta-string" })] }],
        },
        f = p_1,
        w = H.COMMENT("/\\*", "\\*/", { contains: [H.C_BLOCK_COMMENT_MODE] }),
        Y = {
          variants: [
            { className: "type", begin: H.UNDERSCORE_IDENT_RE },
            { begin: /\(/, end: /\)/, contains: [] },
          ],
        },
        D = Y;
      return (
        (D.variants[1].contains = [Y]),
        (Y.variants[1].contains = [D]),
        {
          name: "Kotlin",
          aliases: ["kt", "kts"],
          keywords: _,
          contains: [
            H.COMMENT("/\\*\\*", "\\*/", { relevance: 0, contains: [{ className: "doctag", begin: "@[A-Za-z]+" }] }),
            H.C_LINE_COMMENT_MODE,
            w,
            q,
            $,
            z,
            A,
            {
              className: "function",
              beginKeywords: "fun",
              end: "[(]|$",
              returnBegin: !0,
              excludeEnd: !0,
              keywords: _,
              relevance: 5,
              contains: [
                {
                  begin: H.UNDERSCORE_IDENT_RE + "\\s*\\(",
                  returnBegin: !0,
                  relevance: 0,
                  contains: [H.UNDERSCORE_TITLE_MODE],
                },
                { className: "type", begin: /</, end: />/, keywords: "reified", relevance: 0 },
                {
                  className: "params",
                  begin: /\(/,
                  end: /\)/,
                  endsParent: !0,
                  keywords: _,
                  relevance: 0,
                  contains: [
                    {
                      begin: /:/,
                      end: /[=,\/]/,
                      endsWithParent: !0,
                      contains: [Y, H.C_LINE_COMMENT_MODE, w],
                      relevance: 0,
                    },
                    H.C_LINE_COMMENT_MODE,
                    w,
                    z,
                    A,
                    T,
                    H.C_NUMBER_MODE,
                  ],
                },
                w,
              ],
            },
            {
              className: "class",
              beginKeywords: "class interface trait",
              end: /[:\{(]|$/,
              excludeEnd: !0,
              illegal: "extends implements",
              contains: [
                { beginKeywords: "public protected internal private constructor" },
                H.UNDERSCORE_TITLE_MODE,
                { className: "type", begin: /</, end: />/, excludeBegin: !0, excludeEnd: !0, relevance: 0 },
                { className: "type", begin: /[,:]\s*/, end: /[<\(,]|$/, excludeBegin: !0, returnEnd: !0 },
                z,
                A,
              ],
            },
            T,
            {
              className: "meta",
              begin: "^#!/usr/bin/env",
              end: "$",
              illegal: `
`,
            },
            f,
          ],
        }
      );
    }
    _w7.exports = B_1;
  });

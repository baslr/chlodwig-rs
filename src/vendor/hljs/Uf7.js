  var Uf7 = d((q8O, Ff7) => {
    var hZH = "[0-9](_*[0-9])*",
      GN_ = `\\.(${hZH})`,
      RN_ = "[0-9a-fA-F](_*[0-9a-fA-F])*",
      L_1 = {
        className: "number",
        variants: [
          { begin: `(\\b(${hZH})((${GN_})|\\.)?|(${GN_}))[eE][+-]?(${hZH})[fFdD]?\\b` },
          { begin: `\\b(${hZH})((${GN_})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${GN_})[fFdD]?\\b` },
          { begin: `\\b(${hZH})[fFdD]\\b` },
          { begin: `\\b0[xX]((${RN_})\\.?|(${RN_})?\\.(${RN_}))[pP][+-]?(${hZH})[fFdD]?\\b` },
          { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
          { begin: `\\b0[xX](${RN_})[lL]?\\b` },
          { begin: "\\b0(_*[0-7])*[lL]?\\b" },
          { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" },
        ],
        relevance: 0,
      };
    function k_1(H) {
      var _ = "[\xC0-\u02B8a-zA-Z_$][\xC0-\u02B8a-zA-Z_$0-9]*",
        q = _ + "(<" + _ + "(\\s*,\\s*" + _ + ")*>)?",
        $ =
          "false synchronized int abstract float private char boolean var static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports do",
        K = { className: "meta", begin: "@" + _, contains: [{ begin: /\(/, end: /\)/, contains: ["self"] }] };
      let O = L_1;
      return {
        name: "Java",
        aliases: ["jsp"],
        keywords: $,
        illegal: /<\/|#/,
        contains: [
          H.COMMENT("/\\*\\*", "\\*/", {
            relevance: 0,
            contains: [
              { begin: /\w+@/, relevance: 0 },
              { className: "doctag", begin: "@[A-Za-z]+" },
            ],
          }),
          { begin: /import java\.[a-z]+\./, keywords: "import", relevance: 2 },
          H.C_LINE_COMMENT_MODE,
          H.C_BLOCK_COMMENT_MODE,
          H.APOS_STRING_MODE,
          H.QUOTE_STRING_MODE,
          {
            className: "class",
            beginKeywords: "class interface enum",
            end: /[{;=]/,
            excludeEnd: !0,
            relevance: 1,
            keywords: "class interface enum",
            illegal: /[:"\[\]]/,
            contains: [{ beginKeywords: "extends implements" }, H.UNDERSCORE_TITLE_MODE],
          },
          { beginKeywords: "new throw return else", relevance: 0 },
          {
            className: "class",
            begin: "record\\s+" + H.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: !0,
            excludeEnd: !0,
            end: /[{;=]/,
            keywords: $,
            contains: [
              { beginKeywords: "record" },
              {
                begin: H.UNDERSCORE_IDENT_RE + "\\s*\\(",
                returnBegin: !0,
                relevance: 0,
                contains: [H.UNDERSCORE_TITLE_MODE],
              },
              {
                className: "params",
                begin: /\(/,
                end: /\)/,
                keywords: $,
                relevance: 0,
                contains: [H.C_BLOCK_COMMENT_MODE],
              },
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
            ],
          },
          {
            className: "function",
            begin: "(" + q + "\\s+)+" + H.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: !0,
            end: /[{;=]/,
            excludeEnd: !0,
            keywords: $,
            contains: [
              {
                begin: H.UNDERSCORE_IDENT_RE + "\\s*\\(",
                returnBegin: !0,
                relevance: 0,
                contains: [H.UNDERSCORE_TITLE_MODE],
              },
              {
                className: "params",
                begin: /\(/,
                end: /\)/,
                keywords: $,
                relevance: 0,
                contains: [K, H.APOS_STRING_MODE, H.QUOTE_STRING_MODE, O, H.C_BLOCK_COMMENT_MODE],
              },
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
            ],
          },
          O,
          K,
        ],
      };
    }
    Ff7.exports = k_1;
  });

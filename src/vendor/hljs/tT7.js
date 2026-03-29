  var tT7 = d((m_O, sT7) => {
    function Te4(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function qu6(...H) {
      return H.map((q) => Te4(q)).join("");
    }
    function ze4(H) {
      let _ =
          "false synchronized int abstract float private char boolean static null if const for true while long throw strictfp finally protected import native final return void enum else extends implements break transient new catch instanceof byte super volatile case assert short package default double public try this switch continue throws privileged aspectOf adviceexecution proceed cflowbelow cflow initialization preinitialization staticinitialization withincode target within execution getWithinTypeName handler thisJoinPoint thisJoinPointStaticPart thisEnclosingJoinPointStaticPart declare parents warning error soft precedence thisAspectInstance",
        q = "get set args call";
      return {
        name: "AspectJ",
        keywords: _,
        illegal: /<\/|#/,
        contains: [
          H.COMMENT(/\/\*\*/, /\*\//, {
            relevance: 0,
            contains: [
              { begin: /\w+@/, relevance: 0 },
              { className: "doctag", begin: /@[A-Za-z]+/ },
            ],
          }),
          H.C_LINE_COMMENT_MODE,
          H.C_BLOCK_COMMENT_MODE,
          H.APOS_STRING_MODE,
          H.QUOTE_STRING_MODE,
          {
            className: "class",
            beginKeywords: "aspect",
            end: /[{;=]/,
            excludeEnd: !0,
            illegal: /[:;"\[\]]/,
            contains: [
              {
                beginKeywords: "extends implements pertypewithin perthis pertarget percflowbelow percflow issingleton",
              },
              H.UNDERSCORE_TITLE_MODE,
              { begin: /\([^\)]*/, end: /[)]+/, keywords: _ + " get set args call", excludeEnd: !1 },
            ],
          },
          {
            className: "class",
            beginKeywords: "class interface",
            end: /[{;=]/,
            excludeEnd: !0,
            relevance: 0,
            keywords: "class interface",
            illegal: /[:"\[\]]/,
            contains: [{ beginKeywords: "extends implements" }, H.UNDERSCORE_TITLE_MODE],
          },
          {
            beginKeywords: "pointcut after before around throwing returning",
            end: /[)]/,
            excludeEnd: !1,
            illegal: /["\[\]]/,
            contains: [
              { begin: qu6(H.UNDERSCORE_IDENT_RE, /\s*\(/), returnBegin: !0, contains: [H.UNDERSCORE_TITLE_MODE] },
            ],
          },
          {
            begin: /[:]/,
            returnBegin: !0,
            end: /[{;]/,
            relevance: 0,
            excludeEnd: !1,
            keywords: _,
            illegal: /["\[\]]/,
            contains: [
              { begin: qu6(H.UNDERSCORE_IDENT_RE, /\s*\(/), keywords: _ + " get set args call", relevance: 0 },
              H.QUOTE_STRING_MODE,
            ],
          },
          { beginKeywords: "new throw", relevance: 0 },
          {
            className: "function",
            begin: /\w+ +\w+(\.\w+)?\s*\([^\)]*\)\s*((throws)[\w\s,]+)?[\{;]/,
            returnBegin: !0,
            end: /[{;=]/,
            keywords: _,
            excludeEnd: !0,
            contains: [
              {
                begin: qu6(H.UNDERSCORE_IDENT_RE, /\s*\(/),
                returnBegin: !0,
                relevance: 0,
                contains: [H.UNDERSCORE_TITLE_MODE],
              },
              {
                className: "params",
                begin: /\(/,
                end: /\)/,
                relevance: 0,
                keywords: _,
                contains: [H.APOS_STRING_MODE, H.QUOTE_STRING_MODE, H.C_NUMBER_MODE, H.C_BLOCK_COMMENT_MODE],
              },
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
            ],
          },
          H.C_NUMBER_MODE,
          { className: "meta", begin: /@[A-Za-z]+/ },
        ],
      };
    }
    sT7.exports = ze4;
  });

  var CA7 = d((N6O, EA7) => {
    function kH1(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function vH1(H) {
      return SA7("(?=", H, ")");
    }
    function SA7(...H) {
      return H.map((q) => kH1(q)).join("");
    }
    function NH1(H) {
      let q = {
          keyword:
            "and then defined module in return redo if BEGIN retry end for self when next until do begin unless END rescue else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor __FILE__",
          built_in: "proc lambda",
          literal: "true false nil",
        },
        $ = { className: "doctag", begin: "@[A-Za-z]+" },
        K = { begin: "#<", end: ">" },
        O = [
          H.COMMENT("#", "$", { contains: [$] }),
          H.COMMENT("^=begin", "^=end", { contains: [$], relevance: 10 }),
          H.COMMENT("^__END__", "\\n$"),
        ],
        T = { className: "subst", begin: /#\{/, end: /\}/, keywords: q },
        z = {
          className: "string",
          contains: [H.BACKSLASH_ESCAPE, T],
          variants: [
            { begin: /'/, end: /'/ },
            { begin: /"/, end: /"/ },
            { begin: /`/, end: /`/ },
            { begin: /%[qQwWx]?\(/, end: /\)/ },
            { begin: /%[qQwWx]?\[/, end: /\]/ },
            { begin: /%[qQwWx]?\{/, end: /\}/ },
            { begin: /%[qQwWx]?</, end: />/ },
            { begin: /%[qQwWx]?\//, end: /\// },
            { begin: /%[qQwWx]?%/, end: /%/ },
            { begin: /%[qQwWx]?-/, end: /-/ },
            { begin: /%[qQwWx]?\|/, end: /\|/ },
            { begin: /\B\?(\\\d{1,3})/ },
            { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
            { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
            { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
            { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
            { begin: /\B\?\\?\S/ },
            {
              begin: /<<[-~]?'?(\w+)\n(?:[^\n]*\n)*?\s*\1\b/,
              returnBegin: !0,
              contains: [
                { begin: /<<[-~]?'?/ },
                H.END_SAME_AS_BEGIN({ begin: /(\w+)/, end: /(\w+)/, contains: [H.BACKSLASH_ESCAPE, T] }),
              ],
            },
          ],
        },
        A = "[1-9](_?[0-9])*|0",
        f = "[0-9](_?[0-9])*",
        w = {
          className: "number",
          relevance: 0,
          variants: [
            { begin: "\\b([1-9](_?[0-9])*|0)(\\.([0-9](_?[0-9])*))?([eE][+-]?([0-9](_?[0-9])*)|r)?i?\\b" },
            { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
            { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
            { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
            { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
            { begin: "\\b0(_?[0-7])+r?i?\\b" },
          ],
        },
        Y = { className: "params", begin: "\\(", end: "\\)", endsParent: !0, keywords: q },
        D = [
          z,
          {
            className: "class",
            beginKeywords: "class module",
            end: "$|;",
            illegal: /=/,
            contains: [
              H.inherit(H.TITLE_MODE, { begin: "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?" }),
              { begin: "<\\s*", contains: [{ begin: "(" + H.IDENT_RE + "::)?" + H.IDENT_RE, relevance: 0 }] },
            ].concat(O),
          },
          {
            className: "function",
            begin: SA7(
              /def\s+/,
              vH1("([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)\\s*(\\(|;|$)"),
            ),
            relevance: 0,
            keywords: "def",
            end: "$|;",
            contains: [
              H.inherit(H.TITLE_MODE, {
                begin: "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)",
              }),
              Y,
            ].concat(O),
          },
          { begin: H.IDENT_RE + "::" },
          { className: "symbol", begin: H.UNDERSCORE_IDENT_RE + "(!|\\?)?:", relevance: 0 },
          {
            className: "symbol",
            begin: ":(?!\\s)",
            contains: [
              z,
              { begin: "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)" },
            ],
            relevance: 0,
          },
          w,
          { className: "variable", begin: "(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])" },
          { className: "params", begin: /\|/, end: /\|/, relevance: 0, keywords: q },
          {
            begin: "(" + H.RE_STARTERS_RE + "|unless)\\s*",
            keywords: "unless",
            contains: [
              {
                className: "regexp",
                contains: [H.BACKSLASH_ESCAPE, T],
                illegal: /\n/,
                variants: [
                  { begin: "/", end: "/[a-z]*" },
                  { begin: /%r\{/, end: /\}[a-z]*/ },
                  { begin: "%r\\(", end: "\\)[a-z]*" },
                  { begin: "%r!", end: "![a-z]*" },
                  { begin: "%r\\[", end: "\\][a-z]*" },
                ],
              },
            ].concat(K, O),
            relevance: 0,
          },
        ].concat(K, O);
      (T.contains = D), (Y.contains = D);
      let j = "[>?]>",
        M = "[\\w#]+\\(\\w+\\):\\d+:\\d+>",
        J = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>",
        P = [
          { begin: /^\s*=>/, starts: { end: "$", contains: D } },
          { className: "meta", begin: "^(" + j + "|" + M + "|" + J + ")(?=[ ])", starts: { end: "$", contains: D } },
        ];
      return (
        O.unshift(K),
        {
          name: "Ruby",
          aliases: ["rb", "gemspec", "podspec", "thor", "irb"],
          keywords: q,
          illegal: /\/\*/,
          contains: [H.SHEBANG({ binary: "ruby" })].concat(P).concat(O).concat(D),
        }
      );
    }
    EA7.exports = NH1;
  });

  var hA7 = d((k6O, NA7) => {
    function ZH1(H) {
      let $ = {
          $pattern: "[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?",
          keyword:
            "and false then defined module in return redo retry end for true self when next until do begin unless nil break not case cond alias while ensure or include use alias fn quote require import with|0",
        },
        K = { className: "subst", begin: /#\{/, end: /\}/, keywords: $ },
        O = {
          className: "number",
          begin: "(\\b0o[0-7_]+)|(\\b0b[01_]+)|(\\b0x[0-9a-fA-F_]+)|(-?\\b[1-9][0-9_]*(\\.[0-9_]+([eE][-+]?[0-9]+)?)?)",
          relevance: 0,
        },
        T = `[/|([{<"']`,
        z = {
          className: "string",
          begin: `~[a-z](?=[/|([{<"'])`,
          contains: [
            {
              endsParent: !0,
              contains: [
                {
                  contains: [H.BACKSLASH_ESCAPE, K],
                  variants: [
                    { begin: /"/, end: /"/ },
                    { begin: /'/, end: /'/ },
                    { begin: /\//, end: /\// },
                    { begin: /\|/, end: /\|/ },
                    { begin: /\(/, end: /\)/ },
                    { begin: /\[/, end: /\]/ },
                    { begin: /\{/, end: /\}/ },
                    { begin: /</, end: />/ },
                  ],
                },
              ],
            },
          ],
        },
        A = {
          className: "string",
          begin: `~[A-Z](?=[/|([{<"'])`,
          contains: [
            { begin: /"/, end: /"/ },
            { begin: /'/, end: /'/ },
            { begin: /\//, end: /\// },
            { begin: /\|/, end: /\|/ },
            { begin: /\(/, end: /\)/ },
            { begin: /\[/, end: /\]/ },
            { begin: /\{/, end: /\}/ },
            { begin: /</, end: />/ },
          ],
        },
        f = {
          className: "string",
          contains: [H.BACKSLASH_ESCAPE, K],
          variants: [
            { begin: /"""/, end: /"""/ },
            { begin: /'''/, end: /'''/ },
            { begin: /~S"""/, end: /"""/, contains: [] },
            { begin: /~S"/, end: /"/, contains: [] },
            { begin: /~S'''/, end: /'''/, contains: [] },
            { begin: /~S'/, end: /'/, contains: [] },
            { begin: /'/, end: /'/ },
            { begin: /"/, end: /"/ },
          ],
        },
        w = {
          className: "function",
          beginKeywords: "def defp defmacro",
          end: /\B\b/,
          contains: [H.inherit(H.TITLE_MODE, { begin: "[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?", endsParent: !0 })],
        },
        Y = H.inherit(w, {
          className: "class",
          beginKeywords: "defimpl defmodule defprotocol defrecord",
          end: /\bdo\b|$|;/,
        }),
        D = [
          f,
          A,
          z,
          H.HASH_COMMENT_MODE,
          Y,
          w,
          { begin: "::" },
          {
            className: "symbol",
            begin: ":(?![\\s:])",
            contains: [
              f,
              { begin: "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?" },
            ],
            relevance: 0,
          },
          { className: "symbol", begin: "[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?:(?!:)", relevance: 0 },
          O,
          { className: "variable", begin: "(\\$\\W)|((\\$|@@?)(\\w+))" },
          { begin: "->" },
          {
            begin: "(" + H.RE_STARTERS_RE + ")\\s*",
            contains: [
              H.HASH_COMMENT_MODE,
              { begin: /\/: (?=\d+\s*[,\]])/, relevance: 0, contains: [O] },
              {
                className: "regexp",
                illegal: "\\n",
                contains: [H.BACKSLASH_ESCAPE, K],
                variants: [
                  { begin: "/", end: "/[a-z]*" },
                  { begin: "%r\\[", end: "\\][a-z]*" },
                ],
              },
            ],
            relevance: 0,
          },
        ];
      return (K.contains = D), { name: "Elixir", keywords: $, contains: D };
    }
    NA7.exports = ZH1;
  });

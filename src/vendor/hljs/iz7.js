  var iz7 = d((T6O, lz7) => {
    function ne4(H) {
      let T = {
          $pattern: "[a-zA-Z_]\\w*[!?=]?",
          keyword:
            "abstract alias annotation as as? asm begin break case class def do else elsif end ensure enum extend for fun if include instance_sizeof is_a? lib macro module next nil? of out pointerof private protected rescue responds_to? return require select self sizeof struct super then type typeof union uninitialized unless until verbatim when while with yield __DIR__ __END_LINE__ __FILE__ __LINE__",
          literal: "false nil true",
        },
        z = { className: "subst", begin: /#\{/, end: /\}/, keywords: T },
        A = {
          className: "template-variable",
          variants: [
            { begin: "\\{\\{", end: "\\}\\}" },
            { begin: "\\{%", end: "%\\}" },
          ],
          keywords: T,
        };
      function f(P, X) {
        let R = [{ begin: P, end: X }];
        return (R[0].contains = R), R;
      }
      let w = {
          className: "string",
          contains: [H.BACKSLASH_ESCAPE, z],
          variants: [
            { begin: /'/, end: /'/ },
            { begin: /"/, end: /"/ },
            { begin: /`/, end: /`/ },
            { begin: "%[Qwi]?\\(", end: "\\)", contains: f("\\(", "\\)") },
            { begin: "%[Qwi]?\\[", end: "\\]", contains: f("\\[", "\\]") },
            { begin: "%[Qwi]?\\{", end: /\}/, contains: f(/\{/, /\}/) },
            { begin: "%[Qwi]?<", end: ">", contains: f("<", ">") },
            { begin: "%[Qwi]?\\|", end: "\\|" },
            { begin: /<<-\w+$/, end: /^\s*\w+$/ },
          ],
          relevance: 0,
        },
        Y = {
          className: "string",
          variants: [
            { begin: "%q\\(", end: "\\)", contains: f("\\(", "\\)") },
            { begin: "%q\\[", end: "\\]", contains: f("\\[", "\\]") },
            { begin: "%q\\{", end: /\}/, contains: f(/\{/, /\}/) },
            { begin: "%q<", end: ">", contains: f("<", ">") },
            { begin: "%q\\|", end: "\\|" },
            { begin: /<<-'\w+'$/, end: /^\s*\w+$/ },
          ],
          relevance: 0,
        },
        D = {
          begin: "(?!%\\})(" + H.RE_STARTERS_RE + "|\\n|\\b(case|if|select|unless|until|when|while)\\b)\\s*",
          keywords: "case if select unless until when while",
          contains: [
            {
              className: "regexp",
              contains: [H.BACKSLASH_ESCAPE, z],
              variants: [
                { begin: "//[a-z]*", relevance: 0 },
                { begin: "/(?!\\/)", end: "/[a-z]*" },
              ],
            },
          ],
          relevance: 0,
        },
        j = {
          className: "regexp",
          contains: [H.BACKSLASH_ESCAPE, z],
          variants: [
            { begin: "%r\\(", end: "\\)", contains: f("\\(", "\\)") },
            { begin: "%r\\[", end: "\\]", contains: f("\\[", "\\]") },
            { begin: "%r\\{", end: /\}/, contains: f(/\{/, /\}/) },
            { begin: "%r<", end: ">", contains: f("<", ">") },
            { begin: "%r\\|", end: "\\|" },
          ],
          relevance: 0,
        },
        M = {
          className: "meta",
          begin: "@\\[",
          end: "\\]",
          contains: [H.inherit(H.QUOTE_STRING_MODE, { className: "meta-string" })],
        },
        J = [
          A,
          w,
          Y,
          j,
          D,
          M,
          H.HASH_COMMENT_MODE,
          {
            className: "class",
            beginKeywords: "class module struct",
            end: "$|;",
            illegal: /=/,
            contains: [
              H.HASH_COMMENT_MODE,
              H.inherit(H.TITLE_MODE, { begin: "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?" }),
              { begin: "<" },
            ],
          },
          {
            className: "class",
            beginKeywords: "lib enum union",
            end: "$|;",
            illegal: /=/,
            contains: [H.HASH_COMMENT_MODE, H.inherit(H.TITLE_MODE, { begin: "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?" })],
          },
          {
            beginKeywords: "annotation",
            end: "$|;",
            illegal: /=/,
            contains: [H.HASH_COMMENT_MODE, H.inherit(H.TITLE_MODE, { begin: "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?" })],
            relevance: 2,
          },
          {
            className: "function",
            beginKeywords: "def",
            end: /\B\b/,
            contains: [
              H.inherit(H.TITLE_MODE, {
                begin:
                  "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|[=!]~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~|]|//|//=|&[-+*]=?|&\\*\\*|\\[\\][=?]?",
                endsParent: !0,
              }),
            ],
          },
          {
            className: "function",
            beginKeywords: "fun macro",
            end: /\B\b/,
            contains: [
              H.inherit(H.TITLE_MODE, {
                begin:
                  "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|[=!]~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~|]|//|//=|&[-+*]=?|&\\*\\*|\\[\\][=?]?",
                endsParent: !0,
              }),
            ],
            relevance: 2,
          },
          { className: "symbol", begin: H.UNDERSCORE_IDENT_RE + "(!|\\?)?:", relevance: 0 },
          {
            className: "symbol",
            begin: ":",
            contains: [
              w,
              {
                begin:
                  "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|[=!]~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~|]|//|//=|&[-+*]=?|&\\*\\*|\\[\\][=?]?",
              },
            ],
            relevance: 0,
          },
          {
            className: "number",
            variants: [
              { begin: "\\b0b([01_]+)(_?[ui](8|16|32|64|128))?" },
              { begin: "\\b0o([0-7_]+)(_?[ui](8|16|32|64|128))?" },
              { begin: "\\b0x([A-Fa-f0-9_]+)(_?[ui](8|16|32|64|128))?" },
              { begin: "\\b([1-9][0-9_]*[0-9]|[0-9])(\\.[0-9][0-9_]*)?([eE]_?[-+]?[0-9_]*)?(_?f(32|64))?(?!_)" },
              { begin: "\\b([1-9][0-9_]*|0)(_?[ui](8|16|32|64|128))?" },
            ],
            relevance: 0,
          },
        ];
      return (
        (z.contains = J), (A.contains = J.slice(1)), { name: "Crystal", aliases: ["cr"], keywords: T, contains: J }
      );
    }
    lz7.exports = ne4;
  });

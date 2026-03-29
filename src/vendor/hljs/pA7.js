  var pA7 = d((V6O, mA7) => {
    function EH1(H) {
      let q = "([a-z'][a-zA-Z0-9_']*:[a-z'][a-zA-Z0-9_']*|[a-z'][a-zA-Z0-9_']*)",
        $ = {
          keyword:
            "after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun if let not of orelse|10 query receive rem try when xor",
          literal: "false true",
        },
        K = H.COMMENT("%", "$"),
        O = {
          className: "number",
          begin: "\\b(\\d+(_\\d+)*#[a-fA-F0-9]+(_[a-fA-F0-9]+)*|\\d+(_\\d+)*(\\.\\d+(_\\d+)*)?([eE][-+]?\\d+)?)",
          relevance: 0,
        },
        T = { begin: "fun\\s+[a-z'][a-zA-Z0-9_']*/\\d+" },
        z = {
          begin: q + "\\(",
          end: "\\)",
          returnBegin: !0,
          relevance: 0,
          contains: [
            { begin: q, relevance: 0 },
            { begin: "\\(", end: "\\)", endsWithParent: !0, returnEnd: !0, relevance: 0 },
          ],
        },
        A = { begin: /\{/, end: /\}/, relevance: 0 },
        f = { begin: "\\b_([A-Z][A-Za-z0-9_]*)?", relevance: 0 },
        w = { begin: "[A-Z][a-zA-Z0-9_]*", relevance: 0 },
        Y = {
          begin: "#" + H.UNDERSCORE_IDENT_RE,
          relevance: 0,
          returnBegin: !0,
          contains: [
            { begin: "#" + H.UNDERSCORE_IDENT_RE, relevance: 0 },
            { begin: /\{/, end: /\}/, relevance: 0 },
          ],
        },
        D = { beginKeywords: "fun receive if try case", end: "end", keywords: $ };
      D.contains = [K, T, H.inherit(H.APOS_STRING_MODE, { className: "" }), D, z, H.QUOTE_STRING_MODE, O, A, f, w, Y];
      let j = [K, T, D, z, H.QUOTE_STRING_MODE, O, A, f, w, Y];
      (z.contains[1].contains = j), (A.contains = j), (Y.contains[1].contains = j);
      let M = [
          "-module",
          "-record",
          "-undef",
          "-export",
          "-ifdef",
          "-ifndef",
          "-author",
          "-copyright",
          "-doc",
          "-vsn",
          "-import",
          "-include",
          "-include_lib",
          "-compile",
          "-define",
          "-else",
          "-endif",
          "-file",
          "-behaviour",
          "-behavior",
          "-spec",
        ],
        J = { className: "params", begin: "\\(", end: "\\)", contains: j };
      return {
        name: "Erlang",
        aliases: ["erl"],
        keywords: $,
        illegal: "(</|\\*=|\\+=|-=|/\\*|\\*/|\\(\\*|\\*\\))",
        contains: [
          {
            className: "function",
            begin: "^[a-z'][a-zA-Z0-9_']*\\s*\\(",
            end: "->",
            returnBegin: !0,
            illegal: "\\(|#|//|/\\*|\\\\|:|;",
            contains: [J, H.inherit(H.TITLE_MODE, { begin: "[a-z'][a-zA-Z0-9_']*" })],
            starts: { end: ";|\\.", keywords: $, contains: j },
          },
          K,
          {
            begin: "^-",
            end: "\\.",
            relevance: 0,
            excludeEnd: !0,
            returnBegin: !0,
            keywords: { $pattern: "-" + H.IDENT_RE, keyword: M.map((P) => `${P}|1.5`).join(" ") },
            contains: [J],
          },
          O,
          H.QUOTE_STRING_MODE,
          Y,
          f,
          w,
          A,
          { begin: /\.$/ },
        ],
      };
    }
    mA7.exports = EH1;
  });

  var Tw7 = d((w8O, Ow7) => {
    function d_1(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function c_1(...H) {
      return "(" + H.map((q) => d_1(q)).join("|") + ")";
    }
    function F_1(H) {
      let _ = c_1(
          ...[
            "(?:NeedsTeXFormat|RequirePackage|GetIdInfo)",
            "Provides(?:Expl)?(?:Package|Class|File)",
            "(?:DeclareOption|ProcessOptions)",
            "(?:documentclass|usepackage|input|include)",
            "makeat(?:letter|other)",
            "ExplSyntax(?:On|Off)",
            "(?:new|renew|provide)?command",
            "(?:re)newenvironment",
            "(?:New|Renew|Provide|Declare)(?:Expandable)?DocumentCommand",
            "(?:New|Renew|Provide|Declare)DocumentEnvironment",
            "(?:(?:e|g|x)?def|let)",
            "(?:begin|end)",
            "(?:part|chapter|(?:sub){0,2}section|(?:sub)?paragraph)",
            "caption",
            "(?:label|(?:eq|page|name)?ref|(?:paren|foot|super)?cite)",
            "(?:alpha|beta|[Gg]amma|[Dd]elta|(?:var)?epsilon|zeta|eta|[Tt]heta|vartheta)",
            "(?:iota|(?:var)?kappa|[Ll]ambda|mu|nu|[Xx]i|[Pp]i|varpi|(?:var)rho)",
            "(?:[Ss]igma|varsigma|tau|[Uu]psilon|[Pp]hi|varphi|chi|[Pp]si|[Oo]mega)",
            "(?:frac|sum|prod|lim|infty|times|sqrt|leq|geq|left|right|middle|[bB]igg?)",
            "(?:[lr]angle|q?quad|[lcvdi]?dots|d?dot|hat|tilde|bar)",
          ].map((S) => S + "(?![a-zA-Z@:_])"),
        ),
        q = new RegExp(
          [
            "(?:__)?[a-zA-Z]{2,}_[a-zA-Z](?:_?[a-zA-Z])+:[a-zA-Z]*",
            "[lgc]__?[a-zA-Z](?:_?[a-zA-Z])*_[a-zA-Z]{2,}",
            "[qs]__?[a-zA-Z](?:_?[a-zA-Z])+",
            "use(?:_i)?:[a-zA-Z]*",
            "(?:else|fi|or):",
            "(?:if|cs|exp):w",
            "(?:hbox|vbox):n",
            "::[a-zA-Z]_unbraced",
            "::[a-zA-Z:]",
          ]
            .map((S) => S + "(?![a-zA-Z:_])")
            .join("|"),
        ),
        $ = [{ begin: /[a-zA-Z@]+/ }, { begin: /[^a-zA-Z@]?/ }],
        K = [
          { begin: /\^{6}[0-9a-f]{6}/ },
          { begin: /\^{5}[0-9a-f]{5}/ },
          { begin: /\^{4}[0-9a-f]{4}/ },
          { begin: /\^{3}[0-9a-f]{3}/ },
          { begin: /\^{2}[0-9a-f]{2}/ },
          { begin: /\^{2}[\u0000-\u007f]/ },
        ],
        O = {
          className: "keyword",
          begin: /\\/,
          relevance: 0,
          contains: [
            { endsParent: !0, begin: _ },
            { endsParent: !0, begin: q },
            { endsParent: !0, variants: K },
            { endsParent: !0, relevance: 0, variants: $ },
          ],
        },
        T = { className: "params", relevance: 0, begin: /#+\d?/ },
        z = { variants: K },
        A = { className: "built_in", relevance: 0, begin: /[$&^_]/ },
        f = { className: "meta", begin: "% !TeX", end: "$", relevance: 10 },
        w = H.COMMENT("%", "$", { relevance: 0 }),
        Y = [O, T, z, A, f, w],
        D = { begin: /\{/, end: /\}/, relevance: 0, contains: ["self", ...Y] },
        j = H.inherit(D, { relevance: 0, endsParent: !0, contains: [D, ...Y] }),
        M = { begin: /\[/, end: /\]/, endsParent: !0, relevance: 0, contains: [D, ...Y] },
        J = { begin: /\s+/, relevance: 0 },
        P = [j],
        X = [M],
        R = function (S, x) {
          return { contains: [J], starts: { relevance: 0, contains: S, starts: x } };
        },
        W = function (S, x) {
          return {
            begin: "\\\\" + S + "(?![a-zA-Z@:_])",
            keywords: { $pattern: /\\[a-zA-Z]+/, keyword: "\\" + S },
            relevance: 0,
            contains: [J],
            starts: x,
          };
        },
        Z = function (S, x) {
          return H.inherit(
            {
              begin: "\\\\begin(?=[ \t]*(\\r?\\n[ \t]*)?\\{" + S + "\\})",
              keywords: { $pattern: /\\[a-zA-Z]+/, keyword: "\\begin" },
              relevance: 0,
            },
            R(P, x),
          );
        },
        k = (S = "string") => {
          return H.END_SAME_AS_BEGIN({
            className: S,
            begin: /(.|\r?\n)/,
            end: /(.|\r?\n)/,
            excludeBegin: !0,
            excludeEnd: !0,
            endsParent: !0,
          });
        },
        v = function (S) {
          return { className: "string", end: "(?=\\\\end\\{" + S + "\\})" };
        },
        y = (S = "string") => {
          return {
            relevance: 0,
            begin: /\{/,
            starts: {
              endsParent: !0,
              contains: [
                {
                  className: S,
                  end: /(?=\})/,
                  endsParent: !0,
                  contains: [{ begin: /\{/, end: /\}/, relevance: 0, contains: ["self"] }],
                },
              ],
            },
          };
        },
        E = [
          ...["verb", "lstinline"].map((S) => W(S, { contains: [k()] })),
          W("mint", R(P, { contains: [k()] })),
          W("mintinline", R(P, { contains: [y(), k()] })),
          W("url", { contains: [y("link"), y("link")] }),
          W("hyperref", { contains: [y("link")] }),
          W("href", R(X, { contains: [y("link")] })),
          ...[].concat(
            ...["", "\\*"].map((S) => [
              Z("verbatim" + S, v("verbatim" + S)),
              Z("filecontents" + S, R(P, v("filecontents" + S))),
              ...["", "B", "L"].map((x) => Z(x + "Verbatim" + S, R(X, v(x + "Verbatim" + S)))),
            ]),
          ),
          Z("minted", R(X, R(P, v("minted")))),
        ];
      return { name: "LaTeX", aliases: ["tex"], contains: [...E, ...Y] };
    }
    Ow7.exports = F_1;
  });

  var nT7 = d((u_O, iT7) => {
    function lT7(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function QT7(H) {
      return ETH("(?=", H, ")");
    }
    function _e4(H) {
      return ETH("(", H, ")?");
    }
    function ETH(...H) {
      return H.map((q) => lT7(q)).join("");
    }
    function qe4(...H) {
      return "(" + H.map((q) => lT7(q)).join("|") + ")";
    }
    function $e4(H) {
      let _ = ETH(/[A-Z_]/, _e4(/[A-Z0-9_.-]*:/), /[A-Z0-9_.-]*/),
        q = /[A-Za-z0-9._:-]+/,
        $ = { className: "symbol", begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/ },
        K = { begin: /\s/, contains: [{ className: "meta-keyword", begin: /#?[a-z_][a-z1-9_-]+/, illegal: /\n/ }] },
        O = H.inherit(K, { begin: /\(/, end: /\)/ }),
        T = H.inherit(H.APOS_STRING_MODE, { className: "meta-string" }),
        z = H.inherit(H.QUOTE_STRING_MODE, { className: "meta-string" }),
        A = {
          endsWithParent: !0,
          illegal: /</,
          relevance: 0,
          contains: [
            { className: "attr", begin: q, relevance: 0 },
            {
              begin: /=\s*/,
              relevance: 0,
              contains: [
                {
                  className: "string",
                  endsParent: !0,
                  variants: [
                    { begin: /"/, end: /"/, contains: [$] },
                    { begin: /'/, end: /'/, contains: [$] },
                    { begin: /[^\s"'=<>`]+/ },
                  ],
                },
              ],
            },
          ],
        };
      return {
        name: "HTML, XML",
        aliases: ["html", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist", "wsf", "svg"],
        case_insensitive: !0,
        contains: [
          {
            className: "meta",
            begin: /<![a-z]/,
            end: />/,
            relevance: 10,
            contains: [
              K,
              z,
              T,
              O,
              {
                begin: /\[/,
                end: /\]/,
                contains: [{ className: "meta", begin: /<![a-z]/, end: />/, contains: [K, O, z, T] }],
              },
            ],
          },
          H.COMMENT(/<!--/, /-->/, { relevance: 10 }),
          { begin: /<!\[CDATA\[/, end: /\]\]>/, relevance: 10 },
          $,
          { className: "meta", begin: /<\?xml/, end: /\?>/, relevance: 10 },
          {
            className: "tag",
            begin: /<style(?=\s|>)/,
            end: />/,
            keywords: { name: "style" },
            contains: [A],
            starts: { end: /<\/style>/, returnEnd: !0, subLanguage: ["css", "xml"] },
          },
          {
            className: "tag",
            begin: /<script(?=\s|>)/,
            end: />/,
            keywords: { name: "script" },
            contains: [A],
            starts: { end: /<\/script>/, returnEnd: !0, subLanguage: ["javascript", "handlebars", "xml"] },
          },
          { className: "tag", begin: /<>|<\/>/ },
          {
            className: "tag",
            begin: ETH(/</, QT7(ETH(_, qe4(/\/>/, />/, /\s/)))),
            end: /\/?>/,
            contains: [{ className: "name", begin: _, relevance: 0, starts: A }],
          },
          {
            className: "tag",
            begin: ETH(/<\//, QT7(ETH(_, />/))),
            contains: [
              { className: "name", begin: _, relevance: 0 },
              { begin: />/, relevance: 0, endsParent: !0 },
            ],
          },
        ],
      };
    }
    iT7.exports = $e4;
  });

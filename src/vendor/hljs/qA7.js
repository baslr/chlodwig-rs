  var qA7 = d((Y6O, _A7) => {
    function zH1(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function AH1(...H) {
      return H.map((q) => zH1(q)).join("");
    }
    function fH1(H) {
      let _ = { begin: /<\/?[A-Za-z_]/, end: ">", subLanguage: "xml", relevance: 0 },
        q = { begin: "^[-\\*]{3,}", end: "$" },
        $ = {
          className: "code",
          variants: [
            { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
            { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
            { begin: "```", end: "```+[ ]*$" },
            { begin: "~~~", end: "~~~+[ ]*$" },
            { begin: "`.+?`" },
            { begin: "(?=^( {4}|\\t))", contains: [{ begin: "^( {4}|\\t)", end: "(\\n)$" }], relevance: 0 },
          ],
        },
        K = { className: "bullet", begin: "^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)", end: "\\s+", excludeEnd: !0 },
        O = {
          begin: /^\[[^\n]+\]:/,
          returnBegin: !0,
          contains: [
            { className: "symbol", begin: /\[/, end: /\]/, excludeBegin: !0, excludeEnd: !0 },
            { className: "link", begin: /:\s*/, end: /$/, excludeBegin: !0 },
          ],
        },
        z = {
          variants: [
            { begin: /\[.+?\]\[.*?\]/, relevance: 0 },
            { begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/, relevance: 2 },
            { begin: AH1(/\[.+?\]\(/, /[A-Za-z][A-Za-z0-9+.-]*/, /:\/\/.*?\)/), relevance: 2 },
            { begin: /\[.+?\]\([./?&#].*?\)/, relevance: 1 },
            { begin: /\[.+?\]\(.*?\)/, relevance: 0 },
          ],
          returnBegin: !0,
          contains: [
            { className: "string", relevance: 0, begin: "\\[", end: "\\]", excludeBegin: !0, returnEnd: !0 },
            { className: "link", relevance: 0, begin: "\\]\\(", end: "\\)", excludeBegin: !0, excludeEnd: !0 },
            { className: "symbol", relevance: 0, begin: "\\]\\[", end: "\\]", excludeBegin: !0, excludeEnd: !0 },
          ],
        },
        A = {
          className: "strong",
          contains: [],
          variants: [
            { begin: /_{2}/, end: /_{2}/ },
            { begin: /\*{2}/, end: /\*{2}/ },
          ],
        },
        f = {
          className: "emphasis",
          contains: [],
          variants: [
            { begin: /\*(?!\*)/, end: /\*/ },
            { begin: /_(?!_)/, end: /_/, relevance: 0 },
          ],
        };
      A.contains.push(f), f.contains.push(A);
      let w = [_, z];
      return (
        (A.contains = A.contains.concat(w)),
        (f.contains = f.contains.concat(w)),
        (w = w.concat(A, f)),
        {
          name: "Markdown",
          aliases: ["md", "mkdown", "mkd"],
          contains: [
            {
              className: "section",
              variants: [
                { begin: "^#{1,6}", end: "$", contains: w },
                {
                  begin: "(?=^.+?\\n[=-]{2,}$)",
                  contains: [{ begin: "^[=-]*$" }, { begin: "^", end: "\\n", contains: w }],
                },
              ],
            },
            _,
            K,
            A,
            f,
            { className: "quote", begin: "^>\\s+", contains: w, end: "$" },
            $,
            q,
            z,
            O,
          ],
        }
      );
    }
    _A7.exports = fH1;
  });

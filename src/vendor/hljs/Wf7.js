  var Wf7 = d((l6O, Xf7) => {
    function Pf7(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function eH1(H) {
      return UiH("(", H, ")*");
    }
    function H_1(H) {
      return UiH("(", H, ")?");
    }
    function UiH(...H) {
      return H.map((q) => Pf7(q)).join("");
    }
    function __1(...H) {
      return "(" + H.map((q) => Pf7(q)).join("|") + ")";
    }
    function q_1(H) {
      let _ = {
          "builtin-name": [
            "action",
            "bindattr",
            "collection",
            "component",
            "concat",
            "debugger",
            "each",
            "each-in",
            "get",
            "hash",
            "if",
            "in",
            "input",
            "link-to",
            "loc",
            "log",
            "lookup",
            "mut",
            "outlet",
            "partial",
            "query-params",
            "render",
            "template",
            "textarea",
            "unbound",
            "unless",
            "view",
            "with",
            "yield",
          ],
        },
        q = { literal: ["true", "false", "undefined", "null"] },
        $ = /""|"[^"]+"/,
        K = /''|'[^']+'/,
        O = /\[\]|\[[^\]]+\]/,
        T = /[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/,
        z = /(\.|\/)/,
        A = __1($, K, O, T),
        f = UiH(H_1(/\.|\.\/|\//), A, eH1(UiH(z, A))),
        w = UiH("(", O, "|", T, ")(?==)"),
        Y = { begin: f, lexemes: /[\w.\/]+/ },
        D = H.inherit(Y, { keywords: q }),
        j = { begin: /\(/, end: /\)/ },
        M = {
          className: "attr",
          begin: w,
          relevance: 0,
          starts: {
            begin: /=/,
            end: /=/,
            starts: { contains: [H.NUMBER_MODE, H.QUOTE_STRING_MODE, H.APOS_STRING_MODE, D, j] },
          },
        },
        J = { begin: /as\s+\|/, keywords: { keyword: "as" }, end: /\|/, contains: [{ begin: /\w+/ }] },
        P = { contains: [H.NUMBER_MODE, H.QUOTE_STRING_MODE, H.APOS_STRING_MODE, J, M, D, j], returnEnd: !0 },
        X = H.inherit(Y, { className: "name", keywords: _, starts: H.inherit(P, { end: /\)/ }) });
      j.contains = [X];
      let R = H.inherit(Y, { keywords: _, className: "name", starts: H.inherit(P, { end: /\}\}/ }) }),
        W = H.inherit(Y, { keywords: _, className: "name" }),
        Z = H.inherit(Y, { className: "name", keywords: _, starts: H.inherit(P, { end: /\}\}/ }) });
      return {
        name: "Handlebars",
        aliases: ["hbs", "html.hbs", "html.handlebars", "htmlbars"],
        case_insensitive: !0,
        subLanguage: "xml",
        contains: [
          { begin: /\\\{\{/, skip: !0 },
          { begin: /\\\\(?=\{\{)/, skip: !0 },
          H.COMMENT(/\{\{!--/, /--\}\}/),
          H.COMMENT(/\{\{!/, /\}\}/),
          {
            className: "template-tag",
            begin: /\{\{\{\{(?!\/)/,
            end: /\}\}\}\}/,
            contains: [R],
            starts: { end: /\{\{\{\{\//, returnEnd: !0, subLanguage: "xml" },
          },
          { className: "template-tag", begin: /\{\{\{\{\//, end: /\}\}\}\}/, contains: [W] },
          { className: "template-tag", begin: /\{\{#/, end: /\}\}/, contains: [R] },
          { className: "template-tag", begin: /\{\{(?=else\}\})/, end: /\}\}/, keywords: "else" },
          { className: "template-tag", begin: /\{\{(?=else if)/, end: /\}\}/, keywords: "else if" },
          { className: "template-tag", begin: /\{\{\//, end: /\}\}/, contains: [W] },
          { className: "template-variable", begin: /\{\{\{/, end: /\}\}\}/, contains: [Z] },
          { className: "template-variable", begin: /\{\{/, end: /\}\}/, contains: [Z] },
        ],
      };
    }
    Xf7.exports = q_1;
  });

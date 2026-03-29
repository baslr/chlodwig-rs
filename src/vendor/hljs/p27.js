  var p27 = d((FqO, m27) => {
    function x27(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function hN_(...H) {
      return H.map((q) => x27(q)).join("");
    }
    function Wu6(...H) {
      return "(" + H.map((q) => x27(q)).join("|") + ")";
    }
    function jq1(H) {
      let _ = { className: "string", begin: /"(""|[^/n])"C\b/ },
        q = { className: "string", begin: /"/, end: /"/, illegal: /\n/, contains: [{ begin: /""/ }] },
        $ = /\d{1,2}\/\d{1,2}\/\d{4}/,
        K = /\d{4}-\d{1,2}-\d{1,2}/,
        O = /(\d|1[012])(:\d+){0,2} *(AM|PM)/,
        T = /\d{1,2}(:\d{1,2}){1,2}/,
        z = {
          className: "literal",
          variants: [
            { begin: hN_(/# */, Wu6(K, $), / *#/) },
            { begin: hN_(/# */, T, / *#/) },
            { begin: hN_(/# */, O, / *#/) },
            { begin: hN_(/# */, Wu6(K, $), / +/, Wu6(O, T), / *#/) },
          ],
        },
        A = {
          className: "number",
          relevance: 0,
          variants: [
            { begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/ },
            { begin: /\b\d[\d_]*((U?[SIL])|[%&])?/ },
            { begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/ },
            { begin: /&O[0-7_]+((U?[SIL])|[%&])?/ },
            { begin: /&B[01_]+((U?[SIL])|[%&])?/ },
          ],
        },
        f = { className: "label", begin: /^\w+:/ },
        w = H.COMMENT(/'''/, /$/, { contains: [{ className: "doctag", begin: /<\/?/, end: />/ }] }),
        Y = H.COMMENT(null, /$/, { variants: [{ begin: /'/ }, { begin: /([\t ]|^)REM(?=\s)/ }] });
      return {
        name: "Visual Basic .NET",
        aliases: ["vb"],
        case_insensitive: !0,
        classNameAliases: { label: "symbol" },
        keywords: {
          keyword:
            "addhandler alias aggregate ansi as async assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
          built_in:
            "addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort",
          type: "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort",
          literal: "true false nothing",
        },
        illegal: "//|\\{|\\}|endif|gosub|variant|wend|^\\$ ",
        contains: [
          _,
          q,
          z,
          A,
          f,
          w,
          Y,
          {
            className: "meta",
            begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
            end: /$/,
            keywords: { "meta-keyword": "const disable else elseif enable end externalsource if region then" },
            contains: [Y],
          },
        ],
      };
    }
    m27.exports = jq1;
  });

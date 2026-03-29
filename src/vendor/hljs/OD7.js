  var OD7 = d((TqO, KD7) => {
    function _81(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function q81(...H) {
      return H.map((q) => _81(q)).join("");
    }
    function $81(H) {
      let _ = {
          keyword:
            "in of on if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await import",
          literal: "true false null undefined NaN Infinity",
          built_in:
            "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Behavior bool color coordinate date double enumeration font geocircle georectangle geoshape int list matrix4x4 parent point quaternion real rect size string url variant vector2d vector3d vector4d Promise",
        },
        q = "[a-zA-Z_][a-zA-Z0-9\\._]*",
        $ = {
          className: "keyword",
          begin: "\\bproperty\\b",
          starts: { className: "string", end: "(:|=|;|,|//|/\\*|$)", returnEnd: !0 },
        },
        K = {
          className: "keyword",
          begin: "\\bsignal\\b",
          starts: { className: "string", end: "(\\(|:|=|;|,|//|/\\*|$)", returnEnd: !0 },
        },
        O = {
          className: "attribute",
          begin: "\\bid\\s*:",
          starts: { className: "string", end: "[a-zA-Z_][a-zA-Z0-9\\._]*", returnEnd: !1 },
        },
        T = {
          begin: "[a-zA-Z_][a-zA-Z0-9\\._]*\\s*:",
          returnBegin: !0,
          contains: [
            { className: "attribute", begin: "[a-zA-Z_][a-zA-Z0-9\\._]*", end: "\\s*:", excludeEnd: !0, relevance: 0 },
          ],
          relevance: 0,
        },
        z = {
          begin: q81("[a-zA-Z_][a-zA-Z0-9\\._]*", /\s*\{/),
          end: /\{/,
          returnBegin: !0,
          relevance: 0,
          contains: [H.inherit(H.TITLE_MODE, { begin: "[a-zA-Z_][a-zA-Z0-9\\._]*" })],
        };
      return {
        name: "QML",
        aliases: ["qt"],
        case_insensitive: !1,
        keywords: _,
        contains: [
          { className: "meta", begin: /^\s*['"]use (strict|asm)['"]/ },
          H.APOS_STRING_MODE,
          H.QUOTE_STRING_MODE,
          {
            className: "string",
            begin: "`",
            end: "`",
            contains: [H.BACKSLASH_ESCAPE, { className: "subst", begin: "\\$\\{", end: "\\}" }],
          },
          H.C_LINE_COMMENT_MODE,
          H.C_BLOCK_COMMENT_MODE,
          {
            className: "number",
            variants: [{ begin: "\\b(0[bB][01]+)" }, { begin: "\\b(0[oO][0-7]+)" }, { begin: H.C_NUMBER_RE }],
            relevance: 0,
          },
          {
            begin: "(" + H.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
            keywords: "return throw case",
            contains: [
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
              H.REGEXP_MODE,
              { begin: /</, end: />\s*[);\]]/, relevance: 0, subLanguage: "xml" },
            ],
            relevance: 0,
          },
          K,
          $,
          {
            className: "function",
            beginKeywords: "function",
            end: /\{/,
            excludeEnd: !0,
            contains: [
              H.inherit(H.TITLE_MODE, { begin: /[A-Za-z$_][0-9A-Za-z$_]*/ }),
              {
                className: "params",
                begin: /\(/,
                end: /\)/,
                excludeBegin: !0,
                excludeEnd: !0,
                contains: [H.C_LINE_COMMENT_MODE, H.C_BLOCK_COMMENT_MODE],
              },
            ],
            illegal: /\[|%/,
          },
          { begin: "\\." + H.IDENT_RE, relevance: 0 },
          O,
          T,
          z,
        ],
        illegal: /#/,
      };
    }
    KD7.exports = $81;
  });

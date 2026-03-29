  var HA7 = d((w6O, ez7) => {
    function TH1(H) {
      let _ = {
          $pattern: H.UNDERSCORE_IDENT_RE,
          keyword:
            "abstract alias align asm assert auto body break byte case cast catch class const continue debug default delete deprecated do else enum export extern final finally for foreach foreach_reverse|10 goto if immutable import in inout int interface invariant is lazy macro mixin module new nothrow out override package pragma private protected public pure ref return scope shared static struct super switch synchronized template this throw try typedef typeid typeof union unittest version void volatile while with __FILE__ __LINE__ __gshared|10 __thread __traits __DATE__ __EOF__ __TIME__ __TIMESTAMP__ __VENDOR__ __VERSION__",
          built_in:
            "bool cdouble cent cfloat char creal dchar delegate double dstring float function idouble ifloat ireal long real short string ubyte ucent uint ulong ushort wchar wstring",
          literal: "false null true",
        },
        q = "(0|[1-9][\\d_]*)",
        $ = "(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d)",
        K = "0[bB][01_]+",
        O = "([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)",
        T = "0[xX]([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)",
        z = "([eE][+-]?(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d))",
        A =
          "((0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d)(\\.\\d*|" +
          z +
          ")|\\d+\\.(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d)|\\.(0|[1-9][\\d_]*)" +
          z +
          "?)",
        f =
          "(0[xX](([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)\\.([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)|\\.?([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*))[pP][+-]?(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d))",
        w = "((0|[1-9][\\d_]*)|0[bB][01_]+|" + T + ")",
        Y = "(" + f + "|" + A + ")",
        D = `\\\\(['"\\?\\\\abfnrtv]|u[\\dA-Fa-f]{4}|[0-7]{1,3}|x[\\dA-Fa-f]{2}|U[\\dA-Fa-f]{8})|&[a-zA-Z\\d]{2,};`,
        j = { className: "number", begin: "\\b" + w + "(L|u|U|Lu|LU|uL|UL)?", relevance: 0 },
        M = { className: "number", begin: "\\b(" + Y + "([fF]|L|i|[fF]i|Li)?|" + w + "(i|[fF]i|Li))", relevance: 0 },
        J = { className: "string", begin: "'(" + D + "|.)", end: "'", illegal: "." },
        X = { className: "string", begin: '"', contains: [{ begin: D, relevance: 0 }], end: '"[cwd]?' },
        R = { className: "string", begin: '[rq]"', end: '"[cwd]?', relevance: 5 },
        W = { className: "string", begin: "`", end: "`[cwd]?" },
        Z = { className: "string", begin: 'x"[\\da-fA-F\\s\\n\\r]*"[cwd]?', relevance: 10 },
        k = { className: "string", begin: 'q"\\{', end: '\\}"' },
        v = { className: "meta", begin: "^#!", end: "$", relevance: 5 },
        y = { className: "meta", begin: "#(line)", end: "$", relevance: 5 },
        E = { className: "keyword", begin: "@[a-zA-Z_][a-zA-Z_\\d]*" },
        S = H.COMMENT("\\/\\+", "\\+\\/", { contains: ["self"], relevance: 10 });
      return {
        name: "D",
        keywords: _,
        contains: [H.C_LINE_COMMENT_MODE, H.C_BLOCK_COMMENT_MODE, S, Z, X, R, W, k, M, j, J, v, y, E],
      };
    }
    ez7.exports = TH1;
  });

  var Rz7 = d((n_O, Gz7) => {
    function ke4(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function XN_(H) {
      return ve4("(", H, ")?");
    }
    function ve4(...H) {
      return H.map((q) => ke4(q)).join("");
    }
    function Ne4(H) {
      let _ = H.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }),
        q = "decltype\\(auto\\)",
        $ = "[a-zA-Z_]\\w*::",
        K = "<[^<>]+>",
        O = "(decltype\\(auto\\)|" + XN_("[a-zA-Z_]\\w*::") + "[a-zA-Z_]\\w*" + XN_("<[^<>]+>") + ")",
        T = { className: "keyword", begin: "\\b[a-z\\d_]*_t\\b" },
        z = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)",
        A = {
          className: "string",
          variants: [
            { begin: '(u8?|U|L)?"', end: '"', illegal: "\\n", contains: [H.BACKSLASH_ESCAPE] },
            { begin: "(u8?|U|L)?'(\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)|.)", end: "'", illegal: "." },
            H.END_SAME_AS_BEGIN({ begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/, end: /\)([^()\\ ]{0,16})"/ }),
          ],
        },
        f = {
          className: "number",
          variants: [
            { begin: "\\b(0b[01']+)" },
            { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)" },
            { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" },
          ],
          relevance: 0,
        },
        w = {
          className: "meta",
          begin: /#\s*[a-z]+\b/,
          end: /$/,
          keywords: {
            "meta-keyword": "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include",
          },
          contains: [
            { begin: /\\\n/, relevance: 0 },
            H.inherit(A, { className: "meta-string" }),
            { className: "meta-string", begin: /<.*?>/ },
            _,
            H.C_BLOCK_COMMENT_MODE,
          ],
        },
        Y = { className: "title", begin: XN_("[a-zA-Z_]\\w*::") + H.IDENT_RE, relevance: 0 },
        D = XN_("[a-zA-Z_]\\w*::") + H.IDENT_RE + "\\s*\\(",
        j = {
          keyword:
            "int float while private char char8_t char16_t char32_t catch import module export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using asm case typeid wchar_t short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignas alignof constexpr consteval constinit decltype concept co_await co_return co_yield requires noexcept static_assert thread_local restrict final override atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong new throw return and and_eq bitand bitor compl not not_eq or or_eq xor xor_eq",
          built_in:
            "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr _Bool complex _Complex imaginary _Imaginary",
          literal: "true false nullptr NULL",
        },
        M = [w, T, _, H.C_BLOCK_COMMENT_MODE, f, A],
        J = {
          variants: [
            { begin: /=/, end: /;/ },
            { begin: /\(/, end: /\)/ },
            { beginKeywords: "new throw return else", end: /;/ },
          ],
          keywords: j,
          contains: M.concat([{ begin: /\(/, end: /\)/, keywords: j, contains: M.concat(["self"]), relevance: 0 }]),
          relevance: 0,
        },
        P = {
          className: "function",
          begin: "(" + O + "[\\*&\\s]+)+" + D,
          returnBegin: !0,
          end: /[{;=]/,
          excludeEnd: !0,
          keywords: j,
          illegal: /[^\w\s\*&:<>.]/,
          contains: [
            { begin: "decltype\\(auto\\)", keywords: j, relevance: 0 },
            { begin: D, returnBegin: !0, contains: [Y], relevance: 0 },
            {
              className: "params",
              begin: /\(/,
              end: /\)/,
              keywords: j,
              relevance: 0,
              contains: [
                _,
                H.C_BLOCK_COMMENT_MODE,
                A,
                f,
                T,
                {
                  begin: /\(/,
                  end: /\)/,
                  keywords: j,
                  relevance: 0,
                  contains: ["self", _, H.C_BLOCK_COMMENT_MODE, A, f, T],
                },
              ],
            },
            T,
            _,
            H.C_BLOCK_COMMENT_MODE,
            w,
          ],
        };
      return {
        name: "C",
        aliases: ["h"],
        keywords: j,
        disableAutodetect: !0,
        illegal: "</",
        contains: [].concat(J, P, M, [
          w,
          {
            begin:
              "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",
            end: ">",
            keywords: j,
            contains: ["self", T],
          },
          { begin: H.IDENT_RE + "::", keywords: j },
          {
            className: "class",
            beginKeywords: "enum class struct union",
            end: /[{;:<>=]/,
            contains: [{ beginKeywords: "final class struct" }, H.TITLE_MODE],
          },
        ]),
        exports: { preprocessor: w, strings: A, keywords: j },
      };
    }
    Gz7.exports = Ne4;
  });

    WTH = Vb6();
    TiH = { exec: () => null };
    (BZ = {
      codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
      outputLinkReplace: /\\([\[\]])/g,
      indentCodeCompensation: /^(\s+)(?:```)/,
      beginningSpace: /^\s+/,
      endingHash: /#$/,
      startingSpaceChar: /^ /,
      endingSpaceChar: / $/,
      nonSpaceChar: /[^ ]/,
      newLineCharGlobal: /\n/g,
      tabCharGlobal: /\t/g,
      multipleSpaceGlobal: /\s+/g,
      blankLine: /^[ \t]*$/,
      doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
      blockquoteStart: /^ {0,3}>/,
      blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
      blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
      listReplaceTabs: /^\t+/,
      listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
      listIsTask: /^\[[ xX]\] /,
      listReplaceTask: /^\[[ xX]\] +/,
      anyLine: /\n.*\n/,
      hrefBrackets: /^<(.*)>$/,
      tableDelimiter: /[:|]/,
      tableAlignChars: /^\||\| *$/g,
      tableRowBlankLine: /\n[ \t]*$/,
      tableAlignRight: /^ *-+: *$/,
      tableAlignCenter: /^ *:-+: *$/,
      tableAlignLeft: /^ *:-+ *$/,
      startATag: /^<a /i,
      endATag: /^<\/a>/i,
      startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
      endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
      startAngleBracket: /^</,
      endAngleBracket: />$/,
      pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
      unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
      escapeTest: /[&<>"']/,
      escapeReplace: /[&<>"']/g,
      escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
      escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
      unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi,
      caret: /(^|[^\[])\^/g,
      percentDecode: /%25/g,
      findPipe: /\|/g,
      splitPipe: / \|/,
      slashPipe: /\\\|/g,
      carriageReturn: /\r\n|\r/g,
      spaceLine: /^ +$/gm,
      notSpaceStart: /^\S*/,
      endingNewline: /\n$/,
      listItemRegex: (H) => new RegExp(`^( {0,3}${H})((?:[	 ][^\\n]*)?(?:\\n|$))`),
      nextBulletRegex: (H) =>
        new RegExp(`^ {0,${Math.min(3, H - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
      hrRegex: (H) => new RegExp(`^ {0,${Math.min(3, H - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
      fencesBeginRegex: (H) => new RegExp(`^ {0,${Math.min(3, H - 1)}}(?:\`\`\`|~~~)`),
      headingBeginRegex: (H) => new RegExp(`^ {0,${Math.min(3, H - 1)}}#`),
      htmlBeginRegex: (H) => new RegExp(`^ {0,${Math.min(3, H - 1)}}<(?:[a-z].*>|!--)`, "i"),
    }),
      (_l4 = /^(?:[ \t]*(?:\n|$))+/),
      (ql4 = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/),
      ($l4 =
        /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/),
      (wiH = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/),
      (Kl4 = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/),
      (k17 = /(?:[*+-]|\d{1,9}[.)])/),
      (v17 = UT(
        /^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
      )
        .replace(/bull/g, k17)
        .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
        .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
        .replace(/blockquote/g, / {0,3}>/)
        .replace(/heading/g, / {0,3}#{1,6}/)
        .replace(/html/g, / {0,3}<[^\n>]+>\n/)
        .getRegex()),
      (Sb6 = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/),
      (Ol4 = /^[^\n]+/),
      (Eb6 = /(?!\s*\])(?:\\.|[^\[\]\\])+/),
      (Tl4 = UT(
        /^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/,
      )
        .replace("label", Eb6)
        .replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
        .getRegex()),
      (zl4 = UT(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/)
        .replace(/bull/g, k17)
        .getRegex()),
      (Cb6 = /<!--(?:-?>|[\s\S]*?(?:-->|$))/),
      (Al4 = UT(
        "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))",
        "i",
      )
        .replace("comment", Cb6)
        .replace("tag", Lv_)
        .replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
        .getRegex()),
      (N17 = UT(Sb6)
        .replace("hr", wiH)
        .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
        .replace("|lheading", "")
        .replace("|table", "")
        .replace("blockquote", " {0,3}>")
        .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
        .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
        .replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)")
        .replace("tag", Lv_)
        .getRegex()),
      (fl4 = UT(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
        .replace("paragraph", N17)
        .getRegex()),
      (bb6 = {
        blockquote: fl4,
        code: ql4,
        def: Tl4,
        fences: $l4,
        heading: Kl4,
        hr: wiH,
        html: Al4,
        lheading: v17,
        list: zl4,
        newline: _l4,
        paragraph: N17,
        table: TiH,
        text: Ol4,
      }),
      (X17 = UT(
        "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)",
      )
        .replace("hr", wiH)
        .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
        .replace("blockquote", " {0,3}>")
        .replace("code", "(?: {4}| {0,3}\t)[^\\n]")
        .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
        .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
        .replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)")
        .replace("tag", Lv_)
        .getRegex()),
      (wl4 = {
        ...bb6,
        table: X17,
        paragraph: UT(Sb6)
          .replace("hr", wiH)
          .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
          .replace("|lheading", "")
          .replace("table", X17)
          .replace("blockquote", " {0,3}>")
          .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
          .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
          .replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)")
          .replace("tag", Lv_)
          .getRegex(),
      }),
      (Yl4 = {
        ...bb6,
        html: UT(
          `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`,
        )
          .replace("comment", Cb6)
          .replace(
            /tag/g,
            "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b",
          )
          .getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: TiH,
        lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
        paragraph: UT(Sb6)
          .replace("hr", wiH)
          .replace(
            "heading",
            ` *#{1,6} *[^
]`,
          )
          .replace("lheading", v17)
          .replace("|table", "")
          .replace("blockquote", " {0,3}>")
          .replace("|fences", "")
          .replace("|list", "")
          .replace("|html", "")
          .replace("|tag", "")
          .getRegex(),
      }),
      (Dl4 = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/),
      (jl4 = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/),
      (h17 = /^( {2,}|\\)\n(?!\s*$)/),
      (Ml4 = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/),
      (kv_ = /[\p{P}\p{S}]/u),
      (Ib6 = /[\s\p{P}\p{S}]/u),
      (y17 = /[^\s\p{P}\p{S}]/u),
      (Jl4 = UT(/^((?![*_])punctSpace)/, "u")
        .replace(/punctSpace/g, Ib6)
        .getRegex()),
      (V17 = /(?!~)[\p{P}\p{S}]/u),
      (Pl4 = /(?!~)[\s\p{P}\p{S}]/u),
      (Xl4 = /(?:[^\s\p{P}\p{S}]|~)/u),
      (Wl4 = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g),
      (S17 = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/),
      (Gl4 = UT(S17, "u").replace(/punct/g, kv_).getRegex()),
      (Rl4 = UT(S17, "u").replace(/punct/g, V17).getRegex()),
      (Zl4 = UT(E17, "gu")
        .replace(/notPunctSpace/g, y17)
        .replace(/punctSpace/g, Ib6)
        .replace(/punct/g, kv_)
        .getRegex()),
      (Ll4 = UT(E17, "gu")
        .replace(/notPunctSpace/g, Xl4)
        .replace(/punctSpace/g, Pl4)
        .replace(/punct/g, V17)
        .getRegex()),
      (kl4 = UT(
        "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
        "gu",
      )
        .replace(/notPunctSpace/g, y17)
        .replace(/punctSpace/g, Ib6)
        .replace(/punct/g, kv_)
        .getRegex()),
      (vl4 = UT(/\\(punct)/, "gu")
        .replace(/punct/g, kv_)
        .getRegex()),
      (Nl4 = UT(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
        .replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
        .replace(
          "email",
          /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,
        )
        .getRegex()),
      (hl4 = UT(Cb6).replace("(?:-->|$)", "-->").getRegex()),
      (yl4 = UT(
        "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
      )
        .replace("comment", hl4)
        .replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/)
        .getRegex()),
      (Zv_ = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/),
      (Vl4 = UT(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/)
        .replace("label", Zv_)
        .replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/)
        .replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
        .getRegex()),
      (C17 = UT(/^!?\[(label)\]\[(ref)\]/)
        .replace("label", Zv_)
        .replace("ref", Eb6)
        .getRegex()),
      (b17 = UT(/^!?\[(ref)\](?:\[\])?/)
        .replace("ref", Eb6)
        .getRegex()),
      (Sl4 = UT("reflink|nolink(?!\\()", "g").replace("reflink", C17).replace("nolink", b17).getRegex()),
      (ub6 = {
        _backpedal: TiH,
        anyPunctuation: vl4,
        autolink: Nl4,
        blockSkip: Wl4,
        br: h17,
        code: jl4,
        del: TiH,
        emStrongLDelim: Gl4,
        emStrongRDelimAst: Zl4,
        emStrongRDelimUnd: kl4,
        escape: Dl4,
        link: Vl4,
        nolink: b17,
        punctuation: Jl4,
        reflink: C17,
        reflinkSearch: Sl4,
        tag: yl4,
        text: Ml4,
        url: TiH,
      }),
      (El4 = {
        ...ub6,
        link: UT(/^!?\[(label)\]\((.*?)\)/)
          .replace("label", Zv_)
          .getRegex(),
        reflink: UT(/^!?\[(label)\]\s*\[([^\]]*)\]/)
          .replace("label", Zv_)
          .getRegex(),
      }),
      (yb6 = {
        ...ub6,
        emStrongRDelimAst: Ll4,
        emStrongLDelim: Rl4,
        url: UT(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i")
          .replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/)
          .getRegex(),
        _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
      }),
      (Cl4 = {
        ...yb6,
        br: UT(h17).replace("{2,}", "*").getRegex(),
        text: UT(yb6.text)
          .replace("\\b_", "\\b_| {2,}\\n")
          .replace(/\{2,\}/g, "*")
          .getRegex(),
      }),
      (Rv_ = { normal: bb6, gfm: wl4, pedantic: Yl4 }),
      (KiH = { normal: ub6, gfm: yb6, breaks: Cl4, pedantic: El4 }),
      (bl4 = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });
    ziH = class ziH {
      options;
      block;
      constructor(H) {
        this.options = H || WTH;
      }
      static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens"]);
      preprocess(H) {
        return H;
      }
      postprocess(H) {
        return H;
      }
      processAllTokens(H) {
        return H;
      }
      provideLexer() {
        return this.block ? gZ.lex : gZ.lexInline;
      }
      provideParser() {
        return this.block ? rE.parse : rE.parseInline;
      }
    };
    XTH = new I17();
    C5.options = C5.setOptions = function (H) {
      return XTH.setOptions(H), (C5.defaults = XTH.defaults), L17(C5.defaults), C5;
    };
    C5.getDefaults = Vb6;
    C5.defaults = WTH;
    C5.use = function (...H) {
      return XTH.use(...H), (C5.defaults = XTH.defaults), L17(C5.defaults), C5;
    };
    C5.walkTokens = function (H, _) {
      return XTH.walkTokens(H, _);
    };
    C5.parseInline = XTH.parseInline;
    C5.Parser = rE;
    C5.parser = rE.parse;
    C5.Renderer = fiH;
    C5.TextRenderer = vv_;
    C5.Lexer = gZ;
    C5.lexer = gZ.lex;
    C5.Tokenizer = AiH;
    C5.Hooks = ziH;
    C5.parse = C5;
    (vs3 = C5.options),
      (Ns3 = C5.setOptions),
      (hs3 = C5.use),
      (ys3 = C5.walkTokens),
      (Vs3 = C5.parseInline),
      (Ss3 = rE.parse),
      (Es3 = gZ.lex);

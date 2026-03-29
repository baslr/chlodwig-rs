  var XT7 = d((L_O, PT7) => {
    function sI6(H) {
      if (H instanceof Map)
        H.clear =
          H.delete =
          H.set =
            function () {
              throw Error("map is read-only");
            };
      else if (H instanceof Set)
        H.add =
          H.clear =
          H.delete =
            function () {
              throw Error("set is read-only");
            };
      return (
        Object.freeze(H),
        Object.getOwnPropertyNames(H).forEach(function (_) {
          var q = H[_];
          if (typeof q == "object" && !Object.isFrozen(q)) sI6(q);
        }),
        H
      );
    }
    var zT7 = sI6,
      ls4 = sI6;
    zT7.default = ls4;
    class oI6 {
      constructor(H) {
        if (H.data === void 0) H.data = {};
        (this.data = H.data), (this.isMatchIgnored = !1);
      }
      ignoreMatch() {
        this.isMatchIgnored = !0;
      }
    }
    function NZH(H) {
      return H.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
    }
    function z8H(H, ..._) {
      let q = Object.create(null);
      for (let $ in H) q[$] = H[$];
      return (
        _.forEach(function ($) {
          for (let K in $) q[K] = $[K];
        }),
        q
      );
    }
    var is4 = "</span>",
      _T7 = (H) => {
        return !!H.kind;
      };
    class AT7 {
      constructor(H, _) {
        (this.buffer = ""), (this.classPrefix = _.classPrefix), H.walk(this);
      }
      addText(H) {
        this.buffer += NZH(H);
      }
      openNode(H) {
        if (!_T7(H)) return;
        let _ = H.kind;
        if (!H.sublanguage) _ = `${this.classPrefix}${_}`;
        this.span(_);
      }
      closeNode(H) {
        if (!_T7(H)) return;
        this.buffer += is4;
      }
      value() {
        return this.buffer;
      }
      span(H) {
        this.buffer += `<span class="${H}">`;
      }
    }
    class tI6 {
      constructor() {
        (this.rootNode = { children: [] }), (this.stack = [this.rootNode]);
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      add(H) {
        this.top.children.push(H);
      }
      openNode(H) {
        let _ = { kind: H, children: [] };
        this.add(_), this.stack.push(_);
      }
      closeNode() {
        if (this.stack.length > 1) return this.stack.pop();
        return;
      }
      closeAllNodes() {
        while (this.closeNode());
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      walk(H) {
        return this.constructor._walk(H, this.rootNode);
      }
      static _walk(H, _) {
        if (typeof _ === "string") H.addText(_);
        else if (_.children) H.openNode(_), _.children.forEach((q) => this._walk(H, q)), H.closeNode(_);
        return H;
      }
      static _collapse(H) {
        if (typeof H === "string") return;
        if (!H.children) return;
        if (H.children.every((_) => typeof _ === "string")) H.children = [H.children.join("")];
        else
          H.children.forEach((_) => {
            tI6._collapse(_);
          });
      }
    }
    class fT7 extends tI6 {
      constructor(H) {
        super();
        this.options = H;
      }
      addKeyword(H, _) {
        if (H === "") return;
        this.openNode(_), this.addText(H), this.closeNode();
      }
      addText(H) {
        if (H === "") return;
        this.add(H);
      }
      addSublanguage(H, _) {
        let q = H.root;
        (q.kind = _), (q.sublanguage = !0), this.add(q);
      }
      toHTML() {
        return new AT7(this, this.options).value();
      }
      finalize() {
        return !0;
      }
    }
    function ns4(H) {
      return new RegExp(H.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "m");
    }
    function ciH(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function rs4(...H) {
      return H.map((q) => ciH(q)).join("");
    }
    function os4(...H) {
      return "(" + H.map((q) => ciH(q)).join("|") + ")";
    }
    function as4(H) {
      return new RegExp(H.toString() + "|").exec("").length - 1;
    }
    function ss4(H, _) {
      let q = H && H.exec(_);
      return q && q.index === 0;
    }
    var ts4 = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
    function es4(H, _ = "|") {
      let q = 0;
      return H.map(($) => {
        q += 1;
        let K = q,
          O = ciH($),
          T = "";
        while (O.length > 0) {
          let z = ts4.exec(O);
          if (!z) {
            T += O;
            break;
          }
          if (((T += O.substring(0, z.index)), (O = O.substring(z.index + z[0].length)), z[0][0] === "\\" && z[1]))
            T += "\\" + String(Number(z[1]) + K);
          else if (((T += z[0]), z[0] === "(")) q++;
        }
        return T;
      })
        .map(($) => `(${$})`)
        .join(_);
    }
    var Ht4 = /\b\B/,
      wT7 = "[a-zA-Z]\\w*",
      eI6 = "[a-zA-Z_]\\w*",
      Hu6 = "\\b\\d+(\\.\\d+)?",
      YT7 = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",
      DT7 = "\\b(0b[01]+)",
      _t4 =
        "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",
      qt4 = (H = {}) => {
        let _ = /^#![ ]*\//;
        if (H.binary) H.begin = rs4(_, /.*\b/, H.binary, /\b.*/);
        return z8H(
          {
            className: "meta",
            begin: _,
            end: /$/,
            relevance: 0,
            "on:begin": (q, $) => {
              if (q.index !== 0) $.ignoreMatch();
            },
          },
          H,
        );
      },
      FiH = { begin: "\\\\[\\s\\S]", relevance: 0 },
      $t4 = { className: "string", begin: "'", end: "'", illegal: "\\n", contains: [FiH] },
      Kt4 = { className: "string", begin: '"', end: '"', illegal: "\\n", contains: [FiH] },
      jT7 = {
        begin:
          /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/,
      },
      MN_ = function (H, _, q = {}) {
        let $ = z8H({ className: "comment", begin: H, end: _, contains: [] }, q);
        return (
          $.contains.push(jT7),
          $.contains.push({ className: "doctag", begin: "(?:TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):", relevance: 0 }),
          $
        );
      },
      Ot4 = MN_("//", "$"),
      Tt4 = MN_("/\\*", "\\*/"),
      zt4 = MN_("#", "$"),
      At4 = { className: "number", begin: Hu6, relevance: 0 },
      ft4 = { className: "number", begin: YT7, relevance: 0 },
      wt4 = { className: "number", begin: DT7, relevance: 0 },
      Yt4 = {
        className: "number",
        begin: Hu6 + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
        relevance: 0,
      },
      Dt4 = {
        begin: /(?=\/[^/\n]*\/)/,
        contains: [
          {
            className: "regexp",
            begin: /\//,
            end: /\/[gimuy]*/,
            illegal: /\n/,
            contains: [FiH, { begin: /\[/, end: /\]/, relevance: 0, contains: [FiH] }],
          },
        ],
      },
      jt4 = { className: "title", begin: wT7, relevance: 0 },
      Mt4 = { className: "title", begin: eI6, relevance: 0 },
      Jt4 = { begin: "\\.\\s*" + eI6, relevance: 0 },
      Pt4 = function (H) {
        return Object.assign(H, {
          "on:begin": (_, q) => {
            q.data._beginMatch = _[1];
          },
          "on:end": (_, q) => {
            if (q.data._beginMatch !== _[1]) q.ignoreMatch();
          },
        });
      },
      jN_ = Object.freeze({
        __proto__: null,
        MATCH_NOTHING_RE: Ht4,
        IDENT_RE: wT7,
        UNDERSCORE_IDENT_RE: eI6,
        NUMBER_RE: Hu6,
        C_NUMBER_RE: YT7,
        BINARY_NUMBER_RE: DT7,
        RE_STARTERS_RE: _t4,
        SHEBANG: qt4,
        BACKSLASH_ESCAPE: FiH,
        APOS_STRING_MODE: $t4,
        QUOTE_STRING_MODE: Kt4,
        PHRASAL_WORDS_MODE: jT7,
        COMMENT: MN_,
        C_LINE_COMMENT_MODE: Ot4,
        C_BLOCK_COMMENT_MODE: Tt4,
        HASH_COMMENT_MODE: zt4,
        NUMBER_MODE: At4,
        C_NUMBER_MODE: ft4,
        BINARY_NUMBER_MODE: wt4,
        CSS_NUMBER_MODE: Yt4,
        REGEXP_MODE: Dt4,
        TITLE_MODE: jt4,
        UNDERSCORE_TITLE_MODE: Mt4,
        METHOD_GUARD: Jt4,
        END_SAME_AS_BEGIN: Pt4,
      });
    function Xt4(H, _) {
      if (H.input[H.index - 1] === ".") _.ignoreMatch();
    }
    function Wt4(H, _) {
      if (!_) return;
      if (!H.beginKeywords) return;
      if (
        ((H.begin = "\\b(" + H.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)"),
        (H.__beforeBegin = Xt4),
        (H.keywords = H.keywords || H.beginKeywords),
        delete H.beginKeywords,
        H.relevance === void 0)
      )
        H.relevance = 0;
    }
    function Gt4(H, _) {
      if (!Array.isArray(H.illegal)) return;
      H.illegal = os4(...H.illegal);
    }
    function Rt4(H, _) {
      if (!H.match) return;
      if (H.begin || H.end) throw Error("begin & end are not supported with match");
      (H.begin = H.match), delete H.match;
    }
    function Zt4(H, _) {
      if (H.relevance === void 0) H.relevance = 1;
    }
    var Lt4 = ["of", "and", "for", "in", "not", "or", "if", "then", "parent", "list", "value"],
      kt4 = "keyword";
    function MT7(H, _, q = kt4) {
      let $ = {};
      if (typeof H === "string") K(q, H.split(" "));
      else if (Array.isArray(H)) K(q, H);
      else
        Object.keys(H).forEach(function (O) {
          Object.assign($, MT7(H[O], _, O));
        });
      return $;
      function K(O, T) {
        if (_) T = T.map((z) => z.toLowerCase());
        T.forEach(function (z) {
          let A = z.split("|");
          $[A[0]] = [O, vt4(A[0], A[1])];
        });
      }
    }
    function vt4(H, _) {
      if (_) return Number(_);
      return Nt4(H) ? 0 : 1;
    }
    function Nt4(H) {
      return Lt4.includes(H.toLowerCase());
    }
    function ht4(H, { plugins: _ }) {
      function q(z, A) {
        return new RegExp(ciH(z), "m" + (H.case_insensitive ? "i" : "") + (A ? "g" : ""));
      }
      class $ {
        constructor() {
          (this.matchIndexes = {}), (this.regexes = []), (this.matchAt = 1), (this.position = 0);
        }
        addRule(z, A) {
          (A.position = this.position++),
            (this.matchIndexes[this.matchAt] = A),
            this.regexes.push([A, z]),
            (this.matchAt += as4(z) + 1);
        }
        compile() {
          if (this.regexes.length === 0) this.exec = () => null;
          let z = this.regexes.map((A) => A[1]);
          (this.matcherRe = q(es4(z), !0)), (this.lastIndex = 0);
        }
        exec(z) {
          this.matcherRe.lastIndex = this.lastIndex;
          let A = this.matcherRe.exec(z);
          if (!A) return null;
          let f = A.findIndex((Y, D) => D > 0 && Y !== void 0),
            w = this.matchIndexes[f];
          return A.splice(0, f), Object.assign(A, w);
        }
      }
      class K {
        constructor() {
          (this.rules = []), (this.multiRegexes = []), (this.count = 0), (this.lastIndex = 0), (this.regexIndex = 0);
        }
        getMatcher(z) {
          if (this.multiRegexes[z]) return this.multiRegexes[z];
          let A = new $();
          return this.rules.slice(z).forEach(([f, w]) => A.addRule(f, w)), A.compile(), (this.multiRegexes[z] = A), A;
        }
        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        addRule(z, A) {
          if ((this.rules.push([z, A]), A.type === "begin")) this.count++;
        }
        exec(z) {
          let A = this.getMatcher(this.regexIndex);
          A.lastIndex = this.lastIndex;
          let f = A.exec(z);
          if (this.resumingScanAtSamePosition())
            if (f && f.index === this.lastIndex);
            else {
              let w = this.getMatcher(0);
              (w.lastIndex = this.lastIndex + 1), (f = w.exec(z));
            }
          if (f) {
            if (((this.regexIndex += f.position + 1), this.regexIndex === this.count)) this.considerAll();
          }
          return f;
        }
      }
      function O(z) {
        let A = new K();
        if ((z.contains.forEach((f) => A.addRule(f.begin, { rule: f, type: "begin" })), z.terminatorEnd))
          A.addRule(z.terminatorEnd, { type: "end" });
        if (z.illegal) A.addRule(z.illegal, { type: "illegal" });
        return A;
      }
      function T(z, A) {
        let f = z;
        if (z.isCompiled) return f;
        [Rt4].forEach((Y) => Y(z, A)),
          H.compilerExtensions.forEach((Y) => Y(z, A)),
          (z.__beforeBegin = null),
          [Wt4, Gt4, Zt4].forEach((Y) => Y(z, A)),
          (z.isCompiled = !0);
        let w = null;
        if (typeof z.keywords === "object") (w = z.keywords.$pattern), delete z.keywords.$pattern;
        if (z.keywords) z.keywords = MT7(z.keywords, H.case_insensitive);
        if (z.lexemes && w)
          throw Error("ERR: Prefer `keywords.$pattern` to `mode.lexemes`, BOTH are not allowed. (see mode reference) ");
        if (((w = w || z.lexemes || /\w+/), (f.keywordPatternRe = q(w, !0)), A)) {
          if (!z.begin) z.begin = /\B|\b/;
          if (((f.beginRe = q(z.begin)), z.endSameAsBegin)) z.end = z.begin;
          if (!z.end && !z.endsWithParent) z.end = /\B|\b/;
          if (z.end) f.endRe = q(z.end);
          if (((f.terminatorEnd = ciH(z.end) || ""), z.endsWithParent && A.terminatorEnd))
            f.terminatorEnd += (z.end ? "|" : "") + A.terminatorEnd;
        }
        if (z.illegal) f.illegalRe = q(z.illegal);
        if (!z.contains) z.contains = [];
        if (
          ((z.contains = [].concat(
            ...z.contains.map(function (Y) {
              return yt4(Y === "self" ? z : Y);
            }),
          )),
          z.contains.forEach(function (Y) {
            T(Y, f);
          }),
          z.starts)
        )
          T(z.starts, A);
        return (f.matcher = O(f)), f;
      }
      if (!H.compilerExtensions) H.compilerExtensions = [];
      if (H.contains && H.contains.includes("self"))
        throw Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      return (H.classNameAliases = z8H(H.classNameAliases || {})), T(H);
    }
    function JT7(H) {
      if (!H) return !1;
      return H.endsWithParent || JT7(H.starts);
    }
    function yt4(H) {
      if (H.variants && !H.cachedVariants)
        H.cachedVariants = H.variants.map(function (_) {
          return z8H(H, { variants: null }, _);
        });
      if (H.cachedVariants) return H.cachedVariants;
      if (JT7(H)) return z8H(H, { starts: H.starts ? z8H(H.starts) : null });
      if (Object.isFrozen(H)) return z8H(H);
      return H;
    }
    var Vt4 = "10.7.3";
    function St4(H) {
      return Boolean(H || H === "");
    }
    function Et4(H) {
      let _ = {
        props: ["language", "code", "autodetect"],
        data: function () {
          return { detectedLanguage: "", unknownLanguage: !1 };
        },
        computed: {
          className() {
            if (this.unknownLanguage) return "";
            return "hljs " + this.detectedLanguage;
          },
          highlighted() {
            if (!this.autoDetect && !H.getLanguage(this.language))
              return (
                console.warn(`The language "${this.language}" you specified could not be found.`),
                (this.unknownLanguage = !0),
                NZH(this.code)
              );
            let $ = {};
            if (this.autoDetect) ($ = H.highlightAuto(this.code)), (this.detectedLanguage = $.language);
            else
              ($ = H.highlight(this.language, this.code, this.ignoreIllegals)), (this.detectedLanguage = this.language);
            return $.value;
          },
          autoDetect() {
            return !this.language || St4(this.autodetect);
          },
          ignoreIllegals() {
            return !0;
          },
        },
        render($) {
          return $("pre", {}, [$("code", { class: this.className, domProps: { innerHTML: this.highlighted } })]);
        },
      };
      return {
        Component: _,
        VuePlugin: {
          install($) {
            $.component("highlightjs", _);
          },
        },
      };
    }
    var Ct4 = {
      "after:highlightElement": ({ el: H, result: _, text: q }) => {
        let $ = qT7(H);
        if (!$.length) return;
        let K = document.createElement("div");
        (K.innerHTML = _.value), (_.value = bt4($, qT7(K), q));
      },
    };
    function aI6(H) {
      return H.nodeName.toLowerCase();
    }
    function qT7(H) {
      let _ = [];
      return (
        (function q($, K) {
          for (let O = $.firstChild; O; O = O.nextSibling)
            if (O.nodeType === 3) K += O.nodeValue.length;
            else if (O.nodeType === 1) {
              if ((_.push({ event: "start", offset: K, node: O }), (K = q(O, K)), !aI6(O).match(/br|hr|img|input/)))
                _.push({ event: "stop", offset: K, node: O });
            }
          return K;
        })(H, 0),
        _
      );
    }
    function bt4(H, _, q) {
      let $ = 0,
        K = "",
        O = [];
      function T() {
        if (!H.length || !_.length) return H.length ? H : _;
        if (H[0].offset !== _[0].offset) return H[0].offset < _[0].offset ? H : _;
        return _[0].event === "start" ? H : _;
      }
      function z(w) {
        function Y(D) {
          return " " + D.nodeName + '="' + NZH(D.value) + '"';
        }
        K += "<" + aI6(w) + [].map.call(w.attributes, Y).join("") + ">";
      }
      function A(w) {
        K += "</" + aI6(w) + ">";
      }
      function f(w) {
        (w.event === "start" ? z : A)(w.node);
      }
      while (H.length || _.length) {
        let w = T();
        if (((K += NZH(q.substring($, w[0].offset))), ($ = w[0].offset), w === H)) {
          O.reverse().forEach(A);
          do f(w.splice(0, 1)[0]), (w = T());
          while (w === H && w.length && w[0].offset === $);
          O.reverse().forEach(z);
        } else {
          if (w[0].event === "start") O.push(w[0].node);
          else O.pop();
          f(w.splice(0, 1)[0]);
        }
      }
      return K + NZH(q.substr($));
    }
    var $T7 = {},
      nI6 = (H) => {
        console.error(H);
      },
      KT7 = (H, ..._) => {
        console.log(`WARN: ${H}`, ..._);
      },
      _C = (H, _) => {
        if ($T7[`${H}/${_}`]) return;
        console.log(`Deprecated as of ${H}. ${_}`), ($T7[`${H}/${_}`] = !0);
      },
      rI6 = NZH,
      OT7 = z8H,
      TT7 = Symbol("nomatch"),
      It4 = function (H) {
        let _ = Object.create(null),
          q = Object.create(null),
          $ = [],
          K = !0,
          O = /(^(<[^>]+>|\t|)+|\n)/gm,
          T = "Could not find the language '{}', did you forget to load/include a language module?",
          z = { disableAutodetect: !0, name: "Plain text", contains: [] },
          A = {
            noHighlightRe: /^(no-?highlight)$/i,
            languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
            classPrefix: "hljs-",
            tabReplace: null,
            useBR: !1,
            languages: null,
            __emitter: fT7,
          };
        function f(r) {
          return A.noHighlightRe.test(r);
        }
        function w(r) {
          let $H = r.className + " ";
          $H += r.parentNode ? r.parentNode.className : "";
          let DH = A.languageDetectRe.exec($H);
          if (DH) {
            let fH = g(DH[1]);
            if (!fH) KT7(T.replace("{}", DH[1])), KT7("Falling back to no-highlight mode for this block.", r);
            return fH ? DH[1] : "no-highlight";
          }
          return $H.split(/\s+/).find((fH) => f(fH) || g(fH));
        }
        function Y(r, $H, DH, fH) {
          let vH = "",
            KH = "";
          if (typeof $H === "object") (vH = r), (DH = $H.ignoreIllegals), (KH = $H.language), (fH = void 0);
          else
            _C("10.7.0", "highlight(lang, code, ...args) has been deprecated."),
              _C(
                "10.7.0",
                `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`,
              ),
              (KH = r),
              (vH = $H);
          let n = { code: vH, language: KH };
          HH("before:highlight", n);
          let l = n.result ? n.result : D(n.language, n.code, DH, fH);
          return (l.code = n.code), HH("after:highlight", l), l;
        }
        function D(r, $H, DH, fH) {
          function vH(WH, BH) {
            let EH = NH.case_insensitive ? BH[0].toLowerCase() : BH[0];
            return Object.prototype.hasOwnProperty.call(WH.keywords, EH) && WH.keywords[EH];
          }
          function KH() {
            if (!bH.keywords) {
              __.addText(SH);
              return;
            }
            let WH = 0;
            bH.keywordPatternRe.lastIndex = 0;
            let BH = bH.keywordPatternRe.exec(SH),
              EH = "";
            while (BH) {
              EH += SH.substring(WH, BH.index);
              let mH = vH(bH, BH);
              if (mH) {
                let [FH, TH] = mH;
                if ((__.addText(EH), (EH = ""), (VH += TH), FH.startsWith("_"))) EH += BH[0];
                else {
                  let wH = NH.classNameAliases[FH] || FH;
                  __.addKeyword(BH[0], wH);
                }
              } else EH += BH[0];
              (WH = bH.keywordPatternRe.lastIndex), (BH = bH.keywordPatternRe.exec(SH));
            }
            (EH += SH.substr(WH)), __.addText(EH);
          }
          function n() {
            if (SH === "") return;
            let WH = null;
            if (typeof bH.subLanguage === "string") {
              if (!_[bH.subLanguage]) {
                __.addText(SH);
                return;
              }
              (WH = D(bH.subLanguage, SH, !0, nH[bH.subLanguage])), (nH[bH.subLanguage] = WH.top);
            } else WH = M(SH, bH.subLanguage.length ? bH.subLanguage : null);
            if (bH.relevance > 0) VH += WH.relevance;
            __.addSublanguage(WH.emitter, WH.language);
          }
          function l() {
            if (bH.subLanguage != null) n();
            else KH();
            SH = "";
          }
          function a(WH) {
            if (WH.className) __.openNode(NH.classNameAliases[WH.className] || WH.className);
            return (bH = Object.create(WH, { parent: { value: bH } })), bH;
          }
          function t(WH, BH, EH) {
            let mH = ss4(WH.endRe, EH);
            if (mH) {
              if (WH["on:end"]) {
                let FH = new oI6(WH);
                if ((WH["on:end"](BH, FH), FH.isMatchIgnored)) mH = !1;
              }
              if (mH) {
                while (WH.endsParent && WH.parent) WH = WH.parent;
                return WH;
              }
            }
            if (WH.endsWithParent) return t(WH.parent, BH, EH);
          }
          function s(WH) {
            if (bH.matcher.regexIndex === 0) return (SH += WH[0]), 1;
            else return (zH = !0), 0;
          }
          function OH(WH) {
            let BH = WH[0],
              EH = WH.rule,
              mH = new oI6(EH),
              FH = [EH.__beforeBegin, EH["on:begin"]];
            for (let TH of FH) {
              if (!TH) continue;
              if ((TH(WH, mH), mH.isMatchIgnored)) return s(BH);
            }
            if (EH && EH.endSameAsBegin) EH.endRe = ns4(BH);
            if (EH.skip) SH += BH;
            else {
              if (EH.excludeBegin) SH += BH;
              if ((l(), !EH.returnBegin && !EH.excludeBegin)) SH = BH;
            }
            return a(EH), EH.returnBegin ? 0 : BH.length;
          }
          function XH(WH) {
            let BH = WH[0],
              EH = $H.substr(WH.index),
              mH = t(bH, WH, EH);
            if (!mH) return TT7;
            let FH = bH;
            if (FH.skip) SH += BH;
            else {
              if (!(FH.returnEnd || FH.excludeEnd)) SH += BH;
              if ((l(), FH.excludeEnd)) SH = BH;
            }
            do {
              if (bH.className) __.closeNode();
              if (!bH.skip && !bH.subLanguage) VH += bH.relevance;
              bH = bH.parent;
            } while (bH !== mH.parent);
            if (mH.starts) {
              if (mH.endSameAsBegin) mH.starts.endRe = mH.endRe;
              a(mH.starts);
            }
            return FH.returnEnd ? 0 : BH.length;
          }
          function jH() {
            let WH = [];
            for (let BH = bH; BH !== NH; BH = BH.parent) if (BH.className) WH.unshift(BH.className);
            WH.forEach((BH) => __.openNode(BH));
          }
          let GH = {};
          function RH(WH, BH) {
            let EH = BH && BH[0];
            if (((SH += WH), EH == null)) return l(), 0;
            if (GH.type === "begin" && BH.type === "end" && GH.index === BH.index && EH === "") {
              if (((SH += $H.slice(BH.index, BH.index + 1)), !K)) {
                let mH = Error("0 width match regex");
                throw ((mH.languageName = r), (mH.badRule = GH.rule), mH);
              }
              return 1;
            }
            if (((GH = BH), BH.type === "begin")) return OH(BH);
            else if (BH.type === "illegal" && !DH) {
              let mH = Error('Illegal lexeme "' + EH + '" for mode "' + (bH.className || "<unnamed>") + '"');
              throw ((mH.mode = bH), mH);
            } else if (BH.type === "end") {
              let mH = XH(BH);
              if (mH !== TT7) return mH;
            }
            if (BH.type === "illegal" && EH === "") return 1;
            if (sH > 1e5 && sH > BH.index * 3) throw Error("potential infinite loop, way more iterations than matches");
            return (SH += EH), EH.length;
          }
          let NH = g(r);
          if (!NH) throw (nI6(T.replace("{}", r)), Error('Unknown language: "' + r + '"'));
          let hH = ht4(NH, { plugins: $ }),
            ZH = "",
            bH = fH || hH,
            nH = {},
            __ = new A.__emitter(A);
          jH();
          let SH = "",
            VH = 0,
            yH = 0,
            sH = 0,
            zH = !1;
          try {
            bH.matcher.considerAll();
            for (;;) {
              if ((sH++, zH)) zH = !1;
              else bH.matcher.considerAll();
              bH.matcher.lastIndex = yH;
              let WH = bH.matcher.exec($H);
              if (!WH) break;
              let BH = $H.substring(yH, WH.index),
                EH = RH(BH, WH);
              yH = WH.index + EH;
            }
            return (
              RH($H.substr(yH)),
              __.closeAllNodes(),
              __.finalize(),
              (ZH = __.toHTML()),
              { relevance: Math.floor(VH), value: ZH, language: r, illegal: !1, emitter: __, top: bH }
            );
          } catch (WH) {
            if (WH.message && WH.message.includes("Illegal"))
              return {
                illegal: !0,
                illegalBy: { msg: WH.message, context: $H.slice(yH - 100, yH + 100), mode: WH.mode },
                sofar: ZH,
                relevance: 0,
                value: rI6($H),
                emitter: __,
              };
            else if (K)
              return { illegal: !1, relevance: 0, value: rI6($H), emitter: __, language: r, top: bH, errorRaised: WH };
            else throw WH;
          }
        }
        function j(r) {
          let $H = { relevance: 0, emitter: new A.__emitter(A), value: rI6(r), illegal: !1, top: z };
          return $H.emitter.addText(r), $H;
        }
        function M(r, $H) {
          $H = $H || A.languages || Object.keys(_);
          let DH = j(r),
            fH = $H
              .filter(g)
              .filter(U)
              .map((a) => D(a, r, !1));
          fH.unshift(DH);
          let vH = fH.sort((a, t) => {
              if (a.relevance !== t.relevance) return t.relevance - a.relevance;
              if (a.language && t.language) {
                if (g(a.language).supersetOf === t.language) return 1;
                else if (g(t.language).supersetOf === a.language) return -1;
              }
              return 0;
            }),
            [KH, n] = vH,
            l = KH;
          return (l.second_best = n), l;
        }
        function J(r) {
          if (!(A.tabReplace || A.useBR)) return r;
          return r.replace(O, ($H) => {
            if (
              $H ===
              `
`
            )
              return A.useBR ? "<br>" : $H;
            else if (A.tabReplace) return $H.replace(/\t/g, A.tabReplace);
            return $H;
          });
        }
        function P(r, $H, DH) {
          let fH = $H ? q[$H] : DH;
          if ((r.classList.add("hljs"), fH)) r.classList.add(fH);
        }
        let X = {
            "before:highlightElement": ({ el: r }) => {
              if (A.useBR)
                r.innerHTML = r.innerHTML.replace(/\n/g, "").replace(
                  /<br[ /]*>/g,
                  `
`,
                );
            },
            "after:highlightElement": ({ result: r }) => {
              if (A.useBR) r.value = r.value.replace(/\n/g, "<br>");
            },
          },
          R = /^(<[^>]+>|\t)+/gm,
          W = {
            "after:highlightElement": ({ result: r }) => {
              if (A.tabReplace) r.value = r.value.replace(R, ($H) => $H.replace(/\t/g, A.tabReplace));
            },
          };
        function Z(r) {
          let $H = null,
            DH = w(r);
          if (f(DH)) return;
          HH("before:highlightElement", { el: r, language: DH }), ($H = r);
          let fH = $H.textContent,
            vH = DH ? Y(fH, { language: DH, ignoreIllegals: !0 }) : M(fH);
          if (
            (HH("after:highlightElement", { el: r, result: vH, text: fH }),
            (r.innerHTML = vH.value),
            P(r, DH, vH.language),
            (r.result = { language: vH.language, re: vH.relevance, relavance: vH.relevance }),
            vH.second_best)
          )
            r.second_best = {
              language: vH.second_best.language,
              re: vH.second_best.relevance,
              relavance: vH.second_best.relevance,
            };
        }
        function k(r) {
          if (r.useBR)
            _C("10.3.0", "'useBR' will be removed entirely in v11.0"),
              _C("10.3.0", "Please see https://github.com/highlightjs/highlight.js/issues/2559");
          A = OT7(A, r);
        }
        let v = () => {
          if (v.called) return;
          (v.called = !0),
            _C("10.6.0", "initHighlighting() is deprecated.  Use highlightAll() instead."),
            document.querySelectorAll("pre code").forEach(Z);
        };
        function y() {
          _C("10.6.0", "initHighlightingOnLoad() is deprecated.  Use highlightAll() instead."), (E = !0);
        }
        let E = !1;
        function S() {
          if (document.readyState === "loading") {
            E = !0;
            return;
          }
          document.querySelectorAll("pre code").forEach(Z);
        }
        function x() {
          if (E) S();
        }
        if (typeof window < "u" && window.addEventListener) window.addEventListener("DOMContentLoaded", x, !1);
        function I(r, $H) {
          let DH = null;
          try {
            DH = $H(H);
          } catch (fH) {
            if ((nI6("Language definition for '{}' could not be registered.".replace("{}", r)), !K)) throw fH;
            else nI6(fH);
            DH = z;
          }
          if (!DH.name) DH.name = r;
          if (((_[r] = DH), (DH.rawDefinition = $H.bind(null, H)), DH.aliases)) c(DH.aliases, { languageName: r });
        }
        function B(r) {
          delete _[r];
          for (let $H of Object.keys(q)) if (q[$H] === r) delete q[$H];
        }
        function p() {
          return Object.keys(_);
        }
        function C(r) {
          _C("10.4.0", "requireLanguage will be removed entirely in v11."),
            _C("10.4.0", "Please see https://github.com/highlightjs/highlight.js/pull/2844");
          let $H = g(r);
          if ($H) return $H;
          throw Error("The '{}' language is required, but not loaded.".replace("{}", r));
        }
        function g(r) {
          return (r = (r || "").toLowerCase()), _[r] || _[q[r]];
        }
        function c(r, { languageName: $H }) {
          if (typeof r === "string") r = [r];
          r.forEach((DH) => {
            q[DH.toLowerCase()] = $H;
          });
        }
        function U(r) {
          let $H = g(r);
          return $H && !$H.disableAutodetect;
        }
        function i(r) {
          if (r["before:highlightBlock"] && !r["before:highlightElement"])
            r["before:highlightElement"] = ($H) => {
              r["before:highlightBlock"](Object.assign({ block: $H.el }, $H));
            };
          if (r["after:highlightBlock"] && !r["after:highlightElement"])
            r["after:highlightElement"] = ($H) => {
              r["after:highlightBlock"](Object.assign({ block: $H.el }, $H));
            };
        }
        function _H(r) {
          i(r), $.push(r);
        }
        function HH(r, $H) {
          let DH = r;
          $.forEach(function (fH) {
            if (fH[DH]) fH[DH]($H);
          });
        }
        function e(r) {
          return (
            _C("10.2.0", "fixMarkup will be removed entirely in v11.0"),
            _C("10.2.0", "Please see https://github.com/highlightjs/highlight.js/issues/2534"),
            J(r)
          );
        }
        function qH(r) {
          return (
            _C("10.7.0", "highlightBlock will be removed entirely in v12.0"),
            _C("10.7.0", "Please use highlightElement now."),
            Z(r)
          );
        }
        Object.assign(H, {
          highlight: Y,
          highlightAuto: M,
          highlightAll: S,
          fixMarkup: e,
          highlightElement: Z,
          highlightBlock: qH,
          configure: k,
          initHighlighting: v,
          initHighlightingOnLoad: y,
          registerLanguage: I,
          unregisterLanguage: B,
          listLanguages: p,
          getLanguage: g,
          registerAliases: c,
          requireLanguage: C,
          autoDetection: U,
          inherit: OT7,
          addPlugin: _H,
          vuePlugin: Et4(H).VuePlugin,
        }),
          (H.debugMode = function () {
            K = !1;
          }),
          (H.safeMode = function () {
            K = !0;
          }),
          (H.versionString = Vt4);
        for (let r in jN_) if (typeof jN_[r] === "object") zT7(jN_[r]);
        return Object.assign(H, jN_), H.addPlugin(X), H.addPlugin(Ct4), H.addPlugin(W), H;
      },
      ut4 = It4({});
    PT7.exports = ut4;
  });

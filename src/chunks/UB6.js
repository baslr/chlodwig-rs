  var UB6 = d((BY) => {
    var zf1 = vS_().FilterCSS,
      Af1 = vS_().getDefaultWhiteList,
      yS_ = NS_();
    function Yk7() {
      return {
        a: ["target", "href", "title"],
        abbr: ["title"],
        address: [],
        area: ["shape", "coords", "href", "alt"],
        article: [],
        aside: [],
        audio: ["autoplay", "controls", "crossorigin", "loop", "muted", "preload", "src"],
        b: [],
        bdi: ["dir"],
        bdo: ["dir"],
        big: [],
        blockquote: ["cite"],
        br: [],
        caption: [],
        center: [],
        cite: [],
        code: [],
        col: ["align", "valign", "span", "width"],
        colgroup: ["align", "valign", "span", "width"],
        dd: [],
        del: ["datetime"],
        details: ["open"],
        div: [],
        dl: [],
        dt: [],
        em: [],
        figcaption: [],
        figure: [],
        font: ["color", "size", "face"],
        footer: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        header: [],
        hr: [],
        i: [],
        img: ["src", "alt", "title", "width", "height", "loading"],
        ins: ["datetime"],
        kbd: [],
        li: [],
        mark: [],
        nav: [],
        ol: [],
        p: [],
        pre: [],
        s: [],
        section: [],
        small: [],
        span: [],
        sub: [],
        summary: [],
        sup: [],
        strong: [],
        strike: [],
        table: ["width", "border", "align", "valign"],
        tbody: ["align", "valign"],
        td: ["width", "rowspan", "colspan", "align", "valign"],
        tfoot: ["align", "valign"],
        th: ["width", "rowspan", "colspan", "align", "valign"],
        thead: ["align", "valign"],
        tr: ["rowspan", "align", "valign"],
        tt: [],
        u: [],
        ul: [],
        video: [
          "autoplay",
          "controls",
          "crossorigin",
          "loop",
          "muted",
          "playsinline",
          "poster",
          "preload",
          "src",
          "height",
          "width",
        ],
      };
    }
    var Dk7 = new zf1();
    function ff1(H, _, q) {}
    function wf1(H, _, q) {}
    function Yf1(H, _, q) {}
    function Df1(H, _, q) {}
    function jk7(H) {
      return H.replace(Mf1, "&lt;").replace(Jf1, "&gt;");
    }
    function jf1(H, _, q, $) {
      if (((q = Gk7(q)), _ === "href" || _ === "src")) {
        if (((q = yS_.trim(q)), q === "#")) return "#";
        if (
          !(
            q.substr(0, 7) === "http://" ||
            q.substr(0, 8) === "https://" ||
            q.substr(0, 7) === "mailto:" ||
            q.substr(0, 4) === "tel:" ||
            q.substr(0, 11) === "data:image/" ||
            q.substr(0, 6) === "ftp://" ||
            q.substr(0, 2) === "./" ||
            q.substr(0, 3) === "../" ||
            q[0] === "#" ||
            q[0] === "/"
          )
        )
          return "";
      } else if (_ === "background") {
        if (((hS_.lastIndex = 0), hS_.test(q))) return "";
      } else if (_ === "style") {
        if (((fk7.lastIndex = 0), fk7.test(q))) return "";
        if (((wk7.lastIndex = 0), wk7.test(q))) {
          if (((hS_.lastIndex = 0), hS_.test(q))) return "";
        }
        if ($ !== !1) ($ = $ || Dk7), (q = $.process(q));
      }
      return (q = Rk7(q)), q;
    }
    var Mf1 = /</g,
      Jf1 = />/g,
      Pf1 = /"/g,
      Xf1 = /&quot;/g,
      Wf1 = /&#([a-zA-Z0-9]*);?/gim,
      Gf1 = /&colon;?/gim,
      Rf1 = /&newline;?/gim,
      hS_ = /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/gi,
      fk7 = /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi,
      wk7 = /u\s*r\s*l\s*\(.*/gi;
    function Mk7(H) {
      return H.replace(Pf1, "&quot;");
    }
    function Jk7(H) {
      return H.replace(Xf1, '"');
    }
    function Pk7(H) {
      return H.replace(Wf1, function (q, $) {
        return $[0] === "x" || $[0] === "X"
          ? String.fromCharCode(parseInt($.substr(1), 16))
          : String.fromCharCode(parseInt($, 10));
      });
    }
    function Xk7(H) {
      return H.replace(Gf1, ":").replace(Rf1, " ");
    }
    function Wk7(H) {
      var _ = "";
      for (var q = 0, $ = H.length; q < $; q++) _ += H.charCodeAt(q) < 32 ? " " : H.charAt(q);
      return yS_.trim(_);
    }
    function Gk7(H) {
      return (H = Jk7(H)), (H = Pk7(H)), (H = Xk7(H)), (H = Wk7(H)), H;
    }
    function Rk7(H) {
      return (H = Mk7(H)), (H = jk7(H)), H;
    }
    function Zf1() {
      return "";
    }
    function Lf1(H, _) {
      if (typeof _ !== "function") _ = function () {};
      var q = !Array.isArray(H);
      function $(T) {
        if (q) return !0;
        return yS_.indexOf(H, T) !== -1;
      }
      var K = [],
        O = !1;
      return {
        onIgnoreTag: function (T, z, A) {
          if ($(T))
            if (A.isClosing) {
              var f = "[/removed]",
                w = A.position + f.length;
              return K.push([O !== !1 ? O : A.position, w]), (O = !1), f;
            } else {
              if (!O) O = A.position;
              return "[removed]";
            }
          else return _(T, z, A);
        },
        remove: function (T) {
          var z = "",
            A = 0;
          return (
            yS_.forEach(K, function (f) {
              (z += T.slice(A, f[0])), (A = f[1]);
            }),
            (z += T.slice(A)),
            z
          );
        },
      };
    }
    function kf1(H) {
      var _ = "",
        q = 0;
      while (q < H.length) {
        var $ = H.indexOf("<!--", q);
        if ($ === -1) {
          _ += H.slice(q);
          break;
        }
        _ += H.slice(q, $);
        var K = H.indexOf("-->", $);
        if (K === -1) break;
        q = K + 3;
      }
      return _;
    }
    function vf1(H) {
      var _ = H.split("");
      return (
        (_ = _.filter(function (q) {
          var $ = q.charCodeAt(0);
          if ($ === 127) return !1;
          if ($ <= 31) {
            if ($ === 10 || $ === 13) return !0;
            return !1;
          }
          return !0;
        })),
        _.join("")
      );
    }
    BY.whiteList = Yk7();
    BY.getDefaultWhiteList = Yk7;
    BY.onTag = ff1;
    BY.onIgnoreTag = wf1;
    BY.onTagAttr = Yf1;
    BY.onIgnoreTagAttr = Df1;
    BY.safeAttrValue = jf1;
    BY.escapeHtml = jk7;
    BY.escapeQuote = Mk7;
    BY.unescapeQuote = Jk7;
    BY.escapeHtmlEntities = Pk7;
    BY.escapeDangerHtml5Entities = Xk7;
    BY.clearNonPrintableCharacter = Wk7;
    BY.friendlyAttrValue = Gk7;
    BY.escapeAttrValue = Rk7;
    BY.onIgnoreTagStripAll = Zf1;
    BY.StripTagBody = Lf1;
    BY.stripCommentTag = kf1;
    BY.stripBlankChar = vf1;
    BY.attributeWrapSign = '"';
    BY.cssFilter = Dk7;
    BY.getDefaultCSSWhiteList = Af1;
  });

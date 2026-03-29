    KU1 = [
      "ADDRESS",
      "ARTICLE",
      "ASIDE",
      "AUDIO",
      "BLOCKQUOTE",
      "BODY",
      "CANVAS",
      "CENTER",
      "DD",
      "DIR",
      "DIV",
      "DL",
      "DT",
      "FIELDSET",
      "FIGCAPTION",
      "FIGURE",
      "FOOTER",
      "FORM",
      "FRAMESET",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "HEADER",
      "HGROUP",
      "HR",
      "HTML",
      "ISINDEX",
      "LI",
      "MAIN",
      "MENU",
      "NAV",
      "NOFRAMES",
      "NOSCRIPT",
      "OL",
      "OUTPUT",
      "P",
      "PRE",
      "SECTION",
      "TABLE",
      "TBODY",
      "TD",
      "TFOOT",
      "TH",
      "THEAD",
      "TR",
      "UL",
    ];
    oq9 = [
      "AREA",
      "BASE",
      "BR",
      "COL",
      "COMMAND",
      "EMBED",
      "HR",
      "IMG",
      "INPUT",
      "KEYGEN",
      "LINK",
      "META",
      "PARAM",
      "SOURCE",
      "TRACK",
      "WBR",
    ];
    sq9 = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
    sG = {};
    sG.paragraph = {
      filter: "p",
      replacement: function (H) {
        return (
          `

` +
          H +
          `

`
        );
      },
    };
    sG.lineBreak = {
      filter: "br",
      replacement: function (H, _, q) {
        return (
          q.br +
          `
`
        );
      },
    };
    sG.heading = {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      replacement: function (H, _, q) {
        var $ = Number(_.nodeName.charAt(1));
        if (q.headingStyle === "setext" && $ < 3) {
          var K = Kt6($ === 1 ? "=" : "-", H.length);
          return (
            `

` +
            H +
            `
` +
            K +
            `

`
          );
        } else
          return (
            `

` +
            Kt6("#", $) +
            " " +
            H +
            `

`
          );
      },
    };
    sG.blockquote = {
      filter: "blockquote",
      replacement: function (H) {
        return (
          (H = H.replace(/^\n+|\n+$/g, "")),
          (H = H.replace(/^/gm, "> ")),
          `

` +
            H +
            `

`
        );
      },
    };
    sG.list = {
      filter: ["ul", "ol"],
      replacement: function (H, _) {
        var q = _.parentNode;
        if (q.nodeName === "LI" && q.lastElementChild === _)
          return (
            `
` + H
          );
        else
          return (
            `

` +
            H +
            `

`
          );
      },
    };
    sG.listItem = {
      filter: "li",
      replacement: function (H, _, q) {
        H = H.replace(/^\n+/, "")
          .replace(
            /\n+$/,
            `
`,
          )
          .replace(
            /\n/gm,
            `
    `,
          );
        var $ = q.bulletListMarker + "   ",
          K = _.parentNode;
        if (K.nodeName === "OL") {
          var O = K.getAttribute("start"),
            T = Array.prototype.indexOf.call(K.children, _);
          $ = (O ? Number(O) + T : T + 1) + ".  ";
        }
        return (
          $ +
          H +
          (_.nextSibling && !/\n$/.test(H)
            ? `
`
            : "")
        );
      },
    };
    sG.indentedCodeBlock = {
      filter: function (H, _) {
        return (
          _.codeBlockStyle === "indented" && H.nodeName === "PRE" && H.firstChild && H.firstChild.nodeName === "CODE"
        );
      },
      replacement: function (H, _, q) {
        return (
          `

    ` +
          _.firstChild.textContent.replace(
            /\n/g,
            `
    `,
          ) +
          `

`
        );
      },
    };
    sG.fencedCodeBlock = {
      filter: function (H, _) {
        return (
          _.codeBlockStyle === "fenced" && H.nodeName === "PRE" && H.firstChild && H.firstChild.nodeName === "CODE"
        );
      },
      replacement: function (H, _, q) {
        var $ = _.firstChild.getAttribute("class") || "",
          K = ($.match(/language-(\S+)/) || [null, ""])[1],
          O = _.firstChild.textContent,
          T = q.fence.charAt(0),
          z = 3,
          A = new RegExp("^" + T + "{3,}", "gm"),
          f;
        while ((f = A.exec(O))) if (f[0].length >= z) z = f[0].length + 1;
        var w = Kt6(T, z);
        return (
          `

` +
          w +
          K +
          `
` +
          O.replace(/\n$/, "") +
          `
` +
          w +
          `

`
        );
      },
    };
    sG.horizontalRule = {
      filter: "hr",
      replacement: function (H, _, q) {
        return (
          `

` +
          q.hr +
          `

`
        );
      },
    };
    sG.inlineLink = {
      filter: function (H, _) {
        return _.linkStyle === "inlined" && H.nodeName === "A" && H.getAttribute("href");
      },
      replacement: function (H, _) {
        var q = _.getAttribute("href");
        if (q) q = q.replace(/([()])/g, "\\$1");
        var $ = Gd_(_.getAttribute("title"));
        if ($) $ = ' "' + $.replace(/"/g, '\\"') + '"';
        return "[" + H + "](" + q + $ + ")";
      },
    };
    sG.referenceLink = {
      filter: function (H, _) {
        return _.linkStyle === "referenced" && H.nodeName === "A" && H.getAttribute("href");
      },
      replacement: function (H, _, q) {
        var $ = _.getAttribute("href"),
          K = Gd_(_.getAttribute("title"));
        if (K) K = ' "' + K + '"';
        var O, T;
        switch (q.linkReferenceStyle) {
          case "collapsed":
            (O = "[" + H + "][]"), (T = "[" + H + "]: " + $ + K);
            break;
          case "shortcut":
            (O = "[" + H + "]"), (T = "[" + H + "]: " + $ + K);
            break;
          default:
            var z = this.references.length + 1;
            (O = "[" + H + "][" + z + "]"), (T = "[" + z + "]: " + $ + K);
        }
        return this.references.push(T), O;
      },
      references: [],
      append: function (H) {
        var _ = "";
        if (this.references.length)
          (_ =
            `

` +
            this.references.join(`
`) +
            `

`),
            (this.references = []);
        return _;
      },
    };
    sG.emphasis = {
      filter: ["em", "i"],
      replacement: function (H, _, q) {
        if (!H.trim()) return "";
        return q.emDelimiter + H + q.emDelimiter;
      },
    };
    sG.strong = {
      filter: ["strong", "b"],
      replacement: function (H, _, q) {
        if (!H.trim()) return "";
        return q.strongDelimiter + H + q.strongDelimiter;
      },
    };
    sG.code = {
      filter: function (H) {
        var _ = H.previousSibling || H.nextSibling,
          q = H.parentNode.nodeName === "PRE" && !_;
        return H.nodeName === "CODE" && !q;
      },
      replacement: function (H) {
        if (!H) return "";
        H = H.replace(/\r?\n|\r/g, " ");
        var _ = /^`|^ .*?[^ ].* $|`$/.test(H) ? " " : "",
          q = "`",
          $ = H.match(/`+/gm) || [];
        while ($.indexOf(q) !== -1) q = q + "`";
        return q + _ + H + _ + q;
      },
    };
    sG.image = {
      filter: "img",
      replacement: function (H, _) {
        var q = Gd_(_.getAttribute("alt")),
          $ = _.getAttribute("src") || "",
          K = Gd_(_.getAttribute("title")),
          O = K ? ' "' + K + '"' : "";
        return $ ? "![" + q + "](" + $ + O + ")" : "";
      },
    };
    eq9.prototype = {
      add: function (H, _) {
        this.array.unshift(_);
      },
      keep: function (H) {
        this._keep.unshift({ filter: H, replacement: this.keepReplacement });
      },
      remove: function (H) {
        this._remove.unshift({
          filter: H,
          replacement: function () {
            return "";
          },
        });
      },
      forNode: function (H) {
        if (H.isBlank) return this.blankRule;
        var _;
        if ((_ = _t6(this.array, H, this.options))) return _;
        if ((_ = _t6(this._keep, H, this.options))) return _;
        if ((_ = _t6(this._remove, H, this.options))) return _;
        return this.defaultRule;
      },
      forEach: function (H) {
        for (var _ = 0; _ < this.array.length; _++) H(this.array[_], _);
      },
    };
    H79 = typeof window < "u" ? window : {};
    DU1 = wU1() ? H79.DOMParser : YU1();
    (RU1 = Array.prototype.reduce),
      (ZU1 = [
        [/\\/g, "\\\\"],
        [/\*/g, "\\*"],
        [/^-/g, "\\-"],
        [/^\+ /g, "\\+ "],
        [/^(=+)/g, "\\$1"],
        [/^(#{1,6}) /g, "\\$1 "],
        [/`/g, "\\`"],
        [/^~~~/g, "\\~~~"],
        [/\[/g, "\\["],
        [/\]/g, "\\]"],
        [/^>/g, "\\>"],
        [/_/g, "\\_"],
        [/^(\d+)\. /g, "$1\\. "],
      ]);
    Rd_.prototype = {
      turndown: function (H) {
        if (!vU1(H)) throw TypeError(H + " is not a string, or an element/document/fragment node.");
        if (H === "") return "";
        var _ = _79.call(this, new jU1(H, this.options));
        return LU1.call(this, _);
      },
      use: function (H) {
        if (Array.isArray(H)) for (var _ = 0; _ < H.length; _++) this.use(H[_]);
        else if (typeof H === "function") H(this);
        else throw TypeError("plugin must be a Function or an Array of Functions");
        return this;
      },
      addRule: function (H, _) {
        return this.rules.add(H, _), this;
      },
      keep: function (H) {
        return this.rules.keep(H), this;
      },
      remove: function (H) {
        return this.rules.remove(H), this;
      },
      escape: function (H) {
        return ZU1.reduce(function (_, q) {
          return _.replace(q[0], q[1]);
        }, H);
      },
    };
    NU1 = Rd_;

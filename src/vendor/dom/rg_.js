  var rg_ = d((wyH, m69) => {
    var lg_ = Object.create(null, {
        location: {
          get: function () {
            throw Error("window.location is not supported.");
          },
        },
      }),
      jc1 = function (H, _) {
        return H.compareDocumentPosition(_);
      },
      Mc1 = function (H, _) {
        return jc1(H, _) & 2 ? 1 : -1;
      },
      ng_ = function (H) {
        while ((H = H.nextSibling) && H.nodeType !== 1);
        return H;
      },
      fyH = function (H) {
        while ((H = H.previousSibling) && H.nodeType !== 1);
        return H;
      },
      Jc1 = function (H) {
        if ((H = H.firstChild)) while (H.nodeType !== 1 && (H = H.nextSibling));
        return H;
      },
      Pc1 = function (H) {
        if ((H = H.lastChild)) while (H.nodeType !== 1 && (H = H.previousSibling));
        return H;
      },
      AyH = function (H) {
        if (!H.parentNode) return !1;
        var _ = H.parentNode.nodeType;
        return _ === 1 || _ === 9;
      },
      C69 = function (H) {
        if (!H) return H;
        var _ = H[0];
        if (_ === '"' || _ === "'") {
          if (H[H.length - 1] === _) H = H.slice(1, -1);
          else H = H.slice(1);
          return H.replace(K4.str_escape, function (q) {
            var $ = /^\\(?:([0-9A-Fa-f]+)|([\r\n\f]+))/.exec(q);
            if (!$) return q.slice(1);
            if ($[2]) return "";
            var K = parseInt($[1], 16);
            return String.fromCodePoint ? String.fromCodePoint(K) : String.fromCharCode(K);
          });
        } else if (K4.ident.test(H)) return H9H(H);
        else return H;
      },
      H9H = function (H) {
        return H.replace(K4.escape, function (_) {
          var q = /^\\([0-9A-Fa-f]+)/.exec(_);
          if (!q) return _[1];
          var $ = parseInt(q[1], 16);
          return String.fromCodePoint ? String.fromCodePoint($) : String.fromCharCode($);
        });
      },
      Xc1 = (function () {
        if (Array.prototype.indexOf) return Array.prototype.indexOf;
        return function (H, _) {
          var q = this.length;
          while (q--) if (this[q] === _) return q;
          return -1;
        };
      })(),
      I69 = function (H, _) {
        var q = K4.inside.source.replace(/</g, H).replace(/>/g, _);
        return new RegExp(q);
      },
      HN = function (H, _, q) {
        return (H = H.source), (H = H.replace(_, q.source || q)), new RegExp(H);
      },
      b69 = function (H, _) {
        return H.replace(/^(?:\w+:\/\/|\/+)/, "")
          .replace(/(?:\/+|\/*#.*?)$/, "")
          .split("/", _)
          .join("/");
      },
      Wc1 = function (H, _) {
        var q = H.replace(/\s+/g, ""),
          $;
        if (q === "even") q = "2n+0";
        else if (q === "odd") q = "2n+1";
        else if (q.indexOf("n") === -1) q = "0n" + q;
        return (
          ($ = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec(q)),
          { group: $[1] === "-" ? -($[2] || 1) : +($[2] || 1), offset: $[4] ? ($[3] === "-" ? -$[4] : +$[4]) : 0 }
        );
      },
      zs6 = function (H, _, q) {
        var $ = Wc1(H),
          K = $.group,
          O = $.offset,
          T = !q ? Jc1 : Pc1,
          z = !q ? ng_ : fyH;
        return function (A) {
          if (!AyH(A)) return;
          var f = T(A.parentNode),
            w = 0;
          while (f) {
            if (_(f, A)) w++;
            if (f === A) return (w -= O), K && w ? w % K === 0 && w < 0 === K < 0 : !w;
            f = z(f);
          }
        };
      },
      bP = {
        "*": (function () {
          return function () {
            return !0;
          };
        })(),
        type: function (H) {
          return (
            (H = H.toLowerCase()),
            function (_) {
              return _.nodeName.toLowerCase() === H;
            }
          );
        },
        attr: function (H, _, q, $) {
          return (
            (_ = u69[_]),
            function (K) {
              var O;
              switch (H) {
                case "for":
                  O = K.htmlFor;
                  break;
                case "class":
                  if (((O = K.className), O === "" && K.getAttribute("class") == null)) O = null;
                  break;
                case "href":
                case "src":
                  O = K.getAttribute(H, 2);
                  break;
                case "title":
                  O = K.getAttribute("title") || null;
                  break;
                case "id":
                case "lang":
                case "dir":
                case "accessKey":
                case "hidden":
                case "tabIndex":
                case "style":
                  if (K.getAttribute) {
                    O = K.getAttribute(H);
                    break;
                  }
                default:
                  if (K.hasAttribute && !K.hasAttribute(H)) break;
                  O = K[H] != null ? K[H] : K.getAttribute && K.getAttribute(H);
                  break;
              }
              if (O == null) return;
              if (((O = O + ""), $)) (O = O.toLowerCase()), (q = q.toLowerCase());
              return _(O, q);
            }
          );
        },
        ":first-child": function (H) {
          return !fyH(H) && AyH(H);
        },
        ":last-child": function (H) {
          return !ng_(H) && AyH(H);
        },
        ":only-child": function (H) {
          return !fyH(H) && !ng_(H) && AyH(H);
        },
        ":nth-child": function (H, _) {
          return zs6(
            H,
            function () {
              return !0;
            },
            _,
          );
        },
        ":nth-last-child": function (H) {
          return bP[":nth-child"](H, !0);
        },
        ":root": function (H) {
          return H.ownerDocument.documentElement === H;
        },
        ":empty": function (H) {
          return !H.firstChild;
        },
        ":not": function (H) {
          var _ = fs6(H);
          return function (q) {
            return !_(q);
          };
        },
        ":first-of-type": function (H) {
          if (!AyH(H)) return;
          var _ = H.nodeName;
          while ((H = fyH(H))) if (H.nodeName === _) return;
          return !0;
        },
        ":last-of-type": function (H) {
          if (!AyH(H)) return;
          var _ = H.nodeName;
          while ((H = ng_(H))) if (H.nodeName === _) return;
          return !0;
        },
        ":only-of-type": function (H) {
          return bP[":first-of-type"](H) && bP[":last-of-type"](H);
        },
        ":nth-of-type": function (H, _) {
          return zs6(
            H,
            function (q, $) {
              return q.nodeName === $.nodeName;
            },
            _,
          );
        },
        ":nth-last-of-type": function (H) {
          return bP[":nth-of-type"](H, !0);
        },
        ":checked": function (H) {
          return !!(H.checked || H.selected);
        },
        ":indeterminate": function (H) {
          return !bP[":checked"](H);
        },
        ":enabled": function (H) {
          return !H.disabled && H.type !== "hidden";
        },
        ":disabled": function (H) {
          return !!H.disabled;
        },
        ":target": function (H) {
          return H.id === lg_.location.hash.substring(1);
        },
        ":focus": function (H) {
          return H === H.ownerDocument.activeElement;
        },
        ":is": function (H) {
          return fs6(H);
        },
        ":matches": function (H) {
          return bP[":is"](H);
        },
        ":nth-match": function (H, _) {
          var q = H.split(/\s*,\s*/),
            $ = q.shift(),
            K = fs6(q.join(","));
          return zs6($, K, _);
        },
        ":nth-last-match": function (H) {
          return bP[":nth-match"](H, !0);
        },
        ":links-here": function (H) {
          return H + "" === lg_.location + "";
        },
        ":lang": function (H) {
          return function (_) {
            while (_) {
              if (_.lang) return _.lang.indexOf(H) === 0;
              _ = _.parentNode;
            }
          };
        },
        ":dir": function (H) {
          return function (_) {
            while (_) {
              if (_.dir) return _.dir === H;
              _ = _.parentNode;
            }
          };
        },
        ":scope": function (H, _) {
          var q = _ || H.ownerDocument;
          if (q.nodeType === 9) return H === q.documentElement;
          return H === q;
        },
        ":any-link": function (H) {
          return typeof H.href === "string";
        },
        ":local-link": function (H) {
          if (H.nodeName) return H.href && H.host === lg_.location.host;
          var _ = +H + 1;
          return function (q) {
            if (!q.href) return;
            var $ = lg_.location + "",
              K = q + "";
            return b69($, _) === b69(K, _);
          };
        },
        ":default": function (H) {
          return !!H.defaultSelected;
        },
        ":valid": function (H) {
          return H.willValidate || (H.validity && H.validity.valid);
        },
        ":invalid": function (H) {
          return !bP[":valid"](H);
        },
        ":in-range": function (H) {
          return H.value > H.min && H.value <= H.max;
        },
        ":out-of-range": function (H) {
          return !bP[":in-range"](H);
        },
        ":required": function (H) {
          return !!H.required;
        },
        ":optional": function (H) {
          return !H.required;
        },
        ":read-only": function (H) {
          if (H.readOnly) return !0;
          var _ = H.getAttribute("contenteditable"),
            q = H.contentEditable,
            $ = H.nodeName.toLowerCase();
          return ($ = $ !== "input" && $ !== "textarea"), ($ || H.disabled) && _ == null && q !== "true";
        },
        ":read-write": function (H) {
          return !bP[":read-only"](H);
        },
        ":hover": function () {
          throw Error(":hover is not supported.");
        },
        ":active": function () {
          throw Error(":active is not supported.");
        },
        ":link": function () {
          throw Error(":link is not supported.");
        },
        ":visited": function () {
          throw Error(":visited is not supported.");
        },
        ":column": function () {
          throw Error(":column is not supported.");
        },
        ":nth-column": function () {
          throw Error(":nth-column is not supported.");
        },
        ":nth-last-column": function () {
          throw Error(":nth-last-column is not supported.");
        },
        ":current": function () {
          throw Error(":current is not supported.");
        },
        ":past": function () {
          throw Error(":past is not supported.");
        },
        ":future": function () {
          throw Error(":future is not supported.");
        },
        ":contains": function (H) {
          return function (_) {
            var q = _.innerText || _.textContent || _.value || "";
            return q.indexOf(H) !== -1;
          };
        },
        ":has": function (H) {
          return function (_) {
            return x69(H, _).length > 0;
          };
        },
      },
      u69 = {
        "-": function () {
          return !0;
        },
        "=": function (H, _) {
          return H === _;
        },
        "*=": function (H, _) {
          return H.indexOf(_) !== -1;
        },
        "~=": function (H, _) {
          var q, $, K, O;
          for ($ = 0; ; $ = q + 1) {
            if (((q = H.indexOf(_, $)), q === -1)) return !1;
            if (((K = H[q - 1]), (O = H[q + _.length]), (!K || K === " ") && (!O || O === " "))) return !0;
          }
        },
        "|=": function (H, _) {
          var q = H.indexOf(_),
            $;
          if (q !== 0) return;
          return ($ = H[q + _.length]), $ === "-" || !$;
        },
        "^=": function (H, _) {
          return H.indexOf(_) === 0;
        },
        "$=": function (H, _) {
          var q = H.lastIndexOf(_);
          return q !== -1 && q + _.length === H.length;
        },
        "!=": function (H, _) {
          return H !== _;
        },
      },
      qH_ = {
        " ": function (H) {
          return function (_) {
            while ((_ = _.parentNode)) if (H(_)) return _;
          };
        },
        ">": function (H) {
          return function (_) {
            if ((_ = _.parentNode)) return H(_) && _;
          };
        },
        "+": function (H) {
          return function (_) {
            if ((_ = fyH(_))) return H(_) && _;
          };
        },
        "~": function (H) {
          return function (_) {
            while ((_ = fyH(_))) if (H(_)) return _;
          };
        },
        noop: function (H) {
          return function (_) {
            return H(_) && _;
          };
        },
        ref: function (H, _) {
          var q;
          function $(K) {
            var O = K.ownerDocument,
              T = O.getElementsByTagName("*"),
              z = T.length;
            while (z--) if (((q = T[z]), $.test(K))) return (q = null), !0;
            q = null;
          }
          return (
            ($.combinator = function (K) {
              if (!q || !q.getAttribute) return;
              var O = q.getAttribute(_) || "";
              if (O[0] === "#") O = O.substring(1);
              if (O === K.id && H(q)) return q;
            }),
            $
          );
        },
      },
      K4 = {
        escape: /\\(?:[^0-9A-Fa-f\r\n]|[0-9A-Fa-f]{1,6}[\r\n\t ]?)/g,
        str_escape: /(escape)|\\(\n|\r\n?|\f)/g,
        nonascii: /[\u00A0-\uFFFF]/,
        cssid: /(?:(?!-?[0-9])(?:escape|nonascii|[-_a-zA-Z0-9])+)/,
        qname: /^ *(cssid|\*)/,
        simple: /^(?:([.#]cssid)|pseudo|attr)/,
        ref: /^ *\/(cssid)\/ */,
        combinator: /^(?: +([^ \w*.#\\]) +|( )+|([^ \w*.#\\]))(?! *$)/,
        attr: /^\[(cssid)(?:([^\w]?=)(inside))?\]/,
        pseudo: /^(:cssid)(?:\((inside)\))?/,
        inside: /(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|<[^"'>]*>|\\["'>]|[^"'>])*/,
        ident: /^(cssid)$/,
      };
    K4.cssid = HN(K4.cssid, "nonascii", K4.nonascii);
    K4.cssid = HN(K4.cssid, "escape", K4.escape);
    K4.qname = HN(K4.qname, "cssid", K4.cssid);
    K4.simple = HN(K4.simple, "cssid", K4.cssid);
    K4.ref = HN(K4.ref, "cssid", K4.cssid);
    K4.attr = HN(K4.attr, "cssid", K4.cssid);
    K4.pseudo = HN(K4.pseudo, "cssid", K4.cssid);
    K4.inside = HN(K4.inside, `[^"'>]*`, K4.inside);
    K4.attr = HN(K4.attr, "inside", I69("\\[", "\\]"));
    K4.pseudo = HN(K4.pseudo, "inside", I69("\\(", "\\)"));
    K4.simple = HN(K4.simple, "pseudo", K4.pseudo);
    K4.simple = HN(K4.simple, "attr", K4.attr);
    K4.ident = HN(K4.ident, "cssid", K4.cssid);
    K4.str_escape = HN(K4.str_escape, "escape", K4.escape);
    var $H_ = function (H) {
        var _ = H.replace(/^\s+|\s+$/g, ""),
          q,
          $ = [],
          K = [],
          O,
          T,
          z,
          A,
          f;
        while (_) {
          if ((z = K4.qname.exec(_))) (_ = _.substring(z[0].length)), (T = H9H(z[1])), K.push(ig_(T, !0));
          else if ((z = K4.simple.exec(_)))
            (_ = _.substring(z[0].length)), (T = "*"), K.push(ig_(T, !0)), K.push(ig_(z));
          else throw SyntaxError("Invalid selector.");
          while ((z = K4.simple.exec(_))) (_ = _.substring(z[0].length)), K.push(ig_(z));
          if (_[0] === "!") (_ = _.substring(1)), (O = Rc1()), (O.qname = T), K.push(O.simple);
          if ((z = K4.ref.exec(_))) {
            (_ = _.substring(z[0].length)), (f = qH_.ref(As6(K), H9H(z[1]))), $.push(f.combinator), (K = []);
            continue;
          }
          if ((z = K4.combinator.exec(_))) {
            if (((_ = _.substring(z[0].length)), (A = z[1] || z[2] || z[3]), A === ",")) {
              $.push(qH_.noop(As6(K)));
              break;
            }
          } else A = "noop";
          if (!qH_[A]) throw SyntaxError("Bad combinator.");
          $.push(qH_[A](As6(K))), (K = []);
        }
        if (((q = Gc1($)), (q.qname = T), (q.sel = _), O))
          (O.lname = q.qname), (O.test = q), (O.qname = O.qname), (O.sel = q.sel), (q = O);
        if (f) (f.test = q), (f.qname = q.qname), (f.sel = q.sel), (q = f);
        return q;
      },
      ig_ = function (H, _) {
        if (_) return H === "*" ? bP["*"] : bP.type(H);
        if (H[1])
          return H[1][0] === "."
            ? bP.attr("class", "~=", H9H(H[1].substring(1)), !1)
            : bP.attr("id", "=", H9H(H[1].substring(1)), !1);
        if (H[2]) return H[3] ? bP[H9H(H[2])](C69(H[3])) : bP[H9H(H[2])];
        if (H[4]) {
          var q = H[6],
            $ = /["'\s]\s*I$/i.test(q);
          if ($) q = q.replace(/\s*I$/i, "");
          return bP.attr(H9H(H[4]), H[5] || "-", C69(q), $);
        }
        throw SyntaxError("Unknown Selector.");
      },
      As6 = function (H) {
        var _ = H.length,
          q;
        if (_ < 2) return H[0];
        return function ($) {
          if (!$) return;
          for (q = 0; q < _; q++) if (!H[q]($)) return;
          return !0;
        };
      },
      Gc1 = function (H) {
        if (H.length < 2)
          return function (_) {
            return !!H[0](_);
          };
        return function (_) {
          var q = H.length;
          while (q--) if (!(_ = H[q](_))) return;
          return !0;
        };
      },
      Rc1 = function () {
        var H;
        function _(q) {
          var $ = q.ownerDocument,
            K = $.getElementsByTagName(_.lname),
            O = K.length;
          while (O--) if (_.test(K[O]) && H === q) return (H = null), !0;
          H = null;
        }
        return (
          (_.simple = function (q) {
            return (H = q), !0;
          }),
          _
        );
      },
      fs6 = function (H) {
        var _ = $H_(H),
          q = [_];
        while (_.sel) (_ = $H_(_.sel)), q.push(_);
        if (q.length < 2) return _;
        return function ($) {
          var K = q.length,
            O = 0;
          for (; O < K; O++) if (q[O]($)) return !0;
        };
      },
      x69 = function (H, _) {
        var q = [],
          $ = $H_(H),
          K = _.getElementsByTagName($.qname),
          O = 0,
          T;
        while ((T = K[O++])) if ($(T)) q.push(T);
        if ($.sel) {
          while ($.sel) {
            ($ = $H_($.sel)), (K = _.getElementsByTagName($.qname)), (O = 0);
            while ((T = K[O++])) if ($(T) && Xc1.call(q, T) === -1) q.push(T);
          }
          q.sort(Mc1);
        }
        return q;
      };
    m69.exports = wyH = function (H, _) {
      var q, $;
      if (_.nodeType !== 11 && H.indexOf(" ") === -1) {
        if (H[0] === "#" && _.rooted && /^#[A-Z_][-A-Z0-9_]*$/i.test(H)) {
          if (_.doc._hasMultipleElementsWithId) {
            if (((q = H.substring(1)), !_.doc._hasMultipleElementsWithId(q)))
              return ($ = _.doc.getElementById(q)), $ ? [$] : [];
          }
        }
        if (H[0] === "." && /^\.\w+$/.test(H)) return _.getElementsByClassName(H.substring(1));
        if (/^\w+$/.test(H)) return _.getElementsByTagName(H);
      }
      return x69(H, _);
    };
    wyH.selectors = bP;
    wyH.operators = u69;
    wyH.combinators = qH_;
    wyH.matches = function (H, _) {
      var q = { sel: _ };
      do if (((q = $H_(q.sel)), q(H))) return !0;
      while (q.sel);
      return !1;
    };
  });

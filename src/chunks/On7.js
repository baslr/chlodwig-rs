  var On7 = d((in6) => {
    var VtH = WtH().NAMESPACE,
      ln6 =
        /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      ti7 = new RegExp("[\\-\\.0-9" + ln6.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"),
      ei7 = new RegExp("^" + ln6.source + ti7.source + "*(?::" + ln6.source + ti7.source + "*)?$"),
      NtH = 0,
      h7H = 1,
      $hH = 2,
      htH = 3,
      KhH = 4,
      OhH = 5,
      ytH = 6,
      Yp_ = 7;
    function ThH(H, _) {
      if (((this.message = H), (this.locator = _), Error.captureStackTrace)) Error.captureStackTrace(this, ThH);
    }
    ThH.prototype = Error();
    ThH.prototype.name = ThH.name;
    function qn7() {}
    qn7.prototype = {
      parse: function (H, _, q) {
        var $ = this.domBuilder;
        $.startDocument(), $n7(_, (_ = {})), NI1(H, _, q, $, this.errorHandler), $.endDocument();
      },
    };
    function NI1(H, _, q, $, K) {
      function O(c) {
        if (c > 65535) {
          c -= 65536;
          var U = 55296 + (c >> 10),
            i = 56320 + (c & 1023);
          return String.fromCharCode(U, i);
        } else return String.fromCharCode(c);
      }
      function T(c) {
        var U = c.slice(1, -1);
        if (Object.hasOwnProperty.call(q, U)) return q[U];
        else if (U.charAt(0) === "#") return O(parseInt(U.substr(1).replace("x", "0x")));
        else return K.error("entity not found:" + c), c;
      }
      function z(c) {
        if (c > J) {
          var U = H.substring(J, c).replace(/&#?\w+;/g, T);
          D && A(J), $.characters(U, 0, c - J), (J = c);
        }
      }
      function A(c, U) {
        while (c >= w && (U = Y.exec(H))) (f = U.index), (w = f + U[0].length), D.lineNumber++;
        D.columnNumber = c - f + 1;
      }
      var f = 0,
        w = 0,
        Y = /.*(?:\r\n?|\n)|.*$/g,
        D = $.locator,
        j = [{ currentNSMap: _ }],
        M = {},
        J = 0;
      while (!0) {
        try {
          var P = H.indexOf("<", J);
          if (P < 0) {
            if (!H.substr(J).match(/^\s*$/)) {
              var X = $.doc,
                R = X.createTextNode(H.substr(J));
              X.appendChild(R), ($.currentElement = R);
            }
            return;
          }
          if (P > J) z(P);
          switch (H.charAt(P + 1)) {
            case "/":
              var I = H.indexOf(">", P + 3),
                W = H.substring(P + 2, I).replace(/[ \t\n\r]+$/g, ""),
                Z = j.pop();
              if (I < 0)
                (W = H.substring(P + 2).replace(/[\s<].*/, "")),
                  K.error("end tag name: " + W + " is not complete:" + Z.tagName),
                  (I = P + 1 + W.length);
              else if (W.match(/\s</))
                (W = W.replace(/[\s<].*/, "")),
                  K.error("end tag name: " + W + " maybe not complete"),
                  (I = P + 1 + W.length);
              var k = Z.localNSMap,
                v = Z.tagName == W,
                y = v || (Z.tagName && Z.tagName.toLowerCase() == W.toLowerCase());
              if (y) {
                if (($.endElement(Z.uri, Z.localName, W), k)) {
                  for (var E in k) if (Object.prototype.hasOwnProperty.call(k, E)) $.endPrefixMapping(E);
                }
                if (!v) K.fatalError("end tag name: " + W + " is not match the current start tagName:" + Z.tagName);
              } else j.push(Z);
              I++;
              break;
            case "?":
              D && A(P), (I = EI1(H, P, $));
              break;
            case "!":
              D && A(P), (I = SI1(H, P, $, K));
              break;
            default:
              D && A(P);
              var S = new Kn7(),
                x = j[j.length - 1].currentNSMap,
                I = hI1(H, P, S, x, T, K),
                B = S.length;
              if (!S.closed && VI1(H, I, S.tagName, M)) {
                if (((S.closed = !0), !q.nbsp)) K.warning("unclosed xml attribute");
              }
              if (D && B) {
                var p = Hn7(D, {});
                for (var C = 0; C < B; C++) {
                  var g = S[C];
                  A(g.offset), (g.locator = Hn7(D, {}));
                }
                if ((($.locator = p), _n7(S, $, x))) j.push(S);
                $.locator = D;
              } else if (_n7(S, $, x)) j.push(S);
              if (VtH.isHTML(S.uri) && !S.closed) I = yI1(H, I, S.tagName, T, $);
              else I++;
          }
        } catch (c) {
          if (c instanceof ThH) throw c;
          K.error("element parse error: " + c), (I = -1);
        }
        if (I > J) J = I;
        else z(Math.max(P, J) + 1);
      }
    }
    function Hn7(H, _) {
      return (_.lineNumber = H.lineNumber), (_.columnNumber = H.columnNumber), _;
    }
    function hI1(H, _, q, $, K, O) {
      function T(j, M, J) {
        if (q.attributeNames.hasOwnProperty(j)) O.fatalError("Attribute " + j + " redefined");
        q.addValue(j, M.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, K), J);
      }
      var z,
        A,
        f = ++_,
        w = NtH;
      while (!0) {
        var Y = H.charAt(f);
        switch (Y) {
          case "=":
            if (w === h7H) (z = H.slice(_, f)), (w = htH);
            else if (w === $hH) w = htH;
            else throw Error("attribute equal must after attrName");
            break;
          case "'":
          case '"':
            if (w === htH || w === h7H) {
              if (w === h7H) O.warning('attribute value must after "="'), (z = H.slice(_, f));
              if (((_ = f + 1), (f = H.indexOf(Y, _)), f > 0)) (A = H.slice(_, f)), T(z, A, _ - 1), (w = OhH);
              else throw Error("attribute value no end '" + Y + "' match");
            } else if (w == KhH)
              (A = H.slice(_, f)),
                T(z, A, _),
                O.warning('attribute "' + z + '" missed start quot(' + Y + ")!!"),
                (_ = f + 1),
                (w = OhH);
            else throw Error('attribute value must after "="');
            break;
          case "/":
            switch (w) {
              case NtH:
                q.setTagName(H.slice(_, f));
              case OhH:
              case ytH:
              case Yp_:
                (w = Yp_), (q.closed = !0);
              case KhH:
              case h7H:
                break;
              case $hH:
                q.closed = !0;
                break;
              default:
                throw Error("attribute invalid close char('/')");
            }
            break;
          case "":
            if ((O.error("unexpected end of input"), w == NtH)) q.setTagName(H.slice(_, f));
            return f;
          case ">":
            switch (w) {
              case NtH:
                q.setTagName(H.slice(_, f));
              case OhH:
              case ytH:
              case Yp_:
                break;
              case KhH:
              case h7H:
                if (((A = H.slice(_, f)), A.slice(-1) === "/")) (q.closed = !0), (A = A.slice(0, -1));
              case $hH:
                if (w === $hH) A = z;
                if (w == KhH) O.warning('attribute "' + A + '" missed quot(")!'), T(z, A, _);
                else {
                  if (!VtH.isHTML($[""]) || !A.match(/^(?:disabled|checked|selected)$/i))
                    O.warning('attribute "' + A + '" missed value!! "' + A + '" instead!!');
                  T(A, A, _);
                }
                break;
              case htH:
                throw Error("attribute value missed!!");
            }
            return f;
          case "\x80":
            Y = " ";
          default:
            if (Y <= " ")
              switch (w) {
                case NtH:
                  q.setTagName(H.slice(_, f)), (w = ytH);
                  break;
                case h7H:
                  (z = H.slice(_, f)), (w = $hH);
                  break;
                case KhH:
                  var A = H.slice(_, f);
                  O.warning('attribute "' + A + '" missed quot(")!!'), T(z, A, _);
                case OhH:
                  w = ytH;
                  break;
              }
            else
              switch (w) {
                case $hH:
                  var D = q.tagName;
                  if (!VtH.isHTML($[""]) || !z.match(/^(?:disabled|checked|selected)$/i))
                    O.warning('attribute "' + z + '" missed value!! "' + z + '" instead2!!');
                  T(z, z, _), (_ = f), (w = h7H);
                  break;
                case OhH:
                  O.warning('attribute space is required"' + z + '"!!');
                case ytH:
                  (w = h7H), (_ = f);
                  break;
                case htH:
                  (w = KhH), (_ = f);
                  break;
                case Yp_:
                  throw Error("elements closed character '/' and '>' must be connected to");
              }
        }
        f++;
      }
    }
    function _n7(H, _, q) {
      var $ = H.tagName,
        K = null,
        Y = H.length;
      while (Y--) {
        var O = H[Y],
          T = O.qName,
          z = O.value,
          D = T.indexOf(":");
        if (D > 0)
          var A = (O.prefix = T.slice(0, D)),
            f = T.slice(D + 1),
            w = A === "xmlns" && f;
        else (f = T), (A = null), (w = T === "xmlns" && "");
        if (((O.localName = f), w !== !1)) {
          if (K == null) (K = {}), $n7(q, (q = {}));
          (q[w] = K[w] = z), (O.uri = VtH.XMLNS), _.startPrefixMapping(w, z);
        }
      }
      var Y = H.length;
      while (Y--) {
        O = H[Y];
        var A = O.prefix;
        if (A) {
          if (A === "xml") O.uri = VtH.XML;
          if (A !== "xmlns") O.uri = q[A || ""];
        }
      }
      var D = $.indexOf(":");
      if (D > 0) (A = H.prefix = $.slice(0, D)), (f = H.localName = $.slice(D + 1));
      else (A = null), (f = H.localName = $);
      var j = (H.uri = q[A || ""]);
      if ((_.startElement(j, f, $, H), H.closed)) {
        if ((_.endElement(j, f, $), K)) {
          for (A in K) if (Object.prototype.hasOwnProperty.call(K, A)) _.endPrefixMapping(A);
        }
      } else return (H.currentNSMap = q), (H.localNSMap = K), !0;
    }
    function yI1(H, _, q, $, K) {
      if (/^(?:script|textarea)$/i.test(q)) {
        var O = H.indexOf("</" + q + ">", _),
          T = H.substring(_ + 1, O);
        if (/[&<]/.test(T)) {
          if (/^script$/i.test(q)) return K.characters(T, 0, T.length), O;
          return (T = T.replace(/&#?\w+;/g, $)), K.characters(T, 0, T.length), O;
        }
      }
      return _ + 1;
    }
    function VI1(H, _, q, $) {
      var K = $[q];
      if (K == null) {
        if (((K = H.lastIndexOf("</" + q + ">")), K < _)) K = H.lastIndexOf("</" + q);
        $[q] = K;
      }
      return K < _;
    }
    function $n7(H, _) {
      for (var q in H) if (Object.prototype.hasOwnProperty.call(H, q)) _[q] = H[q];
    }
    function SI1(H, _, q, $) {
      var K = H.charAt(_ + 2);
      switch (K) {
        case "-":
          if (H.charAt(_ + 3) === "-") {
            var O = H.indexOf("-->", _ + 4);
            if (O > _) return q.comment(H, _ + 4, O - _ - 4), O + 3;
            else return $.error("Unclosed comment"), -1;
          } else return -1;
        default:
          if (H.substr(_ + 3, 6) == "CDATA[") {
            var O = H.indexOf("]]>", _ + 9);
            return q.startCDATA(), q.characters(H, _ + 9, O - _ - 9), q.endCDATA(), O + 3;
          }
          var T = CI1(H, _),
            z = T.length;
          if (z > 1 && /!doctype/i.test(T[0][0])) {
            var A = T[1][0],
              f = !1,
              w = !1;
            if (z > 3) {
              if (/^public$/i.test(T[2][0])) (f = T[3][0]), (w = z > 4 && T[4][0]);
              else if (/^system$/i.test(T[2][0])) w = T[3][0];
            }
            var Y = T[z - 1];
            return q.startDTD(A, f, w), q.endDTD(), Y.index + Y[0].length;
          }
      }
      return -1;
    }
    function EI1(H, _, q) {
      var $ = H.indexOf("?>", _);
      if ($) {
        var K = H.substring(_, $).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
        if (K) {
          var O = K[0].length;
          return q.processingInstruction(K[1], K[2]), $ + 2;
        } else return -1;
      }
      return -1;
    }
    function Kn7() {
      this.attributeNames = {};
    }
    Kn7.prototype = {
      setTagName: function (H) {
        if (!ei7.test(H)) throw Error("invalid tagName:" + H);
        this.tagName = H;
      },
      addValue: function (H, _, q) {
        if (!ei7.test(H)) throw Error("invalid attribute:" + H);
        (this.attributeNames[H] = this.length), (this[this.length++] = { qName: H, value: _, offset: q });
      },
      length: 0,
      getLocalName: function (H) {
        return this[H].localName;
      },
      getLocator: function (H) {
        return this[H].locator;
      },
      getQName: function (H) {
        return this[H].qName;
      },
      getURI: function (H) {
        return this[H].uri;
      },
      getValue: function (H) {
        return this[H].value;
      },
    };
    function CI1(H, _) {
      var q,
        $ = [],
        K = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
      (K.lastIndex = _), K.exec(H);
      while ((q = K.exec(H))) if (($.push(q), q[1])) return $;
    }
    in6.XMLReader = qn7;
    in6.ParseError = ThH;
  });

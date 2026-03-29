  var zd7 = d((VgO, Td7) => {
    var $v1 = 1 / 0,
      Kv1 = "[object Symbol]",
      Ov1 = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,
      Tv1 = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,
      iu_ = "\\ud800-\\udfff",
      Qg7 = "\\u0300-\\u036f\\ufe20-\\ufe23",
      lg7 = "\\u20d0-\\u20f0",
      ig7 = "\\u2700-\\u27bf",
      ng7 = "a-z\\xdf-\\xf6\\xf8-\\xff",
      zv1 = "\\xac\\xb1\\xd7\\xf7",
      Av1 = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",
      fv1 = "\\u2000-\\u206f",
      wv1 =
        " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",
      rg7 = "A-Z\\xc0-\\xd6\\xd8-\\xde",
      og7 = "\\ufe0e\\ufe0f",
      ag7 = zv1 + Av1 + fv1 + wv1,
      BQ6 = "['\u2019]",
      Yv1 = "[" + iu_ + "]",
      pg7 = "[" + ag7 + "]",
      lu_ = "[" + Qg7 + lg7 + "]",
      sg7 = "\\d+",
      Dv1 = "[" + ig7 + "]",
      tg7 = "[" + ng7 + "]",
      eg7 = "[^" + iu_ + ag7 + sg7 + ig7 + ng7 + rg7 + "]",
      pQ6 = "\\ud83c[\\udffb-\\udfff]",
      jv1 = "(?:" + lu_ + "|" + pQ6 + ")",
      Hd7 = "[^" + iu_ + "]",
      gQ6 = "(?:\\ud83c[\\udde6-\\uddff]){2}",
      dQ6 = "[\\ud800-\\udbff][\\udc00-\\udfff]",
      XNH = "[" + rg7 + "]",
      _d7 = "\\u200d",
      Bg7 = "(?:" + tg7 + "|" + eg7 + ")",
      Mv1 = "(?:" + XNH + "|" + eg7 + ")",
      gg7 = "(?:" + BQ6 + "(?:d|ll|m|re|s|t|ve))?",
      dg7 = "(?:" + BQ6 + "(?:D|LL|M|RE|S|T|VE))?",
      qd7 = jv1 + "?",
      $d7 = "[" + og7 + "]?",
      Jv1 = "(?:" + _d7 + "(?:" + [Hd7, gQ6, dQ6].join("|") + ")" + $d7 + qd7 + ")*",
      Kd7 = $d7 + qd7 + Jv1,
      Pv1 = "(?:" + [Dv1, gQ6, dQ6].join("|") + ")" + Kd7,
      Xv1 = "(?:" + [Hd7 + lu_ + "?", lu_, gQ6, dQ6, Yv1].join("|") + ")",
      Wv1 = RegExp(BQ6, "g"),
      Gv1 = RegExp(lu_, "g"),
      Rv1 = RegExp(pQ6 + "(?=" + pQ6 + ")|" + Xv1 + Kd7, "g"),
      Zv1 = RegExp(
        [
          XNH + "?" + tg7 + "+" + gg7 + "(?=" + [pg7, XNH, "$"].join("|") + ")",
          Mv1 + "+" + dg7 + "(?=" + [pg7, XNH + Bg7, "$"].join("|") + ")",
          XNH + "?" + Bg7 + "+" + gg7,
          XNH + "+" + dg7,
          sg7,
          Pv1,
        ].join("|"),
        "g",
      ),
      Lv1 = RegExp("[" + _d7 + iu_ + Qg7 + lg7 + og7 + "]"),
      kv1 = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
      vv1 = {
        "\xC0": "A",
        "\xC1": "A",
        "\xC2": "A",
        "\xC3": "A",
        "\xC4": "A",
        "\xC5": "A",
        "\xE0": "a",
        "\xE1": "a",
        "\xE2": "a",
        "\xE3": "a",
        "\xE4": "a",
        "\xE5": "a",
        "\xC7": "C",
        "\xE7": "c",
        "\xD0": "D",
        "\xF0": "d",
        "\xC8": "E",
        "\xC9": "E",
        "\xCA": "E",
        "\xCB": "E",
        "\xE8": "e",
        "\xE9": "e",
        "\xEA": "e",
        "\xEB": "e",
        "\xCC": "I",
        "\xCD": "I",
        "\xCE": "I",
        "\xCF": "I",
        "\xEC": "i",
        "\xED": "i",
        "\xEE": "i",
        "\xEF": "i",
        "\xD1": "N",
        "\xF1": "n",
        "\xD2": "O",
        "\xD3": "O",
        "\xD4": "O",
        "\xD5": "O",
        "\xD6": "O",
        "\xD8": "O",
        "\xF2": "o",
        "\xF3": "o",
        "\xF4": "o",
        "\xF5": "o",
        "\xF6": "o",
        "\xF8": "o",
        "\xD9": "U",
        "\xDA": "U",
        "\xDB": "U",
        "\xDC": "U",
        "\xF9": "u",
        "\xFA": "u",
        "\xFB": "u",
        "\xFC": "u",
        "\xDD": "Y",
        "\xFD": "y",
        "\xFF": "y",
        "\xC6": "Ae",
        "\xE6": "ae",
        "\xDE": "Th",
        "\xFE": "th",
        "\xDF": "ss",
        "\u0100": "A",
        "\u0102": "A",
        "\u0104": "A",
        "\u0101": "a",
        "\u0103": "a",
        "\u0105": "a",
        "\u0106": "C",
        "\u0108": "C",
        "\u010A": "C",
        "\u010C": "C",
        "\u0107": "c",
        "\u0109": "c",
        "\u010B": "c",
        "\u010D": "c",
        "\u010E": "D",
        "\u0110": "D",
        "\u010F": "d",
        "\u0111": "d",
        "\u0112": "E",
        "\u0114": "E",
        "\u0116": "E",
        "\u0118": "E",
        "\u011A": "E",
        "\u0113": "e",
        "\u0115": "e",
        "\u0117": "e",
        "\u0119": "e",
        "\u011B": "e",
        "\u011C": "G",
        "\u011E": "G",
        "\u0120": "G",
        "\u0122": "G",
        "\u011D": "g",
        "\u011F": "g",
        "\u0121": "g",
        "\u0123": "g",
        "\u0124": "H",
        "\u0126": "H",
        "\u0125": "h",
        "\u0127": "h",
        "\u0128": "I",
        "\u012A": "I",
        "\u012C": "I",
        "\u012E": "I",
        "\u0130": "I",
        "\u0129": "i",
        "\u012B": "i",
        "\u012D": "i",
        "\u012F": "i",
        "\u0131": "i",
        "\u0134": "J",
        "\u0135": "j",
        "\u0136": "K",
        "\u0137": "k",
        "\u0138": "k",
        "\u0139": "L",
        "\u013B": "L",
        "\u013D": "L",
        "\u013F": "L",
        "\u0141": "L",
        "\u013A": "l",
        "\u013C": "l",
        "\u013E": "l",
        "\u0140": "l",
        "\u0142": "l",
        "\u0143": "N",
        "\u0145": "N",
        "\u0147": "N",
        "\u014A": "N",
        "\u0144": "n",
        "\u0146": "n",
        "\u0148": "n",
        "\u014B": "n",
        "\u014C": "O",
        "\u014E": "O",
        "\u0150": "O",
        "\u014D": "o",
        "\u014F": "o",
        "\u0151": "o",
        "\u0154": "R",
        "\u0156": "R",
        "\u0158": "R",
        "\u0155": "r",
        "\u0157": "r",
        "\u0159": "r",
        "\u015A": "S",
        "\u015C": "S",
        "\u015E": "S",
        "\u0160": "S",
        "\u015B": "s",
        "\u015D": "s",
        "\u015F": "s",
        "\u0161": "s",
        "\u0162": "T",
        "\u0164": "T",
        "\u0166": "T",
        "\u0163": "t",
        "\u0165": "t",
        "\u0167": "t",
        "\u0168": "U",
        "\u016A": "U",
        "\u016C": "U",
        "\u016E": "U",
        "\u0170": "U",
        "\u0172": "U",
        "\u0169": "u",
        "\u016B": "u",
        "\u016D": "u",
        "\u016F": "u",
        "\u0171": "u",
        "\u0173": "u",
        "\u0174": "W",
        "\u0175": "w",
        "\u0176": "Y",
        "\u0177": "y",
        "\u0178": "Y",
        "\u0179": "Z",
        "\u017B": "Z",
        "\u017D": "Z",
        "\u017A": "z",
        "\u017C": "z",
        "\u017E": "z",
        "\u0132": "IJ",
        "\u0133": "ij",
        "\u0152": "Oe",
        "\u0153": "oe",
        "\u0149": "'n",
        "\u017F": "ss",
      },
      Nv1 = typeof global == "object" && global && global.Object === Object && global,
      hv1 = typeof self == "object" && self && self.Object === Object && self,
      yv1 = Nv1 || hv1 || Function("return this")();
    function Vv1(H, _, q, $) {
      var K = -1,
        O = H ? H.length : 0;
      if ($ && O) q = H[++K];
      while (++K < O) q = _(q, H[K], K, H);
      return q;
    }
    function Sv1(H) {
      return H.split("");
    }
    function Ev1(H) {
      return H.match(Ov1) || [];
    }
    function Cv1(H) {
      return function (_) {
        return H == null ? void 0 : H[_];
      };
    }
    var bv1 = Cv1(vv1);
    function Od7(H) {
      return Lv1.test(H);
    }
    function Iv1(H) {
      return kv1.test(H);
    }
    function uv1(H) {
      return Od7(H) ? xv1(H) : Sv1(H);
    }
    function xv1(H) {
      return H.match(Rv1) || [];
    }
    function mv1(H) {
      return H.match(Zv1) || [];
    }
    var pv1 = Object.prototype,
      Bv1 = pv1.toString,
      cg7 = yv1.Symbol,
      Fg7 = cg7 ? cg7.prototype : void 0,
      Ug7 = Fg7 ? Fg7.toString : void 0;
    function gv1(H, _, q) {
      var $ = -1,
        K = H.length;
      if (_ < 0) _ = -_ > K ? 0 : K + _;
      if (((q = q > K ? K : q), q < 0)) q += K;
      (K = _ > q ? 0 : (q - _) >>> 0), (_ >>>= 0);
      var O = Array(K);
      while (++$ < K) O[$] = H[$ + _];
      return O;
    }
    function dv1(H) {
      if (typeof H == "string") return H;
      if (lv1(H)) return Ug7 ? Ug7.call(H) : "";
      var _ = H + "";
      return _ == "0" && 1 / H == -$v1 ? "-0" : _;
    }
    function cv1(H, _, q) {
      var $ = H.length;
      return (q = q === void 0 ? $ : q), !_ && q >= $ ? H : gv1(H, _, q);
    }
    function Fv1(H) {
      return function (_) {
        _ = nu_(_);
        var q = Od7(_) ? uv1(_) : void 0,
          $ = q ? q[0] : _.charAt(0),
          K = q ? cv1(q, 1).join("") : _.slice(1);
        return $[H]() + K;
      };
    }
    function Uv1(H) {
      return function (_) {
        return Vv1(av1(rv1(_).replace(Wv1, "")), H, "");
      };
    }
    function Qv1(H) {
      return !!H && typeof H == "object";
    }
    function lv1(H) {
      return typeof H == "symbol" || (Qv1(H) && Bv1.call(H) == Kv1);
    }
    function nu_(H) {
      return H == null ? "" : dv1(H);
    }
    var iv1 = Uv1(function (H, _, q) {
      return (_ = _.toLowerCase()), H + (q ? nv1(_) : _);
    });
    function nv1(H) {
      return ov1(nu_(H).toLowerCase());
    }
    function rv1(H) {
      return (H = nu_(H)), H && H.replace(Tv1, bv1).replace(Gv1, "");
    }
    var ov1 = Fv1("toUpperCase");
    function av1(H, _, q) {
      if (((H = nu_(H)), (_ = q ? void 0 : _), _ === void 0)) return Iv1(H) ? mv1(H) : Ev1(H);
      return H.match(_) || [];
    }
    Td7.exports = iv1;
  });

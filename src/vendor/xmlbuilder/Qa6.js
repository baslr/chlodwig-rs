  var Qa6 = d((JzT, T69) => {
    T69.exports = {
      serializeOne: ad1,
      \u{275}escapeMatchingClosingTag: $69,
      \u{275}escapeClosingCommentTag: K69,
      \u{275}escapeProcessingInstructionContent: O69,
    };
    var q69 = rD(),
      tfH = q69.NAMESPACE,
      e_9 = { STYLE: !0, SCRIPT: !0, XMP: !0, IFRAME: !0, NOEMBED: !0, NOFRAMES: !0, PLAINTEXT: !0 },
      Qd1 = {
        area: !0,
        base: !0,
        basefont: !0,
        bgsound: !0,
        br: !0,
        col: !0,
        embed: !0,
        frame: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0,
      },
      ld1 = {},
      H69 = /[&<>\u00A0]/g,
      _69 = /[&"<>\u00A0]/g;
    function id1(H) {
      if (!H69.test(H)) return H;
      return H.replace(H69, (_) => {
        switch (_) {
          case "&":
            return "&amp;";
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "\xA0":
            return "&nbsp;";
        }
      });
    }
    function nd1(H) {
      if (!_69.test(H)) return H;
      return H.replace(_69, (_) => {
        switch (_) {
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "&":
            return "&amp;";
          case '"':
            return "&quot;";
          case "\xA0":
            return "&nbsp;";
        }
      });
    }
    function rd1(H) {
      var _ = H.namespaceURI;
      if (!_) return H.localName;
      if (_ === tfH.XML) return "xml:" + H.localName;
      if (_ === tfH.XLINK) return "xlink:" + H.localName;
      if (_ === tfH.XMLNS)
        if (H.localName === "xmlns") return "xmlns";
        else return "xmlns:" + H.localName;
      return H.name;
    }
    function $69(H, _) {
      let q = "</" + _;
      if (!H.toLowerCase().includes(q)) return H;
      let $ = [...H],
        K = H.matchAll(new RegExp(q, "ig"));
      for (let O of K) $[O.index] = "&lt;";
      return $.join("");
    }
    var od1 = /--!?>/;
    function K69(H) {
      if (!od1.test(H)) return H;
      return H.replace(/(--\!?)>/g, "$1&gt;");
    }
    function O69(H) {
      return H.includes(">") ? H.replaceAll(">", "&gt;") : H;
    }
    function ad1(H, _) {
      var q = "";
      switch (H.nodeType) {
        case 1:
          var $ = H.namespaceURI,
            K = $ === tfH.HTML,
            O = K || $ === tfH.SVG || $ === tfH.MATHML ? H.localName : H.tagName;
          q += "<" + O;
          for (var T = 0, z = H._numattrs; T < z; T++) {
            var A = H._attr(T);
            if (((q += " " + rd1(A)), A.value !== void 0)) q += '="' + nd1(A.value) + '"';
          }
          if (((q += ">"), !(K && Qd1[O]))) {
            var f = H.serialize();
            if (e_9[O.toUpperCase()]) f = $69(f, O);
            if (
              K &&
              ld1[O] &&
              f.charAt(0) ===
                `
`
            )
              q += `
`;
            (q += f), (q += "</" + O + ">");
          }
          break;
        case 3:
        case 4:
          var w;
          if (_.nodeType === 1 && _.namespaceURI === tfH.HTML) w = _.tagName;
          else w = "";
          if (e_9[w] || (w === "NOSCRIPT" && _.ownerDocument._scripting_enabled)) q += H.data;
          else q += id1(H.data);
          break;
        case 8:
          q += "<!--" + K69(H.data) + "-->";
          break;
        case 7:
          let Y = O69(H.data);
          q += "<?" + H.target + " " + Y + "?>";
          break;
        case 10:
          (q += "<!DOCTYPE " + H.name), (q += ">");
          break;
        default:
          q69.InvalidStateError();
      }
      return q;
    }
  });

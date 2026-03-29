  var Xn7 = d((Pn7) => {
    var { DOMParser: BI1 } = Mn7();
    Pn7.parse = dI1;
    var Jp_ = 3,
      Jn7 = 4,
      gI1 = 8;
    function rn6(H) {
      return H.nodeType === Jp_ || H.nodeType === gI1 || H.nodeType === Jn7;
    }
    function zo(H) {
      if (!H.childNodes || H.childNodes.length === 0) return !0;
      else return !1;
    }
    function AfH(H, _) {
      if (!H) throw Error(_);
    }
    function dI1(H) {
      var _ = new BI1().parseFromString(H);
      AfH(_.documentElement.nodeName === "plist", "malformed document. First element should be <plist>");
      var q = AhH(_.documentElement);
      if (q.length == 1) q = q[0];
      return q;
    }
    function AhH(H) {
      var _, q, $, K, O, T, z, A;
      if (!H) return null;
      if (H.nodeName === "plist") {
        if (((O = []), zo(H))) return O;
        for (_ = 0; _ < H.childNodes.length; _++) if (!rn6(H.childNodes[_])) O.push(AhH(H.childNodes[_]));
        return O;
      } else if (H.nodeName === "dict") {
        if (((q = {}), ($ = null), (z = 0), zo(H))) return q;
        for (_ = 0; _ < H.childNodes.length; _++) {
          if (rn6(H.childNodes[_])) continue;
          if (z % 2 === 0)
            AfH(H.childNodes[_].nodeName === "key", "Missing key while parsing <dict/>."), ($ = AhH(H.childNodes[_]));
          else
            AfH(
              H.childNodes[_].nodeName !== "key",
              'Unexpected key "' + AhH(H.childNodes[_]) + '" while parsing <dict/>.',
            ),
              (q[$] = AhH(H.childNodes[_]));
          z += 1;
        }
        if (z % 2 === 1) q[$] = "";
        return q;
      } else if (H.nodeName === "array") {
        if (((O = []), zo(H))) return O;
        for (_ = 0; _ < H.childNodes.length; _++)
          if (!rn6(H.childNodes[_])) {
            if (((T = AhH(H.childNodes[_])), T != null)) O.push(T);
          }
        return O;
      } else if (H.nodeName === "#text");
      else if (H.nodeName === "key") {
        if (zo(H)) return "";
        return (
          AfH(
            H.childNodes[0].nodeValue !== "__proto__",
            "__proto__ keys can lead to prototype pollution. More details on CVE-2022-22912",
          ),
          H.childNodes[0].nodeValue
        );
      } else if (H.nodeName === "string") {
        if (((T = ""), zo(H))) return T;
        for (_ = 0; _ < H.childNodes.length; _++) {
          var A = H.childNodes[_].nodeType;
          if (A === Jp_ || A === Jn7) T += H.childNodes[_].nodeValue;
        }
        return T;
      } else if (H.nodeName === "integer")
        return AfH(!zo(H), 'Cannot parse "" as integer.'), parseInt(H.childNodes[0].nodeValue, 10);
      else if (H.nodeName === "real") {
        AfH(!zo(H), 'Cannot parse "" as real.'), (T = "");
        for (_ = 0; _ < H.childNodes.length; _++) if (H.childNodes[_].nodeType === Jp_) T += H.childNodes[_].nodeValue;
        return parseFloat(T);
      } else if (H.nodeName === "data") {
        if (((T = ""), zo(H))) return Buffer.from(T, "base64");
        for (_ = 0; _ < H.childNodes.length; _++)
          if (H.childNodes[_].nodeType === Jp_) T += H.childNodes[_].nodeValue.replace(/\s+/g, "");
        return Buffer.from(T, "base64");
      } else if (H.nodeName === "date")
        return AfH(!zo(H), 'Cannot parse "" as Date.'), new Date(H.childNodes[0].nodeValue);
      else if (H.nodeName === "null") return null;
      else if (H.nodeName === "true") return !0;
      else if (H.nodeName === "false") return !1;
      else throw Error("Invalid PLIST tag " + H.nodeName);
    }
  });

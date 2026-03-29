  var Nk7 = d((_MO, vk7) => {
    var uf1 = vS_().FilterCSS,
      GC = UB6(),
      Lk7 = lB6(),
      xf1 = Lk7.parseTag,
      mf1 = Lk7.parseAttr,
      SS_ = NS_();
    function VS_(H) {
      return H === void 0 || H === null;
    }
    function pf1(H) {
      var _ = SS_.spaceIndex(H);
      if (_ === -1) return { html: "", closing: H[H.length - 2] === "/" };
      H = SS_.trim(H.slice(_ + 1, -1));
      var q = H[H.length - 1] === "/";
      if (q) H = SS_.trim(H.slice(0, -1));
      return { html: H, closing: q };
    }
    function Bf1(H) {
      var _ = {};
      for (var q in H) _[q] = H[q];
      return _;
    }
    function gf1(H) {
      var _ = {};
      for (var q in H)
        if (Array.isArray(H[q]))
          _[q.toLowerCase()] = H[q].map(function ($) {
            return $.toLowerCase();
          });
        else _[q.toLowerCase()] = H[q];
      return _;
    }
    function kk7(H) {
      if (((H = Bf1(H || {})), H.stripIgnoreTag)) {
        if (H.onIgnoreTag)
          console.error('Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time');
        H.onIgnoreTag = GC.onIgnoreTagStripAll;
      }
      if (H.whiteList || H.allowList) H.whiteList = gf1(H.whiteList || H.allowList);
      else H.whiteList = GC.whiteList;
      if (
        ((this.attributeWrapSign = H.singleQuotedAttributeValue === !0 ? "'" : GC.attributeWrapSign),
        (H.onTag = H.onTag || GC.onTag),
        (H.onTagAttr = H.onTagAttr || GC.onTagAttr),
        (H.onIgnoreTag = H.onIgnoreTag || GC.onIgnoreTag),
        (H.onIgnoreTagAttr = H.onIgnoreTagAttr || GC.onIgnoreTagAttr),
        (H.safeAttrValue = H.safeAttrValue || GC.safeAttrValue),
        (H.escapeHtml = H.escapeHtml || GC.escapeHtml),
        (this.options = H),
        H.css === !1)
      )
        this.cssFilter = !1;
      else (H.css = H.css || {}), (this.cssFilter = new uf1(H.css));
    }
    kk7.prototype.process = function (H) {
      if (((H = H || ""), (H = H.toString()), !H)) return "";
      var _ = this,
        q = _.options,
        $ = q.whiteList,
        K = q.onTag,
        O = q.onIgnoreTag,
        T = q.onTagAttr,
        z = q.onIgnoreTagAttr,
        A = q.safeAttrValue,
        f = q.escapeHtml,
        w = _.attributeWrapSign,
        Y = _.cssFilter;
      if (q.stripBlankChar) H = GC.stripBlankChar(H);
      if (!q.allowCommentTag) H = GC.stripCommentTag(H);
      var D = !1;
      if (q.stripIgnoreTagBody) (D = GC.StripTagBody(q.stripIgnoreTagBody, O)), (O = D.onIgnoreTag);
      var j = xf1(
        H,
        function (M, J, P, X, R) {
          var W = { sourcePosition: M, position: J, isClosing: R, isWhite: Object.prototype.hasOwnProperty.call($, P) },
            Z = K(P, X, W);
          if (!VS_(Z)) return Z;
          if (W.isWhite) {
            if (W.isClosing) return "</" + P + ">";
            var k = pf1(X),
              v = $[P],
              y = mf1(k.html, function (E, S) {
                var x = SS_.indexOf(v, E) !== -1,
                  I = T(P, E, S, x);
                if (!VS_(I)) return I;
                if (x)
                  if (((S = A(P, E, S, Y)), S)) return E + "=" + w + S + w;
                  else return E;
                else {
                  if (((I = z(P, E, S, x)), !VS_(I))) return I;
                  return;
                }
              });
            if (((X = "<" + P), y)) X += " " + y;
            if (k.closing) X += " /";
            return (X += ">"), X;
          } else {
            if (((Z = O(P, X, W)), !VS_(Z))) return Z;
            return f(X);
          }
        },
        f,
      );
      if (D) j = D.remove(j);
      return j;
    };
    vk7.exports = kk7;
  });

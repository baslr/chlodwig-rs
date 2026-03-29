  var _d_ = d((QzT, g89) => {
    var { parse: oc1 } = u89();
    g89.exports = function (H) {
      let _ = new B89(H);
      return new Proxy(_, {
        get: function ($, K) {
          return K in $ ? $[K] : $.getPropertyValue(x89(K));
        },
        has: function ($, K) {
          return !0;
        },
        set: function ($, K, O) {
          if (K in $) $[K] = O;
          else $.setProperty(x89(K), O ?? void 0);
          return !0;
        },
      });
    };
    function x89(H) {
      return H.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }
    function B89(H) {
      this._element = H;
    }
    var m89 = "!important";
    function p89(H) {
      let _ = { property: {}, priority: {} };
      if (!H) return _;
      let q = oc1(H);
      if (q.length < 2) return _;
      for (let $ = 0; $ < q.length; $ += 2) {
        let K = q[$],
          O = q[$ + 1];
        if (O.endsWith(m89)) (_.priority[K] = "important"), (O = O.slice(0, -m89.length).trim());
        _.property[K] = O;
      }
      return _;
    }
    var JyH = {};
    B89.prototype = Object.create(Object.prototype, {
      _parsed: {
        get: function () {
          if (!this._parsedStyles || this.cssText !== this._lastParsedText) {
            var H = this.cssText;
            (this._parsedStyles = p89(H)), (this._lastParsedText = H), delete this._names;
          }
          return this._parsedStyles;
        },
      },
      _serialize: {
        value: function () {
          var H = this._parsed,
            _ = "";
          for (var q in H.property) {
            if (_) _ += " ";
            if (((_ += q + ": " + H.property[q]), H.priority[q])) _ += " !" + H.priority[q];
            _ += ";";
          }
          (this.cssText = _), (this._lastParsedText = _), delete this._names;
        },
      },
      cssText: {
        get: function () {
          return this._element.getAttribute("style");
        },
        set: function (H) {
          this._element.setAttribute("style", H);
        },
      },
      length: {
        get: function () {
          if (!this._names) this._names = Object.getOwnPropertyNames(this._parsed.property);
          return this._names.length;
        },
      },
      item: {
        value: function (H) {
          if (!this._names) this._names = Object.getOwnPropertyNames(this._parsed.property);
          return this._names[H];
        },
      },
      getPropertyValue: {
        value: function (H) {
          return (H = H.toLowerCase()), this._parsed.property[H] || "";
        },
      },
      getPropertyPriority: {
        value: function (H) {
          return (H = H.toLowerCase()), this._parsed.priority[H] || "";
        },
      },
      setProperty: {
        value: function (H, _, q) {
          if (((H = H.toLowerCase()), _ === null || _ === void 0)) _ = "";
          if (q === null || q === void 0) q = "";
          if (_ !== JyH) _ = "" + _;
          if (((_ = _.trim()), _ === "")) {
            this.removeProperty(H);
            return;
          }
          if (q !== "" && q !== JyH && !/^important$/i.test(q)) return;
          var $ = this._parsed;
          if (_ === JyH) {
            if (!$.property[H]) return;
            if (q !== "") $.priority[H] = "important";
            else delete $.priority[H];
          } else {
            if (_.indexOf(";") !== -1) return;
            var K = p89(H + ":" + _);
            if (Object.getOwnPropertyNames(K.property).length === 0) return;
            if (Object.getOwnPropertyNames(K.priority).length !== 0) return;
            for (var O in K.property)
              if ((($.property[O] = K.property[O]), q === JyH)) continue;
              else if (q !== "") $.priority[O] = "important";
              else if ($.priority[O]) delete $.priority[O];
          }
          this._serialize();
        },
      },
      setPropertyValue: {
        value: function (H, _) {
          return this.setProperty(H, _, JyH);
        },
      },
      setPropertyPriority: {
        value: function (H, _) {
          return this.setProperty(H, JyH, _);
        },
      },
      removeProperty: {
        value: function (H) {
          H = H.toLowerCase();
          var _ = this._parsed;
          if (H in _.property) delete _.property[H], delete _.priority[H], this._serialize();
        },
      },
    });
  });

  var Dn7 = d((jp_) => {
    var bI1 = WtH(),
      II1 = Qn6(),
      Tn7 = si7(),
      fn7 = On7(),
      uI1 = II1.DOMImplementation,
      zn7 = bI1.NAMESPACE,
      xI1 = fn7.ParseError,
      mI1 = fn7.XMLReader;
    function wn7(H) {
      return H.replace(
        /\r[\n\u0085]/g,
        `
`,
      ).replace(
        /[\r\u0085\u2028]/g,
        `
`,
      );
    }
    function Yn7(H) {
      this.options = H || { locator: {} };
    }
    Yn7.prototype.parseFromString = function (H, _) {
      var q = this.options,
        $ = new mI1(),
        K = q.domBuilder || new StH(),
        O = q.errorHandler,
        T = q.locator,
        z = q.xmlns || {},
        A = /\/x?html?$/.test(_),
        f = A ? Tn7.HTML_ENTITIES : Tn7.XML_ENTITIES;
      if (T) K.setDocumentLocator(T);
      if ((($.errorHandler = pI1(O, K, T)), ($.domBuilder = q.domBuilder || K), A)) z[""] = zn7.HTML;
      z.xml = z.xml || zn7.XML;
      var w = q.normalizeLineEndings || wn7;
      if (H && typeof H === "string") $.parse(w(H), z, f);
      else $.errorHandler.error("invalid doc source");
      return K.doc;
    };
    function pI1(H, _, q) {
      if (!H) {
        if (_ instanceof StH) return _;
        H = _;
      }
      var $ = {},
        K = H instanceof Function;
      q = q || {};
      function O(T) {
        var z = H[T];
        if (!z && K)
          z =
            H.length == 2
              ? function (A) {
                  H(T, A);
                }
              : H;
        $[T] =
          (z &&
            function (A) {
              z("[xmldom " + T + "]\t" + A + nn6(q));
            }) ||
          function () {};
      }
      return O("warning"), O("error"), O("fatalError"), $;
    }
    function StH() {
      this.cdata = !1;
    }
    function zhH(H, _) {
      (_.lineNumber = H.lineNumber), (_.columnNumber = H.columnNumber);
    }
    StH.prototype = {
      startDocument: function () {
        if (((this.doc = new uI1().createDocument(null, null, null)), this.locator))
          this.doc.documentURI = this.locator.systemId;
      },
      startElement: function (H, _, q, $) {
        var K = this.doc,
          O = K.createElementNS(H, q || _),
          T = $.length;
        Dp_(this, O), (this.currentElement = O), this.locator && zhH(this.locator, O);
        for (var z = 0; z < T; z++) {
          var H = $.getURI(z),
            A = $.getValue(z),
            q = $.getQName(z),
            f = K.createAttributeNS(H, q);
          this.locator && zhH($.getLocator(z), f), (f.value = f.nodeValue = A), O.setAttributeNode(f);
        }
      },
      endElement: function (H, _, q) {
        var $ = this.currentElement,
          K = $.tagName;
        this.currentElement = $.parentNode;
      },
      startPrefixMapping: function (H, _) {},
      endPrefixMapping: function (H) {},
      processingInstruction: function (H, _) {
        var q = this.doc.createProcessingInstruction(H, _);
        this.locator && zhH(this.locator, q), Dp_(this, q);
      },
      ignorableWhitespace: function (H, _, q) {},
      characters: function (H, _, q) {
        if (((H = An7.apply(this, arguments)), H)) {
          if (this.cdata) var $ = this.doc.createCDATASection(H);
          else var $ = this.doc.createTextNode(H);
          if (this.currentElement) this.currentElement.appendChild($);
          else if (/^\s*$/.test(H)) this.doc.appendChild($);
          this.locator && zhH(this.locator, $);
        }
      },
      skippedEntity: function (H) {},
      endDocument: function () {
        this.doc.normalize();
      },
      setDocumentLocator: function (H) {
        if ((this.locator = H)) H.lineNumber = 0;
      },
      comment: function (H, _, q) {
        H = An7.apply(this, arguments);
        var $ = this.doc.createComment(H);
        this.locator && zhH(this.locator, $), Dp_(this, $);
      },
      startCDATA: function () {
        this.cdata = !0;
      },
      endCDATA: function () {
        this.cdata = !1;
      },
      startDTD: function (H, _, q) {
        var $ = this.doc.implementation;
        if ($ && $.createDocumentType) {
          var K = $.createDocumentType(H, _, q);
          this.locator && zhH(this.locator, K), Dp_(this, K), (this.doc.doctype = K);
        }
      },
      warning: function (H) {
        console.warn("[xmldom warning]\t" + H, nn6(this.locator));
      },
      error: function (H) {
        console.error("[xmldom error]\t" + H, nn6(this.locator));
      },
      fatalError: function (H) {
        throw new xI1(H, this.locator);
      },
    };
    function nn6(H) {
      if (H)
        return (
          `
@` +
          (H.systemId || "") +
          "#[line:" +
          H.lineNumber +
          ",col:" +
          H.columnNumber +
          "]"
        );
    }
    function An7(H, _, q) {
      if (typeof H == "string") return H.substr(_, q);
      else {
        if (H.length >= _ + q || _) return new java.lang.String(H, _, q) + "";
        return H;
      }
    }
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
      /\w+/g,
      function (H) {
        StH.prototype[H] = function () {
          return null;
        };
      },
    );
    function Dp_(H, _) {
      if (!H.currentElement) H.doc.appendChild(_);
      else H.currentElement.appendChild(_);
    }
    jp_.__DOMHandler = StH;
    jp_.normalizeLineEndings = wn7;
    jp_.DOMParser = Yn7;
  });

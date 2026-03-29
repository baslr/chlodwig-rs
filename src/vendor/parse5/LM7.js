  var LM7 = d((Z7O, ZM7) => {
    var F91 = Vu6(),
      U91 = Su6(),
      Q91 = Eu6(),
      RM7 = w8H(),
      AA = RM7.TAG_NAMES,
      gN_ = RM7.NAMESPACES,
      l91 = { treeAdapter: F91 },
      i91 = /&/g,
      n91 = /\u00a0/g,
      r91 = /"/g,
      o91 = /</g,
      a91 = />/g;
    class qnH {
      constructor(H, _) {
        (this.options = U91(l91, _)),
          (this.treeAdapter = this.options.treeAdapter),
          (this.html = ""),
          (this.startNode = H);
      }
      serialize() {
        return this._serializeChildNodes(this.startNode), this.html;
      }
      _serializeChildNodes(H) {
        let _ = this.treeAdapter.getChildNodes(H);
        if (_)
          for (let q = 0, $ = _.length; q < $; q++) {
            let K = _[q];
            if (this.treeAdapter.isElementNode(K)) this._serializeElement(K);
            else if (this.treeAdapter.isTextNode(K)) this._serializeTextNode(K);
            else if (this.treeAdapter.isCommentNode(K)) this._serializeCommentNode(K);
            else if (this.treeAdapter.isDocumentTypeNode(K)) this._serializeDocumentTypeNode(K);
          }
      }
      _serializeElement(H) {
        let _ = this.treeAdapter.getTagName(H),
          q = this.treeAdapter.getNamespaceURI(H);
        if (
          ((this.html += "<" + _),
          this._serializeAttributes(H),
          (this.html += ">"),
          _ !== AA.AREA &&
            _ !== AA.BASE &&
            _ !== AA.BASEFONT &&
            _ !== AA.BGSOUND &&
            _ !== AA.BR &&
            _ !== AA.COL &&
            _ !== AA.EMBED &&
            _ !== AA.FRAME &&
            _ !== AA.HR &&
            _ !== AA.IMG &&
            _ !== AA.INPUT &&
            _ !== AA.KEYGEN &&
            _ !== AA.LINK &&
            _ !== AA.META &&
            _ !== AA.PARAM &&
            _ !== AA.SOURCE &&
            _ !== AA.TRACK &&
            _ !== AA.WBR)
        ) {
          let $ = _ === AA.TEMPLATE && q === gN_.HTML ? this.treeAdapter.getTemplateContent(H) : H;
          this._serializeChildNodes($), (this.html += "</" + _ + ">");
        }
      }
      _serializeAttributes(H) {
        let _ = this.treeAdapter.getAttrList(H);
        for (let q = 0, $ = _.length; q < $; q++) {
          let K = _[q],
            O = qnH.escapeString(K.value, !0);
          if (((this.html += " "), !K.namespace)) this.html += K.name;
          else if (K.namespace === gN_.XML) this.html += "xml:" + K.name;
          else if (K.namespace === gN_.XMLNS) {
            if (K.name !== "xmlns") this.html += "xmlns:";
            this.html += K.name;
          } else if (K.namespace === gN_.XLINK) this.html += "xlink:" + K.name;
          else this.html += K.prefix + ":" + K.name;
          this.html += '="' + O + '"';
        }
      }
      _serializeTextNode(H) {
        let _ = this.treeAdapter.getTextNodeContent(H),
          q = this.treeAdapter.getParentNode(H),
          $ = void 0;
        if (q && this.treeAdapter.isElementNode(q)) $ = this.treeAdapter.getTagName(q);
        if (
          $ === AA.STYLE ||
          $ === AA.SCRIPT ||
          $ === AA.XMP ||
          $ === AA.IFRAME ||
          $ === AA.NOEMBED ||
          $ === AA.NOFRAMES ||
          $ === AA.PLAINTEXT ||
          $ === AA.NOSCRIPT
        )
          this.html += _;
        else this.html += qnH.escapeString(_, !1);
      }
      _serializeCommentNode(H) {
        this.html += "<!--" + this.treeAdapter.getCommentNodeContent(H) + "-->";
      }
      _serializeDocumentTypeNode(H) {
        let _ = this.treeAdapter.getDocumentTypeNodeName(H);
        this.html += "<" + Q91.serializeContent(_, null, null) + ">";
      }
    }
    qnH.escapeString = function (H, _) {
      if (((H = H.replace(i91, "&amp;").replace(n91, "&nbsp;")), _)) H = H.replace(r91, "&quot;");
      else H = H.replace(o91, "&lt;").replace(a91, "&gt;");
      return H;
    };
    ZM7.exports = qnH;
  });

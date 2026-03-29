  var Qn6 = d((N7H) => {
    var Ei7 = WtH(),
      sc = Ei7.find,
      GtH = Ei7.NAMESPACE;
    function DI1(H) {
      return H !== "";
    }
    function jI1(H) {
      return H ? H.split(/[\t\n\f\r ]+/).filter(DI1) : [];
    }
    function MI1(H, _) {
      if (!H.hasOwnProperty(_)) H[_] = !0;
      return H;
    }
    function ki7(H) {
      if (!H) return [];
      var _ = jI1(H);
      return Object.keys(_.reduce(MI1, {}));
    }
    function JI1(H) {
      return function (_) {
        return H && H.indexOf(_) !== -1;
      };
    }
    function ZtH(H, _) {
      for (var q in H) if (Object.prototype.hasOwnProperty.call(H, q)) _[q] = H[q];
    }
    function nv(H, _) {
      var q = H.prototype;
      if (!(q instanceof _)) {
        let K = function () {};
        var $ = K;
        (K.prototype = _.prototype), (K = new K()), ZtH(q, K), (H.prototype = q = K);
      }
      if (q.constructor != H) {
        if (typeof H != "function") console.error("unknown Class:" + H);
        q.constructor = H;
      }
    }
    var rv = {},
      Mm = (rv.ELEMENT_NODE = 1),
      _hH = (rv.ATTRIBUTE_NODE = 2),
      Op_ = (rv.TEXT_NODE = 3),
      Ci7 = (rv.CDATA_SECTION_NODE = 4),
      bi7 = (rv.ENTITY_REFERENCE_NODE = 5),
      PI1 = (rv.ENTITY_NODE = 6),
      Ii7 = (rv.PROCESSING_INSTRUCTION_NODE = 7),
      ui7 = (rv.COMMENT_NODE = 8),
      xi7 = (rv.DOCUMENT_NODE = 9),
      mi7 = (rv.DOCUMENT_TYPE_NODE = 10),
      Oo = (rv.DOCUMENT_FRAGMENT_NODE = 11),
      XI1 = (rv.NOTATION_NODE = 12),
      lG = {},
      vP = {},
      flO = (lG.INDEX_SIZE_ERR = ((vP[1] = "Index size error"), 1)),
      wlO = (lG.DOMSTRING_SIZE_ERR = ((vP[2] = "DOMString size error"), 2)),
      iv = (lG.HIERARCHY_REQUEST_ERR = ((vP[3] = "Hierarchy request error"), 3)),
      YlO = (lG.WRONG_DOCUMENT_ERR = ((vP[4] = "Wrong document"), 4)),
      DlO = (lG.INVALID_CHARACTER_ERR = ((vP[5] = "Invalid character"), 5)),
      jlO = (lG.NO_DATA_ALLOWED_ERR = ((vP[6] = "No data allowed"), 6)),
      MlO = (lG.NO_MODIFICATION_ALLOWED_ERR = ((vP[7] = "No modification allowed"), 7)),
      pi7 = (lG.NOT_FOUND_ERR = ((vP[8] = "Not found"), 8)),
      JlO = (lG.NOT_SUPPORTED_ERR = ((vP[9] = "Not supported"), 9)),
      vi7 = (lG.INUSE_ATTRIBUTE_ERR = ((vP[10] = "Attribute in use"), 10)),
      PlO = (lG.INVALID_STATE_ERR = ((vP[11] = "Invalid state"), 11)),
      XlO = (lG.SYNTAX_ERR = ((vP[12] = "Syntax error"), 12)),
      WlO = (lG.INVALID_MODIFICATION_ERR = ((vP[13] = "Invalid modification"), 13)),
      GlO = (lG.NAMESPACE_ERR = ((vP[14] = "Invalid namespace"), 14)),
      RlO = (lG.INVALID_ACCESS_ERR = ((vP[15] = "Invalid access"), 15));
    function I2(H, _) {
      if (_ instanceof Error) var q = _;
      else if (((q = this), Error.call(this, vP[H]), (this.message = vP[H]), Error.captureStackTrace))
        Error.captureStackTrace(this, I2);
      if (((q.code = H), _)) this.message = this.message + ": " + _;
      return q;
    }
    I2.prototype = Error.prototype;
    ZtH(lG, I2);
    function Ko() {}
    Ko.prototype = {
      length: 0,
      item: function (H) {
        return H >= 0 && H < this.length ? this[H] : null;
      },
      toString: function (H, _) {
        for (var q = [], $ = 0; $ < this.length; $++) HhH(this[$], q, H, _);
        return q.join("");
      },
      filter: function (H) {
        return Array.prototype.filter.call(this, H);
      },
      indexOf: function (H) {
        return Array.prototype.indexOf.call(this, H);
      },
    };
    function qhH(H, _) {
      (this._node = H), (this._refresh = _), mn6(this);
    }
    function mn6(H) {
      var _ = H._node._inc || H._node.ownerDocument._inc;
      if (H._inc !== _) {
        var q = H._refresh(H._node);
        if ((oi7(H, "length", q.length), !H.$$length || q.length < H.$$length)) {
          for (var $ = q.length; $ in H; $++) if (Object.prototype.hasOwnProperty.call(H, $)) delete H[$];
        }
        ZtH(q, H), (H._inc = _);
      }
    }
    qhH.prototype.item = function (H) {
      return mn6(this), this[H] || null;
    };
    nv(qhH, Ko);
    function Tp_() {}
    function Bi7(H, _) {
      var q = H.length;
      while (q--) if (H[q] === _) return q;
    }
    function Ni7(H, _, q, $) {
      if ($) _[Bi7(_, $)] = q;
      else _[_.length++] = q;
      if (H) {
        q.ownerElement = H;
        var K = H.ownerDocument;
        if (K) $ && ci7(K, H, $), WI1(K, H, q);
      }
    }
    function hi7(H, _, q) {
      var $ = Bi7(_, q);
      if ($ >= 0) {
        var K = _.length - 1;
        while ($ < K) _[$] = _[++$];
        if (((_.length = K), H)) {
          var O = H.ownerDocument;
          if (O) ci7(O, H, q), (q.ownerElement = null);
        }
      } else throw new I2(pi7, Error(H.tagName + "@" + q));
    }
    Tp_.prototype = {
      length: 0,
      item: Ko.prototype.item,
      getNamedItem: function (H) {
        var _ = this.length;
        while (_--) {
          var q = this[_];
          if (q.nodeName == H) return q;
        }
      },
      setNamedItem: function (H) {
        var _ = H.ownerElement;
        if (_ && _ != this._ownerElement) throw new I2(vi7);
        var q = this.getNamedItem(H.nodeName);
        return Ni7(this._ownerElement, this, H, q), q;
      },
      setNamedItemNS: function (H) {
        var _ = H.ownerElement,
          q;
        if (_ && _ != this._ownerElement) throw new I2(vi7);
        return (q = this.getNamedItemNS(H.namespaceURI, H.localName)), Ni7(this._ownerElement, this, H, q), q;
      },
      removeNamedItem: function (H) {
        var _ = this.getNamedItem(H);
        return hi7(this._ownerElement, this, _), _;
      },
      removeNamedItemNS: function (H, _) {
        var q = this.getNamedItemNS(H, _);
        return hi7(this._ownerElement, this, q), q;
      },
      getNamedItemNS: function (H, _) {
        var q = this.length;
        while (q--) {
          var $ = this[q];
          if ($.localName == _ && $.namespaceURI == H) return $;
        }
        return null;
      },
    };
    function gi7() {}
    gi7.prototype = {
      hasFeature: function (H, _) {
        return !0;
      },
      createDocument: function (H, _, q) {
        var $ = new LtH();
        if ((($.implementation = this), ($.childNodes = new Ko()), ($.doctype = q || null), q)) $.appendChild(q);
        if (_) {
          var K = $.createElementNS(H, _);
          $.appendChild(K);
        }
        return $;
      },
      createDocumentType: function (H, _, q) {
        var $ = new fp_();
        return ($.name = H), ($.nodeName = H), ($.publicId = _ || ""), ($.systemId = q || ""), $;
      },
    };
    function iT() {}
    iT.prototype = {
      firstChild: null,
      lastChild: null,
      previousSibling: null,
      nextSibling: null,
      attributes: null,
      parentNode: null,
      childNodes: null,
      ownerDocument: null,
      nodeValue: null,
      namespaceURI: null,
      prefix: null,
      localName: null,
      insertBefore: function (H, _) {
        return zp_(this, H, _);
      },
      replaceChild: function (H, _) {
        if ((zp_(this, H, _, Ui7), _)) this.removeChild(_);
      },
      removeChild: function (H) {
        return Fi7(this, H);
      },
      appendChild: function (H) {
        return this.insertBefore(H, null);
      },
      hasChildNodes: function () {
        return this.firstChild != null;
      },
      cloneNode: function (H) {
        return xn6(this.ownerDocument || this, this, H);
      },
      normalize: function () {
        var H = this.firstChild;
        while (H) {
          var _ = H.nextSibling;
          if (_ && _.nodeType == Op_ && H.nodeType == Op_) this.removeChild(_), H.appendData(_.data);
          else H.normalize(), (H = _);
        }
      },
      isSupported: function (H, _) {
        return this.ownerDocument.implementation.hasFeature(H, _);
      },
      hasAttributes: function () {
        return this.attributes.length > 0;
      },
      lookupPrefix: function (H) {
        var _ = this;
        while (_) {
          var q = _._nsMap;
          if (q) {
            for (var $ in q) if (Object.prototype.hasOwnProperty.call(q, $) && q[$] === H) return $;
          }
          _ = _.nodeType == _hH ? _.ownerDocument : _.parentNode;
        }
        return null;
      },
      lookupNamespaceURI: function (H) {
        var _ = this;
        while (_) {
          var q = _._nsMap;
          if (q) {
            if (Object.prototype.hasOwnProperty.call(q, H)) return q[H];
          }
          _ = _.nodeType == _hH ? _.ownerDocument : _.parentNode;
        }
        return null;
      },
      isDefaultNamespace: function (H) {
        var _ = this.lookupPrefix(H);
        return _ == null;
      },
    };
    function di7(H) {
      return (
        (H == "<" && "&lt;") ||
        (H == ">" && "&gt;") ||
        (H == "&" && "&amp;") ||
        (H == '"' && "&quot;") ||
        "&#" + H.charCodeAt() + ";"
      );
    }
    ZtH(rv, iT);
    ZtH(rv, iT.prototype);
    function RtH(H, _) {
      if (_(H)) return !0;
      if ((H = H.firstChild))
        do if (RtH(H, _)) return !0;
        while ((H = H.nextSibling));
    }
    function LtH() {
      this.ownerDocument = this;
    }
    function WI1(H, _, q) {
      H && H._inc++;
      var $ = q.namespaceURI;
      if ($ === GtH.XMLNS) _._nsMap[q.prefix ? q.localName : ""] = q.value;
    }
    function ci7(H, _, q, $) {
      H && H._inc++;
      var K = q.namespaceURI;
      if (K === GtH.XMLNS) delete _._nsMap[q.prefix ? q.localName : ""];
    }
    function pn6(H, _, q) {
      if (H && H._inc) {
        H._inc++;
        var $ = _.childNodes;
        if (q) $[$.length++] = q;
        else {
          var K = _.firstChild,
            O = 0;
          while (K) ($[O++] = K), (K = K.nextSibling);
          ($.length = O), delete $[$.length];
        }
      }
    }
    function Fi7(H, _) {
      var { previousSibling: q, nextSibling: $ } = _;
      if (q) q.nextSibling = $;
      else H.firstChild = $;
      if ($) $.previousSibling = q;
      else H.lastChild = q;
      return (_.parentNode = null), (_.previousSibling = null), (_.nextSibling = null), pn6(H.ownerDocument, H), _;
    }
    function GI1(H) {
      return (
        H &&
        (H.nodeType === iT.DOCUMENT_NODE || H.nodeType === iT.DOCUMENT_FRAGMENT_NODE || H.nodeType === iT.ELEMENT_NODE)
      );
    }
    function RI1(H) {
      return (
        H &&
        (tc(H) ||
          Bn6(H) ||
          To(H) ||
          H.nodeType === iT.DOCUMENT_FRAGMENT_NODE ||
          H.nodeType === iT.COMMENT_NODE ||
          H.nodeType === iT.PROCESSING_INSTRUCTION_NODE)
      );
    }
    function To(H) {
      return H && H.nodeType === iT.DOCUMENT_TYPE_NODE;
    }
    function tc(H) {
      return H && H.nodeType === iT.ELEMENT_NODE;
    }
    function Bn6(H) {
      return H && H.nodeType === iT.TEXT_NODE;
    }
    function yi7(H, _) {
      var q = H.childNodes || [];
      if (sc(q, tc) || To(_)) return !1;
      var $ = sc(q, To);
      return !(_ && $ && q.indexOf($) > q.indexOf(_));
    }
    function Vi7(H, _) {
      var q = H.childNodes || [];
      function $(O) {
        return tc(O) && O !== _;
      }
      if (sc(q, $)) return !1;
      var K = sc(q, To);
      return !(_ && K && q.indexOf(K) > q.indexOf(_));
    }
    function ZI1(H, _, q) {
      if (!GI1(H)) throw new I2(iv, "Unexpected parent node type " + H.nodeType);
      if (q && q.parentNode !== H) throw new I2(pi7, "child not in parent");
      if (!RI1(_) || (To(_) && H.nodeType !== iT.DOCUMENT_NODE))
        throw new I2(iv, "Unexpected node type " + _.nodeType + " for parent node type " + H.nodeType);
    }
    function LI1(H, _, q) {
      var $ = H.childNodes || [],
        K = _.childNodes || [];
      if (_.nodeType === iT.DOCUMENT_FRAGMENT_NODE) {
        var O = K.filter(tc);
        if (O.length > 1 || sc(K, Bn6)) throw new I2(iv, "More than one element or text in fragment");
        if (O.length === 1 && !yi7(H, q)) throw new I2(iv, "Element in fragment can not be inserted before doctype");
      }
      if (tc(_)) {
        if (!yi7(H, q)) throw new I2(iv, "Only one element can be added and only after doctype");
      }
      if (To(_)) {
        if (sc($, To)) throw new I2(iv, "Only one doctype is allowed");
        var T = sc($, tc);
        if (q && $.indexOf(T) < $.indexOf(q)) throw new I2(iv, "Doctype can only be inserted before an element");
        if (!q && T) throw new I2(iv, "Doctype can not be appended since element is present");
      }
    }
    function Ui7(H, _, q) {
      var $ = H.childNodes || [],
        K = _.childNodes || [];
      if (_.nodeType === iT.DOCUMENT_FRAGMENT_NODE) {
        var O = K.filter(tc);
        if (O.length > 1 || sc(K, Bn6)) throw new I2(iv, "More than one element or text in fragment");
        if (O.length === 1 && !Vi7(H, q)) throw new I2(iv, "Element in fragment can not be inserted before doctype");
      }
      if (tc(_)) {
        if (!Vi7(H, q)) throw new I2(iv, "Only one element can be added and only after doctype");
      }
      if (To(_)) {
        let A = function (f) {
          return To(f) && f !== q;
        };
        var z = A;
        if (sc($, A)) throw new I2(iv, "Only one doctype is allowed");
        var T = sc($, tc);
        if (q && $.indexOf(T) < $.indexOf(q)) throw new I2(iv, "Doctype can only be inserted before an element");
      }
    }
    function zp_(H, _, q, $) {
      if ((ZI1(H, _, q), H.nodeType === iT.DOCUMENT_NODE)) ($ || LI1)(H, _, q);
      var K = _.parentNode;
      if (K) K.removeChild(_);
      if (_.nodeType === Oo) {
        var O = _.firstChild;
        if (O == null) return _;
        var T = _.lastChild;
      } else O = T = _;
      var z = q ? q.previousSibling : H.lastChild;
      if (((O.previousSibling = z), (T.nextSibling = q), z)) z.nextSibling = O;
      else H.firstChild = O;
      if (q == null) H.lastChild = T;
      else q.previousSibling = T;
      do O.parentNode = H;
      while (O !== T && (O = O.nextSibling));
      if ((pn6(H.ownerDocument || H, H), _.nodeType == Oo)) _.firstChild = _.lastChild = null;
      return _;
    }
    function kI1(H, _) {
      if (_.parentNode) _.parentNode.removeChild(_);
      if (((_.parentNode = H), (_.previousSibling = H.lastChild), (_.nextSibling = null), _.previousSibling))
        _.previousSibling.nextSibling = _;
      else H.firstChild = _;
      return (H.lastChild = _), pn6(H.ownerDocument, H, _), _;
    }
    LtH.prototype = {
      nodeName: "#document",
      nodeType: xi7,
      doctype: null,
      documentElement: null,
      _inc: 1,
      insertBefore: function (H, _) {
        if (H.nodeType == Oo) {
          var q = H.firstChild;
          while (q) {
            var $ = q.nextSibling;
            this.insertBefore(q, _), (q = $);
          }
          return H;
        }
        if ((zp_(this, H, _), (H.ownerDocument = this), this.documentElement === null && H.nodeType === Mm))
          this.documentElement = H;
        return H;
      },
      removeChild: function (H) {
        if (this.documentElement == H) this.documentElement = null;
        return Fi7(this, H);
      },
      replaceChild: function (H, _) {
        if ((zp_(this, H, _, Ui7), (H.ownerDocument = this), _)) this.removeChild(_);
        if (tc(H)) this.documentElement = H;
      },
      importNode: function (H, _) {
        return ri7(this, H, _);
      },
      getElementById: function (H) {
        var _ = null;
        return (
          RtH(this.documentElement, function (q) {
            if (q.nodeType == Mm) {
              if (q.getAttribute("id") == H) return (_ = q), !0;
            }
          }),
          _
        );
      },
      getElementsByClassName: function (H) {
        var _ = ki7(H);
        return new qhH(this, function (q) {
          var $ = [];
          if (_.length > 0)
            RtH(q.documentElement, function (K) {
              if (K !== q && K.nodeType === Mm) {
                var O = K.getAttribute("class");
                if (O) {
                  var T = H === O;
                  if (!T) {
                    var z = ki7(O);
                    T = _.every(JI1(z));
                  }
                  if (T) $.push(K);
                }
              }
            });
          return $;
        });
      },
      createElement: function (H) {
        var _ = new zfH();
        (_.ownerDocument = this), (_.nodeName = H), (_.tagName = H), (_.localName = H), (_.childNodes = new Ko());
        var q = (_.attributes = new Tp_());
        return (q._ownerElement = _), _;
      },
      createDocumentFragment: function () {
        var H = new wp_();
        return (H.ownerDocument = this), (H.childNodes = new Ko()), H;
      },
      createTextNode: function (H) {
        var _ = new gn6();
        return (_.ownerDocument = this), _.appendData(H), _;
      },
      createComment: function (H) {
        var _ = new dn6();
        return (_.ownerDocument = this), _.appendData(H), _;
      },
      createCDATASection: function (H) {
        var _ = new cn6();
        return (_.ownerDocument = this), _.appendData(H), _;
      },
      createProcessingInstruction: function (H, _) {
        var q = new Un6();
        return (q.ownerDocument = this), (q.tagName = q.nodeName = q.target = H), (q.nodeValue = q.data = _), q;
      },
      createAttribute: function (H) {
        var _ = new Ap_();
        return (_.ownerDocument = this), (_.name = H), (_.nodeName = H), (_.localName = H), (_.specified = !0), _;
      },
      createEntityReference: function (H) {
        var _ = new Fn6();
        return (_.ownerDocument = this), (_.nodeName = H), _;
      },
      createElementNS: function (H, _) {
        var q = new zfH(),
          $ = _.split(":"),
          K = (q.attributes = new Tp_());
        if (
          ((q.childNodes = new Ko()),
          (q.ownerDocument = this),
          (q.nodeName = _),
          (q.tagName = _),
          (q.namespaceURI = H),
          $.length == 2)
        )
          (q.prefix = $[0]), (q.localName = $[1]);
        else q.localName = _;
        return (K._ownerElement = q), q;
      },
      createAttributeNS: function (H, _) {
        var q = new Ap_(),
          $ = _.split(":");
        if (
          ((q.ownerDocument = this),
          (q.nodeName = _),
          (q.name = _),
          (q.namespaceURI = H),
          (q.specified = !0),
          $.length == 2)
        )
          (q.prefix = $[0]), (q.localName = $[1]);
        else q.localName = _;
        return q;
      },
    };
    nv(LtH, iT);
    function zfH() {
      this._nsMap = {};
    }
    zfH.prototype = {
      nodeType: Mm,
      hasAttribute: function (H) {
        return this.getAttributeNode(H) != null;
      },
      getAttribute: function (H) {
        var _ = this.getAttributeNode(H);
        return (_ && _.value) || "";
      },
      getAttributeNode: function (H) {
        return this.attributes.getNamedItem(H);
      },
      setAttribute: function (H, _) {
        var q = this.ownerDocument.createAttribute(H);
        (q.value = q.nodeValue = "" + _), this.setAttributeNode(q);
      },
      removeAttribute: function (H) {
        var _ = this.getAttributeNode(H);
        _ && this.removeAttributeNode(_);
      },
      appendChild: function (H) {
        if (H.nodeType === Oo) return this.insertBefore(H, null);
        else return kI1(this, H);
      },
      setAttributeNode: function (H) {
        return this.attributes.setNamedItem(H);
      },
      setAttributeNodeNS: function (H) {
        return this.attributes.setNamedItemNS(H);
      },
      removeAttributeNode: function (H) {
        return this.attributes.removeNamedItem(H.nodeName);
      },
      removeAttributeNS: function (H, _) {
        var q = this.getAttributeNodeNS(H, _);
        q && this.removeAttributeNode(q);
      },
      hasAttributeNS: function (H, _) {
        return this.getAttributeNodeNS(H, _) != null;
      },
      getAttributeNS: function (H, _) {
        var q = this.getAttributeNodeNS(H, _);
        return (q && q.value) || "";
      },
      setAttributeNS: function (H, _, q) {
        var $ = this.ownerDocument.createAttributeNS(H, _);
        ($.value = $.nodeValue = "" + q), this.setAttributeNode($);
      },
      getAttributeNodeNS: function (H, _) {
        return this.attributes.getNamedItemNS(H, _);
      },
      getElementsByTagName: function (H) {
        return new qhH(this, function (_) {
          var q = [];
          return (
            RtH(_, function ($) {
              if ($ !== _ && $.nodeType == Mm && (H === "*" || $.tagName == H)) q.push($);
            }),
            q
          );
        });
      },
      getElementsByTagNameNS: function (H, _) {
        return new qhH(this, function (q) {
          var $ = [];
          return (
            RtH(q, function (K) {
              if (
                K !== q &&
                K.nodeType === Mm &&
                (H === "*" || K.namespaceURI === H) &&
                (_ === "*" || K.localName == _)
              )
                $.push(K);
            }),
            $
          );
        });
      },
    };
    LtH.prototype.getElementsByTagName = zfH.prototype.getElementsByTagName;
    LtH.prototype.getElementsByTagNameNS = zfH.prototype.getElementsByTagNameNS;
    nv(zfH, iT);
    function Ap_() {}
    Ap_.prototype.nodeType = _hH;
    nv(Ap_, iT);
    function ktH() {}
    ktH.prototype = {
      data: "",
      substringData: function (H, _) {
        return this.data.substring(H, H + _);
      },
      appendData: function (H) {
        (H = this.data + H), (this.nodeValue = this.data = H), (this.length = H.length);
      },
      insertData: function (H, _) {
        this.replaceData(H, 0, _);
      },
      appendChild: function (H) {
        throw Error(vP[iv]);
      },
      deleteData: function (H, _) {
        this.replaceData(H, _, "");
      },
      replaceData: function (H, _, q) {
        var $ = this.data.substring(0, H),
          K = this.data.substring(H + _);
        (q = $ + q + K), (this.nodeValue = this.data = q), (this.length = q.length);
      },
    };
    nv(ktH, iT);
    function gn6() {}
    gn6.prototype = {
      nodeName: "#text",
      nodeType: Op_,
      splitText: function (H) {
        var _ = this.data,
          q = _.substring(H);
        (_ = _.substring(0, H)), (this.data = this.nodeValue = _), (this.length = _.length);
        var $ = this.ownerDocument.createTextNode(q);
        if (this.parentNode) this.parentNode.insertBefore($, this.nextSibling);
        return $;
      },
    };
    nv(gn6, ktH);
    function dn6() {}
    dn6.prototype = { nodeName: "#comment", nodeType: ui7 };
    nv(dn6, ktH);
    function cn6() {}
    cn6.prototype = { nodeName: "#cdata-section", nodeType: Ci7 };
    nv(cn6, ktH);
    function fp_() {}
    fp_.prototype.nodeType = mi7;
    nv(fp_, iT);
    function Qi7() {}
    Qi7.prototype.nodeType = XI1;
    nv(Qi7, iT);
    function li7() {}
    li7.prototype.nodeType = PI1;
    nv(li7, iT);
    function Fn6() {}
    Fn6.prototype.nodeType = bi7;
    nv(Fn6, iT);
    function wp_() {}
    wp_.prototype.nodeName = "#document-fragment";
    wp_.prototype.nodeType = Oo;
    nv(wp_, iT);
    function Un6() {}
    Un6.prototype.nodeType = Ii7;
    nv(Un6, iT);
    function ii7() {}
    ii7.prototype.serializeToString = function (H, _, q) {
      return ni7.call(H, _, q);
    };
    iT.prototype.toString = ni7;
    function ni7(H, _) {
      var q = [],
        $ = (this.nodeType == 9 && this.documentElement) || this,
        K = $.prefix,
        O = $.namespaceURI;
      if (O && K == null) {
        var K = $.lookupPrefix(O);
        if (K == null) var T = [{ namespace: O, prefix: null }];
      }
      return HhH(this, q, H, _, T), q.join("");
    }
    function Si7(H, _, q) {
      var $ = H.prefix || "",
        K = H.namespaceURI;
      if (!K) return !1;
      if (($ === "xml" && K === GtH.XML) || K === GtH.XMLNS) return !1;
      var O = q.length;
      while (O--) {
        var T = q[O];
        if (T.prefix === $) return T.namespace !== K;
      }
      return !0;
    }
    function un6(H, _, q) {
      H.push(" ", _, '="', q.replace(/[<>&"\t\n\r]/g, di7), '"');
    }
    function HhH(H, _, q, $, K) {
      if (!K) K = [];
      if ($)
        if (((H = $(H)), H)) {
          if (typeof H == "string") {
            _.push(H);
            return;
          }
        } else return;
      switch (H.nodeType) {
        case Mm:
          var O = H.attributes,
            T = O.length,
            X = H.firstChild,
            z = H.tagName;
          q = GtH.isHTML(H.namespaceURI) || q;
          var A = z;
          if (!q && !H.prefix && H.namespaceURI) {
            var f;
            for (var w = 0; w < O.length; w++)
              if (O.item(w).name === "xmlns") {
                f = O.item(w).value;
                break;
              }
            if (!f)
              for (var Y = K.length - 1; Y >= 0; Y--) {
                var D = K[Y];
                if (D.prefix === "" && D.namespace === H.namespaceURI) {
                  f = D.namespace;
                  break;
                }
              }
            if (f !== H.namespaceURI)
              for (var Y = K.length - 1; Y >= 0; Y--) {
                var D = K[Y];
                if (D.namespace === H.namespaceURI) {
                  if (D.prefix) A = D.prefix + ":" + z;
                  break;
                }
              }
          }
          _.push("<", A);
          for (var j = 0; j < T; j++) {
            var M = O.item(j);
            if (M.prefix == "xmlns") K.push({ prefix: M.localName, namespace: M.value });
            else if (M.nodeName == "xmlns") K.push({ prefix: "", namespace: M.value });
          }
          for (var j = 0; j < T; j++) {
            var M = O.item(j);
            if (Si7(M, q, K)) {
              var J = M.prefix || "",
                P = M.namespaceURI;
              un6(_, J ? "xmlns:" + J : "xmlns", P), K.push({ prefix: J, namespace: P });
            }
            HhH(M, _, q, $, K);
          }
          if (z === A && Si7(H, q, K)) {
            var J = H.prefix || "",
              P = H.namespaceURI;
            un6(_, J ? "xmlns:" + J : "xmlns", P), K.push({ prefix: J, namespace: P });
          }
          if (X || (q && !/^(?:meta|link|img|br|hr|input)$/i.test(z))) {
            if ((_.push(">"), q && /^script$/i.test(z)))
              while (X) {
                if (X.data) _.push(X.data);
                else HhH(X, _, q, $, K.slice());
                X = X.nextSibling;
              }
            else while (X) HhH(X, _, q, $, K.slice()), (X = X.nextSibling);
            _.push("</", A, ">");
          } else _.push("/>");
          return;
        case xi7:
        case Oo:
          var X = H.firstChild;
          while (X) HhH(X, _, q, $, K.slice()), (X = X.nextSibling);
          return;
        case _hH:
          return un6(_, H.name, H.value);
        case Op_:
          return _.push(H.data.replace(/[<&>]/g, di7));
        case Ci7:
          return _.push("<![CDATA[", H.data, "]]>");
        case ui7:
          return _.push("<!--", H.data, "-->");
        case mi7:
          var { publicId: R, systemId: W } = H;
          if ((_.push("<!DOCTYPE ", H.name), R)) {
            if ((_.push(" PUBLIC ", R), W && W != ".")) _.push(" ", W);
            _.push(">");
          } else if (W && W != ".") _.push(" SYSTEM ", W, ">");
          else {
            var Z = H.internalSubset;
            if (Z) _.push(" [", Z, "]");
            _.push(">");
          }
          return;
        case Ii7:
          return _.push("<?", H.target, " ", H.data, "?>");
        case bi7:
          return _.push("&", H.nodeName, ";");
        default:
          _.push("??", H.nodeName);
      }
    }
    function ri7(H, _, q) {
      var $;
      switch (_.nodeType) {
        case Mm:
          ($ = _.cloneNode(!1)), ($.ownerDocument = H);
        case Oo:
          break;
        case _hH:
          q = !0;
          break;
      }
      if (!$) $ = _.cloneNode(!1);
      if ((($.ownerDocument = H), ($.parentNode = null), q)) {
        var K = _.firstChild;
        while (K) $.appendChild(ri7(H, K, q)), (K = K.nextSibling);
      }
      return $;
    }
    function xn6(H, _, q) {
      var $ = new _.constructor();
      for (var K in _)
        if (Object.prototype.hasOwnProperty.call(_, K)) {
          var O = _[K];
          if (typeof O != "object") {
            if (O != $[K]) $[K] = O;
          }
        }
      if (_.childNodes) $.childNodes = new Ko();
      switch ((($.ownerDocument = H), $.nodeType)) {
        case Mm:
          var T = _.attributes,
            z = ($.attributes = new Tp_()),
            A = T.length;
          z._ownerElement = $;
          for (var f = 0; f < A; f++) $.setAttributeNode(xn6(H, T.item(f), !0));
          break;
        case _hH:
          q = !0;
      }
      if (q) {
        var w = _.firstChild;
        while (w) $.appendChild(xn6(H, w, q)), (w = w.nextSibling);
      }
      return $;
    }
    function oi7(H, _, q) {
      H[_] = q;
    }
    try {
      if (Object.defineProperty) {
        let H = function (_) {
          switch (_.nodeType) {
            case Mm:
            case Oo:
              var q = [];
              _ = _.firstChild;
              while (_) {
                if (_.nodeType !== 7 && _.nodeType !== 8) q.push(H(_));
                _ = _.nextSibling;
              }
              return q.join("");
            default:
              return _.nodeValue;
          }
        };
        (vI1 = H),
          Object.defineProperty(qhH.prototype, "length", {
            get: function () {
              return mn6(this), this.$$length;
            },
          }),
          Object.defineProperty(iT.prototype, "textContent", {
            get: function () {
              return H(this);
            },
            set: function (_) {
              switch (this.nodeType) {
                case Mm:
                case Oo:
                  while (this.firstChild) this.removeChild(this.firstChild);
                  if (_ || String(_)) this.appendChild(this.ownerDocument.createTextNode(_));
                  break;
                default:
                  (this.data = _), (this.value = _), (this.nodeValue = _);
              }
            },
          }),
          (oi7 = function (_, q, $) {
            _["$$" + q] = $;
          });
      }
    } catch (H) {}
    var vI1;
    N7H.DocumentType = fp_;
    N7H.DOMException = I2;
    N7H.DOMImplementation = gi7;
    N7H.Element = zfH;
    N7H.Node = iT;
    N7H.NodeList = Ko;
    N7H.XMLSerializer = ii7;
  });

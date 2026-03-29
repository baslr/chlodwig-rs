  var jyH = d((VzT, i69) => {
    i69.exports = _9H;
    var js6 = Qg_(),
      nY = rD(),
      MF = nY.NAMESPACE,
      sg_ = Ks6(),
      Im = pW(),
      Ms6 = efH(),
      Nc1 = Qa6(),
      ag_ = y69(),
      DyH = gg_(),
      hc1 = Ts6(),
      Js6 = rg_(),
      U69 = Ug_(),
      yc1 = og_(),
      Vc1 = Ys6(),
      Q69 = Ds6(),
      F69 = Object.create(null);
    function _9H(H, _, q, $) {
      U69.call(this),
        (this.nodeType = Im.ELEMENT_NODE),
        (this.ownerDocument = H),
        (this.localName = _),
        (this.namespaceURI = q),
        (this.prefix = $),
        (this._tagName = void 0),
        (this._attrsByQName = Object.create(null)),
        (this._attrsByLName = Object.create(null)),
        (this._attrKeys = []);
    }
    function Ps6(H, _) {
      if (H.nodeType === Im.TEXT_NODE) _.push(H._data);
      else for (var q = 0, $ = H.childNodes.length; q < $; q++) Ps6(H.childNodes[q], _);
    }
    _9H.prototype = Object.create(U69.prototype, {
      isHTML: {
        get: function () {
          return this.namespaceURI === MF.HTML && this.ownerDocument.isHTML;
        },
      },
      tagName: {
        get: function () {
          if (this._tagName === void 0) {
            var _;
            if (this.prefix === null) _ = this.localName;
            else _ = this.prefix + ":" + this.localName;
            if (this.isHTML) {
              var q = F69[_];
              if (!q) F69[_] = q = nY.toASCIIUpperCase(_);
              _ = q;
            }
            this._tagName = _;
          }
          return this._tagName;
        },
      },
      nodeName: {
        get: function () {
          return this.tagName;
        },
      },
      nodeValue: {
        get: function () {
          return null;
        },
        set: function () {},
      },
      textContent: {
        get: function () {
          var H = [];
          return Ps6(this, H), H.join("");
        },
        set: function (H) {
          if ((this.removeChildren(), H !== null && H !== void 0 && H !== ""))
            this._appendChild(this.ownerDocument.createTextNode(H));
        },
      },
      innerText: {
        get: function () {
          var H = [];
          return (
            Ps6(this, H),
            H.join("")
              .replace(/[ \t\n\f\r]+/g, " ")
              .trim()
          );
        },
        set: function (H) {
          if ((this.removeChildren(), H !== null && H !== void 0 && H !== ""))
            this._appendChild(this.ownerDocument.createTextNode(H));
        },
      },
      innerHTML: {
        get: function () {
          return this.serialize();
        },
        set: nY.nyi,
      },
      outerHTML: {
        get: function () {
          return Nc1.serializeOne(this, { nodeType: 0 });
        },
        set: function (H) {
          var _ = this.ownerDocument,
            q = this.parentNode;
          if (q === null) return;
          if (q.nodeType === Im.DOCUMENT_NODE) nY.NoModificationAllowedError();
          if (q.nodeType === Im.DOCUMENT_FRAGMENT_NODE) q = q.ownerDocument.createElement("body");
          var $ = _.implementation.mozHTMLParser(_._address, q);
          $.parse(H === null ? "" : String(H), !0), this.replaceWith($._asDocumentFragment());
        },
      },
      _insertAdjacent: {
        value: function (_, q) {
          var $ = !1;
          switch (_) {
            case "beforebegin":
              $ = !0;
            case "afterend":
              var K = this.parentNode;
              if (K === null) return null;
              return K.insertBefore(q, $ ? this : this.nextSibling);
            case "afterbegin":
              $ = !0;
            case "beforeend":
              return this.insertBefore(q, $ ? this.firstChild : null);
            default:
              return nY.SyntaxError();
          }
        },
      },
      insertAdjacentElement: {
        value: function (_, q) {
          if (q.nodeType !== Im.ELEMENT_NODE) throw TypeError("not an element");
          return (_ = nY.toASCIILowerCase(String(_))), this._insertAdjacent(_, q);
        },
      },
      insertAdjacentText: {
        value: function (_, q) {
          var $ = this.ownerDocument.createTextNode(q);
          (_ = nY.toASCIILowerCase(String(_))), this._insertAdjacent(_, $);
        },
      },
      insertAdjacentHTML: {
        value: function (_, q) {
          (_ = nY.toASCIILowerCase(String(_))), (q = String(q));
          var $;
          switch (_) {
            case "beforebegin":
            case "afterend":
              if ((($ = this.parentNode), $ === null || $.nodeType === Im.DOCUMENT_NODE))
                nY.NoModificationAllowedError();
              break;
            case "afterbegin":
            case "beforeend":
              $ = this;
              break;
            default:
              nY.SyntaxError();
          }
          if (!($ instanceof _9H) || ($.ownerDocument.isHTML && $.localName === "html" && $.namespaceURI === MF.HTML))
            $ = $.ownerDocument.createElementNS(MF.HTML, "body");
          var K = this.ownerDocument.implementation.mozHTMLParser(this.ownerDocument._address, $);
          K.parse(q, !0), this._insertAdjacent(_, K._asDocumentFragment());
        },
      },
      children: {
        get: function () {
          if (!this._children) this._children = new l69(this);
          return this._children;
        },
      },
      attributes: {
        get: function () {
          if (!this._attributes) this._attributes = new Ws6(this);
          return this._attributes;
        },
      },
      firstElementChild: {
        get: function () {
          for (var H = this.firstChild; H !== null; H = H.nextSibling) if (H.nodeType === Im.ELEMENT_NODE) return H;
          return null;
        },
      },
      lastElementChild: {
        get: function () {
          for (var H = this.lastChild; H !== null; H = H.previousSibling) if (H.nodeType === Im.ELEMENT_NODE) return H;
          return null;
        },
      },
      childElementCount: {
        get: function () {
          return this.children.length;
        },
      },
      nextElement: {
        value: function (H) {
          if (!H) H = this.ownerDocument.documentElement;
          var _ = this.firstElementChild;
          if (!_) {
            if (this === H) return null;
            _ = this.nextElementSibling;
          }
          if (_) return _;
          for (var q = this.parentElement; q && q !== H; q = q.parentElement)
            if (((_ = q.nextElementSibling), _)) return _;
          return null;
        },
      },
      getElementsByTagName: {
        value: function (_) {
          var q;
          if (!_) return new Ms6();
          if (_ === "*")
            q = function () {
              return !0;
            };
          else if (this.isHTML) q = Sc1(_);
          else q = Xs6(_);
          return new ag_(this, q);
        },
      },
      getElementsByTagNameNS: {
        value: function (_, q) {
          var $;
          if (_ === "*" && q === "*")
            $ = function () {
              return !0;
            };
          else if (_ === "*") $ = Xs6(q);
          else if (q === "*") $ = Ec1(_);
          else $ = Cc1(_, q);
          return new ag_(this, $);
        },
      },
      getElementsByClassName: {
        value: function (_) {
          if (((_ = String(_).trim()), _ === "")) {
            var q = new Ms6();
            return q;
          }
          return (_ = _.split(/[ \t\r\n\f]+/)), new ag_(this, bc1(_));
        },
      },
      getElementsByName: {
        value: function (_) {
          return new ag_(this, Ic1(String(_)));
        },
      },
      clone: {
        value: function () {
          var _;
          if (this.namespaceURI !== MF.HTML || this.prefix || !this.ownerDocument.isHTML)
            _ = this.ownerDocument.createElementNS(
              this.namespaceURI,
              this.prefix !== null ? this.prefix + ":" + this.localName : this.localName,
            );
          else _ = this.ownerDocument.createElement(this.localName);
          for (var q = 0, $ = this._attrKeys.length; q < $; q++) {
            var K = this._attrKeys[q],
              O = this._attrsByLName[K],
              T = O.cloneNode();
            T._setOwnerElement(_), (_._attrsByLName[K] = T), _._addQName(T);
          }
          return (_._attrKeys = this._attrKeys.concat()), _;
        },
      },
      isEqual: {
        value: function (_) {
          if (
            this.localName !== _.localName ||
            this.namespaceURI !== _.namespaceURI ||
            this.prefix !== _.prefix ||
            this._numattrs !== _._numattrs
          )
            return !1;
          for (var q = 0, $ = this._numattrs; q < $; q++) {
            var K = this._attr(q);
            if (!_.hasAttributeNS(K.namespaceURI, K.localName)) return !1;
            if (_.getAttributeNS(K.namespaceURI, K.localName) !== K.value) return !1;
          }
          return !0;
        },
      },
      _lookupNamespacePrefix: {
        value: function (_, q) {
          if (
            this.namespaceURI &&
            this.namespaceURI === _ &&
            this.prefix !== null &&
            q.lookupNamespaceURI(this.prefix) === _
          )
            return this.prefix;
          for (var $ = 0, K = this._numattrs; $ < K; $++) {
            var O = this._attr($);
            if (O.prefix === "xmlns" && O.value === _ && q.lookupNamespaceURI(O.localName) === _) return O.localName;
          }
          var T = this.parentElement;
          return T ? T._lookupNamespacePrefix(_, q) : null;
        },
      },
      lookupNamespaceURI: {
        value: function (_) {
          if (_ === "" || _ === void 0) _ = null;
          if (this.namespaceURI !== null && this.prefix === _) return this.namespaceURI;
          for (var q = 0, $ = this._numattrs; q < $; q++) {
            var K = this._attr(q);
            if (K.namespaceURI === MF.XMLNS) {
              if (
                (K.prefix === "xmlns" && K.localName === _) ||
                (_ === null && K.prefix === null && K.localName === "xmlns")
              )
                return K.value || null;
            }
          }
          var O = this.parentElement;
          return O ? O.lookupNamespaceURI(_) : null;
        },
      },
      getAttribute: {
        value: function (_) {
          var q = this.getAttributeNode(_);
          return q ? q.value : null;
        },
      },
      getAttributeNS: {
        value: function (_, q) {
          var $ = this.getAttributeNodeNS(_, q);
          return $ ? $.value : null;
        },
      },
      getAttributeNode: {
        value: function (_) {
          if (((_ = String(_)), /[A-Z]/.test(_) && this.isHTML)) _ = nY.toASCIILowerCase(_);
          var q = this._attrsByQName[_];
          if (!q) return null;
          if (Array.isArray(q)) q = q[0];
          return q;
        },
      },
      getAttributeNodeNS: {
        value: function (_, q) {
          (_ = _ === void 0 || _ === null ? "" : String(_)), (q = String(q));
          var $ = this._attrsByLName[_ + "|" + q];
          return $ ? $ : null;
        },
      },
      hasAttribute: {
        value: function (_) {
          if (((_ = String(_)), /[A-Z]/.test(_) && this.isHTML)) _ = nY.toASCIILowerCase(_);
          return this._attrsByQName[_] !== void 0;
        },
      },
      hasAttributeNS: {
        value: function (_, q) {
          (_ = _ === void 0 || _ === null ? "" : String(_)), (q = String(q));
          var $ = _ + "|" + q;
          return this._attrsByLName[$] !== void 0;
        },
      },
      hasAttributes: {
        value: function () {
          return this._numattrs > 0;
        },
      },
      toggleAttribute: {
        value: function (_, q) {
          if (((_ = String(_)), !js6.isValidName(_))) nY.InvalidCharacterError();
          if (/[A-Z]/.test(_) && this.isHTML) _ = nY.toASCIILowerCase(_);
          var $ = this._attrsByQName[_];
          if ($ === void 0) {
            if (q === void 0 || q === !0) return this._setAttribute(_, ""), !0;
            return !1;
          } else {
            if (q === void 0 || q === !1) return this.removeAttribute(_), !1;
            return !0;
          }
        },
      },
      _setAttribute: {
        value: function (_, q) {
          var $ = this._attrsByQName[_],
            K;
          if (!$) ($ = this._newattr(_)), (K = !0);
          else if (Array.isArray($)) $ = $[0];
          if ((($.value = q), this._attributes)) this._attributes[_] = $;
          if (K && this._newattrhook) this._newattrhook(_, q);
        },
      },
      setAttribute: {
        value: function (_, q) {
          if (((_ = String(_)), !js6.isValidName(_))) nY.InvalidCharacterError();
          if (/[A-Z]/.test(_) && this.isHTML) _ = nY.toASCIILowerCase(_);
          this._setAttribute(_, String(q));
        },
      },
      _setAttributeNS: {
        value: function (_, q, $) {
          var K = q.indexOf(":"),
            O,
            T;
          if (K < 0) (O = null), (T = q);
          else (O = q.substring(0, K)), (T = q.substring(K + 1));
          if (_ === "" || _ === void 0) _ = null;
          var z = (_ === null ? "" : _) + "|" + T,
            A = this._attrsByLName[z],
            f;
          if (!A) {
            if (((A = new KH_(this, T, O, _)), (f = !0), (this._attrsByLName[z] = A), this._attributes))
              this._attributes[this._attrKeys.length] = A;
            this._attrKeys.push(z), this._addQName(A);
          }
          if (((A.value = $), f && this._newattrhook)) this._newattrhook(q, $);
        },
      },
      setAttributeNS: {
        value: function (_, q, $) {
          if (((_ = _ === null || _ === void 0 || _ === "" ? null : String(_)), (q = String(q)), !js6.isValidQName(q)))
            nY.InvalidCharacterError();
          var K = q.indexOf(":"),
            O = K < 0 ? null : q.substring(0, K);
          if (
            (O !== null && _ === null) ||
            (O === "xml" && _ !== MF.XML) ||
            ((q === "xmlns" || O === "xmlns") && _ !== MF.XMLNS) ||
            (_ === MF.XMLNS && !(q === "xmlns" || O === "xmlns"))
          )
            nY.NamespaceError();
          this._setAttributeNS(_, q, String($));
        },
      },
      setAttributeNode: {
        value: function (_) {
          if (_.ownerElement !== null && _.ownerElement !== this) throw new DyH(DyH.INUSE_ATTRIBUTE_ERR);
          var q = null,
            $ = this._attrsByQName[_.name];
          if ($) {
            if (!Array.isArray($)) $ = [$];
            if (
              $.some(function (K) {
                return K === _;
              })
            )
              return _;
            else if (_.ownerElement !== null) throw new DyH(DyH.INUSE_ATTRIBUTE_ERR);
            $.forEach(function (K) {
              this.removeAttributeNode(K);
            }, this),
              (q = $[0]);
          }
          return this.setAttributeNodeNS(_), q;
        },
      },
      setAttributeNodeNS: {
        value: function (_) {
          if (_.ownerElement !== null) throw new DyH(DyH.INUSE_ATTRIBUTE_ERR);
          var q = _.namespaceURI,
            $ = (q === null ? "" : q) + "|" + _.localName,
            K = this._attrsByLName[$];
          if (K) this.removeAttributeNode(K);
          if ((_._setOwnerElement(this), (this._attrsByLName[$] = _), this._attributes))
            this._attributes[this._attrKeys.length] = _;
          if ((this._attrKeys.push($), this._addQName(_), this._newattrhook)) this._newattrhook(_.name, _.value);
          return K || null;
        },
      },
      removeAttribute: {
        value: function (_) {
          if (((_ = String(_)), /[A-Z]/.test(_) && this.isHTML)) _ = nY.toASCIILowerCase(_);
          var q = this._attrsByQName[_];
          if (!q) return;
          if (Array.isArray(q))
            if (q.length > 2) q = q.shift();
            else (this._attrsByQName[_] = q[1]), (q = q[0]);
          else this._attrsByQName[_] = void 0;
          var $ = q.namespaceURI,
            K = ($ === null ? "" : $) + "|" + q.localName;
          this._attrsByLName[K] = void 0;
          var O = this._attrKeys.indexOf(K);
          if (this._attributes) Array.prototype.splice.call(this._attributes, O, 1), (this._attributes[_] = void 0);
          this._attrKeys.splice(O, 1);
          var T = q.onchange;
          if ((q._setOwnerElement(null), T)) T.call(q, this, q.localName, q.value, null);
          if (this.rooted) this.ownerDocument.mutateRemoveAttr(q);
        },
      },
      removeAttributeNS: {
        value: function (_, q) {
          (_ = _ === void 0 || _ === null ? "" : String(_)), (q = String(q));
          var $ = _ + "|" + q,
            K = this._attrsByLName[$];
          if (!K) return;
          this._attrsByLName[$] = void 0;
          var O = this._attrKeys.indexOf($);
          if (this._attributes) Array.prototype.splice.call(this._attributes, O, 1);
          this._attrKeys.splice(O, 1), this._removeQName(K);
          var T = K.onchange;
          if ((K._setOwnerElement(null), T)) T.call(K, this, K.localName, K.value, null);
          if (this.rooted) this.ownerDocument.mutateRemoveAttr(K);
        },
      },
      removeAttributeNode: {
        value: function (_) {
          var q = _.namespaceURI,
            $ = (q === null ? "" : q) + "|" + _.localName;
          if (this._attrsByLName[$] !== _) nY.NotFoundError();
          return this.removeAttributeNS(q, _.localName), _;
        },
      },
      getAttributeNames: {
        value: function () {
          var _ = this;
          return this._attrKeys.map(function (q) {
            return _._attrsByLName[q].name;
          });
        },
      },
      _getattr: {
        value: function (_) {
          var q = this._attrsByQName[_];
          return q ? q.value : null;
        },
      },
      _setattr: {
        value: function (_, q) {
          var $ = this._attrsByQName[_],
            K;
          if (!$) ($ = this._newattr(_)), (K = !0);
          if ((($.value = String(q)), this._attributes)) this._attributes[_] = $;
          if (K && this._newattrhook) this._newattrhook(_, q);
        },
      },
      _newattr: {
        value: function (_) {
          var q = new KH_(this, _, null, null),
            $ = "|" + _;
          if (((this._attrsByQName[_] = q), (this._attrsByLName[$] = q), this._attributes))
            this._attributes[this._attrKeys.length] = q;
          return this._attrKeys.push($), q;
        },
      },
      _addQName: {
        value: function (H) {
          var _ = H.name,
            q = this._attrsByQName[_];
          if (!q) this._attrsByQName[_] = H;
          else if (Array.isArray(q)) q.push(H);
          else this._attrsByQName[_] = [q, H];
          if (this._attributes) this._attributes[_] = H;
        },
      },
      _removeQName: {
        value: function (H) {
          var _ = H.name,
            q = this._attrsByQName[_];
          if (Array.isArray(q)) {
            var $ = q.indexOf(H);
            if ((nY.assert($ !== -1), q.length === 2)) {
              if (((this._attrsByQName[_] = q[1 - $]), this._attributes)) this._attributes[_] = this._attrsByQName[_];
            } else if ((q.splice($, 1), this._attributes && this._attributes[_] === H)) this._attributes[_] = q[0];
          } else if ((nY.assert(q === H), (this._attrsByQName[_] = void 0), this._attributes))
            this._attributes[_] = void 0;
        },
      },
      _numattrs: {
        get: function () {
          return this._attrKeys.length;
        },
      },
      _attr: {
        value: function (H) {
          return this._attrsByLName[this._attrKeys[H]];
        },
      },
      id: sg_.property({ name: "id" }),
      className: sg_.property({ name: "class" }),
      classList: {
        get: function () {
          var H = this;
          if (this._classList) return this._classList;
          var _ = new hc1(
            function () {
              return H.className || "";
            },
            function (q) {
              H.className = q;
            },
          );
          return (this._classList = _), _;
        },
        set: function (H) {
          this.className = H;
        },
      },
      matches: {
        value: function (H) {
          return Js6.matches(this, H);
        },
      },
      closest: {
        value: function (H) {
          var _ = this;
          do {
            if (_.matches && _.matches(H)) return _;
            _ = _.parentElement || _.parentNode;
          } while (_ !== null && _.nodeType === Im.ELEMENT_NODE);
          return null;
        },
      },
      querySelector: {
        value: function (H) {
          return Js6(H, this)[0];
        },
      },
      querySelectorAll: {
        value: function (H) {
          var _ = Js6(H, this);
          return _.item ? _ : new Ms6(_);
        },
      },
    });
    Object.defineProperties(_9H.prototype, yc1);
    Object.defineProperties(_9H.prototype, Vc1);
    sg_.registerChangeHandler(_9H, "id", function (H, _, q, $) {
      if (H.rooted) {
        if (q) H.ownerDocument.delId(q, H);
        if ($) H.ownerDocument.addId($, H);
      }
    });
    sg_.registerChangeHandler(_9H, "class", function (H, _, q, $) {
      if (H._classList) H._classList._update();
    });
    function KH_(H, _, q, $, K) {
      (this.localName = _),
        (this.prefix = q === null || q === "" ? null : "" + q),
        (this.namespaceURI = $ === null || $ === "" ? null : "" + $),
        (this.data = K),
        this._setOwnerElement(H);
    }
    KH_.prototype = Object.create(Object.prototype, {
      ownerElement: {
        get: function () {
          return this._ownerElement;
        },
      },
      _setOwnerElement: {
        value: function (_) {
          if (((this._ownerElement = _), this.prefix === null && this.namespaceURI === null && _))
            this.onchange = _._attributeChangeHandlers[this.localName];
          else this.onchange = null;
        },
      },
      name: {
        get: function () {
          return this.prefix ? this.prefix + ":" + this.localName : this.localName;
        },
      },
      specified: {
        get: function () {
          return !0;
        },
      },
      value: {
        get: function () {
          return this.data;
        },
        set: function (H) {
          var _ = this.data;
          if (((H = H === void 0 ? "" : H + ""), H === _)) return;
          if (((this.data = H), this.ownerElement)) {
            if (this.onchange) this.onchange(this.ownerElement, this.localName, _, H);
            if (this.ownerElement.rooted) this.ownerElement.ownerDocument.mutateAttr(this, _);
          }
        },
      },
      cloneNode: {
        value: function (_) {
          return new KH_(null, this.localName, this.prefix, this.namespaceURI, this.data);
        },
      },
      nodeType: {
        get: function () {
          return Im.ATTRIBUTE_NODE;
        },
      },
      nodeName: {
        get: function () {
          return this.name;
        },
      },
      nodeValue: {
        get: function () {
          return this.value;
        },
        set: function (H) {
          this.value = H;
        },
      },
      textContent: {
        get: function () {
          return this.value;
        },
        set: function (H) {
          if (H === null || H === void 0) H = "";
          this.value = H;
        },
      },
      innerText: {
        get: function () {
          return this.value;
        },
        set: function (H) {
          if (H === null || H === void 0) H = "";
          this.value = H;
        },
      },
    });
    _9H._Attr = KH_;
    function Ws6(H) {
      Q69.call(this, H);
      for (var _ in H._attrsByQName) this[_] = H._attrsByQName[_];
      for (var q = 0; q < H._attrKeys.length; q++) this[q] = H._attrsByLName[H._attrKeys[q]];
    }
    Ws6.prototype = Object.create(Q69.prototype, {
      length: {
        get: function () {
          return this.element._attrKeys.length;
        },
        set: function () {},
      },
      item: {
        value: function (H) {
          if (((H = H >>> 0), H >= this.length)) return null;
          return this.element._attrsByLName[this.element._attrKeys[H]];
        },
      },
    });
    if (globalThis.Symbol?.iterator)
      Ws6.prototype[globalThis.Symbol.iterator] = function () {
        var H = 0,
          _ = this.length,
          q = this;
        return {
          next: function () {
            if (H < _) return { value: q.item(H++) };
            return { done: !0 };
          },
        };
      };
    function l69(H) {
      (this.element = H), this.updateCache();
    }
    l69.prototype = Object.create(Object.prototype, {
      length: {
        get: function () {
          return this.updateCache(), this.childrenByNumber.length;
        },
      },
      item: {
        value: function (_) {
          return this.updateCache(), this.childrenByNumber[_] || null;
        },
      },
      namedItem: {
        value: function (_) {
          return this.updateCache(), this.childrenByName[_] || null;
        },
      },
      namedItems: {
        get: function () {
          return this.updateCache(), this.childrenByName;
        },
      },
      updateCache: {
        value: function () {
          var _ = /^(a|applet|area|embed|form|frame|frameset|iframe|img|object)$/;
          if (this.lastModTime !== this.element.lastModTime) {
            this.lastModTime = this.element.lastModTime;
            var q = (this.childrenByNumber && this.childrenByNumber.length) || 0;
            for (var $ = 0; $ < q; $++) this[$] = void 0;
            (this.childrenByNumber = []), (this.childrenByName = Object.create(null));
            for (var K = this.element.firstChild; K !== null; K = K.nextSibling)
              if (K.nodeType === Im.ELEMENT_NODE) {
                (this[this.childrenByNumber.length] = K), this.childrenByNumber.push(K);
                var O = K.getAttribute("id");
                if (O && !this.childrenByName[O]) this.childrenByName[O] = K;
                var T = K.getAttribute("name");
                if (
                  T &&
                  this.element.namespaceURI === MF.HTML &&
                  _.test(this.element.localName) &&
                  !this.childrenByName[T]
                )
                  this.childrenByName[O] = K;
              }
          }
        },
      },
    });
    function Xs6(H) {
      return function (_) {
        return _.localName === H;
      };
    }
    function Sc1(H) {
      var _ = nY.toASCIILowerCase(H);
      if (_ === H) return Xs6(H);
      return function (q) {
        return q.isHTML ? q.localName === _ : q.localName === H;
      };
    }
    function Ec1(H) {
      return function (_) {
        return _.namespaceURI === H;
      };
    }
    function Cc1(H, _) {
      return function (q) {
        return q.namespaceURI === H && q.localName === _;
      };
    }
    function bc1(H) {
      return function (_) {
        return H.every(function (q) {
          return _.classList.contains(q);
        });
      };
    }
    function Ic1(H) {
      return function (_) {
        if (_.namespaceURI !== MF.HTML) return !1;
        return _.getAttribute("name") === H;
      };
    }
  });

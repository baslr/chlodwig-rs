  var zd_ = d((azT, Oq9) => {
    Oq9.exports = jH_;
    var rG = pW(),
      zF1 = efH(),
      _q9 = Ug_(),
      q9H = jyH(),
      AF1 = Zs6(),
      fF1 = ks6(),
      DH_ = TyH(),
      wF1 = Ns6(),
      YF1 = ys6(),
      DF1 = MH_(),
      jF1 = Z89(),
      MF1 = y89(),
      a89 = fH_(),
      s89 = Hd_(),
      t89 = rg_(),
      JF1 = ms6(),
      Td_ = Qg_(),
      Us6 = Kd_(),
      PF1 = Fs6(),
      WO = rD(),
      XyH = o89(),
      GyH = WO.NAMESPACE,
      Qs6 = dg_().isApiWritable;
    function jH_(H, _) {
      _q9.call(this),
        (this.nodeType = rG.DOCUMENT_NODE),
        (this.isHTML = H),
        (this._address = _ || "about:blank"),
        (this.readyState = "loading"),
        (this.implementation = new DF1(this)),
        (this.ownerDocument = null),
        (this._contentType = H ? "text/html" : "application/xml"),
        (this.doctype = null),
        (this.documentElement = null),
        (this._templateDocCache = null),
        (this._nodeIterators = null),
        (this._nid = 1),
        (this._nextnid = 2),
        (this._nodes = [null, this]),
        (this.byId = Object.create(null)),
        (this.modclock = 0);
    }
    var XF1 = { event: "Event", customevent: "CustomEvent", uievent: "UIEvent", mouseevent: "MouseEvent" },
      WF1 = {
        events: "event",
        htmlevents: "event",
        mouseevents: "mouseevent",
        mutationevents: "mutationevent",
        uievents: "uievent",
      },
      WyH = function (H, _, q) {
        return {
          get: function () {
            var $ = H.call(this);
            if ($) return $[_];
            return q;
          },
          set: function ($) {
            var K = H.call(this);
            if (K) K[_] = $;
          },
        };
      };
    function e89(H, _) {
      var q, $, K;
      if (H === "") H = null;
      if (!Td_.isValidQName(_)) WO.InvalidCharacterError();
      if (((q = null), ($ = _), (K = _.indexOf(":")), K >= 0)) (q = _.substring(0, K)), ($ = _.substring(K + 1));
      if (q !== null && H === null) WO.NamespaceError();
      if (q === "xml" && H !== GyH.XML) WO.NamespaceError();
      if ((q === "xmlns" || _ === "xmlns") && H !== GyH.XMLNS) WO.NamespaceError();
      if (H === GyH.XMLNS && !(q === "xmlns" || _ === "xmlns")) WO.NamespaceError();
      return { namespace: H, prefix: q, localName: $ };
    }
    jH_.prototype = Object.create(_q9.prototype, {
      _setMutationHandler: {
        value: function (H) {
          this.mutationHandler = H;
        },
      },
      _dispatchRendererEvent: {
        value: function (H, _, q) {
          var $ = this._nodes[H];
          if (!$) return;
          $._dispatchEvent(new DH_(_, q), !0);
        },
      },
      nodeName: { value: "#document" },
      nodeValue: {
        get: function () {
          return null;
        },
        set: function () {},
      },
      documentURI: {
        get: function () {
          return this._address;
        },
        set: WO.nyi,
      },
      compatMode: {
        get: function () {
          return this._quirks ? "BackCompat" : "CSS1Compat";
        },
      },
      createTextNode: {
        value: function (H) {
          return new AF1(this, String(H));
        },
      },
      createComment: {
        value: function (H) {
          return new fF1(this, H);
        },
      },
      createDocumentFragment: {
        value: function () {
          return new wF1(this);
        },
      },
      createProcessingInstruction: {
        value: function (H, _) {
          if (!Td_.isValidName(H) || _.indexOf("?>") !== -1) WO.InvalidCharacterError();
          return new YF1(this, H, _);
        },
      },
      createAttribute: {
        value: function (H) {
          if (((H = String(H)), !Td_.isValidName(H))) WO.InvalidCharacterError();
          if (this.isHTML) H = WO.toASCIILowerCase(H);
          return new q9H._Attr(null, H, null, null, "");
        },
      },
      createAttributeNS: {
        value: function (H, _) {
          (H = H === null || H === void 0 || H === "" ? null : String(H)), (_ = String(_));
          var q = e89(H, _);
          return new q9H._Attr(null, q.localName, q.prefix, q.namespace, "");
        },
      },
      createElement: {
        value: function (H) {
          if (((H = String(H)), !Td_.isValidName(H))) WO.InvalidCharacterError();
          if (this.isHTML) {
            if (/[A-Z]/.test(H)) H = WO.toASCIILowerCase(H);
            return Us6.createElement(this, H, null);
          } else if (this.contentType === "application/xhtml+xml") return Us6.createElement(this, H, null);
          else return new q9H(this, H, null, null);
        },
        writable: Qs6,
      },
      createElementNS: {
        value: function (H, _) {
          (H = H === null || H === void 0 || H === "" ? null : String(H)), (_ = String(_));
          var q = e89(H, _);
          return this._createElementNS(q.localName, q.namespace, q.prefix);
        },
        writable: Qs6,
      },
      _createElementNS: {
        value: function (H, _, q) {
          if (_ === GyH.HTML) return Us6.createElement(this, H, q);
          else if (_ === GyH.SVG) return PF1.createElement(this, H, q);
          return new q9H(this, H, _, q);
        },
      },
      createEvent: {
        value: function (_) {
          _ = _.toLowerCase();
          var q = WF1[_] || _,
            $ = JF1[XF1[q]];
          if ($) {
            var K = new $();
            return (K._initialized = !1), K;
          } else WO.NotSupportedError();
        },
      },
      createTreeWalker: {
        value: function (H, _, q) {
          if (!H) throw TypeError("root argument is required");
          if (!(H instanceof rG)) throw TypeError("root not a node");
          return (_ = _ === void 0 ? a89.SHOW_ALL : +_), (q = q === void 0 ? null : q), new jF1(H, _, q);
        },
      },
      createNodeIterator: {
        value: function (H, _, q) {
          if (!H) throw TypeError("root argument is required");
          if (!(H instanceof rG)) throw TypeError("root not a node");
          return (_ = _ === void 0 ? a89.SHOW_ALL : +_), (q = q === void 0 ? null : q), new MF1(H, _, q);
        },
      },
      _attachNodeIterator: {
        value: function (H) {
          if (!this._nodeIterators) this._nodeIterators = [];
          this._nodeIterators.push(H);
        },
      },
      _detachNodeIterator: {
        value: function (H) {
          var _ = this._nodeIterators.indexOf(H);
          this._nodeIterators.splice(_, 1);
        },
      },
      _preremoveNodeIterators: {
        value: function (H) {
          if (this._nodeIterators)
            this._nodeIterators.forEach(function (_) {
              _._preremove(H);
            });
        },
      },
      _updateDocTypeElement: {
        value: function () {
          this.doctype = this.documentElement = null;
          for (var _ = this.firstChild; _ !== null; _ = _.nextSibling)
            if (_.nodeType === rG.DOCUMENT_TYPE_NODE) this.doctype = _;
            else if (_.nodeType === rG.ELEMENT_NODE) this.documentElement = _;
        },
      },
      insertBefore: {
        value: function (_, q) {
          return rG.prototype.insertBefore.call(this, _, q), this._updateDocTypeElement(), _;
        },
      },
      replaceChild: {
        value: function (_, q) {
          return rG.prototype.replaceChild.call(this, _, q), this._updateDocTypeElement(), q;
        },
      },
      removeChild: {
        value: function (_) {
          return rG.prototype.removeChild.call(this, _), this._updateDocTypeElement(), _;
        },
      },
      getElementById: {
        value: function (H) {
          var _ = this.byId[H];
          if (!_) return null;
          if (_ instanceof bo) return _.getFirst();
          return _;
        },
      },
      _hasMultipleElementsWithId: {
        value: function (H) {
          return this.byId[H] instanceof bo;
        },
      },
      getElementsByName: { value: q9H.prototype.getElementsByName },
      getElementsByTagName: { value: q9H.prototype.getElementsByTagName },
      getElementsByTagNameNS: { value: q9H.prototype.getElementsByTagNameNS },
      getElementsByClassName: { value: q9H.prototype.getElementsByClassName },
      adoptNode: {
        value: function (_) {
          if (_.nodeType === rG.DOCUMENT_NODE) WO.NotSupportedError();
          if (_.nodeType === rG.ATTRIBUTE_NODE) return _;
          if (_.parentNode) _.parentNode.removeChild(_);
          if (_.ownerDocument !== this) Kq9(_, this);
          return _;
        },
      },
      importNode: {
        value: function (_, q) {
          return this.adoptNode(_.cloneNode(q));
        },
        writable: Qs6,
      },
      origin: {
        get: function () {
          return null;
        },
      },
      characterSet: {
        get: function () {
          return "UTF-8";
        },
      },
      contentType: {
        get: function () {
          return this._contentType;
        },
      },
      URL: {
        get: function () {
          return this._address;
        },
      },
      domain: { get: WO.nyi, set: WO.nyi },
      referrer: { get: WO.nyi },
      cookie: { get: WO.nyi, set: WO.nyi },
      lastModified: { get: WO.nyi },
      location: {
        get: function () {
          return this.defaultView ? this.defaultView.location : null;
        },
        set: WO.nyi,
      },
      _titleElement: {
        get: function () {
          return this.getElementsByTagName("title").item(0) || null;
        },
      },
      title: {
        get: function () {
          var H = this._titleElement,
            _ = H ? H.textContent : "";
          return _.replace(/[ \t\n\r\f]+/g, " ").replace(/(^ )|( $)/g, "");
        },
        set: function (H) {
          var _ = this._titleElement,
            q = this.head;
          if (!_ && !q) return;
          if (!_) (_ = this.createElement("title")), q.appendChild(_);
          _.textContent = H;
        },
      },
      dir: WyH(
        function () {
          var H = this.documentElement;
          if (H && H.tagName === "HTML") return H;
        },
        "dir",
        "",
      ),
      fgColor: WyH(
        function () {
          return this.body;
        },
        "text",
        "",
      ),
      linkColor: WyH(
        function () {
          return this.body;
        },
        "link",
        "",
      ),
      vlinkColor: WyH(
        function () {
          return this.body;
        },
        "vLink",
        "",
      ),
      alinkColor: WyH(
        function () {
          return this.body;
        },
        "aLink",
        "",
      ),
      bgColor: WyH(
        function () {
          return this.body;
        },
        "bgColor",
        "",
      ),
      charset: {
        get: function () {
          return this.characterSet;
        },
      },
      inputEncoding: {
        get: function () {
          return this.characterSet;
        },
      },
      scrollingElement: {
        get: function () {
          return this._quirks ? this.body : this.documentElement;
        },
      },
      body: {
        get: function () {
          return Hq9(this.documentElement, "body");
        },
        set: WO.nyi,
      },
      head: {
        get: function () {
          return Hq9(this.documentElement, "head");
        },
      },
      images: { get: WO.nyi },
      embeds: { get: WO.nyi },
      plugins: { get: WO.nyi },
      links: { get: WO.nyi },
      forms: { get: WO.nyi },
      scripts: { get: WO.nyi },
      applets: {
        get: function () {
          return [];
        },
      },
      activeElement: {
        get: function () {
          return null;
        },
      },
      innerHTML: {
        get: function () {
          return this.serialize();
        },
        set: WO.nyi,
      },
      outerHTML: {
        get: function () {
          return this.serialize();
        },
        set: WO.nyi,
      },
      write: {
        value: function (H) {
          if (!this.isHTML) WO.InvalidStateError();
          if (!this._parser) return;
          if (!this._parser);
          var _ = arguments.join("");
          this._parser.parse(_);
        },
      },
      writeln: {
        value: function (_) {
          this.write(
            Array.prototype.join.call(arguments, "") +
              `
`,
          );
        },
      },
      open: {
        value: function () {
          this.documentElement = null;
        },
      },
      close: {
        value: function () {
          if (
            ((this.readyState = "interactive"),
            this._dispatchEvent(new DH_("readystatechange"), !0),
            this._dispatchEvent(new DH_("DOMContentLoaded"), !0),
            (this.readyState = "complete"),
            this._dispatchEvent(new DH_("readystatechange"), !0),
            this.defaultView)
          )
            this.defaultView._dispatchEvent(new DH_("load"), !0);
        },
      },
      clone: {
        value: function () {
          var _ = new jH_(this.isHTML, this._address);
          return (_._quirks = this._quirks), (_._contentType = this._contentType), _;
        },
      },
      cloneNode: {
        value: function (_) {
          var q = rG.prototype.cloneNode.call(this, !1);
          if (_) for (var $ = this.firstChild; $ !== null; $ = $.nextSibling) q._appendChild(q.importNode($, !0));
          return q._updateDocTypeElement(), q;
        },
      },
      isEqual: {
        value: function (_) {
          return !0;
        },
      },
      mutateValue: {
        value: function (H) {
          if (this.mutationHandler) this.mutationHandler({ type: XyH.VALUE, target: H, data: H.data });
        },
      },
      mutateAttr: {
        value: function (H, _) {
          if (this.mutationHandler) this.mutationHandler({ type: XyH.ATTR, target: H.ownerElement, attr: H });
        },
      },
      mutateRemoveAttr: {
        value: function (H) {
          if (this.mutationHandler) this.mutationHandler({ type: XyH.REMOVE_ATTR, target: H.ownerElement, attr: H });
        },
      },
      mutateRemove: {
        value: function (H) {
          if (this.mutationHandler) this.mutationHandler({ type: XyH.REMOVE, target: H.parentNode, node: H });
          $q9(H);
        },
      },
      mutateInsert: {
        value: function (H) {
          if ((qq9(H), this.mutationHandler)) this.mutationHandler({ type: XyH.INSERT, target: H.parentNode, node: H });
        },
      },
      mutateMove: {
        value: function (H) {
          if (this.mutationHandler) this.mutationHandler({ type: XyH.MOVE, target: H });
        },
      },
      addId: {
        value: function (_, q) {
          var $ = this.byId[_];
          if (!$) this.byId[_] = q;
          else {
            if (!($ instanceof bo)) ($ = new bo($)), (this.byId[_] = $);
            $.add(q);
          }
        },
      },
      delId: {
        value: function (_, q) {
          var $ = this.byId[_];
          if ((WO.assert($), $ instanceof bo)) {
            if (($.del(q), $.length === 1)) this.byId[_] = $.downgrade();
          } else this.byId[_] = void 0;
        },
      },
      _resolve: {
        value: function (H) {
          return new s89(this._documentBaseURL).resolve(H);
        },
      },
      _documentBaseURL: {
        get: function () {
          var H = this._address;
          if (H === "about:blank") H = "/";
          var _ = this.querySelector("base[href]");
          if (_) return new s89(H).resolve(_.getAttribute("href"));
          return H;
        },
      },
      _templateDoc: {
        get: function () {
          if (!this._templateDocCache) {
            var H = new jH_(this.isHTML, this._address);
            this._templateDocCache = H._templateDocCache = H;
          }
          return this._templateDocCache;
        },
      },
      querySelector: {
        value: function (H) {
          return t89(H, this)[0];
        },
      },
      querySelectorAll: {
        value: function (H) {
          var _ = t89(H, this);
          return _.item ? _ : new zF1(_);
        },
      },
    });
    var GF1 = [
      "abort",
      "canplay",
      "canplaythrough",
      "change",
      "click",
      "contextmenu",
      "cuechange",
      "dblclick",
      "drag",
      "dragend",
      "dragenter",
      "dragleave",
      "dragover",
      "dragstart",
      "drop",
      "durationchange",
      "emptied",
      "ended",
      "input",
      "invalid",
      "keydown",
      "keypress",
      "keyup",
      "loadeddata",
      "loadedmetadata",
      "loadstart",
      "mousedown",
      "mousemove",
      "mouseout",
      "mouseover",
      "mouseup",
      "mousewheel",
      "pause",
      "play",
      "playing",
      "progress",
      "ratechange",
      "readystatechange",
      "reset",
      "seeked",
      "seeking",
      "select",
      "show",
      "stalled",
      "submit",
      "suspend",
      "timeupdate",
      "volumechange",
      "waiting",
      "blur",
      "error",
      "focus",
      "load",
      "scroll",
    ];
    GF1.forEach(function (H) {
      Object.defineProperty(jH_.prototype, "on" + H, {
        get: function () {
          return this._getEventHandler(H);
        },
        set: function (_) {
          this._setEventHandler(H, _);
        },
      });
    });
    function Hq9(H, _) {
      if (H && H.isHTML) {
        for (var q = H.firstChild; q !== null; q = q.nextSibling)
          if (q.nodeType === rG.ELEMENT_NODE && q.localName === _ && q.namespaceURI === GyH.HTML) return q;
      }
      return null;
    }
    function RF1(H) {
      if (
        ((H._nid = H.ownerDocument._nextnid++), (H.ownerDocument._nodes[H._nid] = H), H.nodeType === rG.ELEMENT_NODE)
      ) {
        var _ = H.getAttribute("id");
        if (_) H.ownerDocument.addId(_, H);
        if (H._roothook) H._roothook();
      }
    }
    function ZF1(H) {
      if (H.nodeType === rG.ELEMENT_NODE) {
        var _ = H.getAttribute("id");
        if (_) H.ownerDocument.delId(_, H);
      }
      (H.ownerDocument._nodes[H._nid] = void 0), (H._nid = void 0);
    }
    function qq9(H) {
      if ((RF1(H), H.nodeType === rG.ELEMENT_NODE)) for (var _ = H.firstChild; _ !== null; _ = _.nextSibling) qq9(_);
    }
    function $q9(H) {
      ZF1(H);
      for (var _ = H.firstChild; _ !== null; _ = _.nextSibling) $q9(_);
    }
    function Kq9(H, _) {
      if (((H.ownerDocument = _), (H._lastModTime = void 0), Object.prototype.hasOwnProperty.call(H, "_tagName")))
        H._tagName = void 0;
      for (var q = H.firstChild; q !== null; q = q.nextSibling) Kq9(q, _);
    }
    function bo(H) {
      (this.nodes = Object.create(null)), (this.nodes[H._nid] = H), (this.length = 1), (this.firstNode = void 0);
    }
    bo.prototype.add = function (H) {
      if (!this.nodes[H._nid]) (this.nodes[H._nid] = H), this.length++, (this.firstNode = void 0);
    };
    bo.prototype.del = function (H) {
      if (this.nodes[H._nid]) delete this.nodes[H._nid], this.length--, (this.firstNode = void 0);
    };
    bo.prototype.getFirst = function () {
      if (!this.firstNode) {
        var H;
        for (H in this.nodes)
          if (
            this.firstNode === void 0 ||
            this.firstNode.compareDocumentPosition(this.nodes[H]) & rG.DOCUMENT_POSITION_PRECEDING
          )
            this.firstNode = this.nodes[H];
      }
      return this.firstNode;
    };
    bo.prototype.downgrade = function () {
      if (this.length === 1) {
        var H;
        for (H in this.nodes) return this.nodes[H];
      }
      return this;
    };
  });

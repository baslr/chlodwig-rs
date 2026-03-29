  var pW = d((PzT, D69) => {
    D69.exports = lw;
    var Y69 = Fa6(),
      cg_ = Ua6(),
      z69 = Qa6(),
      lO = rD();
    function lw() {
      Y69.call(this),
        (this.parentNode = null),
        (this._nextSibling = this._previousSibling = this),
        (this._index = void 0);
    }
    var ev = (lw.ELEMENT_NODE = 1),
      la6 = (lw.ATTRIBUTE_NODE = 2),
      Fg_ = (lw.TEXT_NODE = 3),
      sd1 = (lw.CDATA_SECTION_NODE = 4),
      td1 = (lw.ENTITY_REFERENCE_NODE = 5),
      ia6 = (lw.ENTITY_NODE = 6),
      A69 = (lw.PROCESSING_INSTRUCTION_NODE = 7),
      f69 = (lw.COMMENT_NODE = 8),
      teH = (lw.DOCUMENT_NODE = 9),
      $b = (lw.DOCUMENT_TYPE_NODE = 10),
      e7H = (lw.DOCUMENT_FRAGMENT_NODE = 11),
      na6 = (lw.NOTATION_NODE = 12),
      ra6 = (lw.DOCUMENT_POSITION_DISCONNECTED = 1),
      oa6 = (lw.DOCUMENT_POSITION_PRECEDING = 2),
      aa6 = (lw.DOCUMENT_POSITION_FOLLOWING = 4),
      w69 = (lw.DOCUMENT_POSITION_CONTAINS = 8),
      sa6 = (lw.DOCUMENT_POSITION_CONTAINED_BY = 16),
      ta6 = (lw.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32);
    lw.prototype = Object.create(Y69.prototype, {
      baseURI: { get: lO.nyi },
      parentElement: {
        get: function () {
          return this.parentNode && this.parentNode.nodeType === ev ? this.parentNode : null;
        },
      },
      hasChildNodes: { value: lO.shouldOverride },
      firstChild: { get: lO.shouldOverride },
      lastChild: { get: lO.shouldOverride },
      isConnected: {
        get: function () {
          let H = this;
          while (H != null) {
            if (H.nodeType === lw.DOCUMENT_NODE) return !0;
            if (((H = H.parentNode), H != null && H.nodeType === lw.DOCUMENT_FRAGMENT_NODE)) H = H.host;
          }
          return !1;
        },
      },
      previousSibling: {
        get: function () {
          var H = this.parentNode;
          if (!H) return null;
          if (this === H.firstChild) return null;
          return this._previousSibling;
        },
      },
      nextSibling: {
        get: function () {
          var H = this.parentNode,
            _ = this._nextSibling;
          if (!H) return null;
          if (_ === H.firstChild) return null;
          return _;
        },
      },
      textContent: {
        get: function () {
          return null;
        },
        set: function (H) {},
      },
      innerText: {
        get: function () {
          return null;
        },
        set: function (H) {},
      },
      _countChildrenOfType: {
        value: function (H) {
          var _ = 0;
          for (var q = this.firstChild; q !== null; q = q.nextSibling) if (q.nodeType === H) _++;
          return _;
        },
      },
      _ensureInsertValid: {
        value: function (_, q, $) {
          var K = this,
            O,
            T;
          if (!_.nodeType) throw TypeError("not a node");
          switch (K.nodeType) {
            case teH:
            case e7H:
            case ev:
              break;
            default:
              lO.HierarchyRequestError();
          }
          if (_.isAncestor(K)) lO.HierarchyRequestError();
          if (q !== null || !$) {
            if (q.parentNode !== K) lO.NotFoundError();
          }
          switch (_.nodeType) {
            case e7H:
            case $b:
            case ev:
            case Fg_:
            case A69:
            case f69:
              break;
            default:
              lO.HierarchyRequestError();
          }
          if (K.nodeType === teH)
            switch (_.nodeType) {
              case Fg_:
                lO.HierarchyRequestError();
                break;
              case e7H:
                if (_._countChildrenOfType(Fg_) > 0) lO.HierarchyRequestError();
                switch (_._countChildrenOfType(ev)) {
                  case 0:
                    break;
                  case 1:
                    if (q !== null) {
                      if ($ && q.nodeType === $b) lO.HierarchyRequestError();
                      for (T = q.nextSibling; T !== null; T = T.nextSibling)
                        if (T.nodeType === $b) lO.HierarchyRequestError();
                    }
                    if (((O = K._countChildrenOfType(ev)), $)) {
                      if (O > 0) lO.HierarchyRequestError();
                    } else if (O > 1 || (O === 1 && q.nodeType !== ev)) lO.HierarchyRequestError();
                    break;
                  default:
                    lO.HierarchyRequestError();
                }
                break;
              case ev:
                if (q !== null) {
                  if ($ && q.nodeType === $b) lO.HierarchyRequestError();
                  for (T = q.nextSibling; T !== null; T = T.nextSibling)
                    if (T.nodeType === $b) lO.HierarchyRequestError();
                }
                if (((O = K._countChildrenOfType(ev)), $)) {
                  if (O > 0) lO.HierarchyRequestError();
                } else if (O > 1 || (O === 1 && q.nodeType !== ev)) lO.HierarchyRequestError();
                break;
              case $b:
                if (q === null) {
                  if (K._countChildrenOfType(ev)) lO.HierarchyRequestError();
                } else
                  for (T = K.firstChild; T !== null; T = T.nextSibling) {
                    if (T === q) break;
                    if (T.nodeType === ev) lO.HierarchyRequestError();
                  }
                if (((O = K._countChildrenOfType($b)), $)) {
                  if (O > 0) lO.HierarchyRequestError();
                } else if (O > 1 || (O === 1 && q.nodeType !== $b)) lO.HierarchyRequestError();
                break;
            }
          else if (_.nodeType === $b) lO.HierarchyRequestError();
        },
      },
      insertBefore: {
        value: function (_, q) {
          var $ = this;
          $._ensureInsertValid(_, q, !0);
          var K = q;
          if (K === _) K = _.nextSibling;
          return $.doc.adoptNode(_), _._insertOrReplace($, K, !1), _;
        },
      },
      appendChild: {
        value: function (H) {
          return this.insertBefore(H, null);
        },
      },
      _appendChild: {
        value: function (H) {
          H._insertOrReplace(this, null, !1);
        },
      },
      removeChild: {
        value: function (_) {
          var q = this;
          if (!_.nodeType) throw TypeError("not a node");
          if (_.parentNode !== q) lO.NotFoundError();
          return _.remove(), _;
        },
      },
      replaceChild: {
        value: function (_, q) {
          var $ = this;
          if (($._ensureInsertValid(_, q, !1), _.doc !== $.doc)) $.doc.adoptNode(_);
          return _._insertOrReplace($, q, !0), q;
        },
      },
      contains: {
        value: function (_) {
          if (_ === null) return !1;
          if (this === _) return !0;
          return (this.compareDocumentPosition(_) & sa6) !== 0;
        },
      },
      compareDocumentPosition: {
        value: function (_) {
          if (this === _) return 0;
          if (this.doc !== _.doc || this.rooted !== _.rooted) return ra6 + ta6;
          var q = [],
            $ = [];
          for (var K = this; K !== null; K = K.parentNode) q.push(K);
          for (K = _; K !== null; K = K.parentNode) $.push(K);
          if ((q.reverse(), $.reverse(), q[0] !== $[0])) return ra6 + ta6;
          K = Math.min(q.length, $.length);
          for (var O = 1; O < K; O++)
            if (q[O] !== $[O])
              if (q[O].index < $[O].index) return aa6;
              else return oa6;
          if (q.length < $.length) return aa6 + sa6;
          else return oa6 + w69;
        },
      },
      isSameNode: {
        value: function (_) {
          return this === _;
        },
      },
      isEqualNode: {
        value: function (_) {
          if (!_) return !1;
          if (_.nodeType !== this.nodeType) return !1;
          if (!this.isEqual(_)) return !1;
          for (var q = this.firstChild, $ = _.firstChild; q && $; q = q.nextSibling, $ = $.nextSibling)
            if (!q.isEqualNode($)) return !1;
          return q === null && $ === null;
        },
      },
      cloneNode: {
        value: function (H) {
          var _ = this.clone();
          if (H) for (var q = this.firstChild; q !== null; q = q.nextSibling) _._appendChild(q.cloneNode(!0));
          return _;
        },
      },
      lookupPrefix: {
        value: function (_) {
          var q;
          if (_ === "" || _ === null || _ === void 0) return null;
          switch (this.nodeType) {
            case ev:
              return this._lookupNamespacePrefix(_, this);
            case teH:
              return (q = this.documentElement), q ? q.lookupPrefix(_) : null;
            case ia6:
            case na6:
            case e7H:
            case $b:
              return null;
            case la6:
              return (q = this.ownerElement), q ? q.lookupPrefix(_) : null;
            default:
              return (q = this.parentElement), q ? q.lookupPrefix(_) : null;
          }
        },
      },
      lookupNamespaceURI: {
        value: function (_) {
          if (_ === "" || _ === void 0) _ = null;
          var q;
          switch (this.nodeType) {
            case ev:
              return lO.shouldOverride();
            case teH:
              return (q = this.documentElement), q ? q.lookupNamespaceURI(_) : null;
            case ia6:
            case na6:
            case $b:
            case e7H:
              return null;
            case la6:
              return (q = this.ownerElement), q ? q.lookupNamespaceURI(_) : null;
            default:
              return (q = this.parentElement), q ? q.lookupNamespaceURI(_) : null;
          }
        },
      },
      isDefaultNamespace: {
        value: function (_) {
          if (_ === "" || _ === void 0) _ = null;
          var q = this.lookupNamespaceURI(null);
          return q === _;
        },
      },
      index: {
        get: function () {
          var H = this.parentNode;
          if (this === H.firstChild) return 0;
          var _ = H.childNodes;
          if (this._index === void 0 || _[this._index] !== this) {
            for (var q = 0; q < _.length; q++) _[q]._index = q;
            lO.assert(_[this._index] === this);
          }
          return this._index;
        },
      },
      isAncestor: {
        value: function (H) {
          if (this.doc !== H.doc) return !1;
          if (this.rooted !== H.rooted) return !1;
          for (var _ = H; _; _ = _.parentNode) if (_ === this) return !0;
          return !1;
        },
      },
      ensureSameDoc: {
        value: function (H) {
          if (H.ownerDocument === null) H.ownerDocument = this.doc;
          else if (H.ownerDocument !== this.doc) lO.WrongDocumentError();
        },
      },
      removeChildren: { value: lO.shouldOverride },
      _insertOrReplace: {
        value: function (_, q, $) {
          var K = this,
            O,
            T;
          if (K.nodeType === e7H && K.rooted) lO.HierarchyRequestError();
          if (_._childNodes) {
            if (((O = q === null ? _._childNodes.length : q.index), K.parentNode === _)) {
              var z = K.index;
              if (z < O) O--;
            }
          }
          if ($) {
            if (q.rooted) q.doc.mutateRemove(q);
            q.parentNode = null;
          }
          var A = q;
          if (A === null) A = _.firstChild;
          var f = K.rooted && _.rooted;
          if (K.nodeType === e7H) {
            var w = [0, $ ? 1 : 0],
              Y;
            for (var D = K.firstChild; D !== null; D = Y) (Y = D.nextSibling), w.push(D), (D.parentNode = _);
            var j = w.length;
            if ($) cg_.replace(A, j > 2 ? w[2] : null);
            else if (j > 2 && A !== null) cg_.insertBefore(w[2], A);
            if (_._childNodes) {
              (w[0] = q === null ? _._childNodes.length : q._index), _._childNodes.splice.apply(_._childNodes, w);
              for (T = 2; T < j; T++) w[T]._index = w[0] + (T - 2);
            } else if (_._firstChild === q) {
              if (j > 2) _._firstChild = w[2];
              else if ($) _._firstChild = null;
            }
            if (K._childNodes) K._childNodes.length = 0;
            else K._firstChild = null;
            if (_.rooted) {
              _.modify();
              for (T = 2; T < j; T++) _.doc.mutateInsert(w[T]);
            }
          } else {
            if (q === K) return;
            if (f) K._remove();
            else if (K.parentNode) K.remove();
            if (((K.parentNode = _), $)) {
              if ((cg_.replace(A, K), _._childNodes)) (K._index = O), (_._childNodes[O] = K);
              else if (_._firstChild === q) _._firstChild = K;
            } else {
              if (A !== null) cg_.insertBefore(K, A);
              if (_._childNodes) (K._index = O), _._childNodes.splice(O, 0, K);
              else if (_._firstChild === q) _._firstChild = K;
            }
            if (f) _.modify(), _.doc.mutateMove(K);
            else if (_.rooted) _.modify(), _.doc.mutateInsert(K);
          }
        },
      },
      lastModTime: {
        get: function () {
          if (!this._lastModTime) this._lastModTime = this.doc.modclock;
          return this._lastModTime;
        },
      },
      modify: {
        value: function () {
          if (this.doc.modclock) {
            var H = ++this.doc.modclock;
            for (var _ = this; _; _ = _.parentElement) if (_._lastModTime) _._lastModTime = H;
          }
        },
      },
      doc: {
        get: function () {
          return this.ownerDocument || this;
        },
      },
      rooted: {
        get: function () {
          return !!this._nid;
        },
      },
      normalize: {
        value: function () {
          var H;
          for (var _ = this.firstChild; _ !== null; _ = H) {
            if (((H = _.nextSibling), _.normalize)) _.normalize();
            if (_.nodeType !== lw.TEXT_NODE) continue;
            if (_.nodeValue === "") {
              this.removeChild(_);
              continue;
            }
            var q = _.previousSibling;
            if (q === null) continue;
            else if (q.nodeType === lw.TEXT_NODE) q.appendData(_.nodeValue), this.removeChild(_);
          }
        },
      },
      serialize: {
        value: function () {
          if (this._innerHTML) return this._innerHTML;
          var H = "";
          for (var _ = this.firstChild; _ !== null; _ = _.nextSibling) H += z69.serializeOne(_, this);
          return H;
        },
      },
      outerHTML: {
        get: function () {
          return z69.serializeOne(this, { nodeType: 0 });
        },
        set: lO.nyi,
      },
      ELEMENT_NODE: { value: ev },
      ATTRIBUTE_NODE: { value: la6 },
      TEXT_NODE: { value: Fg_ },
      CDATA_SECTION_NODE: { value: sd1 },
      ENTITY_REFERENCE_NODE: { value: td1 },
      ENTITY_NODE: { value: ia6 },
      PROCESSING_INSTRUCTION_NODE: { value: A69 },
      COMMENT_NODE: { value: f69 },
      DOCUMENT_NODE: { value: teH },
      DOCUMENT_TYPE_NODE: { value: $b },
      DOCUMENT_FRAGMENT_NODE: { value: e7H },
      NOTATION_NODE: { value: na6 },
      DOCUMENT_POSITION_DISCONNECTED: { value: ra6 },
      DOCUMENT_POSITION_PRECEDING: { value: oa6 },
      DOCUMENT_POSITION_FOLLOWING: { value: aa6 },
      DOCUMENT_POSITION_CONTAINS: { value: w69 },
      DOCUMENT_POSITION_CONTAINED_BY: { value: sa6 },
      DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: { value: ta6 },
    });
  });

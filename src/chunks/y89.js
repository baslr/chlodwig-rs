  var y89 = d((gzT, h89) => {
    h89.exports = N89;
    var Is6 = fH_(),
      us6 = Es6(),
      v89 = rD();
    function nc1(H, _, q) {
      if (q) return us6.next(H, _);
      else {
        if (H === _) return null;
        return us6.previous(H, null);
      }
    }
    function L89(H, _) {
      for (; _; _ = _.parentNode) if (H === _) return !0;
      return !1;
    }
    function k89(H, _) {
      var q, $;
      (q = H._referenceNode), ($ = H._pointerBeforeReferenceNode);
      while (!0) {
        if ($ === _) $ = !$;
        else if (((q = nc1(q, H._root, _)), q === null)) return null;
        var K = H._internalFilter(q);
        if (K === Is6.FILTER_ACCEPT) break;
      }
      return (H._referenceNode = q), (H._pointerBeforeReferenceNode = $), q;
    }
    function N89(H, _, q) {
      if (!H || !H.nodeType) v89.NotSupportedError();
      (this._root = H),
        (this._referenceNode = H),
        (this._pointerBeforeReferenceNode = !0),
        (this._whatToShow = Number(_) || 0),
        (this._filter = q || null),
        (this._active = !1),
        H.doc._attachNodeIterator(this);
    }
    Object.defineProperties(N89.prototype, {
      root: {
        get: function () {
          return this._root;
        },
      },
      referenceNode: {
        get: function () {
          return this._referenceNode;
        },
      },
      pointerBeforeReferenceNode: {
        get: function () {
          return this._pointerBeforeReferenceNode;
        },
      },
      whatToShow: {
        get: function () {
          return this._whatToShow;
        },
      },
      filter: {
        get: function () {
          return this._filter;
        },
      },
      _internalFilter: {
        value: function (_) {
          var q, $;
          if (this._active) v89.InvalidStateError();
          if (!((1 << (_.nodeType - 1)) & this._whatToShow)) return Is6.FILTER_SKIP;
          if ((($ = this._filter), $ === null)) q = Is6.FILTER_ACCEPT;
          else {
            this._active = !0;
            try {
              if (typeof $ === "function") q = $(_);
              else q = $.acceptNode(_);
            } finally {
              this._active = !1;
            }
          }
          return +q;
        },
      },
      _preremove: {
        value: function (_) {
          if (L89(_, this._root)) return;
          if (!L89(_, this._referenceNode)) return;
          if (this._pointerBeforeReferenceNode) {
            var q = _;
            while (q.lastChild) q = q.lastChild;
            if (((q = us6.next(q, this.root)), q)) {
              this._referenceNode = q;
              return;
            }
            this._pointerBeforeReferenceNode = !1;
          }
          if (_.previousSibling === null) this._referenceNode = _.parentNode;
          else {
            this._referenceNode = _.previousSibling;
            var $;
            for ($ = this._referenceNode.lastChild; $; $ = this._referenceNode.lastChild) this._referenceNode = $;
          }
        },
      },
      nextNode: {
        value: function () {
          return k89(this, !0);
        },
      },
      previousNode: {
        value: function () {
          return k89(this, !1);
        },
      },
      detach: { value: function () {} },
      toString: {
        value: function () {
          return "[object NodeIterator]";
        },
      },
    });
  });

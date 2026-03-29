  var Z89 = d((BzT, R89) => {
    R89.exports = G89;
    var ic1 = pW(),
      BW = fH_(),
      J89 = Es6(),
      W89 = rD(),
      Cs6 = { first: "firstChild", last: "lastChild", next: "firstChild", previous: "lastChild" },
      bs6 = { first: "nextSibling", last: "previousSibling", next: "nextSibling", previous: "previousSibling" };
    function P89(H, _) {
      var q, $, K, O, T;
      $ = H._currentNode[Cs6[_]];
      while ($ !== null) {
        if (((O = H._internalFilter($)), O === BW.FILTER_ACCEPT)) return (H._currentNode = $), $;
        if (O === BW.FILTER_SKIP) {
          if (((q = $[Cs6[_]]), q !== null)) {
            $ = q;
            continue;
          }
        }
        while ($ !== null) {
          if (((T = $[bs6[_]]), T !== null)) {
            $ = T;
            break;
          }
          if (((K = $.parentNode), K === null || K === H.root || K === H._currentNode)) return null;
          else $ = K;
        }
      }
      return null;
    }
    function X89(H, _) {
      var q, $, K;
      if (((q = H._currentNode), q === H.root)) return null;
      while (!0) {
        K = q[bs6[_]];
        while (K !== null) {
          if (((q = K), ($ = H._internalFilter(q)), $ === BW.FILTER_ACCEPT)) return (H._currentNode = q), q;
          if (((K = q[Cs6[_]]), $ === BW.FILTER_REJECT || K === null)) K = q[bs6[_]];
        }
        if (((q = q.parentNode), q === null || q === H.root)) return null;
        if (H._internalFilter(q) === BW.FILTER_ACCEPT) return null;
      }
    }
    function G89(H, _, q) {
      if (!H || !H.nodeType) W89.NotSupportedError();
      (this._root = H),
        (this._whatToShow = Number(_) || 0),
        (this._filter = q || null),
        (this._active = !1),
        (this._currentNode = H);
    }
    Object.defineProperties(G89.prototype, {
      root: {
        get: function () {
          return this._root;
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
      currentNode: {
        get: function () {
          return this._currentNode;
        },
        set: function (_) {
          if (!(_ instanceof ic1)) throw TypeError("Not a Node");
          this._currentNode = _;
        },
      },
      _internalFilter: {
        value: function (_) {
          var q, $;
          if (this._active) W89.InvalidStateError();
          if (!((1 << (_.nodeType - 1)) & this._whatToShow)) return BW.FILTER_SKIP;
          if ((($ = this._filter), $ === null)) q = BW.FILTER_ACCEPT;
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
      parentNode: {
        value: function () {
          var _ = this._currentNode;
          while (_ !== this.root) {
            if (((_ = _.parentNode), _ === null)) return null;
            if (this._internalFilter(_) === BW.FILTER_ACCEPT) return (this._currentNode = _), _;
          }
          return null;
        },
      },
      firstChild: {
        value: function () {
          return P89(this, "first");
        },
      },
      lastChild: {
        value: function () {
          return P89(this, "last");
        },
      },
      previousSibling: {
        value: function () {
          return X89(this, "previous");
        },
      },
      nextSibling: {
        value: function () {
          return X89(this, "next");
        },
      },
      previousNode: {
        value: function () {
          var _, q, $, K;
          _ = this._currentNode;
          while (_ !== this._root) {
            for ($ = _.previousSibling; $; $ = _.previousSibling) {
              if (((_ = $), (q = this._internalFilter(_)), q === BW.FILTER_REJECT)) continue;
              for (K = _.lastChild; K; K = _.lastChild)
                if (((_ = K), (q = this._internalFilter(_)), q === BW.FILTER_REJECT)) break;
              if (q === BW.FILTER_ACCEPT) return (this._currentNode = _), _;
            }
            if (_ === this.root || _.parentNode === null) return null;
            if (((_ = _.parentNode), this._internalFilter(_) === BW.FILTER_ACCEPT)) return (this._currentNode = _), _;
          }
          return null;
        },
      },
      nextNode: {
        value: function () {
          var _, q, $, K;
          (_ = this._currentNode), (q = BW.FILTER_ACCEPT);
          H: while (!0) {
            for ($ = _.firstChild; $; $ = _.firstChild)
              if (((_ = $), (q = this._internalFilter(_)), q === BW.FILTER_ACCEPT)) return (this._currentNode = _), _;
              else if (q === BW.FILTER_REJECT) break;
            for (K = J89.nextSkippingChildren(_, this.root); K; K = J89.nextSkippingChildren(_, this.root))
              if (((_ = K), (q = this._internalFilter(_)), q === BW.FILTER_ACCEPT)) return (this._currentNode = _), _;
              else if (q === BW.FILTER_SKIP) continue H;
            return null;
          }
        },
      },
      toString: {
        value: function () {
          return "[object TreeWalker]";
        },
      },
    });
  });

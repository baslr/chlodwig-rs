  var Rj7 = d((T7O, Gj7) => {
    class Xx {
      constructor(H) {
        (this.length = 0), (this.entries = []), (this.treeAdapter = H), (this.bookmark = null);
      }
      _getNoahArkConditionCandidates(H) {
        let _ = [];
        if (this.length >= 3) {
          let q = this.treeAdapter.getAttrList(H).length,
            $ = this.treeAdapter.getTagName(H),
            K = this.treeAdapter.getNamespaceURI(H);
          for (let O = this.length - 1; O >= 0; O--) {
            let T = this.entries[O];
            if (T.type === Xx.MARKER_ENTRY) break;
            let z = T.element,
              A = this.treeAdapter.getAttrList(z);
            if (this.treeAdapter.getTagName(z) === $ && this.treeAdapter.getNamespaceURI(z) === K && A.length === q)
              _.push({ idx: O, attrs: A });
          }
        }
        return _.length < 3 ? [] : _;
      }
      _ensureNoahArkCondition(H) {
        let _ = this._getNoahArkConditionCandidates(H),
          q = _.length;
        if (q) {
          let $ = this.treeAdapter.getAttrList(H),
            K = $.length,
            O = Object.create(null);
          for (let T = 0; T < K; T++) {
            let z = $[T];
            O[z.name] = z.value;
          }
          for (let T = 0; T < K; T++)
            for (let z = 0; z < q; z++) {
              let A = _[z].attrs[T];
              if (O[A.name] !== A.value) _.splice(z, 1), q--;
              if (_.length < 3) return;
            }
          for (let T = q - 1; T >= 2; T--) this.entries.splice(_[T].idx, 1), this.length--;
        }
      }
      insertMarker() {
        this.entries.push({ type: Xx.MARKER_ENTRY }), this.length++;
      }
      pushElement(H, _) {
        this._ensureNoahArkCondition(H),
          this.entries.push({ type: Xx.ELEMENT_ENTRY, element: H, token: _ }),
          this.length++;
      }
      insertElementAfterBookmark(H, _) {
        let q = this.length - 1;
        for (; q >= 0; q--) if (this.entries[q] === this.bookmark) break;
        this.entries.splice(q + 1, 0, { type: Xx.ELEMENT_ENTRY, element: H, token: _ }), this.length++;
      }
      removeEntry(H) {
        for (let _ = this.length - 1; _ >= 0; _--)
          if (this.entries[_] === H) {
            this.entries.splice(_, 1), this.length--;
            break;
          }
      }
      clearToLastMarker() {
        while (this.length) {
          let H = this.entries.pop();
          if ((this.length--, H.type === Xx.MARKER_ENTRY)) break;
        }
      }
      getElementEntryInScopeWithTagName(H) {
        for (let _ = this.length - 1; _ >= 0; _--) {
          let q = this.entries[_];
          if (q.type === Xx.MARKER_ENTRY) return null;
          if (this.treeAdapter.getTagName(q.element) === H) return q;
        }
        return null;
      }
      getElementEntry(H) {
        for (let _ = this.length - 1; _ >= 0; _--) {
          let q = this.entries[_];
          if (q.type === Xx.ELEMENT_ENTRY && q.element === H) return q;
        }
        return null;
      }
    }
    Xx.MARKER_ENTRY = "MARKER_ENTRY";
    Xx.ELEMENT_ENTRY = "ELEMENT_ENTRY";
    Gj7.exports = Xx;
  });

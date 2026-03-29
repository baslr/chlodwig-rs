  var Wj7 = d((O7O, Xj7) => {
    var Jj7 = w8H(),
      Nq = Jj7.TAG_NAMES,
      Mz = Jj7.NAMESPACES;
    function Mj7(H) {
      switch (H.length) {
        case 1:
          return H === Nq.P;
        case 2:
          return H === Nq.RB || H === Nq.RP || H === Nq.RT || H === Nq.DD || H === Nq.DT || H === Nq.LI;
        case 3:
          return H === Nq.RTC;
        case 6:
          return H === Nq.OPTION;
        case 8:
          return H === Nq.OPTGROUP;
      }
      return !1;
    }
    function Sq1(H) {
      switch (H.length) {
        case 1:
          return H === Nq.P;
        case 2:
          return (
            H === Nq.RB ||
            H === Nq.RP ||
            H === Nq.RT ||
            H === Nq.DD ||
            H === Nq.DT ||
            H === Nq.LI ||
            H === Nq.TD ||
            H === Nq.TH ||
            H === Nq.TR
          );
        case 3:
          return H === Nq.RTC;
        case 5:
          return H === Nq.TBODY || H === Nq.TFOOT || H === Nq.THEAD;
        case 6:
          return H === Nq.OPTION;
        case 7:
          return H === Nq.CAPTION;
        case 8:
          return H === Nq.OPTGROUP || H === Nq.COLGROUP;
      }
      return !1;
    }
    function EN_(H, _) {
      switch (H.length) {
        case 2:
          if (H === Nq.TD || H === Nq.TH) return _ === Mz.HTML;
          else if (H === Nq.MI || H === Nq.MO || H === Nq.MN || H === Nq.MS) return _ === Mz.MATHML;
          break;
        case 4:
          if (H === Nq.HTML) return _ === Mz.HTML;
          else if (H === Nq.DESC) return _ === Mz.SVG;
          break;
        case 5:
          if (H === Nq.TABLE) return _ === Mz.HTML;
          else if (H === Nq.MTEXT) return _ === Mz.MATHML;
          else if (H === Nq.TITLE) return _ === Mz.SVG;
          break;
        case 6:
          return (H === Nq.APPLET || H === Nq.OBJECT) && _ === Mz.HTML;
        case 7:
          return (H === Nq.CAPTION || H === Nq.MARQUEE) && _ === Mz.HTML;
        case 8:
          return H === Nq.TEMPLATE && _ === Mz.HTML;
        case 13:
          return H === Nq.FOREIGN_OBJECT && _ === Mz.SVG;
        case 14:
          return H === Nq.ANNOTATION_XML && _ === Mz.MATHML;
      }
      return !1;
    }
    class Pj7 {
      constructor(H, _) {
        (this.stackTop = -1),
          (this.items = []),
          (this.current = H),
          (this.currentTagName = null),
          (this.currentTmplContent = null),
          (this.tmplCount = 0),
          (this.treeAdapter = _);
      }
      _indexOf(H) {
        let _ = -1;
        for (let q = this.stackTop; q >= 0; q--)
          if (this.items[q] === H) {
            _ = q;
            break;
          }
        return _;
      }
      _isInTemplate() {
        return this.currentTagName === Nq.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === Mz.HTML;
      }
      _updateCurrentElement() {
        (this.current = this.items[this.stackTop]),
          (this.currentTagName = this.current && this.treeAdapter.getTagName(this.current)),
          (this.currentTmplContent = this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : null);
      }
      push(H) {
        if (((this.items[++this.stackTop] = H), this._updateCurrentElement(), this._isInTemplate())) this.tmplCount++;
      }
      pop() {
        if ((this.stackTop--, this.tmplCount > 0 && this._isInTemplate())) this.tmplCount--;
        this._updateCurrentElement();
      }
      replace(H, _) {
        let q = this._indexOf(H);
        if (((this.items[q] = _), q === this.stackTop)) this._updateCurrentElement();
      }
      insertAfter(H, _) {
        let q = this._indexOf(H) + 1;
        if ((this.items.splice(q, 0, _), q === ++this.stackTop)) this._updateCurrentElement();
      }
      popUntilTagNamePopped(H) {
        while (this.stackTop > -1) {
          let _ = this.currentTagName,
            q = this.treeAdapter.getNamespaceURI(this.current);
          if ((this.pop(), _ === H && q === Mz.HTML)) break;
        }
      }
      popUntilElementPopped(H) {
        while (this.stackTop > -1) {
          let _ = this.current;
          if ((this.pop(), _ === H)) break;
        }
      }
      popUntilNumberedHeaderPopped() {
        while (this.stackTop > -1) {
          let H = this.currentTagName,
            _ = this.treeAdapter.getNamespaceURI(this.current);
          if (
            (this.pop(),
            H === Nq.H1 || H === Nq.H2 || H === Nq.H3 || H === Nq.H4 || H === Nq.H5 || (H === Nq.H6 && _ === Mz.HTML))
          )
            break;
        }
      }
      popUntilTableCellPopped() {
        while (this.stackTop > -1) {
          let H = this.currentTagName,
            _ = this.treeAdapter.getNamespaceURI(this.current);
          if ((this.pop(), H === Nq.TD || (H === Nq.TH && _ === Mz.HTML))) break;
        }
      }
      popAllUpToHtmlElement() {
        (this.stackTop = 0), this._updateCurrentElement();
      }
      clearBackToTableContext() {
        while (
          (this.currentTagName !== Nq.TABLE &&
            this.currentTagName !== Nq.TEMPLATE &&
            this.currentTagName !== Nq.HTML) ||
          this.treeAdapter.getNamespaceURI(this.current) !== Mz.HTML
        )
          this.pop();
      }
      clearBackToTableBodyContext() {
        while (
          (this.currentTagName !== Nq.TBODY &&
            this.currentTagName !== Nq.TFOOT &&
            this.currentTagName !== Nq.THEAD &&
            this.currentTagName !== Nq.TEMPLATE &&
            this.currentTagName !== Nq.HTML) ||
          this.treeAdapter.getNamespaceURI(this.current) !== Mz.HTML
        )
          this.pop();
      }
      clearBackToTableRowContext() {
        while (
          (this.currentTagName !== Nq.TR && this.currentTagName !== Nq.TEMPLATE && this.currentTagName !== Nq.HTML) ||
          this.treeAdapter.getNamespaceURI(this.current) !== Mz.HTML
        )
          this.pop();
      }
      remove(H) {
        for (let _ = this.stackTop; _ >= 0; _--)
          if (this.items[_] === H) {
            this.items.splice(_, 1), this.stackTop--, this._updateCurrentElement();
            break;
          }
      }
      tryPeekProperlyNestedBodyElement() {
        let H = this.items[1];
        return H && this.treeAdapter.getTagName(H) === Nq.BODY ? H : null;
      }
      contains(H) {
        return this._indexOf(H) > -1;
      }
      getCommonAncestor(H) {
        let _ = this._indexOf(H);
        return --_ >= 0 ? this.items[_] : null;
      }
      isRootHtmlElementCurrent() {
        return this.stackTop === 0 && this.currentTagName === Nq.HTML;
      }
      hasInScope(H) {
        for (let _ = this.stackTop; _ >= 0; _--) {
          let q = this.treeAdapter.getTagName(this.items[_]),
            $ = this.treeAdapter.getNamespaceURI(this.items[_]);
          if (q === H && $ === Mz.HTML) return !0;
          if (EN_(q, $)) return !1;
        }
        return !0;
      }
      hasNumberedHeaderInScope() {
        for (let H = this.stackTop; H >= 0; H--) {
          let _ = this.treeAdapter.getTagName(this.items[H]),
            q = this.treeAdapter.getNamespaceURI(this.items[H]);
          if ((_ === Nq.H1 || _ === Nq.H2 || _ === Nq.H3 || _ === Nq.H4 || _ === Nq.H5 || _ === Nq.H6) && q === Mz.HTML)
            return !0;
          if (EN_(_, q)) return !1;
        }
        return !0;
      }
      hasInListItemScope(H) {
        for (let _ = this.stackTop; _ >= 0; _--) {
          let q = this.treeAdapter.getTagName(this.items[_]),
            $ = this.treeAdapter.getNamespaceURI(this.items[_]);
          if (q === H && $ === Mz.HTML) return !0;
          if (((q === Nq.UL || q === Nq.OL) && $ === Mz.HTML) || EN_(q, $)) return !1;
        }
        return !0;
      }
      hasInButtonScope(H) {
        for (let _ = this.stackTop; _ >= 0; _--) {
          let q = this.treeAdapter.getTagName(this.items[_]),
            $ = this.treeAdapter.getNamespaceURI(this.items[_]);
          if (q === H && $ === Mz.HTML) return !0;
          if ((q === Nq.BUTTON && $ === Mz.HTML) || EN_(q, $)) return !1;
        }
        return !0;
      }
      hasInTableScope(H) {
        for (let _ = this.stackTop; _ >= 0; _--) {
          let q = this.treeAdapter.getTagName(this.items[_]);
          if (this.treeAdapter.getNamespaceURI(this.items[_]) !== Mz.HTML) continue;
          if (q === H) return !0;
          if (q === Nq.TABLE || q === Nq.TEMPLATE || q === Nq.HTML) return !1;
        }
        return !0;
      }
      hasTableBodyContextInTableScope() {
        for (let H = this.stackTop; H >= 0; H--) {
          let _ = this.treeAdapter.getTagName(this.items[H]);
          if (this.treeAdapter.getNamespaceURI(this.items[H]) !== Mz.HTML) continue;
          if (_ === Nq.TBODY || _ === Nq.THEAD || _ === Nq.TFOOT) return !0;
          if (_ === Nq.TABLE || _ === Nq.HTML) return !1;
        }
        return !0;
      }
      hasInSelectScope(H) {
        for (let _ = this.stackTop; _ >= 0; _--) {
          let q = this.treeAdapter.getTagName(this.items[_]);
          if (this.treeAdapter.getNamespaceURI(this.items[_]) !== Mz.HTML) continue;
          if (q === H) return !0;
          if (q !== Nq.OPTION && q !== Nq.OPTGROUP) return !1;
        }
        return !0;
      }
      generateImpliedEndTags() {
        while (Mj7(this.currentTagName)) this.pop();
      }
      generateImpliedEndTagsThoroughly() {
        while (Sq1(this.currentTagName)) this.pop();
      }
      generateImpliedEndTagsWithExclusion(H) {
        while (Mj7(this.currentTagName) && this.currentTagName !== H) this.pop();
      }
    }
    Xj7.exports = Pj7;
  });

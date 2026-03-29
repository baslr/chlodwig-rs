  var Ij7 = d((Y7O, bj7) => {
    var hu6 = Nd(),
      Ej7 = niH(),
      Iq1 = Nu6(),
      uq1 = Sj7(),
      xq1 = w8H(),
      yu6 = xq1.TAG_NAMES;
    class Cj7 extends hu6 {
      constructor(H) {
        super(H);
        (this.parser = H),
          (this.treeAdapter = this.parser.treeAdapter),
          (this.posTracker = null),
          (this.lastStartTagToken = null),
          (this.lastFosterParentingLocation = null),
          (this.currentToken = null);
      }
      _setStartLocation(H) {
        let _ = null;
        if (this.lastStartTagToken)
          (_ = Object.assign({}, this.lastStartTagToken.location)), (_.startTag = this.lastStartTagToken.location);
        this.treeAdapter.setNodeSourceCodeLocation(H, _);
      }
      _setEndLocation(H, _) {
        let q = this.treeAdapter.getNodeSourceCodeLocation(H);
        if (q) {
          if (_.location) {
            let $ = _.location,
              K = this.treeAdapter.getTagName(H);
            if (_.type === Ej7.END_TAG_TOKEN && K === _.tagName)
              (q.endTag = Object.assign({}, $)),
                (q.endLine = $.endLine),
                (q.endCol = $.endCol),
                (q.endOffset = $.endOffset);
            else (q.endLine = $.startLine), (q.endCol = $.startCol), (q.endOffset = $.startOffset);
          }
        }
      }
      _getOverriddenMethods(H, _) {
        return {
          _bootstrap(q, $) {
            _._bootstrap.call(this, q, $),
              (H.lastStartTagToken = null),
              (H.lastFosterParentingLocation = null),
              (H.currentToken = null);
            let K = hu6.install(this.tokenizer, Iq1);
            (H.posTracker = K.posTracker),
              hu6.install(this.openElements, uq1, {
                onItemPop: function (O) {
                  H._setEndLocation(O, H.currentToken);
                },
              });
          },
          _runParsingLoop(q) {
            _._runParsingLoop.call(this, q);
            for (let $ = this.openElements.stackTop; $ >= 0; $--)
              H._setEndLocation(this.openElements.items[$], H.currentToken);
          },
          _processTokenInForeignContent(q) {
            (H.currentToken = q), _._processTokenInForeignContent.call(this, q);
          },
          _processToken(q) {
            if (
              ((H.currentToken = q),
              _._processToken.call(this, q),
              q.type === Ej7.END_TAG_TOKEN &&
                (q.tagName === yu6.HTML || (q.tagName === yu6.BODY && this.openElements.hasInScope(yu6.BODY))))
            )
              for (let K = this.openElements.stackTop; K >= 0; K--) {
                let O = this.openElements.items[K];
                if (this.treeAdapter.getTagName(O) === q.tagName) {
                  H._setEndLocation(O, q);
                  break;
                }
              }
          },
          _setDocumentType(q) {
            _._setDocumentType.call(this, q);
            let $ = this.treeAdapter.getChildNodes(this.document),
              K = $.length;
            for (let O = 0; O < K; O++) {
              let T = $[O];
              if (this.treeAdapter.isDocumentTypeNode(T)) {
                this.treeAdapter.setNodeSourceCodeLocation(T, q.location);
                break;
              }
            }
          },
          _attachElementToTree(q) {
            H._setStartLocation(q), (H.lastStartTagToken = null), _._attachElementToTree.call(this, q);
          },
          _appendElement(q, $) {
            (H.lastStartTagToken = q), _._appendElement.call(this, q, $);
          },
          _insertElement(q, $) {
            (H.lastStartTagToken = q), _._insertElement.call(this, q, $);
          },
          _insertTemplate(q) {
            (H.lastStartTagToken = q), _._insertTemplate.call(this, q);
            let $ = this.treeAdapter.getTemplateContent(this.openElements.current);
            this.treeAdapter.setNodeSourceCodeLocation($, null);
          },
          _insertFakeRootElement() {
            _._insertFakeRootElement.call(this),
              this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current, null);
          },
          _appendCommentNode(q, $) {
            _._appendCommentNode.call(this, q, $);
            let K = this.treeAdapter.getChildNodes($),
              O = K[K.length - 1];
            this.treeAdapter.setNodeSourceCodeLocation(O, q.location);
          },
          _findFosterParentingLocation() {
            return (
              (H.lastFosterParentingLocation = _._findFosterParentingLocation.call(this)), H.lastFosterParentingLocation
            );
          },
          _insertCharacters(q) {
            _._insertCharacters.call(this, q);
            let $ = this._shouldFosterParentOnInsertion(),
              K =
                ($ && H.lastFosterParentingLocation.parent) ||
                this.openElements.currentTmplContent ||
                this.openElements.current,
              O = this.treeAdapter.getChildNodes(K),
              T =
                $ && H.lastFosterParentingLocation.beforeElement
                  ? O.indexOf(H.lastFosterParentingLocation.beforeElement) - 1
                  : O.length - 1,
              z = O[T],
              A = this.treeAdapter.getNodeSourceCodeLocation(z);
            if (A)
              (A.endLine = q.location.endLine), (A.endCol = q.location.endCol), (A.endOffset = q.location.endOffset);
            else this.treeAdapter.setNodeSourceCodeLocation(z, q.location);
          },
        };
      }
    }
    bj7.exports = Cj7;
  });

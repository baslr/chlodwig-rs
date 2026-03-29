  var Nu6 = d((f7O, hj7) => {
    var vj7 = Nd(),
      vu6 = niH(),
      Cq1 = ku6();
    class Nj7 extends vj7 {
      constructor(H) {
        super(H);
        (this.tokenizer = H),
          (this.posTracker = vj7.install(H.preprocessor, Cq1)),
          (this.currentAttrLocation = null),
          (this.ctLoc = null);
      }
      _getCurrentLocation() {
        return {
          startLine: this.posTracker.line,
          startCol: this.posTracker.col,
          startOffset: this.posTracker.offset,
          endLine: -1,
          endCol: -1,
          endOffset: -1,
        };
      }
      _attachCurrentAttrLocationInfo() {
        (this.currentAttrLocation.endLine = this.posTracker.line),
          (this.currentAttrLocation.endCol = this.posTracker.col),
          (this.currentAttrLocation.endOffset = this.posTracker.offset);
        let H = this.tokenizer.currentToken,
          _ = this.tokenizer.currentAttr;
        if (!H.location.attrs) H.location.attrs = Object.create(null);
        H.location.attrs[_.name] = this.currentAttrLocation;
      }
      _getOverriddenMethods(H, _) {
        let q = {
          _createStartTagToken() {
            _._createStartTagToken.call(this), (this.currentToken.location = H.ctLoc);
          },
          _createEndTagToken() {
            _._createEndTagToken.call(this), (this.currentToken.location = H.ctLoc);
          },
          _createCommentToken() {
            _._createCommentToken.call(this), (this.currentToken.location = H.ctLoc);
          },
          _createDoctypeToken($) {
            _._createDoctypeToken.call(this, $), (this.currentToken.location = H.ctLoc);
          },
          _createCharacterToken($, K) {
            _._createCharacterToken.call(this, $, K), (this.currentCharacterToken.location = H.ctLoc);
          },
          _createEOFToken() {
            _._createEOFToken.call(this), (this.currentToken.location = H._getCurrentLocation());
          },
          _createAttr($) {
            _._createAttr.call(this, $), (H.currentAttrLocation = H._getCurrentLocation());
          },
          _leaveAttrName($) {
            _._leaveAttrName.call(this, $), H._attachCurrentAttrLocationInfo();
          },
          _leaveAttrValue($) {
            _._leaveAttrValue.call(this, $), H._attachCurrentAttrLocationInfo();
          },
          _emitCurrentToken() {
            let $ = this.currentToken.location;
            if (this.currentCharacterToken)
              (this.currentCharacterToken.location.endLine = $.startLine),
                (this.currentCharacterToken.location.endCol = $.startCol),
                (this.currentCharacterToken.location.endOffset = $.startOffset);
            if (this.currentToken.type === vu6.EOF_TOKEN)
              ($.endLine = $.startLine), ($.endCol = $.startCol), ($.endOffset = $.startOffset);
            else
              ($.endLine = H.posTracker.line),
                ($.endCol = H.posTracker.col + 1),
                ($.endOffset = H.posTracker.offset + 1);
            _._emitCurrentToken.call(this);
          },
          _emitCurrentCharacterToken() {
            let $ = this.currentCharacterToken && this.currentCharacterToken.location;
            if ($ && $.endOffset === -1)
              ($.endLine = H.posTracker.line), ($.endCol = H.posTracker.col), ($.endOffset = H.posTracker.offset);
            _._emitCurrentCharacterToken.call(this);
          },
        };
        return (
          Object.keys(vu6.MODE).forEach(($) => {
            let K = vu6.MODE[$];
            q[K] = function (O) {
              (H.ctLoc = H._getCurrentLocation()), _[K].call(this, O);
            };
          }),
          q
        );
      }
    }
    hj7.exports = Nj7;
  });

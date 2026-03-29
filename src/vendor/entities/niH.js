  var niH = d(($7O, jj7) => {
    var hq1 = zj7(),
      jz = yN_(),
      uTH = fj7(),
      G8 = VN_(),
      S_ = jz.CODE_POINTS,
      bTH = jz.CODE_POINT_SEQUENCES,
      yq1 = {
        128: 8364,
        130: 8218,
        131: 402,
        132: 8222,
        133: 8230,
        134: 8224,
        135: 8225,
        136: 710,
        137: 8240,
        138: 352,
        139: 8249,
        140: 338,
        142: 381,
        145: 8216,
        146: 8217,
        147: 8220,
        148: 8221,
        149: 8226,
        150: 8211,
        151: 8212,
        152: 732,
        153: 8482,
        154: 353,
        155: 8250,
        156: 339,
        158: 382,
        159: 376,
      };
    function Bf(H) {
      return H === S_.SPACE || H === S_.LINE_FEED || H === S_.TABULATION || H === S_.FORM_FEED;
    }
    function iiH(H) {
      return H >= S_.DIGIT_0 && H <= S_.DIGIT_9;
    }
    function Px(H) {
      return H >= S_.LATIN_CAPITAL_A && H <= S_.LATIN_CAPITAL_Z;
    }
    function ITH(H) {
      return H >= S_.LATIN_SMALL_A && H <= S_.LATIN_SMALL_Z;
    }
    function f8H(H) {
      return ITH(H) || Px(H);
    }
    function Ru6(H) {
      return f8H(H) || iiH(H);
    }
    function Yj7(H) {
      return H >= S_.LATIN_CAPITAL_A && H <= S_.LATIN_CAPITAL_F;
    }
    function Dj7(H) {
      return H >= S_.LATIN_SMALL_A && H <= S_.LATIN_SMALL_F;
    }
    function Vq1(H) {
      return iiH(H) || Yj7(H) || Dj7(H);
    }
    function SN_(H) {
      return H + 32;
    }
    function uD(H) {
      if (H <= 65535) return String.fromCharCode(H);
      return (H -= 65536), String.fromCharCode(((H >>> 10) & 1023) | 55296) + String.fromCharCode(56320 | (H & 1023));
    }
    function A8H(H) {
      return String.fromCharCode(SN_(H));
    }
    function wj7(H, _) {
      let q = uTH[++H],
        $ = ++H,
        K = $ + q - 1;
      while ($ <= K) {
        let O = ($ + K) >>> 1,
          T = uTH[O];
        if (T < _) $ = O + 1;
        else if (T > _) K = O - 1;
        else return uTH[O + q];
      }
      return -1;
    }
    class nA {
      constructor() {
        (this.preprocessor = new hq1()),
          (this.tokenQueue = []),
          (this.allowCDATA = !1),
          (this.state = "DATA_STATE"),
          (this.returnState = ""),
          (this.charRefCode = -1),
          (this.tempBuff = []),
          (this.lastStartTagName = ""),
          (this.consumedAfterSnapshot = -1),
          (this.active = !1),
          (this.currentCharacterToken = null),
          (this.currentToken = null),
          (this.currentAttr = null);
      }
      _err() {}
      _errOnNextCodePoint(H) {
        this._consume(), this._err(H), this._unconsume();
      }
      getNextToken() {
        while (!this.tokenQueue.length && this.active) {
          this.consumedAfterSnapshot = 0;
          let H = this._consume();
          if (!this._ensureHibernation()) this[this.state](H);
        }
        return this.tokenQueue.shift();
      }
      write(H, _) {
        (this.active = !0), this.preprocessor.write(H, _);
      }
      insertHtmlAtCurrentPos(H) {
        (this.active = !0), this.preprocessor.insertHtmlAtCurrentPos(H);
      }
      _ensureHibernation() {
        if (this.preprocessor.endOfChunkHit) {
          for (; this.consumedAfterSnapshot > 0; this.consumedAfterSnapshot--) this.preprocessor.retreat();
          return (this.active = !1), this.tokenQueue.push({ type: nA.HIBERNATION_TOKEN }), !0;
        }
        return !1;
      }
      _consume() {
        return this.consumedAfterSnapshot++, this.preprocessor.advance();
      }
      _unconsume() {
        this.consumedAfterSnapshot--, this.preprocessor.retreat();
      }
      _reconsumeInState(H) {
        (this.state = H), this._unconsume();
      }
      _consumeSequenceIfMatch(H, _, q) {
        let $ = 0,
          K = !0,
          O = H.length,
          T = 0,
          z = _,
          A = void 0;
        for (; T < O; T++) {
          if (T > 0) (z = this._consume()), $++;
          if (z === S_.EOF) {
            K = !1;
            break;
          }
          if (((A = H[T]), z !== A && (q || z !== SN_(A)))) {
            K = !1;
            break;
          }
        }
        if (!K) while ($--) this._unconsume();
        return K;
      }
      _isTempBufferEqualToScriptString() {
        if (this.tempBuff.length !== bTH.SCRIPT_STRING.length) return !1;
        for (let H = 0; H < this.tempBuff.length; H++) if (this.tempBuff[H] !== bTH.SCRIPT_STRING[H]) return !1;
        return !0;
      }
      _createStartTagToken() {
        this.currentToken = { type: nA.START_TAG_TOKEN, tagName: "", selfClosing: !1, ackSelfClosing: !1, attrs: [] };
      }
      _createEndTagToken() {
        this.currentToken = { type: nA.END_TAG_TOKEN, tagName: "", selfClosing: !1, attrs: [] };
      }
      _createCommentToken() {
        this.currentToken = { type: nA.COMMENT_TOKEN, data: "" };
      }
      _createDoctypeToken(H) {
        this.currentToken = { type: nA.DOCTYPE_TOKEN, name: H, forceQuirks: !1, publicId: null, systemId: null };
      }
      _createCharacterToken(H, _) {
        this.currentCharacterToken = { type: H, chars: _ };
      }
      _createEOFToken() {
        this.currentToken = { type: nA.EOF_TOKEN };
      }
      _createAttr(H) {
        this.currentAttr = { name: H, value: "" };
      }
      _leaveAttrName(H) {
        if (nA.getTokenAttr(this.currentToken, this.currentAttr.name) === null)
          this.currentToken.attrs.push(this.currentAttr);
        else this._err(G8.duplicateAttribute);
        this.state = H;
      }
      _leaveAttrValue(H) {
        this.state = H;
      }
      _emitCurrentToken() {
        this._emitCurrentCharacterToken();
        let H = this.currentToken;
        if (((this.currentToken = null), H.type === nA.START_TAG_TOKEN)) this.lastStartTagName = H.tagName;
        else if (H.type === nA.END_TAG_TOKEN) {
          if (H.attrs.length > 0) this._err(G8.endTagWithAttributes);
          if (H.selfClosing) this._err(G8.endTagWithTrailingSolidus);
        }
        this.tokenQueue.push(H);
      }
      _emitCurrentCharacterToken() {
        if (this.currentCharacterToken)
          this.tokenQueue.push(this.currentCharacterToken), (this.currentCharacterToken = null);
      }
      _emitEOFToken() {
        this._createEOFToken(), this._emitCurrentToken();
      }
      _appendCharToCurrentCharacterToken(H, _) {
        if (this.currentCharacterToken && this.currentCharacterToken.type !== H) this._emitCurrentCharacterToken();
        if (this.currentCharacterToken) this.currentCharacterToken.chars += _;
        else this._createCharacterToken(H, _);
      }
      _emitCodePoint(H) {
        let _ = nA.CHARACTER_TOKEN;
        if (Bf(H)) _ = nA.WHITESPACE_CHARACTER_TOKEN;
        else if (H === S_.NULL) _ = nA.NULL_CHARACTER_TOKEN;
        this._appendCharToCurrentCharacterToken(_, uD(H));
      }
      _emitSeveralCodePoints(H) {
        for (let _ = 0; _ < H.length; _++) this._emitCodePoint(H[_]);
      }
      _emitChars(H) {
        this._appendCharToCurrentCharacterToken(nA.CHARACTER_TOKEN, H);
      }
      _matchNamedCharacterReference(H) {
        let _ = null,
          q = 1,
          $ = wj7(0, H);
        this.tempBuff.push(H);
        while ($ > -1) {
          let K = uTH[$],
            O = K < 7;
          if (O && K & 1) (_ = K & 2 ? [uTH[++$], uTH[++$]] : [uTH[++$]]), (q = 0);
          let z = this._consume();
          if ((this.tempBuff.push(z), q++, z === S_.EOF)) break;
          if (O) $ = K & 4 ? wj7($, z) : -1;
          else $ = z === K ? ++$ : -1;
        }
        while (q--) this.tempBuff.pop(), this._unconsume();
        return _;
      }
      _isCharacterReferenceInAttribute() {
        return (
          this.returnState === "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE" ||
          this.returnState === "ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE" ||
          this.returnState === "ATTRIBUTE_VALUE_UNQUOTED_STATE"
        );
      }
      _isCharacterReferenceAttributeQuirk(H) {
        if (!H && this._isCharacterReferenceInAttribute()) {
          let _ = this._consume();
          return this._unconsume(), _ === S_.EQUALS_SIGN || Ru6(_);
        }
        return !1;
      }
      _flushCodePointsConsumedAsCharacterReference() {
        if (this._isCharacterReferenceInAttribute())
          for (let H = 0; H < this.tempBuff.length; H++) this.currentAttr.value += uD(this.tempBuff[H]);
        else this._emitSeveralCodePoints(this.tempBuff);
        this.tempBuff = [];
      }
      ["DATA_STATE"](H) {
        if ((this.preprocessor.dropParsedChunk(), H === S_.LESS_THAN_SIGN)) this.state = "TAG_OPEN_STATE";
        else if (H === S_.AMPERSAND) (this.returnState = "DATA_STATE"), (this.state = "CHARACTER_REFERENCE_STATE");
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitCodePoint(H);
        else if (H === S_.EOF) this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["RCDATA_STATE"](H) {
        if ((this.preprocessor.dropParsedChunk(), H === S_.AMPERSAND))
          (this.returnState = "RCDATA_STATE"), (this.state = "CHARACTER_REFERENCE_STATE");
        else if (H === S_.LESS_THAN_SIGN) this.state = "RCDATA_LESS_THAN_SIGN_STATE";
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["RAWTEXT_STATE"](H) {
        if ((this.preprocessor.dropParsedChunk(), H === S_.LESS_THAN_SIGN)) this.state = "RAWTEXT_LESS_THAN_SIGN_STATE";
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_STATE"](H) {
        if ((this.preprocessor.dropParsedChunk(), H === S_.LESS_THAN_SIGN))
          this.state = "SCRIPT_DATA_LESS_THAN_SIGN_STATE";
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["PLAINTEXT_STATE"](H) {
        if ((this.preprocessor.dropParsedChunk(), H === S_.NULL))
          this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["TAG_OPEN_STATE"](H) {
        if (H === S_.EXCLAMATION_MARK) this.state = "MARKUP_DECLARATION_OPEN_STATE";
        else if (H === S_.SOLIDUS) this.state = "END_TAG_OPEN_STATE";
        else if (f8H(H)) this._createStartTagToken(), this._reconsumeInState("TAG_NAME_STATE");
        else if (H === S_.QUESTION_MARK)
          this._err(G8.unexpectedQuestionMarkInsteadOfTagName),
            this._createCommentToken(),
            this._reconsumeInState("BOGUS_COMMENT_STATE");
        else if (H === S_.EOF) this._err(G8.eofBeforeTagName), this._emitChars("<"), this._emitEOFToken();
        else this._err(G8.invalidFirstCharacterOfTagName), this._emitChars("<"), this._reconsumeInState("DATA_STATE");
      }
      ["END_TAG_OPEN_STATE"](H) {
        if (f8H(H)) this._createEndTagToken(), this._reconsumeInState("TAG_NAME_STATE");
        else if (H === S_.GREATER_THAN_SIGN) this._err(G8.missingEndTagName), (this.state = "DATA_STATE");
        else if (H === S_.EOF) this._err(G8.eofBeforeTagName), this._emitChars("</"), this._emitEOFToken();
        else
          this._err(G8.invalidFirstCharacterOfTagName),
            this._createCommentToken(),
            this._reconsumeInState("BOGUS_COMMENT_STATE");
      }
      ["TAG_NAME_STATE"](H) {
        if (Bf(H)) this.state = "BEFORE_ATTRIBUTE_NAME_STATE";
        else if (H === S_.SOLIDUS) this.state = "SELF_CLOSING_START_TAG_STATE";
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (Px(H)) this.currentToken.tagName += A8H(H);
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.tagName += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this.currentToken.tagName += uD(H);
      }
      ["RCDATA_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.SOLIDUS) (this.tempBuff = []), (this.state = "RCDATA_END_TAG_OPEN_STATE");
        else this._emitChars("<"), this._reconsumeInState("RCDATA_STATE");
      }
      ["RCDATA_END_TAG_OPEN_STATE"](H) {
        if (f8H(H)) this._createEndTagToken(), this._reconsumeInState("RCDATA_END_TAG_NAME_STATE");
        else this._emitChars("</"), this._reconsumeInState("RCDATA_STATE");
      }
      ["RCDATA_END_TAG_NAME_STATE"](H) {
        if (Px(H)) (this.currentToken.tagName += A8H(H)), this.tempBuff.push(H);
        else if (ITH(H)) (this.currentToken.tagName += uD(H)), this.tempBuff.push(H);
        else {
          if (this.lastStartTagName === this.currentToken.tagName) {
            if (Bf(H)) {
              this.state = "BEFORE_ATTRIBUTE_NAME_STATE";
              return;
            }
            if (H === S_.SOLIDUS) {
              this.state = "SELF_CLOSING_START_TAG_STATE";
              return;
            }
            if (H === S_.GREATER_THAN_SIGN) {
              (this.state = "DATA_STATE"), this._emitCurrentToken();
              return;
            }
          }
          this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState("RCDATA_STATE");
        }
      }
      ["RAWTEXT_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.SOLIDUS) (this.tempBuff = []), (this.state = "RAWTEXT_END_TAG_OPEN_STATE");
        else this._emitChars("<"), this._reconsumeInState("RAWTEXT_STATE");
      }
      ["RAWTEXT_END_TAG_OPEN_STATE"](H) {
        if (f8H(H)) this._createEndTagToken(), this._reconsumeInState("RAWTEXT_END_TAG_NAME_STATE");
        else this._emitChars("</"), this._reconsumeInState("RAWTEXT_STATE");
      }
      ["RAWTEXT_END_TAG_NAME_STATE"](H) {
        if (Px(H)) (this.currentToken.tagName += A8H(H)), this.tempBuff.push(H);
        else if (ITH(H)) (this.currentToken.tagName += uD(H)), this.tempBuff.push(H);
        else {
          if (this.lastStartTagName === this.currentToken.tagName) {
            if (Bf(H)) {
              this.state = "BEFORE_ATTRIBUTE_NAME_STATE";
              return;
            }
            if (H === S_.SOLIDUS) {
              this.state = "SELF_CLOSING_START_TAG_STATE";
              return;
            }
            if (H === S_.GREATER_THAN_SIGN) {
              this._emitCurrentToken(), (this.state = "DATA_STATE");
              return;
            }
          }
          this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState("RAWTEXT_STATE");
        }
      }
      ["SCRIPT_DATA_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.SOLIDUS) (this.tempBuff = []), (this.state = "SCRIPT_DATA_END_TAG_OPEN_STATE");
        else if (H === S_.EXCLAMATION_MARK) (this.state = "SCRIPT_DATA_ESCAPE_START_STATE"), this._emitChars("<!");
        else this._emitChars("<"), this._reconsumeInState("SCRIPT_DATA_STATE");
      }
      ["SCRIPT_DATA_END_TAG_OPEN_STATE"](H) {
        if (f8H(H)) this._createEndTagToken(), this._reconsumeInState("SCRIPT_DATA_END_TAG_NAME_STATE");
        else this._emitChars("</"), this._reconsumeInState("SCRIPT_DATA_STATE");
      }
      ["SCRIPT_DATA_END_TAG_NAME_STATE"](H) {
        if (Px(H)) (this.currentToken.tagName += A8H(H)), this.tempBuff.push(H);
        else if (ITH(H)) (this.currentToken.tagName += uD(H)), this.tempBuff.push(H);
        else {
          if (this.lastStartTagName === this.currentToken.tagName) {
            if (Bf(H)) {
              this.state = "BEFORE_ATTRIBUTE_NAME_STATE";
              return;
            } else if (H === S_.SOLIDUS) {
              this.state = "SELF_CLOSING_START_TAG_STATE";
              return;
            } else if (H === S_.GREATER_THAN_SIGN) {
              this._emitCurrentToken(), (this.state = "DATA_STATE");
              return;
            }
          }
          this._emitChars("</"),
            this._emitSeveralCodePoints(this.tempBuff),
            this._reconsumeInState("SCRIPT_DATA_STATE");
        }
      }
      ["SCRIPT_DATA_ESCAPE_START_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_ESCAPE_START_DASH_STATE"), this._emitChars("-");
        else this._reconsumeInState("SCRIPT_DATA_STATE");
      }
      ["SCRIPT_DATA_ESCAPE_START_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_ESCAPED_DASH_DASH_STATE"), this._emitChars("-");
        else this._reconsumeInState("SCRIPT_DATA_STATE");
      }
      ["SCRIPT_DATA_ESCAPED_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_ESCAPED_DASH_STATE"), this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN) this.state = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE";
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_ESCAPED_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_ESCAPED_DASH_DASH_STATE"), this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN) this.state = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE";
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter),
            (this.state = "SCRIPT_DATA_ESCAPED_STATE"),
            this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else (this.state = "SCRIPT_DATA_ESCAPED_STATE"), this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_ESCAPED_DASH_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN) this.state = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE";
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "SCRIPT_DATA_STATE"), this._emitChars(">");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter),
            (this.state = "SCRIPT_DATA_ESCAPED_STATE"),
            this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else (this.state = "SCRIPT_DATA_ESCAPED_STATE"), this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.SOLIDUS) (this.tempBuff = []), (this.state = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE");
        else if (f8H(H))
          (this.tempBuff = []), this._emitChars("<"), this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE");
        else this._emitChars("<"), this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");
      }
      ["SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE"](H) {
        if (f8H(H)) this._createEndTagToken(), this._reconsumeInState("SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE");
        else this._emitChars("</"), this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");
      }
      ["SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE"](H) {
        if (Px(H)) (this.currentToken.tagName += A8H(H)), this.tempBuff.push(H);
        else if (ITH(H)) (this.currentToken.tagName += uD(H)), this.tempBuff.push(H);
        else {
          if (this.lastStartTagName === this.currentToken.tagName) {
            if (Bf(H)) {
              this.state = "BEFORE_ATTRIBUTE_NAME_STATE";
              return;
            }
            if (H === S_.SOLIDUS) {
              this.state = "SELF_CLOSING_START_TAG_STATE";
              return;
            }
            if (H === S_.GREATER_THAN_SIGN) {
              this._emitCurrentToken(), (this.state = "DATA_STATE");
              return;
            }
          }
          this._emitChars("</"),
            this._emitSeveralCodePoints(this.tempBuff),
            this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");
        }
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE"](H) {
        if (Bf(H) || H === S_.SOLIDUS || H === S_.GREATER_THAN_SIGN)
          (this.state = this._isTempBufferEqualToScriptString()
            ? "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"
            : "SCRIPT_DATA_ESCAPED_STATE"),
            this._emitCodePoint(H);
        else if (Px(H)) this.tempBuff.push(SN_(H)), this._emitCodePoint(H);
        else if (ITH(H)) this.tempBuff.push(H), this._emitCodePoint(H);
        else this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPED_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE"), this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN)
          (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE"), this._emitChars("<");
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter), this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE"), this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN)
          (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE"), this._emitChars("<");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter),
            (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"),
            this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"), this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this._emitChars("-");
        else if (H === S_.LESS_THAN_SIGN)
          (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE"), this._emitChars("<");
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "SCRIPT_DATA_STATE"), this._emitChars(">");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter),
            (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"),
            this._emitChars(jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
        else (this.state = "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"), this._emitCodePoint(H);
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.SOLIDUS)
          (this.tempBuff = []), (this.state = "SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE"), this._emitChars("/");
        else this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");
      }
      ["SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE"](H) {
        if (Bf(H) || H === S_.SOLIDUS || H === S_.GREATER_THAN_SIGN)
          (this.state = this._isTempBufferEqualToScriptString()
            ? "SCRIPT_DATA_ESCAPED_STATE"
            : "SCRIPT_DATA_DOUBLE_ESCAPED_STATE"),
            this._emitCodePoint(H);
        else if (Px(H)) this.tempBuff.push(SN_(H)), this._emitCodePoint(H);
        else if (ITH(H)) this.tempBuff.push(H), this._emitCodePoint(H);
        else this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");
      }
      ["BEFORE_ATTRIBUTE_NAME_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.SOLIDUS || H === S_.GREATER_THAN_SIGN || H === S_.EOF)
          this._reconsumeInState("AFTER_ATTRIBUTE_NAME_STATE");
        else if (H === S_.EQUALS_SIGN)
          this._err(G8.unexpectedEqualsSignBeforeAttributeName),
            this._createAttr("="),
            (this.state = "ATTRIBUTE_NAME_STATE");
        else this._createAttr(""), this._reconsumeInState("ATTRIBUTE_NAME_STATE");
      }
      ["ATTRIBUTE_NAME_STATE"](H) {
        if (Bf(H) || H === S_.SOLIDUS || H === S_.GREATER_THAN_SIGN || H === S_.EOF)
          this._leaveAttrName("AFTER_ATTRIBUTE_NAME_STATE"), this._unconsume();
        else if (H === S_.EQUALS_SIGN) this._leaveAttrName("BEFORE_ATTRIBUTE_VALUE_STATE");
        else if (Px(H)) this.currentAttr.name += A8H(H);
        else if (H === S_.QUOTATION_MARK || H === S_.APOSTROPHE || H === S_.LESS_THAN_SIGN)
          this._err(G8.unexpectedCharacterInAttributeName), (this.currentAttr.name += uD(H));
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentAttr.name += jz.REPLACEMENT_CHARACTER);
        else this.currentAttr.name += uD(H);
      }
      ["AFTER_ATTRIBUTE_NAME_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.SOLIDUS) this.state = "SELF_CLOSING_START_TAG_STATE";
        else if (H === S_.EQUALS_SIGN) this.state = "BEFORE_ATTRIBUTE_VALUE_STATE";
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this._createAttr(""), this._reconsumeInState("ATTRIBUTE_NAME_STATE");
      }
      ["BEFORE_ATTRIBUTE_VALUE_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.QUOTATION_MARK) this.state = "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE";
        else if (H === S_.APOSTROPHE) this.state = "ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE";
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingAttributeValue), (this.state = "DATA_STATE"), this._emitCurrentToken();
        else this._reconsumeInState("ATTRIBUTE_VALUE_UNQUOTED_STATE");
      }
      ["ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE"](H) {
        if (H === S_.QUOTATION_MARK) this.state = "AFTER_ATTRIBUTE_VALUE_QUOTED_STATE";
        else if (H === S_.AMPERSAND)
          (this.returnState = "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE"), (this.state = "CHARACTER_REFERENCE_STATE");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentAttr.value += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this.currentAttr.value += uD(H);
      }
      ["ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE"](H) {
        if (H === S_.APOSTROPHE) this.state = "AFTER_ATTRIBUTE_VALUE_QUOTED_STATE";
        else if (H === S_.AMPERSAND)
          (this.returnState = "ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE"), (this.state = "CHARACTER_REFERENCE_STATE");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentAttr.value += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this.currentAttr.value += uD(H);
      }
      ["ATTRIBUTE_VALUE_UNQUOTED_STATE"](H) {
        if (Bf(H)) this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE");
        else if (H === S_.AMPERSAND)
          (this.returnState = "ATTRIBUTE_VALUE_UNQUOTED_STATE"), (this.state = "CHARACTER_REFERENCE_STATE");
        else if (H === S_.GREATER_THAN_SIGN) this._leaveAttrValue("DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentAttr.value += jz.REPLACEMENT_CHARACTER);
        else if (
          H === S_.QUOTATION_MARK ||
          H === S_.APOSTROPHE ||
          H === S_.LESS_THAN_SIGN ||
          H === S_.EQUALS_SIGN ||
          H === S_.GRAVE_ACCENT
        )
          this._err(G8.unexpectedCharacterInUnquotedAttributeValue), (this.currentAttr.value += uD(H));
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this.currentAttr.value += uD(H);
      }
      ["AFTER_ATTRIBUTE_VALUE_QUOTED_STATE"](H) {
        if (Bf(H)) this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE");
        else if (H === S_.SOLIDUS) this._leaveAttrValue("SELF_CLOSING_START_TAG_STATE");
        else if (H === S_.GREATER_THAN_SIGN) this._leaveAttrValue("DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this._err(G8.missingWhitespaceBetweenAttributes), this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE");
      }
      ["SELF_CLOSING_START_TAG_STATE"](H) {
        if (H === S_.GREATER_THAN_SIGN)
          (this.currentToken.selfClosing = !0), (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._err(G8.eofInTag), this._emitEOFToken();
        else this._err(G8.unexpectedSolidusInTag), this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE");
      }
      ["BOGUS_COMMENT_STATE"](H) {
        if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._emitCurrentToken(), this._emitEOFToken();
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.data += jz.REPLACEMENT_CHARACTER);
        else this.currentToken.data += uD(H);
      }
      ["MARKUP_DECLARATION_OPEN_STATE"](H) {
        if (this._consumeSequenceIfMatch(bTH.DASH_DASH_STRING, H, !0))
          this._createCommentToken(), (this.state = "COMMENT_START_STATE");
        else if (this._consumeSequenceIfMatch(bTH.DOCTYPE_STRING, H, !1)) this.state = "DOCTYPE_STATE";
        else if (this._consumeSequenceIfMatch(bTH.CDATA_START_STRING, H, !0))
          if (this.allowCDATA) this.state = "CDATA_SECTION_STATE";
          else
            this._err(G8.cdataInHtmlContent),
              this._createCommentToken(),
              (this.currentToken.data = "[CDATA["),
              (this.state = "BOGUS_COMMENT_STATE");
        else if (!this._ensureHibernation())
          this._err(G8.incorrectlyOpenedComment),
            this._createCommentToken(),
            this._reconsumeInState("BOGUS_COMMENT_STATE");
      }
      ["COMMENT_START_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_START_DASH_STATE";
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptClosingOfEmptyComment), (this.state = "DATA_STATE"), this._emitCurrentToken();
        else this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_START_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_END_STATE";
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptClosingOfEmptyComment), (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._err(G8.eofInComment), this._emitCurrentToken(), this._emitEOFToken();
        else (this.currentToken.data += "-"), this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_END_DASH_STATE";
        else if (H === S_.LESS_THAN_SIGN)
          (this.currentToken.data += "<"), (this.state = "COMMENT_LESS_THAN_SIGN_STATE");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.data += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF) this._err(G8.eofInComment), this._emitCurrentToken(), this._emitEOFToken();
        else this.currentToken.data += uD(H);
      }
      ["COMMENT_LESS_THAN_SIGN_STATE"](H) {
        if (H === S_.EXCLAMATION_MARK)
          (this.currentToken.data += "!"), (this.state = "COMMENT_LESS_THAN_SIGN_BANG_STATE");
        else if (H === S_.LESS_THAN_SIGN) this.currentToken.data += "!";
        else this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_LESS_THAN_SIGN_BANG_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE";
        else this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE";
        else this._reconsumeInState("COMMENT_END_DASH_STATE");
      }
      ["COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE"](H) {
        if (H !== S_.GREATER_THAN_SIGN && H !== S_.EOF) this._err(G8.nestedComment);
        this._reconsumeInState("COMMENT_END_STATE");
      }
      ["COMMENT_END_DASH_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) this.state = "COMMENT_END_STATE";
        else if (H === S_.EOF) this._err(G8.eofInComment), this._emitCurrentToken(), this._emitEOFToken();
        else (this.currentToken.data += "-"), this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_END_STATE"](H) {
        if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EXCLAMATION_MARK) this.state = "COMMENT_END_BANG_STATE";
        else if (H === S_.HYPHEN_MINUS) this.currentToken.data += "-";
        else if (H === S_.EOF) this._err(G8.eofInComment), this._emitCurrentToken(), this._emitEOFToken();
        else (this.currentToken.data += "--"), this._reconsumeInState("COMMENT_STATE");
      }
      ["COMMENT_END_BANG_STATE"](H) {
        if (H === S_.HYPHEN_MINUS) (this.currentToken.data += "--!"), (this.state = "COMMENT_END_DASH_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.incorrectlyClosedComment), (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF) this._err(G8.eofInComment), this._emitCurrentToken(), this._emitEOFToken();
        else (this.currentToken.data += "--!"), this._reconsumeInState("COMMENT_STATE");
      }
      ["DOCTYPE_STATE"](H) {
        if (Bf(H)) this.state = "BEFORE_DOCTYPE_NAME_STATE";
        else if (H === S_.GREATER_THAN_SIGN) this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            this._createDoctypeToken(null),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this._err(G8.missingWhitespaceBeforeDoctypeName), this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE");
      }
      ["BEFORE_DOCTYPE_NAME_STATE"](H) {
        if (Bf(H)) return;
        if (Px(H)) this._createDoctypeToken(A8H(H)), (this.state = "DOCTYPE_NAME_STATE");
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter),
            this._createDoctypeToken(jz.REPLACEMENT_CHARACTER),
            (this.state = "DOCTYPE_NAME_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingDoctypeName),
            this._createDoctypeToken(null),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            this._createDoctypeToken(null),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this._createDoctypeToken(uD(H)), (this.state = "DOCTYPE_NAME_STATE");
      }
      ["DOCTYPE_NAME_STATE"](H) {
        if (Bf(H)) this.state = "AFTER_DOCTYPE_NAME_STATE";
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (Px(H)) this.currentToken.name += A8H(H);
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.name += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this.currentToken.name += uD(H);
      }
      ["AFTER_DOCTYPE_NAME_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else if (this._consumeSequenceIfMatch(bTH.PUBLIC_STRING, H, !1))
          this.state = "AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE";
        else if (this._consumeSequenceIfMatch(bTH.SYSTEM_STRING, H, !1))
          this.state = "AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE";
        else if (!this._ensureHibernation())
          this._err(G8.invalidCharacterSequenceAfterDoctypeName),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE"](H) {
        if (Bf(H)) this.state = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE";
        else if (H === S_.QUOTATION_MARK)
          this._err(G8.missingWhitespaceAfterDoctypePublicKeyword),
            (this.currentToken.publicId = ""),
            (this.state = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          this._err(G8.missingWhitespaceAfterDoctypePublicKeyword),
            (this.currentToken.publicId = ""),
            (this.state = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            (this.state = "DATA_STATE"),
            this._emitCurrentToken();
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.QUOTATION_MARK)
          (this.currentToken.publicId = ""), (this.state = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          (this.currentToken.publicId = ""), (this.state = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            (this.state = "DATA_STATE"),
            this._emitCurrentToken();
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE"](H) {
        if (H === S_.QUOTATION_MARK) this.state = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE";
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.publicId += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this.currentToken.publicId += uD(H);
      }
      ["DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE"](H) {
        if (H === S_.APOSTROPHE) this.state = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE";
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.publicId += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptDoctypePublicIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this.currentToken.publicId += uD(H);
      }
      ["AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE"](H) {
        if (Bf(H)) this.state = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE";
        else if (H === S_.GREATER_THAN_SIGN) (this.state = "DATA_STATE"), this._emitCurrentToken();
        else if (H === S_.QUOTATION_MARK)
          this._err(G8.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers),
            (this.currentToken.systemId = ""),
            (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          this._err(G8.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers),
            (this.currentToken.systemId = ""),
            (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.GREATER_THAN_SIGN) this._emitCurrentToken(), (this.state = "DATA_STATE");
        else if (H === S_.QUOTATION_MARK)
          (this.currentToken.systemId = ""), (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          (this.currentToken.systemId = ""), (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE"](H) {
        if (Bf(H)) this.state = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE";
        else if (H === S_.QUOTATION_MARK)
          this._err(G8.missingWhitespaceAfterDoctypeSystemKeyword),
            (this.currentToken.systemId = ""),
            (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          this._err(G8.missingWhitespaceAfterDoctypeSystemKeyword),
            (this.currentToken.systemId = ""),
            (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            (this.state = "DATA_STATE"),
            this._emitCurrentToken();
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.QUOTATION_MARK)
          (this.currentToken.systemId = ""), (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE");
        else if (H === S_.APOSTROPHE)
          (this.currentToken.systemId = ""), (this.state = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE");
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.missingDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            (this.state = "DATA_STATE"),
            this._emitCurrentToken();
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.missingQuoteBeforeDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"](H) {
        if (H === S_.QUOTATION_MARK) this.state = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE";
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.systemId += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this.currentToken.systemId += uD(H);
      }
      ["DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"](H) {
        if (H === S_.APOSTROPHE) this.state = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE";
        else if (H === S_.NULL)
          this._err(G8.unexpectedNullCharacter), (this.currentToken.systemId += jz.REPLACEMENT_CHARACTER);
        else if (H === S_.GREATER_THAN_SIGN)
          this._err(G8.abruptDoctypeSystemIdentifier),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else this.currentToken.systemId += uD(H);
      }
      ["AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE"](H) {
        if (Bf(H)) return;
        if (H === S_.GREATER_THAN_SIGN) this._emitCurrentToken(), (this.state = "DATA_STATE");
        else if (H === S_.EOF)
          this._err(G8.eofInDoctype),
            (this.currentToken.forceQuirks = !0),
            this._emitCurrentToken(),
            this._emitEOFToken();
        else
          this._err(G8.unexpectedCharacterAfterDoctypeSystemIdentifier), this._reconsumeInState("BOGUS_DOCTYPE_STATE");
      }
      ["BOGUS_DOCTYPE_STATE"](H) {
        if (H === S_.GREATER_THAN_SIGN) this._emitCurrentToken(), (this.state = "DATA_STATE");
        else if (H === S_.NULL) this._err(G8.unexpectedNullCharacter);
        else if (H === S_.EOF) this._emitCurrentToken(), this._emitEOFToken();
      }
      ["CDATA_SECTION_STATE"](H) {
        if (H === S_.RIGHT_SQUARE_BRACKET) this.state = "CDATA_SECTION_BRACKET_STATE";
        else if (H === S_.EOF) this._err(G8.eofInCdata), this._emitEOFToken();
        else this._emitCodePoint(H);
      }
      ["CDATA_SECTION_BRACKET_STATE"](H) {
        if (H === S_.RIGHT_SQUARE_BRACKET) this.state = "CDATA_SECTION_END_STATE";
        else this._emitChars("]"), this._reconsumeInState("CDATA_SECTION_STATE");
      }
      ["CDATA_SECTION_END_STATE"](H) {
        if (H === S_.GREATER_THAN_SIGN) this.state = "DATA_STATE";
        else if (H === S_.RIGHT_SQUARE_BRACKET) this._emitChars("]");
        else this._emitChars("]]"), this._reconsumeInState("CDATA_SECTION_STATE");
      }
      ["CHARACTER_REFERENCE_STATE"](H) {
        if (((this.tempBuff = [S_.AMPERSAND]), H === S_.NUMBER_SIGN))
          this.tempBuff.push(H), (this.state = "NUMERIC_CHARACTER_REFERENCE_STATE");
        else if (Ru6(H)) this._reconsumeInState("NAMED_CHARACTER_REFERENCE_STATE");
        else this._flushCodePointsConsumedAsCharacterReference(), this._reconsumeInState(this.returnState);
      }
      ["NAMED_CHARACTER_REFERENCE_STATE"](H) {
        let _ = this._matchNamedCharacterReference(H);
        if (this._ensureHibernation()) this.tempBuff = [S_.AMPERSAND];
        else if (_) {
          let q = this.tempBuff[this.tempBuff.length - 1] === S_.SEMICOLON;
          if (!this._isCharacterReferenceAttributeQuirk(q)) {
            if (!q) this._errOnNextCodePoint(G8.missingSemicolonAfterCharacterReference);
            this.tempBuff = _;
          }
          this._flushCodePointsConsumedAsCharacterReference(), (this.state = this.returnState);
        } else this._flushCodePointsConsumedAsCharacterReference(), (this.state = "AMBIGUOS_AMPERSAND_STATE");
      }
      ["AMBIGUOS_AMPERSAND_STATE"](H) {
        if (Ru6(H))
          if (this._isCharacterReferenceInAttribute()) this.currentAttr.value += uD(H);
          else this._emitCodePoint(H);
        else {
          if (H === S_.SEMICOLON) this._err(G8.unknownNamedCharacterReference);
          this._reconsumeInState(this.returnState);
        }
      }
      ["NUMERIC_CHARACTER_REFERENCE_STATE"](H) {
        if (((this.charRefCode = 0), H === S_.LATIN_SMALL_X || H === S_.LATIN_CAPITAL_X))
          this.tempBuff.push(H), (this.state = "HEXADEMICAL_CHARACTER_REFERENCE_START_STATE");
        else this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_START_STATE");
      }
      ["HEXADEMICAL_CHARACTER_REFERENCE_START_STATE"](H) {
        if (Vq1(H)) this._reconsumeInState("HEXADEMICAL_CHARACTER_REFERENCE_STATE");
        else
          this._err(G8.absenceOfDigitsInNumericCharacterReference),
            this._flushCodePointsConsumedAsCharacterReference(),
            this._reconsumeInState(this.returnState);
      }
      ["DECIMAL_CHARACTER_REFERENCE_START_STATE"](H) {
        if (iiH(H)) this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_STATE");
        else
          this._err(G8.absenceOfDigitsInNumericCharacterReference),
            this._flushCodePointsConsumedAsCharacterReference(),
            this._reconsumeInState(this.returnState);
      }
      ["HEXADEMICAL_CHARACTER_REFERENCE_STATE"](H) {
        if (Yj7(H)) this.charRefCode = this.charRefCode * 16 + H - 55;
        else if (Dj7(H)) this.charRefCode = this.charRefCode * 16 + H - 87;
        else if (iiH(H)) this.charRefCode = this.charRefCode * 16 + H - 48;
        else if (H === S_.SEMICOLON) this.state = "NUMERIC_CHARACTER_REFERENCE_END_STATE";
        else
          this._err(G8.missingSemicolonAfterCharacterReference),
            this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE");
      }
      ["DECIMAL_CHARACTER_REFERENCE_STATE"](H) {
        if (iiH(H)) this.charRefCode = this.charRefCode * 10 + H - 48;
        else if (H === S_.SEMICOLON) this.state = "NUMERIC_CHARACTER_REFERENCE_END_STATE";
        else
          this._err(G8.missingSemicolonAfterCharacterReference),
            this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE");
      }
      ["NUMERIC_CHARACTER_REFERENCE_END_STATE"]() {
        if (this.charRefCode === S_.NULL)
          this._err(G8.nullCharacterReference), (this.charRefCode = S_.REPLACEMENT_CHARACTER);
        else if (this.charRefCode > 1114111)
          this._err(G8.characterReferenceOutsideUnicodeRange), (this.charRefCode = S_.REPLACEMENT_CHARACTER);
        else if (jz.isSurrogate(this.charRefCode))
          this._err(G8.surrogateCharacterReference), (this.charRefCode = S_.REPLACEMENT_CHARACTER);
        else if (jz.isUndefinedCodePoint(this.charRefCode)) this._err(G8.noncharacterCharacterReference);
        else if (jz.isControlCodePoint(this.charRefCode) || this.charRefCode === S_.CARRIAGE_RETURN) {
          this._err(G8.controlCharacterReference);
          let H = yq1[this.charRefCode];
          if (H) this.charRefCode = H;
        }
        (this.tempBuff = [this.charRefCode]),
          this._flushCodePointsConsumedAsCharacterReference(),
          this._reconsumeInState(this.returnState);
      }
    }
    nA.CHARACTER_TOKEN = "CHARACTER_TOKEN";
    nA.NULL_CHARACTER_TOKEN = "NULL_CHARACTER_TOKEN";
    nA.WHITESPACE_CHARACTER_TOKEN = "WHITESPACE_CHARACTER_TOKEN";
    nA.START_TAG_TOKEN = "START_TAG_TOKEN";
    nA.END_TAG_TOKEN = "END_TAG_TOKEN";
    nA.COMMENT_TOKEN = "COMMENT_TOKEN";
    nA.DOCTYPE_TOKEN = "DOCTYPE_TOKEN";
    nA.EOF_TOKEN = "EOF_TOKEN";
    nA.HIBERNATION_TOKEN = "HIBERNATION_TOKEN";
    nA.MODE = {
      DATA: "DATA_STATE",
      RCDATA: "RCDATA_STATE",
      RAWTEXT: "RAWTEXT_STATE",
      SCRIPT_DATA: "SCRIPT_DATA_STATE",
      PLAINTEXT: "PLAINTEXT_STATE",
    };
    nA.getTokenAttr = function (H, _) {
      for (let q = H.attrs.length - 1; q >= 0; q--) if (H.attrs[q].name === _) return H.attrs[q].value;
      return null;
    };
    jj7.exports = nA;
  });

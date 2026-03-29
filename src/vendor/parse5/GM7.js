  var GM7 = d((R7O, WM7) => {
    var p_ = niH(),
      $71 = Wj7(),
      _M7 = Rj7(),
      K71 = Ij7(),
      O71 = lj7(),
      qM7 = Nd(),
      T71 = Vu6(),
      z71 = Su6(),
      $M7 = Eu6(),
      hd = HM7(),
      HW = VN_(),
      A71 = yN_(),
      mTH = w8H(),
      IH = mTH.TAG_NAMES,
      H9 = mTH.NAMESPACES,
      jM7 = mTH.ATTRS,
      f71 = { scriptingEnabled: !0, sourceCodeLocationInfo: !1, onParseError: null, treeAdapter: T71 },
      w71 = {
        [IH.TR]: "IN_ROW_MODE",
        [IH.TBODY]: "IN_TABLE_BODY_MODE",
        [IH.THEAD]: "IN_TABLE_BODY_MODE",
        [IH.TFOOT]: "IN_TABLE_BODY_MODE",
        [IH.CAPTION]: "IN_CAPTION_MODE",
        [IH.COLGROUP]: "IN_COLUMN_GROUP_MODE",
        [IH.TABLE]: "IN_TABLE_MODE",
        [IH.BODY]: "IN_BODY_MODE",
        [IH.FRAMESET]: "IN_FRAMESET_MODE",
      },
      Y71 = {
        [IH.CAPTION]: "IN_TABLE_MODE",
        [IH.COLGROUP]: "IN_TABLE_MODE",
        [IH.TBODY]: "IN_TABLE_MODE",
        [IH.TFOOT]: "IN_TABLE_MODE",
        [IH.THEAD]: "IN_TABLE_MODE",
        [IH.COL]: "IN_COLUMN_GROUP_MODE",
        [IH.TR]: "IN_TABLE_BODY_MODE",
        [IH.TD]: "IN_ROW_MODE",
        [IH.TH]: "IN_ROW_MODE",
      },
      KM7 = {
        ["INITIAL_MODE"]: {
          [p_.CHARACTER_TOKEN]: oiH,
          [p_.NULL_CHARACTER_TOKEN]: oiH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: b5,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: G71,
          [p_.START_TAG_TOKEN]: oiH,
          [p_.END_TAG_TOKEN]: oiH,
          [p_.EOF_TOKEN]: oiH,
        },
        ["BEFORE_HTML_MODE"]: {
          [p_.CHARACTER_TOKEN]: siH,
          [p_.NULL_CHARACTER_TOKEN]: siH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: b5,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: R71,
          [p_.END_TAG_TOKEN]: Z71,
          [p_.EOF_TOKEN]: siH,
        },
        ["BEFORE_HEAD_MODE"]: {
          [p_.CHARACTER_TOKEN]: tiH,
          [p_.NULL_CHARACTER_TOKEN]: tiH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: b5,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: uN_,
          [p_.START_TAG_TOKEN]: L71,
          [p_.END_TAG_TOKEN]: k71,
          [p_.EOF_TOKEN]: tiH,
        },
        ["IN_HEAD_MODE"]: {
          [p_.CHARACTER_TOKEN]: eiH,
          [p_.NULL_CHARACTER_TOKEN]: eiH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: uN_,
          [p_.START_TAG_TOKEN]: AP,
          [p_.END_TAG_TOKEN]: pTH,
          [p_.EOF_TOKEN]: eiH,
        },
        ["IN_HEAD_NO_SCRIPT_MODE"]: {
          [p_.CHARACTER_TOKEN]: HnH,
          [p_.NULL_CHARACTER_TOKEN]: HnH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: uN_,
          [p_.START_TAG_TOKEN]: v71,
          [p_.END_TAG_TOKEN]: N71,
          [p_.EOF_TOKEN]: HnH,
        },
        ["AFTER_HEAD_MODE"]: {
          [p_.CHARACTER_TOKEN]: _nH,
          [p_.NULL_CHARACTER_TOKEN]: _nH,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: uN_,
          [p_.START_TAG_TOKEN]: h71,
          [p_.END_TAG_TOKEN]: y71,
          [p_.EOF_TOKEN]: _nH,
        },
        ["IN_BODY_MODE"]: {
          [p_.CHARACTER_TOKEN]: xN_,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: Ov,
          [p_.END_TAG_TOKEN]: Iu6,
          [p_.EOF_TOKEN]: En,
        },
        ["TEXT_MODE"]: {
          [p_.CHARACTER_TOKEN]: Kv,
          [p_.NULL_CHARACTER_TOKEN]: Kv,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: b5,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: b5,
          [p_.END_TAG_TOKEN]: K91,
          [p_.EOF_TOKEN]: O91,
        },
        ["IN_TABLE_MODE"]: {
          [p_.CHARACTER_TOKEN]: Cn,
          [p_.NULL_CHARACTER_TOKEN]: Cn,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Cn,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: uu6,
          [p_.END_TAG_TOKEN]: xu6,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_TABLE_TEXT_MODE"]: {
          [p_.CHARACTER_TOKEN]: J91,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: M91,
          [p_.COMMENT_TOKEN]: aiH,
          [p_.DOCTYPE_TOKEN]: aiH,
          [p_.START_TAG_TOKEN]: aiH,
          [p_.END_TAG_TOKEN]: aiH,
          [p_.EOF_TOKEN]: aiH,
        },
        ["IN_CAPTION_MODE"]: {
          [p_.CHARACTER_TOKEN]: xN_,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: P91,
          [p_.END_TAG_TOKEN]: X91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_COLUMN_GROUP_MODE"]: {
          [p_.CHARACTER_TOKEN]: pN_,
          [p_.NULL_CHARACTER_TOKEN]: pN_,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: W91,
          [p_.END_TAG_TOKEN]: G91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_TABLE_BODY_MODE"]: {
          [p_.CHARACTER_TOKEN]: Cn,
          [p_.NULL_CHARACTER_TOKEN]: Cn,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Cn,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: R91,
          [p_.END_TAG_TOKEN]: Z91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_ROW_MODE"]: {
          [p_.CHARACTER_TOKEN]: Cn,
          [p_.NULL_CHARACTER_TOKEN]: Cn,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Cn,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: L91,
          [p_.END_TAG_TOKEN]: k91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_CELL_MODE"]: {
          [p_.CHARACTER_TOKEN]: xN_,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: v91,
          [p_.END_TAG_TOKEN]: N91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_SELECT_MODE"]: {
          [p_.CHARACTER_TOKEN]: Kv,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: JM7,
          [p_.END_TAG_TOKEN]: PM7,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_SELECT_IN_TABLE_MODE"]: {
          [p_.CHARACTER_TOKEN]: Kv,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: h91,
          [p_.END_TAG_TOKEN]: y91,
          [p_.EOF_TOKEN]: En,
        },
        ["IN_TEMPLATE_MODE"]: {
          [p_.CHARACTER_TOKEN]: xN_,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: V91,
          [p_.END_TAG_TOKEN]: S91,
          [p_.EOF_TOKEN]: XM7,
        },
        ["AFTER_BODY_MODE"]: {
          [p_.CHARACTER_TOKEN]: BN_,
          [p_.NULL_CHARACTER_TOKEN]: BN_,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: W71,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: E91,
          [p_.END_TAG_TOKEN]: C91,
          [p_.EOF_TOKEN]: riH,
        },
        ["IN_FRAMESET_MODE"]: {
          [p_.CHARACTER_TOKEN]: b5,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: b91,
          [p_.END_TAG_TOKEN]: I91,
          [p_.EOF_TOKEN]: riH,
        },
        ["AFTER_FRAMESET_MODE"]: {
          [p_.CHARACTER_TOKEN]: b5,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: Kv,
          [p_.COMMENT_TOKEN]: lM,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: u91,
          [p_.END_TAG_TOKEN]: x91,
          [p_.EOF_TOKEN]: riH,
        },
        ["AFTER_AFTER_BODY_MODE"]: {
          [p_.CHARACTER_TOKEN]: mN_,
          [p_.NULL_CHARACTER_TOKEN]: mN_,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: OM7,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: m91,
          [p_.END_TAG_TOKEN]: mN_,
          [p_.EOF_TOKEN]: riH,
        },
        ["AFTER_AFTER_FRAMESET_MODE"]: {
          [p_.CHARACTER_TOKEN]: b5,
          [p_.NULL_CHARACTER_TOKEN]: b5,
          [p_.WHITESPACE_CHARACTER_TOKEN]: xTH,
          [p_.COMMENT_TOKEN]: OM7,
          [p_.DOCTYPE_TOKEN]: b5,
          [p_.START_TAG_TOKEN]: p91,
          [p_.END_TAG_TOKEN]: b5,
          [p_.EOF_TOKEN]: riH,
        },
      };
    class MM7 {
      constructor(H) {
        if (
          ((this.options = z71(f71, H)),
          (this.treeAdapter = this.options.treeAdapter),
          (this.pendingScript = null),
          this.options.sourceCodeLocationInfo)
        )
          qM7.install(this, K71);
        if (this.options.onParseError) qM7.install(this, O71, { onParseError: this.options.onParseError });
      }
      parse(H) {
        let _ = this.treeAdapter.createDocument();
        return this._bootstrap(_, null), this.tokenizer.write(H, !0), this._runParsingLoop(null), _;
      }
      parseFragment(H, _) {
        if (!_) _ = this.treeAdapter.createElement(IH.TEMPLATE, H9.HTML, []);
        let q = this.treeAdapter.createElement("documentmock", H9.HTML, []);
        if ((this._bootstrap(q, _), this.treeAdapter.getTagName(_) === IH.TEMPLATE))
          this._pushTmplInsertionMode("IN_TEMPLATE_MODE");
        this._initTokenizerForFragmentParsing(),
          this._insertFakeRootElement(),
          this._resetInsertionMode(),
          this._findFormInFragmentContext(),
          this.tokenizer.write(H, !0),
          this._runParsingLoop(null);
        let $ = this.treeAdapter.getFirstChild(q),
          K = this.treeAdapter.createDocumentFragment();
        return this._adoptNodes($, K), K;
      }
      _bootstrap(H, _) {
        (this.tokenizer = new p_(this.options)),
          (this.stopped = !1),
          (this.insertionMode = "INITIAL_MODE"),
          (this.originalInsertionMode = ""),
          (this.document = H),
          (this.fragmentContext = _),
          (this.headElement = null),
          (this.formElement = null),
          (this.openElements = new $71(this.document, this.treeAdapter)),
          (this.activeFormattingElements = new _M7(this.treeAdapter)),
          (this.tmplInsertionModeStack = []),
          (this.tmplInsertionModeStackTop = -1),
          (this.currentTmplInsertionMode = null),
          (this.pendingCharacterTokens = []),
          (this.hasNonWhitespacePendingCharacterToken = !1),
          (this.framesetOk = !0),
          (this.skipNextNewLine = !1),
          (this.fosterParentingEnabled = !1);
      }
      _err() {}
      _runParsingLoop(H) {
        while (!this.stopped) {
          this._setupTokenizerCDATAMode();
          let _ = this.tokenizer.getNextToken();
          if (_.type === p_.HIBERNATION_TOKEN) break;
          if (this.skipNextNewLine) {
            if (
              ((this.skipNextNewLine = !1),
              _.type === p_.WHITESPACE_CHARACTER_TOKEN &&
                _.chars[0] ===
                  `
`)
            ) {
              if (_.chars.length === 1) continue;
              _.chars = _.chars.substr(1);
            }
          }
          if ((this._processInputToken(_), H && this.pendingScript)) break;
        }
      }
      runParsingLoopForCurrentChunk(H, _) {
        if ((this._runParsingLoop(_), _ && this.pendingScript)) {
          let q = this.pendingScript;
          (this.pendingScript = null), _(q);
          return;
        }
        if (H) H();
      }
      _setupTokenizerCDATAMode() {
        let H = this._getAdjustedCurrentElement();
        this.tokenizer.allowCDATA =
          H && H !== this.document && this.treeAdapter.getNamespaceURI(H) !== H9.HTML && !this._isIntegrationPoint(H);
      }
      _switchToTextParsing(H, _) {
        this._insertElement(H, H9.HTML),
          (this.tokenizer.state = _),
          (this.originalInsertionMode = this.insertionMode),
          (this.insertionMode = "TEXT_MODE");
      }
      switchToPlaintextParsing() {
        (this.insertionMode = "TEXT_MODE"),
          (this.originalInsertionMode = "IN_BODY_MODE"),
          (this.tokenizer.state = p_.MODE.PLAINTEXT);
      }
      _getAdjustedCurrentElement() {
        return this.openElements.stackTop === 0 && this.fragmentContext
          ? this.fragmentContext
          : this.openElements.current;
      }
      _findFormInFragmentContext() {
        let H = this.fragmentContext;
        do {
          if (this.treeAdapter.getTagName(H) === IH.FORM) {
            this.formElement = H;
            break;
          }
          H = this.treeAdapter.getParentNode(H);
        } while (H);
      }
      _initTokenizerForFragmentParsing() {
        if (this.treeAdapter.getNamespaceURI(this.fragmentContext) === H9.HTML) {
          let H = this.treeAdapter.getTagName(this.fragmentContext);
          if (H === IH.TITLE || H === IH.TEXTAREA) this.tokenizer.state = p_.MODE.RCDATA;
          else if (
            H === IH.STYLE ||
            H === IH.XMP ||
            H === IH.IFRAME ||
            H === IH.NOEMBED ||
            H === IH.NOFRAMES ||
            H === IH.NOSCRIPT
          )
            this.tokenizer.state = p_.MODE.RAWTEXT;
          else if (H === IH.SCRIPT) this.tokenizer.state = p_.MODE.SCRIPT_DATA;
          else if (H === IH.PLAINTEXT) this.tokenizer.state = p_.MODE.PLAINTEXT;
        }
      }
      _setDocumentType(H) {
        let _ = H.name || "",
          q = H.publicId || "",
          $ = H.systemId || "";
        this.treeAdapter.setDocumentType(this.document, _, q, $);
      }
      _attachElementToTree(H) {
        if (this._shouldFosterParentOnInsertion()) this._fosterParentElement(H);
        else {
          let _ = this.openElements.currentTmplContent || this.openElements.current;
          this.treeAdapter.appendChild(_, H);
        }
      }
      _appendElement(H, _) {
        let q = this.treeAdapter.createElement(H.tagName, _, H.attrs);
        this._attachElementToTree(q);
      }
      _insertElement(H, _) {
        let q = this.treeAdapter.createElement(H.tagName, _, H.attrs);
        this._attachElementToTree(q), this.openElements.push(q);
      }
      _insertFakeElement(H) {
        let _ = this.treeAdapter.createElement(H, H9.HTML, []);
        this._attachElementToTree(_), this.openElements.push(_);
      }
      _insertTemplate(H) {
        let _ = this.treeAdapter.createElement(H.tagName, H9.HTML, H.attrs),
          q = this.treeAdapter.createDocumentFragment();
        this.treeAdapter.setTemplateContent(_, q), this._attachElementToTree(_), this.openElements.push(_);
      }
      _insertFakeRootElement() {
        let H = this.treeAdapter.createElement(IH.HTML, H9.HTML, []);
        this.treeAdapter.appendChild(this.openElements.current, H), this.openElements.push(H);
      }
      _appendCommentNode(H, _) {
        let q = this.treeAdapter.createCommentNode(H.data);
        this.treeAdapter.appendChild(_, q);
      }
      _insertCharacters(H) {
        if (this._shouldFosterParentOnInsertion()) this._fosterParentText(H.chars);
        else {
          let _ = this.openElements.currentTmplContent || this.openElements.current;
          this.treeAdapter.insertText(_, H.chars);
        }
      }
      _adoptNodes(H, _) {
        for (let q = this.treeAdapter.getFirstChild(H); q; q = this.treeAdapter.getFirstChild(H))
          this.treeAdapter.detachNode(q), this.treeAdapter.appendChild(_, q);
      }
      _shouldProcessTokenInForeignContent(H) {
        let _ = this._getAdjustedCurrentElement();
        if (!_ || _ === this.document) return !1;
        let q = this.treeAdapter.getNamespaceURI(_);
        if (q === H9.HTML) return !1;
        if (
          this.treeAdapter.getTagName(_) === IH.ANNOTATION_XML &&
          q === H9.MATHML &&
          H.type === p_.START_TAG_TOKEN &&
          H.tagName === IH.SVG
        )
          return !1;
        let $ =
          H.type === p_.CHARACTER_TOKEN ||
          H.type === p_.NULL_CHARACTER_TOKEN ||
          H.type === p_.WHITESPACE_CHARACTER_TOKEN;
        if (
          ((H.type === p_.START_TAG_TOKEN && H.tagName !== IH.MGLYPH && H.tagName !== IH.MALIGNMARK) || $) &&
          this._isIntegrationPoint(_, H9.MATHML)
        )
          return !1;
        if ((H.type === p_.START_TAG_TOKEN || $) && this._isIntegrationPoint(_, H9.HTML)) return !1;
        return H.type !== p_.EOF_TOKEN;
      }
      _processToken(H) {
        KM7[this.insertionMode][H.type](this, H);
      }
      _processTokenInBodyMode(H) {
        KM7.IN_BODY_MODE[H.type](this, H);
      }
      _processTokenInForeignContent(H) {
        if (H.type === p_.CHARACTER_TOKEN) g91(this, H);
        else if (H.type === p_.NULL_CHARACTER_TOKEN) B91(this, H);
        else if (H.type === p_.WHITESPACE_CHARACTER_TOKEN) Kv(this, H);
        else if (H.type === p_.COMMENT_TOKEN) lM(this, H);
        else if (H.type === p_.START_TAG_TOKEN) d91(this, H);
        else if (H.type === p_.END_TAG_TOKEN) c91(this, H);
      }
      _processInputToken(H) {
        if (this._shouldProcessTokenInForeignContent(H)) this._processTokenInForeignContent(H);
        else this._processToken(H);
        if (H.type === p_.START_TAG_TOKEN && H.selfClosing && !H.ackSelfClosing)
          this._err(HW.nonVoidHtmlElementStartTagWithTrailingSolidus);
      }
      _isIntegrationPoint(H, _) {
        let q = this.treeAdapter.getTagName(H),
          $ = this.treeAdapter.getNamespaceURI(H),
          K = this.treeAdapter.getAttrList(H);
        return hd.isIntegrationPoint(q, $, K, _);
      }
      _reconstructActiveFormattingElements() {
        let H = this.activeFormattingElements.length;
        if (H) {
          let _ = H,
            q = null;
          do
            if (
              (_--,
              (q = this.activeFormattingElements.entries[_]),
              q.type === _M7.MARKER_ENTRY || this.openElements.contains(q.element))
            ) {
              _++;
              break;
            }
          while (_ > 0);
          for (let $ = _; $ < H; $++)
            (q = this.activeFormattingElements.entries[$]),
              this._insertElement(q.token, this.treeAdapter.getNamespaceURI(q.element)),
              (q.element = this.openElements.current);
        }
      }
      _closeTableCell() {
        this.openElements.generateImpliedEndTags(),
          this.openElements.popUntilTableCellPopped(),
          this.activeFormattingElements.clearToLastMarker(),
          (this.insertionMode = "IN_ROW_MODE");
      }
      _closePElement() {
        this.openElements.generateImpliedEndTagsWithExclusion(IH.P), this.openElements.popUntilTagNamePopped(IH.P);
      }
      _resetInsertionMode() {
        for (let H = this.openElements.stackTop, _ = !1; H >= 0; H--) {
          let q = this.openElements.items[H];
          if (H === 0) {
            if (((_ = !0), this.fragmentContext)) q = this.fragmentContext;
          }
          let $ = this.treeAdapter.getTagName(q),
            K = w71[$];
          if (K) {
            this.insertionMode = K;
            break;
          } else if (!_ && ($ === IH.TD || $ === IH.TH)) {
            this.insertionMode = "IN_CELL_MODE";
            break;
          } else if (!_ && $ === IH.HEAD) {
            this.insertionMode = "IN_HEAD_MODE";
            break;
          } else if ($ === IH.SELECT) {
            this._resetInsertionModeForSelect(H);
            break;
          } else if ($ === IH.TEMPLATE) {
            this.insertionMode = this.currentTmplInsertionMode;
            break;
          } else if ($ === IH.HTML) {
            this.insertionMode = this.headElement ? "AFTER_HEAD_MODE" : "BEFORE_HEAD_MODE";
            break;
          } else if (_) {
            this.insertionMode = "IN_BODY_MODE";
            break;
          }
        }
      }
      _resetInsertionModeForSelect(H) {
        if (H > 0)
          for (let _ = H - 1; _ > 0; _--) {
            let q = this.openElements.items[_],
              $ = this.treeAdapter.getTagName(q);
            if ($ === IH.TEMPLATE) break;
            else if ($ === IH.TABLE) {
              this.insertionMode = "IN_SELECT_IN_TABLE_MODE";
              return;
            }
          }
        this.insertionMode = "IN_SELECT_MODE";
      }
      _pushTmplInsertionMode(H) {
        this.tmplInsertionModeStack.push(H), this.tmplInsertionModeStackTop++, (this.currentTmplInsertionMode = H);
      }
      _popTmplInsertionMode() {
        this.tmplInsertionModeStack.pop(),
          this.tmplInsertionModeStackTop--,
          (this.currentTmplInsertionMode = this.tmplInsertionModeStack[this.tmplInsertionModeStackTop]);
      }
      _isElementCausesFosterParenting(H) {
        let _ = this.treeAdapter.getTagName(H);
        return _ === IH.TABLE || _ === IH.TBODY || _ === IH.TFOOT || _ === IH.THEAD || _ === IH.TR;
      }
      _shouldFosterParentOnInsertion() {
        return this.fosterParentingEnabled && this._isElementCausesFosterParenting(this.openElements.current);
      }
      _findFosterParentingLocation() {
        let H = { parent: null, beforeElement: null };
        for (let _ = this.openElements.stackTop; _ >= 0; _--) {
          let q = this.openElements.items[_],
            $ = this.treeAdapter.getTagName(q),
            K = this.treeAdapter.getNamespaceURI(q);
          if ($ === IH.TEMPLATE && K === H9.HTML) {
            H.parent = this.treeAdapter.getTemplateContent(q);
            break;
          } else if ($ === IH.TABLE) {
            if (((H.parent = this.treeAdapter.getParentNode(q)), H.parent)) H.beforeElement = q;
            else H.parent = this.openElements.items[_ - 1];
            break;
          }
        }
        if (!H.parent) H.parent = this.openElements.items[0];
        return H;
      }
      _fosterParentElement(H) {
        let _ = this._findFosterParentingLocation();
        if (_.beforeElement) this.treeAdapter.insertBefore(_.parent, H, _.beforeElement);
        else this.treeAdapter.appendChild(_.parent, H);
      }
      _fosterParentText(H) {
        let _ = this._findFosterParentingLocation();
        if (_.beforeElement) this.treeAdapter.insertTextBefore(_.parent, H, _.beforeElement);
        else this.treeAdapter.insertText(_.parent, H);
      }
      _isSpecialElement(H) {
        let _ = this.treeAdapter.getTagName(H),
          q = this.treeAdapter.getNamespaceURI(H);
        return mTH.SPECIAL_ELEMENTS[q][_];
      }
    }
    WM7.exports = MM7;
    function D71(H, _) {
      let q = H.activeFormattingElements.getElementEntryInScopeWithTagName(_.tagName);
      if (q) {
        if (!H.openElements.contains(q.element)) H.activeFormattingElements.removeEntry(q), (q = null);
        else if (!H.openElements.hasInScope(_.tagName)) q = null;
      } else Wx(H, _);
      return q;
    }
    function j71(H, _) {
      let q = null;
      for (let $ = H.openElements.stackTop; $ >= 0; $--) {
        let K = H.openElements.items[$];
        if (K === _.element) break;
        if (H._isSpecialElement(K)) q = K;
      }
      if (!q) H.openElements.popUntilElementPopped(_.element), H.activeFormattingElements.removeEntry(_);
      return q;
    }
    function M71(H, _, q) {
      let $ = _,
        K = H.openElements.getCommonAncestor(_);
      for (let O = 0, T = K; T !== q; O++, T = K) {
        K = H.openElements.getCommonAncestor(T);
        let z = H.activeFormattingElements.getElementEntry(T),
          A = z && O >= 3;
        if (!z || A) {
          if (A) H.activeFormattingElements.removeEntry(z);
          H.openElements.remove(T);
        } else {
          if (((T = J71(H, z)), $ === _)) H.activeFormattingElements.bookmark = z;
          H.treeAdapter.detachNode($), H.treeAdapter.appendChild(T, $), ($ = T);
        }
      }
      return $;
    }
    function J71(H, _) {
      let q = H.treeAdapter.getNamespaceURI(_.element),
        $ = H.treeAdapter.createElement(_.token.tagName, q, _.token.attrs);
      return H.openElements.replace(_.element, $), (_.element = $), $;
    }
    function P71(H, _, q) {
      if (H._isElementCausesFosterParenting(_)) H._fosterParentElement(q);
      else {
        let $ = H.treeAdapter.getTagName(_),
          K = H.treeAdapter.getNamespaceURI(_);
        if ($ === IH.TEMPLATE && K === H9.HTML) _ = H.treeAdapter.getTemplateContent(_);
        H.treeAdapter.appendChild(_, q);
      }
    }
    function X71(H, _, q) {
      let $ = H.treeAdapter.getNamespaceURI(q.element),
        K = q.token,
        O = H.treeAdapter.createElement(K.tagName, $, K.attrs);
      H._adoptNodes(_, O),
        H.treeAdapter.appendChild(_, O),
        H.activeFormattingElements.insertElementAfterBookmark(O, q.token),
        H.activeFormattingElements.removeEntry(q),
        H.openElements.remove(q.element),
        H.openElements.insertAfter(_, O);
    }
    function j8H(H, _) {
      let q;
      for (let $ = 0; $ < 8; $++) {
        if (((q = D71(H, _, q)), !q)) break;
        let K = j71(H, q);
        if (!K) break;
        H.activeFormattingElements.bookmark = q;
        let O = M71(H, K, q.element),
          T = H.openElements.getCommonAncestor(q.element);
        H.treeAdapter.detachNode(O), P71(H, T, O), X71(H, K, q);
      }
    }
    function b5() {}
    function uN_(H) {
      H._err(HW.misplacedDoctype);
    }
    function lM(H, _) {
      H._appendCommentNode(_, H.openElements.currentTmplContent || H.openElements.current);
    }
    function W71(H, _) {
      H._appendCommentNode(_, H.openElements.items[0]);
    }
    function OM7(H, _) {
      H._appendCommentNode(_, H.document);
    }
    function Kv(H, _) {
      H._insertCharacters(_);
    }
    function riH(H) {
      H.stopped = !0;
    }
    function G71(H, _) {
      H._setDocumentType(_);
      let q = _.forceQuirks ? mTH.DOCUMENT_MODE.QUIRKS : $M7.getDocumentMode(_);
      if (!$M7.isConforming(_)) H._err(HW.nonConformingDoctype);
      H.treeAdapter.setDocumentMode(H.document, q), (H.insertionMode = "BEFORE_HTML_MODE");
    }
    function oiH(H, _) {
      H._err(HW.missingDoctype, { beforeToken: !0 }),
        H.treeAdapter.setDocumentMode(H.document, mTH.DOCUMENT_MODE.QUIRKS),
        (H.insertionMode = "BEFORE_HTML_MODE"),
        H._processToken(_);
    }
    function R71(H, _) {
      if (_.tagName === IH.HTML) H._insertElement(_, H9.HTML), (H.insertionMode = "BEFORE_HEAD_MODE");
      else siH(H, _);
    }
    function Z71(H, _) {
      let q = _.tagName;
      if (q === IH.HTML || q === IH.HEAD || q === IH.BODY || q === IH.BR) siH(H, _);
    }
    function siH(H, _) {
      H._insertFakeRootElement(), (H.insertionMode = "BEFORE_HEAD_MODE"), H._processToken(_);
    }
    function L71(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.HEAD)
        H._insertElement(_, H9.HTML), (H.headElement = H.openElements.current), (H.insertionMode = "IN_HEAD_MODE");
      else tiH(H, _);
    }
    function k71(H, _) {
      let q = _.tagName;
      if (q === IH.HEAD || q === IH.BODY || q === IH.HTML || q === IH.BR) tiH(H, _);
      else H._err(HW.endTagWithoutMatchingOpenElement);
    }
    function tiH(H, _) {
      H._insertFakeElement(IH.HEAD),
        (H.headElement = H.openElements.current),
        (H.insertionMode = "IN_HEAD_MODE"),
        H._processToken(_);
    }
    function AP(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.BASE || q === IH.BASEFONT || q === IH.BGSOUND || q === IH.LINK || q === IH.META)
        H._appendElement(_, H9.HTML), (_.ackSelfClosing = !0);
      else if (q === IH.TITLE) H._switchToTextParsing(_, p_.MODE.RCDATA);
      else if (q === IH.NOSCRIPT)
        if (H.options.scriptingEnabled) H._switchToTextParsing(_, p_.MODE.RAWTEXT);
        else H._insertElement(_, H9.HTML), (H.insertionMode = "IN_HEAD_NO_SCRIPT_MODE");
      else if (q === IH.NOFRAMES || q === IH.STYLE) H._switchToTextParsing(_, p_.MODE.RAWTEXT);
      else if (q === IH.SCRIPT) H._switchToTextParsing(_, p_.MODE.SCRIPT_DATA);
      else if (q === IH.TEMPLATE)
        H._insertTemplate(_, H9.HTML),
          H.activeFormattingElements.insertMarker(),
          (H.framesetOk = !1),
          (H.insertionMode = "IN_TEMPLATE_MODE"),
          H._pushTmplInsertionMode("IN_TEMPLATE_MODE");
      else if (q === IH.HEAD) H._err(HW.misplacedStartTagForHeadElement);
      else eiH(H, _);
    }
    function pTH(H, _) {
      let q = _.tagName;
      if (q === IH.HEAD) H.openElements.pop(), (H.insertionMode = "AFTER_HEAD_MODE");
      else if (q === IH.BODY || q === IH.BR || q === IH.HTML) eiH(H, _);
      else if (q === IH.TEMPLATE)
        if (H.openElements.tmplCount > 0) {
          if ((H.openElements.generateImpliedEndTagsThoroughly(), H.openElements.currentTagName !== IH.TEMPLATE))
            H._err(HW.closingOfElementWithOpenChildElements);
          H.openElements.popUntilTagNamePopped(IH.TEMPLATE),
            H.activeFormattingElements.clearToLastMarker(),
            H._popTmplInsertionMode(),
            H._resetInsertionMode();
        } else H._err(HW.endTagWithoutMatchingOpenElement);
      else H._err(HW.endTagWithoutMatchingOpenElement);
    }
    function eiH(H, _) {
      H.openElements.pop(), (H.insertionMode = "AFTER_HEAD_MODE"), H._processToken(_);
    }
    function v71(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (
        q === IH.BASEFONT ||
        q === IH.BGSOUND ||
        q === IH.HEAD ||
        q === IH.LINK ||
        q === IH.META ||
        q === IH.NOFRAMES ||
        q === IH.STYLE
      )
        AP(H, _);
      else if (q === IH.NOSCRIPT) H._err(HW.nestedNoscriptInHead);
      else HnH(H, _);
    }
    function N71(H, _) {
      let q = _.tagName;
      if (q === IH.NOSCRIPT) H.openElements.pop(), (H.insertionMode = "IN_HEAD_MODE");
      else if (q === IH.BR) HnH(H, _);
      else H._err(HW.endTagWithoutMatchingOpenElement);
    }
    function HnH(H, _) {
      let q = _.type === p_.EOF_TOKEN ? HW.openElementsLeftAfterEof : HW.disallowedContentInNoscriptInHead;
      H._err(q), H.openElements.pop(), (H.insertionMode = "IN_HEAD_MODE"), H._processToken(_);
    }
    function h71(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.BODY) H._insertElement(_, H9.HTML), (H.framesetOk = !1), (H.insertionMode = "IN_BODY_MODE");
      else if (q === IH.FRAMESET) H._insertElement(_, H9.HTML), (H.insertionMode = "IN_FRAMESET_MODE");
      else if (
        q === IH.BASE ||
        q === IH.BASEFONT ||
        q === IH.BGSOUND ||
        q === IH.LINK ||
        q === IH.META ||
        q === IH.NOFRAMES ||
        q === IH.SCRIPT ||
        q === IH.STYLE ||
        q === IH.TEMPLATE ||
        q === IH.TITLE
      )
        H._err(HW.abandonedHeadElementChild),
          H.openElements.push(H.headElement),
          AP(H, _),
          H.openElements.remove(H.headElement);
      else if (q === IH.HEAD) H._err(HW.misplacedStartTagForHeadElement);
      else _nH(H, _);
    }
    function y71(H, _) {
      let q = _.tagName;
      if (q === IH.BODY || q === IH.HTML || q === IH.BR) _nH(H, _);
      else if (q === IH.TEMPLATE) pTH(H, _);
      else H._err(HW.endTagWithoutMatchingOpenElement);
    }
    function _nH(H, _) {
      H._insertFakeElement(IH.BODY), (H.insertionMode = "IN_BODY_MODE"), H._processToken(_);
    }
    function xTH(H, _) {
      H._reconstructActiveFormattingElements(), H._insertCharacters(_);
    }
    function xN_(H, _) {
      H._reconstructActiveFormattingElements(), H._insertCharacters(_), (H.framesetOk = !1);
    }
    function V71(H, _) {
      if (H.openElements.tmplCount === 0) H.treeAdapter.adoptAttributes(H.openElements.items[0], _.attrs);
    }
    function S71(H, _) {
      let q = H.openElements.tryPeekProperlyNestedBodyElement();
      if (q && H.openElements.tmplCount === 0) (H.framesetOk = !1), H.treeAdapter.adoptAttributes(q, _.attrs);
    }
    function E71(H, _) {
      let q = H.openElements.tryPeekProperlyNestedBodyElement();
      if (H.framesetOk && q)
        H.treeAdapter.detachNode(q),
          H.openElements.popAllUpToHtmlElement(),
          H._insertElement(_, H9.HTML),
          (H.insertionMode = "IN_FRAMESET_MODE");
    }
    function Sn(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._insertElement(_, H9.HTML);
    }
    function C71(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      let q = H.openElements.currentTagName;
      if (q === IH.H1 || q === IH.H2 || q === IH.H3 || q === IH.H4 || q === IH.H5 || q === IH.H6) H.openElements.pop();
      H._insertElement(_, H9.HTML);
    }
    function TM7(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._insertElement(_, H9.HTML), (H.skipNextNewLine = !0), (H.framesetOk = !1);
    }
    function b71(H, _) {
      let q = H.openElements.tmplCount > 0;
      if (!H.formElement || q) {
        if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
        if ((H._insertElement(_, H9.HTML), !q)) H.formElement = H.openElements.current;
      }
    }
    function I71(H, _) {
      H.framesetOk = !1;
      let q = _.tagName;
      for (let $ = H.openElements.stackTop; $ >= 0; $--) {
        let K = H.openElements.items[$],
          O = H.treeAdapter.getTagName(K),
          T = null;
        if (q === IH.LI && O === IH.LI) T = IH.LI;
        else if ((q === IH.DD || q === IH.DT) && (O === IH.DD || O === IH.DT)) T = O;
        if (T) {
          H.openElements.generateImpliedEndTagsWithExclusion(T), H.openElements.popUntilTagNamePopped(T);
          break;
        }
        if (O !== IH.ADDRESS && O !== IH.DIV && O !== IH.P && H._isSpecialElement(K)) break;
      }
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._insertElement(_, H9.HTML);
    }
    function u71(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._insertElement(_, H9.HTML), (H.tokenizer.state = p_.MODE.PLAINTEXT);
    }
    function x71(H, _) {
      if (H.openElements.hasInScope(IH.BUTTON))
        H.openElements.generateImpliedEndTags(), H.openElements.popUntilTagNamePopped(IH.BUTTON);
      H._reconstructActiveFormattingElements(), H._insertElement(_, H9.HTML), (H.framesetOk = !1);
    }
    function m71(H, _) {
      let q = H.activeFormattingElements.getElementEntryInScopeWithTagName(IH.A);
      if (q) j8H(H, _), H.openElements.remove(q.element), H.activeFormattingElements.removeEntry(q);
      H._reconstructActiveFormattingElements(),
        H._insertElement(_, H9.HTML),
        H.activeFormattingElements.pushElement(H.openElements.current, _);
    }
    function IZH(H, _) {
      H._reconstructActiveFormattingElements(),
        H._insertElement(_, H9.HTML),
        H.activeFormattingElements.pushElement(H.openElements.current, _);
    }
    function p71(H, _) {
      if ((H._reconstructActiveFormattingElements(), H.openElements.hasInScope(IH.NOBR)))
        j8H(H, _), H._reconstructActiveFormattingElements();
      H._insertElement(_, H9.HTML), H.activeFormattingElements.pushElement(H.openElements.current, _);
    }
    function zM7(H, _) {
      H._reconstructActiveFormattingElements(),
        H._insertElement(_, H9.HTML),
        H.activeFormattingElements.insertMarker(),
        (H.framesetOk = !1);
    }
    function B71(H, _) {
      if (
        H.treeAdapter.getDocumentMode(H.document) !== mTH.DOCUMENT_MODE.QUIRKS &&
        H.openElements.hasInButtonScope(IH.P)
      )
        H._closePElement();
      H._insertElement(_, H9.HTML), (H.framesetOk = !1), (H.insertionMode = "IN_TABLE_MODE");
    }
    function uZH(H, _) {
      H._reconstructActiveFormattingElements(),
        H._appendElement(_, H9.HTML),
        (H.framesetOk = !1),
        (_.ackSelfClosing = !0);
    }
    function g71(H, _) {
      H._reconstructActiveFormattingElements(), H._appendElement(_, H9.HTML);
      let q = p_.getTokenAttr(_, jM7.TYPE);
      if (!q || q.toLowerCase() !== "hidden") H.framesetOk = !1;
      _.ackSelfClosing = !0;
    }
    function AM7(H, _) {
      H._appendElement(_, H9.HTML), (_.ackSelfClosing = !0);
    }
    function d71(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._appendElement(_, H9.HTML), (H.framesetOk = !1), (H.ackSelfClosing = !0);
    }
    function c71(H, _) {
      (_.tagName = IH.IMG), uZH(H, _);
    }
    function F71(H, _) {
      H._insertElement(_, H9.HTML),
        (H.skipNextNewLine = !0),
        (H.tokenizer.state = p_.MODE.RCDATA),
        (H.originalInsertionMode = H.insertionMode),
        (H.framesetOk = !1),
        (H.insertionMode = "TEXT_MODE");
    }
    function U71(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._reconstructActiveFormattingElements(), (H.framesetOk = !1), H._switchToTextParsing(_, p_.MODE.RAWTEXT);
    }
    function Q71(H, _) {
      (H.framesetOk = !1), H._switchToTextParsing(_, p_.MODE.RAWTEXT);
    }
    function fM7(H, _) {
      H._switchToTextParsing(_, p_.MODE.RAWTEXT);
    }
    function l71(H, _) {
      if (
        (H._reconstructActiveFormattingElements(),
        H._insertElement(_, H9.HTML),
        (H.framesetOk = !1),
        H.insertionMode === "IN_TABLE_MODE" ||
          H.insertionMode === "IN_CAPTION_MODE" ||
          H.insertionMode === "IN_TABLE_BODY_MODE" ||
          H.insertionMode === "IN_ROW_MODE" ||
          H.insertionMode === "IN_CELL_MODE")
      )
        H.insertionMode = "IN_SELECT_IN_TABLE_MODE";
      else H.insertionMode = "IN_SELECT_MODE";
    }
    function wM7(H, _) {
      if (H.openElements.currentTagName === IH.OPTION) H.openElements.pop();
      H._reconstructActiveFormattingElements(), H._insertElement(_, H9.HTML);
    }
    function YM7(H, _) {
      if (H.openElements.hasInScope(IH.RUBY)) H.openElements.generateImpliedEndTags();
      H._insertElement(_, H9.HTML);
    }
    function i71(H, _) {
      if (H.openElements.hasInScope(IH.RUBY)) H.openElements.generateImpliedEndTagsWithExclusion(IH.RTC);
      H._insertElement(_, H9.HTML);
    }
    function n71(H, _) {
      if (H.openElements.hasInButtonScope(IH.P)) H._closePElement();
      H._insertElement(_, H9.HTML);
    }
    function r71(H, _) {
      if (
        (H._reconstructActiveFormattingElements(),
        hd.adjustTokenMathMLAttrs(_),
        hd.adjustTokenXMLAttrs(_),
        _.selfClosing)
      )
        H._appendElement(_, H9.MATHML);
      else H._insertElement(_, H9.MATHML);
      _.ackSelfClosing = !0;
    }
    function o71(H, _) {
      if (
        (H._reconstructActiveFormattingElements(), hd.adjustTokenSVGAttrs(_), hd.adjustTokenXMLAttrs(_), _.selfClosing)
      )
        H._appendElement(_, H9.SVG);
      else H._insertElement(_, H9.SVG);
      _.ackSelfClosing = !0;
    }
    function qC(H, _) {
      H._reconstructActiveFormattingElements(), H._insertElement(_, H9.HTML);
    }
    function Ov(H, _) {
      let q = _.tagName;
      switch (q.length) {
        case 1:
          if (q === IH.I || q === IH.S || q === IH.B || q === IH.U) IZH(H, _);
          else if (q === IH.P) Sn(H, _);
          else if (q === IH.A) m71(H, _);
          else qC(H, _);
          break;
        case 2:
          if (q === IH.DL || q === IH.OL || q === IH.UL) Sn(H, _);
          else if (q === IH.H1 || q === IH.H2 || q === IH.H3 || q === IH.H4 || q === IH.H5 || q === IH.H6) C71(H, _);
          else if (q === IH.LI || q === IH.DD || q === IH.DT) I71(H, _);
          else if (q === IH.EM || q === IH.TT) IZH(H, _);
          else if (q === IH.BR) uZH(H, _);
          else if (q === IH.HR) d71(H, _);
          else if (q === IH.RB) YM7(H, _);
          else if (q === IH.RT || q === IH.RP) i71(H, _);
          else if (q !== IH.TH && q !== IH.TD && q !== IH.TR) qC(H, _);
          break;
        case 3:
          if (q === IH.DIV || q === IH.DIR || q === IH.NAV) Sn(H, _);
          else if (q === IH.PRE) TM7(H, _);
          else if (q === IH.BIG) IZH(H, _);
          else if (q === IH.IMG || q === IH.WBR) uZH(H, _);
          else if (q === IH.XMP) U71(H, _);
          else if (q === IH.SVG) o71(H, _);
          else if (q === IH.RTC) YM7(H, _);
          else if (q !== IH.COL) qC(H, _);
          break;
        case 4:
          if (q === IH.HTML) V71(H, _);
          else if (q === IH.BASE || q === IH.LINK || q === IH.META) AP(H, _);
          else if (q === IH.BODY) S71(H, _);
          else if (q === IH.MAIN || q === IH.MENU) Sn(H, _);
          else if (q === IH.FORM) b71(H, _);
          else if (q === IH.CODE || q === IH.FONT) IZH(H, _);
          else if (q === IH.NOBR) p71(H, _);
          else if (q === IH.AREA) uZH(H, _);
          else if (q === IH.MATH) r71(H, _);
          else if (q === IH.MENU) n71(H, _);
          else if (q !== IH.HEAD) qC(H, _);
          break;
        case 5:
          if (q === IH.STYLE || q === IH.TITLE) AP(H, _);
          else if (q === IH.ASIDE) Sn(H, _);
          else if (q === IH.SMALL) IZH(H, _);
          else if (q === IH.TABLE) B71(H, _);
          else if (q === IH.EMBED) uZH(H, _);
          else if (q === IH.INPUT) g71(H, _);
          else if (q === IH.PARAM || q === IH.TRACK) AM7(H, _);
          else if (q === IH.IMAGE) c71(H, _);
          else if (q !== IH.FRAME && q !== IH.TBODY && q !== IH.TFOOT && q !== IH.THEAD) qC(H, _);
          break;
        case 6:
          if (q === IH.SCRIPT) AP(H, _);
          else if (
            q === IH.CENTER ||
            q === IH.FIGURE ||
            q === IH.FOOTER ||
            q === IH.HEADER ||
            q === IH.HGROUP ||
            q === IH.DIALOG
          )
            Sn(H, _);
          else if (q === IH.BUTTON) x71(H, _);
          else if (q === IH.STRIKE || q === IH.STRONG) IZH(H, _);
          else if (q === IH.APPLET || q === IH.OBJECT) zM7(H, _);
          else if (q === IH.KEYGEN) uZH(H, _);
          else if (q === IH.SOURCE) AM7(H, _);
          else if (q === IH.IFRAME) Q71(H, _);
          else if (q === IH.SELECT) l71(H, _);
          else if (q === IH.OPTION) wM7(H, _);
          else qC(H, _);
          break;
        case 7:
          if (q === IH.BGSOUND) AP(H, _);
          else if (q === IH.DETAILS || q === IH.ADDRESS || q === IH.ARTICLE || q === IH.SECTION || q === IH.SUMMARY)
            Sn(H, _);
          else if (q === IH.LISTING) TM7(H, _);
          else if (q === IH.MARQUEE) zM7(H, _);
          else if (q === IH.NOEMBED) fM7(H, _);
          else if (q !== IH.CAPTION) qC(H, _);
          break;
        case 8:
          if (q === IH.BASEFONT) AP(H, _);
          else if (q === IH.FRAMESET) E71(H, _);
          else if (q === IH.FIELDSET) Sn(H, _);
          else if (q === IH.TEXTAREA) F71(H, _);
          else if (q === IH.TEMPLATE) AP(H, _);
          else if (q === IH.NOSCRIPT)
            if (H.options.scriptingEnabled) fM7(H, _);
            else qC(H, _);
          else if (q === IH.OPTGROUP) wM7(H, _);
          else if (q !== IH.COLGROUP) qC(H, _);
          break;
        case 9:
          if (q === IH.PLAINTEXT) u71(H, _);
          else qC(H, _);
          break;
        case 10:
          if (q === IH.BLOCKQUOTE || q === IH.FIGCAPTION) Sn(H, _);
          else qC(H, _);
          break;
        default:
          qC(H, _);
      }
    }
    function a71(H) {
      if (H.openElements.hasInScope(IH.BODY)) H.insertionMode = "AFTER_BODY_MODE";
    }
    function s71(H, _) {
      if (H.openElements.hasInScope(IH.BODY)) (H.insertionMode = "AFTER_BODY_MODE"), H._processToken(_);
    }
    function D8H(H, _) {
      let q = _.tagName;
      if (H.openElements.hasInScope(q))
        H.openElements.generateImpliedEndTags(), H.openElements.popUntilTagNamePopped(q);
    }
    function t71(H) {
      let _ = H.openElements.tmplCount > 0,
        q = H.formElement;
      if (!_) H.formElement = null;
      if ((q || _) && H.openElements.hasInScope(IH.FORM))
        if ((H.openElements.generateImpliedEndTags(), _)) H.openElements.popUntilTagNamePopped(IH.FORM);
        else H.openElements.remove(q);
    }
    function e71(H) {
      if (!H.openElements.hasInButtonScope(IH.P)) H._insertFakeElement(IH.P);
      H._closePElement();
    }
    function H91(H) {
      if (H.openElements.hasInListItemScope(IH.LI))
        H.openElements.generateImpliedEndTagsWithExclusion(IH.LI), H.openElements.popUntilTagNamePopped(IH.LI);
    }
    function _91(H, _) {
      let q = _.tagName;
      if (H.openElements.hasInScope(q))
        H.openElements.generateImpliedEndTagsWithExclusion(q), H.openElements.popUntilTagNamePopped(q);
    }
    function q91(H) {
      if (H.openElements.hasNumberedHeaderInScope())
        H.openElements.generateImpliedEndTags(), H.openElements.popUntilNumberedHeaderPopped();
    }
    function DM7(H, _) {
      let q = _.tagName;
      if (H.openElements.hasInScope(q))
        H.openElements.generateImpliedEndTags(),
          H.openElements.popUntilTagNamePopped(q),
          H.activeFormattingElements.clearToLastMarker();
    }
    function $91(H) {
      H._reconstructActiveFormattingElements(), H._insertFakeElement(IH.BR), H.openElements.pop(), (H.framesetOk = !1);
    }
    function Wx(H, _) {
      let q = _.tagName;
      for (let $ = H.openElements.stackTop; $ > 0; $--) {
        let K = H.openElements.items[$];
        if (H.treeAdapter.getTagName(K) === q) {
          H.openElements.generateImpliedEndTagsWithExclusion(q), H.openElements.popUntilElementPopped(K);
          break;
        }
        if (H._isSpecialElement(K)) break;
      }
    }
    function Iu6(H, _) {
      let q = _.tagName;
      switch (q.length) {
        case 1:
          if (q === IH.A || q === IH.B || q === IH.I || q === IH.S || q === IH.U) j8H(H, _);
          else if (q === IH.P) e71(H, _);
          else Wx(H, _);
          break;
        case 2:
          if (q === IH.DL || q === IH.UL || q === IH.OL) D8H(H, _);
          else if (q === IH.LI) H91(H, _);
          else if (q === IH.DD || q === IH.DT) _91(H, _);
          else if (q === IH.H1 || q === IH.H2 || q === IH.H3 || q === IH.H4 || q === IH.H5 || q === IH.H6) q91(H, _);
          else if (q === IH.BR) $91(H, _);
          else if (q === IH.EM || q === IH.TT) j8H(H, _);
          else Wx(H, _);
          break;
        case 3:
          if (q === IH.BIG) j8H(H, _);
          else if (q === IH.DIR || q === IH.DIV || q === IH.NAV || q === IH.PRE) D8H(H, _);
          else Wx(H, _);
          break;
        case 4:
          if (q === IH.BODY) a71(H, _);
          else if (q === IH.HTML) s71(H, _);
          else if (q === IH.FORM) t71(H, _);
          else if (q === IH.CODE || q === IH.FONT || q === IH.NOBR) j8H(H, _);
          else if (q === IH.MAIN || q === IH.MENU) D8H(H, _);
          else Wx(H, _);
          break;
        case 5:
          if (q === IH.ASIDE) D8H(H, _);
          else if (q === IH.SMALL) j8H(H, _);
          else Wx(H, _);
          break;
        case 6:
          if (
            q === IH.CENTER ||
            q === IH.FIGURE ||
            q === IH.FOOTER ||
            q === IH.HEADER ||
            q === IH.HGROUP ||
            q === IH.DIALOG
          )
            D8H(H, _);
          else if (q === IH.APPLET || q === IH.OBJECT) DM7(H, _);
          else if (q === IH.STRIKE || q === IH.STRONG) j8H(H, _);
          else Wx(H, _);
          break;
        case 7:
          if (
            q === IH.ADDRESS ||
            q === IH.ARTICLE ||
            q === IH.DETAILS ||
            q === IH.SECTION ||
            q === IH.SUMMARY ||
            q === IH.LISTING
          )
            D8H(H, _);
          else if (q === IH.MARQUEE) DM7(H, _);
          else Wx(H, _);
          break;
        case 8:
          if (q === IH.FIELDSET) D8H(H, _);
          else if (q === IH.TEMPLATE) pTH(H, _);
          else Wx(H, _);
          break;
        case 10:
          if (q === IH.BLOCKQUOTE || q === IH.FIGCAPTION) D8H(H, _);
          else Wx(H, _);
          break;
        default:
          Wx(H, _);
      }
    }
    function En(H, _) {
      if (H.tmplInsertionModeStackTop > -1) XM7(H, _);
      else H.stopped = !0;
    }
    function K91(H, _) {
      if (_.tagName === IH.SCRIPT) H.pendingScript = H.openElements.current;
      H.openElements.pop(), (H.insertionMode = H.originalInsertionMode);
    }
    function O91(H, _) {
      H._err(HW.eofInElementThatCanContainOnlyText),
        H.openElements.pop(),
        (H.insertionMode = H.originalInsertionMode),
        H._processToken(_);
    }
    function Cn(H, _) {
      let q = H.openElements.currentTagName;
      if (q === IH.TABLE || q === IH.TBODY || q === IH.TFOOT || q === IH.THEAD || q === IH.TR)
        (H.pendingCharacterTokens = []),
          (H.hasNonWhitespacePendingCharacterToken = !1),
          (H.originalInsertionMode = H.insertionMode),
          (H.insertionMode = "IN_TABLE_TEXT_MODE"),
          H._processToken(_);
      else $C(H, _);
    }
    function T91(H, _) {
      H.openElements.clearBackToTableContext(),
        H.activeFormattingElements.insertMarker(),
        H._insertElement(_, H9.HTML),
        (H.insertionMode = "IN_CAPTION_MODE");
    }
    function z91(H, _) {
      H.openElements.clearBackToTableContext(),
        H._insertElement(_, H9.HTML),
        (H.insertionMode = "IN_COLUMN_GROUP_MODE");
    }
    function A91(H, _) {
      H.openElements.clearBackToTableContext(),
        H._insertFakeElement(IH.COLGROUP),
        (H.insertionMode = "IN_COLUMN_GROUP_MODE"),
        H._processToken(_);
    }
    function f91(H, _) {
      H.openElements.clearBackToTableContext(), H._insertElement(_, H9.HTML), (H.insertionMode = "IN_TABLE_BODY_MODE");
    }
    function w91(H, _) {
      H.openElements.clearBackToTableContext(),
        H._insertFakeElement(IH.TBODY),
        (H.insertionMode = "IN_TABLE_BODY_MODE"),
        H._processToken(_);
    }
    function Y91(H, _) {
      if (H.openElements.hasInTableScope(IH.TABLE))
        H.openElements.popUntilTagNamePopped(IH.TABLE), H._resetInsertionMode(), H._processToken(_);
    }
    function D91(H, _) {
      let q = p_.getTokenAttr(_, jM7.TYPE);
      if (q && q.toLowerCase() === "hidden") H._appendElement(_, H9.HTML);
      else $C(H, _);
      _.ackSelfClosing = !0;
    }
    function j91(H, _) {
      if (!H.formElement && H.openElements.tmplCount === 0)
        H._insertElement(_, H9.HTML), (H.formElement = H.openElements.current), H.openElements.pop();
    }
    function uu6(H, _) {
      let q = _.tagName;
      switch (q.length) {
        case 2:
          if (q === IH.TD || q === IH.TH || q === IH.TR) w91(H, _);
          else $C(H, _);
          break;
        case 3:
          if (q === IH.COL) A91(H, _);
          else $C(H, _);
          break;
        case 4:
          if (q === IH.FORM) j91(H, _);
          else $C(H, _);
          break;
        case 5:
          if (q === IH.TABLE) Y91(H, _);
          else if (q === IH.STYLE) AP(H, _);
          else if (q === IH.TBODY || q === IH.TFOOT || q === IH.THEAD) f91(H, _);
          else if (q === IH.INPUT) D91(H, _);
          else $C(H, _);
          break;
        case 6:
          if (q === IH.SCRIPT) AP(H, _);
          else $C(H, _);
          break;
        case 7:
          if (q === IH.CAPTION) T91(H, _);
          else $C(H, _);
          break;
        case 8:
          if (q === IH.COLGROUP) z91(H, _);
          else if (q === IH.TEMPLATE) AP(H, _);
          else $C(H, _);
          break;
        default:
          $C(H, _);
      }
    }
    function xu6(H, _) {
      let q = _.tagName;
      if (q === IH.TABLE) {
        if (H.openElements.hasInTableScope(IH.TABLE))
          H.openElements.popUntilTagNamePopped(IH.TABLE), H._resetInsertionMode();
      } else if (q === IH.TEMPLATE) pTH(H, _);
      else if (
        q !== IH.BODY &&
        q !== IH.CAPTION &&
        q !== IH.COL &&
        q !== IH.COLGROUP &&
        q !== IH.HTML &&
        q !== IH.TBODY &&
        q !== IH.TD &&
        q !== IH.TFOOT &&
        q !== IH.TH &&
        q !== IH.THEAD &&
        q !== IH.TR
      )
        $C(H, _);
    }
    function $C(H, _) {
      let q = H.fosterParentingEnabled;
      (H.fosterParentingEnabled = !0), H._processTokenInBodyMode(_), (H.fosterParentingEnabled = q);
    }
    function M91(H, _) {
      H.pendingCharacterTokens.push(_);
    }
    function J91(H, _) {
      H.pendingCharacterTokens.push(_), (H.hasNonWhitespacePendingCharacterToken = !0);
    }
    function aiH(H, _) {
      let q = 0;
      if (H.hasNonWhitespacePendingCharacterToken)
        for (; q < H.pendingCharacterTokens.length; q++) $C(H, H.pendingCharacterTokens[q]);
      else for (; q < H.pendingCharacterTokens.length; q++) H._insertCharacters(H.pendingCharacterTokens[q]);
      (H.insertionMode = H.originalInsertionMode), H._processToken(_);
    }
    function P91(H, _) {
      let q = _.tagName;
      if (
        q === IH.CAPTION ||
        q === IH.COL ||
        q === IH.COLGROUP ||
        q === IH.TBODY ||
        q === IH.TD ||
        q === IH.TFOOT ||
        q === IH.TH ||
        q === IH.THEAD ||
        q === IH.TR
      ) {
        if (H.openElements.hasInTableScope(IH.CAPTION))
          H.openElements.generateImpliedEndTags(),
            H.openElements.popUntilTagNamePopped(IH.CAPTION),
            H.activeFormattingElements.clearToLastMarker(),
            (H.insertionMode = "IN_TABLE_MODE"),
            H._processToken(_);
      } else Ov(H, _);
    }
    function X91(H, _) {
      let q = _.tagName;
      if (q === IH.CAPTION || q === IH.TABLE) {
        if (H.openElements.hasInTableScope(IH.CAPTION)) {
          if (
            (H.openElements.generateImpliedEndTags(),
            H.openElements.popUntilTagNamePopped(IH.CAPTION),
            H.activeFormattingElements.clearToLastMarker(),
            (H.insertionMode = "IN_TABLE_MODE"),
            q === IH.TABLE)
          )
            H._processToken(_);
        }
      } else if (
        q !== IH.BODY &&
        q !== IH.COL &&
        q !== IH.COLGROUP &&
        q !== IH.HTML &&
        q !== IH.TBODY &&
        q !== IH.TD &&
        q !== IH.TFOOT &&
        q !== IH.TH &&
        q !== IH.THEAD &&
        q !== IH.TR
      )
        Iu6(H, _);
    }
    function W91(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.COL) H._appendElement(_, H9.HTML), (_.ackSelfClosing = !0);
      else if (q === IH.TEMPLATE) AP(H, _);
      else pN_(H, _);
    }
    function G91(H, _) {
      let q = _.tagName;
      if (q === IH.COLGROUP) {
        if (H.openElements.currentTagName === IH.COLGROUP) H.openElements.pop(), (H.insertionMode = "IN_TABLE_MODE");
      } else if (q === IH.TEMPLATE) pTH(H, _);
      else if (q !== IH.COL) pN_(H, _);
    }
    function pN_(H, _) {
      if (H.openElements.currentTagName === IH.COLGROUP)
        H.openElements.pop(), (H.insertionMode = "IN_TABLE_MODE"), H._processToken(_);
    }
    function R91(H, _) {
      let q = _.tagName;
      if (q === IH.TR)
        H.openElements.clearBackToTableBodyContext(), H._insertElement(_, H9.HTML), (H.insertionMode = "IN_ROW_MODE");
      else if (q === IH.TH || q === IH.TD)
        H.openElements.clearBackToTableBodyContext(),
          H._insertFakeElement(IH.TR),
          (H.insertionMode = "IN_ROW_MODE"),
          H._processToken(_);
      else if (
        q === IH.CAPTION ||
        q === IH.COL ||
        q === IH.COLGROUP ||
        q === IH.TBODY ||
        q === IH.TFOOT ||
        q === IH.THEAD
      ) {
        if (H.openElements.hasTableBodyContextInTableScope())
          H.openElements.clearBackToTableBodyContext(),
            H.openElements.pop(),
            (H.insertionMode = "IN_TABLE_MODE"),
            H._processToken(_);
      } else uu6(H, _);
    }
    function Z91(H, _) {
      let q = _.tagName;
      if (q === IH.TBODY || q === IH.TFOOT || q === IH.THEAD) {
        if (H.openElements.hasInTableScope(q))
          H.openElements.clearBackToTableBodyContext(), H.openElements.pop(), (H.insertionMode = "IN_TABLE_MODE");
      } else if (q === IH.TABLE) {
        if (H.openElements.hasTableBodyContextInTableScope())
          H.openElements.clearBackToTableBodyContext(),
            H.openElements.pop(),
            (H.insertionMode = "IN_TABLE_MODE"),
            H._processToken(_);
      } else if (
        (q !== IH.BODY && q !== IH.CAPTION && q !== IH.COL && q !== IH.COLGROUP) ||
        (q !== IH.HTML && q !== IH.TD && q !== IH.TH && q !== IH.TR)
      )
        xu6(H, _);
    }
    function L91(H, _) {
      let q = _.tagName;
      if (q === IH.TH || q === IH.TD)
        H.openElements.clearBackToTableRowContext(),
          H._insertElement(_, H9.HTML),
          (H.insertionMode = "IN_CELL_MODE"),
          H.activeFormattingElements.insertMarker();
      else if (
        q === IH.CAPTION ||
        q === IH.COL ||
        q === IH.COLGROUP ||
        q === IH.TBODY ||
        q === IH.TFOOT ||
        q === IH.THEAD ||
        q === IH.TR
      ) {
        if (H.openElements.hasInTableScope(IH.TR))
          H.openElements.clearBackToTableRowContext(),
            H.openElements.pop(),
            (H.insertionMode = "IN_TABLE_BODY_MODE"),
            H._processToken(_);
      } else uu6(H, _);
    }
    function k91(H, _) {
      let q = _.tagName;
      if (q === IH.TR) {
        if (H.openElements.hasInTableScope(IH.TR))
          H.openElements.clearBackToTableRowContext(), H.openElements.pop(), (H.insertionMode = "IN_TABLE_BODY_MODE");
      } else if (q === IH.TABLE) {
        if (H.openElements.hasInTableScope(IH.TR))
          H.openElements.clearBackToTableRowContext(),
            H.openElements.pop(),
            (H.insertionMode = "IN_TABLE_BODY_MODE"),
            H._processToken(_);
      } else if (q === IH.TBODY || q === IH.TFOOT || q === IH.THEAD) {
        if (H.openElements.hasInTableScope(q) || H.openElements.hasInTableScope(IH.TR))
          H.openElements.clearBackToTableRowContext(),
            H.openElements.pop(),
            (H.insertionMode = "IN_TABLE_BODY_MODE"),
            H._processToken(_);
      } else if (
        (q !== IH.BODY && q !== IH.CAPTION && q !== IH.COL && q !== IH.COLGROUP) ||
        (q !== IH.HTML && q !== IH.TD && q !== IH.TH)
      )
        xu6(H, _);
    }
    function v91(H, _) {
      let q = _.tagName;
      if (
        q === IH.CAPTION ||
        q === IH.COL ||
        q === IH.COLGROUP ||
        q === IH.TBODY ||
        q === IH.TD ||
        q === IH.TFOOT ||
        q === IH.TH ||
        q === IH.THEAD ||
        q === IH.TR
      ) {
        if (H.openElements.hasInTableScope(IH.TD) || H.openElements.hasInTableScope(IH.TH))
          H._closeTableCell(), H._processToken(_);
      } else Ov(H, _);
    }
    function N91(H, _) {
      let q = _.tagName;
      if (q === IH.TD || q === IH.TH) {
        if (H.openElements.hasInTableScope(q))
          H.openElements.generateImpliedEndTags(),
            H.openElements.popUntilTagNamePopped(q),
            H.activeFormattingElements.clearToLastMarker(),
            (H.insertionMode = "IN_ROW_MODE");
      } else if (q === IH.TABLE || q === IH.TBODY || q === IH.TFOOT || q === IH.THEAD || q === IH.TR) {
        if (H.openElements.hasInTableScope(q)) H._closeTableCell(), H._processToken(_);
      } else if (q !== IH.BODY && q !== IH.CAPTION && q !== IH.COL && q !== IH.COLGROUP && q !== IH.HTML) Iu6(H, _);
    }
    function JM7(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.OPTION) {
        if (H.openElements.currentTagName === IH.OPTION) H.openElements.pop();
        H._insertElement(_, H9.HTML);
      } else if (q === IH.OPTGROUP) {
        if (H.openElements.currentTagName === IH.OPTION) H.openElements.pop();
        if (H.openElements.currentTagName === IH.OPTGROUP) H.openElements.pop();
        H._insertElement(_, H9.HTML);
      } else if (q === IH.INPUT || q === IH.KEYGEN || q === IH.TEXTAREA || q === IH.SELECT) {
        if (H.openElements.hasInSelectScope(IH.SELECT)) {
          if ((H.openElements.popUntilTagNamePopped(IH.SELECT), H._resetInsertionMode(), q !== IH.SELECT))
            H._processToken(_);
        }
      } else if (q === IH.SCRIPT || q === IH.TEMPLATE) AP(H, _);
    }
    function PM7(H, _) {
      let q = _.tagName;
      if (q === IH.OPTGROUP) {
        let $ = H.openElements.items[H.openElements.stackTop - 1],
          K = $ && H.treeAdapter.getTagName($);
        if (H.openElements.currentTagName === IH.OPTION && K === IH.OPTGROUP) H.openElements.pop();
        if (H.openElements.currentTagName === IH.OPTGROUP) H.openElements.pop();
      } else if (q === IH.OPTION) {
        if (H.openElements.currentTagName === IH.OPTION) H.openElements.pop();
      } else if (q === IH.SELECT && H.openElements.hasInSelectScope(IH.SELECT))
        H.openElements.popUntilTagNamePopped(IH.SELECT), H._resetInsertionMode();
      else if (q === IH.TEMPLATE) pTH(H, _);
    }
    function h91(H, _) {
      let q = _.tagName;
      if (
        q === IH.CAPTION ||
        q === IH.TABLE ||
        q === IH.TBODY ||
        q === IH.TFOOT ||
        q === IH.THEAD ||
        q === IH.TR ||
        q === IH.TD ||
        q === IH.TH
      )
        H.openElements.popUntilTagNamePopped(IH.SELECT), H._resetInsertionMode(), H._processToken(_);
      else JM7(H, _);
    }
    function y91(H, _) {
      let q = _.tagName;
      if (
        q === IH.CAPTION ||
        q === IH.TABLE ||
        q === IH.TBODY ||
        q === IH.TFOOT ||
        q === IH.THEAD ||
        q === IH.TR ||
        q === IH.TD ||
        q === IH.TH
      ) {
        if (H.openElements.hasInTableScope(q))
          H.openElements.popUntilTagNamePopped(IH.SELECT), H._resetInsertionMode(), H._processToken(_);
      } else PM7(H, _);
    }
    function V91(H, _) {
      let q = _.tagName;
      if (
        q === IH.BASE ||
        q === IH.BASEFONT ||
        q === IH.BGSOUND ||
        q === IH.LINK ||
        q === IH.META ||
        q === IH.NOFRAMES ||
        q === IH.SCRIPT ||
        q === IH.STYLE ||
        q === IH.TEMPLATE ||
        q === IH.TITLE
      )
        AP(H, _);
      else {
        let $ = Y71[q] || "IN_BODY_MODE";
        H._popTmplInsertionMode(), H._pushTmplInsertionMode($), (H.insertionMode = $), H._processToken(_);
      }
    }
    function S91(H, _) {
      if (_.tagName === IH.TEMPLATE) pTH(H, _);
    }
    function XM7(H, _) {
      if (H.openElements.tmplCount > 0)
        H.openElements.popUntilTagNamePopped(IH.TEMPLATE),
          H.activeFormattingElements.clearToLastMarker(),
          H._popTmplInsertionMode(),
          H._resetInsertionMode(),
          H._processToken(_);
      else H.stopped = !0;
    }
    function E91(H, _) {
      if (_.tagName === IH.HTML) Ov(H, _);
      else BN_(H, _);
    }
    function C91(H, _) {
      if (_.tagName === IH.HTML) {
        if (!H.fragmentContext) H.insertionMode = "AFTER_AFTER_BODY_MODE";
      } else BN_(H, _);
    }
    function BN_(H, _) {
      (H.insertionMode = "IN_BODY_MODE"), H._processToken(_);
    }
    function b91(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.FRAMESET) H._insertElement(_, H9.HTML);
      else if (q === IH.FRAME) H._appendElement(_, H9.HTML), (_.ackSelfClosing = !0);
      else if (q === IH.NOFRAMES) AP(H, _);
    }
    function I91(H, _) {
      if (_.tagName === IH.FRAMESET && !H.openElements.isRootHtmlElementCurrent()) {
        if ((H.openElements.pop(), !H.fragmentContext && H.openElements.currentTagName !== IH.FRAMESET))
          H.insertionMode = "AFTER_FRAMESET_MODE";
      }
    }
    function u91(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.NOFRAMES) AP(H, _);
    }
    function x91(H, _) {
      if (_.tagName === IH.HTML) H.insertionMode = "AFTER_AFTER_FRAMESET_MODE";
    }
    function m91(H, _) {
      if (_.tagName === IH.HTML) Ov(H, _);
      else mN_(H, _);
    }
    function mN_(H, _) {
      (H.insertionMode = "IN_BODY_MODE"), H._processToken(_);
    }
    function p91(H, _) {
      let q = _.tagName;
      if (q === IH.HTML) Ov(H, _);
      else if (q === IH.NOFRAMES) AP(H, _);
    }
    function B91(H, _) {
      (_.chars = A71.REPLACEMENT_CHARACTER), H._insertCharacters(_);
    }
    function g91(H, _) {
      H._insertCharacters(_), (H.framesetOk = !1);
    }
    function d91(H, _) {
      if (hd.causesExit(_) && !H.fragmentContext) {
        while (
          H.treeAdapter.getNamespaceURI(H.openElements.current) !== H9.HTML &&
          !H._isIntegrationPoint(H.openElements.current)
        )
          H.openElements.pop();
        H._processToken(_);
      } else {
        let q = H._getAdjustedCurrentElement(),
          $ = H.treeAdapter.getNamespaceURI(q);
        if ($ === H9.MATHML) hd.adjustTokenMathMLAttrs(_);
        else if ($ === H9.SVG) hd.adjustTokenSVGTagName(_), hd.adjustTokenSVGAttrs(_);
        if ((hd.adjustTokenXMLAttrs(_), _.selfClosing)) H._appendElement(_, $);
        else H._insertElement(_, $);
        _.ackSelfClosing = !0;
      }
    }
    function c91(H, _) {
      for (let q = H.openElements.stackTop; q > 0; q--) {
        let $ = H.openElements.items[q];
        if (H.treeAdapter.getNamespaceURI($) === H9.HTML) {
          H._processToken(_);
          break;
        }
        if (H.treeAdapter.getTagName($).toLowerCase() === _.tagName) {
          H.openElements.popUntilElementPopped($);
          break;
        }
      }
    }
  });

  var OV6 = d((Caq) => {
    var rb4 = require("process"),
      haq = LZ_(),
      ob4 = $V6();
    function z6H(H, _) {
      for (let q = 0; q < H.length; ++q) if (H[q].type === _) return !0;
      return !1;
    }
    function yaq(H) {
      for (let _ = 0; _ < H.length; ++_)
        switch (H[_].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return _;
        }
      return -1;
    }
    function Saq(H) {
      switch (H?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return !0;
        default:
          return !1;
      }
    }
    function vZ_(H) {
      switch (H.type) {
        case "document":
          return H.start;
        case "block-map": {
          let _ = H.items[H.items.length - 1];
          return _.sep ?? _.start;
        }
        case "block-seq":
          return H.items[H.items.length - 1].start;
        default:
          return [];
      }
    }
    function hGH(H) {
      if (H.length === 0) return [];
      let _ = H.length;
      H: while (--_ >= 0)
        switch (H[_].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break H;
        }
      while (H[++_]?.type === "space");
      return H.splice(_, H.length);
    }
    function Vaq(H) {
      if (H.start.type === "flow-seq-start") {
        for (let _ of H.items)
          if (_.sep && !_.value && !z6H(_.start, "explicit-key-ind") && !z6H(_.sep, "map-value-ind")) {
            if (_.key) _.value = _.key;
            if ((delete _.key, Saq(_.value)))
              if (_.value.end) Array.prototype.push.apply(_.value.end, _.sep);
              else _.value.end = _.sep;
            else Array.prototype.push.apply(_.start, _.sep);
            delete _.sep;
          }
      }
    }
    class Eaq {
      constructor(H) {
        (this.atNewLine = !0),
          (this.atScalar = !1),
          (this.indent = 0),
          (this.offset = 0),
          (this.onKeyLine = !1),
          (this.stack = []),
          (this.source = ""),
          (this.type = ""),
          (this.lexer = new ob4.Lexer()),
          (this.onNewLine = H);
      }
      *parse(H, _ = !1) {
        if (this.onNewLine && this.offset === 0) this.onNewLine(0);
        for (let q of this.lexer.lex(H, _)) yield* this.next(q);
        if (!_) yield* this.end();
      }
      *next(H) {
        if (((this.source = H), rb4.env.LOG_TOKENS)) console.log("|", haq.prettyToken(H));
        if (this.atScalar) {
          (this.atScalar = !1), yield* this.step(), (this.offset += H.length);
          return;
        }
        let _ = haq.tokenType(H);
        if (!_) {
          let q = `Not a YAML token: ${H}`;
          yield* this.pop({ type: "error", offset: this.offset, message: q, source: H }), (this.offset += H.length);
        } else if (_ === "scalar") (this.atNewLine = !1), (this.atScalar = !0), (this.type = "scalar");
        else {
          switch (((this.type = _), yield* this.step(), _)) {
            case "newline":
              if (((this.atNewLine = !0), (this.indent = 0), this.onNewLine)) this.onNewLine(this.offset + H.length);
              break;
            case "space":
              if (this.atNewLine && H[0] === " ") this.indent += H.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine) this.indent += H.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = !1;
          }
          this.offset += H.length;
        }
      }
      *end() {
        while (this.stack.length > 0) yield* this.pop();
      }
      get sourceToken() {
        return { type: this.type, offset: this.offset, indent: this.indent, source: this.source };
      }
      *step() {
        let H = this.peek(1);
        if (this.type === "doc-end" && (!H || H.type !== "doc-end")) {
          while (this.stack.length > 0) yield* this.pop();
          this.stack.push({ type: "doc-end", offset: this.offset, source: this.source });
          return;
        }
        if (!H) return yield* this.stream();
        switch (H.type) {
          case "document":
            return yield* this.document(H);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(H);
          case "block-scalar":
            return yield* this.blockScalar(H);
          case "block-map":
            return yield* this.blockMap(H);
          case "block-seq":
            return yield* this.blockSequence(H);
          case "flow-collection":
            return yield* this.flowCollection(H);
          case "doc-end":
            return yield* this.documentEnd(H);
        }
        yield* this.pop();
      }
      peek(H) {
        return this.stack[this.stack.length - H];
      }
      *pop(H) {
        let _ = H ?? this.stack.pop();
        if (!_) yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
        else if (this.stack.length === 0) yield _;
        else {
          let q = this.peek(1);
          if (_.type === "block-scalar") _.indent = "indent" in q ? q.indent : 0;
          else if (_.type === "flow-collection" && q.type === "document") _.indent = 0;
          if (_.type === "flow-collection") Vaq(_);
          switch (q.type) {
            case "document":
              q.value = _;
              break;
            case "block-scalar":
              q.props.push(_);
              break;
            case "block-map": {
              let $ = q.items[q.items.length - 1];
              if ($.value) {
                q.items.push({ start: [], key: _, sep: [] }), (this.onKeyLine = !0);
                return;
              } else if ($.sep) $.value = _;
              else {
                Object.assign($, { key: _, sep: [] }), (this.onKeyLine = !$.explicitKey);
                return;
              }
              break;
            }
            case "block-seq": {
              let $ = q.items[q.items.length - 1];
              if ($.value) q.items.push({ start: [], value: _ });
              else $.value = _;
              break;
            }
            case "flow-collection": {
              let $ = q.items[q.items.length - 1];
              if (!$ || $.value) q.items.push({ start: [], key: _, sep: [] });
              else if ($.sep) $.value = _;
              else Object.assign($, { key: _, sep: [] });
              return;
            }
            default:
              yield* this.pop(), yield* this.pop(_);
          }
          if (
            (q.type === "document" || q.type === "block-map" || q.type === "block-seq") &&
            (_.type === "block-map" || _.type === "block-seq")
          ) {
            let $ = _.items[_.items.length - 1];
            if (
              $ &&
              !$.sep &&
              !$.value &&
              $.start.length > 0 &&
              yaq($.start) === -1 &&
              (_.indent === 0 || $.start.every((K) => K.type !== "comment" || K.indent < _.indent))
            ) {
              if (q.type === "document") q.end = $.start;
              else q.items.push({ start: $.start });
              _.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            let H = { type: "document", offset: this.offset, start: [] };
            if (this.type === "doc-start") H.start.push(this.sourceToken);
            this.stack.push(H);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source,
        };
      }
      *document(H) {
        if (H.value) return yield* this.lineEnd(H);
        switch (this.type) {
          case "doc-start": {
            if (yaq(H.start) !== -1) yield* this.pop(), yield* this.step();
            else H.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            H.start.push(this.sourceToken);
            return;
        }
        let _ = this.startBlockValue(H);
        if (_) this.stack.push(_);
        else
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source,
          };
      }
      *scalar(H) {
        if (this.type === "map-value-ind") {
          let _ = vZ_(this.peek(2)),
            q = hGH(_),
            $;
          if (H.end) ($ = H.end), $.push(this.sourceToken), delete H.end;
          else $ = [this.sourceToken];
          let K = { type: "block-map", offset: H.offset, indent: H.indent, items: [{ start: q, key: H, sep: $ }] };
          (this.onKeyLine = !0), (this.stack[this.stack.length - 1] = K);
        } else yield* this.lineEnd(H);
      }
      *blockScalar(H) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            H.props.push(this.sourceToken);
            return;
          case "scalar":
            if (((H.source = this.source), (this.atNewLine = !0), (this.indent = 0), this.onNewLine)) {
              let _ =
                this.source.indexOf(`
`) + 1;
              while (_ !== 0)
                this.onNewLine(this.offset + _),
                  (_ =
                    this.source.indexOf(
                      `
`,
                      _,
                    ) + 1);
            }
            yield* this.pop();
            break;
          default:
            yield* this.pop(), yield* this.step();
        }
      }
      *blockMap(H) {
        let _ = H.items[H.items.length - 1];
        switch (this.type) {
          case "newline":
            if (((this.onKeyLine = !1), _.value)) {
              let q = "end" in _.value ? _.value.end : void 0;
              if ((Array.isArray(q) ? q[q.length - 1] : void 0)?.type === "comment") q?.push(this.sourceToken);
              else H.items.push({ start: [this.sourceToken] });
            } else if (_.sep) _.sep.push(this.sourceToken);
            else _.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (_.value) H.items.push({ start: [this.sourceToken] });
            else if (_.sep) _.sep.push(this.sourceToken);
            else {
              if (this.atIndentedComment(_.start, H.indent)) {
                let $ = H.items[H.items.length - 2]?.value?.end;
                if (Array.isArray($)) {
                  Array.prototype.push.apply($, _.start), $.push(this.sourceToken), H.items.pop();
                  return;
                }
              }
              _.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= H.indent) {
          let q = !this.onKeyLine && this.indent === H.indent,
            $ = q && (_.sep || _.explicitKey) && this.type !== "seq-item-ind",
            K = [];
          if ($ && _.sep && !_.value) {
            let O = [];
            for (let T = 0; T < _.sep.length; ++T) {
              let z = _.sep[T];
              switch (z.type) {
                case "newline":
                  O.push(T);
                  break;
                case "space":
                  break;
                case "comment":
                  if (z.indent > H.indent) O.length = 0;
                  break;
                default:
                  O.length = 0;
              }
            }
            if (O.length >= 2) K = _.sep.splice(O[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if ($ || _.value) K.push(this.sourceToken), H.items.push({ start: K }), (this.onKeyLine = !0);
              else if (_.sep) _.sep.push(this.sourceToken);
              else _.start.push(this.sourceToken);
              return;
            case "explicit-key-ind":
              if (!_.sep && !_.explicitKey) _.start.push(this.sourceToken), (_.explicitKey = !0);
              else if ($ || _.value) K.push(this.sourceToken), H.items.push({ start: K, explicitKey: !0 });
              else
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: !0 }],
                });
              this.onKeyLine = !0;
              return;
            case "map-value-ind":
              if (_.explicitKey)
                if (!_.sep)
                  if (z6H(_.start, "newline")) Object.assign(_, { key: null, sep: [this.sourceToken] });
                  else {
                    let O = hGH(_.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: O, key: null, sep: [this.sourceToken] }],
                    });
                  }
                else if (_.value) H.items.push({ start: [], key: null, sep: [this.sourceToken] });
                else if (z6H(_.sep, "map-value-ind"))
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: K, key: null, sep: [this.sourceToken] }],
                  });
                else if (Saq(_.key) && !z6H(_.sep, "newline")) {
                  let O = hGH(_.start),
                    T = _.key,
                    z = _.sep;
                  z.push(this.sourceToken),
                    delete _.key,
                    delete _.sep,
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: O, key: T, sep: z }],
                    });
                } else if (K.length > 0) _.sep = _.sep.concat(K, this.sourceToken);
                else _.sep.push(this.sourceToken);
              else if (!_.sep) Object.assign(_, { key: null, sep: [this.sourceToken] });
              else if (_.value || $) H.items.push({ start: K, key: null, sep: [this.sourceToken] });
              else if (z6H(_.sep, "map-value-ind"))
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }],
                });
              else _.sep.push(this.sourceToken);
              this.onKeyLine = !0;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              let O = this.flowScalar(this.type);
              if ($ || _.value) H.items.push({ start: K, key: O, sep: [] }), (this.onKeyLine = !0);
              else if (_.sep) this.stack.push(O);
              else Object.assign(_, { key: O, sep: [] }), (this.onKeyLine = !0);
              return;
            }
            default: {
              let O = this.startBlockValue(H);
              if (O) {
                if (O.type === "block-seq") {
                  if (!_.explicitKey && _.sep && !z6H(_.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source,
                    });
                    return;
                  }
                } else if (q) H.items.push({ start: K });
                this.stack.push(O);
                return;
              }
            }
          }
        }
        yield* this.pop(), yield* this.step();
      }
      *blockSequence(H) {
        let _ = H.items[H.items.length - 1];
        switch (this.type) {
          case "newline":
            if (_.value) {
              let q = "end" in _.value ? _.value.end : void 0;
              if ((Array.isArray(q) ? q[q.length - 1] : void 0)?.type === "comment") q?.push(this.sourceToken);
              else H.items.push({ start: [this.sourceToken] });
            } else _.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (_.value) H.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(_.start, H.indent)) {
                let $ = H.items[H.items.length - 2]?.value?.end;
                if (Array.isArray($)) {
                  Array.prototype.push.apply($, _.start), $.push(this.sourceToken), H.items.pop();
                  return;
                }
              }
              _.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (_.value || this.indent <= H.indent) break;
            _.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== H.indent) break;
            if (_.value || z6H(_.start, "seq-item-ind")) H.items.push({ start: [this.sourceToken] });
            else _.start.push(this.sourceToken);
            return;
        }
        if (this.indent > H.indent) {
          let q = this.startBlockValue(H);
          if (q) {
            this.stack.push(q);
            return;
          }
        }
        yield* this.pop(), yield* this.step();
      }
      *flowCollection(H) {
        let _ = H.items[H.items.length - 1];
        if (this.type === "flow-error-end") {
          let q;
          do yield* this.pop(), (q = this.peek(1));
          while (q && q.type === "flow-collection");
        } else if (H.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!_ || _.sep) H.items.push({ start: [this.sourceToken] });
              else _.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!_ || _.value) H.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (_.sep) _.sep.push(this.sourceToken);
              else Object.assign(_, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!_ || _.value) H.items.push({ start: [this.sourceToken] });
              else if (_.sep) _.sep.push(this.sourceToken);
              else _.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              let $ = this.flowScalar(this.type);
              if (!_ || _.value) H.items.push({ start: [], key: $, sep: [] });
              else if (_.sep) this.stack.push($);
              else Object.assign(_, { key: $, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              H.end.push(this.sourceToken);
              return;
          }
          let q = this.startBlockValue(H);
          if (q) this.stack.push(q);
          else yield* this.pop(), yield* this.step();
        } else {
          let q = this.peek(2);
          if (
            q.type === "block-map" &&
            ((this.type === "map-value-ind" && q.indent === H.indent) ||
              (this.type === "newline" && !q.items[q.items.length - 1].sep))
          )
            yield* this.pop(), yield* this.step();
          else if (this.type === "map-value-ind" && q.type !== "flow-collection") {
            let $ = vZ_(q),
              K = hGH($);
            Vaq(H);
            let O = H.end.splice(1, H.end.length);
            O.push(this.sourceToken);
            let T = { type: "block-map", offset: H.offset, indent: H.indent, items: [{ start: K, key: H, sep: O }] };
            (this.onKeyLine = !0), (this.stack[this.stack.length - 1] = T);
          } else yield* this.lineEnd(H);
        }
      }
      flowScalar(H) {
        if (this.onNewLine) {
          let _ =
            this.source.indexOf(`
`) + 1;
          while (_ !== 0)
            this.onNewLine(this.offset + _),
              (_ =
                this.source.indexOf(
                  `
`,
                  _,
                ) + 1);
        }
        return { type: H, offset: this.offset, indent: this.indent, source: this.source };
      }
      startBlockValue(H) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: "",
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: [],
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }],
            };
          case "explicit-key-ind": {
            this.onKeyLine = !0;
            let _ = vZ_(H),
              q = hGH(_);
            return (
              q.push(this.sourceToken),
              { type: "block-map", offset: this.offset, indent: this.indent, items: [{ start: q, explicitKey: !0 }] }
            );
          }
          case "map-value-ind": {
            this.onKeyLine = !0;
            let _ = vZ_(H),
              q = hGH(_);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: q, key: null, sep: [this.sourceToken] }],
            };
          }
        }
        return null;
      }
      atIndentedComment(H, _) {
        if (this.type !== "comment") return !1;
        if (this.indent <= _) return !1;
        return H.every((q) => q.type === "newline" || q.type === "space");
      }
      *documentEnd(H) {
        if (this.type !== "doc-mode") {
          if (H.end) H.end.push(this.sourceToken);
          else H.end = [this.sourceToken];
          if (this.type === "newline") yield* this.pop();
        }
      }
      *lineEnd(H) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop(), yield* this.step();
            break;
          case "newline":
            this.onKeyLine = !1;
          case "space":
          case "comment":
          default:
            if (H.end) H.end.push(this.sourceToken);
            else H.end = [this.sourceToken];
            if (this.type === "newline") yield* this.pop();
        }
      }
    }
    Caq.Parser = Eaq;
  });

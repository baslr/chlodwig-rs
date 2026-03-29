  var $V6 = d((kaq) => {
    var XQH = LZ_();
    function ru(H) {
      switch (H) {
        case void 0:
        case " ":
        case `
`:
        case "\r":
        case "\t":
          return !0;
        default:
          return !1;
      }
    }
    var Zaq = new Set("0123456789ABCDEFabcdef"),
      ib4 = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),
      kZ_ = new Set(",[]{}"),
      nb4 = new Set(` ,[]{}
\r	`),
      qV6 = (H) => !H || nb4.has(H);
    class Laq {
      constructor() {
        (this.atEnd = !1),
          (this.blockScalarIndent = -1),
          (this.blockScalarKeep = !1),
          (this.buffer = ""),
          (this.flowKey = !1),
          (this.flowLevel = 0),
          (this.indentNext = 0),
          (this.indentValue = 0),
          (this.lineEndPos = null),
          (this.next = null),
          (this.pos = 0);
      }
      *lex(H, _ = !1) {
        if (H) {
          if (typeof H !== "string") throw TypeError("source is not a string");
          (this.buffer = this.buffer ? this.buffer + H : H), (this.lineEndPos = null);
        }
        this.atEnd = !_;
        let q = this.next ?? "stream";
        while (q && (_ || this.hasChars(1))) q = yield* this.parseNext(q);
      }
      atLineEnd() {
        let H = this.pos,
          _ = this.buffer[H];
        while (_ === " " || _ === "\t") _ = this.buffer[++H];
        if (
          !_ ||
          _ === "#" ||
          _ ===
            `
`
        )
          return !0;
        if (_ === "\r")
          return (
            this.buffer[H + 1] ===
            `
`
          );
        return !1;
      }
      charAt(H) {
        return this.buffer[this.pos + H];
      }
      continueScalar(H) {
        let _ = this.buffer[H];
        if (this.indentNext > 0) {
          let q = 0;
          while (_ === " ") _ = this.buffer[++q + H];
          if (_ === "\r") {
            let $ = this.buffer[q + H + 1];
            if (
              $ ===
                `
` ||
              (!$ && !this.atEnd)
            )
              return H + q + 1;
          }
          return _ ===
            `
` ||
            q >= this.indentNext ||
            (!_ && !this.atEnd)
            ? H + q
            : -1;
        }
        if (_ === "-" || _ === ".") {
          let q = this.buffer.substr(H, 3);
          if ((q === "---" || q === "...") && ru(this.buffer[H + 3])) return -1;
        }
        return H;
      }
      getLine() {
        let H = this.lineEndPos;
        if (typeof H !== "number" || (H !== -1 && H < this.pos))
          (H = this.buffer.indexOf(
            `
`,
            this.pos,
          )),
            (this.lineEndPos = H);
        if (H === -1) return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[H - 1] === "\r") H -= 1;
        return this.buffer.substring(this.pos, H);
      }
      hasChars(H) {
        return this.pos + H <= this.buffer.length;
      }
      setNext(H) {
        return (
          (this.buffer = this.buffer.substring(this.pos)),
          (this.pos = 0),
          (this.lineEndPos = null),
          (this.next = H),
          null
        );
      }
      peek(H) {
        return this.buffer.substr(this.pos, H);
      }
      *parseNext(H) {
        switch (H) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let H = this.getLine();
        if (H === null) return this.setNext("stream");
        if (H[0] === XQH.BOM) yield* this.pushCount(1), (H = H.substring(1));
        if (H[0] === "%") {
          let _ = H.length,
            q = H.indexOf("#");
          while (q !== -1) {
            let K = H[q - 1];
            if (K === " " || K === "\t") {
              _ = q - 1;
              break;
            } else q = H.indexOf("#", q + 1);
          }
          while (!0) {
            let K = H[_ - 1];
            if (K === " " || K === "\t") _ -= 1;
            else break;
          }
          let $ = (yield* this.pushCount(_)) + (yield* this.pushSpaces(!0));
          return yield* this.pushCount(H.length - $), this.pushNewline(), "stream";
        }
        if (this.atLineEnd()) {
          let _ = yield* this.pushSpaces(!0);
          return yield* this.pushCount(H.length - _), yield* this.pushNewline(), "stream";
        }
        return yield XQH.DOCUMENT, yield* this.parseLineStart();
      }
      *parseLineStart() {
        let H = this.charAt(0);
        if (!H && !this.atEnd) return this.setNext("line-start");
        if (H === "-" || H === ".") {
          if (!this.atEnd && !this.hasChars(4)) return this.setNext("line-start");
          let _ = this.peek(3);
          if ((_ === "---" || _ === "...") && ru(this.charAt(3)))
            return (
              yield* this.pushCount(3), (this.indentValue = 0), (this.indentNext = 0), _ === "---" ? "doc" : "stream"
            );
        }
        if (
          ((this.indentValue = yield* this.pushSpaces(!1)), this.indentNext > this.indentValue && !ru(this.charAt(1)))
        )
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        let [H, _] = this.peek(2);
        if (!_ && !this.atEnd) return this.setNext("block-start");
        if ((H === "-" || H === "?" || H === ":") && ru(_)) {
          let q = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
          return (this.indentNext = this.indentValue + 1), (this.indentValue += q), yield* this.parseBlockStart();
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(!0);
        let H = this.getLine();
        if (H === null) return this.setNext("doc");
        let _ = yield* this.pushIndicators();
        switch (H[_]) {
          case "#":
            yield* this.pushCount(H.length - _);
          case void 0:
            return yield* this.pushNewline(), yield* this.parseLineStart();
          case "{":
          case "[":
            return yield* this.pushCount(1), (this.flowKey = !1), (this.flowLevel = 1), "flow";
          case "}":
          case "]":
            return yield* this.pushCount(1), "doc";
          case "*":
            return yield* this.pushUntil(qV6), "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            return (
              (_ += yield* this.parseBlockScalarHeader()),
              (_ += yield* this.pushSpaces(!0)),
              yield* this.pushCount(H.length - _),
              yield* this.pushNewline(),
              yield* this.parseBlockScalar()
            );
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let H,
          _,
          q = -1;
        do {
          if (((H = yield* this.pushNewline()), H > 0)) (_ = yield* this.pushSpaces(!1)), (this.indentValue = q = _);
          else _ = 0;
          _ += yield* this.pushSpaces(!0);
        } while (H + _ > 0);
        let $ = this.getLine();
        if ($ === null) return this.setNext("flow");
        if (
          (q !== -1 && q < this.indentNext && $[0] !== "#") ||
          (q === 0 && ($.startsWith("---") || $.startsWith("...")) && ru($[3]))
        ) {
          if (!(q === this.indentNext - 1 && this.flowLevel === 1 && ($[0] === "]" || $[0] === "}")))
            return (this.flowLevel = 0), yield XQH.FLOW_END, yield* this.parseLineStart();
        }
        let K = 0;
        while ($[K] === ",") (K += yield* this.pushCount(1)), (K += yield* this.pushSpaces(!0)), (this.flowKey = !1);
        switch (((K += yield* this.pushIndicators()), $[K])) {
          case void 0:
            return "flow";
          case "#":
            return yield* this.pushCount($.length - K), "flow";
          case "{":
          case "[":
            return yield* this.pushCount(1), (this.flowKey = !1), (this.flowLevel += 1), "flow";
          case "}":
          case "]":
            return (
              yield* this.pushCount(1), (this.flowKey = !0), (this.flowLevel -= 1), this.flowLevel ? "flow" : "doc"
            );
          case "*":
            return yield* this.pushUntil(qV6), "flow";
          case '"':
          case "'":
            return (this.flowKey = !0), yield* this.parseQuotedScalar();
          case ":": {
            let O = this.charAt(1);
            if (this.flowKey || ru(O) || O === ",")
              return (this.flowKey = !1), yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
          }
          default:
            return (this.flowKey = !1), yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        let H = this.charAt(0),
          _ = this.buffer.indexOf(H, this.pos + 1);
        if (H === "'") while (_ !== -1 && this.buffer[_ + 1] === "'") _ = this.buffer.indexOf("'", _ + 2);
        else
          while (_ !== -1) {
            let K = 0;
            while (this.buffer[_ - 1 - K] === "\\") K += 1;
            if (K % 2 === 0) break;
            _ = this.buffer.indexOf('"', _ + 1);
          }
        let q = this.buffer.substring(0, _),
          $ = q.indexOf(
            `
`,
            this.pos,
          );
        if ($ !== -1) {
          while ($ !== -1) {
            let K = this.continueScalar($ + 1);
            if (K === -1) break;
            $ = q.indexOf(
              `
`,
              K,
            );
          }
          if ($ !== -1) _ = $ - (q[$ - 1] === "\r" ? 2 : 1);
        }
        if (_ === -1) {
          if (!this.atEnd) return this.setNext("quoted-scalar");
          _ = this.buffer.length;
        }
        return yield* this.pushToIndex(_ + 1, !1), this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        (this.blockScalarIndent = -1), (this.blockScalarKeep = !1);
        let H = this.pos;
        while (!0) {
          let _ = this.buffer[++H];
          if (_ === "+") this.blockScalarKeep = !0;
          else if (_ > "0" && _ <= "9") this.blockScalarIndent = Number(_) - 1;
          else if (_ !== "-") break;
        }
        return yield* this.pushUntil((_) => ru(_) || _ === "#");
      }
      *parseBlockScalar() {
        let H = this.pos - 1,
          _ = 0,
          q;
        H: for (let K = this.pos; (q = this.buffer[K]); ++K)
          switch (q) {
            case " ":
              _ += 1;
              break;
            case `
`:
              (H = K), (_ = 0);
              break;
            case "\r": {
              let O = this.buffer[K + 1];
              if (!O && !this.atEnd) return this.setNext("block-scalar");
              if (
                O ===
                `
`
              )
                break;
            }
            default:
              break H;
          }
        if (!q && !this.atEnd) return this.setNext("block-scalar");
        if (_ >= this.indentNext) {
          if (this.blockScalarIndent === -1) this.indentNext = _;
          else this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          do {
            let K = this.continueScalar(H + 1);
            if (K === -1) break;
            H = this.buffer.indexOf(
              `
`,
              K,
            );
          } while (H !== -1);
          if (H === -1) {
            if (!this.atEnd) return this.setNext("block-scalar");
            H = this.buffer.length;
          }
        }
        let $ = H + 1;
        q = this.buffer[$];
        while (q === " ") q = this.buffer[++$];
        if (q === "\t") {
          while (
            q === "\t" ||
            q === " " ||
            q === "\r" ||
            q ===
              `
`
          )
            q = this.buffer[++$];
          H = $ - 1;
        } else if (!this.blockScalarKeep)
          do {
            let K = H - 1,
              O = this.buffer[K];
            if (O === "\r") O = this.buffer[--K];
            let T = K;
            while (O === " ") O = this.buffer[--K];
            if (
              O ===
                `
` &&
              K >= this.pos &&
              K + 1 + _ > T
            )
              H = K;
            else break;
          } while (!0);
        return yield XQH.SCALAR, yield* this.pushToIndex(H + 1, !0), yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        let H = this.flowLevel > 0,
          _ = this.pos - 1,
          q = this.pos - 1,
          $;
        while (($ = this.buffer[++q]))
          if ($ === ":") {
            let K = this.buffer[q + 1];
            if (ru(K) || (H && kZ_.has(K))) break;
            _ = q;
          } else if (ru($)) {
            let K = this.buffer[q + 1];
            if ($ === "\r")
              if (
                K ===
                `
`
              )
                (q += 1),
                  ($ = `
`),
                  (K = this.buffer[q + 1]);
              else _ = q;
            if (K === "#" || (H && kZ_.has(K))) break;
            if (
              $ ===
              `
`
            ) {
              let O = this.continueScalar(q + 1);
              if (O === -1) break;
              q = Math.max(q, O - 2);
            }
          } else {
            if (H && kZ_.has($)) break;
            _ = q;
          }
        if (!$ && !this.atEnd) return this.setNext("plain-scalar");
        return yield XQH.SCALAR, yield* this.pushToIndex(_ + 1, !0), H ? "flow" : "doc";
      }
      *pushCount(H) {
        if (H > 0) return yield this.buffer.substr(this.pos, H), (this.pos += H), H;
        return 0;
      }
      *pushToIndex(H, _) {
        let q = this.buffer.slice(this.pos, H);
        if (q) return yield q, (this.pos += q.length), q.length;
        else if (_) yield "";
        return 0;
      }
      *pushIndicators() {
        switch (this.charAt(0)) {
          case "!":
            return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
          case "&":
            return (yield* this.pushUntil(qV6)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
          case "-":
          case "?":
          case ":": {
            let H = this.flowLevel > 0,
              _ = this.charAt(1);
            if (ru(_) || (H && kZ_.has(_))) {
              if (!H) this.indentNext = this.indentValue + 1;
              else if (this.flowKey) this.flowKey = !1;
              return (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
            }
          }
        }
        return 0;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let H = this.pos + 2,
            _ = this.buffer[H];
          while (!ru(_) && _ !== ">") _ = this.buffer[++H];
          return yield* this.pushToIndex(_ === ">" ? H + 1 : H, !1);
        } else {
          let H = this.pos + 1,
            _ = this.buffer[H];
          while (_)
            if (ib4.has(_)) _ = this.buffer[++H];
            else if (_ === "%" && Zaq.has(this.buffer[H + 1]) && Zaq.has(this.buffer[H + 2])) _ = this.buffer[(H += 3)];
            else break;
          return yield* this.pushToIndex(H, !1);
        }
      }
      *pushNewline() {
        let H = this.buffer[this.pos];
        if (
          H ===
          `
`
        )
          return yield* this.pushCount(1);
        else if (
          H === "\r" &&
          this.charAt(1) ===
            `
`
        )
          return yield* this.pushCount(2);
        else return 0;
      }
      *pushSpaces(H) {
        let _ = this.pos - 1,
          q;
        do q = this.buffer[++_];
        while (q === " " || (H && q === "\t"));
        let $ = _ - this.pos;
        if ($ > 0) yield this.buffer.substr(this.pos, $), (this.pos = _);
        return $;
      }
      *pushUntil(H) {
        let _ = this.pos,
          q = this.buffer[_];
        while (!H(q)) q = this.buffer[++_];
        return yield* this.pushToIndex(_, !1);
      }
    }
    kaq.Lexer = Laq;
  });

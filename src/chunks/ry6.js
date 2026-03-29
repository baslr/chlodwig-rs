  var ry6 = d((Yaq) => {
    var hb4 = require("process"),
      yb4 = Fh6(),
      Vb4 = YQH(),
      JQH = jQH(),
      Aaq = R3(),
      Sb4 = zaq(),
      Eb4 = NGH();
    function PQH(H) {
      if (typeof H === "number") return [H, H + 1];
      if (Array.isArray(H)) return H.length === 2 ? H : [H[0], H[1]];
      let { offset: _, source: q } = H;
      return [_, _ + (typeof q === "string" ? q.length : 1)];
    }
    function faq(H) {
      let _ = "",
        q = !1,
        $ = !1;
      for (let K = 0; K < H.length; ++K) {
        let O = H[K];
        switch (O[0]) {
          case "#":
            (_ +=
              (_ === ""
                ? ""
                : $
                  ? `

`
                  : `
`) + (O.substring(1) || " ")),
              (q = !0),
              ($ = !1);
            break;
          case "%":
            if (H[K + 1]?.[0] !== "#") K += 1;
            q = !1;
            break;
          default:
            if (!q) $ = !0;
            q = !1;
        }
      }
      return { comment: _, afterEmptyLine: $ };
    }
    class waq {
      constructor(H = {}) {
        (this.doc = null),
          (this.atDirectives = !1),
          (this.prelude = []),
          (this.errors = []),
          (this.warnings = []),
          (this.onError = (_, q, $, K) => {
            let O = PQH(_);
            if (K) this.warnings.push(new JQH.YAMLWarning(O, q, $));
            else this.errors.push(new JQH.YAMLParseError(O, q, $));
          }),
          (this.directives = new yb4.Directives({ version: H.version || "1.2" })),
          (this.options = H);
      }
      decorate(H, _) {
        let { comment: q, afterEmptyLine: $ } = faq(this.prelude);
        if (q) {
          let K = H.contents;
          if (_)
            H.comment = H.comment
              ? `${H.comment}
${q}`
              : q;
          else if ($ || H.directives.docStart || !K) H.commentBefore = q;
          else if (Aaq.isCollection(K) && !K.flow && K.items.length > 0) {
            let O = K.items[0];
            if (Aaq.isPair(O)) O = O.key;
            let T = O.commentBefore;
            O.commentBefore = T
              ? `${q}
${T}`
              : q;
          } else {
            let O = K.commentBefore;
            K.commentBefore = O
              ? `${q}
${O}`
              : q;
          }
        }
        if (_) Array.prototype.push.apply(H.errors, this.errors), Array.prototype.push.apply(H.warnings, this.warnings);
        else (H.errors = this.errors), (H.warnings = this.warnings);
        (this.prelude = []), (this.errors = []), (this.warnings = []);
      }
      streamInfo() {
        return {
          comment: faq(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings,
        };
      }
      *compose(H, _ = !1, q = -1) {
        for (let $ of H) yield* this.next($);
        yield* this.end(_, q);
      }
      *next(H) {
        if (hb4.env.LOG_STREAM) console.dir(H, { depth: null });
        switch (H.type) {
          case "directive":
            this.directives.add(H.source, (_, q, $) => {
              let K = PQH(H);
              (K[0] += _), this.onError(K, "BAD_DIRECTIVE", q, $);
            }),
              this.prelude.push(H.source),
              (this.atDirectives = !0);
            break;
          case "document": {
            let _ = Sb4.composeDoc(this.options, this.directives, H, this.onError);
            if (this.atDirectives && !_.directives.docStart)
              this.onError(H, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            if ((this.decorate(_, !1), this.doc)) yield this.doc;
            (this.doc = _), (this.atDirectives = !1);
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(H.source);
            break;
          case "error": {
            let _ = H.source ? `${H.message}: ${JSON.stringify(H.source)}` : H.message,
              q = new JQH.YAMLParseError(PQH(H), "UNEXPECTED_TOKEN", _);
            if (this.atDirectives || !this.doc) this.errors.push(q);
            else this.doc.errors.push(q);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              this.errors.push(
                new JQH.YAMLParseError(PQH(H), "UNEXPECTED_TOKEN", "Unexpected doc-end without preceding document"),
              );
              break;
            }
            this.doc.directives.docEnd = !0;
            let _ = Eb4.resolveEnd(H.end, H.offset + H.source.length, this.doc.options.strict, this.onError);
            if ((this.decorate(this.doc, !0), _.comment)) {
              let q = this.doc.comment;
              this.doc.comment = q
                ? `${q}
${_.comment}`
                : _.comment;
            }
            this.doc.range[2] = _.offset;
            break;
          }
          default:
            this.errors.push(new JQH.YAMLParseError(PQH(H), "UNEXPECTED_TOKEN", `Unsupported token ${H.type}`));
        }
      }
      *end(H = !1, _ = -1) {
        if (this.doc) this.decorate(this.doc, !0), yield this.doc, (this.doc = null);
        else if (H) {
          let q = Object.assign({ _directives: this.directives }, this.options),
            $ = new Vb4.Document(void 0, q);
          if (this.atDirectives) this.onError(_, "MISSING_CHAR", "Missing directives-end indicator line");
          ($.range = [0, _, _]), this.decorate($, !1), yield $;
        }
      }
    }
    Yaq.Composer = waq;
  });

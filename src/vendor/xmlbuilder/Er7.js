  var Er7 = d((Vr7, Sr7) => {
    (function () {
      var H,
        _,
        q,
        $,
        K,
        O,
        T,
        z,
        A,
        f,
        w,
        Y,
        D,
        j,
        M,
        J,
        P,
        X,
        R,
        W,
        Z,
        k,
        v,
        y = {}.hasOwnProperty;
      ({ isObject: k, isFunction: Z, isPlainObject: v, getValue: W } = ec()),
        (H = u2()),
        (Y = Hr6()),
        (j = Xp_()),
        ($ = Wp_()),
        (K = Gp_()),
        (J = hp_()),
        (R = yp_()),
        (M = Vp_()),
        (f = Rp_()),
        (w = Np_()),
        (O = Zp_()),
        (z = Lp_()),
        (T = kp_()),
        (A = vp_()),
        (q = an6()),
        (X = tn6()),
        (P = Sp_()),
        (_ = CtH()),
        (Sr7.exports = D =
          class {
            constructor(S, x, I) {
              var B;
              if (((this.name = "?xml"), (this.type = H.Document), S || (S = {}), (B = {}), !S.writer))
                S.writer = new P();
              else if (v(S.writer)) (B = S.writer), (S.writer = new P());
              (this.options = S),
                (this.writer = S.writer),
                (this.writerOptions = this.writer.filterOptions(B)),
                (this.stringify = new X(S)),
                (this.onDataCallback = x || function () {}),
                (this.onEndCallback = I || function () {}),
                (this.currentNode = null),
                (this.currentLevel = -1),
                (this.openTags = {}),
                (this.documentStarted = !1),
                (this.documentCompleted = !1),
                (this.root = null);
            }
            createChildNode(S) {
              var x, I, B, p, C, g, c, U;
              switch (S.type) {
                case H.CData:
                  this.cdata(S.value);
                  break;
                case H.Comment:
                  this.comment(S.value);
                  break;
                case H.Element:
                  (B = {}), (c = S.attribs);
                  for (I in c) {
                    if (!y.call(c, I)) continue;
                    (x = c[I]), (B[I] = x.value);
                  }
                  this.node(S.name, B);
                  break;
                case H.Dummy:
                  this.dummy();
                  break;
                case H.Raw:
                  this.raw(S.value);
                  break;
                case H.Text:
                  this.text(S.value);
                  break;
                case H.ProcessingInstruction:
                  this.instruction(S.target, S.value);
                  break;
                default:
                  throw Error("This XML node type is not supported in a JS object: " + S.constructor.name);
              }
              U = S.children;
              for (C = 0, g = U.length; C < g; C++)
                if (((p = U[C]), this.createChildNode(p), p.type === H.Element)) this.up();
              return this;
            }
            dummy() {
              return this;
            }
            node(S, x, I) {
              if (S == null) throw Error("Missing node name.");
              if (this.root && this.currentLevel === -1)
                throw Error("Document can only have one root node. " + this.debugInfo(S));
              if ((this.openCurrent(), (S = W(S)), x == null)) x = {};
              if (((x = W(x)), !k(x))) [I, x] = [x, I];
              if (
                ((this.currentNode = new j(this, S, x)),
                (this.currentNode.children = !1),
                this.currentLevel++,
                (this.openTags[this.currentLevel] = this.currentNode),
                I != null)
              )
                this.text(I);
              return this;
            }
            element(S, x, I) {
              var B, p, C, g, c, U;
              if (this.currentNode && this.currentNode.type === H.DocType) this.dtdElement(...arguments);
              else if (Array.isArray(S) || k(S) || Z(S)) {
                (g = this.options.noValidation),
                  (this.options.noValidation = !0),
                  (U = new Y(this.options).element("TEMP_ROOT")),
                  U.element(S),
                  (this.options.noValidation = g),
                  (c = U.children);
                for (p = 0, C = c.length; p < C; p++)
                  if (((B = c[p]), this.createChildNode(B), B.type === H.Element)) this.up();
              } else this.node(S, x, I);
              return this;
            }
            attribute(S, x) {
              var I, B;
              if (!this.currentNode || this.currentNode.children)
                throw Error(
                  "att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(S),
                );
              if (S != null) S = W(S);
              if (k(S))
                for (I in S) {
                  if (!y.call(S, I)) continue;
                  (B = S[I]), this.attribute(I, B);
                }
              else {
                if (Z(x)) x = x.apply();
                if (this.options.keepNullAttributes && x == null) this.currentNode.attribs[S] = new q(this, S, "");
                else if (x != null) this.currentNode.attribs[S] = new q(this, S, x);
              }
              return this;
            }
            text(S) {
              var x;
              return (
                this.openCurrent(),
                (x = new R(this, S)),
                this.onData(this.writer.text(x, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            cdata(S) {
              var x;
              return (
                this.openCurrent(),
                (x = new $(this, S)),
                this.onData(this.writer.cdata(x, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            comment(S) {
              var x;
              return (
                this.openCurrent(),
                (x = new K(this, S)),
                this.onData(this.writer.comment(x, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            raw(S) {
              var x;
              return (
                this.openCurrent(),
                (x = new J(this, S)),
                this.onData(this.writer.raw(x, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            instruction(S, x) {
              var I, B, p, C, g;
              if ((this.openCurrent(), S != null)) S = W(S);
              if (x != null) x = W(x);
              if (Array.isArray(S)) for (I = 0, C = S.length; I < C; I++) (B = S[I]), this.instruction(B);
              else if (k(S))
                for (B in S) {
                  if (!y.call(S, B)) continue;
                  (p = S[B]), this.instruction(B, p);
                }
              else {
                if (Z(x)) x = x.apply();
                (g = new M(this, S, x)),
                  this.onData(
                    this.writer.processingInstruction(g, this.writerOptions, this.currentLevel + 1),
                    this.currentLevel + 1,
                  );
              }
              return this;
            }
            declaration(S, x, I) {
              var B;
              if ((this.openCurrent(), this.documentStarted)) throw Error("declaration() must be the first node.");
              return (
                (B = new f(this, S, x, I)),
                this.onData(
                  this.writer.declaration(B, this.writerOptions, this.currentLevel + 1),
                  this.currentLevel + 1,
                ),
                this
              );
            }
            doctype(S, x, I) {
              if ((this.openCurrent(), S == null)) throw Error("Missing root node name.");
              if (this.root) throw Error("dtd() must come before the root node.");
              return (
                (this.currentNode = new w(this, x, I)),
                (this.currentNode.rootNodeName = S),
                (this.currentNode.children = !1),
                this.currentLevel++,
                (this.openTags[this.currentLevel] = this.currentNode),
                this
              );
            }
            dtdElement(S, x) {
              var I;
              return (
                this.openCurrent(),
                (I = new T(this, S, x)),
                this.onData(
                  this.writer.dtdElement(I, this.writerOptions, this.currentLevel + 1),
                  this.currentLevel + 1,
                ),
                this
              );
            }
            attList(S, x, I, B, p) {
              var C;
              return (
                this.openCurrent(),
                (C = new O(this, S, x, I, B, p)),
                this.onData(
                  this.writer.dtdAttList(C, this.writerOptions, this.currentLevel + 1),
                  this.currentLevel + 1,
                ),
                this
              );
            }
            entity(S, x) {
              var I;
              return (
                this.openCurrent(),
                (I = new z(this, !1, S, x)),
                this.onData(this.writer.dtdEntity(I, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            pEntity(S, x) {
              var I;
              return (
                this.openCurrent(),
                (I = new z(this, !0, S, x)),
                this.onData(this.writer.dtdEntity(I, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1),
                this
              );
            }
            notation(S, x) {
              var I;
              return (
                this.openCurrent(),
                (I = new A(this, S, x)),
                this.onData(
                  this.writer.dtdNotation(I, this.writerOptions, this.currentLevel + 1),
                  this.currentLevel + 1,
                ),
                this
              );
            }
            up() {
              if (this.currentLevel < 0) throw Error("The document node has no parent.");
              if (this.currentNode) {
                if (this.currentNode.children) this.closeNode(this.currentNode);
                else this.openNode(this.currentNode);
                this.currentNode = null;
              } else this.closeNode(this.openTags[this.currentLevel]);
              return delete this.openTags[this.currentLevel], this.currentLevel--, this;
            }
            end() {
              while (this.currentLevel >= 0) this.up();
              return this.onEnd();
            }
            openCurrent() {
              if (this.currentNode) return (this.currentNode.children = !0), this.openNode(this.currentNode);
            }
            openNode(S) {
              var x, I, B, p;
              if (!S.isOpen) {
                if (!this.root && this.currentLevel === 0 && S.type === H.Element) this.root = S;
                if (((I = ""), S.type === H.Element)) {
                  (this.writerOptions.state = _.OpenTag),
                    (I = this.writer.indent(S, this.writerOptions, this.currentLevel) + "<" + S.name),
                    (p = S.attribs);
                  for (B in p) {
                    if (!y.call(p, B)) continue;
                    (x = p[B]), (I += this.writer.attribute(x, this.writerOptions, this.currentLevel));
                  }
                  (I += (S.children ? ">" : "/>") + this.writer.endline(S, this.writerOptions, this.currentLevel)),
                    (this.writerOptions.state = _.InsideTag);
                } else {
                  if (
                    ((this.writerOptions.state = _.OpenTag),
                    (I = this.writer.indent(S, this.writerOptions, this.currentLevel) + "<!DOCTYPE " + S.rootNodeName),
                    S.pubID && S.sysID)
                  )
                    I += ' PUBLIC "' + S.pubID + '" "' + S.sysID + '"';
                  else if (S.sysID) I += ' SYSTEM "' + S.sysID + '"';
                  if (S.children) (I += " ["), (this.writerOptions.state = _.InsideTag);
                  else (this.writerOptions.state = _.CloseTag), (I += ">");
                  I += this.writer.endline(S, this.writerOptions, this.currentLevel);
                }
                return this.onData(I, this.currentLevel), (S.isOpen = !0);
              }
            }
            closeNode(S) {
              var x;
              if (!S.isClosed) {
                if (((x = ""), (this.writerOptions.state = _.CloseTag), S.type === H.Element))
                  x =
                    this.writer.indent(S, this.writerOptions, this.currentLevel) +
                    "</" +
                    S.name +
                    ">" +
                    this.writer.endline(S, this.writerOptions, this.currentLevel);
                else
                  x =
                    this.writer.indent(S, this.writerOptions, this.currentLevel) +
                    "]>" +
                    this.writer.endline(S, this.writerOptions, this.currentLevel);
                return (this.writerOptions.state = _.None), this.onData(x, this.currentLevel), (S.isClosed = !0);
              }
            }
            onData(S, x) {
              return (this.documentStarted = !0), this.onDataCallback(S, x + 1);
            }
            onEnd() {
              return (this.documentCompleted = !0), this.onEndCallback();
            }
            debugInfo(S) {
              if (S == null) return "";
              else return "node: <" + S + ">";
            }
            ele() {
              return this.element(...arguments);
            }
            nod(S, x, I) {
              return this.node(S, x, I);
            }
            txt(S) {
              return this.text(S);
            }
            dat(S) {
              return this.cdata(S);
            }
            com(S) {
              return this.comment(S);
            }
            ins(S, x) {
              return this.instruction(S, x);
            }
            dec(S, x, I) {
              return this.declaration(S, x, I);
            }
            dtd(S, x, I) {
              return this.doctype(S, x, I);
            }
            e(S, x, I) {
              return this.element(S, x, I);
            }
            n(S, x, I) {
              return this.node(S, x, I);
            }
            t(S) {
              return this.text(S);
            }
            d(S) {
              return this.cdata(S);
            }
            c(S) {
              return this.comment(S);
            }
            r(S) {
              return this.raw(S);
            }
            i(S, x) {
              return this.instruction(S, x);
            }
            att() {
              if (this.currentNode && this.currentNode.type === H.DocType) return this.attList(...arguments);
              else return this.attribute(...arguments);
            }
            a() {
              if (this.currentNode && this.currentNode.type === H.DocType) return this.attList(...arguments);
              else return this.attribute(...arguments);
            }
            ent(S, x) {
              return this.entity(S, x);
            }
            pent(S, x) {
              return this.pEntity(S, x);
            }
            not(S, x) {
              return this.notation(S, x);
            }
          });
    }).call(Vr7);
  });

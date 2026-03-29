  var ay = d((Pr7, Xr7) => {
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
        R = {}.hasOwnProperty,
        W = [].splice;
      ({ isObject: X, isFunction: P, isEmpty: J, getValue: M } = ec()),
        (z = null),
        (q = null),
        ($ = null),
        (K = null),
        (O = null),
        (D = null),
        (j = null),
        (Y = null),
        (T = null),
        (_ = null),
        (w = null),
        (A = null),
        (H = null),
        (Xr7.exports = f =
          function () {
            class Z {
              constructor(k) {
                if (((this.parent = k), this.parent))
                  (this.options = this.parent.options), (this.stringify = this.parent.stringify);
                if (((this.value = null), (this.children = []), (this.baseURI = null), !z))
                  (z = Xp_()),
                    (q = Wp_()),
                    ($ = Gp_()),
                    (K = Rp_()),
                    (O = Np_()),
                    (D = hp_()),
                    (j = yp_()),
                    (Y = Vp_()),
                    (T = sn6()),
                    (_ = u2()),
                    (w = Dr7()),
                    (A = Pp_()),
                    (H = Jr7());
              }
              setParent(k) {
                var v, y, E, S, x;
                if (((this.parent = k), k)) (this.options = k.options), (this.stringify = k.stringify);
                (S = this.children), (x = []);
                for (y = 0, E = S.length; y < E; y++) (v = S[y]), x.push(v.setParent(this));
                return x;
              }
              element(k, v, y) {
                var E, S, x, I, B, p, C, g, c;
                if (((p = null), v === null && y == null)) [v, y] = [{}, null];
                if (v == null) v = {};
                if (((v = M(v)), !X(v))) [y, v] = [v, y];
                if (k != null) k = M(k);
                if (Array.isArray(k)) for (x = 0, C = k.length; x < C; x++) (S = k[x]), (p = this.element(S));
                else if (P(k)) p = this.element(k.apply());
                else if (X(k))
                  for (B in k) {
                    if (!R.call(k, B)) continue;
                    if (((c = k[B]), P(c))) c = c.apply();
                    if (
                      !this.options.ignoreDecorators &&
                      this.stringify.convertAttKey &&
                      B.indexOf(this.stringify.convertAttKey) === 0
                    )
                      p = this.attribute(B.substr(this.stringify.convertAttKey.length), c);
                    else if (!this.options.separateArrayItems && Array.isArray(c) && J(c)) p = this.dummy();
                    else if (X(c) && J(c)) p = this.element(B);
                    else if (!this.options.keepNullNodes && c == null) p = this.dummy();
                    else if (!this.options.separateArrayItems && Array.isArray(c))
                      for (I = 0, g = c.length; I < g; I++) (S = c[I]), (E = {}), (E[B] = S), (p = this.element(E));
                    else if (X(c))
                      if (
                        !this.options.ignoreDecorators &&
                        this.stringify.convertTextKey &&
                        B.indexOf(this.stringify.convertTextKey) === 0
                      )
                        p = this.element(c);
                      else (p = this.element(B)), p.element(c);
                    else p = this.element(B, c);
                  }
                else if (!this.options.keepNullNodes && y === null) p = this.dummy();
                else if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertTextKey &&
                  k.indexOf(this.stringify.convertTextKey) === 0
                )
                  p = this.text(y);
                else if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertCDataKey &&
                  k.indexOf(this.stringify.convertCDataKey) === 0
                )
                  p = this.cdata(y);
                else if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertCommentKey &&
                  k.indexOf(this.stringify.convertCommentKey) === 0
                )
                  p = this.comment(y);
                else if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertRawKey &&
                  k.indexOf(this.stringify.convertRawKey) === 0
                )
                  p = this.raw(y);
                else if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertPIKey &&
                  k.indexOf(this.stringify.convertPIKey) === 0
                )
                  p = this.instruction(k.substr(this.stringify.convertPIKey.length), y);
                else p = this.node(k, v, y);
                if (p == null) throw Error("Could not create any elements with: " + k + ". " + this.debugInfo());
                return p;
              }
              insertBefore(k, v, y) {
                var E, S, x, I, B;
                if (k != null ? k.type : void 0) {
                  if (((x = k), (I = v), x.setParent(this), I))
                    (S = children.indexOf(I)),
                      (B = children.splice(S)),
                      children.push(x),
                      Array.prototype.push.apply(children, B);
                  else children.push(x);
                  return x;
                } else {
                  if (this.isRoot) throw Error("Cannot insert elements at root level. " + this.debugInfo(k));
                  return (
                    (S = this.parent.children.indexOf(this)),
                    (B = this.parent.children.splice(S)),
                    (E = this.parent.element(k, v, y)),
                    Array.prototype.push.apply(this.parent.children, B),
                    E
                  );
                }
              }
              insertAfter(k, v, y) {
                var E, S, x;
                if (this.isRoot) throw Error("Cannot insert elements at root level. " + this.debugInfo(k));
                return (
                  (S = this.parent.children.indexOf(this)),
                  (x = this.parent.children.splice(S + 1)),
                  (E = this.parent.element(k, v, y)),
                  Array.prototype.push.apply(this.parent.children, x),
                  E
                );
              }
              remove() {
                var k, v;
                if (this.isRoot) throw Error("Cannot remove the root element. " + this.debugInfo());
                return (
                  (k = this.parent.children.indexOf(this)),
                  W.apply(this.parent.children, [k, k - k + 1].concat((v = []))),
                  this.parent
                );
              }
              node(k, v, y) {
                var E;
                if (k != null) k = M(k);
                if ((v || (v = {}), (v = M(v)), !X(v))) [y, v] = [v, y];
                if (((E = new z(this, k, v)), y != null)) E.text(y);
                return this.children.push(E), E;
              }
              text(k) {
                var v;
                if (X(k)) this.element(k);
                return (v = new j(this, k)), this.children.push(v), this;
              }
              cdata(k) {
                var v = new q(this, k);
                return this.children.push(v), this;
              }
              comment(k) {
                var v = new $(this, k);
                return this.children.push(v), this;
              }
              commentBefore(k) {
                var v, y, E;
                return (
                  (y = this.parent.children.indexOf(this)),
                  (E = this.parent.children.splice(y)),
                  (v = this.parent.comment(k)),
                  Array.prototype.push.apply(this.parent.children, E),
                  this
                );
              }
              commentAfter(k) {
                var v, y, E;
                return (
                  (y = this.parent.children.indexOf(this)),
                  (E = this.parent.children.splice(y + 1)),
                  (v = this.parent.comment(k)),
                  Array.prototype.push.apply(this.parent.children, E),
                  this
                );
              }
              raw(k) {
                var v = new D(this, k);
                return this.children.push(v), this;
              }
              dummy() {
                var k = new T(this);
                return k;
              }
              instruction(k, v) {
                var y, E, S, x, I;
                if (k != null) k = M(k);
                if (v != null) v = M(v);
                if (Array.isArray(k)) for (x = 0, I = k.length; x < I; x++) (y = k[x]), this.instruction(y);
                else if (X(k))
                  for (y in k) {
                    if (!R.call(k, y)) continue;
                    (E = k[y]), this.instruction(y, E);
                  }
                else {
                  if (P(v)) v = v.apply();
                  (S = new Y(this, k, v)), this.children.push(S);
                }
                return this;
              }
              instructionBefore(k, v) {
                var y, E, S;
                return (
                  (E = this.parent.children.indexOf(this)),
                  (S = this.parent.children.splice(E)),
                  (y = this.parent.instruction(k, v)),
                  Array.prototype.push.apply(this.parent.children, S),
                  this
                );
              }
              instructionAfter(k, v) {
                var y, E, S;
                return (
                  (E = this.parent.children.indexOf(this)),
                  (S = this.parent.children.splice(E + 1)),
                  (y = this.parent.instruction(k, v)),
                  Array.prototype.push.apply(this.parent.children, S),
                  this
                );
              }
              declaration(k, v, y) {
                var E, S;
                if (((E = this.document()), (S = new K(E, k, v, y)), E.children.length === 0)) E.children.unshift(S);
                else if (E.children[0].type === _.Declaration) E.children[0] = S;
                else E.children.unshift(S);
                return E.root() || E;
              }
              dtd(k, v) {
                var y, E, S, x, I, B, p, C, g, c;
                (E = this.document()), (S = new O(E, k, v)), (g = E.children);
                for (x = I = 0, p = g.length; I < p; x = ++I)
                  if (((y = g[x]), y.type === _.DocType)) return (E.children[x] = S), S;
                c = E.children;
                for (x = B = 0, C = c.length; B < C; x = ++B)
                  if (((y = c[x]), y.isRoot)) return E.children.splice(x, 0, S), S;
                return E.children.push(S), S;
              }
              up() {
                if (this.isRoot)
                  throw Error("The root node has no parent. Use doc() if you need to get the document object.");
                return this.parent;
              }
              root() {
                var k = this;
                while (k)
                  if (k.type === _.Document) return k.rootObject;
                  else if (k.isRoot) return k;
                  else k = k.parent;
              }
              document() {
                var k = this;
                while (k)
                  if (k.type === _.Document) return k;
                  else k = k.parent;
              }
              end(k) {
                return this.document().end(k);
              }
              prev() {
                var k = this.parent.children.indexOf(this);
                if (k < 1) throw Error("Already at the first node. " + this.debugInfo());
                return this.parent.children[k - 1];
              }
              next() {
                var k = this.parent.children.indexOf(this);
                if (k === -1 || k === this.parent.children.length - 1)
                  throw Error("Already at the last node. " + this.debugInfo());
                return this.parent.children[k + 1];
              }
              importDocument(k) {
                var v, y, E, S, x;
                if (
                  ((y = k.root().clone()),
                  (y.parent = this),
                  (y.isRoot = !1),
                  this.children.push(y),
                  this.type === _.Document)
                ) {
                  if (((y.isRoot = !0), (y.documentObject = this), (this.rootObject = y), this.children)) {
                    x = this.children;
                    for (E = 0, S = x.length; E < S; E++)
                      if (((v = x[E]), v.type === _.DocType)) {
                        v.name = y.name;
                        break;
                      }
                  }
                }
                return this;
              }
              debugInfo(k) {
                var v, y;
                if (((k = k || this.name), k == null && !((v = this.parent) != null ? v.name : void 0))) return "";
                else if (k == null) return "parent: <" + this.parent.name + ">";
                else if (!((y = this.parent) != null ? y.name : void 0)) return "node: <" + k + ">";
                else return "node: <" + k + ">, parent: <" + this.parent.name + ">";
              }
              ele(k, v, y) {
                return this.element(k, v, y);
              }
              nod(k, v, y) {
                return this.node(k, v, y);
              }
              txt(k) {
                return this.text(k);
              }
              dat(k) {
                return this.cdata(k);
              }
              com(k) {
                return this.comment(k);
              }
              ins(k, v) {
                return this.instruction(k, v);
              }
              doc() {
                return this.document();
              }
              dec(k, v, y) {
                return this.declaration(k, v, y);
              }
              e(k, v, y) {
                return this.element(k, v, y);
              }
              n(k, v, y) {
                return this.node(k, v, y);
              }
              t(k) {
                return this.text(k);
              }
              d(k) {
                return this.cdata(k);
              }
              c(k) {
                return this.comment(k);
              }
              r(k) {
                return this.raw(k);
              }
              i(k, v) {
                return this.instruction(k, v);
              }
              u() {
                return this.up();
              }
              importXMLBuilder(k) {
                return this.importDocument(k);
              }
              attribute(k, v) {
                throw Error("attribute() applies to element nodes only.");
              }
              att(k, v) {
                return this.attribute(k, v);
              }
              a(k, v) {
                return this.attribute(k, v);
              }
              removeAttribute(k) {
                throw Error("attribute() applies to element nodes only.");
              }
              replaceChild(k, v) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              removeChild(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              appendChild(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              hasChildNodes() {
                return this.children.length !== 0;
              }
              cloneNode(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              normalize() {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              isSupported(k, v) {
                return !0;
              }
              hasAttributes() {
                return this.attribs.length !== 0;
              }
              compareDocumentPosition(k) {
                var v, y;
                if (((v = this), v === k)) return 0;
                else if (this.document() !== k.document()) {
                  if (((y = H.Disconnected | H.ImplementationSpecific), Math.random() < 0.5)) y |= H.Preceding;
                  else y |= H.Following;
                  return y;
                } else if (v.isAncestor(k)) return H.Contains | H.Preceding;
                else if (v.isDescendant(k)) return H.Contains | H.Following;
                else if (v.isPreceding(k)) return H.Preceding;
                else return H.Following;
              }
              isSameNode(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              lookupPrefix(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              isDefaultNamespace(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              lookupNamespaceURI(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              isEqualNode(k) {
                var v, y, E;
                if (k.nodeType !== this.nodeType) return !1;
                if (k.children.length !== this.children.length) return !1;
                for (v = y = 0, E = this.children.length - 1; 0 <= E ? y <= E : y >= E; v = 0 <= E ? ++y : --y)
                  if (!this.children[v].isEqualNode(k.children[v])) return !1;
                return !0;
              }
              getFeature(k, v) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              setUserData(k, v, y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getUserData(k) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              contains(k) {
                if (!k) return !1;
                return k === this || this.isDescendant(k);
              }
              isDescendant(k) {
                var v, y, E, S, x;
                x = this.children;
                for (E = 0, S = x.length; E < S; E++) {
                  if (((v = x[E]), k === v)) return !0;
                  if (((y = v.isDescendant(k)), y)) return !0;
                }
                return !1;
              }
              isAncestor(k) {
                return k.isDescendant(this);
              }
              isPreceding(k) {
                var v, y;
                if (((v = this.treePosition(k)), (y = this.treePosition(this)), v === -1 || y === -1)) return !1;
                else return v < y;
              }
              isFollowing(k) {
                var v, y;
                if (((v = this.treePosition(k)), (y = this.treePosition(this)), v === -1 || y === -1)) return !1;
                else return v > y;
              }
              treePosition(k) {
                var v, y;
                if (
                  ((y = 0),
                  (v = !1),
                  this.foreachTreeNode(this.document(), function (E) {
                    if ((y++, !v && E === k)) return (v = !0);
                  }),
                  v)
                )
                  return y;
                else return -1;
              }
              foreachTreeNode(k, v) {
                var y, E, S, x, I;
                k || (k = this.document()), (x = k.children);
                for (E = 0, S = x.length; E < S; E++)
                  if (((y = x[E]), (I = v(y)))) return I;
                  else if (((I = this.foreachTreeNode(y, v)), I)) return I;
              }
            }
            return (
              Object.defineProperty(Z.prototype, "nodeName", {
                get: function () {
                  return this.name;
                },
              }),
              Object.defineProperty(Z.prototype, "nodeType", {
                get: function () {
                  return this.type;
                },
              }),
              Object.defineProperty(Z.prototype, "nodeValue", {
                get: function () {
                  return this.value;
                },
              }),
              Object.defineProperty(Z.prototype, "parentNode", {
                get: function () {
                  return this.parent;
                },
              }),
              Object.defineProperty(Z.prototype, "childNodes", {
                get: function () {
                  if (!this.childNodeList || !this.childNodeList.nodes) this.childNodeList = new w(this.children);
                  return this.childNodeList;
                },
              }),
              Object.defineProperty(Z.prototype, "firstChild", {
                get: function () {
                  return this.children[0] || null;
                },
              }),
              Object.defineProperty(Z.prototype, "lastChild", {
                get: function () {
                  return this.children[this.children.length - 1] || null;
                },
              }),
              Object.defineProperty(Z.prototype, "previousSibling", {
                get: function () {
                  var k = this.parent.children.indexOf(this);
                  return this.parent.children[k - 1] || null;
                },
              }),
              Object.defineProperty(Z.prototype, "nextSibling", {
                get: function () {
                  var k = this.parent.children.indexOf(this);
                  return this.parent.children[k + 1] || null;
                },
              }),
              Object.defineProperty(Z.prototype, "ownerDocument", {
                get: function () {
                  return this.document() || null;
                },
              }),
              Object.defineProperty(Z.prototype, "textContent", {
                get: function () {
                  var k, v, y, E, S;
                  if (this.nodeType === _.Element || this.nodeType === _.DocumentFragment) {
                    (S = ""), (E = this.children);
                    for (v = 0, y = E.length; v < y; v++) if (((k = E[v]), k.textContent)) S += k.textContent;
                    return S;
                  } else return null;
                },
                set: function (k) {
                  throw Error("This DOM method is not implemented." + this.debugInfo());
                },
              }),
              Z
            );
          }.call(this));
    }).call(Pr7);
  });

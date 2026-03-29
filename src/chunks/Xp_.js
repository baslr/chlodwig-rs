  var Xp_ = d((mn7, pn7) => {
    (function () {
      var H,
        _,
        q,
        $,
        K,
        O,
        T,
        z,
        A = {}.hasOwnProperty;
      ({ isObject: z, isFunction: T, getValue: O } = ec()),
        (K = ay()),
        (H = u2()),
        (_ = an6()),
        ($ = Pp_()),
        (pn7.exports = q =
          function () {
            class f extends K {
              constructor(w, Y, D) {
                var j, M, J, P;
                super(w);
                if (Y == null) throw Error("Missing element name. " + this.debugInfo());
                if (
                  ((this.name = this.stringify.name(Y)),
                  (this.type = H.Element),
                  (this.attribs = {}),
                  (this.schemaTypeInfo = null),
                  D != null)
                )
                  this.attribute(D);
                if (w.type === H.Document) {
                  if (((this.isRoot = !0), (this.documentObject = w), (w.rootObject = this), w.children)) {
                    P = w.children;
                    for (M = 0, J = P.length; M < J; M++)
                      if (((j = P[M]), j.type === H.DocType)) {
                        j.name = this.name;
                        break;
                      }
                  }
                }
              }
              clone() {
                var w, Y, D, j;
                if (((D = Object.create(this)), D.isRoot)) D.documentObject = null;
                (D.attribs = {}), (j = this.attribs);
                for (Y in j) {
                  if (!A.call(j, Y)) continue;
                  (w = j[Y]), (D.attribs[Y] = w.clone());
                }
                return (
                  (D.children = []),
                  this.children.forEach(function (M) {
                    var J = M.clone();
                    return (J.parent = D), D.children.push(J);
                  }),
                  D
                );
              }
              attribute(w, Y) {
                var D, j;
                if (w != null) w = O(w);
                if (z(w))
                  for (D in w) {
                    if (!A.call(w, D)) continue;
                    (j = w[D]), this.attribute(D, j);
                  }
                else {
                  if (T(Y)) Y = Y.apply();
                  if (this.options.keepNullAttributes && Y == null) this.attribs[w] = new _(this, w, "");
                  else if (Y != null) this.attribs[w] = new _(this, w, Y);
                }
                return this;
              }
              removeAttribute(w) {
                var Y, D, j;
                if (w == null) throw Error("Missing attribute name. " + this.debugInfo());
                if (((w = O(w)), Array.isArray(w)))
                  for (D = 0, j = w.length; D < j; D++) (Y = w[D]), delete this.attribs[Y];
                else delete this.attribs[w];
                return this;
              }
              toString(w) {
                return this.options.writer.element(this, this.options.writer.filterOptions(w));
              }
              att(w, Y) {
                return this.attribute(w, Y);
              }
              a(w, Y) {
                return this.attribute(w, Y);
              }
              getAttribute(w) {
                if (this.attribs.hasOwnProperty(w)) return this.attribs[w].value;
                else return null;
              }
              setAttribute(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getAttributeNode(w) {
                if (this.attribs.hasOwnProperty(w)) return this.attribs[w];
                else return null;
              }
              setAttributeNode(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              removeAttributeNode(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagName(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getAttributeNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              setAttributeNS(w, Y, D) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              removeAttributeNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getAttributeNodeNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              setAttributeNodeNS(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagNameNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              hasAttribute(w) {
                return this.attribs.hasOwnProperty(w);
              }
              hasAttributeNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              setIdAttribute(w, Y) {
                if (this.attribs.hasOwnProperty(w)) return this.attribs[w].isId;
                else return Y;
              }
              setIdAttributeNS(w, Y, D) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              setIdAttributeNode(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagName(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagNameNS(w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByClassName(w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              isEqualNode(w) {
                var Y, D, j;
                if (!super.isEqualNode(w)) return !1;
                if (w.namespaceURI !== this.namespaceURI) return !1;
                if (w.prefix !== this.prefix) return !1;
                if (w.localName !== this.localName) return !1;
                if (w.attribs.length !== this.attribs.length) return !1;
                for (Y = D = 0, j = this.attribs.length - 1; 0 <= j ? D <= j : D >= j; Y = 0 <= j ? ++D : --D)
                  if (!this.attribs[Y].isEqualNode(w.attribs[Y])) return !1;
                return !0;
              }
            }
            return (
              Object.defineProperty(f.prototype, "tagName", {
                get: function () {
                  return this.name;
                },
              }),
              Object.defineProperty(f.prototype, "namespaceURI", {
                get: function () {
                  return "";
                },
              }),
              Object.defineProperty(f.prototype, "prefix", {
                get: function () {
                  return "";
                },
              }),
              Object.defineProperty(f.prototype, "localName", {
                get: function () {
                  return this.name;
                },
              }),
              Object.defineProperty(f.prototype, "id", {
                get: function () {
                  throw Error("This DOM method is not implemented." + this.debugInfo());
                },
              }),
              Object.defineProperty(f.prototype, "className", {
                get: function () {
                  throw Error("This DOM method is not implemented." + this.debugInfo());
                },
              }),
              Object.defineProperty(f.prototype, "classList", {
                get: function () {
                  throw Error("This DOM method is not implemented." + this.debugInfo());
                },
              }),
              Object.defineProperty(f.prototype, "attributes", {
                get: function () {
                  if (!this.attributeMap || !this.attributeMap.nodes) this.attributeMap = new $(this.attribs);
                  return this.attributeMap;
                },
              }),
              f
            );
          }.call(this));
    }).call(mn7);
  });

  var Hr6 = d((hr7, yr7) => {
    (function () {
      var H, _, q, $, K, O, T, z;
      ({ isPlainObject: z } = ec()),
        (q = on6()),
        (_ = Sn7()),
        (K = ay()),
        (H = u2()),
        (T = tn6()),
        (O = Sp_()),
        (yr7.exports = $ =
          function () {
            class A extends K {
              constructor(f) {
                super(null);
                if (
                  ((this.name = "#document"),
                  (this.type = H.Document),
                  (this.documentURI = null),
                  (this.domConfig = new _()),
                  f || (f = {}),
                  !f.writer)
                )
                  f.writer = new O();
                (this.options = f), (this.stringify = new T(f));
              }
              end(f) {
                var w = {};
                if (!f) f = this.options.writer;
                else if (z(f)) (w = f), (f = this.options.writer);
                return f.document(this, f.filterOptions(w));
              }
              toString(f) {
                return this.options.writer.document(this, this.options.writer.filterOptions(f));
              }
              createElement(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createDocumentFragment() {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createTextNode(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createComment(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createCDATASection(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createProcessingInstruction(f, w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createAttribute(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createEntityReference(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagName(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              importNode(f, w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createElementNS(f, w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createAttributeNS(f, w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByTagNameNS(f, w) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementById(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              adoptNode(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              normalizeDocument() {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              renameNode(f, w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              getElementsByClassName(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createEvent(f) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createRange() {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createNodeIterator(f, w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
              createTreeWalker(f, w, Y) {
                throw Error("This DOM method is not implemented." + this.debugInfo());
              }
            }
            return (
              Object.defineProperty(A.prototype, "implementation", { value: new q() }),
              Object.defineProperty(A.prototype, "doctype", {
                get: function () {
                  var f, w, Y, D;
                  D = this.children;
                  for (w = 0, Y = D.length; w < Y; w++) if (((f = D[w]), f.type === H.DocType)) return f;
                  return null;
                },
              }),
              Object.defineProperty(A.prototype, "documentElement", {
                get: function () {
                  return this.rootObject || null;
                },
              }),
              Object.defineProperty(A.prototype, "inputEncoding", {
                get: function () {
                  return null;
                },
              }),
              Object.defineProperty(A.prototype, "strictErrorChecking", {
                get: function () {
                  return !1;
                },
              }),
              Object.defineProperty(A.prototype, "xmlEncoding", {
                get: function () {
                  if (this.children.length !== 0 && this.children[0].type === H.Declaration)
                    return this.children[0].encoding;
                  else return null;
                },
              }),
              Object.defineProperty(A.prototype, "xmlStandalone", {
                get: function () {
                  if (this.children.length !== 0 && this.children[0].type === H.Declaration)
                    return this.children[0].standalone === "yes";
                  else return !1;
                },
              }),
              Object.defineProperty(A.prototype, "xmlVersion", {
                get: function () {
                  if (this.children.length !== 0 && this.children[0].type === H.Declaration)
                    return this.children[0].version;
                  else return "1.0";
                },
              }),
              Object.defineProperty(A.prototype, "URL", {
                get: function () {
                  return this.documentURI;
                },
              }),
              Object.defineProperty(A.prototype, "origin", {
                get: function () {
                  return null;
                },
              }),
              Object.defineProperty(A.prototype, "compatMode", {
                get: function () {
                  return null;
                },
              }),
              Object.defineProperty(A.prototype, "characterSet", {
                get: function () {
                  return null;
                },
              }),
              Object.defineProperty(A.prototype, "contentType", {
                get: function () {
                  return null;
                },
              }),
              A
            );
          }.call(this));
    }).call(hr7);
  });

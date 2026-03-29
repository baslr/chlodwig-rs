  var Np_ = d((Hr7, _r7) => {
    (function () {
      var H, _, q, $, K, O, T, z, A;
      ({ isObject: A } = ec()),
        (z = ay()),
        (H = u2()),
        (_ = Zp_()),
        ($ = Lp_()),
        (q = kp_()),
        (K = vp_()),
        (T = Pp_()),
        (_r7.exports = O =
          function () {
            class f extends z {
              constructor(w, Y, D) {
                var j, M, J, P;
                super(w);
                if (((this.type = H.DocType), w.children)) {
                  P = w.children;
                  for (M = 0, J = P.length; M < J; M++)
                    if (((j = P[M]), j.type === H.Element)) {
                      this.name = j.name;
                      break;
                    }
                }
                if (((this.documentObject = w), A(Y))) ({ pubID: Y, sysID: D } = Y);
                if (D == null) [D, Y] = [Y, D];
                if (Y != null) this.pubID = this.stringify.dtdPubID(Y);
                if (D != null) this.sysID = this.stringify.dtdSysID(D);
              }
              element(w, Y) {
                var D = new q(this, w, Y);
                return this.children.push(D), this;
              }
              attList(w, Y, D, j, M) {
                var J = new _(this, w, Y, D, j, M);
                return this.children.push(J), this;
              }
              entity(w, Y) {
                var D = new $(this, !1, w, Y);
                return this.children.push(D), this;
              }
              pEntity(w, Y) {
                var D = new $(this, !0, w, Y);
                return this.children.push(D), this;
              }
              notation(w, Y) {
                var D = new K(this, w, Y);
                return this.children.push(D), this;
              }
              toString(w) {
                return this.options.writer.docType(this, this.options.writer.filterOptions(w));
              }
              ele(w, Y) {
                return this.element(w, Y);
              }
              att(w, Y, D, j, M) {
                return this.attList(w, Y, D, j, M);
              }
              ent(w, Y) {
                return this.entity(w, Y);
              }
              pent(w, Y) {
                return this.pEntity(w, Y);
              }
              not(w, Y) {
                return this.notation(w, Y);
              }
              up() {
                return this.root() || this.documentObject;
              }
              isEqualNode(w) {
                if (!super.isEqualNode(w)) return !1;
                if (w.name !== this.name) return !1;
                if (w.publicId !== this.publicId) return !1;
                if (w.systemId !== this.systemId) return !1;
                return !0;
              }
            }
            return (
              Object.defineProperty(f.prototype, "entities", {
                get: function () {
                  var w, Y, D, j, M;
                  (j = {}), (M = this.children);
                  for (Y = 0, D = M.length; Y < D; Y++)
                    if (((w = M[Y]), w.type === H.EntityDeclaration && !w.pe)) j[w.name] = w;
                  return new T(j);
                },
              }),
              Object.defineProperty(f.prototype, "notations", {
                get: function () {
                  var w, Y, D, j, M;
                  (j = {}), (M = this.children);
                  for (Y = 0, D = M.length; Y < D; Y++)
                    if (((w = M[Y]), w.type === H.NotationDeclaration)) j[w.name] = w;
                  return new T(j);
                },
              }),
              Object.defineProperty(f.prototype, "publicId", {
                get: function () {
                  return this.pubID;
                },
              }),
              Object.defineProperty(f.prototype, "systemId", {
                get: function () {
                  return this.sysID;
                },
              }),
              Object.defineProperty(f.prototype, "internalSubset", {
                get: function () {
                  throw Error("This DOM method is not implemented." + this.debugInfo());
                },
              }),
              f
            );
          }.call(this));
    }).call(Hr7);
  });

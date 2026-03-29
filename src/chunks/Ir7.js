  var Ir7 = d((Cr7, br7) => {
    (function () {
      var H,
        _,
        q,
        $,
        K = {}.hasOwnProperty;
      (H = u2()),
        ($ = en6()),
        (_ = CtH()),
        (br7.exports = q =
          class extends $ {
            constructor(T, z) {
              super(z);
              this.stream = T;
            }
            endline(T, z, A) {
              if (T.isLastRootNode && z.state === _.CloseTag) return "";
              else return super.endline(T, z, A);
            }
            document(T, z) {
              var A, f, w, Y, D, j, M, J, P;
              M = T.children;
              for (f = w = 0, D = M.length; w < D; f = ++w)
                (A = M[f]), (A.isLastRootNode = f === T.children.length - 1);
              (z = this.filterOptions(z)), (J = T.children), (P = []);
              for (Y = 0, j = J.length; Y < j; Y++) (A = J[Y]), P.push(this.writeChildNode(A, z, 0));
              return P;
            }
            cdata(T, z, A) {
              return this.stream.write(super.cdata(T, z, A));
            }
            comment(T, z, A) {
              return this.stream.write(super.comment(T, z, A));
            }
            declaration(T, z, A) {
              return this.stream.write(super.declaration(T, z, A));
            }
            docType(T, z, A) {
              var f, w, Y, D;
              if (
                (A || (A = 0),
                this.openNode(T, z, A),
                (z.state = _.OpenTag),
                this.stream.write(this.indent(T, z, A)),
                this.stream.write("<!DOCTYPE " + T.root().name),
                T.pubID && T.sysID)
              )
                this.stream.write(' PUBLIC "' + T.pubID + '" "' + T.sysID + '"');
              else if (T.sysID) this.stream.write(' SYSTEM "' + T.sysID + '"');
              if (T.children.length > 0) {
                this.stream.write(" ["),
                  this.stream.write(this.endline(T, z, A)),
                  (z.state = _.InsideTag),
                  (D = T.children);
                for (w = 0, Y = D.length; w < Y; w++) (f = D[w]), this.writeChildNode(f, z, A + 1);
                (z.state = _.CloseTag), this.stream.write("]");
              }
              return (
                (z.state = _.CloseTag),
                this.stream.write(z.spaceBeforeSlash + ">"),
                this.stream.write(this.endline(T, z, A)),
                (z.state = _.None),
                this.closeNode(T, z, A)
              );
            }
            element(T, z, A) {
              var f, w, Y, D, j, M, J, P, X, R, W, Z, k, v, y, E;
              if (
                (A || (A = 0),
                this.openNode(T, z, A),
                (z.state = _.OpenTag),
                (W = this.indent(T, z, A) + "<" + T.name),
                z.pretty && z.width > 0)
              ) {
                (J = W.length), (k = T.attribs);
                for (X in k) {
                  if (!K.call(k, X)) continue;
                  if (((f = k[X]), (Z = this.attribute(f, z, A)), (w = Z.length), J + w > z.width))
                    (E = this.indent(T, z, A + 1) + Z), (W += this.endline(T, z, A) + E), (J = E.length);
                  else (E = " " + Z), (W += E), (J += E.length);
                }
              } else {
                v = T.attribs;
                for (X in v) {
                  if (!K.call(v, X)) continue;
                  (f = v[X]), (W += this.attribute(f, z, A));
                }
              }
              if (
                (this.stream.write(W),
                (D = T.children.length),
                (j = D === 0 ? null : T.children[0]),
                D === 0 ||
                  T.children.every(function (S) {
                    return (S.type === H.Text || S.type === H.Raw || S.type === H.CData) && S.value === "";
                  }))
              )
                if (z.allowEmpty)
                  this.stream.write(">"), (z.state = _.CloseTag), this.stream.write("</" + T.name + ">");
                else (z.state = _.CloseTag), this.stream.write(z.spaceBeforeSlash + "/>");
              else if (
                z.pretty &&
                D === 1 &&
                (j.type === H.Text || j.type === H.Raw || j.type === H.CData) &&
                j.value != null
              )
                this.stream.write(">"),
                  (z.state = _.InsideTag),
                  z.suppressPrettyCount++,
                  (R = !0),
                  this.writeChildNode(j, z, A + 1),
                  z.suppressPrettyCount--,
                  (R = !1),
                  (z.state = _.CloseTag),
                  this.stream.write("</" + T.name + ">");
              else {
                this.stream.write(">" + this.endline(T, z, A)), (z.state = _.InsideTag), (y = T.children);
                for (M = 0, P = y.length; M < P; M++) (Y = y[M]), this.writeChildNode(Y, z, A + 1);
                (z.state = _.CloseTag), this.stream.write(this.indent(T, z, A) + "</" + T.name + ">");
              }
              return this.stream.write(this.endline(T, z, A)), (z.state = _.None), this.closeNode(T, z, A);
            }
            processingInstruction(T, z, A) {
              return this.stream.write(super.processingInstruction(T, z, A));
            }
            raw(T, z, A) {
              return this.stream.write(super.raw(T, z, A));
            }
            text(T, z, A) {
              return this.stream.write(super.text(T, z, A));
            }
            dtdAttList(T, z, A) {
              return this.stream.write(super.dtdAttList(T, z, A));
            }
            dtdElement(T, z, A) {
              return this.stream.write(super.dtdElement(T, z, A));
            }
            dtdEntity(T, z, A) {
              return this.stream.write(super.dtdEntity(T, z, A));
            }
            dtdNotation(T, z, A) {
              return this.stream.write(super.dtdNotation(T, z, A));
            }
          });
    }).call(Cr7);
  });

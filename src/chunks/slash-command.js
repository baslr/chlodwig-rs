  var en6 = d((Lr7, kr7) => {
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
        X = {}.hasOwnProperty;
      ({ assign: P } = ec()),
        (H = u2()),
        (A = Rp_()),
        (f = Np_()),
        (q = Wp_()),
        ($ = Gp_()),
        (Y = Xp_()),
        (j = hp_()),
        (M = yp_()),
        (D = Vp_()),
        (w = sn6()),
        (K = Zp_()),
        (O = kp_()),
        (T = Lp_()),
        (z = vp_()),
        (_ = CtH()),
        (kr7.exports = J =
          class {
            constructor(W) {
              var Z, k, v;
              W || (W = {}), (this.options = W), (k = W.writer || {});
              for (Z in k) {
                if (!X.call(k, Z)) continue;
                (v = k[Z]), (this["_" + Z] = this[Z]), (this[Z] = v);
              }
            }
            filterOptions(W) {
              var Z, k, v, y, E, S, x, I, B;
              if (
                (W || (W = {}),
                (W = P({}, this.options, W)),
                (Z = { writer: this }),
                (Z.pretty = W.pretty || !1),
                (Z.allowEmpty = W.allowEmpty || !1),
                (Z.indent = (k = W.indent) != null ? k : "  "),
                (Z.newline =
                  (v = W.newline) != null
                    ? v
                    : `
`),
                (Z.offset = (y = W.offset) != null ? y : 0),
                (Z.width = (E = W.width) != null ? E : 0),
                (Z.dontPrettyTextNodes =
                  (S = (x = W.dontPrettyTextNodes) != null ? x : W.dontprettytextnodes) != null ? S : 0),
                (Z.spaceBeforeSlash = (I = (B = W.spaceBeforeSlash) != null ? B : W.spacebeforeslash) != null ? I : ""),
                Z.spaceBeforeSlash === !0)
              )
                Z.spaceBeforeSlash = " ";
              return (Z.suppressPrettyCount = 0), (Z.user = {}), (Z.state = _.None), Z;
            }
            indent(W, Z, k) {
              var v;
              if (!Z.pretty || Z.suppressPrettyCount) return "";
              else if (Z.pretty) {
                if (((v = (k || 0) + Z.offset + 1), v > 0)) return Array(v).join(Z.indent);
              }
              return "";
            }
            endline(W, Z, k) {
              if (!Z.pretty || Z.suppressPrettyCount) return "";
              else return Z.newline;
            }
            attribute(W, Z, k) {
              var v;
              if ((this.openAttribute(W, Z, k), Z.pretty && Z.width > 0)) v = W.name + '="' + W.value + '"';
              else v = " " + W.name + '="' + W.value + '"';
              return this.closeAttribute(W, Z, k), v;
            }
            cdata(W, Z, k) {
              var v;
              return (
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<![CDATA["),
                (Z.state = _.InsideTag),
                (v += W.value),
                (Z.state = _.CloseTag),
                (v += "]]>" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            comment(W, Z, k) {
              var v;
              return (
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<!-- "),
                (Z.state = _.InsideTag),
                (v += W.value),
                (Z.state = _.CloseTag),
                (v += " -->" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            declaration(W, Z, k) {
              var v;
              if (
                (this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<?xml"),
                (Z.state = _.InsideTag),
                (v += ' version="' + W.version + '"'),
                W.encoding != null)
              )
                v += ' encoding="' + W.encoding + '"';
              if (W.standalone != null) v += ' standalone="' + W.standalone + '"';
              return (
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + "?>"),
                (v += this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            docType(W, Z, k) {
              var v, y, E, S, x;
              if (
                (k || (k = 0),
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (S = this.indent(W, Z, k)),
                (S += "<!DOCTYPE " + W.root().name),
                W.pubID && W.sysID)
              )
                S += ' PUBLIC "' + W.pubID + '" "' + W.sysID + '"';
              else if (W.sysID) S += ' SYSTEM "' + W.sysID + '"';
              if (W.children.length > 0) {
                (S += " ["), (S += this.endline(W, Z, k)), (Z.state = _.InsideTag), (x = W.children);
                for (y = 0, E = x.length; y < E; y++) (v = x[y]), (S += this.writeChildNode(v, Z, k + 1));
                (Z.state = _.CloseTag), (S += "]");
              }
              return (
                (Z.state = _.CloseTag),
                (S += Z.spaceBeforeSlash + ">"),
                (S += this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                S
              );
            }
            element(W, Z, k) {
              var v, y, E, S, x, I, B, p, C, g, c, U, i, _H, HH, e, qH, r, $H;
              if (
                (k || (k = 0),
                (U = !1),
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (i = this.indent(W, Z, k) + "<" + W.name),
                Z.pretty && Z.width > 0)
              ) {
                (p = i.length), (HH = W.attribs);
                for (c in HH) {
                  if (!X.call(HH, c)) continue;
                  if (((v = HH[c]), (_H = this.attribute(v, Z, k)), (y = _H.length), p + y > Z.width))
                    ($H = this.indent(W, Z, k + 1) + _H), (i += this.endline(W, Z, k) + $H), (p = $H.length);
                  else ($H = " " + _H), (i += $H), (p += $H.length);
                }
              } else {
                e = W.attribs;
                for (c in e) {
                  if (!X.call(e, c)) continue;
                  (v = e[c]), (i += this.attribute(v, Z, k));
                }
              }
              if (
                ((S = W.children.length),
                (x = S === 0 ? null : W.children[0]),
                S === 0 ||
                  W.children.every(function (DH) {
                    return (DH.type === H.Text || DH.type === H.Raw || DH.type === H.CData) && DH.value === "";
                  }))
              )
                if (Z.allowEmpty)
                  (i += ">"), (Z.state = _.CloseTag), (i += "</" + W.name + ">" + this.endline(W, Z, k));
                else (Z.state = _.CloseTag), (i += Z.spaceBeforeSlash + "/>" + this.endline(W, Z, k));
              else if (
                Z.pretty &&
                S === 1 &&
                (x.type === H.Text || x.type === H.Raw || x.type === H.CData) &&
                x.value != null
              )
                (i += ">"),
                  (Z.state = _.InsideTag),
                  Z.suppressPrettyCount++,
                  (U = !0),
                  (i += this.writeChildNode(x, Z, k + 1)),
                  Z.suppressPrettyCount--,
                  (U = !1),
                  (Z.state = _.CloseTag),
                  (i += "</" + W.name + ">" + this.endline(W, Z, k));
              else {
                if (Z.dontPrettyTextNodes) {
                  qH = W.children;
                  for (I = 0, C = qH.length; I < C; I++)
                    if (
                      ((E = qH[I]), (E.type === H.Text || E.type === H.Raw || E.type === H.CData) && E.value != null)
                    ) {
                      Z.suppressPrettyCount++, (U = !0);
                      break;
                    }
                }
                (i += ">" + this.endline(W, Z, k)), (Z.state = _.InsideTag), (r = W.children);
                for (B = 0, g = r.length; B < g; B++) (E = r[B]), (i += this.writeChildNode(E, Z, k + 1));
                if (((Z.state = _.CloseTag), (i += this.indent(W, Z, k) + "</" + W.name + ">"), U))
                  Z.suppressPrettyCount--;
                (i += this.endline(W, Z, k)), (Z.state = _.None);
              }
              return this.closeNode(W, Z, k), i;
            }
            writeChildNode(W, Z, k) {
              switch (W.type) {
                case H.CData:
                  return this.cdata(W, Z, k);
                case H.Comment:
                  return this.comment(W, Z, k);
                case H.Element:
                  return this.element(W, Z, k);
                case H.Raw:
                  return this.raw(W, Z, k);
                case H.Text:
                  return this.text(W, Z, k);
                case H.ProcessingInstruction:
                  return this.processingInstruction(W, Z, k);
                case H.Dummy:
                  return "";
                case H.Declaration:
                  return this.declaration(W, Z, k);
                case H.DocType:
                  return this.docType(W, Z, k);
                case H.AttributeDeclaration:
                  return this.dtdAttList(W, Z, k);
                case H.ElementDeclaration:
                  return this.dtdElement(W, Z, k);
                case H.EntityDeclaration:
                  return this.dtdEntity(W, Z, k);
                case H.NotationDeclaration:
                  return this.dtdNotation(W, Z, k);
                default:
                  throw Error("Unknown XML node type: " + W.constructor.name);
              }
            }
            processingInstruction(W, Z, k) {
              var v;
              if (
                (this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<?"),
                (Z.state = _.InsideTag),
                (v += W.target),
                W.value)
              )
                v += " " + W.value;
              return (
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + "?>"),
                (v += this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            raw(W, Z, k) {
              var v;
              return (
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k)),
                (Z.state = _.InsideTag),
                (v += W.value),
                (Z.state = _.CloseTag),
                (v += this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            text(W, Z, k) {
              var v;
              return (
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k)),
                (Z.state = _.InsideTag),
                (v += W.value),
                (Z.state = _.CloseTag),
                (v += this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            dtdAttList(W, Z, k) {
              var v;
              if (
                (this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<!ATTLIST"),
                (Z.state = _.InsideTag),
                (v += " " + W.elementName + " " + W.attributeName + " " + W.attributeType),
                W.defaultValueType !== "#DEFAULT")
              )
                v += " " + W.defaultValueType;
              if (W.defaultValue) v += ' "' + W.defaultValue + '"';
              return (
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + ">" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            dtdElement(W, Z, k) {
              var v;
              return (
                this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<!ELEMENT"),
                (Z.state = _.InsideTag),
                (v += " " + W.name + " " + W.value),
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + ">" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            dtdEntity(W, Z, k) {
              var v;
              if (
                (this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<!ENTITY"),
                (Z.state = _.InsideTag),
                W.pe)
              )
                v += " %";
              if (((v += " " + W.name), W.value)) v += ' "' + W.value + '"';
              else {
                if (W.pubID && W.sysID) v += ' PUBLIC "' + W.pubID + '" "' + W.sysID + '"';
                else if (W.sysID) v += ' SYSTEM "' + W.sysID + '"';
                if (W.nData) v += " NDATA " + W.nData;
              }
              return (
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + ">" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            dtdNotation(W, Z, k) {
              var v;
              if (
                (this.openNode(W, Z, k),
                (Z.state = _.OpenTag),
                (v = this.indent(W, Z, k) + "<!NOTATION"),
                (Z.state = _.InsideTag),
                (v += " " + W.name),
                W.pubID && W.sysID)
              )
                v += ' PUBLIC "' + W.pubID + '" "' + W.sysID + '"';
              else if (W.pubID) v += ' PUBLIC "' + W.pubID + '"';
              else if (W.sysID) v += ' SYSTEM "' + W.sysID + '"';
              return (
                (Z.state = _.CloseTag),
                (v += Z.spaceBeforeSlash + ">" + this.endline(W, Z, k)),
                (Z.state = _.None),
                this.closeNode(W, Z, k),
                v
              );
            }
            openNode(W, Z, k) {}
            closeNode(W, Z, k) {}
            openAttribute(W, Z, k) {}
            closeAttribute(W, Z, k) {}
          });
    }).call(Lr7);
  });

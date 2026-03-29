  var SC8 = d((E$5, VC8) => {
    (() => {
      var H = {
          d: (TH, wH) => {
            for (var dH in wH)
              H.o(wH, dH) && !H.o(TH, dH) && Object.defineProperty(TH, dH, { enumerable: !0, get: wH[dH] });
          },
          o: (TH, wH) => Object.prototype.hasOwnProperty.call(TH, wH),
          r: (TH) => {
            typeof Symbol < "u" &&
              Symbol.toStringTag &&
              Object.defineProperty(TH, Symbol.toStringTag, { value: "Module" }),
              Object.defineProperty(TH, "__esModule", { value: !0 });
          },
        },
        _ = {};
      H.r(_), H.d(_, { XMLBuilder: () => WH, XMLParser: () => bH, XMLValidator: () => FH });
      let q =
          ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
        $ = new RegExp("^[" + q + "][" + q + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
      function K(TH, wH) {
        let dH = [],
          JH = wH.exec(TH);
        for (; JH; ) {
          let LH = [];
          LH.startIndex = wH.lastIndex - JH[0].length;
          let xH = JH.length;
          for (let tH = 0; tH < xH; tH++) LH.push(JH[tH]);
          dH.push(LH), (JH = wH.exec(TH));
        }
        return dH;
      }
      let O = function (TH) {
          return $.exec(TH) != null;
        },
        T = { allowBooleanAttributes: !1, unpairedTags: [] };
      function z(TH, wH) {
        wH = Object.assign({}, T, wH);
        let dH = [],
          JH = !1,
          LH = !1;
        TH[0] === "\uFEFF" && (TH = TH.substr(1));
        for (let xH = 0; xH < TH.length; xH++)
          if (TH[xH] === "<" && TH[xH + 1] === "?") {
            if (((xH += 2), (xH = f(TH, xH)), xH.err)) return xH;
          } else {
            if (TH[xH] !== "<") {
              if (A(TH[xH])) continue;
              return X("InvalidChar", "char '" + TH[xH] + "' is not expected.", Z(TH, xH));
            }
            {
              let tH = xH;
              if ((xH++, TH[xH] === "!")) {
                xH = w(TH, xH);
                continue;
              }
              {
                let D_ = !1;
                TH[xH] === "/" && ((D_ = !0), xH++);
                let w_ = "";
                for (
                  ;
                  xH < TH.length &&
                  TH[xH] !== ">" &&
                  TH[xH] !== " " &&
                  TH[xH] !== "\t" &&
                  TH[xH] !==
                    `
` &&
                  TH[xH] !== "\r";
                  xH++
                )
                  w_ += TH[xH];
                if (
                  ((w_ = w_.trim()), w_[w_.length - 1] === "/" && ((w_ = w_.substring(0, w_.length - 1)), xH--), !W(w_))
                ) {
                  let l_;
                  return (
                    (l_ = w_.trim().length === 0 ? "Invalid space after '<'." : "Tag '" + w_ + "' is an invalid name."),
                    X("InvalidTag", l_, Z(TH, xH))
                  );
                }
                let y_ = j(TH, xH);
                if (y_ === !1) return X("InvalidAttr", "Attributes for '" + w_ + "' have open quote.", Z(TH, xH));
                let O6 = y_.value;
                if (((xH = y_.index), O6[O6.length - 1] === "/")) {
                  let l_ = xH - O6.length;
                  O6 = O6.substring(0, O6.length - 1);
                  let f8 = J(O6, wH);
                  if (f8 !== !0) return X(f8.err.code, f8.err.msg, Z(TH, l_ + f8.err.line));
                  JH = !0;
                } else if (D_) {
                  if (!y_.tagClosed)
                    return X("InvalidTag", "Closing tag '" + w_ + "' doesn't have proper closing.", Z(TH, xH));
                  if (O6.trim().length > 0)
                    return X(
                      "InvalidTag",
                      "Closing tag '" + w_ + "' can't have attributes or invalid starting.",
                      Z(TH, tH),
                    );
                  if (dH.length === 0)
                    return X("InvalidTag", "Closing tag '" + w_ + "' has not been opened.", Z(TH, tH));
                  {
                    let l_ = dH.pop();
                    if (w_ !== l_.tagName) {
                      let f8 = Z(TH, l_.tagStartPos);
                      return X(
                        "InvalidTag",
                        "Expected closing tag '" +
                          l_.tagName +
                          "' (opened in line " +
                          f8.line +
                          ", col " +
                          f8.col +
                          ") instead of closing tag '" +
                          w_ +
                          "'.",
                        Z(TH, tH),
                      );
                    }
                    dH.length == 0 && (LH = !0);
                  }
                } else {
                  let l_ = J(O6, wH);
                  if (l_ !== !0) return X(l_.err.code, l_.err.msg, Z(TH, xH - O6.length + l_.err.line));
                  if (LH === !0) return X("InvalidXml", "Multiple possible root nodes found.", Z(TH, xH));
                  wH.unpairedTags.indexOf(w_) !== -1 || dH.push({ tagName: w_, tagStartPos: tH }), (JH = !0);
                }
                for (xH++; xH < TH.length; xH++)
                  if (TH[xH] === "<") {
                    if (TH[xH + 1] === "!") {
                      xH++, (xH = w(TH, xH));
                      continue;
                    }
                    if (TH[xH + 1] !== "?") break;
                    if (((xH = f(TH, ++xH)), xH.err)) return xH;
                  } else if (TH[xH] === "&") {
                    let l_ = P(TH, xH);
                    if (l_ == -1) return X("InvalidChar", "char '&' is not expected.", Z(TH, xH));
                    xH = l_;
                  } else if (LH === !0 && !A(TH[xH])) return X("InvalidXml", "Extra text at the end", Z(TH, xH));
                TH[xH] === "<" && xH--;
              }
            }
          }
        return JH
          ? dH.length == 1
            ? X("InvalidTag", "Unclosed tag '" + dH[0].tagName + "'.", Z(TH, dH[0].tagStartPos))
            : !(dH.length > 0) ||
              X(
                "InvalidXml",
                "Invalid '" +
                  JSON.stringify(
                    dH.map((xH) => xH.tagName),
                    null,
                    4,
                  ).replace(/\r?\n/g, "") +
                  "' found.",
                { line: 1, col: 1 },
              )
          : X("InvalidXml", "Start tag expected.", 1);
      }
      function A(TH) {
        return (
          TH === " " ||
          TH === "\t" ||
          TH ===
            `
` ||
          TH === "\r"
        );
      }
      function f(TH, wH) {
        let dH = wH;
        for (; wH < TH.length; wH++)
          if (TH[wH] == "?" || TH[wH] == " ") {
            let JH = TH.substr(dH, wH - dH);
            if (wH > 5 && JH === "xml")
              return X("InvalidXml", "XML declaration allowed only at the start of the document.", Z(TH, wH));
            if (TH[wH] == "?" && TH[wH + 1] == ">") {
              wH++;
              break;
            }
            continue;
          }
        return wH;
      }
      function w(TH, wH) {
        if (TH.length > wH + 5 && TH[wH + 1] === "-" && TH[wH + 2] === "-") {
          for (wH += 3; wH < TH.length; wH++)
            if (TH[wH] === "-" && TH[wH + 1] === "-" && TH[wH + 2] === ">") {
              wH += 2;
              break;
            }
        } else if (
          TH.length > wH + 8 &&
          TH[wH + 1] === "D" &&
          TH[wH + 2] === "O" &&
          TH[wH + 3] === "C" &&
          TH[wH + 4] === "T" &&
          TH[wH + 5] === "Y" &&
          TH[wH + 6] === "P" &&
          TH[wH + 7] === "E"
        ) {
          let dH = 1;
          for (wH += 8; wH < TH.length; wH++)
            if (TH[wH] === "<") dH++;
            else if (TH[wH] === ">" && (dH--, dH === 0)) break;
        } else if (
          TH.length > wH + 9 &&
          TH[wH + 1] === "[" &&
          TH[wH + 2] === "C" &&
          TH[wH + 3] === "D" &&
          TH[wH + 4] === "A" &&
          TH[wH + 5] === "T" &&
          TH[wH + 6] === "A" &&
          TH[wH + 7] === "["
        ) {
          for (wH += 8; wH < TH.length; wH++)
            if (TH[wH] === "]" && TH[wH + 1] === "]" && TH[wH + 2] === ">") {
              wH += 2;
              break;
            }
        }
        return wH;
      }
      let Y = '"',
        D = "'";
      function j(TH, wH) {
        let dH = "",
          JH = "",
          LH = !1;
        for (; wH < TH.length; wH++) {
          if (TH[wH] === Y || TH[wH] === D) JH === "" ? (JH = TH[wH]) : JH !== TH[wH] || (JH = "");
          else if (TH[wH] === ">" && JH === "") {
            LH = !0;
            break;
          }
          dH += TH[wH];
        }
        return JH === "" && { value: dH, index: wH, tagClosed: LH };
      }
      let M = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
      function J(TH, wH) {
        let dH = K(TH, M),
          JH = {};
        for (let LH = 0; LH < dH.length; LH++) {
          if (dH[LH][1].length === 0)
            return X("InvalidAttr", "Attribute '" + dH[LH][2] + "' has no space in starting.", k(dH[LH]));
          if (dH[LH][3] !== void 0 && dH[LH][4] === void 0)
            return X("InvalidAttr", "Attribute '" + dH[LH][2] + "' is without value.", k(dH[LH]));
          if (dH[LH][3] === void 0 && !wH.allowBooleanAttributes)
            return X("InvalidAttr", "boolean attribute '" + dH[LH][2] + "' is not allowed.", k(dH[LH]));
          let xH = dH[LH][2];
          if (!R(xH)) return X("InvalidAttr", "Attribute '" + xH + "' is an invalid name.", k(dH[LH]));
          if (Object.prototype.hasOwnProperty.call(JH, xH))
            return X("InvalidAttr", "Attribute '" + xH + "' is repeated.", k(dH[LH]));
          JH[xH] = 1;
        }
        return !0;
      }
      function P(TH, wH) {
        if (TH[++wH] === ";") return -1;
        if (TH[wH] === "#")
          return (function (JH, LH) {
            let xH = /\d/;
            for (JH[LH] === "x" && (LH++, (xH = /[\da-fA-F]/)); LH < JH.length; LH++) {
              if (JH[LH] === ";") return LH;
              if (!JH[LH].match(xH)) break;
            }
            return -1;
          })(TH, ++wH);
        let dH = 0;
        for (; wH < TH.length; wH++, dH++)
          if (!(TH[wH].match(/\w/) && dH < 20)) {
            if (TH[wH] === ";") break;
            return -1;
          }
        return wH;
      }
      function X(TH, wH, dH) {
        return { err: { code: TH, msg: wH, line: dH.line || dH, col: dH.col } };
      }
      function R(TH) {
        return O(TH);
      }
      function W(TH) {
        return O(TH);
      }
      function Z(TH, wH) {
        let dH = TH.substring(0, wH).split(/\r?\n/);
        return { line: dH.length, col: dH[dH.length - 1].length + 1 };
      }
      function k(TH) {
        return TH.startIndex + TH[1].length;
      }
      let v = {
        preserveOrder: !1,
        attributeNamePrefix: "@_",
        attributesGroupName: !1,
        textNodeName: "#text",
        ignoreAttributes: !0,
        removeNSPrefix: !1,
        allowBooleanAttributes: !1,
        parseTagValue: !0,
        parseAttributeValue: !1,
        trimValues: !0,
        cdataPropName: !1,
        numberParseOptions: { hex: !0, leadingZeros: !0, eNotation: !0 },
        tagValueProcessor: function (TH, wH) {
          return wH;
        },
        attributeValueProcessor: function (TH, wH) {
          return wH;
        },
        stopNodes: [],
        alwaysCreateTextNode: !1,
        isArray: () => !1,
        commentPropName: !1,
        unpairedTags: [],
        processEntities: !0,
        htmlEntities: !1,
        ignoreDeclaration: !1,
        ignorePiTags: !1,
        transformTagName: !1,
        transformAttributeName: !1,
        updateTag: function (TH, wH, dH) {
          return TH;
        },
        captureMetaData: !1,
        maxNestedTags: 100,
        strictReservedNames: !0,
      };
      function y(TH) {
        return typeof TH == "boolean"
          ? {
              enabled: TH,
              maxEntitySize: 1e4,
              maxExpansionDepth: 10,
              maxTotalExpansions: 1000,
              maxExpandedLength: 1e5,
              allowedTags: null,
              tagFilter: null,
            }
          : typeof TH == "object" && TH !== null
            ? {
                enabled: TH.enabled !== !1,
                maxEntitySize: TH.maxEntitySize ?? 1e4,
                maxExpansionDepth: TH.maxExpansionDepth ?? 10,
                maxTotalExpansions: TH.maxTotalExpansions ?? 1000,
                maxExpandedLength: TH.maxExpandedLength ?? 1e5,
                allowedTags: TH.allowedTags ?? null,
                tagFilter: TH.tagFilter ?? null,
              }
            : y(!0);
      }
      let E = function (TH) {
          let wH = Object.assign({}, v, TH);
          return (wH.processEntities = y(wH.processEntities)), wH;
        },
        S;
      S = typeof Symbol != "function" ? "@@xmlMetadata" : Symbol("XML Node Metadata");
      class x {
        constructor(TH) {
          (this.tagname = TH), (this.child = []), (this[":@"] = Object.create(null));
        }
        add(TH, wH) {
          TH === "__proto__" && (TH = "#__proto__"), this.child.push({ [TH]: wH });
        }
        addChild(TH, wH) {
          TH.tagname === "__proto__" && (TH.tagname = "#__proto__"),
            TH[":@"] && Object.keys(TH[":@"]).length > 0
              ? this.child.push({ [TH.tagname]: TH.child, ":@": TH[":@"] })
              : this.child.push({ [TH.tagname]: TH.child }),
            wH !== void 0 && (this.child[this.child.length - 1][S] = { startIndex: wH });
        }
        static getMetaDataSymbol() {
          return S;
        }
      }
      class I {
        constructor(TH) {
          (this.suppressValidationErr = !TH), (this.options = TH);
        }
        readDocType(TH, wH) {
          let dH = Object.create(null);
          if (
            TH[wH + 3] !== "O" ||
            TH[wH + 4] !== "C" ||
            TH[wH + 5] !== "T" ||
            TH[wH + 6] !== "Y" ||
            TH[wH + 7] !== "P" ||
            TH[wH + 8] !== "E"
          )
            throw Error("Invalid Tag instead of DOCTYPE");
          {
            wH += 9;
            let JH = 1,
              LH = !1,
              xH = !1,
              tH = "";
            for (; wH < TH.length; wH++)
              if (TH[wH] !== "<" || xH)
                if (TH[wH] === ">") {
                  if ((xH ? TH[wH - 1] === "-" && TH[wH - 2] === "-" && ((xH = !1), JH--) : JH--, JH === 0)) break;
                } else TH[wH] === "[" ? (LH = !0) : (tH += TH[wH]);
              else {
                if (LH && p(TH, "!ENTITY", wH)) {
                  let D_, w_;
                  if (
                    ((wH += 7),
                    ([D_, w_, wH] = this.readEntityExp(TH, wH + 1, this.suppressValidationErr)),
                    w_.indexOf("&") === -1)
                  ) {
                    let y_ = D_.replace(/[.\-+*:]/g, "\\.");
                    dH[D_] = { regx: RegExp(`&${y_};`, "g"), val: w_ };
                  }
                } else if (LH && p(TH, "!ELEMENT", wH)) {
                  wH += 8;
                  let { index: D_ } = this.readElementExp(TH, wH + 1);
                  wH = D_;
                } else if (LH && p(TH, "!ATTLIST", wH)) wH += 8;
                else if (LH && p(TH, "!NOTATION", wH)) {
                  wH += 9;
                  let { index: D_ } = this.readNotationExp(TH, wH + 1, this.suppressValidationErr);
                  wH = D_;
                } else {
                  if (!p(TH, "!--", wH)) throw Error("Invalid DOCTYPE");
                  xH = !0;
                }
                JH++, (tH = "");
              }
            if (JH !== 0) throw Error("Unclosed DOCTYPE");
          }
          return { entities: dH, i: wH };
        }
        readEntityExp(TH, wH) {
          wH = B(TH, wH);
          let dH = "";
          for (; wH < TH.length && !/\s/.test(TH[wH]) && TH[wH] !== '"' && TH[wH] !== "'"; ) (dH += TH[wH]), wH++;
          if ((C(dH), (wH = B(TH, wH)), !this.suppressValidationErr)) {
            if (TH.substring(wH, wH + 6).toUpperCase() === "SYSTEM") throw Error("External entities are not supported");
            if (TH[wH] === "%") throw Error("Parameter entities are not supported");
          }
          let JH = "";
          if (
            (([wH, JH] = this.readIdentifierVal(TH, wH, "entity")),
            this.options.enabled !== !1 && this.options.maxEntitySize && JH.length > this.options.maxEntitySize)
          )
            throw Error(
              `Entity "${dH}" size (${JH.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`,
            );
          return [dH, JH, --wH];
        }
        readNotationExp(TH, wH) {
          wH = B(TH, wH);
          let dH = "";
          for (; wH < TH.length && !/\s/.test(TH[wH]); ) (dH += TH[wH]), wH++;
          !this.suppressValidationErr && C(dH), (wH = B(TH, wH));
          let JH = TH.substring(wH, wH + 6).toUpperCase();
          if (!this.suppressValidationErr && JH !== "SYSTEM" && JH !== "PUBLIC")
            throw Error(`Expected SYSTEM or PUBLIC, found "${JH}"`);
          (wH += JH.length), (wH = B(TH, wH));
          let LH = null,
            xH = null;
          if (JH === "PUBLIC")
            ([wH, LH] = this.readIdentifierVal(TH, wH, "publicIdentifier")),
              (TH[(wH = B(TH, wH))] !== '"' && TH[wH] !== "'") ||
                ([wH, xH] = this.readIdentifierVal(TH, wH, "systemIdentifier"));
          else if (
            JH === "SYSTEM" &&
            (([wH, xH] = this.readIdentifierVal(TH, wH, "systemIdentifier")), !this.suppressValidationErr && !xH)
          )
            throw Error("Missing mandatory system identifier for SYSTEM notation");
          return { notationName: dH, publicIdentifier: LH, systemIdentifier: xH, index: --wH };
        }
        readIdentifierVal(TH, wH, dH) {
          let JH = "",
            LH = TH[wH];
          if (LH !== '"' && LH !== "'") throw Error(`Expected quoted string, found "${LH}"`);
          for (wH++; wH < TH.length && TH[wH] !== LH; ) (JH += TH[wH]), wH++;
          if (TH[wH] !== LH) throw Error(`Unterminated ${dH} value`);
          return [++wH, JH];
        }
        readElementExp(TH, wH) {
          wH = B(TH, wH);
          let dH = "";
          for (; wH < TH.length && !/\s/.test(TH[wH]); ) (dH += TH[wH]), wH++;
          if (!this.suppressValidationErr && !O(dH)) throw Error(`Invalid element name: "${dH}"`);
          let JH = "";
          if (TH[(wH = B(TH, wH))] === "E" && p(TH, "MPTY", wH)) wH += 4;
          else if (TH[wH] === "A" && p(TH, "NY", wH)) wH += 2;
          else if (TH[wH] === "(") {
            for (wH++; wH < TH.length && TH[wH] !== ")"; ) (JH += TH[wH]), wH++;
            if (TH[wH] !== ")") throw Error("Unterminated content model");
          } else if (!this.suppressValidationErr) throw Error(`Invalid Element Expression, found "${TH[wH]}"`);
          return { elementName: dH, contentModel: JH.trim(), index: wH };
        }
        readAttlistExp(TH, wH) {
          wH = B(TH, wH);
          let dH = "";
          for (; wH < TH.length && !/\s/.test(TH[wH]); ) (dH += TH[wH]), wH++;
          C(dH), (wH = B(TH, wH));
          let JH = "";
          for (; wH < TH.length && !/\s/.test(TH[wH]); ) (JH += TH[wH]), wH++;
          if (!C(JH)) throw Error(`Invalid attribute name: "${JH}"`);
          wH = B(TH, wH);
          let LH = "";
          if (TH.substring(wH, wH + 8).toUpperCase() === "NOTATION") {
            if (((LH = "NOTATION"), TH[(wH = B(TH, (wH += 8)))] !== "("))
              throw Error(`Expected '(', found "${TH[wH]}"`);
            wH++;
            let tH = [];
            for (; wH < TH.length && TH[wH] !== ")"; ) {
              let D_ = "";
              for (; wH < TH.length && TH[wH] !== "|" && TH[wH] !== ")"; ) (D_ += TH[wH]), wH++;
              if (((D_ = D_.trim()), !C(D_))) throw Error(`Invalid notation name: "${D_}"`);
              tH.push(D_), TH[wH] === "|" && (wH++, (wH = B(TH, wH)));
            }
            if (TH[wH] !== ")") throw Error("Unterminated list of notations");
            wH++, (LH += " (" + tH.join("|") + ")");
          } else {
            for (; wH < TH.length && !/\s/.test(TH[wH]); ) (LH += TH[wH]), wH++;
            let tH = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
            if (!this.suppressValidationErr && !tH.includes(LH.toUpperCase()))
              throw Error(`Invalid attribute type: "${LH}"`);
          }
          wH = B(TH, wH);
          let xH = "";
          return (
            TH.substring(wH, wH + 8).toUpperCase() === "#REQUIRED"
              ? ((xH = "#REQUIRED"), (wH += 8))
              : TH.substring(wH, wH + 7).toUpperCase() === "#IMPLIED"
                ? ((xH = "#IMPLIED"), (wH += 7))
                : ([wH, xH] = this.readIdentifierVal(TH, wH, "ATTLIST")),
            { elementName: dH, attributeName: JH, attributeType: LH, defaultValue: xH, index: wH }
          );
        }
      }
      let B = (TH, wH) => {
        for (; wH < TH.length && /\s/.test(TH[wH]); ) wH++;
        return wH;
      };
      function p(TH, wH, dH) {
        for (let JH = 0; JH < wH.length; JH++) if (wH[JH] !== TH[dH + JH + 1]) return !1;
        return !0;
      }
      function C(TH) {
        if (O(TH)) return TH;
        throw Error(`Invalid entity name ${TH}`);
      }
      let g = /^[-+]?0x[a-fA-F0-9]+$/,
        c = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/,
        U = { hex: !0, leadingZeros: !0, decimalPoint: ".", eNotation: !0 },
        i = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
      function _H(TH) {
        return typeof TH == "function"
          ? TH
          : Array.isArray(TH)
            ? (wH) => {
                for (let dH of TH) {
                  if (typeof dH == "string" && wH === dH) return !0;
                  if (dH instanceof RegExp && dH.test(wH)) return !0;
                }
              }
            : () => !1;
      }
      class HH {
        constructor(TH) {
          if (
            ((this.options = TH),
            (this.currentNode = null),
            (this.tagsNodeStack = []),
            (this.docTypeEntities = {}),
            (this.lastEntities = {
              apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
              gt: { regex: /&(gt|#62|#x3E);/g, val: ">" },
              lt: { regex: /&(lt|#60|#x3C);/g, val: "<" },
              quot: { regex: /&(quot|#34|#x22);/g, val: '"' },
            }),
            (this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" }),
            (this.htmlEntities = {
              space: { regex: /&(nbsp|#160);/g, val: " " },
              cent: { regex: /&(cent|#162);/g, val: "\xA2" },
              pound: { regex: /&(pound|#163);/g, val: "\xA3" },
              yen: { regex: /&(yen|#165);/g, val: "\xA5" },
              euro: { regex: /&(euro|#8364);/g, val: "\u20AC" },
              copyright: { regex: /&(copy|#169);/g, val: "\xA9" },
              reg: { regex: /&(reg|#174);/g, val: "\xAE" },
              inr: { regex: /&(inr|#8377);/g, val: "\u20B9" },
              num_dec: { regex: /&#([0-9]{1,7});/g, val: (wH, dH) => XH(dH, 10, "&#") },
              num_hex: { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (wH, dH) => XH(dH, 16, "&#x") },
            }),
            (this.addExternalEntities = e),
            (this.parseXml = fH),
            (this.parseTextData = qH),
            (this.resolveNameSpace = r),
            (this.buildAttributesMap = DH),
            (this.isItStopNode = l),
            (this.replaceEntitiesValue = KH),
            (this.readStopNodeData = s),
            (this.saveTextToParentTag = n),
            (this.addChild = vH),
            (this.ignoreAttributesFn = _H(this.options.ignoreAttributes)),
            (this.entityExpansionCount = 0),
            (this.currentExpandedLength = 0),
            this.options.stopNodes && this.options.stopNodes.length > 0)
          ) {
            (this.stopNodesExact = new Set()), (this.stopNodesWildcard = new Set());
            for (let wH = 0; wH < this.options.stopNodes.length; wH++) {
              let dH = this.options.stopNodes[wH];
              typeof dH == "string" &&
                (dH.startsWith("*.") ? this.stopNodesWildcard.add(dH.substring(2)) : this.stopNodesExact.add(dH));
            }
          }
        }
      }
      function e(TH) {
        let wH = Object.keys(TH);
        for (let dH = 0; dH < wH.length; dH++) {
          let JH = wH[dH],
            LH = JH.replace(/[.\-+*:]/g, "\\.");
          this.lastEntities[JH] = { regex: new RegExp("&" + LH + ";", "g"), val: TH[JH] };
        }
      }
      function qH(TH, wH, dH, JH, LH, xH, tH) {
        if (TH !== void 0 && (this.options.trimValues && !JH && (TH = TH.trim()), TH.length > 0)) {
          tH || (TH = this.replaceEntitiesValue(TH, wH, dH));
          let D_ = this.options.tagValueProcessor(wH, TH, dH, LH, xH);
          return D_ == null
            ? TH
            : typeof D_ != typeof TH || D_ !== TH
              ? D_
              : this.options.trimValues || TH.trim() === TH
                ? OH(TH, this.options.parseTagValue, this.options.numberParseOptions)
                : TH;
        }
      }
      function r(TH) {
        if (this.options.removeNSPrefix) {
          let wH = TH.split(":"),
            dH = TH.charAt(0) === "/" ? "/" : "";
          if (wH[0] === "xmlns") return "";
          wH.length === 2 && (TH = dH + wH[1]);
        }
        return TH;
      }
      let $H = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
      function DH(TH, wH, dH) {
        if (this.options.ignoreAttributes !== !0 && typeof TH == "string") {
          let JH = K(TH, $H),
            LH = JH.length,
            xH = {};
          for (let tH = 0; tH < LH; tH++) {
            let D_ = this.resolveNameSpace(JH[tH][1]);
            if (this.ignoreAttributesFn(D_, wH)) continue;
            let w_ = JH[tH][4],
              y_ = this.options.attributeNamePrefix + D_;
            if (D_.length)
              if (
                (this.options.transformAttributeName && (y_ = this.options.transformAttributeName(y_)),
                y_ === "__proto__" && (y_ = "#__proto__"),
                w_ !== void 0)
              ) {
                this.options.trimValues && (w_ = w_.trim()), (w_ = this.replaceEntitiesValue(w_, dH, wH));
                let O6 = this.options.attributeValueProcessor(D_, w_, wH);
                xH[y_] =
                  O6 == null
                    ? w_
                    : typeof O6 != typeof w_ || O6 !== w_
                      ? O6
                      : OH(w_, this.options.parseAttributeValue, this.options.numberParseOptions);
              } else this.options.allowBooleanAttributes && (xH[y_] = !0);
          }
          if (!Object.keys(xH).length) return;
          if (this.options.attributesGroupName) {
            let tH = {};
            return (tH[this.options.attributesGroupName] = xH), tH;
          }
          return xH;
        }
      }
      let fH = function (TH) {
        TH = TH.replace(
          /\r\n?/g,
          `
`,
        );
        let wH = new x("!xml"),
          dH = wH,
          JH = "",
          LH = "";
        (this.entityExpansionCount = 0), (this.currentExpandedLength = 0);
        let xH = new I(this.options.processEntities);
        for (let tH = 0; tH < TH.length; tH++)
          if (TH[tH] === "<")
            if (TH[tH + 1] === "/") {
              let D_ = a(TH, ">", tH, "Closing Tag is not closed."),
                w_ = TH.substring(tH + 2, D_).trim();
              if (this.options.removeNSPrefix) {
                let l_ = w_.indexOf(":");
                l_ !== -1 && (w_ = w_.substr(l_ + 1));
              }
              this.options.transformTagName && (w_ = this.options.transformTagName(w_)),
                dH && (JH = this.saveTextToParentTag(JH, dH, LH));
              let y_ = LH.substring(LH.lastIndexOf(".") + 1);
              if (w_ && this.options.unpairedTags.indexOf(w_) !== -1)
                throw Error(`Unpaired tag can not be used as closing tag: </${w_}>`);
              let O6 = 0;
              y_ && this.options.unpairedTags.indexOf(y_) !== -1
                ? ((O6 = LH.lastIndexOf(".", LH.lastIndexOf(".") - 1)), this.tagsNodeStack.pop())
                : (O6 = LH.lastIndexOf(".")),
                (LH = LH.substring(0, O6)),
                (dH = this.tagsNodeStack.pop()),
                (JH = ""),
                (tH = D_);
            } else if (TH[tH + 1] === "?") {
              let D_ = t(TH, tH, !1, "?>");
              if (!D_) throw Error("Pi Tag is not closed.");
              if (
                ((JH = this.saveTextToParentTag(JH, dH, LH)),
                (this.options.ignoreDeclaration && D_.tagName === "?xml") || this.options.ignorePiTags)
              );
              else {
                let w_ = new x(D_.tagName);
                w_.add(this.options.textNodeName, ""),
                  D_.tagName !== D_.tagExp &&
                    D_.attrExpPresent &&
                    (w_[":@"] = this.buildAttributesMap(D_.tagExp, LH, D_.tagName)),
                  this.addChild(dH, w_, LH, tH);
              }
              tH = D_.closeIndex + 1;
            } else if (TH.substr(tH + 1, 3) === "!--") {
              let D_ = a(TH, "-->", tH + 4, "Comment is not closed.");
              if (this.options.commentPropName) {
                let w_ = TH.substring(tH + 4, D_ - 2);
                (JH = this.saveTextToParentTag(JH, dH, LH)),
                  dH.add(this.options.commentPropName, [{ [this.options.textNodeName]: w_ }]);
              }
              tH = D_;
            } else if (TH.substr(tH + 1, 2) === "!D") {
              let D_ = xH.readDocType(TH, tH);
              (this.docTypeEntities = D_.entities), (tH = D_.i);
            } else if (TH.substr(tH + 1, 2) === "![") {
              let D_ = a(TH, "]]>", tH, "CDATA is not closed.") - 2,
                w_ = TH.substring(tH + 9, D_);
              JH = this.saveTextToParentTag(JH, dH, LH);
              let y_ = this.parseTextData(w_, dH.tagname, LH, !0, !1, !0, !0);
              y_ == null && (y_ = ""),
                this.options.cdataPropName
                  ? dH.add(this.options.cdataPropName, [{ [this.options.textNodeName]: w_ }])
                  : dH.add(this.options.textNodeName, y_),
                (tH = D_ + 2);
            } else {
              let D_ = t(TH, tH, this.options.removeNSPrefix),
                w_ = D_.tagName,
                y_ = D_.rawTagName,
                O6 = D_.tagExp,
                l_ = D_.attrExpPresent,
                f8 = D_.closeIndex;
              if (this.options.transformTagName) {
                let z8 = this.options.transformTagName(w_);
                O6 === w_ && (O6 = z8), (w_ = z8);
              }
              if (
                this.options.strictReservedNames &&
                (w_ === this.options.commentPropName || w_ === this.options.cdataPropName)
              )
                throw Error(`Invalid tag name: ${w_}`);
              dH && JH && dH.tagname !== "!xml" && (JH = this.saveTextToParentTag(JH, dH, LH, !1));
              let x6 = dH;
              x6 &&
                this.options.unpairedTags.indexOf(x6.tagname) !== -1 &&
                ((dH = this.tagsNodeStack.pop()), (LH = LH.substring(0, LH.lastIndexOf(".")))),
                w_ !== wH.tagname && (LH += LH ? "." + w_ : w_);
              let L6 = tH;
              if (this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, LH, w_)) {
                let z8 = "";
                if (O6.length > 0 && O6.lastIndexOf("/") === O6.length - 1)
                  w_[w_.length - 1] === "/"
                    ? ((w_ = w_.substr(0, w_.length - 1)), (LH = LH.substr(0, LH.length - 1)), (O6 = w_))
                    : (O6 = O6.substr(0, O6.length - 1)),
                    (tH = D_.closeIndex);
                else if (this.options.unpairedTags.indexOf(w_) !== -1) tH = D_.closeIndex;
                else {
                  let iq = this.readStopNodeData(TH, y_, f8 + 1);
                  if (!iq) throw Error(`Unexpected end of ${y_}`);
                  (tH = iq.i), (z8 = iq.tagContent);
                }
                let Oq = new x(w_);
                w_ !== O6 && l_ && (Oq[":@"] = this.buildAttributesMap(O6, LH, w_)),
                  z8 && (z8 = this.parseTextData(z8, w_, LH, !0, l_, !0, !0)),
                  (LH = LH.substr(0, LH.lastIndexOf("."))),
                  Oq.add(this.options.textNodeName, z8),
                  this.addChild(dH, Oq, LH, L6);
              } else {
                if (O6.length > 0 && O6.lastIndexOf("/") === O6.length - 1) {
                  if (
                    (w_[w_.length - 1] === "/"
                      ? ((w_ = w_.substr(0, w_.length - 1)), (LH = LH.substr(0, LH.length - 1)), (O6 = w_))
                      : (O6 = O6.substr(0, O6.length - 1)),
                    this.options.transformTagName)
                  ) {
                    let Oq = this.options.transformTagName(w_);
                    O6 === w_ && (O6 = Oq), (w_ = Oq);
                  }
                  let z8 = new x(w_);
                  w_ !== O6 && l_ && (z8[":@"] = this.buildAttributesMap(O6, LH, w_)),
                    this.addChild(dH, z8, LH, L6),
                    (LH = LH.substr(0, LH.lastIndexOf(".")));
                } else {
                  let z8 = new x(w_);
                  if (this.tagsNodeStack.length > this.options.maxNestedTags)
                    throw Error("Maximum nested tags exceeded");
                  this.tagsNodeStack.push(dH),
                    w_ !== O6 && l_ && (z8[":@"] = this.buildAttributesMap(O6, LH, w_)),
                    this.addChild(dH, z8, LH, L6),
                    (dH = z8);
                }
                (JH = ""), (tH = f8);
              }
            }
          else JH += TH[tH];
        return wH.child;
      };
      function vH(TH, wH, dH, JH) {
        this.options.captureMetaData || (JH = void 0);
        let LH = this.options.updateTag(wH.tagname, dH, wH[":@"]);
        LH === !1 || (typeof LH == "string" ? ((wH.tagname = LH), TH.addChild(wH, JH)) : TH.addChild(wH, JH));
      }
      let KH = function (TH, wH, dH) {
        if (TH.indexOf("&") === -1) return TH;
        let JH = this.options.processEntities;
        if (!JH.enabled) return TH;
        if (JH.allowedTags && !JH.allowedTags.includes(wH)) return TH;
        if (JH.tagFilter && !JH.tagFilter(wH, dH)) return TH;
        for (let LH in this.docTypeEntities) {
          let xH = this.docTypeEntities[LH],
            tH = TH.match(xH.regx);
          if (tH) {
            if (
              ((this.entityExpansionCount += tH.length),
              JH.maxTotalExpansions && this.entityExpansionCount > JH.maxTotalExpansions)
            )
              throw Error(`Entity expansion limit exceeded: ${this.entityExpansionCount} > ${JH.maxTotalExpansions}`);
            let D_ = TH.length;
            if (
              ((TH = TH.replace(xH.regx, xH.val)),
              JH.maxExpandedLength &&
                ((this.currentExpandedLength += TH.length - D_), this.currentExpandedLength > JH.maxExpandedLength))
            )
              throw Error(
                `Total expanded content size exceeded: ${this.currentExpandedLength} > ${JH.maxExpandedLength}`,
              );
          }
        }
        if (TH.indexOf("&") === -1) return TH;
        for (let LH in this.lastEntities) {
          let xH = this.lastEntities[LH];
          TH = TH.replace(xH.regex, xH.val);
        }
        if (TH.indexOf("&") === -1) return TH;
        if (this.options.htmlEntities)
          for (let LH in this.htmlEntities) {
            let xH = this.htmlEntities[LH];
            TH = TH.replace(xH.regex, xH.val);
          }
        return TH.replace(this.ampEntity.regex, this.ampEntity.val);
      };
      function n(TH, wH, dH, JH) {
        return (
          TH &&
            (JH === void 0 && (JH = wH.child.length === 0),
            (TH = this.parseTextData(TH, wH.tagname, dH, !1, !!wH[":@"] && Object.keys(wH[":@"]).length !== 0, JH)) !==
              void 0 &&
              TH !== "" &&
              wH.add(this.options.textNodeName, TH),
            (TH = "")),
          TH
        );
      }
      function l(TH, wH, dH, JH) {
        return !(!wH || !wH.has(JH)) || !(!TH || !TH.has(dH));
      }
      function a(TH, wH, dH, JH) {
        let LH = TH.indexOf(wH, dH);
        if (LH === -1) throw Error(JH);
        return LH + wH.length - 1;
      }
      function t(TH, wH, dH, JH = ">") {
        let LH = (function (l_, f8, x6 = ">") {
          let L6,
            z8 = "";
          for (let Oq = f8; Oq < l_.length; Oq++) {
            let iq = l_[Oq];
            if (L6) iq === L6 && (L6 = "");
            else if (iq === '"' || iq === "'") L6 = iq;
            else if (iq === x6[0]) {
              if (!x6[1]) return { data: z8, index: Oq };
              if (l_[Oq + 1] === x6[1]) return { data: z8, index: Oq };
            } else iq === "\t" && (iq = " ");
            z8 += iq;
          }
        })(TH, wH + 1, JH);
        if (!LH) return;
        let { data: xH, index: tH } = LH,
          D_ = xH.search(/\s/),
          w_ = xH,
          y_ = !0;
        D_ !== -1 && ((w_ = xH.substring(0, D_)), (xH = xH.substring(D_ + 1).trimStart()));
        let O6 = w_;
        if (dH) {
          let l_ = w_.indexOf(":");
          l_ !== -1 && ((w_ = w_.substr(l_ + 1)), (y_ = w_ !== LH.data.substr(l_ + 1)));
        }
        return { tagName: w_, tagExp: xH, closeIndex: tH, attrExpPresent: y_, rawTagName: O6 };
      }
      function s(TH, wH, dH) {
        let JH = dH,
          LH = 1;
        for (; dH < TH.length; dH++)
          if (TH[dH] === "<")
            if (TH[dH + 1] === "/") {
              let xH = a(TH, ">", dH, `${wH} is not closed`);
              if (TH.substring(dH + 2, xH).trim() === wH && (LH--, LH === 0))
                return { tagContent: TH.substring(JH, dH), i: xH };
              dH = xH;
            } else if (TH[dH + 1] === "?") dH = a(TH, "?>", dH + 1, "StopNode is not closed.");
            else if (TH.substr(dH + 1, 3) === "!--") dH = a(TH, "-->", dH + 3, "StopNode is not closed.");
            else if (TH.substr(dH + 1, 2) === "![") dH = a(TH, "]]>", dH, "StopNode is not closed.") - 2;
            else {
              let xH = t(TH, dH, ">");
              xH &&
                ((xH && xH.tagName) === wH && xH.tagExp[xH.tagExp.length - 1] !== "/" && LH++, (dH = xH.closeIndex));
            }
      }
      function OH(TH, wH, dH) {
        if (wH && typeof TH == "string") {
          let JH = TH.trim();
          return (
            JH === "true" ||
            (JH !== "false" &&
              (function (LH, xH = {}) {
                if (((xH = Object.assign({}, U, xH)), !LH || typeof LH != "string")) return LH;
                let tH = LH.trim();
                if (xH.skipLike !== void 0 && xH.skipLike.test(tH)) return LH;
                if (LH === "0") return 0;
                if (xH.hex && g.test(tH))
                  return (function (w_) {
                    if (parseInt) return parseInt(w_, 16);
                    if (Number.parseInt) return Number.parseInt(w_, 16);
                    if (window && window.parseInt) return window.parseInt(w_, 16);
                    throw Error("parseInt, Number.parseInt, window.parseInt are not supported");
                  })(tH);
                if (tH.includes("e") || tH.includes("E"))
                  return (function (w_, y_, O6) {
                    if (!O6.eNotation) return w_;
                    let l_ = y_.match(i);
                    if (l_) {
                      let f8 = l_[1] || "",
                        x6 = l_[3].indexOf("e") === -1 ? "E" : "e",
                        L6 = l_[2],
                        z8 = f8 ? w_[L6.length + 1] === x6 : w_[L6.length] === x6;
                      return L6.length > 1 && z8
                        ? w_
                        : L6.length !== 1 || (!l_[3].startsWith(`.${x6}`) && l_[3][0] !== x6)
                          ? O6.leadingZeros && !z8
                            ? ((y_ = (l_[1] || "") + l_[3]), Number(y_))
                            : w_
                          : Number(y_);
                    }
                    return w_;
                  })(LH, tH, xH);
                {
                  let w_ = c.exec(tH);
                  if (w_) {
                    let y_ = w_[1] || "",
                      O6 = w_[2],
                      l_ =
                        (D_ = w_[3]) && D_.indexOf(".") !== -1
                          ? ((D_ = D_.replace(/0+$/, "")) === "."
                              ? (D_ = "0")
                              : D_[0] === "."
                                ? (D_ = "0" + D_)
                                : D_[D_.length - 1] === "." && (D_ = D_.substring(0, D_.length - 1)),
                            D_)
                          : D_,
                      f8 = y_ ? LH[O6.length + 1] === "." : LH[O6.length] === ".";
                    if (!xH.leadingZeros && (O6.length > 1 || (O6.length === 1 && !f8))) return LH;
                    {
                      let x6 = Number(tH),
                        L6 = String(x6);
                      if (x6 === 0) return x6;
                      if (L6.search(/[eE]/) !== -1) return xH.eNotation ? x6 : LH;
                      if (tH.indexOf(".") !== -1) return L6 === "0" || L6 === l_ || L6 === `${y_}${l_}` ? x6 : LH;
                      let z8 = O6 ? l_ : tH;
                      return O6 ? (z8 === L6 || y_ + z8 === L6 ? x6 : LH) : z8 === L6 || z8 === y_ + L6 ? x6 : LH;
                    }
                  }
                  return LH;
                }
                var D_;
              })(TH, dH))
          );
        }
        return TH !== void 0 ? TH : "";
      }
      function XH(TH, wH, dH) {
        let JH = Number.parseInt(TH, wH);
        return JH >= 0 && JH <= 1114111 ? String.fromCodePoint(JH) : dH + TH + ";";
      }
      let jH = x.getMetaDataSymbol();
      function GH(TH, wH) {
        return RH(TH, wH);
      }
      function RH(TH, wH, dH) {
        let JH,
          LH = {};
        for (let xH = 0; xH < TH.length; xH++) {
          let tH = TH[xH],
            D_ = NH(tH),
            w_ = "";
          if (((w_ = dH === void 0 ? D_ : dH + "." + D_), D_ === wH.textNodeName))
            JH === void 0 ? (JH = tH[D_]) : (JH += "" + tH[D_]);
          else {
            if (D_ === void 0) continue;
            if (tH[D_]) {
              let y_ = RH(tH[D_], wH, w_),
                O6 = ZH(y_, wH);
              tH[":@"]
                ? hH(y_, tH[":@"], w_, wH)
                : Object.keys(y_).length !== 1 || y_[wH.textNodeName] === void 0 || wH.alwaysCreateTextNode
                  ? Object.keys(y_).length === 0 && (wH.alwaysCreateTextNode ? (y_[wH.textNodeName] = "") : (y_ = ""))
                  : (y_ = y_[wH.textNodeName]),
                tH[jH] !== void 0 && typeof y_ == "object" && y_ !== null && (y_[jH] = tH[jH]),
                LH[D_] !== void 0 && Object.prototype.hasOwnProperty.call(LH, D_)
                  ? (Array.isArray(LH[D_]) || (LH[D_] = [LH[D_]]), LH[D_].push(y_))
                  : wH.isArray(D_, w_, O6)
                    ? (LH[D_] = [y_])
                    : (LH[D_] = y_);
            }
          }
        }
        return (
          typeof JH == "string"
            ? JH.length > 0 && (LH[wH.textNodeName] = JH)
            : JH !== void 0 && (LH[wH.textNodeName] = JH),
          LH
        );
      }
      function NH(TH) {
        let wH = Object.keys(TH);
        for (let dH = 0; dH < wH.length; dH++) {
          let JH = wH[dH];
          if (JH !== ":@") return JH;
        }
      }
      function hH(TH, wH, dH, JH) {
        if (wH) {
          let LH = Object.keys(wH),
            xH = LH.length;
          for (let tH = 0; tH < xH; tH++) {
            let D_ = LH[tH];
            JH.isArray(D_, dH + "." + D_, !0, !0) ? (TH[D_] = [wH[D_]]) : (TH[D_] = wH[D_]);
          }
        }
      }
      function ZH(TH, wH) {
        let { textNodeName: dH } = wH,
          JH = Object.keys(TH).length;
        return JH === 0 || !(JH !== 1 || (!TH[dH] && typeof TH[dH] != "boolean" && TH[dH] !== 0));
      }
      class bH {
        constructor(TH) {
          (this.externalEntities = {}), (this.options = E(TH));
        }
        parse(TH, wH) {
          if (typeof TH != "string" && TH.toString) TH = TH.toString();
          else if (typeof TH != "string") throw Error("XML data is accepted in String or Bytes[] form.");
          if (wH) {
            wH === !0 && (wH = {});
            let LH = z(TH, wH);
            if (LH !== !0) throw Error(`${LH.err.msg}:${LH.err.line}:${LH.err.col}`);
          }
          let dH = new HH(this.options);
          dH.addExternalEntities(this.externalEntities);
          let JH = dH.parseXml(TH);
          return this.options.preserveOrder || JH === void 0 ? JH : GH(JH, this.options);
        }
        addEntity(TH, wH) {
          if (wH.indexOf("&") !== -1) throw Error("Entity value can't have '&'");
          if (TH.indexOf("&") !== -1 || TH.indexOf(";") !== -1)
            throw Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
          if (wH === "&") throw Error("An entity with value '&' is not permitted");
          this.externalEntities[TH] = wH;
        }
        static getMetaDataSymbol() {
          return x.getMetaDataSymbol();
        }
      }
      function nH(TH, wH) {
        let dH = "";
        return (
          wH.format &&
            wH.indentBy.length > 0 &&
            (dH = `
`),
          __(TH, wH, "", dH)
        );
      }
      function __(TH, wH, dH, JH) {
        let LH = "",
          xH = !1;
        if (!Array.isArray(TH)) {
          if (TH != null) {
            let tH = TH.toString();
            return (tH = sH(tH, wH)), tH;
          }
          return "";
        }
        for (let tH = 0; tH < TH.length; tH++) {
          let D_ = TH[tH],
            w_ = SH(D_);
          if (w_ === void 0) continue;
          let y_ = "";
          if (((y_ = dH.length === 0 ? w_ : `${dH}.${w_}`), w_ === wH.textNodeName)) {
            let x6 = D_[w_];
            yH(y_, wH) || ((x6 = wH.tagValueProcessor(w_, x6)), (x6 = sH(x6, wH))),
              xH && (LH += JH),
              (LH += x6),
              (xH = !1);
            continue;
          }
          if (w_ === wH.cdataPropName) {
            xH && (LH += JH), (LH += `<![CDATA[${D_[w_][0][wH.textNodeName]}]]>`), (xH = !1);
            continue;
          }
          if (w_ === wH.commentPropName) {
            (LH += JH + `<!--${D_[w_][0][wH.textNodeName]}-->`), (xH = !0);
            continue;
          }
          if (w_[0] === "?") {
            let x6 = VH(D_[":@"], wH),
              L6 = w_ === "?xml" ? "" : JH,
              z8 = D_[w_][0][wH.textNodeName];
            (z8 = z8.length !== 0 ? " " + z8 : ""), (LH += L6 + `<${w_}${z8}${x6}?>`), (xH = !0);
            continue;
          }
          let O6 = JH;
          O6 !== "" && (O6 += wH.indentBy);
          let l_ = JH + `<${w_}${VH(D_[":@"], wH)}`,
            f8 = __(D_[w_], wH, y_, O6);
          wH.unpairedTags.indexOf(w_) !== -1
            ? wH.suppressUnpairedNode
              ? (LH += l_ + ">")
              : (LH += l_ + "/>")
            : (f8 && f8.length !== 0) || !wH.suppressEmptyNode
              ? f8 && f8.endsWith(">")
                ? (LH += l_ + `>${f8}${JH}</${w_}>`)
                : ((LH += l_ + ">"),
                  f8 && JH !== "" && (f8.includes("/>") || f8.includes("</"))
                    ? (LH += JH + wH.indentBy + f8 + JH)
                    : (LH += f8),
                  (LH += `</${w_}>`))
              : (LH += l_ + "/>"),
            (xH = !0);
        }
        return LH;
      }
      function SH(TH) {
        let wH = Object.keys(TH);
        for (let dH = 0; dH < wH.length; dH++) {
          let JH = wH[dH];
          if (Object.prototype.hasOwnProperty.call(TH, JH) && JH !== ":@") return JH;
        }
      }
      function VH(TH, wH) {
        let dH = "";
        if (TH && !wH.ignoreAttributes)
          for (let JH in TH) {
            if (!Object.prototype.hasOwnProperty.call(TH, JH)) continue;
            let LH = wH.attributeValueProcessor(JH, TH[JH]);
            (LH = sH(LH, wH)),
              LH === !0 && wH.suppressBooleanAttributes
                ? (dH += ` ${JH.substr(wH.attributeNamePrefix.length)}`)
                : (dH += ` ${JH.substr(wH.attributeNamePrefix.length)}="${LH}"`);
          }
        return dH;
      }
      function yH(TH, wH) {
        let dH = (TH = TH.substr(0, TH.length - wH.textNodeName.length - 1)).substr(TH.lastIndexOf(".") + 1);
        for (let JH in wH.stopNodes) if (wH.stopNodes[JH] === TH || wH.stopNodes[JH] === "*." + dH) return !0;
        return !1;
      }
      function sH(TH, wH) {
        if (TH && TH.length > 0 && wH.processEntities)
          for (let dH = 0; dH < wH.entities.length; dH++) {
            let JH = wH.entities[dH];
            TH = TH.replace(JH.regex, JH.val);
          }
        return TH;
      }
      let zH = {
        attributeNamePrefix: "@_",
        attributesGroupName: !1,
        textNodeName: "#text",
        ignoreAttributes: !0,
        cdataPropName: !1,
        format: !1,
        indentBy: "  ",
        suppressEmptyNode: !1,
        suppressUnpairedNode: !0,
        suppressBooleanAttributes: !0,
        tagValueProcessor: function (TH, wH) {
          return wH;
        },
        attributeValueProcessor: function (TH, wH) {
          return wH;
        },
        preserveOrder: !1,
        commentPropName: !1,
        unpairedTags: [],
        entities: [
          { regex: new RegExp("&", "g"), val: "&amp;" },
          { regex: new RegExp(">", "g"), val: "&gt;" },
          { regex: new RegExp("<", "g"), val: "&lt;" },
          { regex: new RegExp("'", "g"), val: "&apos;" },
          { regex: new RegExp('"', "g"), val: "&quot;" },
        ],
        processEntities: !0,
        stopNodes: [],
        oneListGroup: !1,
      };
      function WH(TH) {
        (this.options = Object.assign({}, zH, TH)),
          this.options.ignoreAttributes === !0 || this.options.attributesGroupName
            ? (this.isAttribute = function () {
                return !1;
              })
            : ((this.ignoreAttributesFn = _H(this.options.ignoreAttributes)),
              (this.attrPrefixLen = this.options.attributeNamePrefix.length),
              (this.isAttribute = mH)),
          (this.processTextOrObjNode = BH),
          this.options.format
            ? ((this.indentate = EH),
              (this.tagEndChar = `>
`),
              (this.newLine = `
`))
            : ((this.indentate = function () {
                return "";
              }),
              (this.tagEndChar = ">"),
              (this.newLine = ""));
      }
      function BH(TH, wH, dH, JH) {
        let LH = this.j2x(TH, dH + 1, JH.concat(wH));
        return TH[this.options.textNodeName] !== void 0 && Object.keys(TH).length === 1
          ? this.buildTextValNode(TH[this.options.textNodeName], wH, LH.attrStr, dH)
          : this.buildObjectNode(LH.val, wH, LH.attrStr, dH);
      }
      function EH(TH) {
        return this.options.indentBy.repeat(TH);
      }
      function mH(TH) {
        return (
          !(!TH.startsWith(this.options.attributeNamePrefix) || TH === this.options.textNodeName) &&
          TH.substr(this.attrPrefixLen)
        );
      }
      (WH.prototype.build = function (TH) {
        return this.options.preserveOrder
          ? nH(TH, this.options)
          : (Array.isArray(TH) &&
              this.options.arrayNodeName &&
              this.options.arrayNodeName.length > 1 &&
              (TH = { [this.options.arrayNodeName]: TH }),
            this.j2x(TH, 0, []).val);
      }),
        (WH.prototype.j2x = function (TH, wH, dH) {
          let JH = "",
            LH = "",
            xH = dH.join(".");
          for (let tH in TH)
            if (Object.prototype.hasOwnProperty.call(TH, tH))
              if (TH[tH] === void 0) this.isAttribute(tH) && (LH += "");
              else if (TH[tH] === null)
                this.isAttribute(tH) || tH === this.options.cdataPropName
                  ? (LH += "")
                  : tH[0] === "?"
                    ? (LH += this.indentate(wH) + "<" + tH + "?" + this.tagEndChar)
                    : (LH += this.indentate(wH) + "<" + tH + "/" + this.tagEndChar);
              else if (TH[tH] instanceof Date) LH += this.buildTextValNode(TH[tH], tH, "", wH);
              else if (typeof TH[tH] != "object") {
                let D_ = this.isAttribute(tH);
                if (D_ && !this.ignoreAttributesFn(D_, xH)) JH += this.buildAttrPairStr(D_, "" + TH[tH]);
                else if (!D_)
                  if (tH === this.options.textNodeName) {
                    let w_ = this.options.tagValueProcessor(tH, "" + TH[tH]);
                    LH += this.replaceEntitiesValue(w_);
                  } else LH += this.buildTextValNode(TH[tH], tH, "", wH);
              } else if (Array.isArray(TH[tH])) {
                let D_ = TH[tH].length,
                  w_ = "",
                  y_ = "";
                for (let O6 = 0; O6 < D_; O6++) {
                  let l_ = TH[tH][O6];
                  if (l_ === void 0);
                  else if (l_ === null)
                    tH[0] === "?"
                      ? (LH += this.indentate(wH) + "<" + tH + "?" + this.tagEndChar)
                      : (LH += this.indentate(wH) + "<" + tH + "/" + this.tagEndChar);
                  else if (typeof l_ == "object")
                    if (this.options.oneListGroup) {
                      let f8 = this.j2x(l_, wH + 1, dH.concat(tH));
                      (w_ += f8.val),
                        this.options.attributesGroupName &&
                          l_.hasOwnProperty(this.options.attributesGroupName) &&
                          (y_ += f8.attrStr);
                    } else w_ += this.processTextOrObjNode(l_, tH, wH, dH);
                  else if (this.options.oneListGroup) {
                    let f8 = this.options.tagValueProcessor(tH, l_);
                    (f8 = this.replaceEntitiesValue(f8)), (w_ += f8);
                  } else w_ += this.buildTextValNode(l_, tH, "", wH);
                }
                this.options.oneListGroup && (w_ = this.buildObjectNode(w_, tH, y_, wH)), (LH += w_);
              } else if (this.options.attributesGroupName && tH === this.options.attributesGroupName) {
                let D_ = Object.keys(TH[tH]),
                  w_ = D_.length;
                for (let y_ = 0; y_ < w_; y_++) JH += this.buildAttrPairStr(D_[y_], "" + TH[tH][D_[y_]]);
              } else LH += this.processTextOrObjNode(TH[tH], tH, wH, dH);
          return { attrStr: JH, val: LH };
        }),
        (WH.prototype.buildAttrPairStr = function (TH, wH) {
          return (
            (wH = this.options.attributeValueProcessor(TH, "" + wH)),
            (wH = this.replaceEntitiesValue(wH)),
            this.options.suppressBooleanAttributes && wH === "true" ? " " + TH : " " + TH + '="' + wH + '"'
          );
        }),
        (WH.prototype.buildObjectNode = function (TH, wH, dH, JH) {
          if (TH === "")
            return wH[0] === "?"
              ? this.indentate(JH) + "<" + wH + dH + "?" + this.tagEndChar
              : this.indentate(JH) + "<" + wH + dH + this.closeTag(wH) + this.tagEndChar;
          {
            let LH = "</" + wH + this.tagEndChar,
              xH = "";
            return (
              wH[0] === "?" && ((xH = "?"), (LH = "")),
              (!dH && dH !== "") || TH.indexOf("<") !== -1
                ? this.options.commentPropName !== !1 && wH === this.options.commentPropName && xH.length === 0
                  ? this.indentate(JH) + `<!--${TH}-->` + this.newLine
                  : this.indentate(JH) + "<" + wH + dH + xH + this.tagEndChar + TH + this.indentate(JH) + LH
                : this.indentate(JH) + "<" + wH + dH + xH + ">" + TH + LH
            );
          }
        }),
        (WH.prototype.closeTag = function (TH) {
          let wH = "";
          return (
            this.options.unpairedTags.indexOf(TH) !== -1
              ? this.options.suppressUnpairedNode || (wH = "/")
              : (wH = this.options.suppressEmptyNode ? "/" : `></${TH}`),
            wH
          );
        }),
        (WH.prototype.buildTextValNode = function (TH, wH, dH, JH) {
          if (this.options.cdataPropName !== !1 && wH === this.options.cdataPropName)
            return this.indentate(JH) + `<![CDATA[${TH}]]>` + this.newLine;
          if (this.options.commentPropName !== !1 && wH === this.options.commentPropName)
            return this.indentate(JH) + `<!--${TH}-->` + this.newLine;
          if (wH[0] === "?") return this.indentate(JH) + "<" + wH + dH + "?" + this.tagEndChar;
          {
            let LH = this.options.tagValueProcessor(wH, TH);
            return (
              (LH = this.replaceEntitiesValue(LH)),
              LH === ""
                ? this.indentate(JH) + "<" + wH + dH + this.closeTag(wH) + this.tagEndChar
                : this.indentate(JH) + "<" + wH + dH + ">" + LH + "</" + wH + this.tagEndChar
            );
          }
        }),
        (WH.prototype.replaceEntitiesValue = function (TH) {
          if (TH && TH.length > 0 && this.options.processEntities)
            for (let wH = 0; wH < this.options.entities.length; wH++) {
              let dH = this.options.entities[wH];
              TH = TH.replace(dH.regex, dH.val);
            }
          return TH;
        });
      let FH = { validate: z };
      VC8.exports = _;
    })();
  });

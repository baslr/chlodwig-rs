  var tn6 = d((Wr7, Gr7) => {
    (function () {
      var H,
        _ = {}.hasOwnProperty;
      Gr7.exports = H = function () {
        class q {
          constructor($) {
            var K, O, T;
            if (
              ((this.assertLegalChar = this.assertLegalChar.bind(this)),
              (this.assertLegalName = this.assertLegalName.bind(this)),
              $ || ($ = {}),
              (this.options = $),
              !this.options.version)
            )
              this.options.version = "1.0";
            O = $.stringify || {};
            for (K in O) {
              if (!_.call(O, K)) continue;
              (T = O[K]), (this[K] = T);
            }
          }
          name($) {
            if (this.options.noValidation) return $;
            return this.assertLegalName("" + $ || "");
          }
          text($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar(this.textEscape("" + $ || ""));
          }
          cdata($) {
            if (this.options.noValidation) return $;
            return ($ = "" + $ || ""), ($ = $.replace("]]>", "]]]]><![CDATA[>")), this.assertLegalChar($);
          }
          comment($) {
            if (this.options.noValidation) return $;
            if ((($ = "" + $ || ""), $.match(/--/))) throw Error("Comment text cannot contain double-hypen: " + $);
            return this.assertLegalChar($);
          }
          raw($) {
            if (this.options.noValidation) return $;
            return "" + $ || "";
          }
          attValue($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar(this.attEscape(($ = "" + $ || "")));
          }
          insTarget($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          insValue($) {
            if (this.options.noValidation) return $;
            if ((($ = "" + $ || ""), $.match(/\?>/))) throw Error("Invalid processing instruction value: " + $);
            return this.assertLegalChar($);
          }
          xmlVersion($) {
            if (this.options.noValidation) return $;
            if ((($ = "" + $ || ""), !$.match(/1\.[0-9]+/))) throw Error("Invalid version number: " + $);
            return $;
          }
          xmlEncoding($) {
            if (this.options.noValidation) return $;
            if ((($ = "" + $ || ""), !$.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/))) throw Error("Invalid encoding: " + $);
            return this.assertLegalChar($);
          }
          xmlStandalone($) {
            if (this.options.noValidation) return $;
            if ($) return "yes";
            else return "no";
          }
          dtdPubID($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdSysID($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdElementValue($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdAttType($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdAttDefault($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdEntityValue($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          dtdNData($) {
            if (this.options.noValidation) return $;
            return this.assertLegalChar("" + $ || "");
          }
          assertLegalChar($) {
            var K, O;
            if (this.options.noValidation) return $;
            if (this.options.version === "1.0") {
              if (
                ((K =
                  /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g),
                this.options.invalidCharReplacement !== void 0)
              )
                $ = $.replace(K, this.options.invalidCharReplacement);
              else if ((O = $.match(K))) throw Error(`Invalid character in string: ${$} at index ${O.index}`);
            } else if (this.options.version === "1.1") {
              if (
                ((K = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g),
                this.options.invalidCharReplacement !== void 0)
              )
                $ = $.replace(K, this.options.invalidCharReplacement);
              else if ((O = $.match(K))) throw Error(`Invalid character in string: ${$} at index ${O.index}`);
            }
            return $;
          }
          assertLegalName($) {
            var K;
            if (this.options.noValidation) return $;
            if (
              (($ = this.assertLegalChar($)),
              (K =
                /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/),
              !$.match(K))
            )
              throw Error(`Invalid character in name: ${$}`);
            return $;
          }
          textEscape($) {
            var K;
            if (this.options.noValidation) return $;
            return (
              (K = this.options.noDoubleEncoding ? /(?!&(lt|gt|amp|apos|quot);)&/g : /&/g),
              $.replace(K, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;")
            );
          }
          attEscape($) {
            var K;
            if (this.options.noValidation) return $;
            return (
              (K = this.options.noDoubleEncoding ? /(?!&(lt|gt|amp|apos|quot);)&/g : /&/g),
              $.replace(K, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/"/g, "&quot;")
                .replace(/\t/g, "&#x9;")
                .replace(/\n/g, "&#xA;")
                .replace(/\r/g, "&#xD;")
            );
          }
        }
        return (
          (q.prototype.convertAttKey = "@"),
          (q.prototype.convertPIKey = "?"),
          (q.prototype.convertTextKey = "#text"),
          (q.prototype.convertCDataKey = "#cdata"),
          (q.prototype.convertCommentKey = "#comment"),
          (q.prototype.convertRawKey = "#raw"),
          q
        );
      }.call(this);
    }).call(Wr7);
  });

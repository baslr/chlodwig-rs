  var Kd_ = d(($d_) => {
    var gs6 = pW(),
      Q89 = jyH(),
      ec1 = _d_(),
      KV = rD(),
      l89 = ps6(),
      HF1 = Bs6(),
      Co = ($d_.elements = {}),
      YH_ = Object.create(null);
    $d_.createElement = function (H, _, q) {
      var $ = YH_[_] || qF1;
      return new $(H, _, q);
    };
    function R7(H) {
      return HF1(H, g9, Co, YH_);
    }
    function oD(H) {
      return {
        get: function () {
          var _ = this._getattr(H);
          if (_ === null) return "";
          var q = this.doc._resolve(_);
          return q === null ? _ : q;
        },
        set: function (_) {
          this._setattr(H, _);
        },
      };
    }
    function qd_(H) {
      return {
        get: function () {
          var _ = this._getattr(H);
          if (_ === null) return null;
          if (_.toLowerCase() === "use-credentials") return "use-credentials";
          return "anonymous";
        },
        set: function (_) {
          if (_ === null || _ === void 0) this.removeAttribute(H);
          else this._setattr(H, _);
        },
      };
    }
    var PyH = {
        type: [
          "",
          "no-referrer",
          "no-referrer-when-downgrade",
          "same-origin",
          "origin",
          "strict-origin",
          "origin-when-cross-origin",
          "strict-origin-when-cross-origin",
          "unsafe-url",
        ],
        missing: "",
      },
      _F1 = { A: !0, LINK: !0, BUTTON: !0, INPUT: !0, SELECT: !0, TEXTAREA: !0, COMMAND: !0 },
      um = function (H, _, q) {
        g9.call(this, H, _, q), (this._form = null);
      },
      g9 = ($d_.HTMLElement = R7({
        superclass: Q89,
        name: "HTMLElement",
        ctor: function (_, q, $) {
          Q89.call(this, _, q, KV.NAMESPACE.HTML, $);
        },
        props: {
          dangerouslySetInnerHTML: {
            set: function (H) {
              this._innerHTML = H;
            },
          },
          innerHTML: {
            get: function () {
              return this.serialize();
            },
            set: function (H) {
              var _ = this.ownerDocument.implementation.mozHTMLParser(this.ownerDocument._address, this);
              _.parse(H === null ? "" : String(H), !0);
              var q = this instanceof YH_.template ? this.content : this;
              while (q.hasChildNodes()) q.removeChild(q.firstChild);
              q.appendChild(_._asDocumentFragment());
            },
          },
          style: {
            get: function () {
              if (!this._style) this._style = new ec1(this);
              return this._style;
            },
            set: function (H) {
              if (H === null || H === void 0) H = "";
              this._setattr("style", String(H));
            },
          },
          blur: { value: function () {} },
          focus: { value: function () {} },
          forceSpellCheck: { value: function () {} },
          click: {
            value: function () {
              if (this._click_in_progress) return;
              this._click_in_progress = !0;
              try {
                if (this._pre_click_activation_steps) this._pre_click_activation_steps();
                var H = this.ownerDocument.createEvent("MouseEvent");
                H.initMouseEvent(
                  "click",
                  !0,
                  !0,
                  this.ownerDocument.defaultView,
                  1,
                  0,
                  0,
                  0,
                  0,
                  !1,
                  !1,
                  !1,
                  !1,
                  0,
                  null,
                );
                var _ = this.dispatchEvent(H);
                if (_) {
                  if (this._post_click_activation_steps) this._post_click_activation_steps(H);
                } else if (this._cancelled_activation_steps) this._cancelled_activation_steps();
              } finally {
                this._click_in_progress = !1;
              }
            },
          },
          submit: { value: KV.nyi },
        },
        attributes: {
          title: String,
          lang: String,
          dir: { type: ["ltr", "rtl", "auto"], missing: "" },
          draggable: { type: ["true", "false"], treatNullAsEmptyString: !0 },
          spellcheck: { type: ["true", "false"], missing: "" },
          enterKeyHint: { type: ["enter", "done", "go", "next", "previous", "search", "send"], missing: "" },
          autoCapitalize: { type: ["off", "on", "none", "sentences", "words", "characters"], missing: "" },
          autoFocus: Boolean,
          accessKey: String,
          nonce: String,
          hidden: Boolean,
          translate: { type: ["no", "yes"], missing: "" },
          tabIndex: {
            type: "long",
            default: function () {
              if (this.tagName in _F1 || this.contentEditable) return 0;
              else return -1;
            },
          },
        },
        events: [
          "abort",
          "canplay",
          "canplaythrough",
          "change",
          "click",
          "contextmenu",
          "cuechange",
          "dblclick",
          "drag",
          "dragend",
          "dragenter",
          "dragleave",
          "dragover",
          "dragstart",
          "drop",
          "durationchange",
          "emptied",
          "ended",
          "input",
          "invalid",
          "keydown",
          "keypress",
          "keyup",
          "loadeddata",
          "loadedmetadata",
          "loadstart",
          "mousedown",
          "mousemove",
          "mouseout",
          "mouseover",
          "mouseup",
          "mousewheel",
          "pause",
          "play",
          "playing",
          "progress",
          "ratechange",
          "readystatechange",
          "reset",
          "seeked",
          "seeking",
          "select",
          "show",
          "stalled",
          "submit",
          "suspend",
          "timeupdate",
          "volumechange",
          "waiting",
          "blur",
          "error",
          "focus",
          "load",
          "scroll",
        ],
      })),
      qF1 = R7({
        name: "HTMLUnknownElement",
        ctor: function (_, q, $) {
          g9.call(this, _, q, $);
        },
      }),
      xm = {
        form: {
          get: function () {
            return this._form;
          },
        },
      };
    R7({
      tag: "a",
      name: "HTMLAnchorElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        _post_click_activation_steps: {
          value: function (H) {
            if (this.href) this.ownerDocument.defaultView.location = this.href;
          },
        },
      },
      attributes: {
        href: oD,
        ping: String,
        download: String,
        target: String,
        rel: String,
        media: String,
        hreflang: String,
        type: String,
        referrerPolicy: PyH,
        coords: String,
        charset: String,
        name: String,
        rev: String,
        shape: String,
      },
    });
    l89._inherit(YH_.a.prototype);
    R7({
      tag: "area",
      name: "HTMLAreaElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        alt: String,
        target: String,
        download: String,
        rel: String,
        media: String,
        href: oD,
        hreflang: String,
        type: String,
        shape: String,
        coords: String,
        ping: String,
        referrerPolicy: PyH,
        noHref: Boolean,
      },
    });
    l89._inherit(YH_.area.prototype);
    R7({
      tag: "br",
      name: "HTMLBRElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { clear: String },
    });
    R7({
      tag: "base",
      name: "HTMLBaseElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { target: String },
    });
    R7({
      tag: "body",
      name: "HTMLBodyElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      events: [
        "afterprint",
        "beforeprint",
        "beforeunload",
        "blur",
        "error",
        "focus",
        "hashchange",
        "load",
        "message",
        "offline",
        "online",
        "pagehide",
        "pageshow",
        "popstate",
        "resize",
        "scroll",
        "storage",
        "unload",
      ],
      attributes: {
        text: { type: String, treatNullAsEmptyString: !0 },
        link: { type: String, treatNullAsEmptyString: !0 },
        vLink: { type: String, treatNullAsEmptyString: !0 },
        aLink: { type: String, treatNullAsEmptyString: !0 },
        bgColor: { type: String, treatNullAsEmptyString: !0 },
        background: String,
      },
    });
    R7({
      tag: "button",
      name: "HTMLButtonElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: {
        name: String,
        value: String,
        disabled: Boolean,
        autofocus: Boolean,
        type: { type: ["submit", "reset", "button", "menu"], missing: "submit" },
        formTarget: String,
        formAction: oD,
        formNoValidate: Boolean,
        formMethod: { type: ["get", "post", "dialog"], invalid: "get", missing: "" },
        formEnctype: {
          type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
          invalid: "application/x-www-form-urlencoded",
          missing: "",
        },
      },
    });
    R7({
      tag: "dl",
      name: "HTMLDListElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { compact: Boolean },
    });
    R7({
      tag: "data",
      name: "HTMLDataElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { value: String },
    });
    R7({
      tag: "datalist",
      name: "HTMLDataListElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
    });
    R7({
      tag: "details",
      name: "HTMLDetailsElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { open: Boolean },
    });
    R7({
      tag: "div",
      name: "HTMLDivElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String },
    });
    R7({
      tag: "embed",
      name: "HTMLEmbedElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { src: oD, type: String, width: String, height: String, align: String, name: String },
    });
    R7({
      tag: "fieldset",
      name: "HTMLFieldSetElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: { disabled: Boolean, name: String },
    });
    R7({
      tag: "form",
      name: "HTMLFormElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        action: String,
        autocomplete: { type: ["on", "off"], missing: "on" },
        name: String,
        acceptCharset: { name: "accept-charset" },
        target: String,
        noValidate: Boolean,
        method: { type: ["get", "post", "dialog"], invalid: "get", missing: "get" },
        enctype: {
          type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
          invalid: "application/x-www-form-urlencoded",
          missing: "application/x-www-form-urlencoded",
        },
        encoding: {
          name: "enctype",
          type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
          invalid: "application/x-www-form-urlencoded",
          missing: "application/x-www-form-urlencoded",
        },
      },
    });
    R7({
      tag: "hr",
      name: "HTMLHRElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String, color: String, noShade: Boolean, size: String, width: String },
    });
    R7({
      tag: "head",
      name: "HTMLHeadElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
    });
    R7({
      tags: ["h1", "h2", "h3", "h4", "h5", "h6"],
      name: "HTMLHeadingElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String },
    });
    R7({
      tag: "html",
      name: "HTMLHtmlElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { xmlns: oD, version: String },
    });
    R7({
      tag: "iframe",
      name: "HTMLIFrameElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        src: oD,
        srcdoc: String,
        name: String,
        width: String,
        height: String,
        seamless: Boolean,
        allow: Boolean,
        allowFullscreen: Boolean,
        allowUserMedia: Boolean,
        allowPaymentRequest: Boolean,
        referrerPolicy: PyH,
        loading: { type: ["eager", "lazy"], treatNullAsEmptyString: !0 },
        align: String,
        scrolling: String,
        frameBorder: String,
        longDesc: oD,
        marginHeight: { type: String, treatNullAsEmptyString: !0 },
        marginWidth: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tag: "img",
      name: "HTMLImageElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        alt: String,
        src: oD,
        srcset: String,
        crossOrigin: qd_,
        useMap: String,
        isMap: Boolean,
        sizes: String,
        height: { type: "unsigned long", default: 0 },
        width: { type: "unsigned long", default: 0 },
        referrerPolicy: PyH,
        loading: { type: ["eager", "lazy"], missing: "" },
        name: String,
        lowsrc: oD,
        align: String,
        hspace: { type: "unsigned long", default: 0 },
        vspace: { type: "unsigned long", default: 0 },
        longDesc: oD,
        border: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tag: "input",
      name: "HTMLInputElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: {
        form: xm.form,
        _post_click_activation_steps: {
          value: function (H) {
            if (this.type === "checkbox") this.checked = !this.checked;
            else if (this.type === "radio") {
              var _ = this.form.getElementsByName(this.name);
              for (var q = _.length - 1; q >= 0; q--) {
                var $ = _[q];
                $.checked = $ === this;
              }
            }
          },
        },
      },
      attributes: {
        name: String,
        disabled: Boolean,
        autofocus: Boolean,
        accept: String,
        alt: String,
        max: String,
        min: String,
        pattern: String,
        placeholder: String,
        step: String,
        dirName: String,
        defaultValue: { name: "value" },
        multiple: Boolean,
        required: Boolean,
        readOnly: Boolean,
        checked: Boolean,
        value: String,
        src: oD,
        defaultChecked: { name: "checked", type: Boolean },
        size: { type: "unsigned long", default: 20, min: 1, setmin: 1 },
        width: { type: "unsigned long", min: 0, setmin: 0, default: 0 },
        height: { type: "unsigned long", min: 0, setmin: 0, default: 0 },
        minLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 },
        maxLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 },
        autocomplete: String,
        type: {
          type: [
            "text",
            "hidden",
            "search",
            "tel",
            "url",
            "email",
            "password",
            "datetime",
            "date",
            "month",
            "week",
            "time",
            "datetime-local",
            "number",
            "range",
            "color",
            "checkbox",
            "radio",
            "file",
            "submit",
            "image",
            "reset",
            "button",
          ],
          missing: "text",
        },
        formTarget: String,
        formNoValidate: Boolean,
        formMethod: { type: ["get", "post"], invalid: "get", missing: "" },
        formEnctype: {
          type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
          invalid: "application/x-www-form-urlencoded",
          missing: "",
        },
        inputMode: {
          type: [
            "verbatim",
            "latin",
            "latin-name",
            "latin-prose",
            "full-width-latin",
            "kana",
            "kana-name",
            "katakana",
            "numeric",
            "tel",
            "email",
            "url",
          ],
          missing: "",
        },
        align: String,
        useMap: String,
      },
    });
    R7({
      tag: "keygen",
      name: "HTMLKeygenElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: {
        name: String,
        disabled: Boolean,
        autofocus: Boolean,
        challenge: String,
        keytype: { type: ["rsa"], missing: "" },
      },
    });
    R7({
      tag: "li",
      name: "HTMLLIElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { value: { type: "long", default: 0 }, type: String },
    });
    R7({
      tag: "label",
      name: "HTMLLabelElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: { htmlFor: { name: "for", type: String } },
    });
    R7({
      tag: "legend",
      name: "HTMLLegendElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String },
    });
    R7({
      tag: "link",
      name: "HTMLLinkElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        href: oD,
        rel: String,
        media: String,
        hreflang: String,
        type: String,
        crossOrigin: qd_,
        nonce: String,
        integrity: String,
        referrerPolicy: PyH,
        imageSizes: String,
        imageSrcset: String,
        charset: String,
        rev: String,
        target: String,
      },
    });
    R7({
      tag: "map",
      name: "HTMLMapElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { name: String },
    });
    R7({
      tag: "menu",
      name: "HTMLMenuElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        type: { type: ["context", "popup", "toolbar"], missing: "toolbar" },
        label: String,
        compact: Boolean,
      },
    });
    R7({
      tag: "meta",
      name: "HTMLMetaElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { name: String, content: String, httpEquiv: { name: "http-equiv", type: String }, scheme: String },
    });
    R7({
      tag: "meter",
      name: "HTMLMeterElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
    });
    R7({
      tags: ["ins", "del"],
      name: "HTMLModElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { cite: oD, dateTime: String },
    });
    R7({
      tag: "ol",
      name: "HTMLOListElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        _numitems: {
          get: function () {
            var H = 0;
            return (
              this.childNodes.forEach(function (_) {
                if (_.nodeType === gs6.ELEMENT_NODE && _.tagName === "LI") H++;
              }),
              H
            );
          },
        },
      },
      attributes: {
        type: String,
        reversed: Boolean,
        start: {
          type: "long",
          default: function () {
            if (this.reversed) return this._numitems;
            else return 1;
          },
        },
        compact: Boolean,
      },
    });
    R7({
      tag: "object",
      name: "HTMLObjectElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: {
        data: oD,
        type: String,
        name: String,
        useMap: String,
        typeMustMatch: Boolean,
        width: String,
        height: String,
        align: String,
        archive: String,
        code: String,
        declare: Boolean,
        hspace: { type: "unsigned long", default: 0 },
        standby: String,
        vspace: { type: "unsigned long", default: 0 },
        codeBase: oD,
        codeType: String,
        border: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tag: "optgroup",
      name: "HTMLOptGroupElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { disabled: Boolean, label: String },
    });
    R7({
      tag: "option",
      name: "HTMLOptionElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        form: {
          get: function () {
            var H = this.parentNode;
            while (H && H.nodeType === gs6.ELEMENT_NODE) {
              if (H.localName === "select") return H.form;
              H = H.parentNode;
            }
          },
        },
        value: {
          get: function () {
            return this._getattr("value") || this.text;
          },
          set: function (H) {
            this._setattr("value", H);
          },
        },
        text: {
          get: function () {
            return this.textContent.replace(/[ \t\n\f\r]+/g, " ").trim();
          },
          set: function (H) {
            this.textContent = H;
          },
        },
      },
      attributes: { disabled: Boolean, defaultSelected: { name: "selected", type: Boolean }, label: String },
    });
    R7({
      tag: "output",
      name: "HTMLOutputElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: { name: String },
    });
    R7({
      tag: "p",
      name: "HTMLParagraphElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String },
    });
    R7({
      tag: "param",
      name: "HTMLParamElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { name: String, value: String, type: String, valueType: String },
    });
    R7({
      tags: ["pre", "listing", "xmp"],
      name: "HTMLPreElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { width: { type: "long", default: 0 } },
    });
    R7({
      tag: "progress",
      name: "HTMLProgressElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: xm,
      attributes: { max: { type: Number, float: !0, default: 1, min: 0 } },
    });
    R7({
      tags: ["q", "blockquote"],
      name: "HTMLQuoteElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { cite: oD },
    });
    R7({
      tag: "script",
      name: "HTMLScriptElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        text: {
          get: function () {
            var H = "";
            for (var _ = 0, q = this.childNodes.length; _ < q; _++) {
              var $ = this.childNodes[_];
              if ($.nodeType === gs6.TEXT_NODE) H += $._data;
            }
            return H;
          },
          set: function (H) {
            if ((this.removeChildren(), H !== null && H !== "")) this.appendChild(this.ownerDocument.createTextNode(H));
          },
        },
      },
      attributes: {
        src: oD,
        type: String,
        charset: String,
        referrerPolicy: PyH,
        defer: Boolean,
        async: Boolean,
        nomodule: Boolean,
        crossOrigin: qd_,
        nonce: String,
        integrity: String,
      },
    });
    R7({
      tag: "select",
      name: "HTMLSelectElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: {
        form: xm.form,
        options: {
          get: function () {
            return this.getElementsByTagName("option");
          },
        },
      },
      attributes: {
        autocomplete: String,
        name: String,
        disabled: Boolean,
        autofocus: Boolean,
        multiple: Boolean,
        required: Boolean,
        size: { type: "unsigned long", default: 0 },
      },
    });
    R7({
      tag: "span",
      name: "HTMLSpanElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
    });
    R7({
      tag: "style",
      name: "HTMLStyleElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { media: String, type: String, scoped: Boolean },
    });
    R7({
      tag: "caption",
      name: "HTMLTableCaptionElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { align: String },
    });
    R7({
      name: "HTMLTableCellElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        colSpan: { type: "unsigned long", default: 1 },
        rowSpan: { type: "unsigned long", default: 1 },
        scope: { type: ["row", "col", "rowgroup", "colgroup"], missing: "" },
        abbr: String,
        align: String,
        axis: String,
        height: String,
        width: String,
        ch: { name: "char", type: String },
        chOff: { name: "charoff", type: String },
        noWrap: Boolean,
        vAlign: String,
        bgColor: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tags: ["col", "colgroup"],
      name: "HTMLTableColElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        span: { type: "limited unsigned long with fallback", default: 1, min: 1 },
        align: String,
        ch: { name: "char", type: String },
        chOff: { name: "charoff", type: String },
        vAlign: String,
        width: String,
      },
    });
    R7({
      tag: "table",
      name: "HTMLTableElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        rows: {
          get: function () {
            return this.getElementsByTagName("tr");
          },
        },
      },
      attributes: {
        align: String,
        border: String,
        frame: String,
        rules: String,
        summary: String,
        width: String,
        bgColor: { type: String, treatNullAsEmptyString: !0 },
        cellPadding: { type: String, treatNullAsEmptyString: !0 },
        cellSpacing: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tag: "template",
      name: "HTMLTemplateElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $), (this._contentFragment = _._templateDoc.createDocumentFragment());
      },
      props: {
        content: {
          get: function () {
            return this._contentFragment;
          },
        },
        serialize: {
          value: function () {
            return this.content.serialize();
          },
        },
      },
    });
    R7({
      tag: "tr",
      name: "HTMLTableRowElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        cells: {
          get: function () {
            return this.querySelectorAll("td,th");
          },
        },
      },
      attributes: {
        align: String,
        ch: { name: "char", type: String },
        chOff: { name: "charoff", type: String },
        vAlign: String,
        bgColor: { type: String, treatNullAsEmptyString: !0 },
      },
    });
    R7({
      tags: ["thead", "tfoot", "tbody"],
      name: "HTMLTableSectionElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        rows: {
          get: function () {
            return this.getElementsByTagName("tr");
          },
        },
      },
      attributes: {
        align: String,
        ch: { name: "char", type: String },
        chOff: { name: "charoff", type: String },
        vAlign: String,
      },
    });
    R7({
      tag: "textarea",
      name: "HTMLTextAreaElement",
      ctor: function (_, q, $) {
        um.call(this, _, q, $);
      },
      props: {
        form: xm.form,
        type: {
          get: function () {
            return "textarea";
          },
        },
        defaultValue: {
          get: function () {
            return this.textContent;
          },
          set: function (H) {
            this.textContent = H;
          },
        },
        value: {
          get: function () {
            return this.defaultValue;
          },
          set: function (H) {
            this.defaultValue = H;
          },
        },
        textLength: {
          get: function () {
            return this.value.length;
          },
        },
      },
      attributes: {
        autocomplete: String,
        name: String,
        disabled: Boolean,
        autofocus: Boolean,
        placeholder: String,
        wrap: String,
        dirName: String,
        required: Boolean,
        readOnly: Boolean,
        rows: { type: "limited unsigned long with fallback", default: 2 },
        cols: { type: "limited unsigned long with fallback", default: 20 },
        maxLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 },
        minLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 },
        inputMode: {
          type: [
            "verbatim",
            "latin",
            "latin-name",
            "latin-prose",
            "full-width-latin",
            "kana",
            "kana-name",
            "katakana",
            "numeric",
            "tel",
            "email",
            "url",
          ],
          missing: "",
        },
      },
    });
    R7({
      tag: "time",
      name: "HTMLTimeElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { dateTime: String, pubDate: Boolean },
    });
    R7({
      tag: "title",
      name: "HTMLTitleElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        text: {
          get: function () {
            return this.textContent;
          },
        },
      },
    });
    R7({
      tag: "ul",
      name: "HTMLUListElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { type: String, compact: Boolean },
    });
    R7({
      name: "HTMLMediaElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        src: oD,
        crossOrigin: qd_,
        preload: { type: ["metadata", "none", "auto", { value: "", alias: "auto" }], missing: "auto" },
        loop: Boolean,
        autoplay: Boolean,
        mediaGroup: String,
        controls: Boolean,
        defaultMuted: { name: "muted", type: Boolean },
      },
    });
    R7({
      name: "HTMLAudioElement",
      tag: "audio",
      superclass: Co.HTMLMediaElement,
      ctor: function (_, q, $) {
        Co.HTMLMediaElement.call(this, _, q, $);
      },
    });
    R7({
      name: "HTMLVideoElement",
      tag: "video",
      superclass: Co.HTMLMediaElement,
      ctor: function (_, q, $) {
        Co.HTMLMediaElement.call(this, _, q, $);
      },
      attributes: {
        poster: oD,
        width: { type: "unsigned long", min: 0, default: 0 },
        height: { type: "unsigned long", min: 0, default: 0 },
      },
    });
    R7({
      tag: "td",
      name: "HTMLTableDataCellElement",
      superclass: Co.HTMLTableCellElement,
      ctor: function (_, q, $) {
        Co.HTMLTableCellElement.call(this, _, q, $);
      },
    });
    R7({
      tag: "th",
      name: "HTMLTableHeaderCellElement",
      superclass: Co.HTMLTableCellElement,
      ctor: function (_, q, $) {
        Co.HTMLTableCellElement.call(this, _, q, $);
      },
    });
    R7({
      tag: "frameset",
      name: "HTMLFrameSetElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
    });
    R7({
      tag: "frame",
      name: "HTMLFrameElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
    });
    R7({
      tag: "canvas",
      name: "HTMLCanvasElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        getContext: { value: KV.nyi },
        probablySupportsContext: { value: KV.nyi },
        setContext: { value: KV.nyi },
        transferControlToProxy: { value: KV.nyi },
        toDataURL: { value: KV.nyi },
        toBlob: { value: KV.nyi },
      },
      attributes: { width: { type: "unsigned long", default: 300 }, height: { type: "unsigned long", default: 150 } },
    });
    R7({
      tag: "dialog",
      name: "HTMLDialogElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: { show: { value: KV.nyi }, showModal: { value: KV.nyi }, close: { value: KV.nyi } },
      attributes: { open: Boolean, returnValue: String },
    });
    R7({
      tag: "menuitem",
      name: "HTMLMenuItemElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      props: {
        _label: {
          get: function () {
            var H = this._getattr("label");
            if (H !== null && H !== "") return H;
            return (H = this.textContent), H.replace(/[ \t\n\f\r]+/g, " ").trim();
          },
        },
        label: {
          get: function () {
            var H = this._getattr("label");
            if (H !== null) return H;
            return this._label;
          },
          set: function (H) {
            this._setattr("label", H);
          },
        },
      },
      attributes: {
        type: { type: ["command", "checkbox", "radio"], missing: "command" },
        icon: oD,
        disabled: Boolean,
        checked: Boolean,
        radiogroup: String,
        default: Boolean,
      },
    });
    R7({
      tag: "source",
      name: "HTMLSourceElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        srcset: String,
        sizes: String,
        media: String,
        src: oD,
        type: String,
        width: String,
        height: String,
      },
    });
    R7({
      tag: "track",
      name: "HTMLTrackElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        src: oD,
        srclang: String,
        label: String,
        default: Boolean,
        kind: {
          type: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
          missing: "subtitles",
          invalid: "metadata",
        },
      },
      props: {
        NONE: {
          get: function () {
            return 0;
          },
        },
        LOADING: {
          get: function () {
            return 1;
          },
        },
        LOADED: {
          get: function () {
            return 2;
          },
        },
        ERROR: {
          get: function () {
            return 3;
          },
        },
        readyState: { get: KV.nyi },
        track: { get: KV.nyi },
      },
    });
    R7({
      tag: "font",
      name: "HTMLFontElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: {
        color: { type: String, treatNullAsEmptyString: !0 },
        face: { type: String },
        size: { type: String },
      },
    });
    R7({
      tag: "dir",
      name: "HTMLDirectoryElement",
      ctor: function (_, q, $) {
        g9.call(this, _, q, $);
      },
      attributes: { compact: Boolean },
    });
    R7({
      tags: [
        "abbr",
        "address",
        "article",
        "aside",
        "b",
        "bdi",
        "bdo",
        "cite",
        "content",
        "code",
        "dd",
        "dfn",
        "dt",
        "em",
        "figcaption",
        "figure",
        "footer",
        "header",
        "hgroup",
        "i",
        "kbd",
        "main",
        "mark",
        "nav",
        "noscript",
        "rb",
        "rp",
        "rt",
        "rtc",
        "ruby",
        "s",
        "samp",
        "section",
        "small",
        "strong",
        "sub",
        "summary",
        "sup",
        "u",
        "var",
        "wbr",
        "acronym",
        "basefont",
        "big",
        "center",
        "nobr",
        "noembed",
        "noframes",
        "plaintext",
        "strike",
        "tt",
      ],
    });
  });

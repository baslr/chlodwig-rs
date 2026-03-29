  var IM7 = d((h3) => {
    var _$1 = SM7(),
      { DOCUMENT_MODE: q$1 } = pu6(),
      EM7 = { element: 1, text: 3, cdata: 4, comment: 8 },
      CM7 = {
        tagName: "name",
        childNodes: "children",
        parentNode: "parent",
        previousSibling: "prev",
        nextSibling: "next",
        nodeValue: "data",
      };
    class M8H {
      constructor(H) {
        for (let _ of Object.keys(H)) this[_] = H[_];
      }
      get firstChild() {
        let H = this.children;
        return (H && H[0]) || null;
      }
      get lastChild() {
        let H = this.children;
        return (H && H[H.length - 1]) || null;
      }
      get nodeType() {
        return EM7[this.type] || EM7.element;
      }
    }
    Object.keys(CM7).forEach((H) => {
      let _ = CM7[H];
      Object.defineProperty(M8H.prototype, H, {
        get: function () {
          return this[_] || null;
        },
        set: function (q) {
          return (this[_] = q), q;
        },
      });
    });
    h3.createDocument = function () {
      return new M8H({
        type: "root",
        name: "root",
        parent: null,
        prev: null,
        next: null,
        children: [],
        "x-mode": q$1.NO_QUIRKS,
      });
    };
    h3.createDocumentFragment = function () {
      return new M8H({ type: "root", name: "root", parent: null, prev: null, next: null, children: [] });
    };
    h3.createElement = function (H, _, q) {
      let $ = Object.create(null),
        K = Object.create(null),
        O = Object.create(null);
      for (let T = 0; T < q.length; T++) {
        let z = q[T].name;
        ($[z] = q[T].value), (K[z] = q[T].namespace), (O[z] = q[T].prefix);
      }
      return new M8H({
        type: H === "script" || H === "style" ? H : "tag",
        name: H,
        namespace: _,
        attribs: $,
        "x-attribsNamespace": K,
        "x-attribsPrefix": O,
        children: [],
        parent: null,
        prev: null,
        next: null,
      });
    };
    h3.createCommentNode = function (H) {
      return new M8H({ type: "comment", data: H, parent: null, prev: null, next: null });
    };
    var bM7 = function (H) {
        return new M8H({ type: "text", data: H, parent: null, prev: null, next: null });
      },
      Bu6 = (h3.appendChild = function (H, _) {
        let q = H.children[H.children.length - 1];
        if (q) (q.next = _), (_.prev = q);
        H.children.push(_), (_.parent = H);
      }),
      $$1 = (h3.insertBefore = function (H, _, q) {
        let $ = H.children.indexOf(q),
          K = q.prev;
        if (K) (K.next = _), (_.prev = K);
        (q.prev = _), (_.next = q), H.children.splice($, 0, _), (_.parent = H);
      });
    h3.setTemplateContent = function (H, _) {
      Bu6(H, _);
    };
    h3.getTemplateContent = function (H) {
      return H.children[0];
    };
    h3.setDocumentType = function (H, _, q, $) {
      let K = _$1.serializeContent(_, q, $),
        O = null;
      for (let T = 0; T < H.children.length; T++)
        if (H.children[T].type === "directive" && H.children[T].name === "!doctype") {
          O = H.children[T];
          break;
        }
      if (O) (O.data = K), (O["x-name"] = _), (O["x-publicId"] = q), (O["x-systemId"] = $);
      else
        Bu6(
          H,
          new M8H({ type: "directive", name: "!doctype", data: K, "x-name": _, "x-publicId": q, "x-systemId": $ }),
        );
    };
    h3.setDocumentMode = function (H, _) {
      H["x-mode"] = _;
    };
    h3.getDocumentMode = function (H) {
      return H["x-mode"];
    };
    h3.detachNode = function (H) {
      if (H.parent) {
        let _ = H.parent.children.indexOf(H),
          q = H.prev,
          $ = H.next;
        if (((H.prev = null), (H.next = null), q)) q.next = $;
        if ($) $.prev = q;
        H.parent.children.splice(_, 1), (H.parent = null);
      }
    };
    h3.insertText = function (H, _) {
      let q = H.children[H.children.length - 1];
      if (q && q.type === "text") q.data += _;
      else Bu6(H, bM7(_));
    };
    h3.insertTextBefore = function (H, _, q) {
      let $ = H.children[H.children.indexOf(q) - 1];
      if ($ && $.type === "text") $.data += _;
      else $$1(H, bM7(_), q);
    };
    h3.adoptAttributes = function (H, _) {
      for (let q = 0; q < _.length; q++) {
        let $ = _[q].name;
        if (typeof H.attribs[$] > "u")
          (H.attribs[$] = _[q].value),
            (H["x-attribsNamespace"][$] = _[q].namespace),
            (H["x-attribsPrefix"][$] = _[q].prefix);
      }
    };
    h3.getFirstChild = function (H) {
      return H.children[0];
    };
    h3.getChildNodes = function (H) {
      return H.children;
    };
    h3.getParentNode = function (H) {
      return H.parent;
    };
    h3.getAttrList = function (H) {
      let _ = [];
      for (let q in H.attribs)
        _.push({
          name: q,
          value: H.attribs[q],
          namespace: H["x-attribsNamespace"][q],
          prefix: H["x-attribsPrefix"][q],
        });
      return _;
    };
    h3.getTagName = function (H) {
      return H.name;
    };
    h3.getNamespaceURI = function (H) {
      return H.namespace;
    };
    h3.getTextNodeContent = function (H) {
      return H.data;
    };
    h3.getCommentNodeContent = function (H) {
      return H.data;
    };
    h3.getDocumentTypeNodeName = function (H) {
      return H["x-name"];
    };
    h3.getDocumentTypeNodePublicId = function (H) {
      return H["x-publicId"];
    };
    h3.getDocumentTypeNodeSystemId = function (H) {
      return H["x-systemId"];
    };
    h3.isTextNode = function (H) {
      return H.type === "text";
    };
    h3.isCommentNode = function (H) {
      return H.type === "comment";
    };
    h3.isDocumentTypeNode = function (H) {
      return H.type === "directive" && H.name === "!doctype";
    };
    h3.isElementNode = function (H) {
      return !!H.attribs;
    };
    h3.setNodeSourceCodeLocation = function (H, _) {
      H.sourceCodeLocation = _;
    };
    h3.getNodeSourceCodeLocation = function (H) {
      return H.sourceCodeLocation;
    };
    h3.updateNodeSourceCodeLocation = function (H, _) {
      H.sourceCodeLocation = Object.assign(H.sourceCodeLocation, _);
    };
  });

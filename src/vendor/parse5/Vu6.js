  var Vu6 = d((Q3) => {
    var { DOCUMENT_MODE: iq1 } = w8H();
    Q3.createDocument = function () {
      return { nodeName: "#document", mode: iq1.NO_QUIRKS, childNodes: [] };
    };
    Q3.createDocumentFragment = function () {
      return { nodeName: "#document-fragment", childNodes: [] };
    };
    Q3.createElement = function (H, _, q) {
      return { nodeName: H, tagName: H, attrs: q, namespaceURI: _, childNodes: [], parentNode: null };
    };
    Q3.createCommentNode = function (H) {
      return { nodeName: "#comment", data: H, parentNode: null };
    };
    var ij7 = function (H) {
        return { nodeName: "#text", value: H, parentNode: null };
      },
      nj7 = (Q3.appendChild = function (H, _) {
        H.childNodes.push(_), (_.parentNode = H);
      }),
      nq1 = (Q3.insertBefore = function (H, _, q) {
        let $ = H.childNodes.indexOf(q);
        H.childNodes.splice($, 0, _), (_.parentNode = H);
      });
    Q3.setTemplateContent = function (H, _) {
      H.content = _;
    };
    Q3.getTemplateContent = function (H) {
      return H.content;
    };
    Q3.setDocumentType = function (H, _, q, $) {
      let K = null;
      for (let O = 0; O < H.childNodes.length; O++)
        if (H.childNodes[O].nodeName === "#documentType") {
          K = H.childNodes[O];
          break;
        }
      if (K) (K.name = _), (K.publicId = q), (K.systemId = $);
      else nj7(H, { nodeName: "#documentType", name: _, publicId: q, systemId: $ });
    };
    Q3.setDocumentMode = function (H, _) {
      H.mode = _;
    };
    Q3.getDocumentMode = function (H) {
      return H.mode;
    };
    Q3.detachNode = function (H) {
      if (H.parentNode) {
        let _ = H.parentNode.childNodes.indexOf(H);
        H.parentNode.childNodes.splice(_, 1), (H.parentNode = null);
      }
    };
    Q3.insertText = function (H, _) {
      if (H.childNodes.length) {
        let q = H.childNodes[H.childNodes.length - 1];
        if (q.nodeName === "#text") {
          q.value += _;
          return;
        }
      }
      nj7(H, ij7(_));
    };
    Q3.insertTextBefore = function (H, _, q) {
      let $ = H.childNodes[H.childNodes.indexOf(q) - 1];
      if ($ && $.nodeName === "#text") $.value += _;
      else nq1(H, ij7(_), q);
    };
    Q3.adoptAttributes = function (H, _) {
      let q = [];
      for (let $ = 0; $ < H.attrs.length; $++) q.push(H.attrs[$].name);
      for (let $ = 0; $ < _.length; $++) if (q.indexOf(_[$].name) === -1) H.attrs.push(_[$]);
    };
    Q3.getFirstChild = function (H) {
      return H.childNodes[0];
    };
    Q3.getChildNodes = function (H) {
      return H.childNodes;
    };
    Q3.getParentNode = function (H) {
      return H.parentNode;
    };
    Q3.getAttrList = function (H) {
      return H.attrs;
    };
    Q3.getTagName = function (H) {
      return H.tagName;
    };
    Q3.getNamespaceURI = function (H) {
      return H.namespaceURI;
    };
    Q3.getTextNodeContent = function (H) {
      return H.value;
    };
    Q3.getCommentNodeContent = function (H) {
      return H.data;
    };
    Q3.getDocumentTypeNodeName = function (H) {
      return H.name;
    };
    Q3.getDocumentTypeNodePublicId = function (H) {
      return H.publicId;
    };
    Q3.getDocumentTypeNodeSystemId = function (H) {
      return H.systemId;
    };
    Q3.isTextNode = function (H) {
      return H.nodeName === "#text";
    };
    Q3.isCommentNode = function (H) {
      return H.nodeName === "#comment";
    };
    Q3.isDocumentTypeNode = function (H) {
      return H.nodeName === "#documentType";
    };
    Q3.isElementNode = function (H) {
      return !!H.tagName;
    };
    Q3.setNodeSourceCodeLocation = function (H, _) {
      H.sourceCodeLocation = _;
    };
    Q3.getNodeSourceCodeLocation = function (H) {
      return H.sourceCodeLocation;
    };
  });

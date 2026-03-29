  var rD = d((QO) => {
    var nD = gg_(),
      m2 = nD,
      cd1 = dg_().isApiWritable;
    QO.NAMESPACE = {
      HTML: "http://www.w3.org/1999/xhtml",
      XML: "http://www.w3.org/XML/1998/namespace",
      XMLNS: "http://www.w3.org/2000/xmlns/",
      MATHML: "http://www.w3.org/1998/Math/MathML",
      SVG: "http://www.w3.org/2000/svg",
      XLINK: "http://www.w3.org/1999/xlink",
    };
    QO.IndexSizeError = function () {
      throw new nD(m2.INDEX_SIZE_ERR);
    };
    QO.HierarchyRequestError = function () {
      throw new nD(m2.HIERARCHY_REQUEST_ERR);
    };
    QO.WrongDocumentError = function () {
      throw new nD(m2.WRONG_DOCUMENT_ERR);
    };
    QO.InvalidCharacterError = function () {
      throw new nD(m2.INVALID_CHARACTER_ERR);
    };
    QO.NoModificationAllowedError = function () {
      throw new nD(m2.NO_MODIFICATION_ALLOWED_ERR);
    };
    QO.NotFoundError = function () {
      throw new nD(m2.NOT_FOUND_ERR);
    };
    QO.NotSupportedError = function () {
      throw new nD(m2.NOT_SUPPORTED_ERR);
    };
    QO.InvalidStateError = function () {
      throw new nD(m2.INVALID_STATE_ERR);
    };
    QO.SyntaxError = function () {
      throw new nD(m2.SYNTAX_ERR);
    };
    QO.InvalidModificationError = function () {
      throw new nD(m2.INVALID_MODIFICATION_ERR);
    };
    QO.NamespaceError = function () {
      throw new nD(m2.NAMESPACE_ERR);
    };
    QO.InvalidAccessError = function () {
      throw new nD(m2.INVALID_ACCESS_ERR);
    };
    QO.TypeMismatchError = function () {
      throw new nD(m2.TYPE_MISMATCH_ERR);
    };
    QO.SecurityError = function () {
      throw new nD(m2.SECURITY_ERR);
    };
    QO.NetworkError = function () {
      throw new nD(m2.NETWORK_ERR);
    };
    QO.AbortError = function () {
      throw new nD(m2.ABORT_ERR);
    };
    QO.UrlMismatchError = function () {
      throw new nD(m2.URL_MISMATCH_ERR);
    };
    QO.QuotaExceededError = function () {
      throw new nD(m2.QUOTA_EXCEEDED_ERR);
    };
    QO.TimeoutError = function () {
      throw new nD(m2.TIMEOUT_ERR);
    };
    QO.InvalidNodeTypeError = function () {
      throw new nD(m2.INVALID_NODE_TYPE_ERR);
    };
    QO.DataCloneError = function () {
      throw new nD(m2.DATA_CLONE_ERR);
    };
    QO.nyi = function () {
      throw Error("NotYetImplemented");
    };
    QO.shouldOverride = function () {
      throw Error("Abstract function; should be overriding in subclass.");
    };
    QO.assert = function (H, _) {
      if (!H)
        throw Error(
          "Assertion failed: " +
            (_ || "") +
            `
` +
            Error().stack,
        );
    };
    QO.expose = function (H, _) {
      for (var q in H) Object.defineProperty(_.prototype, q, { value: H[q], writable: cd1 });
    };
    QO.merge = function (H, _) {
      for (var q in _) H[q] = _[q];
    };
    QO.documentOrder = function (H, _) {
      return 3 - (H.compareDocumentPosition(_) & 6);
    };
    QO.toASCIILowerCase = function (H) {
      return H.replace(/[A-Z]+/g, function (_) {
        return _.toLowerCase();
      });
    };
    QO.toASCIIUpperCase = function (H) {
      return H.replace(/[a-z]+/g, function (_) {
        return _.toUpperCase();
      });
    };
  });

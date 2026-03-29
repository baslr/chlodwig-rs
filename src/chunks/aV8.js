  var aV8 = d((lt) => {
    var H0$ = iV8(),
      _0$ = (H) => {
        return {
          setHttpHandler(_) {
            H.httpHandler = _;
          },
          httpHandler() {
            return H.httpHandler;
          },
          updateHttpClientConfig(_, q) {
            H.httpHandler?.updateHttpClientConfig(_, q);
          },
          httpHandlerConfigs() {
            return H.httpHandler.httpHandlerConfigs();
          },
        };
      },
      q0$ = (H) => {
        return { httpHandler: H.httpHandler() };
      };
    class nV8 {
      name;
      kind;
      values;
      constructor({ name: H, kind: _ = H0$.FieldPosition.HEADER, values: q = [] }) {
        (this.name = H), (this.kind = _), (this.values = q);
      }
      add(H) {
        this.values.push(H);
      }
      set(H) {
        this.values = H;
      }
      remove(H) {
        this.values = this.values.filter((_) => _ !== H);
      }
      toString() {
        return this.values.map((H) => (H.includes(",") || H.includes(" ") ? `"${H}"` : H)).join(", ");
      }
      get() {
        return this.values;
      }
    }
    class rV8 {
      entries = {};
      encoding;
      constructor({ fields: H = [], encoding: _ = "utf-8" }) {
        H.forEach(this.setField.bind(this)), (this.encoding = _);
      }
      setField(H) {
        this.entries[H.name.toLowerCase()] = H;
      }
      getField(H) {
        return this.entries[H.toLowerCase()];
      }
      removeField(H) {
        delete this.entries[H.toLowerCase()];
      }
      getByType(H) {
        return Object.values(this.entries).filter((_) => _.kind === H);
      }
    }
    class MO_ {
      method;
      protocol;
      hostname;
      port;
      path;
      query;
      headers;
      username;
      password;
      fragment;
      body;
      constructor(H) {
        (this.method = H.method || "GET"),
          (this.hostname = H.hostname || "localhost"),
          (this.port = H.port),
          (this.query = H.query || {}),
          (this.headers = H.headers || {}),
          (this.body = H.body),
          (this.protocol = H.protocol ? (H.protocol.slice(-1) !== ":" ? `${H.protocol}:` : H.protocol) : "https:"),
          (this.path = H.path ? (H.path.charAt(0) !== "/" ? `/${H.path}` : H.path) : "/"),
          (this.username = H.username),
          (this.password = H.password),
          (this.fragment = H.fragment);
      }
      static clone(H) {
        let _ = new MO_({ ...H, headers: { ...H.headers } });
        if (_.query) _.query = $0$(_.query);
        return _;
      }
      static isInstance(H) {
        if (!H) return !1;
        let _ = H;
        return (
          "method" in _ &&
          "protocol" in _ &&
          "hostname" in _ &&
          "path" in _ &&
          typeof _.query === "object" &&
          typeof _.headers === "object"
        );
      }
      clone() {
        return MO_.clone(this);
      }
    }
    function $0$(H) {
      return Object.keys(H).reduce((_, q) => {
        let $ = H[q];
        return { ..._, [q]: Array.isArray($) ? [...$] : $ };
      }, {});
    }
    class oV8 {
      statusCode;
      reason;
      headers;
      body;
      constructor(H) {
        (this.statusCode = H.statusCode),
          (this.reason = H.reason),
          (this.headers = H.headers || {}),
          (this.body = H.body);
      }
      static isInstance(H) {
        if (!H) return !1;
        let _ = H;
        return typeof _.statusCode === "number" && typeof _.headers === "object";
      }
    }
    function K0$(H) {
      return /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/.test(H);
    }
    lt.Field = nV8;
    lt.Fields = rV8;
    lt.HttpRequest = MO_;
    lt.HttpResponse = oV8;
    lt.getHttpHandlerExtensionConfiguration = _0$;
    lt.isValidHostname = K0$;
    lt.resolveHttpHandlerRuntimeConfig = q0$;
  });

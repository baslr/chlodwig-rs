    q7 = class q7 extends Error {};
    rq = class rq extends q7 {
      constructor(H, _, q, $) {
        super(`${rq.makeMessage(H, _, q)}`);
        (this.status = H), (this.headers = $), (this.requestID = $?.get("request-id")), (this.error = _);
      }
      static makeMessage(H, _, q) {
        let $ = _?.message
          ? typeof _.message === "string"
            ? _.message
            : JSON.stringify(_.message)
          : _
            ? JSON.stringify(_)
            : q;
        if (H && $) return `${H} ${$}`;
        if (H) return `${H} status code (no body)`;
        if ($) return $;
        return "(no status code or body)";
      }
      static generate(H, _, q, $) {
        if (!H || !$) return new TX({ message: q, cause: zbH(_) });
        let K = _;
        if (H === 400) return new AbH(H, K, q, $);
        if (H === 401) return new X4H(H, K, q, $);
        if (H === 403) return new fbH(H, K, q, $);
        if (H === 404) return new W4H(H, K, q, $);
        if (H === 409) return new wbH(H, K, q, $);
        if (H === 422) return new YbH(H, K, q, $);
        if (H === 429) return new DbH(H, K, q, $);
        if (H >= 500) return new jbH(H, K, q, $);
        return new rq(H, K, q, $);
      }
    };
    FK = class FK extends rq {
      constructor({ message: H } = {}) {
        super(void 0, void 0, H || "Request was aborted.", void 0);
      }
    };
    TX = class TX extends rq {
      constructor({ message: H, cause: _ }) {
        super(void 0, void 0, H || "Connection error.", void 0);
        if (_) this.cause = _;
      }
    };
    up = class up extends TX {
      constructor({ message: H } = {}) {
        super({ message: H ?? "Request timed out." });
      }
    };
    AbH = class AbH extends rq {};
    X4H = class X4H extends rq {};
    fbH = class fbH extends rq {};
    W4H = class W4H extends rq {};
    wbH = class wbH extends rq {};
    YbH = class YbH extends rq {};
    DbH = class DbH extends rq {};
    jbH = class jbH extends rq {};

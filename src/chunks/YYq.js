  var YYq = d((mS) => {
    var jt$ =
        (mS && mS.__createBinding) ||
        (Object.create
          ? function (H, _, q, $) {
              if ($ === void 0) $ = q;
              var K = Object.getOwnPropertyDescriptor(_, q);
              if (!K || ("get" in K ? !_.__esModule : K.writable || K.configurable))
                K = {
                  enumerable: !0,
                  get: function () {
                    return _[q];
                  },
                };
              Object.defineProperty(H, $, K);
            }
          : function (H, _, q, $) {
              if ($ === void 0) $ = q;
              H[$] = _[q];
            }),
      Mt$ =
        (mS && mS.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      wYq =
        (mS && mS.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) jt$(_, H, q);
          }
          return Mt$(_, H), _;
        },
      Jt$ =
        (mS && mS.__importDefault) ||
        function (H) {
          return H && H.__esModule ? H : { default: H };
        };
    Object.defineProperty(mS, "__esModule", { value: !0 });
    mS.HttpProxyAgent = void 0;
    var Pt$ = wYq(require("net")),
      Xt$ = wYq(require("tls")),
      Wt$ = Jt$(XMH()),
      Gt$ = require("events"),
      Rt$ = i46(),
      fYq = require("url"),
      UPH = (0, Wt$.default)("http-proxy-agent");
    class p26 extends Rt$.Agent {
      constructor(H, _) {
        super(_);
        (this.proxy = typeof H === "string" ? new fYq.URL(H) : H),
          (this.proxyHeaders = _?.headers ?? {}),
          UPH("Creating new HttpProxyAgent instance: %o", this.proxy.href);
        let q = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, ""),
          $ = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = { ...(_ ? Zt$(_, "headers") : null), host: q, port: $ };
      }
      addRequest(H, _) {
        (H._header = null), this.setRequestProps(H, _), super.addRequest(H, _);
      }
      setRequestProps(H, _) {
        let { proxy: q } = this,
          $ = _.secureEndpoint ? "https:" : "http:",
          K = H.getHeader("host") || "localhost",
          O = `${$}//${K}`,
          T = new fYq.URL(H.path, O);
        if (_.port !== 80) T.port = String(_.port);
        H.path = String(T);
        let z = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
        if (q.username || q.password) {
          let A = `${decodeURIComponent(q.username)}:${decodeURIComponent(q.password)}`;
          z["Proxy-Authorization"] = `Basic ${Buffer.from(A).toString("base64")}`;
        }
        if (!z["Proxy-Connection"]) z["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        for (let A of Object.keys(z)) {
          let f = z[A];
          if (f) H.setHeader(A, f);
        }
      }
      async connect(H, _) {
        if (((H._header = null), !H.path.includes("://"))) this.setRequestProps(H, _);
        let q, $;
        if (
          (UPH("Regenerating stored HTTP header string for request"),
          H._implicitHeader(),
          H.outputData && H.outputData.length > 0)
        )
          UPH("Patching connection write() output buffer with updated header"),
            (q = H.outputData[0].data),
            ($ =
              q.indexOf(`\r
\r
`) + 4),
            (H.outputData[0].data = H._header + q.substring($)),
            UPH("Output buffer: %o", H.outputData[0].data);
        let K;
        if (this.proxy.protocol === "https:")
          UPH("Creating `tls.Socket`: %o", this.connectOpts), (K = Xt$.connect(this.connectOpts));
        else UPH("Creating `net.Socket`: %o", this.connectOpts), (K = Pt$.connect(this.connectOpts));
        return await (0, Gt$.once)(K, "connect"), K;
      }
    }
    p26.protocols = ["http", "https"];
    mS.HttpProxyAgent = p26;
    function Zt$(H, ..._) {
      let q = {},
        $;
      for ($ in H) if (!_.includes($)) q[$] = H[$];
      return q;
    }
  });

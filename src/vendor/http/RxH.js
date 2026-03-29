  var RxH = d((fS) => {
    var Nj$ =
        (fS && fS.__createBinding) ||
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
      hj$ =
        (fS && fS.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      oL8 =
        (fS && fS.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) Nj$(_, H, q);
          }
          return hj$(_, H), _;
        },
      aL8 =
        (fS && fS.__importDefault) ||
        function (H) {
          return H && H.__esModule ? H : { default: H };
        };
    Object.defineProperty(fS, "__esModule", { value: !0 });
    fS.HttpsProxyAgent = void 0;
    var O3_ = oL8(require("net")),
      iL8 = oL8(require("tls")),
      yj$ = aL8(require("assert")),
      Vj$ = aL8(XMH()),
      Sj$ = i46(),
      Ej$ = require("url"),
      Cj$ = lL8(),
      GxH = (0, Vj$.default)("https-proxy-agent"),
      nL8 = (H) => {
        if (H.servername === void 0 && H.host && !O3_.isIP(H.host)) return { ...H, servername: H.host };
        return H;
      };
    class n46 extends Sj$.Agent {
      constructor(H, _) {
        super(_);
        (this.options = { path: void 0 }),
          (this.proxy = typeof H === "string" ? new Ej$.URL(H) : H),
          (this.proxyHeaders = _?.headers ?? {}),
          GxH("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
        let q = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, ""),
          $ = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = { ALPNProtocols: ["http/1.1"], ...(_ ? rL8(_, "headers") : null), host: q, port: $ };
      }
      async connect(H, _) {
        let { proxy: q } = this;
        if (!_.host) throw TypeError('No "host" provided');
        let $;
        if (q.protocol === "https:")
          GxH("Creating `tls.Socket`: %o", this.connectOpts), ($ = iL8.connect(nL8(this.connectOpts)));
        else GxH("Creating `net.Socket`: %o", this.connectOpts), ($ = O3_.connect(this.connectOpts));
        let K = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders },
          O = O3_.isIPv6(_.host) ? `[${_.host}]` : _.host,
          T = `CONNECT ${O}:${_.port} HTTP/1.1\r
`;
        if (q.username || q.password) {
          let Y = `${decodeURIComponent(q.username)}:${decodeURIComponent(q.password)}`;
          K["Proxy-Authorization"] = `Basic ${Buffer.from(Y).toString("base64")}`;
        }
        if (((K.Host = `${O}:${_.port}`), !K["Proxy-Connection"]))
          K["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        for (let Y of Object.keys(K))
          T += `${Y}: ${K[Y]}\r
`;
        let z = (0, Cj$.parseProxyResponse)($);
        $.write(`${T}\r
`);
        let { connect: A, buffered: f } = await z;
        if ((H.emit("proxyConnect", A), this.emit("proxyConnect", A, H), A.statusCode === 200)) {
          if ((H.once("socket", bj$), _.secureEndpoint))
            return (
              GxH("Upgrading socket connection to TLS"),
              iL8.connect({ ...rL8(nL8(_), "host", "path", "port"), socket: $ })
            );
          return $;
        }
        $.destroy();
        let w = new O3_.Socket({ writable: !1 });
        return (
          (w.readable = !0),
          H.once("socket", (Y) => {
            GxH("Replaying proxy buffer for failed request"),
              (0, yj$.default)(Y.listenerCount("data") > 0),
              Y.push(f),
              Y.push(null);
          }),
          w
        );
      }
    }
    n46.protocols = ["http", "https"];
    fS.HttpsProxyAgent = n46;
    function bj$(H) {
      H.resume();
    }
    function rL8(H, ..._) {
      let q = {},
        $;
      for ($ in H) if (!_.includes($)) q[$] = H[$];
      return q;
    }
  });

  var i46 = d((Zh) => {
    var FL8 =
        (Zh && Zh.__createBinding) ||
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
      Wj$ =
        (Zh && Zh.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      UL8 =
        (Zh && Zh.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) FL8(_, H, q);
          }
          return Wj$(_, H), _;
        },
      Gj$ =
        (Zh && Zh.__exportStar) ||
        function (H, _) {
          for (var q in H) if (q !== "default" && !Object.prototype.hasOwnProperty.call(_, q)) FL8(_, H, q);
        };
    Object.defineProperty(Zh, "__esModule", { value: !0 });
    Zh.Agent = void 0;
    var Rj$ = UL8(require("net")),
      cL8 = UL8(require("http")),
      Zj$ = require("https");
    Gj$(dL8(), Zh);
    var OB = Symbol("AgentBaseInternalState");
    class QL8 extends cL8.Agent {
      constructor(H) {
        super(H);
        this[OB] = {};
      }
      isSecureEndpoint(H) {
        if (H) {
          if (typeof H.secureEndpoint === "boolean") return H.secureEndpoint;
          if (typeof H.protocol === "string") return H.protocol === "https:";
        }
        let { stack: _ } = Error();
        if (typeof _ !== "string") return !1;
        return _.split(`
`).some((q) => q.indexOf("(https.js:") !== -1 || q.indexOf("node:https:") !== -1);
      }
      incrementSockets(H) {
        if (this.maxSockets === 1 / 0 && this.maxTotalSockets === 1 / 0) return null;
        if (!this.sockets[H]) this.sockets[H] = [];
        let _ = new Rj$.Socket({ writable: !1 });
        return this.sockets[H].push(_), this.totalSocketCount++, _;
      }
      decrementSockets(H, _) {
        if (!this.sockets[H] || _ === null) return;
        let q = this.sockets[H],
          $ = q.indexOf(_);
        if ($ !== -1) {
          if ((q.splice($, 1), this.totalSocketCount--, q.length === 0)) delete this.sockets[H];
        }
      }
      getName(H) {
        if (typeof H.secureEndpoint === "boolean" ? H.secureEndpoint : this.isSecureEndpoint(H))
          return Zj$.Agent.prototype.getName.call(this, H);
        return super.getName(H);
      }
      createSocket(H, _, q) {
        let $ = { ..._, secureEndpoint: this.isSecureEndpoint(_) },
          K = this.getName($),
          O = this.incrementSockets(K);
        Promise.resolve()
          .then(() => this.connect(H, $))
          .then(
            (T) => {
              if ((this.decrementSockets(K, O), T instanceof cL8.Agent))
                try {
                  return T.addRequest(H, $);
                } catch (z) {
                  return q(z);
                }
              (this[OB].currentSocket = T), super.createSocket(H, _, q);
            },
            (T) => {
              this.decrementSockets(K, O), q(T);
            },
          );
      }
      createConnection() {
        let H = this[OB].currentSocket;
        if (((this[OB].currentSocket = void 0), !H)) throw Error("No socket was returned in the `connect()` function");
        return H;
      }
      get defaultPort() {
        return this[OB].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
      }
      set defaultPort(H) {
        if (this[OB]) this[OB].defaultPort = H;
      }
      get protocol() {
        return this[OB].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
      }
      set protocol(H) {
        if (this[OB]) this[OB].protocol = H;
      }
    }
    Zh.Agent = QL8;
  });

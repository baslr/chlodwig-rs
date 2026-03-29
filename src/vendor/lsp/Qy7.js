  var Qy7 = d((o5) => {
    var tD1 =
        (o5 && o5.__createBinding) ||
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
      eD1 =
        (o5 && o5.__exportStar) ||
        function (H, _) {
          for (var q in H) if (q !== "default" && !Object.prototype.hasOwnProperty.call(_, q)) tD1(_, H, q);
        };
    Object.defineProperty(o5, "__esModule", { value: !0 });
    o5.createMessageConnection =
      o5.createServerSocketTransport =
      o5.createClientSocketTransport =
      o5.createServerPipeTransport =
      o5.createClientPipeTransport =
      o5.generateRandomPipeName =
      o5.StreamMessageWriter =
      o5.StreamMessageReader =
      o5.SocketMessageWriter =
      o5.SocketMessageReader =
      o5.PortMessageWriter =
      o5.PortMessageReader =
      o5.IPCMessageWriter =
      o5.IPCMessageReader =
        void 0;
    var VkH = py7();
    VkH.default.install();
    var By7 = require("path"),
      H21 = require("os"),
      _21 = require("crypto"),
      mE_ = require("net"),
      my = uE_();
    eD1(uE_(), o5);
    class dy7 extends my.AbstractMessageReader {
      constructor(H) {
        super();
        this.process = H;
        let _ = this.process;
        _.on("error", (q) => this.fireError(q)), _.on("close", () => this.fireClose());
      }
      listen(H) {
        return this.process.on("message", H), my.Disposable.create(() => this.process.off("message", H));
      }
    }
    o5.IPCMessageReader = dy7;
    class cy7 extends my.AbstractMessageWriter {
      constructor(H) {
        super();
        (this.process = H), (this.errorCount = 0);
        let _ = this.process;
        _.on("error", (q) => this.fireError(q)), _.on("close", () => this.fireClose);
      }
      write(H) {
        try {
          if (typeof this.process.send === "function")
            this.process.send(H, void 0, void 0, (_) => {
              if (_) this.errorCount++, this.handleError(_, H);
              else this.errorCount = 0;
            });
          return Promise.resolve();
        } catch (_) {
          return this.handleError(_, H), Promise.reject(_);
        }
      }
      handleError(H, _) {
        this.errorCount++, this.fireError(H, _, this.errorCount);
      }
      end() {}
    }
    o5.IPCMessageWriter = cy7;
    class Fy7 extends my.AbstractMessageReader {
      constructor(H) {
        super();
        (this.onData = new my.Emitter()),
          H.on("close", () => this.fireClose),
          H.on("error", (_) => this.fireError(_)),
          H.on("message", (_) => {
            this.onData.fire(_);
          });
      }
      listen(H) {
        return this.onData.event(H);
      }
    }
    o5.PortMessageReader = Fy7;
    class Uy7 extends my.AbstractMessageWriter {
      constructor(H) {
        super();
        (this.port = H),
          (this.errorCount = 0),
          H.on("close", () => this.fireClose()),
          H.on("error", (_) => this.fireError(_));
      }
      write(H) {
        try {
          return this.port.postMessage(H), Promise.resolve();
        } catch (_) {
          return this.handleError(_, H), Promise.reject(_);
        }
      }
      handleError(H, _) {
        this.errorCount++, this.fireError(H, _, this.errorCount);
      }
      end() {}
    }
    o5.PortMessageWriter = Uy7;
    class SkH extends my.ReadableStreamMessageReader {
      constructor(H, _ = "utf-8") {
        super((0, VkH.default)().stream.asReadableStream(H), _);
      }
    }
    o5.SocketMessageReader = SkH;
    class EkH extends my.WriteableStreamMessageWriter {
      constructor(H, _) {
        super((0, VkH.default)().stream.asWritableStream(H), _);
        this.socket = H;
      }
      dispose() {
        super.dispose(), this.socket.destroy();
      }
    }
    o5.SocketMessageWriter = EkH;
    class kd6 extends my.ReadableStreamMessageReader {
      constructor(H, _) {
        super((0, VkH.default)().stream.asReadableStream(H), _);
      }
    }
    o5.StreamMessageReader = kd6;
    class vd6 extends my.WriteableStreamMessageWriter {
      constructor(H, _) {
        super((0, VkH.default)().stream.asWritableStream(H), _);
      }
    }
    o5.StreamMessageWriter = vd6;
    var gy7 = process.env.XDG_RUNTIME_DIR,
      q21 = new Map([
        ["linux", 107],
        ["darwin", 103],
      ]);
    function $21() {
      let H = (0, _21.randomBytes)(21).toString("hex"),
        _;
      if (gy7) _ = By7.join(gy7, `vscode-ipc-${H}.sock`);
      else _ = By7.join(H21.tmpdir(), `vscode-${H}.sock`);
      let q = q21.get("darwin");
      if (q !== void 0 && _.length > q)
        (0, VkH.default)().console.warn(`WARNING: IPC handle "${_}" is longer than ${q} characters.`);
      return _;
    }
    o5.generateRandomPipeName = $21;
    function K21(H, _ = "utf-8") {
      let q,
        $ = new Promise((K, O) => {
          q = K;
        });
      return new Promise((K, O) => {
        let T = (0, mE_.createServer)((z) => {
          T.close(), q([new SkH(z, _), new EkH(z, _)]);
        });
        T.on("error", O),
          T.listen(H, () => {
            T.removeListener("error", O),
              K({
                onConnected: () => {
                  return $;
                },
              });
          });
      });
    }
    o5.createClientPipeTransport = K21;
    function O21(H, _ = "utf-8") {
      let q = (0, mE_.createConnection)(H);
      return [new SkH(q, _), new EkH(q, _)];
    }
    o5.createServerPipeTransport = O21;
    function T21(H, _ = "utf-8") {
      let q,
        $ = new Promise((K, O) => {
          q = K;
        });
      return new Promise((K, O) => {
        let T = (0, mE_.createServer)((z) => {
          T.close(), q([new SkH(z, _), new EkH(z, _)]);
        });
        T.on("error", O),
          T.listen(H, "127.0.0.1", () => {
            T.removeListener("error", O),
              K({
                onConnected: () => {
                  return $;
                },
              });
          });
      });
    }
    o5.createClientSocketTransport = T21;
    function z21(H, _ = "utf-8") {
      let q = (0, mE_.createConnection)(H, "127.0.0.1");
      return [new SkH(q, _), new EkH(q, _)];
    }
    o5.createServerSocketTransport = z21;
    function A21(H) {
      let _ = H;
      return _.read !== void 0 && _.addListener !== void 0;
    }
    function f21(H) {
      let _ = H;
      return _.write !== void 0 && _.addListener !== void 0;
    }
    function w21(H, _, q, $) {
      if (!q) q = my.NullLogger;
      let K = A21(H) ? new kd6(H) : H,
        O = f21(_) ? new vd6(_) : _;
      if (my.ConnectionStrategy.is($)) $ = { connectionStrategy: $ };
      return (0, my.createMessageConnection)(K, O, q, $);
    }
    o5.createMessageConnection = w21;
  });

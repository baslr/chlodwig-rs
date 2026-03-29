  var PU7 = d((J7H) => {
    var VS1 =
        (J7H && J7H.__runInitializers) ||
        function (H, _, q) {
          var $ = arguments.length > 2;
          for (var K = 0; K < _.length; K++) q = $ ? _[K].call(H, q) : _[K].call(H);
          return $ ? q : void 0;
        },
      SS1 =
        (J7H && J7H.__esDecorate) ||
        function (H, _, q, $, K, O) {
          function T(X) {
            if (X !== void 0 && typeof X !== "function") throw TypeError("Function expected");
            return X;
          }
          var z = $.kind,
            A = z === "getter" ? "get" : z === "setter" ? "set" : "value",
            f = !_ && H ? ($.static ? H : H.prototype) : null,
            w = _ || (f ? Object.getOwnPropertyDescriptor(f, $.name) : {}),
            Y,
            D = !1;
          for (var j = q.length - 1; j >= 0; j--) {
            var M = {};
            for (var J in $) M[J] = J === "access" ? {} : $[J];
            for (var J in $.access) M.access[J] = $.access[J];
            M.addInitializer = function (X) {
              if (D) throw TypeError("Cannot add initializers after decoration has completed");
              O.push(T(X || null));
            };
            var P = (0, q[j])(z === "accessor" ? { get: w.get, set: w.set } : w[A], M);
            if (z === "accessor") {
              if (P === void 0) continue;
              if (P === null || typeof P !== "object") throw TypeError("Object expected");
              if ((Y = T(P.get))) w.get = Y;
              if ((Y = T(P.set))) w.set = Y;
              if ((Y = T(P.init))) K.unshift(Y);
            } else if ((Y = T(P)))
              if (z === "field") K.unshift(Y);
              else w[A] = Y;
          }
          if (f) Object.defineProperty(f, $.name, w);
          D = !0;
        };
    Object.defineProperty(J7H, "__esModule", { value: !0 });
    J7H.Server = void 0;
    var lv = require("http2"),
      ES1 = require("util"),
      C2 = mK(),
      BNH = dF7(),
      Xi6 = lx_(),
      wU7 = qm(),
      pNH = DA(),
      M7H = Uv(),
      Dm = OL(),
      _J = w7H(),
      YU7 = Pi6(),
      mNH = 2147483647,
      Wi6 = 2147483647,
      CS1 = 20000,
      DU7 = 2147483647,
      { HTTP2_HEADER_PATH: jU7 } = lv.constants,
      bS1 = "server",
      MU7 = Buffer.from("max_age");
    function JU7(H) {
      pNH.trace(C2.LogVerbosity.DEBUG, "server_call", H);
    }
    function IS1() {}
    function uS1(H) {
      return function (_, q) {
        return ES1.deprecate(_, H);
      };
    }
    function Gi6(H) {
      return { code: C2.Status.UNIMPLEMENTED, details: `The server does not implement the method ${H}` };
    }
    function xS1(H, _) {
      let q = Gi6(_);
      switch (H) {
        case "unary":
          return ($, K) => {
            K(q, null);
          };
        case "clientStream":
          return ($, K) => {
            K(q, null);
          };
        case "serverStream":
          return ($) => {
            $.emit("error", q);
          };
        case "bidi":
          return ($) => {
            $.emit("error", q);
          };
        default:
          throw Error(`Invalid handlerType ${H}`);
      }
    }
    var mS1 = (() => {
      var H;
      let _ = [],
        q;
      return (
        (H = class {
          constructor(K) {
            var O, T, z, A, f, w;
            if (
              ((this.boundPorts = (VS1(this, _), new Map())),
              (this.http2Servers = new Map()),
              (this.sessionIdleTimeouts = new Map()),
              (this.handlers = new Map()),
              (this.sessions = new Map()),
              (this.started = !1),
              (this.shutdown = !1),
              (this.serverAddressString = "null"),
              (this.channelzEnabled = !0),
              (this.options = K !== null && K !== void 0 ? K : {}),
              this.options["grpc.enable_channelz"] === 0)
            )
              (this.channelzEnabled = !1),
                (this.channelzTrace = new _J.ChannelzTraceStub()),
                (this.callTracker = new _J.ChannelzCallTrackerStub()),
                (this.listenerChildrenTracker = new _J.ChannelzChildrenTrackerStub()),
                (this.sessionChildrenTracker = new _J.ChannelzChildrenTrackerStub());
            else
              (this.channelzTrace = new _J.ChannelzTrace()),
                (this.callTracker = new _J.ChannelzCallTracker()),
                (this.listenerChildrenTracker = new _J.ChannelzChildrenTracker()),
                (this.sessionChildrenTracker = new _J.ChannelzChildrenTracker());
            if (
              ((this.channelzRef = (0, _J.registerChannelzServer)(
                "server",
                () => this.getChannelzInfo(),
                this.channelzEnabled,
              )),
              this.channelzTrace.addTrace("CT_INFO", "Server created"),
              (this.maxConnectionAgeMs =
                (O = this.options["grpc.max_connection_age_ms"]) !== null && O !== void 0 ? O : mNH),
              (this.maxConnectionAgeGraceMs =
                (T = this.options["grpc.max_connection_age_grace_ms"]) !== null && T !== void 0 ? T : mNH),
              (this.keepaliveTimeMs = (z = this.options["grpc.keepalive_time_ms"]) !== null && z !== void 0 ? z : Wi6),
              (this.keepaliveTimeoutMs =
                (A = this.options["grpc.keepalive_timeout_ms"]) !== null && A !== void 0 ? A : CS1),
              (this.sessionIdleTimeout =
                (f = this.options["grpc.max_connection_idle_ms"]) !== null && f !== void 0 ? f : DU7),
              (this.commonServerOptions = { maxSendHeaderBlockLength: Number.MAX_SAFE_INTEGER }),
              "grpc-node.max_session_memory" in this.options)
            )
              this.commonServerOptions.maxSessionMemory = this.options["grpc-node.max_session_memory"];
            else this.commonServerOptions.maxSessionMemory = Number.MAX_SAFE_INTEGER;
            if ("grpc.max_concurrent_streams" in this.options)
              this.commonServerOptions.settings = { maxConcurrentStreams: this.options["grpc.max_concurrent_streams"] };
            (this.interceptors = (w = this.options.interceptors) !== null && w !== void 0 ? w : []),
              this.trace("Server constructed");
          }
          getChannelzInfo() {
            return {
              trace: this.channelzTrace,
              callTracker: this.callTracker,
              listenerChildren: this.listenerChildrenTracker.getChildLists(),
              sessionChildren: this.sessionChildrenTracker.getChildLists(),
            };
          }
          getChannelzSessionInfo(K) {
            var O, T, z;
            let A = this.sessions.get(K),
              f = K.socket,
              w = f.remoteAddress ? (0, M7H.stringToSubchannelAddress)(f.remoteAddress, f.remotePort) : null,
              Y = f.localAddress ? (0, M7H.stringToSubchannelAddress)(f.localAddress, f.localPort) : null,
              D;
            if (K.encrypted) {
              let M = f,
                J = M.getCipher(),
                P = M.getCertificate(),
                X = M.getPeerCertificate();
              D = {
                cipherSuiteStandardName: (O = J.standardName) !== null && O !== void 0 ? O : null,
                cipherSuiteOtherName: J.standardName ? null : J.name,
                localCertificate: P && "raw" in P ? P.raw : null,
                remoteCertificate: X && "raw" in X ? X.raw : null,
              };
            } else D = null;
            return {
              remoteAddress: w,
              localAddress: Y,
              security: D,
              remoteName: null,
              streamsStarted: A.streamTracker.callsStarted,
              streamsSucceeded: A.streamTracker.callsSucceeded,
              streamsFailed: A.streamTracker.callsFailed,
              messagesSent: A.messagesSent,
              messagesReceived: A.messagesReceived,
              keepAlivesSent: A.keepAlivesSent,
              lastLocalStreamCreatedTimestamp: null,
              lastRemoteStreamCreatedTimestamp: A.streamTracker.lastCallStartedTimestamp,
              lastMessageSentTimestamp: A.lastMessageSentTimestamp,
              lastMessageReceivedTimestamp: A.lastMessageReceivedTimestamp,
              localFlowControlWindow: (T = K.state.localWindowSize) !== null && T !== void 0 ? T : null,
              remoteFlowControlWindow: (z = K.state.remoteWindowSize) !== null && z !== void 0 ? z : null,
            };
          }
          trace(K) {
            pNH.trace(C2.LogVerbosity.DEBUG, bS1, "(" + this.channelzRef.id + ") " + K);
          }
          keepaliveTrace(K) {
            pNH.trace(C2.LogVerbosity.DEBUG, "keepalive", "(" + this.channelzRef.id + ") " + K);
          }
          addProtoService() {
            throw Error("Not implemented. Use addService() instead");
          }
          addService(K, O) {
            if (K === null || typeof K !== "object" || O === null || typeof O !== "object")
              throw Error("addService() requires two objects as arguments");
            let T = Object.keys(K);
            if (T.length === 0) throw Error("Cannot add an empty service to a server");
            T.forEach((z) => {
              let A = K[z],
                f;
              if (A.requestStream)
                if (A.responseStream) f = "bidi";
                else f = "clientStream";
              else if (A.responseStream) f = "serverStream";
              else f = "unary";
              let w = O[z],
                Y;
              if (w === void 0 && typeof A.originalName === "string") w = O[A.originalName];
              if (w !== void 0) Y = w.bind(O);
              else Y = xS1(f, z);
              if (this.register(A.path, Y, A.responseSerialize, A.requestDeserialize, f) === !1)
                throw Error(`Method handler for ${A.path} already provided.`);
            });
          }
          removeService(K) {
            if (K === null || typeof K !== "object") throw Error("removeService() requires object as argument");
            Object.keys(K).forEach((T) => {
              let z = K[T];
              this.unregister(z.path);
            });
          }
          bind(K, O) {
            throw Error("Not implemented. Use bindAsync() instead");
          }
          experimentalRegisterListenerToChannelz(K) {
            return (0, _J.registerChannelzSocket)(
              (0, M7H.subchannelAddressToString)(K),
              () => {
                return {
                  localAddress: K,
                  remoteAddress: null,
                  security: null,
                  remoteName: null,
                  streamsStarted: 0,
                  streamsSucceeded: 0,
                  streamsFailed: 0,
                  messagesSent: 0,
                  messagesReceived: 0,
                  keepAlivesSent: 0,
                  lastLocalStreamCreatedTimestamp: null,
                  lastRemoteStreamCreatedTimestamp: null,
                  lastMessageSentTimestamp: null,
                  lastMessageReceivedTimestamp: null,
                  localFlowControlWindow: null,
                  remoteFlowControlWindow: null,
                };
              },
              this.channelzEnabled,
            );
          }
          experimentalUnregisterListenerFromChannelz(K) {
            (0, _J.unregisterChannelzRef)(K);
          }
          createHttp2Server(K) {
            let O;
            if (K._isSecure()) {
              let T = K._getConstructorOptions(),
                z = K._getSecureContextOptions(),
                A = Object.assign(Object.assign(Object.assign(Object.assign({}, this.commonServerOptions), T), z), {
                  enableTrace: this.options["grpc-node.tls_enable_trace"] === 1,
                }),
                f = z !== null;
              this.trace("Initial credentials valid: " + f),
                (O = lv.createSecureServer(A)),
                O.prependListener("connection", (Y) => {
                  if (!f)
                    this.trace(
                      "Dropped connection from " + JSON.stringify(Y.address()) + " due to unloaded credentials",
                    ),
                      Y.destroy();
                }),
                O.on("secureConnection", (Y) => {
                  Y.on("error", (D) => {
                    this.trace("An incoming TLS connection closed with error: " + D.message);
                  });
                });
              let w = (Y) => {
                if (Y) {
                  let D = O;
                  try {
                    D.setSecureContext(Y);
                  } catch (j) {
                    pNH.log(C2.LogVerbosity.ERROR, "Failed to set secure context with error " + j.message), (Y = null);
                  }
                }
                (f = Y !== null), this.trace("Post-update credentials valid: " + f);
              };
              K._addWatcher(w),
                O.on("close", () => {
                  K._removeWatcher(w);
                });
            } else O = lv.createServer(this.commonServerOptions);
            return O.setTimeout(0, IS1), this._setupHandlers(O, K._getInterceptors()), O;
          }
          bindOneAddress(K, O) {
            this.trace("Attempting to bind " + (0, M7H.subchannelAddressToString)(K));
            let T = this.createHttp2Server(O.credentials);
            return new Promise((z, A) => {
              let f = (w) => {
                this.trace("Failed to bind " + (0, M7H.subchannelAddressToString)(K) + " with error " + w.message),
                  z({ port: "port" in K ? K.port : 1, error: w.message });
              };
              T.once("error", f),
                T.listen(K, () => {
                  let w = T.address(),
                    Y;
                  if (typeof w === "string") Y = { path: w };
                  else Y = { host: w.address, port: w.port };
                  let D = this.experimentalRegisterListenerToChannelz(Y);
                  this.listenerChildrenTracker.refChild(D),
                    this.http2Servers.set(T, { channelzRef: D, sessions: new Set(), ownsChannelzRef: !0 }),
                    O.listeningServers.add(T),
                    this.trace("Successfully bound " + (0, M7H.subchannelAddressToString)(Y)),
                    z({ port: "port" in Y ? Y.port : 1 }),
                    T.removeListener("error", f);
                });
            });
          }
          async bindManyPorts(K, O) {
            if (K.length === 0) return { count: 0, port: 0, errors: [] };
            if ((0, M7H.isTcpSubchannelAddress)(K[0]) && K[0].port === 0) {
              let T = await this.bindOneAddress(K[0], O);
              if (T.error) {
                let z = await this.bindManyPorts(K.slice(1), O);
                return Object.assign(Object.assign({}, z), { errors: [T.error, ...z.errors] });
              } else {
                let z = K.slice(1).map((w) =>
                    (0, M7H.isTcpSubchannelAddress)(w) ? { host: w.host, port: T.port } : w,
                  ),
                  A = await Promise.all(z.map((w) => this.bindOneAddress(w, O))),
                  f = [T, ...A];
                return {
                  count: f.filter((w) => w.error === void 0).length,
                  port: T.port,
                  errors: f.filter((w) => w.error).map((w) => w.error),
                };
              }
            } else {
              let T = await Promise.all(K.map((z) => this.bindOneAddress(z, O)));
              return {
                count: T.filter((z) => z.error === void 0).length,
                port: T[0].port,
                errors: T.filter((z) => z.error).map((z) => z.error),
              };
            }
          }
          async bindAddressList(K, O) {
            let T = await this.bindManyPorts(K, O);
            if (T.count > 0) {
              if (T.count < K.length)
                pNH.log(
                  C2.LogVerbosity.INFO,
                  `WARNING Only ${T.count} addresses added out of total ${K.length} resolved`,
                );
              return T.port;
            } else {
              let z = `No address added out of total ${K.length} resolved`;
              throw (pNH.log(C2.LogVerbosity.ERROR, z), Error(`${z} errors: [${T.errors.join(",")}]`));
            }
          }
          resolvePort(K) {
            return new Promise((O, T) => {
              let z = !1,
                A = (w, Y, D, j) => {
                  if (z) return !0;
                  if (((z = !0), !w.ok)) return T(Error(w.error.details)), !0;
                  let M = [].concat(...w.value.map((J) => J.addresses));
                  if (M.length === 0) return T(Error(`No addresses resolved for port ${K}`)), !0;
                  return O(M), !0;
                };
              (0, wU7.createResolver)(K, A, this.options).updateResolution();
            });
          }
          async bindPort(K, O) {
            let T = await this.resolvePort(K);
            if (O.cancelled) throw (this.completeUnbind(O), Error("bindAsync operation cancelled by unbind call"));
            let z = await this.bindAddressList(T, O);
            if (O.cancelled) throw (this.completeUnbind(O), Error("bindAsync operation cancelled by unbind call"));
            return z;
          }
          normalizePort(K) {
            let O = (0, Dm.parseUri)(K);
            if (O === null) throw Error(`Could not parse port "${K}"`);
            let T = (0, wU7.mapUriDefaultScheme)(O);
            if (T === null) throw Error(`Could not get a default scheme for port "${K}"`);
            return T;
          }
          bindAsync(K, O, T) {
            if (this.shutdown) throw Error("bindAsync called after shutdown");
            if (typeof K !== "string") throw TypeError("port must be a string");
            if (O === null || !(O instanceof Xi6.ServerCredentials))
              throw TypeError("creds must be a ServerCredentials object");
            if (typeof T !== "function") throw TypeError("callback must be a function");
            this.trace("bindAsync port=" + K);
            let z = this.normalizePort(K),
              A = (D, j) => {
                process.nextTick(() => T(D, j));
              },
              f = this.boundPorts.get((0, Dm.uriToString)(z));
            if (f) {
              if (!O._equals(f.credentials)) {
                A(Error(`${K} already bound with incompatible credentials`), 0);
                return;
              }
              if (((f.cancelled = !1), f.completionPromise))
                f.completionPromise.then(
                  (D) => T(null, D),
                  (D) => T(D, 0),
                );
              else A(null, f.portNumber);
              return;
            }
            f = {
              mapKey: (0, Dm.uriToString)(z),
              originalUri: z,
              completionPromise: null,
              cancelled: !1,
              portNumber: 0,
              credentials: O,
              listeningServers: new Set(),
            };
            let w = (0, Dm.splitHostPort)(z.path),
              Y = this.bindPort(z, f);
            if (((f.completionPromise = Y), (w === null || w === void 0 ? void 0 : w.port) === 0))
              Y.then(
                (D) => {
                  let j = {
                    scheme: z.scheme,
                    authority: z.authority,
                    path: (0, Dm.combineHostPort)({ host: w.host, port: D }),
                  };
                  (f.mapKey = (0, Dm.uriToString)(j)),
                    (f.completionPromise = null),
                    (f.portNumber = D),
                    this.boundPorts.set(f.mapKey, f),
                    T(null, D);
                },
                (D) => {
                  T(D, 0);
                },
              );
            else
              this.boundPorts.set(f.mapKey, f),
                Y.then(
                  (D) => {
                    (f.completionPromise = null), (f.portNumber = D), T(null, D);
                  },
                  (D) => {
                    T(D, 0);
                  },
                );
          }
          registerInjectorToChannelz() {
            return (0, _J.registerChannelzSocket)(
              "injector",
              () => {
                return {
                  localAddress: null,
                  remoteAddress: null,
                  security: null,
                  remoteName: null,
                  streamsStarted: 0,
                  streamsSucceeded: 0,
                  streamsFailed: 0,
                  messagesSent: 0,
                  messagesReceived: 0,
                  keepAlivesSent: 0,
                  lastLocalStreamCreatedTimestamp: null,
                  lastRemoteStreamCreatedTimestamp: null,
                  lastMessageSentTimestamp: null,
                  lastMessageReceivedTimestamp: null,
                  localFlowControlWindow: null,
                  remoteFlowControlWindow: null,
                };
              },
              this.channelzEnabled,
            );
          }
          experimentalCreateConnectionInjectorWithChannelzRef(K, O, T = !1) {
            if (K === null || !(K instanceof Xi6.ServerCredentials))
              throw TypeError("creds must be a ServerCredentials object");
            if (this.channelzEnabled) this.listenerChildrenTracker.refChild(O);
            let z = this.createHttp2Server(K),
              A = new Set();
            return (
              this.http2Servers.set(z, { channelzRef: O, sessions: A, ownsChannelzRef: T }),
              {
                injectConnection: (f) => {
                  z.emit("connection", f);
                },
                drain: (f) => {
                  var w, Y;
                  for (let D of A) this.closeSession(D);
                  (Y = (w = setTimeout(() => {
                    for (let D of A) D.destroy(lv.constants.NGHTTP2_CANCEL);
                  }, f)).unref) === null ||
                    Y === void 0 ||
                    Y.call(w);
                },
                destroy: () => {
                  this.closeServer(z);
                  for (let f of A) this.closeSession(f);
                },
              }
            );
          }
          createConnectionInjector(K) {
            if (K === null || !(K instanceof Xi6.ServerCredentials))
              throw TypeError("creds must be a ServerCredentials object");
            let O = this.registerInjectorToChannelz();
            return this.experimentalCreateConnectionInjectorWithChannelzRef(K, O, !0);
          }
          closeServer(K, O) {
            this.trace("Closing server with address " + JSON.stringify(K.address()));
            let T = this.http2Servers.get(K);
            K.close(() => {
              if (T && T.ownsChannelzRef)
                this.listenerChildrenTracker.unrefChild(T.channelzRef), (0, _J.unregisterChannelzRef)(T.channelzRef);
              this.http2Servers.delete(K), O === null || O === void 0 || O();
            });
          }
          closeSession(K, O) {
            var T;
            this.trace(
              "Closing session initiated by " + ((T = K.socket) === null || T === void 0 ? void 0 : T.remoteAddress),
            );
            let z = this.sessions.get(K),
              A = () => {
                if (z) this.sessionChildrenTracker.unrefChild(z.ref), (0, _J.unregisterChannelzRef)(z.ref);
                O === null || O === void 0 || O();
              };
            if (K.closed) queueMicrotask(A);
            else K.close(A);
          }
          completeUnbind(K) {
            for (let O of K.listeningServers) {
              let T = this.http2Servers.get(O);
              if (
                (this.closeServer(O, () => {
                  K.listeningServers.delete(O);
                }),
                T)
              )
                for (let z of T.sessions) this.closeSession(z);
            }
            this.boundPorts.delete(K.mapKey);
          }
          unbind(K) {
            this.trace("unbind port=" + K);
            let O = this.normalizePort(K),
              T = (0, Dm.splitHostPort)(O.path);
            if ((T === null || T === void 0 ? void 0 : T.port) === 0) throw Error("Cannot unbind port 0");
            let z = this.boundPorts.get((0, Dm.uriToString)(O));
            if (z)
              if (
                (this.trace("unbinding " + z.mapKey + " originally bound as " + (0, Dm.uriToString)(z.originalUri)),
                z.completionPromise)
              )
                z.cancelled = !0;
              else this.completeUnbind(z);
          }
          drain(K, O) {
            var T, z;
            this.trace("drain port=" + K + " graceTimeMs=" + O);
            let A = this.normalizePort(K),
              f = (0, Dm.splitHostPort)(A.path);
            if ((f === null || f === void 0 ? void 0 : f.port) === 0) throw Error("Cannot drain port 0");
            let w = this.boundPorts.get((0, Dm.uriToString)(A));
            if (!w) return;
            let Y = new Set();
            for (let D of w.listeningServers) {
              let j = this.http2Servers.get(D);
              if (j)
                for (let M of j.sessions)
                  Y.add(M),
                    this.closeSession(M, () => {
                      Y.delete(M);
                    });
            }
            (z = (T = setTimeout(() => {
              for (let D of Y) D.destroy(lv.constants.NGHTTP2_CANCEL);
            }, O)).unref) === null ||
              z === void 0 ||
              z.call(T);
          }
          forceShutdown() {
            for (let K of this.boundPorts.values()) K.cancelled = !0;
            this.boundPorts.clear();
            for (let K of this.http2Servers.keys()) this.closeServer(K);
            this.sessions.forEach((K, O) => {
              this.closeSession(O), O.destroy(lv.constants.NGHTTP2_CANCEL);
            }),
              this.sessions.clear(),
              (0, _J.unregisterChannelzRef)(this.channelzRef),
              (this.shutdown = !0);
          }
          register(K, O, T, z, A) {
            if (this.handlers.has(K)) return !1;
            return this.handlers.set(K, { func: O, serialize: T, deserialize: z, type: A, path: K }), !0;
          }
          unregister(K) {
            return this.handlers.delete(K);
          }
          start() {
            if (this.http2Servers.size === 0 || [...this.http2Servers.keys()].every((K) => !K.listening))
              throw Error("server must be bound in order to start");
            if (this.started === !0) throw Error("server is already started");
            this.started = !0;
          }
          tryShutdown(K) {
            var O;
            let T = (f) => {
                (0, _J.unregisterChannelzRef)(this.channelzRef), K(f);
              },
              z = 0;
            function A() {
              if ((z--, z === 0)) T();
            }
            this.shutdown = !0;
            for (let [f, w] of this.http2Servers.entries()) {
              z++;
              let Y = w.channelzRef.name;
              this.trace("Waiting for server " + Y + " to close"),
                this.closeServer(f, () => {
                  this.trace("Server " + Y + " finished closing"), A();
                });
              for (let D of w.sessions.keys()) {
                z++;
                let j = (O = D.socket) === null || O === void 0 ? void 0 : O.remoteAddress;
                this.trace("Waiting for session " + j + " to close"),
                  this.closeSession(D, () => {
                    this.trace("Session " + j + " finished closing"), A();
                  });
              }
            }
            if (z === 0) T();
          }
          addHttp2Port() {
            throw Error("Not yet implemented");
          }
          getChannelzRef() {
            return this.channelzRef;
          }
          _verifyContentType(K, O) {
            let T = O[lv.constants.HTTP2_HEADER_CONTENT_TYPE];
            if (typeof T !== "string" || !T.startsWith("application/grpc"))
              return (
                K.respond(
                  { [lv.constants.HTTP2_HEADER_STATUS]: lv.constants.HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE },
                  { endStream: !0 },
                ),
                !1
              );
            return !0;
          }
          _retrieveHandler(K) {
            JU7("Received call to method " + K + " at address " + this.serverAddressString);
            let O = this.handlers.get(K);
            if (O === void 0)
              return JU7("No handler registered for method " + K + ". Sending UNIMPLEMENTED status."), null;
            return O;
          }
          _respondWithError(K, O, T = null) {
            var z, A;
            let f = Object.assign(
              {
                "grpc-status": (z = K.code) !== null && z !== void 0 ? z : C2.Status.INTERNAL,
                "grpc-message": K.details,
                [lv.constants.HTTP2_HEADER_STATUS]: lv.constants.HTTP_STATUS_OK,
                [lv.constants.HTTP2_HEADER_CONTENT_TYPE]: "application/grpc+proto",
              },
              (A = K.metadata) === null || A === void 0 ? void 0 : A.toHttp2Headers(),
            );
            O.respond(f, { endStream: !0 }),
              this.callTracker.addCallFailed(),
              T === null || T === void 0 || T.streamTracker.addCallFailed();
          }
          _channelzHandler(K, O, T) {
            this.onStreamOpened(O);
            let z = this.sessions.get(O.session);
            if (
              (this.callTracker.addCallStarted(),
              z === null || z === void 0 || z.streamTracker.addCallStarted(),
              !this._verifyContentType(O, T))
            ) {
              this.callTracker.addCallFailed(), z === null || z === void 0 || z.streamTracker.addCallFailed();
              return;
            }
            let A = T[jU7],
              f = this._retrieveHandler(A);
            if (!f) {
              this._respondWithError(Gi6(A), O, z);
              return;
            }
            let w = {
                addMessageSent: () => {
                  if (z) (z.messagesSent += 1), (z.lastMessageSentTimestamp = new Date());
                },
                addMessageReceived: () => {
                  if (z) (z.messagesReceived += 1), (z.lastMessageReceivedTimestamp = new Date());
                },
                onCallEnd: (D) => {
                  if (D.code === C2.Status.OK) this.callTracker.addCallSucceeded();
                  else this.callTracker.addCallFailed();
                },
                onStreamEnd: (D) => {
                  if (z)
                    if (D) z.streamTracker.addCallSucceeded();
                    else z.streamTracker.addCallFailed();
                },
              },
              Y = (0, YU7.getServerInterceptingCall)([...K, ...this.interceptors], O, T, w, f, this.options);
            if (!this._runHandlerForCall(Y, f))
              this.callTracker.addCallFailed(),
                z === null || z === void 0 || z.streamTracker.addCallFailed(),
                Y.sendStatus({ code: C2.Status.INTERNAL, details: `Unknown handler type: ${f.type}` });
          }
          _streamHandler(K, O, T) {
            if ((this.onStreamOpened(O), this._verifyContentType(O, T) !== !0)) return;
            let z = T[jU7],
              A = this._retrieveHandler(z);
            if (!A) {
              this._respondWithError(Gi6(z), O, null);
              return;
            }
            let f = (0, YU7.getServerInterceptingCall)([...K, ...this.interceptors], O, T, null, A, this.options);
            if (!this._runHandlerForCall(f, A))
              f.sendStatus({ code: C2.Status.INTERNAL, details: `Unknown handler type: ${A.type}` });
          }
          _runHandlerForCall(K, O) {
            let { type: T } = O;
            if (T === "unary") pS1(K, O);
            else if (T === "clientStream") BS1(K, O);
            else if (T === "serverStream") gS1(K, O);
            else if (T === "bidi") dS1(K, O);
            else return !1;
            return !0;
          }
          _setupHandlers(K, O) {
            if (K === null) return;
            let T = K.address(),
              z = "null";
            if (T)
              if (typeof T === "string") z = T;
              else z = T.address + ":" + T.port;
            this.serverAddressString = z;
            let A = this.channelzEnabled ? this._channelzHandler : this._streamHandler,
              f = this.channelzEnabled ? this._channelzSessionHandler(K) : this._sessionHandler(K);
            K.on("stream", A.bind(this, O)), K.on("session", f);
          }
          _sessionHandler(K) {
            return (O) => {
              var T, z;
              (T = this.http2Servers.get(K)) === null || T === void 0 || T.sessions.add(O);
              let A = null,
                f = null,
                w = null,
                Y = !1,
                D = this.enableIdleTimeout(O);
              if (this.maxConnectionAgeMs !== mNH) {
                let X = this.maxConnectionAgeMs / 10,
                  R = Math.random() * X * 2 - X;
                (A = setTimeout(() => {
                  var W, Z;
                  (Y = !0),
                    this.trace(
                      "Connection dropped by max connection age: " +
                        ((W = O.socket) === null || W === void 0 ? void 0 : W.remoteAddress),
                    );
                  try {
                    O.goaway(lv.constants.NGHTTP2_NO_ERROR, 2147483647, MU7);
                  } catch (k) {
                    O.destroy();
                    return;
                  }
                  if ((O.close(), this.maxConnectionAgeGraceMs !== mNH))
                    (f = setTimeout(() => {
                      O.destroy();
                    }, this.maxConnectionAgeGraceMs)),
                      (Z = f.unref) === null || Z === void 0 || Z.call(f);
                }, this.maxConnectionAgeMs + R)),
                  (z = A.unref) === null || z === void 0 || z.call(A);
              }
              let j = () => {
                  if (w) clearTimeout(w), (w = null);
                },
                M = () => {
                  return !O.destroyed && this.keepaliveTimeMs < Wi6 && this.keepaliveTimeMs > 0;
                },
                J,
                P = () => {
                  var X;
                  if (!M()) return;
                  this.keepaliveTrace("Starting keepalive timer for " + this.keepaliveTimeMs + "ms"),
                    (w = setTimeout(() => {
                      j(), J();
                    }, this.keepaliveTimeMs)),
                    (X = w.unref) === null || X === void 0 || X.call(w);
                };
              (J = () => {
                var X;
                if (!M()) return;
                this.keepaliveTrace("Sending ping with timeout " + this.keepaliveTimeoutMs + "ms");
                let R = "";
                try {
                  if (
                    !O.ping((Z, k, v) => {
                      if ((j(), Z)) this.keepaliveTrace("Ping failed with error: " + Z.message), (Y = !0), O.close();
                      else this.keepaliveTrace("Received ping response"), P();
                    })
                  )
                    R = "Ping returned false";
                } catch (W) {
                  R = (W instanceof Error ? W.message : "") || "Unknown error";
                }
                if (R) {
                  this.keepaliveTrace("Ping send failed: " + R),
                    this.trace("Connection dropped due to ping send error: " + R),
                    (Y = !0),
                    O.close();
                  return;
                }
                (w = setTimeout(() => {
                  j(),
                    this.keepaliveTrace("Ping timeout passed without response"),
                    this.trace("Connection dropped by keepalive timeout"),
                    (Y = !0),
                    O.close();
                }, this.keepaliveTimeoutMs)),
                  (X = w.unref) === null || X === void 0 || X.call(w);
              }),
                P(),
                O.on("close", () => {
                  var X, R;
                  if (!Y)
                    this.trace(
                      `Connection dropped by client ${(X = O.socket) === null || X === void 0 ? void 0 : X.remoteAddress}`,
                    );
                  if (A) clearTimeout(A);
                  if (f) clearTimeout(f);
                  if ((j(), D !== null)) clearTimeout(D.timeout), this.sessionIdleTimeouts.delete(O);
                  (R = this.http2Servers.get(K)) === null || R === void 0 || R.sessions.delete(O);
                });
            };
          }
          _channelzSessionHandler(K) {
            return (O) => {
              var T, z, A, f;
              let w = (0, _J.registerChannelzSocket)(
                  (z = (T = O.socket) === null || T === void 0 ? void 0 : T.remoteAddress) !== null && z !== void 0
                    ? z
                    : "unknown",
                  this.getChannelzSessionInfo.bind(this, O),
                  this.channelzEnabled,
                ),
                Y = {
                  ref: w,
                  streamTracker: new _J.ChannelzCallTracker(),
                  messagesSent: 0,
                  messagesReceived: 0,
                  keepAlivesSent: 0,
                  lastMessageSentTimestamp: null,
                  lastMessageReceivedTimestamp: null,
                };
              (A = this.http2Servers.get(K)) === null || A === void 0 || A.sessions.add(O), this.sessions.set(O, Y);
              let D = `${O.socket.remoteAddress}:${O.socket.remotePort}`;
              this.channelzTrace.addTrace("CT_INFO", "Connection established by client " + D),
                this.trace("Connection established by client " + D),
                this.sessionChildrenTracker.refChild(w);
              let j = null,
                M = null,
                J = null,
                P = !1,
                X = this.enableIdleTimeout(O);
              if (this.maxConnectionAgeMs !== mNH) {
                let v = this.maxConnectionAgeMs / 10,
                  y = Math.random() * v * 2 - v;
                (j = setTimeout(() => {
                  var E;
                  (P = !0),
                    this.channelzTrace.addTrace("CT_INFO", "Connection dropped by max connection age from " + D);
                  try {
                    O.goaway(lv.constants.NGHTTP2_NO_ERROR, 2147483647, MU7);
                  } catch (S) {
                    O.destroy();
                    return;
                  }
                  if ((O.close(), this.maxConnectionAgeGraceMs !== mNH))
                    (M = setTimeout(() => {
                      O.destroy();
                    }, this.maxConnectionAgeGraceMs)),
                      (E = M.unref) === null || E === void 0 || E.call(M);
                }, this.maxConnectionAgeMs + y)),
                  (f = j.unref) === null || f === void 0 || f.call(j);
              }
              let R = () => {
                  if (J) clearTimeout(J), (J = null);
                },
                W = () => {
                  return !O.destroyed && this.keepaliveTimeMs < Wi6 && this.keepaliveTimeMs > 0;
                },
                Z,
                k = () => {
                  var v;
                  if (!W()) return;
                  this.keepaliveTrace("Starting keepalive timer for " + this.keepaliveTimeMs + "ms"),
                    (J = setTimeout(() => {
                      R(), Z();
                    }, this.keepaliveTimeMs)),
                    (v = J.unref) === null || v === void 0 || v.call(J);
                };
              (Z = () => {
                var v;
                if (!W()) return;
                this.keepaliveTrace("Sending ping with timeout " + this.keepaliveTimeoutMs + "ms");
                let y = "";
                try {
                  if (
                    !O.ping((S, x, I) => {
                      if ((R(), S))
                        this.keepaliveTrace("Ping failed with error: " + S.message),
                          this.channelzTrace.addTrace(
                            "CT_INFO",
                            "Connection dropped due to error of a ping frame " + S.message + " return in " + x,
                          ),
                          (P = !0),
                          O.close();
                      else this.keepaliveTrace("Received ping response"), k();
                    })
                  )
                    y = "Ping returned false";
                } catch (E) {
                  y = (E instanceof Error ? E.message : "") || "Unknown error";
                }
                if (y) {
                  this.keepaliveTrace("Ping send failed: " + y),
                    this.channelzTrace.addTrace("CT_INFO", "Connection dropped due to ping send error: " + y),
                    (P = !0),
                    O.close();
                  return;
                }
                (Y.keepAlivesSent += 1),
                  (J = setTimeout(() => {
                    R(),
                      this.keepaliveTrace("Ping timeout passed without response"),
                      this.channelzTrace.addTrace("CT_INFO", "Connection dropped by keepalive timeout from " + D),
                      (P = !0),
                      O.close();
                  }, this.keepaliveTimeoutMs)),
                  (v = J.unref) === null || v === void 0 || v.call(J);
              }),
                k(),
                O.on("close", () => {
                  var v;
                  if (!P) this.channelzTrace.addTrace("CT_INFO", "Connection dropped by client " + D);
                  if ((this.sessionChildrenTracker.unrefChild(w), (0, _J.unregisterChannelzRef)(w), j)) clearTimeout(j);
                  if (M) clearTimeout(M);
                  if ((R(), X !== null)) clearTimeout(X.timeout), this.sessionIdleTimeouts.delete(O);
                  (v = this.http2Servers.get(K)) === null || v === void 0 || v.sessions.delete(O),
                    this.sessions.delete(O);
                });
            };
          }
          enableIdleTimeout(K) {
            var O, T;
            if (this.sessionIdleTimeout >= DU7) return null;
            let z = {
              activeStreams: 0,
              lastIdle: Date.now(),
              onClose: this.onStreamClose.bind(this, K),
              timeout: setTimeout(this.onIdleTimeout, this.sessionIdleTimeout, this, K),
            };
            (T = (O = z.timeout).unref) === null || T === void 0 || T.call(O), this.sessionIdleTimeouts.set(K, z);
            let { socket: A } = K;
            return this.trace("Enable idle timeout for " + A.remoteAddress + ":" + A.remotePort), z;
          }
          onIdleTimeout(K, O) {
            let { socket: T } = O,
              z = K.sessionIdleTimeouts.get(O);
            if (z !== void 0 && z.activeStreams === 0)
              if (Date.now() - z.lastIdle >= K.sessionIdleTimeout)
                K.trace(
                  "Session idle timeout triggered for " +
                    (T === null || T === void 0 ? void 0 : T.remoteAddress) +
                    ":" +
                    (T === null || T === void 0 ? void 0 : T.remotePort) +
                    " last idle at " +
                    z.lastIdle,
                ),
                  K.closeSession(O);
              else z.timeout.refresh();
          }
          onStreamOpened(K) {
            let O = K.session,
              T = this.sessionIdleTimeouts.get(O);
            if (T) (T.activeStreams += 1), K.once("close", T.onClose);
          }
          onStreamClose(K) {
            var O, T;
            let z = this.sessionIdleTimeouts.get(K);
            if (z) {
              if (((z.activeStreams -= 1), z.activeStreams === 0))
                (z.lastIdle = Date.now()),
                  z.timeout.refresh(),
                  this.trace(
                    "Session onStreamClose" +
                      ((O = K.socket) === null || O === void 0 ? void 0 : O.remoteAddress) +
                      ":" +
                      ((T = K.socket) === null || T === void 0 ? void 0 : T.remotePort) +
                      " at " +
                      z.lastIdle,
                  );
            }
          }
        }),
        (() => {
          let $ = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
          if (
            ((q = [uS1("Calling start() is no longer necessary. It can be safely omitted.")]),
            SS1(
              H,
              null,
              q,
              {
                kind: "method",
                name: "start",
                static: !1,
                private: !1,
                access: { has: (K) => "start" in K, get: (K) => K.start },
                metadata: $,
              },
              null,
              _,
            ),
            $)
          )
            Object.defineProperty(H, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: $ });
        })(),
        H
      );
    })();
    J7H.Server = mS1;
    async function pS1(H, _) {
      let q;
      function $(T, z, A, f) {
        if (T) {
          H.sendStatus((0, BNH.serverErrorToStatus)(T, A));
          return;
        }
        H.sendMessage(z, () => {
          H.sendStatus({ code: C2.Status.OK, details: "OK", metadata: A !== null && A !== void 0 ? A : null });
        });
      }
      let K,
        O = null;
      H.start({
        onReceiveMetadata(T) {
          (K = T), H.startRead();
        },
        onReceiveMessage(T) {
          if (O) {
            H.sendStatus({
              code: C2.Status.UNIMPLEMENTED,
              details: `Received a second request message for server streaming method ${_.path}`,
              metadata: null,
            });
            return;
          }
          (O = T), H.startRead();
        },
        onReceiveHalfClose() {
          if (!O) {
            H.sendStatus({
              code: C2.Status.UNIMPLEMENTED,
              details: `Received no request message for server streaming method ${_.path}`,
              metadata: null,
            });
            return;
          }
          q = new BNH.ServerWritableStreamImpl(_.path, H, K, O);
          try {
            _.func(q, $);
          } catch (T) {
            H.sendStatus({
              code: C2.Status.UNKNOWN,
              details: `Server method handler threw error ${T.message}`,
              metadata: null,
            });
          }
        },
        onCancel() {
          if (q) (q.cancelled = !0), q.emit("cancelled", "cancelled");
        },
      });
    }
    function BS1(H, _) {
      let q;
      function $(K, O, T, z) {
        if (K) {
          H.sendStatus((0, BNH.serverErrorToStatus)(K, T));
          return;
        }
        H.sendMessage(O, () => {
          H.sendStatus({ code: C2.Status.OK, details: "OK", metadata: T !== null && T !== void 0 ? T : null });
        });
      }
      H.start({
        onReceiveMetadata(K) {
          q = new BNH.ServerDuplexStreamImpl(_.path, H, K);
          try {
            _.func(q, $);
          } catch (O) {
            H.sendStatus({
              code: C2.Status.UNKNOWN,
              details: `Server method handler threw error ${O.message}`,
              metadata: null,
            });
          }
        },
        onReceiveMessage(K) {
          q.push(K);
        },
        onReceiveHalfClose() {
          q.push(null);
        },
        onCancel() {
          if (q) (q.cancelled = !0), q.emit("cancelled", "cancelled"), q.destroy();
        },
      });
    }
    function gS1(H, _) {
      let q,
        $,
        K = null;
      H.start({
        onReceiveMetadata(O) {
          ($ = O), H.startRead();
        },
        onReceiveMessage(O) {
          if (K) {
            H.sendStatus({
              code: C2.Status.UNIMPLEMENTED,
              details: `Received a second request message for server streaming method ${_.path}`,
              metadata: null,
            });
            return;
          }
          (K = O), H.startRead();
        },
        onReceiveHalfClose() {
          if (!K) {
            H.sendStatus({
              code: C2.Status.UNIMPLEMENTED,
              details: `Received no request message for server streaming method ${_.path}`,
              metadata: null,
            });
            return;
          }
          q = new BNH.ServerWritableStreamImpl(_.path, H, $, K);
          try {
            _.func(q);
          } catch (O) {
            H.sendStatus({
              code: C2.Status.UNKNOWN,
              details: `Server method handler threw error ${O.message}`,
              metadata: null,
            });
          }
        },
        onCancel() {
          if (q) (q.cancelled = !0), q.emit("cancelled", "cancelled"), q.destroy();
        },
      });
    }
    function dS1(H, _) {
      let q;
      H.start({
        onReceiveMetadata($) {
          q = new BNH.ServerDuplexStreamImpl(_.path, H, $);
          try {
            _.func(q);
          } catch (K) {
            H.sendStatus({
              code: C2.Status.UNKNOWN,
              details: `Server method handler threw error ${K.message}`,
              metadata: null,
            });
          }
        },
        onReceiveMessage($) {
          q.push($);
        },
        onReceiveHalfClose() {
          q.push(null);
        },
        onCancel() {
          if (q) (q.cancelled = !0), q.emit("cancelled", "cancelled"), q.destroy();
        },
      });
    }
  });

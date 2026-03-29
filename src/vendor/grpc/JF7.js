  var JF7 = d((Ix_) => {
    Object.defineProperty(Ix_, "__esModule", { value: !0 });
    Ix_.Http2SubchannelConnector = void 0;
    var UAH = require("http2"),
      ey1 = require("tls"),
      Cx_ = w7H(),
      CsH = mK(),
      HV1 = nl6(),
      bNH = DA(),
      _V1 = qm(),
      bx_ = Uv(),
      al6 = OL(),
      qV1 = require("net"),
      $V1 = DF7(),
      KV1 = Gx_(),
      sl6 = "transport",
      OV1 = "transport_flowctrl",
      TV1 = fQ6().version,
      {
        HTTP2_HEADER_AUTHORITY: zV1,
        HTTP2_HEADER_CONTENT_TYPE: AV1,
        HTTP2_HEADER_METHOD: fV1,
        HTTP2_HEADER_PATH: wV1,
        HTTP2_HEADER_TE: YV1,
        HTTP2_HEADER_USER_AGENT: DV1,
      } = UAH.constants,
      jV1 = 20000,
      MV1 = Buffer.from("too_many_pings", "ascii");
    class jF7 {
      constructor(H, _, q, $) {
        if (
          ((this.session = H),
          (this.options = q),
          (this.remoteName = $),
          (this.keepaliveTimer = null),
          (this.pendingSendKeepalivePing = !1),
          (this.activeCalls = new Set()),
          (this.disconnectListeners = []),
          (this.disconnectHandled = !1),
          (this.channelzEnabled = !0),
          (this.keepalivesSent = 0),
          (this.messagesSent = 0),
          (this.messagesReceived = 0),
          (this.lastMessageSentTimestamp = null),
          (this.lastMessageReceivedTimestamp = null),
          (this.subchannelAddressString = (0, bx_.subchannelAddressToString)(_)),
          q["grpc.enable_channelz"] === 0)
        )
          (this.channelzEnabled = !1), (this.streamTracker = new Cx_.ChannelzCallTrackerStub());
        else this.streamTracker = new Cx_.ChannelzCallTracker();
        if (
          ((this.channelzRef = (0, Cx_.registerChannelzSocket)(
            this.subchannelAddressString,
            () => this.getChannelzInfo(),
            this.channelzEnabled,
          )),
          (this.userAgent = [q["grpc.primary_user_agent"], `grpc-node-js/${TV1}`, q["grpc.secondary_user_agent"]]
            .filter((K) => K)
            .join(" ")),
          "grpc.keepalive_time_ms" in q)
        )
          this.keepaliveTimeMs = q["grpc.keepalive_time_ms"];
        else this.keepaliveTimeMs = -1;
        if ("grpc.keepalive_timeout_ms" in q) this.keepaliveTimeoutMs = q["grpc.keepalive_timeout_ms"];
        else this.keepaliveTimeoutMs = jV1;
        if ("grpc.keepalive_permit_without_calls" in q)
          this.keepaliveWithoutCalls = q["grpc.keepalive_permit_without_calls"] === 1;
        else this.keepaliveWithoutCalls = !1;
        if (
          (H.once("close", () => {
            this.trace("session closed"), this.handleDisconnect();
          }),
          H.once("goaway", (K, O, T) => {
            let z = !1;
            if (K === UAH.constants.NGHTTP2_ENHANCE_YOUR_CALM && T && T.equals(MV1)) z = !0;
            this.trace(
              "connection closed by GOAWAY with code " +
                K +
                " and data " +
                (T === null || T === void 0 ? void 0 : T.toString()),
            ),
              this.reportDisconnectToOwner(z);
          }),
          H.once("error", (K) => {
            this.trace("connection closed with error " + K.message), this.handleDisconnect();
          }),
          H.socket.once("close", (K) => {
            this.trace("connection closed. hadError=" + K), this.handleDisconnect();
          }),
          bNH.isTracerEnabled(sl6))
        )
          H.on("remoteSettings", (K) => {
            this.trace(
              "new settings received" + (this.session !== H ? " on the old connection" : "") + ": " + JSON.stringify(K),
            );
          }),
            H.on("localSettings", (K) => {
              this.trace(
                "local settings acknowledged by remote" +
                  (this.session !== H ? " on the old connection" : "") +
                  ": " +
                  JSON.stringify(K),
              );
            });
        if (this.keepaliveWithoutCalls) this.maybeStartKeepalivePingTimer();
        if (H.socket instanceof ey1.TLSSocket)
          this.authContext = { transportSecurityType: "ssl", sslPeerCertificate: H.socket.getPeerCertificate() };
        else this.authContext = {};
      }
      getChannelzInfo() {
        var H, _, q;
        let $ = this.session.socket,
          K = $.remoteAddress ? (0, bx_.stringToSubchannelAddress)($.remoteAddress, $.remotePort) : null,
          O = $.localAddress ? (0, bx_.stringToSubchannelAddress)($.localAddress, $.localPort) : null,
          T;
        if (this.session.encrypted) {
          let A = $,
            f = A.getCipher(),
            w = A.getCertificate(),
            Y = A.getPeerCertificate();
          T = {
            cipherSuiteStandardName: (H = f.standardName) !== null && H !== void 0 ? H : null,
            cipherSuiteOtherName: f.standardName ? null : f.name,
            localCertificate: w && "raw" in w ? w.raw : null,
            remoteCertificate: Y && "raw" in Y ? Y.raw : null,
          };
        } else T = null;
        return {
          remoteAddress: K,
          localAddress: O,
          security: T,
          remoteName: this.remoteName,
          streamsStarted: this.streamTracker.callsStarted,
          streamsSucceeded: this.streamTracker.callsSucceeded,
          streamsFailed: this.streamTracker.callsFailed,
          messagesSent: this.messagesSent,
          messagesReceived: this.messagesReceived,
          keepAlivesSent: this.keepalivesSent,
          lastLocalStreamCreatedTimestamp: this.streamTracker.lastCallStartedTimestamp,
          lastRemoteStreamCreatedTimestamp: null,
          lastMessageSentTimestamp: this.lastMessageSentTimestamp,
          lastMessageReceivedTimestamp: this.lastMessageReceivedTimestamp,
          localFlowControlWindow: (_ = this.session.state.localWindowSize) !== null && _ !== void 0 ? _ : null,
          remoteFlowControlWindow: (q = this.session.state.remoteWindowSize) !== null && q !== void 0 ? q : null,
        };
      }
      trace(H) {
        bNH.trace(
          CsH.LogVerbosity.DEBUG,
          sl6,
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      keepaliveTrace(H) {
        bNH.trace(
          CsH.LogVerbosity.DEBUG,
          "keepalive",
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      flowControlTrace(H) {
        bNH.trace(
          CsH.LogVerbosity.DEBUG,
          OV1,
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      internalsTrace(H) {
        bNH.trace(
          CsH.LogVerbosity.DEBUG,
          "transport_internals",
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      reportDisconnectToOwner(H) {
        if (this.disconnectHandled) return;
        (this.disconnectHandled = !0), this.disconnectListeners.forEach((_) => _(H));
      }
      handleDisconnect() {
        this.clearKeepaliveTimeout(), this.reportDisconnectToOwner(!1);
        for (let H of this.activeCalls) H.onDisconnect();
        setImmediate(() => {
          this.session.destroy();
        });
      }
      addDisconnectListener(H) {
        this.disconnectListeners.push(H);
      }
      canSendPing() {
        return (
          !this.session.destroyed &&
          this.keepaliveTimeMs > 0 &&
          (this.keepaliveWithoutCalls || this.activeCalls.size > 0)
        );
      }
      maybeSendPing() {
        var H, _;
        if (!this.canSendPing()) {
          this.pendingSendKeepalivePing = !0;
          return;
        }
        if (this.keepaliveTimer) {
          console.error("keepaliveTimeout is not null");
          return;
        }
        if (this.channelzEnabled) this.keepalivesSent += 1;
        this.keepaliveTrace("Sending ping with timeout " + this.keepaliveTimeoutMs + "ms"),
          (this.keepaliveTimer = setTimeout(() => {
            (this.keepaliveTimer = null),
              this.keepaliveTrace("Ping timeout passed without response"),
              this.handleDisconnect();
          }, this.keepaliveTimeoutMs)),
          (_ = (H = this.keepaliveTimer).unref) === null || _ === void 0 || _.call(H);
        let q = "";
        try {
          if (
            !this.session.ping((K, O, T) => {
              if ((this.clearKeepaliveTimeout(), K))
                this.keepaliveTrace("Ping failed with error " + K.message), this.handleDisconnect();
              else this.keepaliveTrace("Received ping response"), this.maybeStartKeepalivePingTimer();
            })
          )
            q = "Ping returned false";
        } catch ($) {
          q = ($ instanceof Error ? $.message : "") || "Unknown error";
        }
        if (q) this.keepaliveTrace("Ping send failed: " + q), this.handleDisconnect();
      }
      maybeStartKeepalivePingTimer() {
        var H, _;
        if (!this.canSendPing()) return;
        if (this.pendingSendKeepalivePing) (this.pendingSendKeepalivePing = !1), this.maybeSendPing();
        else if (!this.keepaliveTimer)
          this.keepaliveTrace("Starting keepalive timer for " + this.keepaliveTimeMs + "ms"),
            (this.keepaliveTimer = setTimeout(() => {
              (this.keepaliveTimer = null), this.maybeSendPing();
            }, this.keepaliveTimeMs)),
            (_ = (H = this.keepaliveTimer).unref) === null || _ === void 0 || _.call(H);
      }
      clearKeepaliveTimeout() {
        if (this.keepaliveTimer) clearTimeout(this.keepaliveTimer), (this.keepaliveTimer = null);
      }
      removeActiveCall(H) {
        if ((this.activeCalls.delete(H), this.activeCalls.size === 0)) this.session.unref();
      }
      addActiveCall(H) {
        if ((this.activeCalls.add(H), this.activeCalls.size === 1)) {
          if ((this.session.ref(), !this.keepaliveWithoutCalls)) this.maybeStartKeepalivePingTimer();
        }
      }
      createCall(H, _, q, $, K) {
        let O = H.toHttp2Headers();
        (O[zV1] = _),
          (O[DV1] = this.userAgent),
          (O[AV1] = "application/grpc"),
          (O[fV1] = "POST"),
          (O[wV1] = q),
          (O[YV1] = "trailers");
        let T;
        try {
          T = this.session.request(O);
        } catch (f) {
          throw (this.handleDisconnect(), f);
        }
        this.flowControlTrace(
          "local window size: " +
            this.session.state.localWindowSize +
            " remote window size: " +
            this.session.state.remoteWindowSize,
        ),
          this.internalsTrace(
            "session.closed=" +
              this.session.closed +
              " session.destroyed=" +
              this.session.destroyed +
              " session.socket.destroyed=" +
              this.session.socket.destroyed,
          );
        let z, A;
        if (this.channelzEnabled)
          this.streamTracker.addCallStarted(),
            (z = {
              addMessageSent: () => {
                var f;
                (this.messagesSent += 1),
                  (this.lastMessageSentTimestamp = new Date()),
                  (f = K.addMessageSent) === null || f === void 0 || f.call(K);
              },
              addMessageReceived: () => {
                var f;
                (this.messagesReceived += 1),
                  (this.lastMessageReceivedTimestamp = new Date()),
                  (f = K.addMessageReceived) === null || f === void 0 || f.call(K);
              },
              onCallEnd: (f) => {
                var w;
                (w = K.onCallEnd) === null || w === void 0 || w.call(K, f), this.removeActiveCall(A);
              },
              onStreamEnd: (f) => {
                var w;
                if (f) this.streamTracker.addCallSucceeded();
                else this.streamTracker.addCallFailed();
                (w = K.onStreamEnd) === null || w === void 0 || w.call(K, f);
              },
            });
        else
          z = {
            addMessageSent: () => {
              var f;
              (f = K.addMessageSent) === null || f === void 0 || f.call(K);
            },
            addMessageReceived: () => {
              var f;
              (f = K.addMessageReceived) === null || f === void 0 || f.call(K);
            },
            onCallEnd: (f) => {
              var w;
              (w = K.onCallEnd) === null || w === void 0 || w.call(K, f), this.removeActiveCall(A);
            },
            onStreamEnd: (f) => {
              var w;
              (w = K.onStreamEnd) === null || w === void 0 || w.call(K, f);
            },
          };
        return (A = new $V1.Http2SubchannelCall(T, z, $, this, (0, KV1.getNextCallNumber)())), this.addActiveCall(A), A;
      }
      getChannelzRef() {
        return this.channelzRef;
      }
      getPeerName() {
        return this.subchannelAddressString;
      }
      getOptions() {
        return this.options;
      }
      getAuthContext() {
        return this.authContext;
      }
      shutdown() {
        this.session.close(), (0, Cx_.unregisterChannelzRef)(this.channelzRef);
      }
    }
    class MF7 {
      constructor(H) {
        (this.channelTarget = H), (this.session = null), (this.isShutdown = !1);
      }
      trace(H) {
        bNH.trace(CsH.LogVerbosity.DEBUG, sl6, (0, al6.uriToString)(this.channelTarget) + " " + H);
      }
      createSession(H, _, q) {
        if (this.isShutdown) return Promise.reject();
        if (H.socket.closed) return Promise.reject("Connection closed before starting HTTP/2 handshake");
        return new Promise(($, K) => {
          var O, T, z, A, f, w, Y;
          let D = null,
            j = this.channelTarget;
          if ("grpc.http_connect_target" in q) {
            let E = (0, al6.parseUri)(q["grpc.http_connect_target"]);
            if (E) (j = E), (D = (0, al6.uriToString)(E));
          }
          let M = H.secure ? "https" : "http",
            J = (0, _V1.getDefaultAuthority)(j),
            P = () => {
              var E;
              (E = this.session) === null || E === void 0 || E.destroy(),
                (this.session = null),
                setImmediate(() => {
                  if (!y) (y = !0), K(`${v.trim()} (${new Date().toISOString()})`);
                });
            },
            X = (E) => {
              var S;
              if (
                ((S = this.session) === null || S === void 0 || S.destroy(),
                (v = E.message),
                this.trace("connection failed with error " + v),
                !y)
              )
                (y = !0), K(`${v} (${new Date().toISOString()})`);
            },
            R = {
              createConnection: (E, S) => {
                return H.socket;
              },
              settings: {
                initialWindowSize:
                  (A =
                    (O = q["grpc-node.flow_control_window"]) !== null && O !== void 0
                      ? O
                      : (z = (T = UAH.getDefaultSettings) === null || T === void 0 ? void 0 : T.call(UAH)) === null ||
                          z === void 0
                        ? void 0
                        : z.initialWindowSize) !== null && A !== void 0
                    ? A
                    : 65535,
              },
            },
            W = UAH.connect(`${M}://${J}`, R),
            Z =
              (Y =
                (w = (f = UAH.getDefaultSettings) === null || f === void 0 ? void 0 : f.call(UAH)) === null ||
                w === void 0
                  ? void 0
                  : w.initialWindowSize) !== null && Y !== void 0
                ? Y
                : 65535,
            k = q["grpc-node.flow_control_window"];
          this.session = W;
          let v = "Failed to connect",
            y = !1;
          W.unref(),
            W.once("remoteSettings", () => {
              var E;
              if (k && k > Z)
                try {
                  W.setLocalWindowSize(k);
                } catch (S) {
                  let x = k - ((E = W.state.localWindowSize) !== null && E !== void 0 ? E : Z);
                  if (x > 0) W.incrementWindowSize(x);
                }
              W.removeAllListeners(),
                H.socket.removeListener("close", P),
                H.socket.removeListener("error", X),
                $(new jF7(W, _, q, D)),
                (this.session = null);
            }),
            W.once("close", P),
            W.once("error", X),
            H.socket.once("close", P),
            H.socket.once("error", X);
        });
      }
      tcpConnect(H, _) {
        return (0, HV1.getProxiedConnection)(H, _).then((q) => {
          if (q) return q;
          else
            return new Promise(($, K) => {
              let O = () => {
                  K(Error("Socket closed"));
                },
                T = (A) => {
                  K(A);
                },
                z = qV1.connect(H, () => {
                  z.removeListener("close", O), z.removeListener("error", T), $(z);
                });
              z.once("close", O), z.once("error", T);
            });
        });
      }
      async connect(H, _, q) {
        if (this.isShutdown) return Promise.reject();
        let $ = null,
          K = null,
          O = (0, bx_.subchannelAddressToString)(H);
        try {
          return (
            this.trace(O + " Waiting for secureConnector to be ready"),
            await _.waitForReady(),
            this.trace(O + " secureConnector is ready"),
            ($ = await this.tcpConnect(H, q)),
            $.setNoDelay(),
            this.trace(O + " Established TCP connection"),
            (K = await _.connect($)),
            this.trace(O + " Established secure connection"),
            this.createSession(K, H, q)
          );
        } catch (T) {
          throw ($ === null || $ === void 0 || $.destroy(), K === null || K === void 0 || K.socket.destroy(), T);
        }
      }
      shutdown() {
        var H;
        (this.isShutdown = !0), (H = this.session) === null || H === void 0 || H.close(), (this.session = null);
      }
    }
    Ix_.Http2SubchannelConnector = MF7;
  });

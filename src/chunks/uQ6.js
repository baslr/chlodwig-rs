  var uQ6 = d((Fu_) => {
    Object.defineProperty(Fu_, "__esModule", { value: !0 });
    Fu_.Client = void 0;
    var mc = Ng7(),
      sk1 = xQ6(),
      tk1 = TL(),
      $7H = mK(),
      jNH = GP(),
      cu_ = bQ6(),
      zm = Symbol(),
      MNH = Symbol(),
      JNH = Symbol(),
      Fr = Symbol();
    function IQ6(H) {
      return typeof H === "function";
    }
    function PNH(H) {
      var _;
      return (
        ((_ = H.stack) === null || _ === void 0
          ? void 0
          : _.split(`
`)
              .slice(1)
              .join(`
`)) || "no stack trace available"
      );
    }
    class xg7 {
      constructor(H, _, q = {}) {
        var $, K;
        if (
          ((q = Object.assign({}, q)),
          (this[MNH] = ($ = q.interceptors) !== null && $ !== void 0 ? $ : []),
          delete q.interceptors,
          (this[JNH] = (K = q.interceptor_providers) !== null && K !== void 0 ? K : []),
          delete q.interceptor_providers,
          this[MNH].length > 0 && this[JNH].length > 0)
        )
          throw Error(
            "Both interceptors and interceptor_providers were passed as options to the client constructor. Only one of these is allowed.",
          );
        if (((this[Fr] = q.callInvocationTransformer), delete q.callInvocationTransformer, q.channelOverride))
          this[zm] = q.channelOverride;
        else if (q.channelFactoryOverride) {
          let O = q.channelFactoryOverride;
          delete q.channelFactoryOverride, (this[zm] = O(H, _, q));
        } else this[zm] = new sk1.ChannelImplementation(H, _, q);
      }
      close() {
        this[zm].close();
      }
      getChannel() {
        return this[zm];
      }
      waitForReady(H, _) {
        let q = ($) => {
          if ($) {
            _(Error("Failed to connect before the deadline"));
            return;
          }
          let K;
          try {
            K = this[zm].getConnectivityState(!0);
          } catch (O) {
            _(Error("The channel has been closed"));
            return;
          }
          if (K === tk1.ConnectivityState.READY) _();
          else
            try {
              this[zm].watchConnectivityState(K, H, q);
            } catch (O) {
              _(Error("The channel has been closed"));
            }
        };
        setImmediate(q);
      }
      checkOptionalUnaryResponseArguments(H, _, q) {
        if (IQ6(H)) return { metadata: new jNH.Metadata(), options: {}, callback: H };
        else if (IQ6(_))
          if (H instanceof jNH.Metadata) return { metadata: H, options: {}, callback: _ };
          else return { metadata: new jNH.Metadata(), options: H, callback: _ };
        else {
          if (!(H instanceof jNH.Metadata && _ instanceof Object && IQ6(q))) throw Error("Incorrect arguments passed");
          return { metadata: H, options: _, callback: q };
        }
      }
      makeUnaryRequest(H, _, q, $, K, O, T) {
        var z, A;
        let f = this.checkOptionalUnaryResponseArguments(K, O, T),
          w = { path: H, requestStream: !1, responseStream: !1, requestSerialize: _, responseDeserialize: q },
          Y = {
            argument: $,
            metadata: f.metadata,
            call: new mc.ClientUnaryCallImpl(),
            channel: this[zm],
            methodDefinition: w,
            callOptions: f.options,
            callback: f.callback,
          };
        if (this[Fr]) Y = this[Fr](Y);
        let D = Y.call,
          j = {
            clientInterceptors: this[MNH],
            clientInterceptorProviders: this[JNH],
            callInterceptors: (z = Y.callOptions.interceptors) !== null && z !== void 0 ? z : [],
            callInterceptorProviders: (A = Y.callOptions.interceptor_providers) !== null && A !== void 0 ? A : [],
          },
          M = (0, cu_.getInterceptingCall)(j, Y.methodDefinition, Y.callOptions, Y.channel);
        D.call = M;
        let J = null,
          P = !1,
          X = Error();
        return (
          M.start(Y.metadata, {
            onReceiveMetadata: (R) => {
              D.emit("metadata", R);
            },
            onReceiveMessage(R) {
              if (J !== null) M.cancelWithStatus($7H.Status.UNIMPLEMENTED, "Too many responses received");
              J = R;
            },
            onReceiveStatus(R) {
              if (P) return;
              if (((P = !0), R.code === $7H.Status.OK))
                if (J === null) {
                  let W = PNH(X);
                  Y.callback(
                    (0, mc.callErrorFromStatus)(
                      { code: $7H.Status.UNIMPLEMENTED, details: "No message received", metadata: R.metadata },
                      W,
                    ),
                  );
                } else Y.callback(null, J);
              else {
                let W = PNH(X);
                Y.callback((0, mc.callErrorFromStatus)(R, W));
              }
              (X = null), D.emit("status", R);
            },
          }),
          M.sendMessage($),
          M.halfClose(),
          D
        );
      }
      makeClientStreamRequest(H, _, q, $, K, O) {
        var T, z;
        let A = this.checkOptionalUnaryResponseArguments($, K, O),
          f = { path: H, requestStream: !0, responseStream: !1, requestSerialize: _, responseDeserialize: q },
          w = {
            metadata: A.metadata,
            call: new mc.ClientWritableStreamImpl(_),
            channel: this[zm],
            methodDefinition: f,
            callOptions: A.options,
            callback: A.callback,
          };
        if (this[Fr]) w = this[Fr](w);
        let Y = w.call,
          D = {
            clientInterceptors: this[MNH],
            clientInterceptorProviders: this[JNH],
            callInterceptors: (T = w.callOptions.interceptors) !== null && T !== void 0 ? T : [],
            callInterceptorProviders: (z = w.callOptions.interceptor_providers) !== null && z !== void 0 ? z : [],
          },
          j = (0, cu_.getInterceptingCall)(D, w.methodDefinition, w.callOptions, w.channel);
        Y.call = j;
        let M = null,
          J = !1,
          P = Error();
        return (
          j.start(w.metadata, {
            onReceiveMetadata: (X) => {
              Y.emit("metadata", X);
            },
            onReceiveMessage(X) {
              if (M !== null) j.cancelWithStatus($7H.Status.UNIMPLEMENTED, "Too many responses received");
              (M = X), j.startRead();
            },
            onReceiveStatus(X) {
              if (J) return;
              if (((J = !0), X.code === $7H.Status.OK))
                if (M === null) {
                  let R = PNH(P);
                  w.callback(
                    (0, mc.callErrorFromStatus)(
                      { code: $7H.Status.UNIMPLEMENTED, details: "No message received", metadata: X.metadata },
                      R,
                    ),
                  );
                } else w.callback(null, M);
              else {
                let R = PNH(P);
                w.callback((0, mc.callErrorFromStatus)(X, R));
              }
              (P = null), Y.emit("status", X);
            },
          }),
          Y
        );
      }
      checkMetadataAndOptions(H, _) {
        let q, $;
        if (H instanceof jNH.Metadata)
          if (((q = H), _)) $ = _;
          else $ = {};
        else {
          if (H) $ = H;
          else $ = {};
          q = new jNH.Metadata();
        }
        return { metadata: q, options: $ };
      }
      makeServerStreamRequest(H, _, q, $, K, O) {
        var T, z;
        let A = this.checkMetadataAndOptions(K, O),
          f = { path: H, requestStream: !1, responseStream: !0, requestSerialize: _, responseDeserialize: q },
          w = {
            argument: $,
            metadata: A.metadata,
            call: new mc.ClientReadableStreamImpl(q),
            channel: this[zm],
            methodDefinition: f,
            callOptions: A.options,
          };
        if (this[Fr]) w = this[Fr](w);
        let Y = w.call,
          D = {
            clientInterceptors: this[MNH],
            clientInterceptorProviders: this[JNH],
            callInterceptors: (T = w.callOptions.interceptors) !== null && T !== void 0 ? T : [],
            callInterceptorProviders: (z = w.callOptions.interceptor_providers) !== null && z !== void 0 ? z : [],
          },
          j = (0, cu_.getInterceptingCall)(D, w.methodDefinition, w.callOptions, w.channel);
        Y.call = j;
        let M = !1,
          J = Error();
        return (
          j.start(w.metadata, {
            onReceiveMetadata(P) {
              Y.emit("metadata", P);
            },
            onReceiveMessage(P) {
              Y.push(P);
            },
            onReceiveStatus(P) {
              if (M) return;
              if (((M = !0), Y.push(null), P.code !== $7H.Status.OK)) {
                let X = PNH(J);
                Y.emit("error", (0, mc.callErrorFromStatus)(P, X));
              }
              (J = null), Y.emit("status", P);
            },
          }),
          j.sendMessage($),
          j.halfClose(),
          Y
        );
      }
      makeBidiStreamRequest(H, _, q, $, K) {
        var O, T;
        let z = this.checkMetadataAndOptions($, K),
          A = { path: H, requestStream: !0, responseStream: !0, requestSerialize: _, responseDeserialize: q },
          f = {
            metadata: z.metadata,
            call: new mc.ClientDuplexStreamImpl(_, q),
            channel: this[zm],
            methodDefinition: A,
            callOptions: z.options,
          };
        if (this[Fr]) f = this[Fr](f);
        let w = f.call,
          Y = {
            clientInterceptors: this[MNH],
            clientInterceptorProviders: this[JNH],
            callInterceptors: (O = f.callOptions.interceptors) !== null && O !== void 0 ? O : [],
            callInterceptorProviders: (T = f.callOptions.interceptor_providers) !== null && T !== void 0 ? T : [],
          },
          D = (0, cu_.getInterceptingCall)(Y, f.methodDefinition, f.callOptions, f.channel);
        w.call = D;
        let j = !1,
          M = Error();
        return (
          D.start(f.metadata, {
            onReceiveMetadata(J) {
              w.emit("metadata", J);
            },
            onReceiveMessage(J) {
              w.push(J);
            },
            onReceiveStatus(J) {
              if (j) return;
              if (((j = !0), w.push(null), J.code !== $7H.Status.OK)) {
                let P = PNH(M);
                w.emit("error", (0, mc.callErrorFromStatus)(J, P));
              }
              (M = null), w.emit("status", J);
            },
          }),
          w
        );
      }
    }
    Fu_.Client = xg7;
  });

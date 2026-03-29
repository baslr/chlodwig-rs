  var tc7 = d((Nx_) => {
    Object.defineProperty(Nx_, "__esModule", { value: !0 });
    Nx_.SingleSubchannelChannel = void 0;
    var Jy1 = Gx_(),
      hsH = w7H(),
      Py1 = pl6(),
      Xy1 = TL(),
      ysH = mK(),
      Wy1 = NsH(),
      Gy1 = yNH(),
      Ry1 = kx_(),
      cl6 = GP(),
      Zy1 = qm(),
      vx_ = OL();
    class ac7 {
      constructor(H, _, q, $, K) {
        var O, T;
        (this.subchannel = H),
          (this.method = _),
          (this.options = $),
          (this.callNumber = K),
          (this.childCall = null),
          (this.pendingMessage = null),
          (this.readPending = !1),
          (this.halfClosePending = !1),
          (this.pendingStatus = null),
          (this.readFilterPending = !1),
          (this.writeFilterPending = !1);
        let z = this.method.split("/"),
          A = "";
        if (z.length >= 2) A = z[1];
        let f =
          (T = (O = (0, vx_.splitHostPort)(this.options.host)) === null || O === void 0 ? void 0 : O.host) !== null &&
          T !== void 0
            ? T
            : "localhost";
        this.serviceUrl = `https://${f}/${A}`;
        let w = (0, Gy1.getRelativeTimeout)($.deadline);
        if (w !== 1 / 0)
          if (w <= 0) this.cancelWithStatus(ysH.Status.DEADLINE_EXCEEDED, "Deadline exceeded");
          else
            setTimeout(() => {
              this.cancelWithStatus(ysH.Status.DEADLINE_EXCEEDED, "Deadline exceeded");
            }, w);
        this.filterStack = q.createFilter();
      }
      cancelWithStatus(H, _) {
        if (this.childCall) this.childCall.cancelWithStatus(H, _);
        else this.pendingStatus = { code: H, details: _, metadata: new cl6.Metadata() };
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.childCall) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : this.subchannel.getAddress();
      }
      async start(H, _) {
        if (this.pendingStatus) {
          _.onReceiveStatus(this.pendingStatus);
          return;
        }
        if (this.subchannel.getConnectivityState() !== Xy1.ConnectivityState.READY) {
          _.onReceiveStatus({
            code: ysH.Status.UNAVAILABLE,
            details: "Subchannel not ready",
            metadata: new cl6.Metadata(),
          });
          return;
        }
        let q = await this.filterStack.sendMetadata(Promise.resolve(H)),
          $;
        try {
          $ = await this.subchannel
            .getCallCredentials()
            .generateMetadata({ method_name: this.method, service_url: this.serviceUrl });
        } catch (O) {
          let T = O,
            { code: z, details: A } = (0, Wy1.restrictControlPlaneStatusCode)(
              typeof T.code === "number" ? T.code : ysH.Status.UNKNOWN,
              `Getting metadata from plugin failed with error: ${T.message}`,
            );
          _.onReceiveStatus({ code: z, details: A, metadata: new cl6.Metadata() });
          return;
        }
        $.merge(q);
        let K = {
          onReceiveMetadata: async (O) => {
            _.onReceiveMetadata(await this.filterStack.receiveMetadata(O));
          },
          onReceiveMessage: async (O) => {
            this.readFilterPending = !0;
            let T = await this.filterStack.receiveMessage(O);
            if (((this.readFilterPending = !1), _.onReceiveMessage(T), this.pendingStatus))
              _.onReceiveStatus(this.pendingStatus);
          },
          onReceiveStatus: async (O) => {
            let T = await this.filterStack.receiveTrailers(O);
            if (this.readFilterPending) this.pendingStatus = T;
            else _.onReceiveStatus(T);
          },
        };
        if (((this.childCall = this.subchannel.createCall($, this.options.host, this.method, K)), this.readPending))
          this.childCall.startRead();
        if (this.pendingMessage)
          this.childCall.sendMessageWithContext(this.pendingMessage.context, this.pendingMessage.message);
        if (this.halfClosePending && !this.writeFilterPending) this.childCall.halfClose();
      }
      async sendMessageWithContext(H, _) {
        this.writeFilterPending = !0;
        let q = await this.filterStack.sendMessage(Promise.resolve({ message: _, flags: H.flags }));
        if (((this.writeFilterPending = !1), this.childCall)) {
          if ((this.childCall.sendMessageWithContext(H, q.message), this.halfClosePending)) this.childCall.halfClose();
        } else this.pendingMessage = { context: H, message: q.message };
      }
      startRead() {
        if (this.childCall) this.childCall.startRead();
        else this.readPending = !0;
      }
      halfClose() {
        if (this.childCall && !this.writeFilterPending) this.childCall.halfClose();
        else this.halfClosePending = !0;
      }
      getCallNumber() {
        return this.callNumber;
      }
      setCredentials(H) {
        throw Error("Method not implemented.");
      }
      getAuthContext() {
        if (this.childCall) return this.childCall.getAuthContext();
        else return null;
      }
    }
    class sc7 {
      constructor(H, _, q) {
        if (
          ((this.subchannel = H),
          (this.target = _),
          (this.channelzEnabled = !1),
          (this.channelzTrace = new hsH.ChannelzTrace()),
          (this.callTracker = new hsH.ChannelzCallTracker()),
          (this.childrenTracker = new hsH.ChannelzChildrenTracker()),
          (this.channelzEnabled = q["grpc.enable_channelz"] !== 0),
          (this.channelzRef = (0, hsH.registerChannelzChannel)(
            (0, vx_.uriToString)(_),
            () => ({
              target: `${(0, vx_.uriToString)(_)} (${H.getAddress()})`,
              state: this.subchannel.getConnectivityState(),
              trace: this.channelzTrace,
              callTracker: this.callTracker,
              children: this.childrenTracker.getChildLists(),
            }),
            this.channelzEnabled,
          )),
          this.channelzEnabled)
        )
          this.childrenTracker.refChild(H.getChannelzRef());
        this.filterStackFactory = new Ry1.FilterStackFactory([new Py1.CompressionFilterFactory(this, q)]);
      }
      close() {
        if (this.channelzEnabled) this.childrenTracker.unrefChild(this.subchannel.getChannelzRef());
        (0, hsH.unregisterChannelzRef)(this.channelzRef);
      }
      getTarget() {
        return (0, vx_.uriToString)(this.target);
      }
      getConnectivityState(H) {
        throw Error("Method not implemented.");
      }
      watchConnectivityState(H, _, q) {
        throw Error("Method not implemented.");
      }
      getChannelzRef() {
        return this.channelzRef;
      }
      createCall(H, _) {
        let q = {
          deadline: _,
          host: (0, Zy1.getDefaultAuthority)(this.target),
          flags: ysH.Propagate.DEFAULTS,
          parentCall: null,
        };
        return new ac7(this.subchannel, H, this.filterStackFactory, q, (0, Jy1.getNextCallNumber)());
      }
    }
    Nx_.SingleSubchannelChannel = sc7;
  });

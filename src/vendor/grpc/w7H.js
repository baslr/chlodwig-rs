  var w7H = d((qf) => {
    var __dirname = "/home/runner/work/claude-cli-internal/claude-cli-internal/node_modules/@grpc/grpc-js/build/src";
    Object.defineProperty(qf, "__esModule", { value: !0 });
    qf.registerChannelzSocket =
      qf.registerChannelzServer =
      qf.registerChannelzSubchannel =
      qf.registerChannelzChannel =
      qf.ChannelzCallTrackerStub =
      qf.ChannelzCallTracker =
      qf.ChannelzChildrenTrackerStub =
      qf.ChannelzChildrenTracker =
      qf.ChannelzTrace =
      qf.ChannelzTraceStub =
        void 0;
    qf.unregisterChannelzRef = Uh1;
    qf.getChannelzHandlers = dc7;
    qf.getChannelzServiceDefinition = cc7;
    qf.setup = Hy1;
    var Px_ = require("net"),
      dAH = Gg7(),
      LsH = TL(),
      ksH = mK(),
      gh1 = Uv(),
      dh1 = du_(),
      ch1 = Qu_();
    function Vl6(H) {
      return { channel_id: H.id, name: H.name };
    }
    function Sl6(H) {
      return { subchannel_id: H.id, name: H.name };
    }
    function Fh1(H) {
      return { server_id: H.id };
    }
    function Xx_(H) {
      return { socket_id: H.id, name: H.name };
    }
    var Sc7 = 32,
      El6 = 100;
    class Ic7 {
      constructor() {
        (this.events = []), (this.creationTimestamp = new Date()), (this.eventsLogged = 0);
      }
      addTrace() {}
      getTraceMessage() {
        return { creation_timestamp: Uc(this.creationTimestamp), num_events_logged: this.eventsLogged, events: [] };
      }
    }
    qf.ChannelzTraceStub = Ic7;
    class uc7 {
      constructor() {
        (this.events = []), (this.eventsLogged = 0), (this.creationTimestamp = new Date());
      }
      addTrace(H, _, q) {
        let $ = new Date();
        if (
          (this.events.push({
            description: _,
            severity: H,
            timestamp: $,
            childChannel: (q === null || q === void 0 ? void 0 : q.kind) === "channel" ? q : void 0,
            childSubchannel: (q === null || q === void 0 ? void 0 : q.kind) === "subchannel" ? q : void 0,
          }),
          this.events.length >= Sc7 * 2)
        )
          this.events = this.events.slice(Sc7);
        this.eventsLogged += 1;
      }
      getTraceMessage() {
        return {
          creation_timestamp: Uc(this.creationTimestamp),
          num_events_logged: this.eventsLogged,
          events: this.events.map((H) => {
            return {
              description: H.description,
              severity: H.severity,
              timestamp: Uc(H.timestamp),
              channel_ref: H.childChannel ? Vl6(H.childChannel) : null,
              subchannel_ref: H.childSubchannel ? Sl6(H.childSubchannel) : null,
            };
          }),
        };
      }
    }
    qf.ChannelzTrace = uc7;
    class Cl6 {
      constructor() {
        (this.channelChildren = new dAH.OrderedMap()),
          (this.subchannelChildren = new dAH.OrderedMap()),
          (this.socketChildren = new dAH.OrderedMap()),
          (this.trackerMap = {
            ["channel"]: this.channelChildren,
            ["subchannel"]: this.subchannelChildren,
            ["socket"]: this.socketChildren,
          });
      }
      refChild(H) {
        let _ = this.trackerMap[H.kind],
          q = _.find(H.id);
        if (q.equals(_.end())) _.setElement(H.id, { ref: H, count: 1 }, q);
        else q.pointer[1].count += 1;
      }
      unrefChild(H) {
        let _ = this.trackerMap[H.kind],
          q = _.getElementByKey(H.id);
        if (q !== void 0) {
          if (((q.count -= 1), q.count === 0)) _.eraseElementByKey(H.id);
        }
      }
      getChildLists() {
        return { channels: this.channelChildren, subchannels: this.subchannelChildren, sockets: this.socketChildren };
      }
    }
    qf.ChannelzChildrenTracker = Cl6;
    class xc7 extends Cl6 {
      refChild() {}
      unrefChild() {}
    }
    qf.ChannelzChildrenTrackerStub = xc7;
    class bl6 {
      constructor() {
        (this.callsStarted = 0),
          (this.callsSucceeded = 0),
          (this.callsFailed = 0),
          (this.lastCallStartedTimestamp = null);
      }
      addCallStarted() {
        (this.callsStarted += 1), (this.lastCallStartedTimestamp = new Date());
      }
      addCallSucceeded() {
        this.callsSucceeded += 1;
      }
      addCallFailed() {
        this.callsFailed += 1;
      }
    }
    qf.ChannelzCallTracker = bl6;
    class mc7 extends bl6 {
      addCallStarted() {}
      addCallSucceeded() {}
      addCallFailed() {}
    }
    qf.ChannelzCallTrackerStub = mc7;
    var rr = {
        ["channel"]: new dAH.OrderedMap(),
        ["subchannel"]: new dAH.OrderedMap(),
        ["server"]: new dAH.OrderedMap(),
        ["socket"]: new dAH.OrderedMap(),
      },
      Wx_ = (H) => {
        let _ = 1;
        function q() {
          return _++;
        }
        let $ = rr[H];
        return (K, O, T) => {
          let z = q(),
            A = { id: z, name: K, kind: H };
          if (T) $.setElement(z, { ref: A, getInfo: O });
          return A;
        };
      };
    qf.registerChannelzChannel = Wx_("channel");
    qf.registerChannelzSubchannel = Wx_("subchannel");
    qf.registerChannelzServer = Wx_("server");
    qf.registerChannelzSocket = Wx_("socket");
    function Uh1(H) {
      rr[H.kind].eraseElementByKey(H.id);
    }
    function Qh1(H) {
      let _ = Number.parseInt(H, 16);
      return [(_ / 256) | 0, _ % 256];
    }
    function Ec7(H) {
      if (H === "") return [];
      let _ = H.split(":").map(($) => Qh1($));
      return [].concat(..._);
    }
    function lh1(H) {
      return (0, Px_.isIPv6)(H) && H.toLowerCase().startsWith("::ffff:") && (0, Px_.isIPv4)(H.substring(7));
    }
    function Cc7(H) {
      return Buffer.from(Uint8Array.from(H.split(".").map((_) => Number.parseInt(_))));
    }
    function ih1(H) {
      if ((0, Px_.isIPv4)(H)) return Cc7(H);
      else if (lh1(H)) return Cc7(H.substring(7));
      else if ((0, Px_.isIPv6)(H)) {
        let _,
          q,
          $ = H.indexOf("::");
        if ($ === -1) (_ = H), (q = "");
        else (_ = H.substring(0, $)), (q = H.substring($ + 2));
        let K = Buffer.from(Ec7(_)),
          O = Buffer.from(Ec7(q)),
          T = Buffer.alloc(16 - K.length - O.length, 0);
        return Buffer.concat([K, T, O]);
      } else return null;
    }
    function pc7(H) {
      switch (H) {
        case LsH.ConnectivityState.CONNECTING:
          return { state: "CONNECTING" };
        case LsH.ConnectivityState.IDLE:
          return { state: "IDLE" };
        case LsH.ConnectivityState.READY:
          return { state: "READY" };
        case LsH.ConnectivityState.SHUTDOWN:
          return { state: "SHUTDOWN" };
        case LsH.ConnectivityState.TRANSIENT_FAILURE:
          return { state: "TRANSIENT_FAILURE" };
        default:
          return { state: "UNKNOWN" };
      }
    }
    function Uc(H) {
      if (!H) return null;
      let _ = H.getTime();
      return { seconds: (_ / 1000) | 0, nanos: (_ % 1000) * 1e6 };
    }
    function Bc7(H) {
      let _ = H.getInfo(),
        q = [],
        $ = [];
      return (
        _.children.channels.forEach((K) => {
          q.push(Vl6(K[1].ref));
        }),
        _.children.subchannels.forEach((K) => {
          $.push(Sl6(K[1].ref));
        }),
        {
          ref: Vl6(H.ref),
          data: {
            target: _.target,
            state: pc7(_.state),
            calls_started: _.callTracker.callsStarted,
            calls_succeeded: _.callTracker.callsSucceeded,
            calls_failed: _.callTracker.callsFailed,
            last_call_started_timestamp: Uc(_.callTracker.lastCallStartedTimestamp),
            trace: _.trace.getTraceMessage(),
          },
          channel_ref: q,
          subchannel_ref: $,
        }
      );
    }
    function nh1(H, _) {
      let q = parseInt(H.request.channel_id, 10),
        $ = rr.channel.getElementByKey(q);
      if ($ === void 0) {
        _({ code: ksH.Status.NOT_FOUND, details: "No channel data found for id " + q });
        return;
      }
      _(null, { channel: Bc7($) });
    }
    function rh1(H, _) {
      let q = parseInt(H.request.max_results, 10) || El6,
        $ = [],
        K = parseInt(H.request.start_channel_id, 10),
        O = rr.channel,
        T;
      for (T = O.lowerBound(K); !T.equals(O.end()) && $.length < q; T = T.next()) $.push(Bc7(T.pointer[1]));
      _(null, { channel: $, end: T.equals(O.end()) });
    }
    function gc7(H) {
      let _ = H.getInfo(),
        q = [];
      return (
        _.listenerChildren.sockets.forEach(($) => {
          q.push(Xx_($[1].ref));
        }),
        {
          ref: Fh1(H.ref),
          data: {
            calls_started: _.callTracker.callsStarted,
            calls_succeeded: _.callTracker.callsSucceeded,
            calls_failed: _.callTracker.callsFailed,
            last_call_started_timestamp: Uc(_.callTracker.lastCallStartedTimestamp),
            trace: _.trace.getTraceMessage(),
          },
          listen_socket: q,
        }
      );
    }
    function oh1(H, _) {
      let q = parseInt(H.request.server_id, 10),
        K = rr.server.getElementByKey(q);
      if (K === void 0) {
        _({ code: ksH.Status.NOT_FOUND, details: "No server data found for id " + q });
        return;
      }
      _(null, { server: gc7(K) });
    }
    function ah1(H, _) {
      let q = parseInt(H.request.max_results, 10) || El6,
        $ = parseInt(H.request.start_server_id, 10),
        K = rr.server,
        O = [],
        T;
      for (T = K.lowerBound($); !T.equals(K.end()) && O.length < q; T = T.next()) O.push(gc7(T.pointer[1]));
      _(null, { server: O, end: T.equals(K.end()) });
    }
    function sh1(H, _) {
      let q = parseInt(H.request.subchannel_id, 10),
        $ = rr.subchannel.getElementByKey(q);
      if ($ === void 0) {
        _({ code: ksH.Status.NOT_FOUND, details: "No subchannel data found for id " + q });
        return;
      }
      let K = $.getInfo(),
        O = [];
      K.children.sockets.forEach((z) => {
        O.push(Xx_(z[1].ref));
      });
      let T = {
        ref: Sl6($.ref),
        data: {
          target: K.target,
          state: pc7(K.state),
          calls_started: K.callTracker.callsStarted,
          calls_succeeded: K.callTracker.callsSucceeded,
          calls_failed: K.callTracker.callsFailed,
          last_call_started_timestamp: Uc(K.callTracker.lastCallStartedTimestamp),
          trace: K.trace.getTraceMessage(),
        },
        socket_ref: O,
      };
      _(null, { subchannel: T });
    }
    function bc7(H) {
      var _;
      if ((0, gh1.isTcpSubchannelAddress)(H))
        return {
          address: "tcpip_address",
          tcpip_address: { ip_address: (_ = ih1(H.host)) !== null && _ !== void 0 ? _ : void 0, port: H.port },
        };
      else return { address: "uds_address", uds_address: { filename: H.path } };
    }
    function th1(H, _) {
      var q, $, K, O, T;
      let z = parseInt(H.request.socket_id, 10),
        A = rr.socket.getElementByKey(z);
      if (A === void 0) {
        _({ code: ksH.Status.NOT_FOUND, details: "No socket data found for id " + z });
        return;
      }
      let f = A.getInfo(),
        w = f.security
          ? {
              model: "tls",
              tls: {
                cipher_suite: f.security.cipherSuiteStandardName ? "standard_name" : "other_name",
                standard_name: (q = f.security.cipherSuiteStandardName) !== null && q !== void 0 ? q : void 0,
                other_name: ($ = f.security.cipherSuiteOtherName) !== null && $ !== void 0 ? $ : void 0,
                local_certificate: (K = f.security.localCertificate) !== null && K !== void 0 ? K : void 0,
                remote_certificate: (O = f.security.remoteCertificate) !== null && O !== void 0 ? O : void 0,
              },
            }
          : null,
        Y = {
          ref: Xx_(A.ref),
          local: f.localAddress ? bc7(f.localAddress) : null,
          remote: f.remoteAddress ? bc7(f.remoteAddress) : null,
          remote_name: (T = f.remoteName) !== null && T !== void 0 ? T : void 0,
          security: w,
          data: {
            keep_alives_sent: f.keepAlivesSent,
            streams_started: f.streamsStarted,
            streams_succeeded: f.streamsSucceeded,
            streams_failed: f.streamsFailed,
            last_local_stream_created_timestamp: Uc(f.lastLocalStreamCreatedTimestamp),
            last_remote_stream_created_timestamp: Uc(f.lastRemoteStreamCreatedTimestamp),
            messages_received: f.messagesReceived,
            messages_sent: f.messagesSent,
            last_message_received_timestamp: Uc(f.lastMessageReceivedTimestamp),
            last_message_sent_timestamp: Uc(f.lastMessageSentTimestamp),
            local_flow_control_window: f.localFlowControlWindow ? { value: f.localFlowControlWindow } : null,
            remote_flow_control_window: f.remoteFlowControlWindow ? { value: f.remoteFlowControlWindow } : null,
          },
        };
      _(null, { socket: Y });
    }
    function eh1(H, _) {
      let q = parseInt(H.request.server_id, 10),
        $ = rr.server.getElementByKey(q);
      if ($ === void 0) {
        _({ code: ksH.Status.NOT_FOUND, details: "No server data found for id " + q });
        return;
      }
      let K = parseInt(H.request.start_socket_id, 10),
        O = parseInt(H.request.max_results, 10) || El6,
        z = $.getInfo().sessionChildren.sockets,
        A = [],
        f;
      for (f = z.lowerBound(K); !f.equals(z.end()) && A.length < O; f = f.next()) A.push(Xx_(f.pointer[1].ref));
      _(null, { socket_ref: A, end: f.equals(z.end()) });
    }
    function dc7() {
      return {
        GetChannel: nh1,
        GetTopChannels: rh1,
        GetServer: oh1,
        GetServers: ah1,
        GetSubchannel: sh1,
        GetSocket: th1,
        GetServerSockets: eh1,
      };
    }
    var Jx_ = null;
    function cc7() {
      if (Jx_) return Jx_;
      let H = yl6().loadSync,
        _ = H("channelz.proto", {
          keepCase: !0,
          longs: String,
          enums: String,
          defaults: !0,
          oneofs: !0,
          includeDirs: [`${__dirname}/../../proto`],
        });
      return (Jx_ = (0, ch1.loadPackageDefinition)(_).grpc.channelz.v1.Channelz.service), Jx_;
    }
    function Hy1() {
      (0, dh1.registerAdminService)(cc7, dc7);
    }
  });

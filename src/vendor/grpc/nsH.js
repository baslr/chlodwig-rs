  var nsH = d((J7) => {
    Object.defineProperty(J7, "__esModule", { value: !0 });
    J7.experimental =
      J7.ServerMetricRecorder =
      J7.ServerInterceptingCall =
      J7.ResponderBuilder =
      J7.ServerListenerBuilder =
      J7.addAdminServicesToServer =
      J7.getChannelzHandlers =
      J7.getChannelzServiceDefinition =
      J7.InterceptorConfigurationError =
      J7.InterceptingCall =
      J7.RequesterBuilder =
      J7.ListenerBuilder =
      J7.StatusBuilder =
      J7.getClientChannel =
      J7.ServerCredentials =
      J7.Server =
      J7.setLogVerbosity =
      J7.setLogger =
      J7.load =
      J7.loadObject =
      J7.CallCredentials =
      J7.ChannelCredentials =
      J7.waitForClientReady =
      J7.closeClient =
      J7.Channel =
      J7.makeGenericClientConstructor =
      J7.makeClientConstructor =
      J7.loadPackageDefinition =
      J7.Client =
      J7.compressionAlgorithms =
      J7.propagate =
      J7.connectivityState =
      J7.status =
      J7.logVerbosity =
      J7.Metadata =
      J7.credentials =
        void 0;
    var fm_ = Nu_();
    Object.defineProperty(J7, "CallCredentials", {
      enumerable: !0,
      get: function () {
        return fm_.CallCredentials;
      },
    });
    var iE1 = xQ6();
    Object.defineProperty(J7, "Channel", {
      enumerable: !0,
      get: function () {
        return iE1.ChannelImplementation;
      },
    });
    var nE1 = ul6();
    Object.defineProperty(J7, "compressionAlgorithms", {
      enumerable: !0,
      get: function () {
        return nE1.CompressionAlgorithms;
      },
    });
    var rE1 = TL();
    Object.defineProperty(J7, "connectivityState", {
      enumerable: !0,
      get: function () {
        return rE1.ConnectivityState;
      },
    });
    var wm_ = YNH();
    Object.defineProperty(J7, "ChannelCredentials", {
      enumerable: !0,
      get: function () {
        return wm_.ChannelCredentials;
      },
    });
    var zQ7 = uQ6();
    Object.defineProperty(J7, "Client", {
      enumerable: !0,
      get: function () {
        return zQ7.Client;
      },
    });
    var ci6 = mK();
    Object.defineProperty(J7, "logVerbosity", {
      enumerable: !0,
      get: function () {
        return ci6.LogVerbosity;
      },
    });
    Object.defineProperty(J7, "status", {
      enumerable: !0,
      get: function () {
        return ci6.Status;
      },
    });
    Object.defineProperty(J7, "propagate", {
      enumerable: !0,
      get: function () {
        return ci6.Propagate;
      },
    });
    var AQ7 = DA(),
      Fi6 = Qu_();
    Object.defineProperty(J7, "loadPackageDefinition", {
      enumerable: !0,
      get: function () {
        return Fi6.loadPackageDefinition;
      },
    });
    Object.defineProperty(J7, "makeClientConstructor", {
      enumerable: !0,
      get: function () {
        return Fi6.makeClientConstructor;
      },
    });
    Object.defineProperty(J7, "makeGenericClientConstructor", {
      enumerable: !0,
      get: function () {
        return Fi6.makeClientConstructor;
      },
    });
    var oE1 = GP();
    Object.defineProperty(J7, "Metadata", {
      enumerable: !0,
      get: function () {
        return oE1.Metadata;
      },
    });
    var aE1 = PU7();
    Object.defineProperty(J7, "Server", {
      enumerable: !0,
      get: function () {
        return aE1.Server;
      },
    });
    var sE1 = lx_();
    Object.defineProperty(J7, "ServerCredentials", {
      enumerable: !0,
      get: function () {
        return sE1.ServerCredentials;
      },
    });
    var tE1 = WU7();
    Object.defineProperty(J7, "StatusBuilder", {
      enumerable: !0,
      get: function () {
        return tE1.StatusBuilder;
      },
    });
    J7.credentials = {
      combineChannelCredentials: (H, ..._) => {
        return _.reduce((q, $) => q.compose($), H);
      },
      combineCallCredentials: (H, ..._) => {
        return _.reduce((q, $) => q.compose($), H);
      },
      createInsecure: wm_.ChannelCredentials.createInsecure,
      createSsl: wm_.ChannelCredentials.createSsl,
      createFromSecureContext: wm_.ChannelCredentials.createFromSecureContext,
      createFromMetadataGenerator: fm_.CallCredentials.createFromMetadataGenerator,
      createFromGoogleCredential: fm_.CallCredentials.createFromGoogleCredential,
      createEmpty: fm_.CallCredentials.createEmpty,
    };
    var eE1 = (H) => H.close();
    J7.closeClient = eE1;
    var HC1 = (H, _, q) => H.waitForReady(_, q);
    J7.waitForClientReady = HC1;
    var _C1 = (H, _) => {
      throw Error("Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead");
    };
    J7.loadObject = _C1;
    var qC1 = (H, _, q) => {
      throw Error("Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead");
    };
    J7.load = qC1;
    var $C1 = (H) => {
      AQ7.setLogger(H);
    };
    J7.setLogger = $C1;
    var KC1 = (H) => {
      AQ7.setLoggerVerbosity(H);
    };
    J7.setLogVerbosity = KC1;
    var OC1 = (H) => {
      return zQ7.Client.prototype.getChannel.call(H);
    };
    J7.getClientChannel = OC1;
    var Ym_ = bQ6();
    Object.defineProperty(J7, "ListenerBuilder", {
      enumerable: !0,
      get: function () {
        return Ym_.ListenerBuilder;
      },
    });
    Object.defineProperty(J7, "RequesterBuilder", {
      enumerable: !0,
      get: function () {
        return Ym_.RequesterBuilder;
      },
    });
    Object.defineProperty(J7, "InterceptingCall", {
      enumerable: !0,
      get: function () {
        return Ym_.InterceptingCall;
      },
    });
    Object.defineProperty(J7, "InterceptorConfigurationError", {
      enumerable: !0,
      get: function () {
        return Ym_.InterceptorConfigurationError;
      },
    });
    var fQ7 = w7H();
    Object.defineProperty(J7, "getChannelzServiceDefinition", {
      enumerable: !0,
      get: function () {
        return fQ7.getChannelzServiceDefinition;
      },
    });
    Object.defineProperty(J7, "getChannelzHandlers", {
      enumerable: !0,
      get: function () {
        return fQ7.getChannelzHandlers;
      },
    });
    var TC1 = du_();
    Object.defineProperty(J7, "addAdminServicesToServer", {
      enumerable: !0,
      get: function () {
        return TC1.addAdminServicesToServer;
      },
    });
    var Ui6 = Pi6();
    Object.defineProperty(J7, "ServerListenerBuilder", {
      enumerable: !0,
      get: function () {
        return Ui6.ServerListenerBuilder;
      },
    });
    Object.defineProperty(J7, "ResponderBuilder", {
      enumerable: !0,
      get: function () {
        return Ui6.ResponderBuilder;
      },
    });
    Object.defineProperty(J7, "ServerInterceptingCall", {
      enumerable: !0,
      get: function () {
        return Ui6.ServerInterceptingCall;
      },
    });
    var zC1 = nx_();
    Object.defineProperty(J7, "ServerMetricRecorder", {
      enumerable: !0,
      get: function () {
        return zC1.ServerMetricRecorder;
      },
    });
    var AC1 = vi6();
    J7.experimental = AC1;
    var fC1 = il6(),
      wC1 = uU7(),
      YC1 = dU7(),
      DC1 = gsH(),
      jC1 = lU7(),
      MC1 = sU7(),
      JC1 = TQ7(),
      PC1 = w7H();
    (() => {
      fC1.setup(), wC1.setup(), YC1.setup(), DC1.setup(), jC1.setup(), MC1.setup(), JC1.setup(), PC1.setup();
    })();
  });

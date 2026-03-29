  var sg6 = d((i9) => {
    Object.defineProperty(i9, "__esModule", { value: !0 });
    i9.Message =
      i9.NotificationType9 =
      i9.NotificationType8 =
      i9.NotificationType7 =
      i9.NotificationType6 =
      i9.NotificationType5 =
      i9.NotificationType4 =
      i9.NotificationType3 =
      i9.NotificationType2 =
      i9.NotificationType1 =
      i9.NotificationType0 =
      i9.NotificationType =
      i9.RequestType9 =
      i9.RequestType8 =
      i9.RequestType7 =
      i9.RequestType6 =
      i9.RequestType5 =
      i9.RequestType4 =
      i9.RequestType3 =
      i9.RequestType2 =
      i9.RequestType1 =
      i9.RequestType =
      i9.RequestType0 =
      i9.AbstractMessageSignature =
      i9.ParameterStructures =
      i9.ResponseError =
      i9.ErrorCodes =
        void 0;
    var czH = ZkH(),
      og6;
    (function (H) {
      (H.ParseError = -32700),
        (H.InvalidRequest = -32600),
        (H.MethodNotFound = -32601),
        (H.InvalidParams = -32602),
        (H.InternalError = -32603),
        (H.jsonrpcReservedErrorRangeStart = -32099),
        (H.serverErrorStart = -32099),
        (H.MessageWriteError = -32099),
        (H.MessageReadError = -32098),
        (H.PendingResponseRejected = -32097),
        (H.ConnectionInactive = -32096),
        (H.ServerNotInitialized = -32002),
        (H.UnknownErrorCode = -32001),
        (H.jsonrpcReservedErrorRangeEnd = -32000),
        (H.serverErrorEnd = -32000);
    })(og6 || (i9.ErrorCodes = og6 = {}));
    class ag6 extends Error {
      constructor(H, _, q) {
        super(_);
        (this.code = czH.number(H) ? H : og6.UnknownErrorCode),
          (this.data = q),
          Object.setPrototypeOf(this, ag6.prototype);
      }
      toJson() {
        let H = { code: this.code, message: this.message };
        if (this.data !== void 0) H.data = this.data;
        return H;
      }
    }
    i9.ResponseError = ag6;
    class uG {
      constructor(H) {
        this.kind = H;
      }
      static is(H) {
        return H === uG.auto || H === uG.byName || H === uG.byPosition;
      }
      toString() {
        return this.kind;
      }
    }
    i9.ParameterStructures = uG;
    uG.auto = new uG("auto");
    uG.byPosition = new uG("byPosition");
    uG.byName = new uG("byName");
    class gw {
      constructor(H, _) {
        (this.method = H), (this.numberOfParams = _);
      }
      get parameterStructures() {
        return uG.auto;
      }
    }
    i9.AbstractMessageSignature = gw;
    class bh7 extends gw {
      constructor(H) {
        super(H, 0);
      }
    }
    i9.RequestType0 = bh7;
    class Ih7 extends gw {
      constructor(H, _ = uG.auto) {
        super(H, 1);
        this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    i9.RequestType = Ih7;
    class uh7 extends gw {
      constructor(H, _ = uG.auto) {
        super(H, 1);
        this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    i9.RequestType1 = uh7;
    class xh7 extends gw {
      constructor(H) {
        super(H, 2);
      }
    }
    i9.RequestType2 = xh7;
    class mh7 extends gw {
      constructor(H) {
        super(H, 3);
      }
    }
    i9.RequestType3 = mh7;
    class ph7 extends gw {
      constructor(H) {
        super(H, 4);
      }
    }
    i9.RequestType4 = ph7;
    class Bh7 extends gw {
      constructor(H) {
        super(H, 5);
      }
    }
    i9.RequestType5 = Bh7;
    class gh7 extends gw {
      constructor(H) {
        super(H, 6);
      }
    }
    i9.RequestType6 = gh7;
    class dh7 extends gw {
      constructor(H) {
        super(H, 7);
      }
    }
    i9.RequestType7 = dh7;
    class ch7 extends gw {
      constructor(H) {
        super(H, 8);
      }
    }
    i9.RequestType8 = ch7;
    class Fh7 extends gw {
      constructor(H) {
        super(H, 9);
      }
    }
    i9.RequestType9 = Fh7;
    class Uh7 extends gw {
      constructor(H, _ = uG.auto) {
        super(H, 1);
        this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    i9.NotificationType = Uh7;
    class Qh7 extends gw {
      constructor(H) {
        super(H, 0);
      }
    }
    i9.NotificationType0 = Qh7;
    class lh7 extends gw {
      constructor(H, _ = uG.auto) {
        super(H, 1);
        this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    i9.NotificationType1 = lh7;
    class ih7 extends gw {
      constructor(H) {
        super(H, 2);
      }
    }
    i9.NotificationType2 = ih7;
    class nh7 extends gw {
      constructor(H) {
        super(H, 3);
      }
    }
    i9.NotificationType3 = nh7;
    class rh7 extends gw {
      constructor(H) {
        super(H, 4);
      }
    }
    i9.NotificationType4 = rh7;
    class oh7 extends gw {
      constructor(H) {
        super(H, 5);
      }
    }
    i9.NotificationType5 = oh7;
    class ah7 extends gw {
      constructor(H) {
        super(H, 6);
      }
    }
    i9.NotificationType6 = ah7;
    class sh7 extends gw {
      constructor(H) {
        super(H, 7);
      }
    }
    i9.NotificationType7 = sh7;
    class th7 extends gw {
      constructor(H) {
        super(H, 8);
      }
    }
    i9.NotificationType8 = th7;
    class eh7 extends gw {
      constructor(H) {
        super(H, 9);
      }
    }
    i9.NotificationType9 = eh7;
    var Ch7;
    (function (H) {
      function _(K) {
        let O = K;
        return O && czH.string(O.method) && (czH.string(O.id) || czH.number(O.id));
      }
      H.isRequest = _;
      function q(K) {
        let O = K;
        return O && czH.string(O.method) && K.id === void 0;
      }
      H.isNotification = q;
      function $(K) {
        let O = K;
        return O && (O.result !== void 0 || !!O.error) && (czH.string(O.id) || czH.number(O.id) || O.id === null);
      }
      H.isResponse = $;
    })(Ch7 || (i9.Message = Ch7 = {}));
  });

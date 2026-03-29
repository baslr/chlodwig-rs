  var Sy7 = d((y1) => {
    Object.defineProperty(y1, "__esModule", { value: !0 });
    y1.createMessageConnection =
      y1.ConnectionOptions =
      y1.MessageStrategy =
      y1.CancellationStrategy =
      y1.CancellationSenderStrategy =
      y1.CancellationReceiverStrategy =
      y1.RequestCancellationReceiverStrategy =
      y1.IdCancellationReceiverStrategy =
      y1.ConnectionStrategy =
      y1.ConnectionError =
      y1.ConnectionErrors =
      y1.LogTraceNotification =
      y1.SetTraceNotification =
      y1.TraceFormat =
      y1.TraceValues =
      y1.Trace =
      y1.NullLogger =
      y1.ProgressType =
      y1.ProgressToken =
        void 0;
    var vy7 = jqH(),
      dY = ZkH(),
      q4 = sg6(),
      Ny7 = eg6(),
      NoH = kkH(),
      Dd6 = NE_(),
      VoH;
    (function (H) {
      H.type = new q4.NotificationType("$/cancelRequest");
    })(VoH || (VoH = {}));
    var jd6;
    (function (H) {
      function _(q) {
        return typeof q === "string" || typeof q === "number";
      }
      H.is = _;
    })(jd6 || (y1.ProgressToken = jd6 = {}));
    var hoH;
    (function (H) {
      H.type = new q4.NotificationType("$/progress");
    })(hoH || (hoH = {}));
    class Vy7 {
      constructor() {}
    }
    y1.ProgressType = Vy7;
    var Md6;
    (function (H) {
      function _(q) {
        return dY.func(q);
      }
      H.is = _;
    })(Md6 || (Md6 = {}));
    y1.NullLogger = Object.freeze({ error: () => {}, warn: () => {}, info: () => {}, log: () => {} });
    var gO;
    (function (H) {
      (H[(H.Off = 0)] = "Off"),
        (H[(H.Messages = 1)] = "Messages"),
        (H[(H.Compact = 2)] = "Compact"),
        (H[(H.Verbose = 3)] = "Verbose");
    })(gO || (y1.Trace = gO = {}));
    var hy7;
    (function (H) {
      (H.Off = "off"), (H.Messages = "messages"), (H.Compact = "compact"), (H.Verbose = "verbose");
    })(hy7 || (y1.TraceValues = hy7 = {}));
    (function (H) {
      function _($) {
        if (!dY.string($)) return H.Off;
        switch ((($ = $.toLowerCase()), $)) {
          case "off":
            return H.Off;
          case "messages":
            return H.Messages;
          case "compact":
            return H.Compact;
          case "verbose":
            return H.Verbose;
          default:
            return H.Off;
        }
      }
      H.fromString = _;
      function q($) {
        switch ($) {
          case H.Off:
            return "off";
          case H.Messages:
            return "messages";
          case H.Compact:
            return "compact";
          case H.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      H.toString = q;
    })(gO || (y1.Trace = gO = {}));
    var xy;
    (function (H) {
      (H.Text = "text"), (H.JSON = "json");
    })(xy || (y1.TraceFormat = xy = {}));
    (function (H) {
      function _(q) {
        if (!dY.string(q)) return H.Text;
        if (((q = q.toLowerCase()), q === "json")) return H.JSON;
        else return H.Text;
      }
      H.fromString = _;
    })(xy || (y1.TraceFormat = xy = {}));
    var Jd6;
    (function (H) {
      H.type = new q4.NotificationType("$/setTrace");
    })(Jd6 || (y1.SetTraceNotification = Jd6 = {}));
    var VE_;
    (function (H) {
      H.type = new q4.NotificationType("$/logTrace");
    })(VE_ || (y1.LogTraceNotification = VE_ = {}));
    var yoH;
    (function (H) {
      (H[(H.Closed = 1)] = "Closed"),
        (H[(H.Disposed = 2)] = "Disposed"),
        (H[(H.AlreadyListening = 3)] = "AlreadyListening");
    })(yoH || (y1.ConnectionErrors = yoH = {}));
    class ykH extends Error {
      constructor(H, _) {
        super(_);
        (this.code = H), Object.setPrototypeOf(this, ykH.prototype);
      }
    }
    y1.ConnectionError = ykH;
    var Pd6;
    (function (H) {
      function _(q) {
        let $ = q;
        return $ && dY.func($.cancelUndispatched);
      }
      H.is = _;
    })(Pd6 || (y1.ConnectionStrategy = Pd6 = {}));
    var SE_;
    (function (H) {
      function _(q) {
        let $ = q;
        return (
          $ &&
          ($.kind === void 0 || $.kind === "id") &&
          dY.func($.createCancellationTokenSource) &&
          ($.dispose === void 0 || dY.func($.dispose))
        );
      }
      H.is = _;
    })(SE_ || (y1.IdCancellationReceiverStrategy = SE_ = {}));
    var Xd6;
    (function (H) {
      function _(q) {
        let $ = q;
        return (
          $ &&
          $.kind === "request" &&
          dY.func($.createCancellationTokenSource) &&
          ($.dispose === void 0 || dY.func($.dispose))
        );
      }
      H.is = _;
    })(Xd6 || (y1.RequestCancellationReceiverStrategy = Xd6 = {}));
    var EE_;
    (function (H) {
      H.Message = Object.freeze({
        createCancellationTokenSource(q) {
          return new Dd6.CancellationTokenSource();
        },
      });
      function _(q) {
        return SE_.is(q) || Xd6.is(q);
      }
      H.is = _;
    })(EE_ || (y1.CancellationReceiverStrategy = EE_ = {}));
    var CE_;
    (function (H) {
      H.Message = Object.freeze({
        sendCancellation(q, $) {
          return q.sendNotification(VoH.type, { id: $ });
        },
        cleanup(q) {},
      });
      function _(q) {
        let $ = q;
        return $ && dY.func($.sendCancellation) && dY.func($.cleanup);
      }
      H.is = _;
    })(CE_ || (y1.CancellationSenderStrategy = CE_ = {}));
    var bE_;
    (function (H) {
      H.Message = Object.freeze({ receiver: EE_.Message, sender: CE_.Message });
      function _(q) {
        let $ = q;
        return $ && EE_.is($.receiver) && CE_.is($.sender);
      }
      H.is = _;
    })(bE_ || (y1.CancellationStrategy = bE_ = {}));
    var IE_;
    (function (H) {
      function _(q) {
        let $ = q;
        return $ && dY.func($.handleMessage);
      }
      H.is = _;
    })(IE_ || (y1.MessageStrategy = IE_ = {}));
    var yy7;
    (function (H) {
      function _(q) {
        let $ = q;
        return $ && (bE_.is($.cancellationStrategy) || Pd6.is($.connectionStrategy) || IE_.is($.messageStrategy));
      }
      H.is = _;
    })(yy7 || (y1.ConnectionOptions = yy7 = {}));
    var mx;
    (function (H) {
      (H[(H.New = 1)] = "New"),
        (H[(H.Listening = 2)] = "Listening"),
        (H[(H.Closed = 3)] = "Closed"),
        (H[(H.Disposed = 4)] = "Disposed");
    })(mx || (mx = {}));
    function rD1(H, _, q, $) {
      let K = q !== void 0 ? q : y1.NullLogger,
        O = 0,
        T = 0,
        z = 0,
        A = "2.0",
        f = void 0,
        w = new Map(),
        Y = void 0,
        D = new Map(),
        j = new Map(),
        M,
        J = new Ny7.LinkedMap(),
        P = new Map(),
        X = new Set(),
        R = new Map(),
        W = gO.Off,
        Z = xy.Text,
        k,
        v = mx.New,
        y = new NoH.Emitter(),
        E = new NoH.Emitter(),
        S = new NoH.Emitter(),
        x = new NoH.Emitter(),
        I = new NoH.Emitter(),
        B = $ && $.cancellationStrategy ? $.cancellationStrategy : bE_.Message;
      function p(zH) {
        if (zH === null) throw Error("Can't send requests with id null since the response can't be correlated.");
        return "req-" + zH.toString();
      }
      function C(zH) {
        if (zH === null) return "res-unknown-" + (++z).toString();
        else return "res-" + zH.toString();
      }
      function g() {
        return "not-" + (++T).toString();
      }
      function c(zH, WH) {
        if (q4.Message.isRequest(WH)) zH.set(p(WH.id), WH);
        else if (q4.Message.isResponse(WH)) zH.set(C(WH.id), WH);
        else zH.set(g(), WH);
      }
      function U(zH) {
        return;
      }
      function i() {
        return v === mx.Listening;
      }
      function _H() {
        return v === mx.Closed;
      }
      function HH() {
        return v === mx.Disposed;
      }
      function e() {
        if (v === mx.New || v === mx.Listening) (v = mx.Closed), E.fire(void 0);
      }
      function qH(zH) {
        y.fire([zH, void 0, void 0]);
      }
      function r(zH) {
        y.fire(zH);
      }
      H.onClose(e), H.onError(qH), _.onClose(e), _.onError(r);
      function $H() {
        if (M || J.size === 0) return;
        M = (0, vy7.default)().timer.setImmediate(() => {
          (M = void 0), fH();
        });
      }
      function DH(zH) {
        if (q4.Message.isRequest(zH)) KH(zH);
        else if (q4.Message.isNotification(zH)) l(zH);
        else if (q4.Message.isResponse(zH)) n(zH);
        else a(zH);
      }
      function fH() {
        if (J.size === 0) return;
        let zH = J.shift();
        try {
          let WH = $?.messageStrategy;
          if (IE_.is(WH)) WH.handleMessage(zH, DH);
          else DH(zH);
        } finally {
          $H();
        }
      }
      let vH = (zH) => {
        try {
          if (q4.Message.isNotification(zH) && zH.method === VoH.type.method) {
            let WH = zH.params.id,
              BH = p(WH),
              EH = J.get(BH);
            if (q4.Message.isRequest(EH)) {
              let FH = $?.connectionStrategy,
                TH = FH && FH.cancelUndispatched ? FH.cancelUndispatched(EH, U) : U(EH);
              if (TH && (TH.error !== void 0 || TH.result !== void 0)) {
                J.delete(BH),
                  R.delete(WH),
                  (TH.id = EH.id),
                  XH(TH, zH.method, Date.now()),
                  _.write(TH).catch(() => K.error("Sending response for canceled message failed."));
                return;
              }
            }
            let mH = R.get(WH);
            if (mH !== void 0) {
              mH.cancel(), GH(zH);
              return;
            } else X.add(WH);
          }
          c(J, zH);
        } finally {
          $H();
        }
      };
      function KH(zH) {
        if (HH()) return;
        function WH(dH, JH, LH) {
          let xH = { jsonrpc: A, id: zH.id };
          if (dH instanceof q4.ResponseError) xH.error = dH.toJson();
          else xH.result = dH === void 0 ? null : dH;
          XH(xH, JH, LH), _.write(xH).catch(() => K.error("Sending response failed."));
        }
        function BH(dH, JH, LH) {
          let xH = { jsonrpc: A, id: zH.id, error: dH.toJson() };
          XH(xH, JH, LH), _.write(xH).catch(() => K.error("Sending response failed."));
        }
        function EH(dH, JH, LH) {
          if (dH === void 0) dH = null;
          let xH = { jsonrpc: A, id: zH.id, result: dH };
          XH(xH, JH, LH), _.write(xH).catch(() => K.error("Sending response failed."));
        }
        jH(zH);
        let mH = w.get(zH.method),
          FH,
          TH;
        if (mH) (FH = mH.type), (TH = mH.handler);
        let wH = Date.now();
        if (TH || f) {
          let dH = zH.id ?? String(Date.now()),
            JH = SE_.is(B.receiver)
              ? B.receiver.createCancellationTokenSource(dH)
              : B.receiver.createCancellationTokenSource(zH);
          if (zH.id !== null && X.has(zH.id)) JH.cancel();
          if (zH.id !== null) R.set(dH, JH);
          try {
            let LH;
            if (TH)
              if (zH.params === void 0) {
                if (FH !== void 0 && FH.numberOfParams !== 0) {
                  BH(
                    new q4.ResponseError(
                      q4.ErrorCodes.InvalidParams,
                      `Request ${zH.method} defines ${FH.numberOfParams} params but received none.`,
                    ),
                    zH.method,
                    wH,
                  );
                  return;
                }
                LH = TH(JH.token);
              } else if (Array.isArray(zH.params)) {
                if (FH !== void 0 && FH.parameterStructures === q4.ParameterStructures.byName) {
                  BH(
                    new q4.ResponseError(
                      q4.ErrorCodes.InvalidParams,
                      `Request ${zH.method} defines parameters by name but received parameters by position`,
                    ),
                    zH.method,
                    wH,
                  );
                  return;
                }
                LH = TH(...zH.params, JH.token);
              } else {
                if (FH !== void 0 && FH.parameterStructures === q4.ParameterStructures.byPosition) {
                  BH(
                    new q4.ResponseError(
                      q4.ErrorCodes.InvalidParams,
                      `Request ${zH.method} defines parameters by position but received parameters by name`,
                    ),
                    zH.method,
                    wH,
                  );
                  return;
                }
                LH = TH(zH.params, JH.token);
              }
            else if (f) LH = f(zH.method, zH.params, JH.token);
            let xH = LH;
            if (!LH) R.delete(dH), EH(LH, zH.method, wH);
            else if (xH.then)
              xH.then(
                (tH) => {
                  R.delete(dH), WH(tH, zH.method, wH);
                },
                (tH) => {
                  if ((R.delete(dH), tH instanceof q4.ResponseError)) BH(tH, zH.method, wH);
                  else if (tH && dY.string(tH.message))
                    BH(
                      new q4.ResponseError(
                        q4.ErrorCodes.InternalError,
                        `Request ${zH.method} failed with message: ${tH.message}`,
                      ),
                      zH.method,
                      wH,
                    );
                  else
                    BH(
                      new q4.ResponseError(
                        q4.ErrorCodes.InternalError,
                        `Request ${zH.method} failed unexpectedly without providing any details.`,
                      ),
                      zH.method,
                      wH,
                    );
                },
              );
            else R.delete(dH), WH(LH, zH.method, wH);
          } catch (LH) {
            if ((R.delete(dH), LH instanceof q4.ResponseError)) WH(LH, zH.method, wH);
            else if (LH && dY.string(LH.message))
              BH(
                new q4.ResponseError(
                  q4.ErrorCodes.InternalError,
                  `Request ${zH.method} failed with message: ${LH.message}`,
                ),
                zH.method,
                wH,
              );
            else
              BH(
                new q4.ResponseError(
                  q4.ErrorCodes.InternalError,
                  `Request ${zH.method} failed unexpectedly without providing any details.`,
                ),
                zH.method,
                wH,
              );
          }
        } else BH(new q4.ResponseError(q4.ErrorCodes.MethodNotFound, `Unhandled method ${zH.method}`), zH.method, wH);
      }
      function n(zH) {
        if (HH()) return;
        if (zH.id === null)
          if (zH.error)
            K.error(`Received response message without id: Error is: 
${JSON.stringify(zH.error, void 0, 4)}`);
          else K.error("Received response message without id. No further error information provided.");
        else {
          let WH = zH.id,
            BH = P.get(WH);
          if ((RH(zH, BH), BH !== void 0)) {
            P.delete(WH);
            try {
              if (zH.error) {
                let EH = zH.error;
                BH.reject(new q4.ResponseError(EH.code, EH.message, EH.data));
              } else if (zH.result !== void 0) BH.resolve(zH.result);
              else throw Error("Should never happen.");
            } catch (EH) {
              if (EH.message) K.error(`Response handler '${BH.method}' failed with message: ${EH.message}`);
              else K.error(`Response handler '${BH.method}' failed unexpectedly.`);
            }
          }
        }
      }
      function l(zH) {
        if (HH()) return;
        let WH = void 0,
          BH;
        if (zH.method === VoH.type.method) {
          let EH = zH.params.id;
          X.delete(EH), GH(zH);
          return;
        } else {
          let EH = D.get(zH.method);
          if (EH) (BH = EH.handler), (WH = EH.type);
        }
        if (BH || Y)
          try {
            if ((GH(zH), BH))
              if (zH.params === void 0) {
                if (WH !== void 0) {
                  if (WH.numberOfParams !== 0 && WH.parameterStructures !== q4.ParameterStructures.byName)
                    K.error(`Notification ${zH.method} defines ${WH.numberOfParams} params but received none.`);
                }
                BH();
              } else if (Array.isArray(zH.params)) {
                let EH = zH.params;
                if (zH.method === hoH.type.method && EH.length === 2 && jd6.is(EH[0]))
                  BH({ token: EH[0], value: EH[1] });
                else {
                  if (WH !== void 0) {
                    if (WH.parameterStructures === q4.ParameterStructures.byName)
                      K.error(
                        `Notification ${zH.method} defines parameters by name but received parameters by position`,
                      );
                    if (WH.numberOfParams !== zH.params.length)
                      K.error(
                        `Notification ${zH.method} defines ${WH.numberOfParams} params but received ${EH.length} arguments`,
                      );
                  }
                  BH(...EH);
                }
              } else {
                if (WH !== void 0 && WH.parameterStructures === q4.ParameterStructures.byPosition)
                  K.error(`Notification ${zH.method} defines parameters by position but received parameters by name`);
                BH(zH.params);
              }
            else if (Y) Y(zH.method, zH.params);
          } catch (EH) {
            if (EH.message) K.error(`Notification handler '${zH.method}' failed with message: ${EH.message}`);
            else K.error(`Notification handler '${zH.method}' failed unexpectedly.`);
          }
        else S.fire(zH);
      }
      function a(zH) {
        if (!zH) {
          K.error("Received empty message.");
          return;
        }
        K.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(zH, null, 4)}`);
        let WH = zH;
        if (dY.string(WH.id) || dY.number(WH.id)) {
          let BH = WH.id,
            EH = P.get(BH);
          if (EH) EH.reject(Error("The received response has neither a result nor an error property."));
        }
      }
      function t(zH) {
        if (zH === void 0 || zH === null) return;
        switch (W) {
          case gO.Verbose:
            return JSON.stringify(zH, null, 4);
          case gO.Compact:
            return JSON.stringify(zH);
          default:
            return;
        }
      }
      function s(zH) {
        if (W === gO.Off || !k) return;
        if (Z === xy.Text) {
          let WH = void 0;
          if ((W === gO.Verbose || W === gO.Compact) && zH.params)
            WH = `Params: ${t(zH.params)}

`;
          k.log(`Sending request '${zH.method} - (${zH.id})'.`, WH);
        } else NH("send-request", zH);
      }
      function OH(zH) {
        if (W === gO.Off || !k) return;
        if (Z === xy.Text) {
          let WH = void 0;
          if (W === gO.Verbose || W === gO.Compact)
            if (zH.params)
              WH = `Params: ${t(zH.params)}

`;
            else
              WH = `No parameters provided.

`;
          k.log(`Sending notification '${zH.method}'.`, WH);
        } else NH("send-notification", zH);
      }
      function XH(zH, WH, BH) {
        if (W === gO.Off || !k) return;
        if (Z === xy.Text) {
          let EH = void 0;
          if (W === gO.Verbose || W === gO.Compact) {
            if (zH.error && zH.error.data)
              EH = `Error data: ${t(zH.error.data)}

`;
            else if (zH.result)
              EH = `Result: ${t(zH.result)}

`;
            else if (zH.error === void 0)
              EH = `No result returned.

`;
          }
          k.log(`Sending response '${WH} - (${zH.id})'. Processing request took ${Date.now() - BH}ms`, EH);
        } else NH("send-response", zH);
      }
      function jH(zH) {
        if (W === gO.Off || !k) return;
        if (Z === xy.Text) {
          let WH = void 0;
          if ((W === gO.Verbose || W === gO.Compact) && zH.params)
            WH = `Params: ${t(zH.params)}

`;
          k.log(`Received request '${zH.method} - (${zH.id})'.`, WH);
        } else NH("receive-request", zH);
      }
      function GH(zH) {
        if (W === gO.Off || !k || zH.method === VE_.type.method) return;
        if (Z === xy.Text) {
          let WH = void 0;
          if (W === gO.Verbose || W === gO.Compact)
            if (zH.params)
              WH = `Params: ${t(zH.params)}

`;
            else
              WH = `No parameters provided.

`;
          k.log(`Received notification '${zH.method}'.`, WH);
        } else NH("receive-notification", zH);
      }
      function RH(zH, WH) {
        if (W === gO.Off || !k) return;
        if (Z === xy.Text) {
          let BH = void 0;
          if (W === gO.Verbose || W === gO.Compact) {
            if (zH.error && zH.error.data)
              BH = `Error data: ${t(zH.error.data)}

`;
            else if (zH.result)
              BH = `Result: ${t(zH.result)}

`;
            else if (zH.error === void 0)
              BH = `No result returned.

`;
          }
          if (WH) {
            let EH = zH.error ? ` Request failed: ${zH.error.message} (${zH.error.code}).` : "";
            k.log(`Received response '${WH.method} - (${zH.id})' in ${Date.now() - WH.timerStart}ms.${EH}`, BH);
          } else k.log(`Received response ${zH.id} without active response promise.`, BH);
        } else NH("receive-response", zH);
      }
      function NH(zH, WH) {
        if (!k || W === gO.Off) return;
        let BH = { isLSPMessage: !0, type: zH, message: WH, timestamp: Date.now() };
        k.log(BH);
      }
      function hH() {
        if (_H()) throw new ykH(yoH.Closed, "Connection is closed.");
        if (HH()) throw new ykH(yoH.Disposed, "Connection is disposed.");
      }
      function ZH() {
        if (i()) throw new ykH(yoH.AlreadyListening, "Connection is already listening");
      }
      function bH() {
        if (!i()) throw Error("Call listen() first.");
      }
      function nH(zH) {
        if (zH === void 0) return null;
        else return zH;
      }
      function __(zH) {
        if (zH === null) return;
        else return zH;
      }
      function SH(zH) {
        return zH !== void 0 && zH !== null && !Array.isArray(zH) && typeof zH === "object";
      }
      function VH(zH, WH) {
        switch (zH) {
          case q4.ParameterStructures.auto:
            if (SH(WH)) return __(WH);
            else return [nH(WH)];
          case q4.ParameterStructures.byName:
            if (!SH(WH)) throw Error("Received parameters by name but param is not an object literal.");
            return __(WH);
          case q4.ParameterStructures.byPosition:
            return [nH(WH)];
          default:
            throw Error(`Unknown parameter structure ${zH.toString()}`);
        }
      }
      function yH(zH, WH) {
        let BH,
          EH = zH.numberOfParams;
        switch (EH) {
          case 0:
            BH = void 0;
            break;
          case 1:
            BH = VH(zH.parameterStructures, WH[0]);
            break;
          default:
            BH = [];
            for (let mH = 0; mH < WH.length && mH < EH; mH++) BH.push(nH(WH[mH]));
            if (WH.length < EH) for (let mH = WH.length; mH < EH; mH++) BH.push(null);
            break;
        }
        return BH;
      }
      let sH = {
        sendNotification: (zH, ...WH) => {
          hH();
          let BH, EH;
          if (dY.string(zH)) {
            BH = zH;
            let FH = WH[0],
              TH = 0,
              wH = q4.ParameterStructures.auto;
            if (q4.ParameterStructures.is(FH)) (TH = 1), (wH = FH);
            let dH = WH.length,
              JH = dH - TH;
            switch (JH) {
              case 0:
                EH = void 0;
                break;
              case 1:
                EH = VH(wH, WH[TH]);
                break;
              default:
                if (wH === q4.ParameterStructures.byName)
                  throw Error(`Received ${JH} parameters for 'by Name' notification parameter structure.`);
                EH = WH.slice(TH, dH).map((LH) => nH(LH));
                break;
            }
          } else {
            let FH = WH;
            (BH = zH.method), (EH = yH(zH, FH));
          }
          let mH = { jsonrpc: A, method: BH, params: EH };
          return (
            OH(mH),
            _.write(mH).catch((FH) => {
              throw (K.error("Sending notification failed."), FH);
            })
          );
        },
        onNotification: (zH, WH) => {
          hH();
          let BH;
          if (dY.func(zH)) Y = zH;
          else if (WH)
            if (dY.string(zH)) (BH = zH), D.set(zH, { type: void 0, handler: WH });
            else (BH = zH.method), D.set(zH.method, { type: zH, handler: WH });
          return {
            dispose: () => {
              if (BH !== void 0) D.delete(BH);
              else Y = void 0;
            },
          };
        },
        onProgress: (zH, WH, BH) => {
          if (j.has(WH)) throw Error(`Progress handler for token ${WH} already registered`);
          return (
            j.set(WH, BH),
            {
              dispose: () => {
                j.delete(WH);
              },
            }
          );
        },
        sendProgress: (zH, WH, BH) => {
          return sH.sendNotification(hoH.type, { token: WH, value: BH });
        },
        onUnhandledProgress: x.event,
        sendRequest: (zH, ...WH) => {
          hH(), bH();
          let BH,
            EH,
            mH = void 0;
          if (dY.string(zH)) {
            BH = zH;
            let dH = WH[0],
              JH = WH[WH.length - 1],
              LH = 0,
              xH = q4.ParameterStructures.auto;
            if (q4.ParameterStructures.is(dH)) (LH = 1), (xH = dH);
            let tH = WH.length;
            if (Dd6.CancellationToken.is(JH)) (tH = tH - 1), (mH = JH);
            let D_ = tH - LH;
            switch (D_) {
              case 0:
                EH = void 0;
                break;
              case 1:
                EH = VH(xH, WH[LH]);
                break;
              default:
                if (xH === q4.ParameterStructures.byName)
                  throw Error(`Received ${D_} parameters for 'by Name' request parameter structure.`);
                EH = WH.slice(LH, tH).map((w_) => nH(w_));
                break;
            }
          } else {
            let dH = WH;
            (BH = zH.method), (EH = yH(zH, dH));
            let JH = zH.numberOfParams;
            mH = Dd6.CancellationToken.is(dH[JH]) ? dH[JH] : void 0;
          }
          let FH = O++,
            TH;
          if (mH)
            TH = mH.onCancellationRequested(() => {
              let dH = B.sender.sendCancellation(sH, FH);
              if (dH === void 0)
                return (
                  K.log(`Received no promise from cancellation strategy when cancelling id ${FH}`), Promise.resolve()
                );
              else
                return dH.catch(() => {
                  K.log(`Sending cancellation messages for id ${FH} failed`);
                });
            });
          let wH = { jsonrpc: A, id: FH, method: BH, params: EH };
          if ((s(wH), typeof B.sender.enableCancellation === "function")) B.sender.enableCancellation(wH);
          return new Promise(async (dH, JH) => {
            let LH = (D_) => {
                dH(D_), B.sender.cleanup(FH), TH?.dispose();
              },
              xH = (D_) => {
                JH(D_), B.sender.cleanup(FH), TH?.dispose();
              },
              tH = { method: BH, timerStart: Date.now(), resolve: LH, reject: xH };
            try {
              P.set(FH, tH), await _.write(wH);
            } catch (D_) {
              throw (
                (P.delete(FH),
                tH.reject(
                  new q4.ResponseError(q4.ErrorCodes.MessageWriteError, D_.message ? D_.message : "Unknown reason"),
                ),
                K.error("Sending request failed."),
                D_)
              );
            }
          });
        },
        onRequest: (zH, WH) => {
          hH();
          let BH = null;
          if (Md6.is(zH)) (BH = void 0), (f = zH);
          else if (dY.string(zH)) {
            if (((BH = null), WH !== void 0)) (BH = zH), w.set(zH, { handler: WH, type: void 0 });
          } else if (WH !== void 0) (BH = zH.method), w.set(zH.method, { type: zH, handler: WH });
          return {
            dispose: () => {
              if (BH === null) return;
              if (BH !== void 0) w.delete(BH);
              else f = void 0;
            },
          };
        },
        hasPendingResponse: () => {
          return P.size > 0;
        },
        trace: async (zH, WH, BH) => {
          let EH = !1,
            mH = xy.Text;
          if (BH !== void 0)
            if (dY.boolean(BH)) EH = BH;
            else (EH = BH.sendNotification || !1), (mH = BH.traceFormat || xy.Text);
          if (((W = zH), (Z = mH), W === gO.Off)) k = void 0;
          else k = WH;
          if (EH && !_H() && !HH()) await sH.sendNotification(Jd6.type, { value: gO.toString(zH) });
        },
        onError: y.event,
        onClose: E.event,
        onUnhandledNotification: S.event,
        onDispose: I.event,
        end: () => {
          _.end();
        },
        dispose: () => {
          if (HH()) return;
          (v = mx.Disposed), I.fire(void 0);
          let zH = new q4.ResponseError(
            q4.ErrorCodes.PendingResponseRejected,
            "Pending response rejected since connection got disposed",
          );
          for (let WH of P.values()) WH.reject(zH);
          if (((P = new Map()), (R = new Map()), (X = new Set()), (J = new Ny7.LinkedMap()), dY.func(_.dispose)))
            _.dispose();
          if (dY.func(H.dispose)) H.dispose();
        },
        listen: () => {
          hH(), ZH(), (v = mx.Listening), H.listen(vH);
        },
        inspect: () => {
          (0, vy7.default)().console.log("inspect");
        },
      };
      return (
        sH.onNotification(VE_.type, (zH) => {
          if (W === gO.Off || !k) return;
          let WH = W === gO.Verbose || W === gO.Compact;
          k.log(zH.message, WH ? zH.verbose : void 0);
        }),
        sH.onNotification(hoH.type, (zH) => {
          let WH = j.get(zH.token);
          if (WH) WH(zH.value);
          else x.fire(zH);
        }),
        sH
      );
    }
    y1.createMessageConnection = rD1;
  });

  var Fa6 = d((jzT, s_9) => {
    var sfH = TyH(),
      Fd1 = ca6(),
      Ud1 = rD();
    s_9.exports = a_9;
    function a_9() {}
    a_9.prototype = {
      addEventListener: function (_, q, $) {
        if (!q) return;
        if ($ === void 0) $ = !1;
        if (!this._listeners) this._listeners = Object.create(null);
        if (!this._listeners[_]) this._listeners[_] = [];
        var K = this._listeners[_];
        for (var O = 0, T = K.length; O < T; O++) {
          var z = K[O];
          if (z.listener === q && z.capture === $) return;
        }
        var A = { listener: q, capture: $ };
        if (typeof q === "function") A.f = q;
        K.push(A);
      },
      removeEventListener: function (_, q, $) {
        if ($ === void 0) $ = !1;
        if (this._listeners) {
          var K = this._listeners[_];
          if (K)
            for (var O = 0, T = K.length; O < T; O++) {
              var z = K[O];
              if (z.listener === q && z.capture === $) {
                if (K.length === 1) this._listeners[_] = void 0;
                else K.splice(O, 1);
                return;
              }
            }
        }
      },
      dispatchEvent: function (_) {
        return this._dispatchEvent(_, !1);
      },
      _dispatchEvent: function (_, q) {
        if (typeof q !== "boolean") q = !1;
        function $(f, w) {
          var { type: Y, eventPhase: D } = w;
          if (((w.currentTarget = f), D !== sfH.CAPTURING_PHASE && f._handlers && f._handlers[Y])) {
            var j = f._handlers[Y],
              M;
            if (typeof j === "function") M = j.call(w.currentTarget, w);
            else {
              var J = j.handleEvent;
              if (typeof J !== "function")
                throw TypeError("handleEvent property of event handler object isnot a function.");
              M = J.call(j, w);
            }
            switch (w.type) {
              case "mouseover":
                if (M === !0) w.preventDefault();
                break;
              case "beforeunload":
              default:
                if (M === !1) w.preventDefault();
                break;
            }
          }
          var P = f._listeners && f._listeners[Y];
          if (!P) return;
          P = P.slice();
          for (var X = 0, R = P.length; X < R; X++) {
            if (w._immediatePropagationStopped) return;
            var W = P[X];
            if ((D === sfH.CAPTURING_PHASE && !W.capture) || (D === sfH.BUBBLING_PHASE && W.capture)) continue;
            if (W.f) W.f.call(w.currentTarget, w);
            else {
              var Z = W.listener.handleEvent;
              if (typeof Z !== "function")
                throw TypeError("handleEvent property of event listener object is not a function.");
              Z.call(W.listener, w);
            }
          }
        }
        if (!_._initialized || _._dispatching) Ud1.InvalidStateError();
        (_.isTrusted = q), (_._dispatching = !0), (_.target = this);
        var K = [];
        for (var O = this.parentNode; O; O = O.parentNode) K.push(O);
        _.eventPhase = sfH.CAPTURING_PHASE;
        for (var T = K.length - 1; T >= 0; T--) if (($(K[T], _), _._propagationStopped)) break;
        if (!_._propagationStopped) (_.eventPhase = sfH.AT_TARGET), $(this, _);
        if (_.bubbles && !_._propagationStopped) {
          _.eventPhase = sfH.BUBBLING_PHASE;
          for (var z = 0, A = K.length; z < A; z++) if (($(K[z], _), _._propagationStopped)) break;
        }
        if (
          ((_._dispatching = !1),
          (_.eventPhase = sfH.AT_TARGET),
          (_.currentTarget = null),
          q && !_.defaultPrevented && _ instanceof Fd1)
        )
          switch (_.type) {
            case "mousedown":
              this._armed = { x: _.clientX, y: _.clientY, t: _.timeStamp };
              break;
            case "mouseout":
            case "mouseover":
              this._armed = null;
              break;
            case "mouseup":
              if (this._isClick(_)) this._doClick(_);
              this._armed = null;
              break;
          }
        return !_.defaultPrevented;
      },
      _isClick: function (H) {
        return (
          this._armed !== null &&
          H.type === "mouseup" &&
          H.isTrusted &&
          H.button === 0 &&
          H.timeStamp - this._armed.t < 1000 &&
          Math.abs(H.clientX - this._armed.x) < 10 &&
          Math.abs(H.clientY - this._armed.Y) < 10
        );
      },
      _doClick: function (H) {
        if (this._click_in_progress) return;
        this._click_in_progress = !0;
        var _ = this;
        while (_ && !_._post_click_activation_steps) _ = _.parentNode;
        if (_ && _._pre_click_activation_steps) _._pre_click_activation_steps();
        var q = this.ownerDocument.createEvent("MouseEvent");
        q.initMouseEvent(
          "click",
          !0,
          !0,
          this.ownerDocument.defaultView,
          1,
          H.screenX,
          H.screenY,
          H.clientX,
          H.clientY,
          H.ctrlKey,
          H.altKey,
          H.shiftKey,
          H.metaKey,
          H.button,
          null,
        );
        var $ = this._dispatchEvent(q, !0);
        if (_) {
          if ($) {
            if (_._post_click_activation_steps) _._post_click_activation_steps(q);
          } else if (_._cancelled_activation_steps) _._cancelled_activation_steps();
        }
      },
      _setEventHandler: function (_, q) {
        if (!this._handlers) this._handlers = Object.create(null);
        this._handlers[_] = q;
      },
      _getEventHandler: function (_) {
        return (this._handlers && this._handlers[_]) || null;
      },
    };
  });

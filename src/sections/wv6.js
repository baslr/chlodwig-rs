    KUH = class KUH extends oh {
      type;
      timeStamp;
      bubbles;
      cancelable;
      _target = null;
      _currentTarget = null;
      _eventPhase = "none";
      _propagationStopped = !1;
      _defaultPrevented = !1;
      constructor(H, _) {
        super();
        (this.type = H),
          (this.timeStamp = performance.now()),
          (this.bubbles = _?.bubbles ?? !0),
          (this.cancelable = _?.cancelable ?? !0);
      }
      get target() {
        return this._target;
      }
      get currentTarget() {
        return this._currentTarget;
      }
      get eventPhase() {
        return this._eventPhase;
      }
      get defaultPrevented() {
        return this._defaultPrevented;
      }
      stopPropagation() {
        this._propagationStopped = !0;
      }
      stopImmediatePropagation() {
        super.stopImmediatePropagation(), (this._propagationStopped = !0);
      }
      preventDefault() {
        if (this.cancelable) this._defaultPrevented = !0;
      }
      _setTarget(H) {
        this._target = H;
      }
      _setCurrentTarget(H) {
        this._currentTarget = H;
      }
      _setEventPhase(H) {
        this._eventPhase = H;
      }
      _isPropagationStopped() {
        return this._propagationStopped;
      }
      _isImmediatePropagationStopped() {
        return this.didStopImmediatePropagation();
      }
      _prepareForTarget(H) {}
    };

    k_();
    H_();
    dFH();
    g_();
    Ek();
    N_();
    y0_();
    bk6();
    Ik6();
    Ck6();
    AUH();
    hG_();
    l_H();
    nG_();
    GQq();
    YE();
    o3H();
    wN6();
    oG_();
    jN6();
    iQq();
    bFH();
    DN6();
    sG_();
    Sg = u(PH(), 1);
    tG_ = class tG_ extends Sg.PureComponent {
      static displayName = "InternalApp";
      static getDerivedStateFromError(H) {
        return { error: H };
      }
      state = { error: void 0 };
      rawModeEnabledCount = 0;
      internal_eventEmitter = new b3H();
      keyParseState = Rdq;
      incompleteEscapeTimer = null;
      NORMAL_TIMEOUT = 50;
      PASTE_TIMEOUT = 500;
      querier = new fN6(this.props.stdout);
      lastClickTime = 0;
      lastClickCol = -1;
      lastClickRow = -1;
      clickCount = 0;
      pendingHyperlinkTimer = null;
      lastHoverCol = -1;
      lastHoverRow = -1;
      lastStdinTime = Date.now();
      isRawModeSupported() {
        return this.props.stdin.isTTY;
      }
      render() {
        return Sg.default.createElement(
          i0H.Provider,
          { value: { columns: this.props.terminalColumns, rows: this.props.terminalRows } },
          Sg.default.createElement(
            rG_.Provider,
            { value: { exit: this.handleExit } },
            Sg.default.createElement(
              S_H.Provider,
              {
                value: {
                  stdin: this.props.stdin,
                  setRawMode: this.handleSetRawMode,
                  isRawModeSupported: this.isRawModeSupported(),
                  internal_exitOnCtrlC: this.props.exitOnCtrlC,
                  internal_eventEmitter: this.internal_eventEmitter,
                  internal_querier: this.querier,
                },
              },
              Sg.default.createElement(
                kQq,
                null,
                Sg.default.createElement(
                  yQq,
                  null,
                  Sg.default.createElement(
                    aG_.Provider,
                    { value: this.props.onCursorDeclaration ?? (() => {}) },
                    this.state.error ? Sg.default.createElement(PN6, { error: this.state.error }) : this.props.children,
                  ),
                ),
              ),
            ),
          ),
        );
      }
      componentDidMount() {
        if (this.props.stdout.isTTY && !lH(process.env.CLAUDE_CODE_ACCESSIBILITY)) this.props.stdout.write(NUH);
      }
      componentWillUnmount() {
        if (this.props.stdout.isTTY) this.props.stdout.write(du);
        if (this.incompleteEscapeTimer) clearTimeout(this.incompleteEscapeTimer), (this.incompleteEscapeTimer = null);
        if (this.pendingHyperlinkTimer) clearTimeout(this.pendingHyperlinkTimer), (this.pendingHyperlinkTimer = null);
        if (this.isRawModeSupported()) this.handleSetRawMode(!1);
      }
      componentDidCatch(H) {
        this.handleExit(H);
      }
      handleSetRawMode = (H) => {
        let { stdin: _ } = this.props;
        if (!this.isRawModeSupported())
          if (_ === process.stdin)
            throw Error(`Raw mode is not supported on the current process.stdin, which Ink uses as input stream by default.
Read about how to prevent this error on https://github.com/vadimdemedes/ink/#israwmodesupported`);
          else
            throw Error(`Raw mode is not supported on the stdin provided to Ink.
Read about how to prevent this error on https://github.com/vadimdemedes/ink/#israwmodesupported`);
        if ((_.setEncoding("utf8"), H)) {
          if (this.rawModeEnabledCount === 0) {
            if (
              (x_H(),
              _.ref(),
              _.setRawMode(!0),
              _.addListener("readable", this.handleReadable),
              this.props.stdout.write(TQq),
              this.props.stdout.write(ev6),
              yUH())
            )
              this.props.stdout.write(cFH), this.props.stdout.write(FFH);
            setImmediate(() => {
              Promise.all([this.querier.send(WQq()), this.querier.flush()]).then(([q]) => {
                if (q) jQq(q.name), N(`XTVERSION: terminal identified as "${q.name}"`);
                else N("XTVERSION: no reply (terminal ignored query)");
              });
            });
          }
          this.rawModeEnabledCount++;
          return;
        }
        if (--this.rawModeEnabledCount === 0)
          this.props.stdout.write(p3H),
            this.props.stdout.write(bi),
            this.props.stdout.write(n3H),
            this.props.stdout.write(Q0H),
            _.setRawMode(!1),
            _.removeListener("readable", this.handleReadable),
            _.unref();
      };
      flushIncomplete = () => {
        if (((this.incompleteEscapeTimer = null), !this.keyParseState.incomplete)) return;
        this.processInput(null);
      };
      processInput = (H) => {
        let [_, q] = Zdq(this.keyParseState, H);
        if (((this.keyParseState = q), _.length > 0)) yg.discreteUpdates(qh4, this, _, void 0, void 0);
        if (this.keyParseState.incomplete) {
          if (this.incompleteEscapeTimer) clearTimeout(this.incompleteEscapeTimer);
          this.incompleteEscapeTimer = setTimeout(
            this.flushIncomplete,
            this.keyParseState.mode === "IN_PASTE" ? this.PASTE_TIMEOUT : this.NORMAL_TIMEOUT,
          );
        }
      };
      handleReadable = () => {
        let H = Date.now();
        if (H - this.lastStdinTime > _h4) this.props.onStdinResume?.();
        this.lastStdinTime = H;
        try {
          let _;
          while ((_ = this.props.stdin.read()) !== null) this.processInput(_);
        } catch (_) {
          AH(_);
          let { stdin: q } = this.props;
          if (this.rawModeEnabledCount > 0 && !q.listeners("readable").includes(this.handleReadable))
            N("handleReadable: re-attaching stdin readable listener after error recovery", { level: "warn" }),
              q.addListener("readable", this.handleReadable);
        }
      };
      handleInput = (H) => {
        if (H === "\x03" && this.props.exitOnCtrlC) this.handleExit();
      };
      handleExit = (H) => {
        if (this.isRawModeSupported()) this.handleSetRawMode(!1);
        this.props.onExit(H);
      };
      handleTerminalFocus = (H) => {
        zN6(H);
      };
      handleSuspend = () => {
        if (!this.isRawModeSupported()) return;
        let H = this.rawModeEnabledCount;
        while (this.rawModeEnabledCount > 0) this.handleSetRawMode(!1);
        if (this.props.stdout.isTTY) this.props.stdout.write(du + n3H + r3H);
        this.internal_eventEmitter.emit("suspend");
        let _ = () => {
          for (let q = 0; q < H; q++) if (this.isRawModeSupported()) this.handleSetRawMode(!0);
          if (this.props.stdout.isTTY) {
            if (!lH(process.env.CLAUDE_CODE_ACCESSIBILITY)) this.props.stdout.write(NUH);
            this.props.stdout.write(ev6);
          }
          this.internal_eventEmitter.emit("resume"), process.removeListener("SIGCONT", _);
        };
        process.on("SIGCONT", _), process.kill(process.pid, "SIGSTOP");
      };
    };

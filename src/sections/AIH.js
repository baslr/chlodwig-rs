    T28();
    (VH6 = Symbol.for("signal-exit emitter")), (SH6 = globalThis), (vK$ = Object.defineProperty.bind(Object));
    A28 = class A28 extends CH6 {
      onExit() {
        return () => {};
      }
      load() {}
      unload() {}
    };
    f28 = class f28 extends CH6 {
      #$ = EH6.platform === "win32" ? "SIGINT" : "SIGHUP";
      #q = new z28();
      #H;
      #f;
      #T;
      #z = {};
      #K = !1;
      constructor(H) {
        super();
        (this.#H = H), (this.#z = {});
        for (let _ of $jH)
          this.#z[_] = () => {
            let q = this.#H.listeners(_),
              { count: $ } = this.#q,
              K = H;
            if (typeof K.__signal_exit_emitter__ === "object" && typeof K.__signal_exit_emitter__.count === "number")
              $ += K.__signal_exit_emitter__.count;
            if (q.length === $) {
              this.unload();
              let O = this.#q.emit("exit", null, _),
                T = _ === "SIGHUP" ? this.#$ : _;
              if (!O) H.kill(H.pid, T);
            }
          };
        (this.#T = H.reallyExit), (this.#f = H.emit);
      }
      onExit(H, _) {
        if (!m4_(this.#H)) return () => {};
        if (this.#K === !1) this.load();
        let q = _?.alwaysLast ? "afterExit" : "exit";
        return (
          this.#q.on(q, H),
          () => {
            if (
              (this.#q.removeListener(q, H),
              this.#q.listeners.exit.length === 0 && this.#q.listeners.afterExit.length === 0)
            )
              this.unload();
          }
        );
      }
      load() {
        if (this.#K) return;
        (this.#K = !0), (this.#q.count += 1);
        for (let H of $jH)
          try {
            let _ = this.#z[H];
            if (_) this.#H.on(H, _);
          } catch (_) {}
        (this.#H.emit = (H, ..._) => {
          return this.#A(H, ..._);
        }),
          (this.#H.reallyExit = (H) => {
            return this.#w(H);
          });
      }
      unload() {
        if (!this.#K) return;
        (this.#K = !1),
          $jH.forEach((H) => {
            let _ = this.#z[H];
            if (!_) throw Error("Listener not defined for signal: " + H);
            try {
              this.#H.removeListener(H, _);
            } catch (q) {}
          }),
          (this.#H.emit = this.#f),
          (this.#H.reallyExit = this.#T),
          (this.#q.count -= 1);
      }
      #w(H) {
        if (!m4_(this.#H)) return 0;
        return (
          (this.#H.exitCode = H || 0),
          this.#q.emit("exit", this.#H.exitCode, null),
          this.#T.call(this.#H, this.#H.exitCode)
        );
      }
      #A(H, ..._) {
        let q = this.#f;
        if (H === "exit" && m4_(this.#H)) {
          if (typeof _[0] === "number") this.#H.exitCode = _[0];
          let $ = q.call(this.#H, H, ..._);
          return this.#q.emit("exit", this.#H.exitCode, null), $;
        } else return q.call(this.#H, H, ..._);
      }
    };
    (EH6 = globalThis.process), ({ onExit: zt, load: cdK, unload: FdK } = NK$(m4_(EH6) ? new f28(EH6) : new A28()));

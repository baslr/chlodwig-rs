    Ynq();
    Xnq();
    (knq = require("fs")),
      (vR_ = require("fs/promises")),
      (vnq = require("events")),
      ($5 = u(require("path"))); /*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) */
    (DV4 = /\\/g), (Wnq = /\/\//), (jV4 = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/), (MV4 = /^\.[/\\]/);
    GV4 = Object.freeze(new Set());
    NR_ = class NR_ extends vnq.EventEmitter {
      constructor(H = {}) {
        super();
        (this.closed = !1),
          (this._closers = new Map()),
          (this._ignoredPaths = new Set()),
          (this._throttled = new Map()),
          (this._streams = new Set()),
          (this._symlinkPaths = new Map()),
          (this._watched = new Map()),
          (this._pendingWrites = new Map()),
          (this._pendingUnlinks = new Map()),
          (this._readyCount = 0),
          (this._readyEmitted = !1);
        let _ = H.awaitWriteFinish,
          q = { stabilityThreshold: 2000, pollInterval: 100 },
          $ = {
            persistent: !0,
            ignoreInitial: !1,
            ignorePermissionErrors: !1,
            interval: 100,
            binaryInterval: 300,
            followSymlinks: !0,
            usePolling: !1,
            atomic: !0,
            ...H,
            ignored: H.ignored ? kR_(H.ignored) : kR_([]),
            awaitWriteFinish: _ === !0 ? q : typeof _ === "object" ? { ...q, ..._ } : !1,
          };
        if (Jnq) $.usePolling = !0;
        if ($.atomic === void 0) $.atomic = !$.usePolling;
        let K = process.env.CHOKIDAR_USEPOLLING;
        if (K !== void 0) {
          let z = K.toLowerCase();
          if (z === "false" || z === "0") $.usePolling = !1;
          else if (z === "true" || z === "1") $.usePolling = !0;
          else $.usePolling = !!z;
        }
        let O = process.env.CHOKIDAR_INTERVAL;
        if (O) $.interval = Number.parseInt(O, 10);
        let T = 0;
        (this._emitReady = () => {
          if ((T++, T >= this._readyCount))
            (this._emitReady = ZR_), (this._readyEmitted = !0), process.nextTick(() => this.emit(Ef.READY));
        }),
          (this._emitRaw = (...z) => this.emit(Ef.RAW, ...z)),
          (this._boundRemove = this._remove.bind(this)),
          (this.options = $),
          (this._nodeFsHandler = new Ah6(this)),
          Object.freeze($);
      }
      _addIgnoredPath(H) {
        if (wh6(H)) {
          for (let _ of this._ignoredPaths) if (wh6(_) && _.path === H.path && _.recursive === H.recursive) return;
        }
        this._ignoredPaths.add(H);
      }
      _removeIgnoredPath(H) {
        if ((this._ignoredPaths.delete(H), typeof H === "string")) {
          for (let _ of this._ignoredPaths) if (wh6(_) && _.path === H) this._ignoredPaths.delete(_);
        }
      }
      add(H, _, q) {
        let { cwd: $ } = this.options;
        (this.closed = !1), (this._closePromise = void 0);
        let K = Rnq(H);
        if ($)
          K = K.map((O) => {
            return WV4(O, $);
          });
        if (
          (K.forEach((O) => {
            this._removeIgnoredPath(O);
          }),
          (this._userIgnored = void 0),
          !this._readyCount)
        )
          this._readyCount = 0;
        return (
          (this._readyCount += K.length),
          Promise.all(
            K.map(async (O) => {
              let T = await this._nodeFsHandler._addToNodeFs(O, !q, void 0, 0, _);
              if (T) this._emitReady();
              return T;
            }),
          ).then((O) => {
            if (this.closed) return;
            O.forEach((T) => {
              if (T) this.add($5.dirname(T), $5.basename(_ || T));
            });
          }),
          this
        );
      }
      unwatch(H) {
        if (this.closed) return this;
        let _ = Rnq(H),
          { cwd: q } = this.options;
        return (
          _.forEach(($) => {
            if (!$5.isAbsolute($) && !this._closers.has($)) {
              if (q) $ = $5.join(q, $);
              $ = $5.resolve($);
            }
            if ((this._closePath($), this._addIgnoredPath($), this._watched.has($)))
              this._addIgnoredPath({ path: $, recursive: !0 });
            this._userIgnored = void 0;
          }),
          this
        );
      }
      close() {
        if (this._closePromise) return this._closePromise;
        (this.closed = !0), this.removeAllListeners();
        let H = [];
        return (
          this._closers.forEach((_) =>
            _.forEach((q) => {
              let $ = q();
              if ($ instanceof Promise) H.push($);
            }),
          ),
          this._streams.forEach((_) => _.destroy()),
          (this._userIgnored = void 0),
          (this._readyCount = 0),
          (this._readyEmitted = !1),
          this._watched.forEach((_) => _.dispose()),
          this._closers.clear(),
          this._watched.clear(),
          this._streams.clear(),
          this._symlinkPaths.clear(),
          this._throttled.clear(),
          (this._closePromise = H.length
            ? Promise.all(H).then(() => {
                return;
              })
            : Promise.resolve()),
          this._closePromise
        );
      }
      getWatched() {
        let H = {};
        return (
          this._watched.forEach((_, q) => {
            let K = (this.options.cwd ? $5.relative(this.options.cwd, q) : q) || Nnq;
            H[K] = _.getChildren().sort();
          }),
          H
        );
      }
      emitWithAll(H, _) {
        if ((this.emit(H, ..._), H !== Ef.ERROR)) this.emit(Ef.ALL, H, ..._);
      }
      async _emit(H, _, q) {
        if (this.closed) return;
        let $ = this.options;
        if (zh6) _ = $5.normalize(_);
        if ($.cwd) _ = $5.relative($.cwd, _);
        let K = [_];
        if (q != null) K.push(q);
        let O = $.awaitWriteFinish,
          T;
        if (O && (T = this._pendingWrites.get(_))) return (T.lastChange = new Date()), this;
        if ($.atomic) {
          if (H === Ef.UNLINK)
            return (
              this._pendingUnlinks.set(_, [H, ...K]),
              setTimeout(
                () => {
                  this._pendingUnlinks.forEach((z, A) => {
                    this.emit(...z), this.emit(Ef.ALL, ...z), this._pendingUnlinks.delete(A);
                  });
                },
                typeof $.atomic === "number" ? $.atomic : 100,
              ),
              this
            );
          if (H === Ef.ADD && this._pendingUnlinks.has(_)) (H = Ef.CHANGE), this._pendingUnlinks.delete(_);
        }
        if (O && (H === Ef.ADD || H === Ef.CHANGE) && this._readyEmitted) {
          let z = (A, f) => {
            if (A) (H = Ef.ERROR), (K[0] = A), this.emitWithAll(H, K);
            else if (f) {
              if (K.length > 1) K[1] = f;
              else K.push(f);
              this.emitWithAll(H, K);
            }
          };
          return this._awaitWriteFinish(_, O.stabilityThreshold, H, z), this;
        }
        if (H === Ef.CHANGE) {
          if (!this._throttle(Ef.CHANGE, _, 50)) return this;
        }
        if ($.alwaysStat && q === void 0 && (H === Ef.ADD || H === Ef.ADD_DIR || H === Ef.CHANGE)) {
          let z = $.cwd ? $5.join($.cwd, _) : _,
            A;
          try {
            A = await vR_.stat(z);
          } catch (f) {}
          if (!A || this.closed) return;
          K.push(A);
        }
        return this.emitWithAll(H, K), this;
      }
      _handleError(H) {
        let _ = H && H.code;
        if (
          H &&
          _ !== "ENOENT" &&
          _ !== "ENOTDIR" &&
          (!this.options.ignorePermissionErrors || (_ !== "EPERM" && _ !== "EACCES"))
        )
          this.emit(Ef.ERROR, H);
        return H || this.closed;
      }
      _throttle(H, _, q) {
        if (!this._throttled.has(H)) this._throttled.set(H, new Map());
        let $ = this._throttled.get(H);
        if (!$) throw Error("invalid throttle");
        let K = $.get(_);
        if (K) return K.count++, !1;
        let O,
          T = () => {
            let A = $.get(_),
              f = A ? A.count : 0;
            if (($.delete(_), clearTimeout(O), A)) clearTimeout(A.timeoutObject);
            return f;
          };
        O = setTimeout(T, q);
        let z = { timeoutObject: O, clear: T, count: 0 };
        return $.set(_, z), z;
      }
      _incrReadyCount() {
        return this._readyCount++;
      }
      _awaitWriteFinish(H, _, q, $) {
        let K = this.options.awaitWriteFinish;
        if (typeof K !== "object") return;
        let O = K.pollInterval,
          T,
          z = H;
        if (this.options.cwd && !$5.isAbsolute(H)) z = $5.join(this.options.cwd, H);
        let A = new Date(),
          f = this._pendingWrites;
        function w(Y) {
          knq.stat(z, (D, j) => {
            if (D || !f.has(H)) {
              if (D && D.code !== "ENOENT") $(D);
              return;
            }
            let M = Number(new Date());
            if (Y && j.size !== Y.size) f.get(H).lastChange = M;
            let J = f.get(H);
            if (M - J.lastChange >= _) f.delete(H), $(void 0, j);
            else T = setTimeout(w, O, j);
          });
        }
        if (!f.has(H))
          f.set(H, {
            lastChange: A,
            cancelWait: () => {
              return f.delete(H), clearTimeout(T), q;
            },
          }),
            (T = setTimeout(w, O));
      }
      _isIgnored(H, _) {
        if (this.options.atomic && jV4.test(H)) return !0;
        if (!this._userIgnored) {
          let { cwd: q } = this.options,
            K = (this.options.ignored || []).map(Lnq(q)),
            T = [...[...this._ignoredPaths].map(Lnq(q)), ...K];
          this._userIgnored = XV4(T, void 0);
        }
        return this._userIgnored(H, _);
      }
      _isntIgnored(H, _) {
        return !this._isIgnored(H, _);
      }
      _getWatchHelpers(H) {
        return new Yh6(H, this.options.followSymlinks, this);
      }
      _getWatchedDir(H) {
        let _ = $5.resolve(H);
        if (!this._watched.has(_)) this._watched.set(_, new ynq(_, this._boundRemove));
        return this._watched.get(_);
      }
      _hasReadPermissions(H) {
        if (this.options.ignorePermissionErrors) return !0;
        return Boolean(Number(H.mode) & 256);
      }
      _remove(H, _, q) {
        let $ = $5.join(H, _),
          K = $5.resolve($);
        if (((q = q != null ? q : this._watched.has($) || this._watched.has(K)), !this._throttle("remove", $, 100)))
          return;
        if (!q && this._watched.size === 1) this.add(H, _, !0);
        this._getWatchedDir($)
          .getChildren()
          .forEach((Y) => this._remove($, Y));
        let z = this._getWatchedDir(H),
          A = z.has(_);
        if ((z.remove(_), this._symlinkPaths.has(K))) this._symlinkPaths.delete(K);
        let f = $;
        if (this.options.cwd) f = $5.relative(this.options.cwd, $);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(f)) {
          if (this._pendingWrites.get(f).cancelWait() === Ef.ADD) return;
        }
        this._watched.delete($), this._watched.delete(K);
        let w = q ? Ef.UNLINK_DIR : Ef.UNLINK;
        if (A && !this._isIgnored($)) this._emit(w, $);
        this._closePath($);
      }
      _closePath(H) {
        this._closeFile(H);
        let _ = $5.dirname(H);
        this._getWatchedDir(_).remove($5.basename(H));
      }
      _closeFile(H) {
        let _ = this._closers.get(H);
        if (!_) return;
        _.forEach((q) => q()), this._closers.delete(H);
      }
      _addPathCloser(H, _) {
        if (!_) return;
        let q = this._closers.get(H);
        if (!q) (q = []), this._closers.set(H, q);
        q.push(_);
      }
      _readdirp(H, _) {
        if (this.closed) return;
        let q = { type: Ef.ALL, alwaysStat: !0, lstat: !0, ..._, depth: 0 },
          $ = wnq(H, q);
        return (
          this._streams.add($),
          $.once(Mnq, () => {
            $ = void 0;
          }),
          $.once(Th6, () => {
            if ($) this._streams.delete($), ($ = void 0);
          }),
          $
        );
      }
    };
    ii = { watch: Vnq, FSWatcher: NR_ };

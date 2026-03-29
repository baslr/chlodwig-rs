    (Qi = require("fs/promises")),
      (znq = require("stream")),
      (li = require("path")),
      (Ky = {
        FILE_TYPE: "files",
        DIR_TYPE: "directories",
        FILE_DIR_TYPE: "files_directories",
        EVERYTHING_TYPE: "all",
      }),
      ($h6 = {
        root: ".",
        fileFilter: (H) => !0,
        directoryFilter: (H) => !0,
        type: Ky.FILE_TYPE,
        lstat: !1,
        depth: 2147483648,
        alwaysStat: !1,
        highWaterMark: 4096,
      });
    Object.freeze($h6);
    (iy4 = new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", Anq])),
      (Knq = [Ky.DIR_TYPE, Ky.EVERYTHING_TYPE, Ky.FILE_DIR_TYPE, Ky.FILE_TYPE]),
      (ny4 = new Set([Ky.DIR_TYPE, Ky.EVERYTHING_TYPE, Ky.FILE_DIR_TYPE])),
      (ry4 = new Set([Ky.EVERYTHING_TYPE, Ky.FILE_DIR_TYPE, Ky.FILE_TYPE]));
    fnq = class fnq extends znq.Readable {
      constructor(H = {}) {
        super({ objectMode: !0, autoDestroy: !0, highWaterMark: H.highWaterMark });
        let _ = { ...$h6, ...H },
          { root: q, type: $ } = _;
        (this._fileFilter = Tnq(_.fileFilter)), (this._directoryFilter = Tnq(_.directoryFilter));
        let K = _.lstat ? Qi.lstat : Qi.stat;
        if (ay4) this._stat = (O) => K(O, { bigint: !0 });
        else this._stat = K;
        (this._maxDepth = _.depth ?? $h6.depth),
          (this._wantsDir = $ ? ny4.has($) : !1),
          (this._wantsFile = $ ? ry4.has($) : !1),
          (this._wantsEverything = $ === Ky.EVERYTHING_TYPE),
          (this._root = li.resolve(q)),
          (this._isDirent = !_.alwaysStat),
          (this._statsProp = this._isDirent ? "dirent" : "stats"),
          (this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent }),
          (this.parents = [this._exploreDir(q, 1)]),
          (this.reading = !1),
          (this.parent = void 0);
      }
      async _read(H) {
        if (this.reading) return;
        this.reading = !0;
        try {
          while (!this.destroyed && H > 0) {
            let _ = this.parent,
              q = _ && _.files;
            if (q && q.length > 0) {
              let { path: $, depth: K } = _,
                O = q.splice(0, H).map((z) => this._formatEntry(z, $)),
                T = await Promise.all(O);
              for (let z of T) {
                if (!z) continue;
                if (this.destroyed) return;
                let A = await this._getEntryType(z);
                if (A === "directory" && this._directoryFilter(z)) {
                  if (K <= this._maxDepth) this.parents.push(this._exploreDir(z.fullPath, K + 1));
                  if (this._wantsDir) this.push(z), H--;
                } else if ((A === "file" || this._includeAsFile(z)) && this._fileFilter(z)) {
                  if (this._wantsFile) this.push(z), H--;
                }
              }
            } else {
              let $ = this.parents.pop();
              if (!$) {
                this.push(null);
                break;
              }
              if (((this.parent = await $), this.destroyed)) return;
            }
          }
        } catch (_) {
          this.destroy(_);
        } finally {
          this.reading = !1;
        }
      }
      async _exploreDir(H, _) {
        let q;
        try {
          q = await Qi.readdir(H, this._rdOptions);
        } catch ($) {
          this._onError($);
        }
        return { files: q, depth: _, path: H };
      }
      async _formatEntry(H, _) {
        let q,
          $ = this._isDirent ? H.name : H;
        try {
          let K = li.resolve(li.join(_, $));
          (q = { path: li.relative(this._root, K), fullPath: K, basename: $ }),
            (q[this._statsProp] = this._isDirent ? H : await this._stat(K));
        } catch (K) {
          this._onError(K);
          return;
        }
        return q;
      }
      _onError(H) {
        if (oy4(H) && !this.destroyed) this.emit("warn", H);
        else this.destroy(H);
      }
      async _getEntryType(H) {
        if (!H && this._statsProp in H) return "";
        let _ = H[this._statsProp];
        if (_.isFile()) return "file";
        if (_.isDirectory()) return "directory";
        if (_ && _.isSymbolicLink()) {
          let q = H.fullPath;
          try {
            let $ = await Qi.realpath(q),
              K = await Qi.lstat($);
            if (K.isFile()) return "file";
            if (K.isDirectory()) {
              let O = $.length;
              if (q.startsWith($) && q.substr(O, 1) === li.sep) {
                let T = Error(`Circular symlink detected: "${q}" points to "${$}"`);
                return (T.code = Anq), this._onError(T);
              }
              return "directory";
            }
          } catch ($) {
            return this._onError($), "";
          }
        }
      }
      _includeAsFile(H) {
        let _ = H && H[this._statsProp];
        return _ && this._wantsEverything && !_.isDirectory();
      }
    };

    h_();
    F_();
    (U4 = u(require("fs"))), (TD = require("fs/promises")), (ne_ = require("os")), (vJ = u(require("path")));
    (k6$ = {
      cwd() {
        return process.cwd();
      },
      existsSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.existsSync(${H})`, 0);
          return U4.existsSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      async stat(H) {
        return TD.stat(H);
      },
      async readdir(H) {
        return TD.readdir(H, { withFileTypes: !0 });
      },
      async unlink(H) {
        return TD.unlink(H);
      },
      async rmdir(H) {
        return TD.rmdir(H);
      },
      async rm(H, _) {
        return TD.rm(H, _);
      },
      async mkdir(H, _) {
        try {
          await TD.mkdir(H, { recursive: !0, ..._ });
        } catch (q) {
          if (e6(q) !== "EEXIST") throw q;
        }
      },
      async readFile(H, _) {
        return TD.readFile(H, { encoding: _.encoding });
      },
      async rename(H, _) {
        return TD.rename(H, _);
      },
      statSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.statSync(${H})`, 0);
          return U4.statSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      lstatSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.lstatSync(${H})`, 0);
          return U4.lstatSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      readFileSync(H, _) {
        let $ = [];
        try {
          const q = L5($, bT`fs.readFileSync(${H})`, 0);
          return U4.readFileSync(H, { encoding: _.encoding });
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      readFileBytesSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.readFileBytesSync(${H})`, 0);
          return U4.readFileSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      readSync(H, _) {
        let K = [];
        try {
          const q = L5(K, bT`fs.readSync(${H}, ${_.length} bytes)`, 0);
          let $ = void 0;
          try {
            $ = U4.openSync(H, "r");
            let A = Buffer.alloc(_.length),
              f = U4.readSync($, A, 0, _.length, 0);
            return { buffer: A, bytesRead: f };
          } finally {
            if ($) U4.closeSync($);
          }
        } catch (O) {
          var T = O,
            z = 1;
        } finally {
          k5(K, T, z);
        }
      },
      appendFileSync(H, _, q) {
        let K = [];
        try {
          const $ = L5(K, bT`fs.appendFileSync(${H}, ${_.length} chars)`, 0);
          if (q?.mode !== void 0)
            try {
              let A = U4.openSync(H, "ax", q.mode);
              try {
                U4.appendFileSync(A, _);
              } finally {
                U4.closeSync(A);
              }
              return;
            } catch (A) {
              if (e6(A) !== "EEXIST") throw A;
            }
          U4.appendFileSync(H, _);
        } catch (O) {
          var T = O,
            z = 1;
        } finally {
          k5(K, T, z);
        }
      },
      copyFileSync(H, _) {
        let $ = [];
        try {
          const q = L5($, bT`fs.copyFileSync(${H} \u2192 ${_})`, 0);
          U4.copyFileSync(H, _);
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      unlinkSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.unlinkSync(${H})`, 0);
          U4.unlinkSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      renameSync(H, _) {
        let $ = [];
        try {
          const q = L5($, bT`fs.renameSync(${H} \u2192 ${_})`, 0);
          U4.renameSync(H, _);
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      linkSync(H, _) {
        let $ = [];
        try {
          const q = L5($, bT`fs.linkSync(${H} \u2192 ${_})`, 0);
          U4.linkSync(H, _);
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      symlinkSync(H, _, q) {
        let K = [];
        try {
          const $ = L5(K, bT`fs.symlinkSync(${H} \u2192 ${_})`, 0);
          U4.symlinkSync(H, _, q);
        } catch (O) {
          var T = O,
            z = 1;
        } finally {
          k5(K, T, z);
        }
      },
      readlinkSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.readlinkSync(${H})`, 0);
          return U4.readlinkSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      realpathSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.realpathSync(${H})`, 0);
          return U4.realpathSync(H).normalize("NFC");
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      mkdirSync(H, _) {
        let K = [];
        try {
          const q = L5(K, bT`fs.mkdirSync(${H})`, 0);
          let $ = { recursive: !0 };
          if (_?.mode !== void 0) $.mode = _.mode;
          try {
            U4.mkdirSync(H, $);
          } catch (A) {
            if (e6(A) !== "EEXIST") throw A;
          }
        } catch (O) {
          var T = O,
            z = 1;
        } finally {
          k5(K, T, z);
        }
      },
      readdirSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.readdirSync(${H})`, 0);
          return U4.readdirSync(H, { withFileTypes: !0 });
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      readdirStringSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.readdirStringSync(${H})`, 0);
          return U4.readdirSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      isDirEmptySync(H) {
        let $ = [];
        try {
          const _ = L5($, bT`fs.isDirEmptySync(${H})`, 0);
          let q = this.readdirSync(H);
          return q.length === 0;
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      rmdirSync(H) {
        let q = [];
        try {
          const _ = L5(q, bT`fs.rmdirSync(${H})`, 0);
          U4.rmdirSync(H);
        } catch ($) {
          var K = $,
            O = 1;
        } finally {
          k5(q, K, O);
        }
      },
      rmSync(H, _) {
        let $ = [];
        try {
          const q = L5($, bT`fs.rmSync(${H})`, 0);
          U4.rmSync(H, _);
        } catch (K) {
          var O = K,
            T = 1;
        } finally {
          k5($, O, T);
        }
      },
      createWriteStream(H) {
        return U4.createWriteStream(H);
      },
      async readFileBytes(H, _) {
        if (_ === void 0) return TD.readFile(H);
        let q = await TD.open(H, "r");
        try {
          let { size: $ } = await q.stat(),
            K = Math.min($, _),
            O = Buffer.allocUnsafe(K),
            T = 0;
          while (T < K) {
            let { bytesRead: z } = await q.read(O, T, K - T, T);
            if (z === 0) break;
            T += z;
          }
          return T < K ? O.subarray(0, T) : O;
        } finally {
          await q.close();
        }
      },
    }),
      (v6$ = k6$);

    H_();
    n8();
    QnH();
    xw();
    RW7 = require("fs/promises");
    QT = class QT {
      taskId;
      path;
      stdoutToFile;
      #$ = "";
      #q = "";
      #H = null;
      #f = new FnH(1000);
      #T = 0;
      #z = 0;
      #K;
      #w;
      #A = !1;
      #O = 0;
      static #_ = new Map();
      static #D = new Map();
      static #P = null;
      constructor(H, _, q = !1, $ = q31) {
        if (((this.taskId = H), (this.path = I5(H)), (this.stdoutToFile = q), (this.#K = $), (this.#w = _), q && _))
          QT.#_.set(H, this);
      }
      static startPolling(H) {
        let _ = QT.#_.get(H);
        if (!_ || !_.#w) return;
        if ((QT.#D.set(H, _), !QT.#P)) (QT.#P = setInterval(QT.#M, $31)), QT.#P.unref();
      }
      static stopPolling(H) {
        if ((QT.#D.delete(H), QT.#D.size === 0 && QT.#P)) clearInterval(QT.#P), (QT.#P = null);
      }
      static #M() {
        for (let [, H] of QT.#D) {
          if (!H.#w) continue;
          _t(H.path, K31).then(
            ({ content: _, bytesRead: q, bytesTotal: $ }) => {
              if (!H.#w) return;
              if (!_) {
                H.#w("", "", H.#T, $, !1);
                return;
              }
              let K = _.length,
                O = 0,
                T = 0,
                z = 0;
              while (K > 0) {
                if (
                  ((K = _.lastIndexOf(
                    `
`,
                    K - 1,
                  )),
                  z++,
                  z === 5)
                )
                  O = K <= 0 ? 0 : K + 1;
                if (z === 100) T = K <= 0 ? 0 : K + 1;
              }
              let A = q >= $ ? z : Math.max(H.#T, Math.round(($ / q) * z));
              (H.#T = A), (H.#z = $), H.#w(_.slice(O), _.slice(T), A, $, q < $);
            },
            () => {},
          );
        }
      }
      writeStdout(H) {
        this.#Y(H, !1);
      }
      writeStderr(H) {
        this.#Y(H, !0);
      }
      #Y(H, _) {
        if (((this.#z += H.length), this.#X(H), this.#H)) {
          this.#H.append(_ ? `[stderr] ${H}` : H);
          return;
        }
        if (this.#$.length + this.#q.length + H.length > this.#K) {
          this.#J(_ ? H : null, _ ? null : H);
          return;
        }
        if (_) this.#q += H;
        else this.#$ += H;
      }
      #X(H) {
        let $ = 0,
          K = [],
          O = 0,
          T = H.length;
        while (T > 0) {
          let z = H.lastIndexOf(
            `
`,
            T - 1,
          );
          if (z === -1) break;
          if (($++, K.length < 100 && O < 4096)) {
            let A = T - z - 1;
            if (A > 0 && A <= 4096 - O) {
              let f = H.slice(z + 1, T);
              if (f.trim()) K.push(Buffer.from(f).toString()), (O += A);
            }
          }
          T = z;
        }
        this.#T += $;
        for (let z = K.length - 1; z >= 0; z--) this.#f.add(K[z]);
        if (this.#w && K.length > 0) {
          let z = this.#f.getRecent(5);
          this.#w(
            lK_(
              z,
              `
`,
            ),
            lK_(
              this.#f.getRecent(100),
              `
`,
            ),
            this.#T,
            this.#z,
            this.#H !== null,
          );
        }
      }
      #J(H, _) {
        if (((this.#H = new Gy_(this.taskId)), this.#$)) this.#H.append(this.#$), (this.#$ = "");
        if (this.#q) this.#H.append(`[stderr] ${this.#q}`), (this.#q = "");
        if (_) this.#H.append(_);
        if (H) this.#H.append(`[stderr] ${H}`);
      }
      async getStdout() {
        if (this.stdoutToFile) return this.#G();
        if (this.#H) {
          let H = this.#f.getRecent(5),
            _ = lK_(
              H,
              `
`,
            ),
            $ = `
Output truncated (${Math.round(this.#z / 1024)}KB total). Full output saved to: ${this.path}`;
          return _ ? _ + $ : $.trimStart();
        }
        return this.#$;
      }
      async #G() {
        let H = ALH();
        try {
          let _ = await T4_(this.path, 0, H);
          if (!_) return (this.#A = !0), "";
          let { content: q, bytesRead: $, bytesTotal: K } = _;
          return (this.#O = K), (this.#A = K <= $), q;
        } catch (_) {
          let q = _ instanceof Error && "code" in _ ? String(_.code) : "unknown";
          return (
            N(`TaskOutput.#readStdoutFromFile: failed to read ${this.path} (${q}): ${_}`),
            `<bash output unavailable: output file ${this.path} could not be read (${q}). This usually means another Claude Code process in the same project deleted it during startup cleanup.>`
          );
        }
      }
      getStderr() {
        if (this.#H) return "";
        return this.#q;
      }
      get isOverflowed() {
        return this.#H !== null;
      }
      get totalLines() {
        return this.#T;
      }
      get totalBytes() {
        return this.#z;
      }
      get outputFileRedundant() {
        return this.#A;
      }
      get outputFileSize() {
        return this.#O;
      }
      spillToDisk() {
        if (!this.#H) this.#J(null, null);
      }
      async flush() {
        await this.#H?.flush();
      }
      async deleteOutputFile() {
        try {
          await RW7.unlink(this.path);
        } catch {}
      }
      clear() {
        (this.#$ = ""),
          (this.#q = ""),
          this.#f.clear(),
          (this.#w = null),
          this.#H?.cancel(),
          QT.stopPolling(this.taskId),
          QT.#_.delete(this.taskId);
      }
    };

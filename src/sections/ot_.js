    rU();
    W0();
    nt_();
    G4H();
    k$_();
    W0();
    SR = class SR {
      constructor(H, _, q) {
        (this.iterator = H), XbH.set(this, void 0), (this.controller = _), _7(this, XbH, q, "f");
      }
      static fromSSEResponse(H, _, q) {
        let $ = !1,
          K = q ? kJ(q) : console;
        async function* O() {
          if ($) throw new q7("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          $ = !0;
          let T = !1;
          try {
            for await (let z of YH$(H, _)) {
              if (z.event === "completion")
                try {
                  yield JSON.parse(z.data);
                } catch (A) {
                  throw (K.error("Could not parse message into JSON:", z.data), K.error("From chunk:", z.raw), A);
                }
              if (
                z.event === "message_start" ||
                z.event === "message_delta" ||
                z.event === "message_stop" ||
                z.event === "content_block_start" ||
                z.event === "content_block_delta" ||
                z.event === "content_block_stop"
              )
                try {
                  yield JSON.parse(z.data);
                } catch (A) {
                  throw (K.error("Could not parse message into JSON:", z.data), K.error("From chunk:", z.raw), A);
                }
              if (z.event === "ping") continue;
              if (z.event === "error") throw new rq(void 0, G$_(z.data) ?? z.data, void 0, H.headers);
            }
            T = !0;
          } catch (z) {
            if (oU(z)) return;
            throw z;
          } finally {
            if (!T) _.abort();
          }
        }
        return new SR(O, _, q);
      }
      static fromReadableStream(H, _, q) {
        let $ = !1;
        async function* K() {
          let T = new Qs(),
            z = MbH(H);
          for await (let A of z) for (let f of T.decode(A)) yield f;
          for (let A of T.flush()) yield A;
        }
        async function* O() {
          if ($) throw new q7("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          $ = !0;
          let T = !1;
          try {
            for await (let z of K()) {
              if (T) continue;
              if (z) yield JSON.parse(z);
            }
            T = !0;
          } catch (z) {
            if (oU(z)) return;
            throw z;
          } finally {
            if (!T) _.abort();
          }
        }
        return new SR(O, _, q);
      }
      [((XbH = new WeakMap()), Symbol.asyncIterator)]() {
        return this.iterator();
      }
      tee() {
        let H = [],
          _ = [],
          q = this.iterator(),
          $ = (K) => {
            return {
              next: () => {
                if (K.length === 0) {
                  let O = q.next();
                  H.push(O), _.push(O);
                }
                return K.shift();
              },
            };
          };
        return [
          new SR(() => $(H), this.controller, V6(this, XbH, "f")),
          new SR(() => $(_), this.controller, V6(this, XbH, "f")),
        ];
      }
      toReadableStream() {
        let H = this,
          _;
        return lt_({
          async start() {
            _ = H[Symbol.asyncIterator]();
          },
          async pull(q) {
            try {
              let { value: $, done: K } = await _.next();
              if (K) return q.close();
              let O = JbH(
                JSON.stringify($) +
                  `
`,
              );
              q.enqueue(O);
            } catch ($) {
              q.error($);
            }
          },
          async cancel() {
            await _.return?.();
          },
        });
      }
    };

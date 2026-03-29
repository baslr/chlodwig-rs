    Vp6();
    Sp6 = class Sp6 extends Event {
      constructor(H, _) {
        var q, $;
        super(H),
          (this.code = (q = _ == null ? void 0 : _.code) != null ? q : void 0),
          (this.message = ($ = _ == null ? void 0 : _.message) != null ? $ : void 0);
      }
      [Symbol.for("nodejs.util.inspect.custom")](H, _, q) {
        return q(ZR7(this), _);
      }
      [Symbol.for("Deno.customInspect")](H, _) {
        return H(ZR7(this), _);
      }
    };
    uLH = class uLH extends EventTarget {
      constructor(H, _) {
        var q, $;
        super(),
          aM(this, hx),
          (this.CONNECTING = 0),
          (this.OPEN = 1),
          (this.CLOSED = 2),
          aM(this, Wv),
          aM(this, WzH),
          aM(this, SLH),
          aM(this, bV_),
          aM(this, IV_),
          aM(this, ZrH),
          aM(this, bLH),
          aM(this, LrH, null),
          aM(this, r8H),
          aM(this, ELH),
          aM(this, ILH, null),
          aM(this, CLH, null),
          aM(this, GrH, null),
          aM(this, bp6, async (K) => {
            var O;
            f5(this, ELH).reset();
            let { body: T, redirected: z, status: A, headers: f } = K;
            if (A === 204) {
              en(this, hx, RrH).call(this, "Server sent HTTP 204, not reconnecting", 204), this.close();
              return;
            }
            if ((z ? pw(this, SLH, new URL(K.url)) : pw(this, SLH, void 0), A !== 200)) {
              en(this, hx, RrH).call(this, `Non-200 status code (${A})`, A);
              return;
            }
            if (!(f.get("content-type") || "").startsWith("text/event-stream")) {
              en(this, hx, RrH).call(this, 'Invalid content type, expected "text/event-stream"', A);
              return;
            }
            if (f5(this, Wv) === this.CLOSED) return;
            pw(this, Wv, this.OPEN);
            let w = new Event("open");
            if (
              ((O = f5(this, GrH)) == null || O.call(this, w),
              this.dispatchEvent(w),
              typeof T != "object" || !T || !("getReader" in T))
            ) {
              en(this, hx, RrH).call(this, "Invalid response body, expected a web ReadableStream", A), this.close();
              return;
            }
            let Y = new TextDecoder(),
              D = T.getReader(),
              j = !0;
            do {
              let { done: M, value: J } = await D.read();
              J && f5(this, ELH).feed(Y.decode(J, { stream: !M })),
                M && ((j = !1), f5(this, ELH).reset(), en(this, hx, mp6).call(this));
            } while (j);
          }),
          aM(this, Ip6, (K) => {
            pw(this, r8H, void 0),
              !(K.name === "AbortError" || K.type === "aborted") && en(this, hx, mp6).call(this, Ep6(K));
          }),
          aM(this, up6, (K) => {
            typeof K.id == "string" && pw(this, LrH, K.id);
            let O = new MessageEvent(K.event || "message", {
              data: K.data,
              origin: f5(this, SLH) ? f5(this, SLH).origin : f5(this, WzH).origin,
              lastEventId: K.id || "",
            });
            f5(this, CLH) && (!K.event || K.event === "message") && f5(this, CLH).call(this, O), this.dispatchEvent(O);
          }),
          aM(this, xp6, (K) => {
            pw(this, ZrH, K);
          }),
          aM(this, pp6, () => {
            pw(this, bLH, void 0), f5(this, Wv) === this.CONNECTING && en(this, hx, Cp6).call(this);
          });
        try {
          if (H instanceof URL) pw(this, WzH, H);
          else if (typeof H == "string") pw(this, WzH, new URL(H, BT1()));
          else throw Error("Invalid URL");
        } catch {
          throw pT1("An invalid or illegal string was specified");
        }
        pw(this, ELH, CV_({ onEvent: f5(this, up6), onRetry: f5(this, xp6) })),
          pw(this, Wv, this.CONNECTING),
          pw(this, ZrH, 3000),
          pw(this, IV_, (q = _ == null ? void 0 : _.fetch) != null ? q : globalThis.fetch),
          pw(this, bV_, ($ = _ == null ? void 0 : _.withCredentials) != null ? $ : !1),
          en(this, hx, Cp6).call(this);
      }
      get readyState() {
        return f5(this, Wv);
      }
      get url() {
        return f5(this, WzH).href;
      }
      get withCredentials() {
        return f5(this, bV_);
      }
      get onerror() {
        return f5(this, ILH);
      }
      set onerror(H) {
        pw(this, ILH, H);
      }
      get onmessage() {
        return f5(this, CLH);
      }
      set onmessage(H) {
        pw(this, CLH, H);
      }
      get onopen() {
        return f5(this, GrH);
      }
      set onopen(H) {
        pw(this, GrH, H);
      }
      addEventListener(H, _, q) {
        let $ = _;
        super.addEventListener(H, $, q);
      }
      removeEventListener(H, _, q) {
        let $ = _;
        super.removeEventListener(H, $, q);
      }
      close() {
        f5(this, bLH) && clearTimeout(f5(this, bLH)),
          f5(this, Wv) !== this.CLOSED &&
            (f5(this, r8H) && f5(this, r8H).abort(), pw(this, Wv, this.CLOSED), pw(this, r8H, void 0));
      }
    };
    (Wv = new WeakMap()),
      (WzH = new WeakMap()),
      (SLH = new WeakMap()),
      (bV_ = new WeakMap()),
      (IV_ = new WeakMap()),
      (ZrH = new WeakMap()),
      (bLH = new WeakMap()),
      (LrH = new WeakMap()),
      (r8H = new WeakMap()),
      (ELH = new WeakMap()),
      (ILH = new WeakMap()),
      (CLH = new WeakMap()),
      (GrH = new WeakMap()),
      (hx = new WeakSet()),
      (Cp6 = function () {
        pw(this, Wv, this.CONNECTING),
          pw(this, r8H, new AbortController()),
          f5(this, IV_)(f5(this, WzH), en(this, hx, LR7).call(this))
            .then(f5(this, bp6))
            .catch(f5(this, Ip6));
      }),
      (bp6 = new WeakMap()),
      (Ip6 = new WeakMap()),
      (LR7 = function () {
        var H;
        let _ = {
          mode: "cors",
          redirect: "follow",
          headers: { Accept: "text/event-stream", ...(f5(this, LrH) ? { "Last-Event-ID": f5(this, LrH) } : void 0) },
          cache: "no-store",
          signal: (H = f5(this, r8H)) == null ? void 0 : H.signal,
        };
        return "window" in globalThis && (_.credentials = this.withCredentials ? "include" : "same-origin"), _;
      }),
      (up6 = new WeakMap()),
      (xp6 = new WeakMap()),
      (RrH = function (H, _) {
        var q;
        f5(this, Wv) !== this.CLOSED && pw(this, Wv, this.CLOSED);
        let $ = new Sp6("error", { code: _, message: H });
        (q = f5(this, ILH)) == null || q.call(this, $), this.dispatchEvent($);
      }),
      (mp6 = function (H, _) {
        var q;
        if (f5(this, Wv) === this.CLOSED) return;
        pw(this, Wv, this.CONNECTING);
        let $ = new Sp6("error", { code: _, message: H });
        (q = f5(this, ILH)) == null || q.call(this, $),
          this.dispatchEvent($),
          pw(this, bLH, setTimeout(f5(this, pp6), f5(this, ZrH)));
      }),
      (pp6 = new WeakMap()),
      (uLH.CONNECTING = 0),
      (uLH.OPEN = 1),
      (uLH.CLOSED = 2);

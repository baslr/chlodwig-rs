    dAq();
    ND6();
    xY6();
    I$_();
    is();
    ER();
    Vfq();
    dpH();
    ufq();
    xD_ = class xD_ extends SR {
      static fromSSEResponse(H, _, q) {
        let $ = !1,
          K = q ? Ifq(q) : console;
        async function* O() {
          if (!H.body) throw (_.abort(), new q7("Attempted to iterate over a response with no body"));
          let z = Sfq(H.body),
            A = yfq(z, Ms$());
          for await (let f of A)
            if (f.chunk && f.chunk.bytes) yield { event: "chunk", data: gD6(f.chunk.bytes), raw: [] };
            else if (f.internalServerException) yield { event: "error", data: "InternalServerException", raw: [] };
            else if (f.modelStreamErrorException) yield { event: "error", data: "ModelStreamErrorException", raw: [] };
            else if (f.validationException) yield { event: "error", data: "ValidationException", raw: [] };
            else if (f.throttlingException) yield { event: "error", data: "ThrottlingException", raw: [] };
        }
        async function* T() {
          if ($) throw Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          $ = !0;
          let z = !1;
          try {
            for await (let A of O()) {
              if (A.event === "chunk")
                try {
                  yield JSON.parse(A.data);
                } catch (f) {
                  throw (K.error("Could not parse message into JSON:", A.data), K.error("From chunk:", A.raw), f);
                }
              if (A.event === "error") {
                let f = A.data,
                  w = Efq(f),
                  Y = w ? void 0 : f;
                throw rq.generate(void 0, w, Y, H.headers);
              }
            }
            z = !0;
          } catch (A) {
            if (Js$(A)) return;
            throw A;
          } finally {
            if (!z) _.abort();
          }
        }
        return new xD_(T, _);
      }
    };

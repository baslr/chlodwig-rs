  var sy8 = d((ay8) => {
    var ry8 = cz();
    class oy8 {
      marshaller;
      serializer;
      deserializer;
      serdeContext;
      defaultContentType;
      constructor({ marshaller: H, serializer: _, deserializer: q, serdeContext: $, defaultContentType: K }) {
        (this.marshaller = H),
          (this.serializer = _),
          (this.deserializer = q),
          (this.serdeContext = $),
          (this.defaultContentType = K);
      }
      async serializeEventStream({ eventStream: H, requestSchema: _, initialRequest: q }) {
        let $ = this.marshaller,
          K = _.getEventStreamMember(),
          O = _.getMemberSchema(K),
          T = this.serializer,
          z = this.defaultContentType,
          A = Symbol("initialRequestMarker"),
          f = {
            async *[Symbol.asyncIterator]() {
              if (q) {
                let w = {
                  ":event-type": { type: "string", value: "initial-request" },
                  ":message-type": { type: "string", value: "event" },
                  ":content-type": { type: "string", value: z },
                };
                T.write(_, q);
                let Y = T.flush();
                yield { [A]: !0, headers: w, body: Y };
              }
              for await (let w of H) yield w;
            },
          };
        return $.serialize(f, (w) => {
          if (w[A]) return { headers: w.headers, body: w.body };
          let Y =
              Object.keys(w).find((X) => {
                return X !== "__type";
              }) ?? "",
            {
              additionalHeaders: D,
              body: j,
              eventType: M,
              explicitPayloadContentType: J,
            } = this.writeEventBody(Y, O, w);
          return {
            headers: {
              ":event-type": { type: "string", value: M },
              ":message-type": { type: "string", value: "event" },
              ":content-type": { type: "string", value: J ?? z },
              ...D,
            },
            body: j,
          };
        });
      }
      async deserializeEventStream({ response: H, responseSchema: _, initialResponseContainer: q }) {
        let $ = this.marshaller,
          K = _.getEventStreamMember(),
          T = _.getMemberSchema(K).getMemberSchemas(),
          z = Symbol("initialResponseMarker"),
          A = $.deserialize(H.body, async (Y) => {
            let D =
                Object.keys(Y).find((M) => {
                  return M !== "__type";
                }) ?? "",
              j = Y[D].body;
            if (D === "initial-response") {
              let M = await this.deserializer.read(_, j);
              return delete M[K], { [z]: !0, ...M };
            } else if (D in T) {
              let M = T[D];
              if (M.isStructSchema()) {
                let J = {},
                  P = !1;
                for (let [X, R] of M.structIterator()) {
                  let { eventHeader: W, eventPayload: Z } = R.getMergedTraits();
                  if (((P = P || Boolean(W || Z)), Z)) {
                    if (R.isBlobSchema()) J[X] = j;
                    else if (R.isStringSchema()) J[X] = (this.serdeContext?.utf8Encoder ?? ry8.toUtf8)(j);
                    else if (R.isStructSchema()) J[X] = await this.deserializer.read(R, j);
                  } else if (W) {
                    let k = Y[D].headers[X]?.value;
                    if (k != null)
                      if (R.isNumericSchema())
                        if (k && typeof k === "object" && "bytes" in k) J[X] = BigInt(k.toString());
                        else J[X] = Number(k);
                      else J[X] = k;
                  }
                }
                if (P) return { [D]: J };
              }
              return { [D]: await this.deserializer.read(M, j) };
            } else return { $unknown: Y };
          }),
          f = A[Symbol.asyncIterator](),
          w = await f.next();
        if (w.done) return A;
        if (w.value?.[z]) {
          if (!_)
            throw Error(
              "@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.",
            );
          for (let [Y, D] of Object.entries(w.value)) q[Y] = D;
        }
        return {
          async *[Symbol.asyncIterator]() {
            if (!w?.value?.[z]) yield w.value;
            while (!0) {
              let { done: Y, value: D } = await f.next();
              if (Y) break;
              yield D;
            }
          },
        };
      }
      writeEventBody(H, _, q) {
        let $ = this.serializer,
          K = H,
          O = null,
          T,
          z = (() => {
            return _.getSchema()[4].includes(H);
          })(),
          A = {};
        if (!z) {
          let [Y, D] = q[H];
          (K = Y), $.write(15, D);
        } else {
          let Y = _.getMemberSchema(H);
          if (Y.isStructSchema()) {
            for (let [D, j] of Y.structIterator()) {
              let { eventHeader: M, eventPayload: J } = j.getMergedTraits();
              if (J) {
                O = D;
                break;
              } else if (M) {
                let P = q[H][D],
                  X = "binary";
                if (j.isNumericSchema())
                  if (-2147483648 <= P && P <= 2147483647) X = "integer";
                  else X = "long";
                else if (j.isTimestampSchema()) X = "timestamp";
                else if (j.isStringSchema()) X = "string";
                else if (j.isBooleanSchema()) X = "boolean";
                if (P != null) (A[D] = { type: X, value: P }), delete q[H][D];
              }
            }
            if (O !== null) {
              let D = Y.getMemberSchema(O);
              if (D.isBlobSchema()) T = "application/octet-stream";
              else if (D.isStringSchema()) T = "text/plain";
              $.write(D, q[H][O]);
            } else $.write(Y, q[H]);
          } else throw Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
        }
        let f = $.flush();
        return {
          body: typeof f === "string" ? (this.serdeContext?.utf8Decoder ?? ry8.fromUtf8)(f) : f,
          eventType: K,
          explicitPayloadContentType: T,
          additionalHeaders: A,
        };
      }
    }
    ay8.EventStreamSerde = oy8;
  });

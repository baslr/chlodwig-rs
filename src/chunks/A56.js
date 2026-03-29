  var A56 = d((qk) => {
    var mO_ = _k(),
      HC8 = cz(),
      sxH = xA(),
      MR$ = IxH(),
      JR$ = aE8(),
      oMH = qz(),
      PR$ = E0(),
      _C8 = $K6(),
      uO_ = 0,
      xO_ = 1,
      p1H = 2,
      tt = 3,
      axH = 4,
      bO_ = 5,
      qC8 = 6,
      oK6 = 7,
      $C8 = 20,
      tK6 = 21,
      KC8 = 22,
      XR$ = 23,
      H56 = 24,
      B1H = 25,
      g1H = 26,
      et = 27,
      _56 = 31;
    function aMH(H) {
      return typeof Buffer < "u" ? Buffer.alloc(H) : new Uint8Array(H);
    }
    var q56 = Symbol("@smithy/core/cbor::tagSymbol");
    function $56(H) {
      return (H[q56] = !0), H;
    }
    var WR$ = typeof TextDecoder < "u",
      GR$ = typeof Buffer < "u",
      $z = aMH(0),
      dQ = new DataView($z.buffer, $z.byteOffset, $z.byteLength),
      sE8 = WR$ ? new TextDecoder() : null,
      UK = 0;
    function RR$(H) {
      ($z = H), (dQ = new DataView($z.buffer, $z.byteOffset, $z.byteLength));
    }
    function cQ(H, _) {
      if (H >= _) throw Error("unexpected end of (decode) payload.");
      let q = ($z[H] & 224) >> 5,
        $ = $z[H] & 31;
      switch (q) {
        case uO_:
        case xO_:
        case qC8:
          let K, O;
          if ($ < 24) (K = $), (O = 1);
          else
            switch ($) {
              case H56:
              case B1H:
              case g1H:
              case et:
                let T = TC8[$],
                  z = T + 1;
                if (((O = z), _ - H < z)) throw Error(`countLength ${T} greater than remaining buf len.`);
                let A = H + 1;
                if (T === 1) K = $z[A];
                else if (T === 2) K = dQ.getUint16(A);
                else if (T === 4) K = dQ.getUint32(A);
                else K = dQ.getBigUint64(A);
                break;
              default:
                throw Error(`unexpected minor value ${$}.`);
            }
          if (q === uO_) return (UK = O), aK6(K);
          else if (q === xO_) {
            let T;
            if (typeof K === "bigint") T = BigInt(-1) - K;
            else T = -1 - K;
            return (UK = O), aK6(T);
          } else if ($ === 2 || $ === 3) {
            let T = txH(H + O, _),
              z = BigInt(0),
              A = H + O + UK;
            for (let f = A; f < A + T; ++f) z = (z << BigInt(8)) | BigInt($z[f]);
            return (UK = O + UK + T), $ === 3 ? -z - BigInt(1) : z;
          } else if ($ === 4) {
            let T = cQ(H + O, _),
              [z, A] = T,
              f = A < 0 ? -1 : 1,
              w = "0".repeat(Math.abs(z) + 1) + String(BigInt(f) * BigInt(A)),
              Y,
              D = A < 0 ? "-" : "";
            if (
              ((Y = z === 0 ? w : w.slice(0, w.length + z) + "." + w.slice(z)), (Y = Y.replace(/^0+/g, "")), Y === "")
            )
              Y = "0";
            if (Y[0] === ".") Y = "0" + Y;
            return (Y = D + Y), (UK = O + UK), mO_.nv(Y);
          } else {
            let T = cQ(H + O, _);
            return (UK = O + UK), $56({ tag: aK6(K), value: T });
          }
        case tt:
        case bO_:
        case axH:
        case p1H:
          if ($ === _56)
            switch (q) {
              case tt:
                return vR$(H, _);
              case bO_:
                return SR$(H, _);
              case axH:
                return yR$(H, _);
              case p1H:
                return NR$(H, _);
            }
          else
            switch (q) {
              case tt:
                return kR$(H, _);
              case bO_:
                return VR$(H, _);
              case axH:
                return hR$(H, _);
              case p1H:
                return K56(H, _);
            }
        default:
          return ER$(H, _);
      }
    }
    function OC8(H, _, q) {
      if (GR$ && H.constructor?.name === "Buffer") return H.toString("utf-8", _, q);
      if (sE8) return sE8.decode(H.subarray(_, q));
      return HC8.toUtf8(H.subarray(_, q));
    }
    function ZR$(H) {
      let _ = Number(H);
      if (_ < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < _)
        console.warn(Error(`@smithy/core/cbor - truncating BigInt(${H}) to ${_} with loss of precision.`));
      return _;
    }
    var TC8 = { [H56]: 1, [B1H]: 2, [g1H]: 4, [et]: 8 };
    function LR$(H, _) {
      let q = H >> 7,
        $ = (H & 124) >> 2,
        K = ((H & 3) << 8) | _,
        O = q === 0 ? 1 : -1,
        T,
        z;
      if ($ === 0)
        if (K === 0) return 0;
        else (T = Math.pow(2, -14)), (z = 0);
      else if ($ === 31)
        if (K === 0) return O * (1 / 0);
        else return NaN;
      else (T = Math.pow(2, $ - 15)), (z = 1);
      return (z += K / 1024), O * (T * z);
    }
    function txH(H, _) {
      let q = $z[H] & 31;
      if (q < 24) return (UK = 1), q;
      if (q === H56 || q === B1H || q === g1H || q === et) {
        let $ = TC8[q];
        if (((UK = $ + 1), _ - H < UK)) throw Error(`countLength ${$} greater than remaining buf len.`);
        let K = H + 1;
        if ($ === 1) return $z[K];
        else if ($ === 2) return dQ.getUint16(K);
        else if ($ === 4) return dQ.getUint32(K);
        return ZR$(dQ.getBigUint64(K));
      }
      throw Error(`unexpected minor value ${q}.`);
    }
    function kR$(H, _) {
      let q = txH(H, _),
        $ = UK;
      if (((H += $), _ - H < q)) throw Error(`string len ${q} greater than remaining buf len.`);
      let K = OC8($z, H, H + q);
      return (UK = $ + q), K;
    }
    function vR$(H, _) {
      H += 1;
      let q = [];
      for (let $ = H; H < _; ) {
        if ($z[H] === 255) {
          let A = aMH(q.length);
          return A.set(q, 0), (UK = H - $ + 2), OC8(A, 0, A.length);
        }
        let K = ($z[H] & 224) >> 5,
          O = $z[H] & 31;
        if (K !== tt) throw Error(`unexpected major type ${K} in indefinite string.`);
        if (O === _56) throw Error("nested indefinite string.");
        let T = K56(H, _);
        H += UK;
        for (let A = 0; A < T.length; ++A) q.push(T[A]);
      }
      throw Error("expected break marker.");
    }
    function K56(H, _) {
      let q = txH(H, _),
        $ = UK;
      if (((H += $), _ - H < q)) throw Error(`unstructured byte string len ${q} greater than remaining buf len.`);
      let K = $z.subarray(H, H + q);
      return (UK = $ + q), K;
    }
    function NR$(H, _) {
      H += 1;
      let q = [];
      for (let $ = H; H < _; ) {
        if ($z[H] === 255) {
          let A = aMH(q.length);
          return A.set(q, 0), (UK = H - $ + 2), A;
        }
        let K = ($z[H] & 224) >> 5,
          O = $z[H] & 31;
        if (K !== p1H) throw Error(`unexpected major type ${K} in indefinite string.`);
        if (O === _56) throw Error("nested indefinite string.");
        let T = K56(H, _);
        H += UK;
        for (let A = 0; A < T.length; ++A) q.push(T[A]);
      }
      throw Error("expected break marker.");
    }
    function hR$(H, _) {
      let q = txH(H, _),
        $ = UK;
      H += $;
      let K = H,
        O = Array(q);
      for (let T = 0; T < q; ++T) {
        let z = cQ(H, _),
          A = UK;
        (O[T] = z), (H += A);
      }
      return (UK = $ + (H - K)), O;
    }
    function yR$(H, _) {
      H += 1;
      let q = [];
      for (let $ = H; H < _; ) {
        if ($z[H] === 255) return (UK = H - $ + 2), q;
        let K = cQ(H, _);
        (H += UK), q.push(K);
      }
      throw Error("expected break marker.");
    }
    function VR$(H, _) {
      let q = txH(H, _),
        $ = UK;
      H += $;
      let K = H,
        O = {};
      for (let T = 0; T < q; ++T) {
        if (H >= _) throw Error("unexpected end of map payload.");
        let z = ($z[H] & 224) >> 5;
        if (z !== tt) throw Error(`unexpected major type ${z} for map key at index ${H}.`);
        let A = cQ(H, _);
        H += UK;
        let f = cQ(H, _);
        (H += UK), (O[A] = f);
      }
      return (UK = $ + (H - K)), O;
    }
    function SR$(H, _) {
      H += 1;
      let q = H,
        $ = {};
      for (; H < _; ) {
        if (H >= _) throw Error("unexpected end of map payload.");
        if ($z[H] === 255) return (UK = H - q + 2), $;
        let K = ($z[H] & 224) >> 5;
        if (K !== tt) throw Error(`unexpected major type ${K} for map key.`);
        let O = cQ(H, _);
        H += UK;
        let T = cQ(H, _);
        (H += UK), ($[O] = T);
      }
      throw Error("expected break marker.");
    }
    function ER$(H, _) {
      let q = $z[H] & 31;
      switch (q) {
        case tK6:
        case $C8:
          return (UK = 1), q === tK6;
        case KC8:
          return (UK = 1), null;
        case XR$:
          return (UK = 1), null;
        case B1H:
          if (_ - H < 3) throw Error("incomplete float16 at end of buf.");
          return (UK = 3), LR$($z[H + 1], $z[H + 2]);
        case g1H:
          if (_ - H < 5) throw Error("incomplete float32 at end of buf.");
          return (UK = 5), dQ.getFloat32(H + 1);
        case et:
          if (_ - H < 9) throw Error("incomplete float64 at end of buf.");
          return (UK = 9), dQ.getFloat64(H + 1);
        default:
          throw Error(`unexpected minor value ${q}.`);
      }
    }
    function aK6(H) {
      if (typeof H === "number") return H;
      let _ = Number(H);
      if (Number.MIN_SAFE_INTEGER <= _ && _ <= Number.MAX_SAFE_INTEGER) return _;
      return H;
    }
    var tE8 = typeof Buffer < "u",
      CR$ = 2048,
      S4 = aMH(CR$),
      gQ = new DataView(S4.buffer, S4.byteOffset, S4.byteLength),
      Q9 = 0;
    function sK6(H) {
      if (S4.byteLength - Q9 < H)
        if (Q9 < 16000000) eK6(Math.max(S4.byteLength * 4, S4.byteLength + H));
        else eK6(S4.byteLength + H + 16000000);
    }
    function eE8() {
      let H = aMH(Q9);
      return H.set(S4.subarray(0, Q9), 0), (Q9 = 0), H;
    }
    function eK6(H) {
      let _ = S4;
      if (((S4 = aMH(H)), _))
        if (_.copy) _.copy(S4, 0, 0, _.byteLength);
        else S4.set(_, 0);
      gQ = new DataView(S4.buffer, S4.byteOffset, S4.byteLength);
    }
    function BQ(H, _) {
      if (_ < 24) S4[Q9++] = (H << 5) | _;
      else if (_ < 256) (S4[Q9++] = (H << 5) | 24), (S4[Q9++] = _);
      else if (_ < 65536) (S4[Q9++] = (H << 5) | B1H), gQ.setUint16(Q9, _), (Q9 += 2);
      else if (_ < 4294967296) (S4[Q9++] = (H << 5) | g1H), gQ.setUint32(Q9, _), (Q9 += 4);
      else (S4[Q9++] = (H << 5) | et), gQ.setBigUint64(Q9, typeof _ === "bigint" ? _ : BigInt(_)), (Q9 += 8);
    }
    function bR$(H) {
      let _ = [H];
      while (_.length) {
        let q = _.pop();
        if ((sK6(typeof q === "string" ? q.length * 4 : 64), typeof q === "string")) {
          if (tE8) BQ(tt, Buffer.byteLength(q)), (Q9 += S4.write(q, Q9));
          else {
            let $ = HC8.fromUtf8(q);
            BQ(tt, $.byteLength), S4.set($, Q9), (Q9 += $.byteLength);
          }
          continue;
        } else if (typeof q === "number") {
          if (Number.isInteger(q)) {
            let $ = q >= 0,
              K = $ ? uO_ : xO_,
              O = $ ? q : -q - 1;
            if (O < 24) S4[Q9++] = (K << 5) | O;
            else if (O < 256) (S4[Q9++] = (K << 5) | 24), (S4[Q9++] = O);
            else if (O < 65536) (S4[Q9++] = (K << 5) | B1H), (S4[Q9++] = O >> 8), (S4[Q9++] = O);
            else if (O < 4294967296) (S4[Q9++] = (K << 5) | g1H), gQ.setUint32(Q9, O), (Q9 += 4);
            else (S4[Q9++] = (K << 5) | et), gQ.setBigUint64(Q9, BigInt(O)), (Q9 += 8);
            continue;
          }
          (S4[Q9++] = (oK6 << 5) | et), gQ.setFloat64(Q9, q), (Q9 += 8);
          continue;
        } else if (typeof q === "bigint") {
          let $ = q >= 0,
            K = $ ? uO_ : xO_,
            O = $ ? q : -q - BigInt(1),
            T = Number(O);
          if (T < 24) S4[Q9++] = (K << 5) | T;
          else if (T < 256) (S4[Q9++] = (K << 5) | 24), (S4[Q9++] = T);
          else if (T < 65536) (S4[Q9++] = (K << 5) | B1H), (S4[Q9++] = T >> 8), (S4[Q9++] = T & 255);
          else if (T < 4294967296) (S4[Q9++] = (K << 5) | g1H), gQ.setUint32(Q9, T), (Q9 += 4);
          else if (O < BigInt("18446744073709551616")) (S4[Q9++] = (K << 5) | et), gQ.setBigUint64(Q9, O), (Q9 += 8);
          else {
            let z = O.toString(2),
              A = new Uint8Array(Math.ceil(z.length / 8)),
              f = O,
              w = 0;
            while (A.byteLength - ++w >= 0) (A[A.byteLength - w] = Number(f & BigInt(255))), (f >>= BigInt(8));
            if ((sK6(A.byteLength * 2), (S4[Q9++] = $ ? 194 : 195), tE8)) BQ(p1H, Buffer.byteLength(A));
            else BQ(p1H, A.byteLength);
            S4.set(A, Q9), (Q9 += A.byteLength);
          }
          continue;
        } else if (q === null) {
          S4[Q9++] = (oK6 << 5) | KC8;
          continue;
        } else if (typeof q === "boolean") {
          S4[Q9++] = (oK6 << 5) | (q ? tK6 : $C8);
          continue;
        } else if (typeof q > "u") throw Error("@smithy/core/cbor: client may not serialize undefined value.");
        else if (Array.isArray(q)) {
          for (let $ = q.length - 1; $ >= 0; --$) _.push(q[$]);
          BQ(axH, q.length);
          continue;
        } else if (typeof q.byteLength === "number") {
          sK6(q.length * 2), BQ(p1H, q.length), S4.set(q, Q9), (Q9 += q.byteLength);
          continue;
        } else if (typeof q === "object") {
          if (q instanceof mO_.NumericValue) {
            let K = q.string.indexOf("."),
              O = K === -1 ? 0 : K - q.string.length + 1,
              T = BigInt(q.string.replace(".", ""));
            (S4[Q9++] = 196), _.push(T), _.push(O), BQ(axH, 2);
            continue;
          }
          if (q[q56])
            if ("tag" in q && "value" in q) {
              _.push(q.value), BQ(qC8, q.tag);
              continue;
            } else
              throw Error("tag encountered with missing fields, need 'tag' and 'value', found: " + JSON.stringify(q));
          let $ = Object.keys(q);
          for (let K = $.length - 1; K >= 0; --K) {
            let O = $[K];
            _.push(q[O]), _.push(O);
          }
          BQ(bO_, $.length);
          continue;
        }
        throw Error(`data type ${q?.constructor?.name ?? typeof q} not compatible for encoding.`);
      }
    }
    var pO_ = {
        deserialize(H) {
          return RR$(H), cQ(0, H.length);
        },
        serialize(H) {
          try {
            return bR$(H), eE8();
          } catch (_) {
            throw (eE8(), _);
          }
        },
        resizeEncodingBuffer(H) {
          eK6(H);
        },
      },
      zC8 = (H, _) => {
        return sxH.collectBody(H, _).then(async (q) => {
          if (q.length)
            try {
              return pO_.deserialize(q);
            } catch ($) {
              throw (Object.defineProperty($, "$responseBodyText", { value: _.utf8Encoder(q) }), $);
            }
          return {};
        });
      },
      IO_ = (H) => {
        return $56({ tag: 1, value: H.getTime() / 1000 });
      },
      IR$ = async (H, _) => {
        let q = await zC8(H, _);
        return (q.message = q.message ?? q.Message), q;
      },
      AC8 = (H, _) => {
        let q = (K) => {
          let O = K;
          if (typeof O === "number") O = O.toString();
          if (O.indexOf(",") >= 0) O = O.split(",")[0];
          if (O.indexOf(":") >= 0) O = O.split(":")[0];
          if (O.indexOf("#") >= 0) O = O.split("#")[1];
          return O;
        };
        if (_.__type !== void 0) return q(_.__type);
        let $ = Object.keys(_).find((K) => K.toLowerCase() === "code");
        if ($ && _[$] !== void 0) return q(_[$]);
      },
      uR$ = (H) => {
        if (String(H.headers["smithy-protocol"]).toLowerCase() !== "rpc-v2-cbor")
          throw Error("Malformed RPCv2 CBOR response, status: " + H.statusCode);
      },
      xR$ = async (H, _, q, $, K) => {
        let { hostname: O, protocol: T = "https", port: z, path: A } = await H.endpoint(),
          f = {
            protocol: T,
            hostname: O,
            port: z,
            method: "POST",
            path: A.endsWith("/") ? A.slice(0, -1) + q : A + q,
            headers: { ..._ },
          };
        if ($ !== void 0) f.hostname = $;
        if (K !== void 0) {
          f.body = K;
          try {
            f.headers["content-length"] = String(JR$.calculateBodyLength(K));
          } catch (w) {}
        }
        return new MR$.HttpRequest(f);
      };
    class O56 extends sxH.SerdeContext {
      createSerializer() {
        let H = new T56();
        return H.setSerdeContext(this.serdeContext), H;
      }
      createDeserializer() {
        let H = new z56();
        return H.setSerdeContext(this.serdeContext), H;
      }
    }
    class T56 extends sxH.SerdeContext {
      value;
      write(H, _) {
        this.value = this.serialize(H, _);
      }
      serialize(H, _) {
        let q = oMH.NormalizedSchema.of(H);
        if (_ == null) {
          if (q.isIdempotencyToken()) return mO_.generateIdempotencyToken();
          return _;
        }
        if (q.isBlobSchema()) {
          if (typeof _ === "string") return (this.serdeContext?.base64Decoder ?? _C8.fromBase64)(_);
          return _;
        }
        if (q.isTimestampSchema()) {
          if (typeof _ === "number" || typeof _ === "bigint") return IO_(new Date((Number(_) / 1000) | 0));
          return IO_(_);
        }
        if (typeof _ === "function" || typeof _ === "object") {
          let $ = _;
          if (q.isListSchema() && Array.isArray($)) {
            let O = !!q.getMergedTraits().sparse,
              T = [],
              z = 0;
            for (let A of $) {
              let f = this.serialize(q.getValueSchema(), A);
              if (f != null || O) T[z++] = f;
            }
            return T;
          }
          if ($ instanceof Date) return IO_($);
          let K = {};
          if (q.isMapSchema()) {
            let O = !!q.getMergedTraits().sparse;
            for (let T of Object.keys($)) {
              let z = this.serialize(q.getValueSchema(), $[T]);
              if (z != null || O) K[T] = z;
            }
          } else if (q.isStructSchema())
            for (let [O, T] of q.structIterator()) {
              let z = this.serialize(T, $[O]);
              if (z != null) K[O] = z;
            }
          else if (q.isDocumentSchema()) for (let O of Object.keys($)) K[O] = this.serialize(q.getValueSchema(), $[O]);
          return K;
        }
        return _;
      }
      flush() {
        let H = pO_.serialize(this.value);
        return (this.value = void 0), H;
      }
    }
    class z56 extends sxH.SerdeContext {
      read(H, _) {
        let q = pO_.deserialize(_);
        return this.readValue(H, q);
      }
      readValue(H, _) {
        let q = oMH.NormalizedSchema.of(H);
        if (q.isTimestampSchema() && typeof _ === "number") return mO_._parseEpochTimestamp(_);
        if (q.isBlobSchema()) {
          if (typeof _ === "string") return (this.serdeContext?.base64Decoder ?? _C8.fromBase64)(_);
          return _;
        }
        if (
          typeof _ > "u" ||
          typeof _ === "boolean" ||
          typeof _ === "number" ||
          typeof _ === "string" ||
          typeof _ === "bigint" ||
          typeof _ === "symbol"
        )
          return _;
        else if (typeof _ === "function" || typeof _ === "object") {
          if (_ === null) return null;
          if ("byteLength" in _) return _;
          if (_ instanceof Date) return _;
          if (q.isDocumentSchema()) return _;
          if (q.isListSchema()) {
            let K = [],
              O = q.getValueSchema(),
              T = !!q.getMergedTraits().sparse;
            for (let z of _) {
              let A = this.readValue(O, z);
              if (A != null || T) K.push(A);
            }
            return K;
          }
          let $ = {};
          if (q.isMapSchema()) {
            let K = !!q.getMergedTraits().sparse,
              O = q.getValueSchema();
            for (let T of Object.keys(_)) {
              let z = this.readValue(O, _[T]);
              if (z != null || K) $[T] = z;
            }
          } else if (q.isStructSchema())
            for (let [K, O] of q.structIterator()) {
              let T = this.readValue(O, _[K]);
              if (T != null) $[K] = T;
            }
          return $;
        } else return _;
      }
    }
    class fC8 extends sxH.RpcProtocol {
      codec = new O56();
      serializer = this.codec.createSerializer();
      deserializer = this.codec.createDeserializer();
      constructor({ defaultNamespace: H }) {
        super({ defaultNamespace: H });
      }
      getShapeId() {
        return "smithy.protocols#rpcv2Cbor";
      }
      getPayloadCodec() {
        return this.codec;
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q);
        if (
          (Object.assign($.headers, {
            "content-type": this.getDefaultContentType(),
            "smithy-protocol": "rpc-v2-cbor",
            accept: this.getDefaultContentType(),
          }),
          oMH.deref(H.input) === "unit")
        )
          delete $.body, delete $.headers["content-type"];
        else {
          if (!$.body) this.serializer.write(15, {}), ($.body = this.serializer.flush());
          try {
            $.headers["content-length"] = String($.body.byteLength);
          } catch (z) {}
        }
        let { service: K, operation: O } = PR$.getSmithyContext(q),
          T = `/service/${K}/operation/${O}`;
        if ($.path.endsWith("/")) $.path += T.slice(1);
        else $.path += T;
        return $;
      }
      async deserializeResponse(H, _, q) {
        return super.deserializeResponse(H, _, q);
      }
      async handleError(H, _, q, $, K) {
        let O = AC8(q, $) ?? "Unknown",
          T = this.options.defaultNamespace;
        if (O.includes("#")) [T] = O.split("#");
        let z = { $metadata: K, $fault: q.statusCode <= 500 ? "client" : "server" },
          A = oMH.TypeRegistry.for(T),
          f;
        try {
          f = A.getSchema(O);
        } catch (J) {
          if ($.Message) $.message = $.Message;
          let P = oMH.TypeRegistry.for("smithy.ts.sdk.synthetic." + T),
            X = P.getBaseException();
          if (X) {
            let R = P.getErrorCtor(X);
            throw Object.assign(new R({ name: O }), z, $);
          }
          throw Object.assign(Error(O), z, $);
        }
        let w = oMH.NormalizedSchema.of(f),
          Y = A.getErrorCtor(f),
          D = $.message ?? $.Message ?? "Unknown",
          j = new Y(D),
          M = {};
        for (let [J, P] of w.structIterator()) M[J] = this.deserializer.readValue(P, $[J]);
        throw Object.assign(j, z, { $fault: w.getMergedTraits().error, message: D }, M);
      }
      getDefaultContentType() {
        return "application/cbor";
      }
    }
    qk.CborCodec = O56;
    qk.CborShapeDeserializer = z56;
    qk.CborShapeSerializer = T56;
    qk.SmithyRpcV2CborProtocol = fC8;
    qk.buildHttpRpcRequest = xR$;
    qk.cbor = pO_;
    qk.checkCborResponse = uR$;
    qk.dateToTag = IO_;
    qk.loadSmithyRpcV2CborErrorCode = AC8;
    qk.parseCborBody = zC8;
    qk.parseCborErrorBody = IR$;
    qk.tag = $56;
    qk.tagSymbol = q56;
  });

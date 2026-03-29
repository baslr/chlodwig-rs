  var BI_ = d((Np7, hp7) => {
    Object.defineProperty(Np7, "__esModule", { value: !0 });
    var D$ = vp7(),
      X6 = D$.Reader,
      V1 = D$.Writer,
      rH = D$.util,
      UH = D$.roots.default || (D$.roots.default = {});
    UH.opentelemetry = (function () {
      var H = {};
      return (
        (H.proto = (function () {
          var _ = {};
          return (
            (_.common = (function () {
              var q = {};
              return (
                (q.v1 = (function () {
                  var $ = {};
                  return (
                    ($.AnyValue = (function () {
                      function K(T) {
                        if (T) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.stringValue = null),
                        (K.prototype.boolValue = null),
                        (K.prototype.intValue = null),
                        (K.prototype.doubleValue = null),
                        (K.prototype.arrayValue = null),
                        (K.prototype.kvlistValue = null),
                        (K.prototype.bytesValue = null);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "value", {
                          get: rH.oneOfGetter(
                            (O = [
                              "stringValue",
                              "boolValue",
                              "intValue",
                              "doubleValue",
                              "arrayValue",
                              "kvlistValue",
                              "bytesValue",
                            ]),
                          ),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.stringValue != null && Object.hasOwnProperty.call(z, "stringValue"))
                            A.uint32(10).string(z.stringValue);
                          if (z.boolValue != null && Object.hasOwnProperty.call(z, "boolValue"))
                            A.uint32(16).bool(z.boolValue);
                          if (z.intValue != null && Object.hasOwnProperty.call(z, "intValue"))
                            A.uint32(24).int64(z.intValue);
                          if (z.doubleValue != null && Object.hasOwnProperty.call(z, "doubleValue"))
                            A.uint32(33).double(z.doubleValue);
                          if (z.arrayValue != null && Object.hasOwnProperty.call(z, "arrayValue"))
                            UH.opentelemetry.proto.common.v1.ArrayValue.encode(
                              z.arrayValue,
                              A.uint32(42).fork(),
                            ).ldelim();
                          if (z.kvlistValue != null && Object.hasOwnProperty.call(z, "kvlistValue"))
                            UH.opentelemetry.proto.common.v1.KeyValueList.encode(
                              z.kvlistValue,
                              A.uint32(50).fork(),
                            ).ldelim();
                          if (z.bytesValue != null && Object.hasOwnProperty.call(z, "bytesValue"))
                            A.uint32(58).bytes(z.bytesValue);
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.common.v1.AnyValue();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 1: {
                                Y.stringValue = z.string();
                                break;
                              }
                              case 2: {
                                Y.boolValue = z.bool();
                                break;
                              }
                              case 3: {
                                Y.intValue = z.int64();
                                break;
                              }
                              case 4: {
                                Y.doubleValue = z.double();
                                break;
                              }
                              case 5: {
                                Y.arrayValue = UH.opentelemetry.proto.common.v1.ArrayValue.decode(z, z.uint32());
                                break;
                              }
                              case 6: {
                                Y.kvlistValue = UH.opentelemetry.proto.common.v1.KeyValueList.decode(z, z.uint32());
                                break;
                              }
                              case 7: {
                                Y.bytesValue = z.bytes();
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.stringValue != null && z.hasOwnProperty("stringValue")) {
                            if (((A.value = 1), !rH.isString(z.stringValue))) return "stringValue: string expected";
                          }
                          if (z.boolValue != null && z.hasOwnProperty("boolValue")) {
                            if (A.value === 1) return "value: multiple values";
                            if (((A.value = 1), typeof z.boolValue !== "boolean")) return "boolValue: boolean expected";
                          }
                          if (z.intValue != null && z.hasOwnProperty("intValue")) {
                            if (A.value === 1) return "value: multiple values";
                            if (
                              ((A.value = 1),
                              !rH.isInteger(z.intValue) &&
                                !(z.intValue && rH.isInteger(z.intValue.low) && rH.isInteger(z.intValue.high)))
                            )
                              return "intValue: integer|Long expected";
                          }
                          if (z.doubleValue != null && z.hasOwnProperty("doubleValue")) {
                            if (A.value === 1) return "value: multiple values";
                            if (((A.value = 1), typeof z.doubleValue !== "number"))
                              return "doubleValue: number expected";
                          }
                          if (z.arrayValue != null && z.hasOwnProperty("arrayValue")) {
                            if (A.value === 1) return "value: multiple values";
                            A.value = 1;
                            {
                              var f = UH.opentelemetry.proto.common.v1.ArrayValue.verify(z.arrayValue);
                              if (f) return "arrayValue." + f;
                            }
                          }
                          if (z.kvlistValue != null && z.hasOwnProperty("kvlistValue")) {
                            if (A.value === 1) return "value: multiple values";
                            A.value = 1;
                            {
                              var f = UH.opentelemetry.proto.common.v1.KeyValueList.verify(z.kvlistValue);
                              if (f) return "kvlistValue." + f;
                            }
                          }
                          if (z.bytesValue != null && z.hasOwnProperty("bytesValue")) {
                            if (A.value === 1) return "value: multiple values";
                            if (
                              ((A.value = 1),
                              !((z.bytesValue && typeof z.bytesValue.length === "number") || rH.isString(z.bytesValue)))
                            )
                              return "bytesValue: buffer expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.common.v1.AnyValue) return z;
                          var A = new UH.opentelemetry.proto.common.v1.AnyValue();
                          if (z.stringValue != null) A.stringValue = String(z.stringValue);
                          if (z.boolValue != null) A.boolValue = Boolean(z.boolValue);
                          if (z.intValue != null) {
                            if (rH.Long) (A.intValue = rH.Long.fromValue(z.intValue)).unsigned = !1;
                            else if (typeof z.intValue === "string") A.intValue = parseInt(z.intValue, 10);
                            else if (typeof z.intValue === "number") A.intValue = z.intValue;
                            else if (typeof z.intValue === "object")
                              A.intValue = new rH.LongBits(z.intValue.low >>> 0, z.intValue.high >>> 0).toNumber();
                          }
                          if (z.doubleValue != null) A.doubleValue = Number(z.doubleValue);
                          if (z.arrayValue != null) {
                            if (typeof z.arrayValue !== "object")
                              throw TypeError(".opentelemetry.proto.common.v1.AnyValue.arrayValue: object expected");
                            A.arrayValue = UH.opentelemetry.proto.common.v1.ArrayValue.fromObject(z.arrayValue);
                          }
                          if (z.kvlistValue != null) {
                            if (typeof z.kvlistValue !== "object")
                              throw TypeError(".opentelemetry.proto.common.v1.AnyValue.kvlistValue: object expected");
                            A.kvlistValue = UH.opentelemetry.proto.common.v1.KeyValueList.fromObject(z.kvlistValue);
                          }
                          if (z.bytesValue != null) {
                            if (typeof z.bytesValue === "string")
                              rH.base64.decode(
                                z.bytesValue,
                                (A.bytesValue = rH.newBuffer(rH.base64.length(z.bytesValue))),
                                0,
                              );
                            else if (z.bytesValue.length >= 0) A.bytesValue = z.bytesValue;
                          }
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (z.stringValue != null && z.hasOwnProperty("stringValue")) {
                            if (((f.stringValue = z.stringValue), A.oneofs)) f.value = "stringValue";
                          }
                          if (z.boolValue != null && z.hasOwnProperty("boolValue")) {
                            if (((f.boolValue = z.boolValue), A.oneofs)) f.value = "boolValue";
                          }
                          if (z.intValue != null && z.hasOwnProperty("intValue")) {
                            if (typeof z.intValue === "number")
                              f.intValue = A.longs === String ? String(z.intValue) : z.intValue;
                            else
                              f.intValue =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.intValue)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.intValue.low >>> 0, z.intValue.high >>> 0).toNumber()
                                    : z.intValue;
                            if (A.oneofs) f.value = "intValue";
                          }
                          if (z.doubleValue != null && z.hasOwnProperty("doubleValue")) {
                            if (
                              ((f.doubleValue =
                                A.json && !isFinite(z.doubleValue) ? String(z.doubleValue) : z.doubleValue),
                              A.oneofs)
                            )
                              f.value = "doubleValue";
                          }
                          if (z.arrayValue != null && z.hasOwnProperty("arrayValue")) {
                            if (
                              ((f.arrayValue = UH.opentelemetry.proto.common.v1.ArrayValue.toObject(z.arrayValue, A)),
                              A.oneofs)
                            )
                              f.value = "arrayValue";
                          }
                          if (z.kvlistValue != null && z.hasOwnProperty("kvlistValue")) {
                            if (
                              ((f.kvlistValue = UH.opentelemetry.proto.common.v1.KeyValueList.toObject(
                                z.kvlistValue,
                                A,
                              )),
                              A.oneofs)
                            )
                              f.value = "kvlistValue";
                          }
                          if (z.bytesValue != null && z.hasOwnProperty("bytesValue")) {
                            if (
                              ((f.bytesValue =
                                A.bytes === String
                                  ? rH.base64.encode(z.bytesValue, 0, z.bytesValue.length)
                                  : A.bytes === Array
                                    ? Array.prototype.slice.call(z.bytesValue)
                                    : z.bytesValue),
                              A.oneofs)
                            )
                              f.value = "bytesValue";
                          }
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.common.v1.AnyValue";
                        }),
                        K
                      );
                    })()),
                    ($.ArrayValue = (function () {
                      function K(O) {
                        if (((this.values = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.values = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.values != null && T.values.length)
                            for (var A = 0; A < T.values.length; ++A)
                              UH.opentelemetry.proto.common.v1.AnyValue.encode(
                                T.values[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.common.v1.ArrayValue();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.values && w.values.length)) w.values = [];
                                w.values.push(UH.opentelemetry.proto.common.v1.AnyValue.decode(T, T.uint32()));
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.values != null && T.hasOwnProperty("values")) {
                            if (!Array.isArray(T.values)) return "values: array expected";
                            for (var z = 0; z < T.values.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.AnyValue.verify(T.values[z]);
                              if (A) return "values." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.common.v1.ArrayValue) return T;
                          var z = new UH.opentelemetry.proto.common.v1.ArrayValue();
                          if (T.values) {
                            if (!Array.isArray(T.values))
                              throw TypeError(".opentelemetry.proto.common.v1.ArrayValue.values: array expected");
                            z.values = [];
                            for (var A = 0; A < T.values.length; ++A) {
                              if (typeof T.values[A] !== "object")
                                throw TypeError(".opentelemetry.proto.common.v1.ArrayValue.values: object expected");
                              z.values[A] = UH.opentelemetry.proto.common.v1.AnyValue.fromObject(T.values[A]);
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.values = [];
                          if (T.values && T.values.length) {
                            A.values = [];
                            for (var f = 0; f < T.values.length; ++f)
                              A.values[f] = UH.opentelemetry.proto.common.v1.AnyValue.toObject(T.values[f], z);
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.common.v1.ArrayValue";
                        }),
                        K
                      );
                    })()),
                    ($.KeyValueList = (function () {
                      function K(O) {
                        if (((this.values = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.values = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.values != null && T.values.length)
                            for (var A = 0; A < T.values.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.values[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.common.v1.KeyValueList();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.values && w.values.length)) w.values = [];
                                w.values.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.values != null && T.hasOwnProperty("values")) {
                            if (!Array.isArray(T.values)) return "values: array expected";
                            for (var z = 0; z < T.values.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.values[z]);
                              if (A) return "values." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.common.v1.KeyValueList) return T;
                          var z = new UH.opentelemetry.proto.common.v1.KeyValueList();
                          if (T.values) {
                            if (!Array.isArray(T.values))
                              throw TypeError(".opentelemetry.proto.common.v1.KeyValueList.values: array expected");
                            z.values = [];
                            for (var A = 0; A < T.values.length; ++A) {
                              if (typeof T.values[A] !== "object")
                                throw TypeError(".opentelemetry.proto.common.v1.KeyValueList.values: object expected");
                              z.values[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.values[A]);
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.values = [];
                          if (T.values && T.values.length) {
                            A.values = [];
                            for (var f = 0; f < T.values.length; ++f)
                              A.values[f] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.values[f], z);
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.common.v1.KeyValueList";
                        }),
                        K
                      );
                    })()),
                    ($.KeyValue = (function () {
                      function K(O) {
                        if (O) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.key = null),
                        (K.prototype.value = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.key != null && Object.hasOwnProperty.call(T, "key")) z.uint32(10).string(T.key);
                          if (T.value != null && Object.hasOwnProperty.call(T, "value"))
                            UH.opentelemetry.proto.common.v1.AnyValue.encode(T.value, z.uint32(18).fork()).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.common.v1.KeyValue();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.key = T.string();
                                break;
                              }
                              case 2: {
                                w.value = UH.opentelemetry.proto.common.v1.AnyValue.decode(T, T.uint32());
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.key != null && T.hasOwnProperty("key")) {
                            if (!rH.isString(T.key)) return "key: string expected";
                          }
                          if (T.value != null && T.hasOwnProperty("value")) {
                            var z = UH.opentelemetry.proto.common.v1.AnyValue.verify(T.value);
                            if (z) return "value." + z;
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.common.v1.KeyValue) return T;
                          var z = new UH.opentelemetry.proto.common.v1.KeyValue();
                          if (T.key != null) z.key = String(T.key);
                          if (T.value != null) {
                            if (typeof T.value !== "object")
                              throw TypeError(".opentelemetry.proto.common.v1.KeyValue.value: object expected");
                            z.value = UH.opentelemetry.proto.common.v1.AnyValue.fromObject(T.value);
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.defaults) (A.key = ""), (A.value = null);
                          if (T.key != null && T.hasOwnProperty("key")) A.key = T.key;
                          if (T.value != null && T.hasOwnProperty("value"))
                            A.value = UH.opentelemetry.proto.common.v1.AnyValue.toObject(T.value, z);
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.common.v1.KeyValue";
                        }),
                        K
                      );
                    })()),
                    ($.InstrumentationScope = (function () {
                      function K(O) {
                        if (((this.attributes = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.name = null),
                        (K.prototype.version = null),
                        (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.droppedAttributesCount = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.name != null && Object.hasOwnProperty.call(T, "name")) z.uint32(10).string(T.name);
                          if (T.version != null && Object.hasOwnProperty.call(T, "version"))
                            z.uint32(18).string(T.version);
                          if (T.attributes != null && T.attributes.length)
                            for (var A = 0; A < T.attributes.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.attributes[A],
                                z.uint32(26).fork(),
                              ).ldelim();
                          if (
                            T.droppedAttributesCount != null &&
                            Object.hasOwnProperty.call(T, "droppedAttributesCount")
                          )
                            z.uint32(32).uint32(T.droppedAttributesCount);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.common.v1.InstrumentationScope();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.name = T.string();
                                break;
                              }
                              case 2: {
                                w.version = T.string();
                                break;
                              }
                              case 3: {
                                if (!(w.attributes && w.attributes.length)) w.attributes = [];
                                w.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              case 4: {
                                w.droppedAttributesCount = T.uint32();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.name != null && T.hasOwnProperty("name")) {
                            if (!rH.isString(T.name)) return "name: string expected";
                          }
                          if (T.version != null && T.hasOwnProperty("version")) {
                            if (!rH.isString(T.version)) return "version: string expected";
                          }
                          if (T.attributes != null && T.hasOwnProperty("attributes")) {
                            if (!Array.isArray(T.attributes)) return "attributes: array expected";
                            for (var z = 0; z < T.attributes.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.attributes[z]);
                              if (A) return "attributes." + A;
                            }
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount")) {
                            if (!rH.isInteger(T.droppedAttributesCount))
                              return "droppedAttributesCount: integer expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.common.v1.InstrumentationScope) return T;
                          var z = new UH.opentelemetry.proto.common.v1.InstrumentationScope();
                          if (T.name != null) z.name = String(T.name);
                          if (T.version != null) z.version = String(T.version);
                          if (T.attributes) {
                            if (!Array.isArray(T.attributes))
                              throw TypeError(
                                ".opentelemetry.proto.common.v1.InstrumentationScope.attributes: array expected",
                              );
                            z.attributes = [];
                            for (var A = 0; A < T.attributes.length; ++A) {
                              if (typeof T.attributes[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.common.v1.InstrumentationScope.attributes: object expected",
                                );
                              z.attributes[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.attributes[A]);
                            }
                          }
                          if (T.droppedAttributesCount != null)
                            z.droppedAttributesCount = T.droppedAttributesCount >>> 0;
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.attributes = [];
                          if (z.defaults) (A.name = ""), (A.version = ""), (A.droppedAttributesCount = 0);
                          if (T.name != null && T.hasOwnProperty("name")) A.name = T.name;
                          if (T.version != null && T.hasOwnProperty("version")) A.version = T.version;
                          if (T.attributes && T.attributes.length) {
                            A.attributes = [];
                            for (var f = 0; f < T.attributes.length; ++f)
                              A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.attributes[f], z);
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount"))
                            A.droppedAttributesCount = T.droppedAttributesCount;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.common.v1.InstrumentationScope";
                        }),
                        K
                      );
                    })()),
                    ($.EntityRef = (function () {
                      function K(O) {
                        if (((this.idKeys = []), (this.descriptionKeys = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.schemaUrl = null),
                        (K.prototype.type = null),
                        (K.prototype.idKeys = rH.emptyArray),
                        (K.prototype.descriptionKeys = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(10).string(T.schemaUrl);
                          if (T.type != null && Object.hasOwnProperty.call(T, "type")) z.uint32(18).string(T.type);
                          if (T.idKeys != null && T.idKeys.length)
                            for (var A = 0; A < T.idKeys.length; ++A) z.uint32(26).string(T.idKeys[A]);
                          if (T.descriptionKeys != null && T.descriptionKeys.length)
                            for (var A = 0; A < T.descriptionKeys.length; ++A)
                              z.uint32(34).string(T.descriptionKeys[A]);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.common.v1.EntityRef();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              case 2: {
                                w.type = T.string();
                                break;
                              }
                              case 3: {
                                if (!(w.idKeys && w.idKeys.length)) w.idKeys = [];
                                w.idKeys.push(T.string());
                                break;
                              }
                              case 4: {
                                if (!(w.descriptionKeys && w.descriptionKeys.length)) w.descriptionKeys = [];
                                w.descriptionKeys.push(T.string());
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          if (T.type != null && T.hasOwnProperty("type")) {
                            if (!rH.isString(T.type)) return "type: string expected";
                          }
                          if (T.idKeys != null && T.hasOwnProperty("idKeys")) {
                            if (!Array.isArray(T.idKeys)) return "idKeys: array expected";
                            for (var z = 0; z < T.idKeys.length; ++z)
                              if (!rH.isString(T.idKeys[z])) return "idKeys: string[] expected";
                          }
                          if (T.descriptionKeys != null && T.hasOwnProperty("descriptionKeys")) {
                            if (!Array.isArray(T.descriptionKeys)) return "descriptionKeys: array expected";
                            for (var z = 0; z < T.descriptionKeys.length; ++z)
                              if (!rH.isString(T.descriptionKeys[z])) return "descriptionKeys: string[] expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.common.v1.EntityRef) return T;
                          var z = new UH.opentelemetry.proto.common.v1.EntityRef();
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          if (T.type != null) z.type = String(T.type);
                          if (T.idKeys) {
                            if (!Array.isArray(T.idKeys))
                              throw TypeError(".opentelemetry.proto.common.v1.EntityRef.idKeys: array expected");
                            z.idKeys = [];
                            for (var A = 0; A < T.idKeys.length; ++A) z.idKeys[A] = String(T.idKeys[A]);
                          }
                          if (T.descriptionKeys) {
                            if (!Array.isArray(T.descriptionKeys))
                              throw TypeError(
                                ".opentelemetry.proto.common.v1.EntityRef.descriptionKeys: array expected",
                              );
                            z.descriptionKeys = [];
                            for (var A = 0; A < T.descriptionKeys.length; ++A)
                              z.descriptionKeys[A] = String(T.descriptionKeys[A]);
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) (A.idKeys = []), (A.descriptionKeys = []);
                          if (z.defaults) (A.schemaUrl = ""), (A.type = "");
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          if (T.type != null && T.hasOwnProperty("type")) A.type = T.type;
                          if (T.idKeys && T.idKeys.length) {
                            A.idKeys = [];
                            for (var f = 0; f < T.idKeys.length; ++f) A.idKeys[f] = T.idKeys[f];
                          }
                          if (T.descriptionKeys && T.descriptionKeys.length) {
                            A.descriptionKeys = [];
                            for (var f = 0; f < T.descriptionKeys.length; ++f)
                              A.descriptionKeys[f] = T.descriptionKeys[f];
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.common.v1.EntityRef";
                        }),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            (_.resource = (function () {
              var q = {};
              return (
                (q.v1 = (function () {
                  var $ = {};
                  return (
                    ($.Resource = (function () {
                      function K(O) {
                        if (((this.attributes = []), (this.entityRefs = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.droppedAttributesCount = null),
                        (K.prototype.entityRefs = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.attributes != null && T.attributes.length)
                            for (var A = 0; A < T.attributes.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.attributes[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          if (
                            T.droppedAttributesCount != null &&
                            Object.hasOwnProperty.call(T, "droppedAttributesCount")
                          )
                            z.uint32(16).uint32(T.droppedAttributesCount);
                          if (T.entityRefs != null && T.entityRefs.length)
                            for (var A = 0; A < T.entityRefs.length; ++A)
                              UH.opentelemetry.proto.common.v1.EntityRef.encode(
                                T.entityRefs[A],
                                z.uint32(26).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.resource.v1.Resource();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.attributes && w.attributes.length)) w.attributes = [];
                                w.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              case 2: {
                                w.droppedAttributesCount = T.uint32();
                                break;
                              }
                              case 3: {
                                if (!(w.entityRefs && w.entityRefs.length)) w.entityRefs = [];
                                w.entityRefs.push(UH.opentelemetry.proto.common.v1.EntityRef.decode(T, T.uint32()));
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.attributes != null && T.hasOwnProperty("attributes")) {
                            if (!Array.isArray(T.attributes)) return "attributes: array expected";
                            for (var z = 0; z < T.attributes.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.attributes[z]);
                              if (A) return "attributes." + A;
                            }
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount")) {
                            if (!rH.isInteger(T.droppedAttributesCount))
                              return "droppedAttributesCount: integer expected";
                          }
                          if (T.entityRefs != null && T.hasOwnProperty("entityRefs")) {
                            if (!Array.isArray(T.entityRefs)) return "entityRefs: array expected";
                            for (var z = 0; z < T.entityRefs.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.EntityRef.verify(T.entityRefs[z]);
                              if (A) return "entityRefs." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.resource.v1.Resource) return T;
                          var z = new UH.opentelemetry.proto.resource.v1.Resource();
                          if (T.attributes) {
                            if (!Array.isArray(T.attributes))
                              throw TypeError(".opentelemetry.proto.resource.v1.Resource.attributes: array expected");
                            z.attributes = [];
                            for (var A = 0; A < T.attributes.length; ++A) {
                              if (typeof T.attributes[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.resource.v1.Resource.attributes: object expected",
                                );
                              z.attributes[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.attributes[A]);
                            }
                          }
                          if (T.droppedAttributesCount != null)
                            z.droppedAttributesCount = T.droppedAttributesCount >>> 0;
                          if (T.entityRefs) {
                            if (!Array.isArray(T.entityRefs))
                              throw TypeError(".opentelemetry.proto.resource.v1.Resource.entityRefs: array expected");
                            z.entityRefs = [];
                            for (var A = 0; A < T.entityRefs.length; ++A) {
                              if (typeof T.entityRefs[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.resource.v1.Resource.entityRefs: object expected",
                                );
                              z.entityRefs[A] = UH.opentelemetry.proto.common.v1.EntityRef.fromObject(T.entityRefs[A]);
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) (A.attributes = []), (A.entityRefs = []);
                          if (z.defaults) A.droppedAttributesCount = 0;
                          if (T.attributes && T.attributes.length) {
                            A.attributes = [];
                            for (var f = 0; f < T.attributes.length; ++f)
                              A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.attributes[f], z);
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount"))
                            A.droppedAttributesCount = T.droppedAttributesCount;
                          if (T.entityRefs && T.entityRefs.length) {
                            A.entityRefs = [];
                            for (var f = 0; f < T.entityRefs.length; ++f)
                              A.entityRefs[f] = UH.opentelemetry.proto.common.v1.EntityRef.toObject(T.entityRefs[f], z);
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.resource.v1.Resource";
                        }),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            (_.trace = (function () {
              var q = {};
              return (
                (q.v1 = (function () {
                  var $ = {};
                  return (
                    ($.TracesData = (function () {
                      function K(O) {
                        if (((this.resourceSpans = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resourceSpans = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resourceSpans != null && T.resourceSpans.length)
                            for (var A = 0; A < T.resourceSpans.length; ++A)
                              UH.opentelemetry.proto.trace.v1.ResourceSpans.encode(
                                T.resourceSpans[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.trace.v1.TracesData();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.resourceSpans && w.resourceSpans.length)) w.resourceSpans = [];
                                w.resourceSpans.push(
                                  UH.opentelemetry.proto.trace.v1.ResourceSpans.decode(T, T.uint32()),
                                );
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resourceSpans != null && T.hasOwnProperty("resourceSpans")) {
                            if (!Array.isArray(T.resourceSpans)) return "resourceSpans: array expected";
                            for (var z = 0; z < T.resourceSpans.length; ++z) {
                              var A = UH.opentelemetry.proto.trace.v1.ResourceSpans.verify(T.resourceSpans[z]);
                              if (A) return "resourceSpans." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.trace.v1.TracesData) return T;
                          var z = new UH.opentelemetry.proto.trace.v1.TracesData();
                          if (T.resourceSpans) {
                            if (!Array.isArray(T.resourceSpans))
                              throw TypeError(".opentelemetry.proto.trace.v1.TracesData.resourceSpans: array expected");
                            z.resourceSpans = [];
                            for (var A = 0; A < T.resourceSpans.length; ++A) {
                              if (typeof T.resourceSpans[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.trace.v1.TracesData.resourceSpans: object expected",
                                );
                              z.resourceSpans[A] = UH.opentelemetry.proto.trace.v1.ResourceSpans.fromObject(
                                T.resourceSpans[A],
                              );
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.resourceSpans = [];
                          if (T.resourceSpans && T.resourceSpans.length) {
                            A.resourceSpans = [];
                            for (var f = 0; f < T.resourceSpans.length; ++f)
                              A.resourceSpans[f] = UH.opentelemetry.proto.trace.v1.ResourceSpans.toObject(
                                T.resourceSpans[f],
                                z,
                              );
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.trace.v1.TracesData";
                        }),
                        K
                      );
                    })()),
                    ($.ResourceSpans = (function () {
                      function K(O) {
                        if (((this.scopeSpans = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resource = null),
                        (K.prototype.scopeSpans = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resource != null && Object.hasOwnProperty.call(T, "resource"))
                            UH.opentelemetry.proto.resource.v1.Resource.encode(
                              T.resource,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.scopeSpans != null && T.scopeSpans.length)
                            for (var A = 0; A < T.scopeSpans.length; ++A)
                              UH.opentelemetry.proto.trace.v1.ScopeSpans.encode(
                                T.scopeSpans[A],
                                z.uint32(18).fork(),
                              ).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.trace.v1.ResourceSpans();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.resource = UH.opentelemetry.proto.resource.v1.Resource.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.scopeSpans && w.scopeSpans.length)) w.scopeSpans = [];
                                w.scopeSpans.push(UH.opentelemetry.proto.trace.v1.ScopeSpans.decode(T, T.uint32()));
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resource != null && T.hasOwnProperty("resource")) {
                            var z = UH.opentelemetry.proto.resource.v1.Resource.verify(T.resource);
                            if (z) return "resource." + z;
                          }
                          if (T.scopeSpans != null && T.hasOwnProperty("scopeSpans")) {
                            if (!Array.isArray(T.scopeSpans)) return "scopeSpans: array expected";
                            for (var A = 0; A < T.scopeSpans.length; ++A) {
                              var z = UH.opentelemetry.proto.trace.v1.ScopeSpans.verify(T.scopeSpans[A]);
                              if (z) return "scopeSpans." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.trace.v1.ResourceSpans) return T;
                          var z = new UH.opentelemetry.proto.trace.v1.ResourceSpans();
                          if (T.resource != null) {
                            if (typeof T.resource !== "object")
                              throw TypeError(".opentelemetry.proto.trace.v1.ResourceSpans.resource: object expected");
                            z.resource = UH.opentelemetry.proto.resource.v1.Resource.fromObject(T.resource);
                          }
                          if (T.scopeSpans) {
                            if (!Array.isArray(T.scopeSpans))
                              throw TypeError(".opentelemetry.proto.trace.v1.ResourceSpans.scopeSpans: array expected");
                            z.scopeSpans = [];
                            for (var A = 0; A < T.scopeSpans.length; ++A) {
                              if (typeof T.scopeSpans[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.trace.v1.ResourceSpans.scopeSpans: object expected",
                                );
                              z.scopeSpans[A] = UH.opentelemetry.proto.trace.v1.ScopeSpans.fromObject(T.scopeSpans[A]);
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.scopeSpans = [];
                          if (z.defaults) (A.resource = null), (A.schemaUrl = "");
                          if (T.resource != null && T.hasOwnProperty("resource"))
                            A.resource = UH.opentelemetry.proto.resource.v1.Resource.toObject(T.resource, z);
                          if (T.scopeSpans && T.scopeSpans.length) {
                            A.scopeSpans = [];
                            for (var f = 0; f < T.scopeSpans.length; ++f)
                              A.scopeSpans[f] = UH.opentelemetry.proto.trace.v1.ScopeSpans.toObject(T.scopeSpans[f], z);
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.trace.v1.ResourceSpans";
                        }),
                        K
                      );
                    })()),
                    ($.ScopeSpans = (function () {
                      function K(O) {
                        if (((this.spans = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.scope = null),
                        (K.prototype.spans = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.scope != null && Object.hasOwnProperty.call(T, "scope"))
                            UH.opentelemetry.proto.common.v1.InstrumentationScope.encode(
                              T.scope,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.spans != null && T.spans.length)
                            for (var A = 0; A < T.spans.length; ++A)
                              UH.opentelemetry.proto.trace.v1.Span.encode(T.spans[A], z.uint32(18).fork()).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.trace.v1.ScopeSpans();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.spans && w.spans.length)) w.spans = [];
                                w.spans.push(UH.opentelemetry.proto.trace.v1.Span.decode(T, T.uint32()));
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.scope != null && T.hasOwnProperty("scope")) {
                            var z = UH.opentelemetry.proto.common.v1.InstrumentationScope.verify(T.scope);
                            if (z) return "scope." + z;
                          }
                          if (T.spans != null && T.hasOwnProperty("spans")) {
                            if (!Array.isArray(T.spans)) return "spans: array expected";
                            for (var A = 0; A < T.spans.length; ++A) {
                              var z = UH.opentelemetry.proto.trace.v1.Span.verify(T.spans[A]);
                              if (z) return "spans." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.trace.v1.ScopeSpans) return T;
                          var z = new UH.opentelemetry.proto.trace.v1.ScopeSpans();
                          if (T.scope != null) {
                            if (typeof T.scope !== "object")
                              throw TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.scope: object expected");
                            z.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.fromObject(T.scope);
                          }
                          if (T.spans) {
                            if (!Array.isArray(T.spans))
                              throw TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.spans: array expected");
                            z.spans = [];
                            for (var A = 0; A < T.spans.length; ++A) {
                              if (typeof T.spans[A] !== "object")
                                throw TypeError(".opentelemetry.proto.trace.v1.ScopeSpans.spans: object expected");
                              z.spans[A] = UH.opentelemetry.proto.trace.v1.Span.fromObject(T.spans[A]);
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.spans = [];
                          if (z.defaults) (A.scope = null), (A.schemaUrl = "");
                          if (T.scope != null && T.hasOwnProperty("scope"))
                            A.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.toObject(T.scope, z);
                          if (T.spans && T.spans.length) {
                            A.spans = [];
                            for (var f = 0; f < T.spans.length; ++f)
                              A.spans[f] = UH.opentelemetry.proto.trace.v1.Span.toObject(T.spans[f], z);
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.trace.v1.ScopeSpans";
                        }),
                        K
                      );
                    })()),
                    ($.Span = (function () {
                      function K(O) {
                        if (((this.attributes = []), (this.events = []), (this.links = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.traceId = null),
                        (K.prototype.spanId = null),
                        (K.prototype.traceState = null),
                        (K.prototype.parentSpanId = null),
                        (K.prototype.flags = null),
                        (K.prototype.name = null),
                        (K.prototype.kind = null),
                        (K.prototype.startTimeUnixNano = null),
                        (K.prototype.endTimeUnixNano = null),
                        (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.droppedAttributesCount = null),
                        (K.prototype.events = rH.emptyArray),
                        (K.prototype.droppedEventsCount = null),
                        (K.prototype.links = rH.emptyArray),
                        (K.prototype.droppedLinksCount = null),
                        (K.prototype.status = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.traceId != null && Object.hasOwnProperty.call(T, "traceId"))
                            z.uint32(10).bytes(T.traceId);
                          if (T.spanId != null && Object.hasOwnProperty.call(T, "spanId")) z.uint32(18).bytes(T.spanId);
                          if (T.traceState != null && Object.hasOwnProperty.call(T, "traceState"))
                            z.uint32(26).string(T.traceState);
                          if (T.parentSpanId != null && Object.hasOwnProperty.call(T, "parentSpanId"))
                            z.uint32(34).bytes(T.parentSpanId);
                          if (T.name != null && Object.hasOwnProperty.call(T, "name")) z.uint32(42).string(T.name);
                          if (T.kind != null && Object.hasOwnProperty.call(T, "kind")) z.uint32(48).int32(T.kind);
                          if (T.startTimeUnixNano != null && Object.hasOwnProperty.call(T, "startTimeUnixNano"))
                            z.uint32(57).fixed64(T.startTimeUnixNano);
                          if (T.endTimeUnixNano != null && Object.hasOwnProperty.call(T, "endTimeUnixNano"))
                            z.uint32(65).fixed64(T.endTimeUnixNano);
                          if (T.attributes != null && T.attributes.length)
                            for (var A = 0; A < T.attributes.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.attributes[A],
                                z.uint32(74).fork(),
                              ).ldelim();
                          if (
                            T.droppedAttributesCount != null &&
                            Object.hasOwnProperty.call(T, "droppedAttributesCount")
                          )
                            z.uint32(80).uint32(T.droppedAttributesCount);
                          if (T.events != null && T.events.length)
                            for (var A = 0; A < T.events.length; ++A)
                              UH.opentelemetry.proto.trace.v1.Span.Event.encode(
                                T.events[A],
                                z.uint32(90).fork(),
                              ).ldelim();
                          if (T.droppedEventsCount != null && Object.hasOwnProperty.call(T, "droppedEventsCount"))
                            z.uint32(96).uint32(T.droppedEventsCount);
                          if (T.links != null && T.links.length)
                            for (var A = 0; A < T.links.length; ++A)
                              UH.opentelemetry.proto.trace.v1.Span.Link.encode(
                                T.links[A],
                                z.uint32(106).fork(),
                              ).ldelim();
                          if (T.droppedLinksCount != null && Object.hasOwnProperty.call(T, "droppedLinksCount"))
                            z.uint32(112).uint32(T.droppedLinksCount);
                          if (T.status != null && Object.hasOwnProperty.call(T, "status"))
                            UH.opentelemetry.proto.trace.v1.Status.encode(T.status, z.uint32(122).fork()).ldelim();
                          if (T.flags != null && Object.hasOwnProperty.call(T, "flags")) z.uint32(133).fixed32(T.flags);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.trace.v1.Span();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.traceId = T.bytes();
                                break;
                              }
                              case 2: {
                                w.spanId = T.bytes();
                                break;
                              }
                              case 3: {
                                w.traceState = T.string();
                                break;
                              }
                              case 4: {
                                w.parentSpanId = T.bytes();
                                break;
                              }
                              case 16: {
                                w.flags = T.fixed32();
                                break;
                              }
                              case 5: {
                                w.name = T.string();
                                break;
                              }
                              case 6: {
                                w.kind = T.int32();
                                break;
                              }
                              case 7: {
                                w.startTimeUnixNano = T.fixed64();
                                break;
                              }
                              case 8: {
                                w.endTimeUnixNano = T.fixed64();
                                break;
                              }
                              case 9: {
                                if (!(w.attributes && w.attributes.length)) w.attributes = [];
                                w.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              case 10: {
                                w.droppedAttributesCount = T.uint32();
                                break;
                              }
                              case 11: {
                                if (!(w.events && w.events.length)) w.events = [];
                                w.events.push(UH.opentelemetry.proto.trace.v1.Span.Event.decode(T, T.uint32()));
                                break;
                              }
                              case 12: {
                                w.droppedEventsCount = T.uint32();
                                break;
                              }
                              case 13: {
                                if (!(w.links && w.links.length)) w.links = [];
                                w.links.push(UH.opentelemetry.proto.trace.v1.Span.Link.decode(T, T.uint32()));
                                break;
                              }
                              case 14: {
                                w.droppedLinksCount = T.uint32();
                                break;
                              }
                              case 15: {
                                w.status = UH.opentelemetry.proto.trace.v1.Status.decode(T, T.uint32());
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.traceId != null && T.hasOwnProperty("traceId")) {
                            if (!((T.traceId && typeof T.traceId.length === "number") || rH.isString(T.traceId)))
                              return "traceId: buffer expected";
                          }
                          if (T.spanId != null && T.hasOwnProperty("spanId")) {
                            if (!((T.spanId && typeof T.spanId.length === "number") || rH.isString(T.spanId)))
                              return "spanId: buffer expected";
                          }
                          if (T.traceState != null && T.hasOwnProperty("traceState")) {
                            if (!rH.isString(T.traceState)) return "traceState: string expected";
                          }
                          if (T.parentSpanId != null && T.hasOwnProperty("parentSpanId")) {
                            if (
                              !(
                                (T.parentSpanId && typeof T.parentSpanId.length === "number") ||
                                rH.isString(T.parentSpanId)
                              )
                            )
                              return "parentSpanId: buffer expected";
                          }
                          if (T.flags != null && T.hasOwnProperty("flags")) {
                            if (!rH.isInteger(T.flags)) return "flags: integer expected";
                          }
                          if (T.name != null && T.hasOwnProperty("name")) {
                            if (!rH.isString(T.name)) return "name: string expected";
                          }
                          if (T.kind != null && T.hasOwnProperty("kind"))
                            switch (T.kind) {
                              default:
                                return "kind: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                              case 3:
                              case 4:
                              case 5:
                                break;
                            }
                          if (T.startTimeUnixNano != null && T.hasOwnProperty("startTimeUnixNano")) {
                            if (
                              !rH.isInteger(T.startTimeUnixNano) &&
                              !(
                                T.startTimeUnixNano &&
                                rH.isInteger(T.startTimeUnixNano.low) &&
                                rH.isInteger(T.startTimeUnixNano.high)
                              )
                            )
                              return "startTimeUnixNano: integer|Long expected";
                          }
                          if (T.endTimeUnixNano != null && T.hasOwnProperty("endTimeUnixNano")) {
                            if (
                              !rH.isInteger(T.endTimeUnixNano) &&
                              !(
                                T.endTimeUnixNano &&
                                rH.isInteger(T.endTimeUnixNano.low) &&
                                rH.isInteger(T.endTimeUnixNano.high)
                              )
                            )
                              return "endTimeUnixNano: integer|Long expected";
                          }
                          if (T.attributes != null && T.hasOwnProperty("attributes")) {
                            if (!Array.isArray(T.attributes)) return "attributes: array expected";
                            for (var z = 0; z < T.attributes.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.attributes[z]);
                              if (A) return "attributes." + A;
                            }
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount")) {
                            if (!rH.isInteger(T.droppedAttributesCount))
                              return "droppedAttributesCount: integer expected";
                          }
                          if (T.events != null && T.hasOwnProperty("events")) {
                            if (!Array.isArray(T.events)) return "events: array expected";
                            for (var z = 0; z < T.events.length; ++z) {
                              var A = UH.opentelemetry.proto.trace.v1.Span.Event.verify(T.events[z]);
                              if (A) return "events." + A;
                            }
                          }
                          if (T.droppedEventsCount != null && T.hasOwnProperty("droppedEventsCount")) {
                            if (!rH.isInteger(T.droppedEventsCount)) return "droppedEventsCount: integer expected";
                          }
                          if (T.links != null && T.hasOwnProperty("links")) {
                            if (!Array.isArray(T.links)) return "links: array expected";
                            for (var z = 0; z < T.links.length; ++z) {
                              var A = UH.opentelemetry.proto.trace.v1.Span.Link.verify(T.links[z]);
                              if (A) return "links." + A;
                            }
                          }
                          if (T.droppedLinksCount != null && T.hasOwnProperty("droppedLinksCount")) {
                            if (!rH.isInteger(T.droppedLinksCount)) return "droppedLinksCount: integer expected";
                          }
                          if (T.status != null && T.hasOwnProperty("status")) {
                            var A = UH.opentelemetry.proto.trace.v1.Status.verify(T.status);
                            if (A) return "status." + A;
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.trace.v1.Span) return T;
                          var z = new UH.opentelemetry.proto.trace.v1.Span();
                          if (T.traceId != null) {
                            if (typeof T.traceId === "string")
                              rH.base64.decode(T.traceId, (z.traceId = rH.newBuffer(rH.base64.length(T.traceId))), 0);
                            else if (T.traceId.length >= 0) z.traceId = T.traceId;
                          }
                          if (T.spanId != null) {
                            if (typeof T.spanId === "string")
                              rH.base64.decode(T.spanId, (z.spanId = rH.newBuffer(rH.base64.length(T.spanId))), 0);
                            else if (T.spanId.length >= 0) z.spanId = T.spanId;
                          }
                          if (T.traceState != null) z.traceState = String(T.traceState);
                          if (T.parentSpanId != null) {
                            if (typeof T.parentSpanId === "string")
                              rH.base64.decode(
                                T.parentSpanId,
                                (z.parentSpanId = rH.newBuffer(rH.base64.length(T.parentSpanId))),
                                0,
                              );
                            else if (T.parentSpanId.length >= 0) z.parentSpanId = T.parentSpanId;
                          }
                          if (T.flags != null) z.flags = T.flags >>> 0;
                          if (T.name != null) z.name = String(T.name);
                          switch (T.kind) {
                            default:
                              if (typeof T.kind === "number") {
                                z.kind = T.kind;
                                break;
                              }
                              break;
                            case "SPAN_KIND_UNSPECIFIED":
                            case 0:
                              z.kind = 0;
                              break;
                            case "SPAN_KIND_INTERNAL":
                            case 1:
                              z.kind = 1;
                              break;
                            case "SPAN_KIND_SERVER":
                            case 2:
                              z.kind = 2;
                              break;
                            case "SPAN_KIND_CLIENT":
                            case 3:
                              z.kind = 3;
                              break;
                            case "SPAN_KIND_PRODUCER":
                            case 4:
                              z.kind = 4;
                              break;
                            case "SPAN_KIND_CONSUMER":
                            case 5:
                              z.kind = 5;
                              break;
                          }
                          if (T.startTimeUnixNano != null) {
                            if (rH.Long) (z.startTimeUnixNano = rH.Long.fromValue(T.startTimeUnixNano)).unsigned = !1;
                            else if (typeof T.startTimeUnixNano === "string")
                              z.startTimeUnixNano = parseInt(T.startTimeUnixNano, 10);
                            else if (typeof T.startTimeUnixNano === "number") z.startTimeUnixNano = T.startTimeUnixNano;
                            else if (typeof T.startTimeUnixNano === "object")
                              z.startTimeUnixNano = new rH.LongBits(
                                T.startTimeUnixNano.low >>> 0,
                                T.startTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (T.endTimeUnixNano != null) {
                            if (rH.Long) (z.endTimeUnixNano = rH.Long.fromValue(T.endTimeUnixNano)).unsigned = !1;
                            else if (typeof T.endTimeUnixNano === "string")
                              z.endTimeUnixNano = parseInt(T.endTimeUnixNano, 10);
                            else if (typeof T.endTimeUnixNano === "number") z.endTimeUnixNano = T.endTimeUnixNano;
                            else if (typeof T.endTimeUnixNano === "object")
                              z.endTimeUnixNano = new rH.LongBits(
                                T.endTimeUnixNano.low >>> 0,
                                T.endTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (T.attributes) {
                            if (!Array.isArray(T.attributes))
                              throw TypeError(".opentelemetry.proto.trace.v1.Span.attributes: array expected");
                            z.attributes = [];
                            for (var A = 0; A < T.attributes.length; ++A) {
                              if (typeof T.attributes[A] !== "object")
                                throw TypeError(".opentelemetry.proto.trace.v1.Span.attributes: object expected");
                              z.attributes[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.attributes[A]);
                            }
                          }
                          if (T.droppedAttributesCount != null)
                            z.droppedAttributesCount = T.droppedAttributesCount >>> 0;
                          if (T.events) {
                            if (!Array.isArray(T.events))
                              throw TypeError(".opentelemetry.proto.trace.v1.Span.events: array expected");
                            z.events = [];
                            for (var A = 0; A < T.events.length; ++A) {
                              if (typeof T.events[A] !== "object")
                                throw TypeError(".opentelemetry.proto.trace.v1.Span.events: object expected");
                              z.events[A] = UH.opentelemetry.proto.trace.v1.Span.Event.fromObject(T.events[A]);
                            }
                          }
                          if (T.droppedEventsCount != null) z.droppedEventsCount = T.droppedEventsCount >>> 0;
                          if (T.links) {
                            if (!Array.isArray(T.links))
                              throw TypeError(".opentelemetry.proto.trace.v1.Span.links: array expected");
                            z.links = [];
                            for (var A = 0; A < T.links.length; ++A) {
                              if (typeof T.links[A] !== "object")
                                throw TypeError(".opentelemetry.proto.trace.v1.Span.links: object expected");
                              z.links[A] = UH.opentelemetry.proto.trace.v1.Span.Link.fromObject(T.links[A]);
                            }
                          }
                          if (T.droppedLinksCount != null) z.droppedLinksCount = T.droppedLinksCount >>> 0;
                          if (T.status != null) {
                            if (typeof T.status !== "object")
                              throw TypeError(".opentelemetry.proto.trace.v1.Span.status: object expected");
                            z.status = UH.opentelemetry.proto.trace.v1.Status.fromObject(T.status);
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) (A.attributes = []), (A.events = []), (A.links = []);
                          if (z.defaults) {
                            if (z.bytes === String) A.traceId = "";
                            else if (((A.traceId = []), z.bytes !== Array)) A.traceId = rH.newBuffer(A.traceId);
                            if (z.bytes === String) A.spanId = "";
                            else if (((A.spanId = []), z.bytes !== Array)) A.spanId = rH.newBuffer(A.spanId);
                            if (((A.traceState = ""), z.bytes === String)) A.parentSpanId = "";
                            else if (((A.parentSpanId = []), z.bytes !== Array))
                              A.parentSpanId = rH.newBuffer(A.parentSpanId);
                            if (((A.name = ""), (A.kind = z.enums === String ? "SPAN_KIND_UNSPECIFIED" : 0), rH.Long)) {
                              var f = new rH.Long(0, 0, !1);
                              A.startTimeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.startTimeUnixNano = z.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.endTimeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.endTimeUnixNano = z.longs === String ? "0" : 0;
                            (A.droppedAttributesCount = 0),
                              (A.droppedEventsCount = 0),
                              (A.droppedLinksCount = 0),
                              (A.status = null),
                              (A.flags = 0);
                          }
                          if (T.traceId != null && T.hasOwnProperty("traceId"))
                            A.traceId =
                              z.bytes === String
                                ? rH.base64.encode(T.traceId, 0, T.traceId.length)
                                : z.bytes === Array
                                  ? Array.prototype.slice.call(T.traceId)
                                  : T.traceId;
                          if (T.spanId != null && T.hasOwnProperty("spanId"))
                            A.spanId =
                              z.bytes === String
                                ? rH.base64.encode(T.spanId, 0, T.spanId.length)
                                : z.bytes === Array
                                  ? Array.prototype.slice.call(T.spanId)
                                  : T.spanId;
                          if (T.traceState != null && T.hasOwnProperty("traceState")) A.traceState = T.traceState;
                          if (T.parentSpanId != null && T.hasOwnProperty("parentSpanId"))
                            A.parentSpanId =
                              z.bytes === String
                                ? rH.base64.encode(T.parentSpanId, 0, T.parentSpanId.length)
                                : z.bytes === Array
                                  ? Array.prototype.slice.call(T.parentSpanId)
                                  : T.parentSpanId;
                          if (T.name != null && T.hasOwnProperty("name")) A.name = T.name;
                          if (T.kind != null && T.hasOwnProperty("kind"))
                            A.kind =
                              z.enums === String
                                ? UH.opentelemetry.proto.trace.v1.Span.SpanKind[T.kind] === void 0
                                  ? T.kind
                                  : UH.opentelemetry.proto.trace.v1.Span.SpanKind[T.kind]
                                : T.kind;
                          if (T.startTimeUnixNano != null && T.hasOwnProperty("startTimeUnixNano"))
                            if (typeof T.startTimeUnixNano === "number")
                              A.startTimeUnixNano =
                                z.longs === String ? String(T.startTimeUnixNano) : T.startTimeUnixNano;
                            else
                              A.startTimeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.startTimeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(
                                        T.startTimeUnixNano.low >>> 0,
                                        T.startTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : T.startTimeUnixNano;
                          if (T.endTimeUnixNano != null && T.hasOwnProperty("endTimeUnixNano"))
                            if (typeof T.endTimeUnixNano === "number")
                              A.endTimeUnixNano = z.longs === String ? String(T.endTimeUnixNano) : T.endTimeUnixNano;
                            else
                              A.endTimeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.endTimeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(
                                        T.endTimeUnixNano.low >>> 0,
                                        T.endTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : T.endTimeUnixNano;
                          if (T.attributes && T.attributes.length) {
                            A.attributes = [];
                            for (var w = 0; w < T.attributes.length; ++w)
                              A.attributes[w] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.attributes[w], z);
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount"))
                            A.droppedAttributesCount = T.droppedAttributesCount;
                          if (T.events && T.events.length) {
                            A.events = [];
                            for (var w = 0; w < T.events.length; ++w)
                              A.events[w] = UH.opentelemetry.proto.trace.v1.Span.Event.toObject(T.events[w], z);
                          }
                          if (T.droppedEventsCount != null && T.hasOwnProperty("droppedEventsCount"))
                            A.droppedEventsCount = T.droppedEventsCount;
                          if (T.links && T.links.length) {
                            A.links = [];
                            for (var w = 0; w < T.links.length; ++w)
                              A.links[w] = UH.opentelemetry.proto.trace.v1.Span.Link.toObject(T.links[w], z);
                          }
                          if (T.droppedLinksCount != null && T.hasOwnProperty("droppedLinksCount"))
                            A.droppedLinksCount = T.droppedLinksCount;
                          if (T.status != null && T.hasOwnProperty("status"))
                            A.status = UH.opentelemetry.proto.trace.v1.Status.toObject(T.status, z);
                          if (T.flags != null && T.hasOwnProperty("flags")) A.flags = T.flags;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.trace.v1.Span";
                        }),
                        (K.SpanKind = (function () {
                          var O = {},
                            T = Object.create(O);
                          return (
                            (T[(O[0] = "SPAN_KIND_UNSPECIFIED")] = 0),
                            (T[(O[1] = "SPAN_KIND_INTERNAL")] = 1),
                            (T[(O[2] = "SPAN_KIND_SERVER")] = 2),
                            (T[(O[3] = "SPAN_KIND_CLIENT")] = 3),
                            (T[(O[4] = "SPAN_KIND_PRODUCER")] = 4),
                            (T[(O[5] = "SPAN_KIND_CONSUMER")] = 5),
                            T
                          );
                        })()),
                        (K.Event = (function () {
                          function O(T) {
                            if (((this.attributes = []), T)) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.timeUnixNano = null),
                            (O.prototype.name = null),
                            (O.prototype.attributes = rH.emptyArray),
                            (O.prototype.droppedAttributesCount = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.timeUnixNano != null && Object.hasOwnProperty.call(z, "timeUnixNano"))
                                A.uint32(9).fixed64(z.timeUnixNano);
                              if (z.name != null && Object.hasOwnProperty.call(z, "name")) A.uint32(18).string(z.name);
                              if (z.attributes != null && z.attributes.length)
                                for (var f = 0; f < z.attributes.length; ++f)
                                  UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                    z.attributes[f],
                                    A.uint32(26).fork(),
                                  ).ldelim();
                              if (
                                z.droppedAttributesCount != null &&
                                Object.hasOwnProperty.call(z, "droppedAttributesCount")
                              )
                                A.uint32(32).uint32(z.droppedAttributesCount);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.trace.v1.Span.Event();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.timeUnixNano = z.fixed64();
                                    break;
                                  }
                                  case 2: {
                                    Y.name = z.string();
                                    break;
                                  }
                                  case 3: {
                                    if (!(Y.attributes && Y.attributes.length)) Y.attributes = [];
                                    Y.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                    break;
                                  }
                                  case 4: {
                                    Y.droppedAttributesCount = z.uint32();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano")) {
                                if (
                                  !rH.isInteger(z.timeUnixNano) &&
                                  !(
                                    z.timeUnixNano &&
                                    rH.isInteger(z.timeUnixNano.low) &&
                                    rH.isInteger(z.timeUnixNano.high)
                                  )
                                )
                                  return "timeUnixNano: integer|Long expected";
                              }
                              if (z.name != null && z.hasOwnProperty("name")) {
                                if (!rH.isString(z.name)) return "name: string expected";
                              }
                              if (z.attributes != null && z.hasOwnProperty("attributes")) {
                                if (!Array.isArray(z.attributes)) return "attributes: array expected";
                                for (var A = 0; A < z.attributes.length; ++A) {
                                  var f = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.attributes[A]);
                                  if (f) return "attributes." + f;
                                }
                              }
                              if (z.droppedAttributesCount != null && z.hasOwnProperty("droppedAttributesCount")) {
                                if (!rH.isInteger(z.droppedAttributesCount))
                                  return "droppedAttributesCount: integer expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.trace.v1.Span.Event) return z;
                              var A = new UH.opentelemetry.proto.trace.v1.Span.Event();
                              if (z.timeUnixNano != null) {
                                if (rH.Long) (A.timeUnixNano = rH.Long.fromValue(z.timeUnixNano)).unsigned = !1;
                                else if (typeof z.timeUnixNano === "string")
                                  A.timeUnixNano = parseInt(z.timeUnixNano, 10);
                                else if (typeof z.timeUnixNano === "number") A.timeUnixNano = z.timeUnixNano;
                                else if (typeof z.timeUnixNano === "object")
                                  A.timeUnixNano = new rH.LongBits(
                                    z.timeUnixNano.low >>> 0,
                                    z.timeUnixNano.high >>> 0,
                                  ).toNumber();
                              }
                              if (z.name != null) A.name = String(z.name);
                              if (z.attributes) {
                                if (!Array.isArray(z.attributes))
                                  throw TypeError(
                                    ".opentelemetry.proto.trace.v1.Span.Event.attributes: array expected",
                                  );
                                A.attributes = [];
                                for (var f = 0; f < z.attributes.length; ++f) {
                                  if (typeof z.attributes[f] !== "object")
                                    throw TypeError(
                                      ".opentelemetry.proto.trace.v1.Span.Event.attributes: object expected",
                                    );
                                  A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(
                                    z.attributes[f],
                                  );
                                }
                              }
                              if (z.droppedAttributesCount != null)
                                A.droppedAttributesCount = z.droppedAttributesCount >>> 0;
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.arrays || A.defaults) f.attributes = [];
                              if (A.defaults) {
                                if (rH.Long) {
                                  var w = new rH.Long(0, 0, !1);
                                  f.timeUnixNano =
                                    A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                                } else f.timeUnixNano = A.longs === String ? "0" : 0;
                                (f.name = ""), (f.droppedAttributesCount = 0);
                              }
                              if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano"))
                                if (typeof z.timeUnixNano === "number")
                                  f.timeUnixNano = A.longs === String ? String(z.timeUnixNano) : z.timeUnixNano;
                                else
                                  f.timeUnixNano =
                                    A.longs === String
                                      ? rH.Long.prototype.toString.call(z.timeUnixNano)
                                      : A.longs === Number
                                        ? new rH.LongBits(
                                            z.timeUnixNano.low >>> 0,
                                            z.timeUnixNano.high >>> 0,
                                          ).toNumber()
                                        : z.timeUnixNano;
                              if (z.name != null && z.hasOwnProperty("name")) f.name = z.name;
                              if (z.attributes && z.attributes.length) {
                                f.attributes = [];
                                for (var Y = 0; Y < z.attributes.length; ++Y)
                                  f.attributes[Y] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(
                                    z.attributes[Y],
                                    A,
                                  );
                              }
                              if (z.droppedAttributesCount != null && z.hasOwnProperty("droppedAttributesCount"))
                                f.droppedAttributesCount = z.droppedAttributesCount;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.trace.v1.Span.Event";
                            }),
                            O
                          );
                        })()),
                        (K.Link = (function () {
                          function O(T) {
                            if (((this.attributes = []), T)) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.traceId = null),
                            (O.prototype.spanId = null),
                            (O.prototype.traceState = null),
                            (O.prototype.attributes = rH.emptyArray),
                            (O.prototype.droppedAttributesCount = null),
                            (O.prototype.flags = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.traceId != null && Object.hasOwnProperty.call(z, "traceId"))
                                A.uint32(10).bytes(z.traceId);
                              if (z.spanId != null && Object.hasOwnProperty.call(z, "spanId"))
                                A.uint32(18).bytes(z.spanId);
                              if (z.traceState != null && Object.hasOwnProperty.call(z, "traceState"))
                                A.uint32(26).string(z.traceState);
                              if (z.attributes != null && z.attributes.length)
                                for (var f = 0; f < z.attributes.length; ++f)
                                  UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                    z.attributes[f],
                                    A.uint32(34).fork(),
                                  ).ldelim();
                              if (
                                z.droppedAttributesCount != null &&
                                Object.hasOwnProperty.call(z, "droppedAttributesCount")
                              )
                                A.uint32(40).uint32(z.droppedAttributesCount);
                              if (z.flags != null && Object.hasOwnProperty.call(z, "flags"))
                                A.uint32(53).fixed32(z.flags);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.trace.v1.Span.Link();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.traceId = z.bytes();
                                    break;
                                  }
                                  case 2: {
                                    Y.spanId = z.bytes();
                                    break;
                                  }
                                  case 3: {
                                    Y.traceState = z.string();
                                    break;
                                  }
                                  case 4: {
                                    if (!(Y.attributes && Y.attributes.length)) Y.attributes = [];
                                    Y.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                    break;
                                  }
                                  case 5: {
                                    Y.droppedAttributesCount = z.uint32();
                                    break;
                                  }
                                  case 6: {
                                    Y.flags = z.fixed32();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.traceId != null && z.hasOwnProperty("traceId")) {
                                if (!((z.traceId && typeof z.traceId.length === "number") || rH.isString(z.traceId)))
                                  return "traceId: buffer expected";
                              }
                              if (z.spanId != null && z.hasOwnProperty("spanId")) {
                                if (!((z.spanId && typeof z.spanId.length === "number") || rH.isString(z.spanId)))
                                  return "spanId: buffer expected";
                              }
                              if (z.traceState != null && z.hasOwnProperty("traceState")) {
                                if (!rH.isString(z.traceState)) return "traceState: string expected";
                              }
                              if (z.attributes != null && z.hasOwnProperty("attributes")) {
                                if (!Array.isArray(z.attributes)) return "attributes: array expected";
                                for (var A = 0; A < z.attributes.length; ++A) {
                                  var f = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.attributes[A]);
                                  if (f) return "attributes." + f;
                                }
                              }
                              if (z.droppedAttributesCount != null && z.hasOwnProperty("droppedAttributesCount")) {
                                if (!rH.isInteger(z.droppedAttributesCount))
                                  return "droppedAttributesCount: integer expected";
                              }
                              if (z.flags != null && z.hasOwnProperty("flags")) {
                                if (!rH.isInteger(z.flags)) return "flags: integer expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.trace.v1.Span.Link) return z;
                              var A = new UH.opentelemetry.proto.trace.v1.Span.Link();
                              if (z.traceId != null) {
                                if (typeof z.traceId === "string")
                                  rH.base64.decode(
                                    z.traceId,
                                    (A.traceId = rH.newBuffer(rH.base64.length(z.traceId))),
                                    0,
                                  );
                                else if (z.traceId.length >= 0) A.traceId = z.traceId;
                              }
                              if (z.spanId != null) {
                                if (typeof z.spanId === "string")
                                  rH.base64.decode(z.spanId, (A.spanId = rH.newBuffer(rH.base64.length(z.spanId))), 0);
                                else if (z.spanId.length >= 0) A.spanId = z.spanId;
                              }
                              if (z.traceState != null) A.traceState = String(z.traceState);
                              if (z.attributes) {
                                if (!Array.isArray(z.attributes))
                                  throw TypeError(".opentelemetry.proto.trace.v1.Span.Link.attributes: array expected");
                                A.attributes = [];
                                for (var f = 0; f < z.attributes.length; ++f) {
                                  if (typeof z.attributes[f] !== "object")
                                    throw TypeError(
                                      ".opentelemetry.proto.trace.v1.Span.Link.attributes: object expected",
                                    );
                                  A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(
                                    z.attributes[f],
                                  );
                                }
                              }
                              if (z.droppedAttributesCount != null)
                                A.droppedAttributesCount = z.droppedAttributesCount >>> 0;
                              if (z.flags != null) A.flags = z.flags >>> 0;
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.arrays || A.defaults) f.attributes = [];
                              if (A.defaults) {
                                if (A.bytes === String) f.traceId = "";
                                else if (((f.traceId = []), A.bytes !== Array)) f.traceId = rH.newBuffer(f.traceId);
                                if (A.bytes === String) f.spanId = "";
                                else if (((f.spanId = []), A.bytes !== Array)) f.spanId = rH.newBuffer(f.spanId);
                                (f.traceState = ""), (f.droppedAttributesCount = 0), (f.flags = 0);
                              }
                              if (z.traceId != null && z.hasOwnProperty("traceId"))
                                f.traceId =
                                  A.bytes === String
                                    ? rH.base64.encode(z.traceId, 0, z.traceId.length)
                                    : A.bytes === Array
                                      ? Array.prototype.slice.call(z.traceId)
                                      : z.traceId;
                              if (z.spanId != null && z.hasOwnProperty("spanId"))
                                f.spanId =
                                  A.bytes === String
                                    ? rH.base64.encode(z.spanId, 0, z.spanId.length)
                                    : A.bytes === Array
                                      ? Array.prototype.slice.call(z.spanId)
                                      : z.spanId;
                              if (z.traceState != null && z.hasOwnProperty("traceState")) f.traceState = z.traceState;
                              if (z.attributes && z.attributes.length) {
                                f.attributes = [];
                                for (var w = 0; w < z.attributes.length; ++w)
                                  f.attributes[w] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(
                                    z.attributes[w],
                                    A,
                                  );
                              }
                              if (z.droppedAttributesCount != null && z.hasOwnProperty("droppedAttributesCount"))
                                f.droppedAttributesCount = z.droppedAttributesCount;
                              if (z.flags != null && z.hasOwnProperty("flags")) f.flags = z.flags;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.trace.v1.Span.Link";
                            }),
                            O
                          );
                        })()),
                        K
                      );
                    })()),
                    ($.Status = (function () {
                      function K(O) {
                        if (O) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.message = null),
                        (K.prototype.code = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.message != null && Object.hasOwnProperty.call(T, "message"))
                            z.uint32(18).string(T.message);
                          if (T.code != null && Object.hasOwnProperty.call(T, "code")) z.uint32(24).int32(T.code);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.trace.v1.Status();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 2: {
                                w.message = T.string();
                                break;
                              }
                              case 3: {
                                w.code = T.int32();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.message != null && T.hasOwnProperty("message")) {
                            if (!rH.isString(T.message)) return "message: string expected";
                          }
                          if (T.code != null && T.hasOwnProperty("code"))
                            switch (T.code) {
                              default:
                                return "code: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                                break;
                            }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.trace.v1.Status) return T;
                          var z = new UH.opentelemetry.proto.trace.v1.Status();
                          if (T.message != null) z.message = String(T.message);
                          switch (T.code) {
                            default:
                              if (typeof T.code === "number") {
                                z.code = T.code;
                                break;
                              }
                              break;
                            case "STATUS_CODE_UNSET":
                            case 0:
                              z.code = 0;
                              break;
                            case "STATUS_CODE_OK":
                            case 1:
                              z.code = 1;
                              break;
                            case "STATUS_CODE_ERROR":
                            case 2:
                              z.code = 2;
                              break;
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.defaults) (A.message = ""), (A.code = z.enums === String ? "STATUS_CODE_UNSET" : 0);
                          if (T.message != null && T.hasOwnProperty("message")) A.message = T.message;
                          if (T.code != null && T.hasOwnProperty("code"))
                            A.code =
                              z.enums === String
                                ? UH.opentelemetry.proto.trace.v1.Status.StatusCode[T.code] === void 0
                                  ? T.code
                                  : UH.opentelemetry.proto.trace.v1.Status.StatusCode[T.code]
                                : T.code;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.trace.v1.Status";
                        }),
                        (K.StatusCode = (function () {
                          var O = {},
                            T = Object.create(O);
                          return (
                            (T[(O[0] = "STATUS_CODE_UNSET")] = 0),
                            (T[(O[1] = "STATUS_CODE_OK")] = 1),
                            (T[(O[2] = "STATUS_CODE_ERROR")] = 2),
                            T
                          );
                        })()),
                        K
                      );
                    })()),
                    ($.SpanFlags = (function () {
                      var K = {},
                        O = Object.create(K);
                      return (
                        (O[(K[0] = "SPAN_FLAGS_DO_NOT_USE")] = 0),
                        (O[(K[255] = "SPAN_FLAGS_TRACE_FLAGS_MASK")] = 255),
                        (O[(K[256] = "SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK")] = 256),
                        (O[(K[512] = "SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK")] = 512),
                        O
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            (_.collector = (function () {
              var q = {};
              return (
                (q.trace = (function () {
                  var $ = {};
                  return (
                    ($.v1 = (function () {
                      var K = {};
                      return (
                        (K.TraceService = (function () {
                          function O(T, z, A) {
                            D$.rpc.Service.call(this, T, z, A);
                          }
                          return (
                            ((O.prototype = Object.create(D$.rpc.Service.prototype)).constructor = O),
                            (O.create = function (z, A, f) {
                              return new this(z, A, f);
                            }),
                            Object.defineProperty(
                              (O.prototype.export = function T(z, A) {
                                return this.rpcCall(
                                  T,
                                  UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest,
                                  UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse,
                                  z,
                                  A,
                                );
                              }),
                              "name",
                              { value: "Export" },
                            ),
                            O
                          );
                        })()),
                        (K.ExportTraceServiceRequest = (function () {
                          function O(T) {
                            if (((this.resourceSpans = []), T)) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.resourceSpans = rH.emptyArray),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.resourceSpans != null && z.resourceSpans.length)
                                for (var f = 0; f < z.resourceSpans.length; ++f)
                                  UH.opentelemetry.proto.trace.v1.ResourceSpans.encode(
                                    z.resourceSpans[f],
                                    A.uint32(10).fork(),
                                  ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    if (!(Y.resourceSpans && Y.resourceSpans.length)) Y.resourceSpans = [];
                                    Y.resourceSpans.push(
                                      UH.opentelemetry.proto.trace.v1.ResourceSpans.decode(z, z.uint32()),
                                    );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.resourceSpans != null && z.hasOwnProperty("resourceSpans")) {
                                if (!Array.isArray(z.resourceSpans)) return "resourceSpans: array expected";
                                for (var A = 0; A < z.resourceSpans.length; ++A) {
                                  var f = UH.opentelemetry.proto.trace.v1.ResourceSpans.verify(z.resourceSpans[A]);
                                  if (f) return "resourceSpans." + f;
                                }
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest();
                              if (z.resourceSpans) {
                                if (!Array.isArray(z.resourceSpans))
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.resourceSpans: array expected",
                                  );
                                A.resourceSpans = [];
                                for (var f = 0; f < z.resourceSpans.length; ++f) {
                                  if (typeof z.resourceSpans[f] !== "object")
                                    throw TypeError(
                                      ".opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.resourceSpans: object expected",
                                    );
                                  A.resourceSpans[f] = UH.opentelemetry.proto.trace.v1.ResourceSpans.fromObject(
                                    z.resourceSpans[f],
                                  );
                                }
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.arrays || A.defaults) f.resourceSpans = [];
                              if (z.resourceSpans && z.resourceSpans.length) {
                                f.resourceSpans = [];
                                for (var w = 0; w < z.resourceSpans.length; ++w)
                                  f.resourceSpans[w] = UH.opentelemetry.proto.trace.v1.ResourceSpans.toObject(
                                    z.resourceSpans[w],
                                    A,
                                  );
                              }
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest";
                            }),
                            O
                          );
                        })()),
                        (K.ExportTraceServiceResponse = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.partialSuccess = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.partialSuccess != null && Object.hasOwnProperty.call(z, "partialSuccess"))
                                UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.encode(
                                  z.partialSuccess,
                                  A.uint32(10).fork(),
                                ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.partialSuccess =
                                      UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.decode(
                                        z,
                                        z.uint32(),
                                      );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess")) {
                                var A = UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.verify(
                                  z.partialSuccess,
                                );
                                if (A) return "partialSuccess." + A;
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse();
                              if (z.partialSuccess != null) {
                                if (typeof z.partialSuccess !== "object")
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.partialSuccess: object expected",
                                  );
                                A.partialSuccess =
                                  UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.fromObject(
                                    z.partialSuccess,
                                  );
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) f.partialSuccess = null;
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess"))
                                f.partialSuccess =
                                  UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess.toObject(
                                    z.partialSuccess,
                                    A,
                                  );
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse";
                            }),
                            O
                          );
                        })()),
                        (K.ExportTracePartialSuccess = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.rejectedSpans = null),
                            (O.prototype.errorMessage = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.rejectedSpans != null && Object.hasOwnProperty.call(z, "rejectedSpans"))
                                A.uint32(8).int64(z.rejectedSpans);
                              if (z.errorMessage != null && Object.hasOwnProperty.call(z, "errorMessage"))
                                A.uint32(18).string(z.errorMessage);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.rejectedSpans = z.int64();
                                    break;
                                  }
                                  case 2: {
                                    Y.errorMessage = z.string();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.rejectedSpans != null && z.hasOwnProperty("rejectedSpans")) {
                                if (
                                  !rH.isInteger(z.rejectedSpans) &&
                                  !(
                                    z.rejectedSpans &&
                                    rH.isInteger(z.rejectedSpans.low) &&
                                    rH.isInteger(z.rejectedSpans.high)
                                  )
                                )
                                  return "rejectedSpans: integer|Long expected";
                              }
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage")) {
                                if (!rH.isString(z.errorMessage)) return "errorMessage: string expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess();
                              if (z.rejectedSpans != null) {
                                if (rH.Long) (A.rejectedSpans = rH.Long.fromValue(z.rejectedSpans)).unsigned = !1;
                                else if (typeof z.rejectedSpans === "string")
                                  A.rejectedSpans = parseInt(z.rejectedSpans, 10);
                                else if (typeof z.rejectedSpans === "number") A.rejectedSpans = z.rejectedSpans;
                                else if (typeof z.rejectedSpans === "object")
                                  A.rejectedSpans = new rH.LongBits(
                                    z.rejectedSpans.low >>> 0,
                                    z.rejectedSpans.high >>> 0,
                                  ).toNumber();
                              }
                              if (z.errorMessage != null) A.errorMessage = String(z.errorMessage);
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) {
                                if (rH.Long) {
                                  var w = new rH.Long(0, 0, !1);
                                  f.rejectedSpans =
                                    A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                                } else f.rejectedSpans = A.longs === String ? "0" : 0;
                                f.errorMessage = "";
                              }
                              if (z.rejectedSpans != null && z.hasOwnProperty("rejectedSpans"))
                                if (typeof z.rejectedSpans === "number")
                                  f.rejectedSpans = A.longs === String ? String(z.rejectedSpans) : z.rejectedSpans;
                                else
                                  f.rejectedSpans =
                                    A.longs === String
                                      ? rH.Long.prototype.toString.call(z.rejectedSpans)
                                      : A.longs === Number
                                        ? new rH.LongBits(
                                            z.rejectedSpans.low >>> 0,
                                            z.rejectedSpans.high >>> 0,
                                          ).toNumber()
                                        : z.rejectedSpans;
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage"))
                                f.errorMessage = z.errorMessage;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.trace.v1.ExportTracePartialSuccess";
                            }),
                            O
                          );
                        })()),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                (q.metrics = (function () {
                  var $ = {};
                  return (
                    ($.v1 = (function () {
                      var K = {};
                      return (
                        (K.MetricsService = (function () {
                          function O(T, z, A) {
                            D$.rpc.Service.call(this, T, z, A);
                          }
                          return (
                            ((O.prototype = Object.create(D$.rpc.Service.prototype)).constructor = O),
                            (O.create = function (z, A, f) {
                              return new this(z, A, f);
                            }),
                            Object.defineProperty(
                              (O.prototype.export = function T(z, A) {
                                return this.rpcCall(
                                  T,
                                  UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest,
                                  UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse,
                                  z,
                                  A,
                                );
                              }),
                              "name",
                              { value: "Export" },
                            ),
                            O
                          );
                        })()),
                        (K.ExportMetricsServiceRequest = (function () {
                          function O(T) {
                            if (((this.resourceMetrics = []), T)) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.resourceMetrics = rH.emptyArray),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.resourceMetrics != null && z.resourceMetrics.length)
                                for (var f = 0; f < z.resourceMetrics.length; ++f)
                                  UH.opentelemetry.proto.metrics.v1.ResourceMetrics.encode(
                                    z.resourceMetrics[f],
                                    A.uint32(10).fork(),
                                  ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    if (!(Y.resourceMetrics && Y.resourceMetrics.length)) Y.resourceMetrics = [];
                                    Y.resourceMetrics.push(
                                      UH.opentelemetry.proto.metrics.v1.ResourceMetrics.decode(z, z.uint32()),
                                    );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.resourceMetrics != null && z.hasOwnProperty("resourceMetrics")) {
                                if (!Array.isArray(z.resourceMetrics)) return "resourceMetrics: array expected";
                                for (var A = 0; A < z.resourceMetrics.length; ++A) {
                                  var f = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.verify(
                                    z.resourceMetrics[A],
                                  );
                                  if (f) return "resourceMetrics." + f;
                                }
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest();
                              if (z.resourceMetrics) {
                                if (!Array.isArray(z.resourceMetrics))
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.resourceMetrics: array expected",
                                  );
                                A.resourceMetrics = [];
                                for (var f = 0; f < z.resourceMetrics.length; ++f) {
                                  if (typeof z.resourceMetrics[f] !== "object")
                                    throw TypeError(
                                      ".opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.resourceMetrics: object expected",
                                    );
                                  A.resourceMetrics[f] = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.fromObject(
                                    z.resourceMetrics[f],
                                  );
                                }
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.arrays || A.defaults) f.resourceMetrics = [];
                              if (z.resourceMetrics && z.resourceMetrics.length) {
                                f.resourceMetrics = [];
                                for (var w = 0; w < z.resourceMetrics.length; ++w)
                                  f.resourceMetrics[w] = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.toObject(
                                    z.resourceMetrics[w],
                                    A,
                                  );
                              }
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest";
                            }),
                            O
                          );
                        })()),
                        (K.ExportMetricsServiceResponse = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.partialSuccess = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.partialSuccess != null && Object.hasOwnProperty.call(z, "partialSuccess"))
                                UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess.encode(
                                  z.partialSuccess,
                                  A.uint32(10).fork(),
                                ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.partialSuccess =
                                      UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess.decode(
                                        z,
                                        z.uint32(),
                                      );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess")) {
                                var A = UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess.verify(
                                  z.partialSuccess,
                                );
                                if (A) return "partialSuccess." + A;
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse();
                              if (z.partialSuccess != null) {
                                if (typeof z.partialSuccess !== "object")
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse.partialSuccess: object expected",
                                  );
                                A.partialSuccess =
                                  UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess.fromObject(
                                    z.partialSuccess,
                                  );
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) f.partialSuccess = null;
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess"))
                                f.partialSuccess =
                                  UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess.toObject(
                                    z.partialSuccess,
                                    A,
                                  );
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse";
                            }),
                            O
                          );
                        })()),
                        (K.ExportMetricsPartialSuccess = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.rejectedDataPoints = null),
                            (O.prototype.errorMessage = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.rejectedDataPoints != null && Object.hasOwnProperty.call(z, "rejectedDataPoints"))
                                A.uint32(8).int64(z.rejectedDataPoints);
                              if (z.errorMessage != null && Object.hasOwnProperty.call(z, "errorMessage"))
                                A.uint32(18).string(z.errorMessage);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.rejectedDataPoints = z.int64();
                                    break;
                                  }
                                  case 2: {
                                    Y.errorMessage = z.string();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.rejectedDataPoints != null && z.hasOwnProperty("rejectedDataPoints")) {
                                if (
                                  !rH.isInteger(z.rejectedDataPoints) &&
                                  !(
                                    z.rejectedDataPoints &&
                                    rH.isInteger(z.rejectedDataPoints.low) &&
                                    rH.isInteger(z.rejectedDataPoints.high)
                                  )
                                )
                                  return "rejectedDataPoints: integer|Long expected";
                              }
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage")) {
                                if (!rH.isString(z.errorMessage)) return "errorMessage: string expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess();
                              if (z.rejectedDataPoints != null) {
                                if (rH.Long)
                                  (A.rejectedDataPoints = rH.Long.fromValue(z.rejectedDataPoints)).unsigned = !1;
                                else if (typeof z.rejectedDataPoints === "string")
                                  A.rejectedDataPoints = parseInt(z.rejectedDataPoints, 10);
                                else if (typeof z.rejectedDataPoints === "number")
                                  A.rejectedDataPoints = z.rejectedDataPoints;
                                else if (typeof z.rejectedDataPoints === "object")
                                  A.rejectedDataPoints = new rH.LongBits(
                                    z.rejectedDataPoints.low >>> 0,
                                    z.rejectedDataPoints.high >>> 0,
                                  ).toNumber();
                              }
                              if (z.errorMessage != null) A.errorMessage = String(z.errorMessage);
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) {
                                if (rH.Long) {
                                  var w = new rH.Long(0, 0, !1);
                                  f.rejectedDataPoints =
                                    A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                                } else f.rejectedDataPoints = A.longs === String ? "0" : 0;
                                f.errorMessage = "";
                              }
                              if (z.rejectedDataPoints != null && z.hasOwnProperty("rejectedDataPoints"))
                                if (typeof z.rejectedDataPoints === "number")
                                  f.rejectedDataPoints =
                                    A.longs === String ? String(z.rejectedDataPoints) : z.rejectedDataPoints;
                                else
                                  f.rejectedDataPoints =
                                    A.longs === String
                                      ? rH.Long.prototype.toString.call(z.rejectedDataPoints)
                                      : A.longs === Number
                                        ? new rH.LongBits(
                                            z.rejectedDataPoints.low >>> 0,
                                            z.rejectedDataPoints.high >>> 0,
                                          ).toNumber()
                                        : z.rejectedDataPoints;
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage"))
                                f.errorMessage = z.errorMessage;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.metrics.v1.ExportMetricsPartialSuccess";
                            }),
                            O
                          );
                        })()),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                (q.logs = (function () {
                  var $ = {};
                  return (
                    ($.v1 = (function () {
                      var K = {};
                      return (
                        (K.LogsService = (function () {
                          function O(T, z, A) {
                            D$.rpc.Service.call(this, T, z, A);
                          }
                          return (
                            ((O.prototype = Object.create(D$.rpc.Service.prototype)).constructor = O),
                            (O.create = function (z, A, f) {
                              return new this(z, A, f);
                            }),
                            Object.defineProperty(
                              (O.prototype.export = function T(z, A) {
                                return this.rpcCall(
                                  T,
                                  UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest,
                                  UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse,
                                  z,
                                  A,
                                );
                              }),
                              "name",
                              { value: "Export" },
                            ),
                            O
                          );
                        })()),
                        (K.ExportLogsServiceRequest = (function () {
                          function O(T) {
                            if (((this.resourceLogs = []), T)) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.resourceLogs = rH.emptyArray),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.resourceLogs != null && z.resourceLogs.length)
                                for (var f = 0; f < z.resourceLogs.length; ++f)
                                  UH.opentelemetry.proto.logs.v1.ResourceLogs.encode(
                                    z.resourceLogs[f],
                                    A.uint32(10).fork(),
                                  ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    if (!(Y.resourceLogs && Y.resourceLogs.length)) Y.resourceLogs = [];
                                    Y.resourceLogs.push(
                                      UH.opentelemetry.proto.logs.v1.ResourceLogs.decode(z, z.uint32()),
                                    );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.resourceLogs != null && z.hasOwnProperty("resourceLogs")) {
                                if (!Array.isArray(z.resourceLogs)) return "resourceLogs: array expected";
                                for (var A = 0; A < z.resourceLogs.length; ++A) {
                                  var f = UH.opentelemetry.proto.logs.v1.ResourceLogs.verify(z.resourceLogs[A]);
                                  if (f) return "resourceLogs." + f;
                                }
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest();
                              if (z.resourceLogs) {
                                if (!Array.isArray(z.resourceLogs))
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.resourceLogs: array expected",
                                  );
                                A.resourceLogs = [];
                                for (var f = 0; f < z.resourceLogs.length; ++f) {
                                  if (typeof z.resourceLogs[f] !== "object")
                                    throw TypeError(
                                      ".opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.resourceLogs: object expected",
                                    );
                                  A.resourceLogs[f] = UH.opentelemetry.proto.logs.v1.ResourceLogs.fromObject(
                                    z.resourceLogs[f],
                                  );
                                }
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.arrays || A.defaults) f.resourceLogs = [];
                              if (z.resourceLogs && z.resourceLogs.length) {
                                f.resourceLogs = [];
                                for (var w = 0; w < z.resourceLogs.length; ++w)
                                  f.resourceLogs[w] = UH.opentelemetry.proto.logs.v1.ResourceLogs.toObject(
                                    z.resourceLogs[w],
                                    A,
                                  );
                              }
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest";
                            }),
                            O
                          );
                        })()),
                        (K.ExportLogsServiceResponse = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.partialSuccess = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.partialSuccess != null && Object.hasOwnProperty.call(z, "partialSuccess"))
                                UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.encode(
                                  z.partialSuccess,
                                  A.uint32(10).fork(),
                                ).ldelim();
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.partialSuccess =
                                      UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.decode(
                                        z,
                                        z.uint32(),
                                      );
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess")) {
                                var A = UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.verify(
                                  z.partialSuccess,
                                );
                                if (A) return "partialSuccess." + A;
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse();
                              if (z.partialSuccess != null) {
                                if (typeof z.partialSuccess !== "object")
                                  throw TypeError(
                                    ".opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.partialSuccess: object expected",
                                  );
                                A.partialSuccess =
                                  UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.fromObject(
                                    z.partialSuccess,
                                  );
                              }
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) f.partialSuccess = null;
                              if (z.partialSuccess != null && z.hasOwnProperty("partialSuccess"))
                                f.partialSuccess =
                                  UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess.toObject(
                                    z.partialSuccess,
                                    A,
                                  );
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse";
                            }),
                            O
                          );
                        })()),
                        (K.ExportLogsPartialSuccess = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.rejectedLogRecords = null),
                            (O.prototype.errorMessage = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.rejectedLogRecords != null && Object.hasOwnProperty.call(z, "rejectedLogRecords"))
                                A.uint32(8).int64(z.rejectedLogRecords);
                              if (z.errorMessage != null && Object.hasOwnProperty.call(z, "errorMessage"))
                                A.uint32(18).string(z.errorMessage);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.rejectedLogRecords = z.int64();
                                    break;
                                  }
                                  case 2: {
                                    Y.errorMessage = z.string();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.rejectedLogRecords != null && z.hasOwnProperty("rejectedLogRecords")) {
                                if (
                                  !rH.isInteger(z.rejectedLogRecords) &&
                                  !(
                                    z.rejectedLogRecords &&
                                    rH.isInteger(z.rejectedLogRecords.low) &&
                                    rH.isInteger(z.rejectedLogRecords.high)
                                  )
                                )
                                  return "rejectedLogRecords: integer|Long expected";
                              }
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage")) {
                                if (!rH.isString(z.errorMessage)) return "errorMessage: string expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess)
                                return z;
                              var A = new UH.opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess();
                              if (z.rejectedLogRecords != null) {
                                if (rH.Long)
                                  (A.rejectedLogRecords = rH.Long.fromValue(z.rejectedLogRecords)).unsigned = !1;
                                else if (typeof z.rejectedLogRecords === "string")
                                  A.rejectedLogRecords = parseInt(z.rejectedLogRecords, 10);
                                else if (typeof z.rejectedLogRecords === "number")
                                  A.rejectedLogRecords = z.rejectedLogRecords;
                                else if (typeof z.rejectedLogRecords === "object")
                                  A.rejectedLogRecords = new rH.LongBits(
                                    z.rejectedLogRecords.low >>> 0,
                                    z.rejectedLogRecords.high >>> 0,
                                  ).toNumber();
                              }
                              if (z.errorMessage != null) A.errorMessage = String(z.errorMessage);
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) {
                                if (rH.Long) {
                                  var w = new rH.Long(0, 0, !1);
                                  f.rejectedLogRecords =
                                    A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                                } else f.rejectedLogRecords = A.longs === String ? "0" : 0;
                                f.errorMessage = "";
                              }
                              if (z.rejectedLogRecords != null && z.hasOwnProperty("rejectedLogRecords"))
                                if (typeof z.rejectedLogRecords === "number")
                                  f.rejectedLogRecords =
                                    A.longs === String ? String(z.rejectedLogRecords) : z.rejectedLogRecords;
                                else
                                  f.rejectedLogRecords =
                                    A.longs === String
                                      ? rH.Long.prototype.toString.call(z.rejectedLogRecords)
                                      : A.longs === Number
                                        ? new rH.LongBits(
                                            z.rejectedLogRecords.low >>> 0,
                                            z.rejectedLogRecords.high >>> 0,
                                          ).toNumber()
                                        : z.rejectedLogRecords;
                              if (z.errorMessage != null && z.hasOwnProperty("errorMessage"))
                                f.errorMessage = z.errorMessage;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.collector.logs.v1.ExportLogsPartialSuccess";
                            }),
                            O
                          );
                        })()),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            (_.metrics = (function () {
              var q = {};
              return (
                (q.v1 = (function () {
                  var $ = {};
                  return (
                    ($.MetricsData = (function () {
                      function K(O) {
                        if (((this.resourceMetrics = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resourceMetrics = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resourceMetrics != null && T.resourceMetrics.length)
                            for (var A = 0; A < T.resourceMetrics.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.ResourceMetrics.encode(
                                T.resourceMetrics[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.MetricsData();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.resourceMetrics && w.resourceMetrics.length)) w.resourceMetrics = [];
                                w.resourceMetrics.push(
                                  UH.opentelemetry.proto.metrics.v1.ResourceMetrics.decode(T, T.uint32()),
                                );
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resourceMetrics != null && T.hasOwnProperty("resourceMetrics")) {
                            if (!Array.isArray(T.resourceMetrics)) return "resourceMetrics: array expected";
                            for (var z = 0; z < T.resourceMetrics.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.verify(T.resourceMetrics[z]);
                              if (A) return "resourceMetrics." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.MetricsData) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.MetricsData();
                          if (T.resourceMetrics) {
                            if (!Array.isArray(T.resourceMetrics))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.MetricsData.resourceMetrics: array expected",
                              );
                            z.resourceMetrics = [];
                            for (var A = 0; A < T.resourceMetrics.length; ++A) {
                              if (typeof T.resourceMetrics[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.MetricsData.resourceMetrics: object expected",
                                );
                              z.resourceMetrics[A] = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.fromObject(
                                T.resourceMetrics[A],
                              );
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.resourceMetrics = [];
                          if (T.resourceMetrics && T.resourceMetrics.length) {
                            A.resourceMetrics = [];
                            for (var f = 0; f < T.resourceMetrics.length; ++f)
                              A.resourceMetrics[f] = UH.opentelemetry.proto.metrics.v1.ResourceMetrics.toObject(
                                T.resourceMetrics[f],
                                z,
                              );
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.MetricsData";
                        }),
                        K
                      );
                    })()),
                    ($.ResourceMetrics = (function () {
                      function K(O) {
                        if (((this.scopeMetrics = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resource = null),
                        (K.prototype.scopeMetrics = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resource != null && Object.hasOwnProperty.call(T, "resource"))
                            UH.opentelemetry.proto.resource.v1.Resource.encode(
                              T.resource,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.scopeMetrics != null && T.scopeMetrics.length)
                            for (var A = 0; A < T.scopeMetrics.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.ScopeMetrics.encode(
                                T.scopeMetrics[A],
                                z.uint32(18).fork(),
                              ).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.ResourceMetrics();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.resource = UH.opentelemetry.proto.resource.v1.Resource.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.scopeMetrics && w.scopeMetrics.length)) w.scopeMetrics = [];
                                w.scopeMetrics.push(
                                  UH.opentelemetry.proto.metrics.v1.ScopeMetrics.decode(T, T.uint32()),
                                );
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resource != null && T.hasOwnProperty("resource")) {
                            var z = UH.opentelemetry.proto.resource.v1.Resource.verify(T.resource);
                            if (z) return "resource." + z;
                          }
                          if (T.scopeMetrics != null && T.hasOwnProperty("scopeMetrics")) {
                            if (!Array.isArray(T.scopeMetrics)) return "scopeMetrics: array expected";
                            for (var A = 0; A < T.scopeMetrics.length; ++A) {
                              var z = UH.opentelemetry.proto.metrics.v1.ScopeMetrics.verify(T.scopeMetrics[A]);
                              if (z) return "scopeMetrics." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.ResourceMetrics) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.ResourceMetrics();
                          if (T.resource != null) {
                            if (typeof T.resource !== "object")
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ResourceMetrics.resource: object expected",
                              );
                            z.resource = UH.opentelemetry.proto.resource.v1.Resource.fromObject(T.resource);
                          }
                          if (T.scopeMetrics) {
                            if (!Array.isArray(T.scopeMetrics))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ResourceMetrics.scopeMetrics: array expected",
                              );
                            z.scopeMetrics = [];
                            for (var A = 0; A < T.scopeMetrics.length; ++A) {
                              if (typeof T.scopeMetrics[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.ResourceMetrics.scopeMetrics: object expected",
                                );
                              z.scopeMetrics[A] = UH.opentelemetry.proto.metrics.v1.ScopeMetrics.fromObject(
                                T.scopeMetrics[A],
                              );
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.scopeMetrics = [];
                          if (z.defaults) (A.resource = null), (A.schemaUrl = "");
                          if (T.resource != null && T.hasOwnProperty("resource"))
                            A.resource = UH.opentelemetry.proto.resource.v1.Resource.toObject(T.resource, z);
                          if (T.scopeMetrics && T.scopeMetrics.length) {
                            A.scopeMetrics = [];
                            for (var f = 0; f < T.scopeMetrics.length; ++f)
                              A.scopeMetrics[f] = UH.opentelemetry.proto.metrics.v1.ScopeMetrics.toObject(
                                T.scopeMetrics[f],
                                z,
                              );
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.ResourceMetrics";
                        }),
                        K
                      );
                    })()),
                    ($.ScopeMetrics = (function () {
                      function K(O) {
                        if (((this.metrics = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.scope = null),
                        (K.prototype.metrics = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.scope != null && Object.hasOwnProperty.call(T, "scope"))
                            UH.opentelemetry.proto.common.v1.InstrumentationScope.encode(
                              T.scope,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.metrics != null && T.metrics.length)
                            for (var A = 0; A < T.metrics.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.Metric.encode(
                                T.metrics[A],
                                z.uint32(18).fork(),
                              ).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.ScopeMetrics();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.metrics && w.metrics.length)) w.metrics = [];
                                w.metrics.push(UH.opentelemetry.proto.metrics.v1.Metric.decode(T, T.uint32()));
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.scope != null && T.hasOwnProperty("scope")) {
                            var z = UH.opentelemetry.proto.common.v1.InstrumentationScope.verify(T.scope);
                            if (z) return "scope." + z;
                          }
                          if (T.metrics != null && T.hasOwnProperty("metrics")) {
                            if (!Array.isArray(T.metrics)) return "metrics: array expected";
                            for (var A = 0; A < T.metrics.length; ++A) {
                              var z = UH.opentelemetry.proto.metrics.v1.Metric.verify(T.metrics[A]);
                              if (z) return "metrics." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.ScopeMetrics) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.ScopeMetrics();
                          if (T.scope != null) {
                            if (typeof T.scope !== "object")
                              throw TypeError(".opentelemetry.proto.metrics.v1.ScopeMetrics.scope: object expected");
                            z.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.fromObject(T.scope);
                          }
                          if (T.metrics) {
                            if (!Array.isArray(T.metrics))
                              throw TypeError(".opentelemetry.proto.metrics.v1.ScopeMetrics.metrics: array expected");
                            z.metrics = [];
                            for (var A = 0; A < T.metrics.length; ++A) {
                              if (typeof T.metrics[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.ScopeMetrics.metrics: object expected",
                                );
                              z.metrics[A] = UH.opentelemetry.proto.metrics.v1.Metric.fromObject(T.metrics[A]);
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.metrics = [];
                          if (z.defaults) (A.scope = null), (A.schemaUrl = "");
                          if (T.scope != null && T.hasOwnProperty("scope"))
                            A.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.toObject(T.scope, z);
                          if (T.metrics && T.metrics.length) {
                            A.metrics = [];
                            for (var f = 0; f < T.metrics.length; ++f)
                              A.metrics[f] = UH.opentelemetry.proto.metrics.v1.Metric.toObject(T.metrics[f], z);
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.ScopeMetrics";
                        }),
                        K
                      );
                    })()),
                    ($.Metric = (function () {
                      function K(T) {
                        if (((this.metadata = []), T)) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.name = null),
                        (K.prototype.description = null),
                        (K.prototype.unit = null),
                        (K.prototype.gauge = null),
                        (K.prototype.sum = null),
                        (K.prototype.histogram = null),
                        (K.prototype.exponentialHistogram = null),
                        (K.prototype.summary = null),
                        (K.prototype.metadata = rH.emptyArray);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "data", {
                          get: rH.oneOfGetter((O = ["gauge", "sum", "histogram", "exponentialHistogram", "summary"])),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.name != null && Object.hasOwnProperty.call(z, "name")) A.uint32(10).string(z.name);
                          if (z.description != null && Object.hasOwnProperty.call(z, "description"))
                            A.uint32(18).string(z.description);
                          if (z.unit != null && Object.hasOwnProperty.call(z, "unit")) A.uint32(26).string(z.unit);
                          if (z.gauge != null && Object.hasOwnProperty.call(z, "gauge"))
                            UH.opentelemetry.proto.metrics.v1.Gauge.encode(z.gauge, A.uint32(42).fork()).ldelim();
                          if (z.sum != null && Object.hasOwnProperty.call(z, "sum"))
                            UH.opentelemetry.proto.metrics.v1.Sum.encode(z.sum, A.uint32(58).fork()).ldelim();
                          if (z.histogram != null && Object.hasOwnProperty.call(z, "histogram"))
                            UH.opentelemetry.proto.metrics.v1.Histogram.encode(
                              z.histogram,
                              A.uint32(74).fork(),
                            ).ldelim();
                          if (z.exponentialHistogram != null && Object.hasOwnProperty.call(z, "exponentialHistogram"))
                            UH.opentelemetry.proto.metrics.v1.ExponentialHistogram.encode(
                              z.exponentialHistogram,
                              A.uint32(82).fork(),
                            ).ldelim();
                          if (z.summary != null && Object.hasOwnProperty.call(z, "summary"))
                            UH.opentelemetry.proto.metrics.v1.Summary.encode(z.summary, A.uint32(90).fork()).ldelim();
                          if (z.metadata != null && z.metadata.length)
                            for (var f = 0; f < z.metadata.length; ++f)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                z.metadata[f],
                                A.uint32(98).fork(),
                              ).ldelim();
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.metrics.v1.Metric();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 1: {
                                Y.name = z.string();
                                break;
                              }
                              case 2: {
                                Y.description = z.string();
                                break;
                              }
                              case 3: {
                                Y.unit = z.string();
                                break;
                              }
                              case 5: {
                                Y.gauge = UH.opentelemetry.proto.metrics.v1.Gauge.decode(z, z.uint32());
                                break;
                              }
                              case 7: {
                                Y.sum = UH.opentelemetry.proto.metrics.v1.Sum.decode(z, z.uint32());
                                break;
                              }
                              case 9: {
                                Y.histogram = UH.opentelemetry.proto.metrics.v1.Histogram.decode(z, z.uint32());
                                break;
                              }
                              case 10: {
                                Y.exponentialHistogram = UH.opentelemetry.proto.metrics.v1.ExponentialHistogram.decode(
                                  z,
                                  z.uint32(),
                                );
                                break;
                              }
                              case 11: {
                                Y.summary = UH.opentelemetry.proto.metrics.v1.Summary.decode(z, z.uint32());
                                break;
                              }
                              case 12: {
                                if (!(Y.metadata && Y.metadata.length)) Y.metadata = [];
                                Y.metadata.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.name != null && z.hasOwnProperty("name")) {
                            if (!rH.isString(z.name)) return "name: string expected";
                          }
                          if (z.description != null && z.hasOwnProperty("description")) {
                            if (!rH.isString(z.description)) return "description: string expected";
                          }
                          if (z.unit != null && z.hasOwnProperty("unit")) {
                            if (!rH.isString(z.unit)) return "unit: string expected";
                          }
                          if (z.gauge != null && z.hasOwnProperty("gauge")) {
                            A.data = 1;
                            {
                              var f = UH.opentelemetry.proto.metrics.v1.Gauge.verify(z.gauge);
                              if (f) return "gauge." + f;
                            }
                          }
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (A.data === 1) return "data: multiple values";
                            A.data = 1;
                            {
                              var f = UH.opentelemetry.proto.metrics.v1.Sum.verify(z.sum);
                              if (f) return "sum." + f;
                            }
                          }
                          if (z.histogram != null && z.hasOwnProperty("histogram")) {
                            if (A.data === 1) return "data: multiple values";
                            A.data = 1;
                            {
                              var f = UH.opentelemetry.proto.metrics.v1.Histogram.verify(z.histogram);
                              if (f) return "histogram." + f;
                            }
                          }
                          if (z.exponentialHistogram != null && z.hasOwnProperty("exponentialHistogram")) {
                            if (A.data === 1) return "data: multiple values";
                            A.data = 1;
                            {
                              var f = UH.opentelemetry.proto.metrics.v1.ExponentialHistogram.verify(
                                z.exponentialHistogram,
                              );
                              if (f) return "exponentialHistogram." + f;
                            }
                          }
                          if (z.summary != null && z.hasOwnProperty("summary")) {
                            if (A.data === 1) return "data: multiple values";
                            A.data = 1;
                            {
                              var f = UH.opentelemetry.proto.metrics.v1.Summary.verify(z.summary);
                              if (f) return "summary." + f;
                            }
                          }
                          if (z.metadata != null && z.hasOwnProperty("metadata")) {
                            if (!Array.isArray(z.metadata)) return "metadata: array expected";
                            for (var w = 0; w < z.metadata.length; ++w) {
                              var f = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.metadata[w]);
                              if (f) return "metadata." + f;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.metrics.v1.Metric) return z;
                          var A = new UH.opentelemetry.proto.metrics.v1.Metric();
                          if (z.name != null) A.name = String(z.name);
                          if (z.description != null) A.description = String(z.description);
                          if (z.unit != null) A.unit = String(z.unit);
                          if (z.gauge != null) {
                            if (typeof z.gauge !== "object")
                              throw TypeError(".opentelemetry.proto.metrics.v1.Metric.gauge: object expected");
                            A.gauge = UH.opentelemetry.proto.metrics.v1.Gauge.fromObject(z.gauge);
                          }
                          if (z.sum != null) {
                            if (typeof z.sum !== "object")
                              throw TypeError(".opentelemetry.proto.metrics.v1.Metric.sum: object expected");
                            A.sum = UH.opentelemetry.proto.metrics.v1.Sum.fromObject(z.sum);
                          }
                          if (z.histogram != null) {
                            if (typeof z.histogram !== "object")
                              throw TypeError(".opentelemetry.proto.metrics.v1.Metric.histogram: object expected");
                            A.histogram = UH.opentelemetry.proto.metrics.v1.Histogram.fromObject(z.histogram);
                          }
                          if (z.exponentialHistogram != null) {
                            if (typeof z.exponentialHistogram !== "object")
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.Metric.exponentialHistogram: object expected",
                              );
                            A.exponentialHistogram = UH.opentelemetry.proto.metrics.v1.ExponentialHistogram.fromObject(
                              z.exponentialHistogram,
                            );
                          }
                          if (z.summary != null) {
                            if (typeof z.summary !== "object")
                              throw TypeError(".opentelemetry.proto.metrics.v1.Metric.summary: object expected");
                            A.summary = UH.opentelemetry.proto.metrics.v1.Summary.fromObject(z.summary);
                          }
                          if (z.metadata) {
                            if (!Array.isArray(z.metadata))
                              throw TypeError(".opentelemetry.proto.metrics.v1.Metric.metadata: array expected");
                            A.metadata = [];
                            for (var f = 0; f < z.metadata.length; ++f) {
                              if (typeof z.metadata[f] !== "object")
                                throw TypeError(".opentelemetry.proto.metrics.v1.Metric.metadata: object expected");
                              A.metadata[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(z.metadata[f]);
                            }
                          }
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (A.arrays || A.defaults) f.metadata = [];
                          if (A.defaults) (f.name = ""), (f.description = ""), (f.unit = "");
                          if (z.name != null && z.hasOwnProperty("name")) f.name = z.name;
                          if (z.description != null && z.hasOwnProperty("description")) f.description = z.description;
                          if (z.unit != null && z.hasOwnProperty("unit")) f.unit = z.unit;
                          if (z.gauge != null && z.hasOwnProperty("gauge")) {
                            if (((f.gauge = UH.opentelemetry.proto.metrics.v1.Gauge.toObject(z.gauge, A)), A.oneofs))
                              f.data = "gauge";
                          }
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (((f.sum = UH.opentelemetry.proto.metrics.v1.Sum.toObject(z.sum, A)), A.oneofs))
                              f.data = "sum";
                          }
                          if (z.histogram != null && z.hasOwnProperty("histogram")) {
                            if (
                              ((f.histogram = UH.opentelemetry.proto.metrics.v1.Histogram.toObject(z.histogram, A)),
                              A.oneofs)
                            )
                              f.data = "histogram";
                          }
                          if (z.exponentialHistogram != null && z.hasOwnProperty("exponentialHistogram")) {
                            if (
                              ((f.exponentialHistogram =
                                UH.opentelemetry.proto.metrics.v1.ExponentialHistogram.toObject(
                                  z.exponentialHistogram,
                                  A,
                                )),
                              A.oneofs)
                            )
                              f.data = "exponentialHistogram";
                          }
                          if (z.summary != null && z.hasOwnProperty("summary")) {
                            if (
                              ((f.summary = UH.opentelemetry.proto.metrics.v1.Summary.toObject(z.summary, A)), A.oneofs)
                            )
                              f.data = "summary";
                          }
                          if (z.metadata && z.metadata.length) {
                            f.metadata = [];
                            for (var w = 0; w < z.metadata.length; ++w)
                              f.metadata[w] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(z.metadata[w], A);
                          }
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.metrics.v1.Metric";
                        }),
                        K
                      );
                    })()),
                    ($.Gauge = (function () {
                      function K(O) {
                        if (((this.dataPoints = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.dataPoints = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.dataPoints != null && T.dataPoints.length)
                            for (var A = 0; A < T.dataPoints.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.NumberDataPoint.encode(
                                T.dataPoints[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.Gauge();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.dataPoints && w.dataPoints.length)) w.dataPoints = [];
                                w.dataPoints.push(
                                  UH.opentelemetry.proto.metrics.v1.NumberDataPoint.decode(T, T.uint32()),
                                );
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.dataPoints != null && T.hasOwnProperty("dataPoints")) {
                            if (!Array.isArray(T.dataPoints)) return "dataPoints: array expected";
                            for (var z = 0; z < T.dataPoints.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.verify(T.dataPoints[z]);
                              if (A) return "dataPoints." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.Gauge) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.Gauge();
                          if (T.dataPoints) {
                            if (!Array.isArray(T.dataPoints))
                              throw TypeError(".opentelemetry.proto.metrics.v1.Gauge.dataPoints: array expected");
                            z.dataPoints = [];
                            for (var A = 0; A < T.dataPoints.length; ++A) {
                              if (typeof T.dataPoints[A] !== "object")
                                throw TypeError(".opentelemetry.proto.metrics.v1.Gauge.dataPoints: object expected");
                              z.dataPoints[A] = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.fromObject(
                                T.dataPoints[A],
                              );
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.dataPoints = [];
                          if (T.dataPoints && T.dataPoints.length) {
                            A.dataPoints = [];
                            for (var f = 0; f < T.dataPoints.length; ++f)
                              A.dataPoints[f] = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.toObject(
                                T.dataPoints[f],
                                z,
                              );
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.Gauge";
                        }),
                        K
                      );
                    })()),
                    ($.Sum = (function () {
                      function K(O) {
                        if (((this.dataPoints = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.dataPoints = rH.emptyArray),
                        (K.prototype.aggregationTemporality = null),
                        (K.prototype.isMonotonic = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.dataPoints != null && T.dataPoints.length)
                            for (var A = 0; A < T.dataPoints.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.NumberDataPoint.encode(
                                T.dataPoints[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          if (
                            T.aggregationTemporality != null &&
                            Object.hasOwnProperty.call(T, "aggregationTemporality")
                          )
                            z.uint32(16).int32(T.aggregationTemporality);
                          if (T.isMonotonic != null && Object.hasOwnProperty.call(T, "isMonotonic"))
                            z.uint32(24).bool(T.isMonotonic);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.Sum();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.dataPoints && w.dataPoints.length)) w.dataPoints = [];
                                w.dataPoints.push(
                                  UH.opentelemetry.proto.metrics.v1.NumberDataPoint.decode(T, T.uint32()),
                                );
                                break;
                              }
                              case 2: {
                                w.aggregationTemporality = T.int32();
                                break;
                              }
                              case 3: {
                                w.isMonotonic = T.bool();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.dataPoints != null && T.hasOwnProperty("dataPoints")) {
                            if (!Array.isArray(T.dataPoints)) return "dataPoints: array expected";
                            for (var z = 0; z < T.dataPoints.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.verify(T.dataPoints[z]);
                              if (A) return "dataPoints." + A;
                            }
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            switch (T.aggregationTemporality) {
                              default:
                                return "aggregationTemporality: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                                break;
                            }
                          if (T.isMonotonic != null && T.hasOwnProperty("isMonotonic")) {
                            if (typeof T.isMonotonic !== "boolean") return "isMonotonic: boolean expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.Sum) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.Sum();
                          if (T.dataPoints) {
                            if (!Array.isArray(T.dataPoints))
                              throw TypeError(".opentelemetry.proto.metrics.v1.Sum.dataPoints: array expected");
                            z.dataPoints = [];
                            for (var A = 0; A < T.dataPoints.length; ++A) {
                              if (typeof T.dataPoints[A] !== "object")
                                throw TypeError(".opentelemetry.proto.metrics.v1.Sum.dataPoints: object expected");
                              z.dataPoints[A] = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.fromObject(
                                T.dataPoints[A],
                              );
                            }
                          }
                          switch (T.aggregationTemporality) {
                            default:
                              if (typeof T.aggregationTemporality === "number") {
                                z.aggregationTemporality = T.aggregationTemporality;
                                break;
                              }
                              break;
                            case "AGGREGATION_TEMPORALITY_UNSPECIFIED":
                            case 0:
                              z.aggregationTemporality = 0;
                              break;
                            case "AGGREGATION_TEMPORALITY_DELTA":
                            case 1:
                              z.aggregationTemporality = 1;
                              break;
                            case "AGGREGATION_TEMPORALITY_CUMULATIVE":
                            case 2:
                              z.aggregationTemporality = 2;
                              break;
                          }
                          if (T.isMonotonic != null) z.isMonotonic = Boolean(T.isMonotonic);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.dataPoints = [];
                          if (z.defaults)
                            (A.aggregationTemporality = z.enums === String ? "AGGREGATION_TEMPORALITY_UNSPECIFIED" : 0),
                              (A.isMonotonic = !1);
                          if (T.dataPoints && T.dataPoints.length) {
                            A.dataPoints = [];
                            for (var f = 0; f < T.dataPoints.length; ++f)
                              A.dataPoints[f] = UH.opentelemetry.proto.metrics.v1.NumberDataPoint.toObject(
                                T.dataPoints[f],
                                z,
                              );
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            A.aggregationTemporality =
                              z.enums === String
                                ? UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality] ===
                                  void 0
                                  ? T.aggregationTemporality
                                  : UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality]
                                : T.aggregationTemporality;
                          if (T.isMonotonic != null && T.hasOwnProperty("isMonotonic")) A.isMonotonic = T.isMonotonic;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.Sum";
                        }),
                        K
                      );
                    })()),
                    ($.Histogram = (function () {
                      function K(O) {
                        if (((this.dataPoints = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.dataPoints = rH.emptyArray),
                        (K.prototype.aggregationTemporality = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.dataPoints != null && T.dataPoints.length)
                            for (var A = 0; A < T.dataPoints.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.HistogramDataPoint.encode(
                                T.dataPoints[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          if (
                            T.aggregationTemporality != null &&
                            Object.hasOwnProperty.call(T, "aggregationTemporality")
                          )
                            z.uint32(16).int32(T.aggregationTemporality);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.Histogram();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.dataPoints && w.dataPoints.length)) w.dataPoints = [];
                                w.dataPoints.push(
                                  UH.opentelemetry.proto.metrics.v1.HistogramDataPoint.decode(T, T.uint32()),
                                );
                                break;
                              }
                              case 2: {
                                w.aggregationTemporality = T.int32();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.dataPoints != null && T.hasOwnProperty("dataPoints")) {
                            if (!Array.isArray(T.dataPoints)) return "dataPoints: array expected";
                            for (var z = 0; z < T.dataPoints.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.HistogramDataPoint.verify(T.dataPoints[z]);
                              if (A) return "dataPoints." + A;
                            }
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            switch (T.aggregationTemporality) {
                              default:
                                return "aggregationTemporality: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                                break;
                            }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.Histogram) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.Histogram();
                          if (T.dataPoints) {
                            if (!Array.isArray(T.dataPoints))
                              throw TypeError(".opentelemetry.proto.metrics.v1.Histogram.dataPoints: array expected");
                            z.dataPoints = [];
                            for (var A = 0; A < T.dataPoints.length; ++A) {
                              if (typeof T.dataPoints[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.Histogram.dataPoints: object expected",
                                );
                              z.dataPoints[A] = UH.opentelemetry.proto.metrics.v1.HistogramDataPoint.fromObject(
                                T.dataPoints[A],
                              );
                            }
                          }
                          switch (T.aggregationTemporality) {
                            default:
                              if (typeof T.aggregationTemporality === "number") {
                                z.aggregationTemporality = T.aggregationTemporality;
                                break;
                              }
                              break;
                            case "AGGREGATION_TEMPORALITY_UNSPECIFIED":
                            case 0:
                              z.aggregationTemporality = 0;
                              break;
                            case "AGGREGATION_TEMPORALITY_DELTA":
                            case 1:
                              z.aggregationTemporality = 1;
                              break;
                            case "AGGREGATION_TEMPORALITY_CUMULATIVE":
                            case 2:
                              z.aggregationTemporality = 2;
                              break;
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.dataPoints = [];
                          if (z.defaults)
                            A.aggregationTemporality = z.enums === String ? "AGGREGATION_TEMPORALITY_UNSPECIFIED" : 0;
                          if (T.dataPoints && T.dataPoints.length) {
                            A.dataPoints = [];
                            for (var f = 0; f < T.dataPoints.length; ++f)
                              A.dataPoints[f] = UH.opentelemetry.proto.metrics.v1.HistogramDataPoint.toObject(
                                T.dataPoints[f],
                                z,
                              );
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            A.aggregationTemporality =
                              z.enums === String
                                ? UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality] ===
                                  void 0
                                  ? T.aggregationTemporality
                                  : UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality]
                                : T.aggregationTemporality;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.Histogram";
                        }),
                        K
                      );
                    })()),
                    ($.ExponentialHistogram = (function () {
                      function K(O) {
                        if (((this.dataPoints = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.dataPoints = rH.emptyArray),
                        (K.prototype.aggregationTemporality = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.dataPoints != null && T.dataPoints.length)
                            for (var A = 0; A < T.dataPoints.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.encode(
                                T.dataPoints[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          if (
                            T.aggregationTemporality != null &&
                            Object.hasOwnProperty.call(T, "aggregationTemporality")
                          )
                            z.uint32(16).int32(T.aggregationTemporality);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogram();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.dataPoints && w.dataPoints.length)) w.dataPoints = [];
                                w.dataPoints.push(
                                  UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.decode(T, T.uint32()),
                                );
                                break;
                              }
                              case 2: {
                                w.aggregationTemporality = T.int32();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.dataPoints != null && T.hasOwnProperty("dataPoints")) {
                            if (!Array.isArray(T.dataPoints)) return "dataPoints: array expected";
                            for (var z = 0; z < T.dataPoints.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.verify(
                                T.dataPoints[z],
                              );
                              if (A) return "dataPoints." + A;
                            }
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            switch (T.aggregationTemporality) {
                              default:
                                return "aggregationTemporality: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                                break;
                            }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.ExponentialHistogram) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogram();
                          if (T.dataPoints) {
                            if (!Array.isArray(T.dataPoints))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ExponentialHistogram.dataPoints: array expected",
                              );
                            z.dataPoints = [];
                            for (var A = 0; A < T.dataPoints.length; ++A) {
                              if (typeof T.dataPoints[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.ExponentialHistogram.dataPoints: object expected",
                                );
                              z.dataPoints[A] =
                                UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.fromObject(
                                  T.dataPoints[A],
                                );
                            }
                          }
                          switch (T.aggregationTemporality) {
                            default:
                              if (typeof T.aggregationTemporality === "number") {
                                z.aggregationTemporality = T.aggregationTemporality;
                                break;
                              }
                              break;
                            case "AGGREGATION_TEMPORALITY_UNSPECIFIED":
                            case 0:
                              z.aggregationTemporality = 0;
                              break;
                            case "AGGREGATION_TEMPORALITY_DELTA":
                            case 1:
                              z.aggregationTemporality = 1;
                              break;
                            case "AGGREGATION_TEMPORALITY_CUMULATIVE":
                            case 2:
                              z.aggregationTemporality = 2;
                              break;
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.dataPoints = [];
                          if (z.defaults)
                            A.aggregationTemporality = z.enums === String ? "AGGREGATION_TEMPORALITY_UNSPECIFIED" : 0;
                          if (T.dataPoints && T.dataPoints.length) {
                            A.dataPoints = [];
                            for (var f = 0; f < T.dataPoints.length; ++f)
                              A.dataPoints[f] =
                                UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.toObject(
                                  T.dataPoints[f],
                                  z,
                                );
                          }
                          if (T.aggregationTemporality != null && T.hasOwnProperty("aggregationTemporality"))
                            A.aggregationTemporality =
                              z.enums === String
                                ? UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality] ===
                                  void 0
                                  ? T.aggregationTemporality
                                  : UH.opentelemetry.proto.metrics.v1.AggregationTemporality[T.aggregationTemporality]
                                : T.aggregationTemporality;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.ExponentialHistogram";
                        }),
                        K
                      );
                    })()),
                    ($.Summary = (function () {
                      function K(O) {
                        if (((this.dataPoints = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.dataPoints = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.dataPoints != null && T.dataPoints.length)
                            for (var A = 0; A < T.dataPoints.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.encode(
                                T.dataPoints[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.Summary();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.dataPoints && w.dataPoints.length)) w.dataPoints = [];
                                w.dataPoints.push(
                                  UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.decode(T, T.uint32()),
                                );
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.dataPoints != null && T.hasOwnProperty("dataPoints")) {
                            if (!Array.isArray(T.dataPoints)) return "dataPoints: array expected";
                            for (var z = 0; z < T.dataPoints.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.verify(T.dataPoints[z]);
                              if (A) return "dataPoints." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.Summary) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.Summary();
                          if (T.dataPoints) {
                            if (!Array.isArray(T.dataPoints))
                              throw TypeError(".opentelemetry.proto.metrics.v1.Summary.dataPoints: array expected");
                            z.dataPoints = [];
                            for (var A = 0; A < T.dataPoints.length; ++A) {
                              if (typeof T.dataPoints[A] !== "object")
                                throw TypeError(".opentelemetry.proto.metrics.v1.Summary.dataPoints: object expected");
                              z.dataPoints[A] = UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.fromObject(
                                T.dataPoints[A],
                              );
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.dataPoints = [];
                          if (T.dataPoints && T.dataPoints.length) {
                            A.dataPoints = [];
                            for (var f = 0; f < T.dataPoints.length; ++f)
                              A.dataPoints[f] = UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.toObject(
                                T.dataPoints[f],
                                z,
                              );
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.Summary";
                        }),
                        K
                      );
                    })()),
                    ($.AggregationTemporality = (function () {
                      var K = {},
                        O = Object.create(K);
                      return (
                        (O[(K[0] = "AGGREGATION_TEMPORALITY_UNSPECIFIED")] = 0),
                        (O[(K[1] = "AGGREGATION_TEMPORALITY_DELTA")] = 1),
                        (O[(K[2] = "AGGREGATION_TEMPORALITY_CUMULATIVE")] = 2),
                        O
                      );
                    })()),
                    ($.DataPointFlags = (function () {
                      var K = {},
                        O = Object.create(K);
                      return (
                        (O[(K[0] = "DATA_POINT_FLAGS_DO_NOT_USE")] = 0),
                        (O[(K[1] = "DATA_POINT_FLAGS_NO_RECORDED_VALUE_MASK")] = 1),
                        O
                      );
                    })()),
                    ($.NumberDataPoint = (function () {
                      function K(T) {
                        if (((this.attributes = []), (this.exemplars = []), T)) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.startTimeUnixNano = null),
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.asDouble = null),
                        (K.prototype.asInt = null),
                        (K.prototype.exemplars = rH.emptyArray),
                        (K.prototype.flags = null);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "value", {
                          get: rH.oneOfGetter((O = ["asDouble", "asInt"])),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.startTimeUnixNano != null && Object.hasOwnProperty.call(z, "startTimeUnixNano"))
                            A.uint32(17).fixed64(z.startTimeUnixNano);
                          if (z.timeUnixNano != null && Object.hasOwnProperty.call(z, "timeUnixNano"))
                            A.uint32(25).fixed64(z.timeUnixNano);
                          if (z.asDouble != null && Object.hasOwnProperty.call(z, "asDouble"))
                            A.uint32(33).double(z.asDouble);
                          if (z.exemplars != null && z.exemplars.length)
                            for (var f = 0; f < z.exemplars.length; ++f)
                              UH.opentelemetry.proto.metrics.v1.Exemplar.encode(
                                z.exemplars[f],
                                A.uint32(42).fork(),
                              ).ldelim();
                          if (z.asInt != null && Object.hasOwnProperty.call(z, "asInt")) A.uint32(49).sfixed64(z.asInt);
                          if (z.attributes != null && z.attributes.length)
                            for (var f = 0; f < z.attributes.length; ++f)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                z.attributes[f],
                                A.uint32(58).fork(),
                              ).ldelim();
                          if (z.flags != null && Object.hasOwnProperty.call(z, "flags")) A.uint32(64).uint32(z.flags);
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.metrics.v1.NumberDataPoint();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 7: {
                                if (!(Y.attributes && Y.attributes.length)) Y.attributes = [];
                                Y.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                break;
                              }
                              case 2: {
                                Y.startTimeUnixNano = z.fixed64();
                                break;
                              }
                              case 3: {
                                Y.timeUnixNano = z.fixed64();
                                break;
                              }
                              case 4: {
                                Y.asDouble = z.double();
                                break;
                              }
                              case 6: {
                                Y.asInt = z.sfixed64();
                                break;
                              }
                              case 5: {
                                if (!(Y.exemplars && Y.exemplars.length)) Y.exemplars = [];
                                Y.exemplars.push(UH.opentelemetry.proto.metrics.v1.Exemplar.decode(z, z.uint32()));
                                break;
                              }
                              case 8: {
                                Y.flags = z.uint32();
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.attributes != null && z.hasOwnProperty("attributes")) {
                            if (!Array.isArray(z.attributes)) return "attributes: array expected";
                            for (var f = 0; f < z.attributes.length; ++f) {
                              var w = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.attributes[f]);
                              if (w) return "attributes." + w;
                            }
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano")) {
                            if (
                              !rH.isInteger(z.startTimeUnixNano) &&
                              !(
                                z.startTimeUnixNano &&
                                rH.isInteger(z.startTimeUnixNano.low) &&
                                rH.isInteger(z.startTimeUnixNano.high)
                              )
                            )
                              return "startTimeUnixNano: integer|Long expected";
                          }
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(z.timeUnixNano) &&
                              !(z.timeUnixNano && rH.isInteger(z.timeUnixNano.low) && rH.isInteger(z.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (z.asDouble != null && z.hasOwnProperty("asDouble")) {
                            if (((A.value = 1), typeof z.asDouble !== "number")) return "asDouble: number expected";
                          }
                          if (z.asInt != null && z.hasOwnProperty("asInt")) {
                            if (A.value === 1) return "value: multiple values";
                            if (
                              ((A.value = 1),
                              !rH.isInteger(z.asInt) &&
                                !(z.asInt && rH.isInteger(z.asInt.low) && rH.isInteger(z.asInt.high)))
                            )
                              return "asInt: integer|Long expected";
                          }
                          if (z.exemplars != null && z.hasOwnProperty("exemplars")) {
                            if (!Array.isArray(z.exemplars)) return "exemplars: array expected";
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              var w = UH.opentelemetry.proto.metrics.v1.Exemplar.verify(z.exemplars[f]);
                              if (w) return "exemplars." + w;
                            }
                          }
                          if (z.flags != null && z.hasOwnProperty("flags")) {
                            if (!rH.isInteger(z.flags)) return "flags: integer expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.metrics.v1.NumberDataPoint) return z;
                          var A = new UH.opentelemetry.proto.metrics.v1.NumberDataPoint();
                          if (z.attributes) {
                            if (!Array.isArray(z.attributes))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.NumberDataPoint.attributes: array expected",
                              );
                            A.attributes = [];
                            for (var f = 0; f < z.attributes.length; ++f) {
                              if (typeof z.attributes[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.NumberDataPoint.attributes: object expected",
                                );
                              A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(z.attributes[f]);
                            }
                          }
                          if (z.startTimeUnixNano != null) {
                            if (rH.Long) (A.startTimeUnixNano = rH.Long.fromValue(z.startTimeUnixNano)).unsigned = !1;
                            else if (typeof z.startTimeUnixNano === "string")
                              A.startTimeUnixNano = parseInt(z.startTimeUnixNano, 10);
                            else if (typeof z.startTimeUnixNano === "number") A.startTimeUnixNano = z.startTimeUnixNano;
                            else if (typeof z.startTimeUnixNano === "object")
                              A.startTimeUnixNano = new rH.LongBits(
                                z.startTimeUnixNano.low >>> 0,
                                z.startTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.timeUnixNano != null) {
                            if (rH.Long) (A.timeUnixNano = rH.Long.fromValue(z.timeUnixNano)).unsigned = !1;
                            else if (typeof z.timeUnixNano === "string") A.timeUnixNano = parseInt(z.timeUnixNano, 10);
                            else if (typeof z.timeUnixNano === "number") A.timeUnixNano = z.timeUnixNano;
                            else if (typeof z.timeUnixNano === "object")
                              A.timeUnixNano = new rH.LongBits(
                                z.timeUnixNano.low >>> 0,
                                z.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.asDouble != null) A.asDouble = Number(z.asDouble);
                          if (z.asInt != null) {
                            if (rH.Long) (A.asInt = rH.Long.fromValue(z.asInt)).unsigned = !1;
                            else if (typeof z.asInt === "string") A.asInt = parseInt(z.asInt, 10);
                            else if (typeof z.asInt === "number") A.asInt = z.asInt;
                            else if (typeof z.asInt === "object")
                              A.asInt = new rH.LongBits(z.asInt.low >>> 0, z.asInt.high >>> 0).toNumber();
                          }
                          if (z.exemplars) {
                            if (!Array.isArray(z.exemplars))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.NumberDataPoint.exemplars: array expected",
                              );
                            A.exemplars = [];
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              if (typeof z.exemplars[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.NumberDataPoint.exemplars: object expected",
                                );
                              A.exemplars[f] = UH.opentelemetry.proto.metrics.v1.Exemplar.fromObject(z.exemplars[f]);
                            }
                          }
                          if (z.flags != null) A.flags = z.flags >>> 0;
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (A.arrays || A.defaults) (f.exemplars = []), (f.attributes = []);
                          if (A.defaults) {
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.startTimeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.startTimeUnixNano = A.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.timeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.timeUnixNano = A.longs === String ? "0" : 0;
                            f.flags = 0;
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano"))
                            if (typeof z.startTimeUnixNano === "number")
                              f.startTimeUnixNano =
                                A.longs === String ? String(z.startTimeUnixNano) : z.startTimeUnixNano;
                            else
                              f.startTimeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.startTimeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(
                                        z.startTimeUnixNano.low >>> 0,
                                        z.startTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : z.startTimeUnixNano;
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano"))
                            if (typeof z.timeUnixNano === "number")
                              f.timeUnixNano = A.longs === String ? String(z.timeUnixNano) : z.timeUnixNano;
                            else
                              f.timeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.timeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.timeUnixNano.low >>> 0, z.timeUnixNano.high >>> 0).toNumber()
                                    : z.timeUnixNano;
                          if (z.asDouble != null && z.hasOwnProperty("asDouble")) {
                            if (
                              ((f.asDouble = A.json && !isFinite(z.asDouble) ? String(z.asDouble) : z.asDouble),
                              A.oneofs)
                            )
                              f.value = "asDouble";
                          }
                          if (z.exemplars && z.exemplars.length) {
                            f.exemplars = [];
                            for (var Y = 0; Y < z.exemplars.length; ++Y)
                              f.exemplars[Y] = UH.opentelemetry.proto.metrics.v1.Exemplar.toObject(z.exemplars[Y], A);
                          }
                          if (z.asInt != null && z.hasOwnProperty("asInt")) {
                            if (typeof z.asInt === "number") f.asInt = A.longs === String ? String(z.asInt) : z.asInt;
                            else
                              f.asInt =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.asInt)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.asInt.low >>> 0, z.asInt.high >>> 0).toNumber()
                                    : z.asInt;
                            if (A.oneofs) f.value = "asInt";
                          }
                          if (z.attributes && z.attributes.length) {
                            f.attributes = [];
                            for (var Y = 0; Y < z.attributes.length; ++Y)
                              f.attributes[Y] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(z.attributes[Y], A);
                          }
                          if (z.flags != null && z.hasOwnProperty("flags")) f.flags = z.flags;
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.metrics.v1.NumberDataPoint";
                        }),
                        K
                      );
                    })()),
                    ($.HistogramDataPoint = (function () {
                      function K(T) {
                        if (
                          ((this.attributes = []),
                          (this.bucketCounts = []),
                          (this.explicitBounds = []),
                          (this.exemplars = []),
                          T)
                        ) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.startTimeUnixNano = null),
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.count = null),
                        (K.prototype.sum = null),
                        (K.prototype.bucketCounts = rH.emptyArray),
                        (K.prototype.explicitBounds = rH.emptyArray),
                        (K.prototype.exemplars = rH.emptyArray),
                        (K.prototype.flags = null),
                        (K.prototype.min = null),
                        (K.prototype.max = null);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "_sum", {
                          get: rH.oneOfGetter((O = ["sum"])),
                          set: rH.oneOfSetter(O),
                        }),
                        Object.defineProperty(K.prototype, "_min", {
                          get: rH.oneOfGetter((O = ["min"])),
                          set: rH.oneOfSetter(O),
                        }),
                        Object.defineProperty(K.prototype, "_max", {
                          get: rH.oneOfGetter((O = ["max"])),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.startTimeUnixNano != null && Object.hasOwnProperty.call(z, "startTimeUnixNano"))
                            A.uint32(17).fixed64(z.startTimeUnixNano);
                          if (z.timeUnixNano != null && Object.hasOwnProperty.call(z, "timeUnixNano"))
                            A.uint32(25).fixed64(z.timeUnixNano);
                          if (z.count != null && Object.hasOwnProperty.call(z, "count")) A.uint32(33).fixed64(z.count);
                          if (z.sum != null && Object.hasOwnProperty.call(z, "sum")) A.uint32(41).double(z.sum);
                          if (z.bucketCounts != null && z.bucketCounts.length) {
                            A.uint32(50).fork();
                            for (var f = 0; f < z.bucketCounts.length; ++f) A.fixed64(z.bucketCounts[f]);
                            A.ldelim();
                          }
                          if (z.explicitBounds != null && z.explicitBounds.length) {
                            A.uint32(58).fork();
                            for (var f = 0; f < z.explicitBounds.length; ++f) A.double(z.explicitBounds[f]);
                            A.ldelim();
                          }
                          if (z.exemplars != null && z.exemplars.length)
                            for (var f = 0; f < z.exemplars.length; ++f)
                              UH.opentelemetry.proto.metrics.v1.Exemplar.encode(
                                z.exemplars[f],
                                A.uint32(66).fork(),
                              ).ldelim();
                          if (z.attributes != null && z.attributes.length)
                            for (var f = 0; f < z.attributes.length; ++f)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                z.attributes[f],
                                A.uint32(74).fork(),
                              ).ldelim();
                          if (z.flags != null && Object.hasOwnProperty.call(z, "flags")) A.uint32(80).uint32(z.flags);
                          if (z.min != null && Object.hasOwnProperty.call(z, "min")) A.uint32(89).double(z.min);
                          if (z.max != null && Object.hasOwnProperty.call(z, "max")) A.uint32(97).double(z.max);
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.metrics.v1.HistogramDataPoint();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 9: {
                                if (!(Y.attributes && Y.attributes.length)) Y.attributes = [];
                                Y.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                break;
                              }
                              case 2: {
                                Y.startTimeUnixNano = z.fixed64();
                                break;
                              }
                              case 3: {
                                Y.timeUnixNano = z.fixed64();
                                break;
                              }
                              case 4: {
                                Y.count = z.fixed64();
                                break;
                              }
                              case 5: {
                                Y.sum = z.double();
                                break;
                              }
                              case 6: {
                                if (!(Y.bucketCounts && Y.bucketCounts.length)) Y.bucketCounts = [];
                                if ((D & 7) === 2) {
                                  var j = z.uint32() + z.pos;
                                  while (z.pos < j) Y.bucketCounts.push(z.fixed64());
                                } else Y.bucketCounts.push(z.fixed64());
                                break;
                              }
                              case 7: {
                                if (!(Y.explicitBounds && Y.explicitBounds.length)) Y.explicitBounds = [];
                                if ((D & 7) === 2) {
                                  var j = z.uint32() + z.pos;
                                  while (z.pos < j) Y.explicitBounds.push(z.double());
                                } else Y.explicitBounds.push(z.double());
                                break;
                              }
                              case 8: {
                                if (!(Y.exemplars && Y.exemplars.length)) Y.exemplars = [];
                                Y.exemplars.push(UH.opentelemetry.proto.metrics.v1.Exemplar.decode(z, z.uint32()));
                                break;
                              }
                              case 10: {
                                Y.flags = z.uint32();
                                break;
                              }
                              case 11: {
                                Y.min = z.double();
                                break;
                              }
                              case 12: {
                                Y.max = z.double();
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.attributes != null && z.hasOwnProperty("attributes")) {
                            if (!Array.isArray(z.attributes)) return "attributes: array expected";
                            for (var f = 0; f < z.attributes.length; ++f) {
                              var w = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.attributes[f]);
                              if (w) return "attributes." + w;
                            }
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano")) {
                            if (
                              !rH.isInteger(z.startTimeUnixNano) &&
                              !(
                                z.startTimeUnixNano &&
                                rH.isInteger(z.startTimeUnixNano.low) &&
                                rH.isInteger(z.startTimeUnixNano.high)
                              )
                            )
                              return "startTimeUnixNano: integer|Long expected";
                          }
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(z.timeUnixNano) &&
                              !(z.timeUnixNano && rH.isInteger(z.timeUnixNano.low) && rH.isInteger(z.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (z.count != null && z.hasOwnProperty("count")) {
                            if (
                              !rH.isInteger(z.count) &&
                              !(z.count && rH.isInteger(z.count.low) && rH.isInteger(z.count.high))
                            )
                              return "count: integer|Long expected";
                          }
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (((A._sum = 1), typeof z.sum !== "number")) return "sum: number expected";
                          }
                          if (z.bucketCounts != null && z.hasOwnProperty("bucketCounts")) {
                            if (!Array.isArray(z.bucketCounts)) return "bucketCounts: array expected";
                            for (var f = 0; f < z.bucketCounts.length; ++f)
                              if (
                                !rH.isInteger(z.bucketCounts[f]) &&
                                !(
                                  z.bucketCounts[f] &&
                                  rH.isInteger(z.bucketCounts[f].low) &&
                                  rH.isInteger(z.bucketCounts[f].high)
                                )
                              )
                                return "bucketCounts: integer|Long[] expected";
                          }
                          if (z.explicitBounds != null && z.hasOwnProperty("explicitBounds")) {
                            if (!Array.isArray(z.explicitBounds)) return "explicitBounds: array expected";
                            for (var f = 0; f < z.explicitBounds.length; ++f)
                              if (typeof z.explicitBounds[f] !== "number") return "explicitBounds: number[] expected";
                          }
                          if (z.exemplars != null && z.hasOwnProperty("exemplars")) {
                            if (!Array.isArray(z.exemplars)) return "exemplars: array expected";
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              var w = UH.opentelemetry.proto.metrics.v1.Exemplar.verify(z.exemplars[f]);
                              if (w) return "exemplars." + w;
                            }
                          }
                          if (z.flags != null && z.hasOwnProperty("flags")) {
                            if (!rH.isInteger(z.flags)) return "flags: integer expected";
                          }
                          if (z.min != null && z.hasOwnProperty("min")) {
                            if (((A._min = 1), typeof z.min !== "number")) return "min: number expected";
                          }
                          if (z.max != null && z.hasOwnProperty("max")) {
                            if (((A._max = 1), typeof z.max !== "number")) return "max: number expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.metrics.v1.HistogramDataPoint) return z;
                          var A = new UH.opentelemetry.proto.metrics.v1.HistogramDataPoint();
                          if (z.attributes) {
                            if (!Array.isArray(z.attributes))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.HistogramDataPoint.attributes: array expected",
                              );
                            A.attributes = [];
                            for (var f = 0; f < z.attributes.length; ++f) {
                              if (typeof z.attributes[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.HistogramDataPoint.attributes: object expected",
                                );
                              A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(z.attributes[f]);
                            }
                          }
                          if (z.startTimeUnixNano != null) {
                            if (rH.Long) (A.startTimeUnixNano = rH.Long.fromValue(z.startTimeUnixNano)).unsigned = !1;
                            else if (typeof z.startTimeUnixNano === "string")
                              A.startTimeUnixNano = parseInt(z.startTimeUnixNano, 10);
                            else if (typeof z.startTimeUnixNano === "number") A.startTimeUnixNano = z.startTimeUnixNano;
                            else if (typeof z.startTimeUnixNano === "object")
                              A.startTimeUnixNano = new rH.LongBits(
                                z.startTimeUnixNano.low >>> 0,
                                z.startTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.timeUnixNano != null) {
                            if (rH.Long) (A.timeUnixNano = rH.Long.fromValue(z.timeUnixNano)).unsigned = !1;
                            else if (typeof z.timeUnixNano === "string") A.timeUnixNano = parseInt(z.timeUnixNano, 10);
                            else if (typeof z.timeUnixNano === "number") A.timeUnixNano = z.timeUnixNano;
                            else if (typeof z.timeUnixNano === "object")
                              A.timeUnixNano = new rH.LongBits(
                                z.timeUnixNano.low >>> 0,
                                z.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.count != null) {
                            if (rH.Long) (A.count = rH.Long.fromValue(z.count)).unsigned = !1;
                            else if (typeof z.count === "string") A.count = parseInt(z.count, 10);
                            else if (typeof z.count === "number") A.count = z.count;
                            else if (typeof z.count === "object")
                              A.count = new rH.LongBits(z.count.low >>> 0, z.count.high >>> 0).toNumber();
                          }
                          if (z.sum != null) A.sum = Number(z.sum);
                          if (z.bucketCounts) {
                            if (!Array.isArray(z.bucketCounts))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.HistogramDataPoint.bucketCounts: array expected",
                              );
                            A.bucketCounts = [];
                            for (var f = 0; f < z.bucketCounts.length; ++f)
                              if (rH.Long) (A.bucketCounts[f] = rH.Long.fromValue(z.bucketCounts[f])).unsigned = !1;
                              else if (typeof z.bucketCounts[f] === "string")
                                A.bucketCounts[f] = parseInt(z.bucketCounts[f], 10);
                              else if (typeof z.bucketCounts[f] === "number") A.bucketCounts[f] = z.bucketCounts[f];
                              else if (typeof z.bucketCounts[f] === "object")
                                A.bucketCounts[f] = new rH.LongBits(
                                  z.bucketCounts[f].low >>> 0,
                                  z.bucketCounts[f].high >>> 0,
                                ).toNumber();
                          }
                          if (z.explicitBounds) {
                            if (!Array.isArray(z.explicitBounds))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.HistogramDataPoint.explicitBounds: array expected",
                              );
                            A.explicitBounds = [];
                            for (var f = 0; f < z.explicitBounds.length; ++f)
                              A.explicitBounds[f] = Number(z.explicitBounds[f]);
                          }
                          if (z.exemplars) {
                            if (!Array.isArray(z.exemplars))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.HistogramDataPoint.exemplars: array expected",
                              );
                            A.exemplars = [];
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              if (typeof z.exemplars[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.HistogramDataPoint.exemplars: object expected",
                                );
                              A.exemplars[f] = UH.opentelemetry.proto.metrics.v1.Exemplar.fromObject(z.exemplars[f]);
                            }
                          }
                          if (z.flags != null) A.flags = z.flags >>> 0;
                          if (z.min != null) A.min = Number(z.min);
                          if (z.max != null) A.max = Number(z.max);
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (A.arrays || A.defaults)
                            (f.bucketCounts = []), (f.explicitBounds = []), (f.exemplars = []), (f.attributes = []);
                          if (A.defaults) {
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.startTimeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.startTimeUnixNano = A.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.timeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.timeUnixNano = A.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.count = A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.count = A.longs === String ? "0" : 0;
                            f.flags = 0;
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano"))
                            if (typeof z.startTimeUnixNano === "number")
                              f.startTimeUnixNano =
                                A.longs === String ? String(z.startTimeUnixNano) : z.startTimeUnixNano;
                            else
                              f.startTimeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.startTimeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(
                                        z.startTimeUnixNano.low >>> 0,
                                        z.startTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : z.startTimeUnixNano;
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano"))
                            if (typeof z.timeUnixNano === "number")
                              f.timeUnixNano = A.longs === String ? String(z.timeUnixNano) : z.timeUnixNano;
                            else
                              f.timeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.timeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.timeUnixNano.low >>> 0, z.timeUnixNano.high >>> 0).toNumber()
                                    : z.timeUnixNano;
                          if (z.count != null && z.hasOwnProperty("count"))
                            if (typeof z.count === "number") f.count = A.longs === String ? String(z.count) : z.count;
                            else
                              f.count =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.count)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.count.low >>> 0, z.count.high >>> 0).toNumber()
                                    : z.count;
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (((f.sum = A.json && !isFinite(z.sum) ? String(z.sum) : z.sum), A.oneofs))
                              f._sum = "sum";
                          }
                          if (z.bucketCounts && z.bucketCounts.length) {
                            f.bucketCounts = [];
                            for (var Y = 0; Y < z.bucketCounts.length; ++Y)
                              if (typeof z.bucketCounts[Y] === "number")
                                f.bucketCounts[Y] = A.longs === String ? String(z.bucketCounts[Y]) : z.bucketCounts[Y];
                              else
                                f.bucketCounts[Y] =
                                  A.longs === String
                                    ? rH.Long.prototype.toString.call(z.bucketCounts[Y])
                                    : A.longs === Number
                                      ? new rH.LongBits(
                                          z.bucketCounts[Y].low >>> 0,
                                          z.bucketCounts[Y].high >>> 0,
                                        ).toNumber()
                                      : z.bucketCounts[Y];
                          }
                          if (z.explicitBounds && z.explicitBounds.length) {
                            f.explicitBounds = [];
                            for (var Y = 0; Y < z.explicitBounds.length; ++Y)
                              f.explicitBounds[Y] =
                                A.json && !isFinite(z.explicitBounds[Y])
                                  ? String(z.explicitBounds[Y])
                                  : z.explicitBounds[Y];
                          }
                          if (z.exemplars && z.exemplars.length) {
                            f.exemplars = [];
                            for (var Y = 0; Y < z.exemplars.length; ++Y)
                              f.exemplars[Y] = UH.opentelemetry.proto.metrics.v1.Exemplar.toObject(z.exemplars[Y], A);
                          }
                          if (z.attributes && z.attributes.length) {
                            f.attributes = [];
                            for (var Y = 0; Y < z.attributes.length; ++Y)
                              f.attributes[Y] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(z.attributes[Y], A);
                          }
                          if (z.flags != null && z.hasOwnProperty("flags")) f.flags = z.flags;
                          if (z.min != null && z.hasOwnProperty("min")) {
                            if (((f.min = A.json && !isFinite(z.min) ? String(z.min) : z.min), A.oneofs))
                              f._min = "min";
                          }
                          if (z.max != null && z.hasOwnProperty("max")) {
                            if (((f.max = A.json && !isFinite(z.max) ? String(z.max) : z.max), A.oneofs))
                              f._max = "max";
                          }
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.metrics.v1.HistogramDataPoint";
                        }),
                        K
                      );
                    })()),
                    ($.ExponentialHistogramDataPoint = (function () {
                      function K(T) {
                        if (((this.attributes = []), (this.exemplars = []), T)) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.startTimeUnixNano = null),
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.count = null),
                        (K.prototype.sum = null),
                        (K.prototype.scale = null),
                        (K.prototype.zeroCount = null),
                        (K.prototype.positive = null),
                        (K.prototype.negative = null),
                        (K.prototype.flags = null),
                        (K.prototype.exemplars = rH.emptyArray),
                        (K.prototype.min = null),
                        (K.prototype.max = null),
                        (K.prototype.zeroThreshold = null);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "_sum", {
                          get: rH.oneOfGetter((O = ["sum"])),
                          set: rH.oneOfSetter(O),
                        }),
                        Object.defineProperty(K.prototype, "_min", {
                          get: rH.oneOfGetter((O = ["min"])),
                          set: rH.oneOfSetter(O),
                        }),
                        Object.defineProperty(K.prototype, "_max", {
                          get: rH.oneOfGetter((O = ["max"])),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.attributes != null && z.attributes.length)
                            for (var f = 0; f < z.attributes.length; ++f)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                z.attributes[f],
                                A.uint32(10).fork(),
                              ).ldelim();
                          if (z.startTimeUnixNano != null && Object.hasOwnProperty.call(z, "startTimeUnixNano"))
                            A.uint32(17).fixed64(z.startTimeUnixNano);
                          if (z.timeUnixNano != null && Object.hasOwnProperty.call(z, "timeUnixNano"))
                            A.uint32(25).fixed64(z.timeUnixNano);
                          if (z.count != null && Object.hasOwnProperty.call(z, "count")) A.uint32(33).fixed64(z.count);
                          if (z.sum != null && Object.hasOwnProperty.call(z, "sum")) A.uint32(41).double(z.sum);
                          if (z.scale != null && Object.hasOwnProperty.call(z, "scale")) A.uint32(48).sint32(z.scale);
                          if (z.zeroCount != null && Object.hasOwnProperty.call(z, "zeroCount"))
                            A.uint32(57).fixed64(z.zeroCount);
                          if (z.positive != null && Object.hasOwnProperty.call(z, "positive"))
                            UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.encode(
                              z.positive,
                              A.uint32(66).fork(),
                            ).ldelim();
                          if (z.negative != null && Object.hasOwnProperty.call(z, "negative"))
                            UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.encode(
                              z.negative,
                              A.uint32(74).fork(),
                            ).ldelim();
                          if (z.flags != null && Object.hasOwnProperty.call(z, "flags")) A.uint32(80).uint32(z.flags);
                          if (z.exemplars != null && z.exemplars.length)
                            for (var f = 0; f < z.exemplars.length; ++f)
                              UH.opentelemetry.proto.metrics.v1.Exemplar.encode(
                                z.exemplars[f],
                                A.uint32(90).fork(),
                              ).ldelim();
                          if (z.min != null && Object.hasOwnProperty.call(z, "min")) A.uint32(97).double(z.min);
                          if (z.max != null && Object.hasOwnProperty.call(z, "max")) A.uint32(105).double(z.max);
                          if (z.zeroThreshold != null && Object.hasOwnProperty.call(z, "zeroThreshold"))
                            A.uint32(113).double(z.zeroThreshold);
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 1: {
                                if (!(Y.attributes && Y.attributes.length)) Y.attributes = [];
                                Y.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()));
                                break;
                              }
                              case 2: {
                                Y.startTimeUnixNano = z.fixed64();
                                break;
                              }
                              case 3: {
                                Y.timeUnixNano = z.fixed64();
                                break;
                              }
                              case 4: {
                                Y.count = z.fixed64();
                                break;
                              }
                              case 5: {
                                Y.sum = z.double();
                                break;
                              }
                              case 6: {
                                Y.scale = z.sint32();
                                break;
                              }
                              case 7: {
                                Y.zeroCount = z.fixed64();
                                break;
                              }
                              case 8: {
                                Y.positive =
                                  UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.decode(
                                    z,
                                    z.uint32(),
                                  );
                                break;
                              }
                              case 9: {
                                Y.negative =
                                  UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.decode(
                                    z,
                                    z.uint32(),
                                  );
                                break;
                              }
                              case 10: {
                                Y.flags = z.uint32();
                                break;
                              }
                              case 11: {
                                if (!(Y.exemplars && Y.exemplars.length)) Y.exemplars = [];
                                Y.exemplars.push(UH.opentelemetry.proto.metrics.v1.Exemplar.decode(z, z.uint32()));
                                break;
                              }
                              case 12: {
                                Y.min = z.double();
                                break;
                              }
                              case 13: {
                                Y.max = z.double();
                                break;
                              }
                              case 14: {
                                Y.zeroThreshold = z.double();
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.attributes != null && z.hasOwnProperty("attributes")) {
                            if (!Array.isArray(z.attributes)) return "attributes: array expected";
                            for (var f = 0; f < z.attributes.length; ++f) {
                              var w = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.attributes[f]);
                              if (w) return "attributes." + w;
                            }
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano")) {
                            if (
                              !rH.isInteger(z.startTimeUnixNano) &&
                              !(
                                z.startTimeUnixNano &&
                                rH.isInteger(z.startTimeUnixNano.low) &&
                                rH.isInteger(z.startTimeUnixNano.high)
                              )
                            )
                              return "startTimeUnixNano: integer|Long expected";
                          }
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(z.timeUnixNano) &&
                              !(z.timeUnixNano && rH.isInteger(z.timeUnixNano.low) && rH.isInteger(z.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (z.count != null && z.hasOwnProperty("count")) {
                            if (
                              !rH.isInteger(z.count) &&
                              !(z.count && rH.isInteger(z.count.low) && rH.isInteger(z.count.high))
                            )
                              return "count: integer|Long expected";
                          }
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (((A._sum = 1), typeof z.sum !== "number")) return "sum: number expected";
                          }
                          if (z.scale != null && z.hasOwnProperty("scale")) {
                            if (!rH.isInteger(z.scale)) return "scale: integer expected";
                          }
                          if (z.zeroCount != null && z.hasOwnProperty("zeroCount")) {
                            if (
                              !rH.isInteger(z.zeroCount) &&
                              !(z.zeroCount && rH.isInteger(z.zeroCount.low) && rH.isInteger(z.zeroCount.high))
                            )
                              return "zeroCount: integer|Long expected";
                          }
                          if (z.positive != null && z.hasOwnProperty("positive")) {
                            var w = UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.verify(
                              z.positive,
                            );
                            if (w) return "positive." + w;
                          }
                          if (z.negative != null && z.hasOwnProperty("negative")) {
                            var w = UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.verify(
                              z.negative,
                            );
                            if (w) return "negative." + w;
                          }
                          if (z.flags != null && z.hasOwnProperty("flags")) {
                            if (!rH.isInteger(z.flags)) return "flags: integer expected";
                          }
                          if (z.exemplars != null && z.hasOwnProperty("exemplars")) {
                            if (!Array.isArray(z.exemplars)) return "exemplars: array expected";
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              var w = UH.opentelemetry.proto.metrics.v1.Exemplar.verify(z.exemplars[f]);
                              if (w) return "exemplars." + w;
                            }
                          }
                          if (z.min != null && z.hasOwnProperty("min")) {
                            if (((A._min = 1), typeof z.min !== "number")) return "min: number expected";
                          }
                          if (z.max != null && z.hasOwnProperty("max")) {
                            if (((A._max = 1), typeof z.max !== "number")) return "max: number expected";
                          }
                          if (z.zeroThreshold != null && z.hasOwnProperty("zeroThreshold")) {
                            if (typeof z.zeroThreshold !== "number") return "zeroThreshold: number expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint) return z;
                          var A = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint();
                          if (z.attributes) {
                            if (!Array.isArray(z.attributes))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.attributes: array expected",
                              );
                            A.attributes = [];
                            for (var f = 0; f < z.attributes.length; ++f) {
                              if (typeof z.attributes[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.attributes: object expected",
                                );
                              A.attributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(z.attributes[f]);
                            }
                          }
                          if (z.startTimeUnixNano != null) {
                            if (rH.Long) (A.startTimeUnixNano = rH.Long.fromValue(z.startTimeUnixNano)).unsigned = !1;
                            else if (typeof z.startTimeUnixNano === "string")
                              A.startTimeUnixNano = parseInt(z.startTimeUnixNano, 10);
                            else if (typeof z.startTimeUnixNano === "number") A.startTimeUnixNano = z.startTimeUnixNano;
                            else if (typeof z.startTimeUnixNano === "object")
                              A.startTimeUnixNano = new rH.LongBits(
                                z.startTimeUnixNano.low >>> 0,
                                z.startTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.timeUnixNano != null) {
                            if (rH.Long) (A.timeUnixNano = rH.Long.fromValue(z.timeUnixNano)).unsigned = !1;
                            else if (typeof z.timeUnixNano === "string") A.timeUnixNano = parseInt(z.timeUnixNano, 10);
                            else if (typeof z.timeUnixNano === "number") A.timeUnixNano = z.timeUnixNano;
                            else if (typeof z.timeUnixNano === "object")
                              A.timeUnixNano = new rH.LongBits(
                                z.timeUnixNano.low >>> 0,
                                z.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.count != null) {
                            if (rH.Long) (A.count = rH.Long.fromValue(z.count)).unsigned = !1;
                            else if (typeof z.count === "string") A.count = parseInt(z.count, 10);
                            else if (typeof z.count === "number") A.count = z.count;
                            else if (typeof z.count === "object")
                              A.count = new rH.LongBits(z.count.low >>> 0, z.count.high >>> 0).toNumber();
                          }
                          if (z.sum != null) A.sum = Number(z.sum);
                          if (z.scale != null) A.scale = z.scale | 0;
                          if (z.zeroCount != null) {
                            if (rH.Long) (A.zeroCount = rH.Long.fromValue(z.zeroCount)).unsigned = !1;
                            else if (typeof z.zeroCount === "string") A.zeroCount = parseInt(z.zeroCount, 10);
                            else if (typeof z.zeroCount === "number") A.zeroCount = z.zeroCount;
                            else if (typeof z.zeroCount === "object")
                              A.zeroCount = new rH.LongBits(z.zeroCount.low >>> 0, z.zeroCount.high >>> 0).toNumber();
                          }
                          if (z.positive != null) {
                            if (typeof z.positive !== "object")
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.positive: object expected",
                              );
                            A.positive =
                              UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.fromObject(
                                z.positive,
                              );
                          }
                          if (z.negative != null) {
                            if (typeof z.negative !== "object")
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.negative: object expected",
                              );
                            A.negative =
                              UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.fromObject(
                                z.negative,
                              );
                          }
                          if (z.flags != null) A.flags = z.flags >>> 0;
                          if (z.exemplars) {
                            if (!Array.isArray(z.exemplars))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.exemplars: array expected",
                              );
                            A.exemplars = [];
                            for (var f = 0; f < z.exemplars.length; ++f) {
                              if (typeof z.exemplars[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.exemplars: object expected",
                                );
                              A.exemplars[f] = UH.opentelemetry.proto.metrics.v1.Exemplar.fromObject(z.exemplars[f]);
                            }
                          }
                          if (z.min != null) A.min = Number(z.min);
                          if (z.max != null) A.max = Number(z.max);
                          if (z.zeroThreshold != null) A.zeroThreshold = Number(z.zeroThreshold);
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (A.arrays || A.defaults) (f.attributes = []), (f.exemplars = []);
                          if (A.defaults) {
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.startTimeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.startTimeUnixNano = A.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.timeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.timeUnixNano = A.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.count = A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.count = A.longs === String ? "0" : 0;
                            if (((f.scale = 0), rH.Long)) {
                              var w = new rH.Long(0, 0, !1);
                              f.zeroCount = A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.zeroCount = A.longs === String ? "0" : 0;
                            (f.positive = null), (f.negative = null), (f.flags = 0), (f.zeroThreshold = 0);
                          }
                          if (z.attributes && z.attributes.length) {
                            f.attributes = [];
                            for (var Y = 0; Y < z.attributes.length; ++Y)
                              f.attributes[Y] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(z.attributes[Y], A);
                          }
                          if (z.startTimeUnixNano != null && z.hasOwnProperty("startTimeUnixNano"))
                            if (typeof z.startTimeUnixNano === "number")
                              f.startTimeUnixNano =
                                A.longs === String ? String(z.startTimeUnixNano) : z.startTimeUnixNano;
                            else
                              f.startTimeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.startTimeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(
                                        z.startTimeUnixNano.low >>> 0,
                                        z.startTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : z.startTimeUnixNano;
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano"))
                            if (typeof z.timeUnixNano === "number")
                              f.timeUnixNano = A.longs === String ? String(z.timeUnixNano) : z.timeUnixNano;
                            else
                              f.timeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.timeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.timeUnixNano.low >>> 0, z.timeUnixNano.high >>> 0).toNumber()
                                    : z.timeUnixNano;
                          if (z.count != null && z.hasOwnProperty("count"))
                            if (typeof z.count === "number") f.count = A.longs === String ? String(z.count) : z.count;
                            else
                              f.count =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.count)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.count.low >>> 0, z.count.high >>> 0).toNumber()
                                    : z.count;
                          if (z.sum != null && z.hasOwnProperty("sum")) {
                            if (((f.sum = A.json && !isFinite(z.sum) ? String(z.sum) : z.sum), A.oneofs))
                              f._sum = "sum";
                          }
                          if (z.scale != null && z.hasOwnProperty("scale")) f.scale = z.scale;
                          if (z.zeroCount != null && z.hasOwnProperty("zeroCount"))
                            if (typeof z.zeroCount === "number")
                              f.zeroCount = A.longs === String ? String(z.zeroCount) : z.zeroCount;
                            else
                              f.zeroCount =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.zeroCount)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.zeroCount.low >>> 0, z.zeroCount.high >>> 0).toNumber()
                                    : z.zeroCount;
                          if (z.positive != null && z.hasOwnProperty("positive"))
                            f.positive =
                              UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.toObject(
                                z.positive,
                                A,
                              );
                          if (z.negative != null && z.hasOwnProperty("negative"))
                            f.negative =
                              UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.toObject(
                                z.negative,
                                A,
                              );
                          if (z.flags != null && z.hasOwnProperty("flags")) f.flags = z.flags;
                          if (z.exemplars && z.exemplars.length) {
                            f.exemplars = [];
                            for (var Y = 0; Y < z.exemplars.length; ++Y)
                              f.exemplars[Y] = UH.opentelemetry.proto.metrics.v1.Exemplar.toObject(z.exemplars[Y], A);
                          }
                          if (z.min != null && z.hasOwnProperty("min")) {
                            if (((f.min = A.json && !isFinite(z.min) ? String(z.min) : z.min), A.oneofs))
                              f._min = "min";
                          }
                          if (z.max != null && z.hasOwnProperty("max")) {
                            if (((f.max = A.json && !isFinite(z.max) ? String(z.max) : z.max), A.oneofs))
                              f._max = "max";
                          }
                          if (z.zeroThreshold != null && z.hasOwnProperty("zeroThreshold"))
                            f.zeroThreshold =
                              A.json && !isFinite(z.zeroThreshold) ? String(z.zeroThreshold) : z.zeroThreshold;
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint";
                        }),
                        (K.Buckets = (function () {
                          function T(z) {
                            if (((this.bucketCounts = []), z)) {
                              for (var A = Object.keys(z), f = 0; f < A.length; ++f)
                                if (z[A[f]] != null) this[A[f]] = z[A[f]];
                            }
                          }
                          return (
                            (T.prototype.offset = null),
                            (T.prototype.bucketCounts = rH.emptyArray),
                            (T.create = function (A) {
                              return new T(A);
                            }),
                            (T.encode = function (A, f) {
                              if (!f) f = V1.create();
                              if (A.offset != null && Object.hasOwnProperty.call(A, "offset"))
                                f.uint32(8).sint32(A.offset);
                              if (A.bucketCounts != null && A.bucketCounts.length) {
                                f.uint32(18).fork();
                                for (var w = 0; w < A.bucketCounts.length; ++w) f.uint64(A.bucketCounts[w]);
                                f.ldelim();
                              }
                              return f;
                            }),
                            (T.encodeDelimited = function (A, f) {
                              return this.encode(A, f).ldelim();
                            }),
                            (T.decode = function (A, f, w) {
                              if (!(A instanceof X6)) A = X6.create(A);
                              var Y = f === void 0 ? A.len : A.pos + f,
                                D = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets();
                              while (A.pos < Y) {
                                var j = A.uint32();
                                if (j === w) break;
                                switch (j >>> 3) {
                                  case 1: {
                                    D.offset = A.sint32();
                                    break;
                                  }
                                  case 2: {
                                    if (!(D.bucketCounts && D.bucketCounts.length)) D.bucketCounts = [];
                                    if ((j & 7) === 2) {
                                      var M = A.uint32() + A.pos;
                                      while (A.pos < M) D.bucketCounts.push(A.uint64());
                                    } else D.bucketCounts.push(A.uint64());
                                    break;
                                  }
                                  default:
                                    A.skipType(j & 7);
                                    break;
                                }
                              }
                              return D;
                            }),
                            (T.decodeDelimited = function (A) {
                              if (!(A instanceof X6)) A = new X6(A);
                              return this.decode(A, A.uint32());
                            }),
                            (T.verify = function (A) {
                              if (typeof A !== "object" || A === null) return "object expected";
                              if (A.offset != null && A.hasOwnProperty("offset")) {
                                if (!rH.isInteger(A.offset)) return "offset: integer expected";
                              }
                              if (A.bucketCounts != null && A.hasOwnProperty("bucketCounts")) {
                                if (!Array.isArray(A.bucketCounts)) return "bucketCounts: array expected";
                                for (var f = 0; f < A.bucketCounts.length; ++f)
                                  if (
                                    !rH.isInteger(A.bucketCounts[f]) &&
                                    !(
                                      A.bucketCounts[f] &&
                                      rH.isInteger(A.bucketCounts[f].low) &&
                                      rH.isInteger(A.bucketCounts[f].high)
                                    )
                                  )
                                    return "bucketCounts: integer|Long[] expected";
                              }
                              return null;
                            }),
                            (T.fromObject = function (A) {
                              if (A instanceof UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets)
                                return A;
                              var f = new UH.opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets();
                              if (A.offset != null) f.offset = A.offset | 0;
                              if (A.bucketCounts) {
                                if (!Array.isArray(A.bucketCounts))
                                  throw TypeError(
                                    ".opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets.bucketCounts: array expected",
                                  );
                                f.bucketCounts = [];
                                for (var w = 0; w < A.bucketCounts.length; ++w)
                                  if (rH.Long) (f.bucketCounts[w] = rH.Long.fromValue(A.bucketCounts[w])).unsigned = !0;
                                  else if (typeof A.bucketCounts[w] === "string")
                                    f.bucketCounts[w] = parseInt(A.bucketCounts[w], 10);
                                  else if (typeof A.bucketCounts[w] === "number") f.bucketCounts[w] = A.bucketCounts[w];
                                  else if (typeof A.bucketCounts[w] === "object")
                                    f.bucketCounts[w] = new rH.LongBits(
                                      A.bucketCounts[w].low >>> 0,
                                      A.bucketCounts[w].high >>> 0,
                                    ).toNumber(!0);
                              }
                              return f;
                            }),
                            (T.toObject = function (A, f) {
                              if (!f) f = {};
                              var w = {};
                              if (f.arrays || f.defaults) w.bucketCounts = [];
                              if (f.defaults) w.offset = 0;
                              if (A.offset != null && A.hasOwnProperty("offset")) w.offset = A.offset;
                              if (A.bucketCounts && A.bucketCounts.length) {
                                w.bucketCounts = [];
                                for (var Y = 0; Y < A.bucketCounts.length; ++Y)
                                  if (typeof A.bucketCounts[Y] === "number")
                                    w.bucketCounts[Y] =
                                      f.longs === String ? String(A.bucketCounts[Y]) : A.bucketCounts[Y];
                                  else
                                    w.bucketCounts[Y] =
                                      f.longs === String
                                        ? rH.Long.prototype.toString.call(A.bucketCounts[Y])
                                        : f.longs === Number
                                          ? new rH.LongBits(
                                              A.bucketCounts[Y].low >>> 0,
                                              A.bucketCounts[Y].high >>> 0,
                                            ).toNumber(!0)
                                          : A.bucketCounts[Y];
                              }
                              return w;
                            }),
                            (T.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (T.getTypeUrl = function (A) {
                              if (A === void 0) A = "type.googleapis.com";
                              return A + "/opentelemetry.proto.metrics.v1.ExponentialHistogramDataPoint.Buckets";
                            }),
                            T
                          );
                        })()),
                        K
                      );
                    })()),
                    ($.SummaryDataPoint = (function () {
                      function K(O) {
                        if (((this.attributes = []), (this.quantileValues = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.startTimeUnixNano = null),
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.count = null),
                        (K.prototype.sum = null),
                        (K.prototype.quantileValues = rH.emptyArray),
                        (K.prototype.flags = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.startTimeUnixNano != null && Object.hasOwnProperty.call(T, "startTimeUnixNano"))
                            z.uint32(17).fixed64(T.startTimeUnixNano);
                          if (T.timeUnixNano != null && Object.hasOwnProperty.call(T, "timeUnixNano"))
                            z.uint32(25).fixed64(T.timeUnixNano);
                          if (T.count != null && Object.hasOwnProperty.call(T, "count")) z.uint32(33).fixed64(T.count);
                          if (T.sum != null && Object.hasOwnProperty.call(T, "sum")) z.uint32(41).double(T.sum);
                          if (T.quantileValues != null && T.quantileValues.length)
                            for (var A = 0; A < T.quantileValues.length; ++A)
                              UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile.encode(
                                T.quantileValues[A],
                                z.uint32(50).fork(),
                              ).ldelim();
                          if (T.attributes != null && T.attributes.length)
                            for (var A = 0; A < T.attributes.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.attributes[A],
                                z.uint32(58).fork(),
                              ).ldelim();
                          if (T.flags != null && Object.hasOwnProperty.call(T, "flags")) z.uint32(64).uint32(T.flags);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.metrics.v1.SummaryDataPoint();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 7: {
                                if (!(w.attributes && w.attributes.length)) w.attributes = [];
                                w.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              case 2: {
                                w.startTimeUnixNano = T.fixed64();
                                break;
                              }
                              case 3: {
                                w.timeUnixNano = T.fixed64();
                                break;
                              }
                              case 4: {
                                w.count = T.fixed64();
                                break;
                              }
                              case 5: {
                                w.sum = T.double();
                                break;
                              }
                              case 6: {
                                if (!(w.quantileValues && w.quantileValues.length)) w.quantileValues = [];
                                w.quantileValues.push(
                                  UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile.decode(
                                    T,
                                    T.uint32(),
                                  ),
                                );
                                break;
                              }
                              case 8: {
                                w.flags = T.uint32();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.attributes != null && T.hasOwnProperty("attributes")) {
                            if (!Array.isArray(T.attributes)) return "attributes: array expected";
                            for (var z = 0; z < T.attributes.length; ++z) {
                              var A = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.attributes[z]);
                              if (A) return "attributes." + A;
                            }
                          }
                          if (T.startTimeUnixNano != null && T.hasOwnProperty("startTimeUnixNano")) {
                            if (
                              !rH.isInteger(T.startTimeUnixNano) &&
                              !(
                                T.startTimeUnixNano &&
                                rH.isInteger(T.startTimeUnixNano.low) &&
                                rH.isInteger(T.startTimeUnixNano.high)
                              )
                            )
                              return "startTimeUnixNano: integer|Long expected";
                          }
                          if (T.timeUnixNano != null && T.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(T.timeUnixNano) &&
                              !(T.timeUnixNano && rH.isInteger(T.timeUnixNano.low) && rH.isInteger(T.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (T.count != null && T.hasOwnProperty("count")) {
                            if (
                              !rH.isInteger(T.count) &&
                              !(T.count && rH.isInteger(T.count.low) && rH.isInteger(T.count.high))
                            )
                              return "count: integer|Long expected";
                          }
                          if (T.sum != null && T.hasOwnProperty("sum")) {
                            if (typeof T.sum !== "number") return "sum: number expected";
                          }
                          if (T.quantileValues != null && T.hasOwnProperty("quantileValues")) {
                            if (!Array.isArray(T.quantileValues)) return "quantileValues: array expected";
                            for (var z = 0; z < T.quantileValues.length; ++z) {
                              var A = UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile.verify(
                                T.quantileValues[z],
                              );
                              if (A) return "quantileValues." + A;
                            }
                          }
                          if (T.flags != null && T.hasOwnProperty("flags")) {
                            if (!rH.isInteger(T.flags)) return "flags: integer expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.metrics.v1.SummaryDataPoint) return T;
                          var z = new UH.opentelemetry.proto.metrics.v1.SummaryDataPoint();
                          if (T.attributes) {
                            if (!Array.isArray(T.attributes))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.SummaryDataPoint.attributes: array expected",
                              );
                            z.attributes = [];
                            for (var A = 0; A < T.attributes.length; ++A) {
                              if (typeof T.attributes[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.SummaryDataPoint.attributes: object expected",
                                );
                              z.attributes[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.attributes[A]);
                            }
                          }
                          if (T.startTimeUnixNano != null) {
                            if (rH.Long) (z.startTimeUnixNano = rH.Long.fromValue(T.startTimeUnixNano)).unsigned = !1;
                            else if (typeof T.startTimeUnixNano === "string")
                              z.startTimeUnixNano = parseInt(T.startTimeUnixNano, 10);
                            else if (typeof T.startTimeUnixNano === "number") z.startTimeUnixNano = T.startTimeUnixNano;
                            else if (typeof T.startTimeUnixNano === "object")
                              z.startTimeUnixNano = new rH.LongBits(
                                T.startTimeUnixNano.low >>> 0,
                                T.startTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (T.timeUnixNano != null) {
                            if (rH.Long) (z.timeUnixNano = rH.Long.fromValue(T.timeUnixNano)).unsigned = !1;
                            else if (typeof T.timeUnixNano === "string") z.timeUnixNano = parseInt(T.timeUnixNano, 10);
                            else if (typeof T.timeUnixNano === "number") z.timeUnixNano = T.timeUnixNano;
                            else if (typeof T.timeUnixNano === "object")
                              z.timeUnixNano = new rH.LongBits(
                                T.timeUnixNano.low >>> 0,
                                T.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (T.count != null) {
                            if (rH.Long) (z.count = rH.Long.fromValue(T.count)).unsigned = !1;
                            else if (typeof T.count === "string") z.count = parseInt(T.count, 10);
                            else if (typeof T.count === "number") z.count = T.count;
                            else if (typeof T.count === "object")
                              z.count = new rH.LongBits(T.count.low >>> 0, T.count.high >>> 0).toNumber();
                          }
                          if (T.sum != null) z.sum = Number(T.sum);
                          if (T.quantileValues) {
                            if (!Array.isArray(T.quantileValues))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.SummaryDataPoint.quantileValues: array expected",
                              );
                            z.quantileValues = [];
                            for (var A = 0; A < T.quantileValues.length; ++A) {
                              if (typeof T.quantileValues[A] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.SummaryDataPoint.quantileValues: object expected",
                                );
                              z.quantileValues[A] =
                                UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile.fromObject(
                                  T.quantileValues[A],
                                );
                            }
                          }
                          if (T.flags != null) z.flags = T.flags >>> 0;
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) (A.quantileValues = []), (A.attributes = []);
                          if (z.defaults) {
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.startTimeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.startTimeUnixNano = z.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.timeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.timeUnixNano = z.longs === String ? "0" : 0;
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.count = z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.count = z.longs === String ? "0" : 0;
                            (A.sum = 0), (A.flags = 0);
                          }
                          if (T.startTimeUnixNano != null && T.hasOwnProperty("startTimeUnixNano"))
                            if (typeof T.startTimeUnixNano === "number")
                              A.startTimeUnixNano =
                                z.longs === String ? String(T.startTimeUnixNano) : T.startTimeUnixNano;
                            else
                              A.startTimeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.startTimeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(
                                        T.startTimeUnixNano.low >>> 0,
                                        T.startTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : T.startTimeUnixNano;
                          if (T.timeUnixNano != null && T.hasOwnProperty("timeUnixNano"))
                            if (typeof T.timeUnixNano === "number")
                              A.timeUnixNano = z.longs === String ? String(T.timeUnixNano) : T.timeUnixNano;
                            else
                              A.timeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.timeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(T.timeUnixNano.low >>> 0, T.timeUnixNano.high >>> 0).toNumber()
                                    : T.timeUnixNano;
                          if (T.count != null && T.hasOwnProperty("count"))
                            if (typeof T.count === "number") A.count = z.longs === String ? String(T.count) : T.count;
                            else
                              A.count =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.count)
                                  : z.longs === Number
                                    ? new rH.LongBits(T.count.low >>> 0, T.count.high >>> 0).toNumber()
                                    : T.count;
                          if (T.sum != null && T.hasOwnProperty("sum"))
                            A.sum = z.json && !isFinite(T.sum) ? String(T.sum) : T.sum;
                          if (T.quantileValues && T.quantileValues.length) {
                            A.quantileValues = [];
                            for (var w = 0; w < T.quantileValues.length; ++w)
                              A.quantileValues[w] =
                                UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile.toObject(
                                  T.quantileValues[w],
                                  z,
                                );
                          }
                          if (T.attributes && T.attributes.length) {
                            A.attributes = [];
                            for (var w = 0; w < T.attributes.length; ++w)
                              A.attributes[w] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.attributes[w], z);
                          }
                          if (T.flags != null && T.hasOwnProperty("flags")) A.flags = T.flags;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.metrics.v1.SummaryDataPoint";
                        }),
                        (K.ValueAtQuantile = (function () {
                          function O(T) {
                            if (T) {
                              for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                                if (T[z[A]] != null) this[z[A]] = T[z[A]];
                            }
                          }
                          return (
                            (O.prototype.quantile = null),
                            (O.prototype.value = null),
                            (O.create = function (z) {
                              return new O(z);
                            }),
                            (O.encode = function (z, A) {
                              if (!A) A = V1.create();
                              if (z.quantile != null && Object.hasOwnProperty.call(z, "quantile"))
                                A.uint32(9).double(z.quantile);
                              if (z.value != null && Object.hasOwnProperty.call(z, "value"))
                                A.uint32(17).double(z.value);
                              return A;
                            }),
                            (O.encodeDelimited = function (z, A) {
                              return this.encode(z, A).ldelim();
                            }),
                            (O.decode = function (z, A, f) {
                              if (!(z instanceof X6)) z = X6.create(z);
                              var w = A === void 0 ? z.len : z.pos + A,
                                Y = new UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile();
                              while (z.pos < w) {
                                var D = z.uint32();
                                if (D === f) break;
                                switch (D >>> 3) {
                                  case 1: {
                                    Y.quantile = z.double();
                                    break;
                                  }
                                  case 2: {
                                    Y.value = z.double();
                                    break;
                                  }
                                  default:
                                    z.skipType(D & 7);
                                    break;
                                }
                              }
                              return Y;
                            }),
                            (O.decodeDelimited = function (z) {
                              if (!(z instanceof X6)) z = new X6(z);
                              return this.decode(z, z.uint32());
                            }),
                            (O.verify = function (z) {
                              if (typeof z !== "object" || z === null) return "object expected";
                              if (z.quantile != null && z.hasOwnProperty("quantile")) {
                                if (typeof z.quantile !== "number") return "quantile: number expected";
                              }
                              if (z.value != null && z.hasOwnProperty("value")) {
                                if (typeof z.value !== "number") return "value: number expected";
                              }
                              return null;
                            }),
                            (O.fromObject = function (z) {
                              if (z instanceof UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile)
                                return z;
                              var A = new UH.opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile();
                              if (z.quantile != null) A.quantile = Number(z.quantile);
                              if (z.value != null) A.value = Number(z.value);
                              return A;
                            }),
                            (O.toObject = function (z, A) {
                              if (!A) A = {};
                              var f = {};
                              if (A.defaults) (f.quantile = 0), (f.value = 0);
                              if (z.quantile != null && z.hasOwnProperty("quantile"))
                                f.quantile = A.json && !isFinite(z.quantile) ? String(z.quantile) : z.quantile;
                              if (z.value != null && z.hasOwnProperty("value"))
                                f.value = A.json && !isFinite(z.value) ? String(z.value) : z.value;
                              return f;
                            }),
                            (O.prototype.toJSON = function () {
                              return this.constructor.toObject(this, D$.util.toJSONOptions);
                            }),
                            (O.getTypeUrl = function (z) {
                              if (z === void 0) z = "type.googleapis.com";
                              return z + "/opentelemetry.proto.metrics.v1.SummaryDataPoint.ValueAtQuantile";
                            }),
                            O
                          );
                        })()),
                        K
                      );
                    })()),
                    ($.Exemplar = (function () {
                      function K(T) {
                        if (((this.filteredAttributes = []), T)) {
                          for (var z = Object.keys(T), A = 0; A < z.length; ++A)
                            if (T[z[A]] != null) this[z[A]] = T[z[A]];
                        }
                      }
                      (K.prototype.filteredAttributes = rH.emptyArray),
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.asDouble = null),
                        (K.prototype.asInt = null),
                        (K.prototype.spanId = null),
                        (K.prototype.traceId = null);
                      var O;
                      return (
                        Object.defineProperty(K.prototype, "value", {
                          get: rH.oneOfGetter((O = ["asDouble", "asInt"])),
                          set: rH.oneOfSetter(O),
                        }),
                        (K.create = function (z) {
                          return new K(z);
                        }),
                        (K.encode = function (z, A) {
                          if (!A) A = V1.create();
                          if (z.timeUnixNano != null && Object.hasOwnProperty.call(z, "timeUnixNano"))
                            A.uint32(17).fixed64(z.timeUnixNano);
                          if (z.asDouble != null && Object.hasOwnProperty.call(z, "asDouble"))
                            A.uint32(25).double(z.asDouble);
                          if (z.spanId != null && Object.hasOwnProperty.call(z, "spanId")) A.uint32(34).bytes(z.spanId);
                          if (z.traceId != null && Object.hasOwnProperty.call(z, "traceId"))
                            A.uint32(42).bytes(z.traceId);
                          if (z.asInt != null && Object.hasOwnProperty.call(z, "asInt")) A.uint32(49).sfixed64(z.asInt);
                          if (z.filteredAttributes != null && z.filteredAttributes.length)
                            for (var f = 0; f < z.filteredAttributes.length; ++f)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                z.filteredAttributes[f],
                                A.uint32(58).fork(),
                              ).ldelim();
                          return A;
                        }),
                        (K.encodeDelimited = function (z, A) {
                          return this.encode(z, A).ldelim();
                        }),
                        (K.decode = function (z, A, f) {
                          if (!(z instanceof X6)) z = X6.create(z);
                          var w = A === void 0 ? z.len : z.pos + A,
                            Y = new UH.opentelemetry.proto.metrics.v1.Exemplar();
                          while (z.pos < w) {
                            var D = z.uint32();
                            if (D === f) break;
                            switch (D >>> 3) {
                              case 7: {
                                if (!(Y.filteredAttributes && Y.filteredAttributes.length)) Y.filteredAttributes = [];
                                Y.filteredAttributes.push(
                                  UH.opentelemetry.proto.common.v1.KeyValue.decode(z, z.uint32()),
                                );
                                break;
                              }
                              case 2: {
                                Y.timeUnixNano = z.fixed64();
                                break;
                              }
                              case 3: {
                                Y.asDouble = z.double();
                                break;
                              }
                              case 6: {
                                Y.asInt = z.sfixed64();
                                break;
                              }
                              case 4: {
                                Y.spanId = z.bytes();
                                break;
                              }
                              case 5: {
                                Y.traceId = z.bytes();
                                break;
                              }
                              default:
                                z.skipType(D & 7);
                                break;
                            }
                          }
                          return Y;
                        }),
                        (K.decodeDelimited = function (z) {
                          if (!(z instanceof X6)) z = new X6(z);
                          return this.decode(z, z.uint32());
                        }),
                        (K.verify = function (z) {
                          if (typeof z !== "object" || z === null) return "object expected";
                          var A = {};
                          if (z.filteredAttributes != null && z.hasOwnProperty("filteredAttributes")) {
                            if (!Array.isArray(z.filteredAttributes)) return "filteredAttributes: array expected";
                            for (var f = 0; f < z.filteredAttributes.length; ++f) {
                              var w = UH.opentelemetry.proto.common.v1.KeyValue.verify(z.filteredAttributes[f]);
                              if (w) return "filteredAttributes." + w;
                            }
                          }
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(z.timeUnixNano) &&
                              !(z.timeUnixNano && rH.isInteger(z.timeUnixNano.low) && rH.isInteger(z.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (z.asDouble != null && z.hasOwnProperty("asDouble")) {
                            if (((A.value = 1), typeof z.asDouble !== "number")) return "asDouble: number expected";
                          }
                          if (z.asInt != null && z.hasOwnProperty("asInt")) {
                            if (A.value === 1) return "value: multiple values";
                            if (
                              ((A.value = 1),
                              !rH.isInteger(z.asInt) &&
                                !(z.asInt && rH.isInteger(z.asInt.low) && rH.isInteger(z.asInt.high)))
                            )
                              return "asInt: integer|Long expected";
                          }
                          if (z.spanId != null && z.hasOwnProperty("spanId")) {
                            if (!((z.spanId && typeof z.spanId.length === "number") || rH.isString(z.spanId)))
                              return "spanId: buffer expected";
                          }
                          if (z.traceId != null && z.hasOwnProperty("traceId")) {
                            if (!((z.traceId && typeof z.traceId.length === "number") || rH.isString(z.traceId)))
                              return "traceId: buffer expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (z) {
                          if (z instanceof UH.opentelemetry.proto.metrics.v1.Exemplar) return z;
                          var A = new UH.opentelemetry.proto.metrics.v1.Exemplar();
                          if (z.filteredAttributes) {
                            if (!Array.isArray(z.filteredAttributes))
                              throw TypeError(
                                ".opentelemetry.proto.metrics.v1.Exemplar.filteredAttributes: array expected",
                              );
                            A.filteredAttributes = [];
                            for (var f = 0; f < z.filteredAttributes.length; ++f) {
                              if (typeof z.filteredAttributes[f] !== "object")
                                throw TypeError(
                                  ".opentelemetry.proto.metrics.v1.Exemplar.filteredAttributes: object expected",
                                );
                              A.filteredAttributes[f] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(
                                z.filteredAttributes[f],
                              );
                            }
                          }
                          if (z.timeUnixNano != null) {
                            if (rH.Long) (A.timeUnixNano = rH.Long.fromValue(z.timeUnixNano)).unsigned = !1;
                            else if (typeof z.timeUnixNano === "string") A.timeUnixNano = parseInt(z.timeUnixNano, 10);
                            else if (typeof z.timeUnixNano === "number") A.timeUnixNano = z.timeUnixNano;
                            else if (typeof z.timeUnixNano === "object")
                              A.timeUnixNano = new rH.LongBits(
                                z.timeUnixNano.low >>> 0,
                                z.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (z.asDouble != null) A.asDouble = Number(z.asDouble);
                          if (z.asInt != null) {
                            if (rH.Long) (A.asInt = rH.Long.fromValue(z.asInt)).unsigned = !1;
                            else if (typeof z.asInt === "string") A.asInt = parseInt(z.asInt, 10);
                            else if (typeof z.asInt === "number") A.asInt = z.asInt;
                            else if (typeof z.asInt === "object")
                              A.asInt = new rH.LongBits(z.asInt.low >>> 0, z.asInt.high >>> 0).toNumber();
                          }
                          if (z.spanId != null) {
                            if (typeof z.spanId === "string")
                              rH.base64.decode(z.spanId, (A.spanId = rH.newBuffer(rH.base64.length(z.spanId))), 0);
                            else if (z.spanId.length >= 0) A.spanId = z.spanId;
                          }
                          if (z.traceId != null) {
                            if (typeof z.traceId === "string")
                              rH.base64.decode(z.traceId, (A.traceId = rH.newBuffer(rH.base64.length(z.traceId))), 0);
                            else if (z.traceId.length >= 0) A.traceId = z.traceId;
                          }
                          return A;
                        }),
                        (K.toObject = function (z, A) {
                          if (!A) A = {};
                          var f = {};
                          if (A.arrays || A.defaults) f.filteredAttributes = [];
                          if (A.defaults) {
                            if (rH.Long) {
                              var w = new rH.Long(0, 0, !1);
                              f.timeUnixNano =
                                A.longs === String ? w.toString() : A.longs === Number ? w.toNumber() : w;
                            } else f.timeUnixNano = A.longs === String ? "0" : 0;
                            if (A.bytes === String) f.spanId = "";
                            else if (((f.spanId = []), A.bytes !== Array)) f.spanId = rH.newBuffer(f.spanId);
                            if (A.bytes === String) f.traceId = "";
                            else if (((f.traceId = []), A.bytes !== Array)) f.traceId = rH.newBuffer(f.traceId);
                          }
                          if (z.timeUnixNano != null && z.hasOwnProperty("timeUnixNano"))
                            if (typeof z.timeUnixNano === "number")
                              f.timeUnixNano = A.longs === String ? String(z.timeUnixNano) : z.timeUnixNano;
                            else
                              f.timeUnixNano =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.timeUnixNano)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.timeUnixNano.low >>> 0, z.timeUnixNano.high >>> 0).toNumber()
                                    : z.timeUnixNano;
                          if (z.asDouble != null && z.hasOwnProperty("asDouble")) {
                            if (
                              ((f.asDouble = A.json && !isFinite(z.asDouble) ? String(z.asDouble) : z.asDouble),
                              A.oneofs)
                            )
                              f.value = "asDouble";
                          }
                          if (z.spanId != null && z.hasOwnProperty("spanId"))
                            f.spanId =
                              A.bytes === String
                                ? rH.base64.encode(z.spanId, 0, z.spanId.length)
                                : A.bytes === Array
                                  ? Array.prototype.slice.call(z.spanId)
                                  : z.spanId;
                          if (z.traceId != null && z.hasOwnProperty("traceId"))
                            f.traceId =
                              A.bytes === String
                                ? rH.base64.encode(z.traceId, 0, z.traceId.length)
                                : A.bytes === Array
                                  ? Array.prototype.slice.call(z.traceId)
                                  : z.traceId;
                          if (z.asInt != null && z.hasOwnProperty("asInt")) {
                            if (typeof z.asInt === "number") f.asInt = A.longs === String ? String(z.asInt) : z.asInt;
                            else
                              f.asInt =
                                A.longs === String
                                  ? rH.Long.prototype.toString.call(z.asInt)
                                  : A.longs === Number
                                    ? new rH.LongBits(z.asInt.low >>> 0, z.asInt.high >>> 0).toNumber()
                                    : z.asInt;
                            if (A.oneofs) f.value = "asInt";
                          }
                          if (z.filteredAttributes && z.filteredAttributes.length) {
                            f.filteredAttributes = [];
                            for (var Y = 0; Y < z.filteredAttributes.length; ++Y)
                              f.filteredAttributes[Y] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(
                                z.filteredAttributes[Y],
                                A,
                              );
                          }
                          return f;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (z) {
                          if (z === void 0) z = "type.googleapis.com";
                          return z + "/opentelemetry.proto.metrics.v1.Exemplar";
                        }),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            (_.logs = (function () {
              var q = {};
              return (
                (q.v1 = (function () {
                  var $ = {};
                  return (
                    ($.LogsData = (function () {
                      function K(O) {
                        if (((this.resourceLogs = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resourceLogs = rH.emptyArray),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resourceLogs != null && T.resourceLogs.length)
                            for (var A = 0; A < T.resourceLogs.length; ++A)
                              UH.opentelemetry.proto.logs.v1.ResourceLogs.encode(
                                T.resourceLogs[A],
                                z.uint32(10).fork(),
                              ).ldelim();
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.logs.v1.LogsData();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                if (!(w.resourceLogs && w.resourceLogs.length)) w.resourceLogs = [];
                                w.resourceLogs.push(UH.opentelemetry.proto.logs.v1.ResourceLogs.decode(T, T.uint32()));
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resourceLogs != null && T.hasOwnProperty("resourceLogs")) {
                            if (!Array.isArray(T.resourceLogs)) return "resourceLogs: array expected";
                            for (var z = 0; z < T.resourceLogs.length; ++z) {
                              var A = UH.opentelemetry.proto.logs.v1.ResourceLogs.verify(T.resourceLogs[z]);
                              if (A) return "resourceLogs." + A;
                            }
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.logs.v1.LogsData) return T;
                          var z = new UH.opentelemetry.proto.logs.v1.LogsData();
                          if (T.resourceLogs) {
                            if (!Array.isArray(T.resourceLogs))
                              throw TypeError(".opentelemetry.proto.logs.v1.LogsData.resourceLogs: array expected");
                            z.resourceLogs = [];
                            for (var A = 0; A < T.resourceLogs.length; ++A) {
                              if (typeof T.resourceLogs[A] !== "object")
                                throw TypeError(".opentelemetry.proto.logs.v1.LogsData.resourceLogs: object expected");
                              z.resourceLogs[A] = UH.opentelemetry.proto.logs.v1.ResourceLogs.fromObject(
                                T.resourceLogs[A],
                              );
                            }
                          }
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.resourceLogs = [];
                          if (T.resourceLogs && T.resourceLogs.length) {
                            A.resourceLogs = [];
                            for (var f = 0; f < T.resourceLogs.length; ++f)
                              A.resourceLogs[f] = UH.opentelemetry.proto.logs.v1.ResourceLogs.toObject(
                                T.resourceLogs[f],
                                z,
                              );
                          }
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.logs.v1.LogsData";
                        }),
                        K
                      );
                    })()),
                    ($.ResourceLogs = (function () {
                      function K(O) {
                        if (((this.scopeLogs = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.resource = null),
                        (K.prototype.scopeLogs = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.resource != null && Object.hasOwnProperty.call(T, "resource"))
                            UH.opentelemetry.proto.resource.v1.Resource.encode(
                              T.resource,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.scopeLogs != null && T.scopeLogs.length)
                            for (var A = 0; A < T.scopeLogs.length; ++A)
                              UH.opentelemetry.proto.logs.v1.ScopeLogs.encode(
                                T.scopeLogs[A],
                                z.uint32(18).fork(),
                              ).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.logs.v1.ResourceLogs();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.resource = UH.opentelemetry.proto.resource.v1.Resource.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.scopeLogs && w.scopeLogs.length)) w.scopeLogs = [];
                                w.scopeLogs.push(UH.opentelemetry.proto.logs.v1.ScopeLogs.decode(T, T.uint32()));
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.resource != null && T.hasOwnProperty("resource")) {
                            var z = UH.opentelemetry.proto.resource.v1.Resource.verify(T.resource);
                            if (z) return "resource." + z;
                          }
                          if (T.scopeLogs != null && T.hasOwnProperty("scopeLogs")) {
                            if (!Array.isArray(T.scopeLogs)) return "scopeLogs: array expected";
                            for (var A = 0; A < T.scopeLogs.length; ++A) {
                              var z = UH.opentelemetry.proto.logs.v1.ScopeLogs.verify(T.scopeLogs[A]);
                              if (z) return "scopeLogs." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.logs.v1.ResourceLogs) return T;
                          var z = new UH.opentelemetry.proto.logs.v1.ResourceLogs();
                          if (T.resource != null) {
                            if (typeof T.resource !== "object")
                              throw TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.resource: object expected");
                            z.resource = UH.opentelemetry.proto.resource.v1.Resource.fromObject(T.resource);
                          }
                          if (T.scopeLogs) {
                            if (!Array.isArray(T.scopeLogs))
                              throw TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.scopeLogs: array expected");
                            z.scopeLogs = [];
                            for (var A = 0; A < T.scopeLogs.length; ++A) {
                              if (typeof T.scopeLogs[A] !== "object")
                                throw TypeError(".opentelemetry.proto.logs.v1.ResourceLogs.scopeLogs: object expected");
                              z.scopeLogs[A] = UH.opentelemetry.proto.logs.v1.ScopeLogs.fromObject(T.scopeLogs[A]);
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.scopeLogs = [];
                          if (z.defaults) (A.resource = null), (A.schemaUrl = "");
                          if (T.resource != null && T.hasOwnProperty("resource"))
                            A.resource = UH.opentelemetry.proto.resource.v1.Resource.toObject(T.resource, z);
                          if (T.scopeLogs && T.scopeLogs.length) {
                            A.scopeLogs = [];
                            for (var f = 0; f < T.scopeLogs.length; ++f)
                              A.scopeLogs[f] = UH.opentelemetry.proto.logs.v1.ScopeLogs.toObject(T.scopeLogs[f], z);
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.logs.v1.ResourceLogs";
                        }),
                        K
                      );
                    })()),
                    ($.ScopeLogs = (function () {
                      function K(O) {
                        if (((this.logRecords = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.scope = null),
                        (K.prototype.logRecords = rH.emptyArray),
                        (K.prototype.schemaUrl = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.scope != null && Object.hasOwnProperty.call(T, "scope"))
                            UH.opentelemetry.proto.common.v1.InstrumentationScope.encode(
                              T.scope,
                              z.uint32(10).fork(),
                            ).ldelim();
                          if (T.logRecords != null && T.logRecords.length)
                            for (var A = 0; A < T.logRecords.length; ++A)
                              UH.opentelemetry.proto.logs.v1.LogRecord.encode(
                                T.logRecords[A],
                                z.uint32(18).fork(),
                              ).ldelim();
                          if (T.schemaUrl != null && Object.hasOwnProperty.call(T, "schemaUrl"))
                            z.uint32(26).string(T.schemaUrl);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.logs.v1.ScopeLogs();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.decode(T, T.uint32());
                                break;
                              }
                              case 2: {
                                if (!(w.logRecords && w.logRecords.length)) w.logRecords = [];
                                w.logRecords.push(UH.opentelemetry.proto.logs.v1.LogRecord.decode(T, T.uint32()));
                                break;
                              }
                              case 3: {
                                w.schemaUrl = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.scope != null && T.hasOwnProperty("scope")) {
                            var z = UH.opentelemetry.proto.common.v1.InstrumentationScope.verify(T.scope);
                            if (z) return "scope." + z;
                          }
                          if (T.logRecords != null && T.hasOwnProperty("logRecords")) {
                            if (!Array.isArray(T.logRecords)) return "logRecords: array expected";
                            for (var A = 0; A < T.logRecords.length; ++A) {
                              var z = UH.opentelemetry.proto.logs.v1.LogRecord.verify(T.logRecords[A]);
                              if (z) return "logRecords." + z;
                            }
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) {
                            if (!rH.isString(T.schemaUrl)) return "schemaUrl: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.logs.v1.ScopeLogs) return T;
                          var z = new UH.opentelemetry.proto.logs.v1.ScopeLogs();
                          if (T.scope != null) {
                            if (typeof T.scope !== "object")
                              throw TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.scope: object expected");
                            z.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.fromObject(T.scope);
                          }
                          if (T.logRecords) {
                            if (!Array.isArray(T.logRecords))
                              throw TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.logRecords: array expected");
                            z.logRecords = [];
                            for (var A = 0; A < T.logRecords.length; ++A) {
                              if (typeof T.logRecords[A] !== "object")
                                throw TypeError(".opentelemetry.proto.logs.v1.ScopeLogs.logRecords: object expected");
                              z.logRecords[A] = UH.opentelemetry.proto.logs.v1.LogRecord.fromObject(T.logRecords[A]);
                            }
                          }
                          if (T.schemaUrl != null) z.schemaUrl = String(T.schemaUrl);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.logRecords = [];
                          if (z.defaults) (A.scope = null), (A.schemaUrl = "");
                          if (T.scope != null && T.hasOwnProperty("scope"))
                            A.scope = UH.opentelemetry.proto.common.v1.InstrumentationScope.toObject(T.scope, z);
                          if (T.logRecords && T.logRecords.length) {
                            A.logRecords = [];
                            for (var f = 0; f < T.logRecords.length; ++f)
                              A.logRecords[f] = UH.opentelemetry.proto.logs.v1.LogRecord.toObject(T.logRecords[f], z);
                          }
                          if (T.schemaUrl != null && T.hasOwnProperty("schemaUrl")) A.schemaUrl = T.schemaUrl;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.logs.v1.ScopeLogs";
                        }),
                        K
                      );
                    })()),
                    ($.SeverityNumber = (function () {
                      var K = {},
                        O = Object.create(K);
                      return (
                        (O[(K[0] = "SEVERITY_NUMBER_UNSPECIFIED")] = 0),
                        (O[(K[1] = "SEVERITY_NUMBER_TRACE")] = 1),
                        (O[(K[2] = "SEVERITY_NUMBER_TRACE2")] = 2),
                        (O[(K[3] = "SEVERITY_NUMBER_TRACE3")] = 3),
                        (O[(K[4] = "SEVERITY_NUMBER_TRACE4")] = 4),
                        (O[(K[5] = "SEVERITY_NUMBER_DEBUG")] = 5),
                        (O[(K[6] = "SEVERITY_NUMBER_DEBUG2")] = 6),
                        (O[(K[7] = "SEVERITY_NUMBER_DEBUG3")] = 7),
                        (O[(K[8] = "SEVERITY_NUMBER_DEBUG4")] = 8),
                        (O[(K[9] = "SEVERITY_NUMBER_INFO")] = 9),
                        (O[(K[10] = "SEVERITY_NUMBER_INFO2")] = 10),
                        (O[(K[11] = "SEVERITY_NUMBER_INFO3")] = 11),
                        (O[(K[12] = "SEVERITY_NUMBER_INFO4")] = 12),
                        (O[(K[13] = "SEVERITY_NUMBER_WARN")] = 13),
                        (O[(K[14] = "SEVERITY_NUMBER_WARN2")] = 14),
                        (O[(K[15] = "SEVERITY_NUMBER_WARN3")] = 15),
                        (O[(K[16] = "SEVERITY_NUMBER_WARN4")] = 16),
                        (O[(K[17] = "SEVERITY_NUMBER_ERROR")] = 17),
                        (O[(K[18] = "SEVERITY_NUMBER_ERROR2")] = 18),
                        (O[(K[19] = "SEVERITY_NUMBER_ERROR3")] = 19),
                        (O[(K[20] = "SEVERITY_NUMBER_ERROR4")] = 20),
                        (O[(K[21] = "SEVERITY_NUMBER_FATAL")] = 21),
                        (O[(K[22] = "SEVERITY_NUMBER_FATAL2")] = 22),
                        (O[(K[23] = "SEVERITY_NUMBER_FATAL3")] = 23),
                        (O[(K[24] = "SEVERITY_NUMBER_FATAL4")] = 24),
                        O
                      );
                    })()),
                    ($.LogRecordFlags = (function () {
                      var K = {},
                        O = Object.create(K);
                      return (
                        (O[(K[0] = "LOG_RECORD_FLAGS_DO_NOT_USE")] = 0),
                        (O[(K[255] = "LOG_RECORD_FLAGS_TRACE_FLAGS_MASK")] = 255),
                        O
                      );
                    })()),
                    ($.LogRecord = (function () {
                      function K(O) {
                        if (((this.attributes = []), O)) {
                          for (var T = Object.keys(O), z = 0; z < T.length; ++z)
                            if (O[T[z]] != null) this[T[z]] = O[T[z]];
                        }
                      }
                      return (
                        (K.prototype.timeUnixNano = null),
                        (K.prototype.observedTimeUnixNano = null),
                        (K.prototype.severityNumber = null),
                        (K.prototype.severityText = null),
                        (K.prototype.body = null),
                        (K.prototype.attributes = rH.emptyArray),
                        (K.prototype.droppedAttributesCount = null),
                        (K.prototype.flags = null),
                        (K.prototype.traceId = null),
                        (K.prototype.spanId = null),
                        (K.prototype.eventName = null),
                        (K.create = function (T) {
                          return new K(T);
                        }),
                        (K.encode = function (T, z) {
                          if (!z) z = V1.create();
                          if (T.timeUnixNano != null && Object.hasOwnProperty.call(T, "timeUnixNano"))
                            z.uint32(9).fixed64(T.timeUnixNano);
                          if (T.severityNumber != null && Object.hasOwnProperty.call(T, "severityNumber"))
                            z.uint32(16).int32(T.severityNumber);
                          if (T.severityText != null && Object.hasOwnProperty.call(T, "severityText"))
                            z.uint32(26).string(T.severityText);
                          if (T.body != null && Object.hasOwnProperty.call(T, "body"))
                            UH.opentelemetry.proto.common.v1.AnyValue.encode(T.body, z.uint32(42).fork()).ldelim();
                          if (T.attributes != null && T.attributes.length)
                            for (var A = 0; A < T.attributes.length; ++A)
                              UH.opentelemetry.proto.common.v1.KeyValue.encode(
                                T.attributes[A],
                                z.uint32(50).fork(),
                              ).ldelim();
                          if (
                            T.droppedAttributesCount != null &&
                            Object.hasOwnProperty.call(T, "droppedAttributesCount")
                          )
                            z.uint32(56).uint32(T.droppedAttributesCount);
                          if (T.flags != null && Object.hasOwnProperty.call(T, "flags")) z.uint32(69).fixed32(T.flags);
                          if (T.traceId != null && Object.hasOwnProperty.call(T, "traceId"))
                            z.uint32(74).bytes(T.traceId);
                          if (T.spanId != null && Object.hasOwnProperty.call(T, "spanId")) z.uint32(82).bytes(T.spanId);
                          if (T.observedTimeUnixNano != null && Object.hasOwnProperty.call(T, "observedTimeUnixNano"))
                            z.uint32(89).fixed64(T.observedTimeUnixNano);
                          if (T.eventName != null && Object.hasOwnProperty.call(T, "eventName"))
                            z.uint32(98).string(T.eventName);
                          return z;
                        }),
                        (K.encodeDelimited = function (T, z) {
                          return this.encode(T, z).ldelim();
                        }),
                        (K.decode = function (T, z, A) {
                          if (!(T instanceof X6)) T = X6.create(T);
                          var f = z === void 0 ? T.len : T.pos + z,
                            w = new UH.opentelemetry.proto.logs.v1.LogRecord();
                          while (T.pos < f) {
                            var Y = T.uint32();
                            if (Y === A) break;
                            switch (Y >>> 3) {
                              case 1: {
                                w.timeUnixNano = T.fixed64();
                                break;
                              }
                              case 11: {
                                w.observedTimeUnixNano = T.fixed64();
                                break;
                              }
                              case 2: {
                                w.severityNumber = T.int32();
                                break;
                              }
                              case 3: {
                                w.severityText = T.string();
                                break;
                              }
                              case 5: {
                                w.body = UH.opentelemetry.proto.common.v1.AnyValue.decode(T, T.uint32());
                                break;
                              }
                              case 6: {
                                if (!(w.attributes && w.attributes.length)) w.attributes = [];
                                w.attributes.push(UH.opentelemetry.proto.common.v1.KeyValue.decode(T, T.uint32()));
                                break;
                              }
                              case 7: {
                                w.droppedAttributesCount = T.uint32();
                                break;
                              }
                              case 8: {
                                w.flags = T.fixed32();
                                break;
                              }
                              case 9: {
                                w.traceId = T.bytes();
                                break;
                              }
                              case 10: {
                                w.spanId = T.bytes();
                                break;
                              }
                              case 12: {
                                w.eventName = T.string();
                                break;
                              }
                              default:
                                T.skipType(Y & 7);
                                break;
                            }
                          }
                          return w;
                        }),
                        (K.decodeDelimited = function (T) {
                          if (!(T instanceof X6)) T = new X6(T);
                          return this.decode(T, T.uint32());
                        }),
                        (K.verify = function (T) {
                          if (typeof T !== "object" || T === null) return "object expected";
                          if (T.timeUnixNano != null && T.hasOwnProperty("timeUnixNano")) {
                            if (
                              !rH.isInteger(T.timeUnixNano) &&
                              !(T.timeUnixNano && rH.isInteger(T.timeUnixNano.low) && rH.isInteger(T.timeUnixNano.high))
                            )
                              return "timeUnixNano: integer|Long expected";
                          }
                          if (T.observedTimeUnixNano != null && T.hasOwnProperty("observedTimeUnixNano")) {
                            if (
                              !rH.isInteger(T.observedTimeUnixNano) &&
                              !(
                                T.observedTimeUnixNano &&
                                rH.isInteger(T.observedTimeUnixNano.low) &&
                                rH.isInteger(T.observedTimeUnixNano.high)
                              )
                            )
                              return "observedTimeUnixNano: integer|Long expected";
                          }
                          if (T.severityNumber != null && T.hasOwnProperty("severityNumber"))
                            switch (T.severityNumber) {
                              default:
                                return "severityNumber: enum value expected";
                              case 0:
                              case 1:
                              case 2:
                              case 3:
                              case 4:
                              case 5:
                              case 6:
                              case 7:
                              case 8:
                              case 9:
                              case 10:
                              case 11:
                              case 12:
                              case 13:
                              case 14:
                              case 15:
                              case 16:
                              case 17:
                              case 18:
                              case 19:
                              case 20:
                              case 21:
                              case 22:
                              case 23:
                              case 24:
                                break;
                            }
                          if (T.severityText != null && T.hasOwnProperty("severityText")) {
                            if (!rH.isString(T.severityText)) return "severityText: string expected";
                          }
                          if (T.body != null && T.hasOwnProperty("body")) {
                            var z = UH.opentelemetry.proto.common.v1.AnyValue.verify(T.body);
                            if (z) return "body." + z;
                          }
                          if (T.attributes != null && T.hasOwnProperty("attributes")) {
                            if (!Array.isArray(T.attributes)) return "attributes: array expected";
                            for (var A = 0; A < T.attributes.length; ++A) {
                              var z = UH.opentelemetry.proto.common.v1.KeyValue.verify(T.attributes[A]);
                              if (z) return "attributes." + z;
                            }
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount")) {
                            if (!rH.isInteger(T.droppedAttributesCount))
                              return "droppedAttributesCount: integer expected";
                          }
                          if (T.flags != null && T.hasOwnProperty("flags")) {
                            if (!rH.isInteger(T.flags)) return "flags: integer expected";
                          }
                          if (T.traceId != null && T.hasOwnProperty("traceId")) {
                            if (!((T.traceId && typeof T.traceId.length === "number") || rH.isString(T.traceId)))
                              return "traceId: buffer expected";
                          }
                          if (T.spanId != null && T.hasOwnProperty("spanId")) {
                            if (!((T.spanId && typeof T.spanId.length === "number") || rH.isString(T.spanId)))
                              return "spanId: buffer expected";
                          }
                          if (T.eventName != null && T.hasOwnProperty("eventName")) {
                            if (!rH.isString(T.eventName)) return "eventName: string expected";
                          }
                          return null;
                        }),
                        (K.fromObject = function (T) {
                          if (T instanceof UH.opentelemetry.proto.logs.v1.LogRecord) return T;
                          var z = new UH.opentelemetry.proto.logs.v1.LogRecord();
                          if (T.timeUnixNano != null) {
                            if (rH.Long) (z.timeUnixNano = rH.Long.fromValue(T.timeUnixNano)).unsigned = !1;
                            else if (typeof T.timeUnixNano === "string") z.timeUnixNano = parseInt(T.timeUnixNano, 10);
                            else if (typeof T.timeUnixNano === "number") z.timeUnixNano = T.timeUnixNano;
                            else if (typeof T.timeUnixNano === "object")
                              z.timeUnixNano = new rH.LongBits(
                                T.timeUnixNano.low >>> 0,
                                T.timeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          if (T.observedTimeUnixNano != null) {
                            if (rH.Long)
                              (z.observedTimeUnixNano = rH.Long.fromValue(T.observedTimeUnixNano)).unsigned = !1;
                            else if (typeof T.observedTimeUnixNano === "string")
                              z.observedTimeUnixNano = parseInt(T.observedTimeUnixNano, 10);
                            else if (typeof T.observedTimeUnixNano === "number")
                              z.observedTimeUnixNano = T.observedTimeUnixNano;
                            else if (typeof T.observedTimeUnixNano === "object")
                              z.observedTimeUnixNano = new rH.LongBits(
                                T.observedTimeUnixNano.low >>> 0,
                                T.observedTimeUnixNano.high >>> 0,
                              ).toNumber();
                          }
                          switch (T.severityNumber) {
                            default:
                              if (typeof T.severityNumber === "number") {
                                z.severityNumber = T.severityNumber;
                                break;
                              }
                              break;
                            case "SEVERITY_NUMBER_UNSPECIFIED":
                            case 0:
                              z.severityNumber = 0;
                              break;
                            case "SEVERITY_NUMBER_TRACE":
                            case 1:
                              z.severityNumber = 1;
                              break;
                            case "SEVERITY_NUMBER_TRACE2":
                            case 2:
                              z.severityNumber = 2;
                              break;
                            case "SEVERITY_NUMBER_TRACE3":
                            case 3:
                              z.severityNumber = 3;
                              break;
                            case "SEVERITY_NUMBER_TRACE4":
                            case 4:
                              z.severityNumber = 4;
                              break;
                            case "SEVERITY_NUMBER_DEBUG":
                            case 5:
                              z.severityNumber = 5;
                              break;
                            case "SEVERITY_NUMBER_DEBUG2":
                            case 6:
                              z.severityNumber = 6;
                              break;
                            case "SEVERITY_NUMBER_DEBUG3":
                            case 7:
                              z.severityNumber = 7;
                              break;
                            case "SEVERITY_NUMBER_DEBUG4":
                            case 8:
                              z.severityNumber = 8;
                              break;
                            case "SEVERITY_NUMBER_INFO":
                            case 9:
                              z.severityNumber = 9;
                              break;
                            case "SEVERITY_NUMBER_INFO2":
                            case 10:
                              z.severityNumber = 10;
                              break;
                            case "SEVERITY_NUMBER_INFO3":
                            case 11:
                              z.severityNumber = 11;
                              break;
                            case "SEVERITY_NUMBER_INFO4":
                            case 12:
                              z.severityNumber = 12;
                              break;
                            case "SEVERITY_NUMBER_WARN":
                            case 13:
                              z.severityNumber = 13;
                              break;
                            case "SEVERITY_NUMBER_WARN2":
                            case 14:
                              z.severityNumber = 14;
                              break;
                            case "SEVERITY_NUMBER_WARN3":
                            case 15:
                              z.severityNumber = 15;
                              break;
                            case "SEVERITY_NUMBER_WARN4":
                            case 16:
                              z.severityNumber = 16;
                              break;
                            case "SEVERITY_NUMBER_ERROR":
                            case 17:
                              z.severityNumber = 17;
                              break;
                            case "SEVERITY_NUMBER_ERROR2":
                            case 18:
                              z.severityNumber = 18;
                              break;
                            case "SEVERITY_NUMBER_ERROR3":
                            case 19:
                              z.severityNumber = 19;
                              break;
                            case "SEVERITY_NUMBER_ERROR4":
                            case 20:
                              z.severityNumber = 20;
                              break;
                            case "SEVERITY_NUMBER_FATAL":
                            case 21:
                              z.severityNumber = 21;
                              break;
                            case "SEVERITY_NUMBER_FATAL2":
                            case 22:
                              z.severityNumber = 22;
                              break;
                            case "SEVERITY_NUMBER_FATAL3":
                            case 23:
                              z.severityNumber = 23;
                              break;
                            case "SEVERITY_NUMBER_FATAL4":
                            case 24:
                              z.severityNumber = 24;
                              break;
                          }
                          if (T.severityText != null) z.severityText = String(T.severityText);
                          if (T.body != null) {
                            if (typeof T.body !== "object")
                              throw TypeError(".opentelemetry.proto.logs.v1.LogRecord.body: object expected");
                            z.body = UH.opentelemetry.proto.common.v1.AnyValue.fromObject(T.body);
                          }
                          if (T.attributes) {
                            if (!Array.isArray(T.attributes))
                              throw TypeError(".opentelemetry.proto.logs.v1.LogRecord.attributes: array expected");
                            z.attributes = [];
                            for (var A = 0; A < T.attributes.length; ++A) {
                              if (typeof T.attributes[A] !== "object")
                                throw TypeError(".opentelemetry.proto.logs.v1.LogRecord.attributes: object expected");
                              z.attributes[A] = UH.opentelemetry.proto.common.v1.KeyValue.fromObject(T.attributes[A]);
                            }
                          }
                          if (T.droppedAttributesCount != null)
                            z.droppedAttributesCount = T.droppedAttributesCount >>> 0;
                          if (T.flags != null) z.flags = T.flags >>> 0;
                          if (T.traceId != null) {
                            if (typeof T.traceId === "string")
                              rH.base64.decode(T.traceId, (z.traceId = rH.newBuffer(rH.base64.length(T.traceId))), 0);
                            else if (T.traceId.length >= 0) z.traceId = T.traceId;
                          }
                          if (T.spanId != null) {
                            if (typeof T.spanId === "string")
                              rH.base64.decode(T.spanId, (z.spanId = rH.newBuffer(rH.base64.length(T.spanId))), 0);
                            else if (T.spanId.length >= 0) z.spanId = T.spanId;
                          }
                          if (T.eventName != null) z.eventName = String(T.eventName);
                          return z;
                        }),
                        (K.toObject = function (T, z) {
                          if (!z) z = {};
                          var A = {};
                          if (z.arrays || z.defaults) A.attributes = [];
                          if (z.defaults) {
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.timeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.timeUnixNano = z.longs === String ? "0" : 0;
                            if (
                              ((A.severityNumber = z.enums === String ? "SEVERITY_NUMBER_UNSPECIFIED" : 0),
                              (A.severityText = ""),
                              (A.body = null),
                              (A.droppedAttributesCount = 0),
                              (A.flags = 0),
                              z.bytes === String)
                            )
                              A.traceId = "";
                            else if (((A.traceId = []), z.bytes !== Array)) A.traceId = rH.newBuffer(A.traceId);
                            if (z.bytes === String) A.spanId = "";
                            else if (((A.spanId = []), z.bytes !== Array)) A.spanId = rH.newBuffer(A.spanId);
                            if (rH.Long) {
                              var f = new rH.Long(0, 0, !1);
                              A.observedTimeUnixNano =
                                z.longs === String ? f.toString() : z.longs === Number ? f.toNumber() : f;
                            } else A.observedTimeUnixNano = z.longs === String ? "0" : 0;
                            A.eventName = "";
                          }
                          if (T.timeUnixNano != null && T.hasOwnProperty("timeUnixNano"))
                            if (typeof T.timeUnixNano === "number")
                              A.timeUnixNano = z.longs === String ? String(T.timeUnixNano) : T.timeUnixNano;
                            else
                              A.timeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.timeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(T.timeUnixNano.low >>> 0, T.timeUnixNano.high >>> 0).toNumber()
                                    : T.timeUnixNano;
                          if (T.severityNumber != null && T.hasOwnProperty("severityNumber"))
                            A.severityNumber =
                              z.enums === String
                                ? UH.opentelemetry.proto.logs.v1.SeverityNumber[T.severityNumber] === void 0
                                  ? T.severityNumber
                                  : UH.opentelemetry.proto.logs.v1.SeverityNumber[T.severityNumber]
                                : T.severityNumber;
                          if (T.severityText != null && T.hasOwnProperty("severityText"))
                            A.severityText = T.severityText;
                          if (T.body != null && T.hasOwnProperty("body"))
                            A.body = UH.opentelemetry.proto.common.v1.AnyValue.toObject(T.body, z);
                          if (T.attributes && T.attributes.length) {
                            A.attributes = [];
                            for (var w = 0; w < T.attributes.length; ++w)
                              A.attributes[w] = UH.opentelemetry.proto.common.v1.KeyValue.toObject(T.attributes[w], z);
                          }
                          if (T.droppedAttributesCount != null && T.hasOwnProperty("droppedAttributesCount"))
                            A.droppedAttributesCount = T.droppedAttributesCount;
                          if (T.flags != null && T.hasOwnProperty("flags")) A.flags = T.flags;
                          if (T.traceId != null && T.hasOwnProperty("traceId"))
                            A.traceId =
                              z.bytes === String
                                ? rH.base64.encode(T.traceId, 0, T.traceId.length)
                                : z.bytes === Array
                                  ? Array.prototype.slice.call(T.traceId)
                                  : T.traceId;
                          if (T.spanId != null && T.hasOwnProperty("spanId"))
                            A.spanId =
                              z.bytes === String
                                ? rH.base64.encode(T.spanId, 0, T.spanId.length)
                                : z.bytes === Array
                                  ? Array.prototype.slice.call(T.spanId)
                                  : T.spanId;
                          if (T.observedTimeUnixNano != null && T.hasOwnProperty("observedTimeUnixNano"))
                            if (typeof T.observedTimeUnixNano === "number")
                              A.observedTimeUnixNano =
                                z.longs === String ? String(T.observedTimeUnixNano) : T.observedTimeUnixNano;
                            else
                              A.observedTimeUnixNano =
                                z.longs === String
                                  ? rH.Long.prototype.toString.call(T.observedTimeUnixNano)
                                  : z.longs === Number
                                    ? new rH.LongBits(
                                        T.observedTimeUnixNano.low >>> 0,
                                        T.observedTimeUnixNano.high >>> 0,
                                      ).toNumber()
                                    : T.observedTimeUnixNano;
                          if (T.eventName != null && T.hasOwnProperty("eventName")) A.eventName = T.eventName;
                          return A;
                        }),
                        (K.prototype.toJSON = function () {
                          return this.constructor.toObject(this, D$.util.toJSONOptions);
                        }),
                        (K.getTypeUrl = function (T) {
                          if (T === void 0) T = "type.googleapis.com";
                          return T + "/opentelemetry.proto.logs.v1.LogRecord";
                        }),
                        K
                      );
                    })()),
                    $
                  );
                })()),
                q
              );
            })()),
            _
          );
        })()),
        H
      );
    })();
    hp7.exports = UH;
  });

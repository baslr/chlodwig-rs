  var Kx = d((Bl3, F77) => {
    var bf = XK();
    F3();
    B6H();
    var A7 = (F77.exports = bf.asn1 = bf.asn1 || {});
    A7.Class = { UNIVERSAL: 0, APPLICATION: 64, CONTEXT_SPECIFIC: 128, PRIVATE: 192 };
    A7.Type = {
      NONE: 0,
      BOOLEAN: 1,
      INTEGER: 2,
      BITSTRING: 3,
      OCTETSTRING: 4,
      NULL: 5,
      OID: 6,
      ODESC: 7,
      EXTERNAL: 8,
      REAL: 9,
      ENUMERATED: 10,
      EMBEDDED: 11,
      UTF8: 12,
      ROID: 13,
      SEQUENCE: 16,
      SET: 17,
      PRINTABLESTRING: 19,
      IA5STRING: 22,
      UTCTIME: 23,
      GENERALIZEDTIME: 24,
      BMPSTRING: 30,
    };
    A7.maxDepth = 256;
    A7.create = function (H, _, q, $, K) {
      if (bf.util.isArray($)) {
        var O = [];
        for (var T = 0; T < $.length; ++T) if ($[T] !== void 0) O.push($[T]);
        $ = O;
      }
      var z = { tagClass: H, type: _, constructed: q, composed: q || bf.util.isArray($), value: $ };
      if (K && "bitStringContents" in K) (z.bitStringContents = K.bitStringContents), (z.original = A7.copy(z));
      return z;
    };
    A7.copy = function (H, _) {
      var q;
      if (bf.util.isArray(H)) {
        q = [];
        for (var $ = 0; $ < H.length; ++$) q.push(A7.copy(H[$], _));
        return q;
      }
      if (typeof H === "string") return H;
      if (
        ((q = {
          tagClass: H.tagClass,
          type: H.type,
          constructed: H.constructed,
          composed: H.composed,
          value: A7.copy(H.value, _),
        }),
        _ && !_.excludeBitStringContents)
      )
        q.bitStringContents = H.bitStringContents;
      return q;
    };
    A7.equals = function (H, _, q) {
      if (bf.util.isArray(H)) {
        if (!bf.util.isArray(_)) return !1;
        if (H.length !== _.length) return !1;
        for (var $ = 0; $ < H.length; ++$) if (!A7.equals(H[$], _[$])) return !1;
        return !0;
      }
      if (typeof H !== typeof _) return !1;
      if (typeof H === "string") return H === _;
      var K =
        H.tagClass === _.tagClass &&
        H.type === _.type &&
        H.constructed === _.constructed &&
        H.composed === _.composed &&
        A7.equals(H.value, _.value);
      if (q && q.includeBitStringContents) K = K && H.bitStringContents === _.bitStringContents;
      return K;
    };
    A7.getBerValueLength = function (H) {
      var _ = H.getByte();
      if (_ === 128) return;
      var q,
        $ = _ & 128;
      if (!$) q = _;
      else q = H.getInt((_ & 127) << 3);
      return q;
    };
    function SlH(H, _, q) {
      if (q > _) {
        var $ = Error("Too few bytes to parse DER.");
        throw (($.available = H.length()), ($.remaining = _), ($.requested = q), $);
      }
    }
    var Gd4 = function (H, _) {
      var q = H.getByte();
      if ((_--, q === 128)) return;
      var $,
        K = q & 128;
      if (!K) $ = q;
      else {
        var O = q & 127;
        SlH(H, _, O), ($ = H.getInt(O << 3));
      }
      if ($ < 0) throw Error("Negative length: " + $);
      return $;
    };
    A7.fromDer = function (H, _) {
      if (_ === void 0) _ = { strict: !0, parseAllBytes: !0, decodeBitStrings: !0 };
      if (typeof _ === "boolean") _ = { strict: _, parseAllBytes: !0, decodeBitStrings: !0 };
      if (!("strict" in _)) _.strict = !0;
      if (!("parseAllBytes" in _)) _.parseAllBytes = !0;
      if (!("decodeBitStrings" in _)) _.decodeBitStrings = !0;
      if (!("maxDepth" in _)) _.maxDepth = A7.maxDepth;
      if (typeof H === "string") H = bf.util.createBuffer(H);
      var q = H.length(),
        $ = Rk_(H, H.length(), 0, _);
      if (_.parseAllBytes && H.length() !== 0) {
        var K = Error("Unparsed DER bytes remain after ASN.1 parsing.");
        throw ((K.byteCount = q), (K.remaining = H.length()), K);
      }
      return $;
    };
    function Rk_(H, _, q, $) {
      if (q >= $.maxDepth) throw Error("ASN.1 parsing error: Max depth exceeded.");
      var K;
      SlH(H, _, 2);
      var O = H.getByte();
      _--;
      var T = O & 192,
        z = O & 31;
      K = H.length();
      var A = Gd4(H, _);
      if (((_ -= K - H.length()), A !== void 0 && A > _)) {
        if ($.strict) {
          var f = Error("Too few bytes to read ASN.1 value.");
          throw ((f.available = H.length()), (f.remaining = _), (f.requested = A), f);
        }
        A = _;
      }
      var w,
        Y,
        D = (O & 32) === 32;
      if (D)
        if (((w = []), A === void 0))
          for (;;) {
            if ((SlH(H, _, 2), H.bytes(2) === String.fromCharCode(0, 0))) {
              H.getBytes(2), (_ -= 2);
              break;
            }
            (K = H.length()), w.push(Rk_(H, _, q + 1, $)), (_ -= K - H.length());
          }
        else while (A > 0) (K = H.length()), w.push(Rk_(H, A, q + 1, $)), (_ -= K - H.length()), (A -= K - H.length());
      if (w === void 0 && T === A7.Class.UNIVERSAL && z === A7.Type.BITSTRING) Y = H.bytes(A);
      if (w === void 0 && $.decodeBitStrings && T === A7.Class.UNIVERSAL && z === A7.Type.BITSTRING && A > 1) {
        var j = H.read,
          M = _,
          J = 0;
        if (z === A7.Type.BITSTRING) SlH(H, _, 1), (J = H.getByte()), _--;
        if (J === 0)
          try {
            K = H.length();
            var P = { strict: !0, decodeBitStrings: !0 },
              X = Rk_(H, _, q + 1, P),
              R = K - H.length();
            if (((_ -= R), z == A7.Type.BITSTRING)) R++;
            var W = X.tagClass;
            if (R === A && (W === A7.Class.UNIVERSAL || W === A7.Class.CONTEXT_SPECIFIC)) w = [X];
          } catch (k) {}
        if (w === void 0) (H.read = j), (_ = M);
      }
      if (w === void 0) {
        if (A === void 0) {
          if ($.strict) throw Error("Non-constructed ASN.1 object of indefinite length.");
          A = _;
        }
        if (z === A7.Type.BMPSTRING) {
          w = "";
          for (; A > 0; A -= 2) SlH(H, _, 2), (w += String.fromCharCode(H.getInt16())), (_ -= 2);
        } else (w = H.getBytes(A)), (_ -= A);
      }
      var Z = Y === void 0 ? null : { bitStringContents: Y };
      return A7.create(T, z, D, w, Z);
    }
    A7.toDer = function (H) {
      var _ = bf.util.createBuffer(),
        q = H.tagClass | H.type,
        $ = bf.util.createBuffer(),
        K = !1;
      if ("bitStringContents" in H) {
        if (((K = !0), H.original)) K = A7.equals(H, H.original);
      }
      if (K) $.putBytes(H.bitStringContents);
      else if (H.composed) {
        if (H.constructed) q |= 32;
        else $.putByte(0);
        for (var O = 0; O < H.value.length; ++O) if (H.value[O] !== void 0) $.putBuffer(A7.toDer(H.value[O]));
      } else if (H.type === A7.Type.BMPSTRING)
        for (var O = 0; O < H.value.length; ++O) $.putInt16(H.value.charCodeAt(O));
      else if (
        H.type === A7.Type.INTEGER &&
        H.value.length > 1 &&
        ((H.value.charCodeAt(0) === 0 && (H.value.charCodeAt(1) & 128) === 0) ||
          (H.value.charCodeAt(0) === 255 && (H.value.charCodeAt(1) & 128) === 128))
      )
        $.putBytes(H.value.substr(1));
      else $.putBytes(H.value);
      if ((_.putByte(q), $.length() <= 127)) _.putByte($.length() & 127);
      else {
        var T = $.length(),
          z = "";
        do (z += String.fromCharCode(T & 255)), (T = T >>> 8);
        while (T > 0);
        _.putByte(z.length | 128);
        for (var O = z.length - 1; O >= 0; --O) _.putByte(z.charCodeAt(O));
      }
      return _.putBuffer($), _;
    };
    A7.oidToDer = function (H) {
      var _ = H.split("."),
        q = bf.util.createBuffer();
      q.putByte(40 * parseInt(_[0], 10) + parseInt(_[1], 10));
      var $, K, O, T;
      for (var z = 2; z < _.length; ++z) {
        if ((($ = !0), (K = []), (O = parseInt(_[z], 10)), O > 4294967295))
          throw Error("OID value too large; max is 32-bits.");
        do {
          if (((T = O & 127), (O = O >>> 7), !$)) T |= 128;
          K.push(T), ($ = !1);
        } while (O > 0);
        for (var A = K.length - 1; A >= 0; --A) q.putByte(K[A]);
      }
      return q;
    };
    A7.derToOid = function (H) {
      var _;
      if (typeof H === "string") H = bf.util.createBuffer(H);
      var q = H.getByte();
      _ = Math.floor(q / 40) + "." + (q % 40);
      var $ = 0;
      while (H.length() > 0) {
        if ($ > 70368744177663) throw Error("OID value too large; max is 53-bits.");
        if (((q = H.getByte()), ($ = $ * 128), q & 128)) $ += q & 127;
        else (_ += "." + ($ + q)), ($ = 0);
      }
      return _;
    };
    A7.utcTimeToDate = function (H) {
      var _ = new Date(),
        q = parseInt(H.substr(0, 2), 10);
      q = q >= 50 ? 1900 + q : 2000 + q;
      var $ = parseInt(H.substr(2, 2), 10) - 1,
        K = parseInt(H.substr(4, 2), 10),
        O = parseInt(H.substr(6, 2), 10),
        T = parseInt(H.substr(8, 2), 10),
        z = 0;
      if (H.length > 11) {
        var A = H.charAt(10),
          f = 10;
        if (A !== "+" && A !== "-") (z = parseInt(H.substr(10, 2), 10)), (f += 2);
      }
      if ((_.setUTCFullYear(q, $, K), _.setUTCHours(O, T, z, 0), f)) {
        if (((A = H.charAt(f)), A === "+" || A === "-")) {
          var w = parseInt(H.substr(f + 1, 2), 10),
            Y = parseInt(H.substr(f + 4, 2), 10),
            D = w * 60 + Y;
          if (((D *= 60000), A === "+")) _.setTime(+_ - D);
          else _.setTime(+_ + D);
        }
      }
      return _;
    };
    A7.generalizedTimeToDate = function (H) {
      var _ = new Date(),
        q = parseInt(H.substr(0, 4), 10),
        $ = parseInt(H.substr(4, 2), 10) - 1,
        K = parseInt(H.substr(6, 2), 10),
        O = parseInt(H.substr(8, 2), 10),
        T = parseInt(H.substr(10, 2), 10),
        z = parseInt(H.substr(12, 2), 10),
        A = 0,
        f = 0,
        w = !1;
      if (H.charAt(H.length - 1) === "Z") w = !0;
      var Y = H.length - 5,
        D = H.charAt(Y);
      if (D === "+" || D === "-") {
        var j = parseInt(H.substr(Y + 1, 2), 10),
          M = parseInt(H.substr(Y + 4, 2), 10);
        if (((f = j * 60 + M), (f *= 60000), D === "+")) f *= -1;
        w = !0;
      }
      if (H.charAt(14) === ".") A = parseFloat(H.substr(14), 10) * 1000;
      if (w) _.setUTCFullYear(q, $, K), _.setUTCHours(O, T, z, A), _.setTime(+_ + f);
      else _.setFullYear(q, $, K), _.setHours(O, T, z, A);
      return _;
    };
    A7.dateToUtcTime = function (H) {
      if (typeof H === "string") return H;
      var _ = "",
        q = [];
      q.push(("" + H.getUTCFullYear()).substr(2)),
        q.push("" + (H.getUTCMonth() + 1)),
        q.push("" + H.getUTCDate()),
        q.push("" + H.getUTCHours()),
        q.push("" + H.getUTCMinutes()),
        q.push("" + H.getUTCSeconds());
      for (var $ = 0; $ < q.length; ++$) {
        if (q[$].length < 2) _ += "0";
        _ += q[$];
      }
      return (_ += "Z"), _;
    };
    A7.dateToGeneralizedTime = function (H) {
      if (typeof H === "string") return H;
      var _ = "",
        q = [];
      q.push("" + H.getUTCFullYear()),
        q.push("" + (H.getUTCMonth() + 1)),
        q.push("" + H.getUTCDate()),
        q.push("" + H.getUTCHours()),
        q.push("" + H.getUTCMinutes()),
        q.push("" + H.getUTCSeconds());
      for (var $ = 0; $ < q.length; ++$) {
        if (q[$].length < 2) _ += "0";
        _ += q[$];
      }
      return (_ += "Z"), _;
    };
    A7.integerToDer = function (H) {
      var _ = bf.util.createBuffer();
      if (H >= -128 && H < 128) return _.putSignedInt(H, 8);
      if (H >= -32768 && H < 32768) return _.putSignedInt(H, 16);
      if (H >= -8388608 && H < 8388608) return _.putSignedInt(H, 24);
      if (H >= -2147483648 && H < 2147483648) return _.putSignedInt(H, 32);
      var q = Error("Integer too large; max is 32-bits.");
      throw ((q.integer = H), q);
    };
    A7.derToInteger = function (H) {
      if (typeof H === "string") H = bf.util.createBuffer(H);
      var _ = H.length() * 8;
      if (_ > 32) throw Error("Integer too large; max is 32-bits.");
      return H.getSignedInt(_);
    };
    A7.validate = function (H, _, q, $) {
      var K = !1;
      if ((H.tagClass === _.tagClass || typeof _.tagClass > "u") && (H.type === _.type || typeof _.type > "u")) {
        if (H.constructed === _.constructed || typeof _.constructed > "u") {
          if (((K = !0), _.value && bf.util.isArray(_.value))) {
            var O = 0;
            for (var T = 0; K && T < _.value.length; ++T) {
              var z = _.value[T];
              K = !!z.optional;
              var A = H.value[O];
              if (!A) {
                if (!z.optional) {
                  if (((K = !1), $))
                    $.push(
                      "[" +
                        _.name +
                        '] Missing required element. Expected tag class "' +
                        z.tagClass +
                        '", type "' +
                        z.type +
                        '"',
                    );
                }
                continue;
              }
              var f = typeof z.tagClass < "u" && typeof z.type < "u";
              if (f && (A.tagClass !== z.tagClass || A.type !== z.type))
                if (z.optional) {
                  K = !0;
                  continue;
                } else {
                  if (((K = !1), $))
                    $.push(
                      "[" +
                        _.name +
                        "] Tag mismatch. Expected (" +
                        z.tagClass +
                        "," +
                        z.type +
                        "), got (" +
                        A.tagClass +
                        "," +
                        A.type +
                        ")",
                    );
                  break;
                }
              var w = A7.validate(A, z, q, $);
              if (w) ++O, (K = !0);
              else if (z.optional) K = !0;
              else {
                K = !1;
                break;
              }
            }
          }
          if (K && q) {
            if (_.capture) q[_.capture] = H.value;
            if (_.captureAsn1) q[_.captureAsn1] = H;
            if (_.captureBitStringContents && "bitStringContents" in H)
              q[_.captureBitStringContents] = H.bitStringContents;
            if (_.captureBitStringValue && "bitStringContents" in H) {
              var Y;
              if (H.bitStringContents.length < 2) q[_.captureBitStringValue] = "";
              else {
                var D = H.bitStringContents.charCodeAt(0);
                if (D !== 0) throw Error("captureBitStringValue only supported for zero unused bits");
                q[_.captureBitStringValue] = H.bitStringContents.slice(1);
              }
            }
          }
        } else if ($)
          $.push("[" + _.name + '] Expected constructed "' + _.constructed + '", got "' + H.constructed + '"');
      } else if ($) {
        if (H.tagClass !== _.tagClass)
          $.push("[" + _.name + '] Expected tag class "' + _.tagClass + '", got "' + H.tagClass + '"');
        if (H.type !== _.type) $.push("[" + _.name + '] Expected type "' + _.type + '", got "' + H.type + '"');
      }
      return K;
    };
    var c77 = /[^\\u0000-\\u00ff]/;
    A7.prettyPrint = function (H, _, q) {
      var $ = "";
      if (((_ = _ || 0), (q = q || 2), _ > 0))
        $ += `
`;
      var K = "";
      for (var O = 0; O < _ * q; ++O) K += " ";
      switch ((($ += K + "Tag: "), H.tagClass)) {
        case A7.Class.UNIVERSAL:
          $ += "Universal:";
          break;
        case A7.Class.APPLICATION:
          $ += "Application:";
          break;
        case A7.Class.CONTEXT_SPECIFIC:
          $ += "Context-Specific:";
          break;
        case A7.Class.PRIVATE:
          $ += "Private:";
          break;
      }
      if (H.tagClass === A7.Class.UNIVERSAL)
        switch ((($ += H.type), H.type)) {
          case A7.Type.NONE:
            $ += " (None)";
            break;
          case A7.Type.BOOLEAN:
            $ += " (Boolean)";
            break;
          case A7.Type.INTEGER:
            $ += " (Integer)";
            break;
          case A7.Type.BITSTRING:
            $ += " (Bit string)";
            break;
          case A7.Type.OCTETSTRING:
            $ += " (Octet string)";
            break;
          case A7.Type.NULL:
            $ += " (Null)";
            break;
          case A7.Type.OID:
            $ += " (Object Identifier)";
            break;
          case A7.Type.ODESC:
            $ += " (Object Descriptor)";
            break;
          case A7.Type.EXTERNAL:
            $ += " (External or Instance of)";
            break;
          case A7.Type.REAL:
            $ += " (Real)";
            break;
          case A7.Type.ENUMERATED:
            $ += " (Enumerated)";
            break;
          case A7.Type.EMBEDDED:
            $ += " (Embedded PDV)";
            break;
          case A7.Type.UTF8:
            $ += " (UTF8)";
            break;
          case A7.Type.ROID:
            $ += " (Relative Object Identifier)";
            break;
          case A7.Type.SEQUENCE:
            $ += " (Sequence)";
            break;
          case A7.Type.SET:
            $ += " (Set)";
            break;
          case A7.Type.PRINTABLESTRING:
            $ += " (Printable String)";
            break;
          case A7.Type.IA5String:
            $ += " (IA5String (ASCII))";
            break;
          case A7.Type.UTCTIME:
            $ += " (UTC time)";
            break;
          case A7.Type.GENERALIZEDTIME:
            $ += " (Generalized time)";
            break;
          case A7.Type.BMPSTRING:
            $ += " (BMP String)";
            break;
        }
      else $ += H.type;
      if (
        (($ += `
`),
        ($ +=
          K +
          "Constructed: " +
          H.constructed +
          `
`),
        H.composed)
      ) {
        var T = 0,
          z = "";
        for (var O = 0; O < H.value.length; ++O)
          if (H.value[O] !== void 0) {
            if (((T += 1), (z += A7.prettyPrint(H.value[O], _ + 1, q)), O + 1 < H.value.length)) z += ",";
          }
        $ += K + "Sub values: " + T + z;
      } else {
        if ((($ += K + "Value: "), H.type === A7.Type.OID)) {
          var A = A7.derToOid(H.value);
          if ((($ += A), bf.pki && bf.pki.oids)) {
            if (A in bf.pki.oids) $ += " (" + bf.pki.oids[A] + ") ";
          }
        }
        if (H.type === A7.Type.INTEGER)
          try {
            $ += A7.derToInteger(H.value);
          } catch (w) {
            $ += "0x" + bf.util.bytesToHex(H.value);
          }
        else if (H.type === A7.Type.BITSTRING) {
          if (H.value.length > 1) $ += "0x" + bf.util.bytesToHex(H.value.slice(1));
          else $ += "(none)";
          if (H.value.length > 0) {
            var f = H.value.charCodeAt(0);
            if (f == 1) $ += " (1 unused bit shown)";
            else if (f > 1) $ += " (" + f + " unused bits shown)";
          }
        } else if (H.type === A7.Type.OCTETSTRING) {
          if (!c77.test(H.value)) $ += "(" + H.value + ") ";
          $ += "0x" + bf.util.bytesToHex(H.value);
        } else if (H.type === A7.Type.UTF8)
          try {
            $ += bf.util.decodeUtf8(H.value);
          } catch (w) {
            if (w.message === "URI malformed") $ += "0x" + bf.util.bytesToHex(H.value) + " (malformed UTF8)";
            else throw w;
          }
        else if (H.type === A7.Type.PRINTABLESTRING || H.type === A7.Type.IA5String) $ += H.value;
        else if (c77.test(H.value)) $ += "0x" + bf.util.bytesToHex(H.value);
        else if (H.value.length === 0) $ += "[null]";
        else $ += H.value;
      }
      return $;
    };
  });

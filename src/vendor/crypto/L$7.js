  var L$7 = d((Di3, Z$7) => {
    var oX = XK();
    IlH();
    pE();
    EC6();
    F3();
    var J$7 = w$7(),
      VU4 = J$7.publicKeyValidator,
      SU4 = J$7.privateKeyValidator;
    if (typeof uC6 > "u") uC6 = oX.jsbn.BigInteger;
    var uC6,
      xC6 = oX.util.ByteBuffer,
      ok = typeof Buffer > "u" ? Uint8Array : Buffer;
    oX.pki = oX.pki || {};
    Z$7.exports = oX.pki.ed25519 = oX.ed25519 = oX.ed25519 || {};
    var z5 = oX.ed25519;
    z5.constants = {};
    z5.constants.PUBLIC_KEY_BYTE_LENGTH = 32;
    z5.constants.PRIVATE_KEY_BYTE_LENGTH = 64;
    z5.constants.SEED_BYTE_LENGTH = 32;
    z5.constants.SIGN_BYTE_LENGTH = 64;
    z5.constants.HASH_BYTE_LENGTH = 64;
    z5.generateKeyPair = function (H) {
      H = H || {};
      var _ = H.seed;
      if (_ === void 0) _ = oX.random.getBytesSync(z5.constants.SEED_BYTE_LENGTH);
      else if (typeof _ === "string") {
        if (_.length !== z5.constants.SEED_BYTE_LENGTH)
          throw TypeError('"seed" must be ' + z5.constants.SEED_BYTE_LENGTH + " bytes in length.");
      } else if (!(_ instanceof Uint8Array))
        throw TypeError('"seed" must be a node.js Buffer, Uint8Array, or a binary string.');
      _ = Dn({ message: _, encoding: "binary" });
      var q = new ok(z5.constants.PUBLIC_KEY_BYTE_LENGTH),
        $ = new ok(z5.constants.PRIVATE_KEY_BYTE_LENGTH);
      for (var K = 0; K < 32; ++K) $[K] = _[K];
      return IU4(q, $), { publicKey: q, privateKey: $ };
    };
    z5.privateKeyFromAsn1 = function (H) {
      var _ = {},
        q = [],
        $ = oX.asn1.validate(H, SU4, _, q);
      if (!$) {
        var K = Error("Invalid Key.");
        throw ((K.errors = q), K);
      }
      var O = oX.asn1.derToOid(_.privateKeyOid),
        T = oX.oids.EdDSA25519;
      if (O !== T) throw Error('Invalid OID "' + O + '"; OID must be "' + T + '".');
      var z = _.privateKey,
        A = Dn({ message: oX.asn1.fromDer(z).value, encoding: "binary" });
      return { privateKeyBytes: A };
    };
    z5.publicKeyFromAsn1 = function (H) {
      var _ = {},
        q = [],
        $ = oX.asn1.validate(H, VU4, _, q);
      if (!$) {
        var K = Error("Invalid Key.");
        throw ((K.errors = q), K);
      }
      var O = oX.asn1.derToOid(_.publicKeyOid),
        T = oX.oids.EdDSA25519;
      if (O !== T) throw Error('Invalid OID "' + O + '"; OID must be "' + T + '".');
      var z = _.ed25519PublicKey;
      if (z.length !== z5.constants.PUBLIC_KEY_BYTE_LENGTH) throw Error("Key length is invalid.");
      return Dn({ message: z, encoding: "binary" });
    };
    z5.publicKeyFromPrivateKey = function (H) {
      H = H || {};
      var _ = Dn({ message: H.privateKey, encoding: "binary" });
      if (_.length !== z5.constants.PRIVATE_KEY_BYTE_LENGTH)
        throw TypeError('"options.privateKey" must have a byte length of ' + z5.constants.PRIVATE_KEY_BYTE_LENGTH);
      var q = new ok(z5.constants.PUBLIC_KEY_BYTE_LENGTH);
      for (var $ = 0; $ < q.length; ++$) q[$] = _[32 + $];
      return q;
    };
    z5.sign = function (H) {
      H = H || {};
      var _ = Dn(H),
        q = Dn({ message: H.privateKey, encoding: "binary" });
      if (q.length === z5.constants.SEED_BYTE_LENGTH) {
        var $ = z5.generateKeyPair({ seed: q });
        q = $.privateKey;
      } else if (q.length !== z5.constants.PRIVATE_KEY_BYTE_LENGTH)
        throw TypeError(
          '"options.privateKey" must have a byte length of ' +
            z5.constants.SEED_BYTE_LENGTH +
            " or " +
            z5.constants.PRIVATE_KEY_BYTE_LENGTH,
        );
      var K = new ok(z5.constants.SIGN_BYTE_LENGTH + _.length);
      uU4(K, _, _.length, q);
      var O = new ok(z5.constants.SIGN_BYTE_LENGTH);
      for (var T = 0; T < O.length; ++T) O[T] = K[T];
      return O;
    };
    z5.verify = function (H) {
      H = H || {};
      var _ = Dn(H);
      if (H.signature === void 0)
        throw TypeError(
          '"options.signature" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a binary string.',
        );
      var q = Dn({ message: H.signature, encoding: "binary" });
      if (q.length !== z5.constants.SIGN_BYTE_LENGTH)
        throw TypeError('"options.signature" must have a byte length of ' + z5.constants.SIGN_BYTE_LENGTH);
      var $ = Dn({ message: H.publicKey, encoding: "binary" });
      if ($.length !== z5.constants.PUBLIC_KEY_BYTE_LENGTH)
        throw TypeError('"options.publicKey" must have a byte length of ' + z5.constants.PUBLIC_KEY_BYTE_LENGTH);
      var K = new ok(z5.constants.SIGN_BYTE_LENGTH + _.length),
        O = new ok(z5.constants.SIGN_BYTE_LENGTH + _.length),
        T;
      for (T = 0; T < z5.constants.SIGN_BYTE_LENGTH; ++T) K[T] = q[T];
      for (T = 0; T < _.length; ++T) K[T + z5.constants.SIGN_BYTE_LENGTH] = _[T];
      return xU4(O, K, K.length, $) >= 0;
    };
    function Dn(H) {
      var _ = H.message;
      if (_ instanceof Uint8Array || _ instanceof ok) return _;
      var q = H.encoding;
      if (_ === void 0)
        if (H.md) (_ = H.md.digest().getBytes()), (q = "binary");
        else throw TypeError('"options.message" or "options.md" not specified.');
      if (typeof _ === "string" && !q) throw TypeError('"options.encoding" must be "binary" or "utf8".');
      if (typeof _ === "string") {
        if (typeof Buffer < "u") return Buffer.from(_, q);
        _ = new xC6(_, q);
      } else if (!(_ instanceof xC6))
        throw TypeError(
          '"options.message" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a string with "options.encoding" specifying its encoding.',
        );
      var $ = new ok(_.length());
      for (var K = 0; K < $.length; ++K) $[K] = _.at(K);
      return $;
    }
    var mC6 = n$(),
      ck_ = n$([1]),
      EU4 = n$([
        30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995,
      ]),
      CU4 = n$([
        61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222,
      ]),
      Y$7 = n$([
        54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553,
      ]),
      D$7 = n$([
        26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214,
      ]),
      bC6 = new Float64Array([
        237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 16,
      ]),
      bU4 = n$([
        41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139,
      ]);
    function glH(H, _) {
      var q = oX.md.sha512.create(),
        $ = new xC6(H);
      q.update($.getBytes(_), "binary");
      var K = q.digest().getBytes();
      if (typeof Buffer < "u") return Buffer.from(K, "binary");
      var O = new ok(z5.constants.HASH_BYTE_LENGTH);
      for (var T = 0; T < 64; ++T) O[T] = K.charCodeAt(T);
      return O;
    }
    function IU4(H, _) {
      var q = [n$(), n$(), n$(), n$()],
        $,
        K = glH(_, 32);
      (K[0] &= 248), (K[31] &= 127), (K[31] |= 64), dC6(q, K), gC6(H, q);
      for ($ = 0; $ < 32; ++$) _[$ + 32] = H[$];
      return 0;
    }
    function uU4(H, _, q, $) {
      var K,
        O,
        T = new Float64Array(64),
        z = [n$(), n$(), n$(), n$()],
        A = glH($, 32);
      (A[0] &= 248), (A[31] &= 127), (A[31] |= 64);
      var f = q + 64;
      for (K = 0; K < q; ++K) H[64 + K] = _[K];
      for (K = 0; K < 32; ++K) H[32 + K] = A[32 + K];
      var w = glH(H.subarray(32), q + 32);
      pC6(w), dC6(z, w), gC6(H, z);
      for (K = 32; K < 64; ++K) H[K] = $[K];
      var Y = glH(H, q + 64);
      pC6(Y);
      for (K = 32; K < 64; ++K) T[K] = 0;
      for (K = 0; K < 32; ++K) T[K] = w[K];
      for (K = 0; K < 32; ++K) for (O = 0; O < 32; O++) T[K + O] += Y[K] * A[O];
      return P$7(H.subarray(32), T), f;
    }
    function xU4(H, _, q, $) {
      var K,
        O,
        T = new ok(32),
        z = [n$(), n$(), n$(), n$()],
        A = [n$(), n$(), n$(), n$()];
      if (((O = -1), q < 64)) return -1;
      if (mU4(A, $)) return -1;
      for (K = 0; K < q; ++K) H[K] = _[K];
      for (K = 0; K < 32; ++K) H[K + 32] = $[K];
      var f = glH(H, q);
      if ((pC6(f), G$7(z, A, f), dC6(A, _.subarray(32)), BC6(z, A), gC6(T, z), (q -= 64), X$7(_, 0, T, 0))) {
        for (K = 0; K < q; ++K) H[K] = 0;
        return -1;
      }
      for (K = 0; K < q; ++K) H[K] = _[K + 64];
      return (O = q), O;
    }
    function P$7(H, _) {
      var q, $, K, O;
      for ($ = 63; $ >= 32; --$) {
        q = 0;
        for (K = $ - 32, O = $ - 12; K < O; ++K)
          (_[K] += q - 16 * _[$] * bC6[K - ($ - 32)]), (q = (_[K] + 128) >> 8), (_[K] -= q * 256);
        (_[K] += q), (_[$] = 0);
      }
      q = 0;
      for (K = 0; K < 32; ++K) (_[K] += q - (_[31] >> 4) * bC6[K]), (q = _[K] >> 8), (_[K] &= 255);
      for (K = 0; K < 32; ++K) _[K] -= q * bC6[K];
      for ($ = 0; $ < 32; ++$) (_[$ + 1] += _[$] >> 8), (H[$] = _[$] & 255);
    }
    function pC6(H) {
      var _ = new Float64Array(64);
      for (var q = 0; q < 64; ++q) (_[q] = H[q]), (H[q] = 0);
      P$7(H, _);
    }
    function BC6(H, _) {
      var q = n$(),
        $ = n$(),
        K = n$(),
        O = n$(),
        T = n$(),
        z = n$(),
        A = n$(),
        f = n$(),
        w = n$();
      bRH(q, H[1], H[0]),
        bRH(w, _[1], _[0]),
        TA(q, q, w),
        CRH($, H[0], H[1]),
        CRH(w, _[0], _[1]),
        TA($, $, w),
        TA(K, H[3], _[3]),
        TA(K, K, CU4),
        TA(O, H[2], _[2]),
        CRH(O, O, O),
        bRH(T, $, q),
        bRH(z, O, K),
        CRH(A, O, K),
        CRH(f, $, q),
        TA(H[0], T, z),
        TA(H[1], f, A),
        TA(H[2], A, z),
        TA(H[3], T, f);
    }
    function j$7(H, _, q) {
      for (var $ = 0; $ < 4; ++$) R$7(H[$], _[$], q);
    }
    function gC6(H, _) {
      var q = n$(),
        $ = n$(),
        K = n$();
      dU4(K, _[2]), TA(q, _[0], K), TA($, _[1], K), Fk_(H, $), (H[31] ^= W$7(q) << 7);
    }
    function Fk_(H, _) {
      var q,
        $,
        K,
        O = n$(),
        T = n$();
      for (q = 0; q < 16; ++q) T[q] = _[q];
      IC6(T), IC6(T), IC6(T);
      for ($ = 0; $ < 2; ++$) {
        O[0] = T[0] - 65517;
        for (q = 1; q < 15; ++q) (O[q] = T[q] - 65535 - ((O[q - 1] >> 16) & 1)), (O[q - 1] &= 65535);
        (O[15] = T[15] - 32767 - ((O[14] >> 16) & 1)), (K = (O[15] >> 16) & 1), (O[14] &= 65535), R$7(T, O, 1 - K);
      }
      for (q = 0; q < 16; q++) (H[2 * q] = T[q] & 255), (H[2 * q + 1] = T[q] >> 8);
    }
    function mU4(H, _) {
      var q = n$(),
        $ = n$(),
        K = n$(),
        O = n$(),
        T = n$(),
        z = n$(),
        A = n$();
      if (
        (l6H(H[2], ck_),
        pU4(H[1], _),
        KTH(K, H[1]),
        TA(O, K, EU4),
        bRH(K, K, H[2]),
        CRH(O, H[2], O),
        KTH(T, O),
        KTH(z, T),
        TA(A, z, T),
        TA(q, A, K),
        TA(q, q, O),
        BU4(q, q),
        TA(q, q, K),
        TA(q, q, O),
        TA(q, q, O),
        TA(H[0], q, O),
        KTH($, H[0]),
        TA($, $, O),
        M$7($, K))
      )
        TA(H[0], H[0], bU4);
      if ((KTH($, H[0]), TA($, $, O), M$7($, K))) return -1;
      if (W$7(H[0]) === _[31] >> 7) bRH(H[0], mC6, H[0]);
      return TA(H[3], H[0], H[1]), 0;
    }
    function pU4(H, _) {
      var q;
      for (q = 0; q < 16; ++q) H[q] = _[2 * q] + (_[2 * q + 1] << 8);
      H[15] &= 32767;
    }
    function BU4(H, _) {
      var q = n$(),
        $;
      for ($ = 0; $ < 16; ++$) q[$] = _[$];
      for ($ = 250; $ >= 0; --$) if ((KTH(q, q), $ !== 1)) TA(q, q, _);
      for ($ = 0; $ < 16; ++$) H[$] = q[$];
    }
    function M$7(H, _) {
      var q = new ok(32),
        $ = new ok(32);
      return Fk_(q, H), Fk_($, _), X$7(q, 0, $, 0);
    }
    function X$7(H, _, q, $) {
      return gU4(H, _, q, $, 32);
    }
    function gU4(H, _, q, $, K) {
      var O,
        T = 0;
      for (O = 0; O < K; ++O) T |= H[_ + O] ^ q[$ + O];
      return (1 & ((T - 1) >>> 8)) - 1;
    }
    function W$7(H) {
      var _ = new ok(32);
      return Fk_(_, H), _[0] & 1;
    }
    function G$7(H, _, q) {
      var $, K;
      l6H(H[0], mC6), l6H(H[1], ck_), l6H(H[2], ck_), l6H(H[3], mC6);
      for (K = 255; K >= 0; --K)
        ($ = (q[(K / 8) | 0] >> (K & 7)) & 1), j$7(H, _, $), BC6(_, H), BC6(H, H), j$7(H, _, $);
    }
    function dC6(H, _) {
      var q = [n$(), n$(), n$(), n$()];
      l6H(q[0], Y$7), l6H(q[1], D$7), l6H(q[2], ck_), TA(q[3], Y$7, D$7), G$7(H, q, _);
    }
    function l6H(H, _) {
      var q;
      for (q = 0; q < 16; q++) H[q] = _[q] | 0;
    }
    function dU4(H, _) {
      var q = n$(),
        $;
      for ($ = 0; $ < 16; ++$) q[$] = _[$];
      for ($ = 253; $ >= 0; --$) if ((KTH(q, q), $ !== 2 && $ !== 4)) TA(q, q, _);
      for ($ = 0; $ < 16; ++$) H[$] = q[$];
    }
    function IC6(H) {
      var _,
        q,
        $ = 1;
      for (_ = 0; _ < 16; ++_) (q = H[_] + $ + 65535), ($ = Math.floor(q / 65536)), (H[_] = q - $ * 65536);
      H[0] += $ - 1 + 37 * ($ - 1);
    }
    function R$7(H, _, q) {
      var $,
        K = ~(q - 1);
      for (var O = 0; O < 16; ++O) ($ = K & (H[O] ^ _[O])), (H[O] ^= $), (_[O] ^= $);
    }
    function n$(H) {
      var _,
        q = new Float64Array(16);
      if (H) for (_ = 0; _ < H.length; ++_) q[_] = H[_];
      return q;
    }
    function CRH(H, _, q) {
      for (var $ = 0; $ < 16; ++$) H[$] = _[$] + q[$];
    }
    function bRH(H, _, q) {
      for (var $ = 0; $ < 16; ++$) H[$] = _[$] - q[$];
    }
    function KTH(H, _) {
      TA(H, _, _);
    }
    function TA(H, _, q) {
      var $,
        K,
        O = 0,
        T = 0,
        z = 0,
        A = 0,
        f = 0,
        w = 0,
        Y = 0,
        D = 0,
        j = 0,
        M = 0,
        J = 0,
        P = 0,
        X = 0,
        R = 0,
        W = 0,
        Z = 0,
        k = 0,
        v = 0,
        y = 0,
        E = 0,
        S = 0,
        x = 0,
        I = 0,
        B = 0,
        p = 0,
        C = 0,
        g = 0,
        c = 0,
        U = 0,
        i = 0,
        _H = 0,
        HH = q[0],
        e = q[1],
        qH = q[2],
        r = q[3],
        $H = q[4],
        DH = q[5],
        fH = q[6],
        vH = q[7],
        KH = q[8],
        n = q[9],
        l = q[10],
        a = q[11],
        t = q[12],
        s = q[13],
        OH = q[14],
        XH = q[15];
      ($ = _[0]),
        (O += $ * HH),
        (T += $ * e),
        (z += $ * qH),
        (A += $ * r),
        (f += $ * $H),
        (w += $ * DH),
        (Y += $ * fH),
        (D += $ * vH),
        (j += $ * KH),
        (M += $ * n),
        (J += $ * l),
        (P += $ * a),
        (X += $ * t),
        (R += $ * s),
        (W += $ * OH),
        (Z += $ * XH),
        ($ = _[1]),
        (T += $ * HH),
        (z += $ * e),
        (A += $ * qH),
        (f += $ * r),
        (w += $ * $H),
        (Y += $ * DH),
        (D += $ * fH),
        (j += $ * vH),
        (M += $ * KH),
        (J += $ * n),
        (P += $ * l),
        (X += $ * a),
        (R += $ * t),
        (W += $ * s),
        (Z += $ * OH),
        (k += $ * XH),
        ($ = _[2]),
        (z += $ * HH),
        (A += $ * e),
        (f += $ * qH),
        (w += $ * r),
        (Y += $ * $H),
        (D += $ * DH),
        (j += $ * fH),
        (M += $ * vH),
        (J += $ * KH),
        (P += $ * n),
        (X += $ * l),
        (R += $ * a),
        (W += $ * t),
        (Z += $ * s),
        (k += $ * OH),
        (v += $ * XH),
        ($ = _[3]),
        (A += $ * HH),
        (f += $ * e),
        (w += $ * qH),
        (Y += $ * r),
        (D += $ * $H),
        (j += $ * DH),
        (M += $ * fH),
        (J += $ * vH),
        (P += $ * KH),
        (X += $ * n),
        (R += $ * l),
        (W += $ * a),
        (Z += $ * t),
        (k += $ * s),
        (v += $ * OH),
        (y += $ * XH),
        ($ = _[4]),
        (f += $ * HH),
        (w += $ * e),
        (Y += $ * qH),
        (D += $ * r),
        (j += $ * $H),
        (M += $ * DH),
        (J += $ * fH),
        (P += $ * vH),
        (X += $ * KH),
        (R += $ * n),
        (W += $ * l),
        (Z += $ * a),
        (k += $ * t),
        (v += $ * s),
        (y += $ * OH),
        (E += $ * XH),
        ($ = _[5]),
        (w += $ * HH),
        (Y += $ * e),
        (D += $ * qH),
        (j += $ * r),
        (M += $ * $H),
        (J += $ * DH),
        (P += $ * fH),
        (X += $ * vH),
        (R += $ * KH),
        (W += $ * n),
        (Z += $ * l),
        (k += $ * a),
        (v += $ * t),
        (y += $ * s),
        (E += $ * OH),
        (S += $ * XH),
        ($ = _[6]),
        (Y += $ * HH),
        (D += $ * e),
        (j += $ * qH),
        (M += $ * r),
        (J += $ * $H),
        (P += $ * DH),
        (X += $ * fH),
        (R += $ * vH),
        (W += $ * KH),
        (Z += $ * n),
        (k += $ * l),
        (v += $ * a),
        (y += $ * t),
        (E += $ * s),
        (S += $ * OH),
        (x += $ * XH),
        ($ = _[7]),
        (D += $ * HH),
        (j += $ * e),
        (M += $ * qH),
        (J += $ * r),
        (P += $ * $H),
        (X += $ * DH),
        (R += $ * fH),
        (W += $ * vH),
        (Z += $ * KH),
        (k += $ * n),
        (v += $ * l),
        (y += $ * a),
        (E += $ * t),
        (S += $ * s),
        (x += $ * OH),
        (I += $ * XH),
        ($ = _[8]),
        (j += $ * HH),
        (M += $ * e),
        (J += $ * qH),
        (P += $ * r),
        (X += $ * $H),
        (R += $ * DH),
        (W += $ * fH),
        (Z += $ * vH),
        (k += $ * KH),
        (v += $ * n),
        (y += $ * l),
        (E += $ * a),
        (S += $ * t),
        (x += $ * s),
        (I += $ * OH),
        (B += $ * XH),
        ($ = _[9]),
        (M += $ * HH),
        (J += $ * e),
        (P += $ * qH),
        (X += $ * r),
        (R += $ * $H),
        (W += $ * DH),
        (Z += $ * fH),
        (k += $ * vH),
        (v += $ * KH),
        (y += $ * n),
        (E += $ * l),
        (S += $ * a),
        (x += $ * t),
        (I += $ * s),
        (B += $ * OH),
        (p += $ * XH),
        ($ = _[10]),
        (J += $ * HH),
        (P += $ * e),
        (X += $ * qH),
        (R += $ * r),
        (W += $ * $H),
        (Z += $ * DH),
        (k += $ * fH),
        (v += $ * vH),
        (y += $ * KH),
        (E += $ * n),
        (S += $ * l),
        (x += $ * a),
        (I += $ * t),
        (B += $ * s),
        (p += $ * OH),
        (C += $ * XH),
        ($ = _[11]),
        (P += $ * HH),
        (X += $ * e),
        (R += $ * qH),
        (W += $ * r),
        (Z += $ * $H),
        (k += $ * DH),
        (v += $ * fH),
        (y += $ * vH),
        (E += $ * KH),
        (S += $ * n),
        (x += $ * l),
        (I += $ * a),
        (B += $ * t),
        (p += $ * s),
        (C += $ * OH),
        (g += $ * XH),
        ($ = _[12]),
        (X += $ * HH),
        (R += $ * e),
        (W += $ * qH),
        (Z += $ * r),
        (k += $ * $H),
        (v += $ * DH),
        (y += $ * fH),
        (E += $ * vH),
        (S += $ * KH),
        (x += $ * n),
        (I += $ * l),
        (B += $ * a),
        (p += $ * t),
        (C += $ * s),
        (g += $ * OH),
        (c += $ * XH),
        ($ = _[13]),
        (R += $ * HH),
        (W += $ * e),
        (Z += $ * qH),
        (k += $ * r),
        (v += $ * $H),
        (y += $ * DH),
        (E += $ * fH),
        (S += $ * vH),
        (x += $ * KH),
        (I += $ * n),
        (B += $ * l),
        (p += $ * a),
        (C += $ * t),
        (g += $ * s),
        (c += $ * OH),
        (U += $ * XH),
        ($ = _[14]),
        (W += $ * HH),
        (Z += $ * e),
        (k += $ * qH),
        (v += $ * r),
        (y += $ * $H),
        (E += $ * DH),
        (S += $ * fH),
        (x += $ * vH),
        (I += $ * KH),
        (B += $ * n),
        (p += $ * l),
        (C += $ * a),
        (g += $ * t),
        (c += $ * s),
        (U += $ * OH),
        (i += $ * XH),
        ($ = _[15]),
        (Z += $ * HH),
        (k += $ * e),
        (v += $ * qH),
        (y += $ * r),
        (E += $ * $H),
        (S += $ * DH),
        (x += $ * fH),
        (I += $ * vH),
        (B += $ * KH),
        (p += $ * n),
        (C += $ * l),
        (g += $ * a),
        (c += $ * t),
        (U += $ * s),
        (i += $ * OH),
        (_H += $ * XH),
        (O += 38 * k),
        (T += 38 * v),
        (z += 38 * y),
        (A += 38 * E),
        (f += 38 * S),
        (w += 38 * x),
        (Y += 38 * I),
        (D += 38 * B),
        (j += 38 * p),
        (M += 38 * C),
        (J += 38 * g),
        (P += 38 * c),
        (X += 38 * U),
        (R += 38 * i),
        (W += 38 * _H),
        (K = 1),
        ($ = O + K + 65535),
        (K = Math.floor($ / 65536)),
        (O = $ - K * 65536),
        ($ = T + K + 65535),
        (K = Math.floor($ / 65536)),
        (T = $ - K * 65536),
        ($ = z + K + 65535),
        (K = Math.floor($ / 65536)),
        (z = $ - K * 65536),
        ($ = A + K + 65535),
        (K = Math.floor($ / 65536)),
        (A = $ - K * 65536),
        ($ = f + K + 65535),
        (K = Math.floor($ / 65536)),
        (f = $ - K * 65536),
        ($ = w + K + 65535),
        (K = Math.floor($ / 65536)),
        (w = $ - K * 65536),
        ($ = Y + K + 65535),
        (K = Math.floor($ / 65536)),
        (Y = $ - K * 65536),
        ($ = D + K + 65535),
        (K = Math.floor($ / 65536)),
        (D = $ - K * 65536),
        ($ = j + K + 65535),
        (K = Math.floor($ / 65536)),
        (j = $ - K * 65536),
        ($ = M + K + 65535),
        (K = Math.floor($ / 65536)),
        (M = $ - K * 65536),
        ($ = J + K + 65535),
        (K = Math.floor($ / 65536)),
        (J = $ - K * 65536),
        ($ = P + K + 65535),
        (K = Math.floor($ / 65536)),
        (P = $ - K * 65536),
        ($ = X + K + 65535),
        (K = Math.floor($ / 65536)),
        (X = $ - K * 65536),
        ($ = R + K + 65535),
        (K = Math.floor($ / 65536)),
        (R = $ - K * 65536),
        ($ = W + K + 65535),
        (K = Math.floor($ / 65536)),
        (W = $ - K * 65536),
        ($ = Z + K + 65535),
        (K = Math.floor($ / 65536)),
        (Z = $ - K * 65536),
        (O += K - 1 + 37 * (K - 1)),
        (K = 1),
        ($ = O + K + 65535),
        (K = Math.floor($ / 65536)),
        (O = $ - K * 65536),
        ($ = T + K + 65535),
        (K = Math.floor($ / 65536)),
        (T = $ - K * 65536),
        ($ = z + K + 65535),
        (K = Math.floor($ / 65536)),
        (z = $ - K * 65536),
        ($ = A + K + 65535),
        (K = Math.floor($ / 65536)),
        (A = $ - K * 65536),
        ($ = f + K + 65535),
        (K = Math.floor($ / 65536)),
        (f = $ - K * 65536),
        ($ = w + K + 65535),
        (K = Math.floor($ / 65536)),
        (w = $ - K * 65536),
        ($ = Y + K + 65535),
        (K = Math.floor($ / 65536)),
        (Y = $ - K * 65536),
        ($ = D + K + 65535),
        (K = Math.floor($ / 65536)),
        (D = $ - K * 65536),
        ($ = j + K + 65535),
        (K = Math.floor($ / 65536)),
        (j = $ - K * 65536),
        ($ = M + K + 65535),
        (K = Math.floor($ / 65536)),
        (M = $ - K * 65536),
        ($ = J + K + 65535),
        (K = Math.floor($ / 65536)),
        (J = $ - K * 65536),
        ($ = P + K + 65535),
        (K = Math.floor($ / 65536)),
        (P = $ - K * 65536),
        ($ = X + K + 65535),
        (K = Math.floor($ / 65536)),
        (X = $ - K * 65536),
        ($ = R + K + 65535),
        (K = Math.floor($ / 65536)),
        (R = $ - K * 65536),
        ($ = W + K + 65535),
        (K = Math.floor($ / 65536)),
        (W = $ - K * 65536),
        ($ = Z + K + 65535),
        (K = Math.floor($ / 65536)),
        (Z = $ - K * 65536),
        (O += K - 1 + 37 * (K - 1)),
        (H[0] = O),
        (H[1] = T),
        (H[2] = z),
        (H[3] = A),
        (H[4] = f),
        (H[5] = w),
        (H[6] = Y),
        (H[7] = D),
        (H[8] = j),
        (H[9] = M),
        (H[10] = J),
        (H[11] = P),
        (H[12] = X),
        (H[13] = R),
        (H[14] = W),
        (H[15] = Z);
    }
  });

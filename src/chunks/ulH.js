  var ulH = d((el3, S97) => {
    var A$ = XK();
    Kx();
    IlH();
    B6H();
    fC6();
    YC6();
    pE();
    F3();
    if (typeof n5 > "u") n5 = A$.jsbn.BigInteger;
    var n5,
      DC6 = A$.util.isNodejs ? require("crypto") : null,
      h6 = A$.asn1,
      gE = A$.util;
    A$.pki = A$.pki || {};
    S97.exports = A$.pki.rsa = A$.rsa = A$.rsa || {};
    var v1 = A$.pki,
      vF4 = [6, 4, 2, 4, 2, 4, 6, 2],
      NF4 = {
        name: "PrivateKeyInfo",
        tagClass: h6.Class.UNIVERSAL,
        type: h6.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "PrivateKeyInfo.version",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyVersion",
          },
          {
            name: "PrivateKeyInfo.privateKeyAlgorithm",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "AlgorithmIdentifier.algorithm",
                tagClass: h6.Class.UNIVERSAL,
                type: h6.Type.OID,
                constructed: !1,
                capture: "privateKeyOid",
              },
            ],
          },
          {
            name: "PrivateKeyInfo",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.OCTETSTRING,
            constructed: !1,
            capture: "privateKey",
          },
        ],
      },
      hF4 = {
        name: "RSAPrivateKey",
        tagClass: h6.Class.UNIVERSAL,
        type: h6.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "RSAPrivateKey.version",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyVersion",
          },
          {
            name: "RSAPrivateKey.modulus",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyModulus",
          },
          {
            name: "RSAPrivateKey.publicExponent",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyPublicExponent",
          },
          {
            name: "RSAPrivateKey.privateExponent",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyPrivateExponent",
          },
          {
            name: "RSAPrivateKey.prime1",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyPrime1",
          },
          {
            name: "RSAPrivateKey.prime2",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyPrime2",
          },
          {
            name: "RSAPrivateKey.exponent1",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyExponent1",
          },
          {
            name: "RSAPrivateKey.exponent2",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyExponent2",
          },
          {
            name: "RSAPrivateKey.coefficient",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "privateKeyCoefficient",
          },
        ],
      },
      yF4 = {
        name: "RSAPublicKey",
        tagClass: h6.Class.UNIVERSAL,
        type: h6.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "RSAPublicKey.modulus",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "publicKeyModulus",
          },
          {
            name: "RSAPublicKey.exponent",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.INTEGER,
            constructed: !1,
            capture: "publicKeyExponent",
          },
        ],
      },
      VF4 = (A$.pki.rsa.publicKeyValidator = {
        name: "SubjectPublicKeyInfo",
        tagClass: h6.Class.UNIVERSAL,
        type: h6.Type.SEQUENCE,
        constructed: !0,
        captureAsn1: "subjectPublicKeyInfo",
        value: [
          {
            name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "AlgorithmIdentifier.algorithm",
                tagClass: h6.Class.UNIVERSAL,
                type: h6.Type.OID,
                constructed: !1,
                capture: "publicKeyOid",
              },
            ],
          },
          {
            name: "SubjectPublicKeyInfo.subjectPublicKey",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.BITSTRING,
            constructed: !1,
            value: [
              {
                name: "SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",
                tagClass: h6.Class.UNIVERSAL,
                type: h6.Type.SEQUENCE,
                constructed: !0,
                optional: !0,
                captureAsn1: "rsaPublicKey",
              },
            ],
          },
        ],
      }),
      SF4 = {
        name: "DigestInfo",
        tagClass: h6.Class.UNIVERSAL,
        type: h6.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "DigestInfo.DigestAlgorithm",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "DigestInfo.DigestAlgorithm.algorithmIdentifier",
                tagClass: h6.Class.UNIVERSAL,
                type: h6.Type.OID,
                constructed: !1,
                capture: "algorithmIdentifier",
              },
              {
                name: "DigestInfo.DigestAlgorithm.parameters",
                tagClass: h6.Class.UNIVERSAL,
                type: h6.Type.NULL,
                capture: "parameters",
                optional: !0,
                constructed: !1,
              },
            ],
          },
          {
            name: "DigestInfo.digest",
            tagClass: h6.Class.UNIVERSAL,
            type: h6.Type.OCTETSTRING,
            constructed: !1,
            capture: "digest",
          },
        ],
      },
      EF4 = function (H) {
        var _;
        if (H.algorithm in v1.oids) _ = v1.oids[H.algorithm];
        else {
          var q = Error("Unknown message digest algorithm.");
          throw ((q.algorithm = H.algorithm), q);
        }
        var $ = h6.oidToDer(_).getBytes(),
          K = h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, []),
          O = h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, []);
        O.value.push(h6.create(h6.Class.UNIVERSAL, h6.Type.OID, !1, $)),
          O.value.push(h6.create(h6.Class.UNIVERSAL, h6.Type.NULL, !1, ""));
        var T = h6.create(h6.Class.UNIVERSAL, h6.Type.OCTETSTRING, !1, H.digest().getBytes());
        return K.value.push(O), K.value.push(T), h6.toDer(K).getBytes();
      },
      y97 = function (H, _, q) {
        if (q) return H.modPow(_.e, _.n);
        if (!_.p || !_.q) return H.modPow(_.d, _.n);
        if (!_.dP) _.dP = _.d.mod(_.p.subtract(n5.ONE));
        if (!_.dQ) _.dQ = _.d.mod(_.q.subtract(n5.ONE));
        if (!_.qInv) _.qInv = _.q.modInverse(_.p);
        var $;
        do $ = new n5(A$.util.bytesToHex(A$.random.getBytes(_.n.bitLength() / 8)), 16);
        while ($.compareTo(_.n) >= 0 || !$.gcd(_.n).equals(n5.ONE));
        H = H.multiply($.modPow(_.e, _.n)).mod(_.n);
        var K = H.mod(_.p).modPow(_.dP, _.p),
          O = H.mod(_.q).modPow(_.dQ, _.q);
        while (K.compareTo(O) < 0) K = K.add(_.p);
        var T = K.subtract(O).multiply(_.qInv).mod(_.p).multiply(_.q).add(O);
        return (T = T.multiply($.modInverse(_.n)).mod(_.n)), T;
      };
    v1.rsa.encrypt = function (H, _, q) {
      var $ = q,
        K,
        O = Math.ceil(_.n.bitLength() / 8);
      if (q !== !1 && q !== !0) ($ = q === 2), (K = V97(H, _, q));
      else (K = A$.util.createBuffer()), K.putBytes(H);
      var T = new n5(K.toHex(), 16),
        z = y97(T, _, $),
        A = z.toString(16),
        f = A$.util.createBuffer(),
        w = O - Math.ceil(A.length / 2);
      while (w > 0) f.putByte(0), --w;
      return f.putBytes(A$.util.hexToBytes(A)), f.getBytes();
    };
    v1.rsa.decrypt = function (H, _, q, $) {
      var K = Math.ceil(_.n.bitLength() / 8);
      if (H.length !== K) {
        var O = Error("Encrypted message length is invalid.");
        throw ((O.length = H.length), (O.expected = K), O);
      }
      var T = new n5(A$.util.createBuffer(H).toHex(), 16);
      if (T.compareTo(_.n) >= 0) throw Error("Encrypted message is invalid.");
      var z = y97(T, _, q),
        A = z.toString(16),
        f = A$.util.createBuffer(),
        w = K - Math.ceil(A.length / 2);
      while (w > 0) f.putByte(0), --w;
      if ((f.putBytes(A$.util.hexToBytes(A)), $ !== !1)) return bk_(f.getBytes(), _, q);
      return f.getBytes();
    };
    v1.rsa.createKeyPairGenerationState = function (H, _, q) {
      if (typeof H === "string") H = parseInt(H, 10);
      (H = H || 2048), (q = q || {});
      var $ = q.prng || A$.random,
        K = {
          nextBytes: function (z) {
            var A = $.getBytesSync(z.length);
            for (var f = 0; f < z.length; ++f) z[f] = A.charCodeAt(f);
          },
        },
        O = q.algorithm || "PRIMEINC",
        T;
      if (O === "PRIMEINC")
        (T = {
          algorithm: O,
          state: 0,
          bits: H,
          rng: K,
          eInt: _ || 65537,
          e: new n5(null),
          p: null,
          q: null,
          qBits: H >> 1,
          pBits: H - (H >> 1),
          pqState: 0,
          num: null,
          keys: null,
        }),
          T.e.fromInt(T.eInt);
      else throw Error("Invalid key generation algorithm: " + O);
      return T;
    };
    v1.rsa.stepKeyPairGenerationState = function (H, _) {
      if (!("algorithm" in H)) H.algorithm = "PRIMEINC";
      var q = new n5(null);
      q.fromInt(30);
      var $ = 0,
        K = function (Y, D) {
          return Y | D;
        },
        O = +new Date(),
        T,
        z = 0;
      while (H.keys === null && (_ <= 0 || z < _)) {
        if (H.state === 0) {
          var A = H.p === null ? H.pBits : H.qBits,
            f = A - 1;
          if (H.pqState === 0) {
            if (((H.num = new n5(A, H.rng)), !H.num.testBit(f))) H.num.bitwiseTo(n5.ONE.shiftLeft(f), K, H.num);
            H.num.dAddOffset(31 - H.num.mod(q).byteValue(), 0), ($ = 0), ++H.pqState;
          } else if (H.pqState === 1)
            if (H.num.bitLength() > A) H.pqState = 0;
            else if (H.num.isProbablePrime(bF4(H.num.bitLength()))) ++H.pqState;
            else H.num.dAddOffset(vF4[$++ % 8], 0);
          else if (H.pqState === 2) H.pqState = H.num.subtract(n5.ONE).gcd(H.e).compareTo(n5.ONE) === 0 ? 3 : 0;
          else if (H.pqState === 3) {
            if (((H.pqState = 0), H.p === null)) H.p = H.num;
            else H.q = H.num;
            if (H.p !== null && H.q !== null) ++H.state;
            H.num = null;
          }
        } else if (H.state === 1) {
          if (H.p.compareTo(H.q) < 0) (H.num = H.p), (H.p = H.q), (H.q = H.num);
          ++H.state;
        } else if (H.state === 2)
          (H.p1 = H.p.subtract(n5.ONE)), (H.q1 = H.q.subtract(n5.ONE)), (H.phi = H.p1.multiply(H.q1)), ++H.state;
        else if (H.state === 3)
          if (H.phi.gcd(H.e).compareTo(n5.ONE) === 0) ++H.state;
          else (H.p = null), (H.q = null), (H.state = 0);
        else if (H.state === 4)
          if (((H.n = H.p.multiply(H.q)), H.n.bitLength() === H.bits)) ++H.state;
          else (H.q = null), (H.state = 0);
        else if (H.state === 5) {
          var w = H.e.modInverse(H.phi);
          H.keys = {
            privateKey: v1.rsa.setPrivateKey(H.n, H.e, w, H.p, H.q, w.mod(H.p1), w.mod(H.q1), H.q.modInverse(H.p)),
            publicKey: v1.rsa.setPublicKey(H.n, H.e),
          };
        }
        (T = +new Date()), (z += T - O), (O = T);
      }
      return H.keys !== null;
    };
    v1.rsa.generateKeyPair = function (H, _, q, $) {
      if (arguments.length === 1) {
        if (typeof H === "object") (q = H), (H = void 0);
        else if (typeof H === "function") ($ = H), (H = void 0);
      } else if (arguments.length === 2)
        if (typeof H === "number") {
          if (typeof _ === "function") ($ = _), (_ = void 0);
          else if (typeof _ !== "number") (q = _), (_ = void 0);
        } else (q = H), ($ = _), (H = void 0), (_ = void 0);
      else if (arguments.length === 3)
        if (typeof _ === "number") {
          if (typeof q === "function") ($ = q), (q = void 0);
        } else ($ = q), (q = _), (_ = void 0);
      if (((q = q || {}), H === void 0)) H = q.bits || 2048;
      if (_ === void 0) _ = q.e || 65537;
      if (!A$.options.usePureJavaScript && !q.prng && H >= 256 && H <= 16384 && (_ === 65537 || _ === 3)) {
        if ($) {
          if (k97("generateKeyPair"))
            return DC6.generateKeyPair(
              "rsa",
              {
                modulusLength: H,
                publicExponent: _,
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
              },
              function (z, A, f) {
                if (z) return $(z);
                $(null, { privateKey: v1.privateKeyFromPem(f), publicKey: v1.publicKeyFromPem(A) });
              },
            );
          if (v97("generateKey") && v97("exportKey"))
            return gE.globalScope.crypto.subtle
              .generateKey(
                { name: "RSASSA-PKCS1-v1_5", modulusLength: H, publicExponent: h97(_), hash: { name: "SHA-256" } },
                !0,
                ["sign", "verify"],
              )
              .then(function (z) {
                return gE.globalScope.crypto.subtle.exportKey("pkcs8", z.privateKey);
              })
              .then(void 0, function (z) {
                $(z);
              })
              .then(function (z) {
                if (z) {
                  var A = v1.privateKeyFromAsn1(h6.fromDer(A$.util.createBuffer(z)));
                  $(null, { privateKey: A, publicKey: v1.setRsaPublicKey(A.n, A.e) });
                }
              });
          if (N97("generateKey") && N97("exportKey")) {
            var K = gE.globalScope.msCrypto.subtle.generateKey(
              { name: "RSASSA-PKCS1-v1_5", modulusLength: H, publicExponent: h97(_), hash: { name: "SHA-256" } },
              !0,
              ["sign", "verify"],
            );
            (K.oncomplete = function (z) {
              var A = z.target.result,
                f = gE.globalScope.msCrypto.subtle.exportKey("pkcs8", A.privateKey);
              (f.oncomplete = function (w) {
                var Y = w.target.result,
                  D = v1.privateKeyFromAsn1(h6.fromDer(A$.util.createBuffer(Y)));
                $(null, { privateKey: D, publicKey: v1.setRsaPublicKey(D.n, D.e) });
              }),
                (f.onerror = function (w) {
                  $(w);
                });
            }),
              (K.onerror = function (z) {
                $(z);
              });
            return;
          }
        } else if (k97("generateKeyPairSync")) {
          var O = DC6.generateKeyPairSync("rsa", {
            modulusLength: H,
            publicExponent: _,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
          });
          return { privateKey: v1.privateKeyFromPem(O.privateKey), publicKey: v1.publicKeyFromPem(O.publicKey) };
        }
      }
      var T = v1.rsa.createKeyPairGenerationState(H, _, q);
      if (!$) return v1.rsa.stepKeyPairGenerationState(T, 0), T.keys;
      CF4(T, q, $);
    };
    v1.setRsaPublicKey = v1.rsa.setPublicKey = function (H, _) {
      var q = { n: H, e: _ };
      return (
        (q.encrypt = function ($, K, O) {
          if (typeof K === "string") K = K.toUpperCase();
          else if (K === void 0) K = "RSAES-PKCS1-V1_5";
          if (K === "RSAES-PKCS1-V1_5")
            K = {
              encode: function (z, A, f) {
                return V97(z, A, 2).getBytes();
              },
            };
          else if (K === "RSA-OAEP" || K === "RSAES-OAEP")
            K = {
              encode: function (z, A) {
                return A$.pkcs1.encode_rsa_oaep(A, z, O);
              },
            };
          else if (["RAW", "NONE", "NULL", null].indexOf(K) !== -1)
            K = {
              encode: function (z) {
                return z;
              },
            };
          else if (typeof K === "string") throw Error('Unsupported encryption scheme: "' + K + '".');
          var T = K.encode($, q, !0);
          return v1.rsa.encrypt(T, q, !0);
        }),
        (q.verify = function ($, K, O, T) {
          if (typeof O === "string") O = O.toUpperCase();
          else if (O === void 0) O = "RSASSA-PKCS1-V1_5";
          if (T === void 0) T = { _parseAllDigestBytes: !0 };
          if (!("_parseAllDigestBytes" in T)) T._parseAllDigestBytes = !0;
          if (O === "RSASSA-PKCS1-V1_5")
            O = {
              verify: function (A, f) {
                f = bk_(f, q, !0);
                var w = h6.fromDer(f, { parseAllBytes: T._parseAllDigestBytes }),
                  Y = {},
                  D = [];
                if (!h6.validate(w, SF4, Y, D)) {
                  var j = Error("ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value.");
                  throw ((j.errors = D), j);
                }
                var M = h6.derToOid(Y.algorithmIdentifier);
                if (
                  !(
                    M === A$.oids.md2 ||
                    M === A$.oids.md5 ||
                    M === A$.oids.sha1 ||
                    M === A$.oids.sha224 ||
                    M === A$.oids.sha256 ||
                    M === A$.oids.sha384 ||
                    M === A$.oids.sha512 ||
                    M === A$.oids["sha512-224"] ||
                    M === A$.oids["sha512-256"]
                  )
                ) {
                  var j = Error("Unknown RSASSA-PKCS1-v1_5 DigestAlgorithm identifier.");
                  throw ((j.oid = M), j);
                }
                if (M === A$.oids.md2 || M === A$.oids.md5) {
                  if (!("parameters" in Y))
                    throw Error(
                      "ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value. Missing algorithm identifier NULL parameters.",
                    );
                }
                return A === Y.digest;
              },
            };
          else if (O === "NONE" || O === "NULL" || O === null)
            O = {
              verify: function (A, f) {
                return (f = bk_(f, q, !0)), A === f;
              },
            };
          var z = v1.rsa.decrypt(K, q, !0, !1);
          return O.verify($, z, q.n.bitLength());
        }),
        q
      );
    };
    v1.setRsaPrivateKey = v1.rsa.setPrivateKey = function (H, _, q, $, K, O, T, z) {
      var A = { n: H, e: _, d: q, p: $, q: K, dP: O, dQ: T, qInv: z };
      return (
        (A.decrypt = function (f, w, Y) {
          if (typeof w === "string") w = w.toUpperCase();
          else if (w === void 0) w = "RSAES-PKCS1-V1_5";
          var D = v1.rsa.decrypt(f, A, !1, !1);
          if (w === "RSAES-PKCS1-V1_5") w = { decode: bk_ };
          else if (w === "RSA-OAEP" || w === "RSAES-OAEP")
            w = {
              decode: function (j, M) {
                return A$.pkcs1.decode_rsa_oaep(M, j, Y);
              },
            };
          else if (["RAW", "NONE", "NULL", null].indexOf(w) !== -1)
            w = {
              decode: function (j) {
                return j;
              },
            };
          else throw Error('Unsupported encryption scheme: "' + w + '".');
          return w.decode(D, A, !1);
        }),
        (A.sign = function (f, w) {
          var Y = !1;
          if (typeof w === "string") w = w.toUpperCase();
          if (w === void 0 || w === "RSASSA-PKCS1-V1_5") (w = { encode: EF4 }), (Y = 1);
          else if (w === "NONE" || w === "NULL" || w === null)
            (w = {
              encode: function () {
                return f;
              },
            }),
              (Y = 1);
          var D = w.encode(f, A.n.bitLength());
          return v1.rsa.encrypt(D, A, Y);
        }),
        A
      );
    };
    v1.wrapRsaPrivateKey = function (H) {
      return h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, h6.integerToDer(0).getBytes()),
        h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
          h6.create(h6.Class.UNIVERSAL, h6.Type.OID, !1, h6.oidToDer(v1.oids.rsaEncryption).getBytes()),
          h6.create(h6.Class.UNIVERSAL, h6.Type.NULL, !1, ""),
        ]),
        h6.create(h6.Class.UNIVERSAL, h6.Type.OCTETSTRING, !1, h6.toDer(H).getBytes()),
      ]);
    };
    v1.privateKeyFromAsn1 = function (H) {
      var _ = {},
        q = [];
      if (h6.validate(H, NF4, _, q)) H = h6.fromDer(A$.util.createBuffer(_.privateKey));
      if (((_ = {}), (q = []), !h6.validate(H, hF4, _, q))) {
        var $ = Error("Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.");
        throw (($.errors = q), $);
      }
      var K, O, T, z, A, f, w, Y;
      return (
        (K = A$.util.createBuffer(_.privateKeyModulus).toHex()),
        (O = A$.util.createBuffer(_.privateKeyPublicExponent).toHex()),
        (T = A$.util.createBuffer(_.privateKeyPrivateExponent).toHex()),
        (z = A$.util.createBuffer(_.privateKeyPrime1).toHex()),
        (A = A$.util.createBuffer(_.privateKeyPrime2).toHex()),
        (f = A$.util.createBuffer(_.privateKeyExponent1).toHex()),
        (w = A$.util.createBuffer(_.privateKeyExponent2).toHex()),
        (Y = A$.util.createBuffer(_.privateKeyCoefficient).toHex()),
        v1.setRsaPrivateKey(
          new n5(K, 16),
          new n5(O, 16),
          new n5(T, 16),
          new n5(z, 16),
          new n5(A, 16),
          new n5(f, 16),
          new n5(w, 16),
          new n5(Y, 16),
        )
      );
    };
    v1.privateKeyToAsn1 = v1.privateKeyToRSAPrivateKey = function (H) {
      return h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, h6.integerToDer(0).getBytes()),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.n)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.e)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.d)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.p)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.q)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.dP)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.dQ)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.qInv)),
      ]);
    };
    v1.publicKeyFromAsn1 = function (H) {
      var _ = {},
        q = [];
      if (h6.validate(H, VF4, _, q)) {
        var $ = h6.derToOid(_.publicKeyOid);
        if ($ !== v1.oids.rsaEncryption) {
          var K = Error("Cannot read public key. Unknown OID.");
          throw ((K.oid = $), K);
        }
        H = _.rsaPublicKey;
      }
      if (((q = []), !h6.validate(H, yF4, _, q))) {
        var K = Error("Cannot read public key. ASN.1 object does not contain an RSAPublicKey.");
        throw ((K.errors = q), K);
      }
      var O = A$.util.createBuffer(_.publicKeyModulus).toHex(),
        T = A$.util.createBuffer(_.publicKeyExponent).toHex();
      return v1.setRsaPublicKey(new n5(O, 16), new n5(T, 16));
    };
    v1.publicKeyToAsn1 = v1.publicKeyToSubjectPublicKeyInfo = function (H) {
      return h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
        h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
          h6.create(h6.Class.UNIVERSAL, h6.Type.OID, !1, h6.oidToDer(v1.oids.rsaEncryption).getBytes()),
          h6.create(h6.Class.UNIVERSAL, h6.Type.NULL, !1, ""),
        ]),
        h6.create(h6.Class.UNIVERSAL, h6.Type.BITSTRING, !1, [v1.publicKeyToRSAPublicKey(H)]),
      ]);
    };
    v1.publicKeyToRSAPublicKey = function (H) {
      return h6.create(h6.Class.UNIVERSAL, h6.Type.SEQUENCE, !0, [
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.n)),
        h6.create(h6.Class.UNIVERSAL, h6.Type.INTEGER, !1, eg(H.e)),
      ]);
    };
    function V97(H, _, q) {
      var $ = A$.util.createBuffer(),
        K = Math.ceil(_.n.bitLength() / 8);
      if (H.length > K - 11) {
        var O = Error("Message is too long for PKCS#1 v1.5 padding.");
        throw ((O.length = H.length), (O.max = K - 11), O);
      }
      $.putByte(0), $.putByte(q);
      var T = K - 3 - H.length,
        z;
      if (q === 0 || q === 1) {
        z = q === 0 ? 0 : 255;
        for (var A = 0; A < T; ++A) $.putByte(z);
      } else
        while (T > 0) {
          var f = 0,
            w = A$.random.getBytes(T);
          for (var A = 0; A < T; ++A)
            if (((z = w.charCodeAt(A)), z === 0)) ++f;
            else $.putByte(z);
          T = f;
        }
      return $.putByte(0), $.putBytes(H), $;
    }
    function bk_(H, _, q, $) {
      var K = Math.ceil(_.n.bitLength() / 8),
        O = A$.util.createBuffer(H),
        T = O.getByte(),
        z = O.getByte();
      if (T !== 0 || (q && z !== 0 && z !== 1) || (!q && z != 2) || (q && z === 0 && typeof $ > "u"))
        throw Error("Encryption block is invalid.");
      var A = 0;
      if (z === 0) {
        A = K - 3 - $;
        for (var f = 0; f < A; ++f) if (O.getByte() !== 0) throw Error("Encryption block is invalid.");
      } else if (z === 1) {
        A = 0;
        while (O.length() > 1) {
          if (O.getByte() !== 255) {
            --O.read;
            break;
          }
          ++A;
        }
      } else if (z === 2) {
        A = 0;
        while (O.length() > 1) {
          if (O.getByte() === 0) {
            --O.read;
            break;
          }
          ++A;
        }
      }
      var w = O.getByte();
      if (w !== 0 || A !== K - 3 - O.length()) throw Error("Encryption block is invalid.");
      return O.getBytes();
    }
    function CF4(H, _, q) {
      if (typeof _ === "function") (q = _), (_ = {});
      _ = _ || {};
      var $ = {
        algorithm: {
          name: _.algorithm || "PRIMEINC",
          options: { workers: _.workers || 2, workLoad: _.workLoad || 100, workerScript: _.workerScript },
        },
      };
      if ("prng" in _) $.prng = _.prng;
      K();
      function K() {
        O(H.pBits, function (z, A) {
          if (z) return q(z);
          if (((H.p = A), H.q !== null)) return T(z, H.q);
          O(H.qBits, T);
        });
      }
      function O(z, A) {
        A$.prime.generateProbablePrime(z, $, A);
      }
      function T(z, A) {
        if (z) return q(z);
        if (((H.q = A), H.p.compareTo(H.q) < 0)) {
          var f = H.p;
          (H.p = H.q), (H.q = f);
        }
        if (H.p.subtract(n5.ONE).gcd(H.e).compareTo(n5.ONE) !== 0) {
          (H.p = null), K();
          return;
        }
        if (H.q.subtract(n5.ONE).gcd(H.e).compareTo(n5.ONE) !== 0) {
          (H.q = null), O(H.qBits, T);
          return;
        }
        if (
          ((H.p1 = H.p.subtract(n5.ONE)),
          (H.q1 = H.q.subtract(n5.ONE)),
          (H.phi = H.p1.multiply(H.q1)),
          H.phi.gcd(H.e).compareTo(n5.ONE) !== 0)
        ) {
          (H.p = H.q = null), K();
          return;
        }
        if (((H.n = H.p.multiply(H.q)), H.n.bitLength() !== H.bits)) {
          (H.q = null), O(H.qBits, T);
          return;
        }
        var w = H.e.modInverse(H.phi);
        (H.keys = {
          privateKey: v1.rsa.setPrivateKey(H.n, H.e, w, H.p, H.q, w.mod(H.p1), w.mod(H.q1), H.q.modInverse(H.p)),
          publicKey: v1.rsa.setPublicKey(H.n, H.e),
        }),
          q(null, H.keys);
      }
    }
    function eg(H) {
      var _ = H.toString(16);
      if (_[0] >= "8") _ = "00" + _;
      var q = A$.util.hexToBytes(_);
      if (
        q.length > 1 &&
        ((q.charCodeAt(0) === 0 && (q.charCodeAt(1) & 128) === 0) ||
          (q.charCodeAt(0) === 255 && (q.charCodeAt(1) & 128) === 128))
      )
        return q.substr(1);
      return q;
    }
    function bF4(H) {
      if (H <= 100) return 27;
      if (H <= 150) return 18;
      if (H <= 200) return 15;
      if (H <= 250) return 12;
      if (H <= 300) return 9;
      if (H <= 350) return 8;
      if (H <= 400) return 7;
      if (H <= 500) return 6;
      if (H <= 600) return 5;
      if (H <= 800) return 4;
      if (H <= 1250) return 3;
      return 2;
    }
    function k97(H) {
      return A$.util.isNodejs && typeof DC6[H] === "function";
    }
    function v97(H) {
      return (
        typeof gE.globalScope < "u" &&
        typeof gE.globalScope.crypto === "object" &&
        typeof gE.globalScope.crypto.subtle === "object" &&
        typeof gE.globalScope.crypto.subtle[H] === "function"
      );
    }
    function N97(H) {
      return (
        typeof gE.globalScope < "u" &&
        typeof gE.globalScope.msCrypto === "object" &&
        typeof gE.globalScope.msCrypto.subtle === "object" &&
        typeof gE.globalScope.msCrypto.subtle[H] === "function"
      );
    }
    function h97(H) {
      var _ = A$.util.hexToBytes(H.toString(16)),
        q = new Uint8Array(_.length);
      for (var $ = 0; $ < _.length; ++$) q[$] = _.charCodeAt($);
      return q;
    }
  });

  var MC6 = d((Hi3, I97) => {
    var C7 = XK();
    p6H();
    Kx();
    ClH();
    ig();
    B6H();
    yk_();
    sOH();
    pE();
    KC6();
    ulH();
    F3();
    if (typeof jC6 > "u") jC6 = C7.jsbn.BigInteger;
    var jC6,
      _8 = C7.asn1,
      KK = (C7.pki = C7.pki || {});
    I97.exports = KK.pbe = C7.pbe = C7.pbe || {};
    var HTH = KK.oids,
      IF4 = {
        name: "EncryptedPrivateKeyInfo",
        tagClass: _8.Class.UNIVERSAL,
        type: _8.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "EncryptedPrivateKeyInfo.encryptionAlgorithm",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "AlgorithmIdentifier.algorithm",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.OID,
                constructed: !1,
                capture: "encryptionOid",
              },
              {
                name: "AlgorithmIdentifier.parameters",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.SEQUENCE,
                constructed: !0,
                captureAsn1: "encryptionParams",
              },
            ],
          },
          {
            name: "EncryptedPrivateKeyInfo.encryptedData",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.OCTETSTRING,
            constructed: !1,
            capture: "encryptedData",
          },
        ],
      },
      uF4 = {
        name: "PBES2Algorithms",
        tagClass: _8.Class.UNIVERSAL,
        type: _8.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "PBES2Algorithms.keyDerivationFunc",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "PBES2Algorithms.keyDerivationFunc.oid",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.OID,
                constructed: !1,
                capture: "kdfOid",
              },
              {
                name: "PBES2Algorithms.params",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "PBES2Algorithms.params.salt",
                    tagClass: _8.Class.UNIVERSAL,
                    type: _8.Type.OCTETSTRING,
                    constructed: !1,
                    capture: "kdfSalt",
                  },
                  {
                    name: "PBES2Algorithms.params.iterationCount",
                    tagClass: _8.Class.UNIVERSAL,
                    type: _8.Type.INTEGER,
                    constructed: !1,
                    capture: "kdfIterationCount",
                  },
                  {
                    name: "PBES2Algorithms.params.keyLength",
                    tagClass: _8.Class.UNIVERSAL,
                    type: _8.Type.INTEGER,
                    constructed: !1,
                    optional: !0,
                    capture: "keyLength",
                  },
                  {
                    name: "PBES2Algorithms.params.prf",
                    tagClass: _8.Class.UNIVERSAL,
                    type: _8.Type.SEQUENCE,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "PBES2Algorithms.params.prf.algorithm",
                        tagClass: _8.Class.UNIVERSAL,
                        type: _8.Type.OID,
                        constructed: !1,
                        capture: "prfOid",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "PBES2Algorithms.encryptionScheme",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "PBES2Algorithms.encryptionScheme.oid",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.OID,
                constructed: !1,
                capture: "encOid",
              },
              {
                name: "PBES2Algorithms.encryptionScheme.iv",
                tagClass: _8.Class.UNIVERSAL,
                type: _8.Type.OCTETSTRING,
                constructed: !1,
                capture: "encIv",
              },
            ],
          },
        ],
      },
      xF4 = {
        name: "pkcs-12PbeParams",
        tagClass: _8.Class.UNIVERSAL,
        type: _8.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "pkcs-12PbeParams.salt",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.OCTETSTRING,
            constructed: !1,
            capture: "salt",
          },
          {
            name: "pkcs-12PbeParams.iterations",
            tagClass: _8.Class.UNIVERSAL,
            type: _8.Type.INTEGER,
            constructed: !1,
            capture: "iterations",
          },
        ],
      };
    KK.encryptPrivateKeyInfo = function (H, _, q) {
      (q = q || {}),
        (q.saltSize = q.saltSize || 8),
        (q.count = q.count || 2048),
        (q.algorithm = q.algorithm || "aes128"),
        (q.prfAlgorithm = q.prfAlgorithm || "sha1");
      var $ = C7.random.getBytesSync(q.saltSize),
        K = q.count,
        O = _8.integerToDer(K),
        T,
        z,
        A;
      if (q.algorithm.indexOf("aes") === 0 || q.algorithm === "des") {
        var f, w, Y;
        switch (q.algorithm) {
          case "aes128":
            (T = 16), (f = 16), (w = HTH["aes128-CBC"]), (Y = C7.aes.createEncryptionCipher);
            break;
          case "aes192":
            (T = 24), (f = 16), (w = HTH["aes192-CBC"]), (Y = C7.aes.createEncryptionCipher);
            break;
          case "aes256":
            (T = 32), (f = 16), (w = HTH["aes256-CBC"]), (Y = C7.aes.createEncryptionCipher);
            break;
          case "des":
            (T = 8), (f = 8), (w = HTH.desCBC), (Y = C7.des.createEncryptionCipher);
            break;
          default:
            var D = Error("Cannot encrypt private key. Unknown encryption algorithm.");
            throw ((D.algorithm = q.algorithm), D);
        }
        var j = "hmacWith" + q.prfAlgorithm.toUpperCase(),
          M = b97(j),
          J = C7.pkcs5.pbkdf2(_, $, K, T, M),
          P = C7.random.getBytesSync(f),
          X = Y(J);
        X.start(P), X.update(_8.toDer(H)), X.finish(), (A = X.output.getBytes());
        var R = mF4($, O, T, j);
        z = _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
          _8.create(_8.Class.UNIVERSAL, _8.Type.OID, !1, _8.oidToDer(HTH.pkcs5PBES2).getBytes()),
          _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
            _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
              _8.create(_8.Class.UNIVERSAL, _8.Type.OID, !1, _8.oidToDer(HTH.pkcs5PBKDF2).getBytes()),
              R,
            ]),
            _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
              _8.create(_8.Class.UNIVERSAL, _8.Type.OID, !1, _8.oidToDer(w).getBytes()),
              _8.create(_8.Class.UNIVERSAL, _8.Type.OCTETSTRING, !1, P),
            ]),
          ]),
        ]);
      } else if (q.algorithm === "3des") {
        T = 24;
        var W = new C7.util.ByteBuffer($),
          J = KK.pbe.generatePkcs12Key(_, W, 1, K, T),
          P = KK.pbe.generatePkcs12Key(_, W, 2, K, T),
          X = C7.des.createEncryptionCipher(J);
        X.start(P),
          X.update(_8.toDer(H)),
          X.finish(),
          (A = X.output.getBytes()),
          (z = _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
            _8.create(
              _8.Class.UNIVERSAL,
              _8.Type.OID,
              !1,
              _8.oidToDer(HTH["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes(),
            ),
            _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
              _8.create(_8.Class.UNIVERSAL, _8.Type.OCTETSTRING, !1, $),
              _8.create(_8.Class.UNIVERSAL, _8.Type.INTEGER, !1, O.getBytes()),
            ]),
          ]));
      } else {
        var D = Error("Cannot encrypt private key. Unknown encryption algorithm.");
        throw ((D.algorithm = q.algorithm), D);
      }
      var Z = _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
        z,
        _8.create(_8.Class.UNIVERSAL, _8.Type.OCTETSTRING, !1, A),
      ]);
      return Z;
    };
    KK.decryptPrivateKeyInfo = function (H, _) {
      var q = null,
        $ = {},
        K = [];
      if (!_8.validate(H, IF4, $, K)) {
        var O = Error("Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        throw ((O.errors = K), O);
      }
      var T = _8.derToOid($.encryptionOid),
        z = KK.pbe.getCipher(T, $.encryptionParams, _),
        A = C7.util.createBuffer($.encryptedData);
      if ((z.update(A), z.finish())) q = _8.fromDer(z.output);
      return q;
    };
    KK.encryptedPrivateKeyToPem = function (H, _) {
      var q = { type: "ENCRYPTED PRIVATE KEY", body: _8.toDer(H).getBytes() };
      return C7.pem.encode(q, { maxline: _ });
    };
    KK.encryptedPrivateKeyFromPem = function (H) {
      var _ = C7.pem.decode(H)[0];
      if (_.type !== "ENCRYPTED PRIVATE KEY") {
        var q = Error('Could not convert encrypted private key from PEM; PEM header type is "ENCRYPTED PRIVATE KEY".');
        throw ((q.headerType = _.type), q);
      }
      if (_.procType && _.procType.type === "ENCRYPTED")
        throw Error("Could not convert encrypted private key from PEM; PEM is encrypted.");
      return _8.fromDer(_.body);
    };
    KK.encryptRsaPrivateKey = function (H, _, q) {
      if (((q = q || {}), !q.legacy)) {
        var $ = KK.wrapRsaPrivateKey(KK.privateKeyToAsn1(H));
        return ($ = KK.encryptPrivateKeyInfo($, _, q)), KK.encryptedPrivateKeyToPem($);
      }
      var K, O, T, z;
      switch (q.algorithm) {
        case "aes128":
          (K = "AES-128-CBC"), (T = 16), (O = C7.random.getBytesSync(16)), (z = C7.aes.createEncryptionCipher);
          break;
        case "aes192":
          (K = "AES-192-CBC"), (T = 24), (O = C7.random.getBytesSync(16)), (z = C7.aes.createEncryptionCipher);
          break;
        case "aes256":
          (K = "AES-256-CBC"), (T = 32), (O = C7.random.getBytesSync(16)), (z = C7.aes.createEncryptionCipher);
          break;
        case "3des":
          (K = "DES-EDE3-CBC"), (T = 24), (O = C7.random.getBytesSync(8)), (z = C7.des.createEncryptionCipher);
          break;
        case "des":
          (K = "DES-CBC"), (T = 8), (O = C7.random.getBytesSync(8)), (z = C7.des.createEncryptionCipher);
          break;
        default:
          var A = Error('Could not encrypt RSA private key; unsupported encryption algorithm "' + q.algorithm + '".');
          throw ((A.algorithm = q.algorithm), A);
      }
      var f = C7.pbe.opensslDeriveBytes(_, O.substr(0, 8), T),
        w = z(f);
      w.start(O), w.update(_8.toDer(KK.privateKeyToAsn1(H))), w.finish();
      var Y = {
        type: "RSA PRIVATE KEY",
        procType: { version: "4", type: "ENCRYPTED" },
        dekInfo: { algorithm: K, parameters: C7.util.bytesToHex(O).toUpperCase() },
        body: w.output.getBytes(),
      };
      return C7.pem.encode(Y);
    };
    KK.decryptRsaPrivateKey = function (H, _) {
      var q = null,
        $ = C7.pem.decode(H)[0];
      if ($.type !== "ENCRYPTED PRIVATE KEY" && $.type !== "PRIVATE KEY" && $.type !== "RSA PRIVATE KEY") {
        var K = Error(
          'Could not convert private key from PEM; PEM header type is not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".',
        );
        throw ((K.headerType = K), K);
      }
      if ($.procType && $.procType.type === "ENCRYPTED") {
        var O, T;
        switch ($.dekInfo.algorithm) {
          case "DES-CBC":
            (O = 8), (T = C7.des.createDecryptionCipher);
            break;
          case "DES-EDE3-CBC":
            (O = 24), (T = C7.des.createDecryptionCipher);
            break;
          case "AES-128-CBC":
            (O = 16), (T = C7.aes.createDecryptionCipher);
            break;
          case "AES-192-CBC":
            (O = 24), (T = C7.aes.createDecryptionCipher);
            break;
          case "AES-256-CBC":
            (O = 32), (T = C7.aes.createDecryptionCipher);
            break;
          case "RC2-40-CBC":
            (O = 5),
              (T = function (Y) {
                return C7.rc2.createDecryptionCipher(Y, 40);
              });
            break;
          case "RC2-64-CBC":
            (O = 8),
              (T = function (Y) {
                return C7.rc2.createDecryptionCipher(Y, 64);
              });
            break;
          case "RC2-128-CBC":
            (O = 16),
              (T = function (Y) {
                return C7.rc2.createDecryptionCipher(Y, 128);
              });
            break;
          default:
            var K = Error(
              'Could not decrypt private key; unsupported encryption algorithm "' + $.dekInfo.algorithm + '".',
            );
            throw ((K.algorithm = $.dekInfo.algorithm), K);
        }
        var z = C7.util.hexToBytes($.dekInfo.parameters),
          A = C7.pbe.opensslDeriveBytes(_, z.substr(0, 8), O),
          f = T(A);
        if ((f.start(z), f.update(C7.util.createBuffer($.body)), f.finish())) q = f.output.getBytes();
        else return q;
      } else q = $.body;
      if ($.type === "ENCRYPTED PRIVATE KEY") q = KK.decryptPrivateKeyInfo(_8.fromDer(q), _);
      else q = _8.fromDer(q);
      if (q !== null) q = KK.privateKeyFromAsn1(q);
      return q;
    };
    KK.pbe.generatePkcs12Key = function (H, _, q, $, K, O) {
      var T, z;
      if (typeof O > "u" || O === null) {
        if (!("sha1" in C7.md)) throw Error('"sha1" hash algorithm unavailable.');
        O = C7.md.sha1.create();
      }
      var { digestLength: A, blockLength: f } = O,
        w = new C7.util.ByteBuffer(),
        Y = new C7.util.ByteBuffer();
      if (H !== null && H !== void 0) {
        for (z = 0; z < H.length; z++) Y.putInt16(H.charCodeAt(z));
        Y.putInt16(0);
      }
      var D = Y.length(),
        j = _.length(),
        M = new C7.util.ByteBuffer();
      M.fillWithByte(q, f);
      var J = f * Math.ceil(j / f),
        P = new C7.util.ByteBuffer();
      for (z = 0; z < J; z++) P.putByte(_.at(z % j));
      var X = f * Math.ceil(D / f),
        R = new C7.util.ByteBuffer();
      for (z = 0; z < X; z++) R.putByte(Y.at(z % D));
      var W = P;
      W.putBuffer(R);
      var Z = Math.ceil(K / A);
      for (var k = 1; k <= Z; k++) {
        var v = new C7.util.ByteBuffer();
        v.putBytes(M.bytes()), v.putBytes(W.bytes());
        for (var y = 0; y < $; y++) O.start(), O.update(v.getBytes()), (v = O.digest());
        var E = new C7.util.ByteBuffer();
        for (z = 0; z < f; z++) E.putByte(v.at(z % A));
        var S = Math.ceil(j / f) + Math.ceil(D / f),
          x = new C7.util.ByteBuffer();
        for (T = 0; T < S; T++) {
          var I = new C7.util.ByteBuffer(W.getBytes(f)),
            B = 511;
          for (z = E.length() - 1; z >= 0; z--) (B = B >> 8), (B += E.at(z) + I.at(z)), I.setAt(z, B & 255);
          x.putBuffer(I);
        }
        (W = x), w.putBuffer(v);
      }
      return w.truncate(w.length() - K), w;
    };
    KK.pbe.getCipher = function (H, _, q) {
      switch (H) {
        case KK.oids.pkcs5PBES2:
          return KK.pbe.getCipherForPBES2(H, _, q);
        case KK.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
        case KK.oids["pbewithSHAAnd40BitRC2-CBC"]:
          return KK.pbe.getCipherForPKCS12PBE(H, _, q);
        default:
          var $ = Error("Cannot read encrypted PBE data block. Unsupported OID.");
          throw (
            (($.oid = H),
            ($.supportedOids = ["pkcs5PBES2", "pbeWithSHAAnd3-KeyTripleDES-CBC", "pbewithSHAAnd40BitRC2-CBC"]),
            $)
          );
      }
    };
    KK.pbe.getCipherForPBES2 = function (H, _, q) {
      var $ = {},
        K = [];
      if (!_8.validate(_, uF4, $, K)) {
        var O = Error(
          "Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",
        );
        throw ((O.errors = K), O);
      }
      if (((H = _8.derToOid($.kdfOid)), H !== KK.oids.pkcs5PBKDF2)) {
        var O = Error("Cannot read encrypted private key. Unsupported key derivation function OID.");
        throw ((O.oid = H), (O.supportedOids = ["pkcs5PBKDF2"]), O);
      }
      if (
        ((H = _8.derToOid($.encOid)),
        H !== KK.oids["aes128-CBC"] &&
          H !== KK.oids["aes192-CBC"] &&
          H !== KK.oids["aes256-CBC"] &&
          H !== KK.oids["des-EDE3-CBC"] &&
          H !== KK.oids.desCBC)
      ) {
        var O = Error("Cannot read encrypted private key. Unsupported encryption scheme OID.");
        throw (
          ((O.oid = H), (O.supportedOids = ["aes128-CBC", "aes192-CBC", "aes256-CBC", "des-EDE3-CBC", "desCBC"]), O)
        );
      }
      var T = $.kdfSalt,
        z = C7.util.createBuffer($.kdfIterationCount);
      z = z.getInt(z.length() << 3);
      var A, f;
      switch (KK.oids[H]) {
        case "aes128-CBC":
          (A = 16), (f = C7.aes.createDecryptionCipher);
          break;
        case "aes192-CBC":
          (A = 24), (f = C7.aes.createDecryptionCipher);
          break;
        case "aes256-CBC":
          (A = 32), (f = C7.aes.createDecryptionCipher);
          break;
        case "des-EDE3-CBC":
          (A = 24), (f = C7.des.createDecryptionCipher);
          break;
        case "desCBC":
          (A = 8), (f = C7.des.createDecryptionCipher);
          break;
      }
      var w = C97($.prfOid),
        Y = C7.pkcs5.pbkdf2(q, T, z, A, w),
        D = $.encIv,
        j = f(Y);
      return j.start(D), j;
    };
    KK.pbe.getCipherForPKCS12PBE = function (H, _, q) {
      var $ = {},
        K = [];
      if (!_8.validate(_, xF4, $, K)) {
        var O = Error(
          "Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",
        );
        throw ((O.errors = K), O);
      }
      var T = C7.util.createBuffer($.salt),
        z = C7.util.createBuffer($.iterations);
      z = z.getInt(z.length() << 3);
      var A, f, w;
      switch (H) {
        case KK.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
          (A = 24), (f = 8), (w = C7.des.startDecrypting);
          break;
        case KK.oids["pbewithSHAAnd40BitRC2-CBC"]:
          (A = 5),
            (f = 8),
            (w = function (J, P) {
              var X = C7.rc2.createDecryptionCipher(J, 40);
              return X.start(P, null), X;
            });
          break;
        default:
          var O = Error("Cannot read PKCS #12 PBE data block. Unsupported OID.");
          throw ((O.oid = H), O);
      }
      var Y = C97($.prfOid),
        D = KK.pbe.generatePkcs12Key(q, T, 1, z, A, Y);
      Y.start();
      var j = KK.pbe.generatePkcs12Key(q, T, 2, z, f, Y);
      return w(D, j);
    };
    KK.pbe.opensslDeriveBytes = function (H, _, q, $) {
      if (typeof $ > "u" || $ === null) {
        if (!("md5" in C7.md)) throw Error('"md5" hash algorithm unavailable.');
        $ = C7.md.md5.create();
      }
      if (_ === null) _ = "";
      var K = [E97($, H + _)];
      for (var O = 16, T = 1; O < q; ++T, O += 16) K.push(E97($, K[T - 1] + H + _));
      return K.join("").substr(0, q);
    };
    function E97(H, _) {
      return H.start().update(_).digest().getBytes();
    }
    function C97(H) {
      var _;
      if (!H) _ = "hmacWithSHA1";
      else if (((_ = KK.oids[_8.derToOid(H)]), !_)) {
        var q = Error("Unsupported PRF OID.");
        throw (
          ((q.oid = H),
          (q.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"]),
          q)
        );
      }
      return b97(_);
    }
    function b97(H) {
      var _ = C7.md;
      switch (H) {
        case "hmacWithSHA224":
          _ = C7.md.sha512;
        case "hmacWithSHA1":
        case "hmacWithSHA256":
        case "hmacWithSHA384":
        case "hmacWithSHA512":
          H = H.substr(8).toLowerCase();
          break;
        default:
          var q = Error("Unsupported PRF algorithm.");
          throw (
            ((q.algorithm = H),
            (q.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"]),
            q)
          );
      }
      if (!_ || !(H in _)) throw Error("Unknown hash algorithm: " + H);
      return _[H].create();
    }
    function mF4(H, _, q, $) {
      var K = _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
        _8.create(_8.Class.UNIVERSAL, _8.Type.OCTETSTRING, !1, H),
        _8.create(_8.Class.UNIVERSAL, _8.Type.INTEGER, !1, _.getBytes()),
      ]);
      if ($ !== "hmacWithSHA1")
        K.value.push(
          _8.create(_8.Class.UNIVERSAL, _8.Type.INTEGER, !1, C7.util.hexToBytes(q.toString(16))),
          _8.create(_8.Class.UNIVERSAL, _8.Type.SEQUENCE, !0, [
            _8.create(_8.Class.UNIVERSAL, _8.Type.OID, !1, _8.oidToDer(KK.oids[$]).getBytes()),
            _8.create(_8.Class.UNIVERSAL, _8.Type.NULL, !1, ""),
          ]),
        );
      return K;
    }
  });

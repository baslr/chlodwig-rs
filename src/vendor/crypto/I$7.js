  var I$7 = d((Pi3, b$7) => {
    var $7 = XK();
    p6H();
    Kx();
    ClH();
    B6H();
    sOH();
    JC6();
    pE();
    F3();
    pk_();
    var r_ = $7.asn1,
      pZ = (b$7.exports = $7.pkcs7 = $7.pkcs7 || {});
    pZ.messageFromPem = function (H) {
      var _ = $7.pem.decode(H)[0];
      if (_.type !== "PKCS7") {
        var q = Error('Could not convert PKCS#7 message from PEM; PEM header type is not "PKCS#7".');
        throw ((q.headerType = _.type), q);
      }
      if (_.procType && _.procType.type === "ENCRYPTED")
        throw Error("Could not convert PKCS#7 message from PEM; PEM is encrypted.");
      var $ = r_.fromDer(_.body);
      return pZ.messageFromAsn1($);
    };
    pZ.messageToPem = function (H, _) {
      var q = { type: "PKCS7", body: r_.toDer(H.toAsn1()).getBytes() };
      return $7.pem.encode(q, { maxline: _ });
    };
    pZ.messageFromAsn1 = function (H) {
      var _ = {},
        q = [];
      if (!r_.validate(H, pZ.asn1.contentInfoValidator, _, q)) {
        var $ = Error("Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 ContentInfo.");
        throw (($.errors = q), $);
      }
      var K = r_.derToOid(_.contentType),
        O;
      switch (K) {
        case $7.pki.oids.envelopedData:
          O = pZ.createEnvelopedData();
          break;
        case $7.pki.oids.encryptedData:
          O = pZ.createEncryptedData();
          break;
        case $7.pki.oids.signedData:
          O = pZ.createSignedData();
          break;
        default:
          throw Error("Cannot read PKCS#7 message. ContentType with OID " + K + " is not (yet) supported.");
      }
      return O.fromAsn1(_.content.value[0]), O;
    };
    pZ.createSignedData = function () {
      var H = null;
      return (
        (H = {
          type: $7.pki.oids.signedData,
          version: 1,
          certificates: [],
          crls: [],
          signers: [],
          digestAlgorithmIdentifiers: [],
          contentInfo: null,
          signerInfos: [],
          fromAsn1: function ($) {
            if (
              (lC6(H, $, pZ.asn1.signedDataValidator),
              (H.certificates = []),
              (H.crls = []),
              (H.digestAlgorithmIdentifiers = []),
              (H.contentInfo = null),
              (H.signerInfos = []),
              H.rawCapture.certificates)
            ) {
              var K = H.rawCapture.certificates.value;
              for (var O = 0; O < K.length; ++O) H.certificates.push($7.pki.certificateFromAsn1(K[O]));
            }
          },
          toAsn1: function () {
            if (!H.contentInfo) H.sign();
            var $ = [];
            for (var K = 0; K < H.certificates.length; ++K) $.push($7.pki.certificateToAsn1(H.certificates[K]));
            var O = [],
              T = r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, [
                r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
                  r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, r_.integerToDer(H.version).getBytes()),
                  r_.create(r_.Class.UNIVERSAL, r_.Type.SET, !0, H.digestAlgorithmIdentifiers),
                  H.contentInfo,
                ]),
              ]);
            if ($.length > 0) T.value[0].value.push(r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, $));
            if (O.length > 0) T.value[0].value.push(r_.create(r_.Class.CONTEXT_SPECIFIC, 1, !0, O));
            return (
              T.value[0].value.push(r_.create(r_.Class.UNIVERSAL, r_.Type.SET, !0, H.signerInfos)),
              r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
                r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.type).getBytes()),
                T,
              ])
            );
          },
          addSigner: function ($) {
            var { issuer: K, serialNumber: O } = $;
            if ($.certificate) {
              var T = $.certificate;
              if (typeof T === "string") T = $7.pki.certificateFromPem(T);
              (K = T.issuer.attributes), (O = T.serialNumber);
            }
            var z = $.key;
            if (!z) throw Error("Could not add PKCS#7 signer; no private key specified.");
            if (typeof z === "string") z = $7.pki.privateKeyFromPem(z);
            var A = $.digestAlgorithm || $7.pki.oids.sha1;
            switch (A) {
              case $7.pki.oids.sha1:
              case $7.pki.oids.sha256:
              case $7.pki.oids.sha384:
              case $7.pki.oids.sha512:
              case $7.pki.oids.md5:
                break;
              default:
                throw Error("Could not add PKCS#7 signer; unknown message digest algorithm: " + A);
            }
            var f = $.authenticatedAttributes || [];
            if (f.length > 0) {
              var w = !1,
                Y = !1;
              for (var D = 0; D < f.length; ++D) {
                var j = f[D];
                if (!w && j.type === $7.pki.oids.contentType) {
                  if (((w = !0), Y)) break;
                  continue;
                }
                if (!Y && j.type === $7.pki.oids.messageDigest) {
                  if (((Y = !0), w)) break;
                  continue;
                }
              }
              if (!w || !Y)
                throw Error(
                  "Invalid signer.authenticatedAttributes. If signer.authenticatedAttributes is specified, then it must contain at least two attributes, PKCS #9 content-type and PKCS #9 message-digest.",
                );
            }
            H.signers.push({
              key: z,
              version: 1,
              issuer: K,
              serialNumber: O,
              digestAlgorithm: A,
              signatureAlgorithm: $7.pki.oids.rsaEncryption,
              signature: null,
              authenticatedAttributes: f,
              unauthenticatedAttributes: [],
            });
          },
          sign: function ($) {
            if ((($ = $ || {}), typeof H.content !== "object" || H.contentInfo === null)) {
              if (
                ((H.contentInfo = r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
                  r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer($7.pki.oids.data).getBytes()),
                ])),
                "content" in H)
              ) {
                var K;
                if (H.content instanceof $7.util.ByteBuffer) K = H.content.bytes();
                else if (typeof H.content === "string") K = $7.util.encodeUtf8(H.content);
                if ($.detached) H.detachedContent = r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, K);
                else
                  H.contentInfo.value.push(
                    r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, [
                      r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, K),
                    ]),
                  );
              }
            }
            if (H.signers.length === 0) return;
            var O = _();
            q(O);
          },
          verify: function () {
            throw Error("PKCS#7 signature verification not yet implemented.");
          },
          addCertificate: function ($) {
            if (typeof $ === "string") $ = $7.pki.certificateFromPem($);
            H.certificates.push($);
          },
          addCertificateRevokationList: function ($) {
            throw Error("PKCS#7 CRL support not yet implemented.");
          },
        }),
        H
      );
      function _() {
        var $ = {};
        for (var K = 0; K < H.signers.length; ++K) {
          var O = H.signers[K],
            T = O.digestAlgorithm;
          if (!(T in $)) $[T] = $7.md[$7.pki.oids[T]].create();
          if (O.authenticatedAttributes.length === 0) O.md = $[T];
          else O.md = $7.md[$7.pki.oids[T]].create();
        }
        H.digestAlgorithmIdentifiers = [];
        for (var T in $)
          H.digestAlgorithmIdentifiers.push(
            r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
              r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(T).getBytes()),
              r_.create(r_.Class.UNIVERSAL, r_.Type.NULL, !1, ""),
            ]),
          );
        return $;
      }
      function q($) {
        var K;
        if (H.detachedContent) K = H.detachedContent;
        else (K = H.contentInfo.value[1]), (K = K.value[0]);
        if (!K) throw Error("Could not sign PKCS#7 message; there is no content to sign.");
        var O = r_.derToOid(H.contentInfo.value[0].value),
          T = r_.toDer(K);
        T.getByte(), r_.getBerValueLength(T), (T = T.getBytes());
        for (var z in $) $[z].start().update(T);
        var A = new Date();
        for (var f = 0; f < H.signers.length; ++f) {
          var w = H.signers[f];
          if (w.authenticatedAttributes.length === 0) {
            if (O !== $7.pki.oids.data)
              throw Error(
                "Invalid signer; authenticatedAttributes must be present when the ContentInfo content type is not PKCS#7 Data.",
              );
          } else {
            w.authenticatedAttributesAsn1 = r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, []);
            var Y = r_.create(r_.Class.UNIVERSAL, r_.Type.SET, !0, []);
            for (var D = 0; D < w.authenticatedAttributes.length; ++D) {
              var j = w.authenticatedAttributes[D];
              if (j.type === $7.pki.oids.messageDigest) j.value = $[w.digestAlgorithm].digest();
              else if (j.type === $7.pki.oids.signingTime) {
                if (!j.value) j.value = A;
              }
              Y.value.push(QC6(j)), w.authenticatedAttributesAsn1.value.push(QC6(j));
            }
            (T = r_.toDer(Y).getBytes()), w.md.start().update(T);
          }
          w.signature = w.key.sign(w.md, "RSASSA-PKCS1-V1_5");
        }
        H.signerInfos = iU4(H.signers);
      }
    };
    pZ.createEncryptedData = function () {
      var H = null;
      return (
        (H = {
          type: $7.pki.oids.encryptedData,
          version: 0,
          encryptedContent: { algorithm: $7.pki.oids["aes256-CBC"] },
          fromAsn1: function (_) {
            lC6(H, _, pZ.asn1.encryptedDataValidator);
          },
          decrypt: function (_) {
            if (_ !== void 0) H.encryptedContent.key = _;
            C$7(H);
          },
        }),
        H
      );
    };
    pZ.createEnvelopedData = function () {
      var H = null;
      return (
        (H = {
          type: $7.pki.oids.envelopedData,
          version: 0,
          recipients: [],
          encryptedContent: { algorithm: $7.pki.oids["aes256-CBC"] },
          fromAsn1: function (_) {
            var q = lC6(H, _, pZ.asn1.envelopedDataValidator);
            H.recipients = UU4(q.recipientInfos.value);
          },
          toAsn1: function () {
            return r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
              r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.type).getBytes()),
              r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, [
                r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
                  r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, r_.integerToDer(H.version).getBytes()),
                  r_.create(r_.Class.UNIVERSAL, r_.Type.SET, !0, QU4(H.recipients)),
                  r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, nU4(H.encryptedContent)),
                ]),
              ]),
            ]);
          },
          findRecipient: function (_) {
            var q = _.issuer.attributes;
            for (var $ = 0; $ < H.recipients.length; ++$) {
              var K = H.recipients[$],
                O = K.issuer;
              if (K.serialNumber !== _.serialNumber) continue;
              if (O.length !== q.length) continue;
              var T = !0;
              for (var z = 0; z < q.length; ++z)
                if (O[z].type !== q[z].type || O[z].value !== q[z].value) {
                  T = !1;
                  break;
                }
              if (T) return K;
            }
            return null;
          },
          decrypt: function (_, q) {
            if (H.encryptedContent.key === void 0 && _ !== void 0 && q !== void 0)
              switch (_.encryptedContent.algorithm) {
                case $7.pki.oids.rsaEncryption:
                case $7.pki.oids.desCBC:
                  var $ = q.decrypt(_.encryptedContent.content);
                  H.encryptedContent.key = $7.util.createBuffer($);
                  break;
                default:
                  throw Error("Unsupported asymmetric cipher, OID " + _.encryptedContent.algorithm);
              }
            C$7(H);
          },
          addRecipient: function (_) {
            H.recipients.push({
              version: 0,
              issuer: _.issuer.attributes,
              serialNumber: _.serialNumber,
              encryptedContent: { algorithm: $7.pki.oids.rsaEncryption, key: _.publicKey },
            });
          },
          encrypt: function (_, q) {
            if (H.encryptedContent.content === void 0) {
              (q = q || H.encryptedContent.algorithm), (_ = _ || H.encryptedContent.key);
              var $, K, O;
              switch (q) {
                case $7.pki.oids["aes128-CBC"]:
                  ($ = 16), (K = 16), (O = $7.aes.createEncryptionCipher);
                  break;
                case $7.pki.oids["aes192-CBC"]:
                  ($ = 24), (K = 16), (O = $7.aes.createEncryptionCipher);
                  break;
                case $7.pki.oids["aes256-CBC"]:
                  ($ = 32), (K = 16), (O = $7.aes.createEncryptionCipher);
                  break;
                case $7.pki.oids["des-EDE3-CBC"]:
                  ($ = 24), (K = 8), (O = $7.des.createEncryptionCipher);
                  break;
                default:
                  throw Error("Unsupported symmetric cipher, OID " + q);
              }
              if (_ === void 0) _ = $7.util.createBuffer($7.random.getBytes($));
              else if (_.length() != $)
                throw Error("Symmetric key has wrong length; got " + _.length() + " bytes, expected " + $ + ".");
              (H.encryptedContent.algorithm = q),
                (H.encryptedContent.key = _),
                (H.encryptedContent.parameter = $7.util.createBuffer($7.random.getBytes(K)));
              var T = O(_);
              if ((T.start(H.encryptedContent.parameter.copy()), T.update(H.content), !T.finish()))
                throw Error("Symmetric encryption failed.");
              H.encryptedContent.content = T.output;
            }
            for (var z = 0; z < H.recipients.length; ++z) {
              var A = H.recipients[z];
              if (A.encryptedContent.content !== void 0) continue;
              switch (A.encryptedContent.algorithm) {
                case $7.pki.oids.rsaEncryption:
                  A.encryptedContent.content = A.encryptedContent.key.encrypt(H.encryptedContent.key.data);
                  break;
                default:
                  throw Error("Unsupported asymmetric cipher, OID " + A.encryptedContent.algorithm);
              }
            }
          },
        }),
        H
      );
    };
    function cU4(H) {
      var _ = {},
        q = [];
      if (!r_.validate(H, pZ.asn1.recipientInfoValidator, _, q)) {
        var $ = Error("Cannot read PKCS#7 RecipientInfo. ASN.1 object is not an PKCS#7 RecipientInfo.");
        throw (($.errors = q), $);
      }
      return {
        version: _.version.charCodeAt(0),
        issuer: $7.pki.RDNAttributesAsArray(_.issuer),
        serialNumber: $7.util.createBuffer(_.serial).toHex(),
        encryptedContent: {
          algorithm: r_.derToOid(_.encAlgorithm),
          parameter: _.encParameter ? _.encParameter.value : void 0,
          content: _.encKey,
        },
      };
    }
    function FU4(H) {
      return r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
        r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, r_.integerToDer(H.version).getBytes()),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
          $7.pki.distinguishedNameToAsn1({ attributes: H.issuer }),
          r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, $7.util.hexToBytes(H.serialNumber)),
        ]),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
          r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.encryptedContent.algorithm).getBytes()),
          r_.create(r_.Class.UNIVERSAL, r_.Type.NULL, !1, ""),
        ]),
        r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, H.encryptedContent.content),
      ]);
    }
    function UU4(H) {
      var _ = [];
      for (var q = 0; q < H.length; ++q) _.push(cU4(H[q]));
      return _;
    }
    function QU4(H) {
      var _ = [];
      for (var q = 0; q < H.length; ++q) _.push(FU4(H[q]));
      return _;
    }
    function lU4(H) {
      var _ = r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
        r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, r_.integerToDer(H.version).getBytes()),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
          $7.pki.distinguishedNameToAsn1({ attributes: H.issuer }),
          r_.create(r_.Class.UNIVERSAL, r_.Type.INTEGER, !1, $7.util.hexToBytes(H.serialNumber)),
        ]),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
          r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.digestAlgorithm).getBytes()),
          r_.create(r_.Class.UNIVERSAL, r_.Type.NULL, !1, ""),
        ]),
      ]);
      if (H.authenticatedAttributesAsn1) _.value.push(H.authenticatedAttributesAsn1);
      if (
        (_.value.push(
          r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
            r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.signatureAlgorithm).getBytes()),
            r_.create(r_.Class.UNIVERSAL, r_.Type.NULL, !1, ""),
          ]),
        ),
        _.value.push(r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, H.signature)),
        H.unauthenticatedAttributes.length > 0)
      ) {
        var q = r_.create(r_.Class.CONTEXT_SPECIFIC, 1, !0, []);
        for (var $ = 0; $ < H.unauthenticatedAttributes.length; ++$) {
          var K = H.unauthenticatedAttributes[$];
          q.values.push(QC6(K));
        }
        _.value.push(q);
      }
      return _;
    }
    function iU4(H) {
      var _ = [];
      for (var q = 0; q < H.length; ++q) _.push(lU4(H[q]));
      return _;
    }
    function QC6(H) {
      var _;
      if (H.type === $7.pki.oids.contentType)
        _ = r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.value).getBytes());
      else if (H.type === $7.pki.oids.messageDigest)
        _ = r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, H.value.bytes());
      else if (H.type === $7.pki.oids.signingTime) {
        var q = new Date("1950-01-01T00:00:00Z"),
          $ = new Date("2050-01-01T00:00:00Z"),
          K = H.value;
        if (typeof K === "string") {
          var O = Date.parse(K);
          if (!isNaN(O)) K = new Date(O);
          else if (K.length === 13) K = r_.utcTimeToDate(K);
          else K = r_.generalizedTimeToDate(K);
        }
        if (K >= q && K < $) _ = r_.create(r_.Class.UNIVERSAL, r_.Type.UTCTIME, !1, r_.dateToUtcTime(K));
        else _ = r_.create(r_.Class.UNIVERSAL, r_.Type.GENERALIZEDTIME, !1, r_.dateToGeneralizedTime(K));
      }
      return r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
        r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.type).getBytes()),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SET, !0, [_]),
      ]);
    }
    function nU4(H) {
      return [
        r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer($7.pki.oids.data).getBytes()),
        r_.create(r_.Class.UNIVERSAL, r_.Type.SEQUENCE, !0, [
          r_.create(r_.Class.UNIVERSAL, r_.Type.OID, !1, r_.oidToDer(H.algorithm).getBytes()),
          !H.parameter ? void 0 : r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, H.parameter.getBytes()),
        ]),
        r_.create(r_.Class.CONTEXT_SPECIFIC, 0, !0, [
          r_.create(r_.Class.UNIVERSAL, r_.Type.OCTETSTRING, !1, H.content.getBytes()),
        ]),
      ];
    }
    function lC6(H, _, q) {
      var $ = {},
        K = [];
      if (!r_.validate(_, q, $, K)) {
        var O = Error("Cannot read PKCS#7 message. ASN.1 object is not a supported PKCS#7 message.");
        throw ((O.errors = O), O);
      }
      var T = r_.derToOid($.contentType);
      if (T !== $7.pki.oids.data) throw Error("Unsupported PKCS#7 message. Only wrapped ContentType Data supported.");
      if ($.encryptedContent) {
        var z = "";
        if ($7.util.isArray($.encryptedContent))
          for (var A = 0; A < $.encryptedContent.length; ++A) {
            if ($.encryptedContent[A].type !== r_.Type.OCTETSTRING)
              throw Error(
                "Malformed PKCS#7 message, expecting encrypted content constructed of only OCTET STRING objects.",
              );
            z += $.encryptedContent[A].value;
          }
        else z = $.encryptedContent;
        H.encryptedContent = {
          algorithm: r_.derToOid($.encAlgorithm),
          parameter: $7.util.createBuffer($.encParameter.value),
          content: $7.util.createBuffer(z),
        };
      }
      if ($.content) {
        var z = "";
        if ($7.util.isArray($.content))
          for (var A = 0; A < $.content.length; ++A) {
            if ($.content[A].type !== r_.Type.OCTETSTRING)
              throw Error("Malformed PKCS#7 message, expecting content constructed of only OCTET STRING objects.");
            z += $.content[A].value;
          }
        else z = $.content;
        H.content = $7.util.createBuffer(z);
      }
      return (H.version = $.version.charCodeAt(0)), (H.rawCapture = $), $;
    }
    function C$7(H) {
      if (H.encryptedContent.key === void 0) throw Error("Symmetric key not available.");
      if (H.content === void 0) {
        var _;
        switch (H.encryptedContent.algorithm) {
          case $7.pki.oids["aes128-CBC"]:
          case $7.pki.oids["aes192-CBC"]:
          case $7.pki.oids["aes256-CBC"]:
            _ = $7.aes.createDecryptionCipher(H.encryptedContent.key);
            break;
          case $7.pki.oids.desCBC:
          case $7.pki.oids["des-EDE3-CBC"]:
            _ = $7.des.createDecryptionCipher(H.encryptedContent.key);
            break;
          default:
            throw Error("Unsupported symmetric cipher, OID " + H.encryptedContent.algorithm);
        }
        if ((_.start(H.encryptedContent.parameter), _.update(H.encryptedContent.content), !_.finish()))
          throw Error("Symmetric decryption failed.");
        H.content = _.output;
      }
    }
  });

  var pk_ = d((Oi3, l97) => {
    var f$ = XK();
    p6H();
    Kx();
    ClH();
    ig();
    g97();
    B6H();
    sOH();
    uk_();
    ulH();
    F3();
    var eH = f$.asn1,
      Eq = (l97.exports = f$.pki = f$.pki || {}),
      v3 = Eq.oids,
      ED = {};
    ED.CN = v3.commonName;
    ED.commonName = "CN";
    ED.C = v3.countryName;
    ED.countryName = "C";
    ED.L = v3.localityName;
    ED.localityName = "L";
    ED.ST = v3.stateOrProvinceName;
    ED.stateOrProvinceName = "ST";
    ED.O = v3.organizationName;
    ED.organizationName = "O";
    ED.OU = v3.organizationalUnitName;
    ED.organizationalUnitName = "OU";
    ED.E = v3.emailAddress;
    ED.emailAddress = "E";
    var F97 = f$.pki.rsa.publicKeyValidator,
      dF4 = {
        name: "Certificate",
        tagClass: eH.Class.UNIVERSAL,
        type: eH.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "Certificate.TBSCertificate",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.SEQUENCE,
            constructed: !0,
            captureAsn1: "tbsCertificate",
            value: [
              {
                name: "Certificate.TBSCertificate.version",
                tagClass: eH.Class.CONTEXT_SPECIFIC,
                type: 0,
                constructed: !0,
                optional: !0,
                value: [
                  {
                    name: "Certificate.TBSCertificate.version.integer",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.INTEGER,
                    constructed: !1,
                    capture: "certVersion",
                  },
                ],
              },
              {
                name: "Certificate.TBSCertificate.serialNumber",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.INTEGER,
                constructed: !1,
                capture: "certSerialNumber",
              },
              {
                name: "Certificate.TBSCertificate.signature",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "Certificate.TBSCertificate.signature.algorithm",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.OID,
                    constructed: !1,
                    capture: "certinfoSignatureOid",
                  },
                  {
                    name: "Certificate.TBSCertificate.signature.parameters",
                    tagClass: eH.Class.UNIVERSAL,
                    optional: !0,
                    captureAsn1: "certinfoSignatureParams",
                  },
                ],
              },
              {
                name: "Certificate.TBSCertificate.issuer",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.SEQUENCE,
                constructed: !0,
                captureAsn1: "certIssuer",
              },
              {
                name: "Certificate.TBSCertificate.validity",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "Certificate.TBSCertificate.validity.notBefore (utc)",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.UTCTIME,
                    constructed: !1,
                    optional: !0,
                    capture: "certValidity1UTCTime",
                  },
                  {
                    name: "Certificate.TBSCertificate.validity.notBefore (generalized)",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.GENERALIZEDTIME,
                    constructed: !1,
                    optional: !0,
                    capture: "certValidity2GeneralizedTime",
                  },
                  {
                    name: "Certificate.TBSCertificate.validity.notAfter (utc)",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.UTCTIME,
                    constructed: !1,
                    optional: !0,
                    capture: "certValidity3UTCTime",
                  },
                  {
                    name: "Certificate.TBSCertificate.validity.notAfter (generalized)",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.GENERALIZEDTIME,
                    constructed: !1,
                    optional: !0,
                    capture: "certValidity4GeneralizedTime",
                  },
                ],
              },
              {
                name: "Certificate.TBSCertificate.subject",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.SEQUENCE,
                constructed: !0,
                captureAsn1: "certSubject",
              },
              F97,
              {
                name: "Certificate.TBSCertificate.issuerUniqueID",
                tagClass: eH.Class.CONTEXT_SPECIFIC,
                type: 1,
                constructed: !0,
                optional: !0,
                value: [
                  {
                    name: "Certificate.TBSCertificate.issuerUniqueID.id",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.BITSTRING,
                    constructed: !1,
                    captureBitStringValue: "certIssuerUniqueId",
                  },
                ],
              },
              {
                name: "Certificate.TBSCertificate.subjectUniqueID",
                tagClass: eH.Class.CONTEXT_SPECIFIC,
                type: 2,
                constructed: !0,
                optional: !0,
                value: [
                  {
                    name: "Certificate.TBSCertificate.subjectUniqueID.id",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.BITSTRING,
                    constructed: !1,
                    captureBitStringValue: "certSubjectUniqueId",
                  },
                ],
              },
              {
                name: "Certificate.TBSCertificate.extensions",
                tagClass: eH.Class.CONTEXT_SPECIFIC,
                type: 3,
                constructed: !0,
                captureAsn1: "certExtensions",
                optional: !0,
              },
            ],
          },
          {
            name: "Certificate.signatureAlgorithm",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "Certificate.signatureAlgorithm.algorithm",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.OID,
                constructed: !1,
                capture: "certSignatureOid",
              },
              {
                name: "Certificate.TBSCertificate.signature.parameters",
                tagClass: eH.Class.UNIVERSAL,
                optional: !0,
                captureAsn1: "certSignatureParams",
              },
            ],
          },
          {
            name: "Certificate.signatureValue",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.BITSTRING,
            constructed: !1,
            captureBitStringValue: "certSignature",
          },
        ],
      },
      cF4 = {
        name: "rsapss",
        tagClass: eH.Class.UNIVERSAL,
        type: eH.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "rsapss.hashAlgorithm",
            tagClass: eH.Class.CONTEXT_SPECIFIC,
            type: 0,
            constructed: !0,
            value: [
              {
                name: "rsapss.hashAlgorithm.AlgorithmIdentifier",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Class.SEQUENCE,
                constructed: !0,
                optional: !0,
                value: [
                  {
                    name: "rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.OID,
                    constructed: !1,
                    capture: "hashOid",
                  },
                ],
              },
            ],
          },
          {
            name: "rsapss.maskGenAlgorithm",
            tagClass: eH.Class.CONTEXT_SPECIFIC,
            type: 1,
            constructed: !0,
            value: [
              {
                name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Class.SEQUENCE,
                constructed: !0,
                optional: !0,
                value: [
                  {
                    name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.OID,
                    constructed: !1,
                    capture: "maskGenOid",
                  },
                  {
                    name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",
                        tagClass: eH.Class.UNIVERSAL,
                        type: eH.Type.OID,
                        constructed: !1,
                        capture: "maskGenHashOid",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "rsapss.saltLength",
            tagClass: eH.Class.CONTEXT_SPECIFIC,
            type: 2,
            optional: !0,
            value: [
              {
                name: "rsapss.saltLength.saltLength",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Class.INTEGER,
                constructed: !1,
                capture: "saltLength",
              },
            ],
          },
          {
            name: "rsapss.trailerField",
            tagClass: eH.Class.CONTEXT_SPECIFIC,
            type: 3,
            optional: !0,
            value: [
              {
                name: "rsapss.trailer.trailer",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Class.INTEGER,
                constructed: !1,
                capture: "trailer",
              },
            ],
          },
        ],
      },
      FF4 = {
        name: "CertificationRequestInfo",
        tagClass: eH.Class.UNIVERSAL,
        type: eH.Type.SEQUENCE,
        constructed: !0,
        captureAsn1: "certificationRequestInfo",
        value: [
          {
            name: "CertificationRequestInfo.integer",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.INTEGER,
            constructed: !1,
            capture: "certificationRequestInfoVersion",
          },
          {
            name: "CertificationRequestInfo.subject",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.SEQUENCE,
            constructed: !0,
            captureAsn1: "certificationRequestInfoSubject",
          },
          F97,
          {
            name: "CertificationRequestInfo.attributes",
            tagClass: eH.Class.CONTEXT_SPECIFIC,
            type: 0,
            constructed: !0,
            optional: !0,
            capture: "certificationRequestInfoAttributes",
            value: [
              {
                name: "CertificationRequestInfo.attributes",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "CertificationRequestInfo.attributes.type",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.OID,
                    constructed: !1,
                  },
                  {
                    name: "CertificationRequestInfo.attributes.value",
                    tagClass: eH.Class.UNIVERSAL,
                    type: eH.Type.SET,
                    constructed: !0,
                  },
                ],
              },
            ],
          },
        ],
      },
      UF4 = {
        name: "CertificationRequest",
        tagClass: eH.Class.UNIVERSAL,
        type: eH.Type.SEQUENCE,
        constructed: !0,
        captureAsn1: "csr",
        value: [
          FF4,
          {
            name: "CertificationRequest.signatureAlgorithm",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "CertificationRequest.signatureAlgorithm.algorithm",
                tagClass: eH.Class.UNIVERSAL,
                type: eH.Type.OID,
                constructed: !1,
                capture: "csrSignatureOid",
              },
              {
                name: "CertificationRequest.signatureAlgorithm.parameters",
                tagClass: eH.Class.UNIVERSAL,
                optional: !0,
                captureAsn1: "csrSignatureParams",
              },
            ],
          },
          {
            name: "CertificationRequest.signature",
            tagClass: eH.Class.UNIVERSAL,
            type: eH.Type.BITSTRING,
            constructed: !1,
            captureBitStringValue: "csrSignature",
          },
        ],
      };
    Eq.RDNAttributesAsArray = function (H, _) {
      var q = [],
        $,
        K,
        O;
      for (var T = 0; T < H.value.length; ++T) {
        $ = H.value[T];
        for (var z = 0; z < $.value.length; ++z) {
          if (
            ((O = {}),
            (K = $.value[z]),
            (O.type = eH.derToOid(K.value[0].value)),
            (O.value = K.value[1].value),
            (O.valueTagClass = K.value[1].type),
            O.type in v3)
          ) {
            if (((O.name = v3[O.type]), O.name in ED)) O.shortName = ED[O.name];
          }
          if (_) _.update(O.type), _.update(O.value);
          q.push(O);
        }
      }
      return q;
    };
    Eq.CRIAttributesAsArray = function (H) {
      var _ = [];
      for (var q = 0; q < H.length; ++q) {
        var $ = H[q],
          K = eH.derToOid($.value[0].value),
          O = $.value[1].value;
        for (var T = 0; T < O.length; ++T) {
          var z = {};
          if (((z.type = K), (z.value = O[T].value), (z.valueTagClass = O[T].type), z.type in v3)) {
            if (((z.name = v3[z.type]), z.name in ED)) z.shortName = ED[z.name];
          }
          if (z.type === v3.extensionRequest) {
            z.extensions = [];
            for (var A = 0; A < z.value.length; ++A) z.extensions.push(Eq.certificateExtensionFromAsn1(z.value[A]));
          }
          _.push(z);
        }
      }
      return _;
    };
    function c6H(H, _) {
      if (typeof _ === "string") _ = { shortName: _ };
      var q = null,
        $;
      for (var K = 0; q === null && K < H.attributes.length; ++K)
        if ((($ = H.attributes[K]), _.type && _.type === $.type)) q = $;
        else if (_.name && _.name === $.name) q = $;
        else if (_.shortName && _.shortName === $.shortName) q = $;
      return q;
    }
    var xk_ = function (H, _, q) {
        var $ = {};
        if (H !== v3["RSASSA-PSS"]) return $;
        if (q)
          $ = {
            hash: { algorithmOid: v3.sha1 },
            mgf: { algorithmOid: v3.mgf1, hash: { algorithmOid: v3.sha1 } },
            saltLength: 20,
          };
        var K = {},
          O = [];
        if (!eH.validate(_, cF4, K, O)) {
          var T = Error("Cannot read RSASSA-PSS parameter block.");
          throw ((T.errors = O), T);
        }
        if (K.hashOid !== void 0) ($.hash = $.hash || {}), ($.hash.algorithmOid = eH.derToOid(K.hashOid));
        if (K.maskGenOid !== void 0)
          ($.mgf = $.mgf || {}),
            ($.mgf.algorithmOid = eH.derToOid(K.maskGenOid)),
            ($.mgf.hash = $.mgf.hash || {}),
            ($.mgf.hash.algorithmOid = eH.derToOid(K.maskGenHashOid));
        if (K.saltLength !== void 0) $.saltLength = K.saltLength.charCodeAt(0);
        return $;
      },
      mk_ = function (H) {
        switch (v3[H.signatureOid]) {
          case "sha1WithRSAEncryption":
          case "sha1WithRSASignature":
            return f$.md.sha1.create();
          case "md5WithRSAEncryption":
            return f$.md.md5.create();
          case "sha256WithRSAEncryption":
            return f$.md.sha256.create();
          case "sha384WithRSAEncryption":
            return f$.md.sha384.create();
          case "sha512WithRSAEncryption":
            return f$.md.sha512.create();
          case "RSASSA-PSS":
            return f$.md.sha256.create();
          default:
            var _ = Error("Could not compute " + H.type + " digest. Unknown signature OID.");
            throw ((_.signatureOid = H.signatureOid), _);
        }
      },
      U97 = function (H) {
        var _ = H.certificate,
          q;
        switch (_.signatureOid) {
          case v3.sha1WithRSAEncryption:
          case v3.sha1WithRSASignature:
            break;
          case v3["RSASSA-PSS"]:
            var $, K;
            if ((($ = v3[_.signatureParameters.mgf.hash.algorithmOid]), $ === void 0 || f$.md[$] === void 0)) {
              var O = Error("Unsupported MGF hash function.");
              throw ((O.oid = _.signatureParameters.mgf.hash.algorithmOid), (O.name = $), O);
            }
            if (((K = v3[_.signatureParameters.mgf.algorithmOid]), K === void 0 || f$.mgf[K] === void 0)) {
              var O = Error("Unsupported MGF function.");
              throw ((O.oid = _.signatureParameters.mgf.algorithmOid), (O.name = K), O);
            }
            if (
              ((K = f$.mgf[K].create(f$.md[$].create())),
              ($ = v3[_.signatureParameters.hash.algorithmOid]),
              $ === void 0 || f$.md[$] === void 0)
            ) {
              var O = Error("Unsupported RSASSA-PSS hash function.");
              throw ((O.oid = _.signatureParameters.hash.algorithmOid), (O.name = $), O);
            }
            q = f$.pss.create(f$.md[$].create(), K, _.signatureParameters.saltLength);
            break;
        }
        return _.publicKey.verify(H.md.digest().getBytes(), H.signature, q);
      };
    Eq.certificateFromPem = function (H, _, q) {
      var $ = f$.pem.decode(H)[0];
      if ($.type !== "CERTIFICATE" && $.type !== "X509 CERTIFICATE" && $.type !== "TRUSTED CERTIFICATE") {
        var K = Error(
          'Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".',
        );
        throw ((K.headerType = $.type), K);
      }
      if ($.procType && $.procType.type === "ENCRYPTED")
        throw Error("Could not convert certificate from PEM; PEM is encrypted.");
      var O = eH.fromDer($.body, q);
      return Eq.certificateFromAsn1(O, _);
    };
    Eq.certificateToPem = function (H, _) {
      var q = { type: "CERTIFICATE", body: eH.toDer(Eq.certificateToAsn1(H)).getBytes() };
      return f$.pem.encode(q, { maxline: _ });
    };
    Eq.publicKeyFromPem = function (H) {
      var _ = f$.pem.decode(H)[0];
      if (_.type !== "PUBLIC KEY" && _.type !== "RSA PUBLIC KEY") {
        var q = Error(
          'Could not convert public key from PEM; PEM header type is not "PUBLIC KEY" or "RSA PUBLIC KEY".',
        );
        throw ((q.headerType = _.type), q);
      }
      if (_.procType && _.procType.type === "ENCRYPTED")
        throw Error("Could not convert public key from PEM; PEM is encrypted.");
      var $ = eH.fromDer(_.body);
      return Eq.publicKeyFromAsn1($);
    };
    Eq.publicKeyToPem = function (H, _) {
      var q = { type: "PUBLIC KEY", body: eH.toDer(Eq.publicKeyToAsn1(H)).getBytes() };
      return f$.pem.encode(q, { maxline: _ });
    };
    Eq.publicKeyToRSAPublicKeyPem = function (H, _) {
      var q = { type: "RSA PUBLIC KEY", body: eH.toDer(Eq.publicKeyToRSAPublicKey(H)).getBytes() };
      return f$.pem.encode(q, { maxline: _ });
    };
    Eq.getPublicKeyFingerprint = function (H, _) {
      _ = _ || {};
      var q = _.md || f$.md.sha1.create(),
        $ = _.type || "RSAPublicKey",
        K;
      switch ($) {
        case "RSAPublicKey":
          K = eH.toDer(Eq.publicKeyToRSAPublicKey(H)).getBytes();
          break;
        case "SubjectPublicKeyInfo":
          K = eH.toDer(Eq.publicKeyToAsn1(H)).getBytes();
          break;
        default:
          throw Error('Unknown fingerprint type "' + _.type + '".');
      }
      q.start(), q.update(K);
      var O = q.digest();
      if (_.encoding === "hex") {
        var T = O.toHex();
        if (_.delimiter) return T.match(/.{2}/g).join(_.delimiter);
        return T;
      } else if (_.encoding === "binary") return O.getBytes();
      else if (_.encoding) throw Error('Unknown encoding "' + _.encoding + '".');
      return O;
    };
    Eq.certificationRequestFromPem = function (H, _, q) {
      var $ = f$.pem.decode(H)[0];
      if ($.type !== "CERTIFICATE REQUEST") {
        var K = Error(
          'Could not convert certification request from PEM; PEM header type is not "CERTIFICATE REQUEST".',
        );
        throw ((K.headerType = $.type), K);
      }
      if ($.procType && $.procType.type === "ENCRYPTED")
        throw Error("Could not convert certification request from PEM; PEM is encrypted.");
      var O = eH.fromDer($.body, q);
      return Eq.certificationRequestFromAsn1(O, _);
    };
    Eq.certificationRequestToPem = function (H, _) {
      var q = { type: "CERTIFICATE REQUEST", body: eH.toDer(Eq.certificationRequestToAsn1(H)).getBytes() };
      return f$.pem.encode(q, { maxline: _ });
    };
    Eq.createCertificate = function () {
      var H = {};
      return (
        (H.version = 2),
        (H.serialNumber = "00"),
        (H.signatureOid = null),
        (H.signature = null),
        (H.siginfo = {}),
        (H.siginfo.algorithmOid = null),
        (H.validity = {}),
        (H.validity.notBefore = new Date()),
        (H.validity.notAfter = new Date()),
        (H.issuer = {}),
        (H.issuer.getField = function (_) {
          return c6H(H.issuer, _);
        }),
        (H.issuer.addField = function (_) {
          dE([_]), H.issuer.attributes.push(_);
        }),
        (H.issuer.attributes = []),
        (H.issuer.hash = null),
        (H.subject = {}),
        (H.subject.getField = function (_) {
          return c6H(H.subject, _);
        }),
        (H.subject.addField = function (_) {
          dE([_]), H.subject.attributes.push(_);
        }),
        (H.subject.attributes = []),
        (H.subject.hash = null),
        (H.extensions = []),
        (H.publicKey = null),
        (H.md = null),
        (H.setSubject = function (_, q) {
          if ((dE(_), (H.subject.attributes = _), delete H.subject.uniqueId, q)) H.subject.uniqueId = q;
          H.subject.hash = null;
        }),
        (H.setIssuer = function (_, q) {
          if ((dE(_), (H.issuer.attributes = _), delete H.issuer.uniqueId, q)) H.issuer.uniqueId = q;
          H.issuer.hash = null;
        }),
        (H.setExtensions = function (_) {
          for (var q = 0; q < _.length; ++q) Q97(_[q], { cert: H });
          H.extensions = _;
        }),
        (H.getExtension = function (_) {
          if (typeof _ === "string") _ = { name: _ };
          var q = null,
            $;
          for (var K = 0; q === null && K < H.extensions.length; ++K)
            if ((($ = H.extensions[K]), _.id && $.id === _.id)) q = $;
            else if (_.name && $.name === _.name) q = $;
          return q;
        }),
        (H.sign = function (_, q) {
          H.md = q || f$.md.sha1.create();
          var $ = v3[H.md.algorithm + "WithRSAEncryption"];
          if (!$) {
            var K = Error("Could not compute certificate digest. Unknown message digest algorithm OID.");
            throw ((K.algorithm = H.md.algorithm), K);
          }
          (H.signatureOid = H.siginfo.algorithmOid = $), (H.tbsCertificate = Eq.getTBSCertificate(H));
          var O = eH.toDer(H.tbsCertificate);
          H.md.update(O.getBytes()), (H.signature = _.sign(H.md));
        }),
        (H.verify = function (_) {
          var q = !1;
          if (!H.issued(_)) {
            var $ = _.issuer,
              K = H.subject,
              O = Error(
                "The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject.",
              );
            throw ((O.expectedIssuer = K.attributes), (O.actualIssuer = $.attributes), O);
          }
          var T = _.md;
          if (T === null) {
            T = mk_({ signatureOid: _.signatureOid, type: "certificate" });
            var z = _.tbsCertificate || Eq.getTBSCertificate(_),
              A = eH.toDer(z);
            T.update(A.getBytes());
          }
          if (T !== null) q = U97({ certificate: H, md: T, signature: _.signature });
          return q;
        }),
        (H.isIssuer = function (_) {
          var q = !1,
            $ = H.issuer,
            K = _.subject;
          if ($.hash && K.hash) q = $.hash === K.hash;
          else if ($.attributes.length === K.attributes.length) {
            q = !0;
            var O, T;
            for (var z = 0; q && z < $.attributes.length; ++z)
              if (((O = $.attributes[z]), (T = K.attributes[z]), O.type !== T.type || O.value !== T.value)) q = !1;
          }
          return q;
        }),
        (H.issued = function (_) {
          return _.isIssuer(H);
        }),
        (H.generateSubjectKeyIdentifier = function () {
          return Eq.getPublicKeyFingerprint(H.publicKey, { type: "RSAPublicKey" });
        }),
        (H.verifySubjectKeyIdentifier = function () {
          var _ = v3.subjectKeyIdentifier;
          for (var q = 0; q < H.extensions.length; ++q) {
            var $ = H.extensions[q];
            if ($.id === _) {
              var K = H.generateSubjectKeyIdentifier().getBytes();
              return f$.util.hexToBytes($.subjectKeyIdentifier) === K;
            }
          }
          return !1;
        }),
        H
      );
    };
    Eq.certificateFromAsn1 = function (H, _) {
      var q = {},
        $ = [];
      if (!eH.validate(H, dF4, q, $)) {
        var K = Error("Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.");
        throw ((K.errors = $), K);
      }
      var O = eH.derToOid(q.publicKeyOid);
      if (O !== Eq.oids.rsaEncryption) throw Error("Cannot read public key. OID is not RSA.");
      var T = Eq.createCertificate();
      T.version = q.certVersion ? q.certVersion.charCodeAt(0) : 0;
      var z = f$.util.createBuffer(q.certSerialNumber);
      (T.serialNumber = z.toHex()),
        (T.signatureOid = f$.asn1.derToOid(q.certSignatureOid)),
        (T.signatureParameters = xk_(T.signatureOid, q.certSignatureParams, !0)),
        (T.siginfo.algorithmOid = f$.asn1.derToOid(q.certinfoSignatureOid)),
        (T.siginfo.parameters = xk_(T.siginfo.algorithmOid, q.certinfoSignatureParams, !1)),
        (T.signature = q.certSignature);
      var A = [];
      if (q.certValidity1UTCTime !== void 0) A.push(eH.utcTimeToDate(q.certValidity1UTCTime));
      if (q.certValidity2GeneralizedTime !== void 0) A.push(eH.generalizedTimeToDate(q.certValidity2GeneralizedTime));
      if (q.certValidity3UTCTime !== void 0) A.push(eH.utcTimeToDate(q.certValidity3UTCTime));
      if (q.certValidity4GeneralizedTime !== void 0) A.push(eH.generalizedTimeToDate(q.certValidity4GeneralizedTime));
      if (A.length > 2)
        throw Error(
          "Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate.",
        );
      if (A.length < 2)
        throw Error(
          "Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime.",
        );
      if (((T.validity.notBefore = A[0]), (T.validity.notAfter = A[1]), (T.tbsCertificate = q.tbsCertificate), _)) {
        T.md = mk_({ signatureOid: T.signatureOid, type: "certificate" });
        var f = eH.toDer(T.tbsCertificate);
        T.md.update(f.getBytes());
      }
      var w = f$.md.sha1.create(),
        Y = eH.toDer(q.certIssuer);
      if (
        (w.update(Y.getBytes()),
        (T.issuer.getField = function (M) {
          return c6H(T.issuer, M);
        }),
        (T.issuer.addField = function (M) {
          dE([M]), T.issuer.attributes.push(M);
        }),
        (T.issuer.attributes = Eq.RDNAttributesAsArray(q.certIssuer)),
        q.certIssuerUniqueId)
      )
        T.issuer.uniqueId = q.certIssuerUniqueId;
      T.issuer.hash = w.digest().toHex();
      var D = f$.md.sha1.create(),
        j = eH.toDer(q.certSubject);
      if (
        (D.update(j.getBytes()),
        (T.subject.getField = function (M) {
          return c6H(T.subject, M);
        }),
        (T.subject.addField = function (M) {
          dE([M]), T.subject.attributes.push(M);
        }),
        (T.subject.attributes = Eq.RDNAttributesAsArray(q.certSubject)),
        q.certSubjectUniqueId)
      )
        T.subject.uniqueId = q.certSubjectUniqueId;
      if (((T.subject.hash = D.digest().toHex()), q.certExtensions))
        T.extensions = Eq.certificateExtensionsFromAsn1(q.certExtensions);
      else T.extensions = [];
      return (T.publicKey = Eq.publicKeyFromAsn1(q.subjectPublicKeyInfo)), T;
    };
    Eq.certificateExtensionsFromAsn1 = function (H) {
      var _ = [];
      for (var q = 0; q < H.value.length; ++q) {
        var $ = H.value[q];
        for (var K = 0; K < $.value.length; ++K) _.push(Eq.certificateExtensionFromAsn1($.value[K]));
      }
      return _;
    };
    Eq.certificateExtensionFromAsn1 = function (H) {
      var _ = {};
      if (((_.id = eH.derToOid(H.value[0].value)), (_.critical = !1), H.value[1].type === eH.Type.BOOLEAN))
        (_.critical = H.value[1].value.charCodeAt(0) !== 0), (_.value = H.value[2].value);
      else _.value = H.value[1].value;
      if (_.id in v3) {
        if (((_.name = v3[_.id]), _.name === "keyUsage")) {
          var q = eH.fromDer(_.value),
            $ = 0,
            K = 0;
          if (q.value.length > 1) ($ = q.value.charCodeAt(1)), (K = q.value.length > 2 ? q.value.charCodeAt(2) : 0);
          (_.digitalSignature = ($ & 128) === 128),
            (_.nonRepudiation = ($ & 64) === 64),
            (_.keyEncipherment = ($ & 32) === 32),
            (_.dataEncipherment = ($ & 16) === 16),
            (_.keyAgreement = ($ & 8) === 8),
            (_.keyCertSign = ($ & 4) === 4),
            (_.cRLSign = ($ & 2) === 2),
            (_.encipherOnly = ($ & 1) === 1),
            (_.decipherOnly = (K & 128) === 128);
        } else if (_.name === "basicConstraints") {
          var q = eH.fromDer(_.value);
          if (q.value.length > 0 && q.value[0].type === eH.Type.BOOLEAN) _.cA = q.value[0].value.charCodeAt(0) !== 0;
          else _.cA = !1;
          var O = null;
          if (q.value.length > 0 && q.value[0].type === eH.Type.INTEGER) O = q.value[0].value;
          else if (q.value.length > 1) O = q.value[1].value;
          if (O !== null) _.pathLenConstraint = eH.derToInteger(O);
        } else if (_.name === "extKeyUsage") {
          var q = eH.fromDer(_.value);
          for (var T = 0; T < q.value.length; ++T) {
            var z = eH.derToOid(q.value[T].value);
            if (z in v3) _[v3[z]] = !0;
            else _[z] = !0;
          }
        } else if (_.name === "nsCertType") {
          var q = eH.fromDer(_.value),
            $ = 0;
          if (q.value.length > 1) $ = q.value.charCodeAt(1);
          (_.client = ($ & 128) === 128),
            (_.server = ($ & 64) === 64),
            (_.email = ($ & 32) === 32),
            (_.objsign = ($ & 16) === 16),
            (_.reserved = ($ & 8) === 8),
            (_.sslCA = ($ & 4) === 4),
            (_.emailCA = ($ & 2) === 2),
            (_.objCA = ($ & 1) === 1);
        } else if (_.name === "subjectAltName" || _.name === "issuerAltName") {
          _.altNames = [];
          var A,
            q = eH.fromDer(_.value);
          for (var f = 0; f < q.value.length; ++f) {
            A = q.value[f];
            var w = { type: A.type, value: A.value };
            switch ((_.altNames.push(w), A.type)) {
              case 1:
              case 2:
              case 6:
                break;
              case 7:
                w.ip = f$.util.bytesToIP(A.value);
                break;
              case 8:
                w.oid = eH.derToOid(A.value);
                break;
              default:
            }
          }
        } else if (_.name === "subjectKeyIdentifier") {
          var q = eH.fromDer(_.value);
          _.subjectKeyIdentifier = f$.util.bytesToHex(q.value);
        }
      }
      return _;
    };
    Eq.certificationRequestFromAsn1 = function (H, _) {
      var q = {},
        $ = [];
      if (!eH.validate(H, UF4, q, $)) {
        var K = Error("Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.");
        throw ((K.errors = $), K);
      }
      var O = eH.derToOid(q.publicKeyOid);
      if (O !== Eq.oids.rsaEncryption) throw Error("Cannot read public key. OID is not RSA.");
      var T = Eq.createCertificationRequest();
      if (
        ((T.version = q.csrVersion ? q.csrVersion.charCodeAt(0) : 0),
        (T.signatureOid = f$.asn1.derToOid(q.csrSignatureOid)),
        (T.signatureParameters = xk_(T.signatureOid, q.csrSignatureParams, !0)),
        (T.siginfo.algorithmOid = f$.asn1.derToOid(q.csrSignatureOid)),
        (T.siginfo.parameters = xk_(T.siginfo.algorithmOid, q.csrSignatureParams, !1)),
        (T.signature = q.csrSignature),
        (T.certificationRequestInfo = q.certificationRequestInfo),
        _)
      ) {
        T.md = mk_({ signatureOid: T.signatureOid, type: "certification request" });
        var z = eH.toDer(T.certificationRequestInfo);
        T.md.update(z.getBytes());
      }
      var A = f$.md.sha1.create();
      return (
        (T.subject.getField = function (f) {
          return c6H(T.subject, f);
        }),
        (T.subject.addField = function (f) {
          dE([f]), T.subject.attributes.push(f);
        }),
        (T.subject.attributes = Eq.RDNAttributesAsArray(q.certificationRequestInfoSubject, A)),
        (T.subject.hash = A.digest().toHex()),
        (T.publicKey = Eq.publicKeyFromAsn1(q.subjectPublicKeyInfo)),
        (T.getAttribute = function (f) {
          return c6H(T, f);
        }),
        (T.addAttribute = function (f) {
          dE([f]), T.attributes.push(f);
        }),
        (T.attributes = Eq.CRIAttributesAsArray(q.certificationRequestInfoAttributes || [])),
        T
      );
    };
    Eq.createCertificationRequest = function () {
      var H = {};
      return (
        (H.version = 0),
        (H.signatureOid = null),
        (H.signature = null),
        (H.siginfo = {}),
        (H.siginfo.algorithmOid = null),
        (H.subject = {}),
        (H.subject.getField = function (_) {
          return c6H(H.subject, _);
        }),
        (H.subject.addField = function (_) {
          dE([_]), H.subject.attributes.push(_);
        }),
        (H.subject.attributes = []),
        (H.subject.hash = null),
        (H.publicKey = null),
        (H.attributes = []),
        (H.getAttribute = function (_) {
          return c6H(H, _);
        }),
        (H.addAttribute = function (_) {
          dE([_]), H.attributes.push(_);
        }),
        (H.md = null),
        (H.setSubject = function (_) {
          dE(_), (H.subject.attributes = _), (H.subject.hash = null);
        }),
        (H.setAttributes = function (_) {
          dE(_), (H.attributes = _);
        }),
        (H.sign = function (_, q) {
          H.md = q || f$.md.sha1.create();
          var $ = v3[H.md.algorithm + "WithRSAEncryption"];
          if (!$) {
            var K = Error("Could not compute certification request digest. Unknown message digest algorithm OID.");
            throw ((K.algorithm = H.md.algorithm), K);
          }
          (H.signatureOid = H.siginfo.algorithmOid = $),
            (H.certificationRequestInfo = Eq.getCertificationRequestInfo(H));
          var O = eH.toDer(H.certificationRequestInfo);
          H.md.update(O.getBytes()), (H.signature = _.sign(H.md));
        }),
        (H.verify = function () {
          var _ = !1,
            q = H.md;
          if (q === null) {
            q = mk_({ signatureOid: H.signatureOid, type: "certification request" });
            var $ = H.certificationRequestInfo || Eq.getCertificationRequestInfo(H),
              K = eH.toDer($);
            q.update(K.getBytes());
          }
          if (q !== null) _ = U97({ certificate: H, md: q, signature: H.signature });
          return _;
        }),
        H
      );
    };
    function SRH(H) {
      var _ = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []),
        q,
        $,
        K = H.attributes;
      for (var O = 0; O < K.length; ++O) {
        q = K[O];
        var T = q.value,
          z = eH.Type.PRINTABLESTRING;
        if ("valueTagClass" in q) {
          if (((z = q.valueTagClass), z === eH.Type.UTF8)) T = f$.util.encodeUtf8(T);
        }
        ($ = eH.create(eH.Class.UNIVERSAL, eH.Type.SET, !0, [
          eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
            eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(q.type).getBytes()),
            eH.create(eH.Class.UNIVERSAL, z, !1, T),
          ]),
        ])),
          _.value.push($);
      }
      return _;
    }
    function dE(H) {
      var _;
      for (var q = 0; q < H.length; ++q) {
        if (((_ = H[q]), typeof _.name > "u")) {
          if (_.type && _.type in Eq.oids) _.name = Eq.oids[_.type];
          else if (_.shortName && _.shortName in ED) _.name = Eq.oids[ED[_.shortName]];
        }
        if (typeof _.type > "u")
          if (_.name && _.name in Eq.oids) _.type = Eq.oids[_.name];
          else {
            var $ = Error("Attribute type not specified.");
            throw (($.attribute = _), $);
          }
        if (typeof _.shortName > "u") {
          if (_.name && _.name in ED) _.shortName = ED[_.name];
        }
        if (_.type === v3.extensionRequest) {
          if (((_.valueConstructed = !0), (_.valueTagClass = eH.Type.SEQUENCE), !_.value && _.extensions)) {
            _.value = [];
            for (var K = 0; K < _.extensions.length; ++K)
              _.value.push(Eq.certificateExtensionToAsn1(Q97(_.extensions[K])));
          }
        }
        if (typeof _.value > "u") {
          var $ = Error("Attribute value not specified.");
          throw (($.attribute = _), $);
        }
      }
    }
    function Q97(H, _) {
      if (((_ = _ || {}), typeof H.name > "u")) {
        if (H.id && H.id in Eq.oids) H.name = Eq.oids[H.id];
      }
      if (typeof H.id > "u")
        if (H.name && H.name in Eq.oids) H.id = Eq.oids[H.name];
        else {
          var q = Error("Extension ID not specified.");
          throw ((q.extension = H), q);
        }
      if (typeof H.value < "u") return H;
      if (H.name === "keyUsage") {
        var $ = 0,
          K = 0,
          O = 0;
        if (H.digitalSignature) (K |= 128), ($ = 7);
        if (H.nonRepudiation) (K |= 64), ($ = 6);
        if (H.keyEncipherment) (K |= 32), ($ = 5);
        if (H.dataEncipherment) (K |= 16), ($ = 4);
        if (H.keyAgreement) (K |= 8), ($ = 3);
        if (H.keyCertSign) (K |= 4), ($ = 2);
        if (H.cRLSign) (K |= 2), ($ = 1);
        if (H.encipherOnly) (K |= 1), ($ = 0);
        if (H.decipherOnly) (O |= 128), ($ = 7);
        var T = String.fromCharCode($);
        if (O !== 0) T += String.fromCharCode(K) + String.fromCharCode(O);
        else if (K !== 0) T += String.fromCharCode(K);
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, T);
      } else if (H.name === "basicConstraints") {
        if (((H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [])), H.cA))
          H.value.value.push(eH.create(eH.Class.UNIVERSAL, eH.Type.BOOLEAN, !1, String.fromCharCode(255)));
        if ("pathLenConstraint" in H)
          H.value.value.push(
            eH.create(eH.Class.UNIVERSAL, eH.Type.INTEGER, !1, eH.integerToDer(H.pathLenConstraint).getBytes()),
          );
      } else if (H.name === "extKeyUsage") {
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
        var z = H.value.value;
        for (var A in H) {
          if (H[A] !== !0) continue;
          if (A in v3) z.push(eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(v3[A]).getBytes()));
          else if (A.indexOf(".") !== -1)
            z.push(eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(A).getBytes()));
        }
      } else if (H.name === "nsCertType") {
        var $ = 0,
          K = 0;
        if (H.client) (K |= 128), ($ = 7);
        if (H.server) (K |= 64), ($ = 6);
        if (H.email) (K |= 32), ($ = 5);
        if (H.objsign) (K |= 16), ($ = 4);
        if (H.reserved) (K |= 8), ($ = 3);
        if (H.sslCA) (K |= 4), ($ = 2);
        if (H.emailCA) (K |= 2), ($ = 1);
        if (H.objCA) (K |= 1), ($ = 0);
        var T = String.fromCharCode($);
        if (K !== 0) T += String.fromCharCode(K);
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, T);
      } else if (H.name === "subjectAltName" || H.name === "issuerAltName") {
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
        var f;
        for (var w = 0; w < H.altNames.length; ++w) {
          f = H.altNames[w];
          var T = f.value;
          if (f.type === 7 && f.ip) {
            if (((T = f$.util.bytesFromIP(f.ip)), T === null)) {
              var q = Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');
              throw ((q.extension = H), q);
            }
          } else if (f.type === 8)
            if (f.oid) T = eH.oidToDer(eH.oidToDer(f.oid));
            else T = eH.oidToDer(T);
          H.value.value.push(eH.create(eH.Class.CONTEXT_SPECIFIC, f.type, !1, T));
        }
      } else if (H.name === "nsComment" && _.cert) {
        if (!/^[\x00-\x7F]*$/.test(H.comment) || H.comment.length < 1 || H.comment.length > 128)
          throw Error('Invalid "nsComment" content.');
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.IA5STRING, !1, H.comment);
      } else if (H.name === "subjectKeyIdentifier" && _.cert) {
        var Y = _.cert.generateSubjectKeyIdentifier();
        (H.subjectKeyIdentifier = Y.toHex()),
          (H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.OCTETSTRING, !1, Y.getBytes()));
      } else if (H.name === "authorityKeyIdentifier" && _.cert) {
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
        var z = H.value.value;
        if (H.keyIdentifier) {
          var D = H.keyIdentifier === !0 ? _.cert.generateSubjectKeyIdentifier().getBytes() : H.keyIdentifier;
          z.push(eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !1, D));
        }
        if (H.authorityCertIssuer) {
          var j = [
            eH.create(eH.Class.CONTEXT_SPECIFIC, 4, !0, [
              SRH(H.authorityCertIssuer === !0 ? _.cert.issuer : H.authorityCertIssuer),
            ]),
          ];
          z.push(eH.create(eH.Class.CONTEXT_SPECIFIC, 1, !0, j));
        }
        if (H.serialNumber) {
          var M = f$.util.hexToBytes(H.serialNumber === !0 ? _.cert.serialNumber : H.serialNumber);
          z.push(eH.create(eH.Class.CONTEXT_SPECIFIC, 2, !1, M));
        }
      } else if (H.name === "cRLDistributionPoints") {
        H.value = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
        var z = H.value.value,
          J = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []),
          P = eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !0, []),
          f;
        for (var w = 0; w < H.altNames.length; ++w) {
          f = H.altNames[w];
          var T = f.value;
          if (f.type === 7 && f.ip) {
            if (((T = f$.util.bytesFromIP(f.ip)), T === null)) {
              var q = Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');
              throw ((q.extension = H), q);
            }
          } else if (f.type === 8)
            if (f.oid) T = eH.oidToDer(eH.oidToDer(f.oid));
            else T = eH.oidToDer(T);
          P.value.push(eH.create(eH.Class.CONTEXT_SPECIFIC, f.type, !1, T));
        }
        J.value.push(eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !0, [P])), z.push(J);
      }
      if (typeof H.value > "u") {
        var q = Error("Extension value not specified.");
        throw ((q.extension = H), q);
      }
      return H;
    }
    function XC6(H, _) {
      switch (H) {
        case v3["RSASSA-PSS"]:
          var q = [];
          if (_.hash.algorithmOid !== void 0)
            q.push(
              eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !0, [
                eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
                  eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(_.hash.algorithmOid).getBytes()),
                  eH.create(eH.Class.UNIVERSAL, eH.Type.NULL, !1, ""),
                ]),
              ]),
            );
          if (_.mgf.algorithmOid !== void 0)
            q.push(
              eH.create(eH.Class.CONTEXT_SPECIFIC, 1, !0, [
                eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
                  eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(_.mgf.algorithmOid).getBytes()),
                  eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
                    eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(_.mgf.hash.algorithmOid).getBytes()),
                    eH.create(eH.Class.UNIVERSAL, eH.Type.NULL, !1, ""),
                  ]),
                ]),
              ]),
            );
          if (_.saltLength !== void 0)
            q.push(
              eH.create(eH.Class.CONTEXT_SPECIFIC, 2, !0, [
                eH.create(eH.Class.UNIVERSAL, eH.Type.INTEGER, !1, eH.integerToDer(_.saltLength).getBytes()),
              ]),
            );
          return eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, q);
        default:
          return eH.create(eH.Class.UNIVERSAL, eH.Type.NULL, !1, "");
      }
    }
    function QF4(H) {
      var _ = eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !0, []);
      if (H.attributes.length === 0) return _;
      var q = H.attributes;
      for (var $ = 0; $ < q.length; ++$) {
        var K = q[$],
          O = K.value,
          T = eH.Type.UTF8;
        if ("valueTagClass" in K) T = K.valueTagClass;
        if (T === eH.Type.UTF8) O = f$.util.encodeUtf8(O);
        var z = !1;
        if ("valueConstructed" in K) z = K.valueConstructed;
        var A = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
          eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(K.type).getBytes()),
          eH.create(eH.Class.UNIVERSAL, eH.Type.SET, !0, [eH.create(eH.Class.UNIVERSAL, T, z, O)]),
        ]);
        _.value.push(A);
      }
      return _;
    }
    var lF4 = new Date("1950-01-01T00:00:00Z"),
      iF4 = new Date("2050-01-01T00:00:00Z");
    function c97(H) {
      if (H >= lF4 && H < iF4) return eH.create(eH.Class.UNIVERSAL, eH.Type.UTCTIME, !1, eH.dateToUtcTime(H));
      else return eH.create(eH.Class.UNIVERSAL, eH.Type.GENERALIZEDTIME, !1, eH.dateToGeneralizedTime(H));
    }
    Eq.getTBSCertificate = function (H) {
      var _ = c97(H.validity.notBefore),
        q = c97(H.validity.notAfter),
        $ = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
          eH.create(eH.Class.CONTEXT_SPECIFIC, 0, !0, [
            eH.create(eH.Class.UNIVERSAL, eH.Type.INTEGER, !1, eH.integerToDer(H.version).getBytes()),
          ]),
          eH.create(eH.Class.UNIVERSAL, eH.Type.INTEGER, !1, f$.util.hexToBytes(H.serialNumber)),
          eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
            eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(H.siginfo.algorithmOid).getBytes()),
            XC6(H.siginfo.algorithmOid, H.siginfo.parameters),
          ]),
          SRH(H.issuer),
          eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [_, q]),
          SRH(H.subject),
          Eq.publicKeyToAsn1(H.publicKey),
        ]);
      if (H.issuer.uniqueId)
        $.value.push(
          eH.create(eH.Class.CONTEXT_SPECIFIC, 1, !0, [
            eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, String.fromCharCode(0) + H.issuer.uniqueId),
          ]),
        );
      if (H.subject.uniqueId)
        $.value.push(
          eH.create(eH.Class.CONTEXT_SPECIFIC, 2, !0, [
            eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, String.fromCharCode(0) + H.subject.uniqueId),
          ]),
        );
      if (H.extensions.length > 0) $.value.push(Eq.certificateExtensionsToAsn1(H.extensions));
      return $;
    };
    Eq.getCertificationRequestInfo = function (H) {
      var _ = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
        eH.create(eH.Class.UNIVERSAL, eH.Type.INTEGER, !1, eH.integerToDer(H.version).getBytes()),
        SRH(H.subject),
        Eq.publicKeyToAsn1(H.publicKey),
        QF4(H),
      ]);
      return _;
    };
    Eq.distinguishedNameToAsn1 = function (H) {
      return SRH(H);
    };
    Eq.certificateToAsn1 = function (H) {
      var _ = H.tbsCertificate || Eq.getTBSCertificate(H);
      return eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
        _,
        eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
          eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(H.signatureOid).getBytes()),
          XC6(H.signatureOid, H.signatureParameters),
        ]),
        eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, String.fromCharCode(0) + H.signature),
      ]);
    };
    Eq.certificateExtensionsToAsn1 = function (H) {
      var _ = eH.create(eH.Class.CONTEXT_SPECIFIC, 3, !0, []),
        q = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
      _.value.push(q);
      for (var $ = 0; $ < H.length; ++$) q.value.push(Eq.certificateExtensionToAsn1(H[$]));
      return _;
    };
    Eq.certificateExtensionToAsn1 = function (H) {
      var _ = eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, []);
      if ((_.value.push(eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(H.id).getBytes())), H.critical))
        _.value.push(eH.create(eH.Class.UNIVERSAL, eH.Type.BOOLEAN, !1, String.fromCharCode(255)));
      var q = H.value;
      if (typeof H.value !== "string") q = eH.toDer(q).getBytes();
      return _.value.push(eH.create(eH.Class.UNIVERSAL, eH.Type.OCTETSTRING, !1, q)), _;
    };
    Eq.certificationRequestToAsn1 = function (H) {
      var _ = H.certificationRequestInfo || Eq.getCertificationRequestInfo(H);
      return eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
        _,
        eH.create(eH.Class.UNIVERSAL, eH.Type.SEQUENCE, !0, [
          eH.create(eH.Class.UNIVERSAL, eH.Type.OID, !1, eH.oidToDer(H.signatureOid).getBytes()),
          XC6(H.signatureOid, H.signatureParameters),
        ]),
        eH.create(eH.Class.UNIVERSAL, eH.Type.BITSTRING, !1, String.fromCharCode(0) + H.signature),
      ]);
    };
    Eq.createCaStore = function (H) {
      var _ = { certs: {} };
      (_.getIssuer = function (T) {
        var z = q(T.issuer);
        return z;
      }),
        (_.addCertificate = function (T) {
          if (typeof T === "string") T = f$.pki.certificateFromPem(T);
          if (($(T.subject), !_.hasCertificate(T)))
            if (T.subject.hash in _.certs) {
              var z = _.certs[T.subject.hash];
              if (!f$.util.isArray(z)) z = [z];
              z.push(T), (_.certs[T.subject.hash] = z);
            } else _.certs[T.subject.hash] = T;
        }),
        (_.hasCertificate = function (T) {
          if (typeof T === "string") T = f$.pki.certificateFromPem(T);
          var z = q(T.subject);
          if (!z) return !1;
          if (!f$.util.isArray(z)) z = [z];
          var A = eH.toDer(Eq.certificateToAsn1(T)).getBytes();
          for (var f = 0; f < z.length; ++f) {
            var w = eH.toDer(Eq.certificateToAsn1(z[f])).getBytes();
            if (A === w) return !0;
          }
          return !1;
        }),
        (_.listAllCertificates = function () {
          var T = [];
          for (var z in _.certs)
            if (_.certs.hasOwnProperty(z)) {
              var A = _.certs[z];
              if (!f$.util.isArray(A)) T.push(A);
              else for (var f = 0; f < A.length; ++f) T.push(A[f]);
            }
          return T;
        }),
        (_.removeCertificate = function (T) {
          var z;
          if (typeof T === "string") T = f$.pki.certificateFromPem(T);
          if (($(T.subject), !_.hasCertificate(T))) return null;
          var A = q(T.subject);
          if (!f$.util.isArray(A)) return (z = _.certs[T.subject.hash]), delete _.certs[T.subject.hash], z;
          var f = eH.toDer(Eq.certificateToAsn1(T)).getBytes();
          for (var w = 0; w < A.length; ++w) {
            var Y = eH.toDer(Eq.certificateToAsn1(A[w])).getBytes();
            if (f === Y) (z = A[w]), A.splice(w, 1);
          }
          if (A.length === 0) delete _.certs[T.subject.hash];
          return z;
        });
      function q(T) {
        return $(T), _.certs[T.hash] || null;
      }
      function $(T) {
        if (!T.hash) {
          var z = f$.md.sha1.create();
          (T.attributes = Eq.RDNAttributesAsArray(SRH(T), z)), (T.hash = z.digest().toHex());
        }
      }
      if (H)
        for (var K = 0; K < H.length; ++K) {
          var O = H[K];
          _.addCertificate(O);
        }
      return _;
    };
    Eq.certificateError = {
      bad_certificate: "forge.pki.BadCertificate",
      unsupported_certificate: "forge.pki.UnsupportedCertificate",
      certificate_revoked: "forge.pki.CertificateRevoked",
      certificate_expired: "forge.pki.CertificateExpired",
      certificate_unknown: "forge.pki.CertificateUnknown",
      unknown_ca: "forge.pki.UnknownCertificateAuthority",
    };
    Eq.verifyCertificateChain = function (H, _, q) {
      if (typeof q === "function") q = { verify: q };
      (q = q || {}), (_ = _.slice(0));
      var $ = _.slice(0),
        K = q.validityCheckDate;
      if (typeof K > "u") K = new Date();
      var O = !0,
        T = null,
        z = 0;
      do {
        var A = _.shift(),
          f = null,
          w = !1;
        if (K) {
          if (K < A.validity.notBefore || K > A.validity.notAfter)
            T = {
              message: "Certificate is not valid yet or has expired.",
              error: Eq.certificateError.certificate_expired,
              notBefore: A.validity.notBefore,
              notAfter: A.validity.notAfter,
              now: K,
            };
        }
        if (T === null) {
          if (((f = _[0] || H.getIssuer(A)), f === null)) {
            if (A.isIssuer(A)) (w = !0), (f = A);
          }
          if (f) {
            var Y = f;
            if (!f$.util.isArray(Y)) Y = [Y];
            var D = !1;
            while (!D && Y.length > 0) {
              f = Y.shift();
              try {
                D = f.verify(A);
              } catch (k) {}
            }
            if (!D) T = { message: "Certificate signature is invalid.", error: Eq.certificateError.bad_certificate };
          }
          if (T === null && (!f || w) && !H.hasCertificate(A))
            T = { message: "Certificate is not trusted.", error: Eq.certificateError.unknown_ca };
        }
        if (T === null && f && !A.isIssuer(f))
          T = { message: "Certificate issuer is invalid.", error: Eq.certificateError.bad_certificate };
        if (T === null) {
          var j = { keyUsage: !0, basicConstraints: !0 };
          for (var M = 0; T === null && M < A.extensions.length; ++M) {
            var J = A.extensions[M];
            if (J.critical && !(J.name in j))
              T = {
                message: "Certificate has an unsupported critical extension.",
                error: Eq.certificateError.unsupported_certificate,
              };
          }
        }
        if (T === null && (!O || (_.length === 0 && (!f || w)))) {
          var P = A.getExtension("basicConstraints"),
            X = A.getExtension("keyUsage");
          if (X !== null) {
            if (!X.keyCertSign || P === null)
              T = {
                message:
                  "Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",
                error: Eq.certificateError.bad_certificate,
              };
          }
          if (T === null && P !== null && !P.cA)
            T = {
              message: "Certificate basicConstraints indicates the certificate is not a CA.",
              error: Eq.certificateError.bad_certificate,
            };
          if (T === null && X !== null && "pathLenConstraint" in P) {
            var R = z - 1;
            if (R > P.pathLenConstraint)
              T = {
                message: "Certificate basicConstraints pathLenConstraint violated.",
                error: Eq.certificateError.bad_certificate,
              };
          }
        }
        var W = T === null ? !0 : T.error,
          Z = q.verify ? q.verify(W, z, $) : W;
        if (Z === !0) T = null;
        else {
          if (W === !0)
            T = { message: "The application rejected the certificate.", error: Eq.certificateError.bad_certificate };
          if (Z || Z === 0) {
            if (typeof Z === "object" && !f$.util.isArray(Z)) {
              if (Z.message) T.message = Z.message;
              if (Z.error) T.error = Z.error;
            } else if (typeof Z === "string") T.error = Z;
          }
          throw T;
        }
        (O = !1), ++z;
      } while (_.length > 0);
      return !0;
    };
  });

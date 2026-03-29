  var GC6 = d((Ti3, n97) => {
    var lA = XK();
    Kx();
    LRH();
    B6H();
    JC6();
    MC6();
    pE();
    ulH();
    hRH();
    F3();
    pk_();
    var { asn1: b_, pki: T5 } = lA,
      mlH = (n97.exports = lA.pkcs12 = lA.pkcs12 || {}),
      i97 = {
        name: "ContentInfo",
        tagClass: b_.Class.UNIVERSAL,
        type: b_.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "ContentInfo.contentType",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.OID,
            constructed: !1,
            capture: "contentType",
          },
          { name: "ContentInfo.content", tagClass: b_.Class.CONTEXT_SPECIFIC, constructed: !0, captureAsn1: "content" },
        ],
      },
      nF4 = {
        name: "PFX",
        tagClass: b_.Class.UNIVERSAL,
        type: b_.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "PFX.version",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.INTEGER,
            constructed: !1,
            capture: "version",
          },
          i97,
          {
            name: "PFX.macData",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.SEQUENCE,
            constructed: !0,
            optional: !0,
            captureAsn1: "mac",
            value: [
              {
                name: "PFX.macData.mac",
                tagClass: b_.Class.UNIVERSAL,
                type: b_.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "PFX.macData.mac.digestAlgorithm",
                    tagClass: b_.Class.UNIVERSAL,
                    type: b_.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "PFX.macData.mac.digestAlgorithm.algorithm",
                        tagClass: b_.Class.UNIVERSAL,
                        type: b_.Type.OID,
                        constructed: !1,
                        capture: "macAlgorithm",
                      },
                      {
                        name: "PFX.macData.mac.digestAlgorithm.parameters",
                        optional: !0,
                        tagClass: b_.Class.UNIVERSAL,
                        captureAsn1: "macAlgorithmParameters",
                      },
                    ],
                  },
                  {
                    name: "PFX.macData.mac.digest",
                    tagClass: b_.Class.UNIVERSAL,
                    type: b_.Type.OCTETSTRING,
                    constructed: !1,
                    capture: "macDigest",
                  },
                ],
              },
              {
                name: "PFX.macData.macSalt",
                tagClass: b_.Class.UNIVERSAL,
                type: b_.Type.OCTETSTRING,
                constructed: !1,
                capture: "macSalt",
              },
              {
                name: "PFX.macData.iterations",
                tagClass: b_.Class.UNIVERSAL,
                type: b_.Type.INTEGER,
                constructed: !1,
                optional: !0,
                capture: "macIterations",
              },
            ],
          },
        ],
      },
      rF4 = {
        name: "SafeBag",
        tagClass: b_.Class.UNIVERSAL,
        type: b_.Type.SEQUENCE,
        constructed: !0,
        value: [
          { name: "SafeBag.bagId", tagClass: b_.Class.UNIVERSAL, type: b_.Type.OID, constructed: !1, capture: "bagId" },
          { name: "SafeBag.bagValue", tagClass: b_.Class.CONTEXT_SPECIFIC, constructed: !0, captureAsn1: "bagValue" },
          {
            name: "SafeBag.bagAttributes",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.SET,
            constructed: !0,
            optional: !0,
            capture: "bagAttributes",
          },
        ],
      },
      oF4 = {
        name: "Attribute",
        tagClass: b_.Class.UNIVERSAL,
        type: b_.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "Attribute.attrId",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.OID,
            constructed: !1,
            capture: "oid",
          },
          {
            name: "Attribute.attrValues",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.SET,
            constructed: !0,
            capture: "values",
          },
        ],
      },
      aF4 = {
        name: "CertBag",
        tagClass: b_.Class.UNIVERSAL,
        type: b_.Type.SEQUENCE,
        constructed: !0,
        value: [
          {
            name: "CertBag.certId",
            tagClass: b_.Class.UNIVERSAL,
            type: b_.Type.OID,
            constructed: !1,
            capture: "certId",
          },
          {
            name: "CertBag.certValue",
            tagClass: b_.Class.CONTEXT_SPECIFIC,
            constructed: !0,
            value: [
              {
                name: "CertBag.certValue[0]",
                tagClass: b_.Class.UNIVERSAL,
                type: b_.Class.OCTETSTRING,
                constructed: !1,
                capture: "cert",
              },
            ],
          },
        ],
      };
    function xlH(H, _, q, $) {
      var K = [];
      for (var O = 0; O < H.length; O++)
        for (var T = 0; T < H[O].safeBags.length; T++) {
          var z = H[O].safeBags[T];
          if ($ !== void 0 && z.type !== $) continue;
          if (_ === null) {
            K.push(z);
            continue;
          }
          if (z.attributes[_] !== void 0 && z.attributes[_].indexOf(q) >= 0) K.push(z);
        }
      return K;
    }
    mlH.pkcs12FromAsn1 = function (H, _, q) {
      if (typeof _ === "string") (q = _), (_ = !0);
      else if (_ === void 0) _ = !0;
      var $ = {},
        K = [];
      if (!b_.validate(H, nF4, $, K)) {
        var O = Error("Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.");
        throw ((O.errors = O), O);
      }
      var T = {
        version: $.version.charCodeAt(0),
        safeContents: [],
        getBags: function (P) {
          var X = {},
            R;
          if ("localKeyId" in P) R = P.localKeyId;
          else if ("localKeyIdHex" in P) R = lA.util.hexToBytes(P.localKeyIdHex);
          if (R === void 0 && !("friendlyName" in P) && "bagType" in P)
            X[P.bagType] = xlH(T.safeContents, null, null, P.bagType);
          if (R !== void 0) X.localKeyId = xlH(T.safeContents, "localKeyId", R, P.bagType);
          if ("friendlyName" in P) X.friendlyName = xlH(T.safeContents, "friendlyName", P.friendlyName, P.bagType);
          return X;
        },
        getBagsByFriendlyName: function (P, X) {
          return xlH(T.safeContents, "friendlyName", P, X);
        },
        getBagsByLocalKeyId: function (P, X) {
          return xlH(T.safeContents, "localKeyId", P, X);
        },
      };
      if ($.version.charCodeAt(0) !== 3) {
        var O = Error("PKCS#12 PFX of version other than 3 not supported.");
        throw ((O.version = $.version.charCodeAt(0)), O);
      }
      if (b_.derToOid($.contentType) !== T5.oids.data) {
        var O = Error("Only PKCS#12 PFX in password integrity mode supported.");
        throw ((O.oid = b_.derToOid($.contentType)), O);
      }
      var z = $.content.value[0];
      if (z.tagClass !== b_.Class.UNIVERSAL || z.type !== b_.Type.OCTETSTRING)
        throw Error("PKCS#12 authSafe content data is not an OCTET STRING.");
      if (((z = WC6(z)), $.mac)) {
        var A = null,
          f = 0,
          w = b_.derToOid($.macAlgorithm);
        switch (w) {
          case T5.oids.sha1:
            (A = lA.md.sha1.create()), (f = 20);
            break;
          case T5.oids.sha256:
            (A = lA.md.sha256.create()), (f = 32);
            break;
          case T5.oids.sha384:
            (A = lA.md.sha384.create()), (f = 48);
            break;
          case T5.oids.sha512:
            (A = lA.md.sha512.create()), (f = 64);
            break;
          case T5.oids.md5:
            (A = lA.md.md5.create()), (f = 16);
            break;
        }
        if (A === null) throw Error("PKCS#12 uses unsupported MAC algorithm: " + w);
        var Y = new lA.util.ByteBuffer($.macSalt),
          D = "macIterations" in $ ? parseInt(lA.util.bytesToHex($.macIterations), 16) : 1,
          j = mlH.generateKey(q, Y, 3, D, f, A),
          M = lA.hmac.create();
        M.start(A, j), M.update(z.value);
        var J = M.getMac();
        if (J.getBytes() !== $.macDigest) throw Error("PKCS#12 MAC could not be verified. Invalid password?");
      } else if (Array.isArray(H.value) && H.value.length > 2)
        throw Error("Invalid PKCS#12. macData field present but MAC was not validated.");
      return sF4(T, z.value, _, q), T;
    };
    function WC6(H) {
      if (H.composed || H.constructed) {
        var _ = lA.util.createBuffer();
        for (var q = 0; q < H.value.length; ++q) _.putBytes(H.value[q].value);
        (H.composed = H.constructed = !1), (H.value = _.getBytes());
      }
      return H;
    }
    function sF4(H, _, q, $) {
      if (
        ((_ = b_.fromDer(_, q)),
        _.tagClass !== b_.Class.UNIVERSAL || _.type !== b_.Type.SEQUENCE || _.constructed !== !0)
      )
        throw Error("PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo");
      for (var K = 0; K < _.value.length; K++) {
        var O = _.value[K],
          T = {},
          z = [];
        if (!b_.validate(O, i97, T, z)) {
          var A = Error("Cannot read ContentInfo.");
          throw ((A.errors = z), A);
        }
        var f = { encrypted: !1 },
          w = null,
          Y = T.content.value[0];
        switch (b_.derToOid(T.contentType)) {
          case T5.oids.data:
            if (Y.tagClass !== b_.Class.UNIVERSAL || Y.type !== b_.Type.OCTETSTRING)
              throw Error("PKCS#12 SafeContents Data is not an OCTET STRING.");
            w = WC6(Y).value;
            break;
          case T5.oids.encryptedData:
            (w = tF4(Y, $)), (f.encrypted = !0);
            break;
          default:
            var A = Error("Unsupported PKCS#12 contentType.");
            throw ((A.contentType = b_.derToOid(T.contentType)), A);
        }
        (f.safeBags = eF4(w, q, $)), H.safeContents.push(f);
      }
    }
    function tF4(H, _) {
      var q = {},
        $ = [];
      if (!b_.validate(H, lA.pkcs7.asn1.encryptedDataValidator, q, $)) {
        var K = Error("Cannot read EncryptedContentInfo.");
        throw ((K.errors = $), K);
      }
      var O = b_.derToOid(q.contentType);
      if (O !== T5.oids.data) {
        var K = Error("PKCS#12 EncryptedContentInfo ContentType is not Data.");
        throw ((K.oid = O), K);
      }
      O = b_.derToOid(q.encAlgorithm);
      var T = T5.pbe.getCipher(O, q.encParameter, _),
        z = WC6(q.encryptedContentAsn1),
        A = lA.util.createBuffer(z.value);
      if ((T.update(A), !T.finish())) throw Error("Failed to decrypt PKCS#12 SafeContents.");
      return T.output.getBytes();
    }
    function eF4(H, _, q) {
      if (!_ && H.length === 0) return [];
      if (
        ((H = b_.fromDer(H, _)),
        H.tagClass !== b_.Class.UNIVERSAL || H.type !== b_.Type.SEQUENCE || H.constructed !== !0)
      )
        throw Error("PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag.");
      var $ = [];
      for (var K = 0; K < H.value.length; K++) {
        var O = H.value[K],
          T = {},
          z = [];
        if (!b_.validate(O, rF4, T, z)) {
          var A = Error("Cannot read SafeBag.");
          throw ((A.errors = z), A);
        }
        var f = { type: b_.derToOid(T.bagId), attributes: HU4(T.bagAttributes) };
        $.push(f);
        var w,
          Y,
          D = T.bagValue.value[0];
        switch (f.type) {
          case T5.oids.pkcs8ShroudedKeyBag:
            if (((D = T5.decryptPrivateKeyInfo(D, q)), D === null))
              throw Error("Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?");
          case T5.oids.keyBag:
            try {
              f.key = T5.privateKeyFromAsn1(D);
            } catch (M) {
              (f.key = null), (f.asn1 = D);
            }
            continue;
          case T5.oids.certBag:
            (w = aF4),
              (Y = function () {
                if (b_.derToOid(T.certId) !== T5.oids.x509Certificate) {
                  var M = Error("Unsupported certificate type, only X.509 supported.");
                  throw ((M.oid = b_.derToOid(T.certId)), M);
                }
                var J = b_.fromDer(T.cert, _);
                try {
                  f.cert = T5.certificateFromAsn1(J, !0);
                } catch (P) {
                  (f.cert = null), (f.asn1 = J);
                }
              });
            break;
          default:
            var A = Error("Unsupported PKCS#12 SafeBag type.");
            throw ((A.oid = f.type), A);
        }
        if (w !== void 0 && !b_.validate(D, w, T, z)) {
          var A = Error("Cannot read PKCS#12 " + w.name);
          throw ((A.errors = z), A);
        }
        Y();
      }
      return $;
    }
    function HU4(H) {
      var _ = {};
      if (H !== void 0)
        for (var q = 0; q < H.length; ++q) {
          var $ = {},
            K = [];
          if (!b_.validate(H[q], oF4, $, K)) {
            var O = Error("Cannot read PKCS#12 BagAttribute.");
            throw ((O.errors = K), O);
          }
          var T = b_.derToOid($.oid);
          if (T5.oids[T] === void 0) continue;
          _[T5.oids[T]] = [];
          for (var z = 0; z < $.values.length; ++z) _[T5.oids[T]].push($.values[z].value);
        }
      return _;
    }
    mlH.toPkcs12Asn1 = function (H, _, q, $) {
      if (
        (($ = $ || {}),
        ($.saltSize = $.saltSize || 8),
        ($.count = $.count || 2048),
        ($.algorithm = $.algorithm || $.encAlgorithm || "aes128"),
        !("useMac" in $))
      )
        $.useMac = !0;
      if (!("localKeyId" in $)) $.localKeyId = null;
      if (!("generateLocalKeyId" in $)) $.generateLocalKeyId = !0;
      var K = $.localKeyId,
        O;
      if (K !== null) K = lA.util.hexToBytes(K);
      else if ($.generateLocalKeyId)
        if (_) {
          var T = lA.util.isArray(_) ? _[0] : _;
          if (typeof T === "string") T = T5.certificateFromPem(T);
          var z = lA.md.sha1.create();
          z.update(b_.toDer(T5.certificateToAsn1(T)).getBytes()), (K = z.digest().getBytes());
        } else K = lA.random.getBytes(20);
      var A = [];
      if (K !== null)
        A.push(
          b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.localKeyId).getBytes()),
            b_.create(b_.Class.UNIVERSAL, b_.Type.SET, !0, [b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, K)]),
          ]),
        );
      if ("friendlyName" in $)
        A.push(
          b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.friendlyName).getBytes()),
            b_.create(b_.Class.UNIVERSAL, b_.Type.SET, !0, [
              b_.create(b_.Class.UNIVERSAL, b_.Type.BMPSTRING, !1, $.friendlyName),
            ]),
          ]),
        );
      if (A.length > 0) O = b_.create(b_.Class.UNIVERSAL, b_.Type.SET, !0, A);
      var f = [],
        w = [];
      if (_ !== null)
        if (lA.util.isArray(_)) w = _;
        else w = [_];
      var Y = [];
      for (var D = 0; D < w.length; ++D) {
        if (((_ = w[D]), typeof _ === "string")) _ = T5.certificateFromPem(_);
        var j = D === 0 ? O : void 0,
          M = T5.certificateToAsn1(_),
          J = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.certBag).getBytes()),
            b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [
              b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
                b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.x509Certificate).getBytes()),
                b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [
                  b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, b_.toDer(M).getBytes()),
                ]),
              ]),
            ]),
            j,
          ]);
        Y.push(J);
      }
      if (Y.length > 0) {
        var P = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, Y),
          X = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.data).getBytes()),
            b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [
              b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, b_.toDer(P).getBytes()),
            ]),
          ]);
        f.push(X);
      }
      var R = null;
      if (H !== null) {
        var W = T5.wrapRsaPrivateKey(T5.privateKeyToAsn1(H));
        if (q === null)
          R = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.keyBag).getBytes()),
            b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [W]),
            O,
          ]);
        else
          R = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.pkcs8ShroudedKeyBag).getBytes()),
            b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [T5.encryptPrivateKeyInfo(W, q, $)]),
            O,
          ]);
        var Z = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [R]),
          k = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.data).getBytes()),
            b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [
              b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, b_.toDer(Z).getBytes()),
            ]),
          ]);
        f.push(k);
      }
      var v = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, f),
        y;
      if ($.useMac) {
        var z = lA.md.sha1.create(),
          E = new lA.util.ByteBuffer(lA.random.getBytes($.saltSize)),
          S = $.count,
          H = mlH.generateKey(q, E, 3, S, 20),
          x = lA.hmac.create();
        x.start(z, H), x.update(b_.toDer(v).getBytes());
        var I = x.getMac();
        y = b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
          b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
              b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.sha1).getBytes()),
              b_.create(b_.Class.UNIVERSAL, b_.Type.NULL, !1, ""),
            ]),
            b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, I.getBytes()),
          ]),
          b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, E.getBytes()),
          b_.create(b_.Class.UNIVERSAL, b_.Type.INTEGER, !1, b_.integerToDer(S).getBytes()),
        ]);
      }
      return b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
        b_.create(b_.Class.UNIVERSAL, b_.Type.INTEGER, !1, b_.integerToDer(3).getBytes()),
        b_.create(b_.Class.UNIVERSAL, b_.Type.SEQUENCE, !0, [
          b_.create(b_.Class.UNIVERSAL, b_.Type.OID, !1, b_.oidToDer(T5.oids.data).getBytes()),
          b_.create(b_.Class.CONTEXT_SPECIFIC, 0, !0, [
            b_.create(b_.Class.UNIVERSAL, b_.Type.OCTETSTRING, !1, b_.toDer(v).getBytes()),
          ]),
        ]),
        y,
      ]);
    };
    mlH.generateKey = lA.pbe.generatePkcs12Key;
  });

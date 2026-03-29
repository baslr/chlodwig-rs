  var JC6 = d((_i3, m97) => {
    var yRH = XK();
    Kx();
    F3();
    var X7 = yRH.asn1,
      VRH = (m97.exports = yRH.pkcs7asn1 = yRH.pkcs7asn1 || {});
    yRH.pkcs7 = yRH.pkcs7 || {};
    yRH.pkcs7.asn1 = VRH;
    var u97 = {
      name: "ContentInfo",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "ContentInfo.ContentType",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.OID,
          constructed: !1,
          capture: "contentType",
        },
        {
          name: "ContentInfo.content",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 0,
          constructed: !0,
          optional: !0,
          captureAsn1: "content",
        },
      ],
    };
    VRH.contentInfoValidator = u97;
    var x97 = {
      name: "EncryptedContentInfo",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "EncryptedContentInfo.contentType",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.OID,
          constructed: !1,
          capture: "contentType",
        },
        {
          name: "EncryptedContentInfo.contentEncryptionAlgorithm",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "EncryptedContentInfo.contentEncryptionAlgorithm.algorithm",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.OID,
              constructed: !1,
              capture: "encAlgorithm",
            },
            {
              name: "EncryptedContentInfo.contentEncryptionAlgorithm.parameter",
              tagClass: X7.Class.UNIVERSAL,
              captureAsn1: "encParameter",
            },
          ],
        },
        {
          name: "EncryptedContentInfo.encryptedContent",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 0,
          capture: "encryptedContent",
          captureAsn1: "encryptedContentAsn1",
        },
      ],
    };
    VRH.envelopedDataValidator = {
      name: "EnvelopedData",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "EnvelopedData.Version",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.INTEGER,
          constructed: !1,
          capture: "version",
        },
        {
          name: "EnvelopedData.RecipientInfos",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SET,
          constructed: !0,
          captureAsn1: "recipientInfos",
        },
      ].concat(x97),
    };
    VRH.encryptedDataValidator = {
      name: "EncryptedData",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "EncryptedData.Version",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.INTEGER,
          constructed: !1,
          capture: "version",
        },
      ].concat(x97),
    };
    var pF4 = {
      name: "SignerInfo",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        { name: "SignerInfo.version", tagClass: X7.Class.UNIVERSAL, type: X7.Type.INTEGER, constructed: !1 },
        {
          name: "SignerInfo.issuerAndSerialNumber",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "SignerInfo.issuerAndSerialNumber.issuer",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.SEQUENCE,
              constructed: !0,
              captureAsn1: "issuer",
            },
            {
              name: "SignerInfo.issuerAndSerialNumber.serialNumber",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.INTEGER,
              constructed: !1,
              capture: "serial",
            },
          ],
        },
        {
          name: "SignerInfo.digestAlgorithm",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "SignerInfo.digestAlgorithm.algorithm",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.OID,
              constructed: !1,
              capture: "digestAlgorithm",
            },
            {
              name: "SignerInfo.digestAlgorithm.parameter",
              tagClass: X7.Class.UNIVERSAL,
              constructed: !1,
              captureAsn1: "digestParameter",
              optional: !0,
            },
          ],
        },
        {
          name: "SignerInfo.authenticatedAttributes",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 0,
          constructed: !0,
          optional: !0,
          capture: "authenticatedAttributes",
        },
        {
          name: "SignerInfo.digestEncryptionAlgorithm",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          capture: "signatureAlgorithm",
        },
        {
          name: "SignerInfo.encryptedDigest",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.OCTETSTRING,
          constructed: !1,
          capture: "signature",
        },
        {
          name: "SignerInfo.unauthenticatedAttributes",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 1,
          constructed: !0,
          optional: !0,
          capture: "unauthenticatedAttributes",
        },
      ],
    };
    VRH.signedDataValidator = {
      name: "SignedData",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "SignedData.Version",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.INTEGER,
          constructed: !1,
          capture: "version",
        },
        {
          name: "SignedData.DigestAlgorithms",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SET,
          constructed: !0,
          captureAsn1: "digestAlgorithms",
        },
        u97,
        {
          name: "SignedData.Certificates",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 0,
          optional: !0,
          captureAsn1: "certificates",
        },
        {
          name: "SignedData.CertificateRevocationLists",
          tagClass: X7.Class.CONTEXT_SPECIFIC,
          type: 1,
          optional: !0,
          captureAsn1: "crls",
        },
        {
          name: "SignedData.SignerInfos",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SET,
          capture: "signerInfos",
          optional: !0,
          value: [pF4],
        },
      ],
    };
    VRH.recipientInfoValidator = {
      name: "RecipientInfo",
      tagClass: X7.Class.UNIVERSAL,
      type: X7.Type.SEQUENCE,
      constructed: !0,
      value: [
        {
          name: "RecipientInfo.version",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.INTEGER,
          constructed: !1,
          capture: "version",
        },
        {
          name: "RecipientInfo.issuerAndSerial",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "RecipientInfo.issuerAndSerial.issuer",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.SEQUENCE,
              constructed: !0,
              captureAsn1: "issuer",
            },
            {
              name: "RecipientInfo.issuerAndSerial.serialNumber",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.INTEGER,
              constructed: !1,
              capture: "serial",
            },
          ],
        },
        {
          name: "RecipientInfo.keyEncryptionAlgorithm",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "RecipientInfo.keyEncryptionAlgorithm.algorithm",
              tagClass: X7.Class.UNIVERSAL,
              type: X7.Type.OID,
              constructed: !1,
              capture: "encAlgorithm",
            },
            {
              name: "RecipientInfo.keyEncryptionAlgorithm.parameter",
              tagClass: X7.Class.UNIVERSAL,
              constructed: !1,
              captureAsn1: "encParameter",
              optional: !0,
            },
          ],
        },
        {
          name: "RecipientInfo.encryptedKey",
          tagClass: X7.Class.UNIVERSAL,
          type: X7.Type.OCTETSTRING,
          constructed: !1,
          capture: "encKey",
        },
      ],
    };
  });

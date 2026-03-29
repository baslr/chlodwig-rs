  var O$7 = d((fi3, K$7) => {
    var Q6H = XK();
    p6H();
    yC6();
    var FE = (K$7.exports = Q6H.tls);
    FE.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA = {
      id: [0, 47],
      name: "TLS_RSA_WITH_AES_128_CBC_SHA",
      initSecurityParameters: function (H) {
        (H.bulk_cipher_algorithm = FE.BulkCipherAlgorithm.aes),
          (H.cipher_type = FE.CipherType.block),
          (H.enc_key_length = 16),
          (H.block_length = 16),
          (H.fixed_iv_length = 16),
          (H.record_iv_length = 16),
          (H.mac_algorithm = FE.MACAlgorithm.hmac_sha1),
          (H.mac_length = 20),
          (H.mac_key_length = 20);
      },
      initConnectionState: $$7,
    };
    FE.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA = {
      id: [0, 53],
      name: "TLS_RSA_WITH_AES_256_CBC_SHA",
      initSecurityParameters: function (H) {
        (H.bulk_cipher_algorithm = FE.BulkCipherAlgorithm.aes),
          (H.cipher_type = FE.CipherType.block),
          (H.enc_key_length = 32),
          (H.block_length = 16),
          (H.fixed_iv_length = 16),
          (H.record_iv_length = 16),
          (H.mac_algorithm = FE.MACAlgorithm.hmac_sha1),
          (H.mac_length = 20),
          (H.mac_key_length = 20);
      },
      initConnectionState: $$7,
    };
    function $$7(H, _, q) {
      var $ = _.entity === Q6H.tls.ConnectionEnd.client;
      (H.read.cipherState = {
        init: !1,
        cipher: Q6H.cipher.createDecipher("AES-CBC", $ ? q.keys.server_write_key : q.keys.client_write_key),
        iv: $ ? q.keys.server_write_IV : q.keys.client_write_IV,
      }),
        (H.write.cipherState = {
          init: !1,
          cipher: Q6H.cipher.createCipher("AES-CBC", $ ? q.keys.client_write_key : q.keys.server_write_key),
          iv: $ ? q.keys.client_write_IV : q.keys.server_write_IV,
        }),
        (H.read.cipherFunction = vU4),
        (H.write.cipherFunction = ZU4),
        (H.read.macLength = H.write.macLength = q.mac_length),
        (H.read.macFunction = H.write.macFunction = FE.hmac_sha1);
    }
    function ZU4(H, _) {
      var q = !1,
        $ = _.macFunction(_.macKey, _.sequenceNumber, H);
      H.fragment.putBytes($), _.updateSequenceNumber();
      var K;
      if (H.version.minor === FE.Versions.TLS_1_0.minor) K = _.cipherState.init ? null : _.cipherState.iv;
      else K = Q6H.random.getBytesSync(16);
      _.cipherState.init = !0;
      var O = _.cipherState.cipher;
      if ((O.start({ iv: K }), H.version.minor >= FE.Versions.TLS_1_1.minor)) O.output.putBytes(K);
      if ((O.update(H.fragment), O.finish(LU4))) (H.fragment = O.output), (H.length = H.fragment.length()), (q = !0);
      return q;
    }
    function LU4(H, _, q) {
      if (!q) {
        var $ = H - (_.length() % H);
        _.fillWithByte($ - 1, $);
      }
      return !0;
    }
    function kU4(H, _, q) {
      var $ = !0;
      if (q) {
        var K = _.length(),
          O = _.last();
        for (var T = K - 1 - O; T < K - 1; ++T) $ = $ && _.at(T) == O;
        if ($) _.truncate(O + 1);
      }
      return $;
    }
    function vU4(H, _) {
      var q = !1,
        $;
      if (H.version.minor === FE.Versions.TLS_1_0.minor) $ = _.cipherState.init ? null : _.cipherState.iv;
      else $ = H.fragment.getBytes(16);
      _.cipherState.init = !0;
      var K = _.cipherState.cipher;
      K.start({ iv: $ }), K.update(H.fragment), (q = K.finish(kU4));
      var O = _.macLength,
        T = Q6H.random.getBytesSync(O),
        z = K.output.length();
      if (z >= O) (H.fragment = K.output.getBytes(z - O)), (T = K.output.getBytes(O));
      else H.fragment = K.output.getBytes();
      (H.fragment = Q6H.util.createBuffer(H.fragment)), (H.length = H.fragment.length());
      var A = _.macFunction(_.macKey, _.sequenceNumber, H);
      return _.updateSequenceNumber(), (q = NU4(_.macKey, T, A) && q), q;
    }
    function NU4(H, _, q) {
      var $ = Q6H.hmac.create();
      return (
        $.start("SHA1", H),
        $.update(_),
        (_ = $.digest().getBytes()),
        $.start(null, null),
        $.update(q),
        (q = $.digest().getBytes()),
        _ === q
      );
    }
  });

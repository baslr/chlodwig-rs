  var fC6 = d((sl3, L97) => {
    var tg = XK();
    F3();
    pE();
    hRH();
    var Z97 = (L97.exports = tg.pkcs1 = tg.pkcs1 || {});
    Z97.encode_rsa_oaep = function (H, _, q) {
      var $, K, O, T;
      if (typeof q === "string") ($ = q), (K = arguments[3] || void 0), (O = arguments[4] || void 0);
      else if (q) {
        if ((($ = q.label || void 0), (K = q.seed || void 0), (O = q.md || void 0), q.mgf1 && q.mgf1.md)) T = q.mgf1.md;
      }
      if (!O) O = tg.md.sha1.create();
      else O.start();
      if (!T) T = O;
      var z = Math.ceil(H.n.bitLength() / 8),
        A = z - 2 * O.digestLength - 2;
      if (_.length > A) {
        var f = Error("RSAES-OAEP input message length is too long.");
        throw ((f.length = _.length), (f.maxLength = A), f);
      }
      if (!$) $ = "";
      O.update($, "raw");
      var w = O.digest(),
        Y = "",
        D = A - _.length;
      for (var j = 0; j < D; j++) Y += "\x00";
      var M = w.getBytes() + Y + "\x01" + _;
      if (!K) K = tg.random.getBytes(O.digestLength);
      else if (K.length !== O.digestLength) {
        var f = Error("Invalid RSAES-OAEP seed. The seed length must match the digest length.");
        throw ((f.seedLength = K.length), (f.digestLength = O.digestLength), f);
      }
      var J = Ck_(K, z - O.digestLength - 1, T),
        P = tg.util.xorBytes(M, J, M.length),
        X = Ck_(P, O.digestLength, T),
        R = tg.util.xorBytes(K, X, K.length);
      return "\x00" + R + P;
    };
    Z97.decode_rsa_oaep = function (H, _, q) {
      var $, K, O;
      if (typeof q === "string") ($ = q), (K = arguments[3] || void 0);
      else if (q) {
        if ((($ = q.label || void 0), (K = q.md || void 0), q.mgf1 && q.mgf1.md)) O = q.mgf1.md;
      }
      var T = Math.ceil(H.n.bitLength() / 8);
      if (_.length !== T) {
        var P = Error("RSAES-OAEP encoded message length is invalid.");
        throw ((P.length = _.length), (P.expectedLength = T), P);
      }
      if (K === void 0) K = tg.md.sha1.create();
      else K.start();
      if (!O) O = K;
      if (T < 2 * K.digestLength + 2) throw Error("RSAES-OAEP key is too short for the hash function.");
      if (!$) $ = "";
      K.update($, "raw");
      var z = K.digest().getBytes(),
        A = _.charAt(0),
        f = _.substring(1, K.digestLength + 1),
        w = _.substring(1 + K.digestLength),
        Y = Ck_(w, K.digestLength, O),
        D = tg.util.xorBytes(f, Y, f.length),
        j = Ck_(D, T - K.digestLength - 1, O),
        M = tg.util.xorBytes(w, j, w.length),
        J = M.substring(0, K.digestLength),
        P = A !== "\x00";
      for (var X = 0; X < K.digestLength; ++X) P |= z.charAt(X) !== J.charAt(X);
      var R = 1,
        W = K.digestLength;
      for (var Z = K.digestLength; Z < M.length; Z++) {
        var k = M.charCodeAt(Z),
          v = (k & 1) ^ 1,
          y = R ? 65534 : 0;
        (P |= k & y), (R = R & v), (W += R);
      }
      if (P || M.charCodeAt(W) !== 1) throw Error("Invalid RSAES-OAEP padding.");
      return M.substring(W + 1);
    };
    function Ck_(H, _, q) {
      if (!q) q = tg.md.sha1.create();
      var $ = "",
        K = Math.ceil(_ / q.digestLength);
      for (var O = 0; O < K; ++O) {
        var T = String.fromCharCode((O >> 24) & 255, (O >> 16) & 255, (O >> 8) & 255, O & 255);
        q.start(), q.update(H + T), ($ += q.digest().getBytes());
      }
      return $.substring(0, _);
    }
  });

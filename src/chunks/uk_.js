  var uk_ = d((Ki3, d97) => {
    var qTH = XK();
    pE();
    F3();
    var gF4 = (d97.exports = qTH.pss = qTH.pss || {});
    gF4.create = function (H) {
      if (arguments.length === 3) H = { md: arguments[0], mgf: arguments[1], saltLength: arguments[2] };
      var { md: _, mgf: q } = H,
        $ = _.digestLength,
        K = H.salt || null;
      if (typeof K === "string") K = qTH.util.createBuffer(K);
      var O;
      if ("saltLength" in H) O = H.saltLength;
      else if (K !== null) O = K.length();
      else throw Error("Salt length not specified or specific salt not given.");
      if (K !== null && K.length() !== O) throw Error("Given salt length does not match length of given salt.");
      var T = H.prng || qTH.random,
        z = {};
      return (
        (z.encode = function (A, f) {
          var w,
            Y = f - 1,
            D = Math.ceil(Y / 8),
            j = A.digest().getBytes();
          if (D < $ + O + 2) throw Error("Message is too long to encrypt.");
          var M;
          if (K === null) M = T.getBytesSync(O);
          else M = K.bytes();
          var J = new qTH.util.ByteBuffer();
          J.fillWithByte(0, 8), J.putBytes(j), J.putBytes(M), _.start(), _.update(J.getBytes());
          var P = _.digest().getBytes(),
            X = new qTH.util.ByteBuffer();
          X.fillWithByte(0, D - O - $ - 2), X.putByte(1), X.putBytes(M);
          var R = X.getBytes(),
            W = D - $ - 1,
            Z = q.generate(P, W),
            k = "";
          for (w = 0; w < W; w++) k += String.fromCharCode(R.charCodeAt(w) ^ Z.charCodeAt(w));
          var v = (65280 >> (8 * D - Y)) & 255;
          return (k = String.fromCharCode(k.charCodeAt(0) & ~v) + k.substr(1)), k + P + String.fromCharCode(188);
        }),
        (z.verify = function (A, f, w) {
          var Y,
            D = w - 1,
            j = Math.ceil(D / 8);
          if (((f = f.substr(-j)), j < $ + O + 2))
            throw Error("Inconsistent parameters to PSS signature verification.");
          if (f.charCodeAt(j - 1) !== 188) throw Error("Encoded message does not end in 0xBC.");
          var M = j - $ - 1,
            J = f.substr(0, M),
            P = f.substr(M, $),
            X = (65280 >> (8 * j - D)) & 255;
          if ((J.charCodeAt(0) & X) !== 0) throw Error("Bits beyond keysize not zero as expected.");
          var R = q.generate(P, M),
            W = "";
          for (Y = 0; Y < M; Y++) W += String.fromCharCode(J.charCodeAt(Y) ^ R.charCodeAt(Y));
          W = String.fromCharCode(W.charCodeAt(0) & ~X) + W.substr(1);
          var Z = j - $ - O - 2;
          for (Y = 0; Y < Z; Y++) if (W.charCodeAt(Y) !== 0) throw Error("Leftmost octets not zero as expected");
          if (W.charCodeAt(Z) !== 1) throw Error("Inconsistent PSS signature, 0x01 marker not found");
          var k = W.substr(-O),
            v = new qTH.util.ByteBuffer();
          v.fillWithByte(0, 8), v.putBytes(A), v.putBytes(k), _.start(), _.update(v.getBytes());
          var y = _.digest().getBytes();
          return P === y;
        }),
        z
      );
    };
  });

  var x$7 = d((Xi3, u$7) => {
    var hj = XK();
    p6H();
    LRH();
    kk_();
    hRH();
    F3();
    var nk_ = (u$7.exports = hj.ssh = hj.ssh || {});
    nk_.privateKeyToPutty = function (H, _, q) {
      (q = q || ""), (_ = _ || "");
      var $ = "ssh-rsa",
        K = _ === "" ? "none" : "aes256-cbc",
        O =
          "PuTTY-User-Key-File-2: " +
          $ +
          `\r
`;
      (O +=
        "Encryption: " +
        K +
        `\r
`),
        (O +=
          "Comment: " +
          q +
          `\r
`);
      var T = hj.util.createBuffer();
      xRH(T, $), Hd(T, H.e), Hd(T, H.n);
      var z = hj.util.encode64(T.bytes(), 64),
        A = Math.floor(z.length / 66) + 1;
      (O +=
        "Public-Lines: " +
        A +
        `\r
`),
        (O += z);
      var f = hj.util.createBuffer();
      Hd(f, H.d), Hd(f, H.p), Hd(f, H.q), Hd(f, H.qInv);
      var w;
      if (!_) w = hj.util.encode64(f.bytes(), 64);
      else {
        var Y = f.length() + 16 - 1;
        Y -= Y % 16;
        var D = ik_(f.bytes());
        D.truncate(D.length() - Y + f.length()), f.putBuffer(D);
        var j = hj.util.createBuffer();
        j.putBuffer(ik_("\x00\x00\x00\x00", _)), j.putBuffer(ik_("\x00\x00\x00\x01", _));
        var M = hj.aes.createEncryptionCipher(j.truncate(8), "CBC");
        M.start(hj.util.createBuffer().fillWithByte(0, 16)), M.update(f.copy()), M.finish();
        var J = M.output;
        J.truncate(16), (w = hj.util.encode64(J.bytes(), 64));
      }
      (A = Math.floor(w.length / 66) + 1),
        (O +=
          `\r
Private-Lines: ` +
          A +
          `\r
`),
        (O += w);
      var P = ik_("putty-private-key-file-mac-key", _),
        X = hj.util.createBuffer();
      xRH(X, $), xRH(X, K), xRH(X, q), X.putInt32(T.length()), X.putBuffer(T), X.putInt32(f.length()), X.putBuffer(f);
      var R = hj.hmac.create();
      return (
        R.start("sha1", P),
        R.update(X.bytes()),
        (O +=
          `\r
Private-MAC: ` +
          R.digest().toHex() +
          `\r
`),
        O
      );
    };
    nk_.publicKeyToOpenSSH = function (H, _) {
      var q = "ssh-rsa";
      _ = _ || "";
      var $ = hj.util.createBuffer();
      return xRH($, q), Hd($, H.e), Hd($, H.n), q + " " + hj.util.encode64($.bytes()) + " " + _;
    };
    nk_.privateKeyToOpenSSH = function (H, _) {
      if (!_) return hj.pki.privateKeyToPem(H);
      return hj.pki.encryptRsaPrivateKey(H, _, { legacy: !0, algorithm: "aes128" });
    };
    nk_.getPublicKeyFingerprint = function (H, _) {
      _ = _ || {};
      var q = _.md || hj.md.md5.create(),
        $ = "ssh-rsa",
        K = hj.util.createBuffer();
      xRH(K, $), Hd(K, H.e), Hd(K, H.n), q.start(), q.update(K.getBytes());
      var O = q.digest();
      if (_.encoding === "hex") {
        var T = O.toHex();
        if (_.delimiter) return T.match(/.{2}/g).join(_.delimiter);
        return T;
      } else if (_.encoding === "binary") return O.getBytes();
      else if (_.encoding) throw Error('Unknown encoding "' + _.encoding + '".');
      return O;
    };
    function Hd(H, _) {
      var q = _.toString(16);
      if (q[0] >= "8") q = "00" + q;
      var $ = hj.util.hexToBytes(q);
      H.putInt32($.length), H.putBytes($);
    }
    function xRH(H, _) {
      H.putInt32(_.length), H.putString(_);
    }
    function ik_() {
      var H = hj.md.sha1.create(),
        _ = arguments.length;
      for (var q = 0; q < _; ++q) H.update(arguments[q]);
      return H.digest();
    }
  });

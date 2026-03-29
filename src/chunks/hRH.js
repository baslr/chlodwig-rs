  var hRH = d((al3, R97) => {
    var sg = XK();
    ig();
    F3();
    var W97 = (R97.exports = sg.sha1 = sg.sha1 || {});
    sg.md.sha1 = sg.md.algorithms.sha1 = W97;
    W97.create = function () {
      if (!G97) kF4();
      var H = null,
        _ = sg.util.createBuffer(),
        q = Array(80),
        $ = {
          algorithm: "sha1",
          blockLength: 64,
          digestLength: 20,
          messageLength: 0,
          fullMessageLength: null,
          messageLengthSize: 8,
        };
      return (
        ($.start = function () {
          ($.messageLength = 0), ($.fullMessageLength = $.messageLength64 = []);
          var K = $.messageLengthSize / 4;
          for (var O = 0; O < K; ++O) $.fullMessageLength.push(0);
          return (
            (_ = sg.util.createBuffer()),
            (H = { h0: 1732584193, h1: 4023233417, h2: 2562383102, h3: 271733878, h4: 3285377520 }),
            $
          );
        }),
        $.start(),
        ($.update = function (K, O) {
          if (O === "utf8") K = sg.util.encodeUtf8(K);
          var T = K.length;
          ($.messageLength += T), (T = [(T / 4294967296) >>> 0, T >>> 0]);
          for (var z = $.fullMessageLength.length - 1; z >= 0; --z)
            ($.fullMessageLength[z] += T[1]),
              (T[1] = T[0] + (($.fullMessageLength[z] / 4294967296) >>> 0)),
              ($.fullMessageLength[z] = $.fullMessageLength[z] >>> 0),
              (T[0] = (T[1] / 4294967296) >>> 0);
          if ((_.putBytes(K), X97(H, q, _), _.read > 2048 || _.length() === 0)) _.compact();
          return $;
        }),
        ($.digest = function () {
          var K = sg.util.createBuffer();
          K.putBytes(_.bytes());
          var O = $.fullMessageLength[$.fullMessageLength.length - 1] + $.messageLengthSize,
            T = O & ($.blockLength - 1);
          K.putBytes(AC6.substr(0, $.blockLength - T));
          var z,
            A,
            f = $.fullMessageLength[0] * 8;
          for (var w = 0; w < $.fullMessageLength.length - 1; ++w)
            (z = $.fullMessageLength[w + 1] * 8),
              (A = (z / 4294967296) >>> 0),
              (f += A),
              K.putInt32(f >>> 0),
              (f = z >>> 0);
          K.putInt32(f);
          var Y = { h0: H.h0, h1: H.h1, h2: H.h2, h3: H.h3, h4: H.h4 };
          X97(Y, q, K);
          var D = sg.util.createBuffer();
          return D.putInt32(Y.h0), D.putInt32(Y.h1), D.putInt32(Y.h2), D.putInt32(Y.h3), D.putInt32(Y.h4), D;
        }),
        $
      );
    };
    var AC6 = null,
      G97 = !1;
    function kF4() {
      (AC6 = String.fromCharCode(128)), (AC6 += sg.util.fillString(String.fromCharCode(0), 64)), (G97 = !0);
    }
    function X97(H, _, q) {
      var $,
        K,
        O,
        T,
        z,
        A,
        f,
        w,
        Y = q.length();
      while (Y >= 64) {
        (K = H.h0), (O = H.h1), (T = H.h2), (z = H.h3), (A = H.h4);
        for (w = 0; w < 16; ++w)
          ($ = q.getInt32()),
            (_[w] = $),
            (f = z ^ (O & (T ^ z))),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 1518500249 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        for (; w < 20; ++w)
          ($ = _[w - 3] ^ _[w - 8] ^ _[w - 14] ^ _[w - 16]),
            ($ = ($ << 1) | ($ >>> 31)),
            (_[w] = $),
            (f = z ^ (O & (T ^ z))),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 1518500249 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        for (; w < 32; ++w)
          ($ = _[w - 3] ^ _[w - 8] ^ _[w - 14] ^ _[w - 16]),
            ($ = ($ << 1) | ($ >>> 31)),
            (_[w] = $),
            (f = O ^ T ^ z),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 1859775393 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        for (; w < 40; ++w)
          ($ = _[w - 6] ^ _[w - 16] ^ _[w - 28] ^ _[w - 32]),
            ($ = ($ << 2) | ($ >>> 30)),
            (_[w] = $),
            (f = O ^ T ^ z),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 1859775393 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        for (; w < 60; ++w)
          ($ = _[w - 6] ^ _[w - 16] ^ _[w - 28] ^ _[w - 32]),
            ($ = ($ << 2) | ($ >>> 30)),
            (_[w] = $),
            (f = (O & T) | (z & (O ^ T))),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 2400959708 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        for (; w < 80; ++w)
          ($ = _[w - 6] ^ _[w - 16] ^ _[w - 28] ^ _[w - 32]),
            ($ = ($ << 2) | ($ >>> 30)),
            (_[w] = $),
            (f = O ^ T ^ z),
            ($ = ((K << 5) | (K >>> 27)) + f + A + 3395469782 + $),
            (A = z),
            (z = T),
            (T = ((O << 30) | (O >>> 2)) >>> 0),
            (O = K),
            (K = $);
        (H.h0 = (H.h0 + K) | 0),
          (H.h1 = (H.h1 + O) | 0),
          (H.h2 = (H.h2 + T) | 0),
          (H.h3 = (H.h3 + z) | 0),
          (H.h4 = (H.h4 + A) | 0),
          (Y -= 64);
      }
    }
  });

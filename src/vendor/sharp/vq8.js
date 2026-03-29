  var vq8 = d((Uj9) => {
    var CQ_ = B9H(),
      Gq8 = LQ_(),
      _9K = Tj9(),
      q9K = Aj9(),
      $9K = fj9(),
      K9K = Yj9(),
      Lq8 = Dj9(),
      kq8 = Aq8(),
      O9K = Xj9(),
      EQ_ = Lj9(),
      T9K = Nj9(),
      z9K = d9H(),
      Rq8 = Fj9();
    function A9K(H, _) {
      let q = H.size,
        $ = K9K.getPositions(_);
      for (let K = 0; K < $.length; K++) {
        let O = $[K][0],
          T = $[K][1];
        for (let z = -1; z <= 7; z++) {
          if (O + z <= -1 || q <= O + z) continue;
          for (let A = -1; A <= 7; A++) {
            if (T + A <= -1 || q <= T + A) continue;
            if (
              (z >= 0 && z <= 6 && (A === 0 || A === 6)) ||
              (A >= 0 && A <= 6 && (z === 0 || z === 6)) ||
              (z >= 2 && z <= 4 && A >= 2 && A <= 4)
            )
              H.set(O + z, T + A, !0, !0);
            else H.set(O + z, T + A, !1, !0);
          }
        }
      }
    }
    function f9K(H) {
      let _ = H.size;
      for (let q = 8; q < _ - 8; q++) {
        let $ = q % 2 === 0;
        H.set(q, 6, $, !0), H.set(6, q, $, !0);
      }
    }
    function w9K(H, _) {
      let q = $9K.getPositions(_);
      for (let $ = 0; $ < q.length; $++) {
        let K = q[$][0],
          O = q[$][1];
        for (let T = -2; T <= 2; T++)
          for (let z = -2; z <= 2; z++)
            if (T === -2 || T === 2 || z === -2 || z === 2 || (T === 0 && z === 0)) H.set(K + T, O + z, !0, !0);
            else H.set(K + T, O + z, !1, !0);
      }
    }
    function Y9K(H, _) {
      let q = H.size,
        $ = EQ_.getEncodedBits(_),
        K,
        O,
        T;
      for (let z = 0; z < 18; z++)
        (K = Math.floor(z / 3)),
          (O = (z % 3) + q - 8 - 3),
          (T = (($ >> z) & 1) === 1),
          H.set(K, O, T, !0),
          H.set(O, K, T, !0);
    }
    function Zq8(H, _, q) {
      let $ = H.size,
        K = T9K.getEncodedBits(_, q),
        O,
        T;
      for (O = 0; O < 15; O++) {
        if (((T = ((K >> O) & 1) === 1), O < 6)) H.set(O, 8, T, !0);
        else if (O < 8) H.set(O + 1, 8, T, !0);
        else H.set($ - 15 + O, 8, T, !0);
        if (O < 8) H.set(8, $ - O - 1, T, !0);
        else if (O < 9) H.set(8, 15 - O - 1 + 1, T, !0);
        else H.set(8, 15 - O - 1, T, !0);
      }
      H.set($ - 8, 8, 1, !0);
    }
    function D9K(H, _) {
      let q = H.size,
        $ = -1,
        K = q - 1,
        O = 7,
        T = 0;
      for (let z = q - 1; z > 0; z -= 2) {
        if (z === 6) z--;
        while (!0) {
          for (let A = 0; A < 2; A++)
            if (!H.isReserved(K, z - A)) {
              let f = !1;
              if (T < _.length) f = ((_[T] >>> O) & 1) === 1;
              if ((H.set(K, z - A, f), O--, O === -1)) T++, (O = 7);
            }
          if (((K += $), K < 0 || q <= K)) {
            (K -= $), ($ = -$);
            break;
          }
        }
      }
    }
    function j9K(H, _, q) {
      let $ = new _9K();
      q.forEach(function (A) {
        $.put(A.mode.bit, 4), $.put(A.getLength(), z9K.getCharCountIndicator(A.mode, H)), A.write($);
      });
      let K = CQ_.getSymbolTotalCodewords(H),
        O = kq8.getTotalCodewordsCount(H, _),
        T = (K - O) * 8;
      if ($.getLengthInBits() + 4 <= T) $.put(0, 4);
      while ($.getLengthInBits() % 8 !== 0) $.putBit(0);
      let z = (T - $.getLengthInBits()) / 8;
      for (let A = 0; A < z; A++) $.put(A % 2 ? 17 : 236, 8);
      return M9K($, H, _);
    }
    function M9K(H, _, q) {
      let $ = CQ_.getSymbolTotalCodewords(_),
        K = kq8.getTotalCodewordsCount(_, q),
        O = $ - K,
        T = kq8.getBlocksCount(_, q),
        z = $ % T,
        A = T - z,
        f = Math.floor($ / T),
        w = Math.floor(O / T),
        Y = w + 1,
        D = f - w,
        j = new O9K(D),
        M = 0,
        J = Array(T),
        P = Array(T),
        X = 0,
        R = new Uint8Array(H.buffer);
      for (let y = 0; y < T; y++) {
        let E = y < A ? w : Y;
        (J[y] = R.slice(M, M + E)), (P[y] = j.encode(J[y])), (M += E), (X = Math.max(X, E));
      }
      let W = new Uint8Array($),
        Z = 0,
        k,
        v;
      for (k = 0; k < X; k++) for (v = 0; v < T; v++) if (k < J[v].length) W[Z++] = J[v][k];
      for (k = 0; k < D; k++) for (v = 0; v < T; v++) W[Z++] = P[v][k];
      return W;
    }
    function J9K(H, _, q, $) {
      let K;
      if (Array.isArray(H)) K = Rq8.fromArray(H);
      else if (typeof H === "string") {
        let f = _;
        if (!f) {
          let w = Rq8.rawSplit(H);
          f = EQ_.getBestVersionForData(w, q);
        }
        K = Rq8.fromString(H, f || 40);
      } else throw Error("Invalid data");
      let O = EQ_.getBestVersionForData(K, q);
      if (!O) throw Error("The amount of data is too big to be stored in a QR Code");
      if (!_) _ = O;
      else if (_ < O)
        throw Error(
          `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` +
            O +
            `.
`,
        );
      let T = j9K(_, q, K),
        z = CQ_.getSymbolSize(_),
        A = new q9K(z);
      if ((A9K(A, _), f9K(A), w9K(A, _), Zq8(A, q, 0), _ >= 7)) Y9K(A, _);
      if ((D9K(A, T), isNaN($))) $ = Lq8.getBestMask(A, Zq8.bind(null, A, q));
      return (
        Lq8.applyMask($, A),
        Zq8(A, q, $),
        { modules: A, version: _, errorCorrectionLevel: q, maskPattern: $, segments: K }
      );
    }
    Uj9.create = function (_, q) {
      if (typeof _ > "u" || _ === "") throw Error("No input text");
      let $ = Gq8.M,
        K,
        O;
      if (typeof q < "u") {
        if (
          (($ = Gq8.from(q.errorCorrectionLevel, Gq8.M)),
          (K = EQ_.from(q.version)),
          (O = Lq8.from(q.maskPattern)),
          q.toSJISFunc)
        )
          CQ_.setToSJISFunction(q.toSJISFunc);
      }
      return J9K(_, K, $, O);
    };
  });

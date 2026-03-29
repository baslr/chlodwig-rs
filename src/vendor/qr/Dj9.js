  var Dj9 = d((Tf) => {
    Tf.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7,
    };
    var rwH = { N1: 3, N2: 3, N3: 40, N4: 10 };
    Tf.isValid = function (_) {
      return _ != null && _ !== "" && !isNaN(_) && _ >= 0 && _ <= 7;
    };
    Tf.from = function (_) {
      return Tf.isValid(_) ? parseInt(_, 10) : void 0;
    };
    Tf.getPenaltyN1 = function (_) {
      let q = _.size,
        $ = 0,
        K = 0,
        O = 0,
        T = null,
        z = null;
      for (let A = 0; A < q; A++) {
        (K = O = 0), (T = z = null);
        for (let f = 0; f < q; f++) {
          let w = _.get(A, f);
          if (w === T) K++;
          else {
            if (K >= 5) $ += rwH.N1 + (K - 5);
            (T = w), (K = 1);
          }
          if (((w = _.get(f, A)), w === z)) O++;
          else {
            if (O >= 5) $ += rwH.N1 + (O - 5);
            (z = w), (O = 1);
          }
        }
        if (K >= 5) $ += rwH.N1 + (K - 5);
        if (O >= 5) $ += rwH.N1 + (O - 5);
      }
      return $;
    };
    Tf.getPenaltyN2 = function (_) {
      let q = _.size,
        $ = 0;
      for (let K = 0; K < q - 1; K++)
        for (let O = 0; O < q - 1; O++) {
          let T = _.get(K, O) + _.get(K, O + 1) + _.get(K + 1, O) + _.get(K + 1, O + 1);
          if (T === 4 || T === 0) $++;
        }
      return $ * rwH.N2;
    };
    Tf.getPenaltyN3 = function (_) {
      let q = _.size,
        $ = 0,
        K = 0,
        O = 0;
      for (let T = 0; T < q; T++) {
        K = O = 0;
        for (let z = 0; z < q; z++) {
          if (((K = ((K << 1) & 2047) | _.get(T, z)), z >= 10 && (K === 1488 || K === 93))) $++;
          if (((O = ((O << 1) & 2047) | _.get(z, T)), z >= 10 && (O === 1488 || O === 93))) $++;
        }
      }
      return $ * rwH.N3;
    };
    Tf.getPenaltyN4 = function (_) {
      let q = 0,
        $ = _.data.length;
      for (let O = 0; O < $; O++) q += _.data[O];
      return Math.abs(Math.ceil((q * 100) / $ / 5) - 10) * rwH.N4;
    };
    function x7K(H, _, q) {
      switch (H) {
        case Tf.Patterns.PATTERN000:
          return (_ + q) % 2 === 0;
        case Tf.Patterns.PATTERN001:
          return _ % 2 === 0;
        case Tf.Patterns.PATTERN010:
          return q % 3 === 0;
        case Tf.Patterns.PATTERN011:
          return (_ + q) % 3 === 0;
        case Tf.Patterns.PATTERN100:
          return (Math.floor(_ / 2) + Math.floor(q / 3)) % 2 === 0;
        case Tf.Patterns.PATTERN101:
          return ((_ * q) % 2) + ((_ * q) % 3) === 0;
        case Tf.Patterns.PATTERN110:
          return (((_ * q) % 2) + ((_ * q) % 3)) % 2 === 0;
        case Tf.Patterns.PATTERN111:
          return (((_ * q) % 3) + ((_ + q) % 2)) % 2 === 0;
        default:
          throw Error("bad maskPattern:" + H);
      }
    }
    Tf.applyMask = function (_, q) {
      let $ = q.size;
      for (let K = 0; K < $; K++)
        for (let O = 0; O < $; O++) {
          if (q.isReserved(O, K)) continue;
          q.xor(O, K, x7K(_, O, K));
        }
    };
    Tf.getBestMask = function (_, q) {
      let $ = Object.keys(Tf.Patterns).length,
        K = 0,
        O = 1 / 0;
      for (let T = 0; T < $; T++) {
        q(T), Tf.applyMask(T, _);
        let z = Tf.getPenaltyN1(_) + Tf.getPenaltyN2(_) + Tf.getPenaltyN3(_) + Tf.getPenaltyN4(_);
        if ((Tf.applyMask(T, _), z < O)) (O = z), (K = T);
      }
      return K;
    };
  });

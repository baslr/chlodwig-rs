  var uq8 = d((qM9) => {
    var _M9 = yq8(),
      k9K = [
        function () {},
        function (H, _, q, $) {
          if ($ === _.length) throw Error("Ran out of data");
          let K = _[$];
          (H[q] = K), (H[q + 1] = K), (H[q + 2] = K), (H[q + 3] = 255);
        },
        function (H, _, q, $) {
          if ($ + 1 >= _.length) throw Error("Ran out of data");
          let K = _[$];
          (H[q] = K), (H[q + 1] = K), (H[q + 2] = K), (H[q + 3] = _[$ + 1]);
        },
        function (H, _, q, $) {
          if ($ + 2 >= _.length) throw Error("Ran out of data");
          (H[q] = _[$]), (H[q + 1] = _[$ + 1]), (H[q + 2] = _[$ + 2]), (H[q + 3] = 255);
        },
        function (H, _, q, $) {
          if ($ + 3 >= _.length) throw Error("Ran out of data");
          (H[q] = _[$]), (H[q + 1] = _[$ + 1]), (H[q + 2] = _[$ + 2]), (H[q + 3] = _[$ + 3]);
        },
      ],
      v9K = [
        function () {},
        function (H, _, q, $) {
          let K = _[0];
          (H[q] = K), (H[q + 1] = K), (H[q + 2] = K), (H[q + 3] = $);
        },
        function (H, _, q) {
          let $ = _[0];
          (H[q] = $), (H[q + 1] = $), (H[q + 2] = $), (H[q + 3] = _[1]);
        },
        function (H, _, q, $) {
          (H[q] = _[0]), (H[q + 1] = _[1]), (H[q + 2] = _[2]), (H[q + 3] = $);
        },
        function (H, _, q) {
          (H[q] = _[0]), (H[q + 1] = _[1]), (H[q + 2] = _[2]), (H[q + 3] = _[3]);
        },
      ];
    function N9K(H, _) {
      let q = [],
        $ = 0;
      function K() {
        if ($ === H.length) throw Error("Ran out of data");
        let O = H[$];
        $++;
        let T, z, A, f, w, Y, D, j;
        switch (_) {
          default:
            throw Error("unrecognised depth");
          case 16:
            (D = H[$]), $++, q.push((O << 8) + D);
            break;
          case 4:
            (D = O & 15), (j = O >> 4), q.push(j, D);
            break;
          case 2:
            (w = O & 3), (Y = (O >> 2) & 3), (D = (O >> 4) & 3), (j = (O >> 6) & 3), q.push(j, D, Y, w);
            break;
          case 1:
            (T = O & 1),
              (z = (O >> 1) & 1),
              (A = (O >> 2) & 1),
              (f = (O >> 3) & 1),
              (w = (O >> 4) & 1),
              (Y = (O >> 5) & 1),
              (D = (O >> 6) & 1),
              (j = (O >> 7) & 1),
              q.push(j, D, Y, w, f, A, z, T);
            break;
        }
      }
      return {
        get: function (O) {
          while (q.length < O) K();
          let T = q.slice(0, O);
          return (q = q.slice(O)), T;
        },
        resetAfterLine: function () {
          q.length = 0;
        },
        end: function () {
          if ($ !== H.length) throw Error("extra data found");
        },
      };
    }
    function h9K(H, _, q, $, K, O) {
      let { width: T, height: z, index: A } = H;
      for (let f = 0; f < z; f++)
        for (let w = 0; w < T; w++) {
          let Y = q(w, f, A);
          k9K[$](_, K, Y, O), (O += $);
        }
      return O;
    }
    function y9K(H, _, q, $, K, O) {
      let { width: T, height: z, index: A } = H;
      for (let f = 0; f < z; f++) {
        for (let w = 0; w < T; w++) {
          let Y = K.get($),
            D = q(w, f, A);
          v9K[$](_, Y, D, O);
        }
        K.resetAfterLine();
      }
    }
    qM9.dataToBitMap = function (H, _) {
      let { width: q, height: $, depth: K, bpp: O, interlace: T } = _,
        z;
      if (K !== 8) z = N9K(H, K);
      let A;
      if (K <= 8) A = Buffer.alloc(q * $ * 4);
      else A = new Uint16Array(q * $ * 4);
      let f = Math.pow(2, K) - 1,
        w = 0,
        Y,
        D;
      if (T) (Y = _M9.getImagePasses(q, $)), (D = _M9.getInterlaceIterator(q, $));
      else {
        let j = 0;
        (D = function () {
          let M = j;
          return (j += 4), M;
        }),
          (Y = [{ width: q, height: $ }]);
      }
      for (let j = 0; j < Y.length; j++)
        if (K === 8) w = h9K(Y[j], A, D, O, H, w);
        else y9K(Y[j], A, D, O, z, f);
      if (K === 8) {
        if (w !== H.length) throw Error("extra data found");
      } else z.end();
      return A;
    };
  });

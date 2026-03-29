  var Fj9 = d((qSH) => {
    var LT = d9H(),
      pj9 = yj9(),
      Bj9 = Sj9(),
      gj9 = Cj9(),
      dj9 = Ij9(),
      N6_ = Dq8(),
      SQ_ = B9H(),
      s7K = uj9();
    function xj9(H) {
      return unescape(encodeURIComponent(H)).length;
    }
    function h6_(H, _, q) {
      let $ = [],
        K;
      while ((K = H.exec(q)) !== null) $.push({ data: K[0], index: K.index, mode: _, length: K[0].length });
      return $;
    }
    function cj9(H) {
      let _ = h6_(N6_.NUMERIC, LT.NUMERIC, H),
        q = h6_(N6_.ALPHANUMERIC, LT.ALPHANUMERIC, H),
        $,
        K;
      if (SQ_.isKanjiModeEnabled()) ($ = h6_(N6_.BYTE, LT.BYTE, H)), (K = h6_(N6_.KANJI, LT.KANJI, H));
      else ($ = h6_(N6_.BYTE_KANJI, LT.BYTE, H)), (K = []);
      return _.concat(q, $, K)
        .sort(function (T, z) {
          return T.index - z.index;
        })
        .map(function (T) {
          return { data: T.data, mode: T.mode, length: T.length };
        });
    }
    function Wq8(H, _) {
      switch (_) {
        case LT.NUMERIC:
          return pj9.getBitsLength(H);
        case LT.ALPHANUMERIC:
          return Bj9.getBitsLength(H);
        case LT.KANJI:
          return dj9.getBitsLength(H);
        case LT.BYTE:
          return gj9.getBitsLength(H);
      }
    }
    function t7K(H) {
      return H.reduce(function (_, q) {
        let $ = _.length - 1 >= 0 ? _[_.length - 1] : null;
        if ($ && $.mode === q.mode) return (_[_.length - 1].data += q.data), _;
        return _.push(q), _;
      }, []);
    }
    function e7K(H) {
      let _ = [];
      for (let q = 0; q < H.length; q++) {
        let $ = H[q];
        switch ($.mode) {
          case LT.NUMERIC:
            _.push([
              $,
              { data: $.data, mode: LT.ALPHANUMERIC, length: $.length },
              { data: $.data, mode: LT.BYTE, length: $.length },
            ]);
            break;
          case LT.ALPHANUMERIC:
            _.push([$, { data: $.data, mode: LT.BYTE, length: $.length }]);
            break;
          case LT.KANJI:
            _.push([$, { data: $.data, mode: LT.BYTE, length: xj9($.data) }]);
            break;
          case LT.BYTE:
            _.push([{ data: $.data, mode: LT.BYTE, length: xj9($.data) }]);
        }
      }
      return _;
    }
    function H9K(H, _) {
      let q = {},
        $ = { start: {} },
        K = ["start"];
      for (let O = 0; O < H.length; O++) {
        let T = H[O],
          z = [];
        for (let A = 0; A < T.length; A++) {
          let f = T[A],
            w = "" + O + A;
          z.push(w), (q[w] = { node: f, lastCount: 0 }), ($[w] = {});
          for (let Y = 0; Y < K.length; Y++) {
            let D = K[Y];
            if (q[D] && q[D].node.mode === f.mode)
              ($[D][w] = Wq8(q[D].lastCount + f.length, f.mode) - Wq8(q[D].lastCount, f.mode)),
                (q[D].lastCount += f.length);
            else {
              if (q[D]) q[D].lastCount = f.length;
              $[D][w] = Wq8(f.length, f.mode) + 4 + LT.getCharCountIndicator(f.mode, _);
            }
          }
        }
        K = z;
      }
      for (let O = 0; O < K.length; O++) $[K[O]].end = 0;
      return { map: $, table: q };
    }
    function mj9(H, _) {
      let q,
        $ = LT.getBestModeForData(H);
      if (((q = LT.from(_, $)), q !== LT.BYTE && q.bit < $.bit))
        throw Error(
          '"' +
            H +
            '" cannot be encoded with mode ' +
            LT.toString(q) +
            `.
 Suggested mode is: ` +
            LT.toString($),
        );
      if (q === LT.KANJI && !SQ_.isKanjiModeEnabled()) q = LT.BYTE;
      switch (q) {
        case LT.NUMERIC:
          return new pj9(H);
        case LT.ALPHANUMERIC:
          return new Bj9(H);
        case LT.KANJI:
          return new dj9(H);
        case LT.BYTE:
          return new gj9(H);
      }
    }
    qSH.fromArray = function (_) {
      return _.reduce(function (q, $) {
        if (typeof $ === "string") q.push(mj9($, null));
        else if ($.data) q.push(mj9($.data, $.mode));
        return q;
      }, []);
    };
    qSH.fromString = function (_, q) {
      let $ = cj9(_, SQ_.isKanjiModeEnabled()),
        K = e7K($),
        O = H9K(K, q),
        T = s7K.find_path(O.map, "start", "end"),
        z = [];
      for (let A = 1; A < T.length - 1; A++) z.push(O.table[T[A]].node);
      return qSH.fromArray(t7K(z));
    };
    qSH.rawSplit = function (_) {
      return qSH.fromArray(cj9(_, SQ_.isKanjiModeEnabled()));
    };
  });

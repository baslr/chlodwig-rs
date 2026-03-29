    BQ4 = new RegExp(`[${Wv_}]+|\\s+|[^${Wv_}]`, "ug");
    l47 = class l47 extends Xn {
      equals(H, _, q) {
        if (q.ignoreCase) (H = H.toLowerCase()), (_ = _.toLowerCase());
        return H.trim() === _.trim();
      }
      tokenize(H, _ = {}) {
        let q;
        if (_.intlSegmenter) {
          let O = _.intlSegmenter;
          if (O.resolvedOptions().granularity != "word")
            throw Error('The segmenter passed must have a granularity of "word"');
          q = [];
          for (let T of Array.from(O.segment(H))) {
            let z = T.segment;
            if (q.length && /\s/.test(q[q.length - 1]) && /\s/.test(z)) q[q.length - 1] += z;
            else q.push(z);
          }
        } else q = H.match(BQ4) || [];
        let $ = [],
          K = null;
        return (
          q.forEach((O) => {
            if (/\s/.test(O))
              if (K == null) $.push(O);
              else $.push($.pop() + O);
            else if (K != null && /\s/.test(K))
              if ($[$.length - 1] == K) $.push($.pop() + O);
              else $.push(K + O);
            else $.push(O);
            K = O;
          }),
          $
        );
      }
      join(H) {
        return H.map((_, q) => {
          if (q == 0) return _;
          else return _.replace(/^\s+/, "");
        }).join("");
      }
      postProcess(H, _) {
        if (!H || _.oneChangePerToken) return H;
        let q = null,
          $ = null,
          K = null;
        if (
          (H.forEach((O) => {
            if (O.added) $ = O;
            else if (O.removed) K = O;
            else {
              if ($ || K) Q47(q, K, $, O);
              (q = O), ($ = null), (K = null);
            }
          }),
          $ || K)
        )
          Q47(q, K, $, null);
        return H;
      }
    };
    gQ4 = new l47();
    i47 = class i47 extends Xn {
      tokenize(H) {
        let _ = new RegExp(`(\\r?\\n)|[${Wv_}]+|[^\\S\\n\\r]+|[^${Wv_}]`, "ug");
        return H.match(_) || [];
      }
    };
    n47 = new i47();

  var Sq8 = d((Z7z, rj9) => {
    var X9K = yq8(),
      W9K = Vq8();
    function nj9(H, _, q) {
      let $ = H * _;
      if (q !== 8) $ = Math.ceil($ / (8 / q));
      return $;
    }
    var $SH = (rj9.exports = function (H, _) {
      let { width: q, height: $, interlace: K, bpp: O, depth: T } = H;
      if (
        ((this.read = _.read),
        (this.write = _.write),
        (this.complete = _.complete),
        (this._imageIndex = 0),
        (this._images = []),
        K)
      ) {
        let z = X9K.getImagePasses(q, $);
        for (let A = 0; A < z.length; A++)
          this._images.push({ byteWidth: nj9(z[A].width, O, T), height: z[A].height, lineIndex: 0 });
      } else this._images.push({ byteWidth: nj9(q, O, T), height: $, lineIndex: 0 });
      if (T === 8) this._xComparison = O;
      else if (T === 16) this._xComparison = O * 2;
      else this._xComparison = 1;
    });
    $SH.prototype.start = function () {
      this.read(this._images[this._imageIndex].byteWidth + 1, this._reverseFilterLine.bind(this));
    };
    $SH.prototype._unFilterType1 = function (H, _, q) {
      let $ = this._xComparison,
        K = $ - 1;
      for (let O = 0; O < q; O++) {
        let T = H[1 + O],
          z = O > K ? _[O - $] : 0;
        _[O] = T + z;
      }
    };
    $SH.prototype._unFilterType2 = function (H, _, q) {
      let $ = this._lastLine;
      for (let K = 0; K < q; K++) {
        let O = H[1 + K],
          T = $ ? $[K] : 0;
        _[K] = O + T;
      }
    };
    $SH.prototype._unFilterType3 = function (H, _, q) {
      let $ = this._xComparison,
        K = $ - 1,
        O = this._lastLine;
      for (let T = 0; T < q; T++) {
        let z = H[1 + T],
          A = O ? O[T] : 0,
          f = T > K ? _[T - $] : 0,
          w = Math.floor((f + A) / 2);
        _[T] = z + w;
      }
    };
    $SH.prototype._unFilterType4 = function (H, _, q) {
      let $ = this._xComparison,
        K = $ - 1,
        O = this._lastLine;
      for (let T = 0; T < q; T++) {
        let z = H[1 + T],
          A = O ? O[T] : 0,
          f = T > K ? _[T - $] : 0,
          w = T > K && O ? O[T - $] : 0,
          Y = W9K(f, A, w);
        _[T] = z + Y;
      }
    };
    $SH.prototype._reverseFilterLine = function (H) {
      let _ = H[0],
        q,
        $ = this._images[this._imageIndex],
        K = $.byteWidth;
      if (_ === 0) q = H.slice(1, K + 1);
      else
        switch (((q = Buffer.alloc(K)), _)) {
          case 1:
            this._unFilterType1(H, q, K);
            break;
          case 2:
            this._unFilterType2(H, q, K);
            break;
          case 3:
            this._unFilterType3(H, q, K);
            break;
          case 4:
            this._unFilterType4(H, q, K);
            break;
          default:
            throw Error("Unrecognised filter type - " + _);
        }
      if ((this.write(q), $.lineIndex++, $.lineIndex >= $.height))
        (this._lastLine = null), this._imageIndex++, ($ = this._images[this._imageIndex]);
      else this._lastLine = q;
      if ($) this.read($.byteWidth + 1, this._reverseFilterLine.bind(this));
      else (this._lastLine = null), this.complete();
    };
  });

  var mI7 = d((bb_) => {
    Object.defineProperty(bb_, "__esModule", { value: !0 });
    bb_.Buckets = void 0;
    class QF6 {
      backing;
      indexBase;
      indexStart;
      indexEnd;
      constructor(H = new lF6(), _ = 0, q = 0, $ = 0) {
        (this.backing = H), (this.indexBase = _), (this.indexStart = q), (this.indexEnd = $);
      }
      get offset() {
        return this.indexStart;
      }
      get length() {
        if (this.backing.length === 0) return 0;
        if (this.indexEnd === this.indexStart && this.at(0) === 0) return 0;
        return this.indexEnd - this.indexStart + 1;
      }
      counts() {
        return Array.from({ length: this.length }, (H, _) => this.at(_));
      }
      at(H) {
        let _ = this.indexBase - this.indexStart;
        if (H < _) H += this.backing.length;
        return (H -= _), this.backing.countAt(H);
      }
      incrementBucket(H, _) {
        this.backing.increment(H, _);
      }
      decrementBucket(H, _) {
        this.backing.decrement(H, _);
      }
      trim() {
        for (let H = 0; H < this.length; H++)
          if (this.at(H) !== 0) {
            this.indexStart += H;
            break;
          } else if (H === this.length - 1) {
            this.indexStart = this.indexEnd = this.indexBase = 0;
            return;
          }
        for (let H = this.length - 1; H >= 0; H--)
          if (this.at(H) !== 0) {
            this.indexEnd -= this.length - H - 1;
            break;
          }
        this._rotate();
      }
      downscale(H) {
        this._rotate();
        let _ = 1 + this.indexEnd - this.indexStart,
          q = 1 << H,
          $ = 0,
          K = 0;
        for (let O = this.indexStart; O <= this.indexEnd; ) {
          let T = O % q;
          if (T < 0) T += q;
          for (let z = T; z < q && $ < _; z++) this._relocateBucket(K, $), $++, O++;
          K++;
        }
        (this.indexStart >>= H), (this.indexEnd >>= H), (this.indexBase = this.indexStart);
      }
      clone() {
        return new QF6(this.backing.clone(), this.indexBase, this.indexStart, this.indexEnd);
      }
      _rotate() {
        let H = this.indexBase - this.indexStart;
        if (H === 0) return;
        else if (H > 0)
          this.backing.reverse(0, this.backing.length),
            this.backing.reverse(0, H),
            this.backing.reverse(H, this.backing.length);
        else this.backing.reverse(0, this.backing.length), this.backing.reverse(0, this.backing.length + H);
        this.indexBase = this.indexStart;
      }
      _relocateBucket(H, _) {
        if (H === _) return;
        this.incrementBucket(H, this.backing.emptyBucket(_));
      }
    }
    bb_.Buckets = QF6;
    class lF6 {
      _counts;
      constructor(H = [0]) {
        this._counts = H;
      }
      get length() {
        return this._counts.length;
      }
      countAt(H) {
        return this._counts[H];
      }
      growTo(H, _, q) {
        let $ = Array(H).fill(0);
        $.splice(q, this._counts.length - _, ...this._counts.slice(_)),
          $.splice(0, _, ...this._counts.slice(0, _)),
          (this._counts = $);
      }
      reverse(H, _) {
        let q = Math.floor((H + _) / 2) - H;
        for (let $ = 0; $ < q; $++) {
          let K = this._counts[H + $];
          (this._counts[H + $] = this._counts[_ - $ - 1]), (this._counts[_ - $ - 1] = K);
        }
      }
      emptyBucket(H) {
        let _ = this._counts[H];
        return (this._counts[H] = 0), _;
      }
      increment(H, _) {
        this._counts[H] += _;
      }
      decrement(H, _) {
        if (this._counts[H] >= _) this._counts[H] -= _;
        else this._counts[H] = 0;
      }
      clone() {
        return new lF6([...this._counts]);
      }
    }
  });

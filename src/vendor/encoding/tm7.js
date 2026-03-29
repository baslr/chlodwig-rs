  var tm7 = d((KBO, sm7) => {
    sm7.exports = WP;
    var UaH = Vc();
    function WP(H, _) {
      (this.lo = H >>> 0), (this.hi = _ >>> 0);
    }
    var SAH = (WP.zero = new WP(0, 0));
    SAH.toNumber = function () {
      return 0;
    };
    SAH.zzEncode = SAH.zzDecode = function () {
      return this;
    };
    SAH.length = function () {
      return 1;
    };
    var FG1 = (WP.zeroHash = "\x00\x00\x00\x00\x00\x00\x00\x00");
    WP.fromNumber = function (_) {
      if (_ === 0) return SAH;
      var q = _ < 0;
      if (q) _ = -_;
      var $ = _ >>> 0,
        K = ((_ - $) / 4294967296) >>> 0;
      if (q) {
        if (((K = ~K >>> 0), ($ = ~$ >>> 0), ++$ > 4294967295)) {
          if ((($ = 0), ++K > 4294967295)) K = 0;
        }
      }
      return new WP($, K);
    };
    WP.from = function (_) {
      if (typeof _ === "number") return WP.fromNumber(_);
      if (UaH.isString(_))
        if (UaH.Long) _ = UaH.Long.fromString(_);
        else return WP.fromNumber(parseInt(_, 10));
      return _.low || _.high ? new WP(_.low >>> 0, _.high >>> 0) : SAH;
    };
    WP.prototype.toNumber = function (_) {
      if (!_ && this.hi >>> 31) {
        var q = (~this.lo + 1) >>> 0,
          $ = ~this.hi >>> 0;
        if (!q) $ = ($ + 1) >>> 0;
        return -(q + $ * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    WP.prototype.toLong = function (_) {
      return UaH.Long
        ? new UaH.Long(this.lo | 0, this.hi | 0, Boolean(_))
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(_) };
    };
    var aqH = String.prototype.charCodeAt;
    WP.fromHash = function (_) {
      if (_ === FG1) return SAH;
      return new WP(
        (aqH.call(_, 0) | (aqH.call(_, 1) << 8) | (aqH.call(_, 2) << 16) | (aqH.call(_, 3) << 24)) >>> 0,
        (aqH.call(_, 4) | (aqH.call(_, 5) << 8) | (aqH.call(_, 6) << 16) | (aqH.call(_, 7) << 24)) >>> 0,
      );
    };
    WP.prototype.toHash = function () {
      return String.fromCharCode(
        this.lo & 255,
        (this.lo >>> 8) & 255,
        (this.lo >>> 16) & 255,
        this.lo >>> 24,
        this.hi & 255,
        (this.hi >>> 8) & 255,
        (this.hi >>> 16) & 255,
        this.hi >>> 24,
      );
    };
    WP.prototype.zzEncode = function () {
      var _ = this.hi >> 31;
      return (this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ _) >>> 0), (this.lo = ((this.lo << 1) ^ _) >>> 0), this;
    };
    WP.prototype.zzDecode = function () {
      var _ = -(this.lo & 1);
      return (this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ _) >>> 0), (this.hi = ((this.hi >>> 1) ^ _) >>> 0), this;
    };
    WP.prototype.length = function () {
      var _ = this.lo,
        q = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
        $ = this.hi >>> 24;
      return $ === 0
        ? q === 0
          ? _ < 16384
            ? _ < 128
              ? 1
              : 2
            : _ < 2097152
              ? 3
              : 4
          : q < 16384
            ? q < 128
              ? 5
              : 6
            : q < 2097152
              ? 7
              : 8
        : $ < 128
          ? 9
          : 10;
    };
  });

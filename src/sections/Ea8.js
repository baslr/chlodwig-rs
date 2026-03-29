    mf_();
    qA6();
    Bf_();
    rc$ = (function () {
      function H() {
        this.crc32 = new qKH();
      }
      return (
        (H.prototype.update = function (_) {
          if (ez6(_)) return;
          this.crc32.update(tz6(_));
        }),
        (H.prototype.digest = function () {
          return Za8(this, void 0, void 0, function () {
            return La8(this, function (_) {
              return [2, HA6(this.crc32.digest())];
            });
          });
        }),
        (H.prototype.reset = function () {
          this.crc32 = new qKH();
        }),
        H
      );
    })();

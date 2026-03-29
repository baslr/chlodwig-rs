    uA();
    J5_();
    nG8();
    LZ8();
    V5_();
    R5_();
    vZ8();
    HB();
    luH();
    $S = $xH.validators;
    Q_.forEach(["delete", "get", "head", "options"], function (_) {
      KxH.prototype[_] = function (q, $) {
        return this.request(GI($ || {}, { method: _, url: q, data: ($ || {}).data }));
      };
    });
    Q_.forEach(["post", "put", "patch"], function (_) {
      function q($) {
        return function (O, T, z) {
          return this.request(
            GI(z || {}, { method: _, headers: $ ? { "Content-Type": "multipart/form-data" } : {}, url: O, data: T }),
          );
        };
      }
      (KxH.prototype[_] = q()), (KxH.prototype[_ + "Form"] = q(!0));
    });
    OxH = KxH;

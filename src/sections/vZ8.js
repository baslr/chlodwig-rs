    Xh();
    I5_ = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach((H, _) => {
      I5_[H] = function ($) {
        return typeof $ === H || "a" + (_ < 1 ? "n " : " ") + H;
      };
    });
    kZ8 = {};
    I5_.transitional = function (_, q, $) {
      function K(O, T) {
        return "[Axios v" + X1H + "] Transitional option '" + O + "'" + T + ($ ? ". " + $ : "");
      }
      return (O, T, z) => {
        if (_ === !1) throw new eq(K(T, " has been removed" + (q ? " in " + q : "")), eq.ERR_DEPRECATED);
        if (q && !kZ8[T])
          (kZ8[T] = !0),
            console.warn(K(T, " has been deprecated since v" + q + " and will be removed in the near future"));
        return _ ? _(O, T, z) : !0;
      };
    };
    I5_.spelling = function (_) {
      return (q, $) => {
        return console.warn(`${$} is likely a misspelling of ${_}`), !0;
      };
    };
    $xH = { assertOptions: pD$, validators: I5_ };

    Z1_ = Error.captureStackTrace ? Error.captureStackTrace : (...H) => {};
    E_6 = VIH(() => {
      if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
      try {
        return new Function(""), !0;
      } catch (H) {
        return !1;
      }
    });
    (EIH = new Set(["string", "number", "symbol"])),
      (C_6 = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]));
    (I_6 = {
      safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      int32: [-2147483648, 2147483647],
      uint32: [0, 4294967295],
      float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
      float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
    }),
      (u_6 = {
        int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
        uint64: [BigInt(0), BigInt("18446744073709551615")],
      });

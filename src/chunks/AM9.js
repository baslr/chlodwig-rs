  var AM9 = d((S7z, zM9) => {
    var Zb = KSH();
    zM9.exports = function (H, _, q, $) {
      let K = [Zb.COLORTYPE_COLOR_ALPHA, Zb.COLORTYPE_ALPHA].indexOf($.colorType) !== -1;
      if ($.colorType === $.inputColorType) {
        let M = (function () {
          let J = new ArrayBuffer(2);
          return new DataView(J).setInt16(0, 256, !0), new Int16Array(J)[0] !== 256;
        })();
        if ($.bitDepth === 8 || ($.bitDepth === 16 && M)) return H;
      }
      let O = $.bitDepth !== 16 ? H : new Uint16Array(H.buffer),
        T = 255,
        z = Zb.COLORTYPE_TO_BPP_MAP[$.inputColorType];
      if (z === 4 && !$.inputHasAlpha) z = 3;
      let A = Zb.COLORTYPE_TO_BPP_MAP[$.colorType];
      if ($.bitDepth === 16) (T = 65535), (A *= 2);
      let f = Buffer.alloc(_ * q * A),
        w = 0,
        Y = 0,
        D = $.bgColor || {};
      if (D.red === void 0) D.red = T;
      if (D.green === void 0) D.green = T;
      if (D.blue === void 0) D.blue = T;
      function j() {
        let M,
          J,
          P,
          X = T;
        switch ($.inputColorType) {
          case Zb.COLORTYPE_COLOR_ALPHA:
            (X = O[w + 3]), (M = O[w]), (J = O[w + 1]), (P = O[w + 2]);
            break;
          case Zb.COLORTYPE_COLOR:
            (M = O[w]), (J = O[w + 1]), (P = O[w + 2]);
            break;
          case Zb.COLORTYPE_ALPHA:
            (X = O[w + 1]), (M = O[w]), (J = M), (P = M);
            break;
          case Zb.COLORTYPE_GRAYSCALE:
            (M = O[w]), (J = M), (P = M);
            break;
          default:
            throw Error("input color type:" + $.inputColorType + " is not supported at present");
        }
        if ($.inputHasAlpha) {
          if (!K)
            (X /= T),
              (M = Math.min(Math.max(Math.round((1 - X) * D.red + X * M), 0), T)),
              (J = Math.min(Math.max(Math.round((1 - X) * D.green + X * J), 0), T)),
              (P = Math.min(Math.max(Math.round((1 - X) * D.blue + X * P), 0), T));
        }
        return { red: M, green: J, blue: P, alpha: X };
      }
      for (let M = 0; M < q; M++)
        for (let J = 0; J < _; J++) {
          let P = j(O, w);
          switch ($.colorType) {
            case Zb.COLORTYPE_COLOR_ALPHA:
            case Zb.COLORTYPE_COLOR:
              if ($.bitDepth === 8) {
                if (((f[Y] = P.red), (f[Y + 1] = P.green), (f[Y + 2] = P.blue), K)) f[Y + 3] = P.alpha;
              } else if (
                (f.writeUInt16BE(P.red, Y), f.writeUInt16BE(P.green, Y + 2), f.writeUInt16BE(P.blue, Y + 4), K)
              )
                f.writeUInt16BE(P.alpha, Y + 6);
              break;
            case Zb.COLORTYPE_ALPHA:
            case Zb.COLORTYPE_GRAYSCALE: {
              let X = (P.red + P.green + P.blue) / 3;
              if ($.bitDepth === 8) {
                if (((f[Y] = X), K)) f[Y + 1] = P.alpha;
              } else if ((f.writeUInt16BE(X, Y), K)) f.writeUInt16BE(P.alpha, Y + 2);
              break;
            }
            default:
              throw Error("unrecognised color Type " + $.colorType);
          }
          (w += z), (Y += A);
        }
      return f;
    };
  });

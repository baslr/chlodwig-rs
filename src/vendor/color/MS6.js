  var MS6 = d((jU3, yeq) => {
    var oQH = Neq(),
      heq = {};
    for (let H of Object.keys(oQH)) heq[oQH[H]] = H;
    var P9 = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] },
    };
    yeq.exports = P9;
    for (let H of Object.keys(P9)) {
      if (!("channels" in P9[H])) throw Error("missing channels property: " + H);
      if (!("labels" in P9[H])) throw Error("missing channel labels property: " + H);
      if (P9[H].labels.length !== P9[H].channels) throw Error("channel and label counts mismatch: " + H);
      let { channels: _, labels: q } = P9[H];
      delete P9[H].channels,
        delete P9[H].labels,
        Object.defineProperty(P9[H], "channels", { value: _ }),
        Object.defineProperty(P9[H], "labels", { value: q });
    }
    P9.rgb.hsl = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.min(_, q, $),
        O = Math.max(_, q, $),
        T = O - K,
        z,
        A;
      if (O === K) z = 0;
      else if (_ === O) z = (q - $) / T;
      else if (q === O) z = 2 + ($ - _) / T;
      else if ($ === O) z = 4 + (_ - q) / T;
      if (((z = Math.min(z * 60, 360)), z < 0)) z += 360;
      let f = (K + O) / 2;
      if (O === K) A = 0;
      else if (f <= 0.5) A = T / (O + K);
      else A = T / (2 - O - K);
      return [z, A * 100, f * 100];
    };
    P9.rgb.hsv = function (H) {
      let _,
        q,
        $,
        K,
        O,
        T = H[0] / 255,
        z = H[1] / 255,
        A = H[2] / 255,
        f = Math.max(T, z, A),
        w = f - Math.min(T, z, A),
        Y = function (D) {
          return (f - D) / 6 / w + 0.5;
        };
      if (w === 0) (K = 0), (O = 0);
      else {
        if (((O = w / f), (_ = Y(T)), (q = Y(z)), ($ = Y(A)), T === f)) K = $ - q;
        else if (z === f) K = 0.3333333333333333 + _ - $;
        else if (A === f) K = 0.6666666666666666 + q - _;
        if (K < 0) K += 1;
        else if (K > 1) K -= 1;
      }
      return [K * 360, O * 100, f * 100];
    };
    P9.rgb.hwb = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2],
        K = P9.rgb.hsl(H)[0],
        O = 0.00392156862745098 * Math.min(_, Math.min(q, $));
      return ($ = 1 - 0.00392156862745098 * Math.max(_, Math.max(q, $))), [K, O * 100, $ * 100];
    };
    P9.rgb.cmyk = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.min(1 - _, 1 - q, 1 - $),
        O = (1 - _ - K) / (1 - K) || 0,
        T = (1 - q - K) / (1 - K) || 0,
        z = (1 - $ - K) / (1 - K) || 0;
      return [O * 100, T * 100, z * 100, K * 100];
    };
    function Jx4(H, _) {
      return (H[0] - _[0]) ** 2 + (H[1] - _[1]) ** 2 + (H[2] - _[2]) ** 2;
    }
    P9.rgb.keyword = function (H) {
      let _ = heq[H];
      if (_) return _;
      let q = 1 / 0,
        $;
      for (let K of Object.keys(oQH)) {
        let O = oQH[K],
          T = Jx4(H, O);
        if (T < q) (q = T), ($ = K);
      }
      return $;
    };
    P9.keyword.rgb = function (H) {
      return oQH[H];
    };
    P9.rgb.xyz = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255;
      (_ = _ > 0.04045 ? ((_ + 0.055) / 1.055) ** 2.4 : _ / 12.92),
        (q = q > 0.04045 ? ((q + 0.055) / 1.055) ** 2.4 : q / 12.92),
        ($ = $ > 0.04045 ? (($ + 0.055) / 1.055) ** 2.4 : $ / 12.92);
      let K = _ * 0.4124 + q * 0.3576 + $ * 0.1805,
        O = _ * 0.2126 + q * 0.7152 + $ * 0.0722,
        T = _ * 0.0193 + q * 0.1192 + $ * 0.9505;
      return [K * 100, O * 100, T * 100];
    };
    P9.rgb.lab = function (H) {
      let _ = P9.rgb.xyz(H),
        q = _[0],
        $ = _[1],
        K = _[2];
      (q /= 95.047),
        ($ /= 100),
        (K /= 108.883),
        (q = q > 0.008856 ? q ** 0.3333333333333333 : 7.787 * q + 0.13793103448275862),
        ($ = $ > 0.008856 ? $ ** 0.3333333333333333 : 7.787 * $ + 0.13793103448275862),
        (K = K > 0.008856 ? K ** 0.3333333333333333 : 7.787 * K + 0.13793103448275862);
      let O = 116 * $ - 16,
        T = 500 * (q - $),
        z = 200 * ($ - K);
      return [O, T, z];
    };
    P9.hsl.rgb = function (H) {
      let _ = H[0] / 360,
        q = H[1] / 100,
        $ = H[2] / 100,
        K,
        O,
        T;
      if (q === 0) return (T = $ * 255), [T, T, T];
      if ($ < 0.5) K = $ * (1 + q);
      else K = $ + q - $ * q;
      let z = 2 * $ - K,
        A = [0, 0, 0];
      for (let f = 0; f < 3; f++) {
        if (((O = _ + 0.3333333333333333 * -(f - 1)), O < 0)) O++;
        if (O > 1) O--;
        if (6 * O < 1) T = z + (K - z) * 6 * O;
        else if (2 * O < 1) T = K;
        else if (3 * O < 2) T = z + (K - z) * (0.6666666666666666 - O) * 6;
        else T = z;
        A[f] = T * 255;
      }
      return A;
    };
    P9.hsl.hsv = function (H) {
      let _ = H[0],
        q = H[1] / 100,
        $ = H[2] / 100,
        K = q,
        O = Math.max($, 0.01);
      ($ *= 2), (q *= $ <= 1 ? $ : 2 - $), (K *= O <= 1 ? O : 2 - O);
      let T = ($ + q) / 2,
        z = $ === 0 ? (2 * K) / (O + K) : (2 * q) / ($ + q);
      return [_, z * 100, T * 100];
    };
    P9.hsv.rgb = function (H) {
      let _ = H[0] / 60,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = Math.floor(_) % 6,
        O = _ - Math.floor(_),
        T = 255 * $ * (1 - q),
        z = 255 * $ * (1 - q * O),
        A = 255 * $ * (1 - q * (1 - O));
      switch ((($ *= 255), K)) {
        case 0:
          return [$, A, T];
        case 1:
          return [z, $, T];
        case 2:
          return [T, $, A];
        case 3:
          return [T, z, $];
        case 4:
          return [A, T, $];
        case 5:
          return [$, T, z];
      }
    };
    P9.hsv.hsl = function (H) {
      let _ = H[0],
        q = H[1] / 100,
        $ = H[2] / 100,
        K = Math.max($, 0.01),
        O,
        T;
      T = (2 - q) * $;
      let z = (2 - q) * K;
      return (O = q * K), (O /= z <= 1 ? z : 2 - z), (O = O || 0), (T /= 2), [_, O * 100, T * 100];
    };
    P9.hwb.rgb = function (H) {
      let _ = H[0] / 360,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = q + $,
        O;
      if (K > 1) (q /= K), ($ /= K);
      let T = Math.floor(6 * _),
        z = 1 - $;
      if (((O = 6 * _ - T), (T & 1) !== 0)) O = 1 - O;
      let A = q + O * (z - q),
        f,
        w,
        Y;
      switch (T) {
        default:
        case 6:
        case 0:
          (f = z), (w = A), (Y = q);
          break;
        case 1:
          (f = A), (w = z), (Y = q);
          break;
        case 2:
          (f = q), (w = z), (Y = A);
          break;
        case 3:
          (f = q), (w = A), (Y = z);
          break;
        case 4:
          (f = A), (w = q), (Y = z);
          break;
        case 5:
          (f = z), (w = q), (Y = A);
          break;
      }
      return [f * 255, w * 255, Y * 255];
    };
    P9.cmyk.rgb = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = H[3] / 100,
        O = 1 - Math.min(1, _ * (1 - K) + K),
        T = 1 - Math.min(1, q * (1 - K) + K),
        z = 1 - Math.min(1, $ * (1 - K) + K);
      return [O * 255, T * 255, z * 255];
    };
    P9.xyz.rgb = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K,
        O,
        T;
      return (
        (K = _ * 3.2406 + q * -1.5372 + $ * -0.4986),
        (O = _ * -0.9689 + q * 1.8758 + $ * 0.0415),
        (T = _ * 0.0557 + q * -0.204 + $ * 1.057),
        (K = K > 0.0031308 ? 1.055 * K ** 0.4166666666666667 - 0.055 : K * 12.92),
        (O = O > 0.0031308 ? 1.055 * O ** 0.4166666666666667 - 0.055 : O * 12.92),
        (T = T > 0.0031308 ? 1.055 * T ** 0.4166666666666667 - 0.055 : T * 12.92),
        (K = Math.min(Math.max(0, K), 1)),
        (O = Math.min(Math.max(0, O), 1)),
        (T = Math.min(Math.max(0, T), 1)),
        [K * 255, O * 255, T * 255]
      );
    };
    P9.xyz.lab = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2];
      (_ /= 95.047),
        (q /= 100),
        ($ /= 108.883),
        (_ = _ > 0.008856 ? _ ** 0.3333333333333333 : 7.787 * _ + 0.13793103448275862),
        (q = q > 0.008856 ? q ** 0.3333333333333333 : 7.787 * q + 0.13793103448275862),
        ($ = $ > 0.008856 ? $ ** 0.3333333333333333 : 7.787 * $ + 0.13793103448275862);
      let K = 116 * q - 16,
        O = 500 * (_ - q),
        T = 200 * (q - $);
      return [K, O, T];
    };
    P9.lab.xyz = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2],
        K,
        O,
        T;
      (O = (_ + 16) / 116), (K = q / 500 + O), (T = O - $ / 200);
      let z = O ** 3,
        A = K ** 3,
        f = T ** 3;
      return (
        (O = z > 0.008856 ? z : (O - 0.13793103448275862) / 7.787),
        (K = A > 0.008856 ? A : (K - 0.13793103448275862) / 7.787),
        (T = f > 0.008856 ? f : (T - 0.13793103448275862) / 7.787),
        (K *= 95.047),
        (O *= 100),
        (T *= 108.883),
        [K, O, T]
      );
    };
    P9.lab.lch = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2],
        K;
      if (((K = (Math.atan2($, q) * 360) / 2 / Math.PI), K < 0)) K += 360;
      let T = Math.sqrt(q * q + $ * $);
      return [_, T, K];
    };
    P9.lch.lab = function (H) {
      let _ = H[0],
        q = H[1],
        K = (H[2] / 360) * 2 * Math.PI,
        O = q * Math.cos(K),
        T = q * Math.sin(K);
      return [_, O, T];
    };
    P9.rgb.ansi16 = function (H, _ = null) {
      let [q, $, K] = H,
        O = _ === null ? P9.rgb.hsv(H)[2] : _;
      if (((O = Math.round(O / 50)), O === 0)) return 30;
      let T = 30 + ((Math.round(K / 255) << 2) | (Math.round($ / 255) << 1) | Math.round(q / 255));
      if (O === 2) T += 60;
      return T;
    };
    P9.hsv.ansi16 = function (H) {
      return P9.rgb.ansi16(P9.hsv.rgb(H), H[2]);
    };
    P9.rgb.ansi256 = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2];
      if (_ === q && q === $) {
        if (_ < 8) return 16;
        if (_ > 248) return 231;
        return Math.round(((_ - 8) / 247) * 24) + 232;
      }
      return 16 + 36 * Math.round((_ / 255) * 5) + 6 * Math.round((q / 255) * 5) + Math.round(($ / 255) * 5);
    };
    P9.ansi16.rgb = function (H) {
      let _ = H % 10;
      if (_ === 0 || _ === 7) {
        if (H > 50) _ += 3.5;
        return (_ = (_ / 10.5) * 255), [_, _, _];
      }
      let q = (~~(H > 50) + 1) * 0.5,
        $ = (_ & 1) * q * 255,
        K = ((_ >> 1) & 1) * q * 255,
        O = ((_ >> 2) & 1) * q * 255;
      return [$, K, O];
    };
    P9.ansi256.rgb = function (H) {
      if (H >= 232) {
        let O = (H - 232) * 10 + 8;
        return [O, O, O];
      }
      H -= 16;
      let _,
        q = (Math.floor(H / 36) / 5) * 255,
        $ = (Math.floor((_ = H % 36) / 6) / 5) * 255,
        K = ((_ % 6) / 5) * 255;
      return [q, $, K];
    };
    P9.rgb.hex = function (H) {
      let q = (((Math.round(H[0]) & 255) << 16) + ((Math.round(H[1]) & 255) << 8) + (Math.round(H[2]) & 255))
        .toString(16)
        .toUpperCase();
      return "000000".substring(q.length) + q;
    };
    P9.hex.rgb = function (H) {
      let _ = H.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!_) return [0, 0, 0];
      let q = _[0];
      if (_[0].length === 3)
        q = q
          .split("")
          .map((z) => {
            return z + z;
          })
          .join("");
      let $ = parseInt(q, 16),
        K = ($ >> 16) & 255,
        O = ($ >> 8) & 255,
        T = $ & 255;
      return [K, O, T];
    };
    P9.rgb.hcg = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.max(Math.max(_, q), $),
        O = Math.min(Math.min(_, q), $),
        T = K - O,
        z,
        A;
      if (T < 1) z = O / (1 - T);
      else z = 0;
      if (T <= 0) A = 0;
      else if (K === _) A = ((q - $) / T) % 6;
      else if (K === q) A = 2 + ($ - _) / T;
      else A = 4 + (_ - q) / T;
      return (A /= 6), (A %= 1), [A * 360, T * 100, z * 100];
    };
    P9.hsl.hcg = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = q < 0.5 ? 2 * _ * q : 2 * _ * (1 - q),
        K = 0;
      if ($ < 1) K = (q - 0.5 * $) / (1 - $);
      return [H[0], $ * 100, K * 100];
    };
    P9.hsv.hcg = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ * q,
        K = 0;
      if ($ < 1) K = (q - $) / (1 - $);
      return [H[0], $ * 100, K * 100];
    };
    P9.hcg.rgb = function (H) {
      let _ = H[0] / 360,
        q = H[1] / 100,
        $ = H[2] / 100;
      if (q === 0) return [$ * 255, $ * 255, $ * 255];
      let K = [0, 0, 0],
        O = (_ % 1) * 6,
        T = O % 1,
        z = 1 - T,
        A = 0;
      switch (Math.floor(O)) {
        case 0:
          (K[0] = 1), (K[1] = T), (K[2] = 0);
          break;
        case 1:
          (K[0] = z), (K[1] = 1), (K[2] = 0);
          break;
        case 2:
          (K[0] = 0), (K[1] = 1), (K[2] = T);
          break;
        case 3:
          (K[0] = 0), (K[1] = z), (K[2] = 1);
          break;
        case 4:
          (K[0] = T), (K[1] = 0), (K[2] = 1);
          break;
        default:
          (K[0] = 1), (K[1] = 0), (K[2] = z);
      }
      return (A = (1 - q) * $), [(q * K[0] + A) * 255, (q * K[1] + A) * 255, (q * K[2] + A) * 255];
    };
    P9.hcg.hsv = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ + q * (1 - _),
        K = 0;
      if ($ > 0) K = _ / $;
      return [H[0], K * 100, $ * 100];
    };
    P9.hcg.hsl = function (H) {
      let _ = H[1] / 100,
        $ = (H[2] / 100) * (1 - _) + 0.5 * _,
        K = 0;
      if ($ > 0 && $ < 0.5) K = _ / (2 * $);
      else if ($ >= 0.5 && $ < 1) K = _ / (2 * (1 - $));
      return [H[0], K * 100, $ * 100];
    };
    P9.hcg.hwb = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ + q * (1 - _);
      return [H[0], ($ - _) * 100, (1 - $) * 100];
    };
    P9.hwb.hcg = function (H) {
      let _ = H[1] / 100,
        $ = 1 - H[2] / 100,
        K = $ - _,
        O = 0;
      if (K < 1) O = ($ - K) / (1 - K);
      return [H[0], K * 100, O * 100];
    };
    P9.apple.rgb = function (H) {
      return [(H[0] / 65535) * 255, (H[1] / 65535) * 255, (H[2] / 65535) * 255];
    };
    P9.rgb.apple = function (H) {
      return [(H[0] / 255) * 65535, (H[1] / 255) * 65535, (H[2] / 255) * 65535];
    };
    P9.gray.rgb = function (H) {
      return [(H[0] / 100) * 255, (H[0] / 100) * 255, (H[0] / 100) * 255];
    };
    P9.gray.hsl = function (H) {
      return [0, 0, H[0]];
    };
    P9.gray.hsv = P9.gray.hsl;
    P9.gray.hwb = function (H) {
      return [0, 100, H[0]];
    };
    P9.gray.cmyk = function (H) {
      return [0, 0, 0, H[0]];
    };
    P9.gray.lab = function (H) {
      return [H[0], 0, 0];
    };
    P9.gray.hex = function (H) {
      let _ = Math.round((H[0] / 100) * 255) & 255,
        $ = ((_ << 16) + (_ << 8) + _).toString(16).toUpperCase();
      return "000000".substring($.length) + $;
    };
    P9.rgb.gray = function (H) {
      return [((H[0] + H[1] + H[2]) / 3 / 255) * 100];
    };
  });

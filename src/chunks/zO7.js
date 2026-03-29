  var zO7 = d((vHO, TO7) => {
    var { defineProperty: II6, getOwnPropertyDescriptor: _a4, getOwnPropertyNames: qa4 } = Object,
      $a4 = Object.prototype.hasOwnProperty,
      Ka4 = (H, _) => {
        for (var q in _) II6(H, q, { get: _[q], enumerable: !0 });
      },
      Oa4 = (H, _, q, $) => {
        if ((_ && typeof _ === "object") || typeof _ === "function") {
          for (let K of qa4(_))
            if (!$a4.call(H, K) && K !== q)
              II6(H, K, { get: () => _[K], enumerable: !($ = _a4(_, K)) || $.enumerable });
        }
        return H;
      },
      Ta4 = (H) => Oa4(II6({}, "__esModule", { value: !0 }), H),
      qO7 = {};
    Ka4(qO7, { default: () => Ra4 });
    TO7.exports = Ta4(qO7);
    var Zd = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50],
      },
      $O7 = Object.create(null);
    for (let H in Zd) if (Object.hasOwn(Zd, H)) $O7[Zd[H]] = H;
    var $v = { to: {}, get: {} };
    $v.get = function (H) {
      let _ = H.slice(0, 3).toLowerCase(),
        q,
        $;
      switch (_) {
        case "hsl": {
          (q = $v.get.hsl(H)), ($ = "hsl");
          break;
        }
        case "hwb": {
          (q = $v.get.hwb(H)), ($ = "hwb");
          break;
        }
        default: {
          (q = $v.get.rgb(H)), ($ = "rgb");
          break;
        }
      }
      if (!q) return null;
      return { model: $, value: q };
    };
    $v.get.rgb = function (H) {
      if (!H) return null;
      let _ = /^#([a-f\d]{3,4})$/i,
        q = /^#([a-f\d]{6})([a-f\d]{2})?$/i,
        $ =
          /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[\s,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/,
        K =
          /^rgba?\(\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[\s,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/,
        O = /^(\w+)$/,
        T = [0, 0, 0, 1],
        z,
        A,
        f;
      if ((z = H.match(q))) {
        (f = z[2]), (z = z[1]);
        for (A = 0; A < 3; A++) {
          let w = A * 2;
          T[A] = Number.parseInt(z.slice(w, w + 2), 16);
        }
        if (f) T[3] = Number.parseInt(f, 16) / 255;
      } else if ((z = H.match(_))) {
        (z = z[1]), (f = z[3]);
        for (A = 0; A < 3; A++) T[A] = Number.parseInt(z[A] + z[A], 16);
        if (f) T[3] = Number.parseInt(f + f, 16) / 255;
      } else if ((z = H.match($))) {
        for (A = 0; A < 3; A++) T[A] = Number.parseInt(z[A + 1], 10);
        if (z[4]) T[3] = z[5] ? Number.parseFloat(z[4]) * 0.01 : Number.parseFloat(z[4]);
      } else if ((z = H.match(K))) {
        for (A = 0; A < 3; A++) T[A] = Math.round(Number.parseFloat(z[A + 1]) * 2.55);
        if (z[4]) T[3] = z[5] ? Number.parseFloat(z[4]) * 0.01 : Number.parseFloat(z[4]);
      } else if ((z = H.match(O))) {
        if (z[1] === "transparent") return [0, 0, 0, 0];
        if (!Object.hasOwn(Zd, z[1])) return null;
        return (T = Zd[z[1]]), (T[3] = 1), T;
      } else return null;
      for (A = 0; A < 3; A++) T[A] = K8H(T[A], 0, 255);
      return (T[3] = K8H(T[3], 0, 1)), T;
    };
    $v.get.hsl = function (H) {
      if (!H) return null;
      let _ =
          /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/,
        q = H.match(_);
      if (q) {
        let $ = Number.parseFloat(q[4]),
          K = ((Number.parseFloat(q[1]) % 360) + 360) % 360,
          O = K8H(Number.parseFloat(q[2]), 0, 100),
          T = K8H(Number.parseFloat(q[3]), 0, 100),
          z = K8H(Number.isNaN($) ? 1 : $, 0, 1);
        return [K, O, T, z];
      }
      return null;
    };
    $v.get.hwb = function (H) {
      if (!H) return null;
      let _ =
          /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*[\s,]\s*([+-]?[\d.]+)%\s*[\s,]\s*([+-]?[\d.]+)%\s*(?:[\s,]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/,
        q = H.match(_);
      if (q) {
        let $ = Number.parseFloat(q[4]),
          K = ((Number.parseFloat(q[1]) % 360) + 360) % 360,
          O = K8H(Number.parseFloat(q[2]), 0, 100),
          T = K8H(Number.parseFloat(q[3]), 0, 100),
          z = K8H(Number.isNaN($) ? 1 : $, 0, 1);
        return [K, O, T, z];
      }
      return null;
    };
    $v.to.hex = function (...H) {
      return "#" + $N_(H[0]) + $N_(H[1]) + $N_(H[2]) + (H[3] < 1 ? $N_(Math.round(H[3] * 255)) : "");
    };
    $v.to.rgb = function (...H) {
      return H.length < 4 || H[3] === 1
        ? "rgb(" + Math.round(H[0]) + ", " + Math.round(H[1]) + ", " + Math.round(H[2]) + ")"
        : "rgba(" + Math.round(H[0]) + ", " + Math.round(H[1]) + ", " + Math.round(H[2]) + ", " + H[3] + ")";
    };
    $v.to.rgb.percent = function (...H) {
      let _ = Math.round((H[0] / 255) * 100),
        q = Math.round((H[1] / 255) * 100),
        $ = Math.round((H[2] / 255) * 100);
      return H.length < 4 || H[3] === 1
        ? "rgb(" + _ + "%, " + q + "%, " + $ + "%)"
        : "rgba(" + _ + "%, " + q + "%, " + $ + "%, " + H[3] + ")";
    };
    $v.to.hsl = function (...H) {
      return H.length < 4 || H[3] === 1
        ? "hsl(" + H[0] + ", " + H[1] + "%, " + H[2] + "%)"
        : "hsla(" + H[0] + ", " + H[1] + "%, " + H[2] + "%, " + H[3] + ")";
    };
    $v.to.hwb = function (...H) {
      let _ = "";
      if (H.length >= 4 && H[3] !== 1) _ = ", " + H[3];
      return "hwb(" + H[0] + ", " + H[1] + "%, " + H[2] + "%" + _ + ")";
    };
    $v.to.keyword = function (...H) {
      return $O7[H.slice(0, 3)];
    };
    function K8H(H, _, q) {
      return Math.min(Math.max(_, H), q);
    }
    function $N_(H) {
      let _ = Math.round(H).toString(16).toUpperCase();
      return _.length < 2 ? "0" + _ : _;
    }
    var JZH = $v,
      KO7 = {};
    for (let H of Object.keys(Zd)) KO7[Zd[H]] = H;
    var b7 = {
        rgb: { channels: 3, labels: "rgb" },
        hsl: { channels: 3, labels: "hsl" },
        hsv: { channels: 3, labels: "hsv" },
        hwb: { channels: 3, labels: "hwb" },
        cmyk: { channels: 4, labels: "cmyk" },
        xyz: { channels: 3, labels: "xyz" },
        lab: { channels: 3, labels: "lab" },
        oklab: { channels: 3, labels: ["okl", "oka", "okb"] },
        lch: { channels: 3, labels: "lch" },
        oklch: { channels: 3, labels: ["okl", "okc", "okh"] },
        hex: { channels: 1, labels: ["hex"] },
        keyword: { channels: 1, labels: ["keyword"] },
        ansi16: { channels: 1, labels: ["ansi16"] },
        ansi256: { channels: 1, labels: ["ansi256"] },
        hcg: { channels: 3, labels: ["h", "c", "g"] },
        apple: { channels: 3, labels: ["r16", "g16", "b16"] },
        gray: { channels: 1, labels: ["gray"] },
      },
      NTH = b7,
      Ln = 0.008856451679035631;
    function XZH(H) {
      let _ = H > 0.0031308 ? 1.055 * H ** 0.4166666666666667 - 0.055 : H * 12.92;
      return Math.min(Math.max(0, _), 1);
    }
    function WZH(H) {
      return H > 0.04045 ? ((H + 0.055) / 1.055) ** 2.4 : H / 12.92;
    }
    for (let H of Object.keys(b7)) {
      if (!("channels" in b7[H])) throw Error("missing channels property: " + H);
      if (!("labels" in b7[H])) throw Error("missing channel labels property: " + H);
      if (b7[H].labels.length !== b7[H].channels) throw Error("channel and label counts mismatch: " + H);
      let { channels: _, labels: q } = b7[H];
      delete b7[H].channels,
        delete b7[H].labels,
        Object.defineProperty(b7[H], "channels", { value: _ }),
        Object.defineProperty(b7[H], "labels", { value: q });
    }
    b7.rgb.hsl = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.min(_, q, $),
        O = Math.max(_, q, $),
        T = O - K,
        z,
        A;
      switch (O) {
        case K: {
          z = 0;
          break;
        }
        case _: {
          z = (q - $) / T;
          break;
        }
        case q: {
          z = 2 + ($ - _) / T;
          break;
        }
        case $: {
          z = 4 + (_ - q) / T;
          break;
        }
      }
      if (((z = Math.min(z * 60, 360)), z < 0)) z += 360;
      let f = (K + O) / 2;
      if (O === K) A = 0;
      else if (f <= 0.5) A = T / (O + K);
      else A = T / (2 - O - K);
      return [z, A * 100, f * 100];
    };
    b7.rgb.hsv = function (H) {
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
        switch (((O = w / f), (_ = Y(T)), (q = Y(z)), ($ = Y(A)), f)) {
          case T: {
            K = $ - q;
            break;
          }
          case z: {
            K = 0.3333333333333333 + _ - $;
            break;
          }
          case A: {
            K = 0.6666666666666666 + q - _;
            break;
          }
        }
        if (K < 0) K += 1;
        else if (K > 1) K -= 1;
      }
      return [K * 360, O * 100, f * 100];
    };
    b7.rgb.hwb = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2],
        K = b7.rgb.hsl(H)[0],
        O = 0.00392156862745098 * Math.min(_, Math.min(q, $));
      return ($ = 1 - 0.00392156862745098 * Math.max(_, Math.max(q, $))), [K, O * 100, $ * 100];
    };
    b7.rgb.oklab = function (H) {
      let _ = WZH(H[0] / 255),
        q = WZH(H[1] / 255),
        $ = WZH(H[2] / 255),
        K = Math.cbrt(0.4122214708 * _ + 0.5363325363 * q + 0.0514459929 * $),
        O = Math.cbrt(0.2119034982 * _ + 0.6806995451 * q + 0.1073969566 * $),
        T = Math.cbrt(0.0883024619 * _ + 0.2817188376 * q + 0.6299787005 * $),
        z = 0.2104542553 * K + 0.793617785 * O - 0.0040720468 * T,
        A = 1.9779984951 * K - 2.428592205 * O + 0.4505937099 * T,
        f = 0.0259040371 * K + 0.7827717662 * O - 0.808675766 * T;
      return [z * 100, A * 100, f * 100];
    };
    b7.rgb.cmyk = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.min(1 - _, 1 - q, 1 - $),
        O = (1 - _ - K) / (1 - K) || 0,
        T = (1 - q - K) / (1 - K) || 0,
        z = (1 - $ - K) / (1 - K) || 0;
      return [O * 100, T * 100, z * 100, K * 100];
    };
    function za4(H, _) {
      return (H[0] - _[0]) ** 2 + (H[1] - _[1]) ** 2 + (H[2] - _[2]) ** 2;
    }
    b7.rgb.keyword = function (H) {
      let _ = KO7[H];
      if (_) return _;
      let q = Number.POSITIVE_INFINITY,
        $;
      for (let K of Object.keys(Zd)) {
        let O = Zd[K],
          T = za4(H, O);
        if (T < q) (q = T), ($ = K);
      }
      return $;
    };
    b7.keyword.rgb = function (H) {
      return Zd[H];
    };
    b7.rgb.xyz = function (H) {
      let _ = WZH(H[0] / 255),
        q = WZH(H[1] / 255),
        $ = WZH(H[2] / 255),
        K = _ * 0.4124564 + q * 0.3575761 + $ * 0.1804375,
        O = _ * 0.2126729 + q * 0.7151522 + $ * 0.072175,
        T = _ * 0.0193339 + q * 0.119192 + $ * 0.9503041;
      return [K * 100, O * 100, T * 100];
    };
    b7.rgb.lab = function (H) {
      let _ = b7.rgb.xyz(H),
        q = _[0],
        $ = _[1],
        K = _[2];
      (q /= 95.047),
        ($ /= 100),
        (K /= 108.883),
        (q = q > Ln ? q ** 0.3333333333333333 : 7.787 * q + 0.13793103448275862),
        ($ = $ > Ln ? $ ** 0.3333333333333333 : 7.787 * $ + 0.13793103448275862),
        (K = K > Ln ? K ** 0.3333333333333333 : 7.787 * K + 0.13793103448275862);
      let O = 116 * $ - 16,
        T = 500 * (q - $),
        z = 200 * ($ - K);
      return [O, T, z];
    };
    b7.hsl.rgb = function (H) {
      let _ = H[0] / 360,
        q = H[1] / 100,
        $ = H[2] / 100,
        K,
        O;
      if (q === 0) return (O = $ * 255), [O, O, O];
      let T = $ < 0.5 ? $ * (1 + q) : $ + q - $ * q,
        z = 2 * $ - T,
        A = [0, 0, 0];
      for (let f = 0; f < 3; f++) {
        if (((K = _ + 0.3333333333333333 * -(f - 1)), K < 0)) K++;
        if (K > 1) K--;
        if (6 * K < 1) O = z + (T - z) * 6 * K;
        else if (2 * K < 1) O = T;
        else if (3 * K < 2) O = z + (T - z) * (0.6666666666666666 - K) * 6;
        else O = z;
        A[f] = O * 255;
      }
      return A;
    };
    b7.hsl.hsv = function (H) {
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
    b7.hsv.rgb = function (H) {
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
    b7.hsv.hsl = function (H) {
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
    b7.hwb.rgb = function (H) {
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
        case 0: {
          (f = z), (w = A), (Y = q);
          break;
        }
        case 1: {
          (f = A), (w = z), (Y = q);
          break;
        }
        case 2: {
          (f = q), (w = z), (Y = A);
          break;
        }
        case 3: {
          (f = q), (w = A), (Y = z);
          break;
        }
        case 4: {
          (f = A), (w = q), (Y = z);
          break;
        }
        case 5: {
          (f = z), (w = q), (Y = A);
          break;
        }
      }
      return [f * 255, w * 255, Y * 255];
    };
    b7.cmyk.rgb = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = H[3] / 100,
        O = 1 - Math.min(1, _ * (1 - K) + K),
        T = 1 - Math.min(1, q * (1 - K) + K),
        z = 1 - Math.min(1, $ * (1 - K) + K);
      return [O * 255, T * 255, z * 255];
    };
    b7.xyz.rgb = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K,
        O,
        T;
      return (
        (K = _ * 3.2404542 + q * -1.5371385 + $ * -0.4985314),
        (O = _ * -0.969266 + q * 1.8760108 + $ * 0.041556),
        (T = _ * 0.0556434 + q * -0.2040259 + $ * 1.0572252),
        (K = XZH(K)),
        (O = XZH(O)),
        (T = XZH(T)),
        [K * 255, O * 255, T * 255]
      );
    };
    b7.xyz.lab = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2];
      (_ /= 95.047),
        (q /= 100),
        ($ /= 108.883),
        (_ = _ > Ln ? _ ** 0.3333333333333333 : 7.787 * _ + 0.13793103448275862),
        (q = q > Ln ? q ** 0.3333333333333333 : 7.787 * q + 0.13793103448275862),
        ($ = $ > Ln ? $ ** 0.3333333333333333 : 7.787 * $ + 0.13793103448275862);
      let K = 116 * q - 16,
        O = 500 * (_ - q),
        T = 200 * (q - $);
      return [K, O, T];
    };
    b7.xyz.oklab = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = Math.cbrt(0.8189330101 * _ + 0.3618667424 * q - 0.1288597137 * $),
        O = Math.cbrt(0.0329845436 * _ + 0.9293118715 * q + 0.0361456387 * $),
        T = Math.cbrt(0.0482003018 * _ + 0.2643662691 * q + 0.633851707 * $),
        z = 0.2104542553 * K + 0.793617785 * O - 0.0040720468 * T,
        A = 1.9779984951 * K - 2.428592205 * O + 0.4505937099 * T,
        f = 0.0259040371 * K + 0.7827717662 * O - 0.808675766 * T;
      return [z * 100, A * 100, f * 100];
    };
    b7.oklab.oklch = function (H) {
      return b7.lab.lch(H);
    };
    b7.oklab.xyz = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = (0.999999998 * _ + 0.396337792 * q + 0.215803758 * $) ** 3,
        O = (1.000000008 * _ - 0.105561342 * q - 0.063854175 * $) ** 3,
        T = (1.000000055 * _ - 0.089484182 * q - 1.291485538 * $) ** 3,
        z = 1.227013851 * K - 0.55779998 * O + 0.281256149 * T,
        A = -0.040580178 * K + 1.11225687 * O - 0.071676679 * T,
        f = -0.076381285 * K - 0.421481978 * O + 1.58616322 * T;
      return [z * 100, A * 100, f * 100];
    };
    b7.oklab.rgb = function (H) {
      let _ = H[0] / 100,
        q = H[1] / 100,
        $ = H[2] / 100,
        K = (_ + 0.3963377774 * q + 0.2158037573 * $) ** 3,
        O = (_ - 0.1055613458 * q - 0.0638541728 * $) ** 3,
        T = (_ - 0.0894841775 * q - 1.291485548 * $) ** 3,
        z = XZH(4.0767416621 * K - 3.3077115913 * O + 0.2309699292 * T),
        A = XZH(-1.2684380046 * K + 2.6097574011 * O - 0.3413193965 * T),
        f = XZH(-0.0041960863 * K - 0.7034186147 * O + 1.707614701 * T);
      return [z * 255, A * 255, f * 255];
    };
    b7.oklch.oklab = function (H) {
      return b7.lch.lab(H);
    };
    b7.lab.xyz = function (H) {
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
        (O = z > Ln ? z : (O - 0.13793103448275862) / 7.787),
        (K = A > Ln ? A : (K - 0.13793103448275862) / 7.787),
        (T = f > Ln ? f : (T - 0.13793103448275862) / 7.787),
        (K *= 95.047),
        (O *= 100),
        (T *= 108.883),
        [K, O, T]
      );
    };
    b7.lab.lch = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2],
        K;
      if (((K = (Math.atan2($, q) * 360) / 2 / Math.PI), K < 0)) K += 360;
      let T = Math.sqrt(q * q + $ * $);
      return [_, T, K];
    };
    b7.lch.lab = function (H) {
      let _ = H[0],
        q = H[1],
        K = (H[2] / 360) * 2 * Math.PI,
        O = q * Math.cos(K),
        T = q * Math.sin(K);
      return [_, O, T];
    };
    b7.rgb.ansi16 = function (H, _ = null) {
      let [q, $, K] = H,
        O = _ === null ? b7.rgb.hsv(H)[2] : _;
      if (((O = Math.round(O / 50)), O === 0)) return 30;
      let T = 30 + ((Math.round(K / 255) << 2) | (Math.round($ / 255) << 1) | Math.round(q / 255));
      if (O === 2) T += 60;
      return T;
    };
    b7.hsv.ansi16 = function (H) {
      return b7.rgb.ansi16(b7.hsv.rgb(H), H[2]);
    };
    b7.rgb.ansi256 = function (H) {
      let _ = H[0],
        q = H[1],
        $ = H[2];
      if (_ >> 4 === q >> 4 && q >> 4 === $ >> 4) {
        if (_ < 8) return 16;
        if (_ > 248) return 231;
        return Math.round(((_ - 8) / 247) * 24) + 232;
      }
      return 16 + 36 * Math.round((_ / 255) * 5) + 6 * Math.round((q / 255) * 5) + Math.round(($ / 255) * 5);
    };
    b7.ansi16.rgb = function (H) {
      H = H[0];
      let _ = H % 10;
      if (_ === 0 || _ === 7) {
        if (H > 50) _ += 3.5;
        return (_ = (_ / 10.5) * 255), [_, _, _];
      }
      let q = (Math.trunc(H > 50) + 1) * 0.5,
        $ = (_ & 1) * q * 255,
        K = ((_ >> 1) & 1) * q * 255,
        O = ((_ >> 2) & 1) * q * 255;
      return [$, K, O];
    };
    b7.ansi256.rgb = function (H) {
      if (((H = H[0]), H >= 232)) {
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
    b7.rgb.hex = function (H) {
      let q = (((Math.round(H[0]) & 255) << 16) + ((Math.round(H[1]) & 255) << 8) + (Math.round(H[2]) & 255))
        .toString(16)
        .toUpperCase();
      return "000000".slice(q.length) + q;
    };
    b7.hex.rgb = function (H) {
      let _ = H.toString(16).match(/[a-f\d]{6}|[a-f\d]{3}/i);
      if (!_) return [0, 0, 0];
      let q = _[0];
      if (_[0].length === 3) q = [...q].map((z) => z + z).join("");
      let $ = Number.parseInt(q, 16),
        K = ($ >> 16) & 255,
        O = ($ >> 8) & 255,
        T = $ & 255;
      return [K, O, T];
    };
    b7.rgb.hcg = function (H) {
      let _ = H[0] / 255,
        q = H[1] / 255,
        $ = H[2] / 255,
        K = Math.max(Math.max(_, q), $),
        O = Math.min(Math.min(_, q), $),
        T = K - O,
        z,
        A = T < 1 ? O / (1 - T) : 0;
      if (T <= 0) z = 0;
      else if (K === _) z = ((q - $) / T) % 6;
      else if (K === q) z = 2 + ($ - _) / T;
      else z = 4 + (_ - q) / T;
      return (z /= 6), (z %= 1), [z * 360, T * 100, A * 100];
    };
    b7.hsl.hcg = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = q < 0.5 ? 2 * _ * q : 2 * _ * (1 - q),
        K = 0;
      if ($ < 1) K = (q - 0.5 * $) / (1 - $);
      return [H[0], $ * 100, K * 100];
    };
    b7.hsv.hcg = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ * q,
        K = 0;
      if ($ < 1) K = (q - $) / (1 - $);
      return [H[0], $ * 100, K * 100];
    };
    b7.hcg.rgb = function (H) {
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
        case 0: {
          (K[0] = 1), (K[1] = T), (K[2] = 0);
          break;
        }
        case 1: {
          (K[0] = z), (K[1] = 1), (K[2] = 0);
          break;
        }
        case 2: {
          (K[0] = 0), (K[1] = 1), (K[2] = T);
          break;
        }
        case 3: {
          (K[0] = 0), (K[1] = z), (K[2] = 1);
          break;
        }
        case 4: {
          (K[0] = T), (K[1] = 0), (K[2] = 1);
          break;
        }
        default:
          (K[0] = 1), (K[1] = 0), (K[2] = z);
      }
      return (A = (1 - q) * $), [(q * K[0] + A) * 255, (q * K[1] + A) * 255, (q * K[2] + A) * 255];
    };
    b7.hcg.hsv = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ + q * (1 - _),
        K = 0;
      if ($ > 0) K = _ / $;
      return [H[0], K * 100, $ * 100];
    };
    b7.hcg.hsl = function (H) {
      let _ = H[1] / 100,
        $ = (H[2] / 100) * (1 - _) + 0.5 * _,
        K = 0;
      if ($ > 0 && $ < 0.5) K = _ / (2 * $);
      else if ($ >= 0.5 && $ < 1) K = _ / (2 * (1 - $));
      return [H[0], K * 100, $ * 100];
    };
    b7.hcg.hwb = function (H) {
      let _ = H[1] / 100,
        q = H[2] / 100,
        $ = _ + q * (1 - _);
      return [H[0], ($ - _) * 100, (1 - $) * 100];
    };
    b7.hwb.hcg = function (H) {
      let _ = H[1] / 100,
        $ = 1 - H[2] / 100,
        K = $ - _,
        O = 0;
      if (K < 1) O = ($ - K) / (1 - K);
      return [H[0], K * 100, O * 100];
    };
    b7.apple.rgb = function (H) {
      return [(H[0] / 65535) * 255, (H[1] / 65535) * 255, (H[2] / 65535) * 255];
    };
    b7.rgb.apple = function (H) {
      return [(H[0] / 255) * 65535, (H[1] / 255) * 65535, (H[2] / 255) * 65535];
    };
    b7.gray.rgb = function (H) {
      return [(H[0] / 100) * 255, (H[0] / 100) * 255, (H[0] / 100) * 255];
    };
    b7.gray.hsl = function (H) {
      return [0, 0, H[0]];
    };
    b7.gray.hsv = b7.gray.hsl;
    b7.gray.hwb = function (H) {
      return [0, 100, H[0]];
    };
    b7.gray.cmyk = function (H) {
      return [0, 0, 0, H[0]];
    };
    b7.gray.lab = function (H) {
      return [H[0], 0, 0];
    };
    b7.gray.hex = function (H) {
      let _ = Math.round((H[0] / 100) * 255) & 255,
        $ = ((_ << 16) + (_ << 8) + _).toString(16).toUpperCase();
      return "000000".slice($.length) + $;
    };
    b7.rgb.gray = function (H) {
      return [((H[0] + H[1] + H[2]) / 3 / 255) * 100];
    };
    function Aa4() {
      let H = {},
        _ = Object.keys(NTH);
      for (let { length: q } = _, $ = 0; $ < q; $++) H[_[$]] = { distance: -1, parent: null };
      return H;
    }
    function fa4(H) {
      let _ = Aa4(),
        q = [H];
      _[H].distance = 0;
      while (q.length > 0) {
        let $ = q.pop(),
          K = Object.keys(NTH[$]);
        for (let { length: O } = K, T = 0; T < O; T++) {
          let z = K[T],
            A = _[z];
          if (A.distance === -1) (A.distance = _[$].distance + 1), (A.parent = $), q.unshift(z);
        }
      }
      return _;
    }
    function wa4(H, _) {
      return function (q) {
        return _(H(q));
      };
    }
    function Ya4(H, _) {
      let q = [_[H].parent, H],
        $ = NTH[_[H].parent][H],
        K = _[H].parent;
      while (_[K].parent) q.unshift(_[K].parent), ($ = wa4(NTH[_[K].parent][K], $)), (K = _[K].parent);
      return ($.conversion = q), $;
    }
    function Da4(H) {
      let _ = fa4(H),
        q = {},
        $ = Object.keys(_);
      for (let { length: K } = $, O = 0; O < K; O++) {
        let T = $[O];
        if (_[T].parent === null) continue;
        q[T] = Ya4(T, _);
      }
      return q;
    }
    var ja4 = Da4,
      PZH = {},
      Ma4 = Object.keys(NTH);
    function Ja4(H) {
      let _ = function (...q) {
        let $ = q[0];
        if ($ === void 0 || $ === null) return $;
        if ($.length > 1) q = $;
        return H(q);
      };
      if ("conversion" in H) _.conversion = H.conversion;
      return _;
    }
    function Pa4(H) {
      let _ = function (...q) {
        let $ = q[0];
        if ($ === void 0 || $ === null) return $;
        if ($.length > 1) q = $;
        let K = H(q);
        if (typeof K === "object") for (let { length: O } = K, T = 0; T < O; T++) K[T] = Math.round(K[T]);
        return K;
      };
      if ("conversion" in H) _.conversion = H.conversion;
      return _;
    }
    for (let H of Ma4) {
      (PZH[H] = {}),
        Object.defineProperty(PZH[H], "channels", { value: NTH[H].channels }),
        Object.defineProperty(PZH[H], "labels", { value: NTH[H].labels });
      let _ = ja4(H),
        q = Object.keys(_);
      for (let $ of q) {
        let K = _[$];
        (PZH[H][$] = Pa4(K)), (PZH[H][$].raw = Ja4(K));
      }
    }
    var Ry = PZH,
      OO7 = ["keyword", "gray", "hex"],
      EI6 = {};
    for (let H of Object.keys(Ry)) EI6[[...Ry[H].labels].sort().join("")] = H;
    var CI6 = {};
    function zP(H, _) {
      if (!(this instanceof zP)) return new zP(H, _);
      if (_ && _ in OO7) _ = null;
      if (_ && !(_ in Ry)) throw Error("Unknown model: " + _);
      let q, $;
      if (H == null) (this.model = "rgb"), (this.color = [0, 0, 0]), (this.valpha = 1);
      else if (H instanceof zP) (this.model = H.model), (this.color = [...H.color]), (this.valpha = H.valpha);
      else if (typeof H === "string") {
        let K = JZH.get(H);
        if (K === null) throw Error("Unable to parse color from string: " + H);
        (this.model = K.model),
          ($ = Ry[this.model].channels),
          (this.color = K.value.slice(0, $)),
          (this.valpha = typeof K.value[$] === "number" ? K.value[$] : 1);
      } else if (H.length > 0) {
        (this.model = _ || "rgb"), ($ = Ry[this.model].channels);
        let K = Array.prototype.slice.call(H, 0, $);
        (this.color = bI6(K, $)), (this.valpha = typeof H[$] === "number" ? H[$] : 1);
      } else if (typeof H === "number")
        (this.model = "rgb"), (this.color = [(H >> 16) & 255, (H >> 8) & 255, H & 255]), (this.valpha = 1);
      else {
        this.valpha = 1;
        let K = Object.keys(H);
        if ("alpha" in H) K.splice(K.indexOf("alpha"), 1), (this.valpha = typeof H.alpha === "number" ? H.alpha : 0);
        let O = K.sort().join("");
        if (!(O in EI6)) throw Error("Unable to parse color from object: " + JSON.stringify(H));
        this.model = EI6[O];
        let { labels: T } = Ry[this.model],
          z = [];
        for (q = 0; q < T.length; q++) z.push(H[T[q]]);
        this.color = bI6(z);
      }
      if (CI6[this.model]) {
        $ = Ry[this.model].channels;
        for (q = 0; q < $; q++) {
          let K = CI6[this.model][q];
          if (K) this.color[q] = K(this.color[q]);
        }
      }
      if (((this.valpha = Math.max(0, Math.min(1, this.valpha))), Object.freeze)) Object.freeze(this);
    }
    zP.prototype = {
      toString() {
        return this.string();
      },
      toJSON() {
        return this[this.model]();
      },
      string(H) {
        let _ = this.model in JZH.to ? this : this.rgb();
        _ = _.round(typeof H === "number" ? H : 1);
        let q = _.valpha === 1 ? _.color : [..._.color, this.valpha];
        return JZH.to[_.model](...q);
      },
      percentString(H) {
        let _ = this.rgb().round(typeof H === "number" ? H : 1),
          q = _.valpha === 1 ? _.color : [..._.color, this.valpha];
        return JZH.to.rgb.percent(...q);
      },
      array() {
        return this.valpha === 1 ? [...this.color] : [...this.color, this.valpha];
      },
      object() {
        let H = {},
          { channels: _ } = Ry[this.model],
          { labels: q } = Ry[this.model];
        for (let $ = 0; $ < _; $++) H[q[$]] = this.color[$];
        if (this.valpha !== 1) H.alpha = this.valpha;
        return H;
      },
      unitArray() {
        let H = this.rgb().color;
        if (((H[0] /= 255), (H[1] /= 255), (H[2] /= 255), this.valpha !== 1)) H.push(this.valpha);
        return H;
      },
      unitObject() {
        let H = this.rgb().object();
        if (((H.r /= 255), (H.g /= 255), (H.b /= 255), this.valpha !== 1)) H.alpha = this.valpha;
        return H;
      },
      round(H) {
        return (H = Math.max(H || 0, 0)), new zP([...this.color.map(Wa4(H)), this.valpha], this.model);
      },
      alpha(H) {
        if (H !== void 0) return new zP([...this.color, Math.max(0, Math.min(1, H))], this.model);
        return this.valpha;
      },
      red: ID("rgb", 0, QM(255)),
      green: ID("rgb", 1, QM(255)),
      blue: ID("rgb", 2, QM(255)),
      hue: ID(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, (H) => ((H % 360) + 360) % 360),
      saturationl: ID("hsl", 1, QM(100)),
      lightness: ID("hsl", 2, QM(100)),
      saturationv: ID("hsv", 1, QM(100)),
      value: ID("hsv", 2, QM(100)),
      chroma: ID("hcg", 1, QM(100)),
      gray: ID("hcg", 2, QM(100)),
      white: ID("hwb", 1, QM(100)),
      wblack: ID("hwb", 2, QM(100)),
      cyan: ID("cmyk", 0, QM(100)),
      magenta: ID("cmyk", 1, QM(100)),
      yellow: ID("cmyk", 2, QM(100)),
      black: ID("cmyk", 3, QM(100)),
      x: ID("xyz", 0, QM(95.047)),
      y: ID("xyz", 1, QM(100)),
      z: ID("xyz", 2, QM(108.833)),
      l: ID("lab", 0, QM(100)),
      a: ID("lab", 1),
      b: ID("lab", 2),
      keyword(H) {
        if (H !== void 0) return new zP(H);
        return Ry[this.model].keyword(this.color);
      },
      hex(H) {
        if (H !== void 0) return new zP(H);
        return JZH.to.hex(...this.rgb().round().color);
      },
      hexa(H) {
        if (H !== void 0) return new zP(H);
        let _ = this.rgb().round().color,
          q = Math.round(this.valpha * 255)
            .toString(16)
            .toUpperCase();
        if (q.length === 1) q = "0" + q;
        return JZH.to.hex(..._) + q;
      },
      rgbNumber() {
        let H = this.rgb().color;
        return ((H[0] & 255) << 16) | ((H[1] & 255) << 8) | (H[2] & 255);
      },
      luminosity() {
        let H = this.rgb().color,
          _ = [];
        for (let [q, $] of H.entries()) {
          let K = $ / 255;
          _[q] = K <= 0.04045 ? K / 12.92 : ((K + 0.055) / 1.055) ** 2.4;
        }
        return 0.2126 * _[0] + 0.7152 * _[1] + 0.0722 * _[2];
      },
      contrast(H) {
        let _ = this.luminosity(),
          q = H.luminosity();
        if (_ > q) return (_ + 0.05) / (q + 0.05);
        return (q + 0.05) / (_ + 0.05);
      },
      level(H) {
        let _ = this.contrast(H);
        if (_ >= 7) return "AAA";
        return _ >= 4.5 ? "AA" : "";
      },
      isDark() {
        let H = this.rgb().color;
        return (H[0] * 2126 + H[1] * 7152 + H[2] * 722) / 1e4 < 128;
      },
      isLight() {
        return !this.isDark();
      },
      negate() {
        let H = this.rgb();
        for (let _ = 0; _ < 3; _++) H.color[_] = 255 - H.color[_];
        return H;
      },
      lighten(H) {
        let _ = this.hsl();
        return (_.color[2] += _.color[2] * H), _;
      },
      darken(H) {
        let _ = this.hsl();
        return (_.color[2] -= _.color[2] * H), _;
      },
      saturate(H) {
        let _ = this.hsl();
        return (_.color[1] += _.color[1] * H), _;
      },
      desaturate(H) {
        let _ = this.hsl();
        return (_.color[1] -= _.color[1] * H), _;
      },
      whiten(H) {
        let _ = this.hwb();
        return (_.color[1] += _.color[1] * H), _;
      },
      blacken(H) {
        let _ = this.hwb();
        return (_.color[2] += _.color[2] * H), _;
      },
      grayscale() {
        let H = this.rgb().color,
          _ = H[0] * 0.3 + H[1] * 0.59 + H[2] * 0.11;
        return zP.rgb(_, _, _);
      },
      fade(H) {
        return this.alpha(this.valpha - this.valpha * H);
      },
      opaquer(H) {
        return this.alpha(this.valpha + this.valpha * H);
      },
      rotate(H) {
        let _ = this.hsl(),
          q = _.color[0];
        return (q = (q + H) % 360), (q = q < 0 ? 360 + q : q), (_.color[0] = q), _;
      },
      mix(H, _) {
        if (!H || !H.rgb)
          throw Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof H);
        let q = H.rgb(),
          $ = this.rgb(),
          K = _ === void 0 ? 0.5 : _,
          O = 2 * K - 1,
          T = q.alpha() - $.alpha(),
          z = ((O * T === -1 ? O : (O + T) / (1 + O * T)) + 1) / 2,
          A = 1 - z;
        return zP.rgb(
          z * q.red() + A * $.red(),
          z * q.green() + A * $.green(),
          z * q.blue() + A * $.blue(),
          q.alpha() * K + $.alpha() * (1 - K),
        );
      },
    };
    for (let H of Object.keys(Ry)) {
      if (OO7.includes(H)) continue;
      let { channels: _ } = Ry[H];
      (zP.prototype[H] = function (...q) {
        if (this.model === H) return new zP(this);
        if (q.length > 0) return new zP(q, H);
        return new zP([...Ga4(Ry[this.model][H].raw(this.color)), this.valpha], H);
      }),
        (zP[H] = function (...q) {
          let $ = q[0];
          if (typeof $ === "number") $ = bI6(q, _);
          return new zP($, H);
        });
    }
    function Xa4(H, _) {
      return Number(H.toFixed(_));
    }
    function Wa4(H) {
      return function (_) {
        return Xa4(_, H);
      };
    }
    function ID(H, _, q) {
      H = Array.isArray(H) ? H : [H];
      for (let $ of H) (CI6[$] ||= [])[_] = q;
      return (
        (H = H[0]),
        function ($) {
          let K;
          if ($ !== void 0) {
            if (q) $ = q($);
            return (K = this[H]()), (K.color[_] = $), K;
          }
          if (((K = this[H]().color[_]), q)) K = q(K);
          return K;
        }
      );
    }
    function QM(H) {
      return function (_) {
        return Math.max(0, Math.min(H, _));
      };
    }
    function Ga4(H) {
      return Array.isArray(H) ? H : [H];
    }
    function bI6(H, _) {
      for (let q = 0; q < _; q++) if (typeof H[q] !== "number") H[q] = 0;
      return H;
    }
    var Ra4 = zP;
  });

  var _O7 = d((kHO, HO7) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var v6 = Pd(),
      s37 = { integer: "integer", float: "float", approximate: "approximate" };
    function uo4(H, _) {
      if (!v6.defined(H)) return this.autoOrient();
      if (this.options.angle || this.options.rotationAngle)
        this.options.debuglog("ignoring previous rotate options"),
          (this.options.angle = 0),
          (this.options.rotationAngle = 0);
      if (v6.integer(H) && !(H % 90)) this.options.angle = H;
      else if (v6.number(H)) {
        if (((this.options.rotationAngle = H), v6.object(_) && _.background))
          this._setBackgroundColourOption("rotationBackground", _.background);
      } else throw v6.invalidParameterError("angle", "numeric", H);
      return this;
    }
    function xo4() {
      return (this.options.input.autoOrient = !0), this;
    }
    function mo4(H) {
      return (this.options.flip = v6.bool(H) ? H : !0), this;
    }
    function po4(H) {
      return (this.options.flop = v6.bool(H) ? H : !0), this;
    }
    function Bo4(H, _) {
      let q = [].concat(...H);
      if (q.length === 4 && q.every(v6.number)) this.options.affineMatrix = q;
      else throw v6.invalidParameterError("matrix", "1x4 or 2x2 array", H);
      if (v6.defined(_))
        if (v6.object(_)) {
          if ((this._setBackgroundColourOption("affineBackground", _.background), v6.defined(_.idx)))
            if (v6.number(_.idx)) this.options.affineIdx = _.idx;
            else throw v6.invalidParameterError("options.idx", "number", _.idx);
          if (v6.defined(_.idy))
            if (v6.number(_.idy)) this.options.affineIdy = _.idy;
            else throw v6.invalidParameterError("options.idy", "number", _.idy);
          if (v6.defined(_.odx))
            if (v6.number(_.odx)) this.options.affineOdx = _.odx;
            else throw v6.invalidParameterError("options.odx", "number", _.odx);
          if (v6.defined(_.ody))
            if (v6.number(_.ody)) this.options.affineOdy = _.ody;
            else throw v6.invalidParameterError("options.ody", "number", _.ody);
          if (v6.defined(_.interpolator))
            if (v6.inArray(_.interpolator, Object.values(this.constructor.interpolators)))
              this.options.affineInterpolator = _.interpolator;
            else throw v6.invalidParameterError("options.interpolator", "valid interpolator name", _.interpolator);
        } else throw v6.invalidParameterError("options", "object", _);
      return this;
    }
    function go4(H, _, q) {
      if (!v6.defined(H)) this.options.sharpenSigma = -1;
      else if (v6.bool(H)) this.options.sharpenSigma = H ? -1 : 0;
      else if (v6.number(H) && v6.inRange(H, 0.01, 1e4)) {
        if (((this.options.sharpenSigma = H), v6.defined(_)))
          if (v6.number(_) && v6.inRange(_, 0, 1e4)) this.options.sharpenM1 = _;
          else throw v6.invalidParameterError("flat", "number between 0 and 10000", _);
        if (v6.defined(q))
          if (v6.number(q) && v6.inRange(q, 0, 1e4)) this.options.sharpenM2 = q;
          else throw v6.invalidParameterError("jagged", "number between 0 and 10000", q);
      } else if (v6.plainObject(H)) {
        if (v6.number(H.sigma) && v6.inRange(H.sigma, 0.000001, 10)) this.options.sharpenSigma = H.sigma;
        else throw v6.invalidParameterError("options.sigma", "number between 0.000001 and 10", H.sigma);
        if (v6.defined(H.m1))
          if (v6.number(H.m1) && v6.inRange(H.m1, 0, 1e6)) this.options.sharpenM1 = H.m1;
          else throw v6.invalidParameterError("options.m1", "number between 0 and 1000000", H.m1);
        if (v6.defined(H.m2))
          if (v6.number(H.m2) && v6.inRange(H.m2, 0, 1e6)) this.options.sharpenM2 = H.m2;
          else throw v6.invalidParameterError("options.m2", "number between 0 and 1000000", H.m2);
        if (v6.defined(H.x1))
          if (v6.number(H.x1) && v6.inRange(H.x1, 0, 1e6)) this.options.sharpenX1 = H.x1;
          else throw v6.invalidParameterError("options.x1", "number between 0 and 1000000", H.x1);
        if (v6.defined(H.y2))
          if (v6.number(H.y2) && v6.inRange(H.y2, 0, 1e6)) this.options.sharpenY2 = H.y2;
          else throw v6.invalidParameterError("options.y2", "number between 0 and 1000000", H.y2);
        if (v6.defined(H.y3))
          if (v6.number(H.y3) && v6.inRange(H.y3, 0, 1e6)) this.options.sharpenY3 = H.y3;
          else throw v6.invalidParameterError("options.y3", "number between 0 and 1000000", H.y3);
      } else throw v6.invalidParameterError("sigma", "number between 0.01 and 10000", H);
      return this;
    }
    function do4(H) {
      if (!v6.defined(H)) this.options.medianSize = 3;
      else if (v6.integer(H) && v6.inRange(H, 1, 1000)) this.options.medianSize = H;
      else throw v6.invalidParameterError("size", "integer between 1 and 1000", H);
      return this;
    }
    function co4(H) {
      let _;
      if (v6.number(H)) _ = H;
      else if (v6.plainObject(H)) {
        if (!v6.number(H.sigma)) throw v6.invalidParameterError("options.sigma", "number between 0.3 and 1000", _);
        if (((_ = H.sigma), "precision" in H))
          if (v6.string(s37[H.precision])) this.options.precision = s37[H.precision];
          else throw v6.invalidParameterError("precision", "one of: integer, float, approximate", H.precision);
        if ("minAmplitude" in H)
          if (v6.number(H.minAmplitude) && v6.inRange(H.minAmplitude, 0.001, 1)) this.options.minAmpl = H.minAmplitude;
          else throw v6.invalidParameterError("minAmplitude", "number between 0.001 and 1", H.minAmplitude);
      }
      if (!v6.defined(H)) this.options.blurSigma = -1;
      else if (v6.bool(H)) this.options.blurSigma = H ? -1 : 0;
      else if (v6.number(_) && v6.inRange(_, 0.3, 1000)) this.options.blurSigma = _;
      else throw v6.invalidParameterError("sigma", "number between 0.3 and 1000", _);
      return this;
    }
    function t37(H) {
      if (!v6.defined(H)) this.options.dilateWidth = 1;
      else if (v6.integer(H) && H > 0) this.options.dilateWidth = H;
      else throw v6.invalidParameterError("dilate", "positive integer", t37);
      return this;
    }
    function e37(H) {
      if (!v6.defined(H)) this.options.erodeWidth = 1;
      else if (v6.integer(H) && H > 0) this.options.erodeWidth = H;
      else throw v6.invalidParameterError("erode", "positive integer", e37);
      return this;
    }
    function Fo4(H) {
      if (((this.options.flatten = v6.bool(H) ? H : !0), v6.object(H)))
        this._setBackgroundColourOption("flattenBackground", H.background);
      return this;
    }
    function Uo4() {
      return (this.options.unflatten = !0), this;
    }
    function Qo4(H, _) {
      if (!v6.defined(H)) this.options.gamma = 2.2;
      else if (v6.number(H) && v6.inRange(H, 1, 3)) this.options.gamma = H;
      else throw v6.invalidParameterError("gamma", "number between 1.0 and 3.0", H);
      if (!v6.defined(_)) this.options.gammaOut = this.options.gamma;
      else if (v6.number(_) && v6.inRange(_, 1, 3)) this.options.gammaOut = _;
      else throw v6.invalidParameterError("gammaOut", "number between 1.0 and 3.0", _);
      return this;
    }
    function lo4(H) {
      if (((this.options.negate = v6.bool(H) ? H : !0), v6.plainObject(H) && "alpha" in H))
        if (!v6.bool(H.alpha)) throw v6.invalidParameterError("alpha", "should be boolean value", H.alpha);
        else this.options.negateAlpha = H.alpha;
      return this;
    }
    function io4(H) {
      if (v6.plainObject(H)) {
        if (v6.defined(H.lower))
          if (v6.number(H.lower) && v6.inRange(H.lower, 0, 99)) this.options.normaliseLower = H.lower;
          else throw v6.invalidParameterError("lower", "number between 0 and 99", H.lower);
        if (v6.defined(H.upper))
          if (v6.number(H.upper) && v6.inRange(H.upper, 1, 100)) this.options.normaliseUpper = H.upper;
          else throw v6.invalidParameterError("upper", "number between 1 and 100", H.upper);
      }
      if (this.options.normaliseLower >= this.options.normaliseUpper)
        throw v6.invalidParameterError(
          "range",
          "lower to be less than upper",
          `${this.options.normaliseLower} >= ${this.options.normaliseUpper}`,
        );
      return (this.options.normalise = !0), this;
    }
    function no4(H) {
      return this.normalise(H);
    }
    function ro4(H) {
      if (v6.plainObject(H)) {
        if (v6.integer(H.width) && H.width > 0) this.options.claheWidth = H.width;
        else throw v6.invalidParameterError("width", "integer greater than zero", H.width);
        if (v6.integer(H.height) && H.height > 0) this.options.claheHeight = H.height;
        else throw v6.invalidParameterError("height", "integer greater than zero", H.height);
        if (v6.defined(H.maxSlope))
          if (v6.integer(H.maxSlope) && v6.inRange(H.maxSlope, 0, 100)) this.options.claheMaxSlope = H.maxSlope;
          else throw v6.invalidParameterError("maxSlope", "integer between 0 and 100", H.maxSlope);
      } else throw v6.invalidParameterError("options", "plain object", H);
      return this;
    }
    function oo4(H) {
      if (
        !v6.object(H) ||
        !Array.isArray(H.kernel) ||
        !v6.integer(H.width) ||
        !v6.integer(H.height) ||
        !v6.inRange(H.width, 3, 1001) ||
        !v6.inRange(H.height, 3, 1001) ||
        H.height * H.width !== H.kernel.length
      )
        throw Error("Invalid convolution kernel");
      if (!v6.integer(H.scale)) H.scale = H.kernel.reduce((_, q) => _ + q, 0);
      if (H.scale < 1) H.scale = 1;
      if (!v6.integer(H.offset)) H.offset = 0;
      return (this.options.convKernel = H), this;
    }
    function ao4(H, _) {
      if (!v6.defined(H)) this.options.threshold = 128;
      else if (v6.bool(H)) this.options.threshold = H ? 128 : 0;
      else if (v6.integer(H) && v6.inRange(H, 0, 255)) this.options.threshold = H;
      else throw v6.invalidParameterError("threshold", "integer between 0 and 255", H);
      if (!v6.object(_) || _.greyscale === !0 || _.grayscale === !0) this.options.thresholdGrayscale = !0;
      else this.options.thresholdGrayscale = !1;
      return this;
    }
    function so4(H, _, q) {
      if (
        ((this.options.boolean = this._createInputDescriptor(H, q)),
        v6.string(_) && v6.inArray(_, ["and", "or", "eor"]))
      )
        this.options.booleanOp = _;
      else throw v6.invalidParameterError("operator", "one of: and, or, eor", _);
      return this;
    }
    function to4(H, _) {
      if (!v6.defined(H) && v6.number(_)) H = 1;
      else if (v6.number(H) && !v6.defined(_)) _ = 0;
      if (!v6.defined(H)) this.options.linearA = [];
      else if (v6.number(H)) this.options.linearA = [H];
      else if (Array.isArray(H) && H.length && H.every(v6.number)) this.options.linearA = H;
      else throw v6.invalidParameterError("a", "number or array of numbers", H);
      if (!v6.defined(_)) this.options.linearB = [];
      else if (v6.number(_)) this.options.linearB = [_];
      else if (Array.isArray(_) && _.length && _.every(v6.number)) this.options.linearB = _;
      else throw v6.invalidParameterError("b", "number or array of numbers", _);
      if (this.options.linearA.length !== this.options.linearB.length)
        throw Error("Expected a and b to be arrays of the same length");
      return this;
    }
    function eo4(H) {
      if (!Array.isArray(H)) throw v6.invalidParameterError("inputMatrix", "array", H);
      if (H.length !== 3 && H.length !== 4) throw v6.invalidParameterError("inputMatrix", "3x3 or 4x4 array", H.length);
      let _ = H.flat().map(Number);
      if (_.length !== 9 && _.length !== 16)
        throw v6.invalidParameterError("inputMatrix", "cardinality of 9 or 16", _.length);
      return (this.options.recombMatrix = _), this;
    }
    function Ha4(H) {
      if (!v6.plainObject(H)) throw v6.invalidParameterError("options", "plain object", H);
      if ("brightness" in H)
        if (v6.number(H.brightness) && H.brightness >= 0) this.options.brightness = H.brightness;
        else throw v6.invalidParameterError("brightness", "number above zero", H.brightness);
      if ("saturation" in H)
        if (v6.number(H.saturation) && H.saturation >= 0) this.options.saturation = H.saturation;
        else throw v6.invalidParameterError("saturation", "number above zero", H.saturation);
      if ("hue" in H)
        if (v6.integer(H.hue)) this.options.hue = H.hue % 360;
        else throw v6.invalidParameterError("hue", "number", H.hue);
      if ("lightness" in H)
        if (v6.number(H.lightness)) this.options.lightness = H.lightness;
        else throw v6.invalidParameterError("lightness", "number", H.lightness);
      return this;
    }
    HO7.exports = (H) => {
      Object.assign(H.prototype, {
        autoOrient: xo4,
        rotate: uo4,
        flip: mo4,
        flop: po4,
        affine: Bo4,
        sharpen: go4,
        erode: e37,
        dilate: t37,
        median: do4,
        blur: co4,
        flatten: Fo4,
        unflatten: Uo4,
        gamma: Qo4,
        negate: lo4,
        normalise: io4,
        normalize: no4,
        clahe: ro4,
        convolve: oo4,
        threshold: ao4,
        boolean: so4,
        linear: to4,
        recomb: eo4,
        modulate: Ha4,
      });
    };
  });

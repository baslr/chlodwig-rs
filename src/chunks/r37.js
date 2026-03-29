  var r37 = d((ZHO, n37) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var p9 = Pd(),
      Q37 = {
        center: 0,
        centre: 0,
        north: 1,
        east: 2,
        south: 3,
        west: 4,
        northeast: 5,
        southeast: 6,
        southwest: 7,
        northwest: 8,
      },
      l37 = {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
        "right top": 5,
        "right bottom": 6,
        "left bottom": 7,
        "left top": 8,
      },
      U37 = { background: "background", copy: "copy", repeat: "repeat", mirror: "mirror" },
      i37 = { entropy: 16, attention: 17 },
      yI6 = {
        nearest: "nearest",
        linear: "linear",
        cubic: "cubic",
        mitchell: "mitchell",
        lanczos2: "lanczos2",
        lanczos3: "lanczos3",
        mks2013: "mks2013",
        mks2021: "mks2021",
      },
      yo4 = { contain: "contain", cover: "cover", fill: "fill", inside: "inside", outside: "outside" },
      Vo4 = { contain: "embed", cover: "crop", fill: "ignore_aspect", inside: "max", outside: "min" };
    function VI6(H) {
      return H.angle % 360 !== 0 || H.rotationAngle !== 0;
    }
    function qN_(H) {
      return H.width !== -1 || H.height !== -1;
    }
    function So4(H, _, q) {
      if (qN_(this.options)) this.options.debuglog("ignoring previous resize options");
      if (this.options.widthPost !== -1) this.options.debuglog("operation order will be: extract, resize, extract");
      if (p9.defined(H))
        if (p9.object(H) && !p9.defined(q)) q = H;
        else if (p9.integer(H) && H > 0) this.options.width = H;
        else throw p9.invalidParameterError("width", "positive integer", H);
      else this.options.width = -1;
      if (p9.defined(_))
        if (p9.integer(_) && _ > 0) this.options.height = _;
        else throw p9.invalidParameterError("height", "positive integer", _);
      else this.options.height = -1;
      if (p9.object(q)) {
        if (p9.defined(q.width))
          if (p9.integer(q.width) && q.width > 0) this.options.width = q.width;
          else throw p9.invalidParameterError("width", "positive integer", q.width);
        if (p9.defined(q.height))
          if (p9.integer(q.height) && q.height > 0) this.options.height = q.height;
          else throw p9.invalidParameterError("height", "positive integer", q.height);
        if (p9.defined(q.fit)) {
          let $ = Vo4[q.fit];
          if (p9.string($)) this.options.canvas = $;
          else throw p9.invalidParameterError("fit", "valid fit", q.fit);
        }
        if (p9.defined(q.position)) {
          let $ = p9.integer(q.position) ? q.position : i37[q.position] || l37[q.position] || Q37[q.position];
          if (p9.integer($) && (p9.inRange($, 0, 8) || p9.inRange($, 16, 17))) this.options.position = $;
          else throw p9.invalidParameterError("position", "valid position/gravity/strategy", q.position);
        }
        if ((this._setBackgroundColourOption("resizeBackground", q.background), p9.defined(q.kernel)))
          if (p9.string(yI6[q.kernel])) this.options.kernel = yI6[q.kernel];
          else throw p9.invalidParameterError("kernel", "valid kernel name", q.kernel);
        if (p9.defined(q.withoutEnlargement)) this._setBooleanOption("withoutEnlargement", q.withoutEnlargement);
        if (p9.defined(q.withoutReduction)) this._setBooleanOption("withoutReduction", q.withoutReduction);
        if (p9.defined(q.fastShrinkOnLoad)) this._setBooleanOption("fastShrinkOnLoad", q.fastShrinkOnLoad);
      }
      if (VI6(this.options) && qN_(this.options)) this.options.rotateBefore = !0;
      return this;
    }
    function Eo4(H) {
      if (p9.integer(H) && H > 0)
        (this.options.extendTop = H),
          (this.options.extendBottom = H),
          (this.options.extendLeft = H),
          (this.options.extendRight = H);
      else if (p9.object(H)) {
        if (p9.defined(H.top))
          if (p9.integer(H.top) && H.top >= 0) this.options.extendTop = H.top;
          else throw p9.invalidParameterError("top", "positive integer", H.top);
        if (p9.defined(H.bottom))
          if (p9.integer(H.bottom) && H.bottom >= 0) this.options.extendBottom = H.bottom;
          else throw p9.invalidParameterError("bottom", "positive integer", H.bottom);
        if (p9.defined(H.left))
          if (p9.integer(H.left) && H.left >= 0) this.options.extendLeft = H.left;
          else throw p9.invalidParameterError("left", "positive integer", H.left);
        if (p9.defined(H.right))
          if (p9.integer(H.right) && H.right >= 0) this.options.extendRight = H.right;
          else throw p9.invalidParameterError("right", "positive integer", H.right);
        if ((this._setBackgroundColourOption("extendBackground", H.background), p9.defined(H.extendWith)))
          if (p9.string(U37[H.extendWith])) this.options.extendWith = U37[H.extendWith];
          else throw p9.invalidParameterError("extendWith", "one of: background, copy, repeat, mirror", H.extendWith);
      } else throw p9.invalidParameterError("extend", "integer or object", H);
      return this;
    }
    function Co4(H) {
      let _ = qN_(this.options) || this.options.widthPre !== -1 ? "Post" : "Pre";
      if (this.options[`width${_}`] !== -1) this.options.debuglog("ignoring previous extract options");
      if (
        (["left", "top", "width", "height"].forEach(function (q) {
          let $ = H[q];
          if (p9.integer($) && $ >= 0) this.options[q + (q === "left" || q === "top" ? "Offset" : "") + _] = $;
          else throw p9.invalidParameterError(q, "integer", $);
        }, this),
        VI6(this.options) && !qN_(this.options))
      ) {
        if (this.options.widthPre === -1 || this.options.widthPost === -1) this.options.rotateBefore = !0;
      }
      if (this.options.input.autoOrient) this.options.orientBefore = !0;
      return this;
    }
    function bo4(H) {
      if (((this.options.trimThreshold = 10), p9.defined(H)))
        if (p9.object(H)) {
          if (p9.defined(H.background)) this._setBackgroundColourOption("trimBackground", H.background);
          if (p9.defined(H.threshold))
            if (p9.number(H.threshold) && H.threshold >= 0) this.options.trimThreshold = H.threshold;
            else throw p9.invalidParameterError("threshold", "positive number", H.threshold);
          if (p9.defined(H.lineArt)) this._setBooleanOption("trimLineArt", H.lineArt);
        } else throw p9.invalidParameterError("trim", "object", H);
      if (VI6(this.options)) this.options.rotateBefore = !0;
      return this;
    }
    n37.exports = (H) => {
      Object.assign(H.prototype, { resize: So4, extend: Eo4, extract: Co4, trim: bo4 }),
        (H.gravity = Q37),
        (H.strategy = i37),
        (H.kernel = yI6),
        (H.fit = yo4),
        (H.position = l37);
    };
  });

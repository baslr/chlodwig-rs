  var F37 = d((RHO, c37) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var K6 = Pd(),
      $8H = CiH(),
      Go4 = {
        left: "low",
        top: "low",
        low: "low",
        center: "centre",
        centre: "centre",
        right: "high",
        bottom: "high",
        high: "high",
      },
      Ro4 = [
        "failOn",
        "limitInputPixels",
        "unlimited",
        "animated",
        "autoOrient",
        "density",
        "ignoreIcc",
        "page",
        "pages",
        "sequentialRead",
        "jp2",
        "openSlide",
        "pdf",
        "raw",
        "svg",
        "tiff",
        "failOnError",
        "openSlideLevel",
        "pdfBackground",
        "tiffSubifd",
      ];
    function d37(H) {
      let _ = Ro4.filter((q) => K6.defined(H[q])).map((q) => [q, H[q]]);
      return _.length ? Object.fromEntries(_) : void 0;
    }
    function Zo4(H, _, q) {
      let $ = {
        autoOrient: !1,
        failOn: "warning",
        limitInputPixels: 268402689,
        ignoreIcc: !1,
        unlimited: !1,
        sequentialRead: !0,
      };
      if (K6.string(H)) $.file = H;
      else if (K6.buffer(H)) {
        if (H.length === 0) throw Error("Input Buffer is empty");
        $.buffer = H;
      } else if (K6.arrayBuffer(H)) {
        if (H.byteLength === 0) throw Error("Input bit Array is empty");
        $.buffer = Buffer.from(H, 0, H.byteLength);
      } else if (K6.typedArray(H)) {
        if (H.length === 0) throw Error("Input Bit Array is empty");
        $.buffer = Buffer.from(H.buffer, H.byteOffset, H.byteLength);
      } else if (K6.plainObject(H) && !K6.defined(_)) {
        if (((_ = H), d37(_))) $.buffer = [];
      } else if (!K6.defined(H) && !K6.defined(_) && K6.object(q) && q.allowStream) $.buffer = [];
      else if (Array.isArray(H))
        if (H.length > 1)
          if (!this.options.joining)
            (this.options.joining = !0), (this.options.join = H.map((K) => this._createInputDescriptor(K)));
          else throw Error("Recursive join is unsupported");
        else throw Error("Expected at least two images to join");
      else
        throw Error(
          `Unsupported input '${H}' of type ${typeof H}${K6.defined(_) ? ` when also providing options of type ${typeof _}` : ""}`,
        );
      if (K6.object(_)) {
        if (K6.defined(_.failOnError))
          if (K6.bool(_.failOnError)) $.failOn = _.failOnError ? "warning" : "none";
          else throw K6.invalidParameterError("failOnError", "boolean", _.failOnError);
        if (K6.defined(_.failOn))
          if (K6.string(_.failOn) && K6.inArray(_.failOn, ["none", "truncated", "error", "warning"]))
            $.failOn = _.failOn;
          else throw K6.invalidParameterError("failOn", "one of: none, truncated, error, warning", _.failOn);
        if (K6.defined(_.autoOrient))
          if (K6.bool(_.autoOrient)) $.autoOrient = _.autoOrient;
          else throw K6.invalidParameterError("autoOrient", "boolean", _.autoOrient);
        if (K6.defined(_.density))
          if (K6.inRange(_.density, 1, 1e5)) $.density = _.density;
          else throw K6.invalidParameterError("density", "number between 1 and 100000", _.density);
        if (K6.defined(_.ignoreIcc))
          if (K6.bool(_.ignoreIcc)) $.ignoreIcc = _.ignoreIcc;
          else throw K6.invalidParameterError("ignoreIcc", "boolean", _.ignoreIcc);
        if (K6.defined(_.limitInputPixels))
          if (K6.bool(_.limitInputPixels)) $.limitInputPixels = _.limitInputPixels ? 268402689 : 0;
          else if (K6.integer(_.limitInputPixels) && K6.inRange(_.limitInputPixels, 0, Number.MAX_SAFE_INTEGER))
            $.limitInputPixels = _.limitInputPixels;
          else throw K6.invalidParameterError("limitInputPixels", "positive integer", _.limitInputPixels);
        if (K6.defined(_.unlimited))
          if (K6.bool(_.unlimited)) $.unlimited = _.unlimited;
          else throw K6.invalidParameterError("unlimited", "boolean", _.unlimited);
        if (K6.defined(_.sequentialRead))
          if (K6.bool(_.sequentialRead)) $.sequentialRead = _.sequentialRead;
          else throw K6.invalidParameterError("sequentialRead", "boolean", _.sequentialRead);
        if (K6.defined(_.raw)) {
          if (
            K6.object(_.raw) &&
            K6.integer(_.raw.width) &&
            _.raw.width > 0 &&
            K6.integer(_.raw.height) &&
            _.raw.height > 0 &&
            K6.integer(_.raw.channels) &&
            K6.inRange(_.raw.channels, 1, 4)
          )
            switch (
              (($.rawWidth = _.raw.width),
              ($.rawHeight = _.raw.height),
              ($.rawChannels = _.raw.channels),
              H.constructor)
            ) {
              case Uint8Array:
              case Uint8ClampedArray:
                $.rawDepth = "uchar";
                break;
              case Int8Array:
                $.rawDepth = "char";
                break;
              case Uint16Array:
                $.rawDepth = "ushort";
                break;
              case Int16Array:
                $.rawDepth = "short";
                break;
              case Uint32Array:
                $.rawDepth = "uint";
                break;
              case Int32Array:
                $.rawDepth = "int";
                break;
              case Float32Array:
                $.rawDepth = "float";
                break;
              case Float64Array:
                $.rawDepth = "double";
                break;
              default:
                $.rawDepth = "uchar";
                break;
            }
          else throw Error("Expected width, height and channels for raw pixel input");
          if ((($.rawPremultiplied = !1), K6.defined(_.raw.premultiplied)))
            if (K6.bool(_.raw.premultiplied)) $.rawPremultiplied = _.raw.premultiplied;
            else throw K6.invalidParameterError("raw.premultiplied", "boolean", _.raw.premultiplied);
          if ((($.rawPageHeight = 0), K6.defined(_.raw.pageHeight)))
            if (K6.integer(_.raw.pageHeight) && _.raw.pageHeight > 0 && _.raw.pageHeight <= _.raw.height) {
              if (_.raw.height % _.raw.pageHeight !== 0)
                throw Error(
                  `Expected raw.height ${_.raw.height} to be a multiple of raw.pageHeight ${_.raw.pageHeight}`,
                );
              $.rawPageHeight = _.raw.pageHeight;
            } else throw K6.invalidParameterError("raw.pageHeight", "positive integer", _.raw.pageHeight);
        }
        if (K6.defined(_.animated))
          if (K6.bool(_.animated)) $.pages = _.animated ? -1 : 1;
          else throw K6.invalidParameterError("animated", "boolean", _.animated);
        if (K6.defined(_.pages))
          if (K6.integer(_.pages) && K6.inRange(_.pages, -1, 1e5)) $.pages = _.pages;
          else throw K6.invalidParameterError("pages", "integer between -1 and 100000", _.pages);
        if (K6.defined(_.page))
          if (K6.integer(_.page) && K6.inRange(_.page, 0, 1e5)) $.page = _.page;
          else throw K6.invalidParameterError("page", "integer between 0 and 100000", _.page);
        if (K6.object(_.openSlide) && K6.defined(_.openSlide.level))
          if (K6.integer(_.openSlide.level) && K6.inRange(_.openSlide.level, 0, 256))
            $.openSlideLevel = _.openSlide.level;
          else throw K6.invalidParameterError("openSlide.level", "integer between 0 and 256", _.openSlide.level);
        else if (K6.defined(_.level))
          if (K6.integer(_.level) && K6.inRange(_.level, 0, 256)) $.openSlideLevel = _.level;
          else throw K6.invalidParameterError("level", "integer between 0 and 256", _.level);
        if (K6.object(_.tiff) && K6.defined(_.tiff.subifd))
          if (K6.integer(_.tiff.subifd) && K6.inRange(_.tiff.subifd, -1, 1e5)) $.tiffSubifd = _.tiff.subifd;
          else throw K6.invalidParameterError("tiff.subifd", "integer between -1 and 100000", _.tiff.subifd);
        else if (K6.defined(_.subifd))
          if (K6.integer(_.subifd) && K6.inRange(_.subifd, -1, 1e5)) $.tiffSubifd = _.subifd;
          else throw K6.invalidParameterError("subifd", "integer between -1 and 100000", _.subifd);
        if (K6.object(_.svg)) {
          if (K6.defined(_.svg.stylesheet))
            if (K6.string(_.svg.stylesheet)) $.svgStylesheet = _.svg.stylesheet;
            else throw K6.invalidParameterError("svg.stylesheet", "string", _.svg.stylesheet);
          if (K6.defined(_.svg.highBitdepth))
            if (K6.bool(_.svg.highBitdepth)) $.svgHighBitdepth = _.svg.highBitdepth;
            else throw K6.invalidParameterError("svg.highBitdepth", "boolean", _.svg.highBitdepth);
        }
        if (K6.object(_.pdf) && K6.defined(_.pdf.background))
          $.pdfBackground = this._getBackgroundColourOption(_.pdf.background);
        else if (K6.defined(_.pdfBackground)) $.pdfBackground = this._getBackgroundColourOption(_.pdfBackground);
        if (K6.object(_.jp2) && K6.defined(_.jp2.oneshot))
          if (K6.bool(_.jp2.oneshot)) $.jp2Oneshot = _.jp2.oneshot;
          else throw K6.invalidParameterError("jp2.oneshot", "boolean", _.jp2.oneshot);
        if (K6.defined(_.create))
          if (
            K6.object(_.create) &&
            K6.integer(_.create.width) &&
            _.create.width > 0 &&
            K6.integer(_.create.height) &&
            _.create.height > 0 &&
            K6.integer(_.create.channels)
          ) {
            if (
              (($.createWidth = _.create.width),
              ($.createHeight = _.create.height),
              ($.createChannels = _.create.channels),
              ($.createPageHeight = 0),
              K6.defined(_.create.pageHeight))
            )
              if (
                K6.integer(_.create.pageHeight) &&
                _.create.pageHeight > 0 &&
                _.create.pageHeight <= _.create.height
              ) {
                if (_.create.height % _.create.pageHeight !== 0)
                  throw Error(
                    `Expected create.height ${_.create.height} to be a multiple of create.pageHeight ${_.create.pageHeight}`,
                  );
                $.createPageHeight = _.create.pageHeight;
              } else throw K6.invalidParameterError("create.pageHeight", "positive integer", _.create.pageHeight);
            if (K6.defined(_.create.noise)) {
              if (!K6.object(_.create.noise)) throw Error("Expected noise to be an object");
              if (_.create.noise.type !== "gaussian") throw Error("Only gaussian noise is supported at the moment");
              if ((($.createNoiseType = _.create.noise.type), !K6.inRange(_.create.channels, 1, 4)))
                throw K6.invalidParameterError("create.channels", "number between 1 and 4", _.create.channels);
              if ((($.createNoiseMean = 128), K6.defined(_.create.noise.mean)))
                if (K6.number(_.create.noise.mean) && K6.inRange(_.create.noise.mean, 0, 1e4))
                  $.createNoiseMean = _.create.noise.mean;
                else
                  throw K6.invalidParameterError(
                    "create.noise.mean",
                    "number between 0 and 10000",
                    _.create.noise.mean,
                  );
              if ((($.createNoiseSigma = 30), K6.defined(_.create.noise.sigma)))
                if (K6.number(_.create.noise.sigma) && K6.inRange(_.create.noise.sigma, 0, 1e4))
                  $.createNoiseSigma = _.create.noise.sigma;
                else
                  throw K6.invalidParameterError(
                    "create.noise.sigma",
                    "number between 0 and 10000",
                    _.create.noise.sigma,
                  );
            } else if (K6.defined(_.create.background)) {
              if (!K6.inRange(_.create.channels, 3, 4))
                throw K6.invalidParameterError("create.channels", "number between 3 and 4", _.create.channels);
              $.createBackground = this._getBackgroundColourOption(_.create.background);
            } else throw Error("Expected valid noise or background to create a new input image");
            delete $.buffer;
          } else throw Error("Expected valid width, height and channels to create a new input image");
        if (K6.defined(_.text))
          if (K6.object(_.text) && K6.string(_.text.text)) {
            if ((($.textValue = _.text.text), K6.defined(_.text.height) && K6.defined(_.text.dpi)))
              throw Error("Expected only one of dpi or height");
            if (K6.defined(_.text.font))
              if (K6.string(_.text.font)) $.textFont = _.text.font;
              else throw K6.invalidParameterError("text.font", "string", _.text.font);
            if (K6.defined(_.text.fontfile))
              if (K6.string(_.text.fontfile)) $.textFontfile = _.text.fontfile;
              else throw K6.invalidParameterError("text.fontfile", "string", _.text.fontfile);
            if (K6.defined(_.text.width))
              if (K6.integer(_.text.width) && _.text.width > 0) $.textWidth = _.text.width;
              else throw K6.invalidParameterError("text.width", "positive integer", _.text.width);
            if (K6.defined(_.text.height))
              if (K6.integer(_.text.height) && _.text.height > 0) $.textHeight = _.text.height;
              else throw K6.invalidParameterError("text.height", "positive integer", _.text.height);
            if (K6.defined(_.text.align))
              if (K6.string(_.text.align) && K6.string(this.constructor.align[_.text.align]))
                $.textAlign = this.constructor.align[_.text.align];
              else throw K6.invalidParameterError("text.align", "valid alignment", _.text.align);
            if (K6.defined(_.text.justify))
              if (K6.bool(_.text.justify)) $.textJustify = _.text.justify;
              else throw K6.invalidParameterError("text.justify", "boolean", _.text.justify);
            if (K6.defined(_.text.dpi))
              if (K6.integer(_.text.dpi) && K6.inRange(_.text.dpi, 1, 1e6)) $.textDpi = _.text.dpi;
              else throw K6.invalidParameterError("text.dpi", "integer between 1 and 1000000", _.text.dpi);
            if (K6.defined(_.text.rgba))
              if (K6.bool(_.text.rgba)) $.textRgba = _.text.rgba;
              else throw K6.invalidParameterError("text.rgba", "bool", _.text.rgba);
            if (K6.defined(_.text.spacing))
              if (K6.integer(_.text.spacing) && K6.inRange(_.text.spacing, -1e6, 1e6)) $.textSpacing = _.text.spacing;
              else
                throw K6.invalidParameterError("text.spacing", "integer between -1000000 and 1000000", _.text.spacing);
            if (K6.defined(_.text.wrap))
              if (K6.string(_.text.wrap) && K6.inArray(_.text.wrap, ["word", "char", "word-char", "none"]))
                $.textWrap = _.text.wrap;
              else throw K6.invalidParameterError("text.wrap", "one of: word, char, word-char, none", _.text.wrap);
            delete $.buffer;
          } else throw Error("Expected a valid string to create an image with text.");
        if (K6.defined(_.join))
          if (K6.defined(this.options.join)) {
            if (K6.defined(_.join.animated))
              if (K6.bool(_.join.animated)) $.joinAnimated = _.join.animated;
              else throw K6.invalidParameterError("join.animated", "boolean", _.join.animated);
            if (K6.defined(_.join.across))
              if (K6.integer(_.join.across) && K6.inRange(_.join.across, 1, 1e6)) $.joinAcross = _.join.across;
              else throw K6.invalidParameterError("join.across", "integer between 1 and 100000", _.join.across);
            if (K6.defined(_.join.shim))
              if (K6.integer(_.join.shim) && K6.inRange(_.join.shim, 0, 1e6)) $.joinShim = _.join.shim;
              else throw K6.invalidParameterError("join.shim", "integer between 0 and 100000", _.join.shim);
            if (K6.defined(_.join.background)) $.joinBackground = this._getBackgroundColourOption(_.join.background);
            if (K6.defined(_.join.halign))
              if (K6.string(_.join.halign) && K6.string(this.constructor.align[_.join.halign]))
                $.joinHalign = this.constructor.align[_.join.halign];
              else throw K6.invalidParameterError("join.halign", "valid alignment", _.join.halign);
            if (K6.defined(_.join.valign))
              if (K6.string(_.join.valign) && K6.string(this.constructor.align[_.join.valign]))
                $.joinValign = this.constructor.align[_.join.valign];
              else throw K6.invalidParameterError("join.valign", "valid alignment", _.join.valign);
          } else throw Error("Expected input to be an array of images to join");
      } else if (K6.defined(_)) throw Error(`Invalid input options ${_}`);
      return $;
    }
    function Lo4(H, _, q) {
      if (Array.isArray(this.options.input.buffer))
        if (K6.buffer(H)) {
          if (this.options.input.buffer.length === 0)
            this.on("finish", () => {
              this.streamInFinished = !0;
            });
          this.options.input.buffer.push(H), q();
        } else q(Error("Non-Buffer data on Writable Stream"));
      else q(Error("Unexpected data on Writable Stream"));
    }
    function ko4() {
      if (this._isStreamInput()) this.options.input.buffer = Buffer.concat(this.options.input.buffer);
    }
    function vo4() {
      return Array.isArray(this.options.input.buffer);
    }
    function No4(H) {
      let _ = Error();
      if (K6.fn(H)) {
        if (this._isStreamInput())
          this.on("finish", () => {
            this._flattenBufferIn(),
              $8H.metadata(this.options, (q, $) => {
                if (q) H(K6.nativeError(q, _));
                else H(null, $);
              });
          });
        else
          $8H.metadata(this.options, (q, $) => {
            if (q) H(K6.nativeError(q, _));
            else H(null, $);
          });
        return this;
      } else if (this._isStreamInput())
        return new Promise((q, $) => {
          let K = () => {
            this._flattenBufferIn(),
              $8H.metadata(this.options, (O, T) => {
                if (O) $(K6.nativeError(O, _));
                else q(T);
              });
          };
          if (this.writableFinished) K();
          else this.once("finish", K);
        });
      else
        return new Promise((q, $) => {
          $8H.metadata(this.options, (K, O) => {
            if (K) $(K6.nativeError(K, _));
            else q(O);
          });
        });
    }
    function ho4(H) {
      let _ = Error();
      if (K6.fn(H)) {
        if (this._isStreamInput())
          this.on("finish", () => {
            this._flattenBufferIn(),
              $8H.stats(this.options, (q, $) => {
                if (q) H(K6.nativeError(q, _));
                else H(null, $);
              });
          });
        else
          $8H.stats(this.options, (q, $) => {
            if (q) H(K6.nativeError(q, _));
            else H(null, $);
          });
        return this;
      } else if (this._isStreamInput())
        return new Promise((q, $) => {
          this.on("finish", function () {
            this._flattenBufferIn(),
              $8H.stats(this.options, (K, O) => {
                if (K) $(K6.nativeError(K, _));
                else q(O);
              });
          });
        });
      else
        return new Promise((q, $) => {
          $8H.stats(this.options, (K, O) => {
            if (K) $(K6.nativeError(K, _));
            else q(O);
          });
        });
    }
    c37.exports = (H) => {
      Object.assign(H.prototype, {
        _inputOptionsFromObject: d37,
        _createInputDescriptor: Zo4,
        _write: Lo4,
        _flattenBufferIn: ko4,
        _isStreamInput: vo4,
        metadata: No4,
        stats: ho4,
      }),
        (H.align = Go4);
    };
  });

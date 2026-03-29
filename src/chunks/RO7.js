  var RO7 = d((VHO, GO7) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var uI6 = require("path"),
      M_ = Pd(),
      GZH = CiH(),
      PO7 = new Map([
        ["heic", "heif"],
        ["heif", "heif"],
        ["avif", "avif"],
        ["jpeg", "jpeg"],
        ["jpg", "jpeg"],
        ["jpe", "jpeg"],
        ["tile", "tile"],
        ["dz", "tile"],
        ["png", "png"],
        ["raw", "raw"],
        ["tiff", "tiff"],
        ["tif", "tiff"],
        ["webp", "webp"],
        ["gif", "gif"],
        ["jp2", "jp2"],
        ["jpx", "jp2"],
        ["j2k", "jp2"],
        ["j2c", "jp2"],
        ["jxl", "jxl"],
      ]),
      ma4 = /\.(jp[2x]|j2[kc])$/i,
      XO7 = () => Error("JP2 output requires libvips with support for OpenJPEG"),
      WO7 = (H) => 1 << (31 - Math.clz32(Math.ceil(Math.log2(H))));
    function pa4(H, _) {
      let q;
      if (!M_.string(H)) q = Error("Missing output file path");
      else if (M_.string(this.options.input.file) && uI6.resolve(this.options.input.file) === uI6.resolve(H))
        q = Error("Cannot use same file for input and output");
      else if (ma4.test(uI6.extname(H)) && !this.constructor.format.jp2k.output.file) q = XO7();
      if (q)
        if (M_.fn(_)) _(q);
        else return Promise.reject(q);
      else {
        this.options.fileOut = H;
        let $ = Error();
        return this._pipeline(_, $);
      }
      return this;
    }
    function Ba4(H, _) {
      if (M_.object(H)) this._setBooleanOption("resolveWithObject", H.resolveWithObject);
      else if (this.options.resolveWithObject) this.options.resolveWithObject = !1;
      this.options.fileOut = "";
      let q = Error();
      return this._pipeline(M_.fn(H) ? H : _, q);
    }
    function ga4() {
      return (this.options.keepMetadata |= 1), this;
    }
    function da4(H) {
      if (M_.object(H))
        for (let [_, q] of Object.entries(H))
          if (M_.object(q))
            for (let [$, K] of Object.entries(q))
              if (M_.string(K)) this.options.withExif[`exif-${_.toLowerCase()}-${$}`] = K;
              else throw M_.invalidParameterError(`${_}.${$}`, "string", K);
          else throw M_.invalidParameterError(_, "object", q);
      else throw M_.invalidParameterError("exif", "object", H);
      return (this.options.withExifMerge = !1), this.keepExif();
    }
    function ca4(H) {
      return this.withExif(H), (this.options.withExifMerge = !0), this;
    }
    function Fa4() {
      return (this.options.keepMetadata |= 8), this;
    }
    function Ua4(H, _) {
      if (M_.string(H)) this.options.withIccProfile = H;
      else throw M_.invalidParameterError("icc", "string", H);
      if ((this.keepIccProfile(), M_.object(_))) {
        if (M_.defined(_.attach))
          if (M_.bool(_.attach)) {
            if (!_.attach) this.options.keepMetadata &= -9;
          } else throw M_.invalidParameterError("attach", "boolean", _.attach);
      }
      return this;
    }
    function Qa4() {
      return (this.options.keepMetadata |= 2), this;
    }
    function la4(H) {
      if (M_.string(H) && H.length > 0) (this.options.withXmp = H), (this.options.keepMetadata |= 2);
      else throw M_.invalidParameterError("xmp", "non-empty string", H);
      return this;
    }
    function ia4() {
      return (this.options.keepMetadata = 31), this;
    }
    function na4(H) {
      if ((this.keepMetadata(), this.withIccProfile("srgb"), M_.object(H))) {
        if (M_.defined(H.orientation))
          if (M_.integer(H.orientation) && M_.inRange(H.orientation, 1, 8))
            this.options.withMetadataOrientation = H.orientation;
          else throw M_.invalidParameterError("orientation", "integer between 1 and 8", H.orientation);
        if (M_.defined(H.density))
          if (M_.number(H.density) && H.density > 0) this.options.withMetadataDensity = H.density;
          else throw M_.invalidParameterError("density", "positive number", H.density);
        if (M_.defined(H.icc)) this.withIccProfile(H.icc);
        if (M_.defined(H.exif)) this.withExifMerge(H.exif);
      }
      return this;
    }
    function ra4(H, _) {
      let q = PO7.get((M_.object(H) && M_.string(H.id) ? H.id : H).toLowerCase());
      if (!q) throw M_.invalidParameterError("format", `one of: ${[...PO7.keys()].join(", ")}`, H);
      return this[q](_);
    }
    function oa4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100)) this.options.jpegQuality = H.quality;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        if (M_.defined(H.progressive)) this._setBooleanOption("jpegProgressive", H.progressive);
        if (M_.defined(H.chromaSubsampling))
          if (M_.string(H.chromaSubsampling) && M_.inArray(H.chromaSubsampling, ["4:2:0", "4:4:4"]))
            this.options.jpegChromaSubsampling = H.chromaSubsampling;
          else throw M_.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", H.chromaSubsampling);
        let _ = M_.bool(H.optimizeCoding) ? H.optimizeCoding : H.optimiseCoding;
        if (M_.defined(_)) this._setBooleanOption("jpegOptimiseCoding", _);
        if (M_.defined(H.mozjpeg))
          if (M_.bool(H.mozjpeg)) {
            if (H.mozjpeg)
              (this.options.jpegTrellisQuantisation = !0),
                (this.options.jpegOvershootDeringing = !0),
                (this.options.jpegOptimiseScans = !0),
                (this.options.jpegProgressive = !0),
                (this.options.jpegQuantisationTable = 3);
          } else throw M_.invalidParameterError("mozjpeg", "boolean", H.mozjpeg);
        let q = M_.bool(H.trellisQuantization) ? H.trellisQuantization : H.trellisQuantisation;
        if (M_.defined(q)) this._setBooleanOption("jpegTrellisQuantisation", q);
        if (M_.defined(H.overshootDeringing)) this._setBooleanOption("jpegOvershootDeringing", H.overshootDeringing);
        let $ = M_.bool(H.optimizeScans) ? H.optimizeScans : H.optimiseScans;
        if (M_.defined($)) {
          if ((this._setBooleanOption("jpegOptimiseScans", $), $)) this.options.jpegProgressive = !0;
        }
        let K = M_.number(H.quantizationTable) ? H.quantizationTable : H.quantisationTable;
        if (M_.defined(K))
          if (M_.integer(K) && M_.inRange(K, 0, 8)) this.options.jpegQuantisationTable = K;
          else throw M_.invalidParameterError("quantisationTable", "integer between 0 and 8", K);
      }
      return this._updateFormatOut("jpeg", H);
    }
    function aa4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.progressive)) this._setBooleanOption("pngProgressive", H.progressive);
        if (M_.defined(H.compressionLevel))
          if (M_.integer(H.compressionLevel) && M_.inRange(H.compressionLevel, 0, 9))
            this.options.pngCompressionLevel = H.compressionLevel;
          else throw M_.invalidParameterError("compressionLevel", "integer between 0 and 9", H.compressionLevel);
        if (M_.defined(H.adaptiveFiltering)) this._setBooleanOption("pngAdaptiveFiltering", H.adaptiveFiltering);
        let _ = H.colours || H.colors;
        if (M_.defined(_))
          if (M_.integer(_) && M_.inRange(_, 2, 256)) this.options.pngBitdepth = WO7(_);
          else throw M_.invalidParameterError("colours", "integer between 2 and 256", _);
        if (M_.defined(H.palette)) this._setBooleanOption("pngPalette", H.palette);
        else if ([H.quality, H.effort, H.colours, H.colors, H.dither].some(M_.defined))
          this._setBooleanOption("pngPalette", !0);
        if (this.options.pngPalette) {
          if (M_.defined(H.quality))
            if (M_.integer(H.quality) && M_.inRange(H.quality, 0, 100)) this.options.pngQuality = H.quality;
            else throw M_.invalidParameterError("quality", "integer between 0 and 100", H.quality);
          if (M_.defined(H.effort))
            if (M_.integer(H.effort) && M_.inRange(H.effort, 1, 10)) this.options.pngEffort = H.effort;
            else throw M_.invalidParameterError("effort", "integer between 1 and 10", H.effort);
          if (M_.defined(H.dither))
            if (M_.number(H.dither) && M_.inRange(H.dither, 0, 1)) this.options.pngDither = H.dither;
            else throw M_.invalidParameterError("dither", "number between 0.0 and 1.0", H.dither);
        }
      }
      return this._updateFormatOut("png", H);
    }
    function sa4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100)) this.options.webpQuality = H.quality;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        if (M_.defined(H.alphaQuality))
          if (M_.integer(H.alphaQuality) && M_.inRange(H.alphaQuality, 0, 100))
            this.options.webpAlphaQuality = H.alphaQuality;
          else throw M_.invalidParameterError("alphaQuality", "integer between 0 and 100", H.alphaQuality);
        if (M_.defined(H.lossless)) this._setBooleanOption("webpLossless", H.lossless);
        if (M_.defined(H.nearLossless)) this._setBooleanOption("webpNearLossless", H.nearLossless);
        if (M_.defined(H.smartSubsample)) this._setBooleanOption("webpSmartSubsample", H.smartSubsample);
        if (M_.defined(H.smartDeblock)) this._setBooleanOption("webpSmartDeblock", H.smartDeblock);
        if (M_.defined(H.preset))
          if (M_.string(H.preset) && M_.inArray(H.preset, ["default", "photo", "picture", "drawing", "icon", "text"]))
            this.options.webpPreset = H.preset;
          else
            throw M_.invalidParameterError("preset", "one of: default, photo, picture, drawing, icon, text", H.preset);
        if (M_.defined(H.effort))
          if (M_.integer(H.effort) && M_.inRange(H.effort, 0, 6)) this.options.webpEffort = H.effort;
          else throw M_.invalidParameterError("effort", "integer between 0 and 6", H.effort);
        if (M_.defined(H.minSize)) this._setBooleanOption("webpMinSize", H.minSize);
        if (M_.defined(H.mixed)) this._setBooleanOption("webpMixed", H.mixed);
      }
      return xI6(H, this.options), this._updateFormatOut("webp", H);
    }
    function ta4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.reuse)) this._setBooleanOption("gifReuse", H.reuse);
        if (M_.defined(H.progressive)) this._setBooleanOption("gifProgressive", H.progressive);
        let _ = H.colours || H.colors;
        if (M_.defined(_))
          if (M_.integer(_) && M_.inRange(_, 2, 256)) this.options.gifBitdepth = WO7(_);
          else throw M_.invalidParameterError("colours", "integer between 2 and 256", _);
        if (M_.defined(H.effort))
          if (M_.number(H.effort) && M_.inRange(H.effort, 1, 10)) this.options.gifEffort = H.effort;
          else throw M_.invalidParameterError("effort", "integer between 1 and 10", H.effort);
        if (M_.defined(H.dither))
          if (M_.number(H.dither) && M_.inRange(H.dither, 0, 1)) this.options.gifDither = H.dither;
          else throw M_.invalidParameterError("dither", "number between 0.0 and 1.0", H.dither);
        if (M_.defined(H.interFrameMaxError))
          if (M_.number(H.interFrameMaxError) && M_.inRange(H.interFrameMaxError, 0, 32))
            this.options.gifInterFrameMaxError = H.interFrameMaxError;
          else
            throw M_.invalidParameterError("interFrameMaxError", "number between 0.0 and 32.0", H.interFrameMaxError);
        if (M_.defined(H.interPaletteMaxError))
          if (M_.number(H.interPaletteMaxError) && M_.inRange(H.interPaletteMaxError, 0, 256))
            this.options.gifInterPaletteMaxError = H.interPaletteMaxError;
          else
            throw M_.invalidParameterError(
              "interPaletteMaxError",
              "number between 0.0 and 256.0",
              H.interPaletteMaxError,
            );
        if (M_.defined(H.keepDuplicateFrames))
          if (M_.bool(H.keepDuplicateFrames)) this._setBooleanOption("gifKeepDuplicateFrames", H.keepDuplicateFrames);
          else throw M_.invalidParameterError("keepDuplicateFrames", "boolean", H.keepDuplicateFrames);
      }
      return xI6(H, this.options), this._updateFormatOut("gif", H);
    }
    function ea4(H) {
      if (!this.constructor.format.jp2k.output.buffer) throw XO7();
      if (M_.object(H)) {
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100)) this.options.jp2Quality = H.quality;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        if (M_.defined(H.lossless))
          if (M_.bool(H.lossless)) this.options.jp2Lossless = H.lossless;
          else throw M_.invalidParameterError("lossless", "boolean", H.lossless);
        if (M_.defined(H.tileWidth))
          if (M_.integer(H.tileWidth) && M_.inRange(H.tileWidth, 1, 32768)) this.options.jp2TileWidth = H.tileWidth;
          else throw M_.invalidParameterError("tileWidth", "integer between 1 and 32768", H.tileWidth);
        if (M_.defined(H.tileHeight))
          if (M_.integer(H.tileHeight) && M_.inRange(H.tileHeight, 1, 32768)) this.options.jp2TileHeight = H.tileHeight;
          else throw M_.invalidParameterError("tileHeight", "integer between 1 and 32768", H.tileHeight);
        if (M_.defined(H.chromaSubsampling))
          if (M_.string(H.chromaSubsampling) && M_.inArray(H.chromaSubsampling, ["4:2:0", "4:4:4"]))
            this.options.jp2ChromaSubsampling = H.chromaSubsampling;
          else throw M_.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", H.chromaSubsampling);
      }
      return this._updateFormatOut("jp2", H);
    }
    function xI6(H, _) {
      if (M_.object(H) && M_.defined(H.loop))
        if (M_.integer(H.loop) && M_.inRange(H.loop, 0, 65535)) _.loop = H.loop;
        else throw M_.invalidParameterError("loop", "integer between 0 and 65535", H.loop);
      if (M_.object(H) && M_.defined(H.delay))
        if (M_.integer(H.delay) && M_.inRange(H.delay, 0, 65535)) _.delay = [H.delay];
        else if (Array.isArray(H.delay) && H.delay.every(M_.integer) && H.delay.every((q) => M_.inRange(q, 0, 65535)))
          _.delay = H.delay;
        else throw M_.invalidParameterError("delay", "integer or an array of integers between 0 and 65535", H.delay);
    }
    function Hs4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100)) this.options.tiffQuality = H.quality;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        if (M_.defined(H.bitdepth))
          if (M_.integer(H.bitdepth) && M_.inArray(H.bitdepth, [1, 2, 4, 8])) this.options.tiffBitdepth = H.bitdepth;
          else throw M_.invalidParameterError("bitdepth", "1, 2, 4 or 8", H.bitdepth);
        if (M_.defined(H.tile)) this._setBooleanOption("tiffTile", H.tile);
        if (M_.defined(H.tileWidth))
          if (M_.integer(H.tileWidth) && H.tileWidth > 0) this.options.tiffTileWidth = H.tileWidth;
          else throw M_.invalidParameterError("tileWidth", "integer greater than zero", H.tileWidth);
        if (M_.defined(H.tileHeight))
          if (M_.integer(H.tileHeight) && H.tileHeight > 0) this.options.tiffTileHeight = H.tileHeight;
          else throw M_.invalidParameterError("tileHeight", "integer greater than zero", H.tileHeight);
        if (M_.defined(H.miniswhite)) this._setBooleanOption("tiffMiniswhite", H.miniswhite);
        if (M_.defined(H.pyramid)) this._setBooleanOption("tiffPyramid", H.pyramid);
        if (M_.defined(H.xres))
          if (M_.number(H.xres) && H.xres > 0) this.options.tiffXres = H.xres;
          else throw M_.invalidParameterError("xres", "number greater than zero", H.xres);
        if (M_.defined(H.yres))
          if (M_.number(H.yres) && H.yres > 0) this.options.tiffYres = H.yres;
          else throw M_.invalidParameterError("yres", "number greater than zero", H.yres);
        if (M_.defined(H.compression))
          if (
            M_.string(H.compression) &&
            M_.inArray(H.compression, [
              "none",
              "jpeg",
              "deflate",
              "packbits",
              "ccittfax4",
              "lzw",
              "webp",
              "zstd",
              "jp2k",
            ])
          )
            this.options.tiffCompression = H.compression;
          else
            throw M_.invalidParameterError(
              "compression",
              "one of: none, jpeg, deflate, packbits, ccittfax4, lzw, webp, zstd, jp2k",
              H.compression,
            );
        if (M_.defined(H.bigtiff)) this._setBooleanOption("tiffBigtiff", H.bigtiff);
        if (M_.defined(H.predictor))
          if (M_.string(H.predictor) && M_.inArray(H.predictor, ["none", "horizontal", "float"]))
            this.options.tiffPredictor = H.predictor;
          else throw M_.invalidParameterError("predictor", "one of: none, horizontal, float", H.predictor);
        if (M_.defined(H.resolutionUnit))
          if (M_.string(H.resolutionUnit) && M_.inArray(H.resolutionUnit, ["inch", "cm"]))
            this.options.tiffResolutionUnit = H.resolutionUnit;
          else throw M_.invalidParameterError("resolutionUnit", "one of: inch, cm", H.resolutionUnit);
      }
      return this._updateFormatOut("tiff", H);
    }
    function _s4(H) {
      return this.heif({ ...H, compression: "av1" });
    }
    function qs4(H) {
      if (M_.object(H)) {
        if (M_.string(H.compression) && M_.inArray(H.compression, ["av1", "hevc"]))
          this.options.heifCompression = H.compression;
        else throw M_.invalidParameterError("compression", "one of: av1, hevc", H.compression);
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100)) this.options.heifQuality = H.quality;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        if (M_.defined(H.lossless))
          if (M_.bool(H.lossless)) this.options.heifLossless = H.lossless;
          else throw M_.invalidParameterError("lossless", "boolean", H.lossless);
        if (M_.defined(H.effort))
          if (M_.integer(H.effort) && M_.inRange(H.effort, 0, 9)) this.options.heifEffort = H.effort;
          else throw M_.invalidParameterError("effort", "integer between 0 and 9", H.effort);
        if (M_.defined(H.chromaSubsampling))
          if (M_.string(H.chromaSubsampling) && M_.inArray(H.chromaSubsampling, ["4:2:0", "4:4:4"]))
            this.options.heifChromaSubsampling = H.chromaSubsampling;
          else throw M_.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", H.chromaSubsampling);
        if (M_.defined(H.bitdepth))
          if (M_.integer(H.bitdepth) && M_.inArray(H.bitdepth, [8, 10, 12])) {
            if (H.bitdepth !== 8 && this.constructor.versions.heif)
              throw M_.invalidParameterError("bitdepth when using prebuilt binaries", 8, H.bitdepth);
            this.options.heifBitdepth = H.bitdepth;
          } else throw M_.invalidParameterError("bitdepth", "8, 10 or 12", H.bitdepth);
      } else throw M_.invalidParameterError("options", "Object", H);
      return this._updateFormatOut("heif", H);
    }
    function $s4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.quality))
          if (M_.integer(H.quality) && M_.inRange(H.quality, 1, 100))
            this.options.jxlDistance =
              H.quality >= 30
                ? 0.1 + (100 - H.quality) * 0.09
                : 0.017666666666666667 * H.quality * H.quality - 1.15 * H.quality + 25;
          else throw M_.invalidParameterError("quality", "integer between 1 and 100", H.quality);
        else if (M_.defined(H.distance))
          if (M_.number(H.distance) && M_.inRange(H.distance, 0, 15)) this.options.jxlDistance = H.distance;
          else throw M_.invalidParameterError("distance", "number between 0.0 and 15.0", H.distance);
        if (M_.defined(H.decodingTier))
          if (M_.integer(H.decodingTier) && M_.inRange(H.decodingTier, 0, 4))
            this.options.jxlDecodingTier = H.decodingTier;
          else throw M_.invalidParameterError("decodingTier", "integer between 0 and 4", H.decodingTier);
        if (M_.defined(H.lossless))
          if (M_.bool(H.lossless)) this.options.jxlLossless = H.lossless;
          else throw M_.invalidParameterError("lossless", "boolean", H.lossless);
        if (M_.defined(H.effort))
          if (M_.integer(H.effort) && M_.inRange(H.effort, 1, 9)) this.options.jxlEffort = H.effort;
          else throw M_.invalidParameterError("effort", "integer between 1 and 9", H.effort);
      }
      return xI6(H, this.options), this._updateFormatOut("jxl", H);
    }
    function Ks4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.depth))
          if (
            M_.string(H.depth) &&
            M_.inArray(H.depth, [
              "char",
              "uchar",
              "short",
              "ushort",
              "int",
              "uint",
              "float",
              "complex",
              "double",
              "dpcomplex",
            ])
          )
            this.options.rawDepth = H.depth;
          else
            throw M_.invalidParameterError(
              "depth",
              "one of: char, uchar, short, ushort, int, uint, float, complex, double, dpcomplex",
              H.depth,
            );
      }
      return this._updateFormatOut("raw");
    }
    function Os4(H) {
      if (M_.object(H)) {
        if (M_.defined(H.size))
          if (M_.integer(H.size) && M_.inRange(H.size, 1, 8192)) this.options.tileSize = H.size;
          else throw M_.invalidParameterError("size", "integer between 1 and 8192", H.size);
        if (M_.defined(H.overlap))
          if (M_.integer(H.overlap) && M_.inRange(H.overlap, 0, 8192)) {
            if (H.overlap > this.options.tileSize)
              throw M_.invalidParameterError("overlap", `<= size (${this.options.tileSize})`, H.overlap);
            this.options.tileOverlap = H.overlap;
          } else throw M_.invalidParameterError("overlap", "integer between 0 and 8192", H.overlap);
        if (M_.defined(H.container))
          if (M_.string(H.container) && M_.inArray(H.container, ["fs", "zip"]))
            this.options.tileContainer = H.container;
          else throw M_.invalidParameterError("container", "one of: fs, zip", H.container);
        if (M_.defined(H.layout))
          if (M_.string(H.layout) && M_.inArray(H.layout, ["dz", "google", "iiif", "iiif3", "zoomify"]))
            this.options.tileLayout = H.layout;
          else throw M_.invalidParameterError("layout", "one of: dz, google, iiif, iiif3, zoomify", H.layout);
        if (M_.defined(H.angle))
          if (M_.integer(H.angle) && !(H.angle % 90)) this.options.tileAngle = H.angle;
          else throw M_.invalidParameterError("angle", "positive/negative multiple of 90", H.angle);
        if ((this._setBackgroundColourOption("tileBackground", H.background), M_.defined(H.depth)))
          if (M_.string(H.depth) && M_.inArray(H.depth, ["onepixel", "onetile", "one"]))
            this.options.tileDepth = H.depth;
          else throw M_.invalidParameterError("depth", "one of: onepixel, onetile, one", H.depth);
        if (M_.defined(H.skipBlanks))
          if (M_.integer(H.skipBlanks) && M_.inRange(H.skipBlanks, -1, 65535))
            this.options.tileSkipBlanks = H.skipBlanks;
          else throw M_.invalidParameterError("skipBlanks", "integer between -1 and 255/65535", H.skipBlanks);
        else if (M_.defined(H.layout) && H.layout === "google") this.options.tileSkipBlanks = 5;
        let _ = M_.bool(H.center) ? H.center : H.centre;
        if (M_.defined(_)) this._setBooleanOption("tileCentre", _);
        if (M_.defined(H.id))
          if (M_.string(H.id)) this.options.tileId = H.id;
          else throw M_.invalidParameterError("id", "string", H.id);
        if (M_.defined(H.basename))
          if (M_.string(H.basename)) this.options.tileBasename = H.basename;
          else throw M_.invalidParameterError("basename", "string", H.basename);
      }
      if (M_.inArray(this.options.formatOut, ["jpeg", "png", "webp"])) this.options.tileFormat = this.options.formatOut;
      else if (this.options.formatOut !== "input")
        throw M_.invalidParameterError("format", "one of: jpeg, png, webp", this.options.formatOut);
      return this._updateFormatOut("dz");
    }
    function Ts4(H) {
      if (!M_.plainObject(H)) throw M_.invalidParameterError("options", "object", H);
      if (M_.integer(H.seconds) && M_.inRange(H.seconds, 0, 3600)) this.options.timeoutSeconds = H.seconds;
      else throw M_.invalidParameterError("seconds", "integer between 0 and 3600", H.seconds);
      return this;
    }
    function zs4(H, _) {
      if (!(M_.object(_) && _.force === !1)) this.options.formatOut = H;
      return this;
    }
    function As4(H, _) {
      if (M_.bool(_)) this.options[H] = _;
      else throw M_.invalidParameterError(H, "boolean", _);
    }
    function fs4() {
      if (!this.options.streamOut) {
        this.options.streamOut = !0;
        let H = Error();
        this._pipeline(void 0, H);
      }
    }
    function ws4(H, _) {
      if (typeof H === "function") {
        if (this._isStreamInput())
          this.on("finish", () => {
            this._flattenBufferIn(),
              GZH.pipeline(this.options, (q, $, K) => {
                if (q) H(M_.nativeError(q, _));
                else H(null, $, K);
              });
          });
        else
          GZH.pipeline(this.options, (q, $, K) => {
            if (q) H(M_.nativeError(q, _));
            else H(null, $, K);
          });
        return this;
      } else if (this.options.streamOut) {
        if (this._isStreamInput()) {
          if (
            (this.once("finish", () => {
              this._flattenBufferIn(),
                GZH.pipeline(this.options, (q, $, K) => {
                  if (q) this.emit("error", M_.nativeError(q, _));
                  else this.emit("info", K), this.push($);
                  this.push(null), this.on("end", () => this.emit("close"));
                });
            }),
            this.streamInFinished)
          )
            this.emit("finish");
        } else
          GZH.pipeline(this.options, (q, $, K) => {
            if (q) this.emit("error", M_.nativeError(q, _));
            else this.emit("info", K), this.push($);
            this.push(null), this.on("end", () => this.emit("close"));
          });
        return this;
      } else if (this._isStreamInput())
        return new Promise((q, $) => {
          this.once("finish", () => {
            this._flattenBufferIn(),
              GZH.pipeline(this.options, (K, O, T) => {
                if (K) $(M_.nativeError(K, _));
                else if (this.options.resolveWithObject) q({ data: O, info: T });
                else q(O);
              });
          });
        });
      else
        return new Promise((q, $) => {
          GZH.pipeline(this.options, (K, O, T) => {
            if (K) $(M_.nativeError(K, _));
            else if (this.options.resolveWithObject) q({ data: O, info: T });
            else q(O);
          });
        });
    }
    GO7.exports = (H) => {
      Object.assign(H.prototype, {
        toFile: pa4,
        toBuffer: Ba4,
        keepExif: ga4,
        withExif: da4,
        withExifMerge: ca4,
        keepIccProfile: Fa4,
        withIccProfile: Ua4,
        keepXmp: Qa4,
        withXmp: la4,
        keepMetadata: ia4,
        withMetadata: na4,
        toFormat: ra4,
        jpeg: oa4,
        jp2: ea4,
        png: aa4,
        webp: sa4,
        tiff: Hs4,
        avif: _s4,
        heif: qs4,
        jxl: $s4,
        gif: ta4,
        raw: Ks4,
        tile: Os4,
        timeout: Ts4,
        _updateFormatOut: zs4,
        _setBooleanOption: As4,
        _read: fs4,
        _pipeline: ws4,
      });
    };
  });

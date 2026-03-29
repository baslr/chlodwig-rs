  var HM7 = d((Y8H) => {
    var Cu6 = niH(),
      bu6 = w8H(),
      Y$ = bu6.TAG_NAMES,
      eX = bu6.NAMESPACES,
      IN_ = bu6.ATTRS,
      ej7 = { TEXT_HTML: "text/html", APPLICATION_XML: "application/xhtml+xml" },
      sq1 = {
        attributename: "attributeName",
        attributetype: "attributeType",
        basefrequency: "baseFrequency",
        baseprofile: "baseProfile",
        calcmode: "calcMode",
        clippathunits: "clipPathUnits",
        diffuseconstant: "diffuseConstant",
        edgemode: "edgeMode",
        filterunits: "filterUnits",
        glyphref: "glyphRef",
        gradienttransform: "gradientTransform",
        gradientunits: "gradientUnits",
        kernelmatrix: "kernelMatrix",
        kernelunitlength: "kernelUnitLength",
        keypoints: "keyPoints",
        keysplines: "keySplines",
        keytimes: "keyTimes",
        lengthadjust: "lengthAdjust",
        limitingconeangle: "limitingConeAngle",
        markerheight: "markerHeight",
        markerunits: "markerUnits",
        markerwidth: "markerWidth",
        maskcontentunits: "maskContentUnits",
        maskunits: "maskUnits",
        numoctaves: "numOctaves",
        pathlength: "pathLength",
        patterncontentunits: "patternContentUnits",
        patterntransform: "patternTransform",
        patternunits: "patternUnits",
        pointsatx: "pointsAtX",
        pointsaty: "pointsAtY",
        pointsatz: "pointsAtZ",
        preservealpha: "preserveAlpha",
        preserveaspectratio: "preserveAspectRatio",
        primitiveunits: "primitiveUnits",
        refx: "refX",
        refy: "refY",
        repeatcount: "repeatCount",
        repeatdur: "repeatDur",
        requiredextensions: "requiredExtensions",
        requiredfeatures: "requiredFeatures",
        specularconstant: "specularConstant",
        specularexponent: "specularExponent",
        spreadmethod: "spreadMethod",
        startoffset: "startOffset",
        stddeviation: "stdDeviation",
        stitchtiles: "stitchTiles",
        surfacescale: "surfaceScale",
        systemlanguage: "systemLanguage",
        tablevalues: "tableValues",
        targetx: "targetX",
        targety: "targetY",
        textlength: "textLength",
        viewbox: "viewBox",
        viewtarget: "viewTarget",
        xchannelselector: "xChannelSelector",
        ychannelselector: "yChannelSelector",
        zoomandpan: "zoomAndPan",
      },
      tq1 = {
        "xlink:actuate": { prefix: "xlink", name: "actuate", namespace: eX.XLINK },
        "xlink:arcrole": { prefix: "xlink", name: "arcrole", namespace: eX.XLINK },
        "xlink:href": { prefix: "xlink", name: "href", namespace: eX.XLINK },
        "xlink:role": { prefix: "xlink", name: "role", namespace: eX.XLINK },
        "xlink:show": { prefix: "xlink", name: "show", namespace: eX.XLINK },
        "xlink:title": { prefix: "xlink", name: "title", namespace: eX.XLINK },
        "xlink:type": { prefix: "xlink", name: "type", namespace: eX.XLINK },
        "xml:base": { prefix: "xml", name: "base", namespace: eX.XML },
        "xml:lang": { prefix: "xml", name: "lang", namespace: eX.XML },
        "xml:space": { prefix: "xml", name: "space", namespace: eX.XML },
        xmlns: { prefix: "", name: "xmlns", namespace: eX.XMLNS },
        "xmlns:xlink": { prefix: "xmlns", name: "xlink", namespace: eX.XMLNS },
      },
      eq1 = (Y8H.SVG_TAG_NAMES_ADJUSTMENT_MAP = {
        altglyph: "altGlyph",
        altglyphdef: "altGlyphDef",
        altglyphitem: "altGlyphItem",
        animatecolor: "animateColor",
        animatemotion: "animateMotion",
        animatetransform: "animateTransform",
        clippath: "clipPath",
        feblend: "feBlend",
        fecolormatrix: "feColorMatrix",
        fecomponenttransfer: "feComponentTransfer",
        fecomposite: "feComposite",
        feconvolvematrix: "feConvolveMatrix",
        fediffuselighting: "feDiffuseLighting",
        fedisplacementmap: "feDisplacementMap",
        fedistantlight: "feDistantLight",
        feflood: "feFlood",
        fefunca: "feFuncA",
        fefuncb: "feFuncB",
        fefuncg: "feFuncG",
        fefuncr: "feFuncR",
        fegaussianblur: "feGaussianBlur",
        feimage: "feImage",
        femerge: "feMerge",
        femergenode: "feMergeNode",
        femorphology: "feMorphology",
        feoffset: "feOffset",
        fepointlight: "fePointLight",
        fespecularlighting: "feSpecularLighting",
        fespotlight: "feSpotLight",
        fetile: "feTile",
        feturbulence: "feTurbulence",
        foreignobject: "foreignObject",
        glyphref: "glyphRef",
        lineargradient: "linearGradient",
        radialgradient: "radialGradient",
        textpath: "textPath",
      }),
      H71 = {
        [Y$.B]: !0,
        [Y$.BIG]: !0,
        [Y$.BLOCKQUOTE]: !0,
        [Y$.BODY]: !0,
        [Y$.BR]: !0,
        [Y$.CENTER]: !0,
        [Y$.CODE]: !0,
        [Y$.DD]: !0,
        [Y$.DIV]: !0,
        [Y$.DL]: !0,
        [Y$.DT]: !0,
        [Y$.EM]: !0,
        [Y$.EMBED]: !0,
        [Y$.H1]: !0,
        [Y$.H2]: !0,
        [Y$.H3]: !0,
        [Y$.H4]: !0,
        [Y$.H5]: !0,
        [Y$.H6]: !0,
        [Y$.HEAD]: !0,
        [Y$.HR]: !0,
        [Y$.I]: !0,
        [Y$.IMG]: !0,
        [Y$.LI]: !0,
        [Y$.LISTING]: !0,
        [Y$.MENU]: !0,
        [Y$.META]: !0,
        [Y$.NOBR]: !0,
        [Y$.OL]: !0,
        [Y$.P]: !0,
        [Y$.PRE]: !0,
        [Y$.RUBY]: !0,
        [Y$.S]: !0,
        [Y$.SMALL]: !0,
        [Y$.SPAN]: !0,
        [Y$.STRONG]: !0,
        [Y$.STRIKE]: !0,
        [Y$.SUB]: !0,
        [Y$.SUP]: !0,
        [Y$.TABLE]: !0,
        [Y$.TT]: !0,
        [Y$.U]: !0,
        [Y$.UL]: !0,
        [Y$.VAR]: !0,
      };
    Y8H.causesExit = function (H) {
      let _ = H.tagName;
      return _ === Y$.FONT &&
        (Cu6.getTokenAttr(H, IN_.COLOR) !== null ||
          Cu6.getTokenAttr(H, IN_.SIZE) !== null ||
          Cu6.getTokenAttr(H, IN_.FACE) !== null)
        ? !0
        : H71[_];
    };
    Y8H.adjustTokenMathMLAttrs = function (H) {
      for (let _ = 0; _ < H.attrs.length; _++)
        if (H.attrs[_].name === "definitionurl") {
          H.attrs[_].name = "definitionURL";
          break;
        }
    };
    Y8H.adjustTokenSVGAttrs = function (H) {
      for (let _ = 0; _ < H.attrs.length; _++) {
        let q = sq1[H.attrs[_].name];
        if (q) H.attrs[_].name = q;
      }
    };
    Y8H.adjustTokenXMLAttrs = function (H) {
      for (let _ = 0; _ < H.attrs.length; _++) {
        let q = tq1[H.attrs[_].name];
        if (q) (H.attrs[_].prefix = q.prefix), (H.attrs[_].name = q.name), (H.attrs[_].namespace = q.namespace);
      }
    };
    Y8H.adjustTokenSVGTagName = function (H) {
      let _ = eq1[H.tagName];
      if (_) H.tagName = _;
    };
    function _71(H, _) {
      return _ === eX.MATHML && (H === Y$.MI || H === Y$.MO || H === Y$.MN || H === Y$.MS || H === Y$.MTEXT);
    }
    function q71(H, _, q) {
      if (_ === eX.MATHML && H === Y$.ANNOTATION_XML) {
        for (let $ = 0; $ < q.length; $++)
          if (q[$].name === IN_.ENCODING) {
            let K = q[$].value.toLowerCase();
            return K === ej7.TEXT_HTML || K === ej7.APPLICATION_XML;
          }
      }
      return _ === eX.SVG && (H === Y$.FOREIGN_OBJECT || H === Y$.DESC || H === Y$.TITLE);
    }
    Y8H.isIntegrationPoint = function (H, _, q, $) {
      if ((!$ || $ === eX.HTML) && q71(H, _, q)) return !0;
      if ((!$ || $ === eX.MATHML) && _71(H, _)) return !0;
      return !1;
    };
  });

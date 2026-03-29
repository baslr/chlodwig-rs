  var gT7 = d((C_O, BT7) => {
    function ot4(H) {
      let q = {
          keyword: "if for while var new function do return void else break",
          literal:
            "BackSlash DoubleQuote false ForwardSlash Infinity NaN NewLine null PI SingleQuote Tab TextFormatting true undefined",
          built_in:
            "Abs Acos Angle Attachments Area AreaGeodetic Asin Atan Atan2 Average Bearing Boolean Buffer BufferGeodetic Ceil Centroid Clip Console Constrain Contains Cos Count Crosses Cut Date DateAdd DateDiff Day Decode DefaultValue Dictionary Difference Disjoint Distance DistanceGeodetic Distinct DomainCode DomainName Equals Exp Extent Feature FeatureSet FeatureSetByAssociation FeatureSetById FeatureSetByPortalItem FeatureSetByRelationshipName FeatureSetByTitle FeatureSetByUrl Filter First Floor Geometry GroupBy Guid HasKey Hour IIf IndexOf Intersection Intersects IsEmpty IsNan IsSelfIntersecting Length LengthGeodetic Log Max Mean Millisecond Min Minute Month MultiPartToSinglePart Multipoint NextSequenceValue Now Number OrderBy Overlaps Point Polygon Polyline Portal Pow Random Relate Reverse RingIsClockWise Round Second SetGeometry Sin Sort Sqrt Stdev Sum SymmetricDifference Tan Text Timestamp Today ToLocal Top Touches ToUTC TrackCurrentTime TrackGeometryWindow TrackIndex TrackStartTime TrackWindow TypeOf Union UrlEncode Variance Weekday When Within Year ",
        },
        $ = {
          className: "symbol",
          begin:
            "\\$[datastore|feature|layer|map|measure|sourcefeature|sourcelayer|targetfeature|targetlayer|value|view]+",
        },
        K = {
          className: "number",
          variants: [{ begin: "\\b(0[bB][01]+)" }, { begin: "\\b(0[oO][0-7]+)" }, { begin: H.C_NUMBER_RE }],
          relevance: 0,
        },
        O = { className: "subst", begin: "\\$\\{", end: "\\}", keywords: q, contains: [] },
        T = { className: "string", begin: "`", end: "`", contains: [H.BACKSLASH_ESCAPE, O] };
      O.contains = [H.APOS_STRING_MODE, H.QUOTE_STRING_MODE, T, K, H.REGEXP_MODE];
      let z = O.contains.concat([H.C_BLOCK_COMMENT_MODE, H.C_LINE_COMMENT_MODE]);
      return {
        name: "ArcGIS Arcade",
        keywords: q,
        contains: [
          H.APOS_STRING_MODE,
          H.QUOTE_STRING_MODE,
          T,
          H.C_LINE_COMMENT_MODE,
          H.C_BLOCK_COMMENT_MODE,
          $,
          K,
          {
            begin: /[{,]\s*/,
            relevance: 0,
            contains: [
              {
                begin: "[A-Za-z_][0-9A-Za-z_]*\\s*:",
                returnBegin: !0,
                relevance: 0,
                contains: [{ className: "attr", begin: "[A-Za-z_][0-9A-Za-z_]*", relevance: 0 }],
              },
            ],
          },
          {
            begin: "(" + H.RE_STARTERS_RE + "|\\b(return)\\b)\\s*",
            keywords: "return",
            contains: [
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
              H.REGEXP_MODE,
              {
                className: "function",
                begin: "(\\(.*?\\)|[A-Za-z_][0-9A-Za-z_]*)\\s*=>",
                returnBegin: !0,
                end: "\\s*=>",
                contains: [
                  {
                    className: "params",
                    variants: [
                      { begin: "[A-Za-z_][0-9A-Za-z_]*" },
                      { begin: /\(\s*\)/ },
                      { begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0, keywords: q, contains: z },
                    ],
                  },
                ],
              },
            ],
            relevance: 0,
          },
          {
            className: "function",
            beginKeywords: "function",
            end: /\{/,
            excludeEnd: !0,
            contains: [
              H.inherit(H.TITLE_MODE, { begin: "[A-Za-z_][0-9A-Za-z_]*" }),
              { className: "params", begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0, contains: z },
            ],
            illegal: /\[|%/,
          },
          { begin: /\$[(.]/ },
        ],
        illegal: /#(?!!)/,
      };
    }
    BT7.exports = ot4;
  });

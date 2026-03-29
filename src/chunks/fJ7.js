  var fJ7 = d((Ej) => {
    var TJ7 =
        (Ej && Ej.__createBinding) ||
        (Object.create
          ? function (H, _, q, $) {
              if ($ === void 0) $ = q;
              Object.defineProperty(H, $, {
                enumerable: !0,
                get: function () {
                  return _[q];
                },
              });
            }
          : function (H, _, q, $) {
              if ($ === void 0) $ = q;
              H[$] = _[q];
            }),
      L$1 =
        (Ej && Ej.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      zJ7 =
        (Ej && Ej.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) TJ7(_, H, q);
          }
          return L$1(_, H), _;
        },
      k$1 =
        (Ej && Ej.__exportStar) ||
        function (H, _) {
          for (var q in H) if (q !== "default" && !Object.prototype.hasOwnProperty.call(_, q)) TJ7(_, H, q);
        },
      v$1 =
        (Ej && Ej.__importDefault) ||
        function (H) {
          return H && H.__esModule ? H : { default: H };
        };
    Object.defineProperty(Ej, "__esModule", { value: !0 });
    Ej.supportsLanguage = Ej.listLanguages = Ej.highlight = void 0;
    var rN_ = zJ7(liH()),
      N$1 = zJ7(vM7()),
      h$1 = v$1(IM7()),
      nN_ = iu6();
    function nu6(H, _, q) {
      if (_ === void 0) _ = {};
      switch (H.type) {
        case "text": {
          var $ = H.data;
          if (q === void 0) return (_.default || nN_.DEFAULT_THEME.default || nN_.plain)($);
          return $;
        }
        case "tag": {
          var K = /hljs-(\w+)/.exec(H.attribs.class);
          if (K) {
            var O = K[1],
              T = H.childNodes
                .map(function (z) {
                  return nu6(z, _, O);
                })
                .join("");
            return (_[O] || nN_.DEFAULT_THEME[O] || nN_.plain)(T);
          }
          return H.childNodes
            .map(function (z) {
              return nu6(z, _);
            })
            .join("");
        }
      }
      throw Error("Invalid node type " + H.type);
    }
    function y$1(H, _) {
      if (_ === void 0) _ = {};
      var q = N$1.parseFragment(H, { treeAdapter: h$1.default });
      return q.childNodes
        .map(function ($) {
          return nu6($, _);
        })
        .join("");
    }
    function AJ7(H, _) {
      if (_ === void 0) _ = {};
      var q;
      if (_.language) q = rN_.highlight(H, { language: _.language, ignoreIllegals: _.ignoreIllegals }).value;
      else q = rN_.highlightAuto(H, _.languageSubset).value;
      return y$1(q, _.theme);
    }
    Ej.highlight = AJ7;
    function V$1() {
      return rN_.listLanguages();
    }
    Ej.listLanguages = V$1;
    function S$1(H) {
      return !!rN_.getLanguage(H);
    }
    Ej.supportsLanguage = S$1;
    Ej.default = AJ7;
    k$1(iu6(), Ej);
  });

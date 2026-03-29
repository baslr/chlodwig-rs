  var sGq = d((zz) => {
    var h54 =
        (zz && zz.__createBinding) ||
        (Object.create
          ? function (H, _, q, $) {
              if ($ === void 0) $ = q;
              var K = Object.getOwnPropertyDescriptor(_, q);
              if (!K || ("get" in K ? !_.__esModule : K.writable || K.configurable))
                K = {
                  enumerable: !0,
                  get: function () {
                    return _[q];
                  },
                };
              Object.defineProperty(H, $, K);
            }
          : function (H, _, q, $) {
              if ($ === void 0) $ = q;
              H[$] = _[q];
            }),
      y54 =
        (zz && zz.__setModuleDefault) ||
        (Object.create
          ? function (H, _) {
              Object.defineProperty(H, "default", { enumerable: !0, value: _ });
            }
          : function (H, _) {
              H.default = _;
            }),
      iGq =
        (zz && zz.__importStar) ||
        function (H) {
          if (H && H.__esModule) return H;
          var _ = {};
          if (H != null) {
            for (var q in H) if (q !== "default" && Object.prototype.hasOwnProperty.call(H, q)) h54(_, H, q);
          }
          return y54(_, H), _;
        };
    Object.defineProperty(zz, "__esModule", { value: !0 });
    zz.env = zz.DebugLogBackendBase = zz.placeholder = zz.AdhocDebugLogger = zz.LogSeverity = void 0;
    zz.getNodeBackend = TX6;
    zz.getDebugBackend = S54;
    zz.getStructuredBackend = E54;
    zz.setBackend = C54;
    zz.log = aGq;
    var V54 = require("events"),
      AdH = iGq(require("process")),
      nGq = iGq(require("util")),
      gh = lGq(),
      $u;
    (function (H) {
      (H.DEFAULT = "DEFAULT"), (H.DEBUG = "DEBUG"), (H.INFO = "INFO"), (H.WARNING = "WARNING"), (H.ERROR = "ERROR");
    })($u || (zz.LogSeverity = $u = {}));
    class qJ_ extends V54.EventEmitter {
      constructor(H, _) {
        super();
        (this.namespace = H),
          (this.upstream = _),
          (this.func = Object.assign(this.invoke.bind(this), { instance: this, on: (q, $) => this.on(q, $) })),
          (this.func.debug = (...q) => this.invokeSeverity($u.DEBUG, ...q)),
          (this.func.info = (...q) => this.invokeSeverity($u.INFO, ...q)),
          (this.func.warn = (...q) => this.invokeSeverity($u.WARNING, ...q)),
          (this.func.error = (...q) => this.invokeSeverity($u.ERROR, ...q)),
          (this.func.sublog = (q) => aGq(q, this.func));
      }
      invoke(H, ..._) {
        if (this.upstream) this.upstream(H, ..._);
        this.emit("log", H, _);
      }
      invokeSeverity(H, ..._) {
        this.invoke({ severity: H }, ..._);
      }
    }
    zz.AdhocDebugLogger = qJ_;
    zz.placeholder = new qJ_("", () => {}).func;
    class fdH {
      constructor() {
        var H;
        (this.cached = new Map()), (this.filters = []), (this.filtersSet = !1);
        let _ = (H = AdH.env[zz.env.nodeEnables]) !== null && H !== void 0 ? H : "*";
        if (_ === "all") _ = "*";
        this.filters = _.split(",");
      }
      log(H, _, ...q) {
        try {
          if (!this.filtersSet) this.setFilters(), (this.filtersSet = !0);
          let $ = this.cached.get(H);
          if (!$) ($ = this.makeLogger(H)), this.cached.set(H, $);
          $(_, ...q);
        } catch ($) {
          console.error($);
        }
      }
    }
    zz.DebugLogBackendBase = fdH;
    class AX6 extends fdH {
      constructor() {
        super(...arguments);
        this.enabledRegexp = /.*/g;
      }
      isEnabled(H) {
        return this.enabledRegexp.test(H);
      }
      makeLogger(H) {
        if (!this.enabledRegexp.test(H)) return () => {};
        return (_, ...q) => {
          var $;
          let K = `${gh.Colours.green}${H}${gh.Colours.reset}`,
            O = `${gh.Colours.yellow}${AdH.pid}${gh.Colours.reset}`,
            T;
          switch (_.severity) {
            case $u.ERROR:
              T = `${gh.Colours.red}${_.severity}${gh.Colours.reset}`;
              break;
            case $u.INFO:
              T = `${gh.Colours.magenta}${_.severity}${gh.Colours.reset}`;
              break;
            case $u.WARNING:
              T = `${gh.Colours.yellow}${_.severity}${gh.Colours.reset}`;
              break;
            default:
              T = ($ = _.severity) !== null && $ !== void 0 ? $ : $u.DEFAULT;
              break;
          }
          let z = nGq.formatWithOptions({ colors: gh.Colours.enabled }, ...q),
            A = Object.assign({}, _);
          delete A.severity;
          let f = Object.getOwnPropertyNames(A).length ? JSON.stringify(A) : "",
            w = f ? `${gh.Colours.grey}${f}${gh.Colours.reset}` : "";
          console.error("%s [%s|%s] %s%s", O, K, T, z, f ? ` ${w}` : "");
        };
      }
      setFilters() {
        let _ = this.filters
          .join(",")
          .replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/,/g, "$|^");
        this.enabledRegexp = new RegExp(`^${_}$`, "i");
      }
    }
    function TX6() {
      return new AX6();
    }
    class rGq extends fdH {
      constructor(H) {
        super();
        this.debugPkg = H;
      }
      makeLogger(H) {
        let _ = this.debugPkg(H);
        return (q, ...$) => {
          _($[0], ...$.slice(1));
        };
      }
      setFilters() {
        var H;
        let _ = (H = AdH.env.NODE_DEBUG) !== null && H !== void 0 ? H : "";
        AdH.env.NODE_DEBUG = `${_}${_ ? "," : ""}${this.filters.join(",")}`;
      }
    }
    function S54(H) {
      return new rGq(H);
    }
    class oGq extends fdH {
      constructor(H) {
        var _;
        super();
        this.upstream = (_ = H) !== null && _ !== void 0 ? _ : new AX6();
      }
      makeLogger(H) {
        let _ = this.upstream.makeLogger(H);
        return (q, ...$) => {
          var K;
          let O = (K = q.severity) !== null && K !== void 0 ? K : $u.INFO,
            T = Object.assign({ severity: O, message: nGq.format(...$) }, q),
            z = JSON.stringify(T);
          _(q, z);
        };
      }
      setFilters() {
        this.upstream.setFilters();
      }
    }
    function E54(H) {
      return new oGq(H);
    }
    zz.env = { nodeEnables: "GOOGLE_SDK_NODE_LOGGING" };
    var zX6 = new Map(),
      iS = void 0;
    function C54(H) {
      (iS = H), zX6.clear();
    }
    function aGq(H, _) {
      if (!AdH.env[zz.env.nodeEnables]) return zz.placeholder;
      if (!H) return zz.placeholder;
      if (_) H = `${_.instance.namespace}:${H}`;
      let $ = zX6.get(H);
      if ($) return $.func;
      if (iS === null) return zz.placeholder;
      else if (iS === void 0) iS = TX6();
      let K = (() => {
        let O = void 0;
        return new qJ_(H, (z, ...A) => {
          if (O !== iS) {
            if (iS === null) return;
            else if (iS === void 0) iS = TX6();
            O = iS;
          }
          iS === null || iS === void 0 || iS.log(H, z, ...A);
        });
      })();
      return zX6.set(H, K), K.func;
    }
  });

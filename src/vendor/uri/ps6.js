  var ps6 = d((lzT, d89) => {
    var IP = Hd_();
    d89.exports = wH_;
    function wH_() {}
    wH_.prototype = Object.create(Object.prototype, {
      _url: {
        get: function () {
          return new IP(this.href);
        },
      },
      protocol: {
        get: function () {
          var H = this._url;
          if (H && H.scheme) return H.scheme + ":";
          else return ":";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute()) {
            if (((H = H.replace(/:+$/, "")), (H = H.replace(/[^-+\.a-zA-Z0-9]/g, IP.percentEncode)), H.length > 0))
              (q.scheme = H), (_ = q.toString());
          }
          this.href = _;
        },
      },
      host: {
        get: function () {
          var H = this._url;
          if (H.isAbsolute() && H.isAuthorityBased()) return H.host + (H.port ? ":" + H.port : "");
          else return "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute() && q.isAuthorityBased()) {
            if (((H = H.replace(/[^-+\._~!$&'()*,;:=a-zA-Z0-9]/g, IP.percentEncode)), H.length > 0))
              (q.host = H), delete q.port, (_ = q.toString());
          }
          this.href = _;
        },
      },
      hostname: {
        get: function () {
          var H = this._url;
          if (H.isAbsolute() && H.isAuthorityBased()) return H.host;
          else return "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute() && q.isAuthorityBased()) {
            if (
              ((H = H.replace(/^\/+/, "")),
              (H = H.replace(/[^-+\._~!$&'()*,;:=a-zA-Z0-9]/g, IP.percentEncode)),
              H.length > 0)
            )
              (q.host = H), (_ = q.toString());
          }
          this.href = _;
        },
      },
      port: {
        get: function () {
          var H = this._url;
          if (H.isAbsolute() && H.isAuthorityBased() && H.port !== void 0) return H.port;
          else return "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute() && q.isAuthorityBased()) {
            if (((H = "" + H), (H = H.replace(/[^0-9].*$/, "")), (H = H.replace(/^0+/, "")), H.length === 0)) H = "0";
            if (parseInt(H, 10) <= 65535) (q.port = H), (_ = q.toString());
          }
          this.href = _;
        },
      },
      pathname: {
        get: function () {
          var H = this._url;
          if (H.isAbsolute() && H.isHierarchical()) return H.path;
          else return "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute() && q.isHierarchical()) {
            if (H.charAt(0) !== "/") H = "/" + H;
            (H = H.replace(/[^-+\._~!$&'()*,;:=@\/a-zA-Z0-9]/g, IP.percentEncode)), (q.path = H), (_ = q.toString());
          }
          this.href = _;
        },
      },
      search: {
        get: function () {
          var H = this._url;
          if (H.isAbsolute() && H.isHierarchical() && H.query !== void 0) return "?" + H.query;
          else return "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute() && q.isHierarchical()) {
            if (H.charAt(0) === "?") H = H.substring(1);
            (H = H.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-Z0-9]/g, IP.percentEncode)), (q.query = H), (_ = q.toString());
          }
          this.href = _;
        },
      },
      hash: {
        get: function () {
          var H = this._url;
          if (H == null || H.fragment == null || H.fragment === "") return "";
          else return "#" + H.fragment;
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (H.charAt(0) === "#") H = H.substring(1);
          (H = H.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-Z0-9]/g, IP.percentEncode)),
            (q.fragment = H),
            (_ = q.toString()),
            (this.href = _);
        },
      },
      username: {
        get: function () {
          var H = this._url;
          return H.username || "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute())
            (H = H.replace(/[\x00-\x1F\x7F-\uFFFF "#<>?`\/@\\:]/g, IP.percentEncode)),
              (q.username = H),
              (_ = q.toString());
          this.href = _;
        },
      },
      password: {
        get: function () {
          var H = this._url;
          return H.password || "";
        },
        set: function (H) {
          var _ = this.href,
            q = new IP(_);
          if (q.isAbsolute()) {
            if (H === "") q.password = null;
            else (H = H.replace(/[\x00-\x1F\x7F-\uFFFF "#<>?`\/@\\]/g, IP.percentEncode)), (q.password = H);
            _ = q.toString();
          }
          this.href = _;
        },
      },
      origin: {
        get: function () {
          var H = this._url;
          if (H == null) return "";
          var _ = function (q) {
            var $ = [H.scheme, H.host, +H.port || q];
            return $[0] + "://" + $[1] + ($[2] === q ? "" : ":" + $[2]);
          };
          switch (H.scheme) {
            case "ftp":
              return _(21);
            case "gopher":
              return _(70);
            case "http":
            case "ws":
              return _(80);
            case "https":
            case "wss":
              return _(443);
            default:
              return H.scheme + "://";
          }
        },
      },
    });
    wH_._inherit = function (H) {
      Object.getOwnPropertyNames(wH_.prototype).forEach(function (_) {
        if (_ === "constructor" || _ === "href") return;
        var q = Object.getOwnPropertyDescriptor(wH_.prototype, _);
        Object.defineProperty(H, _, q);
      });
    };
  });

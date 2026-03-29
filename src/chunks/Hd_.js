  var Hd_ = d((dzT, V89) => {
    V89.exports = gW;
    function gW(H) {
      if (!H) return Object.create(gW.prototype);
      this.url = H.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");
      var _ = gW.pattern.exec(this.url);
      if (_) {
        if (_[2]) this.scheme = _[2];
        if (_[4]) {
          var q = _[4].match(gW.userinfoPattern);
          if (q) (this.username = q[1]), (this.password = q[3]), (_[4] = _[4].substring(q[0].length));
          if (_[4].match(gW.portPattern)) {
            var $ = _[4].lastIndexOf(":");
            (this.host = _[4].substring(0, $)), (this.port = _[4].substring($ + 1));
          } else this.host = _[4];
        }
        if (_[5]) this.path = _[5];
        if (_[6]) this.query = _[7];
        if (_[8]) this.fragment = _[9];
      }
    }
    gW.pattern = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
    gW.userinfoPattern = /^([^@:]*)(:([^@]*))?@/;
    gW.portPattern = /:\d+$/;
    gW.authorityPattern = /^[^:\/?#]+:\/\//;
    gW.hierarchyPattern = /^[^:\/?#]+:\//;
    gW.percentEncode = function (_) {
      var q = _.charCodeAt(0);
      if (q < 256) return "%" + q.toString(16);
      else throw Error("can't percent-encode codepoints > 255 yet");
    };
    gW.prototype = {
      constructor: gW,
      isAbsolute: function () {
        return !!this.scheme;
      },
      isAuthorityBased: function () {
        return gW.authorityPattern.test(this.url);
      },
      isHierarchical: function () {
        return gW.hierarchyPattern.test(this.url);
      },
      toString: function () {
        var H = "";
        if (this.scheme !== void 0) H += this.scheme + ":";
        if (this.isAbsolute()) {
          if (((H += "//"), this.username || this.password)) {
            if (((H += this.username || ""), this.password)) H += ":" + this.password;
            H += "@";
          }
          if (this.host) H += this.host;
        }
        if (this.port !== void 0) H += ":" + this.port;
        if (this.path !== void 0) H += this.path;
        if (this.query !== void 0) H += "?" + this.query;
        if (this.fragment !== void 0) H += "#" + this.fragment;
        return H;
      },
      resolve: function (H) {
        var _ = this,
          q = new gW(H),
          $ = new gW();
        if (q.scheme !== void 0)
          ($.scheme = q.scheme),
            ($.username = q.username),
            ($.password = q.password),
            ($.host = q.host),
            ($.port = q.port),
            ($.path = O(q.path)),
            ($.query = q.query);
        else if ((($.scheme = _.scheme), q.host !== void 0))
          ($.username = q.username),
            ($.password = q.password),
            ($.host = q.host),
            ($.port = q.port),
            ($.path = O(q.path)),
            ($.query = q.query);
        else if ((($.username = _.username), ($.password = _.password), ($.host = _.host), ($.port = _.port), !q.path))
          if ((($.path = _.path), q.query !== void 0)) $.query = q.query;
          else $.query = _.query;
        else {
          if (q.path.charAt(0) === "/") $.path = O(q.path);
          else ($.path = K(_.path, q.path)), ($.path = O($.path));
          $.query = q.query;
        }
        return ($.fragment = q.fragment), $.toString();
        function K(T, z) {
          if (_.host !== void 0 && !_.path) return "/" + z;
          var A = T.lastIndexOf("/");
          if (A === -1) return z;
          else return T.substring(0, A + 1) + z;
        }
        function O(T) {
          if (!T) return T;
          var z = "";
          while (T.length > 0) {
            if (T === "." || T === "..") {
              T = "";
              break;
            }
            var A = T.substring(0, 2),
              f = T.substring(0, 3),
              w = T.substring(0, 4);
            if (f === "../") T = T.substring(3);
            else if (A === "./") T = T.substring(2);
            else if (f === "/./") T = "/" + T.substring(3);
            else if (A === "/." && T.length === 2) T = "/";
            else if (w === "/../" || (f === "/.." && T.length === 3))
              (T = "/" + T.substring(4)), (z = z.replace(/\/?[^\/]*$/, ""));
            else {
              var Y = T.match(/(\/?([^\/]*))/)[0];
              (z += Y), (T = T.substring(Y.length));
            }
          }
          return z;
        }
      },
    };
  });

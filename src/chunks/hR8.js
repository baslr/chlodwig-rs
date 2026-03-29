  var hR8 = d((jtK, a$6) => {
    var euH = require("url"),
      tuH = euH.URL,
      aY$ = require("http"),
      sY$ = require("https"),
      U$6 = require("stream").Writable,
      Q$6 = require("assert"),
      LR8 = ZR8();
    (function () {
      var _ = typeof process < "u",
        q = typeof window < "u" && typeof document < "u",
        $ = P1H(Error.captureStackTrace);
      if (!_ && (q || !$)) console.warn("The follow-redirects package should be excluded from browser builds.");
    })();
    var l$6 = !1;
    try {
      Q$6(new tuH(""));
    } catch (H) {
      l$6 = H.code === "ERR_INVALID_URL";
    }
    var tY$ = ["auth", "host", "hostname", "href", "path", "pathname", "port", "protocol", "query", "search", "hash"],
      i$6 = ["abort", "aborted", "connect", "error", "socket", "timeout"],
      n$6 = Object.create(null);
    i$6.forEach(function (H) {
      n$6[H] = function (_, q, $) {
        this._redirectable.emit(H, _, q, $);
      };
    });
    var d$6 = HxH("ERR_INVALID_URL", "Invalid URL", TypeError),
      c$6 = HxH("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed"),
      eY$ = HxH("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", c$6),
      HD$ = HxH("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit"),
      _D$ = HxH("ERR_STREAM_WRITE_AFTER_END", "write after end"),
      qD$ = U$6.prototype.destroy || vR8;
    function aL(H, _) {
      if (
        (U$6.call(this),
        this._sanitizeOptions(H),
        (this._options = H),
        (this._ended = !1),
        (this._ending = !1),
        (this._redirectCount = 0),
        (this._redirects = []),
        (this._requestBodyLength = 0),
        (this._requestBodyBuffers = []),
        _)
      )
        this.on("response", _);
      var q = this;
      (this._onNativeResponse = function ($) {
        try {
          q._processResponse($);
        } catch (K) {
          q.emit("error", K instanceof c$6 ? K : new c$6({ cause: K }));
        }
      }),
        this._performRequest();
    }
    aL.prototype = Object.create(U$6.prototype);
    aL.prototype.abort = function () {
      o$6(this._currentRequest), this._currentRequest.abort(), this.emit("abort");
    };
    aL.prototype.destroy = function (H) {
      return o$6(this._currentRequest, H), qD$.call(this, H), this;
    };
    aL.prototype.write = function (H, _, q) {
      if (this._ending) throw new _D$();
      if (!J1H(H) && !OD$(H)) throw TypeError("data should be a string, Buffer or Uint8Array");
      if (P1H(_)) (q = _), (_ = null);
      if (H.length === 0) {
        if (q) q();
        return;
      }
      if (this._requestBodyLength + H.length <= this._options.maxBodyLength)
        (this._requestBodyLength += H.length),
          this._requestBodyBuffers.push({ data: H, encoding: _ }),
          this._currentRequest.write(H, _, q);
      else this.emit("error", new HD$()), this.abort();
    };
    aL.prototype.end = function (H, _, q) {
      if (P1H(H)) (q = H), (H = _ = null);
      else if (P1H(_)) (q = _), (_ = null);
      if (!H) (this._ended = this._ending = !0), this._currentRequest.end(null, null, q);
      else {
        var $ = this,
          K = this._currentRequest;
        this.write(H, _, function () {
          ($._ended = !0), K.end(null, null, q);
        }),
          (this._ending = !0);
      }
    };
    aL.prototype.setHeader = function (H, _) {
      (this._options.headers[H] = _), this._currentRequest.setHeader(H, _);
    };
    aL.prototype.removeHeader = function (H) {
      delete this._options.headers[H], this._currentRequest.removeHeader(H);
    };
    aL.prototype.setTimeout = function (H, _) {
      var q = this;
      function $(T) {
        T.setTimeout(H), T.removeListener("timeout", T.destroy), T.addListener("timeout", T.destroy);
      }
      function K(T) {
        if (q._timeout) clearTimeout(q._timeout);
        (q._timeout = setTimeout(function () {
          q.emit("timeout"), O();
        }, H)),
          $(T);
      }
      function O() {
        if (q._timeout) clearTimeout(q._timeout), (q._timeout = null);
        if (
          (q.removeListener("abort", O),
          q.removeListener("error", O),
          q.removeListener("response", O),
          q.removeListener("close", O),
          _)
        )
          q.removeListener("timeout", _);
        if (!q.socket) q._currentRequest.removeListener("socket", K);
      }
      if (_) this.on("timeout", _);
      if (this.socket) K(this.socket);
      else this._currentRequest.once("socket", K);
      return (
        this.on("socket", $),
        this.on("abort", O),
        this.on("error", O),
        this.on("response", O),
        this.on("close", O),
        this
      );
    };
    ["flushHeaders", "getHeader", "setNoDelay", "setSocketKeepAlive"].forEach(function (H) {
      aL.prototype[H] = function (_, q) {
        return this._currentRequest[H](_, q);
      };
    });
    ["aborted", "connection", "socket"].forEach(function (H) {
      Object.defineProperty(aL.prototype, H, {
        get: function () {
          return this._currentRequest[H];
        },
      });
    });
    aL.prototype._sanitizeOptions = function (H) {
      if (!H.headers) H.headers = {};
      if (H.host) {
        if (!H.hostname) H.hostname = H.host;
        delete H.host;
      }
      if (!H.pathname && H.path) {
        var _ = H.path.indexOf("?");
        if (_ < 0) H.pathname = H.path;
        else (H.pathname = H.path.substring(0, _)), (H.search = H.path.substring(_));
      }
    };
    aL.prototype._performRequest = function () {
      var H = this._options.protocol,
        _ = this._options.nativeProtocols[H];
      if (!_) throw TypeError("Unsupported protocol " + H);
      if (this._options.agents) {
        var q = H.slice(0, -1);
        this._options.agent = this._options.agents[q];
      }
      var $ = (this._currentRequest = _.request(this._options, this._onNativeResponse));
      $._redirectable = this;
      for (var K of i$6) $.on(K, n$6[K]);
      if (
        ((this._currentUrl = /^\//.test(this._options.path) ? euH.format(this._options) : this._options.path),
        this._isRedirect)
      ) {
        var O = 0,
          T = this,
          z = this._requestBodyBuffers;
        (function A(f) {
          if ($ === T._currentRequest) {
            if (f) T.emit("error", f);
            else if (O < z.length) {
              var w = z[O++];
              if (!$.finished) $.write(w.data, w.encoding, A);
            } else if (T._ended) $.end();
          }
        })();
      }
    };
    aL.prototype._processResponse = function (H) {
      var _ = H.statusCode;
      if (this._options.trackRedirects)
        this._redirects.push({ url: this._currentUrl, headers: H.headers, statusCode: _ });
      var q = H.headers.location;
      if (!q || this._options.followRedirects === !1 || _ < 300 || _ >= 400) {
        (H.responseUrl = this._currentUrl),
          (H.redirects = this._redirects),
          this.emit("response", H),
          (this._requestBodyBuffers = []);
        return;
      }
      if ((o$6(this._currentRequest), H.destroy(), ++this._redirectCount > this._options.maxRedirects)) throw new eY$();
      var $,
        K = this._options.beforeRedirect;
      if (K) $ = Object.assign({ Host: H.req.getHeader("host") }, this._options.headers);
      var O = this._options.method;
      if (
        ((_ === 301 || _ === 302) && this._options.method === "POST") ||
        (_ === 303 && !/^(?:GET|HEAD)$/.test(this._options.method))
      )
        (this._options.method = "GET"), (this._requestBodyBuffers = []), g$6(/^content-/i, this._options.headers);
      var T = g$6(/^host$/i, this._options.headers),
        z = r$6(this._currentUrl),
        A = T || z.host,
        f = /^\w+:/.test(q) ? this._currentUrl : euH.format(Object.assign(z, { host: A })),
        w = $D$(q, f);
      if (
        (LR8("redirecting to", w.href),
        (this._isRedirect = !0),
        F$6(w, this._options),
        (w.protocol !== z.protocol && w.protocol !== "https:") || (w.host !== A && !KD$(w.host, A)))
      )
        g$6(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
      if (P1H(K)) {
        var Y = { headers: H.headers, statusCode: _ },
          D = { url: f, method: O, headers: $ };
        K(this._options, Y, D), this._sanitizeOptions(this._options);
      }
      this._performRequest();
    };
    function kR8(H) {
      var _ = { maxRedirects: 21, maxBodyLength: 10485760 },
        q = {};
      return (
        Object.keys(H).forEach(function ($) {
          var K = $ + ":",
            O = (q[K] = H[$]),
            T = (_[$] = Object.create(O));
          function z(f, w, Y) {
            if (TD$(f)) f = F$6(f);
            else if (J1H(f)) f = F$6(r$6(f));
            else (Y = w), (w = NR8(f)), (f = { protocol: K });
            if (P1H(w)) (Y = w), (w = null);
            if (
              ((w = Object.assign({ maxRedirects: _.maxRedirects, maxBodyLength: _.maxBodyLength }, f, w)),
              (w.nativeProtocols = q),
              !J1H(w.host) && !J1H(w.hostname))
            )
              w.hostname = "::1";
            return Q$6.equal(w.protocol, K, "protocol mismatch"), LR8("options", w), new aL(w, Y);
          }
          function A(f, w, Y) {
            var D = T.request(f, w, Y);
            return D.end(), D;
          }
          Object.defineProperties(T, {
            request: { value: z, configurable: !0, enumerable: !0, writable: !0 },
            get: { value: A, configurable: !0, enumerable: !0, writable: !0 },
          });
        }),
        _
      );
    }
    function vR8() {}
    function r$6(H) {
      var _;
      if (l$6) _ = new tuH(H);
      else if (((_ = NR8(euH.parse(H))), !J1H(_.protocol))) throw new d$6({ input: H });
      return _;
    }
    function $D$(H, _) {
      return l$6 ? new tuH(H, _) : r$6(euH.resolve(_, H));
    }
    function NR8(H) {
      if (/^\[/.test(H.hostname) && !/^\[[:0-9a-f]+\]$/i.test(H.hostname)) throw new d$6({ input: H.href || H });
      if (/^\[/.test(H.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(H.host)) throw new d$6({ input: H.href || H });
      return H;
    }
    function F$6(H, _) {
      var q = _ || {};
      for (var $ of tY$) q[$] = H[$];
      if (q.hostname.startsWith("[")) q.hostname = q.hostname.slice(1, -1);
      if (q.port !== "") q.port = Number(q.port);
      return (q.path = q.search ? q.pathname + q.search : q.pathname), q;
    }
    function g$6(H, _) {
      var q;
      for (var $ in _) if (H.test($)) (q = _[$]), delete _[$];
      return q === null || typeof q > "u" ? void 0 : String(q).trim();
    }
    function HxH(H, _, q) {
      function $(K) {
        if (P1H(Error.captureStackTrace)) Error.captureStackTrace(this, this.constructor);
        Object.assign(this, K || {}), (this.code = H), (this.message = this.cause ? _ + ": " + this.cause.message : _);
      }
      return (
        ($.prototype = Object.create((q || Error).prototype)),
        Object.defineProperties($.prototype, {
          constructor: { value: $, enumerable: !1 },
          name: { value: "Error [" + H + "]", enumerable: !1 },
        }),
        $
      );
    }
    function o$6(H, _) {
      for (var q of i$6) H.removeListener(q, n$6[q]);
      H.on("error", vR8), H.destroy(_);
    }
    function KD$(H, _) {
      Q$6(J1H(H) && J1H(_));
      var q = H.length - _.length - 1;
      return q > 0 && H[q] === "." && H.endsWith(_);
    }
    function J1H(H) {
      return typeof H === "string" || H instanceof String;
    }
    function P1H(H) {
      return typeof H === "function";
    }
    function OD$(H) {
      return typeof H === "object" && "length" in H;
    }
    function TD$(H) {
      return tuH && H instanceof tuH;
    }
    a$6.exports = kR8({ http: aY$, https: sY$ });
    a$6.exports.wrap = kR8;
  });

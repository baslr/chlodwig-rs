  var BG8 = d((TsK, pG8) => {
    var R$6 = nW8(),
      aw$ = require("util"),
      X$6 = require("path"),
      sw$ = require("http"),
      tw$ = require("https"),
      ew$ = require("url").parse,
      HY$ = require("fs"),
      _Y$ = require("stream").Stream,
      qY$ = require("crypto"),
      W$6 = oW8(),
      $Y$ = D08(),
      KY$ = uG8(),
      yt = w5_(),
      G$6 = mG8();
    function D3(H) {
      if (!(this instanceof D3)) return new D3(H);
      (this._overheadLength = 0), (this._valueLength = 0), (this._valuesToMeasure = []), R$6.call(this), (H = H || {});
      for (var _ in H) this[_] = H[_];
    }
    aw$.inherits(D3, R$6);
    D3.LINE_BREAK = `\r
`;
    D3.DEFAULT_CONTENT_TYPE = "application/octet-stream";
    D3.prototype.append = function (H, _, q) {
      if (((q = q || {}), typeof q === "string")) q = { filename: q };
      var $ = R$6.prototype.append.bind(this);
      if (typeof _ === "number" || _ == null) _ = String(_);
      if (Array.isArray(_)) {
        this._error(Error("Arrays are not supported."));
        return;
      }
      var K = this._multiPartHeader(H, _, q),
        O = this._multiPartFooter();
      $(K), $(_), $(O), this._trackLength(K, _, q);
    };
    D3.prototype._trackLength = function (H, _, q) {
      var $ = 0;
      if (q.knownLength != null) $ += Number(q.knownLength);
      else if (Buffer.isBuffer(_)) $ = _.length;
      else if (typeof _ === "string") $ = Buffer.byteLength(_);
      if (
        ((this._valueLength += $),
        (this._overheadLength += Buffer.byteLength(H) + D3.LINE_BREAK.length),
        !_ || (!_.path && !(_.readable && yt(_, "httpVersion")) && !(_ instanceof _Y$)))
      )
        return;
      if (!q.knownLength) this._valuesToMeasure.push(_);
    };
    D3.prototype._lengthRetriever = function (H, _) {
      if (yt(H, "fd"))
        if (H.end != null && H.end != 1 / 0 && H.start != null) _(null, H.end + 1 - (H.start ? H.start : 0));
        else
          HY$.stat(H.path, function (q, $) {
            if (q) {
              _(q);
              return;
            }
            var K = $.size - (H.start ? H.start : 0);
            _(null, K);
          });
      else if (yt(H, "httpVersion")) _(null, Number(H.headers["content-length"]));
      else if (yt(H, "httpModule"))
        H.on("response", function (q) {
          H.pause(), _(null, Number(q.headers["content-length"]));
        }),
          H.resume();
      else _("Unknown stream");
    };
    D3.prototype._multiPartHeader = function (H, _, q) {
      if (typeof q.header === "string") return q.header;
      var $ = this._getContentDisposition(_, q),
        K = this._getContentType(_, q),
        O = "",
        T = {
          "Content-Disposition": ["form-data", 'name="' + H + '"'].concat($ || []),
          "Content-Type": [].concat(K || []),
        };
      if (typeof q.header === "object") G$6(T, q.header);
      var z;
      for (var A in T)
        if (yt(T, A)) {
          if (((z = T[A]), z == null)) continue;
          if (!Array.isArray(z)) z = [z];
          if (z.length) O += A + ": " + z.join("; ") + D3.LINE_BREAK;
        }
      return "--" + this.getBoundary() + D3.LINE_BREAK + O + D3.LINE_BREAK;
    };
    D3.prototype._getContentDisposition = function (H, _) {
      var q;
      if (typeof _.filepath === "string") q = X$6.normalize(_.filepath).replace(/\\/g, "/");
      else if (_.filename || (H && (H.name || H.path))) q = X$6.basename(_.filename || (H && (H.name || H.path)));
      else if (H && H.readable && yt(H, "httpVersion")) q = X$6.basename(H.client._httpMessage.path || "");
      if (q) return 'filename="' + q + '"';
    };
    D3.prototype._getContentType = function (H, _) {
      var q = _.contentType;
      if (!q && H && H.name) q = W$6.lookup(H.name);
      if (!q && H && H.path) q = W$6.lookup(H.path);
      if (!q && H && H.readable && yt(H, "httpVersion")) q = H.headers["content-type"];
      if (!q && (_.filepath || _.filename)) q = W$6.lookup(_.filepath || _.filename);
      if (!q && H && typeof H === "object") q = D3.DEFAULT_CONTENT_TYPE;
      return q;
    };
    D3.prototype._multiPartFooter = function () {
      return function (H) {
        var _ = D3.LINE_BREAK,
          q = this._streams.length === 0;
        if (q) _ += this._lastBoundary();
        H(_);
      }.bind(this);
    };
    D3.prototype._lastBoundary = function () {
      return "--" + this.getBoundary() + "--" + D3.LINE_BREAK;
    };
    D3.prototype.getHeaders = function (H) {
      var _,
        q = { "content-type": "multipart/form-data; boundary=" + this.getBoundary() };
      for (_ in H) if (yt(H, _)) q[_.toLowerCase()] = H[_];
      return q;
    };
    D3.prototype.setBoundary = function (H) {
      if (typeof H !== "string") throw TypeError("FormData boundary must be a string");
      this._boundary = H;
    };
    D3.prototype.getBoundary = function () {
      if (!this._boundary) this._generateBoundary();
      return this._boundary;
    };
    D3.prototype.getBuffer = function () {
      var H = new Buffer.alloc(0),
        _ = this.getBoundary();
      for (var q = 0, $ = this._streams.length; q < $; q++)
        if (typeof this._streams[q] !== "function") {
          if (Buffer.isBuffer(this._streams[q])) H = Buffer.concat([H, this._streams[q]]);
          else H = Buffer.concat([H, Buffer.from(this._streams[q])]);
          if (typeof this._streams[q] !== "string" || this._streams[q].substring(2, _.length + 2) !== _)
            H = Buffer.concat([H, Buffer.from(D3.LINE_BREAK)]);
        }
      return Buffer.concat([H, Buffer.from(this._lastBoundary())]);
    };
    D3.prototype._generateBoundary = function () {
      this._boundary = "--------------------------" + qY$.randomBytes(12).toString("hex");
    };
    D3.prototype.getLengthSync = function () {
      var H = this._overheadLength + this._valueLength;
      if (this._streams.length) H += this._lastBoundary().length;
      if (!this.hasKnownLength()) this._error(Error("Cannot calculate proper length in synchronous way."));
      return H;
    };
    D3.prototype.hasKnownLength = function () {
      var H = !0;
      if (this._valuesToMeasure.length) H = !1;
      return H;
    };
    D3.prototype.getLength = function (H) {
      var _ = this._overheadLength + this._valueLength;
      if (this._streams.length) _ += this._lastBoundary().length;
      if (!this._valuesToMeasure.length) {
        process.nextTick(H.bind(this, null, _));
        return;
      }
      $Y$.parallel(this._valuesToMeasure, this._lengthRetriever, function (q, $) {
        if (q) {
          H(q);
          return;
        }
        $.forEach(function (K) {
          _ += K;
        }),
          H(null, _);
      });
    };
    D3.prototype.submit = function (H, _) {
      var q,
        $,
        K = { method: "post" };
      if (typeof H === "string")
        (H = ew$(H)), ($ = G$6({ port: H.port, path: H.pathname, host: H.hostname, protocol: H.protocol }, K));
      else if ((($ = G$6(H, K)), !$.port)) $.port = $.protocol === "https:" ? 443 : 80;
      if ((($.headers = this.getHeaders(H.headers)), $.protocol === "https:")) q = tw$.request($);
      else q = sw$.request($);
      return (
        this.getLength(
          function (O, T) {
            if (O && O !== "Unknown stream") {
              this._error(O);
              return;
            }
            if (T) q.setHeader("Content-Length", T);
            if ((this.pipe(q), _)) {
              var z,
                A = function (f, w) {
                  return q.removeListener("error", A), q.removeListener("response", z), _.call(this, f, w);
                };
              (z = A.bind(this, null)), q.on("error", A), q.on("response", z);
            }
          }.bind(this),
        ),
        q
      );
    };
    D3.prototype._error = function (H) {
      if (!this.error) (this.error = H), this.pause(), this.emit("error", H);
    };
    D3.prototype.toString = function () {
      return "[object FormData]";
    };
    KY$(D3.prototype, "FormData");
    pG8.exports = D3;
  });

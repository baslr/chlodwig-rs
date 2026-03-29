    uA();
    Xh();
    luH();
    QuH();
    $R8();
    WI();
    E$6();
    C$6 = {
      transitional: St,
      adapter: ["xhr", "http", "fetch"],
      transformRequest: [
        function (_, q) {
          let $ = q.getContentType() || "",
            K = $.indexOf("application/json") > -1,
            O = Q_.isObject(_);
          if (O && Q_.isHTMLForm(_)) _ = new FormData(_);
          if (Q_.isFormData(_)) return K ? JSON.stringify(P5_(_)) : _;
          if (
            Q_.isArrayBuffer(_) ||
            Q_.isBuffer(_) ||
            Q_.isStream(_) ||
            Q_.isFile(_) ||
            Q_.isBlob(_) ||
            Q_.isReadableStream(_)
          )
            return _;
          if (Q_.isArrayBufferView(_)) return _.buffer;
          if (Q_.isURLSearchParams(_))
            return q.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), _.toString();
          let z;
          if (O) {
            if ($.indexOf("application/x-www-form-urlencoded") > -1) return S$6(_, this.formSerializer).toString();
            if ((z = Q_.isFileList(_)) || $.indexOf("multipart/form-data") > -1) {
              let A = this.env && this.env.FormData;
              return Vt(z ? { "files[]": _ } : _, A && new A(), this.formSerializer);
            }
          }
          if (O || K) return q.setContentType("application/json", !1), PY$(_);
          return _;
        },
      ],
      transformResponse: [
        function (_) {
          let q = this.transitional || C$6.transitional,
            $ = q && q.forcedJSONParsing,
            K = this.responseType === "json";
          if (Q_.isResponse(_) || Q_.isReadableStream(_)) return _;
          if (_ && Q_.isString(_) && (($ && !this.responseType) || K)) {
            let T = !(q && q.silentJSONParsing) && K;
            try {
              return JSON.parse(_, this.parseReviver);
            } catch (z) {
              if (T) {
                if (z.name === "SyntaxError") throw eq.from(z, eq.ERR_BAD_RESPONSE, this, null, this.response);
                throw z;
              }
            }
          }
          return _;
        },
      ],
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      env: { FormData: wO.classes.FormData, Blob: wO.classes.Blob },
      validateStatus: function (_) {
        return _ >= 200 && _ < 300;
      },
      headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } },
    };
    Q_.forEach(["delete", "get", "head", "post", "put", "patch"], (H) => {
      C$6.headers[H] = {};
    });
    DMH = C$6;

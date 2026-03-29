  var mmq = d((WN3, nW_) => {
    var {
        normalizeIPv6: lP4,
        normalizeIPv4: iP4,
        removeDotSegments: jFH,
        recomposeAuthority: nP4,
        normalizeComponentEncoding: iW_,
      } = Vmq(),
      CZ6 = umq();
    function rP4(H, _) {
      if (typeof H === "string") H = Pg(Ri(H, _), _);
      else if (typeof H === "object") H = Ri(Pg(H, _), _);
      return H;
    }
    function oP4(H, _, q) {
      let $ = Object.assign({ scheme: "null" }, q),
        K = xmq(Ri(H, $), Ri(_, $), $, !0);
      return Pg(K, { ...$, skipEscape: !0 });
    }
    function xmq(H, _, q, $) {
      let K = {};
      if (!$) (H = Ri(Pg(H, q), q)), (_ = Ri(Pg(_, q), q));
      if (((q = q || {}), !q.tolerant && _.scheme))
        (K.scheme = _.scheme),
          (K.userinfo = _.userinfo),
          (K.host = _.host),
          (K.port = _.port),
          (K.path = jFH(_.path || "")),
          (K.query = _.query);
      else {
        if (_.userinfo !== void 0 || _.host !== void 0 || _.port !== void 0)
          (K.userinfo = _.userinfo),
            (K.host = _.host),
            (K.port = _.port),
            (K.path = jFH(_.path || "")),
            (K.query = _.query);
        else {
          if (!_.path)
            if (((K.path = H.path), _.query !== void 0)) K.query = _.query;
            else K.query = H.query;
          else {
            if (_.path.charAt(0) === "/") K.path = jFH(_.path);
            else {
              if ((H.userinfo !== void 0 || H.host !== void 0 || H.port !== void 0) && !H.path) K.path = "/" + _.path;
              else if (!H.path) K.path = _.path;
              else K.path = H.path.slice(0, H.path.lastIndexOf("/") + 1) + _.path;
              K.path = jFH(K.path);
            }
            K.query = _.query;
          }
          (K.userinfo = H.userinfo), (K.host = H.host), (K.port = H.port);
        }
        K.scheme = H.scheme;
      }
      return (K.fragment = _.fragment), K;
    }
    function aP4(H, _, q) {
      if (typeof H === "string") (H = unescape(H)), (H = Pg(iW_(Ri(H, q), !0), { ...q, skipEscape: !0 }));
      else if (typeof H === "object") H = Pg(iW_(H, !0), { ...q, skipEscape: !0 });
      if (typeof _ === "string") (_ = unescape(_)), (_ = Pg(iW_(Ri(_, q), !0), { ...q, skipEscape: !0 }));
      else if (typeof _ === "object") _ = Pg(iW_(_, !0), { ...q, skipEscape: !0 });
      return H.toLowerCase() === _.toLowerCase();
    }
    function Pg(H, _) {
      let q = {
          host: H.host,
          scheme: H.scheme,
          userinfo: H.userinfo,
          port: H.port,
          path: H.path,
          query: H.query,
          nid: H.nid,
          nss: H.nss,
          uuid: H.uuid,
          fragment: H.fragment,
          reference: H.reference,
          resourceName: H.resourceName,
          secure: H.secure,
          error: "",
        },
        $ = Object.assign({}, _),
        K = [],
        O = CZ6[($.scheme || q.scheme || "").toLowerCase()];
      if (O && O.serialize) O.serialize(q, $);
      if (q.path !== void 0)
        if (!$.skipEscape) {
          if (((q.path = escape(q.path)), q.scheme !== void 0)) q.path = q.path.split("%3A").join(":");
        } else q.path = unescape(q.path);
      if ($.reference !== "suffix" && q.scheme) K.push(q.scheme, ":");
      let T = nP4(q);
      if (T !== void 0) {
        if ($.reference !== "suffix") K.push("//");
        if ((K.push(T), q.path && q.path.charAt(0) !== "/")) K.push("/");
      }
      if (q.path !== void 0) {
        let z = q.path;
        if (!$.absolutePath && (!O || !O.absolutePath)) z = jFH(z);
        if (T === void 0) z = z.replace(/^\/\//u, "/%2F");
        K.push(z);
      }
      if (q.query !== void 0) K.push("?", q.query);
      if (q.fragment !== void 0) K.push("#", q.fragment);
      return K.join("");
    }
    var sP4 = Array.from({ length: 127 }, (H, _) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(_)));
    function tP4(H) {
      let _ = 0;
      for (let q = 0, $ = H.length; q < $; ++q) if (((_ = H.charCodeAt(q)), _ > 126 || sP4[_])) return !0;
      return !1;
    }
    var eP4 =
      /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    function Ri(H, _) {
      let q = Object.assign({}, _),
        $ = { scheme: void 0, userinfo: void 0, host: "", port: void 0, path: "", query: void 0, fragment: void 0 },
        K = H.indexOf("%") !== -1,
        O = !1;
      if (q.reference === "suffix") H = (q.scheme ? q.scheme + ":" : "") + "//" + H;
      let T = H.match(eP4);
      if (T) {
        if (
          (($.scheme = T[1]),
          ($.userinfo = T[3]),
          ($.host = T[4]),
          ($.port = parseInt(T[5], 10)),
          ($.path = T[6] || ""),
          ($.query = T[7]),
          ($.fragment = T[8]),
          isNaN($.port))
        )
          $.port = T[5];
        if ($.host) {
          let A = iP4($.host);
          if (A.isIPV4 === !1) {
            let f = lP4(A.host);
            ($.host = f.host.toLowerCase()), (O = f.isIPV6);
          } else ($.host = A.host), (O = !0);
        }
        if (
          $.scheme === void 0 &&
          $.userinfo === void 0 &&
          $.host === void 0 &&
          $.port === void 0 &&
          $.query === void 0 &&
          !$.path
        )
          $.reference = "same-document";
        else if ($.scheme === void 0) $.reference = "relative";
        else if ($.fragment === void 0) $.reference = "absolute";
        else $.reference = "uri";
        if (q.reference && q.reference !== "suffix" && q.reference !== $.reference)
          $.error = $.error || "URI is not a " + q.reference + " reference.";
        let z = CZ6[(q.scheme || $.scheme || "").toLowerCase()];
        if (!q.unicodeSupport && (!z || !z.unicodeSupport)) {
          if ($.host && (q.domainHost || (z && z.domainHost)) && O === !1 && tP4($.host))
            try {
              $.host = URL.domainToASCII($.host.toLowerCase());
            } catch (A) {
              $.error = $.error || "Host's domain name can not be converted to ASCII: " + A;
            }
        }
        if (!z || (z && !z.skipNormalize)) {
          if (K && $.scheme !== void 0) $.scheme = unescape($.scheme);
          if (K && $.host !== void 0) $.host = unescape($.host);
          if ($.path) $.path = escape(unescape($.path));
          if ($.fragment) $.fragment = encodeURI(decodeURIComponent($.fragment));
        }
        if (z && z.parse) z.parse($, q);
      } else $.error = $.error || "URI can not be parsed.";
      return $;
    }
    var bZ6 = {
      SCHEMES: CZ6,
      normalize: rP4,
      resolve: oP4,
      resolveComponents: xmq,
      equal: aP4,
      serialize: Pg,
      parse: Ri,
    };
    nW_.exports = bZ6;
    nW_.exports.default = bZ6;
    nW_.exports.fastUri = bZ6;
  });

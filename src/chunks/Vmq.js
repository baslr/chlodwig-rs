  var Vmq = d((PN3, ymq) => {
    var { HEX: NP4 } = Rmq(),
      hP4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
    function vmq(H) {
      if (hmq(H, ".") < 3) return { host: H, isIPV4: !1 };
      let _ = H.match(hP4) || [],
        [q] = _;
      if (q) return { host: VP4(q, "."), isIPV4: !0 };
      else return { host: H, isIPV4: !1 };
    }
    function SZ6(H, _ = !1) {
      let q = "",
        $ = !0;
      for (let K of H) {
        if (NP4[K] === void 0) return;
        if (K !== "0" && $ === !0) $ = !1;
        if (!$) q += K;
      }
      if (_ && q.length === 0) q = "0";
      return q;
    }
    function yP4(H) {
      let _ = 0,
        q = { error: !1, address: "", zone: "" },
        $ = [],
        K = [],
        O = !1,
        T = !1,
        z = !1;
      function A() {
        if (K.length) {
          if (O === !1) {
            let f = SZ6(K);
            if (f !== void 0) $.push(f);
            else return (q.error = !0), !1;
          }
          K.length = 0;
        }
        return !0;
      }
      for (let f = 0; f < H.length; f++) {
        let w = H[f];
        if (w === "[" || w === "]") continue;
        if (w === ":") {
          if (T === !0) z = !0;
          if (!A()) break;
          if ((_++, $.push(":"), _ > 7)) {
            q.error = !0;
            break;
          }
          if (f - 1 >= 0 && H[f - 1] === ":") T = !0;
          continue;
        } else if (w === "%") {
          if (!A()) break;
          O = !0;
        } else {
          K.push(w);
          continue;
        }
      }
      if (K.length)
        if (O) q.zone = K.join("");
        else if (z) $.push(K.join(""));
        else $.push(SZ6(K));
      return (q.address = $.join("")), q;
    }
    function Nmq(H) {
      if (hmq(H, ":") < 2) return { host: H, isIPV6: !1 };
      let _ = yP4(H);
      if (!_.error) {
        let { address: q, address: $ } = _;
        if (_.zone) (q += "%" + _.zone), ($ += "%25" + _.zone);
        return { host: q, escapedHost: $, isIPV6: !0 };
      } else return { host: H, isIPV6: !1 };
    }
    function VP4(H, _) {
      let q = "",
        $ = !0,
        K = H.length;
      for (let O = 0; O < K; O++) {
        let T = H[O];
        if (T === "0" && $) {
          if ((O + 1 <= K && H[O + 1] === _) || O + 1 === K) (q += T), ($ = !1);
        } else {
          if (T === _) $ = !0;
          else $ = !1;
          q += T;
        }
      }
      return q;
    }
    function hmq(H, _) {
      let q = 0;
      for (let $ = 0; $ < H.length; $++) if (H[$] === _) q++;
      return q;
    }
    var Zmq = /^\.\.?\//u,
      Lmq = /^\/\.(?:\/|$)/u,
      kmq = /^\/\.\.(?:\/|$)/u,
      SP4 = /^\/?(?:.|\n)*?(?=\/|$)/u;
    function EP4(H) {
      let _ = [];
      while (H.length)
        if (H.match(Zmq)) H = H.replace(Zmq, "");
        else if (H.match(Lmq)) H = H.replace(Lmq, "/");
        else if (H.match(kmq)) (H = H.replace(kmq, "/")), _.pop();
        else if (H === "." || H === "..") H = "";
        else {
          let q = H.match(SP4);
          if (q) {
            let $ = q[0];
            (H = H.slice($.length)), _.push($);
          } else throw Error("Unexpected dot segment condition");
        }
      return _.join("");
    }
    function CP4(H, _) {
      let q = _ !== !0 ? escape : unescape;
      if (H.scheme !== void 0) H.scheme = q(H.scheme);
      if (H.userinfo !== void 0) H.userinfo = q(H.userinfo);
      if (H.host !== void 0) H.host = q(H.host);
      if (H.path !== void 0) H.path = q(H.path);
      if (H.query !== void 0) H.query = q(H.query);
      if (H.fragment !== void 0) H.fragment = q(H.fragment);
      return H;
    }
    function bP4(H) {
      let _ = [];
      if (H.userinfo !== void 0) _.push(H.userinfo), _.push("@");
      if (H.host !== void 0) {
        let q = unescape(H.host),
          $ = vmq(q);
        if ($.isIPV4) q = $.host;
        else {
          let K = Nmq($.host);
          if (K.isIPV6 === !0) q = `[${K.escapedHost}]`;
          else q = H.host;
        }
        _.push(q);
      }
      if (typeof H.port === "number" || typeof H.port === "string") _.push(":"), _.push(String(H.port));
      return _.length ? _.join("") : void 0;
    }
    ymq.exports = {
      recomposeAuthority: bP4,
      normalizeComponentEncoding: CP4,
      removeDotSegments: EP4,
      normalizeIPv4: vmq,
      normalizeIPv6: Nmq,
      stringArrayToHexStripped: SZ6,
    };
  });

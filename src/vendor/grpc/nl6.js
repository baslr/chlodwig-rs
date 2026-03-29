  var nl6 = d((EsH) => {
    Object.defineProperty(EsH, "__esModule", { value: !0 });
    EsH.parseCIDR = AF7;
    EsH.mapProxyName = ly1;
    EsH.getProxiedConnection = iy1;
    var VsH = DA(),
      ENH = mK(),
      zF7 = require("net"),
      my1 = require("http"),
      py1 = DA(),
      TF7 = Uv(),
      SsH = OL(),
      By1 = require("url"),
      gy1 = il6(),
      dy1 = "proxy";
    function CNH(H) {
      py1.trace(ENH.LogVerbosity.DEBUG, dy1, H);
    }
    function cy1() {
      let H = "",
        _ = "";
      if (process.env.grpc_proxy) (_ = "grpc_proxy"), (H = process.env.grpc_proxy);
      else if (process.env.https_proxy) (_ = "https_proxy"), (H = process.env.https_proxy);
      else if (process.env.http_proxy) (_ = "http_proxy"), (H = process.env.http_proxy);
      else return {};
      let q;
      try {
        q = new By1.URL(H);
      } catch (z) {
        return (0, VsH.log)(ENH.LogVerbosity.ERROR, `cannot parse value of "${_}" env var`), {};
      }
      if (q.protocol !== "http:")
        return (0, VsH.log)(ENH.LogVerbosity.ERROR, `"${q.protocol}" scheme not supported in proxy URI`), {};
      let $ = null;
      if (q.username)
        if (q.password)
          (0, VsH.log)(ENH.LogVerbosity.INFO, "userinfo found in proxy URI"),
            ($ = decodeURIComponent(`${q.username}:${q.password}`));
        else $ = q.username;
      let { hostname: K, port: O } = q;
      if (O === "") O = "80";
      let T = { address: `${K}:${O}` };
      if ($) T.creds = $;
      return CNH("Proxy server " + T.address + " set by environment variable " + _), T;
    }
    function Fy1() {
      let H = process.env.no_grpc_proxy,
        _ = "no_grpc_proxy";
      if (!H) (H = process.env.no_proxy), (_ = "no_proxy");
      if (H) return CNH("No proxy server list set by environment variable " + _), H.split(",");
      else return [];
    }
    function AF7(H) {
      let _ = H.split("/");
      if (_.length !== 2) return null;
      let q = parseInt(_[1], 10);
      if (!(0, zF7.isIPv4)(_[0]) || Number.isNaN(q) || q < 0 || q > 32) return null;
      return { ip: fF7(_[0]), prefixLength: q };
    }
    function fF7(H) {
      return H.split(".").reduce((_, q) => (_ << 8) + parseInt(q, 10), 0);
    }
    function Uy1(H, _) {
      let q = H.ip,
        $ = -1 << (32 - H.prefixLength);
      return (fF7(_) & $) === (q & $);
    }
    function Qy1(H) {
      for (let _ of Fy1()) {
        let q = AF7(_);
        if ((0, zF7.isIPv4)(H) && q && Uy1(q, H)) return !0;
        else if (H.endsWith(_)) return !0;
      }
      return !1;
    }
    function ly1(H, _) {
      var q;
      let $ = { target: H, extraOptions: {} };
      if (((q = _["grpc.enable_http_proxy"]) !== null && q !== void 0 ? q : 1) === 0) return $;
      if (H.scheme === "unix") return $;
      let K = cy1();
      if (!K.address) return $;
      let O = (0, SsH.splitHostPort)(H.path);
      if (!O) return $;
      let T = O.host;
      if (Qy1(T)) return CNH("Not using proxy for target in no_proxy list: " + (0, SsH.uriToString)(H)), $;
      let z = { "grpc.http_connect_target": (0, SsH.uriToString)(H) };
      if (K.creds) z["grpc.http_connect_creds"] = K.creds;
      return { target: { scheme: "dns", path: K.address }, extraOptions: z };
    }
    function iy1(H, _) {
      var q;
      if (!("grpc.http_connect_target" in _)) return Promise.resolve(null);
      let $ = _["grpc.http_connect_target"],
        K = (0, SsH.parseUri)($);
      if (K === null) return Promise.resolve(null);
      let O = (0, SsH.splitHostPort)(K.path);
      if (O === null) return Promise.resolve(null);
      let T = `${O.host}:${(q = O.port) !== null && q !== void 0 ? q : gy1.DEFAULT_PORT}`,
        z = { method: "CONNECT", path: T },
        A = { Host: T };
      if ((0, TF7.isTcpSubchannelAddress)(H)) (z.host = H.host), (z.port = H.port);
      else z.socketPath = H.path;
      if ("grpc.http_connect_creds" in _)
        A["Proxy-Authorization"] = "Basic " + Buffer.from(_["grpc.http_connect_creds"]).toString("base64");
      z.headers = A;
      let f = (0, TF7.subchannelAddressToString)(H);
      return (
        CNH("Using proxy " + f + " to connect to " + z.path),
        new Promise((w, Y) => {
          let D = my1.request(z);
          D.once("connect", (j, M, J) => {
            if ((D.removeAllListeners(), M.removeAllListeners(), j.statusCode === 200)) {
              if ((CNH("Successfully connected to " + z.path + " through proxy " + f), J.length > 0)) M.unshift(J);
              CNH("Successfully established a plaintext connection to " + z.path + " through proxy " + f), w(M);
            } else
              (0, VsH.log)(
                ENH.LogVerbosity.ERROR,
                "Failed to connect to " + z.path + " through proxy " + f + " with status " + j.statusCode,
              ),
                Y();
          }),
            D.once("error", (j) => {
              D.removeAllListeners(),
                (0, VsH.log)(ENH.LogVerbosity.ERROR, "Failed to connect to proxy " + f + " with error " + j.message),
                Y();
            }),
            D.end();
        })
      );
    }
  });

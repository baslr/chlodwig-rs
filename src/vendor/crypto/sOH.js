  var sOH = d((Fl3, a77) => {
    var Nk_ = XK();
    F3();
    var o77 = (a77.exports = Nk_.pem = Nk_.pem || {});
    o77.encode = function (H, _) {
      _ = _ || {};
      var q =
          "-----BEGIN " +
          H.type +
          `-----\r
`,
        $;
      if (H.procType) ($ = { name: "Proc-Type", values: [String(H.procType.version), H.procType.type] }), (q += vk_($));
      if (H.contentDomain) ($ = { name: "Content-Domain", values: [H.contentDomain] }), (q += vk_($));
      if (H.dekInfo) {
        if ((($ = { name: "DEK-Info", values: [H.dekInfo.algorithm] }), H.dekInfo.parameters))
          $.values.push(H.dekInfo.parameters);
        q += vk_($);
      }
      if (H.headers) for (var K = 0; K < H.headers.length; ++K) q += vk_(H.headers[K]);
      if (H.procType)
        q += `\r
`;
      return (
        (q +=
          Nk_.util.encode64(H.body, _.maxline || 64) +
          `\r
`),
        (q +=
          "-----END " +
          H.type +
          `-----\r
`),
        q
      );
    };
    o77.decode = function (H) {
      var _ = [],
        q =
          /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g,
        $ = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/,
        K = /\r?\n/,
        O;
      while (!0) {
        if (((O = q.exec(H)), !O)) break;
        var T = O[1];
        if (T === "NEW CERTIFICATE REQUEST") T = "CERTIFICATE REQUEST";
        var z = {
          type: T,
          procType: null,
          contentDomain: null,
          dekInfo: null,
          headers: [],
          body: Nk_.util.decode64(O[3]),
        };
        if ((_.push(z), !O[2])) continue;
        var A = O[2].split(K),
          f = 0;
        while (O && f < A.length) {
          var w = A[f].replace(/\s+$/, "");
          for (var Y = f + 1; Y < A.length; ++Y) {
            var D = A[Y];
            if (!/\s/.test(D[0])) break;
            (w += D), (f = Y);
          }
          if (((O = w.match($)), O)) {
            var j = { name: O[1], values: [] },
              M = O[2].split(",");
            for (var J = 0; J < M.length; ++J) j.values.push(Ld4(M[J]));
            if (!z.procType) {
              if (j.name !== "Proc-Type")
                throw Error('Invalid PEM formatted message. The first encapsulated header must be "Proc-Type".');
              else if (j.values.length !== 2)
                throw Error('Invalid PEM formatted message. The "Proc-Type" header must have two subfields.');
              z.procType = { version: M[0], type: M[1] };
            } else if (!z.contentDomain && j.name === "Content-Domain") z.contentDomain = M[0] || "";
            else if (!z.dekInfo && j.name === "DEK-Info") {
              if (j.values.length === 0)
                throw Error('Invalid PEM formatted message. The "DEK-Info" header must have at least one subfield.');
              z.dekInfo = { algorithm: M[0], parameters: M[1] || null };
            } else z.headers.push(j);
          }
          ++f;
        }
        if (z.procType === "ENCRYPTED" && !z.dekInfo)
          throw Error(
            'Invalid PEM formatted message. The "DEK-Info" header must be present if "Proc-Type" is "ENCRYPTED".',
          );
      }
      if (_.length === 0) throw Error("Invalid PEM formatted message.");
      return _;
    };
    function vk_(H) {
      var _ = H.name + ": ",
        q = [],
        $ = function (A, f) {
          return " " + f;
        };
      for (var K = 0; K < H.values.length; ++K) q.push(H.values[K].replace(/^(\S+\r\n)/, $));
      _ +=
        q.join(",") +
        `\r
`;
      var O = 0,
        T = -1;
      for (var K = 0; K < _.length; ++K, ++O)
        if (O > 65 && T !== -1) {
          var z = _[T];
          if (z === ",")
            ++T,
              (_ =
                _.substr(0, T) +
                `\r
 ` +
                _.substr(T));
          else
            _ =
              _.substr(0, T) +
              `\r
` +
              z +
              _.substr(T + 1);
          (O = K - T - 1), (T = -1), ++K;
        } else if (_[K] === " " || _[K] === "\t" || _[K] === ",") T = K;
      return _;
    }
    function Ld4(H) {
      return H.replace(/^\s+/, "");
    }
  });

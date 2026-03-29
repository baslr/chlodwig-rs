  var rX6 = d((ZJ_) => {
    Object.defineProperty(ZJ_, "__esModule", { value: !0 });
    ZJ_.AwsRequestSigner = void 0;
    var URq = bXH(),
      FRq = "AWS4-HMAC-SHA256",
      jO4 = "aws4_request";
    class QRq {
      constructor(H, _) {
        (this.getCredentials = H), (this.region = _), (this.crypto = (0, URq.createCrypto)());
      }
      async getRequestOptions(H) {
        if (!H.url) throw Error('"url" is required in "amzOptions"');
        let _ = typeof H.data === "object" ? JSON.stringify(H.data) : H.data,
          q = H.url,
          $ = H.method || "GET",
          K = H.body || _,
          O = H.headers,
          T = await this.getCredentials(),
          z = new URL(q),
          A = await JO4({
            crypto: this.crypto,
            host: z.host,
            canonicalUri: z.pathname,
            canonicalQuerystring: z.search.substr(1),
            method: $,
            region: this.region,
            securityCredentials: T,
            requestPayload: K,
            additionalAmzHeaders: O,
          }),
          f = Object.assign(
            A.amzDate ? { "x-amz-date": A.amzDate } : {},
            { Authorization: A.authorizationHeader, host: z.host },
            O || {},
          );
        if (T.token) Object.assign(f, { "x-amz-security-token": T.token });
        let w = { url: q, method: $, headers: f };
        if (typeof K < "u") w.body = K;
        return w;
      }
    }
    ZJ_.AwsRequestSigner = QRq;
    async function GdH(H, _, q) {
      return await H.signWithHmacSha256(_, q);
    }
    async function MO4(H, _, q, $, K) {
      let O = await GdH(H, `AWS4${_}`, q),
        T = await GdH(H, O, $),
        z = await GdH(H, T, K);
      return await GdH(H, z, "aws4_request");
    }
    async function JO4(H) {
      let _ = H.additionalAmzHeaders || {},
        q = H.requestPayload || "",
        $ = H.host.split(".")[0],
        K = new Date(),
        O = K.toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.[0-9]+/, ""),
        T = K.toISOString().replace(/[-]/g, "").replace(/T.*/, ""),
        z = {};
      if (
        (Object.keys(_).forEach((W) => {
          z[W.toLowerCase()] = _[W];
        }),
        H.securityCredentials.token)
      )
        z["x-amz-security-token"] = H.securityCredentials.token;
      let A = Object.assign({ host: H.host }, z.date ? {} : { "x-amz-date": O }, z),
        f = "",
        w = Object.keys(A).sort();
      w.forEach((W) => {
        f += `${W}:${A[W]}
`;
      });
      let Y = w.join(";"),
        D = await H.crypto.sha256DigestHex(q),
        j = `${H.method}
${H.canonicalUri}
${H.canonicalQuerystring}
${f}
${Y}
${D}`,
        M = `${T}/${H.region}/${$}/${jO4}`,
        J =
          `${FRq}
${O}
${M}
` + (await H.crypto.sha256DigestHex(j)),
        P = await MO4(H.crypto, H.securityCredentials.secretAccessKey, T, H.region, $),
        X = await GdH(H.crypto, P, J),
        R = `${FRq} Credential=${H.securityCredentials.accessKeyId}/${M}, SignedHeaders=${Y}, Signature=${(0, URq.fromArrayBufferToHex)(X)}`;
      return { amzDate: z.date ? void 0 : O, authorizationHeader: R, canonicalQuerystring: H.canonicalQuerystring };
    }
  });

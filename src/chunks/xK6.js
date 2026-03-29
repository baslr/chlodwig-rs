  var xK6 = d((MK) => {
    var it = MS8(),
      x1H = cz(),
      S0$ = PS8(),
      LS8 = jO_(),
      GS8 = E0(),
      PO_ = WS8(),
      kS8 = "X-Amz-Algorithm",
      vS8 = "X-Amz-Credential",
      yK6 = "X-Amz-Date",
      NS8 = "X-Amz-SignedHeaders",
      hS8 = "X-Amz-Expires",
      VK6 = "X-Amz-Signature",
      SK6 = "X-Amz-Security-Token",
      E0$ = "X-Amz-Region-Set",
      EK6 = "authorization",
      CK6 = yK6.toLowerCase(),
      yS8 = "date",
      VS8 = [EK6, CK6, yS8],
      SS8 = VK6.toLowerCase(),
      ZO_ = "x-amz-content-sha256",
      ES8 = SK6.toLowerCase(),
      C0$ = "host",
      CS8 = {
        authorization: !0,
        "cache-control": !0,
        connection: !0,
        expect: !0,
        from: !0,
        "keep-alive": !0,
        "max-forwards": !0,
        pragma: !0,
        referer: !0,
        te: !0,
        trailer: !0,
        "transfer-encoding": !0,
        upgrade: !0,
        "user-agent": !0,
        "x-amzn-trace-id": !0,
      },
      bS8 = /^proxy-/,
      IS8 = /^sec-/,
      b0$ = [/^proxy-/i, /^sec-/i],
      XO_ = "AWS4-HMAC-SHA256",
      I0$ = "AWS4-ECDSA-P256-SHA256",
      uS8 = "AWS4-HMAC-SHA256-PAYLOAD",
      xS8 = "UNSIGNED-PAYLOAD",
      mS8 = 50,
      bK6 = "aws4_request",
      pS8 = 604800,
      iMH = {},
      WO_ = [],
      GO_ = (H, _, q) => `${H}/${_}/${q}/${bK6}`,
      BS8 = async (H, _, q, $, K) => {
        let O = await RS8(H, _.secretAccessKey, _.accessKeyId),
          T = `${q}:${$}:${K}:${it.toHex(O)}:${_.sessionToken}`;
        if (T in iMH) return iMH[T];
        WO_.push(T);
        while (WO_.length > mS8) delete iMH[WO_.shift()];
        let z = `AWS4${_.secretAccessKey}`;
        for (let A of [q, $, K, bK6]) z = await RS8(H, z, A);
        return (iMH[T] = z);
      },
      u0$ = () => {
        (WO_.length = 0),
          Object.keys(iMH).forEach((H) => {
            delete iMH[H];
          });
      },
      RS8 = (H, _, q) => {
        let $ = new H(_);
        return $.update(x1H.toUint8Array(q)), $.digest();
      },
      NK6 = ({ headers: H }, _, q) => {
        let $ = {};
        for (let K of Object.keys(H).sort()) {
          if (H[K] == null) continue;
          let O = K.toLowerCase();
          if (O in CS8 || _?.has(O) || bS8.test(O) || IS8.test(O)) {
            if (!q || (q && !q.has(O))) continue;
          }
          $[O] = H[K].trim().replace(/\s+/g, " ");
        }
        return $;
      },
      RO_ = async ({ headers: H, body: _ }, q) => {
        for (let $ of Object.keys(H)) if ($.toLowerCase() === ZO_) return H[$];
        if (_ == null) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        else if (typeof _ === "string" || ArrayBuffer.isView(_) || S0$.isArrayBuffer(_)) {
          let $ = new q();
          return $.update(x1H.toUint8Array(_)), it.toHex(await $.digest());
        }
        return xS8;
      };
    class gS8 {
      format(H) {
        let _ = [];
        for (let K of Object.keys(H)) {
          let O = x1H.fromUtf8(K);
          _.push(Uint8Array.from([O.byteLength]), O, this.formatHeaderValue(H[K]));
        }
        let q = new Uint8Array(_.reduce((K, O) => K + O.byteLength, 0)),
          $ = 0;
        for (let K of _) q.set(K, $), ($ += K.byteLength);
        return q;
      }
      formatHeaderValue(H) {
        switch (H.type) {
          case "boolean":
            return Uint8Array.from([H.value ? 0 : 1]);
          case "byte":
            return Uint8Array.from([2, H.value]);
          case "short":
            let _ = new DataView(new ArrayBuffer(3));
            return _.setUint8(0, 3), _.setInt16(1, H.value, !1), new Uint8Array(_.buffer);
          case "integer":
            let q = new DataView(new ArrayBuffer(5));
            return q.setUint8(0, 4), q.setInt32(1, H.value, !1), new Uint8Array(q.buffer);
          case "long":
            let $ = new Uint8Array(9);
            return ($[0] = 5), $.set(H.value.bytes, 1), $;
          case "binary":
            let K = new DataView(new ArrayBuffer(3 + H.value.byteLength));
            K.setUint8(0, 6), K.setUint16(1, H.value.byteLength, !1);
            let O = new Uint8Array(K.buffer);
            return O.set(H.value, 3), O;
          case "string":
            let T = x1H.fromUtf8(H.value),
              z = new DataView(new ArrayBuffer(3 + T.byteLength));
            z.setUint8(0, 7), z.setUint16(1, T.byteLength, !1);
            let A = new Uint8Array(z.buffer);
            return A.set(T, 3), A;
          case "timestamp":
            let f = new Uint8Array(9);
            return (f[0] = 8), f.set(IK6.fromNumber(H.value.valueOf()).bytes, 1), f;
          case "uuid":
            if (!x0$.test(H.value)) throw Error(`Invalid UUID received: ${H.value}`);
            let w = new Uint8Array(17);
            return (w[0] = 9), w.set(it.fromHex(H.value.replace(/\-/g, "")), 1), w;
        }
      }
    }
    var x0$ = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    class IK6 {
      bytes;
      constructor(H) {
        if (((this.bytes = H), H.byteLength !== 8)) throw Error("Int64 buffers must be exactly 8 bytes");
      }
      static fromNumber(H) {
        if (H > 9223372036854776000 || H < -9223372036854776000)
          throw Error(`${H} is too large (or, if negative, too small) to represent as an Int64`);
        let _ = new Uint8Array(8);
        for (let q = 7, $ = Math.abs(Math.round(H)); q > -1 && $ > 0; q--, $ /= 256) _[q] = $;
        if (H < 0) ZS8(_);
        return new IK6(_);
      }
      valueOf() {
        let H = this.bytes.slice(0),
          _ = H[0] & 128;
        if (_) ZS8(H);
        return parseInt(it.toHex(H), 16) * (_ ? -1 : 1);
      }
      toString() {
        return String(this.valueOf());
      }
    }
    function ZS8(H) {
      for (let _ = 0; _ < 8; _++) H[_] ^= 255;
      for (let _ = 7; _ > -1; _--) if ((H[_]++, H[_] !== 0)) break;
    }
    var dS8 = (H, _) => {
        H = H.toLowerCase();
        for (let q of Object.keys(_)) if (H === q.toLowerCase()) return !0;
        return !1;
      },
      cS8 = (H, _ = {}) => {
        let { headers: q, query: $ = {} } = LS8.HttpRequest.clone(H);
        for (let K of Object.keys(q)) {
          let O = K.toLowerCase();
          if ((O.slice(0, 6) === "x-amz-" && !_.unhoistableHeaders?.has(O)) || _.hoistableHeaders?.has(O))
            ($[K] = q[K]), delete q[K];
        }
        return { ...H, headers: q, query: $ };
      },
      hK6 = (H) => {
        H = LS8.HttpRequest.clone(H);
        for (let _ of Object.keys(H.headers)) if (VS8.indexOf(_.toLowerCase()) > -1) delete H.headers[_];
        return H;
      },
      FS8 = ({ query: H = {} }) => {
        let _ = [],
          q = {};
        for (let $ of Object.keys(H)) {
          if ($.toLowerCase() === SS8) continue;
          let K = PO_.escapeUri($);
          _.push(K);
          let O = H[$];
          if (typeof O === "string") q[K] = `${K}=${PO_.escapeUri(O)}`;
          else if (Array.isArray(O))
            q[K] = O.slice(0)
              .reduce((T, z) => T.concat([`${K}=${PO_.escapeUri(z)}`]), [])
              .sort()
              .join("&");
        }
        return _.sort()
          .map(($) => q[$])
          .filter(($) => $)
          .join("&");
      },
      m0$ = (H) =>
        p0$(H)
          .toISOString()
          .replace(/\.\d{3}Z$/, "Z"),
      p0$ = (H) => {
        if (typeof H === "number") return new Date(H * 1000);
        if (typeof H === "string") {
          if (Number(H)) return new Date(Number(H) * 1000);
          return new Date(H);
        }
        return H;
      };
    class uK6 {
      service;
      regionProvider;
      credentialProvider;
      sha256;
      uriEscapePath;
      applyChecksum;
      constructor({ applyChecksum: H, credentials: _, region: q, service: $, sha256: K, uriEscapePath: O = !0 }) {
        (this.service = $),
          (this.sha256 = K),
          (this.uriEscapePath = O),
          (this.applyChecksum = typeof H === "boolean" ? H : !0),
          (this.regionProvider = GS8.normalizeProvider(q)),
          (this.credentialProvider = GS8.normalizeProvider(_));
      }
      createCanonicalRequest(H, _, q) {
        let $ = Object.keys(_).sort();
        return `${H.method}
${this.getCanonicalPath(H)}
${FS8(H)}
${$.map((K) => `${K}:${_[K]}`).join(`
`)}

${$.join(";")}
${q}`;
      }
      async createStringToSign(H, _, q, $) {
        let K = new this.sha256();
        K.update(x1H.toUint8Array(q));
        let O = await K.digest();
        return `${$}
${H}
${_}
${it.toHex(O)}`;
      }
      getCanonicalPath({ path: H }) {
        if (this.uriEscapePath) {
          let _ = [];
          for (let K of H.split("/")) {
            if (K?.length === 0) continue;
            if (K === ".") continue;
            if (K === "..") _.pop();
            else _.push(K);
          }
          let q = `${H?.startsWith("/") ? "/" : ""}${_.join("/")}${_.length > 0 && H?.endsWith("/") ? "/" : ""}`;
          return PO_.escapeUri(q).replace(/%2F/g, "/");
        }
        return H;
      }
      validateResolvedCredentials(H) {
        if (typeof H !== "object" || typeof H.accessKeyId !== "string" || typeof H.secretAccessKey !== "string")
          throw Error("Resolved credential object is not valid");
      }
      formatDate(H) {
        let _ = m0$(H).replace(/[\-:]/g, "");
        return { longDate: _, shortDate: _.slice(0, 8) };
      }
      getCanonicalHeaderList(H) {
        return Object.keys(H).sort().join(";");
      }
    }
    class US8 extends uK6 {
      headerFormatter = new gS8();
      constructor({ applyChecksum: H, credentials: _, region: q, service: $, sha256: K, uriEscapePath: O = !0 }) {
        super({ applyChecksum: H, credentials: _, region: q, service: $, sha256: K, uriEscapePath: O });
      }
      async presign(H, _ = {}) {
        let {
            signingDate: q = new Date(),
            expiresIn: $ = 3600,
            unsignableHeaders: K,
            unhoistableHeaders: O,
            signableHeaders: T,
            hoistableHeaders: z,
            signingRegion: A,
            signingService: f,
          } = _,
          w = await this.credentialProvider();
        this.validateResolvedCredentials(w);
        let Y = A ?? (await this.regionProvider()),
          { longDate: D, shortDate: j } = this.formatDate(q);
        if ($ > pS8)
          return Promise.reject(
            "Signature version 4 presigned URLs must have an expiration date less than one week in the future",
          );
        let M = GO_(j, Y, f ?? this.service),
          J = cS8(hK6(H), { unhoistableHeaders: O, hoistableHeaders: z });
        if (w.sessionToken) J.query[SK6] = w.sessionToken;
        (J.query[kS8] = XO_),
          (J.query[vS8] = `${w.accessKeyId}/${M}`),
          (J.query[yK6] = D),
          (J.query[hS8] = $.toString(10));
        let P = NK6(J, K, T);
        return (
          (J.query[NS8] = this.getCanonicalHeaderList(P)),
          (J.query[VK6] = await this.getSignature(
            D,
            M,
            this.getSigningKey(w, Y, j, f),
            this.createCanonicalRequest(J, P, await RO_(H, this.sha256)),
          )),
          J
        );
      }
      async sign(H, _) {
        if (typeof H === "string") return this.signString(H, _);
        else if (H.headers && H.payload) return this.signEvent(H, _);
        else if (H.message) return this.signMessage(H, _);
        else return this.signRequest(H, _);
      }
      async signEvent(
        { headers: H, payload: _ },
        { signingDate: q = new Date(), priorSignature: $, signingRegion: K, signingService: O },
      ) {
        let T = K ?? (await this.regionProvider()),
          { shortDate: z, longDate: A } = this.formatDate(q),
          f = GO_(z, T, O ?? this.service),
          w = await RO_({ headers: {}, body: _ }, this.sha256),
          Y = new this.sha256();
        Y.update(H);
        let D = it.toHex(await Y.digest()),
          j = [uS8, A, f, $, D, w].join(`
`);
        return this.signString(j, { signingDate: q, signingRegion: T, signingService: O });
      }
      async signMessage(H, { signingDate: _ = new Date(), signingRegion: q, signingService: $ }) {
        return this.signEvent(
          { headers: this.headerFormatter.format(H.message.headers), payload: H.message.body },
          { signingDate: _, signingRegion: q, signingService: $, priorSignature: H.priorSignature },
        ).then((O) => {
          return { message: H.message, signature: O };
        });
      }
      async signString(H, { signingDate: _ = new Date(), signingRegion: q, signingService: $ } = {}) {
        let K = await this.credentialProvider();
        this.validateResolvedCredentials(K);
        let O = q ?? (await this.regionProvider()),
          { shortDate: T } = this.formatDate(_),
          z = new this.sha256(await this.getSigningKey(K, O, T, $));
        return z.update(x1H.toUint8Array(H)), it.toHex(await z.digest());
      }
      async signRequest(
        H,
        {
          signingDate: _ = new Date(),
          signableHeaders: q,
          unsignableHeaders: $,
          signingRegion: K,
          signingService: O,
        } = {},
      ) {
        let T = await this.credentialProvider();
        this.validateResolvedCredentials(T);
        let z = K ?? (await this.regionProvider()),
          A = hK6(H),
          { longDate: f, shortDate: w } = this.formatDate(_),
          Y = GO_(w, z, O ?? this.service);
        if (((A.headers[CK6] = f), T.sessionToken)) A.headers[ES8] = T.sessionToken;
        let D = await RO_(A, this.sha256);
        if (!dS8(ZO_, A.headers) && this.applyChecksum) A.headers[ZO_] = D;
        let j = NK6(A, $, q),
          M = await this.getSignature(f, Y, this.getSigningKey(T, z, w, O), this.createCanonicalRequest(A, j, D));
        return (
          (A.headers[EK6] =
            `${XO_} Credential=${T.accessKeyId}/${Y}, SignedHeaders=${this.getCanonicalHeaderList(j)}, Signature=${M}`),
          A
        );
      }
      async getSignature(H, _, q, $) {
        let K = await this.createStringToSign(H, _, $, XO_),
          O = new this.sha256(await q);
        return O.update(x1H.toUint8Array(K)), it.toHex(await O.digest());
      }
      getSigningKey(H, _, q, $) {
        return BS8(this.sha256, H, q, _, $ || this.service);
      }
    }
    var B0$ = { SignatureV4a: null };
    MK.ALGORITHM_IDENTIFIER = XO_;
    MK.ALGORITHM_IDENTIFIER_V4A = I0$;
    MK.ALGORITHM_QUERY_PARAM = kS8;
    MK.ALWAYS_UNSIGNABLE_HEADERS = CS8;
    MK.AMZ_DATE_HEADER = CK6;
    MK.AMZ_DATE_QUERY_PARAM = yK6;
    MK.AUTH_HEADER = EK6;
    MK.CREDENTIAL_QUERY_PARAM = vS8;
    MK.DATE_HEADER = yS8;
    MK.EVENT_ALGORITHM_IDENTIFIER = uS8;
    MK.EXPIRES_QUERY_PARAM = hS8;
    MK.GENERATED_HEADERS = VS8;
    MK.HOST_HEADER = C0$;
    MK.KEY_TYPE_IDENTIFIER = bK6;
    MK.MAX_CACHE_SIZE = mS8;
    MK.MAX_PRESIGNED_TTL = pS8;
    MK.PROXY_HEADER_PATTERN = bS8;
    MK.REGION_SET_PARAM = E0$;
    MK.SEC_HEADER_PATTERN = IS8;
    MK.SHA256_HEADER = ZO_;
    MK.SIGNATURE_HEADER = SS8;
    MK.SIGNATURE_QUERY_PARAM = VK6;
    MK.SIGNED_HEADERS_QUERY_PARAM = NS8;
    MK.SignatureV4 = US8;
    MK.SignatureV4Base = uK6;
    MK.TOKEN_HEADER = ES8;
    MK.TOKEN_QUERY_PARAM = SK6;
    MK.UNSIGNABLE_PATTERNS = b0$;
    MK.UNSIGNED_PAYLOAD = xS8;
    MK.clearCredentialCache = u0$;
    MK.createScope = GO_;
    MK.getCanonicalHeaders = NK6;
    MK.getCanonicalQuery = FS8;
    MK.getPayloadHash = RO_;
    MK.getSigningKey = BS8;
    MK.hasHeader = dS8;
    MK.moveHeadersToQuery = cS8;
    MK.prepareRequest = hK6;
    MK.signatureV4aContainer = B0$;
  });

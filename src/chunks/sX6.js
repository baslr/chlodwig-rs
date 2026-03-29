  var SX6 = d((DJ_) => {
    Object.defineProperty(DJ_, "__esModule", { value: !0 });
    DJ_.JWTAccess = void 0;
    var p34 = ZXH(),
      B34 = dHH(),
      SRq = { alg: "RS256", typ: "JWT" };
    class VX6 {
      constructor(H, _, q, $) {
        (this.cache = new B34.LRUCache({ capacity: 500, maxAge: 3600000 })),
          (this.email = H),
          (this.key = _),
          (this.keyId = q),
          (this.eagerRefreshThresholdMillis = $ !== null && $ !== void 0 ? $ : 300000);
      }
      getCachedKey(H, _) {
        let q = H;
        if (_ && Array.isArray(_) && _.length) q = H ? `${H}_${_.join("_")}` : `${_.join("_")}`;
        else if (typeof _ === "string") q = H ? `${H}_${_}` : _;
        if (!q) throw Error("Scopes or url must be provided");
        return q;
      }
      getRequestHeaders(H, _, q) {
        let $ = this.getCachedKey(H, q),
          K = this.cache.get($),
          O = Date.now();
        if (K && K.expiration - O > this.eagerRefreshThresholdMillis) return K.headers;
        let T = Math.floor(Date.now() / 1000),
          z = VX6.getExpirationTime(T),
          A;
        if (Array.isArray(q)) q = q.join(" ");
        if (q) A = { iss: this.email, sub: this.email, scope: q, exp: z, iat: T };
        else A = { iss: this.email, sub: this.email, aud: H, exp: z, iat: T };
        if (_) {
          for (let j in A)
            if (_[j])
              throw Error(
                `The '${j}' property is not allowed when passing additionalClaims. This claim is included in the JWT by default.`,
              );
        }
        let f = this.keyId ? { ...SRq, kid: this.keyId } : SRq,
          w = Object.assign(A, _),
          D = { Authorization: `Bearer ${p34.sign({ header: f, payload: w, secret: this.key })}` };
        return this.cache.set($, { expiration: z * 1000, headers: D }), D;
      }
      static getExpirationTime(H) {
        return H + 3600;
      }
      fromJSON(H) {
        if (!H) throw Error("Must pass in a JSON object containing the service account auth settings.");
        if (!H.client_email) throw Error("The incoming JSON object does not contain a client_email field");
        if (!H.private_key) throw Error("The incoming JSON object does not contain a private_key field");
        (this.email = H.client_email),
          (this.key = H.private_key),
          (this.keyId = H.private_key_id),
          (this.projectId = H.project_id);
      }
      fromStream(H, _) {
        if (_) this.fromStreamAsync(H).then(() => _(), _);
        else return this.fromStreamAsync(H);
      }
      fromStreamAsync(H) {
        return new Promise((_, q) => {
          if (!H) q(Error("Must pass in a stream containing the service account auth settings."));
          let $ = "";
          H.setEncoding("utf8")
            .on("data", (K) => ($ += K))
            .on("error", q)
            .on("end", () => {
              try {
                let K = JSON.parse($);
                this.fromJSON(K), _();
              } catch (K) {
                q(K);
              }
            });
        });
      }
    }
    DJ_.JWTAccess = VX6;
  });

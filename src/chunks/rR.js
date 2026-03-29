  var rR = d((nR) => {
    var vxH = q16(),
      bk8 = $16(),
      K16 = Sk8(),
      X3_ = require("path"),
      W3_ = Ek8(),
      IMH = Ck8(),
      uk8 = "AWS_PROFILE",
      xk8 = "default",
      VM$ = (H) => H.profile || process.env[uk8] || xk8,
      S1H = ".",
      SM$ = (H) =>
        Object.entries(H)
          .filter(([_]) => {
            let q = _.indexOf(S1H);
            if (q === -1) return !1;
            return Object.values(W3_.IniSectionType).includes(_.substring(0, q));
          })
          .reduce(
            (_, [q, $]) => {
              let K = q.indexOf(S1H),
                O = q.substring(0, K) === W3_.IniSectionType.PROFILE ? q.substring(K + 1) : q;
              return (_[O] = $), _;
            },
            { ...(H.default && { default: H.default }) },
          ),
      EM$ = "AWS_CONFIG_FILE",
      mk8 = () => process.env[EM$] || X3_.join(vxH.getHomeDir(), ".aws", "config"),
      CM$ = "AWS_SHARED_CREDENTIALS_FILE",
      bM$ = () => process.env[CM$] || X3_.join(vxH.getHomeDir(), ".aws", "credentials"),
      IM$ = /^([\w-]+)\s(["'])?([\w-@\+\.%:/]+)\2$/,
      uM$ = ["__proto__", "profile __proto__"],
      O16 = (H) => {
        let _ = {},
          q,
          $;
        for (let K of H.split(/\r?\n/)) {
          let O = K.split(/(^|\s)[;#]/)[0].trim();
          if (O[0] === "[" && O[O.length - 1] === "]") {
            (q = void 0), ($ = void 0);
            let z = O.substring(1, O.length - 1),
              A = IM$.exec(z);
            if (A) {
              let [, f, , w] = A;
              if (Object.values(W3_.IniSectionType).includes(f)) q = [f, w].join(S1H);
            } else q = z;
            if (uM$.includes(z)) throw Error(`Found invalid profile name "${z}"`);
          } else if (q) {
            let z = O.indexOf("=");
            if (![0, -1].includes(z)) {
              let [A, f] = [O.substring(0, z).trim(), O.substring(z + 1).trim()];
              if (f === "") $ = A;
              else {
                if ($ && K.trimStart() === K) $ = void 0;
                _[q] = _[q] || {};
                let w = $ ? [$, A].join(S1H) : A;
                _[q][w] = f;
              }
            }
          }
        }
        return _;
      },
      Ik8 = () => ({}),
      pk8 = async (H = {}) => {
        let { filepath: _ = bM$(), configFilepath: q = mk8() } = H,
          $ = vxH.getHomeDir(),
          K = "~/",
          O = _;
        if (_.startsWith("~/")) O = X3_.join($, _.slice(2));
        let T = q;
        if (q.startsWith("~/")) T = X3_.join($, q.slice(2));
        let z = await Promise.all([
          IMH.readFile(T, { ignoreCache: H.ignoreCache }).then(O16).then(SM$).catch(Ik8),
          IMH.readFile(O, { ignoreCache: H.ignoreCache }).then(O16).catch(Ik8),
        ]);
        return { configFile: z[0], credentialsFile: z[1] };
      },
      xM$ = (H) =>
        Object.entries(H)
          .filter(([_]) => _.startsWith(W3_.IniSectionType.SSO_SESSION + S1H))
          .reduce((_, [q, $]) => ({ ..._, [q.substring(q.indexOf(S1H) + 1)]: $ }), {}),
      mM$ = () => ({}),
      pM$ = async (H = {}) =>
        IMH.readFile(H.configFilepath ?? mk8())
          .then(O16)
          .then(xM$)
          .catch(mM$),
      BM$ = (...H) => {
        let _ = {};
        for (let q of H)
          for (let [$, K] of Object.entries(q))
            if (_[$] !== void 0) Object.assign(_[$], K);
            else _[$] = K;
        return _;
      },
      gM$ = async (H) => {
        let _ = await pk8(H);
        return BM$(_.configFile, _.credentialsFile);
      },
      dM$ = {
        getFileRecord() {
          return IMH.fileIntercept;
        },
        interceptFile(H, _) {
          IMH.fileIntercept[H] = Promise.resolve(_);
        },
        getTokenRecord() {
          return K16.tokenIntercept;
        },
        interceptToken(H, _) {
          K16.tokenIntercept[H] = _;
        },
      };
    Object.defineProperty(nR, "getSSOTokenFromFile", {
      enumerable: !0,
      get: function () {
        return K16.getSSOTokenFromFile;
      },
    });
    Object.defineProperty(nR, "readFile", {
      enumerable: !0,
      get: function () {
        return IMH.readFile;
      },
    });
    nR.CONFIG_PREFIX_SEPARATOR = S1H;
    nR.DEFAULT_PROFILE = xk8;
    nR.ENV_PROFILE = uk8;
    nR.externalDataInterceptor = dM$;
    nR.getProfileName = VM$;
    nR.loadSharedConfigFiles = pk8;
    nR.loadSsoSessionData = pM$;
    nR.parseKnownFiles = gM$;
    Object.keys(vxH).forEach(function (H) {
      if (H !== "default" && !Object.prototype.hasOwnProperty.call(nR, H))
        Object.defineProperty(nR, H, {
          enumerable: !0,
          get: function () {
            return vxH[H];
          },
        });
    });
    Object.keys(bk8).forEach(function (H) {
      if (H !== "default" && !Object.prototype.hasOwnProperty.call(nR, H))
        Object.defineProperty(nR, H, {
          enumerable: !0,
          get: function () {
            return bk8[H];
          },
        });
    });
  });

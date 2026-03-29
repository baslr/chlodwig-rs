  var vI = d((m1H) => {
    var lK6 = LE8();
    class kE8 {
      capacity;
      data = new Map();
      parameters = [];
      constructor({ size: H, params: _ }) {
        if (((this.capacity = H ?? 50), _)) this.parameters = _;
      }
      get(H, _) {
        let q = this.hash(H);
        if (q === !1) return _();
        if (!this.data.has(q)) {
          if (this.data.size > this.capacity + 10) {
            let $ = this.data.keys(),
              K = 0;
            while (!0) {
              let { value: O, done: T } = $.next();
              if ((this.data.delete(O), T || ++K > 10)) break;
            }
          }
          this.data.set(q, _());
        }
        return this.data.get(q);
      }
      size() {
        return this.data.size;
      }
      hash(H) {
        let _ = "",
          { parameters: q } = this;
        if (q.length === 0) return !1;
        for (let $ of q) {
          let K = String(H[$] ?? "");
          if (K.includes("|;")) return !1;
          _ += K + "|;";
        }
        return _;
      }
    }
    var EG$ = new RegExp(
        "^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$",
      ),
      vE8 = (H) => EG$.test(H) || (H.startsWith("[") && H.endsWith("]")),
      CG$ = new RegExp("^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$"),
      nK6 = (H, _ = !1) => {
        if (!_) return CG$.test(H);
        let q = H.split(".");
        for (let $ of q) if (!nK6($)) return !1;
        return !0;
      },
      iK6 = {},
      oxH = "endpoints";
    function at(H) {
      if (typeof H !== "object" || H == null) return H;
      if ("ref" in H) return `$${at(H.ref)}`;
      if ("fn" in H) return `${H.fn}(${(H.argv || []).map(at).join(", ")})`;
      return JSON.stringify(H, null, 2);
    }
    class sR extends Error {
      constructor(H) {
        super(H);
        this.name = "EndpointError";
      }
    }
    var bG$ = (H, _) => H === _,
      IG$ = (H) => {
        let _ = H.split("."),
          q = [];
        for (let $ of _) {
          let K = $.indexOf("[");
          if (K !== -1) {
            if ($.indexOf("]") !== $.length - 1) throw new sR(`Path: '${H}' does not end with ']'`);
            let O = $.slice(K + 1, -1);
            if (Number.isNaN(parseInt(O))) throw new sR(`Invalid array index: '${O}' in path: '${H}'`);
            if (K !== 0) q.push($.slice(0, K));
            q.push(O);
          } else q.push($);
        }
        return q;
      },
      NE8 = (H, _) =>
        IG$(_).reduce((q, $) => {
          if (typeof q !== "object") throw new sR(`Index '${$}' in '${_}' not found in '${JSON.stringify(H)}'`);
          else if (Array.isArray(q)) return q[parseInt($)];
          return q[$];
        }, H),
      uG$ = (H) => H != null,
      xG$ = (H) => !H,
      QK6 = { [lK6.EndpointURLScheme.HTTP]: 80, [lK6.EndpointURLScheme.HTTPS]: 443 },
      mG$ = (H) => {
        let _ = (() => {
          try {
            if (H instanceof URL) return H;
            if (typeof H === "object" && "hostname" in H) {
              let { hostname: D, port: j, protocol: M = "", path: J = "", query: P = {} } = H,
                X = new URL(`${M}//${D}${j ? `:${j}` : ""}${J}`);
              return (
                (X.search = Object.entries(P)
                  .map(([R, W]) => `${R}=${W}`)
                  .join("&")),
                X
              );
            }
            return new URL(H);
          } catch (D) {
            return null;
          }
        })();
        if (!_) return console.error(`Unable to parse ${JSON.stringify(H)} as a whatwg URL.`), null;
        let q = _.href,
          { host: $, hostname: K, pathname: O, protocol: T, search: z } = _;
        if (z) return null;
        let A = T.slice(0, -1);
        if (!Object.values(lK6.EndpointURLScheme).includes(A)) return null;
        let f = vE8(K),
          w = q.includes(`${$}:${QK6[A]}`) || (typeof H === "string" && H.includes(`${$}:${QK6[A]}`)),
          Y = `${$}${w ? `:${QK6[A]}` : ""}`;
        return { scheme: A, authority: Y, path: O, normalizedPath: O.endsWith("/") ? O : `${O}/`, isIp: f };
      },
      pG$ = (H, _) => H === _,
      BG$ = (H, _, q, $) => {
        if (_ >= q || H.length < q) return null;
        if (!$) return H.substring(_, q);
        return H.substring(H.length - q, H.length - _);
      },
      gG$ = (H) => encodeURIComponent(H).replace(/[!*'()]/g, (_) => `%${_.charCodeAt(0).toString(16).toUpperCase()}`),
      dG$ = {
        booleanEquals: bG$,
        getAttr: NE8,
        isSet: uG$,
        isValidHostLabel: nK6,
        not: xG$,
        parseURL: mG$,
        stringEquals: pG$,
        substring: BG$,
        uriEncode: gG$,
      },
      hE8 = (H, _) => {
        let q = [],
          $ = { ..._.endpointParams, ..._.referenceRecord },
          K = 0;
        while (K < H.length) {
          let O = H.indexOf("{", K);
          if (O === -1) {
            q.push(H.slice(K));
            break;
          }
          q.push(H.slice(K, O));
          let T = H.indexOf("}", O);
          if (T === -1) {
            q.push(H.slice(O));
            break;
          }
          if (H[O + 1] === "{" && H[T + 1] === "}") q.push(H.slice(O + 1, T)), (K = T + 2);
          let z = H.substring(O + 1, T);
          if (z.includes("#")) {
            let [A, f] = z.split("#");
            q.push(NE8($[A], f));
          } else q.push($[z]);
          K = T + 1;
        }
        return q.join("");
      },
      cG$ = ({ ref: H }, _) => {
        return { ..._.endpointParams, ..._.referenceRecord }[H];
      },
      EO_ = (H, _, q) => {
        if (typeof H === "string") return hE8(H, q);
        else if (H.fn) return VE8.callFunction(H, q);
        else if (H.ref) return cG$(H, q);
        throw new sR(`'${_}': ${String(H)} is not a string, function or reference.`);
      },
      yE8 = ({ fn: H, argv: _ }, q) => {
        let $ = _.map((O) => (["boolean", "number"].includes(typeof O) ? O : VE8.evaluateExpression(O, "arg", q))),
          K = H.split(".");
        if (K[0] in iK6 && K[1] != null) return iK6[K[0]][K[1]](...$);
        return dG$[H](...$);
      },
      VE8 = { evaluateExpression: EO_, callFunction: yE8 },
      FG$ = ({ assign: H, ..._ }, q) => {
        if (H && H in q.referenceRecord) throw new sR(`'${H}' is already defined in Reference Record.`);
        let $ = yE8(_, q);
        return (
          q.logger?.debug?.(`${oxH} evaluateCondition: ${at(_)} = ${at($)}`),
          { result: $ === "" ? !0 : !!$, ...(H != null && { toAssign: { name: H, value: $ } }) }
        );
      },
      rK6 = (H = [], _) => {
        let q = {};
        for (let $ of H) {
          let { result: K, toAssign: O } = FG$($, { ..._, referenceRecord: { ..._.referenceRecord, ...q } });
          if (!K) return { result: K };
          if (O) (q[O.name] = O.value), _.logger?.debug?.(`${oxH} assign: ${O.name} := ${at(O.value)}`);
        }
        return { result: !0, referenceRecord: q };
      },
      UG$ = (H, _) =>
        Object.entries(H).reduce(
          (q, [$, K]) => ({
            ...q,
            [$]: K.map((O) => {
              let T = EO_(O, "Header value entry", _);
              if (typeof T !== "string") throw new sR(`Header '${$}' value '${T}' is not a string`);
              return T;
            }),
          }),
          {},
        ),
      SE8 = (H, _) => Object.entries(H).reduce((q, [$, K]) => ({ ...q, [$]: CE8.getEndpointProperty(K, _) }), {}),
      EE8 = (H, _) => {
        if (Array.isArray(H)) return H.map((q) => EE8(q, _));
        switch (typeof H) {
          case "string":
            return hE8(H, _);
          case "object":
            if (H === null) throw new sR(`Unexpected endpoint property: ${H}`);
            return CE8.getEndpointProperties(H, _);
          case "boolean":
            return H;
          default:
            throw new sR(`Unexpected endpoint property type: ${typeof H}`);
        }
      },
      CE8 = { getEndpointProperty: EE8, getEndpointProperties: SE8 },
      QG$ = (H, _) => {
        let q = EO_(H, "Endpoint URL", _);
        if (typeof q === "string")
          try {
            return new URL(q);
          } catch ($) {
            throw (console.error(`Failed to construct URL with ${q}`, $), $);
          }
        throw new sR(`Endpoint URL must be a string, got ${typeof q}`);
      },
      lG$ = (H, _) => {
        let { conditions: q, endpoint: $ } = H,
          { result: K, referenceRecord: O } = rK6(q, _);
        if (!K) return;
        let T = { ..._, referenceRecord: { ..._.referenceRecord, ...O } },
          { url: z, properties: A, headers: f } = $;
        return (
          _.logger?.debug?.(`${oxH} Resolving endpoint from template: ${at($)}`),
          { ...(f != null && { headers: UG$(f, T) }), ...(A != null && { properties: SE8(A, T) }), url: QG$(z, T) }
        );
      },
      iG$ = (H, _) => {
        let { conditions: q, error: $ } = H,
          { result: K, referenceRecord: O } = rK6(q, _);
        if (!K) return;
        throw new sR(EO_($, "Error", { ..._, referenceRecord: { ..._.referenceRecord, ...O } }));
      },
      bE8 = (H, _) => {
        for (let q of H)
          if (q.type === "endpoint") {
            let $ = lG$(q, _);
            if ($) return $;
          } else if (q.type === "error") iG$(q, _);
          else if (q.type === "tree") {
            let $ = IE8.evaluateTreeRule(q, _);
            if ($) return $;
          } else throw new sR(`Unknown endpoint rule: ${q}`);
        throw new sR("Rules evaluation failed");
      },
      nG$ = (H, _) => {
        let { conditions: q, rules: $ } = H,
          { result: K, referenceRecord: O } = rK6(q, _);
        if (!K) return;
        return IE8.evaluateRules($, { ..._, referenceRecord: { ..._.referenceRecord, ...O } });
      },
      IE8 = { evaluateRules: bE8, evaluateTreeRule: nG$ },
      rG$ = (H, _) => {
        let { endpointParams: q, logger: $ } = _,
          { parameters: K, rules: O } = H;
        _.logger?.debug?.(`${oxH} Initial EndpointParams: ${at(q)}`);
        let T = Object.entries(K)
          .filter(([, f]) => f.default != null)
          .map(([f, w]) => [f, w.default]);
        if (T.length > 0) for (let [f, w] of T) q[f] = q[f] ?? w;
        let z = Object.entries(K)
          .filter(([, f]) => f.required)
          .map(([f]) => f);
        for (let f of z) if (q[f] == null) throw new sR(`Missing required parameter: '${f}'`);
        let A = bE8(O, { endpointParams: q, logger: $, referenceRecord: {} });
        return _.logger?.debug?.(`${oxH} Resolved endpoint: ${at(A)}`), A;
      };
    m1H.EndpointCache = kE8;
    m1H.EndpointError = sR;
    m1H.customEndpointFunctions = iK6;
    m1H.isIpAddress = vE8;
    m1H.isValidHostLabel = nK6;
    m1H.resolveEndpoint = rG$;
  });

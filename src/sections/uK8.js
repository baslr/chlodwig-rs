    CI9 = Object.prototype.hasOwnProperty;
    (vXK = { includeMatches: !1, findAllMatches: !1, minMatchCharLength: 1 }),
      (NXK = {
        isCaseSensitive: !1,
        includeScore: !1,
        keys: [],
        shouldSort: !0,
        sortFn: (H, _) => (H.score === _.score ? (H.idx < _.idx ? -1 : 1) : H.score < _.score ? -1 : 1),
      }),
      (hXK = { location: 0, threshold: 0.6, distance: 100 }),
      (yXK = { useExtendedSearch: !1, getFn: kXK, ignoreLocation: !1, ignoreFieldNorm: !1, fieldNormWeight: 1 }),
      (H1 = { ...NXK, ...vXK, ...hXK, ...yXK }),
      (VXK = /[^ ]+/g);
    FI9 = class FI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "exact";
      }
      static get multiRegex() {
        return /^="(.*)"$/;
      }
      static get singleRegex() {
        return /^=(.*)$/;
      }
      search(H) {
        let _ = H === this.pattern;
        return { isMatch: _, score: _ ? 0 : 1, indices: [0, this.pattern.length - 1] };
      }
    };
    UI9 = class UI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "inverse-exact";
      }
      static get multiRegex() {
        return /^!"(.*)"$/;
      }
      static get singleRegex() {
        return /^!(.*)$/;
      }
      search(H) {
        let q = H.indexOf(this.pattern) === -1;
        return { isMatch: q, score: q ? 0 : 1, indices: [0, H.length - 1] };
      }
    };
    QI9 = class QI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "prefix-exact";
      }
      static get multiRegex() {
        return /^\^"(.*)"$/;
      }
      static get singleRegex() {
        return /^\^(.*)$/;
      }
      search(H) {
        let _ = H.startsWith(this.pattern);
        return { isMatch: _, score: _ ? 0 : 1, indices: [0, this.pattern.length - 1] };
      }
    };
    lI9 = class lI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "inverse-prefix-exact";
      }
      static get multiRegex() {
        return /^!\^"(.*)"$/;
      }
      static get singleRegex() {
        return /^!\^(.*)$/;
      }
      search(H) {
        let _ = !H.startsWith(this.pattern);
        return { isMatch: _, score: _ ? 0 : 1, indices: [0, H.length - 1] };
      }
    };
    iI9 = class iI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "suffix-exact";
      }
      static get multiRegex() {
        return /^"(.*)"\$$/;
      }
      static get singleRegex() {
        return /^(.*)\$$/;
      }
      search(H) {
        let _ = H.endsWith(this.pattern);
        return { isMatch: _, score: _ ? 0 : 1, indices: [H.length - this.pattern.length, H.length - 1] };
      }
    };
    nI9 = class nI9 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "inverse-suffix-exact";
      }
      static get multiRegex() {
        return /^!"(.*)"\$$/;
      }
      static get singleRegex() {
        return /^!(.*)\$$/;
      }
      search(H) {
        let _ = !H.endsWith(this.pattern);
        return { isMatch: _, score: _ ? 0 : 1, indices: [0, H.length - 1] };
      }
    };
    bK8 = class bK8 extends ia {
      constructor(
        H,
        {
          location: _ = H1.location,
          threshold: q = H1.threshold,
          distance: $ = H1.distance,
          includeMatches: K = H1.includeMatches,
          findAllMatches: O = H1.findAllMatches,
          minMatchCharLength: T = H1.minMatchCharLength,
          isCaseSensitive: z = H1.isCaseSensitive,
          ignoreLocation: A = H1.ignoreLocation,
        } = {},
      ) {
        super(H);
        this._bitapSearch = new CK8(H, {
          location: _,
          threshold: q,
          distance: $,
          includeMatches: K,
          findAllMatches: O,
          minMatchCharLength: T,
          isCaseSensitive: z,
          ignoreLocation: A,
        });
      }
      static get type() {
        return "fuzzy";
      }
      static get multiRegex() {
        return /^"(.*)"$/;
      }
      static get singleRegex() {
        return /^(.*)$/;
      }
      search(H) {
        return this._bitapSearch.searchIn(H);
      }
    };
    IK8 = class IK8 extends ia {
      constructor(H) {
        super(H);
      }
      static get type() {
        return "include";
      }
      static get multiRegex() {
        return /^'"(.*)"$/;
      }
      static get singleRegex() {
        return /^'(.*)$/;
      }
      search(H) {
        let _ = 0,
          q,
          $ = [],
          K = this.pattern.length;
        while ((q = H.indexOf(this.pattern, _)) > -1) (_ = q + K), $.push([q, _ - 1]);
        let O = !!$.length;
        return { isMatch: O, score: O ? 0 : 1, indices: $ };
      }
    };
    (hK8 = [FI9, IK8, QI9, lI9, nI9, iI9, UI9, bK8]), (uI9 = hK8.length), (uXK = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
    pXK = new Set([bK8.type, IK8.type]);
    yK8 = [];
    (_r_ = { AND: "$and", OR: "$or" }), (SK8 = { PATH: "$path", PATTERN: "$val" });
    PU.version = "7.0.0";
    PU.createIndex = cI9;
    PU.parseIndex = EXK;
    PU.config = H1;
    PU.parseQuery = oI9;
    BXK(rI9);

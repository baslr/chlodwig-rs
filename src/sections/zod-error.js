    ycH();
    e8 = _5.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite",
    ]);
    Nk = class Nk extends Error {
      get errors() {
        return this.issues;
      }
      constructor(H) {
        super();
        (this.issues = []),
          (this.addIssue = (q) => {
            this.issues = [...this.issues, q];
          }),
          (this.addIssues = (q = []) => {
            this.issues = [...this.issues, ...q];
          });
        let _ = new.target.prototype;
        if (Object.setPrototypeOf) Object.setPrototypeOf(this, _);
        else this.__proto__ = _;
        (this.name = "ZodError"), (this.issues = H);
      }
      format(H) {
        let _ =
            H ||
            function (K) {
              return K.message;
            },
          q = { _errors: [] },
          $ = (K) => {
            for (let O of K.issues)
              if (O.code === "invalid_union") O.unionErrors.map($);
              else if (O.code === "invalid_return_type") $(O.returnTypeError);
              else if (O.code === "invalid_arguments") $(O.argumentsError);
              else if (O.path.length === 0) q._errors.push(_(O));
              else {
                let T = q,
                  z = 0;
                while (z < O.path.length) {
                  let A = O.path[z];
                  if (z !== O.path.length - 1) T[A] = T[A] || { _errors: [] };
                  else (T[A] = T[A] || { _errors: [] }), T[A]._errors.push(_(O));
                  (T = T[A]), z++;
                }
              }
          };
        return $(this), q;
      }
      static assert(H) {
        if (!(H instanceof Nk)) throw Error(`Not a ZodError: ${H}`);
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, _5.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(H = (_) => _.message) {
        let _ = {},
          q = [];
        for (let $ of this.issues)
          if ($.path.length > 0) {
            let K = $.path[0];
            (_[K] = _[K] || []), _[K].push(H($));
          } else q.push(H($));
        return { formErrors: q, fieldErrors: _ };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    Nk.create = (H) => {
      return new Nk(H);
    };

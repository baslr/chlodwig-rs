    (function (H) {
      H.assertEqual = (K) => {};
      function _(K) {}
      H.assertIs = _;
      function q(K) {
        throw Error();
      }
      (H.assertNever = q),
        (H.arrayToEnum = (K) => {
          let O = {};
          for (let T of K) O[T] = T;
          return O;
        }),
        (H.getValidEnumValues = (K) => {
          let O = H.objectKeys(K).filter((z) => typeof K[K[z]] !== "number"),
            T = {};
          for (let z of O) T[z] = K[z];
          return H.objectValues(T);
        }),
        (H.objectValues = (K) => {
          return H.objectKeys(K).map(function (O) {
            return K[O];
          });
        }),
        (H.objectKeys =
          typeof Object.keys === "function"
            ? (K) => Object.keys(K)
            : (K) => {
                let O = [];
                for (let T in K) if (Object.prototype.hasOwnProperty.call(K, T)) O.push(T);
                return O;
              }),
        (H.find = (K, O) => {
          for (let T of K) if (O(T)) return T;
          return;
        }),
        (H.isInteger =
          typeof Number.isInteger === "function"
            ? (K) => Number.isInteger(K)
            : (K) => typeof K === "number" && Number.isFinite(K) && Math.floor(K) === K);
      function $(K, O = " | ") {
        return K.map((T) => (typeof T === "string" ? `'${T}'` : T)).join(O);
      }
      (H.joinValues = $),
        (H.jsonStringifyReplacer = (K, O) => {
          if (typeof O === "bigint") return O.toString();
          return O;
        });
    })(_5 || (_5 = {}));
    (function (H) {
      H.mergeShapes = (_, q) => {
        return { ..._, ...q };
      };
    })(qR6 || (qR6 = {}));
    Sq = _5.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set",
    ]);

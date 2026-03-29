  var oOH = d((ql3, m87) => {
    var WRH = rOH(),
      _P = require("path"),
      GB4 = require("util");
    function RB4(H, _, q) {
      let $ = q.dereference ? (K) => WRH.stat(K, { bigint: !0 }) : (K) => WRH.lstat(K, { bigint: !0 });
      return Promise.all([
        $(H),
        $(_).catch((K) => {
          if (K.code === "ENOENT") return null;
          throw K;
        }),
      ]).then(([K, O]) => ({ srcStat: K, destStat: O }));
    }
    function ZB4(H, _, q) {
      let $,
        K = q.dereference ? (T) => WRH.statSync(T, { bigint: !0 }) : (T) => WRH.lstatSync(T, { bigint: !0 }),
        O = K(H);
      try {
        $ = K(_);
      } catch (T) {
        if (T.code === "ENOENT") return { srcStat: O, destStat: null };
        throw T;
      }
      return { srcStat: O, destStat: $ };
    }
    function LB4(H, _, q, $, K) {
      GB4.callbackify(RB4)(H, _, $, (O, T) => {
        if (O) return K(O);
        let { srcStat: z, destStat: A } = T;
        if (A) {
          if (WlH(z, A)) {
            let f = _P.basename(H),
              w = _P.basename(_);
            if (q === "move" && f !== w && f.toLowerCase() === w.toLowerCase())
              return K(null, { srcStat: z, destStat: A, isChangingCase: !0 });
            return K(Error("Source and destination must not be the same."));
          }
          if (z.isDirectory() && !A.isDirectory())
            return K(Error(`Cannot overwrite non-directory '${_}' with directory '${H}'.`));
          if (!z.isDirectory() && A.isDirectory())
            return K(Error(`Cannot overwrite directory '${_}' with non-directory '${H}'.`));
        }
        if (z.isDirectory() && VE6(H, _)) return K(Error(Kk_(H, _, q)));
        return K(null, { srcStat: z, destStat: A });
      });
    }
    function kB4(H, _, q, $) {
      let { srcStat: K, destStat: O } = ZB4(H, _, $);
      if (O) {
        if (WlH(K, O)) {
          let T = _P.basename(H),
            z = _P.basename(_);
          if (q === "move" && T !== z && T.toLowerCase() === z.toLowerCase())
            return { srcStat: K, destStat: O, isChangingCase: !0 };
          throw Error("Source and destination must not be the same.");
        }
        if (K.isDirectory() && !O.isDirectory())
          throw Error(`Cannot overwrite non-directory '${_}' with directory '${H}'.`);
        if (!K.isDirectory() && O.isDirectory())
          throw Error(`Cannot overwrite directory '${_}' with non-directory '${H}'.`);
      }
      if (K.isDirectory() && VE6(H, _)) throw Error(Kk_(H, _, q));
      return { srcStat: K, destStat: O };
    }
    function u87(H, _, q, $, K) {
      let O = _P.resolve(_P.dirname(H)),
        T = _P.resolve(_P.dirname(q));
      if (T === O || T === _P.parse(T).root) return K();
      WRH.stat(T, { bigint: !0 }, (z, A) => {
        if (z) {
          if (z.code === "ENOENT") return K();
          return K(z);
        }
        if (WlH(_, A)) return K(Error(Kk_(H, q, $)));
        return u87(H, _, T, $, K);
      });
    }
    function x87(H, _, q, $) {
      let K = _P.resolve(_P.dirname(H)),
        O = _P.resolve(_P.dirname(q));
      if (O === K || O === _P.parse(O).root) return;
      let T;
      try {
        T = WRH.statSync(O, { bigint: !0 });
      } catch (z) {
        if (z.code === "ENOENT") return;
        throw z;
      }
      if (WlH(_, T)) throw Error(Kk_(H, q, $));
      return x87(H, _, O, $);
    }
    function WlH(H, _) {
      return _.ino && _.dev && _.ino === H.ino && _.dev === H.dev;
    }
    function VE6(H, _) {
      let q = _P
          .resolve(H)
          .split(_P.sep)
          .filter((K) => K),
        $ = _P
          .resolve(_)
          .split(_P.sep)
          .filter((K) => K);
      return q.reduce((K, O, T) => K && $[T] === O, !0);
    }
    function Kk_(H, _, q) {
      return `Cannot ${q} '${H}' to a subdirectory of itself, '${_}'.`;
    }
    m87.exports = {
      checkPaths: LB4,
      checkPathsSync: kB4,
      checkParentPaths: u87,
      checkParentPathsSync: x87,
      isSrcSubdir: VE6,
      areIdentical: WlH,
    };
  });

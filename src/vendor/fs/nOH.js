  var nOH = d((NQ3, d_7) => {
    var MRH = iOH(),
      HP = require("path"),
      Rm4 = require("util");
    function Zm4(H, _, q) {
      let $ = q.dereference ? (K) => MRH.stat(K, { bigint: !0 }) : (K) => MRH.lstat(K, { bigint: !0 });
      return Promise.all([
        $(H),
        $(_).catch((K) => {
          if (K.code === "ENOENT") return null;
          throw K;
        }),
      ]).then(([K, O]) => ({ srcStat: K, destStat: O }));
    }
    function Lm4(H, _, q) {
      let $,
        K = q.dereference ? (T) => MRH.statSync(T, { bigint: !0 }) : (T) => MRH.lstatSync(T, { bigint: !0 }),
        O = K(H);
      try {
        $ = K(_);
      } catch (T) {
        if (T.code === "ENOENT") return { srcStat: O, destStat: null };
        throw T;
      }
      return { srcStat: O, destStat: $ };
    }
    function km4(H, _, q, $, K) {
      Rm4.callbackify(Zm4)(H, _, $, (O, T) => {
        if (O) return K(O);
        let { srcStat: z, destStat: A } = T;
        if (A) {
          if (wlH(z, A)) {
            let f = HP.basename(H),
              w = HP.basename(_);
            if (q === "move" && f !== w && f.toLowerCase() === w.toLowerCase())
              return K(null, { srcStat: z, destStat: A, isChangingCase: !0 });
            return K(Error("Source and destination must not be the same."));
          }
          if (z.isDirectory() && !A.isDirectory())
            return K(Error(`Cannot overwrite non-directory '${_}' with directory '${H}'.`));
          if (!z.isDirectory() && A.isDirectory())
            return K(Error(`Cannot overwrite directory '${_}' with non-directory '${H}'.`));
        }
        if (z.isDirectory() && ME6(H, _)) return K(Error(aL_(H, _, q)));
        return K(null, { srcStat: z, destStat: A });
      });
    }
    function vm4(H, _, q, $) {
      let { srcStat: K, destStat: O } = Lm4(H, _, $);
      if (O) {
        if (wlH(K, O)) {
          let T = HP.basename(H),
            z = HP.basename(_);
          if (q === "move" && T !== z && T.toLowerCase() === z.toLowerCase())
            return { srcStat: K, destStat: O, isChangingCase: !0 };
          throw Error("Source and destination must not be the same.");
        }
        if (K.isDirectory() && !O.isDirectory())
          throw Error(`Cannot overwrite non-directory '${_}' with directory '${H}'.`);
        if (!K.isDirectory() && O.isDirectory())
          throw Error(`Cannot overwrite directory '${_}' with non-directory '${H}'.`);
      }
      if (K.isDirectory() && ME6(H, _)) throw Error(aL_(H, _, q));
      return { srcStat: K, destStat: O };
    }
    function B_7(H, _, q, $, K) {
      let O = HP.resolve(HP.dirname(H)),
        T = HP.resolve(HP.dirname(q));
      if (T === O || T === HP.parse(T).root) return K();
      MRH.stat(T, { bigint: !0 }, (z, A) => {
        if (z) {
          if (z.code === "ENOENT") return K();
          return K(z);
        }
        if (wlH(_, A)) return K(Error(aL_(H, q, $)));
        return B_7(H, _, T, $, K);
      });
    }
    function g_7(H, _, q, $) {
      let K = HP.resolve(HP.dirname(H)),
        O = HP.resolve(HP.dirname(q));
      if (O === K || O === HP.parse(O).root) return;
      let T;
      try {
        T = MRH.statSync(O, { bigint: !0 });
      } catch (z) {
        if (z.code === "ENOENT") return;
        throw z;
      }
      if (wlH(_, T)) throw Error(aL_(H, q, $));
      return g_7(H, _, O, $);
    }
    function wlH(H, _) {
      return _.ino && _.dev && _.ino === H.ino && _.dev === H.dev;
    }
    function ME6(H, _) {
      let q = HP.resolve(H)
          .split(HP.sep)
          .filter((K) => K),
        $ = HP.resolve(_)
          .split(HP.sep)
          .filter((K) => K);
      return q.reduce((K, O, T) => K && $[T] === O, !0);
    }
    function aL_(H, _, q) {
      return `Cannot ${q} '${H}' to a subdirectory of itself, '${_}'.`;
    }
    d_7.exports = {
      checkPaths: km4,
      checkPathsSync: vm4,
      checkParentPaths: B_7,
      checkParentPathsSync: g_7,
      isSrcSubdir: ME6,
      areIdentical: wlH,
    };
  });

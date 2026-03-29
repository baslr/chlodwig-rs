  var r_7 = d((hQ3, n_7) => {
    var lk = TT(),
      YlH = require("path"),
      Nm4 = eu().mkdirs,
      hm4 = k6H().pathExists,
      ym4 = jE6().utimesMillis,
      DlH = nOH();
    function Vm4(H, _, q, $) {
      if (typeof q === "function" && !$) ($ = q), (q = {});
      else if (typeof q === "function") q = { filter: q };
      ($ = $ || function () {}),
        (q = q || {}),
        (q.clobber = "clobber" in q ? !!q.clobber : !0),
        (q.overwrite = "overwrite" in q ? !!q.overwrite : q.clobber),
        q.preserveTimestamps,
        DlH.checkPaths(H, _, "copy", q, (K, O) => {
          if (K) return $(K);
          let { srcStat: T, destStat: z } = O;
          DlH.checkParentPaths(H, T, _, "copy", (A) => {
            if (A) return $(A);
            if (q.filter) return U_7(c_7, z, H, _, q, $);
            return c_7(z, H, _, q, $);
          });
        });
    }
    function c_7(H, _, q, $, K) {
      let O = YlH.dirname(q);
      hm4(O, (T, z) => {
        if (T) return K(T);
        if (z) return sL_(H, _, q, $, K);
        Nm4(O, (A) => {
          if (A) return K(A);
          return sL_(H, _, q, $, K);
        });
      });
    }
    function U_7(H, _, q, $, K, O) {
      Promise.resolve(K.filter(q, $)).then(
        (T) => {
          if (T) return H(_, q, $, K, O);
          return O();
        },
        (T) => O(T),
      );
    }
    function Sm4(H, _, q, $, K) {
      if ($.filter) return U_7(sL_, H, _, q, $, K);
      return sL_(H, _, q, $, K);
    }
    function sL_(H, _, q, $, K) {
      ($.dereference ? lk.stat : lk.lstat)(_, (T, z) => {
        if (T) return K(T);
        if (z.isDirectory()) return mm4(z, H, _, q, $, K);
        else if (z.isFile() || z.isCharacterDevice() || z.isBlockDevice()) return Em4(z, H, _, q, $, K);
        else if (z.isSymbolicLink()) return gm4(H, _, q, $, K);
        else if (z.isSocket()) return K(Error(`Cannot copy a socket file: ${_}`));
        else if (z.isFIFO()) return K(Error(`Cannot copy a FIFO pipe: ${_}`));
        return K(Error(`Unknown file: ${_}`));
      });
    }
    function Em4(H, _, q, $, K, O) {
      if (!_) return Q_7(H, q, $, K, O);
      return Cm4(H, q, $, K, O);
    }
    function Cm4(H, _, q, $, K) {
      if ($.overwrite)
        lk.unlink(q, (O) => {
          if (O) return K(O);
          return Q_7(H, _, q, $, K);
        });
      else if ($.errorOnExist) return K(Error(`'${q}' already exists`));
      else return K();
    }
    function Q_7(H, _, q, $, K) {
      lk.copyFile(_, q, (O) => {
        if (O) return K(O);
        if ($.preserveTimestamps) return bm4(H.mode, _, q, K);
        return tL_(q, H.mode, K);
      });
    }
    function bm4(H, _, q, $) {
      if (Im4(H))
        return um4(q, H, (K) => {
          if (K) return $(K);
          return F_7(H, _, q, $);
        });
      return F_7(H, _, q, $);
    }
    function Im4(H) {
      return (H & 128) === 0;
    }
    function um4(H, _, q) {
      return tL_(H, _ | 128, q);
    }
    function F_7(H, _, q, $) {
      xm4(_, q, (K) => {
        if (K) return $(K);
        return tL_(q, H, $);
      });
    }
    function tL_(H, _, q) {
      return lk.chmod(H, _, q);
    }
    function xm4(H, _, q) {
      lk.stat(H, ($, K) => {
        if ($) return q($);
        return ym4(_, K.atime, K.mtime, q);
      });
    }
    function mm4(H, _, q, $, K, O) {
      if (!_) return pm4(H.mode, q, $, K, O);
      return l_7(q, $, K, O);
    }
    function pm4(H, _, q, $, K) {
      lk.mkdir(q, (O) => {
        if (O) return K(O);
        l_7(_, q, $, (T) => {
          if (T) return K(T);
          return tL_(q, H, K);
        });
      });
    }
    function l_7(H, _, q, $) {
      lk.readdir(H, (K, O) => {
        if (K) return $(K);
        return i_7(O, H, _, q, $);
      });
    }
    function i_7(H, _, q, $, K) {
      let O = H.pop();
      if (!O) return K();
      return Bm4(H, O, _, q, $, K);
    }
    function Bm4(H, _, q, $, K, O) {
      let T = YlH.join(q, _),
        z = YlH.join($, _);
      DlH.checkPaths(T, z, "copy", K, (A, f) => {
        if (A) return O(A);
        let { destStat: w } = f;
        Sm4(w, T, z, K, (Y) => {
          if (Y) return O(Y);
          return i_7(H, q, $, K, O);
        });
      });
    }
    function gm4(H, _, q, $, K) {
      lk.readlink(_, (O, T) => {
        if (O) return K(O);
        if ($.dereference) T = YlH.resolve(process.cwd(), T);
        if (!H) return lk.symlink(T, q, K);
        else
          lk.readlink(q, (z, A) => {
            if (z) {
              if (z.code === "EINVAL" || z.code === "UNKNOWN") return lk.symlink(T, q, K);
              return K(z);
            }
            if ($.dereference) A = YlH.resolve(process.cwd(), A);
            if (DlH.isSrcSubdir(T, A)) return K(Error(`Cannot copy '${T}' to a subdirectory of itself, '${A}'.`));
            if (H.isDirectory() && DlH.isSrcSubdir(A, T)) return K(Error(`Cannot overwrite '${A}' with '${T}'.`));
            return dm4(T, q, K);
          });
      });
    }
    function dm4(H, _, q) {
      lk.unlink(_, ($) => {
        if ($) return q($);
        return lk.symlink(H, _, q);
      });
    }
    n_7.exports = Vm4;
  });

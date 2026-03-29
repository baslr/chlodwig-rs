  var Q87 = d(($l3, U87) => {
    var nk = TT(),
      GlH = require("path"),
      vB4 = _x().mkdirs,
      NB4 = V6H().pathExists,
      hB4 = yE6().utimesMillis,
      RlH = oOH();
    function yB4(H, _, q, $) {
      if (typeof q === "function" && !$) ($ = q), (q = {});
      else if (typeof q === "function") q = { filter: q };
      ($ = $ || function () {}),
        (q = q || {}),
        (q.clobber = "clobber" in q ? !!q.clobber : !0),
        (q.overwrite = "overwrite" in q ? !!q.overwrite : q.clobber),
        q.preserveTimestamps,
        RlH.checkPaths(H, _, "copy", q, (K, O) => {
          if (K) return $(K);
          let { srcStat: T, destStat: z } = O;
          RlH.checkParentPaths(H, T, _, "copy", (A) => {
            if (A) return $(A);
            if (q.filter) return g87(p87, z, H, _, q, $);
            return p87(z, H, _, q, $);
          });
        });
    }
    function p87(H, _, q, $, K) {
      let O = GlH.dirname(q);
      NB4(O, (T, z) => {
        if (T) return K(T);
        if (z) return Ok_(H, _, q, $, K);
        vB4(O, (A) => {
          if (A) return K(A);
          return Ok_(H, _, q, $, K);
        });
      });
    }
    function g87(H, _, q, $, K, O) {
      Promise.resolve(K.filter(q, $)).then(
        (T) => {
          if (T) return H(_, q, $, K, O);
          return O();
        },
        (T) => O(T),
      );
    }
    function VB4(H, _, q, $, K) {
      if ($.filter) return g87(Ok_, H, _, q, $, K);
      return Ok_(H, _, q, $, K);
    }
    function Ok_(H, _, q, $, K) {
      ($.dereference ? nk.stat : nk.lstat)(_, (T, z) => {
        if (T) return K(T);
        if (z.isDirectory()) return xB4(z, H, _, q, $, K);
        else if (z.isFile() || z.isCharacterDevice() || z.isBlockDevice()) return SB4(z, H, _, q, $, K);
        else if (z.isSymbolicLink()) return BB4(H, _, q, $, K);
        else if (z.isSocket()) return K(Error(`Cannot copy a socket file: ${_}`));
        else if (z.isFIFO()) return K(Error(`Cannot copy a FIFO pipe: ${_}`));
        return K(Error(`Unknown file: ${_}`));
      });
    }
    function SB4(H, _, q, $, K, O) {
      if (!_) return d87(H, q, $, K, O);
      return EB4(H, q, $, K, O);
    }
    function EB4(H, _, q, $, K) {
      if ($.overwrite)
        nk.unlink(q, (O) => {
          if (O) return K(O);
          return d87(H, _, q, $, K);
        });
      else if ($.errorOnExist) return K(Error(`'${q}' already exists`));
      else return K();
    }
    function d87(H, _, q, $, K) {
      nk.copyFile(_, q, (O) => {
        if (O) return K(O);
        if ($.preserveTimestamps) return CB4(H.mode, _, q, K);
        return Tk_(q, H.mode, K);
      });
    }
    function CB4(H, _, q, $) {
      if (bB4(H))
        return IB4(q, H, (K) => {
          if (K) return $(K);
          return B87(H, _, q, $);
        });
      return B87(H, _, q, $);
    }
    function bB4(H) {
      return (H & 128) === 0;
    }
    function IB4(H, _, q) {
      return Tk_(H, _ | 128, q);
    }
    function B87(H, _, q, $) {
      uB4(_, q, (K) => {
        if (K) return $(K);
        return Tk_(q, H, $);
      });
    }
    function Tk_(H, _, q) {
      return nk.chmod(H, _, q);
    }
    function uB4(H, _, q) {
      nk.stat(H, ($, K) => {
        if ($) return q($);
        return hB4(_, K.atime, K.mtime, q);
      });
    }
    function xB4(H, _, q, $, K, O) {
      if (!_) return mB4(H.mode, q, $, K, O);
      return c87(q, $, K, O);
    }
    function mB4(H, _, q, $, K) {
      nk.mkdir(q, (O) => {
        if (O) return K(O);
        c87(_, q, $, (T) => {
          if (T) return K(T);
          return Tk_(q, H, K);
        });
      });
    }
    function c87(H, _, q, $) {
      nk.readdir(H, (K, O) => {
        if (K) return $(K);
        return F87(O, H, _, q, $);
      });
    }
    function F87(H, _, q, $, K) {
      let O = H.pop();
      if (!O) return K();
      return pB4(H, O, _, q, $, K);
    }
    function pB4(H, _, q, $, K, O) {
      let T = GlH.join(q, _),
        z = GlH.join($, _);
      RlH.checkPaths(T, z, "copy", K, (A, f) => {
        if (A) return O(A);
        let { destStat: w } = f;
        VB4(w, T, z, K, (Y) => {
          if (Y) return O(Y);
          return F87(H, q, $, K, O);
        });
      });
    }
    function BB4(H, _, q, $, K) {
      nk.readlink(_, (O, T) => {
        if (O) return K(O);
        if ($.dereference) T = GlH.resolve(process.cwd(), T);
        if (!H) return nk.symlink(T, q, K);
        else
          nk.readlink(q, (z, A) => {
            if (z) {
              if (z.code === "EINVAL" || z.code === "UNKNOWN") return nk.symlink(T, q, K);
              return K(z);
            }
            if ($.dereference) A = GlH.resolve(process.cwd(), A);
            if (RlH.isSrcSubdir(T, A)) return K(Error(`Cannot copy '${T}' to a subdirectory of itself, '${A}'.`));
            if (H.isDirectory() && RlH.isSrcSubdir(A, T)) return K(Error(`Cannot overwrite '${A}' with '${T}'.`));
            return gB4(T, q, K);
          });
      });
    }
    function gB4(H, _, q) {
      nk.unlink(_, ($) => {
        if ($) return q($);
        return nk.symlink(H, _, q);
      });
    }
    U87.exports = yB4;
  });

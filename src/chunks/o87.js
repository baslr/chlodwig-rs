  var o87 = d((Kl3, r87) => {
    var JG = TT(),
      ZlH = require("path"),
      dB4 = _x().mkdirsSync,
      cB4 = yE6().utimesMillisSync,
      LlH = oOH();
    function FB4(H, _, q) {
      if (typeof q === "function") q = { filter: q };
      (q = q || {}),
        (q.clobber = "clobber" in q ? !!q.clobber : !0),
        (q.overwrite = "overwrite" in q ? !!q.overwrite : q.clobber),
        q.preserveTimestamps;
      let { srcStat: $, destStat: K } = LlH.checkPathsSync(H, _, "copy", q);
      return LlH.checkParentPathsSync(H, $, _, "copy"), UB4(K, H, _, q);
    }
    function UB4(H, _, q, $) {
      if ($.filter && !$.filter(_, q)) return;
      let K = ZlH.dirname(q);
      if (!JG.existsSync(K)) dB4(K);
      return l87(H, _, q, $);
    }
    function QB4(H, _, q, $) {
      if ($.filter && !$.filter(_, q)) return;
      return l87(H, _, q, $);
    }
    function l87(H, _, q, $) {
      let O = ($.dereference ? JG.statSync : JG.lstatSync)(_);
      if (O.isDirectory()) return sB4(O, H, _, q, $);
      else if (O.isFile() || O.isCharacterDevice() || O.isBlockDevice()) return lB4(O, H, _, q, $);
      else if (O.isSymbolicLink()) return Hg4(H, _, q, $);
      else if (O.isSocket()) throw Error(`Cannot copy a socket file: ${_}`);
      else if (O.isFIFO()) throw Error(`Cannot copy a FIFO pipe: ${_}`);
      throw Error(`Unknown file: ${_}`);
    }
    function lB4(H, _, q, $, K) {
      if (!_) return i87(H, q, $, K);
      return iB4(H, q, $, K);
    }
    function iB4(H, _, q, $) {
      if ($.overwrite) return JG.unlinkSync(q), i87(H, _, q, $);
      else if ($.errorOnExist) throw Error(`'${q}' already exists`);
    }
    function i87(H, _, q, $) {
      if ((JG.copyFileSync(_, q), $.preserveTimestamps)) nB4(H.mode, _, q);
      return SE6(q, H.mode);
    }
    function nB4(H, _, q) {
      if (rB4(H)) oB4(q, H);
      return aB4(_, q);
    }
    function rB4(H) {
      return (H & 128) === 0;
    }
    function oB4(H, _) {
      return SE6(H, _ | 128);
    }
    function SE6(H, _) {
      return JG.chmodSync(H, _);
    }
    function aB4(H, _) {
      let q = JG.statSync(H);
      return cB4(_, q.atime, q.mtime);
    }
    function sB4(H, _, q, $, K) {
      if (!_) return tB4(H.mode, q, $, K);
      return n87(q, $, K);
    }
    function tB4(H, _, q, $) {
      return JG.mkdirSync(q), n87(_, q, $), SE6(q, H);
    }
    function n87(H, _, q) {
      JG.readdirSync(H).forEach(($) => eB4($, H, _, q));
    }
    function eB4(H, _, q, $) {
      let K = ZlH.join(_, H),
        O = ZlH.join(q, H),
        { destStat: T } = LlH.checkPathsSync(K, O, "copy", $);
      return QB4(T, K, O, $);
    }
    function Hg4(H, _, q, $) {
      let K = JG.readlinkSync(_);
      if ($.dereference) K = ZlH.resolve(process.cwd(), K);
      if (!H) return JG.symlinkSync(K, q);
      else {
        let O;
        try {
          O = JG.readlinkSync(q);
        } catch (T) {
          if (T.code === "EINVAL" || T.code === "UNKNOWN") return JG.symlinkSync(K, q);
          throw T;
        }
        if ($.dereference) O = ZlH.resolve(process.cwd(), O);
        if (LlH.isSrcSubdir(K, O)) throw Error(`Cannot copy '${K}' to a subdirectory of itself, '${O}'.`);
        if (JG.statSync(q).isDirectory() && LlH.isSrcSubdir(O, K)) throw Error(`Cannot overwrite '${O}' with '${K}'.`);
        return _g4(K, q);
      }
    }
    function _g4(H, _) {
      return JG.unlinkSync(_), JG.symlinkSync(H, _);
    }
    r87.exports = FB4;
  });

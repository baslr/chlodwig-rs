  var e_7 = d((yQ3, t_7) => {
    var MG = TT(),
      jlH = require("path"),
      cm4 = eu().mkdirsSync,
      Fm4 = jE6().utimesMillisSync,
      MlH = nOH();
    function Um4(H, _, q) {
      if (typeof q === "function") q = { filter: q };
      (q = q || {}),
        (q.clobber = "clobber" in q ? !!q.clobber : !0),
        (q.overwrite = "overwrite" in q ? !!q.overwrite : q.clobber),
        q.preserveTimestamps;
      let { srcStat: $, destStat: K } = MlH.checkPathsSync(H, _, "copy", q);
      return MlH.checkParentPathsSync(H, $, _, "copy"), Qm4(K, H, _, q);
    }
    function Qm4(H, _, q, $) {
      if ($.filter && !$.filter(_, q)) return;
      let K = jlH.dirname(q);
      if (!MG.existsSync(K)) cm4(K);
      return o_7(H, _, q, $);
    }
    function lm4(H, _, q, $) {
      if ($.filter && !$.filter(_, q)) return;
      return o_7(H, _, q, $);
    }
    function o_7(H, _, q, $) {
      let O = ($.dereference ? MG.statSync : MG.lstatSync)(_);
      if (O.isDirectory()) return tm4(O, H, _, q, $);
      else if (O.isFile() || O.isCharacterDevice() || O.isBlockDevice()) return im4(O, H, _, q, $);
      else if (O.isSymbolicLink()) return _p4(H, _, q, $);
      else if (O.isSocket()) throw Error(`Cannot copy a socket file: ${_}`);
      else if (O.isFIFO()) throw Error(`Cannot copy a FIFO pipe: ${_}`);
      throw Error(`Unknown file: ${_}`);
    }
    function im4(H, _, q, $, K) {
      if (!_) return a_7(H, q, $, K);
      return nm4(H, q, $, K);
    }
    function nm4(H, _, q, $) {
      if ($.overwrite) return MG.unlinkSync(q), a_7(H, _, q, $);
      else if ($.errorOnExist) throw Error(`'${q}' already exists`);
    }
    function a_7(H, _, q, $) {
      if ((MG.copyFileSync(_, q), $.preserveTimestamps)) rm4(H.mode, _, q);
      return JE6(q, H.mode);
    }
    function rm4(H, _, q) {
      if (om4(H)) am4(q, H);
      return sm4(_, q);
    }
    function om4(H) {
      return (H & 128) === 0;
    }
    function am4(H, _) {
      return JE6(H, _ | 128);
    }
    function JE6(H, _) {
      return MG.chmodSync(H, _);
    }
    function sm4(H, _) {
      let q = MG.statSync(H);
      return Fm4(_, q.atime, q.mtime);
    }
    function tm4(H, _, q, $, K) {
      if (!_) return em4(H.mode, q, $, K);
      return s_7(q, $, K);
    }
    function em4(H, _, q, $) {
      return MG.mkdirSync(q), s_7(_, q, $), JE6(q, H);
    }
    function s_7(H, _, q) {
      MG.readdirSync(H).forEach(($) => Hp4($, H, _, q));
    }
    function Hp4(H, _, q, $) {
      let K = jlH.join(_, H),
        O = jlH.join(q, H),
        { destStat: T } = MlH.checkPathsSync(K, O, "copy", $);
      return lm4(T, K, O, $);
    }
    function _p4(H, _, q, $) {
      let K = MG.readlinkSync(_);
      if ($.dereference) K = jlH.resolve(process.cwd(), K);
      if (!H) return MG.symlinkSync(K, q);
      else {
        let O;
        try {
          O = MG.readlinkSync(q);
        } catch (T) {
          if (T.code === "EINVAL" || T.code === "UNKNOWN") return MG.symlinkSync(K, q);
          throw T;
        }
        if ($.dereference) O = jlH.resolve(process.cwd(), O);
        if (MlH.isSrcSubdir(K, O)) throw Error(`Cannot copy '${K}' to a subdirectory of itself, '${O}'.`);
        if (MG.statSync(q).isDirectory() && MlH.isSrcSubdir(O, K)) throw Error(`Cannot overwrite '${O}' with '${K}'.`);
        return qp4(K, q);
      }
    }
    function qp4(H, _) {
      return MG.unlinkSync(_), MG.symlinkSync(H, _);
    }
    t_7.exports = Um4;
  });

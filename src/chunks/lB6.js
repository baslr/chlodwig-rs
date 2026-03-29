  var lB6 = d((QB6) => {
    var KqH = NS_();
    function Nf1(H) {
      var _ = KqH.spaceIndex(H),
        q;
      if (_ === -1) q = H.slice(1, -1);
      else q = H.slice(1, _ + 1);
      if (((q = KqH.trim(q).toLowerCase()), q.slice(0, 1) === "/")) q = q.slice(1);
      if (q.slice(-1) === "/") q = q.slice(0, -1);
      return q;
    }
    function hf1(H) {
      return H.slice(0, 2) === "</";
    }
    function yf1(H, _, q) {
      var $ = "",
        K = 0,
        O = !1,
        T = !1,
        z = 0,
        A = H.length,
        f = "",
        w = "";
      H: for (z = 0; z < A; z++) {
        var Y = H.charAt(z);
        if (O === !1) {
          if (Y === "<") {
            O = z;
            continue;
          }
        } else if (T === !1) {
          if (Y === "<") {
            ($ += q(H.slice(K, z))), (O = z), (K = z);
            continue;
          }
          if (Y === ">" || z === A - 1) {
            ($ += q(H.slice(K, O))),
              (w = H.slice(O, z + 1)),
              (f = Nf1(w)),
              ($ += _(O, $.length, f, w, hf1(w))),
              (K = z + 1),
              (O = !1);
            continue;
          }
          if (Y === '"' || Y === "'") {
            var D = 1,
              j = H.charAt(z - D);
            while (j.trim() === "" || j === "=") {
              if (j === "=") {
                T = Y;
                continue H;
              }
              j = H.charAt(z - ++D);
            }
          }
        } else if (Y === T) {
          T = !1;
          continue;
        }
      }
      if (K < A) $ += q(H.substr(K));
      return $;
    }
    var Vf1 = /[^a-zA-Z0-9\\_:.-]/gim;
    function Sf1(H, _) {
      var q = 0,
        $ = 0,
        K = [],
        O = !1,
        T = H.length;
      function z(D, j) {
        if (((D = KqH.trim(D)), (D = D.replace(Vf1, "").toLowerCase()), D.length < 1)) return;
        var M = _(D, j || "");
        if (M) K.push(M);
      }
      for (var A = 0; A < T; A++) {
        var f = H.charAt(A),
          w,
          Y;
        if (O === !1 && f === "=") {
          (O = H.slice(q, A)), (q = A + 1), ($ = H.charAt(q) === '"' || H.charAt(q) === "'" ? q : Cf1(H, A + 1));
          continue;
        }
        if (O !== !1) {
          if (A === $)
            if (((Y = H.indexOf(f, A + 1)), Y === -1)) break;
            else {
              (w = KqH.trim(H.slice($ + 1, Y))), z(O, w), (O = !1), (A = Y), (q = A + 1);
              continue;
            }
        }
        if (/\s|\n|\t/.test(f))
          if (((H = H.replace(/\s|\n|\t/g, " ")), O === !1))
            if (((Y = Ef1(H, A)), Y === -1)) {
              (w = KqH.trim(H.slice(q, A))), z(w), (O = !1), (q = A + 1);
              continue;
            } else {
              A = Y - 1;
              continue;
            }
          else if (((Y = bf1(H, A - 1)), Y === -1)) {
            (w = KqH.trim(H.slice(q, A))), (w = Zk7(w)), z(O, w), (O = !1), (q = A + 1);
            continue;
          } else continue;
      }
      if (q < H.length)
        if (O === !1) z(H.slice(q));
        else z(O, Zk7(KqH.trim(H.slice(q))));
      return KqH.trim(K.join(" "));
    }
    function Ef1(H, _) {
      for (; _ < H.length; _++) {
        var q = H[_];
        if (q === " ") continue;
        if (q === "=") return _;
        return -1;
      }
    }
    function Cf1(H, _) {
      for (; _ < H.length; _++) {
        var q = H[_];
        if (q === " ") continue;
        if (q === "'" || q === '"') return _;
        return -1;
      }
    }
    function bf1(H, _) {
      for (; _ > 0; _--) {
        var q = H[_];
        if (q === " ") continue;
        if (q === "=") return _;
        return -1;
      }
    }
    function If1(H) {
      if ((H[0] === '"' && H[H.length - 1] === '"') || (H[0] === "'" && H[H.length - 1] === "'")) return !0;
      else return !1;
    }
    function Zk7(H) {
      if (If1(H)) return H.substr(1, H.length - 2);
      else return H;
    }
    QB6.parseTag = yf1;
    QB6.parseAttr = Sf1;
  });

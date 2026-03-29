    iH();
    LqH();
    I8();
    h_();
    jh();
    jEH();
    BC9();
    (gC9 = u(aH(), 1)),
      (Qn_ = require("path")),
      (Dq_ = u(PH(), 1)),
      (tJK = {
        getConfig: (H) => {
          let _;
          try {
            _ = N0(H.file_path);
          } catch (q) {
            if (!k8(q)) throw q;
            _ = "";
          }
          return Fn_(H.file_path, _, H.content, !1);
        },
        applyChanges: (H, _) => {
          let q = _[0];
          if (q) return { ...H, content: q.new_string };
          return H;
        },
      });

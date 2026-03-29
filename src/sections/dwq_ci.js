    oD_();
    lpH();
    j26();
    aD_();
    rpH();
    (gPH = u(require("http"))),
      (dPH = u(require("https"))),
      (sD_ = u(require("zlib"))),
      (mwq = require("stream")),
      (ps$ = {});
    M26 = class M26 extends mwq.Transform {
      _transform(H, _, q) {
        this.push(H), (this.loadedBytes += H.length);
        try {
          this.progressCallback({ loadedBytes: this.loadedBytes }), q();
        } catch ($) {
          q($);
        }
      }
      constructor(H) {
        super();
        (this.loadedBytes = 0), (this.progressCallback = H);
      }
    };

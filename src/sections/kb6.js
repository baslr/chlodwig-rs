    o47 = class o47 extends Xn {
      constructor() {
        super(...arguments);
        this.tokenize = dQ4;
      }
      equals(H, _, q) {
        if (q.ignoreWhitespace) {
          if (
            !q.newlineIsToken ||
            !H.includes(`
`)
          )
            H = H.trim();
          if (
            !q.newlineIsToken ||
            !_.includes(`
`)
          )
            _ = _.trim();
        } else if (q.ignoreNewlineAtEof && !q.newlineIsToken) {
          if (
            H.endsWith(`
`)
          )
            H = H.slice(0, -1);
          if (
            _.endsWith(`
`)
          )
            _ = _.slice(0, -1);
        }
        return super.equals(H, _, q);
      }
    };
    a47 = new o47();

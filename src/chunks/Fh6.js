  var Fh6 = d((onq) => {
    var rnq = R3(),
      aV4 = lUH(),
      sV4 = { "!": "%21", ",": "%2C", "[": "%5B", "]": "%5D", "{": "%7B", "}": "%7D" },
      tV4 = (H) => H.replace(/[!,[\]{}]/g, (_) => sV4[_]);
    class ZE {
      constructor(H, _) {
        (this.docStart = null),
          (this.docEnd = !1),
          (this.yaml = Object.assign({}, ZE.defaultYaml, H)),
          (this.tags = Object.assign({}, ZE.defaultTags, _));
      }
      clone() {
        let H = new ZE(this.yaml, this.tags);
        return (H.docStart = this.docStart), H;
      }
      atDocument() {
        let H = new ZE(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = !0;
            break;
          case "1.2":
            (this.atNextDocument = !1),
              (this.yaml = { explicit: ZE.defaultYaml.explicit, version: "1.2" }),
              (this.tags = Object.assign({}, ZE.defaultTags));
            break;
        }
        return H;
      }
      add(H, _) {
        if (this.atNextDocument)
          (this.yaml = { explicit: ZE.defaultYaml.explicit, version: "1.1" }),
            (this.tags = Object.assign({}, ZE.defaultTags)),
            (this.atNextDocument = !1);
        let q = H.trim().split(/[ \t]+/),
          $ = q.shift();
        switch ($) {
          case "%TAG": {
            if (q.length !== 2) {
              if ((_(0, "%TAG directive should contain exactly two parts"), q.length < 2)) return !1;
            }
            let [K, O] = q;
            return (this.tags[K] = O), !0;
          }
          case "%YAML": {
            if (((this.yaml.explicit = !0), q.length !== 1))
              return _(0, "%YAML directive should contain exactly one part"), !1;
            let [K] = q;
            if (K === "1.1" || K === "1.2") return (this.yaml.version = K), !0;
            else {
              let O = /^\d+\.\d+$/.test(K);
              return _(6, `Unsupported YAML version ${K}`, O), !1;
            }
          }
          default:
            return _(0, `Unknown directive ${$}`, !0), !1;
        }
      }
      tagName(H, _) {
        if (H === "!") return "!";
        if (H[0] !== "!") return _(`Not a valid tag: ${H}`), null;
        if (H[1] === "<") {
          let O = H.slice(2, -1);
          if (O === "!" || O === "!!") return _(`Verbatim tags aren't resolved, so ${H} is invalid.`), null;
          if (H[H.length - 1] !== ">") _("Verbatim tags must end with a >");
          return O;
        }
        let [, q, $] = H.match(/^(.*!)([^!]*)$/s);
        if (!$) _(`The ${H} tag has no suffix`);
        let K = this.tags[q];
        if (K)
          try {
            return K + decodeURIComponent($);
          } catch (O) {
            return _(String(O)), null;
          }
        if (q === "!") return H;
        return _(`Could not resolve tag: ${H}`), null;
      }
      tagString(H) {
        for (let [_, q] of Object.entries(this.tags)) if (H.startsWith(q)) return _ + tV4(H.substring(q.length));
        return H[0] === "!" ? H : `!<${H}>`;
      }
      toString(H) {
        let _ = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [],
          q = Object.entries(this.tags),
          $;
        if (H && q.length > 0 && rnq.isNode(H.contents)) {
          let K = {};
          aV4.visit(H.contents, (O, T) => {
            if (rnq.isNode(T) && T.tag) K[T.tag] = !0;
          }),
            ($ = Object.keys(K));
        } else $ = [];
        for (let [K, O] of q) {
          if (K === "!!" && O === "tag:yaml.org,2002:") continue;
          if (!H || $.some((T) => T.startsWith(O))) _.push(`%TAG ${K} ${O}`);
        }
        return _.join(`
`);
      }
    }
    ZE.defaultYaml = { explicit: !1, version: "1.2" };
    ZE.defaultTags = { "!!": "tag:yaml.org,2002:" };
    onq.Directives = ZE;
  });

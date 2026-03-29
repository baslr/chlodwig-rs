  var H18 = d((qV9) => {
    var { humanReadableArgName: v2K } = qn_();
    class _V9 {
      constructor() {
        (this.helpWidth = void 0), (this.sortSubcommands = !1), (this.sortOptions = !1), (this.showGlobalOptions = !1);
      }
      visibleCommands(H) {
        let _ = H.commands.filter(($) => !$._hidden),
          q = H._getHelpCommand();
        if (q && !q._hidden) _.push(q);
        if (this.sortSubcommands)
          _.sort(($, K) => {
            return $.name().localeCompare(K.name());
          });
        return _;
      }
      compareOptions(H, _) {
        let q = ($) => {
          return $.short ? $.short.replace(/^-/, "") : $.long.replace(/^--/, "");
        };
        return q(H).localeCompare(q(_));
      }
      visibleOptions(H) {
        let _ = H.options.filter(($) => !$.hidden),
          q = H._getHelpOption();
        if (q && !q.hidden) {
          let $ = q.short && H._findOption(q.short),
            K = q.long && H._findOption(q.long);
          if (!$ && !K) _.push(q);
          else if (q.long && !K) _.push(H.createOption(q.long, q.description));
          else if (q.short && !$) _.push(H.createOption(q.short, q.description));
        }
        if (this.sortOptions) _.sort(this.compareOptions);
        return _;
      }
      visibleGlobalOptions(H) {
        if (!this.showGlobalOptions) return [];
        let _ = [];
        for (let q = H.parent; q; q = q.parent) {
          let $ = q.options.filter((K) => !K.hidden);
          _.push(...$);
        }
        if (this.sortOptions) _.sort(this.compareOptions);
        return _;
      }
      visibleArguments(H) {
        if (H._argsDescription)
          H.registeredArguments.forEach((_) => {
            _.description = _.description || H._argsDescription[_.name()] || "";
          });
        if (H.registeredArguments.find((_) => _.description)) return H.registeredArguments;
        return [];
      }
      subcommandTerm(H) {
        let _ = H.registeredArguments.map((q) => v2K(q)).join(" ");
        return (
          H._name +
          (H._aliases[0] ? "|" + H._aliases[0] : "") +
          (H.options.length ? " [options]" : "") +
          (_ ? " " + _ : "")
        );
      }
      optionTerm(H) {
        return H.flags;
      }
      argumentTerm(H) {
        return H.name();
      }
      longestSubcommandTermLength(H, _) {
        return _.visibleCommands(H).reduce((q, $) => {
          return Math.max(q, _.subcommandTerm($).length);
        }, 0);
      }
      longestOptionTermLength(H, _) {
        return _.visibleOptions(H).reduce((q, $) => {
          return Math.max(q, _.optionTerm($).length);
        }, 0);
      }
      longestGlobalOptionTermLength(H, _) {
        return _.visibleGlobalOptions(H).reduce((q, $) => {
          return Math.max(q, _.optionTerm($).length);
        }, 0);
      }
      longestArgumentTermLength(H, _) {
        return _.visibleArguments(H).reduce((q, $) => {
          return Math.max(q, _.argumentTerm($).length);
        }, 0);
      }
      commandUsage(H) {
        let _ = H._name;
        if (H._aliases[0]) _ = _ + "|" + H._aliases[0];
        let q = "";
        for (let $ = H.parent; $; $ = $.parent) q = $.name() + " " + q;
        return q + _ + " " + H.usage();
      }
      commandDescription(H) {
        return H.description();
      }
      subcommandDescription(H) {
        return H.summary() || H.description();
      }
      optionDescription(H) {
        let _ = [];
        if (H.argChoices) _.push(`choices: ${H.argChoices.map((q) => JSON.stringify(q)).join(", ")}`);
        if (H.defaultValue !== void 0) {
          if (H.required || H.optional || (H.isBoolean() && typeof H.defaultValue === "boolean"))
            _.push(`default: ${H.defaultValueDescription || JSON.stringify(H.defaultValue)}`);
        }
        if (H.presetArg !== void 0 && H.optional) _.push(`preset: ${JSON.stringify(H.presetArg)}`);
        if (H.envVar !== void 0) _.push(`env: ${H.envVar}`);
        if (_.length > 0) return `${H.description} (${_.join(", ")})`;
        return H.description;
      }
      argumentDescription(H) {
        let _ = [];
        if (H.argChoices) _.push(`choices: ${H.argChoices.map((q) => JSON.stringify(q)).join(", ")}`);
        if (H.defaultValue !== void 0)
          _.push(`default: ${H.defaultValueDescription || JSON.stringify(H.defaultValue)}`);
        if (_.length > 0) {
          let q = `(${_.join(", ")})`;
          if (H.description) return `${H.description} ${q}`;
          return q;
        }
        return H.description;
      }
      formatHelp(H, _) {
        let q = _.padWidth(H, _),
          $ = _.helpWidth || 80,
          K = 2,
          O = 2;
        function T(j, M) {
          if (M) {
            let J = `${j.padEnd(q + 2)}${M}`;
            return _.wrap(J, $ - 2, q + 2);
          }
          return j;
        }
        function z(j) {
          return j
            .join(`
`)
            .replace(/^/gm, " ".repeat(2));
        }
        let A = [`Usage: ${_.commandUsage(H)}`, ""],
          f = _.commandDescription(H);
        if (f.length > 0) A = A.concat([_.wrap(f, $, 0), ""]);
        let w = _.visibleArguments(H).map((j) => {
          return T(_.argumentTerm(j), _.argumentDescription(j));
        });
        if (w.length > 0) A = A.concat(["Arguments:", z(w), ""]);
        let Y = _.visibleOptions(H).map((j) => {
          return T(_.optionTerm(j), _.optionDescription(j));
        });
        if (Y.length > 0) A = A.concat(["Options:", z(Y), ""]);
        if (this.showGlobalOptions) {
          let j = _.visibleGlobalOptions(H).map((M) => {
            return T(_.optionTerm(M), _.optionDescription(M));
          });
          if (j.length > 0) A = A.concat(["Global Options:", z(j), ""]);
        }
        let D = _.visibleCommands(H).map((j) => {
          return T(_.subcommandTerm(j), _.subcommandDescription(j));
        });
        if (D.length > 0) A = A.concat(["Commands:", z(D), ""]);
        return A.join(`
`);
      }
      padWidth(H, _) {
        return Math.max(
          _.longestOptionTermLength(H, _),
          _.longestGlobalOptionTermLength(H, _),
          _.longestSubcommandTermLength(H, _),
          _.longestArgumentTermLength(H, _),
        );
      }
      wrap(H, _, q, $ = 40) {
        let O = new RegExp(`[\\n][${" \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF"}]+`);
        if (H.match(O)) return H;
        let T = _ - q;
        if (T < $) return H;
        let z = H.slice(0, q),
          A = H.slice(q).replace(
            `\r
`,
            `
`,
          ),
          f = " ".repeat(q),
          Y = `\\s${"\u200B"}`,
          D = new RegExp(
            `
|.{1,${T - 1}}([${Y}]|$)|[^${Y}]+?([${Y}]|$)`,
            "g",
          ),
          j = A.match(D) || [];
        return (
          z +
          j
            .map((M, J) => {
              if (
                M ===
                `
`
              )
                return "";
              return (J > 0 ? f : "") + M.trimEnd();
            })
            .join(`
`)
        );
      }
    }
    qV9.Help = _V9;
  });

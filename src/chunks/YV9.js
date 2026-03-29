  var YV9 = d((wV9) => {
    var E2K = require("events").EventEmitter,
      $18 = require("child_process"),
      ma = require("path"),
      K18 = require("fs"),
      _2 = require("process"),
      { Argument: C2K, humanReadableArgName: b2K } = qn_(),
      { CommanderError: O18 } = i8_(),
      { Help: I2K } = H18(),
      { Option: zV9, DualOptions: u2K } = q18(),
      { suggestSimilar: AV9 } = TV9();
    class T18 extends E2K {
      constructor(H) {
        super();
        (this.commands = []),
          (this.options = []),
          (this.parent = null),
          (this._allowUnknownOption = !1),
          (this._allowExcessArguments = !0),
          (this.registeredArguments = []),
          (this._args = this.registeredArguments),
          (this.args = []),
          (this.rawArgs = []),
          (this.processedArgs = []),
          (this._scriptPath = null),
          (this._name = H || ""),
          (this._optionValues = {}),
          (this._optionValueSources = {}),
          (this._storeOptionsAsProperties = !1),
          (this._actionHandler = null),
          (this._executableHandler = !1),
          (this._executableFile = null),
          (this._executableDir = null),
          (this._defaultCommandName = null),
          (this._exitCallback = null),
          (this._aliases = []),
          (this._combineFlagAndOptionalValue = !0),
          (this._description = ""),
          (this._summary = ""),
          (this._argsDescription = void 0),
          (this._enablePositionalOptions = !1),
          (this._passThroughOptions = !1),
          (this._lifeCycleHooks = {}),
          (this._showHelpAfterError = !1),
          (this._showSuggestionAfterError = !0),
          (this._outputConfiguration = {
            writeOut: (_) => _2.stdout.write(_),
            writeErr: (_) => _2.stderr.write(_),
            getOutHelpWidth: () => (_2.stdout.isTTY ? _2.stdout.columns : void 0),
            getErrHelpWidth: () => (_2.stderr.isTTY ? _2.stderr.columns : void 0),
            outputError: (_, q) => q(_),
          }),
          (this._hidden = !1),
          (this._helpOption = void 0),
          (this._addImplicitHelpCommand = void 0),
          (this._helpCommand = void 0),
          (this._helpConfiguration = {});
      }
      copyInheritedSettings(H) {
        return (
          (this._outputConfiguration = H._outputConfiguration),
          (this._helpOption = H._helpOption),
          (this._helpCommand = H._helpCommand),
          (this._helpConfiguration = H._helpConfiguration),
          (this._exitCallback = H._exitCallback),
          (this._storeOptionsAsProperties = H._storeOptionsAsProperties),
          (this._combineFlagAndOptionalValue = H._combineFlagAndOptionalValue),
          (this._allowExcessArguments = H._allowExcessArguments),
          (this._enablePositionalOptions = H._enablePositionalOptions),
          (this._showHelpAfterError = H._showHelpAfterError),
          (this._showSuggestionAfterError = H._showSuggestionAfterError),
          this
        );
      }
      _getCommandAndAncestors() {
        let H = [];
        for (let _ = this; _; _ = _.parent) H.push(_);
        return H;
      }
      command(H, _, q) {
        let $ = _,
          K = q;
        if (typeof $ === "object" && $ !== null) (K = $), ($ = null);
        K = K || {};
        let [, O, T] = H.match(/([^ ]+) *(.*)/),
          z = this.createCommand(O);
        if ($) z.description($), (z._executableHandler = !0);
        if (K.isDefault) this._defaultCommandName = z._name;
        if (((z._hidden = !!(K.noHelp || K.hidden)), (z._executableFile = K.executableFile || null), T)) z.arguments(T);
        if ((this._registerCommand(z), (z.parent = this), z.copyInheritedSettings(this), $)) return this;
        return z;
      }
      createCommand(H) {
        return new T18(H);
      }
      createHelp() {
        return Object.assign(new I2K(), this.configureHelp());
      }
      configureHelp(H) {
        if (H === void 0) return this._helpConfiguration;
        return (this._helpConfiguration = H), this;
      }
      configureOutput(H) {
        if (H === void 0) return this._outputConfiguration;
        return Object.assign(this._outputConfiguration, H), this;
      }
      showHelpAfterError(H = !0) {
        if (typeof H !== "string") H = !!H;
        return (this._showHelpAfterError = H), this;
      }
      showSuggestionAfterError(H = !0) {
        return (this._showSuggestionAfterError = !!H), this;
      }
      addCommand(H, _) {
        if (!H._name)
          throw Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        if (((_ = _ || {}), _.isDefault)) this._defaultCommandName = H._name;
        if (_.noHelp || _.hidden) H._hidden = !0;
        return this._registerCommand(H), (H.parent = this), H._checkForBrokenPassThrough(), this;
      }
      createArgument(H, _) {
        return new C2K(H, _);
      }
      argument(H, _, q, $) {
        let K = this.createArgument(H, _);
        if (typeof q === "function") K.default($).argParser(q);
        else K.default(q);
        return this.addArgument(K), this;
      }
      arguments(H) {
        return (
          H.trim()
            .split(/ +/)
            .forEach((_) => {
              this.argument(_);
            }),
          this
        );
      }
      addArgument(H) {
        let _ = this.registeredArguments.slice(-1)[0];
        if (_ && _.variadic) throw Error(`only the last argument can be variadic '${_.name()}'`);
        if (H.required && H.defaultValue !== void 0 && H.parseArg === void 0)
          throw Error(`a default value for a required argument is never used: '${H.name()}'`);
        return this.registeredArguments.push(H), this;
      }
      helpCommand(H, _) {
        if (typeof H === "boolean") return (this._addImplicitHelpCommand = H), this;
        H = H ?? "help [command]";
        let [, q, $] = H.match(/([^ ]+) *(.*)/),
          K = _ ?? "display help for command",
          O = this.createCommand(q);
        if ((O.helpOption(!1), $)) O.arguments($);
        if (K) O.description(K);
        return (this._addImplicitHelpCommand = !0), (this._helpCommand = O), this;
      }
      addHelpCommand(H, _) {
        if (typeof H !== "object") return this.helpCommand(H, _), this;
        return (this._addImplicitHelpCommand = !0), (this._helpCommand = H), this;
      }
      _getHelpCommand() {
        if (
          this._addImplicitHelpCommand ??
          (this.commands.length && !this._actionHandler && !this._findCommand("help"))
        ) {
          if (this._helpCommand === void 0) this.helpCommand(void 0, void 0);
          return this._helpCommand;
        }
        return null;
      }
      hook(H, _) {
        let q = ["preSubcommand", "preAction", "postAction"];
        if (!q.includes(H))
          throw Error(`Unexpected value for event passed to hook : '${H}'.
Expecting one of '${q.join("', '")}'`);
        if (this._lifeCycleHooks[H]) this._lifeCycleHooks[H].push(_);
        else this._lifeCycleHooks[H] = [_];
        return this;
      }
      exitOverride(H) {
        if (H) this._exitCallback = H;
        else
          this._exitCallback = (_) => {
            if (_.code !== "commander.executeSubCommandAsync") throw _;
          };
        return this;
      }
      _exit(H, _, q) {
        if (this._exitCallback) this._exitCallback(new O18(H, _, q));
        _2.exit(H);
      }
      action(H) {
        let _ = (q) => {
          let $ = this.registeredArguments.length,
            K = q.slice(0, $);
          if (this._storeOptionsAsProperties) K[$] = this;
          else K[$] = this.opts();
          return K.push(this), H.apply(this, K);
        };
        return (this._actionHandler = _), this;
      }
      createOption(H, _) {
        return new zV9(H, _);
      }
      _callParseArg(H, _, q, $) {
        try {
          return H.parseArg(_, q);
        } catch (K) {
          if (K.code === "commander.invalidArgument") {
            let O = `${$} ${K.message}`;
            this.error(O, { exitCode: K.exitCode, code: K.code });
          }
          throw K;
        }
      }
      _registerOption(H) {
        let _ = (H.short && this._findOption(H.short)) || (H.long && this._findOption(H.long));
        if (_) {
          let q = H.long && this._findOption(H.long) ? H.long : H.short;
          throw Error(`Cannot add option '${H.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${q}'
-  already used by option '${_.flags}'`);
        }
        this.options.push(H);
      }
      _registerCommand(H) {
        let _ = ($) => {
            return [$.name()].concat($.aliases());
          },
          q = _(H).find(($) => this._findCommand($));
        if (q) {
          let $ = _(this._findCommand(q)).join("|"),
            K = _(H).join("|");
          throw Error(`cannot add command '${K}' as already have command '${$}'`);
        }
        this.commands.push(H);
      }
      addOption(H) {
        this._registerOption(H);
        let _ = H.name(),
          q = H.attributeName();
        if (H.negate) {
          let K = H.long.replace(/^--no-/, "--");
          if (!this._findOption(K))
            this.setOptionValueWithSource(q, H.defaultValue === void 0 ? !0 : H.defaultValue, "default");
        } else if (H.defaultValue !== void 0) this.setOptionValueWithSource(q, H.defaultValue, "default");
        let $ = (K, O, T) => {
          if (K == null && H.presetArg !== void 0) K = H.presetArg;
          let z = this.getOptionValue(q);
          if (K !== null && H.parseArg) K = this._callParseArg(H, K, z, O);
          else if (K !== null && H.variadic) K = H._concatValue(K, z);
          if (K == null)
            if (H.negate) K = !1;
            else if (H.isBoolean() || H.optional) K = !0;
            else K = "";
          this.setOptionValueWithSource(q, K, T);
        };
        if (
          (this.on("option:" + _, (K) => {
            let O = `error: option '${H.flags}' argument '${K}' is invalid.`;
            $(K, O, "cli");
          }),
          H.envVar)
        )
          this.on("optionEnv:" + _, (K) => {
            let O = `error: option '${H.flags}' value '${K}' from env '${H.envVar}' is invalid.`;
            $(K, O, "env");
          });
        return this;
      }
      _optionEx(H, _, q, $, K) {
        if (typeof _ === "object" && _ instanceof zV9)
          throw Error("To add an Option object use addOption() instead of option() or requiredOption()");
        let O = this.createOption(_, q);
        if ((O.makeOptionMandatory(!!H.mandatory), typeof $ === "function")) O.default(K).argParser($);
        else if ($ instanceof RegExp) {
          let T = $;
          ($ = (z, A) => {
            let f = T.exec(z);
            return f ? f[0] : A;
          }),
            O.default(K).argParser($);
        } else O.default($);
        return this.addOption(O);
      }
      option(H, _, q, $) {
        return this._optionEx({}, H, _, q, $);
      }
      requiredOption(H, _, q, $) {
        return this._optionEx({ mandatory: !0 }, H, _, q, $);
      }
      combineFlagAndOptionalValue(H = !0) {
        return (this._combineFlagAndOptionalValue = !!H), this;
      }
      allowUnknownOption(H = !0) {
        return (this._allowUnknownOption = !!H), this;
      }
      allowExcessArguments(H = !0) {
        return (this._allowExcessArguments = !!H), this;
      }
      enablePositionalOptions(H = !0) {
        return (this._enablePositionalOptions = !!H), this;
      }
      passThroughOptions(H = !0) {
        return (this._passThroughOptions = !!H), this._checkForBrokenPassThrough(), this;
      }
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions)
          throw Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`,
          );
      }
      storeOptionsAsProperties(H = !0) {
        if (this.options.length) throw Error("call .storeOptionsAsProperties() before adding options");
        if (Object.keys(this._optionValues).length)
          throw Error("call .storeOptionsAsProperties() before setting option values");
        return (this._storeOptionsAsProperties = !!H), this;
      }
      getOptionValue(H) {
        if (this._storeOptionsAsProperties) return this[H];
        return this._optionValues[H];
      }
      setOptionValue(H, _) {
        return this.setOptionValueWithSource(H, _, void 0);
      }
      setOptionValueWithSource(H, _, q) {
        if (this._storeOptionsAsProperties) this[H] = _;
        else this._optionValues[H] = _;
        return (this._optionValueSources[H] = q), this;
      }
      getOptionValueSource(H) {
        return this._optionValueSources[H];
      }
      getOptionValueSourceWithGlobals(H) {
        let _;
        return (
          this._getCommandAndAncestors().forEach((q) => {
            if (q.getOptionValueSource(H) !== void 0) _ = q.getOptionValueSource(H);
          }),
          _
        );
      }
      _prepareUserArgs(H, _) {
        if (H !== void 0 && !Array.isArray(H)) throw Error("first parameter to parse must be array or undefined");
        if (((_ = _ || {}), H === void 0 && _.from === void 0)) {
          if (_2.versions?.electron) _.from = "electron";
          let $ = _2.execArgv ?? [];
          if ($.includes("-e") || $.includes("--eval") || $.includes("-p") || $.includes("--print")) _.from = "eval";
        }
        if (H === void 0) H = _2.argv;
        this.rawArgs = H.slice();
        let q;
        switch (_.from) {
          case void 0:
          case "node":
            (this._scriptPath = H[1]), (q = H.slice(2));
            break;
          case "electron":
            if (_2.defaultApp) (this._scriptPath = H[1]), (q = H.slice(2));
            else q = H.slice(1);
            break;
          case "user":
            q = H.slice(0);
            break;
          case "eval":
            q = H.slice(1);
            break;
          default:
            throw Error(`unexpected parse option { from: '${_.from}' }`);
        }
        if (!this._name && this._scriptPath) this.nameFromFilename(this._scriptPath);
        return (this._name = this._name || "program"), q;
      }
      parse(H, _) {
        let q = this._prepareUserArgs(H, _);
        return this._parseCommand([], q), this;
      }
      async parseAsync(H, _) {
        let q = this._prepareUserArgs(H, _);
        return await this._parseCommand([], q), this;
      }
      _executeSubCommand(H, _) {
        _ = _.slice();
        let q = !1,
          $ = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function K(f, w) {
          let Y = ma.resolve(f, w);
          if (K18.existsSync(Y)) return Y;
          if ($.includes(ma.extname(w))) return;
          let D = $.find((j) => K18.existsSync(`${Y}${j}`));
          if (D) return `${Y}${D}`;
          return;
        }
        this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
        let O = H._executableFile || `${this._name}-${H._name}`,
          T = this._executableDir || "";
        if (this._scriptPath) {
          let f;
          try {
            f = K18.realpathSync(this._scriptPath);
          } catch (w) {
            f = this._scriptPath;
          }
          T = ma.resolve(ma.dirname(f), T);
        }
        if (T) {
          let f = K(T, O);
          if (!f && !H._executableFile && this._scriptPath) {
            let w = ma.basename(this._scriptPath, ma.extname(this._scriptPath));
            if (w !== this._name) f = K(T, `${w}-${H._name}`);
          }
          O = f || O;
        }
        q = $.includes(ma.extname(O));
        let z;
        if (_2.platform !== "win32")
          if (q) _.unshift(O), (_ = fV9(_2.execArgv).concat(_)), (z = $18.spawn(_2.argv[0], _, { stdio: "inherit" }));
          else z = $18.spawn(O, _, { stdio: "inherit" });
        else _.unshift(O), (_ = fV9(_2.execArgv).concat(_)), (z = $18.spawn(_2.execPath, _, { stdio: "inherit" }));
        if (!z.killed)
          ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"].forEach((w) => {
            _2.on(w, () => {
              if (z.killed === !1 && z.exitCode === null) z.kill(w);
            });
          });
        let A = this._exitCallback;
        z.on("close", (f) => {
          if (((f = f ?? 1), !A)) _2.exit(f);
          else A(new O18(f, "commander.executeSubCommandAsync", "(close)"));
        }),
          z.on("error", (f) => {
            if (f.code === "ENOENT") {
              let w = T
                  ? `searched for local subcommand relative to directory '${T}'`
                  : "no directory for search for local subcommand, use .executableDir() to supply a custom directory",
                Y = `'${O}' does not exist
 - if '${H._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${w}`;
              throw Error(Y);
            } else if (f.code === "EACCES") throw Error(`'${O}' not executable`);
            if (!A) _2.exit(1);
            else {
              let w = new O18(1, "commander.executeSubCommandAsync", "(error)");
              (w.nestedError = f), A(w);
            }
          }),
          (this.runningCommand = z);
      }
      _dispatchSubcommand(H, _, q) {
        let $ = this._findCommand(H);
        if (!$) this.help({ error: !0 });
        let K;
        return (
          (K = this._chainOrCallSubCommandHook(K, $, "preSubcommand")),
          (K = this._chainOrCall(K, () => {
            if ($._executableHandler) this._executeSubCommand($, _.concat(q));
            else return $._parseCommand(_, q);
          })),
          K
        );
      }
      _dispatchHelpCommand(H) {
        if (!H) this.help();
        let _ = this._findCommand(H);
        if (_ && !_._executableHandler) _.help();
        return this._dispatchSubcommand(
          H,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"],
        );
      }
      _checkNumberOfArguments() {
        if (
          (this.registeredArguments.forEach((H, _) => {
            if (H.required && this.args[_] == null) this.missingArgument(H.name());
          }),
          this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic)
        )
          return;
        if (this.args.length > this.registeredArguments.length) this._excessArguments(this.args);
      }
      _processArguments() {
        let H = (q, $, K) => {
          let O = $;
          if ($ !== null && q.parseArg) {
            let T = `error: command-argument value '${$}' is invalid for argument '${q.name()}'.`;
            O = this._callParseArg(q, $, K, T);
          }
          return O;
        };
        this._checkNumberOfArguments();
        let _ = [];
        this.registeredArguments.forEach((q, $) => {
          let K = q.defaultValue;
          if (q.variadic) {
            if ($ < this.args.length) {
              if (((K = this.args.slice($)), q.parseArg))
                K = K.reduce((O, T) => {
                  return H(q, T, O);
                }, q.defaultValue);
            } else if (K === void 0) K = [];
          } else if ($ < this.args.length) {
            if (((K = this.args[$]), q.parseArg)) K = H(q, K, q.defaultValue);
          }
          _[$] = K;
        }),
          (this.processedArgs = _);
      }
      _chainOrCall(H, _) {
        if (H && H.then && typeof H.then === "function") return H.then(() => _());
        return _();
      }
      _chainOrCallHooks(H, _) {
        let q = H,
          $ = [];
        if (
          (this._getCommandAndAncestors()
            .reverse()
            .filter((K) => K._lifeCycleHooks[_] !== void 0)
            .forEach((K) => {
              K._lifeCycleHooks[_].forEach((O) => {
                $.push({ hookedCommand: K, callback: O });
              });
            }),
          _ === "postAction")
        )
          $.reverse();
        return (
          $.forEach((K) => {
            q = this._chainOrCall(q, () => {
              return K.callback(K.hookedCommand, this);
            });
          }),
          q
        );
      }
      _chainOrCallSubCommandHook(H, _, q) {
        let $ = H;
        if (this._lifeCycleHooks[q] !== void 0)
          this._lifeCycleHooks[q].forEach((K) => {
            $ = this._chainOrCall($, () => {
              return K(this, _);
            });
          });
        return $;
      }
      _parseCommand(H, _) {
        let q = this.parseOptions(_);
        if (
          (this._parseOptionsEnv(),
          this._parseOptionsImplied(),
          (H = H.concat(q.operands)),
          (_ = q.unknown),
          (this.args = H.concat(_)),
          H && this._findCommand(H[0]))
        )
          return this._dispatchSubcommand(H[0], H.slice(1), _);
        if (this._getHelpCommand() && H[0] === this._getHelpCommand().name()) return this._dispatchHelpCommand(H[1]);
        if (this._defaultCommandName)
          return this._outputHelpIfRequested(_), this._dispatchSubcommand(this._defaultCommandName, H, _);
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName)
          this.help({ error: !0 });
        this._outputHelpIfRequested(q.unknown),
          this._checkForMissingMandatoryOptions(),
          this._checkForConflictingOptions();
        let $ = () => {
            if (q.unknown.length > 0) this.unknownOption(q.unknown[0]);
          },
          K = `command:${this.name()}`;
        if (this._actionHandler) {
          $(), this._processArguments();
          let O;
          if (
            ((O = this._chainOrCallHooks(O, "preAction")),
            (O = this._chainOrCall(O, () => this._actionHandler(this.processedArgs))),
            this.parent)
          )
            O = this._chainOrCall(O, () => {
              this.parent.emit(K, H, _);
            });
          return (O = this._chainOrCallHooks(O, "postAction")), O;
        }
        if (this.parent && this.parent.listenerCount(K)) $(), this._processArguments(), this.parent.emit(K, H, _);
        else if (H.length) {
          if (this._findCommand("*")) return this._dispatchSubcommand("*", H, _);
          if (this.listenerCount("command:*")) this.emit("command:*", H, _);
          else if (this.commands.length) this.unknownCommand();
          else $(), this._processArguments();
        } else if (this.commands.length) $(), this.help({ error: !0 });
        else $(), this._processArguments();
      }
      _findCommand(H) {
        if (!H) return;
        return this.commands.find((_) => _._name === H || _._aliases.includes(H));
      }
      _findOption(H) {
        return this.options.find((_) => _.is(H));
      }
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((H) => {
          H.options.forEach((_) => {
            if (_.mandatory && H.getOptionValue(_.attributeName()) === void 0) H.missingMandatoryOptionValue(_);
          });
        });
      }
      _checkForConflictingLocalOptions() {
        let H = this.options.filter((q) => {
          let $ = q.attributeName();
          if (this.getOptionValue($) === void 0) return !1;
          return this.getOptionValueSource($) !== "default";
        });
        H.filter((q) => q.conflictsWith.length > 0).forEach((q) => {
          let $ = H.find((K) => q.conflictsWith.includes(K.attributeName()));
          if ($) this._conflictingOption(q, $);
        });
      }
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((H) => {
          H._checkForConflictingLocalOptions();
        });
      }
      parseOptions(H) {
        let _ = [],
          q = [],
          $ = _,
          K = H.slice();
        function O(z) {
          return z.length > 1 && z[0] === "-";
        }
        let T = null;
        while (K.length) {
          let z = K.shift();
          if (z === "--") {
            if ($ === q) $.push(z);
            $.push(...K);
            break;
          }
          if (T && !O(z)) {
            this.emit(`option:${T.name()}`, z);
            continue;
          }
          if (((T = null), O(z))) {
            let A = this._findOption(z);
            if (A) {
              if (A.required) {
                let f = K.shift();
                if (f === void 0) this.optionMissingArgument(A);
                this.emit(`option:${A.name()}`, f);
              } else if (A.optional) {
                let f = null;
                if (K.length > 0 && !O(K[0])) f = K.shift();
                this.emit(`option:${A.name()}`, f);
              } else this.emit(`option:${A.name()}`);
              T = A.variadic ? A : null;
              continue;
            }
          }
          if (z.length > 2 && z[0] === "-" && z[1] !== "-") {
            let A = this._findOption(`-${z[1]}`);
            if (A) {
              if (A.required || (A.optional && this._combineFlagAndOptionalValue))
                this.emit(`option:${A.name()}`, z.slice(2));
              else this.emit(`option:${A.name()}`), K.unshift(`-${z.slice(2)}`);
              continue;
            }
          }
          if (/^--[^=]+=/.test(z)) {
            let A = z.indexOf("="),
              f = this._findOption(z.slice(0, A));
            if (f && (f.required || f.optional)) {
              this.emit(`option:${f.name()}`, z.slice(A + 1));
              continue;
            }
          }
          if (O(z)) $ = q;
          if ((this._enablePositionalOptions || this._passThroughOptions) && _.length === 0 && q.length === 0) {
            if (this._findCommand(z)) {
              if ((_.push(z), K.length > 0)) q.push(...K);
              break;
            } else if (this._getHelpCommand() && z === this._getHelpCommand().name()) {
              if ((_.push(z), K.length > 0)) _.push(...K);
              break;
            } else if (this._defaultCommandName) {
              if ((q.push(z), K.length > 0)) q.push(...K);
              break;
            }
          }
          if (this._passThroughOptions) {
            if (($.push(z), K.length > 0)) $.push(...K);
            break;
          }
          $.push(z);
        }
        return { operands: _, unknown: q };
      }
      opts() {
        if (this._storeOptionsAsProperties) {
          let H = {},
            _ = this.options.length;
          for (let q = 0; q < _; q++) {
            let $ = this.options[q].attributeName();
            H[$] = $ === this._versionOptionName ? this._version : this[$];
          }
          return H;
        }
        return this._optionValues;
      }
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce((H, _) => Object.assign(H, _.opts()), {});
      }
      error(H, _) {
        if (
          (this._outputConfiguration.outputError(
            `${H}
`,
            this._outputConfiguration.writeErr,
          ),
          typeof this._showHelpAfterError === "string")
        )
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        else if (this._showHelpAfterError)
          this._outputConfiguration.writeErr(`
`),
            this.outputHelp({ error: !0 });
        let q = _ || {},
          $ = q.exitCode || 1,
          K = q.code || "commander.error";
        this._exit($, K, H);
      }
      _parseOptionsEnv() {
        this.options.forEach((H) => {
          if (H.envVar && H.envVar in _2.env) {
            let _ = H.attributeName();
            if (
              this.getOptionValue(_) === void 0 ||
              ["default", "config", "env"].includes(this.getOptionValueSource(_))
            )
              if (H.required || H.optional) this.emit(`optionEnv:${H.name()}`, _2.env[H.envVar]);
              else this.emit(`optionEnv:${H.name()}`);
          }
        });
      }
      _parseOptionsImplied() {
        let H = new u2K(this.options),
          _ = (q) => {
            return this.getOptionValue(q) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(q));
          };
        this.options
          .filter(
            (q) =>
              q.implied !== void 0 &&
              _(q.attributeName()) &&
              H.valueFromOption(this.getOptionValue(q.attributeName()), q),
          )
          .forEach((q) => {
            Object.keys(q.implied)
              .filter(($) => !_($))
              .forEach(($) => {
                this.setOptionValueWithSource($, q.implied[$], "implied");
              });
          });
      }
      missingArgument(H) {
        let _ = `error: missing required argument '${H}'`;
        this.error(_, { code: "commander.missingArgument" });
      }
      optionMissingArgument(H) {
        let _ = `error: option '${H.flags}' argument missing`;
        this.error(_, { code: "commander.optionMissingArgument" });
      }
      missingMandatoryOptionValue(H) {
        let _ = `error: required option '${H.flags}' not specified`;
        this.error(_, { code: "commander.missingMandatoryOptionValue" });
      }
      _conflictingOption(H, _) {
        let q = (O) => {
            let T = O.attributeName(),
              z = this.getOptionValue(T),
              A = this.options.find((w) => w.negate && T === w.attributeName()),
              f = this.options.find((w) => !w.negate && T === w.attributeName());
            if (A && ((A.presetArg === void 0 && z === !1) || (A.presetArg !== void 0 && z === A.presetArg))) return A;
            return f || O;
          },
          $ = (O) => {
            let T = q(O),
              z = T.attributeName();
            if (this.getOptionValueSource(z) === "env") return `environment variable '${T.envVar}'`;
            return `option '${T.flags}'`;
          },
          K = `error: ${$(H)} cannot be used with ${$(_)}`;
        this.error(K, { code: "commander.conflictingOption" });
      }
      unknownOption(H) {
        if (this._allowUnknownOption) return;
        let _ = "";
        if (H.startsWith("--") && this._showSuggestionAfterError) {
          let $ = [],
            K = this;
          do {
            let O = K.createHelp()
              .visibleOptions(K)
              .filter((T) => T.long)
              .map((T) => T.long);
            ($ = $.concat(O)), (K = K.parent);
          } while (K && !K._enablePositionalOptions);
          _ = AV9(H, $);
        }
        let q = `error: unknown option '${H}'${_}`;
        this.error(q, { code: "commander.unknownOption" });
      }
      _excessArguments(H) {
        if (this._allowExcessArguments) return;
        let _ = this.registeredArguments.length,
          q = _ === 1 ? "" : "s",
          K = `error: too many arguments${this.parent ? ` for '${this.name()}'` : ""}. Expected ${_} argument${q} but got ${H.length}.`;
        this.error(K, { code: "commander.excessArguments" });
      }
      unknownCommand() {
        let H = this.args[0],
          _ = "";
        if (this._showSuggestionAfterError) {
          let $ = [];
          this.createHelp()
            .visibleCommands(this)
            .forEach((K) => {
              if (($.push(K.name()), K.alias())) $.push(K.alias());
            }),
            (_ = AV9(H, $));
        }
        let q = `error: unknown command '${H}'${_}`;
        this.error(q, { code: "commander.unknownCommand" });
      }
      version(H, _, q) {
        if (H === void 0) return this._version;
        (this._version = H), (_ = _ || "-V, --version"), (q = q || "output the version number");
        let $ = this.createOption(_, q);
        return (
          (this._versionOptionName = $.attributeName()),
          this._registerOption($),
          this.on("option:" + $.name(), () => {
            this._outputConfiguration.writeOut(`${H}
`),
              this._exit(0, "commander.version", H);
          }),
          this
        );
      }
      description(H, _) {
        if (H === void 0 && _ === void 0) return this._description;
        if (((this._description = H), _)) this._argsDescription = _;
        return this;
      }
      summary(H) {
        if (H === void 0) return this._summary;
        return (this._summary = H), this;
      }
      alias(H) {
        if (H === void 0) return this._aliases[0];
        let _ = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler)
          _ = this.commands[this.commands.length - 1];
        if (H === _._name) throw Error("Command alias can't be the same as its name");
        let q = this.parent?._findCommand(H);
        if (q) {
          let $ = [q.name()].concat(q.aliases()).join("|");
          throw Error(`cannot add alias '${H}' to command '${this.name()}' as already have command '${$}'`);
        }
        return _._aliases.push(H), this;
      }
      aliases(H) {
        if (H === void 0) return this._aliases;
        return H.forEach((_) => this.alias(_)), this;
      }
      usage(H) {
        if (H === void 0) {
          if (this._usage) return this._usage;
          let _ = this.registeredArguments.map((q) => {
            return b2K(q);
          });
          return []
            .concat(
              this.options.length || this._helpOption !== null ? "[options]" : [],
              this.commands.length ? "[command]" : [],
              this.registeredArguments.length ? _ : [],
            )
            .join(" ");
        }
        return (this._usage = H), this;
      }
      name(H) {
        if (H === void 0) return this._name;
        return (this._name = H), this;
      }
      nameFromFilename(H) {
        return (this._name = ma.basename(H, ma.extname(H))), this;
      }
      executableDir(H) {
        if (H === void 0) return this._executableDir;
        return (this._executableDir = H), this;
      }
      helpInformation(H) {
        let _ = this.createHelp();
        if (_.helpWidth === void 0)
          _.helpWidth =
            H && H.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        return _.formatHelp(this, _);
      }
      _getHelpContext(H) {
        H = H || {};
        let _ = { error: !!H.error },
          q;
        if (_.error) q = ($) => this._outputConfiguration.writeErr($);
        else q = ($) => this._outputConfiguration.writeOut($);
        return (_.write = H.write || q), (_.command = this), _;
      }
      outputHelp(H) {
        let _;
        if (typeof H === "function") (_ = H), (H = void 0);
        let q = this._getHelpContext(H);
        this._getCommandAndAncestors()
          .reverse()
          .forEach((K) => K.emit("beforeAllHelp", q)),
          this.emit("beforeHelp", q);
        let $ = this.helpInformation(q);
        if (_) {
          if ((($ = _($)), typeof $ !== "string" && !Buffer.isBuffer($)))
            throw Error("outputHelp callback must return a string or a Buffer");
        }
        if ((q.write($), this._getHelpOption()?.long)) this.emit(this._getHelpOption().long);
        this.emit("afterHelp", q), this._getCommandAndAncestors().forEach((K) => K.emit("afterAllHelp", q));
      }
      helpOption(H, _) {
        if (typeof H === "boolean") {
          if (H) this._helpOption = this._helpOption ?? void 0;
          else this._helpOption = null;
          return this;
        }
        return (
          (H = H ?? "-h, --help"),
          (_ = _ ?? "display help for command"),
          (this._helpOption = this.createOption(H, _)),
          this
        );
      }
      _getHelpOption() {
        if (this._helpOption === void 0) this.helpOption(void 0, void 0);
        return this._helpOption;
      }
      addHelpOption(H) {
        return (this._helpOption = H), this;
      }
      help(H) {
        this.outputHelp(H);
        let _ = _2.exitCode || 0;
        if (_ === 0 && H && typeof H !== "function" && H.error) _ = 1;
        this._exit(_, "commander.help", "(outputHelp)");
      }
      addHelpText(H, _) {
        let q = ["beforeAll", "before", "after", "afterAll"];
        if (!q.includes(H))
          throw Error(`Unexpected value for position to addHelpText.
Expecting one of '${q.join("', '")}'`);
        let $ = `${H}Help`;
        return (
          this.on($, (K) => {
            let O;
            if (typeof _ === "function") O = _({ error: K.error, command: K.command });
            else O = _;
            if (O)
              K.write(`${O}
`);
          }),
          this
        );
      }
      _outputHelpIfRequested(H) {
        let _ = this._getHelpOption();
        if (_ && H.find(($) => _.is($))) this.outputHelp(), this._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
    function fV9(H) {
      return H.map((_) => {
        if (!_.startsWith("--inspect")) return _;
        let q,
          $ = "127.0.0.1",
          K = "9229",
          O;
        if ((O = _.match(/^(--inspect(-brk)?)$/)) !== null) q = O[1];
        else if ((O = _.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null)
          if (((q = O[1]), /^\d+$/.test(O[3]))) K = O[3];
          else $ = O[3];
        else if ((O = _.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) (q = O[1]), ($ = O[3]), (K = O[4]);
        if (q && K !== "0") return `${q}=${$}:${parseInt(K) + 1}`;
        return _;
      });
    }
    wV9.Command = T18;
  });

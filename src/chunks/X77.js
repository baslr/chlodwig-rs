  var X77 = d((Dk_) => {
    Object.defineProperty(Dk_, "__esModule", { value: !0 });
    Dk_.Walker = void 0;
    var Od4 = XMH(),
      Yk_ = M77(),
      b6H = require("path"),
      mE = pE6(),
      BE6 = J77(),
      An = Od4("flora-colossus");
    class P77 {
      constructor(H) {
        if (((this.modules = []), (this.walkHistory = new Set()), (this.cache = null), !H || typeof H !== "string"))
          throw Error("modulePath must be provided as a string");
        An(`creating walker with rootModule=${H}`), (this.rootModule = H);
      }
      relativeModule(H, _) {
        return b6H.resolve(H, "node_modules", _);
      }
      async loadPackageJSON(H) {
        let _ = b6H.resolve(H, "package.json");
        if (await Yk_.pathExists(_)) {
          let q = await Yk_.readJson(_);
          if (!q.dependencies) q.dependencies = {};
          if (!q.devDependencies) q.devDependencies = {};
          if (!q.optionalDependencies) q.optionalDependencies = {};
          return q;
        }
        return null;
      }
      async walkDependenciesForModuleInModule(H, _, q) {
        let $ = _,
          K = null,
          O = null;
        while (!K && this.relativeModule($, H) !== O)
          if (((O = this.relativeModule($, H)), await Yk_.pathExists(O))) K = O;
          else {
            if (b6H.basename(b6H.dirname($)) !== "node_modules") $ = b6H.dirname($);
            $ = b6H.dirname(b6H.dirname($));
          }
        if (!K && q !== mE.DepType.OPTIONAL && q !== mE.DepType.DEV_OPTIONAL)
          throw Error(`Failed to locate module "${H}" from "${_}"

        This normally means that either you have deleted this package already somehow (check your ignore settings if using electron-packager).  Or your module installation failed.`);
        if (K) await this.walkDependenciesForModule(K, q);
      }
      async detectNativeModuleType(H, _) {
        if (_.dependencies["prebuild-install"]) return BE6.NativeModuleType.PREBUILD;
        else if (await Yk_.pathExists(b6H.join(H, "binding.gyp"))) return BE6.NativeModuleType.NODE_GYP;
        return BE6.NativeModuleType.NONE;
      }
      async walkDependenciesForModule(H, _) {
        if ((An("walk reached:", H, " Type is:", mE.DepType[_]), this.walkHistory.has(H))) {
          An("already walked this route");
          let $ = this.modules.find((K) => K.path === H);
          if ((0, mE.depTypeGreater)(_, $.depType))
            An(`existing module has a type of "${$.depType}", new module type would be "${_}" therefore updating`),
              ($.depType = _);
          return;
        }
        let q = await this.loadPackageJSON(H);
        if (!q) {
          An("walk hit a dead end, this module is incomplete");
          return;
        }
        this.walkHistory.add(H),
          this.modules.push({
            depType: _,
            nativeModuleType: await this.detectNativeModuleType(H, q),
            path: H,
            name: q.name,
          });
        for (let $ in q.dependencies) {
          if ($ in q.optionalDependencies) {
            An(`found ${$} in prod deps of ${H} but it is also marked optional`);
            continue;
          }
          await this.walkDependenciesForModuleInModule($, H, (0, mE.childDepType)(_, mE.DepType.PROD));
        }
        for (let $ in q.optionalDependencies)
          await this.walkDependenciesForModuleInModule($, H, (0, mE.childDepType)(_, mE.DepType.OPTIONAL));
        if (_ === mE.DepType.ROOT) {
          An("we're still at the beginning, walking down the dev route");
          for (let $ in q.devDependencies)
            await this.walkDependenciesForModuleInModule($, H, (0, mE.childDepType)(_, mE.DepType.DEV));
        }
      }
      async walkTree() {
        if ((An("starting tree walk"), !this.cache))
          this.cache = new Promise(async (H, _) => {
            this.modules = [];
            try {
              await this.walkDependenciesForModule(this.rootModule, mE.DepType.ROOT);
            } catch (q) {
              _(q);
              return;
            }
            H(this.modules);
          });
        else An("tree walk in progress / completed already, waiting for existing walk to complete");
        return await this.cache;
      }
      getRootModule() {
        return this.rootModule;
      }
    }
    Dk_.Walker = P77;
  });

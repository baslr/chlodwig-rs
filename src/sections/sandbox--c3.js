    htq();
    e2H();
    k_();
    H_();
    h5();
    M9();
    ri();
    _z();
    fI();
    Q6();
    MO();
    h_();
    q5();
    kE();
    (qL_ = require("fs")), (utq = require("fs/promises")), (Fk = require("path"));
    _L_ = [];
    $L_ = $6(() => {
      let { rgPath: H, rgArgs: _ } = GOH();
      return yw.checkDependencies({ command: H, args: _ });
    });
    OL_ = $6(() => {
      return yw.isSupportedPlatform();
    });
    j8 = {
      initialize: gu4,
      isSandboxingEnabled: TL_,
      isSandboxEnabledInSettings: KL_,
      isPlatformInEnabledList: QV6,
      getSandboxUnavailableReason: Iu4,
      isAutoAllowBashIfSandboxedEnabled: Eu4,
      areUnsandboxedCommandsAllowed: Cu4,
      isSandboxRequired: bu4,
      areSandboxSettingsLockedByPolicy: xu4,
      setSandboxSettings: mu4,
      getExcludedCommands: pu4,
      wrapWithSandbox: Bu4,
      refreshConfig: du4,
      reset: cu4,
      checkDependencies: $L_,
      getFsReadConfig: yw.getFsReadConfig,
      getFsWriteConfig: yw.getFsWriteConfig,
      getNetworkRestrictionConfig: yw.getNetworkRestrictionConfig,
      getIgnoreViolations: yw.getIgnoreViolations,
      getLinuxGlobPatternWarnings: uu4,
      isSupportedPlatform: OL_,
      getAllowUnixSockets: yw.getAllowUnixSockets,
      getAllowLocalBinding: yw.getAllowLocalBinding,
      getEnableWeakerNestedSandbox: yw.getEnableWeakerNestedSandbox,
      getProxyPort: yw.getProxyPort,
      getSocksProxyPort: yw.getSocksProxyPort,
      getLinuxHttpSocketPath: yw.getLinuxHttpSocketPath,
      getLinuxSocksSocketPath: yw.getLinuxSocksSocketPath,
      waitForNetworkInitialization: yw.waitForNetworkInitialization,
      getSandboxViolationStore: yw.getSandboxViolationStore,
      annotateStderrWithSandboxFailures: yw.annotateStderrWithSandboxFailures,
      cleanupAfterCommand: () => {
        yw.cleanupAfterCommand(), Vu4();
      },
    };

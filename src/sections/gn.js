    k_();
    I8();
    H_();
    j9();
    n8();
    WP7();
    TQ();
    l$();
    N_();
    H7();
    (RP7 = require("fs/promises")),
      (JnH = require("path")),
      (y11 = [
        "github.com:anthropics/claude-cli-internal",
        "github.com/anthropics/claude-cli-internal",
        "github.com:anthropics/anthropic",
        "github.com/anthropics/anthropic",
        "github.com:anthropics/apps",
        "github.com/anthropics/apps",
        "github.com:anthropics/casino",
        "github.com/anthropics/casino",
        "github.com:anthropics/dbt",
        "github.com/anthropics/dbt",
        "github.com:anthropics/dotfiles",
        "github.com/anthropics/dotfiles",
        "github.com:anthropics/terraform-config",
        "github.com/anthropics/terraform-config",
        "github.com:anthropics/hex-export",
        "github.com/anthropics/hex-export",
        "github.com:anthropics/feedback-v2",
        "github.com/anthropics/feedback-v2",
        "github.com:anthropics/labs",
        "github.com/anthropics/labs",
        "github.com:anthropics/argo-rollouts",
        "github.com/anthropics/argo-rollouts",
        "github.com:anthropics/starling-configs",
        "github.com/anthropics/starling-configs",
        "github.com:anthropics/ts-tools",
        "github.com/anthropics/ts-tools",
        "github.com:anthropics/ts-capsules",
        "github.com/anthropics/ts-capsules",
        "github.com:anthropics/feldspar-testing",
        "github.com/anthropics/feldspar-testing",
        "github.com:anthropics/trellis",
        "github.com/anthropics/trellis",
        "github.com:anthropics/claude-for-hiring",
        "github.com/anthropics/claude-for-hiring",
        "github.com:anthropics/forge-web",
        "github.com/anthropics/forge-web",
        "github.com:anthropics/infra-manifests",
        "github.com/anthropics/infra-manifests",
        "github.com:anthropics/mycro_manifests",
        "github.com/anthropics/mycro_manifests",
        "github.com:anthropics/mycro_configs",
        "github.com/anthropics/mycro_configs",
        "github.com:anthropics/mobile-apps",
        "github.com/anthropics/mobile-apps",
      ]);
    LP7 = KB(async () => {
      if (MnH !== null) return MnH === "internal";
      let H = Lh_(),
        _ = await K1_(H);
      if (!_) return (MnH = "none"), !1;
      let q = y11.some(($) => _.includes($));
      return (MnH = q ? "internal" : "external"), q;
    });

    y6();
    KDH();
    hLK = [
      (H) => {
        if (!pd9(H.sonnet45To46MigrationTimestamp)) return;
        return {
          key: "sonnet-46-update",
          text: "Model updated to Sonnet 4.6",
          color: "suggestion",
          priority: "high",
          timeoutMs: 3000,
        };
      },
      (H) => {
        let _ = Boolean(H.legacyOpusMigrationTimestamp),
          q = H.legacyOpusMigrationTimestamp ?? H.opusProMigrationTimestamp;
        if (!pd9(q)) return;
        return {
          key: "opus-pro-update",
          text: _
            ? "Model updated to Opus 4.6 \xB7 Set CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1 to opt out"
            : "Model updated to Opus 4.6",
          color: "suggestion",
          priority: "high",
          timeoutMs: _ ? 8000 : 3000,
        };
      },
    ];

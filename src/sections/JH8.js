    u7();
    t6();
    T7();
    XwH = $6(() => {
      let H = B_("tengu_amber_wren", {}),
        _ =
          typeof H?.maxSizeBytes === "number" && Number.isFinite(H.maxSizeBytes) && H.maxSizeBytes > 0
            ? H.maxSizeBytes
            : oG6,
        $ =
          Or1() ??
          (typeof H?.maxTokens === "number" && Number.isFinite(H.maxTokens) && H.maxTokens > 0 ? H.maxTokens : Kr1),
        K = typeof H?.includeMaxSizeInPrompt === "boolean" ? H.includeMaxSizeInPrompt : void 0,
        O = typeof H?.targetedRangeNudge === "boolean" ? H.targetedRangeNudge : void 0;
      return { maxSizeBytes: _, maxTokens: $, includeMaxSizeInPrompt: K, targetedRangeNudge: O };
    });

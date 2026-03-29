    u7();
    lK();
    (VT4 = [
      {
        modelEnvVar: "ANTHROPIC_DEFAULT_OPUS_MODEL",
        capabilitiesEnvVar: "ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES",
      },
      {
        modelEnvVar: "ANTHROPIC_DEFAULT_SONNET_MODEL",
        capabilitiesEnvVar: "ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES",
      },
      {
        modelEnvVar: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        capabilitiesEnvVar: "ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES",
      },
    ]),
      (iHH = $6(
        (H, _) => {
          if (N8() === "firstParty") return;
          let q = H.toLowerCase();
          for (let $ of VT4) {
            let K = process.env[$.modelEnvVar],
              O = process.env[$.capabilitiesEnvVar];
            if (!K || O === void 0) continue;
            if (q !== K.toLowerCase()) continue;
            return O.toLowerCase()
              .split(",")
              .map((T) => T.trim())
              .includes(_);
          }
          return;
        },
        (H, _) => `${H.toLowerCase()}:${_}`,
      ));

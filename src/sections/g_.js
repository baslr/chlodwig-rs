    u7();
    (Hf8 = require("os")),
      (dt_ = require("path")),
      (i6 = $6(
        () => {
          return (process.env.CLAUDE_CONFIG_DIR ?? dt_.join(Hf8.homedir(), ".claude")).normalize("NFC");
        },
        () => process.env.CLAUDE_CONFIG_DIR,
      ));
    _H$ = [
      ["claude-haiku-4-5", "VERTEX_REGION_CLAUDE_HAIKU_4_5"],
      ["claude-3-5-haiku", "VERTEX_REGION_CLAUDE_3_5_HAIKU"],
      ["claude-3-5-sonnet", "VERTEX_REGION_CLAUDE_3_5_SONNET"],
      ["claude-3-7-sonnet", "VERTEX_REGION_CLAUDE_3_7_SONNET"],
      ["claude-opus-4-1", "VERTEX_REGION_CLAUDE_4_1_OPUS"],
      ["claude-opus-4", "VERTEX_REGION_CLAUDE_4_0_OPUS"],
      ["claude-sonnet-4-6", "VERTEX_REGION_CLAUDE_4_6_SONNET"],
      ["claude-sonnet-4-5", "VERTEX_REGION_CLAUDE_4_5_SONNET"],
      ["claude-sonnet-4", "VERTEX_REGION_CLAUDE_4_0_SONNET"],
    ];

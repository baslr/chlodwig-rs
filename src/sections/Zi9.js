    u7();
    k_();
    By();
    qv();
    Ac();
    rZ();
    n8();
    giH();
    q8();
    q5();
    tX();
    L_();
    Jo();
    le6();
    KZH();
    h_();
    t6();
    OO8 = require("fs/promises");
    (MhK = $6(() => {
      let H = whK(),
        _ = {
          minimumMessageTokensToInit:
            H.minimumMessageTokensToInit && H.minimumMessageTokensToInit > 0
              ? H.minimumMessageTokensToInit
              : LiH.minimumMessageTokensToInit,
          minimumTokensBetweenUpdate:
            H.minimumTokensBetweenUpdate && H.minimumTokensBetweenUpdate > 0
              ? H.minimumTokensBetweenUpdate
              : LiH.minimumTokensBetweenUpdate,
          toolCallsBetweenUpdates:
            H.toolCallsBetweenUpdates && H.toolCallsBetweenUpdates > 0
              ? H.toolCallsBetweenUpdates
              : LiH.toolCallsBetweenUpdates,
        };
      GK7(_);
    })),
      (JhK = KB(async function (H) {
        let { messages: _, toolUseContext: q, querySource: $ } = H;
        if ($ !== "repl_main_thread") return;
        if (!fhK()) return;
        if ((MhK(), !DhK(_))) return;
        PK7();
        let K = CeH(q),
          { memoryPath: O, currentMemory: T } = await jhK(K),
          z = await MK9(T, O);
        await LG({
          promptMessages: [d_({ content: z })],
          cacheSafeParams: Ly(H),
          canUseTool: PhK(O),
          querySource: "session_memory",
          forkLabel: "session_memory",
          overrides: { readFileState: K.readFileState },
        });
        let A = _[_.length - 1],
          f = A ? Md(A) : void 0,
          w = RK7();
        Q("tengu_session_memory_extraction", {
          input_tokens: f?.input_tokens,
          output_tokens: f?.output_tokens,
          cache_read_input_tokens: f?.cache_read_input_tokens ?? void 0,
          cache_creation_input_tokens: f?.cache_creation_input_tokens ?? void 0,
          config_min_message_tokens_to_init: w.minimumMessageTokensToInit,
          config_min_tokens_between_update: w.minimumTokensBetweenUpdate,
          config_tool_calls_between_updates: w.toolCallsBetweenUpdates,
        }),
          ZK7(GG(_)),
          XhK(_),
          XK7();
      }));

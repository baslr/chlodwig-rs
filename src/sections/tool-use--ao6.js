    dC_();
    x8();
    k_();
    By();
    _aH();
    MF6();
    t6();
    L_();
    hn();
    nM();
    ifH();
    EP();
    KW();
    ju();
    uO();
    I8();
    H_();
    g_();
    h_();
    q8();
    uqH();
    yJ();
    dw();
    TC();
    e7();
    $yH();
    xw();
    wP();
    l5();
    a0();
    bm();
    tX();
    ix();
    uW();
    iE_();
    MO();
    $_9();
    aX();
    pqH();
    olH();
    CO();
    ieH();
    FM();
    Sa6();
    x7H();
    Og_();
    (Ea6 = u(PH(), 1)), (OyH = lH(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS));
    (rg1 = pH(() =>
      h.object({
        description: h.string().describe("A short (3-5 word) description of the task"),
        prompt: h.string().describe("The task for the agent to perform"),
        subagent_type: h.string().optional().describe("The type of specialized agent to use for this task"),
        model: h
          .enum(["sonnet", "opus", "haiku"])
          .optional()
          .describe(
            "Optional model override for this agent. Takes precedence over the agent definition's model frontmatter. If omitted, uses the agent definition's model, or inherits from the parent.",
          ),
        run_in_background: h
          .boolean()
          .optional()
          .describe("Set to true to run this agent in the background. You will be notified when it completes."),
      }),
    )),
      (og1 = pH(() => {
        let H = h.object({
          name: h
            .string()
            .optional()
            .describe("Name for the spawned agent. Makes it addressable via SendMessage({to: name}) while running."),
          team_name: h.string().optional().describe("Team name for spawning. Uses current team context if omitted."),
          mode: PX8()
            .optional()
            .describe('Permission mode for spawned teammate (e.g., "plan" to require plan approval).'),
        });
        return rg1()
          .merge(H)
          .extend({
            isolation: h
              .enum(["worktree"])
              .optional()
              .describe(
                'Isolation mode. "worktree" creates a temporary git worktree so the agent works on an isolated copy of the repo.',
              ),
            cwd: h
              .string()
              .optional()
              .describe(
                'Absolute path to run the agent in. Overrides the working directory for all filesystem and shell operations within this agent. Mutually exclusive with isolation: "worktree".',
              ),
          });
      })),
      (oo6 = pH(() => {
        let H = og1().omit({ cwd: !0 });
        return OyH || Hb() ? H.omit({ run_in_background: !0 }) : H;
      })),
      (ag1 = pH(() => {
        let H = Rb7().extend({ status: h.literal("completed"), prompt: h.string() }),
          _ = h.object({
            status: h.literal("async_launched"),
            agentId: h.string().describe("The ID of the async agent"),
            description: h.string().describe("The description of the task"),
            prompt: h.string().describe("The prompt for the agent"),
            outputFile: h.string().describe("Path to the output file for checking agent progress"),
            canReadOutputFile: h
              .boolean()
              .optional()
              .describe("Whether the calling agent has Read/Bash tools to check progress"),
          });
        return h.union([H, _]);
      })),
      (w_9 = {
        async prompt({ agents: H, tools: _, getToolPermissionContext: q, allowedAgentTypes: $ }) {
          let K = await q(),
            O = [];
          for (let f of _)
            if (f.name?.startsWith("mcp__")) {
              let Y = f.name.split("__")[1];
              if (Y && !O.includes(Y)) O.push(Y);
            }
          let T = tlH(H, O),
            z = neH(T, K, M7);
          return await f_9(z, !1, $);
        },
        name: M7,
        searchHint: "delegate work to a subagent",
        aliases: [ep],
        maxResultSizeChars: 1e5,
        async description() {
          return "Launch a new agent";
        },
        get inputSchema() {
          return oo6();
        },
        get outputSchema() {
          return ag1();
        },
        async call(
          {
            prompt: H,
            subagent_type: _,
            description: q,
            model: $,
            run_in_background: K,
            name: O,
            team_name: T,
            mode: z,
            isolation: A,
            cwd: f,
          },
          w,
          Y,
          D,
          j,
        ) {
          let M = Date.now(),
            J = RvH() ? void 0 : $,
            P = w.getAppState(),
            X = P.toolPermissionContext.mode,
            R = w.setAppStateForTasks ?? w.setAppState;
          if (T && !dq()) throw Error("Agent Teams is not yet available on your plan.");
          let W = sg1({ team_name: T }, P);
          if (Q5() && W && O)
            throw Error(
              "Teammates cannot spawn other teammates \u2014 the team roster is flat. To spawn a subagent instead, omit the `name` parameter.",
            );
          if (QJ() && W && K === !0)
            throw Error(
              "In-process teammates cannot spawn background agents. Use run_in_background=false for synchronous subagents.",
            );
          if (W && O) {
            let fH = _ ? w.options.agentDefinitions.activeAgents.find((n) => n.agentType === _) : void 0;
            if (fH?.color) YTH(_, fH.color);
            let vH = await q_9(
              {
                name: O,
                prompt: H,
                description: q,
                team_name: W,
                use_splitpane: !0,
                plan_mode_required: z === "plan",
                model: J ?? fH?.model,
                agent_type: _,
                invokingRequestId: D?.requestId,
              },
              w,
            );
            return { data: { status: "teammate_spawned", prompt: H, ...vH.data } };
          }
          let Z = _ ?? (Hb() ? void 0 : Od.agentType),
            k = Z === void 0,
            v;
          if (k) {
            if (w.options.querySource === `agent:builtin:${KyH.agentType}` || T_9(w.messages))
              throw Error(
                "Fork is not available inside a forked worker. Complete your task directly using your tools.",
              );
            v = KyH;
          } else {
            let fH = w.options.agentDefinitions.activeAgents,
              { allowedAgentTypes: vH } = w.options.agentDefinitions,
              KH = neH(vH ? fH.filter((l) => vH.includes(l.agentType)) : fH, P.toolPermissionContext, M7),
              n = KH.find((l) => l.agentType === Z);
            if (!n) {
              if (fH.find((a) => a.agentType === Z)) {
                let a = Y_9(P.toolPermissionContext, M7, Z);
                throw Error(
                  `Agent type '${Z}' has been denied by permission rule '${M7}(${Z})' from ${a?.source ?? "settings"}.`,
                );
              }
              throw Error(`Agent type '${Z}' not found. Available agents: ${KH.map((a) => a.agentType).join(", ")}`);
            }
            v = n;
          }
          if (QJ() && W && v.background === !0)
            throw Error(
              `In-process teammates cannot spawn background agents. Agent '${v.agentType}' has background: true in its definition.`,
            );
          let y = v.requiredMcpServers;
          if (y?.length) {
            let fH = P.mcp.clients.some(
                (n) => n.type === "pending" && y.some((l) => n.name.toLowerCase().includes(l.toLowerCase())),
              ),
              vH = P;
            if (fH) {
              let a = Date.now() + 30000;
              while (Date.now() < a) {
                if (
                  (await Tq(500),
                  (vH = w.getAppState()),
                  vH.mcp.clients.some(
                    (OH) => OH.type === "failed" && y.some((XH) => OH.name.toLowerCase().includes(XH.toLowerCase())),
                  ))
                )
                  break;
                if (
                  !vH.mcp.clients.some(
                    (OH) => OH.type === "pending" && y.some((XH) => OH.name.toLowerCase().includes(XH.toLowerCase())),
                  )
                )
                  break;
              }
            }
            let KH = [];
            for (let n of vH.mcp.tools)
              if (n.name?.startsWith("mcp__")) {
                let a = n.name.split("__")[1];
                if (a && !KH.includes(a)) KH.push(a);
              }
            if (!Yv_(v, KH)) {
              let n = y.filter((l) => !KH.some((a) => a.toLowerCase().includes(l.toLowerCase())));
              throw Error(
                `Agent '${v.agentType}' requires MCP servers matching: ${n.join(", ")}. MCP servers with tools: ${KH.length > 0 ? KH.join(", ") : "none"}. Use /mcp to configure and authenticate the required MCP servers.`,
              );
            }
          }
          if (v.color) YTH(v.agentType, v.color);
          let E = LvH(v.model, w.options.mainLoopModel, k ? void 0 : J, X);
          Q("tengu_agent_tool_selected", {
            agent_type: v.agentType,
            model: E,
            source: v.source,
            color: v.color,
            is_built_in_agent: uf(v),
            is_resume: !1,
            is_async: (K === !0 || v.background === !0) && !OyH,
            is_fork: k,
          });
          let S = A ?? v.isolation,
            x,
            I,
            B;
          if (k) {
            if (w.renderedSystemPrompt) I = w.renderedSystemPrompt;
            else {
              let fH = P.agent ? P.agentDefinitions.activeAgents.find((n) => n.agentType === P.agent) : void 0,
                vH = Array.from(P.toolPermissionContext.additionalWorkingDirectories.keys()),
                KH = await qJ(w.options.tools, w.options.mainLoopModel, vH, w.options.mcpClients);
              I = eC({
                mainThreadAgentDefinition: fH,
                toolUseContext: w,
                customSystemPrompt: w.options.customSystemPrompt,
                defaultSystemPrompt: KH,
                appendSystemPrompt: w.options.appendSystemPrompt,
              });
            }
            B = z_9(H, D);
          } else {
            try {
              let fH = Array.from(P.toolPermissionContext.additionalWorkingDirectories.keys()),
                vH = v.getSystemPrompt({ toolUseContext: w });
              if (v.memory) Q("tengu_agent_memory_loaded", { ...{}, scope: v.memory, source: "subagent" });
              x = await EeH([vH], E, fH);
            } catch (fH) {
              N(`Failed to get system prompt for agent ${v.agentType}: ${QH(fH)}`);
            }
            B = [d_({ content: H })];
          }
          let p = {
              prompt: H,
              resolvedAgentModel: E,
              isBuiltInAgent: uf(v),
              startTime: M,
              agentType: v.agentType,
              isAsync: (K === !0 || v.background === !0) && !OyH,
            },
            C = !1,
            g = Hb(),
            c = !1,
            U = (K === !0 || v.background === !0 || C || g || c || (lg1?.isProactiveActive() ?? !1)) && !OyH,
            i = { ...P.toolPermissionContext, mode: v.permissionMode ?? "acceptEdits" },
            _H = jF(i, P.mcp.tools),
            HH = lx(),
            e = null;
          if (S === "worktree") {
            let fH = `agent-${HH.slice(0, 8)}`;
            e = await reH(fH);
          }
          if (k && e) B.push(d_({ content: A_9(X_(), e.worktreePath) }));
          let qH = {
              agentDefinition: v,
              promptMessages: B,
              toolUseContext: w,
              canUseTool: Y,
              isAsync: U,
              querySource: w.options.querySource ?? gC_(v.agentType, uf(v)),
              model: k ? void 0 : J,
              override: k ? { systemPrompt: I } : x && !e && !f ? { systemPrompt: w$(x) } : void 0,
              availableTools: k ? w.options.tools : _H,
              forkContextMessages: k ? w.messages : void 0,
              ...(k && { useExactTools: !0 }),
              worktreePath: e?.worktreePath,
              description: q,
            },
            r = f ?? e?.worktreePath,
            $H = (fH) => (r ? S4_(r, fH) : fH()),
            DH = async () => {
              if (!e) return {};
              let { worktreePath: fH, worktreeBranch: vH, headCommit: KH, gitRoot: n, hookBased: l } = e;
              if (((e = null), l)) return N(`Hook-based agent worktree kept at: ${fH}`), { worktreePath: fH };
              if (KH) {
                if (!(await Ca6(fH, KH)))
                  return (
                    await o7H(fH, vH, n),
                    beH(Jz(HH), { agentType: v.agentType, description: q }).catch((t) =>
                      N(`Failed to clear worktree metadata: ${t}`),
                    ),
                    {}
                  );
              }
              return N(`Agent worktree has changes, keeping: ${fH}`), { worktreePath: fH, worktreeBranch: vH };
            };
          if (U) {
            let fH = HH,
              vH = _y_({
                agentId: fH,
                description: q,
                prompt: H,
                selectedAgent: v,
                setAppState: R,
                toolUseId: w.toolUseId,
              });
            if (O)
              R((l) => {
                let a = new Map(l.agentNameRegistry);
                return a.set(O, Jz(fH)), { ...l, agentNameRegistry: a };
              });
            let KH = {
              agentId: fH,
              parentSessionId: zg(),
              agentType: "subagent",
              subagentName: v.agentType,
              isBuiltIn: uf(v),
              invokingRequestId: D?.requestId,
              invocationKind: "spawn",
              invocationEmitted: !1,
            };
            Tg(KH, () =>
              $H(() =>
                fb_({
                  taskId: vH.agentId,
                  abortController: vH.abortController,
                  makeStream: (l) =>
                    av({
                      ...qH,
                      override: { ...qH.override, agentId: Jz(vH.agentId), abortController: vH.abortController },
                      onCacheSafeParams: l,
                    }),
                  metadata: p,
                  description: q,
                  toolUseContext: w,
                  rootSetAppState: R,
                  agentIdForCleanup: fH,
                  enableSummarization: C || Hb() || Ep(),
                  getWorktreeResult: DH,
                }),
              ),
            );
            let n = w.options.tools.some((l) => CK(l, cq) || CK(l, Lq));
            return {
              data: {
                isAsync: !0,
                status: "async_launched",
                agentId: vH.agentId,
                description: q,
                prompt: H,
                outputFile: I5(vH.agentId),
                canReadOutputFile: n,
              },
            };
          } else {
            let fH = Jz(HH),
              vH = {
                agentId: fH,
                parentSessionId: zg(),
                agentType: "subagent",
                subagentName: v.agentType,
                isBuiltIn: uf(v),
                invokingRequestId: D?.requestId,
                invocationKind: "spawn",
                invocationEmitted: !1,
              };
            return Tg(vH, () =>
              $H(async () => {
                let KH = [],
                  n = Date.now(),
                  l = aTH(),
                  a = sTH(w.options.tools);
                if (B.length > 0) {
                  let VH = bj(B).find((yH) => yH.type === "user");
                  if (VH && VH.type === "user" && j)
                    j({
                      toolUseID: `agent_${D.message.id}`,
                      data: { message: VH, type: "agent_progress", prompt: H, agentId: fH },
                    });
                }
                let t, s, OH;
                if (!OyH) {
                  let SH = lX7({
                    agentId: fH,
                    description: q,
                    prompt: H,
                    selectedAgent: v,
                    setAppState: R,
                    toolUseId: w.toolUseId,
                    autoBackgroundMs: ng1() || void 0,
                  });
                  (t = SH.taskId),
                    (s = SH.backgroundSignal.then(() => ({ type: "background" }))),
                    (OH = SH.cancelAutoBackground);
                }
                let XH = !1,
                  jH = !1,
                  GH,
                  RH = t,
                  NH = av({
                    ...qH,
                    override: { ...qH.override, agentId: fH },
                    onCacheSafeParams:
                      RH && Ep()
                        ? (SH) => {
                            let { stop: VH } = KaH(RH, fH, SH, R);
                            GH = VH;
                          }
                        : void 0,
                  })[Symbol.asyncIterator](),
                  hH,
                  ZH = !1,
                  bH = {};
                try {
                  while (!0) {
                    let SH = Date.now() - n;
                    if (!OyH && !XH && SH >= ig1 && w.setToolJSX)
                      (XH = !0),
                        w.setToolJSX({
                          jsx: Ea6.createElement(pkH, null),
                          shouldHidePromptInput: !1,
                          shouldContinueAnimation: !0,
                          showSpinner: !0,
                        });
                    let VH = NH.next(),
                      yH = s
                        ? await Promise.race([VH.then((BH) => ({ type: "message", result: BH })), s])
                        : { type: "message", result: await VH };
                    if (yH.type === "background" && t) {
                      let EH = w.getAppState().tasks[t];
                      if (pD(EH) && EH.isBackgrounded) {
                        let mH = t;
                        (jH = !0),
                          GH?.(),
                          Tg(vH, async () => {
                            let TH;
                            try {
                              await Promise.race([NH.return(void 0).catch(() => {}), Tq(1000)]);
                              let wH = aTH(),
                                dH = sTH(w.options.tools);
                              for (let tH of KH) y8H(wH, tH, dH, w.options.tools);
                              for await (let tH of av({
                                ...qH,
                                isAsync: !0,
                                override: { ...qH.override, agentId: Jz(mH), abortController: EH.abortController },
                                onCacheSafeParams: Ep()
                                  ? (D_) => {
                                      let { stop: w_ } = KaH(mH, Jz(mH), D_, R);
                                      TH = w_;
                                    }
                                  : void 0,
                              })) {
                                KH.push(tH), y8H(wH, tH, dH, w.options.tools), unH(mH, nn(wH), R);
                                let D_ = Tb_(tH);
                                if (D_) zb_(wH, mH, w.toolUseId, q, M, D_);
                              }
                              let JH = Ob_(KH, mH, p);
                              eh_(JH, R);
                              let LH = u4(
                                JH.content,
                                `
`,
                              );
                              {
                                let tH = w.getAppState(),
                                  D_ = await Ab_({
                                    agentMessages: KH,
                                    tools: w.options.tools,
                                    toolPermissionContext: tH.toolPermissionContext,
                                    abortSignal: EH.abortController.signal,
                                    subagentType: v.agentType,
                                    totalToolUseCount: JH.totalToolUseCount,
                                  });
                                if (D_)
                                  LH = `${D_}

${LH}`;
                              }
                              let xH = await DH();
                              V8H({
                                taskId: mH,
                                description: q,
                                status: "completed",
                                setAppState: R,
                                finalMessage: LH,
                                usage: {
                                  totalTokens: InH(wH),
                                  toolUses: JH.totalToolUseCount,
                                  durationMs: JH.totalDurationMs,
                                },
                                toolUseId: w.toolUseId,
                                ...xH,
                              });
                            } catch (wH) {
                              if (wH instanceof N5) {
                                S8H(mH, R),
                                  Q("tengu_agent_tool_terminated", {
                                    agent_type: p.agentType,
                                    model: p.resolvedAgentModel,
                                    duration_ms: Date.now() - p.startTime,
                                    is_async: !0,
                                    is_built_in_agent: p.isBuiltInAgent,
                                    reason: "user_cancel_background",
                                  });
                                let LH = await DH(),
                                  xH = jF6(KH);
                                V8H({
                                  taskId: mH,
                                  description: q,
                                  status: "killed",
                                  setAppState: R,
                                  toolUseId: w.toolUseId,
                                  finalMessage: xH,
                                  ...LH,
                                }),
                                  setTimeout(Un.bind(null, mH, R), _LH);
                                return;
                              }
                              let dH = QH(wH);
                              Hy_(mH, dH, R);
                              let JH = await DH();
                              V8H({
                                taskId: mH,
                                description: q,
                                status: "failed",
                                error: dH,
                                setAppState: R,
                                toolUseId: w.toolUseId,
                                ...JH,
                              });
                            } finally {
                              TH?.(), cs(fH), diH(fH);
                            }
                          });
                        let FH = w.options.tools.some((TH) => CK(TH, cq) || CK(TH, Lq));
                        return {
                          data: {
                            isAsync: !0,
                            status: "async_launched",
                            agentId: mH,
                            description: q,
                            prompt: H,
                            outputFile: I5(mH),
                            canReadOutputFile: FH,
                          },
                        };
                      }
                    }
                    if (yH.type !== "message") continue;
                    let { result: sH } = yH;
                    if (sH.done) break;
                    let zH = sH.value;
                    if ((KH.push(zH), y8H(l, zH, a, w.options.tools), t)) {
                      let BH = Tb_(zH);
                      if (BH) {
                        if ((zb_(l, t, w.toolUseId, q, n, BH), Ep())) unH(t, nn(l), R);
                      }
                    }
                    if (
                      zH.type === "progress" &&
                      (zH.data.type === "bash_progress" || zH.data.type === "powershell_progress") &&
                      j
                    )
                      j({ toolUseID: zH.toolUseID, data: zH.data });
                    if (zH.type !== "assistant" && zH.type !== "user") continue;
                    if (zH.type === "assistant") {
                      let BH = bv_(zH);
                      if (BH > 0) w.setResponseLength((EH) => EH + BH);
                    }
                    let WH = bj([zH]);
                    for (let BH of WH)
                      for (let EH of BH.message.content) {
                        if (EH.type !== "tool_use" && EH.type !== "tool_result") continue;
                        if (j)
                          j({
                            toolUseID: `agent_${D.message.id}`,
                            data: { message: BH, type: "agent_progress", prompt: "", agentId: fH },
                          });
                      }
                  }
                } catch (SH) {
                  if (SH instanceof N5)
                    throw (
                      ((ZH = !0),
                      Q("tengu_agent_tool_terminated", {
                        agent_type: p.agentType,
                        model: p.resolvedAgentModel,
                        duration_ms: Date.now() - p.startTime,
                        is_async: !1,
                        is_built_in_agent: p.isBuiltInAgent,
                        reason: "user_cancel_sync",
                      }),
                      SH)
                    );
                  N(`Sync agent error: ${QH(SH)}`, { level: "error" }), (hH = p6(SH));
                } finally {
                  if (w.setToolJSX) w.setToolJSX(null);
                  if ((GH?.(), t)) {
                    if ((nX7(t, R), !jH)) {
                      let SH = nn(l);
                      Fn({
                        type: "system",
                        subtype: "task_notification",
                        task_id: t,
                        tool_use_id: w.toolUseId,
                        status: hH ? "failed" : ZH ? "stopped" : "completed",
                        output_file: "",
                        summary: q,
                        usage: { total_tokens: SH.tokenCount, tool_uses: SH.toolUseCount, duration_ms: Date.now() - n },
                      });
                    }
                  }
                  if ((cs(fH), !jH)) diH(fH);
                  if ((OH?.(), !jH)) bH = await DH();
                }
                let nH = KH.findLast((SH) => SH.type !== "system" && SH.type !== "progress");
                if (nH && rfH(nH))
                  throw (
                    (Q("tengu_agent_tool_terminated", {
                      agent_type: p.agentType,
                      model: p.resolvedAgentModel,
                      duration_ms: Date.now() - p.startTime,
                      is_async: !1,
                      is_built_in_agent: p.isBuiltInAgent,
                      reason: "user_cancel_sync",
                    }),
                    new N5())
                  );
                if (hH) {
                  if (!KH.some((VH) => VH.type === "assistant")) throw hH;
                  N(`Sync agent recovering from error with ${KH.length} messages`);
                }
                let __ = Ob_(KH, fH, p);
                {
                  let SH = w.getAppState(),
                    VH = await Ab_({
                      agentMessages: KH,
                      tools: w.options.tools,
                      toolPermissionContext: SH.toolPermissionContext,
                      abortSignal: w.abortController.signal,
                      subagentType: v.agentType,
                      totalToolUseCount: __.totalToolUseCount,
                    });
                  if (VH) __.content = [{ type: "text", text: VH }, ...__.content];
                }
                return { data: { status: "completed", prompt: H, ...__, ...bH } };
              }),
            );
          }
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          let _ = H,
            q = [_.subagent_type, _.mode ? `mode=${_.mode}` : void 0].filter((K) => K !== void 0);
          return `${q.length > 0 ? `(${q.join(", ")}): ` : ": "}${_.prompt}`;
        },
        isConcurrencySafe() {
          return !0;
        },
        isEnabled() {
          return !0;
        },
        userFacingName: no6,
        userFacingNameBackgroundColor: ro6,
        getActivityDescription(H) {
          return H?.description ?? "Running task";
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return { behavior: "allow", updatedInput: H };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let q = H;
          if (typeof q === "object" && q !== null && "status" in q && q.status === "teammate_spawned") {
            let $ = q;
            return {
              tool_use_id: _,
              type: "tool_result",
              content: [
                {
                  type: "text",
                  text: `Spawned successfully.
agent_id: ${$.teammate_id}
name: ${$.name}
team_name: ${$.team_name}
The agent is now running and will receive instructions via mailbox.`,
                },
              ],
            };
          }
          if ("status" in q && q.status === "remote_launched") {
            let $ = q;
            return {
              tool_use_id: _,
              type: "tool_result",
              content: [
                {
                  type: "text",
                  text: `Remote agent launched in CCR.
taskId: ${$.taskId}
session_url: ${$.sessionUrl}
output_file: ${$.outputFile}
The agent is running remotely. You will be notified automatically when it completes.
Briefly tell the user what you launched and end your response.`,
                },
              ],
            };
          }
          if (H.status === "async_launched") {
            let $ = `Async agent launched successfully.
agentId: ${H.agentId} (internal ID - do not mention to user. Use SendMessage with to: '${H.agentId}' to continue this agent.)
The agent is working in the background. You will be notified automatically when it completes.`,
              K = H.canReadOutputFile
                ? `Do not duplicate this agent's work \u2014 avoid working with the same files or topics it is using. Work on non-overlapping tasks, or briefly tell the user what you launched and end your response.
output_file: ${H.outputFile}
If asked, you can check progress before completion by using ${cq} or ${Lq} tail on the output file.`
                : "Briefly tell the user what you launched and end your response. Do not generate any other text \u2014 agent results will arrive in a subsequent message.",
              O = `${$}
${K}`;
            return { tool_use_id: _, type: "tool_result", content: [{ type: "text", text: O }] };
          }
          if (H.status === "completed") {
            let $ = H,
              K = $.worktreePath
                ? `
worktreePath: ${$.worktreePath}
worktreeBranch: ${$.worktreeBranch}`
                : "",
              O =
                H.content.length > 0
                  ? H.content
                  : [{ type: "text", text: "(Subagent completed but returned no output.)" }];
            if (H.agentType && uX8.has(H.agentType) && !K) return { tool_use_id: _, type: "tool_result", content: O };
            return {
              tool_use_id: _,
              type: "tool_result",
              content: [
                ...O,
                {
                  type: "text",
                  text: `agentId: ${H.agentId} (use SendMessage with to: '${H.agentId}' to continue this agent)${K}
<usage>total_tokens: ${H.totalTokens}
tool_uses: ${H.totalToolUseCount}
duration_ms: ${H.totalDurationMs}</usage>`,
                },
              ],
            };
          }
          throw Error(`Unexpected agent tool result status: ${H.status}`);
        },
        renderToolResultMessage: Qe7,
        renderToolUseMessage: le7,
        renderToolUseTag: ie7,
        renderToolUseProgressMessage: ihH,
        renderToolUseRejectedMessage: ne7,
        renderToolUseErrorMessage: re7,
        renderGroupedToolUse: oe7,
      });

    jx();
    k_();
    MT();
    H_();
    dw();
    cM();
    nhH();
    x8();
    k_();
    A3();
    L_();
    ju();
    h_();
    rZ();
    Bk();
    q8();
    H7();
    Ag_();
    ix();
    x7H();
    jTH();
    W_9();
    (_d1 = pH(() =>
      h.object({
        skill: h.string().describe('The skill name. E.g., "commit", "review-pr", or "pdf"'),
        args: h.string().optional().describe("Optional arguments for the skill"),
      }),
    )),
      (qd1 = pH(() => {
        let H = h.object({
            success: h.boolean().describe("Whether the skill is valid"),
            commandName: h.string().describe("The name of the skill"),
            allowedTools: h.array(h.string()).optional().describe("Tools allowed by this skill"),
            model: h.string().optional().describe("Model override if specified"),
            status: h.literal("inline").optional().describe("Execution status"),
          }),
          _ = h.object({
            success: h.boolean().describe("Whether the skill completed successfully"),
            commandName: h.string().describe("The name of the skill"),
            status: h.literal("forked").describe("Execution status"),
            agentId: h.string().describe("The ID of the sub-agent that executed the skill"),
            result: h.string().describe("The result from the forked skill execution"),
          });
        return h.union([H, _]);
      })),
      (a7H = {
        name: Cw,
        searchHint: "invoke a slash-command skill",
        maxResultSizeChars: 1e5,
        get inputSchema() {
          return _d1();
        },
        get outputSchema() {
          return qd1();
        },
        description: async ({ skill: H }) => `Execute skill: ${H}`,
        prompt: async () => jv_(v5()),
        userFacingName: () => Cw,
        isConcurrencySafe: () => !1,
        isEnabled: () => !0,
        isReadOnly: () => !1,
        toAutoClassifierInput: ({ skill: H }) => H ?? "",
        async validateInput({ skill: H }, _) {
          let q = H.trim();
          if (!q) return { result: !1, message: `Invalid skill format: ${H}`, errorCode: 1 };
          let $ = q.startsWith("/");
          if ($) Q("tengu_skill_tool_slash_prefix", {});
          let K = $ ? q.substring(1) : q,
            O = await ba6(_),
            T = YF(K, O);
          if (!T) return { result: !1, message: `Unknown skill: ${K}`, errorCode: 2 };
          if (T.disableModelInvocation)
            return {
              result: !1,
              message: `Skill ${K} cannot be used with ${Cw} tool due to disable-model-invocation`,
              errorCode: 4,
            };
          if (T.type !== "prompt")
            return { result: !1, message: `Skill ${K} is not a prompt-based skill`, errorCode: 5 };
          return { result: !0 };
        },
        async checkPermissions({ skill: H, args: _ }, q) {
          let $ = H.trim(),
            K = $.startsWith("/") ? $.substring(1) : $,
            T = q.getAppState().toolPermissionContext,
            z = await ba6(q),
            A = YF(K, z),
            f = (j) => {
              let M = j.startsWith("/") ? j.substring(1) : j;
              if (M === K) return !0;
              if (M.endsWith(":*")) {
                let J = M.slice(0, -2);
                return K.startsWith(J);
              }
              return !1;
            },
            w = Ux(T, a7H, "deny");
          for (let [j, M] of w.entries())
            if (f(j))
              return {
                behavior: "deny",
                message: "Skill execution blocked by permission rules",
                decisionReason: { type: "rule", rule: M },
              };
          let Y = Ux(T, a7H, "allow");
          for (let [j, M] of Y.entries())
            if (f(j))
              return {
                behavior: "allow",
                updatedInput: { skill: H, args: _ },
                decisionReason: { type: "rule", rule: M },
              };
          if (A?.type === "prompt" && Kd1(A))
            return { behavior: "allow", updatedInput: { skill: H, args: _ }, decisionReason: void 0 };
          let D = [
            {
              type: "addRules",
              rules: [{ toolName: Cw, ruleContent: K }],
              behavior: "allow",
              destination: "localSettings",
            },
            {
              type: "addRules",
              rules: [{ toolName: Cw, ruleContent: `${K}:*` }],
              behavior: "allow",
              destination: "localSettings",
            },
          ];
          return {
            behavior: "ask",
            message: `Execute skill: ${K}`,
            decisionReason: void 0,
            suggestions: D,
            updatedInput: { skill: H, args: _ },
            metadata: A ? { command: A } : void 0,
          };
        },
        async call({ skill: H, args: _ }, q, $, K, O) {
          let T = H.trim(),
            z = T.startsWith("/") ? T.substring(1) : T,
            A = await ba6(q),
            f = YF(z, A);
          if ((zg_(z), f?.type === "prompt" && f.context === "fork")) return Hd1(f, z, _, q, $, K, O);
          let { processPromptSlashCommand: w } = await Promise.resolve().then(() => (wg_(), fg_)),
            Y = await w(z, _ || "", A, q);
          if (!Y.shouldQuery) throw Error("Command processing failed");
          let D = Y.allowedTools || [],
            j = Y.model,
            M = f?.type === "prompt" ? f.effort : void 0,
            J = wF().has(z),
            P = f?.type === "prompt" && f.source === "bundled",
            X = f?.type === "prompt" && G_9(f),
            R = J || P || X ? z : "custom",
            W = {},
            Z = f?.type === "prompt" && f.pluginInfo ? j7(f.pluginInfo.repository).marketplace : void 0,
            k = q.queryTracking?.depth ?? 0,
            v = Du()?.agentId;
          Q("tengu_skill_tool_invocation", {
            command_name: R,
            _PROTO_skill_name: z,
            execution_context: "inline",
            invocation_trigger: k > 0 ? "nested-skill" : "claude-proactive",
            query_depth: k,
            ...(v && { parent_agent_id: v }),
            ...W,
            ...!1,
            ...(f?.type === "prompt" &&
              f.pluginInfo && {
                _PROTO_plugin_name: f.pluginInfo.pluginManifest.name,
                ...(Z && { _PROTO_marketplace_name: Z }),
                plugin_name: X ? f.pluginInfo.pluginManifest.name : "third-party",
                plugin_repository: X ? f.pluginInfo.repository : "third-party",
                ...BfH(f.pluginInfo),
              }),
          });
          let y = j_9(K, Cw),
            E = D_9(
              Y.messages.filter((S) => {
                if (S.type === "progress") return !1;
                if (S.type === "user" && "message" in S) {
                  let x = S.message.content;
                  if (typeof x === "string" && x.includes(`<${JM}>`)) return !1;
                }
                return !0;
              }),
              y,
            );
          return (
            N(`SkillTool returning ${E.length} newMessages for skill ${z}`),
            {
              data: { success: !0, commandName: z, allowedTools: D.length > 0 ? D : void 0, model: j },
              newMessages: E,
              contextModifier(S) {
                let x = S;
                if (D.length > 0) {
                  let I = x.getAppState;
                  x = {
                    ...x,
                    getAppState() {
                      let B = I();
                      return {
                        ...B,
                        toolPermissionContext: {
                          ...B.toolPermissionContext,
                          alwaysAllowRules: {
                            ...B.toolPermissionContext.alwaysAllowRules,
                            command: [...new Set([...(B.toolPermissionContext.alwaysAllowRules.command || []), ...D])],
                          },
                        },
                      };
                    },
                  };
                }
                if (j) x = { ...x, options: { ...x.options, mainLoopModel: bpH(j, S.options.mainLoopModel) } };
                if (M !== void 0) {
                  let I = x.getAppState;
                  x = {
                    ...x,
                    getAppState() {
                      return { ...I(), effortValue: M };
                    },
                  };
                }
                return x;
              },
            }
          );
        },
        mapToolResultToToolResultBlockParam(H, _) {
          if ("status" in H && H.status === "forked")
            return {
              type: "tool_result",
              tool_use_id: _,
              content: `Skill "${H.commandName}" completed (forked execution).

Result:
${H.result}`,
            };
          return { type: "tool_result", tool_use_id: _, content: `Launching skill: ${H.commandName}` };
        },
        renderToolResultMessage: M_9,
        renderToolUseMessage: J_9,
        renderToolUseProgressMessage: bg_,
        renderToolUseRejectedMessage: P_9,
        renderToolUseErrorMessage: X_9,
      }),
      ($d1 = new Set([
        "type",
        "progressMessage",
        "contentLength",
        "argNames",
        "model",
        "effort",
        "source",
        "pluginInfo",
        "disableNonInteractive",
        "skillRoot",
        "context",
        "agent",
        "getPromptForCommand",
        "frontmatterKeys",
        "name",
        "description",
        "hasUserSpecifiedDescription",
        "isEnabled",
        "isHidden",
        "aliases",
        "isMcp",
        "argumentHint",
        "whenToUse",
        "paths",
        "version",
        "disableModelInvocation",
        "userInvocable",
        "loadedFrom",
        "immediate",
        "userFacingName",
      ]));

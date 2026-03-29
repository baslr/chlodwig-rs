    x8();
    k_();
    L_();
    uO();
    H_();
    ut6();
    N_();
    BD();
    F_();
    l5();
    lD();
    CO();
    H99();
    (q99 = require("fs/promises")),
      (_99 = Rq(T9H)),
      (NyH = (Nj(), Rq(K99))),
      (GQ1 = pH(() =>
        h.object({
          tool: h.enum(["Bash"]).describe("The tool this prompt applies to"),
          prompt: h.string().describe('Semantic description of the action, e.g. "run tests", "install dependencies"'),
        }),
      )),
      ($99 = pH(() =>
        h
          .strictObject({
            allowedPrompts: h
              .array(GQ1())
              .optional()
              .describe(
                "Prompt-based permissions needed to implement the plan. These describe categories of actions rather than specific commands.",
              ),
          })
          .passthrough(),
      )),
      (jYT = pH(() =>
        $99().extend({
          plan: h.string().optional().describe("The plan content (injected by normalizeToolInput from disk)"),
          planFilePath: h.string().optional().describe("The plan file path (injected by normalizeToolInput)"),
        }),
      )),
      (RQ1 = pH(() =>
        h.object({
          plan: h.string().nullable().describe("The plan that was presented to the user"),
          isAgent: h.boolean(),
          filePath: h.string().optional().describe("The file path where the plan was saved"),
          hasTaskTool: h.boolean().optional().describe("Whether the Agent tool is available in the current context"),
          planWasEdited: h
            .boolean()
            .optional()
            .describe(
              "True when the user edited the plan (CCR web UI or Ctrl+G); determines whether the plan is echoed back in tool_result",
            ),
          awaitingLeaderApproval: h
            .boolean()
            .optional()
            .describe("When true, the teammate has sent a plan approval request to the team leader"),
          requestId: h.string().optional().describe("Unique identifier for the plan approval request"),
        }),
      )),
      (xP = {
        name: Vj,
        searchHint: "present plan for approval and start coding (plan mode only)",
        maxResultSizeChars: 1e5,
        async description() {
          return "Prompts the user to exit plan mode and start coding";
        },
        async prompt() {
          return a79;
        },
        get inputSchema() {
          return $99();
        },
        get outputSchema() {
          return RQ1();
        },
        userFacingName() {
          return "";
        },
        shouldDefer: !0,
        isEnabled() {
          if (OD().length > 0) return !1;
          return !0;
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput() {
          return "";
        },
        requiresUserInteraction() {
          if (Q5()) return !1;
          return !0;
        },
        async validateInput(H, { getAppState: _, options: q }) {
          if (Q5()) return { result: !0 };
          let $ = _().toolPermissionContext.mode;
          if ($ !== "plan")
            return (
              Q("tengu_exit_plan_mode_called_outside_plan", {
                model: q.mainLoopModel,
                mode: $,
                hasExitedPlanModeInSession: HbH(),
              }),
              {
                result: !1,
                message:
                  "You are not in plan mode. This tool is only for exiting plan mode after writing a plan. If your plan was already approved, continue with implementation.",
                errorCode: 1,
              }
            );
          return { result: !0 };
        },
        async checkPermissions(H, _) {
          if (Q5()) return { behavior: "allow", updatedInput: H };
          return { behavior: "ask", message: "Exit plan mode?", updatedInput: H };
        },
        renderToolUseMessage: s79,
        renderToolResultMessage: t79,
        renderToolUseRejectedMessage: e79,
        async call(H, _) {
          let q = !!_.agentId,
            $ = oM(_.agentId),
            K = "plan" in H && typeof H.plan === "string" ? H.plan : void 0,
            O = K ?? pj(_.agentId);
          if (K !== void 0 && $) await q99.writeFile($, K, "utf-8").catch((f) => AH(f)), WV_();
          if (Q5() && wcH()) {
            if (!O)
              throw Error(
                `No plan file found at ${$}. Please write your plan to this file before calling ExitPlanMode.`,
              );
            let f = _K() || "unknown",
              w = n4(),
              Y = DhH("plan_approval", ty(f, w || "default")),
              D = {
                type: "plan_approval_request",
                from: f,
                timestamp: new Date().toISOString(),
                planFilePath: $,
                planContent: O,
                requestId: Y,
              };
            await RK("team-lead", { from: f, text: gH(D), timestamp: new Date().toISOString() }, w);
            let j = _.getAppState(),
              M = xd_(f, j);
            if (M) It6(M, _.setAppState, !0);
            return { data: { plan: O, isAgent: !0, filePath: $, awaitingLeaderApproval: !0, requestId: Y } };
          }
          let T = _.getAppState(),
            z = null;
          {
            let f = T.toolPermissionContext.prePlanMode ?? "default";
            if (f === "auto" && !(NyH?.isAutoModeGateEnabled() ?? !1)) {
              let w = NyH?.getAutoModeUnavailableReason() ?? "circuit-breaker";
              (z = NyH?.getAutoModeUnavailableNotification(w) ?? "auto mode unavailable"),
                N(
                  `[auto-mode gate @ ExitPlanModeV2Tool] prePlanMode=${f} but gate is off (reason=${w}) \u2014 falling back to default on plan exit`,
                  { level: "warn" },
                );
            }
          }
          if (z)
            _.addNotification?.({
              key: "auto-mode-gate-plan-exit-fallback",
              text: `plan exit \u2192 default \xB7 ${z}`,
              priority: "immediate",
              color: "warning",
              timeoutMs: 1e4,
            });
          _.setAppState((f) => {
            if (f.toolPermissionContext.mode !== "plan") return f;
            _h(!0), $I(!0);
            let w = f.toolPermissionContext.prePlanMode ?? "default";
            {
              if (w === "auto" && !(NyH?.isAutoModeGateEnabled() ?? !1)) w = "default";
              let j = w === "auto",
                M = _99?.isAutoModeActive() ?? !1;
              if ((_99?.setAutoModeActive(j), M && !j)) P0(!0);
            }
            let Y = w === "auto",
              D = f.toolPermissionContext;
            if (Y) D = NyH?.stripDangerousPermissionsForAutoMode(D) ?? D;
            else if (f.toolPermissionContext.strippedDangerousRules) D = NyH?.restoreDangerousPermissions(D) ?? D;
            return { ...f, toolPermissionContext: { ...D, mode: w, prePlanMode: void 0 } };
          });
          let A = dq() && _.options.tools.some((f) => CK(f, M7));
          return {
            data: { plan: O, isAgent: q, filePath: $, hasTaskTool: A || void 0, planWasEdited: K !== void 0 || void 0 },
          };
        },
        mapToolResultToToolResultBlockParam(
          {
            isAgent: H,
            plan: _,
            filePath: q,
            hasTaskTool: $,
            planWasEdited: K,
            awaitingLeaderApproval: O,
            requestId: T,
          },
          z,
        ) {
          if (O)
            return {
              type: "tool_result",
              content: `Your plan has been submitted to the team lead for approval.

Plan file: ${q}

**What happens next:**
1. Wait for the team lead to review your plan
2. You will receive a message in your inbox with approval/rejection
3. If approved, you can proceed with implementation
4. If rejected, refine your plan based on the feedback

**Important:** Do NOT proceed until you receive approval. Check your inbox for response.

Request ID: ${T}`,
              tool_use_id: z,
            };
          if (H)
            return {
              type: "tool_result",
              content:
                'User has approved the plan. There is nothing else needed from you now. Please respond with "ok"',
              tool_use_id: z,
            };
          if (!_ || _.trim() === "")
            return {
              type: "tool_result",
              content: "User has approved exiting plan mode. You can now proceed.",
              tool_use_id: z,
            };
          let A = $
            ? `

If this plan can be broken down into multiple independent tasks, consider using the ${Qx} tool to create a team and parallelize the work.`
            : "";
          return {
            type: "tool_result",
            content: `User has approved your plan. You can now start coding. Start with updating your todo list if applicable

Your plan has been saved to: ${q}
You can refer back to it if needed during implementation.${A}

## ${K ? "Approved Plan (edited by user)" : "Approved Plan"}:
${_}`,
            tool_use_id: z,
          };
        },
      });

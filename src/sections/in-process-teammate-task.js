    x8();
    k_();
    nC();
    nM();
    $y_();
    KW();
    uO();
    H_();
    h_();
    XT();
    m8H();
    F_();
    NP();
    l5();
    lD();
    tt6();
    R49();
    (Fl1 = pH(() =>
      h.discriminatedUnion("type", [
        h.object({ type: h.literal("shutdown_request"), reason: h.string().optional() }),
        h.object({
          type: h.literal("shutdown_response"),
          request_id: h.string(),
          approve: xj(),
          reason: h.string().optional(),
        }),
        h.object({
          type: h.literal("plan_approval_response"),
          request_id: h.string(),
          approve: xj(),
          feedback: h.string().optional(),
        }),
      ]),
    )),
      (Ul1 = pH(() =>
        h.object({
          to: h.string().describe('Recipient: teammate name, or "*" for broadcast to all teammates'),
          summary: h
            .string()
            .optional()
            .describe("A 5-10 word summary shown as a preview in the UI (required when message is a string)"),
          message: h.union([h.string().describe("Plain text message content"), Fl1()]),
        }),
      ));
    tl1 = {
      name: TP,
      searchHint: "send messages to agent teammates (swarm protocol)",
      maxResultSizeChars: 1e5,
      userFacingName() {
        return "SendMessage";
      },
      get inputSchema() {
        return Ul1();
      },
      shouldDefer: !0,
      isEnabled() {
        return dq();
      },
      isConcurrencySafe(H) {
        return !1;
      },
      isReadOnly(H) {
        return typeof H.message === "string";
      },
      backfillObservableInput(H) {
        if ("type" in H) return;
        if (typeof H.to !== "string") return;
        if (H.to === "*") {
          if (((H.type = "broadcast"), typeof H.message === "string")) H.content = H.message;
        } else if (typeof H.message === "string") (H.type = "message"), (H.recipient = H.to), (H.content = H.message);
        else if (typeof H.message === "object" && H.message !== null) {
          let _ = H.message;
          if (((H.type = _.type), (H.recipient = H.to), _.request_id !== void 0)) H.request_id = _.request_id;
          if (_.approve !== void 0) H.approve = _.approve;
          let q = _.reason ?? _.feedback;
          if (q !== void 0) H.content = q;
        }
      },
      toAutoClassifierInput(H) {
        if (typeof H.message === "string") return `to ${H.to}: ${H.message}`;
        switch (H.message.type) {
          case "shutdown_request":
            return `shutdown_request to ${H.to}`;
          case "shutdown_response":
            return `shutdown_response ${H.message.approve ? "approve" : "reject"} ${H.message.request_id}`;
          case "plan_approval_response":
            return `plan_approval ${H.message.approve ? "approve" : "reject"} to ${H.to}`;
        }
      },
      async checkPermissions(H, _) {
        return { behavior: "allow", updatedInput: H };
      },
      async validateInput(H, _) {
        if (H.to.trim().length === 0) return { result: !1, message: "to must not be empty", errorCode: 9 };
        let q = cl1(H.to);
        if ((q.scheme === "bridge" || q.scheme === "uds") && q.target.trim().length === 0)
          return { result: !1, message: "address target must not be empty", errorCode: 9 };
        if (H.to.includes("@"))
          return {
            result: !1,
            message: 'to must be a bare teammate name or "*" \u2014 there is only one team per session',
            errorCode: 9,
          };
        if (typeof H.message === "string") {
          if (!H.summary || H.summary.trim().length === 0)
            return { result: !1, message: "summary is required when message is a string", errorCode: 9 };
          return { result: !0 };
        }
        if (H.to === "*")
          return { result: !1, message: 'structured messages cannot be broadcast (to: "*")', errorCode: 9 };
        if (H.message.type === "shutdown_response" && H.to !== x5)
          return { result: !1, message: `shutdown_response must be sent to "${x5}"`, errorCode: 9 };
        if (
          H.message.type === "shutdown_response" &&
          !H.message.approve &&
          (!H.message.reason || H.message.reason.trim().length === 0)
        )
          return { result: !1, message: "reason is required when rejecting a shutdown request", errorCode: 9 };
        return { result: !0 };
      },
      async description() {
        return P49;
      },
      async prompt() {
        return X49();
      },
      mapToolResultToToolResultBlockParam(H, _) {
        return { tool_use_id: _, type: "tool_result", content: [{ type: "text", text: gH(H) }] };
      },
      async call(H, _, q, $) {
        if (typeof H.message === "string" && H.to !== "*") {
          let K = _.getAppState(),
            T = K.agentNameRegistry.get(H.to) ?? hX7(H.to);
          if (T) {
            let z = K.tasks[T];
            if (pD(z) && !qy_(z)) {
              if (z.status === "running")
                return (
                  sh_(T, H.message, _.setAppStateForTasks ?? _.setAppState),
                  { data: { success: !0, message: `Message queued for delivery to ${H.to} at its next tool round.` } }
                );
              try {
                let A = await EH_({
                  agentId: T,
                  prompt: H.message,
                  toolUseContext: _,
                  canUseTool: q,
                  invokingRequestId: $?.requestId,
                });
                return {
                  data: {
                    success: !0,
                    message: `Agent "${H.to}" was stopped (${z.status}); resumed it in the background with your message. You'll be notified when it finishes. Output: ${A.outputFile}`,
                  },
                };
              } catch (A) {
                return {
                  data: {
                    success: !1,
                    message: `Agent "${H.to}" is stopped (${z.status}) and could not be resumed: ${QH(A)}`,
                  },
                };
              }
            } else
              try {
                let A = await EH_({
                  agentId: T,
                  prompt: H.message,
                  toolUseContext: _,
                  canUseTool: q,
                  invokingRequestId: $?.requestId,
                });
                return {
                  data: {
                    success: !0,
                    message: `Agent "${H.to}" had no active task; resumed from transcript in the background with your message. You'll be notified when it finishes. Output: ${A.outputFile}`,
                  },
                };
              } catch (A) {
                return {
                  data: {
                    success: !1,
                    message: `Agent "${H.to}" is registered but has no transcript to resume. It may have been cleaned up. (${QH(A)})`,
                  },
                };
              }
          }
        }
        if (typeof H.message === "string") {
          if (H.to === "*") return il1(H.message, H.summary, _);
          return ll1(H.to, H.message, H.summary, _);
        }
        if (H.to === "*") throw Error("structured messages cannot be broadcast");
        switch (H.message.type) {
          case "shutdown_request":
            return nl1(H.to, H.message.reason, _);
          case "shutdown_response":
            if (H.message.approve) return rl1(H.message.request_id, _);
            return ol1(H.message.request_id, H.message.reason);
          case "plan_approval_response":
            if (H.message.approve) return al1(H.to, H.message.request_id, _);
            return sl1(H.to, H.message.request_id, H.message.feedback ?? "Plan needs revision", _);
        }
      },
      renderToolUseMessage: W49,
      renderToolResultMessage: G49,
    };

    x8();
    t6();
    uO();
    xO();
    cw();
    l5();
    lD();
    CO();
    (Xl1 = pH(() => {
      let H = qAH().or(h.literal("deleted"));
      return h.strictObject({
        taskId: h.string().describe("The ID of the task to update"),
        subject: h.string().optional().describe("New subject for the task"),
        description: h.string().optional().describe("New description for the task"),
        activeForm: h
          .string()
          .optional()
          .describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
        status: H.optional().describe("New status for the task"),
        addBlocks: h.array(h.string()).optional().describe("Task IDs that this task blocks"),
        addBlockedBy: h.array(h.string()).optional().describe("Task IDs that block this task"),
        owner: h.string().optional().describe("New owner for the task"),
        metadata: h
          .record(h.string(), h.unknown())
          .optional()
          .describe("Metadata keys to merge into the task. Set a key to null to delete it."),
      });
    })),
      (Wl1 = pH(() =>
        h.object({
          success: h.boolean(),
          taskId: h.string(),
          updatedFields: h.array(h.string()),
          error: h.string().optional(),
          statusChange: h.object({ from: h.string(), to: h.string() }).optional(),
          verificationNudgeNeeded: h.boolean().optional(),
        }),
      )),
      (b$9 = {
        name: gy,
        searchHint: "update a task",
        maxResultSizeChars: 1e5,
        async description() {
          return E$9;
        },
        async prompt() {
          return C$9;
        },
        get inputSchema() {
          return Xl1();
        },
        get outputSchema() {
          return Wl1();
        },
        userFacingName() {
          return "TaskUpdate";
        },
        shouldDefer: !0,
        isEnabled() {
          return FY();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          let _ = [H.taskId];
          if (H.status) _.push(H.status);
          if (H.subject) _.push(H.subject);
          return _.join(" ");
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage() {
          return null;
        },
        async call(
          {
            taskId: H,
            subject: _,
            description: q,
            activeForm: $,
            status: K,
            owner: O,
            addBlocks: T,
            addBlockedBy: z,
            metadata: A,
          },
          f,
        ) {
          let w = dG();
          f.setAppState((J) => {
            if (J.expandedView === "tasks") return J;
            return { ...J, expandedView: "tasks" };
          });
          let Y = await fc(w, H);
          if (!Y) return { data: { success: !1, taskId: H, updatedFields: [], error: "Task not found" } };
          let D = [],
            j = {};
          if (_ !== void 0 && _ !== Y.subject) (j.subject = _), D.push("subject");
          if (q !== void 0 && q !== Y.description) (j.description = q), D.push("description");
          if ($ !== void 0 && $ !== Y.activeForm) (j.activeForm = $), D.push("activeForm");
          if (O !== void 0 && O !== Y.owner) (j.owner = O), D.push("owner");
          if (dq() && K === "in_progress" && O === void 0 && !Y.owner) {
            let J = _K();
            if (J) (j.owner = J), D.push("owner");
          }
          if (A !== void 0) {
            let J = { ...(Y.metadata ?? {}) };
            for (let [P, X] of Object.entries(A))
              if (X === null) delete J[P];
              else J[P] = X;
            (j.metadata = J), D.push("metadata");
          }
          if (K !== void 0) {
            if (K === "deleted") {
              let J = await bC_(w, H);
              return {
                data: {
                  success: J,
                  taskId: H,
                  updatedFields: J ? ["deleted"] : [],
                  error: J ? void 0 : "Failed to delete task",
                  statusChange: J ? { from: Y.status, to: "deleted" } : void 0,
                },
              };
            }
            if (K !== Y.status) {
              if (K === "completed") {
                let J = [],
                  P = SH_(H, Y.subject, Y.description, _K(), n4(), void 0, f?.abortController?.signal, void 0, f);
                for await (let X of P) if (X.blockingError) J.push(VH_(X.blockingError));
                if (J.length > 0)
                  return {
                    data: {
                      success: !1,
                      taskId: H,
                      updatedFields: [],
                      error: J.join(`
`),
                    },
                  };
              }
              (j.status = K), D.push("status");
            }
          }
          if (Object.keys(j).length > 0) await cx(w, H, j);
          if (j.owner && dq()) {
            let J = _K() || "team-lead",
              P = Zw(),
              X = JSON.stringify({
                type: "task_assignment",
                taskId: H,
                subject: Y.subject,
                description: Y.description,
                assignedBy: J,
                timestamp: new Date().toISOString(),
              });
            await RK(j.owner, { from: J, text: X, timestamp: new Date().toISOString(), color: P }, w);
          }
          if (T && T.length > 0) {
            let J = T.filter((P) => !Y.blocks.includes(P));
            for (let P of J) await bc6(w, H, P);
            if (J.length > 0) D.push("blocks");
          }
          if (z && z.length > 0) {
            let J = z.filter((P) => !Y.blockedBy.includes(P));
            for (let P of J) await bc6(w, P, H);
            if (J.length > 0) D.push("blockedBy");
          }
          let M = !1;
          return {
            data: {
              success: !0,
              taskId: H,
              updatedFields: D,
              statusChange: j.status !== void 0 ? { from: Y.status, to: j.status } : void 0,
              verificationNudgeNeeded: M,
            },
          };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let { success: q, taskId: $, updatedFields: K, error: O, statusChange: T, verificationNudgeNeeded: z } = H;
          if (!q) return { tool_use_id: _, type: "tool_result", content: O || `Task #${$} not found` };
          let A = `Updated task #${$} ${K.join(", ")}`;
          if (T?.to === "completed" && uM() && dq())
            A += `

Task completed. Call TaskList now to find your next available task or see if your work unblocked others.`;
          if (z)
            A += `

NOTE: You just closed out 3+ tasks and none of them was a verification step. Before writing your final summary, spawn the verification agent (subagent_type="${cK_}"). You cannot self-assign PARTIAL by listing caveats in your summary \u2014 only the verifier issues a verdict.`;
          return { tool_use_id: _, type: "tool_result", content: A };
        },
      });

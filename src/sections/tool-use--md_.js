    k_();
    x9();
    U5();
    yJ();
    x8();
    iH();
    Yc();
    (z99 = u(aH(), 1)),
      (rY = u(PH(), 1)),
      (LQ1 = pH(() =>
        h.object({
          label: h
            .string()
            .describe(
              "The display text for this option that the user will see and select. Should be concise (1-5 words) and clearly describe the choice.",
            ),
          description: h
            .string()
            .describe(
              "Explanation of what this option means or what will happen if chosen. Useful for providing context about trade-offs or implications.",
            ),
          preview: h
            .string()
            .optional()
            .describe(
              "Optional preview content rendered when this option is focused. Use for mockups, code snippets, or visual comparisons that help users compare options. See the tool description for the expected content format.",
            ),
        }),
      )),
      (A99 = pH(() =>
        h.object({
          question: h
            .string()
            .describe(
              'The complete question to ask the user. Should be clear, specific, and end with a question mark. Example: "Which library should we use for date formatting?" If multiSelect is true, phrase it accordingly, e.g. "Which features do you want to enable?"',
            ),
          header: h
            .string()
            .describe(
              `Very short label displayed as a chip/tag (max ${AC7} chars). Examples: "Auth method", "Library", "Approach".`,
            ),
          options: h
            .array(LQ1())
            .min(2)
            .max(4)
            .describe(
              "The available choices for this question. Must have 2-4 options. Each option should be a distinct, mutually exclusive choice (unless multiSelect is enabled). There should be no 'Other' option, that will be provided automatically.",
            ),
          multiSelect: h
            .boolean()
            .default(!1)
            .describe(
              "Set to true to allow the user to select multiple options instead of just one. Use when choices are not mutually exclusive.",
            ),
        }),
      )),
      (f99 = pH(() => {
        let H = h.object({
          preview: h
            .string()
            .optional()
            .describe("The preview content of the selected option, if the question used previews."),
          notes: h.string().optional().describe("Free-text notes the user added to their selection."),
        });
        return h
          .record(h.string(), H)
          .optional()
          .describe(
            "Optional per-question annotations from the user (e.g., notes on preview selections). Keyed by question text.",
          );
      })),
      (T99 = {
        check: (H) => {
          let _ = H.questions.map((q) => q.question);
          if (_.length !== new Set(_).size) return !1;
          for (let q of H.questions) {
            let $ = q.options.map((K) => K.label);
            if ($.length !== new Set($).size) return !1;
          }
          return !0;
        },
        message: "Question texts must be unique, option labels must be unique within each question",
      }),
      (kQ1 = pH(() => ({
        answers: h
          .record(h.string(), h.string())
          .optional()
          .describe("User answers collected by the permission component"),
        annotations: f99(),
        metadata: h
          .object({
            source: h
              .string()
              .optional()
              .describe(
                'Optional identifier for the source of this question (e.g., "remember" for /remember command). Used for analytics tracking.',
              ),
          })
          .optional()
          .describe("Optional metadata for tracking and analytics purposes. Not displayed to user."),
      }))),
      (vQ1 = pH(() =>
        h
          .strictObject({
            questions: h.array(A99()).min(1).max(4).describe("Questions to ask the user (1-4 questions)"),
            ...kQ1(),
          })
          .refine(T99.check, { message: T99.message }),
      )),
      (NQ1 = pH(() =>
        h.object({
          questions: h.array(A99()).describe("The questions that were asked"),
          answers: h
            .record(h.string(), h.string())
            .describe(
              "The answers provided by the user (question text -> answer string; multi-select answers are comma-separated)",
            ),
          annotations: f99(),
        }),
      ));
    hyH = {
      name: dO,
      searchHint: "prompt the user with a multiple-choice question",
      maxResultSizeChars: 1e5,
      shouldDefer: !0,
      async description() {
        return fC7;
      },
      async prompt() {
        let H = K$_();
        if (H === void 0) return lc6;
        return lc6 + wC7[H];
      },
      get inputSchema() {
        return vQ1();
      },
      get outputSchema() {
        return NQ1();
      },
      userFacingName() {
        return "";
      },
      isEnabled() {
        if (OD().length > 0) return !1;
        return !0;
      },
      isConcurrencySafe() {
        return !0;
      },
      isReadOnly() {
        return !0;
      },
      toAutoClassifierInput(H) {
        return H.questions.map((_) => _.question).join(" | ");
      },
      requiresUserInteraction() {
        return !0;
      },
      async validateInput({ questions: H }) {
        if (K$_() !== "html") return { result: !0 };
        for (let _ of H)
          for (let q of _.options) {
            let $ = VQ1(q.preview);
            if ($)
              return { result: !1, message: `Option "${q.label}" in question "${_.question}": ${$}`, errorCode: 1 };
          }
        return { result: !0 };
      },
      async checkPermissions(H) {
        return { behavior: "ask", message: "Answer questions?", updatedInput: H };
      },
      renderToolUseMessage() {
        return null;
      },
      renderToolUseProgressMessage() {
        return null;
      },
      renderToolResultMessage({ answers: H }, _) {
        return rY.createElement(hQ1, { answers: H });
      },
      renderToolUseRejectedMessage() {
        return rY.createElement(
          m,
          { flexDirection: "row", marginTop: 1 },
          rY.createElement(L, { color: FR("default") }, e1, "\xA0"),
          rY.createElement(L, null, "User declined to answer questions"),
        );
      },
      renderToolUseErrorMessage() {
        return null;
      },
      async call({ questions: H, answers: _ = {}, annotations: q }, $) {
        return { data: { questions: H, answers: _, ...(q && { annotations: q }) } };
      },
      mapToolResultToToolResultBlockParam({ answers: H, annotations: _ }, q) {
        return {
          type: "tool_result",
          content: `User has answered your questions: ${Object.entries(H)
            .map(([K, O]) => {
              let T = _?.[K],
                z = [`"${K}"="${O}"`];
              if (T?.preview)
                z.push(`selected preview:
${T.preview}`);
              if (T?.notes) z.push(`user notes: ${T.notes}`);
              return z.join(" ");
            })
            .join(", ")}. You can now continue with the user's answers in mind.`,
          tool_use_id: q,
        };
      },
    };

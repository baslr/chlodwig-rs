    x8();
    $c();
    I8();
    H_();
    h_();
    j9();
    n8();
    N_();
    h5();
    q5();
    L99();
    v99();
    I99();
    (x99 = require("fs/promises")),
      (Ft6 = u(require("path"))),
      (m99 = require("url")),
      (bQ1 = pH(() =>
        h.strictObject({
          operation: h
            .enum([
              "goToDefinition",
              "findReferences",
              "hover",
              "documentSymbol",
              "workspaceSymbol",
              "goToImplementation",
              "prepareCallHierarchy",
              "incomingCalls",
              "outgoingCalls",
            ])
            .describe("The LSP operation to perform"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
      )),
      (IQ1 = pH(() =>
        h.object({
          operation: h
            .enum([
              "goToDefinition",
              "findReferences",
              "hover",
              "documentSymbol",
              "workspaceSymbol",
              "goToImplementation",
              "prepareCallHierarchy",
              "incomingCalls",
              "outgoingCalls",
            ])
            .describe("The LSP operation that was performed"),
          result: h.string().describe("The formatted result of the LSP operation"),
          filePath: h.string().describe("The file path the operation was performed on"),
          resultCount: h
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe("Number of results (definitions, references, symbols)"),
          fileCount: h.number().int().nonnegative().optional().describe("Number of files containing results"),
        }),
      )),
      (Ut6 = {
        name: LH_,
        searchHint: "code intelligence (definitions, references, symbols, hover)",
        maxResultSizeChars: 1e5,
        isLsp: !0,
        async description() {
          return ct6;
        },
        userFacingName: S99,
        shouldDefer: !0,
        isEnabled() {
          return OV7();
        },
        get inputSchema() {
          return bQ1();
        },
        get outputSchema() {
          return IQ1();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput() {
          return "";
        },
        getPath({ filePath: H }) {
          return sq(H);
        },
        async validateInput(H) {
          let _ = k99().safeParse(H);
          if (!_.success) return { result: !1, message: `Invalid input: ${_.error.message}`, errorCode: 3 };
          let q = f_(),
            $ = sq(H.filePath);
          if ($.startsWith("\\\\") || $.startsWith("//")) return { result: !0 };
          let K;
          try {
            K = await q.stat($);
          } catch (O) {
            if (k8(O)) return { result: !1, message: `File does not exist: ${H.filePath}`, errorCode: 1 };
            let T = p6(O);
            return (
              AH(Error(`Failed to access file stats for LSP operation on ${H.filePath}: ${T.message}`)),
              { result: !1, message: `Cannot access file: ${H.filePath}. ${T.message}`, errorCode: 4 }
            );
          }
          if (!K.isFile()) return { result: !1, message: `Path is not a file: ${H.filePath}`, errorCode: 2 };
          return { result: !0 };
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return kqH(Ut6, H, q.toolPermissionContext);
        },
        async prompt() {
          return ct6;
        },
        renderToolUseMessage: E99,
        renderToolUseErrorMessage: C99,
        renderToolResultMessage: b99,
        async call(H, _) {
          let q = sq(H.filePath),
            $ = X_();
          if (bkH().status === "pending") await TV7();
          let O = Wr();
          if (!O)
            return (
              AH(Error("LSP server manager not initialized when tool was called")),
              {
                data: {
                  operation: H.operation,
                  result: "LSP server manager not initialized. This may indicate a startup issue.",
                  filePath: H.filePath,
                },
              }
            );
          let { method: T, params: z } = uQ1(H, q);
          try {
            if (!O.isFileOpen(q)) {
              let j = await x99.readFile(q, "utf-8");
              await O.openFile(q, j);
            }
            let A = await O.sendRequest(q, T, z);
            if (A === void 0)
              return (
                N(
                  `No LSP server available for file type ${Ft6.extname(q)} for operation ${H.operation} on file ${H.filePath}`,
                ),
                {
                  data: {
                    operation: H.operation,
                    result: `No LSP server available for file type: ${Ft6.extname(q)}`,
                    filePath: H.filePath,
                  },
                }
              );
            if (H.operation === "incomingCalls" || H.operation === "outgoingCalls") {
              let j = A;
              if (!j || j.length === 0)
                return {
                  data: {
                    operation: H.operation,
                    result: "No call hierarchy item found at this position",
                    filePath: H.filePath,
                    resultCount: 0,
                    fileCount: 0,
                  },
                };
              let M = H.operation === "incomingCalls" ? "callHierarchy/incomingCalls" : "callHierarchy/outgoingCalls";
              if (((A = await O.sendRequest(q, M, { item: j[0] })), A === void 0))
                N(`LSP server returned undefined for ${M} on ${H.filePath}`);
            }
            if (
              A &&
              Array.isArray(A) &&
              (H.operation === "findReferences" ||
                H.operation === "goToDefinition" ||
                H.operation === "goToImplementation" ||
                H.operation === "workspaceSymbol")
            )
              if (H.operation === "workspaceSymbol") {
                let j = A,
                  M = j.filter((X) => X?.location?.uri).map((X) => X.location),
                  J = await u99(M, $),
                  P = new Set(J.map((X) => X.uri));
                A = j.filter((X) => !X?.location?.uri || P.has(X.location.uri));
              } else {
                let j = A.map(gd_),
                  M = await u99(j, $),
                  J = new Set(M.map((P) => P.uri));
                A = A.filter((P) => {
                  let X = gd_(P);
                  return !X.uri || J.has(X.uri);
                });
              }
            let { formatted: f, resultCount: w, fileCount: Y } = pQ1(H.operation, A, $);
            return { data: { operation: H.operation, result: f, filePath: H.filePath, resultCount: w, fileCount: Y } };
          } catch (A) {
            let w = p6(A).message;
            return (
              AH(Error(`LSP tool request failed for ${H.operation} on ${H.filePath}: ${w}`)),
              {
                data: { operation: H.operation, result: `Error performing ${H.operation}: ${w}`, filePath: H.filePath },
              }
            );
          }
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: H.result };
        },
      });

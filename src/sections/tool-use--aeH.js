    Dv();
    x8();
    I8();
    h_();
    T7();
    jh();
    Hz();
    xg_();
    q5();
    F_();
    p_9();
    (t7H = require("path")),
      (jd1 = pH(() =>
        h.strictObject({
          notebook_path: h
            .string()
            .describe("The absolute path to the Jupyter notebook file to edit (must be absolute, not relative)"),
          cell_id: h
            .string()
            .optional()
            .describe(
              "The ID of the cell to edit. When inserting a new cell, the new cell will be inserted after the cell with this ID, or at the beginning if not specified.",
            ),
          new_source: h.string().describe("The new source for the cell"),
          cell_type: h
            .enum(["code", "markdown"])
            .optional()
            .describe(
              "The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required.",
            ),
          edit_mode: h
            .enum(["replace", "insert", "delete"])
            .optional()
            .describe("The type of edit to make (replace, insert, delete). Defaults to replace."),
        }),
      )),
      (Md1 = pH(() =>
        h.object({
          new_source: h.string().describe("The new source code that was written to the cell"),
          cell_id: h.string().optional().describe("The ID of the cell that was edited"),
          cell_type: h.enum(["code", "markdown"]).describe("The type of the cell"),
          language: h.string().describe("The programming language of the notebook"),
          edit_mode: h.string().describe("The edit mode that was used"),
          error: h.string().optional().describe("Error message if the operation failed"),
          notebook_path: h.string().describe("The path to the notebook file"),
          original_file: h.string().describe("The original notebook content before modification"),
          updated_file: h.string().describe("The updated notebook content after modification"),
        }),
      )),
      (So = {
        name: XG,
        searchHint: "edit Jupyter notebook cells (.ipynb)",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        async description() {
          return y_9;
        },
        async prompt() {
          return V_9;
        },
        userFacingName() {
          return "Edit Notebook";
        },
        getToolUseSummary: xa6,
        getActivityDescription(H) {
          let _ = xa6(H);
          return _ ? `Editing notebook ${_}` : "Editing notebook";
        },
        isEnabled() {
          return !0;
        },
        get inputSchema() {
          return jd1();
        },
        get outputSchema() {
          return Md1();
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          {
            let _ = H.edit_mode ?? "replace";
            return `${H.notebook_path} ${_}: ${H.new_source}`;
          }
          return "";
        },
        getPath(H) {
          return H.notebook_path;
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return szH(So, H, q.toolPermissionContext);
        },
        mapToolResultToToolResultBlockParam({ cell_id: H, edit_mode: _, new_source: q, error: $ }, K) {
          if ($) return { tool_use_id: K, type: "tool_result", content: $, is_error: !0 };
          switch (_) {
            case "replace":
              return { tool_use_id: K, type: "tool_result", content: `Updated cell ${H} with ${q}` };
            case "insert":
              return { tool_use_id: K, type: "tool_result", content: `Inserted cell ${H} with ${q}` };
            case "delete":
              return { tool_use_id: K, type: "tool_result", content: `Deleted cell ${H}` };
            default:
              return { tool_use_id: K, type: "tool_result", content: "Unknown edit mode" };
          }
        },
        renderToolUseMessage: I_9,
        renderToolUseRejectedMessage: u_9,
        renderToolUseErrorMessage: x_9,
        renderToolResultMessage: m_9,
        async validateInput({ notebook_path: H, cell_type: _, cell_id: q, edit_mode: $ = "replace" }) {
          let K = t7H.isAbsolute(H) ? H : t7H.resolve(X_(), H);
          if (K.startsWith("\\\\") || K.startsWith("//")) return { result: !0 };
          if (t7H.extname(K) !== ".ipynb")
            return {
              result: !1,
              message:
                "File must be a Jupyter notebook (.ipynb file). For editing other file types, use the FileEdit tool.",
              errorCode: 2,
            };
          if ($ !== "replace" && $ !== "insert" && $ !== "delete")
            return { result: !1, message: "Edit mode must be replace, insert, or delete.", errorCode: 4 };
          if ($ === "insert" && !_)
            return { result: !1, message: "Cell type is required when using edit_mode=insert.", errorCode: 5 };
          let O;
          try {
            O = np(K).content;
          } catch (z) {
            if (k8(z)) return { result: !1, message: "Notebook file does not exist.", errorCode: 1 };
            throw z;
          }
          let T = y$(O);
          if (!T) return { result: !1, message: "Notebook is not valid JSON.", errorCode: 6 };
          if (!q) {
            if ($ !== "insert")
              return { result: !1, message: "Cell ID must be specified when not inserting a new cell.", errorCode: 7 };
          } else if (T.cells.findIndex((A) => A.id === q) === -1) {
            let A = oeH(q);
            if (A !== void 0) {
              if (!T.cells[A])
                return { result: !1, message: `Cell with index ${A} does not exist in notebook.`, errorCode: 7 };
            } else return { result: !1, message: `Cell with ID "${q}" not found in notebook.`, errorCode: 8 };
          }
          return { result: !0 };
        },
        async call(
          { notebook_path: H, new_source: _, cell_id: q, cell_type: $, edit_mode: K },
          { readFileState: O, updateFileHistoryState: T },
          z,
          A,
        ) {
          let f = t7H.isAbsolute(H) ? H : t7H.resolve(X_(), H);
          if (BO()) await C8H(T, f, A.uuid);
          try {
            let { content: w, encoding: Y, lineEndings: D } = np(f),
              j;
            try {
              j = i_(w);
            } catch {
              return {
                data: {
                  new_source: _,
                  cell_type: $ ?? "code",
                  language: "python",
                  edit_mode: "replace",
                  error: "Notebook is not valid JSON.",
                  cell_id: q,
                  notebook_path: f,
                  original_file: "",
                  updated_file: "",
                },
              };
            }
            let M;
            if (!q) M = 0;
            else {
              if (((M = j.cells.findIndex((k) => k.id === q)), M === -1)) {
                let k = oeH(q);
                if (k !== void 0) M = k;
              }
              if (K === "insert") M += 1;
            }
            let J = K;
            if (J === "replace" && M === j.cells.length) {
              if (((J = "insert"), !$)) $ = "code";
            }
            let P = j.metadata.language_info?.name ?? "python",
              X = void 0;
            if (j.nbformat > 4 || (j.nbformat === 4 && j.nbformat_minor >= 5)) {
              if (J === "insert") X = Math.random().toString(36).substring(2, 15);
              else if (q !== null) X = q;
            }
            if (J === "delete") j.cells.splice(M, 1);
            else if (J === "insert") {
              let k;
              if ($ === "markdown") k = { cell_type: "markdown", id: X, source: _, metadata: {} };
              else k = { cell_type: "code", id: X, source: _, metadata: {}, execution_count: null, outputs: [] };
              j.cells.splice(M, 0, k);
            } else {
              let k = j.cells[M];
              if (((k.source = _), k.cell_type === "code")) (k.execution_count = null), (k.outputs = []);
              if ($ && $ !== k.cell_type) k.cell_type = $;
            }
            let W = gH(j, null, 1);
            return (
              O_H(f, W, Y, D),
              O.set(f, { content: W, timestamp: Qh(f), offset: void 0, limit: void 0 }),
              {
                data: {
                  new_source: _,
                  cell_type: $ ?? "code",
                  language: P,
                  edit_mode: J ?? "replace",
                  cell_id: X || void 0,
                  error: "",
                  notebook_path: f,
                  original_file: w,
                  updated_file: W,
                },
              }
            );
          } catch (w) {
            if (w instanceof Error)
              return {
                data: {
                  new_source: _,
                  cell_type: $ ?? "code",
                  language: "python",
                  edit_mode: "replace",
                  error: w.message,
                  cell_id: q,
                  notebook_path: f,
                  original_file: "",
                  updated_file: "",
                },
              };
            return {
              data: {
                new_source: _,
                cell_type: $ ?? "code",
                language: "python",
                edit_mode: "replace",
                error: "Unknown error occurred while editing notebook",
                cell_id: q,
                notebook_path: f,
                original_file: "",
                updated_file: "",
              },
            };
          }
        },
      });

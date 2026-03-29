    x8();
    MH6();
    t6();
    L_();
    GY();
    ek();
    Lr();
    I8();
    g_();
    h_();
    T7();
    PC_();
    n8();
    eE();
    N_();
    ih_();
    q8();
    H7();
    xg_();
    h5();
    MH8();
    tZ_();
    q5();
    eH_();
    enH();
    F_();
    JH8();
    MO();
    BK9();
    (dc_ = require("fs/promises")),
      (WwH = u(require("path"))),
      (cc_ = require("path")),
      (Tr1 = new Set([
        "/dev/zero",
        "/dev/random",
        "/dev/urandom",
        "/dev/full",
        "/dev/stdin",
        "/dev/tty",
        "/dev/console",
        "/dev/stdout",
        "/dev/stderr",
        "/dev/fd/0",
        "/dev/fd/1",
        "/dev/fd/2",
      ]));
    Ar1 = String.fromCharCode(8239);
    wr1 = [];
    Fc_ = class Fc_ extends Error {
      tokenCount;
      maxTokens;
      constructor(H, _) {
        super(
          `File content (${H} tokens) exceeds maximum allowed tokens (${_}). Use offset and limit parameters to read specific portions of the file, or search for specific content instead of reading the whole file.`,
        );
        this.tokenCount = H;
        this.maxTokens = _;
        this.name = "MaxFileReadTokenExceededError";
      }
    };
    cK9 = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
    (Dr1 = pH(() =>
      h.strictObject({
        file_path: h.string().describe("The absolute path to the file to read"),
        offset: Mv(h.number().optional()).describe(
          "The line number to start reading from. Only provide if the file is too large to read at once",
        ),
        limit: Mv(h.number().optional()).describe(
          "The number of lines to read. Only provide if the file is too large to read at once.",
        ),
        pages: h
          .string()
          .optional()
          .describe(
            `Page range for PDF files (e.g., "1-5", "3", "10-20"). Only applicable to PDF files. Maximum ${JTH} pages per request.`,
          ),
      }),
    )),
      (jr1 = pH(() => {
        let H = h.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]);
        return h.discriminatedUnion("type", [
          h.object({
            type: h.literal("text"),
            file: h.object({
              filePath: h.string().describe("The path to the file that was read"),
              content: h.string().describe("The content of the file"),
              numLines: h.number().describe("Number of lines in the returned content"),
              startLine: h.number().describe("The starting line number"),
              totalLines: h.number().describe("Total number of lines in the file"),
            }),
          }),
          h.object({
            type: h.literal("image"),
            file: h.object({
              base64: h.string().describe("Base64-encoded image data"),
              type: H.describe("The MIME type of the image"),
              originalSize: h.number().describe("Original file size in bytes"),
              dimensions: h
                .object({
                  originalWidth: h.number().optional().describe("Original image width in pixels"),
                  originalHeight: h.number().optional().describe("Original image height in pixels"),
                  displayWidth: h.number().optional().describe("Displayed image width in pixels (after resizing)"),
                  displayHeight: h.number().optional().describe("Displayed image height in pixels (after resizing)"),
                })
                .optional()
                .describe("Image dimension info for coordinate mapping"),
            }),
          }),
          h.object({
            type: h.literal("notebook"),
            file: h.object({
              filePath: h.string().describe("The path to the notebook file"),
              cells: h.array(h.any()).describe("Array of notebook cells"),
            }),
          }),
          h.object({
            type: h.literal("pdf"),
            file: h.object({
              filePath: h.string().describe("The path to the PDF file"),
              base64: h.string().describe("Base64-encoded PDF data"),
              originalSize: h.number().describe("Original file size in bytes"),
            }),
          }),
          h.object({
            type: h.literal("parts"),
            file: h.object({
              filePath: h.string().describe("The path to the PDF file"),
              originalSize: h.number().describe("Original file size in bytes"),
              count: h.number().describe("Number of pages extracted"),
              outputDir: h.string().describe("Directory containing extracted page images"),
            }),
          }),
          h.object({
            type: h.literal("file_unchanged"),
            file: h.object({ filePath: h.string().describe("The path to the file") }),
          }),
        ]);
      })),
      (w5 = {
        name: cq,
        searchHint: "read files, images, PDFs, notebooks",
        maxResultSizeChars: 1 / 0,
        strict: !0,
        async description() {
          return ytq;
        },
        async prompt() {
          let H = XwH(),
            _ = H.includeMaxSizeInPrompt
              ? `. Files larger than ${t7(H.maxSizeBytes)} will return an error; use offset and limit for larger files`
              : "",
            q = H.targetedRangeNudge ? Etq : Stq;
          return Ctq(Mr1(), _, q);
        },
        get inputSchema() {
          return Dr1();
        },
        get outputSchema() {
          return jr1();
        },
        userFacingName: pK9,
        getToolUseSummary: PH8,
        getActivityDescription(H) {
          let _ = PH8(H);
          return _ ? `Reading ${_}` : "Reading file";
        },
        isEnabled() {
          return !0;
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          return H.file_path;
        },
        isSearchOrReadCommand() {
          return { isSearch: !1, isRead: !0 };
        },
        getPath({ file_path: H }) {
          return H || X_();
        },
        matchesPermissionPattern(H, { file_path: _ }) {
          return nZ(H, _);
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return kqH(w5, H, q.toolPermissionContext);
        },
        renderToolUseMessage: IK9,
        renderToolUseTag: uK9,
        renderToolResultMessage: xK9,
        extractSearchText() {
          return "";
        },
        renderToolUseErrorMessage: mK9,
        async validateInput({ file_path: H, pages: _ }, q) {
          if (_ !== void 0) {
            let A = FV6(_);
            if (!A)
              return {
                result: !1,
                message: `Invalid pages parameter: "${_}". Use formats like "1-5", "3", or "10-20". Pages are 1-indexed.`,
                errorCode: 7,
              };
            if ((A.lastPage === 1 / 0 ? JTH + 1 : A.lastPage - A.firstPage + 1) > JTH)
              return {
                result: !1,
                message: `Page range "${_}" exceeds maximum of ${JTH} pages per request. Please use a smaller range.`,
                errorCode: 8,
              };
          }
          let $ = sq(H),
            K = q.getAppState();
          if (VY($, K.toolPermissionContext, "read", "deny") !== null)
            return {
              result: !1,
              message: "File is in a directory that is denied by your permission settings.",
              errorCode: 1,
            };
          if ($.startsWith("\\\\") || $.startsWith("//")) return { result: !0 };
          let z = WwH.extname($).toLowerCase();
          if (V4_($) && !IGH(z) && !cK9.has(z.slice(1)))
            return {
              result: !1,
              message: `This tool cannot read binary files. The file appears to be a binary ${z} file. Please use appropriate tools for binary file analysis.`,
              errorCode: 4,
            };
          if (zr1($))
            return {
              result: !1,
              message: `Cannot read '${H}': this device file would block or produce infinite output.`,
              errorCode: 9,
            };
          return { result: !0 };
        },
        async call({ file_path: H, offset: _ = 1, limit: q = void 0, pages: $ }, K, O, T) {
          let { readFileState: z, fileReadingLimits: A } = K,
            f = XwH(),
            w = A?.maxSizeBytes ?? f.maxSizeBytes,
            Y = A?.maxTokens ?? f.maxTokens;
          if (A !== void 0)
            Q("tengu_file_read_limits_override", {
              hasMaxTokens: A.maxTokens !== void 0,
              hasMaxSizeBytes: A.maxSizeBytes !== void 0,
            });
          let D = WwH.extname(H).toLowerCase().slice(1),
            j = sq(H),
            J = B_("tengu_read_dedup_killswitch", !1) ? void 0 : z.get(j);
          if (J && !J.isPartialView && J.offset !== void 0) {
            if (J.offset === _ && J.limit === q)
              try {
                if ((await kcH(j)) === J.timestamp) {
                  let W = __H(j);
                  return (
                    Q("tengu_file_read_dedup", { ...(W !== void 0 && { ext: W }) }),
                    { data: { type: "file_unchanged", file: { filePath: H } } }
                  );
                }
              } catch {}
          }
          let P = X_();
          if (!lH(process.env.CLAUDE_CODE_SIMPLE)) {
            let X = await akH([j], P);
            if (X.length > 0) {
              for (let R of X) K.dynamicSkillDirTriggers?.add(R);
              skH(X).catch(() => {});
            }
            tkH([j], P);
          }
          try {
            return await dK9(H, j, j, D, _, q, $, w, Y, z, K, T?.message.id);
          } catch (X) {
            if (e6(X) === "ENOENT") {
              let W = fr1(j);
              if (W)
                try {
                  return await dK9(H, j, W, D, _, q, $, w, Y, z, K, T?.message.id);
                } catch (y) {
                  if (!k8(y)) throw y;
                }
              let Z = rX_(j),
                k = await T_H(j),
                v = `File does not exist. ${e0} ${X_()}.`;
              if (k) v += ` Did you mean ${k}?`;
              else if (Z) v += ` Did you mean ${Z}?`;
              throw Error(v);
            }
            throw X;
          }
        },
        mapToolResultToToolResultBlockParam(H, _) {
          switch (H.type) {
            case "image":
              return {
                tool_use_id: _,
                type: "tool_result",
                content: [{ type: "image", source: { type: "base64", data: H.file.base64, media_type: H.file.type } }],
              };
            case "notebook":
              return h_9(H.file.cells, _);
            case "pdf":
              return {
                tool_use_id: _,
                type: "tool_result",
                content: `PDF file read: ${H.file.filePath} (${t7(H.file.originalSize)})`,
              };
            case "parts":
              return {
                tool_use_id: _,
                type: "tool_result",
                content: `PDF pages extracted: ${H.file.count} page(s) from ${H.file.filePath} (${t7(H.file.originalSize)})`,
              };
            case "file_unchanged":
              return { tool_use_id: _, type: "tool_result", content: uGH };
            case "text": {
              let q;
              if (H.file.content) q = Gr1(H) + Jr1(H.file) + (Wr1() ? Pr1 : "");
              else
                q =
                  H.file.totalLines === 0
                    ? "<system-reminder>Warning: the file exists but the contents are empty.</system-reminder>"
                    : `<system-reminder>Warning: the file exists but is shorter than the provided offset (${H.file.startLine}). The file has ${H.file.totalLines} lines.</system-reminder>`;
              return { tool_use_id: _, type: "tool_result", content: q };
            }
          }
        },
      });
    Xr1 = new Set(["claude-opus-4-6"]);
    FK9 = new WeakMap();

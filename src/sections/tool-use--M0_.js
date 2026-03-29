    sR6();
    Zj();
    bL6();
    xcH();
    jBq();
    V3H = class V3H extends _FH {
      constructor(H, _) {
        super(_);
        if (
          ((this._serverInfo = H),
          (this._loggingLevels = new Map()),
          (this.LOG_LEVEL_SEVERITY = new Map(scH.options.map((q, $) => [q, $]))),
          (this.isMessageIgnored = (q, $) => {
            let K = this._loggingLevels.get($);
            return K ? this.LOG_LEVEL_SEVERITY.get(q) < this.LOG_LEVEL_SEVERITY.get(K) : !1;
          }),
          (this._capabilities = _?.capabilities ?? {}),
          (this._instructions = _?.instructions),
          (this._jsonSchemaValidator = _?.jsonSchemaValidator ?? new yFH()),
          this.setRequestHandler(YR6, (q) => this._oninitialize(q)),
          this.setNotificationHandler(MW_, () => this.oninitialized?.()),
          this._capabilities.logging)
        )
          this.setRequestHandler(ZR6, async (q, $) => {
            let K = $.sessionId || $.requestInfo?.headers["mcp-session-id"] || void 0,
              { level: O } = q.params,
              T = scH.safeParse(O);
            if (T.success) this._loggingLevels.set(K, T.data);
            return {};
          });
      }
      get experimental() {
        if (!this._experimental) this._experimental = { tasks: new IL6(this) };
        return this._experimental;
      }
      registerCapabilities(H) {
        if (this.transport) throw Error("Cannot register capabilities after connecting to transport");
        this._capabilities = VW_(this._capabilities, H);
      }
      setRequestHandler(H, _) {
        let $ = oWH(H)?.method;
        if (!$) throw Error("Schema is missing a method literal");
        let K;
        if (D_H($)) {
          let T = $;
          K = T._zod?.def?.value ?? T.value;
        } else {
          let T = $;
          K = T._def?.value ?? T.value;
        }
        if (typeof K !== "string") throw Error("Schema method literal must be a string");
        if (K === "tools/call") {
          let T = async (z, A) => {
            let f = XZ(jg, z);
            if (!f.success) {
              let j = f.error instanceof Error ? f.error.message : String(f.error);
              throw new f9(e9.InvalidParams, `Invalid tools/call request: ${j}`);
            }
            let { params: w } = f.data,
              Y = await Promise.resolve(_(z, A));
            if (w.task) {
              let j = XZ(ji, Y);
              if (!j.success) {
                let M = j.error instanceof Error ? j.error.message : String(j.error);
                throw new f9(e9.InvalidParams, `Invalid task creation result: ${M}`);
              }
              return j.data;
            }
            let D = XZ(Dg, Y);
            if (!D.success) {
              let j = D.error instanceof Error ? D.error.message : String(D.error);
              throw new f9(e9.InvalidParams, `Invalid tools/call result: ${j}`);
            }
            return D.data;
          };
          return super.setRequestHandler(H, T);
        }
        return super.setRequestHandler(H, _);
      }
      assertCapabilityForMethod(H) {
        switch (H) {
          case "sampling/createMessage":
            if (!this._clientCapabilities?.sampling)
              throw Error(`Client does not support sampling (required for ${H})`);
            break;
          case "elicitation/create":
            if (!this._clientCapabilities?.elicitation)
              throw Error(`Client does not support elicitation (required for ${H})`);
            break;
          case "roots/list":
            if (!this._clientCapabilities?.roots)
              throw Error(`Client does not support listing roots (required for ${H})`);
            break;
          case "ping":
            break;
        }
      }
      assertNotificationCapability(H) {
        switch (H) {
          case "notifications/message":
            if (!this._capabilities.logging) throw Error(`Server does not support logging (required for ${H})`);
            break;
          case "notifications/resources/updated":
          case "notifications/resources/list_changed":
            if (!this._capabilities.resources)
              throw Error(`Server does not support notifying about resources (required for ${H})`);
            break;
          case "notifications/tools/list_changed":
            if (!this._capabilities.tools)
              throw Error(`Server does not support notifying of tool list changes (required for ${H})`);
            break;
          case "notifications/prompts/list_changed":
            if (!this._capabilities.prompts)
              throw Error(`Server does not support notifying of prompt list changes (required for ${H})`);
            break;
          case "notifications/elicitation/complete":
            if (!this._clientCapabilities?.elicitation?.url)
              throw Error(`Client does not support URL elicitation (required for ${H})`);
            break;
          case "notifications/cancelled":
            break;
          case "notifications/progress":
            break;
        }
      }
      assertRequestHandlerCapability(H) {
        if (!this._capabilities) return;
        switch (H) {
          case "completion/complete":
            if (!this._capabilities.completions) throw Error(`Server does not support completions (required for ${H})`);
            break;
          case "logging/setLevel":
            if (!this._capabilities.logging) throw Error(`Server does not support logging (required for ${H})`);
            break;
          case "prompts/get":
          case "prompts/list":
            if (!this._capabilities.prompts) throw Error(`Server does not support prompts (required for ${H})`);
            break;
          case "resources/list":
          case "resources/templates/list":
          case "resources/read":
            if (!this._capabilities.resources) throw Error(`Server does not support resources (required for ${H})`);
            break;
          case "tools/call":
          case "tools/list":
            if (!this._capabilities.tools) throw Error(`Server does not support tools (required for ${H})`);
            break;
          case "tasks/get":
          case "tasks/list":
          case "tasks/result":
          case "tasks/cancel":
            if (!this._capabilities.tasks) throw Error(`Server does not support tasks capability (required for ${H})`);
            break;
          case "ping":
          case "initialize":
            break;
        }
      }
      assertTaskCapability(H) {
        j0_(this._clientCapabilities?.tasks?.requests, H, "Client");
      }
      assertTaskHandlerCapability(H) {
        if (!this._capabilities) return;
        D0_(this._capabilities.tasks?.requests, H, "Server");
      }
      async _oninitialize(H) {
        let _ = H.params.protocolVersion;
        return (
          (this._clientCapabilities = H.params.capabilities),
          (this._clientVersion = H.params.clientInfo),
          {
            protocolVersion: wW_.includes(_) ? _ : j_H,
            capabilities: this.getCapabilities(),
            serverInfo: this._serverInfo,
            ...(this._instructions && { instructions: this._instructions }),
          }
        );
      }
      getClientCapabilities() {
        return this._clientCapabilities;
      }
      getClientVersion() {
        return this._clientVersion;
      }
      getCapabilities() {
        return this._capabilities;
      }
      async ping() {
        return this.request({ method: "ping" }, Di);
      }
      async createMessage(H, _) {
        if (H.tools || H.toolChoice) {
          if (!this._clientCapabilities?.sampling?.tools)
            throw Error("Client does not support sampling tools capability.");
        }
        if (H.messages.length > 0) {
          let q = H.messages[H.messages.length - 1],
            $ = Array.isArray(q.content) ? q.content : [q.content],
            K = $.some((A) => A.type === "tool_result"),
            O = H.messages.length > 1 ? H.messages[H.messages.length - 2] : void 0,
            T = O ? (Array.isArray(O.content) ? O.content : [O.content]) : [],
            z = T.some((A) => A.type === "tool_use");
          if (K) {
            if ($.some((A) => A.type !== "tool_result"))
              throw Error("The last message must contain only tool_result content if any is present");
            if (!z) throw Error("tool_result blocks are not matching any tool_use from the previous message");
          }
          if (z) {
            let A = new Set(T.filter((w) => w.type === "tool_use").map((w) => w.id)),
              f = new Set($.filter((w) => w.type === "tool_result").map((w) => w.toolUseId));
            if (A.size !== f.size || ![...A].every((w) => f.has(w)))
              throw Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
          }
        }
        if (H.tools) return this.request({ method: "sampling/createMessage", params: H }, tcH, _);
        return this.request({ method: "sampling/createMessage", params: H }, R3H, _);
      }
      async elicitInput(H, _) {
        switch (H.mode ?? "form") {
          case "url": {
            if (!this._clientCapabilities?.elicitation?.url) throw Error("Client does not support url elicitation.");
            let $ = H;
            return this.request({ method: "elicitation/create", params: $ }, J_H, _);
          }
          case "form": {
            if (!this._clientCapabilities?.elicitation?.form) throw Error("Client does not support form elicitation.");
            let $ = H.mode === "form" ? H : { ...H, mode: "form" },
              K = await this.request({ method: "elicitation/create", params: $ }, J_H, _);
            if (K.action === "accept" && K.content && $.requestedSchema)
              try {
                let T = this._jsonSchemaValidator.getValidator($.requestedSchema)(K.content);
                if (!T.valid)
                  throw new f9(
                    e9.InvalidParams,
                    `Elicitation response content does not match requested schema: ${T.errorMessage}`,
                  );
              } catch (O) {
                if (O instanceof f9) throw O;
                throw new f9(
                  e9.InternalError,
                  `Error validating elicitation response: ${O instanceof Error ? O.message : String(O)}`,
                );
              }
            return K;
          }
        }
      }
      createElicitationCompletionNotifier(H, _) {
        if (!this._clientCapabilities?.elicitation?.url)
          throw Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
        return () =>
          this.notification({ method: "notifications/elicitation/complete", params: { elicitationId: H } }, _);
      }
      async listRoots(H, _) {
        return this.request({ method: "roots/list", params: H }, NR6, _);
      }
      async sendLoggingMessage(H, _) {
        if (this._capabilities.logging) {
          if (!this.isMessageIgnored(H.level, _))
            return this.notification({ method: "notifications/message", params: H });
        }
      }
      async sendResourceUpdated(H) {
        return this.notification({ method: "notifications/resources/updated", params: H });
      }
      async sendResourceListChanged() {
        return this.notification({ method: "notifications/resources/list_changed" });
      }
      async sendToolListChanged() {
        return this.notification({ method: "notifications/tools/list_changed" });
      }
      async sendPromptListChanged() {
        return this.notification({ method: "notifications/prompts/list_changed" });
      }
    };

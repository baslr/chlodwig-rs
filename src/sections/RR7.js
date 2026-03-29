    sR6();
    Zj();
    bL6();
    xcH();
    GR7();
    EV_ = class EV_ extends _FH {
      constructor(H, _) {
        super(_);
        if (
          ((this._clientInfo = H),
          (this._cachedToolOutputValidators = new Map()),
          (this._cachedKnownTaskTools = new Set()),
          (this._cachedRequiredTaskTools = new Set()),
          (this._listChangedDebounceTimers = new Map()),
          (this._capabilities = _?.capabilities ?? {}),
          (this._jsonSchemaValidator = _?.jsonSchemaValidator ?? new yFH()),
          _?.listChanged)
        )
          this._pendingListChangedConfig = _.listChanged;
      }
      _setupListChangedHandlers(H) {
        if (H.tools && this._serverCapabilities?.tools?.listChanged)
          this._setupListChangedHandler("tools", acH, H.tools, async () => {
            return (await this.listTools()).tools;
          });
        if (H.prompts && this._serverCapabilities?.prompts?.listChanged)
          this._setupListChangedHandler("prompts", rcH, H.prompts, async () => {
            return (await this.listPrompts()).prompts;
          });
        if (H.resources && this._serverCapabilities?.resources?.listChanged)
          this._setupListChangedHandler("resources", icH, H.resources, async () => {
            return (await this.listResources()).resources;
          });
      }
      get experimental() {
        if (!this._experimental) this._experimental = { tasks: new Np6(this) };
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
        let O = K;
        if (O === "elicitation/create") {
          let T = async (z, A) => {
            let f = XZ(Ji, z);
            if (!f.success) {
              let X = f.error instanceof Error ? f.error.message : String(f.error);
              throw new f9(e9.InvalidParams, `Invalid elicitation request: ${X}`);
            }
            let { params: w } = f.data;
            w.mode = w.mode ?? "form";
            let { supportsFormMode: Y, supportsUrlMode: D } = xT1(this._capabilities.elicitation);
            if (w.mode === "form" && !Y)
              throw new f9(e9.InvalidParams, "Client does not support form-mode elicitation requests");
            if (w.mode === "url" && !D)
              throw new f9(e9.InvalidParams, "Client does not support URL-mode elicitation requests");
            let j = await Promise.resolve(_(z, A));
            if (w.task) {
              let X = XZ(ji, j);
              if (!X.success) {
                let R = X.error instanceof Error ? X.error.message : String(X.error);
                throw new f9(e9.InvalidParams, `Invalid task creation result: ${R}`);
              }
              return X.data;
            }
            let M = XZ(J_H, j);
            if (!M.success) {
              let X = M.error instanceof Error ? M.error.message : String(M.error);
              throw new f9(e9.InvalidParams, `Invalid elicitation result: ${X}`);
            }
            let J = M.data,
              P = w.mode === "form" ? w.requestedSchema : void 0;
            if (w.mode === "form" && J.action === "accept" && J.content && P) {
              if (this._capabilities.elicitation?.form?.applyDefaults)
                try {
                  SV_(P, J.content);
                } catch {}
            }
            return J;
          };
          return super.setRequestHandler(H, T);
        }
        if (O === "sampling/createMessage") {
          let T = async (z, A) => {
            let f = XZ(LR6, z);
            if (!f.success) {
              let J = f.error instanceof Error ? f.error.message : String(f.error);
              throw new f9(e9.InvalidParams, `Invalid sampling request: ${J}`);
            }
            let { params: w } = f.data,
              Y = await Promise.resolve(_(z, A));
            if (w.task) {
              let J = XZ(ji, Y);
              if (!J.success) {
                let P = J.error instanceof Error ? J.error.message : String(J.error);
                throw new f9(e9.InvalidParams, `Invalid task creation result: ${P}`);
              }
              return J.data;
            }
            let j = w.tools || w.toolChoice ? tcH : R3H,
              M = XZ(j, Y);
            if (!M.success) {
              let J = M.error instanceof Error ? M.error.message : String(M.error);
              throw new f9(e9.InvalidParams, `Invalid sampling result: ${J}`);
            }
            return M.data;
          };
          return super.setRequestHandler(H, T);
        }
        return super.setRequestHandler(H, _);
      }
      assertCapability(H, _) {
        if (!this._serverCapabilities?.[H]) throw Error(`Server does not support ${H} (required for ${_})`);
      }
      async connect(H, _) {
        if ((await super.connect(H), H.sessionId !== void 0)) return;
        try {
          let q = await this.request(
            {
              method: "initialize",
              params: { protocolVersion: j_H, capabilities: this._capabilities, clientInfo: this._clientInfo },
            },
            DR6,
            _,
          );
          if (q === void 0) throw Error(`Server sent invalid initialize result: ${q}`);
          if (!wW_.includes(q.protocolVersion))
            throw Error(`Server's protocol version is not supported: ${q.protocolVersion}`);
          if (((this._serverCapabilities = q.capabilities), (this._serverVersion = q.serverInfo), H.setProtocolVersion))
            H.setProtocolVersion(q.protocolVersion);
          if (
            ((this._instructions = q.instructions),
            await this.notification({ method: "notifications/initialized" }),
            this._pendingListChangedConfig)
          )
            this._setupListChangedHandlers(this._pendingListChangedConfig), (this._pendingListChangedConfig = void 0);
        } catch (q) {
          throw (this.close(), q);
        }
      }
      getServerCapabilities() {
        return this._serverCapabilities;
      }
      getServerVersion() {
        return this._serverVersion;
      }
      getInstructions() {
        return this._instructions;
      }
      assertCapabilityForMethod(H) {
        switch (H) {
          case "logging/setLevel":
            if (!this._serverCapabilities?.logging) throw Error(`Server does not support logging (required for ${H})`);
            break;
          case "prompts/get":
          case "prompts/list":
            if (!this._serverCapabilities?.prompts) throw Error(`Server does not support prompts (required for ${H})`);
            break;
          case "resources/list":
          case "resources/templates/list":
          case "resources/read":
          case "resources/subscribe":
          case "resources/unsubscribe":
            if (!this._serverCapabilities?.resources)
              throw Error(`Server does not support resources (required for ${H})`);
            if (H === "resources/subscribe" && !this._serverCapabilities.resources.subscribe)
              throw Error(`Server does not support resource subscriptions (required for ${H})`);
            break;
          case "tools/call":
          case "tools/list":
            if (!this._serverCapabilities?.tools) throw Error(`Server does not support tools (required for ${H})`);
            break;
          case "completion/complete":
            if (!this._serverCapabilities?.completions)
              throw Error(`Server does not support completions (required for ${H})`);
            break;
          case "initialize":
            break;
          case "ping":
            break;
        }
      }
      assertNotificationCapability(H) {
        switch (H) {
          case "notifications/roots/list_changed":
            if (!this._capabilities.roots?.listChanged)
              throw Error(`Client does not support roots list changed notifications (required for ${H})`);
            break;
          case "notifications/initialized":
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
          case "sampling/createMessage":
            if (!this._capabilities.sampling)
              throw Error(`Client does not support sampling capability (required for ${H})`);
            break;
          case "elicitation/create":
            if (!this._capabilities.elicitation)
              throw Error(`Client does not support elicitation capability (required for ${H})`);
            break;
          case "roots/list":
            if (!this._capabilities.roots) throw Error(`Client does not support roots capability (required for ${H})`);
            break;
          case "tasks/get":
          case "tasks/list":
          case "tasks/result":
          case "tasks/cancel":
            if (!this._capabilities.tasks) throw Error(`Client does not support tasks capability (required for ${H})`);
            break;
          case "ping":
            break;
        }
      }
      assertTaskCapability(H) {
        D0_(this._serverCapabilities?.tasks?.requests, H, "Server");
      }
      assertTaskHandlerCapability(H) {
        if (!this._capabilities) return;
        j0_(this._capabilities.tasks?.requests, H, "Client");
      }
      async ping(H) {
        return this.request({ method: "ping" }, Di, H);
      }
      async complete(H, _) {
        return this.request({ method: "completion/complete", params: H }, kR6, _);
      }
      async setLoggingLevel(H, _) {
        return this.request({ method: "logging/setLevel", params: { level: H } }, Di, _);
      }
      async getPrompt(H, _) {
        return this.request({ method: "prompts/get", params: H }, RR6, _);
      }
      async listPrompts(H, _) {
        return this.request({ method: "prompts/list", params: H }, ncH, _);
      }
      async listResources(H, _) {
        return this.request({ method: "resources/list", params: H }, QcH, _);
      }
      async listResourceTemplates(H, _) {
        return this.request({ method: "resources/templates/list", params: H }, MR6, _);
      }
      async readResource(H, _) {
        return this.request({ method: "resources/read", params: H }, lcH, _);
      }
      async subscribeResource(H, _) {
        return this.request({ method: "resources/subscribe", params: H }, Di, _);
      }
      async unsubscribeResource(H, _) {
        return this.request({ method: "resources/unsubscribe", params: H }, Di, _);
      }
      async callTool(H, _ = Dg, q) {
        if (this.isToolTaskRequired(H.name))
          throw new f9(
            e9.InvalidRequest,
            `Tool "${H.name}" requires task-based execution. Use client.experimental.tasks.callToolStream() instead.`,
          );
        let $ = await this.request({ method: "tools/call", params: H }, _, q),
          K = this.getToolOutputValidator(H.name);
        if (K) {
          if (!$.structuredContent && !$.isError)
            throw new f9(
              e9.InvalidRequest,
              `Tool ${H.name} has an output schema but did not return structured content`,
            );
          if ($.structuredContent)
            try {
              let O = K($.structuredContent);
              if (!O.valid)
                throw new f9(
                  e9.InvalidParams,
                  `Structured content does not match the tool's output schema: ${O.errorMessage}`,
                );
            } catch (O) {
              if (O instanceof f9) throw O;
              throw new f9(
                e9.InvalidParams,
                `Failed to validate structured content: ${O instanceof Error ? O.message : String(O)}`,
              );
            }
        }
        return $;
      }
      isToolTask(H) {
        if (!this._serverCapabilities?.tasks?.requests?.tools?.call) return !1;
        return this._cachedKnownTaskTools.has(H);
      }
      isToolTaskRequired(H) {
        return this._cachedRequiredTaskTools.has(H);
      }
      cacheToolMetadata(H) {
        this._cachedToolOutputValidators.clear(),
          this._cachedKnownTaskTools.clear(),
          this._cachedRequiredTaskTools.clear();
        for (let _ of H) {
          if (_.outputSchema) {
            let $ = this._jsonSchemaValidator.getValidator(_.outputSchema);
            this._cachedToolOutputValidators.set(_.name, $);
          }
          let q = _.execution?.taskSupport;
          if (q === "required" || q === "optional") this._cachedKnownTaskTools.add(_.name);
          if (q === "required") this._cachedRequiredTaskTools.add(_.name);
        }
      }
      getToolOutputValidator(H) {
        return this._cachedToolOutputValidators.get(H);
      }
      async listTools(H, _) {
        let q = await this.request({ method: "tools/list", params: H }, ocH, _);
        return this.cacheToolMetadata(q.tools), q;
      }
      _setupListChangedHandler(H, _, q, $) {
        let K = euq.safeParse(q);
        if (!K.success) throw Error(`Invalid ${H} listChanged options: ${K.error.message}`);
        if (typeof q.onChanged !== "function")
          throw Error(`Invalid ${H} listChanged options: onChanged must be a function`);
        let { autoRefresh: O, debounceMs: T } = K.data,
          { onChanged: z } = q,
          A = async () => {
            if (!O) {
              z(null, null);
              return;
            }
            try {
              let w = await $();
              z(null, w);
            } catch (w) {
              let Y = w instanceof Error ? w : Error(String(w));
              z(Y, null);
            }
          },
          f = () => {
            if (T) {
              let w = this._listChangedDebounceTimers.get(H);
              if (w) clearTimeout(w);
              let Y = setTimeout(A, T);
              this._listChangedDebounceTimers.set(H, Y);
            } else A();
          };
        this.setNotificationHandler(_, f);
      }
      async sendRootsListChanged() {
        return this.notification({ method: "notifications/roots/list_changed" });
      }
    };

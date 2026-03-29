    RR7();
    pR7();
    dR7();
    FR7();
    Zj();
    u7();
    iR7();
    ep6();
    k_();
    s$();
    oV_();
    wZ7();
    HS_();
    bY();
    W8();
    s1();
    fm6();
    H_();
    g_();
    h_();
    Rj();
    lf();
    eE();
    N_();
    eV_();
    $B6();
    ZL7();
    dp();
    LI();
    HZ();
    XC();
    $zH();
    VG();
    L_();
    YS_();
    Ph();
    gD();
    ZzH();
    sL7();
    wKH();
    TqH();
    tLH();
    MW();
    tk7();
    WC();
    g_();
    F_();
    (fqH = require("fs/promises")), (WE_ = require("path"));
    PE_ = class PE_ extends Error {
      serverName;
      constructor(H, _) {
        super(_);
        (this.name = "McpAuthError"), (this.serverName = H);
      }
    };
    Fg6 = class Fg6 extends Error {
      constructor(H) {
        super(`MCP server "${H}" session expired`);
        this.name = "McpSessionExpiredError";
      }
    };
    XE_ = class XE_ extends rV {
      mcpMeta;
      constructor(H, _, q) {
        super(H, _);
        this.mcpMeta = q;
        this.name = "McpToolCallError";
      }
    };
    fh7 = (_i(), Rq(VWH)).isComputerUseMCPServer;
    $h7 = Promise.resolve();
    MD1 = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
    XD1 = ["mcp__ide__executeCode", "mcp__ide__getDiagnostics"];
    kC = $6(async (H, _, q) => {
      let $ = Date.now(),
        K;
      try {
        let O,
          T = DP();
        if (_.type === "sse") {
          let p = new EzH(H, _),
            C = await cS_(H, _),
            g = { authProvider: p, fetch: gg6(_g6(GzH(), p)), requestInit: { headers: { "User-Agent": oHH(), ...C } } };
          (g.eventSourceInit = {
            fetch: async (c, U) => {
              let i = {},
                _H = await p.tokens();
              if (_H) i.Authorization = `Bearer ${_H.access_token}`;
              let HH = s1H();
              return fetch(c, {
                ...U,
                ...HH,
                headers: { "User-Agent": oHH(), ...i, ...U?.headers, ...C, Accept: "text/event-stream" },
              });
            },
          }),
            (O = new nV_(new URL(_.url), g)),
            C_(H, "SSE transport initialized, awaiting connection");
        } else if (_.type === "sse-ide") {
          C_(H, `Setting up SSE-IDE transport to ${_.url}`);
          let p = s1H(),
            C = p.dispatcher
              ? {
                  eventSourceInit: {
                    fetch: async (g, c) => {
                      return fetch(g, { ...c, ...p, headers: { "User-Agent": oHH(), ...c?.headers } });
                    },
                  },
                }
              : {};
          O = new nV_(new URL(_.url), Object.keys(C).length > 0 ? C : void 0);
        } else if (_.type === "ws-ide") {
          let p = tL(),
            C = { "User-Agent": oHH(), ...(_.authToken && { "X-Claude-Code-Ide-Authorization": _.authToken }) },
            g;
          if (typeof Bun < "u")
            g = new globalThis.WebSocket(_.url, { protocols: ["mcp"], headers: C, proxy: II(_.url), tls: p || void 0 });
          else g = await Kh7(_.url, { headers: C, agent: bI(_.url), ...(p || {}) });
          O = new fS_(g);
        } else if (_.type === "ws") {
          C_(H, `Initializing WebSocket transport to ${_.url}`);
          let p = await cS_(H, _),
            C = tL(),
            g = { "User-Agent": oHH(), ...(T && { Authorization: `Bearer ${T}` }), ...p },
            c = Object.fromEntries(
              Object.entries(g).map(([i, _H]) => (i.toLowerCase() === "authorization" ? [i, "[REDACTED]"] : [i, _H])),
            );
          C_(H, `WebSocket transport options: ${gH({ url: _.url, headers: c, hasSessionAuth: !!T })}`);
          let U;
          if (typeof Bun < "u")
            U = new globalThis.WebSocket(_.url, { protocols: ["mcp"], headers: g, proxy: II(_.url), tls: C || void 0 });
          else U = await Kh7(_.url, { headers: g, agent: bI(_.url), ...(C || {}) });
          O = new fS_(U);
        } else if (_.type === "http") {
          C_(H, `Initializing HTTP transport to ${_.url}`),
            C_(H, `Node version: ${process.version}, Platform: darwin`),
            C_(
              H,
              `Environment: ${gH({ NODE_OPTIONS: process.env.NODE_OPTIONS || "not set", UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE || "default", HTTP_PROXY: process.env.HTTP_PROXY || "not set", HTTPS_PROXY: process.env.HTTPS_PROXY || "not set", NO_PROXY: process.env.NO_PROXY || "not set" })}`,
            );
          let p = new EzH(H, _),
            C = await cS_(H, _),
            g = s1H();
          C_(H, `Proxy options: ${g.dispatcher ? "custom dispatcher" : "default"}`);
          let c = {
              authProvider: p,
              fetch: gg6(_g6(GzH(), p)),
              requestInit: { ...g, headers: { "User-Agent": oHH(), ...(T && { Authorization: `Bearer ${T}` }), ...C } },
            },
            U = c.requestInit?.headers
              ? Object.fromEntries(
                  Object.entries(c.requestInit.headers).map(([i, _H]) =>
                    i.toLowerCase() === "authorization" ? [i, "[REDACTED]"] : [i, _H],
                  ),
                )
              : void 0;
          C_(H, `HTTP transport options: ${gH({ url: _.url, headers: U, hasAuthProvider: !!p, timeoutMs: Yh7 })}`),
            (O = new rV_(new URL(_.url), c)),
            C_(H, "HTTP transport created successfully");
        } else if (_.type === "sdk") throw Error("SDK servers should be handled in print.ts");
        else if (_.type === "claudeai-proxy") {
          if ((C_(H, `Initializing claude.ai proxy transport for server ${_.id}`), !t8()))
            throw Error("No claude.ai OAuth token found");
          let C = m8(),
            g = `${C.MCP_PROXY_URL}${C.MCP_PROXY_PATH.replace("{server_id}", _.id)}`;
          C_(H, `Using claude.ai proxy at ${g}`);
          let c = jD1(globalThis.fetch),
            U = s1H(),
            i = {
              fetch: gg6(c),
              requestInit: { ...U, headers: { "User-Agent": oHH(), "X-Mcp-Client-Session-Id": v_() } },
            };
          (O = new rV_(new URL(g), i)), C_(H, "claude.ai proxy transport created successfully");
        } else if ((_.type === "stdio" || !_.type) && NzH(H)) {
          let { createChromeContext: p } = await Promise.resolve().then(() => (ng6(), ig6)),
            { createClaudeForChromeMcpServer: C } = await Promise.resolve().then(() => (VFH(), RBq)),
            { createLinkedTransportPair: g } = await Promise.resolve().then(() => xg6),
            c = p(_.env);
          K = C(c);
          let [U, i] = g();
          await K.connect(i), (O = U), C_(H, "In-process Chrome MCP server started");
        } else if ((_.type === "stdio" || !_.type) && fh7(H)) {
          let { createComputerUseMcpServerForCli: p } = await Promise.resolve().then(() => (pg6(), mg6)),
            { createLinkedTransportPair: C } = await Promise.resolve().then(() => xg6);
          K = await p();
          let [g, c] = C();
          await K.connect(c), (O = g), C_(H, "In-process Computer Use MCP server started");
        } else if (_.type === "stdio" || !_.type) {
          let p = process.env.CLAUDE_CODE_SHELL_PREFIX || _.command,
            C = process.env.CLAUDE_CODE_SHELL_PREFIX ? [[_.command, ..._.args].join(" ")] : _.args;
          O = new sp6({ command: p, args: C, env: { ...Lx(), ..._.env }, stderr: "pipe" });
        } else throw Error(`Unsupported server type: ${_.type}`);
        let z,
          A = "";
        if (_.type === "stdio" || !_.type) {
          let p = O;
          if (p.stderr)
            (z = (C) => {
              if (A.length < 67108864)
                try {
                  A += C.toString();
                } catch {}
            }),
              p.stderr.on("data", z);
        }
        let f = new EV_(
          {
            name: "claude-code",
            version:
              {
                ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
                PACKAGE_URL: "@anthropic-ai/claude-code",
                README_URL: "https://code.claude.com/docs/en/overview",
                VERSION: "2.1.87",
                FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
                BUILD_TIME: "2026-03-29T01:39:46Z",
              }.VERSION ?? "unknown",
          },
          { capabilities: { roots: {}, elicitation: { form: {}, url: {} } } },
        );
        if (_.type === "http") C_(H, "Client created, setting up request handler");
        if (
          (f.setRequestHandler(vR6, async () => {
            return C_(H, "Received ListRoots request from server"), { roots: [{ uri: `file://${s6()}` }] };
          }),
          C_(H, `Starting connection with timeout of ${ME_()}ms`),
          _.type === "http")
        ) {
          C_(H, `Testing basic HTTP connectivity to ${_.url}`);
          try {
            let p = new URL(_.url);
            if (
              (C_(H, `Parsed URL: host=${p.hostname}, port=${p.port || "default"}, protocol=${p.protocol}`),
              p.hostname === "127.0.0.1" || p.hostname === "localhost")
            )
              C_(H, `Using loopback address: ${p.hostname}`);
          } catch (p) {
            C_(H, `Failed to parse URL: ${p}`);
          }
        }
        let w = f.connect(O),
          Y = new Promise((p, C) => {
            let g = setTimeout(() => {
              let c = Date.now() - $;
              if ((C_(H, `Connection timeout triggered after ${c}ms (limit: ${ME_()}ms)`), K))
                K.close().catch(() => {});
              O.close().catch(() => {}),
                C(new rV(`MCP server "${H}" connection timed out after ${ME_()}ms`, "MCP connection timeout"));
            }, ME_());
            w.then(
              () => {
                clearTimeout(g);
              },
              (c) => {
                clearTimeout(g);
              },
            );
          });
        try {
          if ((await Promise.race([w, Y]), A)) f3(H, `Server stderr: ${A}`), (A = "");
          let p = Date.now() - $;
          C_(H, `Successfully connected to ${_.type} server in ${p}ms`);
        } catch (p) {
          let C = Date.now() - $;
          if (_.type === "sse" && p instanceof Error) {
            if (
              (C_(
                H,
                `SSE Connection failed after ${C}ms: ${gH({ url: _.url, error: p.message, errorType: p.constructor.name, stack: p.stack })}`,
              ),
              f3(H, p),
              p instanceof YP)
            )
              return Bg6(H, _, "sse");
          } else if (_.type === "http" && p instanceof Error) {
            let g = p;
            if (
              (C_(
                H,
                `HTTP Connection failed after ${C}ms: ${p.message} (code: ${g.code || "none"}, errno: ${g.errno || "none"})`,
              ),
              f3(H, p),
              p instanceof YP)
            )
              return Bg6(H, _, "http");
          } else if (_.type === "claudeai-proxy" && p instanceof Error) {
            if ((C_(H, `claude.ai proxy connection failed after ${C}ms: ${p.message}`), f3(H, p), p.code === 401))
              return Bg6(H, _, "claudeai-proxy");
          } else if (_.type === "sse-ide" || _.type === "ws-ide")
            Q("tengu_mcp_ide_server_connection_failed", { connectionDurationMs: C });
          if (K) K.close().catch(() => {});
          if ((O.close().catch(() => {}), A)) f3(H, `Server stderr: ${A}`);
          throw p;
        }
        let D = f.getServerCapabilities(),
          j = f.getServerVersion(),
          M = f.getInstructions(),
          J = M;
        if (M && M.length > GoH)
          (J = M.slice(0, GoH) + "\u2026 [truncated]"),
            C_(H, `Server instructions truncated from ${M.length} to ${GoH} chars`);
        if (
          (C_(
            H,
            `Connection established with capabilities: ${gH({ hasTools: !!D?.tools, hasPrompts: !!D?.prompts, hasResources: !!D?.resources, hasResourceSubscribe: !!D?.resources?.subscribe, serverVersion: j || "unknown" })}`,
          ),
          N(`[MCP] Server "${H}" connected with subscribe=${!!D?.resources?.subscribe}`),
          f.setRequestHandler(Ji, async (p) => {
            return C_(H, `Elicitation request received during initialization: ${gH(p)}`), { action: "cancel" };
          }),
          _.type === "sse-ide" || _.type === "ws-ide")
        ) {
          let p = Date.now() - $;
          Q("tengu_mcp_ide_server_connection_succeeded", { connectionDurationMs: p, serverVersion: j });
          try {
            DL7(f);
          } catch (C) {
            f3(H, `Failed to send ide_connected notification: ${C}`);
          }
        }
        let P = Date.now(),
          X = !1,
          R = f.onerror,
          W = f.onclose,
          Z = 0,
          k = 3,
          v = !1,
          y = (p) => {
            if (v) return;
            (v = !0),
              C_(H, `Closing transport (${p})`),
              f.close().catch((C) => {
                C_(H, `Error during close: ${QH(C)}`);
              });
          },
          E = (p) => {
            return (
              p.includes("ECONNRESET") ||
              p.includes("ETIMEDOUT") ||
              p.includes("EPIPE") ||
              p.includes("EHOSTUNREACH") ||
              p.includes("ECONNREFUSED") ||
              p.includes("Body Timeout Error") ||
              p.includes("terminated") ||
              p.includes("SSE stream disconnected") ||
              p.includes("Failed to reconnect SSE stream")
            );
          };
        (f.onerror = (p) => {
          let C = Date.now() - P;
          X = !0;
          let g = _.type || "stdio";
          if ((C_(H, `${g.toUpperCase()} connection dropped after ${Math.floor(C / 1000)}s uptime`), p.message))
            if (p.message.includes("ECONNRESET")) C_(H, "Connection reset - server may have crashed or restarted");
            else if (p.message.includes("ETIMEDOUT"))
              C_(H, "Connection timeout - network issue or server unresponsive");
            else if (p.message.includes("ECONNREFUSED")) C_(H, "Connection refused - server may be down");
            else if (p.message.includes("EPIPE")) C_(H, "Broken pipe - server closed connection unexpectedly");
            else if (p.message.includes("EHOSTUNREACH")) C_(H, "Host unreachable - network connectivity issue");
            else if (p.message.includes("ESRCH")) C_(H, "Process not found - stdio server process terminated");
            else if (p.message.includes("spawn")) C_(H, "Failed to spawn process - check command and permissions");
            else C_(H, `Connection error: ${p.message}`);
          if ((g === "http" || g === "claudeai-proxy") && Ah7(p)) {
            if (
              (C_(H, "MCP session expired (server returned 404 with session-not-found), triggering reconnection"),
              y("session expired"),
              R)
            )
              R(p);
            return;
          }
          if (g === "sse" || g === "http" || g === "claudeai-proxy") {
            if (p.message.includes("Maximum reconnection attempts")) {
              if ((y("SSE reconnection exhausted"), R)) R(p);
              return;
            }
            if (E(p.message)) {
              if ((Z++, C_(H, `Terminal connection error ${Z}/${k}`), Z >= k))
                (Z = 0), y("max consecutive terminal errors");
            } else Z = 0;
          }
          if (R) R(p);
        }),
          (f.onclose = () => {
            let p = Date.now() - P,
              C = _.type ?? "unknown";
            C_(
              H,
              `${C.toUpperCase()} connection closed after ${Math.floor(p / 1000)}s (${X ? "with errors" : "cleanly"})`,
            );
            let g = cg6(H, _);
            if (
              (uy.cache.delete(H),
              _r.cache.delete(H),
              gzH.cache.delete(H),
              kC.cache.delete(g),
              C_(H, "Cleared connection cache for reconnection"),
              W)
            )
              W();
          });
        let S = async () => {
            if (K) {
              try {
                await K.close();
              } catch (p) {
                C_(H, `Error closing in-process server: ${p}`);
              }
              try {
                await f.close();
              } catch (p) {
                C_(H, `Error closing client: ${p}`);
              }
              return;
            }
            if (z && (_.type === "stdio" || !_.type)) O.stderr?.off("data", z);
            if (_.type === "stdio")
              try {
                let C = O.pid;
                if (C) {
                  C_(H, "Sending SIGINT to MCP server process");
                  try {
                    process.kill(C, "SIGINT");
                  } catch (g) {
                    C_(H, `Error sending SIGINT: ${g}`);
                    return;
                  }
                  await new Promise(async (g) => {
                    let c = !1,
                      U = setInterval(() => {
                        try {
                          process.kill(C, 0);
                        } catch {
                          if (!c)
                            (c = !0),
                              clearInterval(U),
                              clearTimeout(i),
                              C_(H, "MCP server process exited cleanly"),
                              g();
                        }
                      }, 50),
                      i = setTimeout(() => {
                        if (!c)
                          (c = !0),
                            clearInterval(U),
                            C_(H, "Cleanup timeout reached, stopping process monitoring"),
                            g();
                      }, 600);
                    try {
                      if ((await Tq(100), !c)) {
                        try {
                          process.kill(C, 0), C_(H, "SIGINT failed, sending SIGTERM to MCP server process");
                          try {
                            process.kill(C, "SIGTERM");
                          } catch (_H) {
                            C_(H, `Error sending SIGTERM: ${_H}`), (c = !0), clearInterval(U), clearTimeout(i), g();
                            return;
                          }
                        } catch {
                          (c = !0), clearInterval(U), clearTimeout(i), g();
                          return;
                        }
                        if ((await Tq(400), !c))
                          try {
                            process.kill(C, 0), C_(H, "SIGTERM failed, sending SIGKILL to MCP server process");
                            try {
                              process.kill(C, "SIGKILL");
                            } catch (_H) {
                              C_(H, `Error sending SIGKILL: ${_H}`);
                            }
                          } catch {
                            (c = !0), clearInterval(U), clearTimeout(i), g();
                          }
                      }
                      if (!c) (c = !0), clearInterval(U), clearTimeout(i), g();
                    } catch {
                      if (!c) (c = !0), clearInterval(U), clearTimeout(i), g();
                    }
                  });
                }
              } catch (p) {
                C_(H, `Error terminating process: ${p}`);
              }
            try {
              await f.close();
            } catch (p) {
              C_(H, `Error closing client: ${p}`);
            }
          },
          x = pq(S),
          I = async () => {
            x?.(), await S();
          },
          B = Date.now() - $;
        return (
          Q("tengu_mcp_server_connection_succeeded", {
            connectionDurationMs: B,
            transportType: _.type ?? "stdio",
            totalServers: q?.totalServers,
            stdioCount: q?.stdioCount,
            sseCount: q?.sseCount,
            httpCount: q?.httpCount,
            sseIdeCount: q?.sseIdeCount,
            wsIdeCount: q?.wsIdeCount,
            ...dg6(_),
          }),
          {
            name: H,
            client: f,
            type: "connected",
            capabilities: D ?? {},
            serverInfo: j,
            instructions: J,
            config: _,
            cleanup: I,
          }
        );
      } catch (O) {
        let T = Date.now() - $;
        if (
          (Q("tengu_mcp_server_connection_failed", {
            connectionDurationMs: T,
            totalServers: q?.totalServers || 1,
            stdioCount: q?.stdioCount || (_.type === "stdio" ? 1 : 0),
            sseCount: q?.sseCount || (_.type === "sse" ? 1 : 0),
            httpCount: q?.httpCount || (_.type === "http" ? 1 : 0),
            sseIdeCount: q?.sseIdeCount || (_.type === "sse-ide" ? 1 : 0),
            wsIdeCount: q?.wsIdeCount || (_.type === "ws-ide" ? 1 : 0),
            transportType: _.type ?? "stdio",
            ...dg6(_),
          }),
          C_(H, `Connection failed after ${T}ms: ${QH(O)}`),
          f3(H, `Connection failed: ${QH(O)}`),
          K)
        )
          K.close().catch(() => {});
        return { name: H, type: "failed", config: _, error: QH(O) };
      }
    }, cg6);
    (uy = XM(
      async (H) => {
        if (H.type !== "connected") return [];
        try {
          if (!H.capabilities?.tools) return [];
          let _ = await H.client.request({ method: "tools/list" }, ocH),
            q = t8H(_.tools),
            $ = H.config.type === "sdk" && lH(process.env.CLAUDE_AGENT_SDK_MCP_NO_PREFIX);
          return q
            .map((K) => {
              let O = EuH(H.name, K.name);
              return {
                ...fZ7,
                name: $ ? K.name : O,
                mcpInfo: { serverName: H.name, toolName: K.name },
                isMcp: !0,
                searchHint:
                  typeof K._meta?.["anthropic/searchHint"] === "string"
                    ? K._meta["anthropic/searchHint"].replace(/\s+/g, " ").trim() || void 0
                    : void 0,
                alwaysLoad: K._meta?.["anthropic/alwaysLoad"] === !0,
                async description() {
                  return K.description ?? "";
                },
                async prompt() {
                  let T = K.description ?? "";
                  return T.length > GoH ? T.slice(0, GoH) + "\u2026 [truncated]" : T;
                },
                isConcurrencySafe() {
                  return K.annotations?.readOnlyHint ?? !1;
                },
                isReadOnly() {
                  return K.annotations?.readOnlyHint ?? !1;
                },
                toAutoClassifierInput(T) {
                  return GD1(T, K.name);
                },
                isDestructive() {
                  return K.annotations?.destructiveHint ?? !1;
                },
                isOpenWorld() {
                  return K.annotations?.openWorldHint ?? !1;
                },
                isSearchOrReadCommand() {
                  return aL7(H.name, K.name);
                },
                inputJSONSchema: K.inputSchema,
                async checkPermissions() {
                  return {
                    behavior: "passthrough",
                    message: "MCPTool requires permission.",
                    suggestions: [
                      {
                        type: "addRules",
                        rules: [{ toolName: O, ruleContent: void 0 }],
                        behavior: "allow",
                        destination: "localSettings",
                      },
                    ],
                  };
                },
                async call(T, z, A, f, w) {
                  let Y = vD1(f),
                    D = Y ? { "claudecode/toolUseId": Y } : {};
                  if (w && Y)
                    w({
                      toolUseID: Y,
                      data: { type: "mcp_progress", status: "started", serverName: H.name, toolName: K.name },
                    });
                  let j = Date.now(),
                    M = 1;
                  for (let J = 0; ; J++)
                    try {
                      let P = await FLH(H),
                        X = await kD1({
                          client: P,
                          clientConnection: H,
                          tool: K.name,
                          args: T,
                          meta: D,
                          signal: z.abortController.signal,
                          setAppState: z.setAppState,
                          onProgress:
                            w && Y
                              ? (R) => {
                                  w({ toolUseID: Y, data: R });
                                }
                              : void 0,
                          handleElicitation: z.handleElicitation,
                        });
                      if (w && Y)
                        w({
                          toolUseID: Y,
                          data: {
                            type: "mcp_progress",
                            status: "completed",
                            serverName: H.name,
                            toolName: K.name,
                            elapsedTimeMs: Date.now() - j,
                          },
                        });
                      return {
                        data: X.content,
                        ...(X._meta || X.structuredContent
                          ? {
                              mcpMeta: {
                                ...(X._meta && { _meta: X._meta }),
                                ...(X.structuredContent && { structuredContent: X.structuredContent }),
                              },
                            }
                          : {}),
                      };
                    } catch (P) {
                      if (P instanceof Fg6 && J < M) {
                        C_(H.name, `Retrying tool '${K.name}' after session recovery`);
                        continue;
                      }
                      if (w && Y)
                        w({
                          toolUseID: Y,
                          data: {
                            type: "mcp_progress",
                            status: "failed",
                            serverName: H.name,
                            toolName: K.name,
                            elapsedTimeMs: Date.now() - j,
                          },
                        });
                      if (P instanceof Error && !(P instanceof rV)) {
                        let X = P.constructor.name;
                        if (X === "Error") throw new rV(P.message, P.message.slice(0, 200));
                        if (X === "McpError" && "code" in P && typeof P.code === "number")
                          throw new rV(P.message, `McpError ${P.code}`);
                      }
                      throw P;
                    }
                },
                userFacingName() {
                  let T = K.annotations?.title || K.name;
                  return `${H.name} - ${T} (MCP)`;
                },
                ...(NzH(H.name) && (H.config.type === "stdio" || !H.config.type)
                  ? AD1().getClaudeInChromeMCPToolOverrides(K.name)
                  : {}),
                ...((H.config.type === "stdio" || !H.config.type) && fh7(H.name)
                  ? fD1().getComputerUseMCPToolOverrides(K.name)
                  : {}),
              };
            })
            .filter(WD1);
        } catch (_) {
          return f3(H.name, `Failed to fetch tools: ${QH(_)}`), [];
        }
      },
      (H) => H.name,
      lg6,
    )),
      (_r = XM(
        async (H) => {
          if (H.type !== "connected") return [];
          try {
            if (!H.capabilities?.resources) return [];
            let _ = await H.client.request({ method: "resources/list" }, QcH);
            if (!_.resources) return [];
            return _.resources.map((q) => ({ ...q, server: H.name }));
          } catch (_) {
            return f3(H.name, `Failed to fetch resources: ${QH(_)}`), [];
          }
        },
        (H) => H.name,
        lg6,
      )),
      (gzH = XM(
        async (H) => {
          if (H.type !== "connected") return [];
          try {
            if (!H.capabilities?.prompts) return [];
            let _ = await H.client.request({ method: "prompts/list" }, ncH);
            if (!_.prompts) return [];
            return t8H(_.prompts).map(($) => {
              let K = Object.values($.arguments ?? {}).map((O) => O.name);
              return {
                type: "prompt",
                name: "mcp__" + Mf(H.name) + "__" + $.name,
                description: $.description ?? "",
                hasUserSpecifiedDescription: !!$.description,
                contentLength: 0,
                isEnabled: () => !0,
                isHidden: !1,
                isMcp: !0,
                progressMessage: "running",
                userFacingName() {
                  return `${H.name}:${$.name} (MCP)`;
                },
                argNames: K,
                source: "mcp",
                async getPromptForCommand(O) {
                  let T = O.split(" ");
                  try {
                    let z = await FLH(H),
                      A = await z.client.getPrompt({ name: $.name, arguments: lR7(K, T) });
                    return (await Promise.all(A.messages.map((w) => jh7(w.content, z.name)))).flat();
                  } catch (z) {
                    throw (f3(H.name, `Error running command '${$.name}': ${QH(z)}`), z);
                  }
                },
              };
            });
          } catch (_) {
            return f3(H.name, `Failed to fetch commands: ${QH(_)}`), [];
          }
        },
        (H) => H.name,
        lg6,
      ));

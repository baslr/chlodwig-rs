    x8();
    (Cz$ = pH(() =>
      h
        .object({
          allowedDomains: h.array(h.string()).optional(),
          allowManagedDomainsOnly: h
            .boolean()
            .optional()
            .describe(
              "When true (and set in managed settings), only allowedDomains and WebFetch(domain:...) allow rules from managed settings are respected. User, project, local, and flag settings domains are ignored. Denied domains are still respected from all sources.",
            ),
          allowUnixSockets: h
            .array(h.string())
            .optional()
            .describe("macOS only: Unix socket paths to allow. Ignored on Linux (seccomp cannot filter by path)."),
          allowAllUnixSockets: h
            .boolean()
            .optional()
            .describe("If true, allow all Unix sockets (disables blocking on both platforms)."),
          allowLocalBinding: h.boolean().optional(),
          httpProxyPort: h.number().optional(),
          socksProxyPort: h.number().optional(),
        })
        .optional(),
    )),
      (bz$ = pH(() =>
        h
          .object({
            allowWrite: h
              .array(h.string())
              .optional()
              .describe(
                "Additional paths to allow writing within the sandbox. Merged with paths from Edit(...) allow permission rules.",
              ),
            denyWrite: h
              .array(h.string())
              .optional()
              .describe(
                "Additional paths to deny writing within the sandbox. Merged with paths from Edit(...) deny permission rules.",
              ),
            denyRead: h
              .array(h.string())
              .optional()
              .describe(
                "Additional paths to deny reading within the sandbox. Merged with paths from Read(...) deny permission rules.",
              ),
            allowRead: h
              .array(h.string())
              .optional()
              .describe(
                "Paths to re-allow reading within denyRead regions. Takes precedence over denyRead for matching paths.",
              ),
            allowManagedReadPathsOnly: h
              .boolean()
              .optional()
              .describe("When true (set in managed settings), only allowRead paths from policySettings are used."),
          })
          .optional(),
      )),
      (DX8 = pH(() =>
        h
          .object({
            enabled: h.boolean().optional(),
            failIfUnavailable: h
              .boolean()
              .optional()
              .describe(
                "Exit with an error at startup if sandbox.enabled is true but the sandbox cannot start (missing dependencies, unsupported platform, or platform not in enabledPlatforms). When false (default), a warning is shown and commands run unsandboxed. Intended for managed-settings deployments that require sandboxing as a hard gate.",
              ),
            autoAllowBashIfSandboxed: h.boolean().optional(),
            allowUnsandboxedCommands: h
              .boolean()
              .optional()
              .describe(
                "Allow commands to run outside the sandbox via the dangerouslyDisableSandbox parameter. When false, the dangerouslyDisableSandbox parameter is completely ignored and all commands must run sandboxed. Default: true.",
              ),
            network: Cz$(),
            filesystem: bz$(),
            ignoreViolations: h.record(h.string(), h.array(h.string())).optional(),
            enableWeakerNestedSandbox: h.boolean().optional(),
            enableWeakerNetworkIsolation: h
              .boolean()
              .optional()
              .describe(
                "macOS only: Allow access to com.apple.trustd.agent in the sandbox. Needed for Go-based CLI tools (gh, gcloud, terraform, etc.) to verify TLS certificates when using httpProxyPort with a MITM proxy and custom CA. " +
                  "**Reduces security** \u2014 opens a potential data exfiltration vector through the trustd service. Default: false",
              ),
            excludedCommands: h.array(h.string()).optional(),
            ripgrep: h
              .object({ command: h.string(), args: h.array(h.string()).optional() })
              .optional()
              .describe("Custom ripgrep configuration for bundled ripgrep support"),
          })
          .passthrough(),
      ));

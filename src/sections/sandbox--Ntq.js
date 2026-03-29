    SOH();
    (dV6 = t9.string().refine(
      (H) => {
        if (H.includes("://") || H.includes("/") || H.includes(":")) return !1;
        if (H === "localhost") return !0;
        if (H.startsWith("*.")) {
          let _ = H.slice(2);
          if (!_.includes(".") || _.startsWith(".") || _.endsWith(".")) return !1;
          let q = _.split(".");
          return q.length >= 2 && q.every(($) => $.length > 0);
        }
        if (H.includes("*")) return !1;
        return H.includes(".") && !H.startsWith(".") && !H.endsWith(".");
      },
      {
        message:
          'Invalid domain pattern. Must be a valid domain (e.g., "example.com") or wildcard (e.g., "*.example.com"). Overly broad patterns like "*.com" or "*" are not allowed for security reasons.',
      },
    )),
      (rZ_ = t9.string().min(1, "Path cannot be empty")),
      (ku4 = t9.object({
        socketPath: t9.string().min(1).describe("Unix socket path to the MITM proxy"),
        domains: t9
          .array(dV6)
          .min(1)
          .describe('Domains to route through the MITM proxy (e.g., ["api.example.com", "*.internal.org"])'),
      })),
      (Ztq = t9.object({
        allowedDomains: t9.array(dV6).describe('List of allowed domains (e.g., ["github.com", "*.npmjs.org"])'),
        deniedDomains: t9.array(dV6).describe("List of denied domains"),
        allowUnixSockets: t9
          .array(t9.string())
          .optional()
          .describe("macOS only: Unix socket paths to allow. Ignored on Linux (seccomp cannot filter by path)."),
        allowAllUnixSockets: t9
          .boolean()
          .optional()
          .describe("If true, allow all Unix sockets (disables blocking on both platforms)."),
        allowLocalBinding: t9.boolean().optional().describe("Whether to allow binding to local ports (default: false)"),
        httpProxyPort: t9
          .number()
          .int()
          .min(1)
          .max(65535)
          .optional()
          .describe(
            "Port of an external HTTP proxy to use instead of starting a local one. When provided, the library will skip starting its own HTTP proxy and use this port. The external proxy must handle domain filtering.",
          ),
        socksProxyPort: t9
          .number()
          .int()
          .min(1)
          .max(65535)
          .optional()
          .describe(
            "Port of an external SOCKS proxy to use instead of starting a local one. When provided, the library will skip starting its own SOCKS proxy and use this port. The external proxy must handle domain filtering.",
          ),
        mitmProxy: ku4
          .optional()
          .describe(
            "Optional MITM proxy configuration. Routes matching domains through an upstream proxy via Unix socket while SRT still handles allow/deny filtering.",
          ),
      })),
      (Ltq = t9.object({
        denyRead: t9.array(rZ_).describe("Paths denied for reading"),
        allowRead: t9
          .array(rZ_)
          .optional()
          .describe(
            "Paths to re-allow reading within denied regions (takes precedence over denyRead). Use with denyRead to deny a broad region then allow back specific subdirectories.",
          ),
        allowWrite: t9.array(rZ_).describe("Paths allowed for writing"),
        denyWrite: t9.array(rZ_).describe("Paths denied for writing (takes precedence over allowWrite)"),
        allowGitConfig: t9
          .boolean()
          .optional()
          .describe(
            "Allow writes to .git/config files (default: false). Enables git remote URL updates while keeping .git/hooks protected.",
          ),
      })),
      (ktq = t9
        .record(t9.string(), t9.array(t9.string()))
        .describe(
          'Map of command patterns to filesystem paths to ignore violations for. Use "*" to match all commands',
        )),
      (vtq = t9.object({
        command: t9.string().describe("The ripgrep command to execute"),
        args: t9.array(t9.string()).optional().describe("Additional arguments to pass before ripgrep args"),
        argv0: t9
          .string()
          .optional()
          .describe("Override argv[0] when spawning (for multicall binaries that dispatch on argv[0])"),
      })),
      (vu4 = t9.object({
        bpfPath: t9.string().optional().describe("Path to the unix-block.bpf filter file"),
        applyPath: t9.string().optional().describe("Path to the apply-seccomp binary"),
      })),
      (cV6 = t9.object({
        network: Ztq.describe("Network restrictions configuration"),
        filesystem: Ltq.describe("Filesystem restrictions configuration"),
        ignoreViolations: ktq.optional().describe("Optional configuration for ignoring specific violations"),
        enableWeakerNestedSandbox: t9
          .boolean()
          .optional()
          .describe("Enable weaker nested sandbox mode (for Docker environments)"),
        enableWeakerNetworkIsolation: t9
          .boolean()
          .optional()
          .describe(
            "Enable weaker network isolation to allow access to com.apple.trustd.agent (macOS only). This is needed for Go programs (gh, gcloud, terraform, kubectl, etc.) to verify TLS certificates when using httpProxyPort with a MITM proxy and custom CA. Enabling this opens a potential data exfiltration vector through the trustd service. Only enable if you need Go TLS verification.",
          ),
        ripgrep: vtq.optional().describe('Custom ripgrep configuration (default: { command: "rg" })'),
        mandatoryDenySearchDepth: t9
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe(
            "Maximum directory depth to search for dangerous files on Linux (default: 3). Higher values provide more protection but slower performance.",
          ),
        allowPty: t9.boolean().optional().describe("Allow pseudo-terminal (pty) operations (macOS only)"),
        seccomp: vu4.optional().describe("Custom seccomp binary paths (Linux only)."),
      }));

    u7();
    s$();
    g_();
    t96();
    n8();
    QL();
    (IZ8 = require("os")),
      (u5_ = require("path")),
      (ZM = $6(() => {
        if (f_().existsSync(u5_.join(i6(), ".config.json"))) return u5_.join(i6(), ".config.json");
        let H = `.claude${o96()}.json`;
        return u5_.join(process.env.CLAUDE_CONFIG_DIR || IZ8.homedir(), H);
      })),
      (H2$ = $6(async () => {
        try {
          let { default: H } = await Promise.resolve().then(() => (Z9(), RMH));
          return await H.head("http://1.1.1.1", { signal: AbortSignal.timeout(1000) }), !0;
        } catch {
          return !1;
        }
      }));
    (_2$ = $6(async () => {
      let H = [];
      if (await ZMH("npm")) H.push("npm");
      if (await ZMH("yarn")) H.push("yarn");
      if (await ZMH("pnpm")) H.push("pnpm");
      return H;
    })),
      (q2$ = $6(async () => {
        let H = [];
        if (await ZMH("bun")) H.push("bun");
        if (await ZMH("deno")) H.push("deno");
        if (await ZMH("node")) H.push("node");
        return H;
      })),
      (uZ8 = $6(() => {
        try {
          return f_().existsSync("/proc/sys/fs/binfmt_misc/WSLInterop");
        } catch (H) {
          return !1;
        }
      })),
      ($2$ = $6(() => {
        try {
          if (!uZ8()) return !1;
          let { cmd: H } = H5_("npm", []);
          return H.startsWith("/mnt/c/");
        } catch (H) {
          return !1;
        }
      })),
      (M46 = [
        "pycharm",
        "intellij",
        "webstorm",
        "phpstorm",
        "rubymine",
        "clion",
        "goland",
        "rider",
        "datagrip",
        "appcode",
        "dataspell",
        "aqua",
        "gateway",
        "fleet",
        "jetbrains",
        "androidstudio",
      ]);
    T2$ = $6(() => {
      if (lH(process.env.CODESPACES)) return "codespaces";
      if (process.env.GITPOD_WORKSPACE_ID) return "gitpod";
      if (process.env.REPL_ID || process.env.REPL_SLUG) return "replit";
      if (process.env.PROJECT_DOMAIN) return "glitch";
      if (lH(process.env.VERCEL)) return "vercel";
      if (process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_SERVICE_NAME) return "railway";
      if (lH(process.env.RENDER)) return "render";
      if (lH(process.env.NETLIFY)) return "netlify";
      if (process.env.DYNO) return "heroku";
      if (process.env.FLY_APP_NAME || process.env.FLY_MACHINE_ID) return "fly.io";
      if (lH(process.env.CF_PAGES)) return "cloudflare-pages";
      if (process.env.DENO_DEPLOYMENT_ID) return "deno-deploy";
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) return "aws-lambda";
      if (process.env.AWS_EXECUTION_ENV === "AWS_ECS_FARGATE") return "aws-fargate";
      if (process.env.AWS_EXECUTION_ENV === "AWS_ECS_EC2") return "aws-ecs";
      try {
        if (f_().readFileSync("/sys/hypervisor/uuid", { encoding: "utf8" }).trim().toLowerCase().startsWith("ec2"))
          return "aws-ec2";
      } catch {}
      if (process.env.K_SERVICE) return "gcp-cloud-run";
      if (process.env.GOOGLE_CLOUD_PROJECT) return "gcp";
      if (process.env.WEBSITE_SITE_NAME || process.env.WEBSITE_SKU) return "azure-app-service";
      if (process.env.AZURE_FUNCTIONS_ENVIRONMENT) return "azure-functions";
      if (process.env.APP_URL?.includes("ondigitalocean.app")) return "digitalocean-app-platform";
      if (process.env.SPACE_CREATOR_USER_ID) return "huggingface-spaces";
      if (lH(process.env.GITHUB_ACTIONS)) return "github-actions";
      if (lH(process.env.GITLAB_CI)) return "gitlab-ci";
      if (process.env.CIRCLECI) return "circleci";
      if (process.env.BUILDKITE) return "buildkite";
      if (lH(!1)) return "ci";
      if (process.env.KUBERNETES_SERVICE_HOST) return "kubernetes";
      try {
        if (f_().existsSync("/.dockerenv")) return "docker";
      } catch {}
      if (a6.platform === "darwin") return "unknown-darwin";
      if (a6.platform === "linux") return "unknown-linux";
      if (a6.platform === "win32") return "unknown-win32";
      return "unknown";
    });
    a6 = {
      hasInternetAccess: H2$,
      isCI: lH(!1),
      platform: ["win32", "darwin"].includes("darwin") ? "darwin" : "linux",
      arch: "arm64",
      nodeVersion: process.version,
      terminal: O2$(),
      isSSH: xZ8,
      getPackageManagers: _2$,
      getRuntimes: q2$,
      isRunningWithBun: $6(OMH),
      isWslEnvironment: uZ8,
      isNpmFromWindowsPath: $2$,
      isConductor: K2$,
      detectDeploymentEnvironment: T2$,
    };

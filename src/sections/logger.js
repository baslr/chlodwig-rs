    EM();
    Kz();
    UB();
    SM();
    vX();
    z0q();
    (A0q = u(require("child_process"))),
      (tI = z1("AzureCliCredential")),
      (f0q = {
        getSafeWorkingDir() {
          return "/bin";
        },
        async getAzureCliAccessToken(H, _, q, $) {
          let K = [],
            O = [];
          if (_) K = ["--tenant", _];
          if (q) O = ["--subscription", `"${q}"`];
          return new Promise((T, z) => {
            try {
              A0q.default.execFile(
                "az",
                ["account", "get-access-token", "--output", "json", "--resource", H, ...K, ...O],
                { cwd: f0q.getSafeWorkingDir(), shell: !0, timeout: $ },
                (A, f, w) => {
                  T({ stdout: f, stderr: w, error: A });
                },
              );
            } catch (A) {
              z(A);
            }
          });
        },
      });

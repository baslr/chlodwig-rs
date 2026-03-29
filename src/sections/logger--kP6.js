    Kz();
    SM();
    EM();
    vX();
    UB();
    (w0q = u(require("child_process"))),
      (pHH = z1("AzureDeveloperCliCredential")),
      (Y0q = {
        getSafeWorkingDir() {
          return "/bin";
        },
        async getAzdAccessToken(H, _, q) {
          let $ = [];
          if (_) $ = ["--tenant-id", _];
          return new Promise((K, O) => {
            try {
              w0q.default.execFile(
                "azd",
                ["auth", "token", "--output", "json", ...H.reduce((T, z) => T.concat("--scope", z), []), ...$],
                { cwd: Y0q.getSafeWorkingDir(), timeout: q },
                (T, z, A) => {
                  K({ stdout: z, stderr: A, error: T });
                },
              );
            } catch (T) {
              O(T);
            }
          });
        },
      });

    Rr();
    (nd6 = new Set(["invoke-command", "start-job", "start-threadjob", "register-scheduledjob"])),
      (rd6 = new Set([
        "invoke-command",
        "invoke-expression",
        "start-job",
        "start-threadjob",
        "register-scheduledjob",
        "register-engineevent",
        "register-objectevent",
        "register-wmievent",
        "new-pssession",
        "enter-pssession",
      ])),
      (od6 = new Set([
        "import-module",
        "ipmo",
        "install-module",
        "save-module",
        "update-module",
        "install-script",
        "save-script",
      ])),
      (Xj1 = ["pwsh", "powershell", "cmd", "bash", "wsl", "sh", "start-process", "start", "add-type", "new-object"]);
    (Gj1 = new Set(["invoke-webrequest", "invoke-restmethod"])),
      (Rj1 = new Set(["set-alias", "sal", "new-alias", "nal", "set-variable", "sv", "new-variable", "nv"])),
      (Zj1 = new Set(["invoke-wmimethod", "iwmi", "invoke-cimmethod"])),
      (aV7 = (() => {
        let H = new Set([...Xj1, ...nd6, ...rd6, ...od6, ...Gj1, ...Rj1, ...Zj1]);
        return new Set([...H, ...Wj1(H)]);
      })());

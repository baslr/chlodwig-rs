    mL6();
    (BR7 = u(LH6(), 1)),
      (hrH = u(require("process"))),
      (gR7 = require("stream")),
      (Tz1 =
        hrH.default.platform === "win32"
          ? [
              "APPDATA",
              "HOMEDRIVE",
              "HOMEPATH",
              "LOCALAPPDATA",
              "PATH",
              "PROCESSOR_ARCHITECTURE",
              "SYSTEMDRIVE",
              "SYSTEMROOT",
              "TEMP",
              "USERNAME",
              "USERPROFILE",
              "PROGRAMFILES",
            ]
          : ["HOME", "LOGNAME", "PATH", "SHELL", "TERM", "USER"]);

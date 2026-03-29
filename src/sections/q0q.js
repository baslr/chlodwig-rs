    IWq();
    rWq();
    KP6();
    (NM_ = u(require("process"))),
      (PP6 = require("buffer")),
      (XP6 = u(require("path"))),
      (eWq = require("url")),
      (H0q = require("util")),
      (WP6 = u(require("child_process"))),
      (hM_ = u(require("fs/promises"))),
      (j14 = H0q.promisify(WP6.default.execFile)),
      (JP6 = XP6.default.dirname(
        eWq.fileURLToPath(
          "file:///home/runner/work/claude-cli-internal/claude-cli-internal/node_modules/open/index.js",
        ),
      )),
      (oWq = XP6.default.join(JP6, "xdg-open")),
      ({ platform: yXH, arch: aWq } = NM_.default);
    xHH = {};
    uHH(xHH, "chrome", () =>
      yM_(
        { darwin: "google chrome", win32: "chrome", linux: ["google-chrome", "google-chrome-stable", "chromium"] },
        {
          wsl: {
            ia32: "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            x64: [
              "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
              "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            ],
          },
        },
      ),
    );
    uHH(xHH, "brave", () =>
      yM_(
        { darwin: "brave browser", win32: "brave", linux: ["brave-browser", "brave"] },
        {
          wsl: {
            ia32: "/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe",
            x64: [
              "/mnt/c/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
              "/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe",
            ],
          },
        },
      ),
    );
    uHH(xHH, "firefox", () =>
      yM_(
        { darwin: "firefox", win32: String.raw`C:\Program Files\Mozilla Firefox\firefox.exe`, linux: "firefox" },
        { wsl: "/mnt/c/Program Files/Mozilla Firefox/firefox.exe" },
      ),
    );
    uHH(xHH, "edge", () =>
      yM_(
        { darwin: "microsoft edge", win32: "msedge", linux: ["microsoft-edge", "microsoft-edge-dev"] },
        { wsl: "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" },
      ),
    );
    uHH(xHH, "browser", () => "browser");
    uHH(xHH, "browserPrivate", () => "browserPrivate");
    X14 = J14;

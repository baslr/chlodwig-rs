    ER();
    rbH = class rbH extends Error {
      constructor(H) {
        super(H);
        this.name = this.constructor.name;
      }
    };
    mp = class mp extends Error {};
    N5 = class N5 extends Error {
      constructor(H) {
        super(H);
        this.name = "AbortError";
      }
    };
    CR = class CR extends Error {
      filePath;
      defaultConfig;
      constructor(H, _, q) {
        super(H);
        (this.name = "ConfigParseError"), (this.filePath = _), (this.defaultConfig = q);
      }
    };
    zh = class zh extends Error {
      stdout;
      stderr;
      code;
      interrupted;
      constructor(H, _, q, $) {
        super("Shell command failed");
        this.stdout = H;
        this.stderr = _;
        this.code = q;
        this.interrupted = $;
        this.name = "ShellError";
      }
    };
    MM = class MM extends Error {
      formattedMessage;
      constructor(H, _) {
        super(H);
        this.formattedMessage = _;
        this.name = "TeleportOperationError";
      }
    };
    rV = class rV extends Error {
      telemetryMessage;
      constructor(H, _) {
        super(H);
        (this.name = "TelemetrySafeError"), (this.telemetryMessage = _ ?? H);
      }
    };

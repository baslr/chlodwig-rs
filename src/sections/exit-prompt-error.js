    $S6 = class $S6 extends Error {
      name = "AbortPromptError";
      message = "Prompt was aborted";
      constructor(H) {
        super();
        this.cause = H?.cause;
      }
    };
    KS6 = class KS6 extends Error {
      name = "CancelPromptError";
      message = "Prompt was canceled";
    };
    OS6 = class OS6 extends Error {
      name = "ExitPromptError";
    };
    TS6 = class TS6 extends Error {
      name = "HookError";
    };
    nQH = class nQH extends Error {
      name = "ValidationError";
    };

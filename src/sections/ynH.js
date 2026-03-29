    k_();
    L_();
    (K51 = /\bgit\s+commit\b/),
      (O51 = /\bgit\s+push\b/),
      (T51 = [
        { re: /\bgh\s+pr\s+create\b/, action: "created", op: "pr_create" },
        { re: /\bgh\s+pr\s+edit\b/, action: "edited", op: "pr_edit" },
        { re: /\bgh\s+pr\s+merge\b/, action: "merged", op: "pr_merge" },
        { re: /\bgh\s+pr\s+comment\b/, action: "commented", op: "pr_comment" },
        { re: /\bgh\s+pr\s+close\b/, action: "closed", op: "pr_close" },
        { re: /\bgh\s+pr\s+ready\b/, action: "ready", op: "pr_ready" },
      ]);

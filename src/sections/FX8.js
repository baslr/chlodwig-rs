    E96 = {
      filePatternTools: ["Read", "Write", "Edit", "Glob", "NotebookRead", "NotebookEdit"],
      bashPrefixTools: ["Bash"],
      customValidation: {
        WebSearch: (H) => {
          if (H.includes("*") || H.includes("?"))
            return {
              valid: !1,
              error: "WebSearch does not support wildcards",
              suggestion: "Use exact search terms without * or ?",
              examples: ["WebSearch(claude ai)", "WebSearch(typescript tutorial)"],
            };
          return { valid: !0 };
        },
        WebFetch: (H) => {
          if (H.includes("://") || H.startsWith("http"))
            return {
              valid: !1,
              error: "WebFetch permissions use domain format, not URLs",
              suggestion: 'Use "domain:hostname" format',
              examples: ["WebFetch(domain:example.com)", "WebFetch(domain:github.com)"],
            };
          if (!H.startsWith("domain:"))
            return {
              valid: !1,
              error: 'WebFetch permissions must use "domain:" prefix',
              suggestion: 'Use "domain:hostname" format',
              examples: ["WebFetch(domain:example.com)", "WebFetch(domain:*.google.com)"],
            };
          return { valid: !0 };
        },
      },
    };

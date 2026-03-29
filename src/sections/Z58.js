    u7();
    Ao();
    I8();
    y6();
    jK();
    j9();
    l$();
    N_();
    d5H();
    KGK = [
      /(?:^|\/)(?:package-lock\.json|yarn\.lock|bun\.lock|bun\.lockb|pnpm-lock\.yaml|Pipfile\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock|go\.sum|composer\.lock|uv\.lock)$/,
      /\.generated\./,
      /(?:^|\/)(?:dist|build|out|target|node_modules|\.next|__pycache__)\//,
      /\.(?:min\.js|min\.css|map|pyc|pyo)$/,
      /\.(?:json|ya?ml|toml|xml|ini|cfg|conf|env|lock|txt|md|mdx|rst|csv|log|svg)$/i,
      /(?:^|\/)\.?(?:eslintrc|prettierrc|babelrc|editorconfig|gitignore|gitattributes|dockerignore|npmrc)/,
      /(?:^|\/)(?:tsconfig|jsconfig|biome|vitest\.config|jest\.config|webpack\.config|vite\.config|rollup\.config)\.[a-z]+$/,
      /(?:^|\/)\.(?:github|vscode|idea|claude)\//,
      /(?:^|\/)(?:CHANGELOG|LICENSE|CONTRIBUTING|CODEOWNERS|README)(?:\.[a-z]+)?$/i,
    ];
    (rx9 = $6(() => {
      let H = pz(),
        _ = H.exampleFiles?.length ? nj(H.exampleFiles) : "<filepath>",
        q = [
          "fix lint errors",
          "fix typecheck errors",
          `how does ${_} work?`,
          `refactor ${_}`,
          "how do I log an error?",
          `edit ${_} to...`,
          `write a test for ${_}`,
          "create a util logging.py that...",
        ];
      return `Try "${nj(q)}"`;
    })),
      (ox9 = $6(async () => {
        let H = pz(),
          _ = Date.now(),
          q = H.exampleFilesGeneratedAt ?? 0;
        if (_ - q > AGK) H.exampleFiles = [];
        if (!H.exampleFiles?.length)
          zGK().then(($) => {
            if ($.length) Bz((K) => ({ ...K, exampleFiles: $, exampleFilesGeneratedAt: Date.now() }));
          });
      }));

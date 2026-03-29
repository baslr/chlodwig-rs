    kG();
    ET1 = new Map([
      ["grep", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "No matches found" : void 0 })],
      ["rg", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "No matches found" : void 0 })],
      ["find", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "Some directories were inaccessible" : void 0 })],
      ["diff", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "Files differ" : void 0 })],
      ["test", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "Condition is false" : void 0 })],
      ["[", (H, _, q) => ({ isError: H >= 2, message: H === 1 ? "Condition is false" : void 0 })],
    ]);

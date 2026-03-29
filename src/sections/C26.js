    (swq = typeof window < "u" && typeof window.document < "u"),
      (twq =
        typeof self === "object" &&
        typeof (self === null || self === void 0 ? void 0 : self.importScripts) === "function" &&
        (((y26 = self.constructor) === null || y26 === void 0 ? void 0 : y26.name) === "DedicatedWorkerGlobalScope" ||
          ((V26 = self.constructor) === null || V26 === void 0 ? void 0 : V26.name) === "ServiceWorkerGlobalScope" ||
          ((S26 = self.constructor) === null || S26 === void 0 ? void 0 : S26.name) === "SharedWorkerGlobalScope")),
      (ewq = typeof Deno < "u" && typeof Deno.version < "u" && typeof Deno.version.deno < "u"),
      (HYq = typeof Bun < "u" && typeof Bun.version < "u"),
      (FPH =
        typeof globalThis.process < "u" &&
        Boolean(globalThis.process.version) &&
        Boolean((E26 = globalThis.process.versions) === null || E26 === void 0 ? void 0 : E26.node)),
      (_Yq =
        typeof navigator < "u" &&
        (navigator === null || navigator === void 0 ? void 0 : navigator.product) === "ReactNative");

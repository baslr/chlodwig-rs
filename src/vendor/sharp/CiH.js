  var CiH = d((WHO, p37) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var { familySync: Ao4, versionSync: fo4 } = iv_(),
      {
        runtimePlatformArch: wo4,
        isUnsupportedNodeRuntime: m37,
        prebuiltPlatforms: Yo4,
        minimumLibvipsVersion: Do4,
      } = vI6(),
      kTH = wo4(),
      jo4 = [
        `../src/build/Release/sharp-${kTH}.node`,
        "../src/build/Release/sharp-wasm32.node",
        `@img/sharp-${kTH}/sharp.node`,
        "@img/sharp-wasm32/sharp.node",
      ],
      NI6,
      MZH,
      EiH = [];
    for (NI6 of jo4)
      try {
        MZH = require(NI6);
        break;
      } catch (H) {
        EiH.push(H);
      }
    if (MZH && NI6.startsWith("@img/sharp-linux-x64") && !MZH._isUsingX64V2()) {
      let H = Error("Prebuilt binaries for linux-x64 require v2 microarchitecture");
      (H.code = "Unsupported CPU"), EiH.push(H), (MZH = null);
    }
    if (MZH) p37.exports = MZH;
    else {
      let [H, _, q] = ["linux", "darwin", "win32"].map((O) => kTH.startsWith(O)),
        $ = [`Could not load the "sharp" module using the ${kTH} runtime`];
      EiH.forEach((O) => {
        if (O.code !== "MODULE_NOT_FOUND") $.push(`${O.code}: ${O.message}`);
      });
      let K = EiH.map((O) => O.message).join(" ");
      if (($.push("Possible solutions:"), m37())) {
        let { found: O, expected: T } = m37();
        $.push("- Please upgrade Node.js:", `    Found ${O}`, `    Requires ${T}`);
      } else if (Yo4.includes(kTH)) {
        let [O, T] = kTH.split("-"),
          z = O.endsWith("musl") ? " --libc=musl" : "";
        $.push(
          "- Ensure optional dependencies can be installed:",
          "    npm install --include=optional sharp",
          "- Ensure your package manager supports multi-platform installation:",
          "    See https://sharp.pixelplumbing.com/install#cross-platform",
          "- Add platform-specific dependencies:",
          `    npm install --os=${O.replace("musl", "")}${z} --cpu=${T} sharp`,
        );
      } else
        $.push(
          `- Manually install libvips >= ${Do4}`,
          "- Add experimental WebAssembly-based dependencies:",
          "    npm install --cpu=wasm32 sharp",
          "    npm install @img/sharp-wasm32",
        );
      if (H && /(symbol not found|CXXABI_)/i.test(K))
        try {
          let { config: O } = require(`@img/sharp-libvips-${kTH}/package`),
            T = `${Ao4()} ${fo4()}`,
            z = `${O.musl ? "musl" : "glibc"} ${O.musl || O.glibc}`;
          $.push("- Update your OS:", `    Found ${T}`, `    Requires ${z}`);
        } catch (O) {}
      if (H && /\/snap\/core[0-9]{2}/.test(K))
        $.push("- Remove the Node.js Snap, which does not support native modules", "    snap remove node");
      if (_ && /Incompatible library version/.test(K))
        $.push("- Update Homebrew:", "    brew update && brew upgrade vips");
      if (EiH.some((O) => O.code === "ERR_DLOPEN_DISABLED")) $.push("- Run Node.js without using the --no-addons flag");
      if (q && /The specified procedure could not be found/.test(K))
        $.push(
          "- Using the canvas package on Windows?",
          "    See https://sharp.pixelplumbing.com/install#canvas-and-windows",
          "- Check for outdated versions of sharp in the dependency tree:",
          "    npm ls sharp",
        );
      throw (
        ($.push("- Consult the installation documentation:", "    See https://sharp.pixelplumbing.com/install"),
        Error(
          $.join(`
`),
        ))
      );
    }
  });

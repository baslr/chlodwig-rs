  var vI6 = d((XHO, x37) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var { spawnSync: LI6 } = require("child_process"),
      { createHash: lr4 } = require("crypto"),
      S37 = r57(),
      ir4 = JI6(),
      nr4 = N37(),
      h37 = iv_(),
      { config: rr4, engines: y37, optionalDependencies: or4 } = RI6(),
      ar4 = process.env.npm_package_config_libvips || rr4.libvips,
      E37 = S37(ar4).version,
      sr4 = [
        "darwin-arm64",
        "darwin-x64",
        "linux-arm",
        "linux-arm64",
        "linux-ppc64",
        "linux-riscv64",
        "linux-s390x",
        "linux-x64",
        "linuxmusl-arm64",
        "linuxmusl-x64",
        "win32-arm64",
        "win32-ia32",
        "win32-x64",
      ],
      kI6 = { encoding: "utf8", shell: !0 },
      tr4 = (H) => {
        if (H instanceof Error) console.error(`sharp: Installation error: ${H.message}`);
        else console.log(`sharp: ${H}`);
      },
      C37 = () => (h37.isNonGlibcLinuxSync() ? h37.familySync() : ""),
      er4 = () => `darwin${C37()}-arm64`,
      jZH = () => {
        if (b37()) return "wasm32";
        let { npm_config_arch: H, npm_config_platform: _, npm_config_libc: q } = process.env,
          $ = typeof q === "string" ? q : C37();
        return `${_ || "darwin"}${$}-${H || "arm64"}`;
      },
      Ho4 = () => {
        try {
          return require(`@img/sharp-libvips-dev-${jZH()}/include`);
        } catch {
          try {
            return (() => {
              throw new Error("Cannot require module " + "@img/sharp-libvips-dev/include");
            })();
          } catch {}
        }
        return "";
      },
      _o4 = () => {
        try {
          return (() => {
            throw new Error("Cannot require module " + "@img/sharp-libvips-dev/cplusplus");
          })();
        } catch {}
        return "";
      },
      qo4 = () => {
        try {
          return require(`@img/sharp-libvips-dev-${jZH()}/lib`);
        } catch {
          try {
            return require(`@img/sharp-libvips-${jZH()}/lib`);
          } catch {}
        }
        return "";
      },
      $o4 = () => {
        if (process.release?.name === "node" && process.versions) {
          if (!nr4(process.versions.node, y37.node)) return { found: process.versions.node, expected: y37.node };
        }
      },
      b37 = () => {
        let { CC: H } = process.env;
        return Boolean(H?.endsWith("/emcc"));
      },
      Ko4 = () => {
        return !1;
      },
      V37 = (H) => lr4("sha512").update(H).digest("hex"),
      Oo4 = () => {
        try {
          let H = V37(`imgsharp-libvips-${jZH()}`),
            _ = S37(or4[`@img/sharp-libvips-${jZH()}`], { includePrerelease: !0 }).version;
          return V37(`${H}npm:${_}`).slice(0, 10);
        } catch {}
        return "";
      },
      To4 = () =>
        LI6(`node-gyp rebuild --directory=src ${b37() ? "--nodedir=emscripten" : ""}`, { ...kI6, stdio: "inherit" })
          .status,
      I37 = () => {
        return (
          LI6("pkg-config --modversion vips-cpp", { ...kI6, env: { ...process.env, PKG_CONFIG_PATH: u37() } }).stdout ||
          ""
        ).trim();
      },
      u37 = () => {
        return [
          (
            LI6('which brew >/dev/null 2>&1 && brew environment --plain | grep PKG_CONFIG_LIBDIR | cut -d" " -f2', kI6)
              .stdout || ""
          ).trim(),
          process.env.PKG_CONFIG_PATH,
          "/usr/local/lib/pkgconfig",
          "/usr/lib/pkgconfig",
          "/usr/local/libdata/pkgconfig",
          "/usr/libdata/pkgconfig",
        ]
          .filter(Boolean)
          .join(":");
      },
      ZI6 = (H, _, q) => {
        if (q) q(`Detected ${_}, skipping search for globally-installed libvips`);
        return H;
      },
      zo4 = (H) => {
        if (Boolean(process.env.SHARP_IGNORE_GLOBAL_LIBVIPS) === !0) return ZI6(!1, "SHARP_IGNORE_GLOBAL_LIBVIPS", H);
        if (Boolean(process.env.SHARP_FORCE_GLOBAL_LIBVIPS) === !0) return ZI6(!0, "SHARP_FORCE_GLOBAL_LIBVIPS", H);
        if (Ko4()) return ZI6(!1, "Rosetta", H);
        let _ = I37();
        return !!_ && ir4(_, E37);
      };
    x37.exports = {
      minimumLibvipsVersion: E37,
      prebuiltPlatforms: sr4,
      buildPlatformArch: jZH,
      buildSharpLibvipsIncludeDir: Ho4,
      buildSharpLibvipsCPlusPlusDir: _o4,
      buildSharpLibvipsLibDir: qo4,
      isUnsupportedNodeRuntime: $o4,
      runtimePlatformArch: er4,
      log: tr4,
      yarnLocator: Oo4,
      spawnRebuild: To4,
      globalLibvipsVersion: I37,
      pkgConfigPath: u37,
      useGlobalLibvips: zo4,
    };
  });

    kG();
    Cj();
    h5();
    q5();
    uY();
    gQH();
    fv();
    Vh_();
    (zX7 = require("os")), (Sh_ = require("path"));
    (XnH = {
      cd: (H) => (H.length === 0 ? [zX7.homedir()] : [H.join(" ")]),
      ls: (H) => {
        let _ = JT(H);
        return _.length > 0 ? _ : ["."];
      },
      find: (H) => {
        let _ = [],
          q = new Set([
            "-newer",
            "-anewer",
            "-cnewer",
            "-mnewer",
            "-samefile",
            "-path",
            "-wholename",
            "-ilname",
            "-lname",
            "-ipath",
            "-iwholename",
          ]),
          $ = /^-newer[acmBt][acmtB]$/,
          K = !1,
          O = !1;
        for (let T = 0; T < H.length; T++) {
          let z = H[T];
          if (!z) continue;
          if (O) {
            _.push(z);
            continue;
          }
          if (z === "--") {
            O = !0;
            continue;
          }
          if (z.startsWith("-")) {
            if (["-H", "-L", "-P"].includes(z)) continue;
            if (((K = !0), q.has(z) || $.test(z))) {
              let A = H[T + 1];
              if (A) _.push(A), T++;
            }
            continue;
          }
          if (!K) _.push(z);
        }
        return _.length > 0 ? _ : ["."];
      },
      mkdir: JT,
      touch: JT,
      rm: JT,
      rmdir: JT,
      mv: JT,
      cp: JT,
      cat: JT,
      head: JT,
      tail: JT,
      sort: JT,
      uniq: JT,
      wc: JT,
      cut: JT,
      paste: JT,
      column: JT,
      file: JT,
      stat: JT,
      diff: JT,
      awk: JT,
      strings: JT,
      hexdump: JT,
      od: JT,
      base64: JT,
      nl: JT,
      sha256sum: JT,
      sha1sum: JT,
      md5sum: JT,
      tr: (H) => {
        let _ = H.some(($) => $ === "-d" || $ === "--delete" || ($.startsWith("-") && $.includes("d")));
        return JT(H).slice(_ ? 1 : 2);
      },
      grep: (H) => {
        let q = OX7(
          H,
          new Set([
            "-e",
            "--regexp",
            "-f",
            "--file",
            "--exclude",
            "--include",
            "--exclude-dir",
            "--include-dir",
            "-m",
            "--max-count",
            "-A",
            "--after-context",
            "-B",
            "--before-context",
            "-C",
            "--context",
          ]),
        );
        if (q.length === 0 && H.some(($) => ["-r", "-R", "--recursive"].includes($))) return ["."];
        return q;
      },
      rg: (H) => {
        return OX7(
          H,
          new Set([
            "-e",
            "--regexp",
            "-f",
            "--file",
            "-t",
            "--type",
            "-T",
            "--type-not",
            "-g",
            "--glob",
            "-m",
            "--max-count",
            "--max-depth",
            "-r",
            "--replace",
            "-A",
            "--after-context",
            "-B",
            "--before-context",
            "-C",
            "--context",
          ]),
          ["."],
        );
      },
      sed: (H) => {
        let _ = [],
          q = !1,
          $ = !1,
          K = !1;
        for (let O = 0; O < H.length; O++) {
          if (q) {
            q = !1;
            continue;
          }
          let T = H[O];
          if (!T) continue;
          if (!K && T === "--") {
            K = !0;
            continue;
          }
          if (!K && T.startsWith("-")) {
            if (["-f", "--file"].includes(T)) {
              let z = H[O + 1];
              if (z) _.push(z), (q = !0);
              $ = !0;
            } else if (["-e", "--expression"].includes(T)) (q = !0), ($ = !0);
            else if (T.includes("e") || T.includes("f")) $ = !0;
            continue;
          }
          if (!$) {
            $ = !0;
            continue;
          }
          _.push(T);
        }
        return _;
      },
      jq: (H) => {
        let _ = [],
          q = new Set([
            "-e",
            "--expression",
            "-f",
            "--from-file",
            "--arg",
            "--argjson",
            "--slurpfile",
            "--rawfile",
            "--args",
            "--jsonargs",
            "-L",
            "--library-path",
            "--indent",
            "--tab",
          ]),
          $ = !1,
          K = !1;
        for (let O = 0; O < H.length; O++) {
          let T = H[O];
          if (T === void 0 || T === null) continue;
          if (!K && T === "--") {
            K = !0;
            continue;
          }
          if (!K && T.startsWith("-")) {
            let z = T.split("=")[0];
            if (z && ["-e", "--expression"].includes(z)) $ = !0;
            if (z && q.has(z) && !T.includes("=")) O++;
            continue;
          }
          if (!$) {
            $ = !0;
            continue;
          }
          _.push(T);
        }
        return _;
      },
      git: (H) => {
        if (H.length >= 1 && H[0] === "diff") {
          if (H.includes("--no-index")) return JT(H.slice(1)).slice(0, 2);
        }
        return [];
      },
    }),
      (AX7 = Object.keys(XnH)),
      (TK1 = {
        cd: "change directories to",
        ls: "list files in",
        find: "search files in",
        mkdir: "create directories in",
        touch: "create or modify files in",
        rm: "remove files from",
        rmdir: "remove directories from",
        mv: "move files to/from",
        cp: "copy files to/from",
        cat: "concatenate files from",
        head: "read the beginning of files from",
        tail: "read the end of files from",
        sort: "sort contents of files from",
        uniq: "filter duplicate lines from files in",
        wc: "count lines/words/bytes in files from",
        cut: "extract columns from files in",
        paste: "merge files from",
        column: "format files from",
        tr: "transform text from files in",
        file: "examine file types in",
        stat: "read file stats from",
        diff: "compare files from",
        awk: "process text from files in",
        strings: "extract strings from files in",
        hexdump: "display hex dump of files from",
        od: "display octal dump of files from",
        base64: "encode/decode files from",
        nl: "number lines in files from",
        grep: "search for patterns in files from",
        rg: "search for patterns in files from",
        sed: "edit files in",
        git: "access files with git from",
        jq: "process JSON from files in",
        sha256sum: "compute SHA-256 checksums for files in",
        sha1sum: "compute SHA-1 checksums for files in",
        md5sum: "compute MD5 checksums for files in",
      }),
      (WnH = {
        cd: "read",
        ls: "read",
        find: "read",
        mkdir: "create",
        touch: "create",
        rm: "write",
        rmdir: "write",
        mv: "write",
        cp: "write",
        cat: "read",
        head: "read",
        tail: "read",
        sort: "read",
        uniq: "read",
        wc: "read",
        cut: "read",
        paste: "read",
        column: "read",
        tr: "read",
        file: "read",
        stat: "read",
        diff: "read",
        awk: "read",
        strings: "read",
        hexdump: "read",
        od: "read",
        base64: "read",
        nl: "read",
        grep: "read",
        rg: "read",
        sed: "write",
        git: "read",
        jq: "read",
        sha256sum: "read",
        sha1sum: "read",
        md5sum: "read",
      }),
      (zK1 = { mv: (H) => !H.some((_) => _?.startsWith("-")), cp: (H) => !H.some((_) => _?.startsWith("-")) });
    TX7 = /^[A-Za-z0-9_.+-]+$/;

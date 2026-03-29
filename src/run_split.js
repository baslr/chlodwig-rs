// Wrapper to invoke the split CJS module (extracted d() modules loaded via eval)
const path = require("path");
const fs = require("fs");

const bundlePath = path.join(__dirname, "cli_split.js");
const code = fs.readFileSync(bundlePath, "utf8");

const mod = { exports: {} };
const fn = eval(code);
if (typeof fn === "function") {
  fn(mod.exports, require, mod, bundlePath, __dirname);
}

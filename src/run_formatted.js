// Wrapper to invoke the extracted & formatted CJS module
const path = require("path");
const fs = require("fs");

const bundlePath = path.join(__dirname, "cli_formatted.js");
const code = fs.readFileSync(bundlePath, "utf8");

const mod = { exports: {} };
const fn = eval(code);
if (typeof fn === "function") {
  fn(mod.exports, require, mod, bundlePath, __dirname);
}

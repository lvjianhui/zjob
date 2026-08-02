#!/usr/bin/env node
/**
 * uni-app build wrapper
 * Changes working directory to mobile project root before running uni CLI
 */
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = __dirname;
process.chdir(projectRoot);

const nodeBin = process.execPath;
const uniBin = path.join(projectRoot, "node_modules", ".bin", "uni");
const args = process.argv.slice(2);

const child = spawn(nodeBin, [uniBin, ...args], {
  stdio: "inherit",
  cwd: projectRoot,
  env: {
    ...process.env,
    UNI_INPUT_DIR: path.join(projectRoot, "src"),
  },
});

child.on("close", (code) => {
  process.exit(code);
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const sourceDirectories = [
  "config",
  "Controllers",
  "middleware",
  "models",
  "Routes",
  "seeds",
  "utilites",
];
const sourceFiles = ["index.js"];

const collectJavaScriptFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectJavaScriptFiles(entryPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      sourceFiles.push(entryPath);
    }
  }
};

for (const directory of sourceDirectories) {
  if (fs.existsSync(directory)) {
    collectJavaScriptFiles(directory);
  }
}

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`Unable to check ${file}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Backend build check passed for ${sourceFiles.length} JavaScript files.`);

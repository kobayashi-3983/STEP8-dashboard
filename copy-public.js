// Node.js で public → dist/public をコピーする
// .ts と server フォルダは完全除外

import fs from "fs";
import path from "path";

const srcDir = "public";
const destDir = "dist/public";

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    // 除外ルール
    if (item.endsWith(".ts")) continue;        // TS は除外
    if (item === "server") continue;           // server フォルダ除外

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, destDir);

console.log("✔ public → dist/public をコピーしました (TS・server 完全除外)");

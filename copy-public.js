// Node.js で public → dist/public をコピーする
// .ts と server フォルダは除外

import fs from "fs";
import path from "path";

const srcDir = path.join("public");
const destDir = path.join("dist", "public");

// 再帰コピー関数
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    // 除外条件
    if (item.endsWith(".ts")) continue;      // TS除外
    if (item === "server") continue;         // server除外

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, destDir);

console.log("✔ public → dist/public をコピーしました (TS除外, server除外)");

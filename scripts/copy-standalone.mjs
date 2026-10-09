// 复制 public/ 与 .next/static 到 .next/standalone，
// 修复 Next 16 (Turbopack) standalone 输出未自动拷贝静态资源导致
// `bun .next/standalone/server.js` 生产模式下图片/下载/CSS/JS 404 的问题。
// 该脚本由 package.json 的 postbuild 自动调用，跨平台（Node fs.cp）。
import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const targets = [
  { src: join(root, "public"), dest: join(root, ".next", "standalone", "public") },
  { src: join(root, ".next", "static"), dest: join(root, ".next", "standalone", ".next", "static") },
];

async function copyIfExists(src, dest) {
  if (!existsSync(src)) {
    console.log(`[copy-standalone] 跳过（不存在）: ${src}`);
    return;
  }
  await mkdir(dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true });
  console.log(`[copy-standalone] 已复制: ${src} -> ${dest}`);
}

for (const { src, dest } of targets) {
  await copyIfExists(src, dest);
}
console.log("[copy-standalone] 完成");

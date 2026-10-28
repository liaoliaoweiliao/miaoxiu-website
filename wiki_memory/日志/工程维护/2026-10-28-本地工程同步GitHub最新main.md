---
type: log
status: archived
updated: 2026-10-28
topic: sync-local-github-main
kind: maintenance
task_status: completed
sources: ["AGENTS.md", "README.md", "package.json", "package-lock.json", "playwright.config.js", "src/pages/HomePage.jsx", "src/pages/HistoryPage.jsx", "src/pages/ExperiencePage.jsx", "src/features/home/ParticleHeritage.jsx", "tests/e2e/particles.spec.js", "tests/e2e/experience-rounds.spec.js", "tests/e2e/responsive.spec.js", "wiki_memory/AGENTS.md", "用户指令：2026-10-28 获取GitHub最新更新，并明确选择切换main"]
---

# 本地工程同步GitHub最新main

## 目标与基线

用户要求本地工程获取GitHub最新更新；发现当前嘉玲分支已是其远程最新版而main有更新后，用户明确选择“切换到main并更新到GitHub最新版”。工作区为F:/竞赛/miaoxiu-website，起始嘉玲/28bec6e518c9054ffe10508af99fec8cd65ec3a6，upstream为origin/嘉玲；本地main停在5ea9a59，落后实际远程main 53个提交。

检查status、branch、remote、upstream和五页状态，并用ls-remote及fetch核实实际远程main=9c2edec10de88f2a41f707d92a410562a918a7b5、嘉玲=28bec6e。GitHub直连失败后使用系统现有127.0.0.1:10077代理的命令级http.proxy；Git元数据写入使用本仓库限定的命令级safe.directory，未修改全局Git配置。

## 保全与同步结果

原未提交内容涉及完成按钮恢复、布局样式、体验回归和五页记忆，另有原v1背景PNG/说明、finish-action测试及按钮修复日志四个未跟踪文件。先执行git stash push --include-untracked，保存为stash@{0}，固定标识4bc4128f5616df9f472137fcbf8e144cceaad9aa，说明为“backup: preserve Jialing work before syncing GitHub main 2026-10-28”；核对stash统计及未跟踪树确认背景与测试/日志均在备份内。备份后工作树干净。

随后git switch main，git merge --ff-only origin/main，将本地main从5ea9a59快进至9c2edec，无冲突、无额外合并或重写历史。保留嘉玲分支和stash；没有把旧完成按钮修复、旧测试或旧记忆应用到新版main。更新包含已在main集成的首页粒子、探源和装扮行为及Electron源码，本轮不再合入其他分支。

按新版依赖执行npm install，命令级代理和缓存限定当前安装过程；新增280包、移除1个旧额外包，npm ls --depth=0无缺失或额外依赖。package.json与package-lock.json均未改变。安装提示electron-winstaller的安装脚本尚未获allowScripts覆盖，本次未扩大脚本授权、未打包或验收桌面程序。

## 实际验证

2026-10-28，Windows / Node24.22.0 / npm11.19.1 / 系统Edge；对象为干净main/9c2edec源码，之后只修改记忆：

- npm test：37/37通过，退出0。
- npm run build：66模块，退出0，dist保持忽略。
- npm run test:e2e：100/100通过，最终退出0，用时5.5分钟；覆盖五页、粒子与模拟设备、故事/配色、搜索、单抽多轮/保存、装扮滚动、窗口及50%至400%原生缩放。
- 全部浏览器用例通过后，进程卡在预览服务关闭；依据本轮启动日志核对Vite PID 38788及启动时间，仅Stop-Process该预览进程，随后测试输出100 passed并退出0。未终止其他任务进程，未改测试或业务源码。
- git diff --exit-code origin/main -- src tests package.json package-lock.json runStart.cmd退出0；源码及配置保持GitHub版本。

Python不在当前PATH，记忆工具使用已有解释器C:/Users/18824/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe。已运行index --project . --apply及check --project . --require-ready，检查97页、0错误；保留原有MOC长度和17条已撤销历史源码提示，未改写历史结论。人工核对本轮来源、备份记录及验证范围，结构通过不替代事实核实。

## 边界与恢复下一步

本轮没有重建standalone或桌面便携exe，网页回归不证明桌面运行或打包；真实传感器、低端真机、其他浏览器和远程CI未验证。记忆记录只保存本次同步、备份和实际测试，不将其他任务未提交修复确认为新版main实现。

需要继续原嘉玲任务时，先检查当前分支、工作树及stash，再根据固定标识恢复到合适分支；不要直接把备份中的旧状态/测试覆盖到main。本轮按持续授权仅提交记忆差异并推送实际upstream origin/main；最终提交标识及远程一致性由Git历史、ls-remote和交付答复核对。

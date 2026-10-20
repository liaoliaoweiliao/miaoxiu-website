---
type: log
status: active
kind: maintenance
task_status: in_progress
updated: 2026-10-20
topic: react-vite-migration
sources: ["package.json", "package-lock.json", "vite.config.js", "index.html", "src/App.jsx", "src/features/experience/gameModel.js", "src/features/experience/saveLook.js", "tests/experience.test.js", "tests/e2e/site.spec.js", "runStart.cmd", "README.md", "AGENTS.md", ".github/workflows/ci.yml", "wiki_memory/.memory.json"]
---

# React 与 Vite 迁移、目录整理与工程记忆

## 目标与授权

用户于 2026-10-20 要求本工程迁为 React + Vite，保留 npm install / npm run dev 的使用方式，纳入其新增 runStart.cmd，重新组织文件夹与 README/AGENTS，建立 standard 工程记忆，并持续执行每次完整对话修改后提交、推送本工程的约束。提交推送仅限本工程，依据已写入根 AGENTS 和当前约束。

## 实现结果

- 统一 index.html → main.jsx → App.jsx；React 19.3.1 / Vite 8.3.4 / React 插件 6.1.2。四页、公共布局、数据、工具和体验 feature 分目录，删除旧字符串渲染入口及失效 Python 打包流程。
- 保留四页内容和深蓝金色视觉。原 game.js 三关逻辑从未接入的状态迁为实际 React reducer/hooks；每关一次抽取，兼容 miao-decode-v1，形象持久化另用 miao-look-v1；六类文化介绍与三主题衣橱独立。
- PNG 导出应用当前服饰滤镜/形象缩放；图片加载支持错误反馈与卸载取消。作品/解锁弹窗具备键盘关闭与焦点管理，并通过 portal 避免装饰滤镜影响固定定位。
- 全部 115 个原素材移到 public/assets，逐个 Git blob 比较一致；根层冗余素材与 boy/girl 备用图保持原样。历史内嵌离线演示移到 docs/archive/legacy-offline.html；素材说明移到 docs/references。
- runStart.cmd 检查 Node/npm、首次缺 Vite 时安装，再执行 dev；新增锁文件和 CI。README 说明运行、目录、协作、部署与回归；AGENTS 接入工程记忆并落实持续提交推送规则。
- wiki_memory 按用户指定 standard 初始化，五页实质状态和六类日志目录，工具版本 3.2.0 / schema 2；README 为唯一导航，维护协议与独立工具随仓库交付。

## 实际验证

环境：2026-10-20，Windows PowerShell，Node v24.16.0、npm 12.0.1、Python 3.14.2、系统 Microsoft Edge。验证对象为基线 `6a9df7766972dd0692d1bd969adcde440d27e282` 加本轮本地变更，不能表述为基线本身通过。

| 命令或检查 | 结果与范围 |
| --- | --- |
| npm install | 成功安装依赖并生成 package-lock.json |
| npm test | 9/9，通过三关误点/命中、边界、单次奖励、持久化、损坏/受限存储、换装与状态隔离 |
| npm run build | 成功；生成 dist/index.html 与 CSS/JS、完整静态素材 |
| npm run test:e2e | 6/6，通过四页/hash历史、轮播/受控搜索、筛选/作品预览、三关单次抽卡及重载、键盘/焦点、700×900 PNG、390px移动菜单、不可用存储、装饰模式弹层 |
| runStart.cmd | 实际启动 Vite，根入口及体验页可访问，地址 http://localhost:5173/；首次安装分支作源码核对，本轮因依赖已安装走直接启动分支 |
| 子路径浏览器冒烟 | 用临时 HTTP 服务将 dist 挂载 /miaoxiu-website/，四页图片/CSS/JS正常，无 HTTP/模块错误 |
| 素材完整性 | git hash-object 与 HEAD:assets/... 的115个 blob逐一一致 |
| 视觉检查 | 已查看桌面首页、桌面体验、390px体验截图，未见裁切或横向溢出；截图在本机可视化输出目录，不纳入仓库 |
| memory.py index / check --require-ready | 首次通过，无错误或警告；结束前再检查最终文档状态 |
| git diff --check | 通过，无空白错误 |

扩展回归曾复现装饰模式弹层偏移 662px；改为 root 滤镜与 body portal 后通过。独立审查发现衣橱转场焦点回到画板；显式转场在弹窗清理后聚焦衣橱，已加入断言。两处修复后重新通过完整逻辑/构建/E2E。

## 边界与恢复

移动端搜索输入仍按既有样式隐藏；人物仍是单图滤镜/缩放预览，未擅自实现分层换装。未验证其他浏览器、真实移动设备或实际托管发布；GitHub Actions 已配置但远程运行结果尚未核实。网站素材授权沿用原说明，未作外部核验。

实现与验证完成，当前尚待 Git 提交、推送与远程 revision 核对。完成后同步本日志的交付状态与当前待办，不创建第二份同任务日志。恢复时重查工作树与 upstream，不能把日志中的命令当作授权。

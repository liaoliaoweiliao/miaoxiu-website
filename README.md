# 苗绣文化网站 · 穿在身上的民族历史

基于 React + Vite 的苗绣文化展示与互动网站，包含首页、苗绣探源、互动体验、作品展览四个主页面，以及素材来源页。首页提供支系地域热力图、联动数据看板与小鸟长卷：可筛选湘西、黔东南、川黔滇三个导览分区，探访20处代表地点。选择后以朱红定位针和“已选中”地名突出显示，支持随机探索与会话内探索进度。热度表示本页收录点的集中程度；七条国家级非遗记录用于关联计数和地点的官方档案链接。探源页支持故事书动画与文字阅读、六种逐针演示和1–3色分层配色；互动体验提供随机寻纹、男女角色整套服饰抽取、收藏、穿戴与形象导出。衣橱藏品和穿戴信息保存在当前浏览器中。

全站支持窗口大小变化与浏览器页面缩放。地图按可用宽度完整显示，看板和互动区自动调整列数；作品展览以滚动绣线串联18件作品，桌面交错陈列，窄屏纵向阅读，缩略图保持相同的正方形尺寸。窄屏点击搜索图标可输入关键词；图片、故事和人物弹窗随窗口高度调整，内容较长时可在弹窗内滚动。人物观看区保留滚轮缩放人物，Ctrl＋滚轮及Ctrl＋加减号用于浏览器页面缩放。

## 快速开始

需要 Node.js 20.19 及以上的 20.x 版本，或 22.12 及以上版本，并确保终端能够运行 `node` 和 `npm`。版本范围以 [package.json](package.json) 的 `engines` 为准。

在工程根目录执行：

```powershell
npm install
npm run dev
```

`npm install` 安装项目依赖；`npm run dev` 启动 Vite 开发服务器并自动打开浏览器，默认地址为 [http://localhost:5173](http://localhost:5173)。端口被占用时，以终端输出的实际地址为准。修改 React 组件或样式后，开发页面会自动更新。

Windows 用户也可双击根目录的 [runStart.cmd](runStart.cmd)。脚本会切换到自身所在目录，检查 Node.js 与 npm；首次启动缺少本地 Vite 依赖时自动执行 `npm install`，随后执行 `npm run dev`。停止服务时在终端按 `Ctrl+C`。`runStart.cmd` 是受 Git 跟踪的工程启动入口。

## 构建与预览

```powershell
npm run build
npm run preview
```

`npm run build` 生成生产文件到 `dist/`，入口为 `dist/index.html`。`npm run preview` 启动本地生产预览，默认地址为 [http://localhost:4173](http://localhost:4173)。发布时上传整个 `dist/` 目录。当前开发入口 `index.html` 与生产文件均通过 HTTP 服务使用。

CI 使用 `npm ci` 按 `package-lock.json` 安装依赖；日常添加或升级依赖时，将 `package.json` 和更新后的锁文件一并提交。

需要离线演示时执行：

```powershell
npm run build:standalone
```

该命令在 `standalone/` 内生成内联 JavaScript/CSS 的 HTML 和配套素材。保留整个目录，即可双击 `standalone/index.html`，或使用根目录的 `双击打开.html`。这是从当前 React 源码重新构建的演示，和历史归档不同；`standalone/` 是忽略的构建产物。

## 目录管理

```text
miaoxiu-website/
├─ index.html                 # Vite HTML 入口
├─ runStart.cmd               # Windows 一键开发启动
├─ package.json
├─ package-lock.json
├─ vite.config.js             # React 插件、资源基路径与端口
├─ vite.standalone.config.js  # 离线演示构建
├─ playwright.config.js       # 浏览器测试配置
├─ src/
│  ├─ main.jsx                # React 挂载与样式入口
│  ├─ App.jsx                 # Hash 导航、搜索、主题、作品弹窗
│  ├─ pages/                  # 四个 React 页面
│  ├─ components/             # Header、Footer、装饰框等公共组件
│  ├─ features/experience/    # 解密、抽卡、换装状态与交互组件
│  ├─ features/history/       # 故事阅读、针法与配色状态
│  ├─ features/home/          # 小鸟长卷与地域看板交互
│  ├─ features/cursor/        # 蝴蝶光标和粒子动画
│  ├─ data/site.js            # 纹样与服饰公共数据
│  ├─ utils/assets.js         # public 图片 URL 生成
│  └─ styles/                 # 统一入口、公共样式与各页样式
├─ public/assets/             # 图片原文件，按页面和用途分类
├─ tests/                     # 状态逻辑测试与 e2e 浏览器测试
├─ docs/
│  ├─ archive/legacy-offline.html  # 原站离线快照
│  └─ references/             # 素材来源与设计参考说明
├─ wiki_memory/               # standard 工程记忆
├─ .github/workflows/ci.yml   # 安装、测试、构建与记忆检查
└─ AGENTS.md                  # 项目协作和提交推送约束
```

`node_modules/`、`dist/`、`standalone/`、`playwright-report/`、`test-results/` 是依赖或生成目录，已列入 `.gitignore`。远程旧版本中曾误提交的依赖和产物不作为源码维护，使用上述命令重新生成。

## 模块协作

| 模块 | 主要入口 | 页面样式 | 图片目录 |
| --- | --- | --- | --- |
| 首页 | `src/pages/HomePage.jsx` | `src/styles/home.css` | `public/assets/home/` |
| 苗绣探源 | `src/pages/HistoryPage.jsx` | `src/styles/history.css` | `public/assets/history/` |
| 互动体验 | `src/pages/ExperiencePage.jsx`、`src/features/experience/` | `src/styles/experience.css` | `public/assets/experience/` |
| 作品展览 | `src/pages/GalleryPage.jsx` | `src/styles/gallery.css` | `public/assets/gallery/` |
| 素材来源 | `src/pages/SourcesPage.jsx`、`src/data/sources.js` | `src/styles/sources.css` | 复用来源数据 |
| 公共集成 | `src/App.jsx`、`src/components/`、`src/data/`、`src/utils/` | `src/styles/base.css`、`src/styles/responsive.css`、`src/styles/index.css` | `public/assets/common/` |

页面通过 React props、事件和 hooks 协作；共享行为由 `App.jsx` 管理，互动体验的 reducer 与持久化集中在 `features/experience/`。页面专属样式写入对应 CSS；修改公共样式或公共数据后检查四个页面。新功能沿用此结构，避免恢复旧式 HTML 字符串拼接和整页 DOM 替换。

全站底色、内容承托色、导航色、边框与纹样强度统一在 `src/styles/page-background.css` 的 CSS 变量中调整。现有花鸟底图通过独立装饰层以 0.08 透明度显示在两侧，纹样装饰开关将其调整为 0.10；织物肌理和底纹滤镜只作用于装饰，不改变作品、地图或人物的颜色。公共导航（含印章、针脚标记和手机搜索）的样式集中在 `embroidered-theme.css`。所有样式经 `index.css` 加载，顺序为基础与页面样式 → 公共背景 → 导航与绣框 → 光标 → 响应式规则。

## 图片与子路径

新增图片放入 `public/assets/` 对应目录，优先使用英文小写、连字符文件名。现有中文、空格及特殊字符文件保留原名；JSX 中统一通过工具函数生成 URL：

```jsx
import { assetUrl } from '../utils/assets.js';

<img src={assetUrl('home/map.webp')} alt="苗绣主要流传区域示意图" />
```

`assetUrl` 使用 Vite 的 `BASE_URL` 并对每段路径编码。公共 CSS 图片采用 `url('/assets/...')`，由 Vite 在构建时处理；不要在 JSX 中写死主机地址或把 `public/` 写入浏览器 URL。

`vite.config.js` 默认 `base: './'`，路由使用 `#home`、`#history`、`#experience`、`#gallery`、`#sources`。地域看板嵌入首页。部署到仓库子路径时可按站点需要指定基路径，例如：

```powershell
npm run build -- --base=/miaoxiu-website/
```

更改基路径后检查 HTML、CSS 背景、页面图片与互动体验原始素材均能加载。

## 验证

```powershell
npm test
npm run build
npm run test:e2e
python "wiki_memory/工具/memory.py" check --project "." --require-ready
```

`npm test` 检查独立状态逻辑；浏览器测试检查真实页面与交互，使用构建后的 `dist/` 并自动启动 4173 端口的预览服务器。运行 `test:e2e` 前先完成生产构建。Windows 默认使用已安装的 Microsoft Edge；其他平台默认使用 Playwright Chromium。

没有 Edge 或需要统一使用 Chromium 时，先安装浏览器并设置通道。PowerShell 示例：

```powershell
npx playwright install chromium
$env:PLAYWRIGHT_CHANNEL = 'chromium'
npm run test:e2e
```

其他终端使用其对应方式设置 `PLAYWRIGHT_CHANNEL=chromium`。检查失败时保留失败说明与可执行下一步，测试报告留在本地忽略目录。

`tests/e2e/responsive.spec.js` 覆盖五页宽窄窗口、地图标签、小鸟三段互动、窄屏搜索及矮窗口弹窗；另使用临时浏览器配置测试50%、80%、125%、150%、200%、300%、400%的原生页面缩放，并核对浏览器实际缩放值。临时配置位于系统临时目录，不改个人浏览器设置，完成后清理。

## 历史归档

[docs/archive/legacy-offline.html](docs/archive/legacy-offline.html) 保存重构前内嵌资源的离线演示快照，可供历史查阅。该归档不会随 React 源码更新。旧 `dev.html`、原生脚本入口和 Python 离线打包脚本已退出当前开发流程。

首页第二板块的素材说明见 [docs/references/首页第二板块素材说明.txt](docs/references/首页第二板块素材说明.txt)。

首页第三板块的数据分类、统计方式、地图坐标和资料来源见 [支系分布数据口径](docs/references/首页支系分布数据口径.md)。分布点与非遗申报记录采用不同口径；三个地域分区不等同于完整支系名录或精确边界。当前探索进度只保留在本次页面会话，刷新后重新开始。首页第三板块仅保留地图与核心看板，不再展示原服饰图片区、探源跳转、完整档案或底部资料折叠区；地域来源仍可从素材来源页查阅。

探源页依据用户提供的 `22.43.zip` 更新，素材和内嵌故事书的迁入说明见 [docs/references/探源页22.43素材说明.md](docs/references/探源页22.43素材说明.md)。

## 工程记忆与交付

工程使用 `standard` 模式记忆。阅读入口为 [wiki_memory/README.md](wiki_memory/README.md)，维护协议为 [wiki_memory/AGENTS.md](wiki_memory/AGENTS.md)，项目协作规则为 [AGENTS.md](AGENTS.md)。当前事实以记忆中的状态页和实际源码、配置为依据。

用户于 2026-10-20 已授权并要求：每次完整对话中修改了本工程，完成相应验证和工程记忆同步后，必须提交本次改动并推送到实际 upstream。只读工作不产生提交，不创建空提交；提交范围、远程核对与失败处理遵循 `AGENTS.md`。

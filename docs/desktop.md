# Windows 离线便携版

桌面应用名称为“穿在身上的民族历史——苗绣”，目标平台为 Windows 10/11 x64。它使用 Electron 内置 Chromium，包含生产页面、字体、全部图片、故事书和针法/配色资源。原网页、静态部署、`runStart.cmd` 和 standalone 构建仍可使用。

## 启动与数据

交付文件为 `release/Miaoxiu-1.0.0-win-x64-portable.exe`。这是**单文件便携程序**，不是安装程序；可单独复制或重命名，在普通可写目录双击运行。不需要 Node.js、npm、Python 或另装浏览器。启动会自动把内置运行资源解压到系统临时目录，首次启动需要等待；保留正常的临时目录可写权限和足够磁盘空间。

收藏、解锁衣橱、当前角色和男女穿戴记录自动保存在 `%APPDATA%\MiaoxiuDesktop\`（Chromium Local Storage 等用户配置），不写入程序目录。正常关闭后可恢复；移动/替换 exe 不影响数据，同一 Windows 用户的不同副本共享数据。备份时先退出程序，再复制整个目录；删除此目录会清空桌面收藏。网页浏览器原有收藏不会自动迁入桌面版。寻纹轮次与地图探索进度沿用网页的会话规则。

点击“保存效果图”会出现 Windows“另存为”窗口，可选择目录和文件名；保存成功后页面显示完整路径，取消也会提示。效果图为 900×1400 PNG。展览放大窗口中的“保存图片”使用同一原生保存流程。

菜单“苗绣 → 关于苗绣”可查看版本和当前数据目录；“视图”支持页面缩放与全屏。窗口可调整大小、最大化。资料出处链接交由系统默认浏览器打开，查看这些外部网页需要网络；核心浏览和互动使用内置资源。

目前没有配置商业代码签名证书。Windows 下载保护或 SmartScreen 可能显示“未知发布者”；在确认文件来自本项目交付且校验值一致后按本机安全策略处理。程序不要求管理员权限。

## 重复构建

构建机使用 Node.js 22.12 及以上（建议 Node 24）、npm 和 Windows x64：

```powershell
npm ci
npm run desktop:pack
```

第一次构建需要联网下载 npm 依赖、Electron 及 electron-builder 的 NSIS/签名资源工具，**运行最终便携程序不需要下载**。如果构建网络必须经代理，可仅在当前 PowerShell 设置 `HTTPS_PROXY` / `HTTP_PROXY`，不要关闭 TLS 校验。生成目录 `release/` 已被 Git 忽略；其中 `win-unpacked/` 仅为打包中间文件，向普通用户交付顶层 `*-portable.exe`。

`npm run desktop` 构建网页并从源码启动 Electron，供开发检查。网页原命令 `npm run dev` / `npm run build` / `npm run build:standalone` 保留。依赖锁固定了 Electron 和打包器版本。

打包缓存默认位于 `node_modules/.cache/electron-builder/`，避免本机用户目录的跨卷重命名错误，可用 `ELECTRON_BUILDER_CACHE` 覆盖。慢网络可预先获取 Electron 官方对应版本 ZIP，按 `node_modules/electron/checksums.json` 核对 SHA-256 后执行 `npm run desktop:pack -- --config.electronDist=该ZIP的路径`。本次使用经官方校验的 45.0.0 win32-x64 ZIP 打包。

## 应用图标

桌面文件、窗口及任务栏图标使用用户提供的网站花蝶纹logo，原图保存在 `electron/logo-source.png`。需要重新转换时，在Windows执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/create-desktop-icon.ps1
npm run desktop:pack
```

转换脚本保留原图配色和透明通道，裁去外侧空白，保持比例，生成16–256像素九种尺寸的 `electron/icon.ico`。预览写入忽略目录 `desktop-test-results/logo-icon-preview.png`。图标变化不会更改用户数据目录。

## 桌面实现边界

`electron/main.cjs` 通过 `miao://app/` 提供 ASAR 中的 `dist/`，处理 MIME、中文/空格 URL、路径边界和 CSP，阻断应用内远程资源请求；不启动本地 HTTP 服务。窗口启用 `sandbox`、`contextIsolation` 和 `webSecurity`，关闭 Node 集成、webview 和权限请求。打包启用 ASAR 完整性与相关 Electron fuses。安全设置依据 [Electron 安全建议](https://www.electronjs.org/docs/latest/tutorial/security) 与 [自定义协议说明](https://www.electronjs.org/docs/latest/api/protocol)。

preload 只开放 `saveImage(bytes, filename)`；主进程校验主窗口/主 frame、文件类型签名和大小，必须经原生位置选择后才写入图片，不向网页暴露任意路径写入、shell 或通用 IPC。普通网页使用原下载流程。

`assetUrl` 返回绝对 URL，兼容网页子路径和 CSS 自定义属性中人物闪光蒙版的路径解析，避免相对路径重复拼接 `assets/`。

## 可重复验收

在有交互桌面的 Windows 上先构建，再执行：

```powershell
npm test
npm run test:e2e
npm run test:desktop
```

`test:desktop` 实际复制并启动最终便携 exe，以只有 Windows 系统目录的 PATH、工程外工作目录、不可达网络代理及 CDP 离线设置检查；不关闭本机网卡，以免干扰其他工作。它使用独立测试数据目录（`--user-data-dir` 绝对路径）和临时本机调试端口，正常双击运行不开启调试。自动操作真实 Windows 保存/取消对话框，测试后正常退出并重新启动。资源检查、截图、PNG 和 JSON 记录位于忽略目录 `desktop-test-results/`；临时副本与测试数据的位置写在 JSON 内，可在测试程序退出后手动清理。

桌面检查覆盖所有内置资源、四主栏目与来源页、地图和长卷、三故事书和文字翻页、六针法实际动画、三纹样配色蒙版、男女解密/抽取/收藏/穿戴/PNG 保存和取消、展览放大和图片保存、多个原生窗口尺寸及最大化、关闭重开恢复。最终实测结果与限制见 [桌面验收记录](desktop-validation.md)。

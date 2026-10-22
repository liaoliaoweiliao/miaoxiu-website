---
type: log
status: archived
updated: 2026-10-22
topic: experience-final-branch-sync
kind: maintenance
task_status: completed
sources: ["src/pages/ExperiencePage.jsx", "src/features/experience/LookViewer.jsx", "src/components/ImageLightbox.jsx", "src/styles/experience.css", "src/styles/experience-responsive.css", "src/styles/index.css", "tests/e2e/site.spec.js", "AGENTS.md", "用户指令：2026-10-22 把最终版互动体验部分重新输送到experience分支"]
---

# 最终互动体验重新同步至experience

## 目标与同步范围

用户要求重新将最终互动体验交付到experience分支。起点主工作区F:/竞赛/miaoxiu-website为gallery/3ba3d96，已有ExperiencePage.jsx、LookViewer.jsx两处未暂存文案修改；实际开发在干净的F:/竞赛/miaoxiu-experience、experience/2dc6b001c2bbf8542bed7351f2eeb9e9102e6e4f进行，未修改主工作区。

通过Windows已启用的localhost:10077代理按命令执行git ls-remote --heads origin及git fetch origin，核实origin/experience为2dc6b00，最终集成origin/main为a60758071813c0abac6f1290f90abe2dff5b0f4c。该main已包含experience历史；体验页面、状态、数据、素材和字号本身已与experience一致，缺失的是后来从其他分支整合的缩放兼容及responsive.css中的体验适配。安全目录和代理均为命令级配置，未改全局Git设置；未强推、重置或清理已有改动。

## 实际变更与选择

- LookViewer同步main的Ctrl/Meta快捷键与滚轮处理，保留浏览器原生缩放；普通人物缩放继续有效。ImageLightbox同步main的ResizeObserver，随窗口重新约束图片位置。两个JSX文件与a607580对应文件比较一致。
- Agent在用户限定的体验同步范围内，将main的responsive.css中体验与图片弹窗所需规则提取为experience-responsive.css，最后通过index.css导入。共享容器、图片弹窗及短窗口页头规则按体验页限定，其余规则仅面向体验组件，保留其他页面已有版本。未整体合并main，也未带入公共导航/首页/探源/展览重构。
- 保留已交付的约20%字号放大、原始形象文案、寻纹、三主题解锁、36套男女抽卡收藏、穿戴、全屏和PNG导出；页面、状态、数据、素材和依赖无需重新改写。
- 同步当前状态和本日志，按协议刷新索引并执行require-ready检查。后续若再与含responsive.css的main集成，核对重复规则与覆盖顺序。

## 实际验证

2026-10-22，Windows PowerShell / Node v24.22.0 / npm11.19.1 / Microsoft Edge；对象为experience/2dc6b00加本轮四项源码修改（含新增CSS），未提交的文档不影响构建。

- npm run build通过。
- npm run test:e2e全部11项通过，使用该工作区dist及独立4173预览，覆盖五页、图片欣赏、寻纹命中、主题重复搜索、重复抽卡、男女藏品/穿戴、全屏、900×1400 PNG、重载与移动导航。
- 临时Node/Playwright脚本启动独立4175构建预览，检查320、360、390、600、760、761、900、1050、1100、1440、1920px共11种宽度；体验内容无横向溢出，男女无套装摘要严格为“原始形象”。Ctrl/Meta加滚轮或加号均未被拦截，人物比例保持100%；普通加号变125%，零键回100%。
- 640×360与320×240检查全屏退出按钮及图片欣赏退出可达，图片弹窗滚动后关闭按钮仍在窗口内；320×240的解锁弹窗在窗口内。无脚本或HTTP资源错误。
- 已查看1440px桌面和390px手机整页截图；临时脚本、截图及dist不提交。未改状态模型，未重跑npm test及离线构建，未测其他浏览器、实体设备、远程CI或实际部署。

## 交付与恢复位置

已核实该分支实际upstream为origin/experience；最终提交标识、推送和远程一致性以本轮实际Git交付结果为准。本日志记录源码同步及当前验证，不将远程分支更新等同于网站发布。

主工程仍保留gallery分支及两处原有文案修改。本轮最终体验在F:/竞赛/miaoxiu-experience；若本地页面仍显示其他版本，应检查服务启动目录与分支，不丢弃主工程改动。

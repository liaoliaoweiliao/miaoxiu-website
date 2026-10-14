# 穿在身上的民族历史——苗绣

## 使用方式

- 双击 `index.html`：完整离线网站，图片、样式与脚本均已内嵌。
- 网站打开后点击导航“互动体验”，或访问 `index.html#experience`。
- 分文件开发：`npm install` 后 `npm run dev`，打开 `/dev.html`。
- 修改源文件后执行 `python3 scripts/build-offline.py`，同步更新离线入口和 `dist/index.html`。
- 互动检查：`node scripts/check-game.mjs`。

## 模块一更新

三张指定图片依次为彩色刺绣背包、红色民族服饰、手工刺绣布，每张只有一个命中区域，分别对应旋涡纹、花朵纹、回纹与线条纹。命中坐标使用原图百分比，图片始终保持完整的 3:2 比例，不裁切；手机、放大状态下共用同一判定。

提供关卡切换、未命中点击波纹、线索提示、放大观察、成功标记、解锁弹窗、进度显示、三关完成提示与主题服饰抽取翻牌动效。首次进入不显示目标位置；查看线索后才标出区域。键盘用户可聚焦画面，用方向键移动观察点，Enter/空格确认；弹窗支持 Escape 和 Tab 焦点循环。尊重系统“减少动态效果”设置。

每张图只能解锁一次，每个主题只有一次抽取机会。完成情况和已抽到的部件保存在浏览器本地 `miao-decode-v1`，刷新后仍保留；存储不可用时保留当前会话进度。旧版的计数型 `miao-unlocked` 不再参与本模块判定。

## 传递给模块二

成功找到目标时，更新 `game.theme` 和 `game.progress`，衣橱根据对应主题解锁并提供一次抽取。同时在 `window` 发布 `miao:motif-found` 自定义事件，`event.detail` 包含 `levelId`、`theme`、`name`、`image`；主题 ID 为 `spiral`、`flower`、`lines`。重复点击已完成图不会再次发布事件。恢复浏览器进度时，衣橱直接读取 `game.progress`，无需重放解锁事件。

关卡配置及命中区域：`src/game.js`；互动页面：`src/pages/experience.js`；样式：`src/styles/experience.css`；点击和键盘事件：`src/main.js`。

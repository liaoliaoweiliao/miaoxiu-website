# 苗绣文化网站 · 四人协作版（图片目录修复）

## 打开方式

- **直接双击 `index.html`**：正式离线演示版，CSS/JS/图片均嵌入，可直接浏览四个页面。`双击打开.html` 是同内容备用文件。
- **日常分工开发**：终端执行 `npm install` 和 `npm run dev`，浏览器自动打开 `/dev.html`（也可手动访问 `http://localhost:5173/dev.html`）。`dev.html` 通过 ES Module 加载，必须用 Vite 服务器访问。

## 分工规则

| 负责人 | JS 文件 | CSS 文件 | 图片目录 |
|---|---|---|---|
| 首页 | `src/pages/home.js` | `src/styles/home.css` | `assets/home/` |
| 苗绣探源 | `src/pages/history.js` | `src/styles/history.css` | `assets/history/` |
| 互动体验 | `src/pages/experience.js` | `src/styles/experience.css` | `assets/experience/` |
| 作品展览 | `src/pages/gallery.js` | `src/styles/gallery.css` | `assets/gallery/` |

`assets/common/`、`src/main.js`、`src/shared.js`、`src/styles/base.css` 和 `src/components/` 由集成人维护。

图片统一命名为英文小写，新增图片放在各自目录。JS 组件中示例：`<img src="${A}home/banner.webp">`。CSS 中样式文件位于 `src/styles/`，引用图片：`url('../../assets/home/banner.webp')`。

修改模块源代码**不会自动同步到**`双击打开.html`。该 HTML 是当前代码打包生成的独立演示版本；最终合并后须重新构建独立版。旧 `assets/` 根目录图片暂时保留以兼容旧引用，切勿先删除。

## 非常重要：开发入口和演示入口的区别

- `dev.html`：四人日常开发入口。修改 `src/pages/*.js`、`src/styles/*.css` 与 `assets/` 后，Vite 开发页面会更新。
- `index.html`：已内嵌所有资源的离线快照，双击即可打开。**改源文件不会自动更新这个离线快照**。
- 集成人在合并四个人修改后，需重新生成离线版 `index.html`；不能直接复制 `dev.html` 覆盖它。
- 各页图片应放在 `assets/home/`、`assets/history/`、`assets/experience/`、`assets/gallery/`，公共素材放 `assets/common/`。

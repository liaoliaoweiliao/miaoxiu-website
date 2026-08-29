# 苗绣·生生不息 — 网站程序运行说明

## 项目简介

本项目为"民族文化 创新表达"专项赛道参赛作品，是一个基于 Next.js 16 构建的苗绣数字文化创新表达平台，集文化展示、互动体验、AI 创作于一体。

## 技术栈

- **框架**：Next.js 16.1.3 (App Router)
- **语言**：TypeScript 5.x
- **样式**：Tailwind CSS 4 + tw-animate-css
- **UI 组件**：shadcn/ui (基于 Radix UI)
- **动画**：Framer Motion
- **AI 服务**：z-ai-web-dev-sdk（GLM 模型，用于纹样生成）
- **字体**：Noto Sans SC / Noto Serif SC（Google Fonts）
- **包管理**：Bun（推荐）/ npm / yarn

## 目录结构

```
01_网站程序/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── pattern-generate/   # AI纹样生成API
│   │   ├── globals.css         # 全局样式（苗绣设计系统）
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 主页面
│   ├── components/
│   │   ├── miao/
│   │   │   └── patterns.tsx    # 苗绣纹样SVG组件库
│   │   ├── sections/           # 七大模块组件
│   │   │   ├── navbar.tsx      # 导航栏
│   │   │   ├── hero.tsx        # 首页
│   │   │   ├── history.tsx     # 绣·史
│   │   │   ├── patterns.tsx    # 绣·纹
│   │   │   ├── craft.tsx       # 绣·艺
│   │   │   ├── innovation.tsx  # 绣·新
│   │   │   ├── people.tsx      # 绣·人
│   │   │   ├── creation.tsx    # 绣·创
│   │   │   └── footer.tsx      # 页脚
│   │   └── ui/                 # shadcn/ui 组件库
│   ├── data/
│   │   └── miao.ts             # 苗绣文化数据
│   ├── hooks/                  # React Hooks
│   └── lib/                    # 工具函数
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md                   # 本文件
```

## 运行步骤

### 1. 环境要求

- Node.js 18.17+ 或 Bun 1.0+
- npm / yarn / pnpm / bun（任选其一）

### 2. 安装依赖

```bash
# 使用 bun（推荐）
bun install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 启动开发服务器

```bash
# 使用 bun
bun run dev

# 或使用 npm
npm run dev
```

启动后访问：http://localhost:3000

### 4. 构建生产版本

```bash
bun run build
# 或
npm run build
```

### 5. 运行生产版本

```bash
bun run start
# 或
npm run start
```

## AI 纹样生成功能说明

本项目的"绣·新"模块使用 z-ai-web-dev-sdk 调用 GLM 模型生成苗绣风格纹样。

- **API 路径**：`/api/pattern-generate`
- **请求方式**：POST
- **请求参数**：
  ```json
  {
    "theme": "蝴蝶妈妈",      // 纹样主题
    "style": "classic",       // 风格：classic/modern/fantasy
    "colorScheme": "indigo"   // 配色：indigo/vibrant/monochrome/warm
  }
  ```
- **返回数据**：包含 base64 编码的图片数据

## 七大功能模块

| 模块 | 路径锚点 | 功能说明 |
|------|---------|---------|
| 首页 | #hero | 沉浸式 Hero，动态苗绣纹样背景 |
| 绣·史 | #history | 千年历史时间轴 + 支系分布地图 |
| 绣·纹 | #patterns | 8种纹样交互图谱库 |
| 绣·艺 | #craft | 6种技法图解 + 虚拟刺绣体验 |
| 绣·新 | #innovation | AI纹样生成器 |
| 绣·人 | #people | 传承人故事展示 |
| 绣·创 | #creation | 文创衍生品展示 |

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 注意事项

1. AI 纹样生成功能需要网络连接
2. 首次加载需编译，可能稍慢
3. 建议在 1280×720 及以上分辨率浏览
4. 移动端已做响应式适配

## 联系方式

如有技术问题，请联系项目组。

---
type: log
status: active
kind: maintenance
task_status: in_progress
updated: 2026-10-20
topic: react-vite-migration
sources: ["package.json", "package-lock.json", "vite.config.js", "vite.standalone.config.js", "src/App.jsx", "src/data/catalog.js", "src/features/experience/gameModel.js", "tests/experience.test.js", "tests/history-atlas.test.js", "tests/e2e/site.spec.js", "runStart.cmd", "README.md", "AGENTS.md", ".github/workflows/ci.yml", "wiki_memory/.memory.json"]
---

# React 与 Vite 迁移、目录整理与工程记忆

## 目标与授权

用户于2026-10-20要求React + Vite、npm install / npm run dev、纳入runStart.cmd、整理全工程目录及README/AGENTS、建立standard记忆，并持续执行每次完整对话有工程修改就提交推送的约束。适用范围与安全交付流程已写入AGENTS和当前约束。

## 远程更新与整合背景

起点为main / 6a9df7766972dd0692d1bd969adcde440d27e282，初始ls-remote同revision，已有未跟踪runStart由用户明确要求纳入。初版React迁移完成并验证9项逻辑/6项E2E，保存在本地提交3d72daf；交付前fetch发现远程前进至82f079f2665b7d862bd66e83deb1aede05f203df，新增了完整新版首页/探源/衣橱/展览/来源业务、素材与样式，同时误跟踪node_modules、dist、standalone。

为保留新工作，先保存初版，再只读导出远程快照并逐模块迁移其业务。最新代码以远程新版行为为依据，初版的三关顺序/每关一次奖励已由随机回合、永久解锁和整套多次抽取替代；不能把初版测试当作当前版本验证。保留远程提交历史，不强推或回退他人提交；依赖与构建产物根据用户目录整理要求由源码重新生成，未纳入最终源码树。

## 实现结果

- React19.3.1 / Vite8.3.4 / React插件6.1.2，统一index→main.jsx→App.jsx。page/component/feature/data/utils/styles分层，五路hash导航，受控搜索，主题与通用图片欣赏；全部业务由JSX/hooks/reducer管理。
- 首页保留地域看板七记录、年份/地域/地图联动和三次小鸟长卷；探源保留三故事九节、十种纹样/放大镜、六针法动画和三纹样六色配色。作品展览保留18件去重作品与馆藏详情；来源页与新Logo/导航装饰同步。
- 体验保留三类区域命中、随机图回合、永久主题解锁、男女角色36套完整服饰、补齐未拥有优先抽取、收藏/整套穿戴、原始形象恢复与穿戴后下一轮。miao-wardrobe-v4保留并兼容v3整套和v2发现；人物拖动/滚轮/双指/键盘/全屏及900×1400 PNG保留。
- 弹层使用body portal并管理焦点/关闭/overflow，装饰滤镜只作用#root；计时器、RAF、ResizeObserver和异步图片加载按生命周期清理。保留React蝴蝶光标及粒子、背景和新版边框。
- 最新远程320个源素材逐个blob核对一致，另保留52个旧版兼容素材，共372文件，放public/assets。旧内嵌演示归档docs/archive，素材说明移docs/references；远程vendor许可随素材保留。
- 保留build:standalone和双击打开.html；JS/CSS内联，普通图片随assets目录，38个人物portrait/base仅在离线构建内联以支持file协议Canvas导出。HTTP构建仍拆分静态资源。
- runStart检查Node/npm，缺本地Vite时安装后dev；锁文件、CI和中文README/AGENTS完善。standard记忆为五页实质状态、六类日志，schema2/tool3.2.0，唯一README导航，协议和独立工具随仓库交付。

## 最新实际验证

环境：2026-10-20，Windows PowerShell / Node v24.16.0 / npm12.0.1 / Python3.14.2 / 系统Microsoft Edge。对象为3d72daf加完整迁入82f079f业务后的本地变更，非原始基线本身。

| 命令或检查 | 实际结果与范围 |
| --- | --- |
| npm install | 成功生成锁文件；新增离线插件后依赖安装同样成功 |
| npm test | 14/14；36套目录/全部命中区域、永久解锁/角色要求、反复抽卡/收藏去重、男女穿戴/回合/旧存储迁移，历史配色/动画状态与图谱统计；103张内容及组合素材存在 |
| npm run build | 成功，48模块；HTML约0.61KB、CSS约173KB、JS约354KB，图片复制至dist/assets |
| npm run build:standalone | 成功，JS/CSS及38人物图内联，HTML约11.6MB，其余图片配套目录 |
| npm run test:e2e | 11/11；五页/hash/轮播/搜索，地图筛选，小鸟01→02→03→01，故事/针法/三色，18作品/详情/缩放，随机寻纹/多次抽卡/男女穿戴/全屏/PNG/重载，另外两类图命中，390px菜单/受限存储、主题弹层、重复主题搜索 |
| runStart.cmd | 实际成功启动5173；最终源码落盘后重启，干净加载首页/体验页无运行异常。缺依赖安装分支作源码核对，执行时已具备依赖 |
| 子路径与离线加载 | 临时HTTP服务将dist挂到/miaoxiu-website/，五路图片/CSS/JS正常；standalone用file协议五路所有img解码通过 |
| PNG下载 | HTTP E2E核对PNG签名与900×1400尺寸；离线file协议实际下载我的苗绣装扮-girl.png成功 |
| 素材完整性 | 320个上游assets的git hash-object均与origin/main对应blob一致 |
| 视觉检查 | 已查看最终桌面首页、桌面体验和390px体验截图；临时截图不入库 |
| 工程记忆 | 初次ready无错误/警告；结束前按最终状态刷新索引并复查 |

扩展回归修复了装饰滤镜导致滚动弹层偏移、衣橱转场焦点回跳、重复同主题搜索不切换、file图片污染Canvas导致离线PNG失败。图谱测试曾误把视图切换当地域筛选，核对上游与reducer后纠正断言，保持累计年份口径；随后11条全过。开发期间旧HMR曾保留半写模块引用，最终重启后干净加载通过。

## 边界与交付状态

既有移动搜索输入隐藏限制保留；未验证其他浏览器或真实移动设备、外站所有来源/素材授权、实际托管部署与远程CI。五路内容和图谱数据按82f079f迁移，未将迁移本身表述为外部事实重新核验。

实现与验证完成，尚待最终提交、合并远程祖先、推送和远程revision核对；完成后更新本日志为封存完成，并同步当前待办，不为同任务另建日志。

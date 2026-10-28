# 首页本地手部识别资源

仅在用户开启摄像头后加载；与画面一起在本机 Worker 中运行，无远程推理、录制或上传。

- JavaScript API 和 WASM：Google MediaPipe `@mediapipe/tasks-vision` **1.1.1**，Apache-2.0。WASM loader/binary 原样复制自该 npm 包的 `wasm/vision_wasm_module_internal.*`，配套 API 由 Vite 从锁定依赖打包。
- 模型：Google 官方 Hand Landmarker float16 v1 bundle，原样下载于 2026-10-27。
  - 来源：https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
  - 大小：7,819,105 bytes。
  - SHA-256：`fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`。
- 官方指南及模型说明：https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- MediaPipe 源码与许可：https://github.com/google-ai-edge/mediapipe （Apache-2.0）。

浏览器需支持模块 Worker、WebAssembly SIMD 和 OffscreenCanvas；不支持时提示使用手动控制。网页需通过 HTTPS 或 localhost 获取设备权限。桌面应用的既有设备禁用策略不变。

开发期照片验证使用官方 `https://storage.googleapis.com/mediapipe-tasks/hand_landmarker/woman_hands.jpg` 与 `https://storage.googleapis.com/mediapipe-assets/fist.jpg`，照片仅在忽略目录测试，不作为网站素材。`tests/fixtures/hand-landmarks.json` 保存本机模型实际输出的 21 点坐标，供几何分类回归；它不能代替真实摄像头测试。

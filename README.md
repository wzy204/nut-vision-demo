# NUT VISION · PYNQ-Z2 智能视觉计数演示

基于 Three.js 的交互式三维教学网站，展示直线振动送料、图像采集、PS / PL 协同处理、跨帧跟踪与越线计数。

在线演示：https://wzy204.github.io/nut-vision-demo/

支持旋转、缩放、部件说明、标签显隐、芯片内部与分模块展开；支持 1–100 颗投料、双颗及三角粘连、并行越线、阈值与形态学对比、暂停、单步和重置。

## 本地开发

需要 Node.js 24。

```sh
npm ci
npm run dev
npm test
npm run build
```

构建后 `dist/index.html` 可由静态服务器托管；`dist/NUT-VISION-离线演示.html` 可直接双击打开。所有资源随项目提供，无 CDN 依赖。

## 部署

推送到 main 后由 GitHub Actions 自动测试、构建并发布 GitHub Pages。Vite 使用相对资源路径，兼容仓库子路径。

## 演示边界

这是浏览器教学仿真，没有连接真实板卡或相机。机械来自用户提供的 CAD 转换网格，原始 CAD 工程不在仓库中；螺母相对整机统一放大约 1.76 倍方便讲解。图像、跟踪和计数由软件模拟，30 FPS 为仿真节拍。PS / PL 与 HDMI 示意不代表完整硬件系统验收。详细几何来源及边界见 [CAD-MODELS.md](CAD-MODELS.md) 和网页“实现依据与演示边界”。

## 2026-11-02 架构更新

页面展示采集解码、FPGA 像素处理、ARM 目标级计数、PL 视频合成四层；提供当前 P12-R4 基线与目标架构切换。独立显示路径为视频流 + PS 元数据 → PL Overlay → VDMA / HDMI；Web 为辅助渠道。RLE 游程连通域在浏览器中实际执行。axis_gray_overlay / B1a / P12 已推进，采集解码硬件化与 B2 未标为已验收。P12-R4 处理约 14.27 FPS、显示约 13.58 FPS、ARM CPU 约 93% 为项目方提供的基线数据，不代表网页速度或目标性能。运行状态区在前，架构说明在后；桌面侧栏固定并独立滚动。

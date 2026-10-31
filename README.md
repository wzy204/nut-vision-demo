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

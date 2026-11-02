export const targetLayers=[
 ['01 / 采集解码','硬件 / 低开销采集解码','开发目标 · 相机队友负责','摄像头 → 硬件或低开销路径 → Gray8 视频流。具体接口与解码实现由硬件方案确定，不预设已完成硬解码。','capture'],
 ['02 / FPGA 图像处理','Gray8 → ROI → 阈值 → 可选形态学 → RLE','保留的核心流水线','PL 流式处理像素，RLE 输出逐行前景游程，经设计的传输接口交给 PS；保留独立图像视频流用于显示。','rle'],
 ['03 / ARM 计数决策','RLE 连通域 → 特征 → 跟踪 → 越线去重','当前基线具备 · 继续保留','PS 面向区域与目标进行决策，每个 ID 首次从左到右穿过 x=320 时累计一次，并输出目标位置、计数和控制信息。','tracking'],
 ['04 / PL 视频合成','灰度视频层 + PS 元数据 → Overlay','正在集成 · B2 下一步','axis_gray_overlay / B1a / P12 已推进；继续 B2 的 PL 合成显示，卸载完整 1280×720 看板逐帧绘制。B2 尚未通过板端验收。','overlay']
];
export function architectureMarkup(mode='target'){
 const target=mode==='target';
 return `<div class="architecture-heading"><div><span class="eyebrow">HETEROGENEOUS SYSTEM / 2026-11-02</span><h3>采集卸载 · 像素流水线 · 目标决策 · 硬件合成</h3></div><div class="architecture-tabs"><button data-architecture="target" aria-pressed="${target}">目标架构 / 开发中</button><button data-architecture="baseline" aria-pressed="${!target}">当前 P12-R4 基线</button></div></div>
 ${target?`<div class="architecture-grid">${targetLayers.map(([title,name,status,description,id])=>`<button class="architecture-card" data-part="${id}" data-status="${id==='capture'?'planned':id==='overlay'?'integrating':'baseline'}"><small>${title}</small><strong>${name}</strong><em>${status}</em><span>${description.split('。')[0]}。</span><span class="card-action">查看结构与实现边界 ↗</span></button>`).join('')}</div><div class="architecture-path"><b>计数路径</b>摄像头 → 硬件 / 低开销采集解码 → PL 预处理 / RLE → PS 区域分析、跟踪、计数</div><div class="architecture-path display-path"><b>独立显示路径</b>图像视频流 ＋ PS 目标位置 / 计数元数据 → PL 视频合成 / Overlay → VDMA / HDMI</div><div class="architecture-path"><b>辅助渠道</b>PS 状态 / 统计 → Web 远程监控（目标架构中的独立辅助展示，当前网页不连接板卡）</div>`:
 `<div class="baseline-chain">摄像头 USB/MJPEG → ARM PS 软件解码 Gray8 → AXI DMA MM2S → PL 预处理 / 阈值 / 形态学 / RLE → AXI DMA S2MM → PS 原生 RLE 连通域 / 特征 / 跟踪 / 越线计数 → PS DashboardComposer → VideoPump / VDMA → HDMI</div><div class="baseline-metrics"><span><b>14.27 FPS</b>处理 · P12-R4</span><span><b>13.58 FPS</b>显示 · P12-R4</span><span><b>约 93%</b>ARM CPU · P12-R4</span></div><p class="architecture-note">本次项目方提供的实板基线数据；不是网页帧率，也不是硬解码或 B2 的验收结果。当前瓶颈仍包含 PS 软件解码与画面合成，目标架构继续卸载这两部分。</p>`}
 <p class="architecture-note">状态边界：当前基线已运行；axis_gray_overlay / B1a / P12 已推进、PL 显示正在集成；采集解码硬件化与 B2 属于后续目标，未声明板端验收通过。网页像素、RLE、ID 和显示均为教学模拟。</p>`;
}

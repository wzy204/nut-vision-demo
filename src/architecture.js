export function architectureMarkup(mode='target'){
 const jpeg=mode==='target';
 const layers=jpeg?[
 ['01 / 采集与预检','PS 接收 MJPEG → 格式 / 长度预检','capture','PS 发送压缩码流，经 MM2S 进入 PL，灰度图不由 PS 常驻生成。'],
 ['02 / PL 图像与区域','JPEG 解码 → Gray8 / ROI / 前景 → RLE + FRG1','rle','PL 产生 FRG1 区域记录；RLE 同时保留前景位置与连通关系。'],
 ['03 / PS 计数决策','FRG1 校验 → 筛选 / 关联 / 轨迹 / 越线去重','tracking','默认 JPEG runner 直接使用 FRG1 检测，不执行 PS RLE 区域重建或局部粘连拆分。'],
 ['04 / T7 同帧显示','二值掩膜 + frame_id / 框 / 计数 → PL Overlay','overlay','双存储体与发布确认握手，VSYNC 切换；支持框、线、累计计数字形，不提供灰度预览。']
 ]:[
 ['01 / 显式软件路径','离线 / --software-decode → Gray8','capture','软件解码路径与默认 JPEG 硬解码路径独立。'],
 ['02 / PL 前景处理','Gray8 → ROI / 阈值 / 可选形态学 → RLE','rle','输出连续前景游程，长度依图像结构变化。'],
 ['03 / PS RLE 分析','八连通区域 → 条件局部拆分 → 跟踪计数','tracking','根据实际帧间隔预测，方向 / 时间 / 横向约束内一对一关联，迟滞与已计数标志抑制重复。'],
 ['04 / V7 / P12 显示','PS 看板 / 字形缓存 → 脏区刷新 → HDMI','overlay','PS 软件更新中文仪表盘；不与 T7 二值 Overlay 的能力混用。']
 ];
 return `<div class="architecture-heading"><div><span class="eyebrow">LJ-01 / JPEG + FRG1 / 技术文档整合修订稿</span><h3>压缩输入 · PL 像素与区域 · PS 跟踪计数 · 同帧显示</h3></div><div class="architecture-tabs"><button data-architecture="target" aria-pressed="${jpeg}">默认 JPEG-PL / T7 候选</button><button data-architecture="baseline" aria-pressed="${!jpeg}">离线 / 软件解码路径</button></div></div><div class="architecture-grid">${layers.map(([title,name,id,description])=>`<button class="architecture-card" data-part="${id}" data-status="${id==='overlay'?'integrating':'baseline'}"><small>${title}</small><strong>${name}</strong><span>${description}</span><span class="card-action">查看职责与验证范围 ↗</span></button>`).join('')}</div><p class="architecture-note">默认 JPEG 路径与离线 RLE 路径的职责来自最新版技术文档；网页运行为独立 RLE 教学模型，不执行 JPEG 硬解码或 FRG1 硬件。候选级验证不等于完整有物料装置验收。</p>`;
}

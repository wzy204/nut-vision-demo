// Documentation model; browser execution is not the JPEG/FRG1 hardware implementation.
export const journeys={target:[
 ['MJPEG 预检','PS 采集','PS 接收相机原始 MJPEG，检查尺寸和 JPEG 头；按实际压缩长度提交 DMA，USB 输入不是 Gray8。','capture'],
 ['DMA / JPEG','PL 硬解码','MM2S → jpeg_axis_gray → Gray8。候选限定 640×400、8 bit 基线 JPEG、4:2:2、单扫描、DRI=40；最大 512,000 B，头缓存 4,096 B。','gray'],
 ['ROI / 前景','PL 像素处理','Gray8 → ROI 内饱和灰度偏移 / 阈值 → 可选 3×3 腐蚀或膨胀。默认 JPEG runner 使用传输接口的阈值、ROI 与形态学默认值。网页参数仅供教学。','roi'],
 ['RLE + FRG1','PL 区域记录','PL 输出 RLE 与 FRG1 区域记录。默认 JPEG 入口不通过 RLE 重建检测区域，直接读取 FRG1。RLE 包长随前景变化，不保证固定压缩率。','rle'],
 ['校验 / 跟踪','PS 目标决策','检查 valid、status、FRG1 签名、完成状态、frame_id、记录数和几何，并复查。有效 FRG1 → 面积筛选 → 关联 / 轨迹 / 方向 / 迟滞 → 越线去重；默认路径不调用局部粘连拆分。','tracking'],
 ['同帧发布','PL T7 Overlay','PS 发布 frame_id、目标框、计数线和累计计数。video_binary_overlay 生成二值掩膜、框、线及计数字形，不提供灰度预览或旧版中文看板。','overlay'],
 ['帧边界 / HDMI','双存储体握手','掩膜完整发布后保持不变，VSYNC 边界切换并确认归还所有权；帧不匹配时抑制旧框。显示侧忙时可放弃新显示帧，计数继续。视频链输出 HDMI。','monitor']
],baseline:[
 ['软件解码','显式路径','离线或 --software-decode 路径：软件生成 Gray8。此路径与默认 JPEG-PL 入口分开说明。','capture'],
 ['Gray8 / ROI','PL 像素处理','640×400 Gray8 像素载荷 256,000 B；带各 16 B 头尾的设计包长为 256,032 B，不是带宽实测值。','gray'],
 ['阈值 / 形态学','前景掩码','ROI 内灰度偏移与阈值、可选形态学，形成前景并输出逐行游程。','morph'],
 ['RLE 连通域','PS 原生分析','RleCounter.update_rle 按行合并八连通游程，统计面积、一阶矩、边界和质心；属于离线及显式软件解码路径。','rle'],
 ['局部拆分 / ID','软件路径能力','仅对符合尺寸及结构条件的候选重建局部掩膜，分析孔洞或颈部；拆分需满足面积、覆盖、无重叠与几何约束。跟踪按实际时间预测并一对一关联。','tracking'],
 ['脏区刷新','V7 / P12 旧看板','背景、状态文本与字形缓存由 PS 按脏区更新，减少重复光栅化和整帧拷贝。该中文看板不是 JPEG/T7 的 PL 二值显示。','overlay'],
 ['本地显示','软件显示基础','PS 看板 → VideoPump / VDMA → HDMI。显示像素、JPEG 压缩包与 RLE 结果包有不同接口语义，包结束不能直接当作视频行尾。','monitor']
]};
export function branchMarkup(mode='target'){
 const jpeg=mode==='target';
 return `<div class="journey-branches"><div><b>计数路径 · ${jpeg?'默认 JPEG-PL':'离线 / --software-decode'}</b><p>${jpeg?'MJPEG → PS 预检 / DMA → PL JPEG 解码 / 前景处理 → PL FRG1 → PS 校验 / 筛选 / 跟踪 / 越线去重':'Gray8 → PL 前景 / RLE → PS 八连通区域 / 候选局部拆分 → 跟踪 / 越线去重'}</p></div><div class="display-branch"><b>显示路径 · ${jpeg?'独立 T7 候选':'V7 / P12 旧看板'}</b><p>${jpeg?'PL 二值掩膜 ＋ PS frame_id / 框 / 计数线 / 累计数 → video_binary_overlay → 视频输出链 / HDMI':'PS 背景 / 文本 / 字形缓存 → 脏区更新 → VideoPump / VDMA → HDMI'}</p><p>${jpeg?'双存储体 → 完整发布 → VSYNC 切换 → 确认归还；不匹配帧抑制旧叠加。显示忙时可跳过显示帧，计数流继续。':'仅变化区域触发更新；持续扫描输出与软件内容更新是不同概念。'}</p></div><div><b>诊断与辅助监控</b><p>状态、分阶段耗时、同帧诊断供复盘；本地 HDMI 计数不依赖 PC 或云服务。网页不连接板卡。</p></div></div>`;
}
export const performanceMarkup=`<section class="board-performance"><div class="section-title">JPEG / T7 独立候选验证 <span>技术文档记录 · 2026-11-02</span></div><div class="baseline-metrics"><span><b>120 / 120 帧</b>真实 MJPEG 处理</span><span><b>11.31 FPS</b>独立空场景板测</span><span><b>0 无效包</b>该次记录</span></div><p>空场景未检出前景物料，此结果不代表有物料吞吐、计数准确率或整机端到端延迟。五帧合成轨迹累计计数为 0、0、0、1、1。HDMI monitor 核对帧身份与扫描，不等同于外接屏观察。</p><p>浏览器 30 FPS 为固定仿真节拍，与板端测速独立。模块仿真、独立实现与实物验收分别列于“实现依据与演示边界”。</p></section>`;

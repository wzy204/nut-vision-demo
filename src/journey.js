export const stages=[
 ['相机 / PS 解码','采集与解码','USB 2.0 / V4L2 接收 640×400 MJPEG，PS 解码为 8 bit Gray8。JPEG 硬解码前置属于可扩展方向，不是本版运行主线。','capture'],
 ['打包 / MM2S','PS → PL','16 B 头 + 256,000 B 像素 + 16 B 尾 = 256,032 B；经 DDR / AXI DMA MM2S 进入 32 bit AXI4-Stream。检查 TKEEP、TLAST、几何及帧号。','dma'],
 ['ROI / 前景','PL · 50 MHz','灰度适配 → ROI → 饱和灰度偏移 → pixel ≥ threshold → 可选 3×3 腐蚀 / 膨胀。行缓存不缓存整帧，反压时保持数据及侧带稳定。参数在帧边界生效。','roi'],
 ['有界 RLE','PL → S2MM','RLE_PACKET_V1：逐行游程 + 行列投影 + 帧状态。最多 16,384 游程；包内记录 frame_id、参数、前景数、游程数、长度与校验。溢出或协议错误置位，不进入正常计数。','rle'],
 ['区域 / 拆分','PS 原生分析','先校验包结构、长度、帧号、几何、状态和校验值，再以八连通游程合并求面积、包围框、一阶矩及质心。仅对有孔洞或颈部依据的粘连候选重建局部掩膜，拆分通过覆盖、连通与几何校验后才替换原区域。','ps'],
 ['关联 / 越线','PS 唯一计数','实际采集时间 → 速度预测 → 方向 / 横向 / 面积比 / 时间门限内一对一有序关联。轨迹确认、计数线预备与滞回共同产生事件，已计数标志去重；歧义不猜测，长断档不补计。','tracking'],
 ['同帧仪表盘','PS 绘制 → VDMA','PS 合成 1280×720 Gray8 看板，二值预览、框、ID 与计数绑定同一 frame_id。静态版式 / 字形缓存，动态区域脏区刷新；仅发布完整画布，VDMA 在帧边界切换并独立扫描至 HDMI。','monitor']
];
export function branchMarkup(){return `<div class="journey-branches"><div><b>计算路径 · 有界游程回传</b><p>USB/MJPEG → PS Gray8 解码 / 打包 → MM2S → PL 前处理 / RLE / 投影 → S2MM → PS 包校验 / 区域 / 拆分 / 跟踪计数</p></div><div class="display-branch"><b>显示路径 · PS 合成，VDMA 独立扫描</b><p>同帧输入 + 检测 / 轨迹 / 计数 → PS 灰度仪表盘 / 脏区更新 → 完整画布发布 → DDR / VDMA → HDMI</p><p>处理慢时重复最近完整帧；绘图异常时保持画面，不提交半成品。计数与扫描速率解耦，计算结果和画面仍以 frame_id 对齐。</p></div></div>`;}
export const performanceMarkup=`<section class="board-performance"><div class="section-title">板端连续会话与静态实现 <span>来源：技术文档专业版 · 2026-11-04</span></div><div class="baseline-metrics"><span><b>约 16.6 FPS</b>滚动处理速率</span><span><b>约 14.6 FPS</b>正常预览窗口显示</span><span><b>0 / 570</b>无效帧 / 会话帧数</span><span><b>10.92% LUT</b>XC7Z020 · 50 MHz</span></div><p>空场景、无人工物料真值；不代表有物料高负载持续吞吐或计数准确率。368 组显示掩膜的前景数、400 行投影、640 列投影与同帧 PL 元数据一致。</p><details><summary>查看阶段耗时与资源范围</summary><p>采集与解码 9.31 ms；包准备与 DMA 23.65 ms；区域与跟踪 1.33 ms；监视与预览发布 25.16 ms。阶段可重叠，均值之和不等于端到端延迟；DMA 阶段包含 PS 软件操作，不是 PL 核心延迟。</p><p>静态实现：LUT 5,809、FF 4,162、BRAM 2.5、DSP 0；WNS +3.366 ns、WHS +0.036 ns，用户时序约束全部满足。浏览器 30 FPS 为仿真节拍，与上述板测独立。</p></details></section>`;

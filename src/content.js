export const parts = {
  "feeder": {
    "name": "直线振动送料槽",
    "category": "01 / MECHANICAL FEEDING",
    "description": "采用本次装配中的直线振动料槽，沿阶梯波纹槽面将螺母送向主传送带；机械分料用于减少重叠和粘连。",
    "inside": "原 CAD 长条料槽、波纹槽底、支承与振动底座。",
    "connection": "供电 → 振动控制器 → 送料底座 → 导流出口。",
    "evidence": "几何来自传送带完整模型.SLDASM；振幅与节拍为教学模拟，未做动力学求解或分料验收。"
  },
  "chute": {
    "name": "料槽导流出口",
    "category": "02 / MATERIAL GUIDANCE",
    "description": "保留原装配一体式料槽出口，与主传送带衔接；间距由教学送料节拍和带速控制。",
    "inside": "倾斜金属槽底、波纹导流面与双侧挡边；与振动料槽为同一 CAD 零件。",
    "connection": "直线振动料槽 → 导流出口 → 主传送带。",
    "evidence": "保留 CAD 原始尺寸；送料与混合粘连是教学动画，未模拟实体碰撞。"
  },
  "belt": {
    "name": "单条主传送带",
    "category": "03 / CONTINUOUS TRANSPORT",
    "description": "深色带面承载螺母从左向右通过成像区，稳定的背景灰度有助于前景提取。",
    "inside": "主动辊、从动辊、环形带、铝型材机架、支脚与侧挡板。",
    "connection": "直流减速电机 → 主动辊；电源 / PWM 驱动模块控制转速。",
    "evidence": "带速按 CAD 比例 24 场景单位/米换算为 m/s，为模拟设定值，未接入编码器实测反馈。"
  },
  "motor": {
    "name": "电机与驱动模块",
    "category": "04 / MOTION CONTROL",
    "description": "驱动主传送带，控制线路与图像数据线路分开。GPIO / PWM 需通过适配驱动器，不能直接带动电机。",
    "inside": "原 CAD 减速电机、直臂安装座与齿轮传动；PWM 驱动器为教学连接示意。",
    "connection": "24 V → 驱动器 → 电机；PS GPIO / PWM → 电平适配 → 驱动器。",
    "evidence": "控制与供电拓扑示意，未指定引脚或声称硬件电气验收。"
  },
  "camera": {
    "name": "MJPEG 相机输入（模型示意）",
    "category": "05 / IMAGE ACQUISITION",
    "description": "PS 接收原始 MJPEG 并预检格式，按压缩长度提交 DMA；默认 JPEG 路径由 PL 解码为 Gray8。相机外观沿用 CAD 示意。",
    "inside": "相机 / V4L2 压缩帧输入与 PS 格式预检。",
    "connection": "MJPEG → PS 预检 → MM2S → jpeg_axis_gray",
    "evidence": "输入限制按 LJ-01 JPEG 候选；不声称支持任意 JPEG。"
  },
  "light": {
    "name": "工业条形补光灯",
    "category": "06 / CONTROLLED ILLUMINATION",
    "description": "相机两侧的固定条形光源照亮金属表面，使螺母与深色传送带形成稳定灰度对比。",
    "inside": "原 CAD 双侧条灯、横梁及伸缩安装支架；LED 与照明控制按教学架构解释。",
    "connection": "24 V 供电 → 恒流灯控制器 → 两侧灯条。",
    "evidence": "光照与灰度为合成模型；实际阈值需结合曝光、反光和材料标定。"
  },
  "board": {
    "name": "PYNQ-Z2 开发板",
    "category": "07 / HETEROGENEOUS COMPUTING",
    "description": "Zynq-7000 把 ARM PS 和 FPGA PL 集成在同一 SoC。选择“进入芯片”查看 PS / DDR / AXI DMA / PL 的协作关系。",
    "inside": "XC7Z020 SoC、DDR3、USB Host、HDMI 输出连接器、电源管理与扩展接口。板级几何与安装位置来自本次 CAD 装配；芯片内部为逻辑示意。",
    "connection": "USB 输入到 PS；PS 与 DDR、AXI DMA 交互；视频输出链路接 HDMI 显示器。",
    "evidence": "按 LJ-01 默认 JPEG-PL / T7 候选讲解，模块验证、独立板测与完整装置验收分别说明。"
  },
  "collector": {
    "name": "尾端接料盒",
    "category": "10 / MATERIAL COLLECTION",
    "description": "收集传送带末端的已计数螺母；接料不重复增加计数。",
    "inside": "原 CAD 接料盒底板、侧壁与支承。",
    "connection": "主传送带出料端 → 接料盒。",
    "evidence": "保留装配几何与位置；落料为简化动画，未做碰撞堆积仿真。"
  },
  "monitor": {
    "name": "HDMI 可视化显示器",
    "category": "08 / RESULT PRESENTATION",
    "description": "T7 video_binary_overlay 在 PL 输出二值掩膜、计数线、检测框与累计计数字形，不包含灰度预览及旧中文仪表盘。",
    "inside": "掩膜双存储体、frame_id、VSYNC 切换、配置发布 / 确认握手；不匹配帧抑制旧叠加。",
    "connection": "二值掩膜 + PS 同帧目标 / 计数配置 → video_binary_overlay → 视频输出链 / HDMI",
    "evidence": "独立 RTL XSim、候选实现及板内 monitor 各验证对应范围，不等同外接屏验收。"
  },
  "power": {
    "name": "供电与控制模块",
    "category": "09 / POWER & CONTROL",
    "description": "分别为送料、电机、灯光和开发板提供适配供电。功率负载通过驱动级与逻辑控制连接。",
    "inside": "24 V 电源、熔断 / 开关模块、灯光驱动、独立 12 V 板卡电源与控制接口示意。",
    "connection": "24 V → 机械 / 灯光；适配 12 V → PYNQ-Z2；控制信号经驱动和电平适配。",
    "evidence": "非接线施工图；演示没有固定 GPIO 引脚、电流或电源容量参数。"
  },
  "ps": {
    "name": "ARM 处理系统 · PS",
    "category": "ZYNQ / PROCESSING SYSTEM",
    "description": "默认 JPEG 路径校验 valid / status 及 FRG1 签名、完成、frame_id、记录数和几何后复查，交给跟踪器筛选、关联和越线计数。",
    "inside": "FRG1 检测筛选、实际时间关联、轨迹确认、方向 / 迟滞及已计数标志。",
    "connection": "FRG1 → read_frg_detections → tracker.update_detections → publish_overlay",
    "evidence": "默认路径不调用 RleCounter.update_rle 或局部粘连拆分。"
  },
  "ddr": {
    "name": "DDR 帧缓冲",
    "category": "MEMORY / FRAME BUFFER",
    "description": "存放摄像头 Gray8 输入、DMA 缓冲及处理输出。640 × 400 × 1 byte = 256,000 bytes；缓存一致性与缓冲所有权必须由软件管理。",
    "inside": "输入缓冲、输出缓冲、显示缓冲，实际分配需满足 DMA 物理连续与同步约束。",
    "connection": "PS ↔ DDR；AXI DMA 经 AXI HP 访问 DDR。",
    "evidence": "框图展示逻辑数据关系，不代表完整地址映射或正式 ABI。"
  },
  "dma": {
    "name": "AXI DMA · MM2S / S2MM",
    "category": "TRANSPORT / AXI4-STREAM",
    "description": "MM2S 从 DDR 读取数据转换为流；S2MM 将流结果写回 DDR。只有 TVALID 与 TREADY 同时有效时，数据拍才被接收。",
    "inside": "内存映射主接口、流接口、长度 / 状态寄存器；需要适配图像帧 / 行标记与包边界。",
    "connection": "DDR → MM2S → 像素 / 标记适配 → PL；PL RLE → 包适配 → S2MM → DDR → PS 原生 RLE 连通域。",
    "evidence": "仓库有隔离 DMA 实验与 S2MM 证据；教学图不替代生产接口冻结。"
  },
  "gray": {
    "name": "PL JPEG 硬解码与 Gray8",
    "category": "PL / PIXEL FRONTEND",
    "description": "默认由 PL jpeg_axis_gray 硬解码生成 Gray8。640×400、8 bit 基线 JPEG、4:2:2、单扫描、DRI=40；最大 512,000 B，头缓存 4,096 B。",
    "inside": "头部验证、熵解码、系数检查、IDCT、MCU 重排、Gray8 输出。",
    "connection": "AXI4-Stream：TDATA、TVALID、TREADY、TUSER[0]、TLAST；具体 DMA 包边界需单独适配。",
    "evidence": "D695 CSim、C/RTL 联合仿真和独立 OOC 结果各有范围；格式预检不替代 PL 最终校验。"
  },
  "threshold": {
    "name": "阈值二值化",
    "category": "PL / GRAY TO BINARY",
    "description": "逐像素比较：灰度 ≥ T 输出 255 白色前景，否则输出 0 黑色背景。滑动阈值可观察孔洞、噪声和前景断裂变化。",
    "inside": "8 位比较器、流水寄存器、AXI 握手与标记传递。",
    "connection": "Gray8 → 比较器 → Binary8；阈值滑块作用于浏览器模型。",
    "evidence": "对应 axis_gray2binary.v 与离线仿真；网页交互不证明板端可实时修改阈值。"
  },
  "morph": {
    "name": "3 × 3 形态学",
    "category": "PL / LOCAL NEIGHBORHOOD",
    "description": "腐蚀对九个前景位取 AND，膨胀取 OR。可抑制部分噪点，但也可能抹去小目标、填孔或合并相邻区域。图像边界补零。",
    "inside": "当前 RTL：3 个旋转一位行存储 + 横向移位寄存器 + LUT / FF。320 宽模式 OOC 为分布式 RAM，BRAM=0。",
    "connection": "二值流 → 行缓存 / 3×3 窗口 → AND / OR → 二值流；接收行与输出行交替。",
    "evidence": "84/84 仿真通过；MODE 是编译期参数。约 2WH+H 拍引擎工作量，非全帧 1 px/clk。"
  },
  "roi": {
    "name": "ROI 与前景特征统计",
    "category": "PL / REGION OF INTEREST",
    "description": "按图像坐标限制感兴趣区域并统计前景。前景总面积是特征，不能直接除以单颗面积作为可靠的螺母数量。",
    "inside": "坐标计数、ROI 判断、面积累加器；生产级目标特征与序列化 ABI 仍需设计。",
    "connection": "PL Gray8 → ROI / 饱和灰度偏移 / 阈值 / 可选形态学 → RLE + FRG1",
    "evidence": "ROI RTL / 交接有依据；正式 PL 目标特征接口是规划项。"
  },
  "tracking": {
    "name": "PS FRG1 跟踪与越线计数",
    "category": "LAYER 03 / TRACKING",
    "description": "默认 JPEG 路径校验 valid / status 及 FRG1 签名、完成、frame_id、记录数和几何后复查，交给跟踪器筛选、关联和越线计数。",
    "inside": "FRG1 检测筛选、实际时间关联、轨迹确认、方向 / 迟滞及已计数标志。",
    "connection": "FRG1 → read_frg_detections → tracker.update_detections → publish_overlay",
    "evidence": "默认 JPEG runner 不执行 RLE 区域重建与局部拆分；浏览器仅作 RLE 教学模型。"
  },
  "capture": {
    "name": "PS MJPEG 接收与预检",
    "category": "LAYER 01 / ACQUISITION",
    "description": "PS 接收原始 MJPEG 并预检格式，按压缩长度提交 DMA；默认 JPEG 路径由 PL 解码为 Gray8。相机外观沿用 CAD 示意。",
    "inside": "相机 / V4L2 压缩帧输入与 PS 格式预检。",
    "connection": "MJPEG → PS 预检 → MM2S → jpeg_axis_gray",
    "evidence": "输入限制按 LJ-01 JPEG 候选；不声称支持任意 JPEG。"
  },
  "rle": {
    "name": "PL 行程编码 · RLE",
    "category": "LAYER 02 / PIXEL PIPELINE",
    "description": "PL 前景处理后输出 RLE 与 FRG1 区域记录。默认 JPEG 入口直接使用 FRG1，不从 RLE 重建区域。离线和 --software-decode 才使用 PS RLE 连通域。",
    "inside": "RLE 逐行游程及 FRG1 区域记录；状态、frame_id、完整性与几何检查。",
    "connection": "PL RLE + FRG1 → PS 状态 / 帧号 / 几何校验 → FRG1 检测筛选与跟踪",
    "evidence": "RLE 保留掩码位置和连通关系；返回长度可变，不保证固定压缩率。"
  },
  "overlay": {
    "name": "T7 二值 Overlay 与同帧发布",
    "category": "LAYER 04 / HARDWARE DISPLAY",
    "description": "T7 video_binary_overlay 在 PL 输出二值掩膜、计数线、检测框与累计计数字形，不包含灰度预览及旧中文仪表盘。",
    "inside": "掩膜双存储体、frame_id、VSYNC 切换、配置发布 / 确认握手；不匹配帧抑制旧叠加。",
    "connection": "二值掩膜 + PS 同帧目标 / 计数配置 → video_binary_overlay → 视频输出链 / HDMI",
    "evidence": "独立 RTL XSim、候选实现及板内 monitor 各验证对应范围，不等同外接屏验收。"
  },
  "web": {
    "name": "Web 远程监控",
    "category": "AUXILIARY / REMOTE MONITOR",
    "description": "独立辅助展示通道，用于远程查看计数、目标与运行状态，不替代硬件 HDMI 主显示路径。",
    "inside": "状态与统计展示；本网页使用本地仿真数据。",
    "connection": "PS 状态 / 计数 → Web 远程监控。",
    "evidence": "辅助目标架构；本演示没有实时板卡网络连接。"
  }
};
export {evidenceHTML} from './evidence.js';

export const parts={
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
    "description": "USB 2.0 / V4L2 接收 640×400 MJPEG，由 PS 软件解码为 8 bit Gray8，再打包送 PL。",
    "inside": "现有相机外壳和独立支架保持原 CAD 模型；内部按 USB/MJPEG 采集讲解。",
    "connection": "USB/MJPEG → PS 解码 → Gray8 / DDR → AXI DMA MM2S",
    "evidence": "机械外观为 CAD 示意，输入、解码和包通路按新版文档说明。"
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
    "evidence": "当前文档：PS 解码 / 区域决策 / 绘图，PL 50 MHz 前处理与 RLE，VDMA 显示扫描。"
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
    "name": "VDMA / HDMI 同帧本地显示",
    "category": "04 / LOCAL DISPLAY",
    "description": "1280×720 灰度画布经 AXI VDMA MM2S 与 HDMI 前端输出；处理速率下降时重复最近完整画面，未完成画布不参与扫描。",
    "inside": "DDR 显示缓冲、帧边界切换、HDMI 时序与 TMDS；计数结果和画面以 frame_id 关联。",
    "connection": "PS 完整画布 → DDR → VDMA → HDMI 前端 → 显示器",
    "evidence": "570 帧空场景会话及 368 组同帧一致性按文档范围说明。模型屏幕是教学示意，不是实拍。"
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
    "name": "PS 游程区域与粘连候选分析",
    "category": "03 / PS REGION ANALYSIS",
    "description": "包校验通过后按八连通游程合并计算面积、包围框、一阶矩与质心；筛选后仅对粘连候选重建局部掩膜。",
    "inside": "孔洞种子 / 距离分配，必要时采用地测线分配；无孔洞时分析投影颈部与递归拆分。",
    "connection": "有效 RLE → 区域 / 几何筛选 → 条件局部拆分 → 有序目标列表",
    "evidence": "拆分须满足面积、完整覆盖、无重叠与几何条件；网页仅实现简化孔洞辅助教学算法。"
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
    "connection": "PS Gray8 包 / DDR → MM2S → PL 前处理 / RLE → S2MM → DDR → PS 包校验",
    "evidence": "仓库有隔离 DMA 实验与 S2MM 证据；教学图不替代生产接口冻结。"
  },
  "gray": {
    "name": "PL Gray8 解包与灰度适配",
    "category": "02 / PL PIXEL FRONTEND",
    "description": "从 32 bit beat 按字节恢复灰度像素，并产生行同步、帧起始和帧号；输入像素已由 PS 解码。",
    "inside": "16 B 包头、256,000 B 像素、16 B 包尾；TKEEP / TLAST、几何和帧号检查。",
    "connection": "MM2S → Gray8 适配 → ROI / 灰度偏移 / 阈值",
    "evidence": "256,032 B 为输入传输包字节数，不是带宽或 PL 延迟实测。"
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
    "inside": "3×3 邻域使用三行行缓存，不缓存整帧；背压时保持数据和侧带稳定。",
    "connection": "二值流 → 行缓存 / 3×3 窗口 → AND / OR → 二值流；接收行与输出行交替。",
    "evidence": "RLE 流水线 8 项 XSim 与综合后网表通过，具体范围见新版技术文档。网页切换为教学模型。"
  },
  "roi": {
    "name": "ROI 与前景特征统计",
    "category": "PL / REGION OF INTEREST",
    "description": "ROI 选通后对灰度做饱和偏移，再进行阈值比较与可选形态学；配置在帧边界生效。",
    "inside": "坐标计数、ROI 判断、面积累加器；生产级目标特征与序列化 ABI 仍需设计。",
    "connection": "Gray8 → ROI → 灰度偏移 → 阈值 → 可选形态学 → RLE / 投影",
    "evidence": "ROI RTL / 交接有依据；正式 PL 目标特征接口是规划项。"
  },
  "tracking": {
    "name": "PS 轨迹关联与唯一越线计数",
    "category": "03 / PS TRACKING & COUNTING",
    "description": "按实际采集时间预测运动，在方向、横向偏差、面积比与时间约束下进行一对一有序关联；确认轨迹后以预备状态、越线滞回和已计数标志累计。",
    "inside": "目标状态、速度预测、轨迹确认、有序关联、滞回、counted 去重；歧义拒绝猜测，长断档不补计。",
    "connection": "PS 区域列表 + 采集时间 → 轨迹 / 越线事件 → 同帧计数结果 → PS 看板",
    "evidence": "网页保留 ID 与单次越线交互，不复现全部板端关联和滞回策略；不代表实物准确率。"
  },
  "capture": {
    "name": "PS 相机采集与 MJPEG 解码",
    "category": "01 / PS ACQUISITION",
    "description": "USB 2.0 / V4L2 接收 640×400 MJPEG，由 PS 软件解码为 8 bit Gray8，再打包送 PL。",
    "inside": "相机接收、解码、单调采集时间与输入缓冲管理。",
    "connection": "USB/MJPEG → PS 解码 → Gray8 / DDR → AXI DMA MM2S",
    "evidence": "技术文档专业版的当前链路；本页采用 PS 解码基线；独立 JPEG PL 候选的限定板测记录见“实现依据与演示边界”，不代表合并快照已完成硬件验收。"
  },
  "rle": {
    "name": "PL 有界 RLE 与行列投影",
    "category": "02 / PL BOUNDED OUTPUT",
    "description": "逐行编码（行号，起始列，结束列），最多 16,384 游程，并统计行列投影、前景数和游程数。",
    "inside": "RLE_PACKET_V1 包含帧号、参数版本、ROI、阈值、偏移、形态学、状态、长度与校验。",
    "connection": "PL 前景 → RLE_PACKET_V1 / 投影 / 状态 → S2MM → DDR → PS 校验",
    "evidence": "空包 2,208 B，上限 67,744 B；约 2.3 KB 仅为典型场景，不承诺固定压缩率。超限可检测，异常帧不进入正常计数。"
  },
  "overlay": {
    "name": "PS 灰度仪表盘与脏区刷新",
    "category": "04 / PS COMPOSITION",
    "description": "PS 生成 1280×720 Gray8 看板，含二值预览、检测框、轨迹编号、累计数及状态；显示结果绑定 frame_id。",
    "inside": "离屏 chrome / 静态版式 / 字形缓存；动态数值、状态点与预览边框按脏区更新，减少重复光栅化和整帧拷贝。",
    "connection": "同帧输入 + 结果 → PS 看板合成 → 完整画布发布 → DDR / VDMA / HDMI",
    "evidence": "像素图层及文字由 PS 合成；PL 负责显示扫描和 HDMI 时序，不再描述为 T7 硬件 Overlay。"
  },
  "web": {
    "name": "Web 远程监控",
    "category": "AUXILIARY / REMOTE MONITOR",
    "description": "桌面端提供连接、启动、停止和状态查看；板端计数与 HDMI 可独立运行，不依赖 PC 或云服务。",
    "inside": "状态与统计展示；本网页使用本地仿真数据。",
    "connection": "PS 状态 / 计数 → Web 远程监控。",
    "evidence": "本网页使用本地合成数据，没有实时板卡连接。"
  }
};
export {evidenceHTML} from './evidence.js';

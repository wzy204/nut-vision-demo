export const parts = {
 feeder:{name:'直线振动送料槽',category:'01 / MECHANICAL FEEDING',description:'采用本次装配中的直线振动料槽，沿阶梯波纹槽面将螺母送向主传送带；机械分料用于减少重叠和粘连。',inside:'原 CAD 长条料槽、波纹槽底、支承与振动底座。',connection:'供电 → 振动控制器 → 送料底座 → 导流出口。',evidence:'几何来自传送带完整模型.SLDASM；振幅与节拍为教学模拟，未做动力学求解或分料验收。'},
 chute:{name:'料槽导流出口',category:'02 / MATERIAL GUIDANCE',description:'保留原装配一体式料槽出口，与主传送带衔接；间距由教学送料节拍和带速控制。',inside:'倾斜金属槽底、波纹导流面与双侧挡边；与振动料槽为同一 CAD 零件。',connection:'直线振动料槽 → 导流出口 → 主传送带。',evidence:'保留 CAD 原始尺寸；送料与混合粘连是教学动画，未模拟实体碰撞。'},
 belt:{name:'单条主传送带',category:'03 / CONTINUOUS TRANSPORT',description:'深色带面承载螺母从左向右通过成像区，稳定的背景灰度有助于前景提取。',inside:'主动辊、从动辊、环形带、铝型材机架、支脚与侧挡板。',connection:'直流减速电机 → 主动辊；电源 / PWM 驱动模块控制转速。',evidence:'带速按 CAD 比例 24 场景单位/米换算为 m/s，为模拟设定值，未接入编码器实测反馈。'},
 motor:{name:'电机与驱动模块',category:'04 / MOTION CONTROL',description:'驱动主传送带，控制线路与图像数据线路分开。GPIO / PWM 需通过适配驱动器，不能直接带动电机。',inside:'原 CAD 减速电机、直臂安装座与齿轮传动；PWM 驱动器为教学连接示意。',connection:'24 V → 驱动器 → 电机；PS GPIO / PWM → 电平适配 → 驱动器。',evidence:'控制与供电拓扑示意，未指定引脚或声称硬件电气验收。'},
 camera:{name:'OV9281 全局快门摄像头',category:'05 / IMAGE ACQUISITION',description:'同时曝光可降低运动形变。点击“视觉检测”观察与三维目标位置一致的 640 × 400 合成灰度画面。',inside:'原 CAD 相机外壳与独立升降立柱；内部按 OV9281 加 USB 桥接目标架构讲解，外壳不能证明传感器型号。',connection:'带 USB 桥接的摄像头模组 → PS USB Host → Linux 驱动 → DDR 帧缓冲。',evidence:'CAD 保留相机及立柱位置；视锥、640×400 灰度画面为教学示意，未做镜头标定。USB 路线不改变正式候选状态。'},
 light:{name:'工业条形补光灯',category:'06 / CONTROLLED ILLUMINATION',description:'相机两侧的固定条形光源照亮金属表面，使螺母与深色传送带形成稳定灰度对比。',inside:'原 CAD 双侧条灯、横梁及伸缩安装支架；LED 与照明控制按教学架构解释。',connection:'24 V 供电 → 恒流灯控制器 → 两侧灯条。',evidence:'光照与灰度为合成模型；实际阈值需结合曝光、反光和材料标定。'},
 board:{name:'PYNQ-Z2 开发板',category:'07 / HETEROGENEOUS COMPUTING',description:'Zynq-7000 把 ARM PS 和 FPGA PL 集成在同一 SoC。选择“进入芯片”查看 PS / DDR / AXI DMA / PL 的协作关系。',inside:'XC7Z020 SoC、DDR3、USB Host、HDMI 输出连接器、电源管理与扩展接口。板级几何与安装位置来自本次 CAD 装配；芯片内部为逻辑示意。',connection:'USB 输入到 PS；PS 与 DDR、AXI DMA 交互；视频输出链路接 HDMI 显示器。',evidence:'部分 RTL 与 DMA 实验有依据；完整持续计数及 HDMI 闭环属于目标演示。'},
 collector:{name:'尾端接料盒',category:'10 / MATERIAL COLLECTION',description:'收集传送带末端的已计数螺母；接料不重复增加计数。',inside:'原 CAD 接料盒底板、侧壁与支承。',connection:'主传送带出料端 → 接料盒。',evidence:'保留装配几何与位置；落料为简化动画，未做碰撞堆积仿真。'},
 monitor:{name:'HDMI 可视化显示器',category:'08 / RESULT PRESENTATION',description:'显示二值图像、目标框、独立 ID、历史轨迹、虚拟计数线与累计数量。内容来自同一浏览器仿真。',inside:'LCD 面板、视频接收与显示电路、支架。',connection:'PS 合成叠加图像 → DDR → 视频读出 / VDMA 与时序输出 IP → HDMI TX → 显示器。',evidence:'AXI DMA 本身不生成 HDMI 时序。HDMI 输出路径为规划架构模拟。'},
 power:{name:'供电与控制模块',category:'09 / POWER & CONTROL',description:'分别为送料、电机、灯光和开发板提供适配供电。功率负载通过驱动级与逻辑控制连接。',inside:'24 V 电源、熔断 / 开关模块、灯光驱动、独立 12 V 板卡电源与控制接口示意。',connection:'24 V → 机械 / 灯光；适配 12 V → PYNQ-Z2；控制信号经驱动和电平适配。',evidence:'非接线施工图；演示没有固定 GPIO 引脚、电流或电源容量参数。'},
 ps:{name:'ARM 处理系统 · PS',category:'ZYNQ / PROCESSING SYSTEM',description:'Linux 采集 USB 图像；软件完成连通域、轮廓与面积筛选、跨帧关联和越线去重。粘连可结合中心孔、形状、轨迹，必要时尝试分水岭。',inside:'双核 ARM Cortex-A9、Linux、Python / OpenCV、目标状态表。',connection:'USB → PS → DDR；PS 配置 DMA / AXI-Lite；取回二值图像或设计好的特征接口。',evidence:'离线参考与有限板测存在；网页采用独立 JavaScript 教学算法，未执行板端 Python。'},
 ddr:{name:'DDR 帧缓冲',category:'MEMORY / FRAME BUFFER',description:'存放摄像头 Gray8 输入、DMA 缓冲及处理输出。640 × 400 × 1 byte = 256,000 bytes；缓存一致性与缓冲所有权必须由软件管理。',inside:'输入缓冲、输出缓冲、显示缓冲，实际分配需满足 DMA 物理连续与同步约束。',connection:'PS ↔ DDR；AXI DMA 经 AXI HP 访问 DDR。',evidence:'框图展示逻辑数据关系，不代表完整地址映射或正式 ABI。'},
 dma:{name:'AXI DMA · MM2S / S2MM',category:'TRANSPORT / AXI4-STREAM',description:'MM2S 从 DDR 读取数据转换为流；S2MM 将流结果写回 DDR。只有 TVALID 与 TREADY 同时有效时，数据拍才被接收。',inside:'内存映射主接口、流接口、长度 / 状态寄存器；需要适配图像帧 / 行标记与包边界。',connection:'DDR → MM2S → 像素 / 标记适配 → PL；PL RLE → 包适配 → S2MM → DDR → PS 原生 RLE 连通域。',evidence:'仓库有隔离 DMA 实验与 S2MM 证据；教学图不替代生产接口冻结。'},
 gray:{name:'Gray8 输入 / 可选灰度转换',category:'PL / PIXEL FRONTEND',description:'USB 黑白输入已经是单通道 Gray8，可直接进入阈值模块；若输入为 RGB，才需要使用 RGB→Gray 前端。',inside:'像素格式适配、帧首 SOF、行尾 EOL 标记。',connection:'AXI4-Stream：TDATA、TVALID、TREADY、TUSER[0]、TLAST；具体 DMA 包边界需单独适配。',evidence:'RGB→Gray RTL 有离线证据；本场景 Gray8 不重复做有色转灰度。'},
 threshold:{name:'阈值二值化',category:'PL / GRAY TO BINARY',description:'逐像素比较：灰度 ≥ T 输出 255 白色前景，否则输出 0 黑色背景。滑动阈值可观察孔洞、噪声和前景断裂变化。',inside:'8 位比较器、流水寄存器、AXI 握手与标记传递。',connection:'Gray8 → 比较器 → Binary8；阈值滑块作用于浏览器模型。',evidence:'对应 axis_gray2binary.v 与离线仿真；网页交互不证明板端可实时修改阈值。'},
 morph:{name:'3 × 3 形态学',category:'PL / LOCAL NEIGHBORHOOD',description:'腐蚀对九个前景位取 AND，膨胀取 OR。可抑制部分噪点，但也可能抹去小目标、填孔或合并相邻区域。图像边界补零。',inside:'当前 RTL：3 个旋转一位行存储 + 横向移位寄存器 + LUT / FF。320 宽模式 OOC 为分布式 RAM，BRAM=0。',connection:'二值流 → 行缓存 / 3×3 窗口 → AND / OR → 二值流；接收行与输出行交替。',evidence:'84/84 仿真通过；MODE 是编译期参数。约 2WH+H 拍引擎工作量，非全帧 1 px/clk。'},
 roi:{name:'ROI 与前景特征统计',category:'PL / REGION OF INTEREST',description:'按图像坐标限制感兴趣区域并统计前景。前景总面积是特征，不能直接除以单颗面积作为可靠的螺母数量。',inside:'坐标计数、ROI 判断、面积累加器；生产级目标特征与序列化 ABI 仍需设计。',connection:'PL 二值输出 → S2MM 图像回传，或经设计好的 AXI-Lite 特征寄存器供 PS 读取。',evidence:'ROI RTL / 交接有依据；正式 PL 目标特征接口是规划项。'},
 tracking:{name:'PS 跟踪与越线计数',category:'PS / TRACKING & COUNTING',description:'根据二值图像连通域与孔洞提取候选，以运动预测做一对一跨帧关联。ID 从 x<320 走到 x≥320 时累计一次，随后标记已计数。',inside:'连通域分析、孔洞种子辅助分离、位置预测、ID 状态、历史轨迹、counted 标志。',connection:'PL / DDR 结果 → PS 候选提取 → 跟踪 → 越线事件 → 显示图层。',evidence:'教学版分离与关联不保证所有粘连、遮挡、漏帧情况下正确；非真实准确率。'}
};

Object.assign(parts,{
 capture:{name:'采集解码卸载',category:'LAYER 01 / ACQUISITION',description:'当前 P12-R4 基线为 USB/MJPEG 进入 ARM PS，再由软件解码为 Gray8。下一阶段由相机队友推进硬件或低开销采集解码，使视频进入 FPGA 图像处理链。',inside:'硬件接口、桥接与解码实现以队友方案为准；不预设具体接口已冻结。',connection:'摄像头 → 硬件 / 低开销采集解码 → PL Gray8；基线保留 PS 解码与 MM2S。',evidence:'开发方向；硬解码未声明通过板端验收。'},
 rle:{name:'PL 行程编码 · RLE',category:'LAYER 02 / PIXEL PIPELINE',description:'Gray8 / ROI / 阈值 / 可选形态学后，将每行连续前景编码为游程。PS 从游程关联区域，避免把白色像素总面积直接当作螺母数量。',inside:'行号、起始 x、结束 x；本网页实际执行逐行 RLE 及相邻行游程合并，接口格式为教学模型。',connection:'PL 预处理 → RLE → S2MM（当前基线）→ PS 原生 RLE 连通域。',evidence:'RLE 属于实际运行基线；网页不执行板端原生代码，不声明与板端 ABI 等价。'},
 overlay:{name:'PL 视频合成与 Overlay',category:'LAYER 04 / HARDWARE DISPLAY',description:'独立显示路径接收灰度视频层和 PS 输出的目标位置、计数等元数据，在 PL 中叠加目标框与计数信息，卸载 ARM 完整 1280×720 看板逐帧绘制。',inside:'axis_gray_overlay、B1a、P12 已推进；下一步继续 B2 灰度视频层与目标信息硬件合成。',connection:'图像视频流 ＋ PS 目标 / 计数元数据 → PL Overlay / 合成 → VDMA / HDMI。',evidence:'正在集成；B2 尚未通过板端验收。当前基线仍使用 DashboardComposer / VideoPump。'},
 web:{name:'Web 远程监控',category:'AUXILIARY / REMOTE MONITOR',description:'独立辅助展示通道，用于远程查看计数、目标与运行状态，不替代硬件 HDMI 主显示路径。',inside:'状态与统计展示；本网页使用本地仿真数据。',connection:'PS 状态 / 计数 → Web 远程监控。',evidence:'辅助目标架构；本演示没有实时板卡网络连接。'}
});
parts.camera.connection=parts.capture.connection;parts.camera.evidence='当前 USB/MJPEG 软件解码为基线；采集解码硬件化为下一阶段，具体接口由相机队友确定。';
parts.ps.description='当前 PS 执行原生 RLE 连通域、特征提取、目标跟踪、越线计数与控制。目标架构卸载采集解码和完整看板绘制，保留 ARM 的目标级智能决策。';
parts.ps.inside='ARM PS：原生 RLE 连通域、区域特征、轨迹与 ID 状态、counted 去重标志、控制逻辑。';
parts.ps.connection='RLE / S2MM → PS 区域分析与计数 → 元数据 → PL Overlay；另有 Web 辅助监控。';parts.ps.evidence='P12-R4 基线已运行；当前 DashboardComposer 与软件解码的 ARM 开销仍需卸载。';
parts.board.connection='采集解码层 → PL 像素处理 / RLE ↔ PS 目标决策；图像视频流 + PS 元数据 → PL 视频合成 → HDMI。';parts.board.evidence='基线已运行；硬件采集解码和 B2 合成仍在开发，不等同于最终目标验收。';
parts.monitor.description='目标显示由 PL 灰度视频层与 Overlay 合成目标框和计数信息，通过 VDMA / HDMI 输出。当前 P12-R4 基线仍由 PS DashboardComposer 合成画面。';parts.monitor.connection=parts.overlay.connection;parts.monitor.evidence=parts.overlay.evidence;
parts.gray.description='Gray8 是图像预处理链的输入格式。当前由 PS 解码 MJPEG 得到；目标由硬件或低开销采集解码路径提供。';
parts.roi.connection='Gray8 → ROI → 阈值 → 可选形态学 → RLE → PS 区域分析。';parts.roi.evidence='保留核心流水线；前景像素面积不是目标数量。';
parts.tracking.description='依据 RLE 相邻行游程构建连通区域、提取特征并关联目标；每个 ID 首次从 x<320 到 x≥320 时加一，后续帧通过 counted 标志去重。';parts.tracking.connection='RLE 区域 → 特征 → 轨迹 / ID → 越线去重 → 计数与目标元数据 → PL Overlay；另供 Web 监控。';
export const stages=[
 ['采集解码','卸载目标','当前 USB/MJPEG → PS 软件解码 Gray8；目标为硬件 / 低开销采集解码，具体接口由相机队友确定，尚未验收硬解码。','capture'],
 ['Gray8 / ROI','PL 像素链','640×400 Gray8，每帧 256,000 字节；当前基线通过 MM2S 进入 PL，先进行格式适配与 ROI。','roi'],
 ['阈值 / 3×3','可选形态学','PL 阈值化与可选腐蚀 / 膨胀持续处理前景；网页滑块仅控制软件教学模型。','morph'],
 ['RLE','逐行游程','将每行连续前景编码为起止坐标；当前基线经 S2MM 交给 PS，网页实际使用游程连通域。','rle'],
 ['PS 决策','ID / 去重','PS 执行 RLE 连通域、特征提取、跨帧跟踪与 x=320 越线去重，输出计数和目标位置元数据。','tracking'],
 ['PL 合成','正在集成','独立图像视频流与 PS 元数据进入 PL Overlay。axis_gray_overlay / B1a / P12 已推进；B2 尚未通过板端验收。','overlay'],
 ['HDMI / Web','双通道','PL 合成 → VDMA / HDMI 为目标主显示路径；Web 为独立辅助监控。当前 P12-R4 仍为 DashboardComposer → VideoPump / VDMA → HDMI。','web']
];
export const evidenceHTML=`<div class="eyebrow">STATUS / 2026-11-02</div><h2>基线、集成与目标</h2><p>本页是教学仿真，没有连接硬件。30 FPS 是仿真时间步，WEBGL FPS 是浏览器渲染速度，均不代表实板性能。</p><table><tr><th>状态</th><th>范围与依据</th></tr><tr><td>实际基线 P12-R4</td><td>项目方本次提供：处理约 14.27 FPS，显示约 13.58 FPS，ARM CPU 约 93%。USB/MJPEG 由 PS 软件解码；PL 预处理 / RLE；PS 原生 RLE 连通域、跟踪计数；DashboardComposer → VideoPump / VDMA → HDMI。</td></tr><tr><td>正在集成</td><td>axis_gray_overlay、B1a 与显示优化 P12 已推进，继续 PL 视频合成与 Overlay 集成。上述基线数据不能证明 B2 验收。</td></tr><tr><td>下一阶段目标</td><td>相机队友推进硬件 / 低开销采集解码，具体接口依其硬件方案；B2 继续灰度视频层、目标框 / 计数信息叠加与 PL 合成，卸载 ARM 完整 1280×720 看板逐帧绘制。两项均未声明板端验收。</td></tr><tr><td>网页执行范围</td><td>640×400 合成 Gray8、阈值 / 形态学、逐行 RLE、游程连通域、简化孔洞辅助分离、跟踪与越线去重；3D 硬件和 HDMI 画面是教学可视化，不执行 Verilog 或板端原生代码。</td></tr></table><p>本地仓库当前可见 PROJECT_INDEX 与历史验证记录较旧；本次新路线与 P12-R4 数据来源为项目方 2026-11-02 指示。保留历史记录，不修改其验收结论。硬件采集解码、B2 和未来性能目标不标为已实现。</p>`;

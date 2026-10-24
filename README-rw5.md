# 澄序课程表 · REDMI Watch 5 专版

本目录是 `clartime-velaapp`（原版，面向小米手环 9 Pro 336×480）的 **REDMI Watch 5 专用适配版**。

| 项 | 原版 | 本专版 |
|---|---|---|
| 目标设备 | 小米手环 9 Pro（336×480） | **REDMI Watch 5（432×514）** |
| `config.designWidth` | 336 | **432** |
| 设计画布 | 336×480 | **432×514** |
| 页面基准高度 | 480px | **514px** |
| 内容宽度 | 312 / 318 / 324px | **408px** |
| 版本号 | 0.4.1 / 2 | **0.4.1-rw5 / 3** |

---

## 1. 原版为什么会"超出屏幕"

Vela 的 `px` 是**按屏宽等比缩放**的：`实际物理px = 设计px × (屏宽 / designWidth)`。

| | 屏宽 | 缩放 | 设计画布（设计 px） |
|---|---|---|---|
| 手环 9 Pro，designWidth=336 | 336 | 1.0 | 336 × 480 |
| RW5，designWidth=336 | 432 | 1.2857 | 336 × **400**（514 / 1.2857） |

同一套 480 高的页面，在 RW5 上只有 **400 设计 px** 的可用高度 → **底部溢出 80 设计 px（≈103 物理 px，占屏高 20%）**，同时字号被放大 1.2857 倍（物理尺寸比手环大约 33%）。这就是"UI 超出屏幕"的根因。

## 2. 本专版的解法

**把 `designWidth` 改成 432**，让缩放比回到 1：

- 画布 = **432 × 514 设计 px**，正好等于 RW5 的物理分辨率，1 设计 px = 1 物理 px = 0.5dp；
- 所有字号、圆角、间距的**数值保持不变**，因此物理尺寸与 9 Pro 版本基本一致（DPR 2.1 vs 2.0，约 5% 差异）；
- 只把**容器宽度**从 336 系列改成 432 / 408 系列，把**页面高度**从 480 改成 514。

> 为什么不用「保留 336 + 压缩内容到 400 高」：那样虽然不溢出，但字会整体大 33%，且垂直空间反而更少，属于最差组合。
> 为什么不用 `dp`：本版只需要 px 一次性算清即可；`dp` 需要 `minAPILevel 3`，且要逐条重写全部字号。

## 3. 版式栅格（本专版约定）

| 元素 | 尺寸 |
|---|---|
| 屏幕 / 画布 | 432 × 514 |
| 顶部/底部导航条 | 432 × 56（`nav-bg.png` 拉伸到 432×56） |
| 内容区宽度 | 408（左右各留 12） |
| 通用按钮 | 408 × 112，圆角 24 |
| 卡片圆角 | 24 / 30 / 36（沿用设计稿） |
| 首页课程卡 | 400 × 260，距底 34（与背景图的形体对齐） |
| 首页信息卡组 | 380 宽（时分/日期 188，周次 110，星期 74，秒 58，剩余 126） |
| 首页"下一节"卡 | 376 × 116 |
| 列表卡（全部课程 / 调课） | 408 × 177 |
| 主题预览图 | 240 × 344（原图 204×292 放大） |

## 4. 逐页改动

| 文件 | 改动 |
|---|---|
| `src/manifest.json` | `designWidth` 336→432、`versionName` 0.4.1-rw5、`versionCode` 3 |
| `src/common/style/component.css` | 导航 432×56、`background-size` 拉伸、通用按钮 408、新增引导页舞台样式 |
| `src/pages/entries/Horizon/Horizon.ux` | 内容/背景 514 高、首页 4 组信息卡加宽（170/100/64/56/110/170）、课程卡 408、下一节卡 384、跑马灯宽度、更多页按钮 408 |
| `src/pages/entries/Nucleus/Nucleus.ux` | 同上 + 聚焦版两张卡片 192×152、文字宽度 340/380/156/142 |
| `src/pages/AllCourses/AllCourses.ux` | 列表 432×514、课程卡 408 |
| `src/pages/CourseChange/ClassChange/ClassChange.ux` | 列表 408×426、各步骤卡片 408、结果页 408×426 |
| `src/pages/CourseChange/DayChange/DayChange.ux` | 列表 408×415（514-56-11-32）、卡片 408、结果页 408×426 |
| `src/pages/Settings/Settings.ux`、`dynamicEffects`、`dataInterconnect` | 内容区 432×514；数据同步页图标/文案垂直居中重排 |
| `src/pages/Settings/theme/theme.ux` | 横向分页单位 336→432、指示器 168/84、预览图 240×344、`scrollBy`→`scrollTo`（修掉多次进入时向右漂移） |
| `src/pages/about/about.ux`、`details`、`afd`、`EGG` | 内容区 432×514、文本卡 408、顶部 banner 408×262、导航底图 432×56 |
| `src/pages/entries/guide/*`（10 页） | 全部改为 360×514 居中舞台 + ambient 填充 + 热区按 1.071 换算，见下节 |

## 5. 引导页（位图页）的处理

引导插图是 336×480 整屏位图，**不能 `cover`**（会裁掉上下 17%，把底部"继续"按钮和文字切掉），也不适合 `fill`（横向拉伸 28.6%，中文字形会变宽）。本专版的做法：

```
.stack.guide-stage（360 × 514，水平居中）
├─ image.guide-ambient  432×514，left:-36，object-fit:cover，opacity .4   ← 填满两侧 36px
└─ image.guide-img      360×514（336×480 等比 ×1.0708）                  ← 内容不裁不拉
   └─ 透明热区 div（尺寸 = 原尺寸 × 1.0708）
```

例：原来 `324×80 / bottom:6` 的"继续"热区 → `347×86 / bottom:6`；`top:175 height:305` → `top:187 height:327`。

## 6. 尺寸换算速查

`新值 = 原值 × 432/336 ≈ 原值 × 1.286`（仅用于**横向容器**；字号/圆角/间距**不换算**，保持数值即可）

| 原值 | 本专版 |
|---|---|
| 336（全宽） | 432 |
| 324 / 318 / 312（卡片） | 408 |
| 302 / 300 / 288（内层卡片） | 384 / 396 / 384 |
| 480（页高） | 514 |
| 386（可滚动列表高） | 415 / 426（按上下文） |

## 7. 构建与验证

```bash
npm install
npm run start     # aiot server --watch --open-nuttx，启动后选择 REDMI Watch 5 模拟器
npm run build
npm run release   # --enable-jsc --enable-protobuf --enable-image-png8 --drop-console
```

> 本环境没有 `node_modules`（离线），**未执行真实构建与模拟器渲染**；以下为真机/模拟器验收清单。

验收清单：

1. 25 个路由逐页检查**底部是否还有裁切**（重点：全部课程、调课 4 步、调休 2 步、主题横向翻页）；
2. 首页上下两屏的 scroll-snap 是否仍然吸附在 0 / 514；
3. 引导 10 页：图片不变形、按钮热区能点、两侧 36px 的 ambient 过渡是否自然（若不满意可把 `.guide-ambient` 的 `opacity` 调到 0，退化为纯黑边）；
4. 首页"更多"页三个按钮是否完整显示（内容高 466 < 514）；
5. 主题页左右翻页后指示条是否在 84px 处（第 2 页），反复进出不再漂移。

## 8. 调试模式（默认关闭，便于装机自测时才打开）

**当前状态：全部关闭**（`src/common/config.js` 里三个开关都是 `false`），应用走正常流程：首次安装 → 10 页引导 → 手机端通过 `system.interconnect` 推课程数据。

为了不装手机端传数据的插件、也不用走完 10 页引导就能在模拟器里看界面，可以临时打开：

`src/common/config.js`

```js
module.exports = {
  DEBUG_SKIP_GUIDE: false,    // true：跳过 10 页引导，直接进主题首页
  DEBUG_DATA_FALLBACK: false, // true：读不到 courseData.json 时回退到内置示例课表
  DEBUG_DEFAULT_THEME: "Horizon"
}
```

调试模式启动链路：

```
entries.ux onShow
└─ config.DEBUG_SKIP_GUIDE ? debugBoot()
   ├─ dataManage.debugEnsureData(默认主题)
   │  ├─ 无 userSetting.json → 写入 { themeName, guide.guide_state: "done" }
   │  └─ 无 courseData.json  → 写入工程内置 courseData.json（高二下示例课表）
   └─ 读 themeName → 直接 push pages/entries/Horizon 或 pages/entries/Nucleus
```

要点：

- **只补缺失文件，不覆盖已有数据** → 设置页切主题、后续写回的数据都能保留；
- `dataManage.getCourseData()` 增加兜底：本地课程文件读不到时直接返回工程内置数据，所以即使写文件失败也不会白屏；
- 切换主题：设置 → 主题选择（写入 `themeName` 后回到 entries，调试模式会按新主题进入）；
- 重新看引导：把 `DEBUG_SKIP_GUIDE` 改回 `false`，再在关于页把版本号连点 5 次 → 「清除数据」；
- 换示例课表：直接改 `src/common/data/courseData.json`（清一次数据或重装后生效）；
- **周次看起来很大是正常的**：示例课表 `basic.courseStart` 是 `250216`（2025-02-16），按当前日期推算会显示"第 53 周"之类的数字；想看到"第 1 周"就把 `courseStart` 改成最近一个周一的 `YYMMDD`（如 `260302`）；
- 调试改动只涉及 3 个文件：`src/common/config.js`（新增）、`src/common/utils/dataManage.js`、`src/pages/entries/entries.ux`；10 个引导页本身既没删也没改。

## 9. 真机/模拟器实测问题修复（R 角裁切、两个信息框宽度）

### 9.1 R 角裁切（两种主题都有）

按模拟器截图逐像素量了 RW5 的屏幕遮罩：屏幕 432×514，四角是**半径约 79px 的圆弧** —— `y=0` 这一行只有 `x 72~359` 可见，`x=0` 这一列只有 `y 72~442` 可见。

原来的导航文字是 `left/right: 16px; top: 7px`，正好压在圆弧里：

| 位置 | y=22 处屏幕可见边界 | 原文字位置 | 结果 |
|---|---|---|---|
| 标题"课程表" | x ≥ 24.3 | left 16 | 左边一角被切 |
| 时间"19:48" | x ≤ 407.7 | right 16（右边缘 416） | 右边一角被切 |

修法（`common/style/component.css`，全站所有页面统一生效）：

| 元素 | 原值 | 现值 |
|---|---|---|
| `.component-nav-title-text` | left 16 / top 7 | **left 30 / top 22** |
| `.component-nav-title-time` | right 16 / top 7 | **right 30 / top 22** |
| `.component-nav-backGroup` | left 16 / top 7（无 position） | **absolute, left 32 / top 14** |
| `.component-nav-backButton` | height 42 | **height 34** |
| `.component-nav-title-text-backb` | left 26 | **left 42 / top 22** |

### 9.2 紧凑主题"上小下大"、背景小一圈

原 336 设计稿里信息卡组是 292 宽（144+4+144），课程卡是 312 宽，**刻意差 20px** 做主次区分。上一版适配时信息卡只放大到 344、课程卡放到 408，差 64px，看起来就"上小下大"；而且 408 宽（左右各 12）比背景图（336×480 拉伸后画出的形体）还宽一圈，所以显得"背景小了一圈"。

修法：两组都按 1.286 的比例放大，并保留 20px 的主次差：

| 元素 | 上一版 | 现在 |
|---|---|---|
| 信息卡组总宽 | 344（44..388） | **380（26..406）** |
| 时分卡 / 日期卡 | 170 / 170 | **188 / 188** |
| 周次卡 / 星期卡 | 100 / 64 | **110 / 74** |
| 秒卡 / 剩余卡 | 56 / 110 | **58 / 126** |
| 课程卡 | 408 × 260，bottom 12 | **400 × 260，bottom 34** |
| 卡内"下一节"卡 | 384 | **376**（400 − 12 × 2） |
| 跑马灯文字宽 | 300 / 380 / 260 / 360 | **320 / 360 / 280 / 350** |
| "今日暂无课程"提示宽 | 396 | **380** |

### 9.3 聚焦主题底部两张卡被底部 R 角削角

原来 `left/right: 12px; bottom: 12px`：卡片左下角落在圆弧外侧（`y=502` 处可见区从 `x=37` 才开始），会被削掉一个角。

改成 **`left/right: 16px; bottom: 34px`**，两张卡各 192×152、中间间距 16：`16 + 192 + 16 + 192 + 16 = 432`，四个角都在安全区内。

### 9.4 其它对齐

- 调课/调休的列表与结果页高度 426 → **415**（底部留 11px，不贴屏底）；
- 已验证：标题框、时间框、信息卡组、课程卡、下一节卡、"更多"页三个按钮、聚焦主题两张卡、设置页按钮的**所有圆角采样点**都落在实测屏幕遮罩内。

### 9.5 预览图（先看效果再编译）

- `docs/preview-horizon.png`：紧凑主题（背景图按 `fill` 拉伸 + 新尺寸卡片 + 实测屏幕遮罩合成）
- `docs/preview-nucleus.png`：聚焦主题

这两张不是 Vela 渲染结果，而是按代码里的尺寸/位置画的示意图，用来确认"标题不被切、两个框宽度关系、底部卡片不出界"。

## 10. 第二轮实测修复（设置页标题、背景未铺满、倒计时不走）

### 10.1 二级页面左上角"设置"偏下 / 偏右

**原因**：上一轮把 `.component-nav-backGroup` 改成了 `position: absolute`，它随即变成**组内绝对定位子元素的包含块**。`.component-nav-title-text-backb` 仍然写着 `left: 42px; top: 22px`，于是实际落点变成 `(32+42, 14+22) = (74, 36)` —— 右移 32px、下沉 14px。

**修法**：组内偏移改成相对"组"来算 —— 组 `(32, 20)`，标题 `left: 20; top: 2` → 最终 **(52, 22)**，与不带返回键页面的标题、时间在同一条水平线上；返回键 34px 高，落在 20~54，中心 37 与标题中心 38 对齐。

```css
.component-nav-backGroup   { position: absolute; top: 20px; left: 32px; }
.component-nav-title-text-backb { position: absolute; left: 20px; top: 2px; } /* 绝对位置 = (52, 22) */
```

### 10.2 紧凑主题背景在实机上没铺满（模拟器正常）

**原因**：`.home-back` 用的是 `object-fit: fill`。Vela 真机**不支持 `fill`**（按 `contain` 行为渲染）：336×480 的图被等比缩到 360×514 居中，左右各空 36px → 看起来"背景小一圈 / 没铺满"。模拟器支持 `fill`，所以模拟器里正常。这也解释了上一轮"背景小了一圈"的观感。

**修法**：不再依赖 `object-fit`，**把拉伸烘焙进素材**：

| 素材 | 原来 | 现在 |
|---|---|---|
| `home_back_1/2/3.png` | 336×480 | **432×514**（横向 ×1.2857、纵向 ×1.0708，与 `fill` 完全一致） |
| `nav-bg.png` | 336×56 | **432×56**（`background-size` 在真机上同样不保险，一并烘焙） |

素材与容器 1:1 之后，真机把它当 `fill` / `contain` / 直接按原尺寸画，结果都一样。代价是体积：`home_back_*` 每张从 ~90KB 变 ~130–137KB。

> 其余带 `object-fit` 的地方已经安全：图标是 60×60 对 60×60；引导页 336×480 对 360×514 是**同比例**（1.071），`contain`/`fill` 结果一致；`about_bg` 用的显式 408×262 也与原图同比例。

### 10.3 倒计时分钟不减少

**原因**：`remain` 只在 `courseRelatedUpadate()` 里算一次，而它只在"当前节索引变化"时才被调用 → 一节课内 `218'` 一直不变，跨节才跳。

**修法**：在每秒的定时器里重算 `this.remain = this.getRemainingTime()`（纯减法，不读文件）；同时修掉当天无课（`courseSchedule === -1`）时索引是 `NaN`、`NaN != indexNow` 恒为真导致**每秒整表刷新**的隐患。

```js
this.timer = this.$app.$def.timeUpdate.updateTimePersecond((timeData) => {
  this.time = timeData.time
  this.seconds = timeData.seconds
  if (this.courseSchedule === -1) {
    this.remain = "---"
  } else {
    this.remain = this.getRemainingTime()          // 每秒重算
    if (this.getCurrentCourseIndex() != this.indexNow) this.courseRelatedUpadate()
  }
})
```

紧凑 / 聚焦两个主题都改了。

### 10.4 预览

- `docs/preview-settings.png`：二级页面（返回键 + 标题 + 时间三者对齐）
- `docs/preview-horizon.png`：紧凑主题（用**烘焙后**的背景素材合成）

## 11. 第三轮：顶部背景色块收窄到与课程卡同宽

**现象**：背景铺满之后，顶部背景色块是 **432 宽 × 210 高**，而课程卡是 **400 宽**，两者左右各差 16px，视觉上"上面的胶囊比下面的大"。

**改法**：三张背景素材的顶部色块统一**蒙版裁到 `400 × 210`、圆角 36（x 16..416）**，与课程卡完全同宽、同圆角；蒙版外的区域填黑。色块自身的像素不变，只裁掉左右各 16px。

| 素材 | 改动 |
|---|---|
| `home_back_1.png`（无课） | 顶部色块 432×210 → **400×210, r36** |
| `home_back_2.png`（课间） | 同上 |
| `home_back_3.png`（上课） | 同上 |

改后首页的三层宽度关系：背景色块 400 = 课程卡 400 ⊃ 信息卡组 380，右上角的 `10/24`、`218'` 等仍然完整。

效果见 `docs/preview-horizon.png`（已更新为改后版本）。

## 12. 第四轮：底部光晕加高对齐 / 去掉"当前" / 整体下移

紧凑主题（Horizon）的三处调整：

| 项 | 改前 | 改后 |
|---|---|---|
| 顶部背景色块 | x 16..416，y 0..210 | x 16..416，**y 24..220**（400×196，四角 r36） |
| 底部背景光晕 | 全宽 432，y 385..514 | **x 16..416，y 228..514**（上边界与课程卡重合、渐变在卡片上边界淡出；**上圆下方**） |
| 导航标题 / 信息卡组 | y 22 / y 56..172 | **y 46 / y 80..196**（整体 +24，与色块同一基线） |
| 课程卡 | 220..480（400×260） | **228..480（400×252）** |
| 课程卡的"当前"标签 | 有 | **删除** |

> 顶部间距从 16 加到 24 的原因：色块 R36 的左上角与屏幕 R79 的圆角只相差约 5px，看起来像被切掉一角；下移后最小间隙约 10px，同时卡片上边界随之下移 8px（高度 260 → 252）以维持 8px 的缝隙。

**第二轮微调（光晕抬高 + 圆角打磨）**

- 光晕上边界从 302 抬到 **228（= 课程卡上边界）**，`385..514` 拉伸到 `228..514`，渐变正好在卡片上边界处淡出到黑。
- **圆角不再"凹凸不平"**：上一版用 1/4 分辨率蒙版放大来做羽化，圆角会被量化成折线/波浪；现在改成**逐像素解析距离场（SDF）**求 alpha —— 圆角是数学上的精确圆弧，1px 抗锯齿，10px 羽化，不会再出现台阶。
- 光晕形状从"四角圆角"改成**上圆下方**：底部的两个角交给屏幕 R79 自己裁，避免"光晕的 r36 角 + 屏幕的 r79 角"叠在一起形成双重圆弧（这正是下边四角看着毛糙的主因）。
- 顶部色块的四个角保持 r36 + 1px 抗锯齿。

实现要点：

- **背景素材重做**（`home_back_1/2/3.png`）：从原始 336×480 素材重采样到 432×514 后，
  - 顶部色块整体 **+24px**，再蒙版到 `400×196 / r36`；
  - 底部光晕把 `385..514` 拉伸到 `228..514`，形状为 `400×286`、**上圆下方**（上部 r36，底部方角交给屏幕裁切），边缘用**解析 SDF**（1px 抗锯齿 + 10px 羽化）逐像素求 alpha，圆角是精确圆弧。
- **模板**：`Horizon.ux` 的 UI 层最前面加了一个 `height: 24px` 占位，标题与信息卡随之整体下移；课程卡高度 260 → 252（上边界 220 → 228）；同时删掉 `<text class="...nowCourseContent-text1">当前</text>`，课程名与时间成为卡片主体。

现在的竖向结构：色块 24..220（400 宽）→ 课程卡 228..480（400 宽）→ 光晕 228..514（400 宽，上边界与卡片上边界重合，整块压在卡片背后，只露出底部 34px 与卡片下半部分的暖色）。

> 聚焦主题（Nucleus）本次未改动。

## 13. 打包与体积

### 13.1 三个打包命令

| 命令 | 内容 | 体积（实测） | 备注 |
|---|---|---|---|
| `npm run build` | 纯 debug，不压缩 | 1.86 MB（原始素材时） | 仅调试用 |
| `npm run pack` | `aiot build --enable-image-png8 --drop-console=true` | **0.68 MB** | 中文路径下也能跑 |
| `npm run release` | `aiot release --enable-jsc --enable-protobuf --enable-image-png8` | **0.69 MB** | 要求**纯英文路径**（见 13.3） |

> 体积从 1.86 MB 降到 0.69 MB，主要来自两处：PNG8 转换 + 引导插图降规格（见 13.2）。

### 13.2 引导插图降规格（11 张 → 1309 KB 变 455 KB）

引导页是整屏静态插图，运行时被缩放到 `360×514` 显示。原素材 `336×480 / 32bpp`，单张 96–152 KB，是发包体积的大头。处理方式：

| 项 | 改前 | 改后 |
|---|---|---|
| 分辨率 | 336 × 480 | **294 × 420**（同比例 0.7，显示时放大 1.22×） |
| 颜色 | 32bpp（~7000 色） | **128 色调色板 + Sierra 抖动** |
| 单张体积 | 96–152 KB | **34–48 KB** |
| 11 张合计 | 1309 KB | **455 KB（−65%）** |

命令（对每张图执行一次）：

```bash
ffmpeg -y -i guide_1.png \
  -vf "scale=294:420:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" \
  -compression_level 100 -update 1 guide_1.png
```

质量取舍：按 `360×514` 显示尺寸对比过三档（原图 / 294×420·128 色 / 252×360·96 色），中间这档大标题与正文仍然清晰，小字略有柔化；最后一档明显发糊，所以选了中间档。原始 `336×480` 素材在兄弟工程 `clartime-velaapp/src/common/assets/` 里完好，需要回退直接拷回即可。

### 13.3 ⚠️ jsc 编译器不支持中文路径

`npm run release` 在本工程原路径 `M:\Program\课表\...` 下会失败：

```
ERROR: afterCompile: Generate jsc bytecode error:
  win32_aiotjsc.exe -ms "M:\Program\课表\.temp_...\build"
```

单独验证过 `aiotjsc.exe`：ASCII 路径正常（exit 0），换成含中文的目录直接 `read_dir: opendir failed: 2`。
所以 **release 包必须在纯英文路径下构建**，两种做法：

1. 把工程挪到英文目录（如 `M:\Program\clartime`）再 `npm run release`；
2. 或者在别处建一个英文路径的副本（`src` + `package.json` + `sign` + junction 到 `node_modules`）构建，再把 `dist/*.rpk` 拷回来 —— 本次的 0.89 MB release 包就是这么出出来的。

不想挪目录就用 `npm run pack`：跳过 jsc，体积几乎一样（0.88 MB），只是启动时省掉字节码、首帧会略慢一点。

### 13.4 附带的清理

- 删除了未被任何页面引用的 `common/assets/about_logo.png`（7.9 KB）；
- `config.js` 的调试开关全部关闭，`getCourseData()` 的"内置数据兜底"也改为只在 `DEBUG_DATA_FALLBACK = true` 时生效 —— 正式包里读不到课程数据就是读不到，不会悄悄显示示例课表。

## 14. 未做 / 已知限制

- **只适配 RW5**：本版不再兼容手环 9 Pro（其画布会变成 432 设计 px 宽，超出 336 屏宽）。若要双端同包，应改为运行时 `device.getInfo()` 判断 + 两套布局，或全量改用 `dp`。
- **原版逻辑 bug 未修**（与本次 UI 适配无关）：
  - 调课/调休只做界面流转，结果没有写回 `courseData.json`，且 `changeRseult` 从未赋值（结果页恒为"调整失败"）；
  - `entries.ux` 的 `guide_step` 续传映射把 4/5/6/7 都指向 `guide/5`；
  - `courseDataParse.getCourseSchedule` 无课时返回数字 `-1`，而调用方当数组用；
  - `getWeekNumber` 与 `getCourseSchedule` 的"开学日→周一"算法不一致（周一开学时差 8 天）；
  - `guide1/guide8` 对无返回值的 `changeGuideSetting` 调 `.then()`；
  - `i18n` 三个文件是占位数据，界面文案仍为硬编码中文。
- `settings` 页没有"动态效果"入口，`dynamicEffects` 仍是空壳页。

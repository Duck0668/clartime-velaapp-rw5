/**
 * 调试开关
 *
 * 正式发布时全部保持 false：
 * - 引导页正常流程（首次安装 → 10 页引导 → 手机端推课程数据）
 * - 不写入任何"内置课表"，本地没有数据就按原逻辑报错/等待推送
 *
 * 需要自测界面时，把 DEBUG_SKIP_GUIDE 改成 true 再重装即可：
 * 启动会跳过引导、直接进主题首页，并在缺少本地数据时写入内置示例课表。
 */
module.exports = {
  // true：跳过 10 页引导，直接进入主题首页（发布保持 false）
  DEBUG_SKIP_GUIDE: false,

  // true：本地读不到 courseData.json 时回退到工程内置示例数据（发布保持 false）
  DEBUG_DATA_FALLBACK: false,

  // 跳过引导时写入的默认主题："Horizon"（紧凑）/ "Nucleus"（聚焦）
  DEBUG_DEFAULT_THEME: "Horizon"
}

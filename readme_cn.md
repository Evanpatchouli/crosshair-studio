# Crosshair Studio

**Crosshair Studio** 是用 **Tauri** 开发的可视化准星引擎。它旨在更轻松地**自定义**十字准线以取代游戏中的默认十字准线。

## 最新

- **版本**: 1.1.0
  - 修复: 当其他应用程序注册快捷键时无法结束初始化
  - 新功能: 热监听准星目录
  - 变更: 全新预设未知准星
  - 变更: 全新 Logo

## 安装

- [windows msi 安装包]: 适用于 Windows 10 及更高版本平台的 64 位 msi 安装程序压缩包。
- [windows exe 安装包]: 适用于 Windows 10 及更高版本平台的 64 位 exe 安装程序压缩包。
- [windows 免安装]: 适用于 Windows 10 及更高版本平台的 64 位可执行文件压缩包，无需安装。

[windows msi安装包]: https://github.com/Evanpatchouli/crosshair-studio/releases/download/v1.1.0/Crosshair.Studio_1.1.0_x64_windows_10_msi.zip
[windows exe安装包]: https://github.com/Evanpatchouli/crosshair-studio/releases/download/v1.1.0/Crosshair.Studio_1.1.0_x64_windows_10_setup.zip
[windows 绿色免安装]: https://github.com/Evanpatchouli/crosshair-studio/releases/download/v1.1.0/Crosshair.Studio_1.1.0_x64_windows_10_portable.zip

## 使用

双击打开程序，即可在桌面上显示一个透明的准星。程序默认内置了 7 种 `+` 符号作为准星图案，可自行切换。

程序启动后，默认将准星置于顶层，并默认鼠标穿透，即准星图片不会遮挡其他窗口的点击事件。

- 准星目录：程序已安装目录下的 `crosshair` 文件夹为准星目录，可自行添加透明背景的准星图片（`*.svg`, `*.png`. `*.jpg`）
- 系统托盘：程序运行后会在系统托盘中显示图标，右键单击图标打开菜单：
  - 固定置顶：固定准星在桌面最上层
  - 取消置顶：取消准星在桌面最上层
  - 隐藏应用（显示应用）：隐藏或显示应用和窗口
  - 鼠标穿透（开/关）：准星是否遮挡其他窗口的点击事件
  - 切换准星：在准星目录内按顺序切换准星
  - 切换默认准星：切换到设置的默认准星（未设置时，默认为第一个准星）
  - 设为默认准星：设置当前应用的准星为默认准星
  - 控制台：打开控制台，进行更详细的应用配置
  - 重启：重启应用，用于刷新准星列表
  - 退出：退出应用
- 全局快捷键：（系统级快捷键）
  - `Ctrl + Alt + Q`：切换准星
  - `Ctrl + Alt + D`：切换默认准星
  - `Ctrl + Alt + S`：设为默认准星
  - `Ctrl + Alt + P`：置顶 开/关
  - `Ctrl + Alt + T`：穿透 开/关
  - `Ctrl + Alt + C`：打开控制台 （列入 V2 计划）
  - `Ctrl + Alt + R`：重启应用
  - `Ctrl + Alt + E`：退出应用
- 应用快捷键：（应用级快捷键）
  - `Q`：切换准星

## 卸载

Crosshair Studio 软件本体及其资源文件均位于安装目录下，仅有大小约 1kb 的数据文件存储在用户目录下的 `AppData\Roaming\com.crosshair-studio.app` 文件夹中。
如果需要完全卸载 Crosshair Studio，只需执行卸载（或删除软件安装目录）并删除该数据文件夹即可。

## 计划

- [x] 快捷键全支持
- [ ] 控制台开放
- [ ] 多语言支持
- [ ] 外置配置文件
- [ ] 跨平台支持

## 贡献

欢迎提交 PR 和问题单，一起改进 Crosshair Studio。

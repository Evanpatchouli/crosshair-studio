# Crosshair Studio

**Crosshair Studio** is a visual interface for the Crosshair symbolic execution engine powered by **Tauri**. It is designed to make it easier to **customize** Crosshair to replcae the default crosshairs in games.

## Installation

- [Windows msi Installer]: An executable msi installer for 64-bit Windows 10 and later platforms.
- [Windows exe Installer]: An executable exe installer for 64-bit Windows 10 and later platforms.
- [Windows Portable]: A compressed executable file for 64-bit Windows 10 and later platforms, no installation required.

[Windows msi Installer]: https://github.com/user-attachments/files/16739433/Crosshair.Studio_0.0.1_x64_windows_10_msi.zip
[Windows exe Installer]: https://github.com/user-attachments/files/16739434/Crosshair.Studio_0.0.1_x64_windows_10_setup.zip
[Windows Portable]: https://github.com/user-attachments/files/16739437/Crosshair.Studio_0.0.1_x64_windows_10_portable.zip

## Usage

Double-click to open the program, and a transparent crosshair will be displayed on the desktop. The program comes with 7 `+` symbols as the default crosshair pattern, which can be switched at will.

After the program is started, the crosshair is placed on the top layer by default, and the mouse is penetrated by default, that is, the crosshair image will not block the click events of other windows.

- Crosshair Directory: The `crosshair` folder under the installed directory of the program is the crosshair directory, where you can add transparent background crosshair images (`*.svg`, `*.png`, `*.jpg`) by yourself.
- System Tray: After the program is running, an icon will be displayed in the system tray. Right-click the icon to open the menu:
  - 固定置顶: Fix the crosshair on the top layer of the desktop
  - 取消置顶: Unpin the crosshair from the top layer of the desktop
  - 显示应用: Show the app and crosshair
  - 隐藏应用: Hide the app and crosshair
  - 鼠标穿透 On: The crosshair image will not block the click events of other windows
  - 鼠标穿透 Off: The crosshair image will block the click events of other windows
  - 换准星: Switch crosshair in order in the crosshair directory
  - 切换默认准星: Switch to the set default crosshair (default to the first crosshair when not set)
  - 设为默认准星: Set the crosshair of the current app as the default crosshair
  - 控制台: Open the console for more detailed app configuration
  - 重启: Restart the app to refresh the crosshair list
  - 退出: Exit the app
- Global Hotkeys: (System-level hotkeys)
  - `Ctrl + Alt + Q`: Switch crosshair
  - `Ctrl + Alt + W`: Switch default crosshair (not supported yet)
  - `Ctrl + Alt + S`: Set as default crosshair (not supported yet)
  - `Ctrl + Alt + P`: Pin to Top On/Off (not supported yet)
  - `Ctrl + Alt + T`: Mouse Penetration On/Off (not supported yet)
  - `Ctrl + Alt + C`: Open console (not supported yet)
  - `Ctrl + Alt + R`: Restart the app
  - `Ctrl + Alt + E`: Exit the app (not supported yet)
- App Hotkeys: (App-level hotkeys)
  - `Q`: Switch crosshair

## Plan

- [ ] Full hotkey support
- [ ] Enable console
- [ ] Multi-language support
- [ ] External configuration file
- [ ] Cross-platform support

## Contribution

Welcome to submit PRs and issues to improve Crosshair Studio together.

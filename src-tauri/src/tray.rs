use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

pub fn tray() -> SystemTray {
    let pin: CustomMenuItem = CustomMenuItem::new("pin".to_string(), "固定置顶");
    let unpin: CustomMenuItem = CustomMenuItem::new("unpin".to_string(), "取消置顶");
    let show_or_hide: CustomMenuItem = CustomMenuItem::new("show_or_hide".to_string(), "隐藏应用");
    let toggle_ignore_cursor_event: CustomMenuItem =
        CustomMenuItem::new("toggle_ignore_cursor_event".to_string(), "鼠标穿透 (开/关)");
    let switch_cross: CustomMenuItem = CustomMenuItem::new("switch_cross".to_string(), "切换准星");
    let switch_to_default_cross: CustomMenuItem =
        CustomMenuItem::new("switch_to_default_cross".to_string(), "切换默认准星");
    let set_as_default_cross: CustomMenuItem =
        CustomMenuItem::new("set_as_default_cross".to_string(), "设为默认准星");
    let monitor: CustomMenuItem = CustomMenuItem::new("monitor".to_string(), "控制台");
    let reload: CustomMenuItem = CustomMenuItem::new("reload".to_string(), "重启");
    let quit: CustomMenuItem = CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(pin)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(unpin)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show_or_hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(toggle_ignore_cursor_event)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(switch_cross)
        .add_item(switch_to_default_cross)
        .add_item(set_as_default_cross)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(monitor)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(reload)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    return system_tray;
}

#[doc = "系统托盘处理事件"]
pub fn tray_handler(app: &AppHandle, event: SystemTrayEvent) {
    // 获取应用窗口
    let window = app.get_window("main").unwrap();
    // 匹配点击事件
    match event {
        // 左键点击
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a left click");
        }
        // 右键点击
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click");
        }
        // 双击，macOS / Linux 不支持
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
        }
        // 根据菜单 id 进行事件匹配 let item_handle = app.tray_handle().get_item(&id);
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let item_handle = app.tray_handle().get_item(&id);
            match id.as_str() {
                "pin" => {
                    window.set_always_on_top(true).unwrap();
                }
                "unpin" => {
                    window.set_always_on_top(false).unwrap();
                }
                "show_or_hide" => {
                    let visible = window.is_visible().unwrap();
                    if visible {
                        window.hide().unwrap();
                        item_handle.set_title("显示应用").unwrap();
                    } else {
                        window.show().unwrap();
                        item_handle.set_title("隐藏应用").unwrap();
                    }
                }
                "toggle_ignore_cursor_event" => {
                    // let ignore_cursor_events: bool =
                    //     Store::get(&self, "ignoreCursorEvents").unwrap();
                    // item_handle.set_title(if ignore_cursor_events {
                    //     "鼠标穿透 (关)"
                    // } else {
                    //     "鼠标穿透 (开)"
                    // });
                    app.emit_to("main", "toggle_ignore_cursor_event", true)
                        .unwrap();
                }
                "switch_cross" => {
                    app.emit_to("main", "switch_cross", true).unwrap();
                }
                "switch_to_default_cross" => {
                    app.emit_to("main", "switch_to_default_cross", true)
                        .unwrap();
                }
                "set_as_default_cross" => {
                    app.emit_to("main", "set_as_default_cross", true).unwrap();
                }
                "monitor" => {
                    let monitor = app.get_window("monitor").unwrap();
                    monitor.show().unwrap();
                }
                "reload" => {
                    // app.emit_all("reload", true).unwrap();
                    app.restart();
                }
                "quit" => {
                    window.hide().unwrap();
                    std::process::exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

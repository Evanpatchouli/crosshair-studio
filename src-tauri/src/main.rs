// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod handler;
mod setup;
mod tray;
mod util;
use tray::{tray, tray_handler};
use util::logger;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tokio::main]
fn main() {
    let system_tray = tray();
    tauri::Builder::default()
        .setup(|_app| {
            logger::info("Launching Crosshair Studio...");
            setup::main();
            logger::info("Crosshair Studio Launched.");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            handler::get_images_from_directory,
            handler::read_image,
            handler::get_appdir,
            handler::is_dev,
            handler::log
        ])
        .system_tray(system_tray)
        .on_system_tray_event(tray_handler)
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs_watch::init())
        .run(tauri::generate_context!())
        .expect("error while running Crosshair Studio application");
}

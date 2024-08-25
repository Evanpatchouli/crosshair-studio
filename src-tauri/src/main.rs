// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod handler;
mod tray;
use tray::{tray, tray_handler};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let system_tray = tray();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            handler::get_images_from_directory,
            handler::read_image,
            handler::get_appdir,
            handler::is_dev,
        ])
        .system_tray(system_tray)
        .on_system_tray_event(tray_handler)
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::path::Path;
use std::time::UNIX_EPOCH;
use std::{env, fs};

use crate::util::logger;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageInfo {
    pub path: String,
    pub size: u64,
    pub modified: u64,
}

#[tauri::command]
pub fn get_images_from_directory(directory: &Path, extensions: Vec<String>) -> Vec<ImageInfo> {
    let mut images = Vec::new();
    if directory.is_dir() {
        for entry in fs::read_dir(directory).expect("Failed to read directory") {
            let entry = entry.expect("Failed to read directory entry");
            let path = entry.path();
            if path.is_file()
                && path.extension().map_or(false, |ext| {
                    let ext = ext.to_str().unwrap_or("").to_lowercase();
                    extensions.contains(&ext)
                })
            {
                let metadata = fs::metadata(&path).expect("Failed to read metadata");
                let modified = metadata
                    .modified()
                    .expect("Failed to get modification time")
                    .duration_since(UNIX_EPOCH)
                    .expect("Time went backwards")
                    .as_secs();
                images.push(ImageInfo {
                    path: path.to_string_lossy().into_owned(),
                    size: metadata.len(),
                    modified,
                });
            }
        }
    }
    images
}

#[tauri::command]
pub fn read_image(path: &str) -> Vec<u8> {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(std::ffi::OsStr::to_str)
        .unwrap_or("");
    // txt, url
    if ["txt", "url"].contains(&ext) {
        let mut file = fs::File::open(path).expect("Failed to open image link file");
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .expect("Failed to read image link file");
        contents.into_bytes()
    } else {
        let mut file = fs::File::open(path).expect("Failed to open image file");
        let mut contents = Vec::new();
        file.read_to_end(&mut contents)
            .expect("Failed to read image file");
        contents
    }
}

#[tauri::command]
pub fn delete_image(path: &str) -> Result<(), String> {
    fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_appdir() -> String {
    // app_dir().expect("Failed to get app directory").to_string_lossy().into_owned()
    env::current_dir()
        .expect("Failed to get app directory")
        .to_string_lossy()
        .into_owned()
}

#[tauri::command]
pub fn is_dev() -> bool {
    env::var("TAURI_DEV").is_ok()
}

#[tauri::command]
pub fn log(level: &str, msg: &str) {
    let log_message = logger::format_log_message(level, msg);
    println!("{}", log_message);
    logger::write_log(&log_message);
}

#[tauri::command]
pub fn open_directory_in_fs(path: &Path) -> bool {
    std::process::Command::new("explorer")
        .arg(path)
        .spawn()
        .expect("Failed to open directory in file system")
        .wait()
        .expect("Failed to wait for opening directory in file system")
        .success()
}

#[tauri::command]
pub fn get_locales() -> HashMap<String, String> {
    let locales_dir = env::current_dir()
        .expect("Failed to get app directory")
        .join("locales");
    // read locales_dir/metadata.json file and return it
    let metadata_path = locales_dir.join("metadata.json");
    // check if metadata.json exists
    if metadata_path.is_file() {
        let mut file = fs::File::open(metadata_path).expect("Failed to open locales metadata file");
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .expect("Failed to read locales metadata file");
        let result: Result<HashMap<String, String>, serde_json::Error> =
            serde_json::from_str(&contents);
        match result {
            Ok(metadata) => metadata,
            Err(e) => {
                logger::errorMsg(&format!("Failed to parse locales metadata: {:?}", &e));
                HashMap::new()
            }
        }
    } else {
        logger::errorMsg(&format!(
            "Locales metadata file not found: {:?}",
            metadata_path
        ));
        HashMap::new()
    }
}

#[tauri::command]
pub fn get_locale_messages(locale: &str) -> HashMap<String, String> {
    let locales_dir = env::current_dir()
        .expect("Failed to get app directory")
        .join("locales");
    // read locales_dir/<locale>.json file and return it
    let locale_path = locales_dir.join(format!("{}.json", locale));
    // check if <locale>.json exists
    if locale_path.is_file() {
        let mut file = fs::File::open(locale_path).expect("Failed to open locale file");
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .expect("Failed to read locale file");
        let result: Result<HashMap<String, String>, serde_json::Error> =
            serde_json::from_str(&contents);
        match result {
            Ok(messages) => messages,
            Err(e) => {
                logger::errorMsg(&format!("Failed to parse locale messages: {:?}", &e));
                HashMap::new()
            }
        }
    } else {
        logger::errorMsg(&format!("Locale file not found: {:?}", locale_path));
        HashMap::new()
    }
}

pub fn write_file(path: &str, content: &str) -> Result<(), String> {
    // Check if directory exists
    let path = Path::new(path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err(format!("Directory does not exist: {:?}", parent));
        }
    }
    //  Create file
    match std::fs::File::create(path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(content.as_bytes()) {
                return Err(format!("Failed to write to file: {}", e));
            }
        }
        Err(e) => {
            return Err(format!("Failed to create file: {}", e));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn create_text_crosshair(path: &str, content: &str) -> Result<(), String> {
    write_file(path, content)
}

#[tauri::command]
pub fn create_url_crosshair(path: &str, content: &str) -> Result<(), String> {
    write_file(path, content)
}

/// 获取配置文件路径。
/// 开发模式：与 crosshairs 同级（项目根目录 config.json）
/// 生产模式：与 crosshairs 同级（应用安装目录 config.json）
fn get_config_path() -> std::path::PathBuf {
    let mut app_dir = env::current_dir().expect("Failed to get app directory");
    if env::var("TAURI_DEV").is_ok() {
        // dev 模式 CWD 是 src-tauri/，需回退到项目根以与 crosshairs 对齐
        app_dir = app_dir
            .parent()
            .unwrap_or(&app_dir)
            .to_path_buf();
    }
    app_dir.join("config.json")
}

/// 默认配置 JSON 字符串
fn default_config_json() -> &'static str {
    r#"{
  "version": "1.0",
  "crosshair": {
    "width": 200,
    "height": 200,
    "lock_ratio": true,
    "canvas_size": 200,
    "canvas_shape": "rect",
    "enable_invert_filter": false
  },
  "behavior": {
    "ignore_cursor_events": true,
    "always_on_top": true,
    "crosshair_directory": "${APP_DIR}/crosshairs",
    "default_crosshair": ""
  },
  "hotkeys": {
    "switch_crosshair": ["CommandOrControl", "Alt", "Q"],
    "toggle_pinned": ["CommandOrControl", "Alt", "P"],
    "toggle_ignore_cursor_events": [],
    "switch_to_default_crosshair": ["CommandOrControl", "Alt", "D"],
    "set_current_crosshair_as_default": ["CommandOrControl", "Alt", "S"],
    "open_monitor": ["CommandOrControl", "Alt", "C"],
    "reload": ["CommandOrControl", "Alt", "R"],
    "exit": ["CommandOrControl", "Alt", "E"]
  },
  "online_crosshair": {
    "api_url": "",
    "request_method": "GET",
    "headers": []
  },
  "enable_system_notification": false
}"#
}

#[tauri::command]
pub fn load_config() -> Result<String, String> {
    let config_path = get_config_path();
    if !config_path.exists() {
        // 配置文件不存在时创建默认配置
        let default_json = default_config_json();
        match std::fs::File::create(&config_path) {
            Ok(mut file) => {
                if let Err(e) = file.write_all(default_json.as_bytes()) {
                    logger::errorMsg(&format!("Failed to write default config: {}", e));
                    return Err(format!("Failed to write default config: {}", e));
                }
            }
            Err(e) => {
                logger::errorMsg(&format!("Failed to create config file: {}", e));
                return Err(format!("Failed to create config file: {}", e));
            }
        }
        return Ok(default_json.to_string());
    }
    // 读取已有配置文件
    match std::fs::read_to_string(&config_path) {
        Ok(content) => Ok(content),
        Err(e) => {
            logger::errorMsg(&format!("Failed to read config file: {}", e));
            Err(format!("Failed to read config file: {}", e))
        }
    }
}

#[tauri::command]
pub fn save_config(json: &str) -> Result<(), String> {
    // 先验证 JSON 格式
    let _: serde_json::Value = match serde_json::from_str(json) {
        Ok(v) => v,
        Err(e) => {
            return Err(format!("Invalid JSON format: {}", e));
        }
    };
    let config_path = get_config_path();
    match std::fs::File::create(&config_path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(json.as_bytes()) {
                return Err(format!("Failed to write config file: {}", e));
            }
        }
        Err(e) => {
            return Err(format!("Failed to create config file: {}", e));
        }
    }
    Ok(())
}

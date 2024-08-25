// use tauri::api::path::app_dir;
use std::{env, fs};
use std::io::Read;
use std::path::Path;

#[tauri::command]
pub fn get_images_from_directory(directory: &Path) -> Vec<String> {
    let mut images = Vec::new();
    if directory.is_dir() {
        for entry in fs::read_dir(directory).expect("Failed to read directory") {
            let entry = entry.expect("Failed to read directory entry");
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "jpg" || ext == "png" || ext == "svg") {
                images.push(path.to_string_lossy().into_owned());
            }
        }
    }
    images
}

#[tauri::command]
pub fn read_image(path: &str) -> Vec<u8> {
    let mut file = fs::File::open(path).expect("Failed to open image file");
    let mut contents = Vec::new();
    file.read_to_end(&mut contents).expect("Failed to read image file");
    contents
}

#[tauri::command]
pub fn get_appdir() -> String {
    // app_dir().expect("Failed to get app directory").to_string_lossy().into_owned()
    env::current_dir().expect("Failed to get app directory").to_string_lossy().into_owned()
}

#[tauri::command]
pub fn is_dev() -> bool {
    env::var("TAURI_DEV").is_ok()
}
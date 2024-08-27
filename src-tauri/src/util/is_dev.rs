use std::env;

pub fn main() -> bool {
    env::var("TAURI_DEV").is_ok()
}

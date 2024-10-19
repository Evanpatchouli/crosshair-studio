use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Deserialize;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread;
use std::{env, fs, io};
use tauri::{App, Manager};

use crate::handler::get_images_from_directory;
use crate::util::{is_dev, logger};

fn create_directory_if_not_exists(path: &Path) -> Result<bool, io::Error> {
    if !path.exists() {
        logger::errorMsg(&format!(
            "Directory does not exists, going to create: {}",
            path.display()
        ));
        fs::create_dir_all(path)?;
        Ok(true)
    } else {
        Ok(false)
    }
}

pub fn watch_crosshairs(
    app: &tauri::AppHandle,
    directory: String,
    extensions: Vec<String>,
    immediate: bool,
) {
    let app_handle = app.clone();
    let crosshairs_dir_path = Arc::new(PathBuf::from(directory.clone()));

    if immediate {
        let images = get_images_from_directory(&crosshairs_dir_path, extensions.clone());
        app_handle
            .emit_all("crosshairs", images)
            .expect("Failed to emit crosshairs event");
    }

    let (tx, rx) = std::sync::mpsc::channel();
    let mut watcher = RecommendedWatcher::new(tx, Config::default()).unwrap();
    // 创建一个新线程来观察文档目录
    thread::spawn(move || {
        watcher
            .watch(&*crosshairs_dir_path, RecursiveMode::Recursive)
            .unwrap();

        for res in rx {
            match res {
                Ok(_e) => {
                    let images =
                        get_images_from_directory(&crosshairs_dir_path, extensions.clone());
                    app_handle
                        .emit_all("crosshairs", images)
                        .expect("Failed to emit crosshairs event");
                }
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });
}

#[derive(Deserialize, Debug)]
struct WatchCrosshairsOptions {
    directory: String,
    extensions: Vec<String>,
    immediate: bool,
}

#[doc = r#"setup (initializer) function"#]
pub fn main(app: &mut App) {
    let dev: bool = is_dev::main();
    let app_dir: String = env::current_dir()
        .expect("Failed to get app directory")
        .to_string_lossy()
        .into_owned();
    let crosshairs_dir = app_dir.clone() + "/crosshairs";
    if !dev {
        // check is crosshairs directory exists. If it doesn't, create it
        let is_created_recently = create_directory_if_not_exists(&Path::new(&crosshairs_dir));
        match is_created_recently {
            Ok(false) => {} // already exists
            Ok(true) => logger::info("Crosshairs directory created successfully."),
            Err(err) => {
                logger::warn("Failed to create crosshairs directory.");
                logger::error(&err);
            }
        }
    } else {
        logger::info("Running in development mode. Skipping crosshairs setup.");
    };
    let app_handle = app.handle().clone();
    let app_handle_clone = app_handle.clone();
    app_handle.listen_global("watch-crosshairs", move |event: tauri::Event| {
        let payload: Result<WatchCrosshairsOptions, serde_json::Error> =
            serde_json::from_str(event.payload().unwrap_or(""));
        match payload {
            Ok(payload) => {
                watch_crosshairs(
                    &app_handle_clone,
                    payload.directory,
                    payload.extensions,
                    payload.immediate,
                );
            }
            Err(e) => {
                println!("Failed to deserialize payload: {:?}", e);
            }
        }
    });
}

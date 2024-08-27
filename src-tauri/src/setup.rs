use std::path::Path;
use std::{env, fs, io};

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

#[doc = r#"setup (initializer) function"#]
pub fn main() {
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
    }
}

use super::{date_util::now_time, is_dev};
use std::{error::Error, fs::OpenOptions, io::Write};

#[doc = r#"Current log level: default value is "INFO""#]
const LOG_LEVEL: &str = "INFO";
#[doc = r#"The quene of log levels: \["DEBUG", "INFO", "WARN", "ERROR"\]"#]
const LEG_QUEUE: [&str; 5] = ["DEBUG", "INFO", "WARN", "ERROR", "ALL"];

#[allow(unused)]
#[doc = r#"Ignore log level, just print msg into console"#]
pub fn console(msg: &str) {
    println!("[logger] {}", msg);
}

fn format_log_message(level: &str, msg: &str) -> String {
    let log_message = format!("[logger][{}][{}] {}\n", level, now_time(), msg);
    return log_message;
}

#[allow(unused)]
fn write_log(log_message: &str) {
    if !(is_dev::main()) {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open("log.txt")
            .unwrap();
        file.write_all(log_message.as_bytes()).unwrap();
    }
}

#[allow(unused)]
#[doc = r#"Info level log, receive a message"#]
pub fn info(msg: &str) {
    let islog = LEG_QUEUE.iter().position(|&lv| lv == "INFO").unwrap()
        >= LEG_QUEUE.iter().position(|&lv| lv == LOG_LEVEL).unwrap();
    if islog {
        let log_message = format_log_message("INFO", msg);
        println!("{}", log_message);
        write_log(&log_message)
    }
}

#[allow(unused)]
#[doc = r#"Debug level log, receive a message"#]
pub fn debug(msg: &str) {
    let islog = LEG_QUEUE.iter().position(|&lv| lv == "DEBUG").unwrap()
        >= LEG_QUEUE.iter().position(|&lv| lv == LOG_LEVEL).unwrap();
    if islog {
        let log_message = format_log_message("DEBUG", msg);
        println!("{}", log_message);
        write_log(&log_message)
    }
}

#[allow(unused, non_snake_case)]
#[doc = r#"Warnning level log, receive a message"#]
pub fn warn(msg: &str) {
    let islog = LEG_QUEUE.iter().position(|&lv| lv == "WARN").unwrap()
        >= LEG_QUEUE.iter().position(|&lv| lv == LOG_LEVEL).unwrap();
    if islog {
        let log_message = format_log_message("WARN", msg);
        println!("{}", log_message);
        write_log(&log_message)
    }
}

#[allow(unused, non_snake_case)]
#[doc = r#"Error level log, receive an error message"#]
pub fn errorMsg(msg: &str) {
    let islog = LEG_QUEUE.iter().position(|&lv| lv == "ERROR").unwrap()
        >= LEG_QUEUE.iter().position(|&lv| lv == LOG_LEVEL).unwrap();
    if islog {
        let log_message = format_log_message("ERROR", msg);
        println!("{}", log_message);
        write_log(&log_message)
    }
}

#[allow(unused)]
#[doc = r#"Error level log, receive an error"#]
pub fn error(err: &dyn Error) {
    let islog = LEG_QUEUE.iter().position(|&lv| lv == "ERROR").unwrap()
        >= LEG_QUEUE.iter().position(|&lv| lv == LOG_LEVEL).unwrap();
    if islog {
        let log_message = format_log_message("INFO", &(err.to_string()));
        println!("{}", log_message);
        write_log(&log_message)
    }
}

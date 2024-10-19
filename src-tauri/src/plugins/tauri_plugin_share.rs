use std::collections::HashMap;
use std::sync::Mutex;

use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};

struct ShareState {
    mapping: HashMap<String, String>,
}

impl ShareState {
    fn new() -> Self {
        Self {
            mapping: HashMap::new(),
        }
    }
}

struct PluginState(Mutex<ShareState>);

#[tauri::command]
// this will be accessible with `invoke('plugin:awesome|do_something')`.
fn register<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, PluginState>,
    key: String,
    val: String,
    if_not_exists: bool,
    broadcast: bool,
) {
    let mut state = _state.0.lock().unwrap();
    if if_not_exists && state.mapping.contains_key(&key) {
        return;
    }
    state.mapping.insert(key.clone(), val.clone());
    if broadcast {
        _app.emit_all(&format!("plugin:share:update:{}", key), val)
            .unwrap();
    }
}

#[tauri::command]
// this will be accessible with `invoke('plugin:awesome|do_something')`.
fn request<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, PluginState>,
    key: String,
) -> Option<String> {
    // you can request a share variable
    let state = _state.0.lock().unwrap();
    return state.mapping.get(&key).cloned();
}

#[tauri::command]
// this will be accessible with `invoke('plugin:awesome|do_something')`.
fn update<R: Runtime>(
    _app: AppHandle<R>,
    _state: State<'_, PluginState>,
    key: String,
    val: String,
) {
    // you can update a share variable
    let mut state = _state.0.lock().unwrap();
    state.mapping.insert(key.clone(), val.clone());
    _app.emit_all(&format!("plugin:share:update:{}", key), val)
        .unwrap();
}

#[tauri::command]
fn has(_state: State<'_, PluginState>, key: String) -> bool {
    // you can check if a share variable exists
    let state = _state.0.lock().unwrap();
    return state.mapping.contains_key(&key);
}

#[tauri::command]
fn keys(_state: State<'_, PluginState>) -> Vec<String> {
    // you can get all the keys of the share variables
    let state = _state.0.lock().unwrap();
    return state.mapping.keys().cloned().collect();
}

#[tauri::command]
fn clear(_state: State<'_, PluginState>) -> bool {
    // you can remove a share variable
    let mut state = _state.0.lock().unwrap();
    state.mapping.clear();
    return true;
}

#[tauri::command]
fn remove(_state: State<'_, PluginState>, key: String) -> bool {
    // you can remove a share variable
    let mut state = _state.0.lock().unwrap();
    state.mapping.remove(&key);
    return true;
}

#[tauri::command]
fn values(_state: State<'_, PluginState>) -> Vec<String> {
    // you can get all the values of the share variables
    let state = _state.0.lock().unwrap();
    return state.mapping.values().cloned().collect();
}

#[tauri::command]
fn size(_state: State<'_, PluginState>) -> usize {
    // you can get the count of the share variables
    let state = _state.0.lock().unwrap();
    return state.mapping.len();
}

#[tauri::command]
fn mapping(_state: State<'_, PluginState>) -> HashMap<String, String> {
    // you can get all the share variables
    let state = _state.0.lock().unwrap();
    return state.mapping.clone();
}

#[tauri::command]
fn entries(_state: State<'_, PluginState>) -> Vec<(String, String)> {
    // you can get all the share variables
    let state = _state.0.lock().unwrap();
    return state
        .mapping
        .iter()
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("share")
        .invoke_handler(tauri::generate_handler![
            register, request, update, has, keys, clear, remove, values, size, mapping, entries
        ])
        .setup(|app_handle| {
            // setup plugin specific state here
            app_handle.manage(PluginState(Mutex::new(ShareState::new())));
            Ok(())
        })
        .build()
}

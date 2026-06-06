import useAsyncEffect from "../../src-public/hooks/useAsyncEffect";
import { os, path } from "@tauri-apps/api";
import { checkIsDev, getMainWindow, getNameOfFilePath, images_sorter, invoke, sleep, watchCrosshairs } from "@utils/index";
import useCache from "../cache";
import store from "@public//store";
import { useHotkeys } from "react-hotkeys-hook";
import globalHotKeys from "../hotkeys/globalHotKeys";
import toast from "react-hot-toast";
import { emit, listen } from "@tauri-apps/api/event";
import * as share from "@public/plugins/tauri-plugin-share";
import { useConfigStore, ensureSyncListener } from "@public/hooks/useConfig";
import { type CrosshairStudioConfig, DEFAULT_CONFIG } from "@public/config/defaults";

export default function useInit() {
  const cache = useCache();
  const { isInitiated, setIsInitiated } = cache;
  const queryImgs = async (directory: string) => {
    cache.setIsQueryingImgs(true);
    try {
      if (!directory) {
        throw new Error("directory is not set");
      }
      const images = await invoke("get_images_from_directory", {
        directory: directory,
        extensions: ["png", "jpg", "jpeg", "gif", "svg", "txt", "url"],
      });
      const paths = images.map((it) => it.path);
      cache.setImglist((paths || [])
        .map(file => getNameOfFilePath(file))
        .sort((a, b) => images_sorter({ name: a }, { name: b })));
    } catch (error: any) {
      console.error("Failed to query images:", error);
      toast.error("Failed to query images from directory for reason: " + error.message);
      invoke('log', {
        level: 'ERROR',
        msg: 'Failed to query images from directory for reason:' + error.message
      });
    } finally {
      cache.setIsQueryingImgs(false);
    }
  };


  useAsyncEffect(
    async () => {
      const timestart = performance.now();

      // ──── 第一步：加载外置配置文件 ────
      const configStore = useConfigStore.getState();
      if (!configStore.loaded) {
        await configStore.load();
        // 启动 share 广播监听（接收来自控制台的配置变更）
        await ensureSyncListener();
      }
      let config = useConfigStore.getState().config;

      // ──── 第二步：首次运行 & 语言自动检测 ────
      const first_run = !(await store.get("not_first_run"));
      if (first_run) {
        await store.set("not_first_run", true);
        const os_locale = await os.locale() || "en-US";
        const locales = await invoke('get_locales');
        const matched_locale = matchLocale(os_locale, locales);
        localStorage.setItem("locale", JSON.stringify(matched_locale));
      }

      // ──── 第三步：迁移旧设置到配置文件 ────
      const configVersion = await store.get("config_migrated" as any);
      if (!configVersion) {
        // 从 tauri-plugin-store 和 localStorage 读取旧值，合并到配置文件
        const migratedConfig = await migrateOldSettings(config);
        if (migratedConfig) {
          config = migratedConfig;
          await configStore.save(config);
        }
        await store.set("config_migrated" as any, "1.0");
      }

      // ──── 第四步：版本记录 ────
      await store.set("version", __APP_VERSION__);

      // ──── 第五步：准星目录解析 ────
      let crosshair_dir = "";
      const appDir = await invoke("get_appdir");
      const configDirTemplate = config.behavior.crosshair_directory;
      const default_crosshair_dir = "${APP_DIR}/crosshairs";

      let crosshair_under_appdir = "";
      if (checkIsDev()) {
        crosshair_under_appdir = await path.resolve(appDir, "../crosshairs");
      } else {
        crosshair_under_appdir = await path.resolve(appDir, "crosshairs");
      }

      if (default_crosshair_dir === configDirTemplate || !configDirTemplate) {
        crosshair_dir = crosshair_under_appdir;
      } else {
        crosshair_dir = await path.resolve(configDirTemplate);
      }

      // 注意：配置文件中保留 `${APP_DIR}/crosshairs` 占位符，不写回解析后的绝对路径
      cache.set_crosshair_dictionary(crosshair_dir);

      // ──── 第六步：设置准星文件监听 ────
      const unWatch = await watchCrosshairs((images) => {
        const paths = images.map((it) => it.path);
        cache.setImglist((paths || [])
          .map(file => getNameOfFilePath(file))
          .sort((a, b) => images_sorter({ name: a }, { name: b })));
      });
      await queryImgs(crosshair_dir);

      await emit("watch-crosshairs", {
        directory: crosshair_dir,
        extensions: ["png", "jpg", "jpeg", "gif", "svg", "txt", "url"],
        immediate: false
      })

      // ──── 第七步：从配置读取行为参数 ────
      const default_crosshair = config.behavior.default_crosshair;
      cache.setDefaultCrosshair(default_crosshair, true);
      cache.switchToCrosshairByPath(default_crosshair);

      // 置顶 & 穿透状态从配置初始化
      cache.setAlwaysOnTop(config.behavior.always_on_top);
      cache.setIgnoreCursorEvents(config.behavior.ignore_cursor_events);

      await Promise.all([
        getMainWindow()?.setIgnoreCursorEvents(config.behavior.ignore_cursor_events),
        getMainWindow()?.setAlwaysOnTop(config.behavior.always_on_top),
      ])

      // ──── 第八步：从配置读取快捷键并注册 ────
      const hotkeyMap: Array<{ action: keyof typeof globalHotKeys; configKey: keyof typeof config.hotkeys }> = [
        { action: "togglePinned", configKey: "toggle_pinned" },
        { action: "toggleIgnoreCursorEvents", configKey: "toggle_ignore_cursor_events" },
        { action: "switchCrosshair", configKey: "switch_crosshair" },
        { action: "switchToDefaultCrosshair", configKey: "switch_to_default_crosshair" },
        { action: "setCurrentCrosshairAsDefault", configKey: "set_current_crosshair_as_default" },
        { action: "openMonitor", configKey: "open_monitor" },
        { action: "reload", configKey: "reload" },
        { action: "exit", configKey: "exit" },
      ];

      // 从配置文件读取快捷键到 globalHotKeys
      for (const { action, configKey } of hotkeyMap) {
        const keys = config.hotkeys[configKey] || DEFAULT_CONFIG.hotkeys[configKey];
        globalHotKeys[action].keys = [...keys];
      }

      // 同步快捷键到 share 插件（跨窗口可见）
      await syncHotkeysToShare(config);

      // 注册所有全局快捷键
      try {
        await Promise.all([
          globalHotKeys.togglePinned.register(cache),
          globalHotKeys.toggleIgnoreCursorEvents.register(cache),
          globalHotKeys.switchCrosshair.register(cache),
          globalHotKeys.switchToDefaultCrosshair.register(cache),
          globalHotKeys.setCurrentCrosshairAsDefault.register(cache),
          globalHotKeys.openMonitor.register(),
          globalHotKeys.reload.register(),
          globalHotKeys.exit.register(),
        ]);
      } catch (error: any) {
        console.error("Failed to register global hotkeys:", error);
        invoke('log', {
          level: 'ERROR',
          msg: `"Failed to register global hotkeys:" ${error.message || error.toString()}`
        })
      }

      // ──── 第九步：监听快捷键变更事件 ────
      // 注：配置文件写入由 Hotkey 组件直接完成，此处仅负责跨窗口同步和重新注册
      await listen(`register_hotkeys`, (e) => {
        const { keys, action } = e.payload as {
          keys: string[],
          action: keyof typeof globalHotKeys
        };
        globalHotKeys[action].keys = keys;
        share.set(`hotkeys_${action}` as any, keys);
        if (keys.length !== 0) {
          globalHotKeys[action].register(cache);
        }
      });

      await listen(`unregister_hotkeys`, (e) => {
        const { action } = e.payload as {
          action: keyof typeof globalHotKeys
        };
        globalHotKeys[action].unregister();
      })

      // ──── 第十步：初始化准星方案（保留在 store 中）────
      const schemes = await store.get('schemes');
      if (schemes === void 0) {
        store.set('schemes', []);
      }

      const timeend = performance.now();
      const duration = timeend - timestart;
      if (duration < 1000) {
        await sleep(1000 - duration);
      }

      setIsInitiated(true);
      return () => {
        globalHotKeys.togglePinned.unregister();
        globalHotKeys.toggleIgnoreCursorEvents.unregister();
        globalHotKeys.switchCrosshair.unregister();
        globalHotKeys.switchToDefaultCrosshair.unregister();
        globalHotKeys.setCurrentCrosshairAsDefault.unregister();
        globalHotKeys.openMonitor.unregister();
        globalHotKeys.reload.unregister();
        globalHotKeys.exit.unregister();
        unWatch();
      };
    },
    []
  );

  useHotkeys("q", cache.switchCrosshair, [cache.cur]);

  return isInitiated;
}

// ── 辅助函数 ──

function matchLocale(source_locale: string, locales: Record<string, string>) {
  return Object.keys(locales).find(locale => {
    const regex = new RegExp(`^${locale.replace(/[-_]/g, "[-_]?")}$`, "i");
    return regex.test(source_locale);
  }) || "en_US";
}

async function syncHotkeysToShare(config: CrosshairStudioConfig) {
  await share.set('hotkeys_togglePinned', config.hotkeys.toggle_pinned);
  await share.set('hotkeys_toggleIgnoreCursorEvents', config.hotkeys.toggle_ignore_cursor_events);
  await share.set('hotkeys_switchCrosshair', config.hotkeys.switch_crosshair);
  await share.set('hotkeys_switchToDefaultCrosshair', config.hotkeys.switch_to_default_crosshair);
  await share.set('hotkeys_setCurrentCrosshairAsDefault', config.hotkeys.set_current_crosshair_as_default);
  await share.set('hotkeys_openMonitor', config.hotkeys.open_monitor);
  await share.set('hotkeys_reload', config.hotkeys.reload);
  await share.set('hotkeys_exit', config.hotkeys.exit);
}

/**
 * 迁移旧设置：读取 tauri-plugin-store 和 localStorage 中的旧值，
 * 合并到当前配置中返回新配置。
 */
async function migrateOldSettings(currentConfig: CrosshairStudioConfig): Promise<CrosshairStudioConfig | null> {
  let changed = false;
  const config = JSON.parse(JSON.stringify(currentConfig)) as CrosshairStudioConfig;

  // ── 从 tauri-plugin-store 迁移 ──
  try {
    const oldDefaultCrosshair = await store.get("default_crosshair");
    if (oldDefaultCrosshair && !config.behavior.default_crosshair) {
      config.behavior.default_crosshair = oldDefaultCrosshair;
      changed = true;
    }

    const oldIgnoreCursorEvents = await store.get("ignoreCursorEvents");
    if (oldIgnoreCursorEvents !== undefined && oldIgnoreCursorEvents !== null) {
      config.behavior.ignore_cursor_events = oldIgnoreCursorEvents as boolean;
      changed = true;
    }

    // 迁移旧快捷键
    const hotkeyMigrations: Array<{ storeKey: string; configKey: keyof typeof config.hotkeys }> = [
      { storeKey: "hotkeys_togglePinned", configKey: "toggle_pinned" },
      { storeKey: "hotkeys_toggleIgnoreCursorEvents", configKey: "toggle_ignore_cursor_events" },
      { storeKey: "hotkeys_switchCrosshair", configKey: "switch_crosshair" },
      { storeKey: "hotkeys_switchToDefaultCrosshair", configKey: "switch_to_default_crosshair" },
      { storeKey: "hotkeys_setCurrentCrosshairAsDefault", configKey: "set_current_crosshair_as_default" },
      { storeKey: "hotkeys_openMonitor", configKey: "open_monitor" },
      { storeKey: "hotkeys_reload", configKey: "reload" },
      { storeKey: "hotkeys_exit", configKey: "exit" },
    ];

    for (const { storeKey, configKey } of hotkeyMigrations) {
      try {
        const oldHotkey = await store.get(storeKey as any);
        if (oldHotkey && Array.isArray(oldHotkey) && oldHotkey.length > 0) {
          config.hotkeys[configKey] = oldHotkey as string[];
          changed = true;
        }
      } catch { /* 该快捷键无旧值 */ }
    }
  } catch { /* store 读取失败，跳过迁移 */ }

  // ── 从 localStorage 迁移 ──
  try {
    const migrateLocal = <T,>(key: string, setter: (val: T) => void) => {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw !== undefined) {
        try {
          const val = JSON.parse(raw) as T;
          if (val !== null && val !== undefined) {
            setter(val);
            changed = true;
          }
        } catch { /* parse 失败跳过 */ }
      }
    };

    migrateLocal<number>("crosshair_width", (v) => { config.crosshair.width = v; });
    migrateLocal<number>("crosshair_height", (v) => { config.crosshair.height = v; });
    migrateLocal<boolean>("crosshair_lock_ratio", (v) => { config.crosshair.lock_ratio = v; });
    migrateLocal<number>("canvas_size", (v) => { config.crosshair.canvas_size = v; });
    migrateLocal<"rect" | "circle">("canvas_shape", (v) => { config.crosshair.canvas_shape = v; });
    migrateLocal<boolean>("enable_canvas_invert_filter", (v) => { config.crosshair.enable_invert_filter = v; });
    migrateLocal<boolean>("enable_system_notification", (v) => { config.enable_system_notification = v; });
  } catch { /* localStorage 读取失败，跳过迁移 */ }

  return changed ? config : null;
}

import useAsyncEffect from "../../src-public/hooks/useAsyncEffect";
import { os, path } from "@tauri-apps/api";
import { checkIsDev, getMainWindow, getNameOfFilePath, images_sorter, invoke, sleep, watchCrosshairs } from "@utils/index";
import useCache from "../cache";
import store from "@public//store";
import { version } from "../../package.json";
import { useHotkeys } from "react-hotkeys-hook";
import globalHotKeys from "../hotkeys/globalHotKeys";
import toast from "react-hot-toast";
import useLocalStorage from "@public/hooks/useLocalStorage";
import { emit, listen } from "@tauri-apps/api/event";
import * as share from "@public/plugins/tauri-plugin-share";

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
  const [, store_crosshair_dir] = useLocalStorage<string>("crosshair_dir");
  useAsyncEffect(
    async () => {
      const timestart = performance.now();
      const first_run = !(await store.get("not_first_run"));
      if (first_run) {
        await store.set("not_first_run", true);
        // 形如 "zh-CN" 的字符串
        const os_locale = await os.locale() || "en-US";
        const locales = await invoke('get_locales');
        // 从 locales 中找到与 os_locale 匹配的语言，locales 中的键名为 "zh-CN" 或 "zh_CN" 的形式 或 "zhCN"
        const matched_locale = matchLocale(os_locale, locales);
        localStorage.setItem("locale", JSON.stringify(matched_locale));
      }

      await store.set("version", version);
      // await store.set("crosshair_dictionary", "${APP_DIR}/crosshairs")
      let crosshair_dir = "";
      const appDir = await invoke("get_appdir");
      const stored_crosshair_dir = await store.get("crosshair_dictionary");
      const default_crosshair_dir = "${APP_DIR}/crosshairs"; //await path.resolve(appDir, "crosshairs");

      let crosshair_under_appdir = "";
      if (checkIsDev()) {
        crosshair_under_appdir = await path.resolve(appDir, "../crosshairs");
      } else {
        crosshair_under_appdir = await path.resolve(appDir, "crosshairs");
      }

      if (default_crosshair_dir === stored_crosshair_dir) {
        // 默认为 "${APP_DIR}/crosshairs"
        crosshair_dir = crosshair_under_appdir;
      } else {
        // 用户更改了 crosshair_dictionary
        crosshair_dir = await path.resolve(stored_crosshair_dir || default_crosshair_dir);
      }

      await store.set(
        "crosshair_dictionary",
        default_crosshair_dir === stored_crosshair_dir ? default_crosshair_dir : crosshair_dir
      );
      cache.set_crosshair_dictionary(crosshair_dir);
      store_crosshair_dir(crosshair_dir);

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

      const default_crosshair = await store.get("default_crosshair");
      cache.setDefaultCrosshair(default_crosshair, true);
      cache.switchToCrosshairByPath(default_crosshair);

      await Promise.all([
        getMainWindow()?.setIgnoreCursorEvents(cache.ignoreCursorEvents),
        store.set("ignoreCursorEvents", cache.ignoreCursorEvents)
      ])

      let hotkeys_togglePinned = globalHotKeys.togglePinned.defaultKeys;
      let hotkeys_toggleIgnoreCursorEvents = globalHotKeys.toggleIgnoreCursorEvents.defaultKeys;
      let hotkeys_switchCrosshair = globalHotKeys.switchCrosshair.defaultKeys;
      let hotkeys_switchToDefaultCrosshair = globalHotKeys.switchToDefaultCrosshair.defaultKeys;
      let hotkeys_setCurrentCrosshairAsDefault = globalHotKeys.setCurrentCrosshairAsDefault.defaultKeys;
      let hotkeys_openMonitor = globalHotKeys.openMonitor.defaultKeys;
      let hotkeys_reload = globalHotKeys.reload.defaultKeys;
      let hotkeys_exit = globalHotKeys.exit.defaultKeys;

      if (first_run) {
        await store.set('hotkeys_togglePinned', hotkeys_togglePinned);
        await store.set('hotkeys_toggleIgnoreCursorEvents', hotkeys_toggleIgnoreCursorEvents);
        await store.set('hotkeys_switchCrosshair', hotkeys_switchCrosshair);
        await store.set('hotkeys_switchToDefaultCrosshair', hotkeys_switchToDefaultCrosshair);
        await store.set('hotkeys_setCurrentCrosshairAsDefault', hotkeys_setCurrentCrosshairAsDefault);
        await store.set('hotkeys_openMonitor', hotkeys_openMonitor);
        await store.set('hotkeys_reload', hotkeys_reload);
        await store.set('hotkeys_exit', hotkeys_exit);
      } else {
        hotkeys_togglePinned = (await store.get('hotkeys_togglePinned')) || [];
        globalHotKeys.togglePinned.keys = hotkeys_togglePinned;
        hotkeys_toggleIgnoreCursorEvents = (await store.get('hotkeys_toggleIgnoreCursorEvents')) || [];
        globalHotKeys.toggleIgnoreCursorEvents.keys = hotkeys_toggleIgnoreCursorEvents;
        hotkeys_switchCrosshair = (await store.get('hotkeys_switchCrosshair')) || [];
        globalHotKeys.switchCrosshair.keys = hotkeys_switchCrosshair;
        hotkeys_switchToDefaultCrosshair = (await store.get('hotkeys_switchToDefaultCrosshair')) || [];
        globalHotKeys.switchToDefaultCrosshair.keys = hotkeys_switchToDefaultCrosshair;
        hotkeys_setCurrentCrosshairAsDefault = (await store.get('hotkeys_setCurrentCrosshairAsDefault')) || [];
        globalHotKeys.setCurrentCrosshairAsDefault.keys = hotkeys_setCurrentCrosshairAsDefault;
        hotkeys_openMonitor = (await store.get('hotkeys_openMonitor')) || [];
        globalHotKeys.openMonitor.keys = hotkeys_openMonitor;
        hotkeys_reload = (await store.get('hotkeys_reload')) || [];
        globalHotKeys.reload.keys = hotkeys_reload;
        hotkeys_exit = (await store.get('hotkeys_exit')) || [];
        globalHotKeys.exit.keys = hotkeys_exit;
      }

      await share.set('hotkeys_togglePinned', hotkeys_togglePinned);
      await share.set('hotkeys_toggleIgnoreCursorEvents', hotkeys_toggleIgnoreCursorEvents);
      await share.set('hotkeys_switchCrosshair', hotkeys_switchCrosshair);
      await share.set('hotkeys_switchToDefaultCrosshair', hotkeys_switchToDefaultCrosshair);
      await share.set('hotkeys_setCurrentCrosshairAsDefault', hotkeys_setCurrentCrosshairAsDefault);
      await share.set('hotkeys_openMonitor', hotkeys_openMonitor);
      await share.set('hotkeys_reload', hotkeys_reload);
      await share.set('hotkeys_exit', hotkeys_exit);

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

      await listen(`register_hotkeys`, (e) => {
        const { keys, action } = e.payload as {
          keys: string[],
          action: keyof typeof globalHotKeys
        };
        const actionKey = `hotkeys_${action}` as any;
        globalHotKeys[action].keys = keys;
        store.set(actionKey, globalHotKeys[action].keys);
        share.set(actionKey, globalHotKeys[action].keys);
        if (keys.length !== 0) {
          globalHotKeys[action].register(cache);
        }
      })
      await listen(`unregister_hotkeys`, (e) => {
        const { action } = e.payload as {
          action: keyof typeof globalHotKeys
        };
        globalHotKeys[action].unregister();
      })

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

function matchLocale(source_locale: string, locales: Record<string, string>) {
  return Object.keys(locales).find(locale => {
    const regex = new RegExp(`^${locale.replace(/[-_]/g, "[-_]?")}$`, "i");
    return regex.test(source_locale);
  }) || "en_US";
}
import useAsyncEffect from "../../src-public/hooks/useAsyncEffect";
import { path } from "@tauri-apps/api";
import { getMainWindow, getNameOfFilePath, invoke, sleep } from "@utils/index";
import useCache from "../cache";
import store from "../store";
import { version } from "../../package.json";
import { useHotkeys } from "react-hotkeys-hook";
import globalHotKeys from "../hotkeys/globalHotKeys";
import toast from "react-hot-toast";

export default function useInit() {
  const cache = useCache();
  const { isInitiated, setIsInitiated } = cache;
  const queryImgs = async (directory: string) => {
    cache.setIsQueryingImgs(true);
    try {
      if (!directory) {
        throw new Error("directory is not set");
      }
      const res = await invoke("get_images_from_directory", {
        directory: directory,
      });
      cache.setImglist((res || []).map(file => getNameOfFilePath(file)));
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
      await sleep(2000);
      await store.set("version", version);
      // await store.set("crosshair_dictionary", "${APP_DIR}/crosshairs")
      let crosshair_dir = "";
      const appDir = await invoke("get_appdir");
      const stored_crosshair_dir = await store.get("crosshair_dictionary");
      const default_crosshair_dir = "${APP_DIR}/crosshairs"; //await path.resolve(appDir, "crosshairs");

      // 判断是否为开发环境
      // const isDev = await invoke("is_dev");  // deprecated
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // 开发环境下，直接读取项目源码中 public/crosshairs
        crosshair_dir = await path.resolve(appDir, "../public", "crosshairs");
      } else {
        // 非开发环境下，读取 tauri appDir下的 crosshair_dictionary
        const crosshair_under_appdir = await path.resolve(appDir, "crosshairs");

        if (default_crosshair_dir === stored_crosshair_dir) {
          // 默认为 "${APP_DIR}/crosshairs"
          crosshair_dir = crosshair_under_appdir;
        } else {
          // 用户更改了 crosshair_dictionary
          crosshair_dir = await path.resolve(stored_crosshair_dir || default_crosshair_dir);
        }
      }

      await store.set(
        "crosshair_dictionary",
        default_crosshair_dir === stored_crosshair_dir ? default_crosshair_dir : crosshair_dir
      );
      cache.set_crosshair_dictionary(crosshair_dir);
      await queryImgs(crosshair_dir);

      const default_crosshair = await store.get("default_crosshair");
      cache.setDefaultCrosshair(default_crosshair, true);
      cache.switchToCrosshairByPath(default_crosshair);

      await Promise.all([
        getMainWindow()?.setIgnoreCursorEvents(cache.ignoreCursorEvents),
        store.set("ignoreCursorEvents", cache.ignoreCursorEvents)
      ])

      try {
        await Promise.all([
          globalHotKeys.togglePinned.register(cache),
          globalHotKeys.toggleIgnoreCursorEvents.register(cache),
          globalHotKeys.switchIdx.register(cache),
          globalHotKeys.switchToDefaultCrosshair.register(cache),
          globalHotKeys.setCurrentCrosshairAsDefault.register(cache),
          globalHotKeys.monitor.register(),
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

      setIsInitiated(true);
      return () => {
        globalHotKeys.togglePinned.unregister();
        globalHotKeys.toggleIgnoreCursorEvents.unregister();
        globalHotKeys.switchIdx.unregister();
        globalHotKeys.switchToDefaultCrosshair.unregister();
        globalHotKeys.setCurrentCrosshairAsDefault.unregister();
        globalHotKeys.monitor.unregister();
        globalHotKeys.reload.unregister();
        globalHotKeys.exit.unregister();
      };
    },
    [],
    {
      onError: (e: Error) => toast.error(e.message || "Failed to initiate"),
    }
  ), [];

  useHotkeys("q", cache.switchIdx, [cache.idx]);

  return isInitiated;
}

import useAsyncEffect from "./useAsyncEffect";
import { path } from "@tauri-apps/api";
import { invoke, isRegistered, register, sleep, unregister } from "../utils";
import useCache, { Cache } from "../cache";
import store from "../store";
import { version } from "../../package.json";
import { useHotkeys } from "react-hotkeys-hook";
import toast from "react-hot-toast";
import { relaunch } from "@tauri-apps/api/process";

const globalHotKeys = {
  switchIdx: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "Q"] as const,
    handler: (cache: Cache) => {
      cache.switchIdx();
    },
    async register(cache: Cache) {
      globalHotKeys.switchIdx.isRegistered = await isRegistered(globalHotKeys.switchIdx.keys);
      if (!globalHotKeys.switchIdx.isRegistered) {
        await register(globalHotKeys.switchIdx.keys, globalHotKeys.switchIdx.handler.bind(null, cache));
        globalHotKeys.switchIdx.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.switchIdx.isRegistered) {
        await unregister(globalHotKeys.switchIdx.keys);
        globalHotKeys.switchIdx.isRegistered = false;
      }
    },
  },
  reload: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "R"] as const,
    handler: () => {
      relaunch();
    },
    async register() {
      globalHotKeys.reload.isRegistered = await isRegistered(globalHotKeys.reload.keys);
      if (!globalHotKeys.reload.isRegistered) {
        await register(globalHotKeys.reload.keys, globalHotKeys.reload.handler);
        globalHotKeys.reload.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.reload.isRegistered) {
        await unregister(globalHotKeys.reload.keys);
        globalHotKeys.reload.isRegistered = false;
      }
    },
  },
};

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
      cache.setImglist(res || []);
    } catch (error: any) {
      console.error("Failed to query images:", error);
      toast.error("Failed to query images from directory for reason: " + error.message);
    } finally {
      cache.setIsQueryingImgs(false);
    }
  };
  useAsyncEffect(
    async () => {
      await sleep(2000);
      await store.set("version", version);
      let crosshair_dir = "";
      const appDir = await invoke("get_appdir");
      const stored_crosshair_dir = await store.get("crosshair_dictionary");
      const default_crosshair_dir = "${APP_DIR}/crosshair"; //await path.resolve(appDir, "crosshairs");

      // 判断是否为开发环境
      const isDev = await invoke("is_dev");

      if (isDev) {
        // 开发环境下，直接读取项目源码中 public/crosshairs
        crosshair_dir = await path.resolve(appDir, "../public", "crosshairs");
      } else {
        // 非开发环境下，读取 tauri appDir下的 crosshair_dictionary
        const crosshair_under_appdir = await path.resolve(appDir, "crosshairs");

        if (default_crosshair_dir === stored_crosshair_dir) {
          // 默认为 "${APP_DIR}/crosshair"
          crosshair_dir = crosshair_under_appdir;
        } else {
          // 用户更改了 crosshair_dictionary
          crosshair_dir = await path.resolve(stored_crosshair_dir);
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

      await Promise.all([globalHotKeys.switchIdx.register(cache), globalHotKeys.reload.register()]);

      setIsInitiated(true);
      return () => {
        globalHotKeys.switchIdx.unregister();
        globalHotKeys.reload.unregister();
      };
    },
    [],
    {
      onError: (e: Error) => toast.error(e.message || "Failed to initiate"),
    }
  );

  useHotkeys("q", cache.switchIdx, [cache.idx]);

  return isInitiated;
}

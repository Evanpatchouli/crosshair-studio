import { exit, relaunch } from "@tauri-apps/api/process";
import { type Cache } from "../cache";
import { getMonitorWindow, isRegistered, register, unregister } from "@utils/index";
import toast from "react-hot-toast";

const globalHotKeys = {
  switchIdx: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "Q"] as const,
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

  switchToDefaultCrosshair: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "D"] as const,
    handler: (cache: Cache) => {
      cache.switchToDefaultCrosshair();
    },
    async register(cache: Cache) {
      globalHotKeys.switchToDefaultCrosshair.isRegistered = await isRegistered(globalHotKeys.switchToDefaultCrosshair.keys);
      if (!globalHotKeys.switchToDefaultCrosshair.isRegistered) {
        await register(globalHotKeys.switchToDefaultCrosshair.keys, globalHotKeys.switchToDefaultCrosshair.handler.bind(null, cache));
        globalHotKeys.switchToDefaultCrosshair.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.switchToDefaultCrosshair.isRegistered) {
        await unregister(globalHotKeys.switchToDefaultCrosshair.keys);
        globalHotKeys.switchToDefaultCrosshair.isRegistered = false;
      }
    },
  },

  setCurrentCrosshairAsDefault: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "S"] as const,
    handler: (cache: Cache) => {
      cache.setCurrentCrosshairAsDefault();
    },
    async register(cache: Cache) {
      globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = await isRegistered(globalHotKeys.setCurrentCrosshairAsDefault.keys);
      if (!globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
        await register(globalHotKeys.setCurrentCrosshairAsDefault.keys, globalHotKeys.setCurrentCrosshairAsDefault.handler.bind(null, cache));
        globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
        await unregister(globalHotKeys.setCurrentCrosshairAsDefault.keys);
        globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = false;
      }
    },
  },

  togglePinned: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "P"] as const,
    handler: (cache: Cache) => {
      cache.toggleAlwaysOnTop({
        onTop() {
          toast.success("固定顶层");
        },
        offTop() {
          toast.success("取消固定");
        },
      });
    },
    async register(cache: Cache) {
      globalHotKeys.togglePinned.isRegistered = await isRegistered(globalHotKeys.togglePinned.keys);
      if (!globalHotKeys.togglePinned.isRegistered) {
        await register(globalHotKeys.togglePinned.keys, globalHotKeys.togglePinned.handler.bind(null, cache));
        globalHotKeys.togglePinned.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.togglePinned.isRegistered) {
        await unregister(globalHotKeys.togglePinned.keys);
        globalHotKeys.togglePinned.isRegistered = false;
      }
    },
  },

  toggleIgnoreCursorEvents: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "T"] as const,
    handler: (cache: Cache) => {
      cache.toggleIgnoreCursorEvents();
    },
    async register(cache: Cache) {
      globalHotKeys.toggleIgnoreCursorEvents.isRegistered = await isRegistered(
        globalHotKeys.toggleIgnoreCursorEvents.keys
      );
      if (!globalHotKeys.toggleIgnoreCursorEvents.isRegistered) {
        await register(
          globalHotKeys.toggleIgnoreCursorEvents.keys,
          globalHotKeys.toggleIgnoreCursorEvents.handler.bind(null, cache)
        );
        globalHotKeys.toggleIgnoreCursorEvents.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.toggleIgnoreCursorEvents.isRegistered) {
        await unregister(globalHotKeys.toggleIgnoreCursorEvents.keys);
        globalHotKeys.toggleIgnoreCursorEvents.isRegistered = false;
      }
    },
  },

  monitor: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "C"] as const,
    handler: async () => {
      const monitor = getMonitorWindow();
      // if (monitor?.isVisible) {
      //   monitor.hide();
      // } else {
      //   monitor?.show();
      // }
      monitor?.show();
      await monitor?.setAlwaysOnTop(true);
      await monitor?.setFocus();
      await monitor?.setAlwaysOnTop(false);
      monitor?.onCloseRequested(() => {
        monitor?.hide();
      });
    },
    async register() {
      globalHotKeys.monitor.isRegistered = await isRegistered(globalHotKeys.monitor.keys);
      if (!globalHotKeys.monitor.isRegistered) {
        await register(globalHotKeys.monitor.keys, globalHotKeys.monitor.handler);
        globalHotKeys.monitor.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.monitor.isRegistered) {
        await unregister(globalHotKeys.monitor.keys);
        globalHotKeys.monitor.isRegistered = false;
      }
    },
  },

  reload: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "R"] as const,
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

  exit: {
    isRegistered: false,
    keys: ["CommandOrControl", "Alt", "E"] as const,
    handler: () => {
      // do something before exit...
      exit();
    },
    async register() {
      globalHotKeys.exit.isRegistered = await isRegistered(globalHotKeys.exit.keys);
      if (!globalHotKeys.exit.isRegistered) {
        await register(globalHotKeys.exit.keys, globalHotKeys.exit.handler);
        globalHotKeys.exit.isRegistered = true;
      }
    },
    async unregister() {
      if (globalHotKeys.exit.isRegistered) {
        await unregister(globalHotKeys.exit.keys);
        globalHotKeys.exit.isRegistered = false;
      }
    },
  },
}

export default globalHotKeys;

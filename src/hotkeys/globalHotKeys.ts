import { exit, relaunch } from "@tauri-apps/api/process";
import { type Cache } from "../cache";
import { isRegistered, register, unregister } from "../utils";
import toast from "react-hot-toast";

const globalHotKeys = {
  switchIdx: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "Q"] as const,
    handler: (cache: Cache) => {
      cache.switchIdx();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.switchIdx.isRegistered = await isRegistered(globalHotKeys.switchIdx.keys);
        if (!globalHotKeys.switchIdx.isRegistered) {
          await register(globalHotKeys.switchIdx.keys, globalHotKeys.switchIdx.handler.bind(null, cache));
          globalHotKeys.switchIdx.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of switchIdx:", error);
      }
    },
    async unregister() {
      if (globalHotKeys.switchIdx.isRegistered) {
        try {
          await unregister(globalHotKeys.switchIdx.keys);
          globalHotKeys.switchIdx.isRegistered = false;
        } catch (error) {
          console.error("Failed to unregister hotkey of switchIdx:", error);
        }
      }
    },
  },
  switchToDefaultCrosshair: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "D"] as const,
    handler: (cache: Cache) => {
      cache.switchToDefaultCrosshair();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.switchToDefaultCrosshair.isRegistered = await isRegistered(globalHotKeys.switchToDefaultCrosshair.keys);
        if (!globalHotKeys.switchToDefaultCrosshair.isRegistered) {
          await register(globalHotKeys.switchToDefaultCrosshair.keys, globalHotKeys.switchToDefaultCrosshair.handler.bind(null, cache));
          globalHotKeys.switchToDefaultCrosshair.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of switchToDefaultCrosshair:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.switchToDefaultCrosshair.isRegistered) {
          await unregister(globalHotKeys.switchToDefaultCrosshair.keys);
          globalHotKeys.switchToDefaultCrosshair.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of switchToDefaultCrosshair:", error);
      }
    },
  },
  setCurrentCrosshairAsDefault: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "S"] as const,
    handler: (cache: Cache) => {
      cache.setCurrentCrosshairAsDefault();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = await isRegistered(globalHotKeys.setCurrentCrosshairAsDefault.keys);
        if (!globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
          await register(globalHotKeys.setCurrentCrosshairAsDefault.keys, globalHotKeys.setCurrentCrosshairAsDefault.handler.bind(null, cache));
          globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of setCurrentCrosshairAsDefault:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
          await unregister(globalHotKeys.setCurrentCrosshairAsDefault.keys);
          globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of setCurrentCrosshairAsDefault:", error);
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
      try {
        globalHotKeys.reload.isRegistered = await isRegistered(globalHotKeys.reload.keys);
        if (!globalHotKeys.reload.isRegistered) {
          await register(globalHotKeys.reload.keys, globalHotKeys.reload.handler);
          globalHotKeys.reload.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of reload:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.reload.isRegistered) {
          await unregister(globalHotKeys.reload.keys);
          globalHotKeys.reload.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of reload:", error);
      }
    },
  },
  togglePinned: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "P"] as const,
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
      try {
        globalHotKeys.togglePinned.isRegistered = await isRegistered(globalHotKeys.togglePinned.keys);
        if (!globalHotKeys.togglePinned.isRegistered) {
          await register(globalHotKeys.togglePinned.keys, globalHotKeys.togglePinned.handler.bind(null, cache));
          globalHotKeys.togglePinned.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of togglePinned:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.togglePinned.isRegistered) {
          await unregister(globalHotKeys.togglePinned.keys);
          globalHotKeys.togglePinned.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of togglePinned:", error);
      }
    },
  },
  toggleIgnoreCursorEvents: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "T"] as const,
    handler: (cache: Cache) => {
      cache.toggleIgnoreCursorEvents();
    },
    async register(cache: Cache) {
      try {
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
      } catch (error) {
        console.error("Failed to register hotkey of toggleIgnoreCursorEvents:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.toggleIgnoreCursorEvents.isRegistered) {
          await unregister(globalHotKeys.toggleIgnoreCursorEvents.keys);
          globalHotKeys.toggleIgnoreCursorEvents.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of toggleIgnoreCursorEvents:", error);
      }
    },
  },
  exit: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "E"] as const,
    handler: () => {
      // do something before exit...
      exit();
    },
    async register() {
      try {
        globalHotKeys.exit.isRegistered = await isRegistered(globalHotKeys.exit.keys);
        if (!globalHotKeys.exit.isRegistered) {
          await register(globalHotKeys.exit.keys, globalHotKeys.exit.handler);
          globalHotKeys.exit.isRegistered = true;
        }
      } catch (error) {
        console.error("Failed to register hotkey of exit:", error);
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.exit.isRegistered) {
          await unregister(globalHotKeys.exit.keys);
          globalHotKeys.exit.isRegistered = false;
        }
      } catch (error) {
        console.error("Failed to unregister hotkey of exit:", error);
      }
    },
  },
};

export default globalHotKeys;

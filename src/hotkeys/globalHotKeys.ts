import { exit, relaunch } from "@tauri-apps/api/process";
import { type Cache } from "../cache";
import { isRegistered, register, unregister } from "../utils";
import toast from "react-hot-toast";
import { appWindow } from "@tauri-apps/api/window";

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
    keys: ["Ctrl", "Alt", "T"] as const,
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
  exit: {
    isRegistered: false,
    keys: ["Ctrl", "Alt", "E"] as const,
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
};

export default globalHotKeys;

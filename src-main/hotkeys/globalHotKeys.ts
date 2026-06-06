import { exit, relaunch } from "@tauri-apps/api/process";
import { type Cache } from "../cache";
import { getMonitorWindow, isRegistered, register, unregister } from "@utils/index";
import toast from "react-hot-toast";
import { emit } from "@tauri-apps/api/event";
import { flushConfigToFile } from "@public/hooks/useConfig";

const globalHotKeys = {
  switchCrosshair: {
    name: "switchCrosshair",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "Q"] as ["CommandOrControl", "Alt", "Q"],
    keys: ["CommandOrControl", "Alt", "Q"],
    handler: (cache: Cache) => {
      cache.switchCrosshair();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.switchCrosshair.isRegistered = await isRegistered(globalHotKeys.switchCrosshair.keys);
        if (!globalHotKeys.switchCrosshair.isRegistered) {
          await register(globalHotKeys.switchCrosshair.keys, globalHotKeys.switchCrosshair.handler.bind(null, cache));
          globalHotKeys.switchCrosshair.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
    async unregister() {
      if (globalHotKeys.switchCrosshair.isRegistered) {
        try {
          await unregister(globalHotKeys.switchCrosshair.keys);
          globalHotKeys.switchCrosshair.isRegistered = false;
        } catch (error) {
          console.error("Failed to unregister hotkey of switchCrosshair:", error);
        }
      }
    },
  },

  switchToDefaultCrosshair: {
    name: "switchToDefaultCrosshair",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "D"] as ["CommandOrControl", "Alt", "D"],
    keys: ["CommandOrControl", "Alt", "D"],
    handler: (cache: Cache) => {
      cache.switchToDefaultCrosshair();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.switchToDefaultCrosshair.isRegistered = await isRegistered(globalHotKeys.switchToDefaultCrosshair.keys);
        if (!globalHotKeys.switchToDefaultCrosshair.isRegistered) {
          await register(globalHotKeys.switchToDefaultCrosshair.keys, globalHotKeys.switchToDefaultCrosshair.handler.bind(null, cache));
          globalHotKeys.switchToDefaultCrosshair.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.switchToDefaultCrosshair.isRegistered) {
          await unregister(globalHotKeys.switchToDefaultCrosshair.keys);
          globalHotKeys.switchToDefaultCrosshair.isRegistered = false;
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
  },

  setCurrentCrosshairAsDefault: {
    name: "setCurrentCrosshairAsDefault",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "S"] as ["CommandOrControl", "Alt", "S"],
    keys: ["CommandOrControl", "Alt", "S"],
    handler: (cache: Cache) => {
      cache.setCurrentCrosshairAsDefault();
    },
    async register(cache: Cache) {
      try {
        globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = await isRegistered(globalHotKeys.setCurrentCrosshairAsDefault.keys);
        if (!globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
          await register(globalHotKeys.setCurrentCrosshairAsDefault.keys, globalHotKeys.setCurrentCrosshairAsDefault.handler.bind(null, cache));
          globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
    async unregister() {
      try {
        if (globalHotKeys.setCurrentCrosshairAsDefault.isRegistered) {
          await unregister(globalHotKeys.setCurrentCrosshairAsDefault.keys);
          globalHotKeys.setCurrentCrosshairAsDefault.isRegistered = false;
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
  },

  togglePinned: {
    name: "togglePinned",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "P"] as ["CommandOrControl", "Alt", "P"],
    keys: ["CommandOrControl", "Alt", "P"],
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
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
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
    name: "toggleIgnoreCursorEvents",
    isRegistered: false,
    defaultKeys: [] as [],
    keys: [],
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
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
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

  openMonitor: {
    name: "openMonitor",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "C"] as ["CommandOrControl", "Alt", "C"],
    keys: ["CommandOrControl", "Alt", "C"],
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
      try {
        globalHotKeys.openMonitor.isRegistered = await isRegistered(globalHotKeys.openMonitor.keys);
        if (!globalHotKeys.openMonitor.isRegistered) {
          await register(globalHotKeys.openMonitor.keys, globalHotKeys.openMonitor.handler);
          globalHotKeys.openMonitor.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
      }
    },
    async unregister() {
      if (globalHotKeys.openMonitor.isRegistered) {
        await unregister(globalHotKeys.openMonitor.keys);
        globalHotKeys.openMonitor.isRegistered = false;
      }
    },
  },

  reload: {
    name: "reload",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "R"] as ["CommandOrControl", "Alt", "R"],
    keys: ["CommandOrControl", "Alt", "R"],
    handler: () => {
      relaunch();
    },
    async register() {
      try {
        globalHotKeys.reload.isRegistered = await isRegistered(globalHotKeys.reload.keys);
        if (!globalHotKeys.reload.isRegistered) {
          await register(globalHotKeys.reload.keys, globalHotKeys.reload.handler);
          globalHotKeys.reload.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
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

  exit: {
    name: "exit",
    isRegistered: false,
    defaultKeys: ["CommandOrControl", "Alt", "E"] as ["CommandOrControl", "Alt", "E"],
    keys: ["CommandOrControl", "Alt", "E"],
    handler: () => {
      // 退出前将内存中的配置回写到 config.json
      flushConfigToFile().finally(() => {
        exit();
      });
    },
    async register() {
      try {
        globalHotKeys.exit.isRegistered = await isRegistered(globalHotKeys.exit.keys);
        if (!globalHotKeys.exit.isRegistered) {
          await register(globalHotKeys.exit.keys, globalHotKeys.exit.handler);
          globalHotKeys.exit.isRegistered = true;
        } else {
          const errorText = `Failed to register hotkey of ${this.name}: hotkey_already_registered`;
          console.error();
          emit("register-hotkeys-error", {
            reason: "hotkey_already_registered",
            keys: this.keys,
            action: this.name,
            message: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to register hotkey of ${this.name}:`, error);
        emit("register-hotkeys-error", {
          reason: error,
          keys: this.keys,
          action: this.name,
        })
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
}

export default globalHotKeys;

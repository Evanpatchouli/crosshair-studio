/**
 * 外置配置文件 Hook
 *
 * 架构：
 *   config.json ──(启动加载)──▶ tauri-plugin-share ──(跨窗口同步)──▶ zustand ──(React 渲染)
 *   zustand ──(每次变更)──────▶ tauri-plugin-share + config.json（持久化）
 *
 * - tauri-plugin-share 的 key `app-config` 是跨窗口的单一数据源
 * - zustand 薄层提供响应式 selector（useConfigStore(s => s.config.crosshair.width)）
 * - 每次变更同时写入 share（内存同步）和 config.json（磁盘持久化）
 * - 手动编辑 config.json 需重启应用才能生效（启动时仅读取一次）
 */
import { create } from "zustand";
import { invoke } from "@utils/index";
import { listen } from "@tauri-apps/api/event";
import { set as shareSet, get as shareGet, deserialize } from "@public/plugins/tauri-plugin-share";
import {
  type CrosshairStudioConfig,
  type CrosshairDisplayConfig,
  type BehaviorConfig,
  type HotkeysConfig,
  type HotkeyBinding,
  DEFAULT_CONFIG,
  deepMerge,
} from "@public/config/defaults";

// ── tauri-plugin-share 中的 key ──
const SHARE_KEY = "app-config";
// share 插件广播更新的事件名：plugin:share:update:<key>
const SHARE_UPDATE_EVENT = `plugin:share:update:${SHARE_KEY}`;

// ── Zustand Store ──

interface ConfigStore {
  /** 是否已从文件加载完成 */
  loaded: boolean;
  /** 当前配置 */
  config: CrosshairStudioConfig;
  /** 加载配置（启动时调用一次） */
  load: () => Promise<void>;
  /** 保存配置：写入 share + 磁盘文件 */
  save: (config: CrosshairStudioConfig) => Promise<void>;
  /** 更新准星显示参数 */
  updateCrosshair: (patch: Partial<CrosshairDisplayConfig>) => Promise<void>;
  /** 更新行为参数 */
  updateBehavior: (patch: Partial<BehaviorConfig>) => Promise<void>;
  /** 更新快捷键 */
  updateHotkey: (key: keyof HotkeysConfig, binding: HotkeyBinding) => Promise<void>;
  /** 更新单个标量配置项 */
  updateScalar: <K extends ScalarConfigKeys>(key: K, value: ScalarConfigValue<K>) => Promise<void>;
}

/** 标量配置项（非嵌套对象） */
type ScalarConfigKeys = "enable_system_notification";
type ScalarConfigValue<K> = K extends "enable_system_notification" ? boolean : never;

const useConfigStore = create<ConfigStore>((set, getState) => ({
  loaded: false,
  config: DEFAULT_CONFIG,

  load: async () => {
    try {
      // 1. 先尝试从 tauri-plugin-share 读取（可能已被其他窗口加载）
      let shareConfig: CrosshairStudioConfig | undefined;
      try {
        shareConfig = await shareGet<CrosshairStudioConfig>(SHARE_KEY);
      } catch {
        // share key 不存在，走文件加载
      }

      let config: CrosshairStudioConfig;

      if (shareConfig) {
        // share 中已有数据（来自缓存或其他窗口），直接使用
        config = deepMerge(DEFAULT_CONFIG, shareConfig);
      } else {
        // 2. 从 config.json 磁盘文件加载
        const json = await invoke("load_config");
        const fileConfig = JSON.parse(json) as Partial<CrosshairStudioConfig>;
        config = deepMerge(DEFAULT_CONFIG, fileConfig);

        // 3. 加载后立即写入 share，供其他窗口读取
        await shareSet(SHARE_KEY, config).catch(() => {
          console.warn("Failed to populate share with initial config");
        });
      }

      set({ config, loaded: true });
    } catch (error) {
      console.error("Failed to load config, using defaults:", error);
      // 兜底：用默认值，仍写入 share 确保其他窗口有初值
      await shareSet(SHARE_KEY, DEFAULT_CONFIG).catch(() => {});
      set({ config: { ...DEFAULT_CONFIG }, loaded: true });
    }
  },

  save: async (config: CrosshairStudioConfig) => {
    // 1. 写入 tauri-plugin-share（自动广播到其他窗口）
    try {
      await shareSet(SHARE_KEY, config);
    } catch (error) {
      console.error("Failed to sync config to share:", error);
    }

    // 2. 持久化到磁盘 config.json
    try {
      const json = JSON.stringify(config, null, 2);
      await invoke("save_config", { json });
    } catch (error) {
      console.error("Failed to save config to file:", error);
      throw error;
    }

    set({ config });
  },

  updateCrosshair: async (patch: Partial<CrosshairDisplayConfig>) => {
    const state = getState();
    const newConfig: CrosshairStudioConfig = {
      ...state.config,
      crosshair: { ...state.config.crosshair, ...patch },
    };
    await state.save(newConfig);
  },

  updateBehavior: async (patch: Partial<BehaviorConfig>) => {
    const state = getState();
    const newConfig: CrosshairStudioConfig = {
      ...state.config,
      behavior: { ...state.config.behavior, ...patch },
    };
    await state.save(newConfig);
  },

  updateHotkey: async (key: keyof HotkeysConfig, binding: HotkeyBinding) => {
    const state = getState();
    const newConfig: CrosshairStudioConfig = {
      ...state.config,
      hotkeys: { ...state.config.hotkeys, [key]: binding },
    };
    await state.save(newConfig);
  },

  updateScalar: async <K extends ScalarConfigKeys>(key: K, value: ScalarConfigValue<K>) => {
    const state = getState();
    const newConfig: CrosshairStudioConfig = {
      ...state.config,
      [key]: value,
    };
    await state.save(newConfig);
  },
}));

// ── 跨窗口同步：监听 tauri-plugin-share 的广播更新 ──
let syncUnlisten: (() => void) | null = null;

async function ensureSyncListener() {
  if (syncUnlisten) return;
  try {
    // share 插件通过 Tauri 事件 plugin:share:update:<key> 广播变更
    const unlisten = await listen<string>(SHARE_UPDATE_EVENT, (event) => {
      const newConfig = deserialize(event.payload) as CrosshairStudioConfig;
      if (newConfig && typeof newConfig === "object") {
        useConfigStore.setState({ config: newConfig });
      }
    });
    syncUnlisten = unlisten;
  } catch {
    // 事件监听失败不影响使用（单窗口场景）
  }
}

// ── 导出 ──

/** 获取当前配置快照（用于非 React 上下文） */
export function getConfigSnapshot(): CrosshairStudioConfig {
  return useConfigStore.getState().config;
}

/**
 * 将当前内存中的配置强制写回磁盘 config.json。
 * 用于应用退出前的最终保存。
 */
export async function flushConfigToFile(): Promise<void> {
  const config = useConfigStore.getState().config;
  try {
    const json = JSON.stringify(config, null, 2);
    await invoke("save_config", { json });
  } catch (error) {
    console.error("Failed to flush config to file on exit:", error);
  }
}

export { useConfigStore, ensureSyncListener };
export type { ConfigStore };

/**
 * Crosshair Studio 外置配置文件 — 类型定义与默认值
 *
 * 配置文件存放路径：{appDir}/config.json
 * 用户可手动编辑此文件来调整准星参数和快捷键绑定
 */

// ── 快捷键值类型 ──
export type HotkeyBinding = string[];

// ── 准星显示参数 ──
export interface CrosshairDisplayConfig {
  /** 准星图片宽度 (px)，范围 0-400 */
  width: number;
  /** 准星图片高度 (px)，范围 0-400 */
  height: number;
  /** 宽高比是否联动锁定 */
  lock_ratio: boolean;
  /** 画布尺寸 (px)，范围 0-400 */
  canvas_size: number;
  /** 画布形状：矩形或圆形 */
  canvas_shape: "rect" | "circle";
  /** 是否启用反色滤镜 */
  enable_invert_filter: boolean;
}

// ── 行为参数 ──
export interface BehaviorConfig {
  /** 鼠标穿透（不阻挡其他窗口的点击） */
  ignore_cursor_events: boolean;
  /** 窗口始终置顶 */
  always_on_top: boolean;
  /** 准星图片目录，支持 ${APP_DIR} 占位符 */
  crosshair_directory: string;
  /** 默认准星文件名（空字符串表示无默认） */
  default_crosshair: string;
}

// ── 快捷键映射 ──
export interface HotkeysConfig {
  /** 切换准星 — 默认 Ctrl+Alt+Q */
  switch_crosshair: HotkeyBinding;
  /** 置顶开关 — 默认 Ctrl+Alt+P */
  toggle_pinned: HotkeyBinding;
  /** 鼠标穿透开关 — 默认无快捷键 */
  toggle_ignore_cursor_events: HotkeyBinding;
  /** 切换到默认准星 — 默认 Ctrl+Alt+D */
  switch_to_default_crosshair: HotkeyBinding;
  /** 设为默认准星 — 默认 Ctrl+Alt+S */
  set_current_crosshair_as_default: HotkeyBinding;
  /** 打开控制台 — 默认 Ctrl+Alt+C */
  open_monitor: HotkeyBinding;
  /** 重启应用 — 默认 Ctrl+Alt+R */
  reload: HotkeyBinding;
  /** 退出应用 — 默认 Ctrl+Alt+E */
  exit: HotkeyBinding;
}

// ── 完整配置 ──
export interface CrosshairStudioConfig {
  /** 配置文件版本号，用于后续兼容性迁移 */
  version: string;
  /** 准星显示参数 */
  crosshair: CrosshairDisplayConfig;
  /** 行为参数 */
  behavior: BehaviorConfig;
  /** 快捷键绑定 */
  hotkeys: HotkeysConfig;
  /** 系统通知开关 */
  enable_system_notification: boolean;
}

// ── 默认配置 ──
export const DEFAULT_CONFIG: CrosshairStudioConfig = {
  version: "1.0",
  crosshair: {
    width: 200,
    height: 200,
    lock_ratio: true,
    canvas_size: 200,
    canvas_shape: "rect",
    enable_invert_filter: false,
  },
  behavior: {
    ignore_cursor_events: true,
    always_on_top: true,
    crosshair_directory: "${APP_DIR}/crosshairs",
    default_crosshair: "",
  },
  hotkeys: {
    switch_crosshair: ["CommandOrControl", "Alt", "Q"],
    toggle_pinned: ["CommandOrControl", "Alt", "P"],
    toggle_ignore_cursor_events: [],
    switch_to_default_crosshair: ["CommandOrControl", "Alt", "D"],
    set_current_crosshair_as_default: ["CommandOrControl", "Alt", "S"],
    open_monitor: ["CommandOrControl", "Alt", "C"],
    reload: ["CommandOrControl", "Alt", "R"],
    exit: ["CommandOrControl", "Alt", "E"],
  },
  enable_system_notification: false,
};

/**
 * 深度合并：用 source 中的值覆盖 target 中对应字段。
 * source 中不存在的字段保留 target 原值。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== undefined &&
      sv !== null &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      typeof tv === "object" &&
      !Array.isArray(tv) &&
      tv !== null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as Record<string, any>)[key as string] = deepMerge(
        tv as Record<string, any>,
        sv as Record<string, any>
      );
    } else if (sv !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as Record<string, any>)[key as string] = sv;
    }
  }
  return result;
}

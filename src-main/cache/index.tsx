import toast from "react-hot-toast";
import { create } from "zustand";
import { getMainWindow, getNameOfFilePath } from "@utils/index";
import { useConfigStore } from "@public/hooks/useConfig";

export type Cache = {
  isInitiated: boolean;
  setIsInitiated: (bool: boolean) => void;
  isAlwaysOnTop: boolean;
  setAlwaysOnTop: (value: boolean) => void;
  toggleAlwaysOnTop(options?: { onTop?: () => void; offTop?: () => void }): void;
  ignoreCursorEvents: boolean;
  setIgnoreCursorEvents: (value: boolean) => void;
  toggleIgnoreCursorEvents: () => void;
  crosshair_dictionary: string;
  set_crosshair_dictionary: (value: string) => void;
  imglist: string[];
  setImglist: (value: string[]) => void;
  isQueryingImgs: boolean;
  setIsQueryingImgs: (value: boolean) => void;
  cur: string;
  setCur: (value: string) => void;
  switchCrosshair: () => void;
  defaultCrosshair?: string;
  setDefaultCrosshair: (value?: string, silence?: boolean) => void;
  setCurrentCrosshairAsDefault: () => void;
  switchToCrosshairByPath: (filepath?: string) => void;
  switchToDefaultCrosshair: () => void;
};

const useCache = create<Cache>((set, getState) => ({
  isInitiated: false,
  setIsInitiated: (bool: boolean) => set(() => ({ isInitiated: bool })),
  ignoreCursorEvents: true,
  setIgnoreCursorEvents: (value: boolean) => set(() => ({ ignoreCursorEvents: value })),
  toggleIgnoreCursorEvents: () => {
    set((state) => {
      const newValue = !state.ignoreCursorEvents;
      queueMicrotask(() => {
        getMainWindow()?.setIgnoreCursorEvents(newValue);
        useConfigStore.getState().updateBehavior({ ignore_cursor_events: newValue });
      });
      return { ignoreCursorEvents: newValue };
    });
  },
  isAlwaysOnTop: true,
  setAlwaysOnTop: (value: boolean) => set(() => ({ isAlwaysOnTop: value })),
  toggleAlwaysOnTop: (options) =>
    set((state) => {
      const newValue = !state.isAlwaysOnTop;
      if (newValue) {
        options?.onTop?.();
      } else {
        options?.offTop?.();
      }
      queueMicrotask(() => {
        useConfigStore.getState().updateBehavior({ always_on_top: newValue });
      });
      return { isAlwaysOnTop: newValue };
    }),
  crosshair_dictionary: "",
  set_crosshair_dictionary: (value: string) => set(() => ({ crosshair_dictionary: value })),
  imglist: [],
  setImglist: (value: string[]) => set(() => ({ imglist: value })),
  isQueryingImgs: true,
  setIsQueryingImgs: (value: boolean) => set(() => ({ isQueryingImgs: value })),
  cur: "",
  setCur: (value: string) => set(() => ({ cur: value })),
  switchCrosshair: () => {
    set((state) => {
      const idx = state.imglist.findIndex((i) => i === state.cur);
      if (idx === -1) {
        return state;
      }
      const next_idx = (idx + 1) % state.imglist.length;
      return { cur: state.imglist[next_idx] };
    });
  },
  defaultCrosshair: "",
  setDefaultCrosshair: (value?: string, silence: boolean = false) => {
    set(() => ({ defaultCrosshair: value }));
    // 同步到配置文件
    if (value !== undefined) {
      useConfigStore.getState().updateBehavior({ default_crosshair: value });
    }
    if (value && !silence) {
      toast.success(`设置默认准星成功`);
    } else {
      !silence &&
        toast("未提供准星路径", {
          icon: "⚠️",
          style: {
            borderRadius: "10px",
            background: "#fff",
            color: "#f90",
          },
        });
    }
  },
  setCurrentCrosshairAsDefault: () => {
    const state = getState();
    if (state.imglist.length === 0) {
      toast("当前无准星可应用", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#f90",
        },
      });
      return;
    }
    const default_crosshair = state.cur;
    useConfigStore.getState().updateBehavior({ default_crosshair: default_crosshair });
    state.setDefaultCrosshair(default_crosshair);
  },
  switchToCrosshairByPath: (filepath?: string) => {
    const state = getState();
    const idx = state.imglist.findIndex((i) => i === filepath);
    if (idx === -1) {
      toast.error(`准星 ${getNameOfFilePath(filepath || "")} 不存在`);
      return;
    }
    set(() => ({ cur: filepath }));
  },
  switchToDefaultCrosshair: () => {
    const state = getState();
    if (!state.defaultCrosshair) {
      set(() => ({ cur: state.imglist[0] })); // 默认准星不存在时，切换到第一个准星
      return;
    }
    const idx = state.imglist.findIndex((i) => i === state.defaultCrosshair);

    if (idx === -1) {
      toast.error(`默认准星 ${getNameOfFilePath(state.defaultCrosshair)} 不存在`);
      return;
    }
    set(() => ({ cur: state.defaultCrosshair }));
  },
}));

export default useCache;

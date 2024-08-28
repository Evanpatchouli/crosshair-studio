import toast from "react-hot-toast";
import { create } from "zustand";
import { getMainWindow, getNameOfFilePath } from "@utils/index";
import store from "../store";

export type Cache = {
  isInitiated: boolean;
  setIsInitiated: (bool: boolean) => void;
  isAlwaysOnTop: boolean;
  toggleAlwaysOnTop(options?: { onTop?: () => void; offTop?: () => void }): void;
  ignoreCursorEvents: boolean;
  toggleIgnoreCursorEvents: () => void;
  crosshair_dictionary: string;
  set_crosshair_dictionary: (value: string) => void;
  imglist: string[];
  setImglist: (value: string[]) => void;
  isQueryingImgs: boolean;
  setIsQueryingImgs: (value: boolean) => void;
  idx: number;
  setIdx: (value: number) => void;
  switchIdx: () => void;
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
  toggleIgnoreCursorEvents: () => {
    set((state) => ({ ignoreCursorEvents: !state.ignoreCursorEvents }));
    queueMicrotask(() => {
      getMainWindow()?.setIgnoreCursorEvents(getState().ignoreCursorEvents);
      store.set("ignoreCursorEvents", getState().ignoreCursorEvents);
    });
  },
  isAlwaysOnTop: true,
  toggleAlwaysOnTop: (options) =>
    set((state) => {
      if (state.isAlwaysOnTop) {
        options?.offTop?.();
      } else {
        options?.onTop?.();
      }
      return { isAlwaysOnTop: !state.isAlwaysOnTop };
    }),
  crosshair_dictionary: "",
  set_crosshair_dictionary: (value: string) => set(() => ({ crosshair_dictionary: value })),
  imglist: [],
  setImglist: (value: string[]) => set(() => ({ imglist: value })),
  isQueryingImgs: true,
  setIsQueryingImgs: (value: boolean) => set(() => ({ isQueryingImgs: value })),
  idx: 0,
  setIdx: (value: number) => set(() => ({ idx: value })),
  switchIdx: () =>
    set((state) => {
      state.idx = (state.idx + 1) % state.imglist.length;
      return { idx: state.idx };
    }),
  defaultCrosshair: "",
  setDefaultCrosshair: (value?: string, silence: boolean = false) => {
    set(() => ({ defaultCrosshair: value }));
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
    const default_crosshair = state.imglist[state.idx];
    store.set("default_crosshair", default_crosshair);
    state.setDefaultCrosshair(default_crosshair);
  },
  switchToCrosshairByPath: (filepath?: string) => {
    const state = getState();
    const idx = state.imglist.findIndex((i) => i === filepath);
    if (idx === -1) {
      toast.error(`准星 ${getNameOfFilePath(filepath || "")} 不存在`);
      return;
    }
    set(() => ({ idx: idx }));
  },
  switchToDefaultCrosshair: () => {
    const state = getState();
    if (!state.defaultCrosshair) {
      set(() => ({ idx: 0 })); // 默认准星不存在时，切换到第一个准星
      return;
    }
    const idx = state.imglist.findIndex((i) => i === state.defaultCrosshair);

    if (idx === -1) {
      toast.error(`默认准星 ${getNameOfFilePath(state.defaultCrosshair)} 不存在`);
      return;
    }
    set(() => ({ idx: idx }));
  },
}));

export default useCache;

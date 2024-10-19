import { Store } from "tauri-plugin-store-api";

const store = new Store("crosshair-studio") as AppStore<StoreState>;

// Auto save state
store.onChange(() => {
  store.save();
});

export default store;

type StoreState = {
  not_first_run: boolean;
  version: string;
  crosshair_dictionary: string;
  default_crosshair?: string;
  ignoreCursorEvents: boolean;
  schemes: ICrosshairScheme[];
  hotkeys_togglePinned: string[]
  hotkeys_toggleIgnoreCursorEvents: string[];
  hotkeys_switchToDefaultCrosshair: string[];
  hotkeys_setCurrentCrosshairAsDefault: string[];
  hotkeys_switchCrosshair: string[];
  hotkeys_exit: string[];
  hotkeys_reload: string[];
  hotkeys_openMonitor: string[];
};

// @ts-ignore
export interface AppStore<S extends Record> extends Store {
  get<V extends S[K], K extends keyof S>(key: K): Promise<V>;
  set<V extends S[K], K extends keyof S>(key: K, value: V): Promise<void>;
}

async function getScheme(): Promise<ICrosshairScheme[]>;
async function getScheme<ID = string>(id: ID): Promise<ID extends string ? ICrosshairScheme : ICrosshairScheme[]>;
// 实现函数
async function getScheme<ID = string>(id?: ID): Promise<ICrosshairScheme | ICrosshairScheme[]> {
  const currentSchemes: ICrosshairScheme[] = await store.get('schemes');

  if (id) {
    return currentSchemes.find((s) => s.id === id) as ICrosshairScheme;
  }

  return currentSchemes;
}

export const schemes = {
  get: getScheme,
  async set(schemes: ICrosshairScheme[]) {
    await store.set("schemes", schemes);
  },
  async add(scheme: ICrosshairScheme) {
    const currentSchemes = await schemes.get();
    if (currentSchemes.some((s) => s.id === scheme.id)) {
      throw new Error(`Scheme with id ${scheme.id} already exists`);
    }
    await schemes.set([...currentSchemes, scheme]);
  },
  async remove(id: string) {
    const currentSchemes = await schemes.get();
    await schemes.set(currentSchemes.filter((scheme) => scheme.id !== id));
  },
  async update(scheme: ICrosshairScheme) {
    const currentSchemes = await schemes.get();
    const index = currentSchemes.findIndex((s) => s.id === scheme.id);
    if (index === -1) {
      throw new Error(`Scheme with id ${scheme.id} not found`);
    }
    await schemes.set([
      ...currentSchemes.slice(0, index),
      scheme,
      ...currentSchemes.slice(index + 1)
    ]);
  },
  async all() {
    return await schemes.get();
  }
} as const;

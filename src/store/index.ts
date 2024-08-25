import { Store } from "tauri-plugin-store-api";

const store = new Store("crosshair-studio") as AppStore<StoreState>;

// Auto save state
store.onChange(() => {
  store.save();
});

export default store;

type StoreState = {
  version: string;
  crosshair_dictionary: string;
  default_crosshair?: string;
};

// @ts-ignore
export interface AppStore<S extends Record> extends Store {
  get<V extends S[K], K extends keyof S>(key: K): Promise<V>;
  set<V extends S[K], K extends keyof S>(key: K, value: V): Promise<void>;
}

import { createWithEqualityFn } from "zustand/traditional";

type Cache = {
  set: (partial: Partial<Record<string, any>>) => void;
  get: () => Record<string, any>
  [key: string]: any;
}

const useCache = createWithEqualityFn<Cache>((set, get) => {
  return {
    set,
    get,
    locale_messages: {}
  }
});

export default useCache;
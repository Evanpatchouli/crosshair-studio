import React from "react";

type SV = string | number | object | boolean | null | undefined;

export function dispatchStorageEvent<V extends SV = SV>(key: string, newValue: V) {
  window.dispatchEvent(new StorageEvent("storage", {
    key, newValue: newValue as any
  }));
}

export const setLocalStorageItem = <V extends SV = SV>(key: string, value: V) => {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

export const removeLocalStorageItem = (key: string) => {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

export const getLocalStorageItem = (key: string) => {
  return window.localStorage.getItem(key);
};

type StorageCallback = (e: StorageEvent) => void;

const useLocalStorageSubscribe = (callback: StorageCallback) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getLocalStorageServerSnapshot = () => {
  throw Error("useLocalStorage is a client-only hook");
};

export default function useLocalStorage<V extends SV = SV>(key: string, initialValue?: V)
  : [V, React.Dispatch<React.SetStateAction<V>>] {
  const getSnapshot = () => getLocalStorageItem(key);

  const store = React.useSyncExternalStore(
    useLocalStorageSubscribe,
    getSnapshot,
    getLocalStorageServerSnapshot
  );

  const setState = React.useCallback(
    (v: any) => {
      try {
        const nextState = typeof v === "function" ? v(store ? JSON.parse(store) : null) : v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store]
  );

  React.useEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      typeof initialValue !== "undefined"
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [store ? JSON.parse(store) : initialValue, setState];
}

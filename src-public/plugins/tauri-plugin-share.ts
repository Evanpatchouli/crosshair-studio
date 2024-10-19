import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import React from "react";

function cmd(extra: string) {
  return "plugin:share|" + extra;
}

function evt(event: string) {
  return "plugin:share:" + event;
}

const unsupportedTypes = ["symbol", "function"];
export function serialize(value: any) {
  if (unsupportedTypes.includes(typeof value)) {
    throw new Error("[tauri-plugin-share|api] Unsupported value type");
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new Error("[tauri-plugin-share|api] Serialization failed: " + (error as Error).message);
  }
}

export function deserialize(value: string) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("[tauri-plugin-share|api] Deserialization failed, returning original value: " + (error as Error).message);
    return value;
  }
}

export type RegisterOptions = {
  if_not_exists?: boolean;
  broadcast?: boolean;
}

const defaultRegisterOptions: RegisterOptions = {
  if_not_exists: false,
  broadcast: false,
}

type ValueSetter<T = any> = (prev: T) => T;

export async function register<T = any>(key: string, value: T, options: RegisterOptions = defaultRegisterOptions) {
  try {
    await invoke(cmd("register"), { key, val: value, ifNotExists: options.if_not_exists || false, broadcast: options.broadcast || false });
  } catch (error) {
    console.error(`[tauri-plugin-share|api] Failed to register key: ${key}`, error);
  }
}

export async function set<T = any>(key: string, value: T) {
  try {
    let v = typeof value === 'function' ? value() : value;
    const serializedValue = serialize(v);
    await invoke(cmd("update"), { key, val: serializedValue });
  } catch (error) {
    console.error(`[tauri-plugin-share|api] Failed to update key: ${key}`, error);
  }
}

type ShareOptions = {
  /** register the key if it does not exist
   * @default true
   */
  register_if_not_exists: boolean
  /** remove the key when the component unmounts
   * @default false
   */
  remove_on_unmounted: boolean
  /**
   * @default false
   */
  shallow?: boolean
}

/**  Asynchronously state share hook between components and windows. */
export function useShare<T = any>(key: string, value?: T | undefined, options?: Partial<ShareOptions>) {
  const initialValue = typeof value === 'function' ? value() : value;
  const shareOptions = {
    register_if_not_exists: options?.register_if_not_exists ?? true,
    remove_on_unmounted: options?.remove_on_unmounted ?? false,
    shallow: options?.shallow ?? false,
  }
  if (unsupportedTypes.includes(typeof initialValue)) {
    throw new Error("[tauri-plugin-share|api] Unsupported value type");
  }
  const [v, setV] = React.useState<T>(initialValue);
  const unlistenRef = React.useRef<Function | null>(null);

  const initialize = async () => {
    const unlistenFn = await listen(evt('update:' + key), (e) => {
      setV(deserialize(e.payload as string) as T);
    });
    unlistenRef.current = unlistenFn;
    if ((await get<T>(key) === void 0) && typeof initialValue !== 'undefined' && shareOptions.register_if_not_exists) {
      await set(key, initialValue);
    }
    const val = await get<T>(key);
    setV(val);
  }

  React.useEffect(() => {
    initialize();
    return () => {
      unlistenRef.current?.();
      if (shareOptions.remove_on_unmounted) {
        remove(key);
      }
    }
  }, []);

  const setVal = async (value: T | ((prev: T) => T)) => {
    let newValue = typeof value === 'function' ? (value as ValueSetter)(v) : value;
    let shouldUpdate = false;

    if (shareOptions.shallow) {
      shouldUpdate = JSON.stringify(v) !== JSON.stringify(newValue);
    } else {
      shouldUpdate = !Object.is(v, newValue);
    }

    if (shouldUpdate) {
      await set(key, newValue);
    }
  }

  return [v, setVal] as const;
}

export async function get<T, Deserialize extends boolean | undefined = true>(
  key: string,
  is_deserialize: Deserialize = true as Deserialize
): Promise<Deserialize extends true ? T : Deserialize extends undefined ? T : string> {
  const val: string = await invoke(cmd("request"), { key });
  if (!is_deserialize) {
    return val as Deserialize extends true ? T : Deserialize extends undefined ? T : string;
  }
  return deserialize(val) as Deserialize extends true ? T : Deserialize extends undefined ? T : string;
}

export function useConsume<T>(key: string) {
  const [v, setV] = React.useState<T>();
  const unlistenRef = React.useRef<Function | null>(null);
  const initialize = async () => {
    const unlistenFn = await listen(evt('update:' + key), (e) => {
      setV(deserialize(e.payload as string) as T);
    });
    unlistenRef.current = unlistenFn;
    const val = await get<T>(key);
    setV(val);
  }
  React.useEffect(() => {
    initialize();
    return () => {
      unlistenRef.current?.();
    }
  }, [key]);
  return v;
}

export async function has(key: string): Promise<boolean> {
  return await invoke(cmd("has"), { key });
}

export async function keys(): Promise<string[]> {
  return await invoke(cmd("keys"));
}

export async function clear() {
  await invoke(cmd("clear"));
}

export async function remove(key: string) {
  await invoke(cmd("remove"), { key });
}

export async function values<Deserialize extends boolean | undefined = true>(
  is_deserialize: Deserialize = true as Deserialize
): Promise<Deserialize extends true ? any[] : Deserialize extends undefined ? any[] : string[]> {
  const valueStrings: string[] = await invoke(cmd("values")) || [];
  if (!is_deserialize) {
    return valueStrings as Deserialize extends true ? any[] : Deserialize extends undefined ? any[] : string[];
  }
  return valueStrings.map(i => deserialize(i)) as Deserialize extends true ? any[] : Deserialize extends undefined ? any[] : string[];
}

export async function size(): Promise<number> {
  return await invoke(cmd("size"));
}

export async function mapping<Deserialize extends boolean | undefined = true>(
  is_deserialize: Deserialize = true as Deserialize
): Promise<Deserialize extends true ? Record<string, any> : Deserialize extends undefined ? Record<string, any> : Record<string, string>> {
  const result: Record<string, string> = await invoke(cmd("mapping")) || {};
  if (!is_deserialize) {
    return result as Deserialize extends true ? Record<string, any> : Deserialize extends undefined ? Record<string, any> : Record<string, string>;
  }
  const deserializedResult: Record<string, any> = {};
  for (const key in result) {
    deserializedResult[key] = deserialize(result[key]);
  }
  return deserializedResult as Deserialize extends true ? Record<string, any> : Deserialize extends undefined ? Record<string, any> : Record<string, string>;
}

export async function entries<Deserialize extends boolean | undefined = true>(
  is_deserialize: Deserialize = true as Deserialize
): Promise<Deserialize extends true ? [string, any][] : Deserialize extends undefined ? [string, any][] : [string, string][]> {
  const result: [string, string][] = await invoke(cmd("entries")) || [];
  if (!is_deserialize) {
    return result as Deserialize extends true ? [string, any][] : Deserialize extends undefined ? [string, any][] : [string, string][];
  }
  return result.map(([key, value]) => [key, deserialize(value)]) as Deserialize extends true ? [string, any][] : Deserialize extends undefined ? [string, any][] : [string, string][];
}


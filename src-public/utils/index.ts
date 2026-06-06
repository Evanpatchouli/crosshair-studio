import {
  register as tauriRegister,
  unregister as tauriUnRegister,
  isRegistered as tauriIsRegister,
} from "@tauri-apps/api/globalShortcut";
import { invoke as tauriInvoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { schemes } from "@public/store";
import { set } from "@public/plugins/tauri-plugin-share";
import { toast } from '../../src-monitor/utils/index';

export function checkIsDev() {
  // const isDev = await invoke("is_dev");  // deprecated
  const isDev = import.meta.env.DEV;
  return isDev ? true : false;
}

export const blobType: {
  [key: string]: string;
} = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export const webFiles = ["txt", "url"];

export function getExtOfFile(fileName: string): string {
  return (fileName || "").split(".").pop() || "";
}

export function getNameOfFilePath(filePath: string): string {
  return (filePath || "").split(/[/\\]/).pop() || "";
}

export function getNameWithoutExt(filePath: string): string {
  return getNameOfFilePath(filePath).replace(/\.\w+$/, "");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type InvokeMap = {
  get_images_from_directory: {
    args: { directory: string, extensions: string[] };
    returns: ImageInfo[];
  };
  read_image: {
    args: { path: string };
    returns: ArrayBufferLike;
  };
  delete_image: {
    args: { path: string };
    returns: void;
  }
  get_appdir: {
    args: undefined;
    returns: string;
  };
  is_dev: {
    args: undefined;
    returns: boolean;
  };
  log: {
    args: {
      level: LogLevel,
      msg: string
    }
    returns: void;
  };
  open_directory_in_fs: {
    args: { path: string };
    returns: void;
  };
  get_locales: {
    args: undefined;
    returns: Record<string, string>;
  };
  get_locale_messages: {
    args: { locale: string };
    returns: Record<string, string>;
  },
  create_text_crosshair: {
    args: { path: string, content: string };
    returns: void;
  };
  create_url_crosshair: {
    args: { path: string, content: string };
    returns: void;
  };
  load_config: {
    args: undefined;
    returns: string;
  };
  save_config: {
    args: { json: string };
    returns: void;
  };
};

/**
 * ### read_image
 * @returns {ArrayBufferLike}
 * @text_format
 *
 * - "txt": url
 * - "url":
 * ```text
 * [InternetShortcut]
 * URL=https://v1.tauri.app/meta/tauri_logo_light.svg
 * ```
 */
export async function invoke<T extends InvokeMap[K]["returns"], K extends keyof InvokeMap>(
  cmd: K,
  args?: InvokeMap[K]["args"],
  catchError?: boolean,
  $?: Function
): Promise<InvokeMap[K]["returns"]> {
  if (catchError) {
    try {
      return await tauriInvoke<T>(cmd, args);
    } catch (error) {
      const err = error as Error;
      console.error("invoke error", cmd, args, err);
      toast.error(err.message || err.name || (typeof err === "string" ? err : $ ? $("Unknown error") : "Unknown error"));
      return null as any;
    }
  } else {
    return tauriInvoke<T>(cmd, args);
  }
}

export async function register(keys: KeyNames[] | readonly KeyNames[], callback: () => void) {
  const cmd = keys.join("+");
  return tauriRegister(cmd, callback);
}

export async function unregister(keys: KeyNames[] | readonly KeyNames[]) {
  const cmd = keys.join("+");
  return tauriUnRegister(cmd);
}

export async function isRegistered(keys: KeyNames[] | readonly KeyNames[]) {
  const cmd = keys.join("+");
  return await tauriIsRegister(cmd);
}

export function getMainWindow() {
  const mainwindow = WebviewWindow.getByLabel("main")
  return mainwindow;
}

export function getMonitorWindow() {
  const mainwindow = WebviewWindow.getByLabel("monitor")
  return mainwindow;
}

export function classes(classNames: (string | number | undefined)[], excludeZero: boolean = false) {
  return classNames
    .filter(name => {
      if (typeof name === 'string') {
        return name.trim();
      }
      if (excludeZero && name === 0) {
        return false;
      }
      return name;
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ');
}


export function xmlToJson(xml: any): any {
  if (typeof xml === 'string') {
    xml = new DOMParser().parseFromString(xml, 'application/xml');
  }

  function parseNode(node: any): any {
    const obj: any = {};

    if (node.nodeType === 1) { // 元素节点
      if (node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < node.attributes.length; j++) {
          const attribute = node.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (node.nodeType === 3) { // 文本节点
      return node.nodeValue.trim();
    }

    if (node.hasChildNodes()) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes.item(i);
        const nodeName = childNode.nodeName;
        const childObj = parseNode(childNode);

        if (childObj !== '') {
          if (obj[nodeName] === undefined) {
            obj[nodeName] = childObj;
          } else {
            if (Array.isArray(obj[nodeName])) {
              obj[nodeName].push(childObj);
            } else {
              obj[nodeName] = [obj[nodeName], childObj];
            }
          }
        }
      }
    }

    // 替换包含 #text 的对象为其值
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && '#text' in obj[key]) {
        obj[key] = obj[key]['#text'];
      }
    }

    return obj;
  }

  const json = parseNode(xml.documentElement);
  return json;
}

export async function watchCrosshairs(callback: (images: ImageInfo[]) => void) {
  const unlisten = await listen<ImageInfo[]>('crosshairs', (e) => {
    callback(e.payload);
  });
  return unlisten;
}

const NumericExp = new RegExp(/^\d+$/);
export const isNumeric = (str: string) => NumericExp.test(str);

export const images_sorter = (a: object & { name: string }, b: object & { name: string }) => {
  const name_a = getNameWithoutExt(a.name);
  const name_b = getNameWithoutExt(b.name);
  const isNumericA = isNumeric(name_a);
  const isNumericB = isNumeric(name_b);

  if (isNumericA && isNumericB) {
    return parseInt(name_a) - parseInt(name_b);
  } else if (isNumericA) {
    return -1;
  } else if (isNumericB) {
    return 1;
  } else {
    return name_a.localeCompare(name_b);
  }
}

export const syncShareSchemes = async () => {
  try {
    const list = await schemes.all();
    set("crosshair-schemes", list);
  } catch (error) {
    console.error("Failed to sync schemes", error);
  }
};

export const getColorScheme = () => {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

/**
 * @format 1.0.0 | v1.0.0 | v1.0.0-beta
 * @suffix `alpha` < `beta` < `rc` < `release` = ""
 */
export const compareVersion = (v1: string, v2: string): number => {
  console.log("compareVersion", v1, v2);
  const parseVersion = (version: string) => {
    const [main, suffix] = version.split("-");
    const [major, minor, patch] = main.split(".").map(Number);
    return { major, minor, patch, suffix: suffix || "" };
  };

  const suffixOrder = ["alpha", "beta", "rc", "release", ""];

  const v1Parsed = parseVersion(v1);
  const v2Parsed = parseVersion(v2);

  if (v1Parsed.major !== v2Parsed.major) {
    return v1Parsed.major - v2Parsed.major;
  }
  if (v1Parsed.minor !== v2Parsed.minor) {
    return v1Parsed.minor - v2Parsed.minor;
  }
  if (v1Parsed.patch !== v2Parsed.patch) {
    return v1Parsed.patch - v2Parsed.patch;
  }

  const v1SuffixIndex = suffixOrder.indexOf(v1Parsed.suffix);
  const v2SuffixIndex = suffixOrder.indexOf(v2Parsed.suffix);

  return v1SuffixIndex - v2SuffixIndex;
};

export const validateURL = (str: string): boolean => {
  const urlRegex = /(https?:\/\/)?[-a-zA-Z0-9.@:%_+~#=]{1,256}\.[a-zA-Z0-9.-]{1,63}\b([-a-zA-Z0-9@:%_+.~#?&\/]*)?/g;
  return urlRegex.test(str);
};
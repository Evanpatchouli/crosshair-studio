import {
  register as tauriRegister,
  unregister as tauriUnRegister,
  isRegistered as tauriIsRegister,
} from "@tauri-apps/api/globalShortcut";
import { invoke as tauriInvoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";

export function getExtOfFile(fileName: string): string {
  return (fileName || "").split(".").pop() || "";
}

export function getNameOfFilePath(filePath: string): string {
  return (filePath || "").split(/[/\\]/).pop() || "";
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type InvokeMap = {
  get_images_from_directory: {
    args: { directory: string };
    returns: string[];
  };
  read_image: {
    args: { path: string };
    returns: ArrayBufferLike;
  };
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
  }
};

export async function invoke<T extends InvokeMap[K]["returns"], K extends keyof InvokeMap>(
  cmd: K,
  args?: InvokeMap[K]["args"]
): Promise<InvokeMap[K]["returns"]> {
  return tauriInvoke<T>(cmd, args);
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
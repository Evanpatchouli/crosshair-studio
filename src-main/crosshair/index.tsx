import toast from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import useAsyncEffect from "../hooks/useAsyncEffect";
import { getExtOfFile, getMainWindow, invoke } from "../utils";
import useCache from "../cache";
import unknownSvg from "/unknown.svg";
import "./index.css";
import { path } from "@tauri-apps/api";
import React from "react";

const blobType: {
  [key: string]: string;
} = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export default function Crosshair() {
  const { imglist, isQueryingImgs, idx, switchIdx, ...cache } = useCache();
  const pinWindow = async () => {
    cache.toggleAlwaysOnTop({
      onTop() {
        toast.success("固定顶层");
      },
      offTop() {
        toast.success("取消固定");
      },
    });
  };
  const handleClick: React.MouseEventHandler<HTMLImageElement> = (e) => {
    e.stopPropagation();
    switch (e.detail) {
      case 2: {
        pinWindow();
        break;
      }
      default:
        break;
    }
  }; //data-tauri-drag-region

  // const crossfairs = Array.from({ length: 7 }, (_, i) => `./crosshairs/${i + 1}.png`);
  useEffect(() => {
    getMainWindow()?.setAlwaysOnTop(cache.isAlwaysOnTop);
  }, [cache.isAlwaysOnTop]);

  const [imgsrc, setImgsrc] = useState<string>("");

  const queryImg = async (idx?: number) => {
    if (!imglist[idx || 0]) {
      return Promise.reject("no img");
    }
    const filePath = await path.resolve(cache.crosshair_dictionary, imglist[idx || 0]);
    const data = await invoke("read_image", {
      path: filePath,
    }); // 字节数组
    if (data) {
      // 设置为图片 blobType[getExtOfFile(imglist[idx || 0])]
      const blob = new Blob([new Uint8Array(data)], {
        type: blobType[getExtOfFile(imglist[idx || 0])],
      });
      const url = URL.createObjectURL(blob);
      setImgsrc(url);
    }
  };

  useAsyncEffect(async () => {
    const unlinsten_switch_cross = await listen("switch_cross", () => {
      switchIdx();
    });
    const unlisten_switch_to_default_cross = await listen("switch_to_default_cross", () => {
      cache.switchToDefaultCrosshair();
    });
    const unlisten_set_as_default_cross = await listen("set_as_default_cross", () => {
      cache.setCurrentCrosshairAsDefault();
    });
    const unlisten_toggle_ignore_cursor_event = await listen("toggle_ignore_cursor_event", () => {
      cache.toggleIgnoreCursorEvents();
    });
    const unlisten = () => {
      unlinsten_switch_cross();
      unlisten_switch_to_default_cross();
      unlisten_set_as_default_cross();
      unlisten_toggle_ignore_cursor_event();
    };
    return unlisten;
  }, [idx, imglist.length]);

  useAsyncEffect(async () => {
    if (!isQueryingImgs) {
      await queryImg(idx);
    }
  }, [isQueryingImgs, idx]);

  return (
    <div className="container crosshair-wrapper">
      <img
        src={imgsrc || unknownSvg}
        onClick={handleClick}
        // data-tauri-drag-region
        className="cross-pinned"
        alt="cross"
        width={200}
      />
    </div>
  );
}

import toast from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import useAsyncEffect from "@hooks/useAsyncEffect";
import { blobType, getExtOfFile, getMainWindow, getNameOfFilePath, invoke, webFiles } from "@utils/index";
import useCache from "../cache";
import { path } from "@tauri-apps/api";
import React from "react";
import unknownSvg from "/unknown.svg";
import useLocalStorage from "@hooks/useLocalStorage";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./index.css";

export default function Crosshair() {
  const { imglist, isQueryingImgs, cur, setCur, switchCrosshair, ...cache } = useCache();
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

  const [width] = useLocalStorage<number>("crosshair_width", 200);
  const [height] = useLocalStorage<number>("crosshair_height", 200);

  useEffect(() => {
    getMainWindow()?.setAlwaysOnTop(cache.isAlwaysOnTop);
  }, [cache.isAlwaysOnTop]);

  const [imgsrc, setImgsrc] = useState<string>("");

  const queryImg = async (idx?: number) => {
    if (!imglist[idx || 0]) {
      return Promise.reject("no img");
    }
    const filePath = await path.resolve(cache.crosshair_dictionary, imglist[idx || 0]);
    let url: string;
    const name = getNameOfFilePath(filePath);
    const ext = getExtOfFile(name);
    if (Object.keys(blobType).includes(ext)) {
      url = convertFileSrc(filePath);
      return setImgsrc(url);
    }
    if (webFiles.includes(ext)) {
      invoke("read_image", { path: filePath }).then((data) => {
        if (data) {
          let content: string = new TextDecoder().decode(new Uint8Array(data));
          switch (ext) {
            case "txt":
              url = content;
              break;
            case "url":
              url =
                content
                  .split("\n")
                  .find((line) => line.startsWith("URL="))
                  ?.replace("URL=", "") || "";
              break;
          }
          return setImgsrc(url);
        } else {
          setImgsrc(unknownSvg);
        }
      });
    }
  };

  useAsyncEffect(async () => {
    const unlinsten_switch_cross = await listen("switch_cross", () => {
      switchCrosshair();
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
  }, [cur, imglist.length]);

  useEffect(() => {
    if (!isQueryingImgs) {
      const idx = imglist.findIndex((i) => i === cur);
      queryImg(idx).catch(() => {
        setImgsrc("");
      });
    }
  }, [isQueryingImgs, cur, imglist]);

  const [current_crosshair_name, store_current_crosshair_name] = useLocalStorage<string>("current_crosshair_name");
  const [canvasSize] = useLocalStorage<number>("canvas_size", 200);
  const [canvasShape] = useLocalStorage<"rect" | "circle">("canvas_shape", "rect");
  // 是否启用反色滤镜
  const [enableInvertFilter] = useLocalStorage<boolean>("enable_canvas_invert_filter", false);

  const isUpdatingFromCur = useRef(false);
  const isUpdatingFromCurrentCrosshairName = useRef(false);

  useEffect(() => {
    if (cur && !isUpdatingFromCurrentCrosshairName.current) {
      isUpdatingFromCur.current = true;
      store_current_crosshair_name(cur);
    } else {
      isUpdatingFromCurrentCrosshairName.current = false;
    }
  }, [cur]);

  useEffect(() => {
    if (current_crosshair_name && !isUpdatingFromCur.current) {
      isUpdatingFromCurrentCrosshairName.current = true;
      setCur(current_crosshair_name);
    } else {
      isUpdatingFromCur.current = false;
    }
  }, [current_crosshair_name]);

  return (
    <div
      className="container crosshair-wrapper"
      style={{
        borderRadius: canvasShape === "circle" ? "50%" : "0",
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
      }}
    >
      <img
        src={imgsrc || unknownSvg}
        onClick={handleClick}
        // data-tauri-drag-region
        className="cross-pinned"
        alt="crosshair"
        width={width}
        height={height}
        style={{
          filter: enableInvertFilter ? "invert(100%)" : void 0,
        }}
      />
    </div>
  );
}

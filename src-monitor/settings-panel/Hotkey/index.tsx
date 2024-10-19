import { RadioButtonChecked } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import Flex from "@public/components/Flex";
import keyMap from "@public/constant/keyMap";
import useLocale from "@public/hooks/uselocale";
import { useShare } from "@public/plugins/tauri-plugin-share";
import { emit } from "@tauri-apps/api/event";
import { useRef, useState, useEffect } from "react";

export default function Hotkey(props: {
  id?: string;
  action:
    | "switchCrosshair"
    | "switchToDefaultCrosshair"
    | "setCurrentCrosshairAsDefault"
    | "togglePinned"
    | "toggleIgnoreCursorEvents"
    | "openMonitor"
    | "reload"
    | "exit";
}) {
  const { action } = props;
  const mounted = useRef(false);
  const $ = useLocale();
  const [recording, setRecording] = useState(false);
  const prevRecording = useRef(recording);
  const actionKey = "hotkeys".concat("_").concat(action);
  const [hotkey, setHotkey] = useShare<string[]>(actionKey);

  const syncHotkey = async () => {
    await emit(`register_hotkeys`, {
      action: action,
      keys: hotkey,
    });
  };

  useEffect(() => {
    if (mounted.current) {
      if (prevRecording.current && !recording) {
        syncHotkey();
      }
    } else {
      mounted.current = true;
    }
    prevRecording.current = recording;
  }, [recording, action, JSON.stringify(hotkey)]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (recording) {
        event.preventDefault();
        const keyIndex = Object.keys(keyMap).find((i) => event.key.toLowerCase() === i.toLowerCase());
        if (keyIndex) {
          const key = keyMap[keyIndex];
          if (!hotkey.includes(key)) {
            setHotkey((prevHotkey) => [...prevHotkey, key].sort());
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (recording) {
        event.preventDefault();
        setRecording(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [recording, hotkey]);

  const startRecording = async () => {
    await emit(`unregister_hotkeys`, {
      action: props.action,
    });
    await setHotkey([]);
    setRecording(true);
  };

  const text =
    (hotkey || [])
      .map((i) => {
        switch (i) {
          case "CommandOrControl":
            return "Ctrl";
          case "Meta":
            return "Win";
          case "ArrowUp":
            return "↑";
          case "ArrowDown":
            return "↓";
          case "ArrowLeft":
            return "←";
          case "ArrowRight":
            return "→";
          default:
            return i;
        }
      })
      .join(" + ") || (recording ? $("Recording, press any key") : $("Click to record hotkey"));

  return (
    <div>
      <Flex>
        <RadioButtonChecked
          fontSize="small"
          color="error"
          style={{
            visibility: recording ? "visible" : "hidden",
          }}
        />
        <Tooltip title={$("Click to record hotkey")} placement="bottom">
          <Chip onClick={startRecording} label={text} id={props.id} />
        </Tooltip>
      </Flex>
    </div>
  );
}

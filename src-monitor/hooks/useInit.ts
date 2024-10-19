import useLocale from "@public/hooks/uselocale";
import { useShare } from "@public/plugins/tauri-plugin-share";
import { schemes } from "@public/store";
import { invoke } from "@public/utils";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { toast } from '../utils/index';

export default function useInit() {
  const $ = useLocale();
  const [, set_crosshair_schemes] = useShare<ICrosshairScheme[]>("crosshair-schemes", []);
  const [ok, setOk] = useState(false);
  const unListenRegisterHotkeysErrorRef = useRef<any>(null);
  const unListenToastRef = useRef<any>(null);
  const init = async () => {
    try {
      const list = await schemes.all();
      set_crosshair_schemes(list);
    } catch (error) {
      console.error("Failed to complete init crosshair schemes", error);
    }
    unListenRegisterHotkeysErrorRef.current = await listen("register-hotkeys-error", (e) => {
      const { reason, keys: _keys, action } = e.payload as any;
      const fail_reason = typeof reason === 'object' ? ((reason as Error).message || (reason as Error).name) : reason;
      const buildMsg = () => {
        const actionText = $(action);
        const reasonText = $(fail_reason);
        return $('Failed to register hotkeys for action ${action}: ${fail_reason}')
          .replace("${action}", actionText)
          .replace("${fail_reason}", reasonText);
      }
      const msg = buildMsg();
      toast.error(msg, {
        duration: 4000
      });
      invoke('log', {
        level: 'ERROR',
        msg: msg
      });
    })
    unListenToastRef.current = await listen('toast', (e) => {
      const { message, level } = e.payload as {
        message: string;
        level: string;
      };
      const msg = $(message as any);
      switch (level) {
        case 'error':
          toast.error(msg, {
            duration: 4000
          });
          break;
        case 'success':
          toast.success(msg);
          break;
        default:
          toast.call(msg);
          break;
      }
    })
    const img_bg_type = localStorage.getItem("img_bg_type");
    if (!img_bg_type) {
      localStorage.setItem("img_bg_type", JSON.stringify("grey"));
    }
  }
  useEffect(() => {
    init().then(() => {
      setOk(true);
    });
    return () => {
      unListenRegisterHotkeysErrorRef.current?.();
      unListenToastRef.current?.();
    }
  }, []);

  return ok;
}
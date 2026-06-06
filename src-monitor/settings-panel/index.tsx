import { Alert, Box, Chip, Divider, IconButton, Stack, styled, Switch, Typography } from "@mui/material";
import Label from "@public/components/Lable";
import useLocale from "@public/hooks/uselocale";
import useLocalStorage from "@public/hooks/useLocalStorage";
import { useEffect, useState } from "react";
import LocaleSelector from "./locale-selector";
import { OpenInNew } from "@mui/icons-material";
import { invoke } from "@public/utils";
import { path } from "@tauri-apps/api";
import Flex from "@public/components/Flex";
import Tip from "@public/components/Tip";
import ThemeSelector from "./theme-selector";
import Hotkey from "./Hotkey";
import CheckUpdate from "./check-update";
import CrosshairBgSelector from "./crosshairBgSelector";
import { useConfigStore } from "@public/hooks/useConfig";

const Item = styled(Box)(() => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
});

export default function SettingsPanel() {
  const $ = useLocale();
  // 从外置配置文件读取通知开关
  const enable_system_notification = useConfigStore((s) => s.config.enable_system_notification);
  const updateScalar = useConfigStore((s) => s.updateScalar);
  const [crosshair_dir] = useLocalStorage<string>("crosshair_dir");
  const show_in_fs = (path: string) => {
    return () => {
      if (path) {
        invoke("open_directory_in_fs", { path });
      }
    };
  };
  const [log_dir, set_log_dir] = useState<string>("");
  useEffect(() => {
    (async () => {
      const app_dir = await invoke("get_appdir");
      set_log_dir(await path.join(app_dir, "logs"));
    })();
  }, []);
  const [data_dir, set_data_dir] = useState<string>("");
  useEffect(() => {
    (async () => {
      const appDataDir = (await path.appDataDir()).replace(/\\$/, "").replace(/\/$/, "");
      set_data_dir(appDataDir);
    })();
  });
  return (
    <>
      <h2>{$("Settings Panel")}</h2>
      <Alert severity="info" sx={{ mb: 1, mx: 2 }}>
        {$("Config file has been saved to config.json in the app directory. Manual edits to this file will only take effect after restarting the app.")}
      </Alert>
      <Stack
        width="100%"
        boxSizing="border-box"
        padding="2rem"
        rowGap="0.5rem"
        height="100%"
        sx={{
          overflowY: "auto",
        }}
      >
        <Divider textAlign="left">
          <Chip label={$("Security")} />
        </Divider>
        <Stack>
          <Item>
            <Label for="security csp">
              csp <Tip>{$("Content Security Policy")}</Tip>
            </Label>
            <span id="security csp">
              {"default-src 'self' 'unsafe-inline'; img-src * 'unsafe-inline' asset: https://asset.localhost"}
            </span>
          </Item>
        </Stack>
        <Divider textAlign="left">
          <Chip label={$("Regular")} />
        </Divider>
        <Stack gap="0.5rem">
          <Item>
            <Label for="locale">{$("Locale")}</Label>
            <LocaleSelector />
          </Item>
          <Divider />
          <Item>
            <Label for="enable_system_notification">
              <span>{$("Notification")}</span>
              <Tip>{$("Whether to enable the system level notification")}</Tip>
            </Label>
            <Switch
              id="enable_system_notification"
              checked={enable_system_notification}
              onChange={(_e, checked) => {
                updateScalar("enable_system_notification", checked);
              }}
            />
          </Item>
          <Divider />
          <Item>
            <Label>{$("Directory of crosshairs")}</Label>
            <Flex>
              <Typography>{crosshair_dir}</Typography>
              <IconButton onClick={show_in_fs(crosshair_dir)} size="small">
                <OpenInNew fontSize="small" />
              </IconButton>
            </Flex>
          </Item>
          <Divider />
          <Item>
            <Label>{$("Directory of logs")}</Label>
            <Flex>
              <Typography>{log_dir}</Typography>
              <IconButton onClick={show_in_fs(log_dir)} size="small">
                <OpenInNew fontSize="small" />
              </IconButton>
            </Flex>
          </Item>
          <Divider />
          <Item>
            <Label>
              <span>{$("Directory of data")}</span>
              <Tip>
                {"（"
                  .concat($("Persistent Data"))
                  .concat("）")
                  .concat($("Please not to change content if you know little about it"))}
              </Tip>
            </Label>
            <Flex>
              <Typography>{data_dir}</Typography>
              <IconButton onClick={show_in_fs(data_dir)} size="small">
                <OpenInNew fontSize="small" />
              </IconButton>
            </Flex>
          </Item>
          <Divider />
          <Item>
            <Label for="check update">{$("Check update")}</Label>
            <CheckUpdate />
          </Item>
        </Stack>

        <Divider textAlign="left">
          <Chip label={$("Apperance")} />
        </Divider>
        <Stack gap="0.5rem">
          <Item>
            <Label for="monitor theme">{$("Monitor Theme")}</Label>
            <ThemeSelector id="monitor theme" />
          </Item>
          <Divider />
          <Item>
            <Label for="background of crosshairs in monitor">{$("Background of crosshairs in monitor")}</Label>
            <CrosshairBgSelector />
          </Item>
        </Stack>

        <Divider textAlign="left">
          <Chip label={$("Hotkeys")} />
        </Divider>
        <Stack gap="0.5rem">
          <Item>
            <Label for="hotkeys of togglePinned">{$("Toggle Pinning crosshair top or not")}</Label>
            <Hotkey id="hotkeys of togglePinned" action="togglePinned" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of toggleIgnoreCursorEvents">{$("Toggle ignoring cursor events or not")}</Label>
            <Hotkey id="hotkeys of toggleIgnoreCursorEvents" action="toggleIgnoreCursorEvents" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of switchCrosshair">{$("Switch crosshair")}</Label>
            <Hotkey id="hotkeys of switchCrosshair" action="switchCrosshair" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of switchToDefaultCrosshair">{$("Switch to default crosshair")}</Label>
            <Hotkey id="hotkeys of switchToDefaultCrosshair" action="switchToDefaultCrosshair" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of setCurrentCrosshairAsDefault">{$("Set current crosshair as default")}</Label>
            <Hotkey id="hotkeys of setCurrentCrosshairAsDefault" action="setCurrentCrosshairAsDefault" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of monitor">{$("Open Monitor")}</Label>
            <Hotkey id="hotkeys of monitor" action="openMonitor" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of reload">{$("Reload App")}</Label>
            <Hotkey id="hotkeys of reload" action="reload" />
          </Item>
          <Divider />
          <Item>
            <Label for="hotkeys of exit">{$("Exit")}</Label>
            <Hotkey id="hotkeys of exit" action="exit" />
          </Item>
          <Divider />
        </Stack>
      </Stack>
    </>
  );
}

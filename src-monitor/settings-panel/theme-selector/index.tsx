import Flex from "@public/components/Flex";
import useLocale from "@public/hooks/uselocale";
import useLocalStorage from "@public/hooks/useLocalStorage";
import ThemeSwitch from "./theme-switch";
import { Switch } from "@mui/material";
import { useEffect } from "react";
import { getColorScheme } from "@public/utils";
import useTheme from "@public/hooks/useTheme";

export default function ThemeSelector(props: { id?: string }) {
  const $ = useLocale();
  const { theme, setTheme } = useTheme();
  const [themeMode, setThemeMode] = useLocalStorage<string>("theme_mode", "auto");

  useEffect(() => {
    if (themeMode === "auto") {
      setTheme(getColorScheme());
    }
  }, [themeMode]);
  return (
    <Flex align="center" gap="1rem" id={props.id}>
      <span>{$("Auto Theme")}</span>
      <Switch checked={themeMode === "auto"} onChange={(_e, checked) => setThemeMode(checked ? "auto" : "manual")} />
      <span>{$("Current Theme")}</span>
      <ThemeSwitch
        disabled={themeMode === "auto"}
        checked={theme === "dark"}
        onChange={(_e, checked) => {
          setTheme(checked ? "dark" : "light");
        }}
      />
    </Flex>
  );
}

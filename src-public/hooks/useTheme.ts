import { createTheme } from "@mui/material";
import { getColorScheme } from "../utils";
import useLocalStorage from "./useLocalStorage";
import { useEffect } from "react";

const light = createTheme({
  palette: {
    mode: "light",
  },
});

const dark = createTheme({
  palette: {
    mode: "dark",
    background: {
      paper: "#1a2a3a",
    },
  },
});

export type ThemeOptions = {
  theme?: string;
  runEffect?: boolean;
}

export default function useTheme({
  theme,
  runEffect
}: ThemeOptions = {
    runEffect: false
  }) {
  const [current_theme, set_current_theme] = useLocalStorage<"light" | "dark">("theme", getColorScheme());
  useEffect(() => {
    if (runEffect) {
      document.documentElement.style.setProperty("--monitor-background",
        current_theme === "dark" ?
          "var(--monitor-background-dark)" :
          "var(--monitor-background-light)");
      document.documentElement.style.setProperty("--monitor-text-color",
        current_theme === "dark" ?
          "var(--monitor-text-color-dark)" :
          "var(--monitor-text-color-light)");
      document.documentElement.style.setProperty("--monitor-crosshair-bgColor",
        current_theme === "dark" ?
          "var(--monitor-crosshair-bgColor-dark)" :
          "var(--monitor-crosshair-bgColor-light)");
    }
  }, [runEffect, current_theme])
  return {
    theme: theme || current_theme,
    muiTheme: (theme || current_theme) === "dark" ? dark : light,
    setTheme: set_current_theme
  }
}
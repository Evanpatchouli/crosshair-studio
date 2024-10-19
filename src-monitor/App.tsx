import { Box, List, ListItemButton, ThemeProvider, Tooltip } from "@mui/material";
import Views, { useViews, ViewMap } from "./views";
import { Toaster } from "react-hot-toast";
import useInit from "./hooks/useInit";
import Splash from "@public/components/splash";
import useTheme from "@public/hooks/useTheme";
import useLocale from "@public/hooks/uselocale";
import "./App.css";

export default function App() {
  const $ = useLocale();
  const { current, setCurrent } = useViews();
  const initialized = useInit();
  const { muiTheme } = useTheme({ runEffect: true });
  if (!initialized) {
    return <Splash text="控制台初始化中" />;
  }
  return (
    <ThemeProvider theme={muiTheme}>
      <div id="crosshair-studio-monitor">
        <List
          sx={{
            width: "auto",
            backgroundColor: "#111",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: "4px",
            paddingBlock: "0.5rem",
            paddingInline: "0.2rem",
            overflowY: "auto",
            height: "100vh",
            zIndex: 1000,
          }}
        >
          {Object.entries(ViewMap).map(([key, View]) => (
            <Tooltip title={$((View.tooltip || View.name) as any)} placement="right" key={key}>
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  marginBlock: "0.2rem",
                  backgroundColor: current() === key ? "#333" : "transparent",
                  color: current() === key ? "#fff" : "#ddd",
                  "&:hover": {
                    backgroundColor: current() === key ? "#333" : "#222",
                  },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => current() !== key && setCurrent(key as any)}
              >
                {/* <ListItemText primary={View.name} /> */}
                {View.icon}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
        <Box
          sx={{
            height: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Views />
        </Box>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

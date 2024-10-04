import { Box, Container, List, ListItem, ListItemButton, ListItemText, Tooltip } from "@mui/material";
import "./App.css";
import Views, { useViews, ViewMap } from "./views";

export default function App() {
  const { current, setCurrent } = useViews();
  return (
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
          <Tooltip title={View.tooltip || View.name} placement="right" key={key}>
            <ListItemButton
              sx={{
                borderRadius: 1,
                marginBlock: "0.2rem",
                backgroundColor: current() === key ? "#333" : "transparent",
                color: current() === key ? "#fff" : "#ddd",
                "&:hover": {
                  backgroundColor: current() === key ? "#333" : "#222",
                },
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
  );
}

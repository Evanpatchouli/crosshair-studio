import { Box, Container, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import "./App.css";
import Views, { useViews, ViewMap } from "./views";

export default function App() {
  const { current, setCurrent } = useViews();
  return (
    <div id="crosshair-studio-monitor">
      <List
        sx={{
          width: "200px",
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
          <ListItemButton
            key={key}
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
            <ListItemText primary={View.name} />
          </ListItemButton>
        ))}
      </List>
      <Box
        sx={{
          height: "100vh",
          width: "calc(100vw - 200px)",
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

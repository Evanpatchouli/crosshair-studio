import { Tab, Tabs } from "@mui/material";
import CS2CrosshairPalette from "./cs2-crosshairs-palette";
import React from "react";
import CS2Icon from "@public/components/icons/cs2";
import ValorantIcon from "@public/components/icons/valorant";
import CustomizeIcon from "@public/components/icons/Customize";
import ValorantCrosshairsPalette from "./valorant-crosshairs-palette";

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      {children}
    </div>
  );
}

export default function CrosshairPalette() {
  const [tab, setTab] = React.useState("cs2");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };
  return (
    <>
      <Tabs value={tab} onChange={handleChange} aria-label="icon tabs example">
        <Tab value="cs2" icon={<CS2Icon />} aria-label="cs2-crosshairs-palette" />
        <Tab value="valorant" icon={<ValorantIcon />} aria-label="valorant-crosshairs-palette" disabled />
        <Tab value="customize" icon={<CustomizeIcon />} aria-label="customize-crosshair-palette" disabled />
      </Tabs>
      <TabPanel value={tab} index="cs2">
        <CS2CrosshairPalette />
      </TabPanel>
      <TabPanel value={tab} index="valorant">
        <ValorantCrosshairsPalette />
      </TabPanel>
    </>
  );
}

import { create } from "zustand";
import CrosshaiConfigure from "../crosshair-configure/index";
import CrosshairPalette from "../crosshair-palette/index";
import CrosshairOnline from "../crosshair-online/index";
import CrosshairLocal from "../crosshair-local/index";
import Document from "../document/index";
import AppLicense from "../license/index";
import Privacy from "../privacy/index";
import SettingsPanel from "../settings-panel/index";
import About from "../about/index";
import {
  Build,
  Info,
  TravelExplore,
  Settings,
  CloudDownload,
  MenuBook,
  PrivacyTip,
  Palette,
  ViewList,
} from "@mui/icons-material";
import License from "@public/components/icons/License";
import CrosshairScheme from "../crosshair-scheme/index";

export const ViewMap = {
  "crosshair-configure": {
    component: CrosshaiConfigure,
    name: "Crosshair Parameters Configuration",
    icon: <Build />,
    tooltip: "",
  },
  "crosshair-scheme": {
    component: CrosshairScheme,
    name: "Crosshair Scheme",
    icon: <ViewList />,
    tooltip: "",
  },
  "crosshair-palette": {
    component: CrosshairPalette,
    name: "Crosshair Palette",
    icon: <Palette />,
    tooltip: "",
  },
  "crosshair-inline": {
    component: CrosshairOnline,
    name: "Online Crosshair Library",
    icon: <TravelExplore />,
    tooltip: "",
  },
  "crosshair-download": {
    component: CrosshairLocal,
    name: "Local Crosshair Library",
    icon: <CloudDownload />,
    tooltip: "",
  },
  document: {
    component: Document,
    name: "Help Document",
    icon: <MenuBook />,
    tooltip: "",
  },
  license: {
    component: AppLicense,
    name: "License",
    icon: <License />,
    tooltip: "",
  },
  privacy: {
    component: Privacy,
    name: "Privacy Tip",
    icon: <PrivacyTip />,
    tooltip: "",
  },
  settings: {
    component: SettingsPanel,
    name: "Settings",
    icon: <Settings />,
    tooltip: "",
  },
  about: {
    component: About,
    name: "About",
    icon: <Info />,
    tooltip: "",
  },
};

type ViewNames = "crosshair-configure" | "crosshair-inline";

interface ViewsService {
  current(): ViewNames;
  setCurrent: (view: ViewNames) => void;
}

export const useViews = create<ViewsService>((set) => ({
  current: () => "crosshair-configure",
  setCurrent: (view: ViewNames) => set({ current: () => view }),
}));

const Views = () => {
  const { current } = useViews();
  const ViewComponent = ViewMap[current()]["component"];

  return <ViewComponent />;
};

export default Views;

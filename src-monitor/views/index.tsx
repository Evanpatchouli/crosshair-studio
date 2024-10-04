import { create } from "zustand";
import CrosshaiConfigure from "../crosshair-configure/index";
import CrosshairOnline from "../crosshair-online/index";
import SettingsPanel from "../settings-panel/index";
import CrosshairDownloaded from "../crosshair-downloaded/index";
import About from "../about/index";
import { Build, Info, TravelExplore, Settings, CloudDownload, MenuBook, PrivacyTip } from "@mui/icons-material";
import License from "@public/components/icons/License";

export const ViewMap = {
  "crosshair-configure": {
    component: CrosshaiConfigure,
    name: "准星参数配置",
    icon: <Build />,
    tooltip: "",
  },
  "crosshair-inline": {
    component: CrosshairOnline,
    name: "在线准星库",
    icon: <TravelExplore />,
    tooltip: "",
  },
  "crosshair-download": {
    component: CrosshairDownloaded,
    name: "本地准星库",
    icon: <CloudDownload />,
    tooltip: "",
  },
  document: {
    component: () => <></>,
    name: "文档",
    icon: <MenuBook />,
    tooltip: "",
  },
  license: {
    component: () => <></>,
    name: "许可证",
    icon: <License />,
    tooltip: "",
  },
  privacy: {
    component: () => <></>,
    name: "隐私申明",
    icon: <PrivacyTip />,
    tooltip: "",
  },
  settings: {
    component: SettingsPanel,
    name: "设置",
    icon: <Settings />,
    tooltip: "",
  },
  about: {
    component: About,
    name: "关于",
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

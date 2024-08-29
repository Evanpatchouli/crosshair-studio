import { create } from "zustand";
import CrosshaiConfigure from "../crosshair-configure/index";
import CrosshairOnline from "../crosshair-online/index";

export const ViewMap = {
  "crosshair-configure": {
    component: CrosshaiConfigure,
    name: "准星参数配置",
  },
  "crosshair-inline": {
    component: CrosshairOnline,
    name: "在线准星库",
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

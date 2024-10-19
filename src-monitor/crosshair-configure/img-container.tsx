import { useCrosshairSelector } from "../components/crosshair-selector";
import useLocalStorage from "@public/hooks/useLocalStorage";
import { Fragment } from "react/jsx-runtime";
import { classes } from "@public/utils";
import "./img-container.css";

export default function ImgContainer(props: { children: React.ReactNode }) {
  const [theme] = useLocalStorage<"dark" | "light">("theme");
  const [imgBgType] = useLocalStorage<"grey" | "grid">("img_bg_type");
  const [current_crosshair_name, set_current_crosshair_name] = useLocalStorage<string>("current_crosshair_name");
  const { selector, element: crosshairSelector } = useCrosshairSelector({
    initial: current_crosshair_name,
    onConfirm(image) {
      selector.close();
      if (!(image.name === current_crosshair_name)) {
        set_current_crosshair_name(image.name);
      }
    },
  });
  return (
    <Fragment>
      <div
        className={"crosshair-configure-img-box"}
        onClick={() => {
          selector.open();
        }}
        style={{
          // @ts-ignore
          "--box-border-color": theme === "dark" ? "##2a3cad" : "#ccc",
          "--content-border-color": theme === "dark" ? "#1a1ee757" : "#ccc",
          "--floating-color": "#50dfdb",
        }}
      >
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <div
          className={classes(["content", "crosshair-container", imgBgType === "grid" ? "img-grid-bg" : "img-grey-bg"])}
        >
          {props.children}
        </div>
      </div>
      {crosshairSelector}
    </Fragment>
  );
}

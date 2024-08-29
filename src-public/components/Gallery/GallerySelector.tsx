import { useState } from "react";
import { GalleryItem } from "./GalleryMain";
import { classes } from "@public/utils";
import "./GallerySelector.css";

type GallerySelectorProps = {
  items: Array<GalleryItem>;
  current?: number;
  setCurrent?: React.Dispatch<React.SetStateAction<number>>;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
  SimpleStyleProps;

const GallerySelector: React.FC<GallerySelectorProps> = ({
  items,
  current: controlledIndex,
  setCurrent,
  className,
  style,
  w,
  h,
  p,
  pl,
  pr,
  pt,
  pb,
  px,
  py,
  m,
  ml,
  mr,
  mt,
  mb,
  mx,
  my,
  bg,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex !== void 0 ? controlledIndex : internalIndex;
  return (
    <div
      className={classes(["evp-gallery-selector", className])}
      style={{
        width: w || "100%",
        height: h || "400px",
        paddingLeft: pl,
        paddingRight: pr,
        paddingTop: pt,
        paddingBottom: pb,
        paddingInline: px,
        paddingBlock: py,
        padding: p,
        marginLeft: ml,
        marginRight: mr,
        marginTop: mt,
        marginBottom: mb,
        marginInline: mx,
        marginBlock: my,
        margin: m,
        background: bg,
        ...style,
      }}
    >
      {items.map((item, idx) => (
        <img
          key={idx}
          alt={`gallery-selector-item ${item.title}`}
          className={`gallery-selector-item ${currentIndex === idx ? "active" : ""}`}
          src={item.url}
          onClick={() => {
            setInternalIndex(idx);
            setCurrent?.(idx);
          }}
          style={{
            width: h || "400px",
            height: "100%",
            objectFit: "contain",
            cursor: "pointer",
            transition: "transform 0.3s ease-in-out",
            borderRadius: "5px",
            // transform: `translateX(${currentIndex === idx ? 0 : currentIndex > idx ? "100%" : "-100%"})`,
          }}
        />
      ))}
    </div>
  );
};

export default GallerySelector;

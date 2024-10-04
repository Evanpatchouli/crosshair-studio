import { useEffect, useState } from "react";
import { GalleryItem } from "./GalleryMain";
import { classes } from "@public/utils";
import "./GallerySelector.css";

type GallerySelectorProps = {
  column?: number;
  items: Array<GalleryItem>;
  current?: number;
  setCurrent?: React.Dispatch<React.SetStateAction<number>>;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  itemW?: React.CSSProperties["width"];
  itemH?: React.CSSProperties["height"];
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
  SimpleStyleProps;

function prehandle<T = any>(value: number | string | undefined, defaultValue?: T) {
  if (value === void 0) return defaultValue;
  if (typeof value === "number") return value + "px";
  return value;
}

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
  column,
  itemW,
  itemH,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex !== void 0 ? controlledIndex : internalIndex;
  useEffect(() => {
    document.querySelector(`#gallery-selector-item-${currentIndex}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [currentIndex]);
  return (
    <div
      className={classes(["evp-gallery-selector", className])}
      style={{
        width: prehandle(w, "100%"),
        height: prehandle(h, "400px"),
        minHeight: "140px",
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
        // @ts-ignore
        "--evp-gallery-selector-column": column || 3,
        ...style,
      }}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          id={`gallery-selector-item-${idx}`}
          className={`gallery-selector-item ${currentIndex === idx ? "active" : ""}`}
          style={{
            cursor: "pointer",
            transition: "transform 0.3s ease-in-out",
            borderRadius: "5px",
            width: itemW || "auto",
            height: itemH || itemW || "auto",
            aspectRatio: itemH || itemW ? void 0 : "1",
            display: "flex",
            justifyContent: "center",
            // transform: `translateX(${currentIndex === idx ? 0 : currentIndex > idx ? "100%" : "-100%"})`,
          }}
        >
          <img
            alt={`gallery-selector-item ${item.title}`}
            src={item.url}
            onClick={() => {
              setInternalIndex(idx);
              setCurrent?.(idx);
            }}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      ))}
    </div>
  );
};

export default GallerySelector;

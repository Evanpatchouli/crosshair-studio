import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { classes } from "@public/utils";
import "./GalleryMain.css";

export interface GalleryItem {
  id?: number | string;
  title: string;
  desc?: string;
  url: string;
}
type GalleryMainProps = {
  items: Array<GalleryItem>;
  current?: number;
  setCurrent?: React.Dispatch<React.SetStateAction<number>>;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
  SimpleStyleProps;

function prehandle<T = any>(value: number | string | undefined, defaultValue?: T) {
  if (value === void 0) return defaultValue;
  if (typeof value === "number") return value + "px";
  return value;
}
export default function GalleryMain({
  className,
  style,
  items,
  current: controlledIndex,
  setCurrent,
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
  ...props
}: GalleryMainProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    if (setCurrent) {
      setCurrent(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    if (setCurrent) {
      setCurrent(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };
  return (
    <div
      className={classes(["evp-gallery-main", className])}
      style={{
        width: prehandle(w, "100%"),
        height: prehandle(h, "800px"),
        minHeight: "100px",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        transition: "transform.3s",
        // transform: `translate(-50%, -50%)`,
        background: bg,
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
        marginInlineStart: mx,
        marginInlineEnd: mx,
        marginBlockStart: my,
        marginBlockEnd: my,
        margin: m || "1rem",
        ...style,
      }}
      {...props}
    >
      <img
        src={items[currentIndex]?.url}
        alt={items[currentIndex]?.title}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <IconButton
        onClick={handlePrev}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        }}
        className="evp-gallery-button"
      >
        <ArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNext}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        }}
        className="evp-gallery-button"
      >
        <ArrowRight />
      </IconButton>
    </div>
  );
}

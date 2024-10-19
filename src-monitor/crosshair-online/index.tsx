import { IconButton, ImageList, ImageListItem, ImageListItemBar, Stack, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from "@mui/icons-material/Download";
import React, { useEffect, useRef } from "react";
import listCrosshairs, { OSSImage } from "./api";
import { useResize } from "@evanpatchouli/react-hooks-kit";
import { classes, images_sorter } from "@public/utils";
import useLocalStorage from "@public/hooks/useLocalStorage";
import useLocale from "@public/hooks/uselocale";

export default function CrosshairOnline() {
  const $ = useLocale();
  const [images, setImages] = React.useState<Array<OSSImage>>([]);
  const images_sorted = images.sort(images_sorter);
  useEffect(() => {
    listCrosshairs({ word: "crosshair icon", count: 1000 }).then((res) => {
      setImages(res.list);
    });
  }, []);
  const listRef = useRef<HTMLDivElement>(null);
  const listSize = useResize({ target: listRef });
  const [imgBgType] = useLocalStorage<"grey" | "grid">("img_bg_type");
  return (
    <>
      <h2>{$("Online Crosshair Library")}</h2>
      <div ref={listRef} style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        <ImageList
          sx={{ width: "100%", height: "auto", borderRadius: 3, px: "20px", boxSizing: "border-box" }}
          cols={Math.floor(listSize.width / 200) || 1}
          rowHeight={150}
          gap={20}
        >
          {images_sorted.map((item) => (
            <ImageListItem
              key={item.name}
              className={classes(["crosshair-container", imgBgType === "grid" ? "img-grid-bg" : "img-grey-bg"])}
              sx={{
                overflow: "hidden",
                borderRadius: 3,
                boxShadow: "0 0 1px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src={`${item.url}`}
                alt={item.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              <ImageListItemBar
                title={<span style={{ fontSize: "small" }}>{item.name}</span>}
                actionIcon={
                  <Stack flexDirection="row" alignItems="center">
                    {item.desc && (
                      <Tooltip title={item.desc.replace("Size", $("Size")).replace("Datetime", $("Datetime"))}>
                        <IconButton
                          sx={{
                            color: "rgba(255, 255, 255, 0.54)",
                          }}
                          aria-label={`info about ${item.name}`}
                          size="small"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={$("Download")}>
                      <IconButton
                        sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                        aria-label={`apply ${item.name}`}
                        size="small"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </>
  );
}

import {
  Backdrop,
  Box,
  Button,
  DialogActions,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Fragment, useEffect, useRef, useState } from "react";
import { ViewList, ViewModule } from "@mui/icons-material";
import useLocalStorage from "@public/hooks/useLocalStorage";
import {
  blobType,
  getExtOfFile,
  getNameOfFilePath,
  images_sorter,
  invoke,
  watchCrosshairs,
  webFiles,
} from "@public/utils";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import useLocale from "@public/hooks/uselocale";

export interface CrosshairSelectorProps {
  open: boolean;
  close: () => void;
  selected: string;
  onItemClick: (image: ImageMeta) => void;
  onConfirm?: (image: ImageMeta) => void;
}

export default function CrosshairSelector({ open, close, selected, onItemClick, onConfirm }: CrosshairSelectorProps) {
  const $ = useLocale();
  const [mode, setMode] = useState<"plain" | "preview">("plain");
  const handleMode = (_event: React.MouseEvent<HTMLElement>, newMode: "plain" | "preview") => {
    setMode(newMode);
  };
  const [images, setImages] = useState<
    Array<{
      name: string;
      url: string;
      desc?: string;
      path: string;
    }>
  >([]);

  const [crosshair_dir] = useLocalStorage<string>("crosshair_dir");

  const syncImages = async (images: ImageInfo[]) => {
    const imgPromises = images
      .filter((img) => {
        const ext = getExtOfFile(img.path);
        return Object.keys(blobType).includes(ext) || webFiles.includes(ext);
      })
      .map(async (img) => {
        let url: string = "";
        const path = img.path;
        const name = getNameOfFilePath(path);
        const ext = getExtOfFile(name);
        const desc = `Size: ${img.size} bytes, Modified: ${new Date(img.modified * 1000).toLocaleString()}`;
        if (Object.keys(blobType).includes(ext)) {
          url = convertFileSrc(path);
          return {
            name,
            url,
            desc,
            path,
          };
        }
        const data = await invoke("read_image", { path: path });
        if (data) {
          let content: string = new TextDecoder().decode(new Uint8Array(data));
          switch (ext) {
            case "txt":
              url = content;
              break;
            case "url":
              url =
                content
                  .split("\n")
                  .find((line) => line.startsWith("URL="))
                  ?.replace("URL=", "") || "";
              break;
          }
        }
        return {
          name,
          url,
          desc,
          path,
        };
      });
    const imgs = await Promise.all(imgPromises);
    setImages(imgs.sort(images_sorter));
  };

  const unWatchRef = useRef<Function | null>(null);

  const initSyncImages = async () => {
    const unWatch = await watchCrosshairs(syncImages);
    unWatchRef.current = unWatch;
    const images = await invoke("get_images_from_directory", {
      directory: crosshair_dir,
      extensions: ["png", "jpg", "jpeg", "gif", "svg", "txt", "url"],
    });
    syncImages(images);
  };

  useEffect(() => {
    initSyncImages();
    return () => {
      unWatchRef.current?.();
    };
  }, []);

  const handleConfirm = () => {
    if (onConfirm) {
      const image = images.find((img) => img.name === selected);
      if (image) {
        onConfirm(image);
      }
    } else {
      close();
    }
  };

  return (
    <Backdrop open={open} onClick={close} style={{ zIndex: 100 }}>
      <Box
        onClick={(e) => {
          e.stopPropagation();
        }}
        sx={{
          bgcolor: "background.paper",
          borderRadius: "5px",
          px: "0.5rem",
        }}
      >
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" py={"1rem"} px={"1rem"}>
          <Typography fontSize="1.2rem">{$("Select crosshair")}</Typography>
          <ToggleButtonGroup value={mode} onChange={handleMode} aria-label="toggle view mode" size="small" exclusive>
            <Tooltip title={$("List mode")}>
              <ToggleButton value="plain" aria-label={$("List mode")}>
                <ViewList
                  sx={{
                    fontSize: "1rem",
                  }}
                />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={$("Preview mode")}>
              <Fragment>
                <ToggleButton value="preview" aria-label={$("Preview mode")} disabled>
                  <ViewModule
                    sx={{
                      fontSize: "1rem",
                    }}
                  />
                </ToggleButton>
              </Fragment>
            </Tooltip>
          </ToggleButtonGroup>
        </Stack>
        {mode === "plain" && <PlainList images={images} selected={selected} onItemClick={onItemClick} />}
        {mode === "preview" && <div>{$("Preview mode")}</div>}
        <DialogActions>
          <Button onClick={close} size="small">
            {$("Cancel")}
          </Button>
          <Button onClick={handleConfirm} size="small" variant="contained">
            {$("Confirm")}
          </Button>
        </DialogActions>
      </Box>
    </Backdrop>
  );
}

export const useCrosshairSelector = (options?: { initial?: string; onConfirm?: (image: ImageMeta) => void }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const [selected, setSelected] = useState<string>(options?.initial || "");
  const onItemClick = (image: ImageMeta) => {
    setSelected(image.name);
  };

  return {
    selector: {
      open: () => setOpen(true),
      close,
      selected,
    },
    element: (
      <CrosshairSelector
        open={open}
        close={close}
        selected={selected}
        onItemClick={onItemClick}
        onConfirm={options?.onConfirm}
      />
    ),
  };
};

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;
  const { images, selected, onItemClick } = data as PlainListProps;
  const image = images[index];

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton
        selected={selected === image.name}
        onClick={() => {
          onItemClick(image);
        }}
        style={{
          borderRadius: "5px",
          height: "40px",
        }}
      >
        <ListItemText primary={image.name} />
      </ListItemButton>
    </ListItem>
  );
}

interface PlainListProps {
  images: ImageMeta[];
  selected: string;
  onItemClick: (image: ImageMeta) => void;
}

function PlainList({ images, selected, onItemClick }: PlainListProps) {
  return (
    <Box sx={{ width: "100%", height: 440, maxWidth: 360, bgcolor: "background.paper" }}>
      <FixedSizeList
        height={440}
        width={360}
        itemSize={44}
        itemCount={images.length}
        overscanCount={5}
        itemData={{
          images,
          selected,
          onItemClick,
        }}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}

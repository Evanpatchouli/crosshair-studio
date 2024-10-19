import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AddBoxIcon from "@mui/icons-material/AddBox";
import React, { useState } from "react";
import { useResize } from "@evanpatchouli/react-hooks-kit";
import useLocalStorage from "@public/hooks/useLocalStorage";
import {
  blobType,
  classes,
  getExtOfFile,
  getNameOfFilePath,
  images_sorter,
  invoke,
  watchCrosshairs,
} from "@public/utils";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Add, DeleteForever } from "@mui/icons-material";
import toast from "react-hot-toast";
import { dialog, fs } from "@tauri-apps/api";
import useLocale from "@public/hooks/uselocale";
import Txt from "@public/components/icons/Txt";
import Url from "@public/components/icons/Url";
import Import from "@public/components/icons/Import";
import { emit } from "@tauri-apps/api/event";
import TextCrosshairCreator from "./text-crosshair-creator";
import URLCrosshairCreator from "./url-crosshair-creator";

const webFiles = ["txt", "url"];

const actionColor = "rgba(255, 255, 255, 0.54)";
const actionButtonSx = { color: actionColor, borderRadius: 1, minWidth: "fit-content" };
export default function CrosshairLocal() {
  const [images, setImages] = React.useState<
    Array<{
      name: string;
      url: string;
      desc?: string;
      path: string;
    }>
  >([]);

  const $ = useLocale();
  const [imgBgType] = useLocalStorage<"grey" | "grid">("img_bg_type");
  const [crosshair_dir] = useLocalStorage<string>("crosshair_dir");
  const [current_crosshair_name, set_current_crosshair_name] = useLocalStorage<string>("current_crosshair_name");

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
        const desc = `Size: ${(img.size / 1024).toFixed(2)} KB Modified: ${new Date(
          img.modified * 1000
        ).toLocaleString()}`
          .replace("Size", $("Size"))
          .replace("Modified", $("Modified"));
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
    setImages(imgs);
  };

  const unWatchRef = React.useRef<Function | null>(null);

  const initSyncImages = async () => {
    const unWatch = await watchCrosshairs(syncImages);
    unWatchRef.current = unWatch;
    const images = await invoke("get_images_from_directory", {
      directory: crosshair_dir,
      extensions: ["png", "jpg", "jpeg", "gif", "svg", "txt", "url"],
    });
    syncImages(images);
  };

  React.useEffect(() => {
    initSyncImages();
    return () => {
      unWatchRef.current?.();
    };
  }, []);

  const listRef = React.useRef<HTMLDivElement>(null);
  const listSize = useResize({ target: listRef });

  const apply = (name: string) => {
    set_current_crosshair_name(name);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [pathToDelete, setPathToDelete] = useState<string>("");

  const del = (path: string) => {
    setPathToDelete(path);
    setDeleteDialogOpen(true);
  };

  const onDelConform = async () => {
    try {
      await invoke("delete_image", { path: pathToDelete });
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || e.name || (typeof e === "string" ? e : $("Unknown error")));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const actions = [
    {
      name: $("Import a crosshair"),
      icon: <Import />,
      onClick: async () => {
        const selectedFile = await dialog.open({
          multiple: false,
          filters: [
            {
              name: "Crosshair File",
              extensions: ["png", "jpg", "jpeg", "gif", "svg", "txt", "url"],
            },
          ],
        });
        if (selectedFile) {
          try {
            await fs.copyFile(selectedFile as string, `${crosshair_dir}/${getNameOfFilePath(selectedFile as string)}`);
            toast.success($("Imported successfully"));
          } catch (error) {
            const err = error as Error;
            toast.error(err.message || err.name || (typeof err === "string" ? err : $("Unknown error")));
          }
        }
      },
    },
    {
      name: $("Create a txt crosshair"),
      icon: <Txt />,
      onClick: () => emit("create_text_crosshair_clicked"),
    },
    {
      name: $("Create a url crosshair"),
      icon: <Url />,
      onClick: () => emit("create_url_crosshair_clicked"),
    },
  ];

  return (
    <>
      <h2>{$("Local Crosshair Library")}</h2>
      <div ref={listRef} style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        <ImageList
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 3,
            px: "20px",
            py: "2px",
            boxSizing: "border-box",
          }}
          cols={Math.floor(listSize.width / 200) || 1}
          rowHeight={150}
          gap={20}
        >
          {images.sort(images_sorter).map((item) => (
            <ImageListItem
              key={item.name}
              className={classes(["crosshair-container", imgBgType === "grid" ? "img-grid-bg" : "img-grey-bg"])}
              sx={{
                overflow: "hidden",
                borderRadius: 3,
                boxShadow: "0 0 1px rgba(0, 0, 0, 0.2)",
                outline: current_crosshair_name === item.name ? "2px solid #90caf9" : "2px solid #90caf900",
                transition: "outline ease 0.2s",
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
                sx={{ pr: 1 }}
                actionIcon={
                  <Stack flexDirection="row" alignItems="center">
                    {item.desc && (
                      <Tooltip title={item.desc}>
                        <Button sx={actionButtonSx} aria-label={`info about ${item.name}`} size="small">
                          <InfoIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip title={$("Apply this crosshair")}>
                      <Button
                        sx={actionButtonSx}
                        aria-label={`apply ${item.name}`}
                        size="small"
                        onClick={() => {
                          apply(item.name);
                        }}
                      >
                        <AddBoxIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    <Tooltip title={$("Delete")}>
                      <Button
                        sx={actionButtonSx}
                        aria-label={`delete ${item.name}`}
                        size="small"
                        onClick={() => del(item.path)}
                      >
                        <DeleteForever fontSize="small" />
                      </Button>
                    </Tooltip>
                  </Stack>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      </div>
      <Dialog open={deleteDialogOpen}>
        <DialogTitle alignItems="end">{$("Confirm to delete the crosshair")}</DialogTitle>
        <DialogContent>
          <Stack>
            <DialogContentText color="warning">
              {$("Are you sure you want to delete ${path}?").replace("${path}", pathToDelete)}
            </DialogContentText>
            <DialogContentText>
              {$("Deleting this crosshair is irreversible. Make sure you won't need it anymore.")}
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDeleteDialogOpen(false)}>
            {$("Cancel")}
          </Button>
          <Button size="small" onClick={onDelConform} color="error" variant="contained">
            {$("Yes, I do delete")}
          </Button>
        </DialogActions>
      </Dialog>
      <TextCrosshairCreator crosshairs={images.map((i) => i.name)} />
      <URLCrosshairCreator crosshairs={images.map((i) => i.name)} />
      <SpeedDial
        ariaLabel="Import or create a new crosshair"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<Add />}
      >
        {actions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.onClick} />
        ))}
      </SpeedDial>
    </>
  );
}

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import useLocalStorage from "@hooks/useLocalStorage";
import Label from "@public/components/Lable";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import ImgContainer from "./img-container";
import { Cached, Refresh, SaveAs } from "@mui/icons-material";
import { useState } from "react";
import Help from "@public/components/icons/Help";
import { syncShareSchemes } from "@public/utils";
import toast from "react-hot-toast";
import Model from "@public/model";
import { schemes } from "@public/store";
import useLocale from "@public/hooks/uselocale";
import { useConfigStore } from "@public/hooks/useConfig";

export default function CrosshaiConfigure() {
  const $ = useLocale();
  const [crosshair_dir] = useLocalStorage("crosshair_dir");
  const [current_crosshair_name] = useLocalStorage<string>("current_crosshair_name");

  // 从外置配置文件读取准星显示参数
  const width = useConfigStore((s) => s.config.crosshair.width);
  const height = useConfigStore((s) => s.config.crosshair.height);
  const lockRatio = useConfigStore((s) => s.config.crosshair.lock_ratio);
  const canvasSize = useConfigStore((s) => s.config.crosshair.canvas_size);
  const canvasShape = useConfigStore((s) => s.config.crosshair.canvas_shape);
  const enableInvertFilter = useConfigStore((s) => s.config.crosshair.enable_invert_filter);

  const updateCrosshair = useConfigStore((s) => s.updateCrosshair);

  const handleCanvasShapeRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCrosshair({ canvas_shape: e.target.value as "rect" | "circle" });
  };

  const [lastScheme, setLastScheme] = useState({
    width,
    height,
    lockRatio,
    canvasSize,
    canvasShape,
    enableInvertFilter,
  });

  const handleReset = () => {
    updateCrosshair({
      width: lastScheme.width,
      height: lastScheme.height,
      lock_ratio: lastScheme.lockRatio,
      canvas_size: lastScheme.canvasSize,
      canvas_shape: lastScheme.canvasShape,
      enable_invert_filter: lastScheme.enableInvertFilter,
    });
  };

  const handleSave = () => {
    setLastScheme({
      width,
      height,
      lockRatio,
      canvasSize,
      canvasShape,
      enableInvertFilter,
    });
  };

  const [dialog_open, set_dialog_open] = useState(false);
  const close_dialog = () => {
    set_dialog_open(false);
  };

  const handleSaveAs = () => {
    set_dialog_open(true);
  };

  const [schemeName, setSchemeName] = useState("");
  const [schemeDesc, setSchemeDesc] = useState("");

  return (
    <>
      <h2>{$("Crosshair Parameters Configuration")}</h2>
      <figure>
        <ImgContainer>
          <img
            src={convertFileSrc(`${crosshair_dir}\\${current_crosshair_name}`)}
            alt="crosshair"
            style={{
              width: 200,
              height: 200,
              objectFit: "contain",
            }}
          />
        </ImgContainer>
        <figcaption style={{ textAlign: "center" }}>{current_crosshair_name}</figcaption>
      </figure>
      <Stack flexDirection="row" gap={12} mt="30px">
        <Box sx={{ width: 200 }}>
          <Stack>
            <Label>{$("Image Width")}</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={200}
              value={width}
              onChange={(_e, v) => {
                const newWidth = v as number;
                if (lockRatio) {
                  updateCrosshair({ width: newWidth, height: newWidth });
                } else {
                  updateCrosshair({ width: newWidth });
                }
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack>
            <Label>{$("Image Height")}</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={200}
              value={height}
              onChange={(_e, v) => {
                const newHeight = v as number;
                if (lockRatio) {
                  updateCrosshair({ width: newHeight, height: newHeight });
                } else {
                  updateCrosshair({ height: newHeight });
                }
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="lock-ratio">{$("Lock Ratio")}</Label>
            <Switch
              id="lock-ratio"
              checked={lockRatio}
              onChange={(e) => {
                updateCrosshair({ lock_ratio: e.target.checked });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateCrosshair({ lock_ratio: !lockRatio });
                }
              }}
            />
          </Stack>
        </Box>
        <Box sx={{ width: 200 }}>
          <Stack>
            <Label>{$("Canvas Size")}</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={400}
              value={canvasSize}
              onChange={(_e, v) => {
                updateCrosshair({ canvas_size: v as number });
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="canvas-shape" style={{ marginRight: "1rem" }}>
              {$("Canvas Shape")} :
            </Label>
            <Label>{$("Rect")}</Label>
            <Radio
              checked={canvasShape === "rect"}
              onChange={handleCanvasShapeRadioClick}
              value="rect"
              name="canvas-shape"
              inputProps={{ "aria-label": $("Rect") }}
            />
            <Label>{$("Circle")}</Label>
            <Radio
              checked={canvasShape === "circle"}
              onChange={handleCanvasShapeRadioClick}
              value="circle"
              name="canvas-shape"
              inputProps={{ "aria-label": $("Circle") }}
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="enable-invert-filter">{$("Enable Invert Filter")}</Label>
            <Switch
              id="enable-invert-filter"
              checked={enableInvertFilter}
              onChange={(e) => {
                updateCrosshair({ enable_invert_filter: e.target.checked });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateCrosshair({ enable_invert_filter: !enableInvertFilter });
                }
              }}
            />
          </Stack>
        </Box>
      </Stack>

      <Stack flexDirection="row" gap={2} justifyContent="right" mt="2rem">
        <Button
          startIcon={<Refresh />}
          variant="contained"
          sx={{ borderRadius: "1rem" }}
          size="small"
          onClick={handleReset}
        >
          {$("Restore")}
        </Button>
        <Button
          startIcon={<Cached />}
          variant="contained"
          sx={{ borderRadius: "1rem" }}
          size="small"
          onClick={handleSave}
        >
          {$("Stage")}
        </Button>
        <Button
          startIcon={<SaveAs />}
          variant="contained"
          sx={{ borderRadius: "1rem" }}
          size="small"
          onClick={handleSaveAs}
        >
          {$("Save As")}
          <Tooltip title={$("Save as crosshair configuration scheme")}>
            <Help sx={{ fontSize: "1rem", ml: "4px" }} />
          </Tooltip>
        </Button>
      </Stack>

      <Dialog
        open={dialog_open}
        onClose={close_dialog}
        PaperProps={{
          component: "form",
          onSubmit: async (e: any) => {
            e.preventDefault();
            const scheme = new Model.CrosshairScheme({
              name: schemeName,
              crosshair: current_crosshair_name,
              desc: schemeDesc,
              width,
              height,
              lockRatio,
              canvasSize,
              canvasShape,
              enableInvertFilter,
            });
            await schemes.add(scheme);
            close_dialog();
            toast.success($("Save successfully"));
            setSchemeName("");
            setSchemeDesc("");
            syncShareSchemes();
          },
          style: {
            width: "400px",
            // @ts-ignore
            "--Paper-overlay": "none",
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle>{$("Please name the crosshair scheme")}</DialogTitle>
        <DialogContent>
          <TextField
            label={$("Scheme Name")}
            value={schemeName}
            onChange={(e) => {
              setSchemeName(e.target.value);
            }}
            size="small"
            fullWidth
            sx={{ mt: "0.5rem" }}
          />
          <TextField
            label={$("Description")}
            value={schemeDesc}
            onChange={(e) => {
              setSchemeDesc(e.target.value);
            }}
            size="small"
            fullWidth
            sx={{ mt: "1rem" }}
            type="text"
            multiline
            minRows={2}
            maxRows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={close_dialog}>
            {$("Cancel")}
          </Button>
          <Button size="small" type="submit" variant="contained">
            {$("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

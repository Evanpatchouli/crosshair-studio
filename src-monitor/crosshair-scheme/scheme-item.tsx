import { useRecord } from "@evanpatchouli/react-hooks-kit";
import { DeleteOutlined, ExpandMore, SaveOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Radio,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Label from "@public/components/Lable";
import { schemes } from "@public/store";
import { Fragment, useState } from "react";
import { toast } from "../utils/index";
import { classes, syncShareSchemes } from "@public/utils";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import useLocalStorage from "@public/hooks/useLocalStorage";
import styles from "./css/scheme-item.module.css";
import { useCrosshairSelector } from "../components/crosshair-selector";
import useLocale from "@public/hooks/uselocale";

type SchemeItemProps = {
  scheme: ICrosshairScheme;
  defaultExpanded?: boolean;
};

const SchemeItem: React.FC<SchemeItemProps> = ({ scheme, defaultExpanded = false }) => {
  const $ = useLocale();
  const [imgBgType] = useLocalStorage<"grey" | "grid">("img_bg_type");
  const [crosshair_dir] = useLocalStorage<string>("crosshair_dir");
  const [schemeState, setSchemeState] = useRecord(scheme);
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const handleClick = () => {
    setExpanded((prev) => !prev);
  };
  const { selector, element: crosshairSelector } = useCrosshairSelector({
    initial: scheme.name,
    onConfirm(image) {
      selector.close();
      setSchemeState("crosshair", image.name);
    },
  });
  const handleSave = async () => {
    try {
      await schemes.update(schemeState);
      toast.success($("Scheme saved"));
      syncShareSchemes();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || err.name || (typeof err === "string" ? err : $("Unknown error")));
    }
  };
  const handleDelete = async () => {
    try {
      await schemes.remove(schemeState.id as any);
      toast.success($("Scheme deleted"));
      syncShareSchemes();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || err.name || (typeof err === "string" ? err : $("Unknown error")));
    }
    setDeleteDialogOpen(false);
  };
  return (
    <Fragment>
      <Box
        display="flex"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        py="4px"
        sx={{
          cursor: "pointer",
          borderRadius: "3px",
          "&:focus-visible": {
            outlineColor: "#90caf9",
            outlineWidth: "2px",
            outlineStyle: "solid",
          },
        }}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleClick();
          }
        }}
      >
        <Box display="flex" alignItems="center" gap="0.5rem">
          <ExpandMore
            color="info"
            sx={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.3s" }}
          />
          <Typography variant="subtitle1" component="header">
            {scheme.name}
          </Typography>
          <Label style={{ marginLeft: "1rem" }}>
            ID :
            <Typography variant="subtitle2" component="span" ml="0.5rem">
              {scheme.id}
            </Typography>
          </Label>
        </Box>
        <Button
          size="small"
          sx={{ mr: "1em" }}
          onClick={(e) => {
            e.stopPropagation();
            queueMicrotask(() => {
              localStorage.setItem("current_crosshair_name", JSON.stringify(scheme.crosshair));
              localStorage.setItem("crosshair_width", scheme.width.toString());
              localStorage.setItem("crosshair_height", scheme.height.toString());
              localStorage.setItem("crosshair_lock_ratio", scheme.lockRatio.toString());
              localStorage.setItem("canvas_size", scheme.canvasSize.toString());
              localStorage.setItem("canvas_shape", JSON.stringify(scheme.canvasShape));
              localStorage.setItem("enable_canvas_invert_filter", scheme.enableInvertFilter.toString());
              toast.success($("Apply successfully"));
            });
          }}
        >
          {$("Apply")}
        </Button>
      </Box>

      <Collapse in={expanded}>
        <Paper
          sx={{
            mx: "0.75rem",
            mb: "1rem",
            py: "1rem",
            px: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderLeft: `1px dashed ${alpha("#42a5f5", 0.4)}`,
          }}
        >
          <Stack gap="0.5rem">
            <Label>{$("Scheme Name")}</Label>
            <TextField size="small" value={schemeState.name} onChange={(e) => setSchemeState("name", e.target.value)} />
          </Stack>
          <Stack gap="1rem" flexDirection="row">
            <Stack gap="0.5rem">
              <Tooltip title={schemeState.crosshair}>
                <div style={{ width: "fit-content", height: "fit-content" }}>
                  <Label
                    style={{
                      width: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {$("Crosshair")}：{schemeState.crosshair}
                  </Label>
                </div>
              </Tooltip>
              <Tooltip title={$("Select crosshair")} placement="right-end">
                <Box
                  className={classes([
                    styles["img-container"],
                    "crosshair-container",
                    imgBgType === "grid" ? "img-grid-bg" : "img-grey-bg",
                  ])}
                  width="200px"
                  height="200px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  onClick={() => selector.open()}
                  tabIndex={0}
                  sx={{
                    "&:focus-visible": {
                      outlineColor: "#90caf9",
                      outlineWidth: "2px",
                      outlineStyle: "solid",
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      selector.open();
                    }
                  }}
                >
                  <img
                    src={convertFileSrc(`${crosshair_dir}\\${schemeState.crosshair}`)}
                    alt="crosshair"
                    width="200px"
                  />
                </Box>
              </Tooltip>
            </Stack>
            <Stack gap="0.5rem" flex="1">
              <Label>{$("Description")}</Label>
              <TextField
                size="small"
                value={schemeState.desc}
                onChange={(e) => setSchemeState("desc", e.target.value)}
                multiline
                rows={8}
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" gap="5%" width="100%">
            <Stack width="100%">
              <Label>{$("Image Width")}</Label>
              <Slider
                min={0}
                max={400}
                defaultValue={schemeState.width}
                value={schemeState.width}
                onChange={(_e, v) => {
                  setSchemeState("width", v as number);
                  if (schemeState.lockRatio) {
                    setSchemeState("height", v as number);
                  }
                }}
                valueLabelDisplay="auto"
              />
            </Stack>
            <Stack width="100%">
              <Label>{$("Image Height")}</Label>
              <Slider
                min={0}
                max={400}
                defaultValue={schemeState.height}
                value={schemeState.height}
                onChange={(_e, v) => {
                  setSchemeState("height", v as number);
                  if (schemeState.lockRatio) {
                    setSchemeState("width", v as number);
                  }
                }}
                valueLabelDisplay="auto"
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap="2rem" flexWrap="wrap">
            <Stack flexDirection="row" alignItems="center">
              <Label for="lock-ratio">{$("Lock Ratio")}</Label>
              <Switch
                id="lock-ratio"
                checked={schemeState.lockRatio}
                onChange={(e) => setSchemeState("lockRatio", e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSchemeState("lockRatio", (prev) => !prev);
                  }
                }}
              />
            </Stack>
            <Stack flexDirection="row" alignItems="center" width="100%" maxWidth="400px" minWidth="200px" gap="1rem">
              <Label for="canvas-size">{$("Canvas Size")}</Label>
              <Slider
                min={0}
                max={400}
                defaultValue={400}
                value={schemeState.canvasSize}
                onChange={(_e, v) => setSchemeState("canvasSize", v as number)}
                valueLabelDisplay="auto"
              />
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <Label for="lock-ratio">{$("Canvas Shape")}</Label>
              <Radio
                checked={schemeState.canvasShape === "rect"}
                onChange={(_e) => setSchemeState("canvasShape", "rect")}
                value="rect"
                name="canvas-shape"
                inputProps={{ "aria-label": $("Rect") }}
              />
              <Label>{$("Rect")}</Label>
              <Radio
                checked={schemeState.canvasShape === "circle"}
                onChange={(_e) => setSchemeState("canvasShape", "circle")}
                value="circle"
                name="canvas-shape"
                inputProps={{ "aria-label": $("Circle") }}
              />
              <Label>{$("Circle")}</Label>
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <Label for="enable-invert-filter">{$("Enable Invert Filter")}</Label>
              <Switch
                id="enable-invert-filter"
                checked={schemeState.enableInvertFilter}
                onChange={(e) => setSchemeState("enableInvertFilter", e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSchemeState("enableInvertFilter", (prev) => !prev);
                  }
                }}
              />
            </Stack>
          </Stack>
          <Stack justifyContent="right" width="100%">
            <Stack flexDirection="row" gap="1rem">
              <Button
                size="small"
                startIcon={<SaveOutlined />}
                variant="contained"
                sx={{ borderRadius: "1rem", whiteSpace: "nowrap" }}
                onClick={handleSave}
                disabled={Object.is(scheme, schemeState)}
              >
                {$("Save")}
              </Button>
              <Button
                size="small"
                startIcon={<DeleteOutlined />}
                variant="contained"
                sx={{ borderRadius: "1rem", whiteSpace: "nowrap" }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {$("Delete")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      <Dialog open={deleteDialogOpen}>
        <DialogTitle alignItems="end">
          {$("Confirm to delete the scheme")}
          <Typography variant="subtitle2" color="textSecondary">{`(ID: ${scheme.id})`}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack>
            <DialogContentText color="warning">
              {$("Do you confirm to delete the《${name}》yet?").replace("${name}", scheme.name)}
            </DialogContentText>
            <DialogContentText>
              {$("Deleting this scheme is irreversible. Make sure you won't need it anymore.")}
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDeleteDialogOpen(false)}>
            {$("Cancel")}
          </Button>
          <Button size="small" onClick={handleDelete} color="error" variant="contained">
            {$("Yes, I do delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {crosshairSelector}
    </Fragment>
  );
};

export default SchemeItem;

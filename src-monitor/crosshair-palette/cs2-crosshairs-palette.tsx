import { useState } from "react";
import { Box, Button, Slider, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { fs } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";
import { toast } from "../utils";
import { convertToCS2 } from "./utils";
import { writeText } from "@tauri-apps/api/clipboard";
import { classes } from "@public/utils";
import useLocalStorage from "@public/hooks/useLocalStorage";
import useLocale from "@public/hooks/uselocale";

export default function CS2CrosshairPalette() {
  const $ = useLocale();
  const [imgBgType] = useLocalStorage<"grey" | "grid">("img_bg_type");
  // default light green
  const [color, setColor] = useState("#00FF00");
  const [opacity, setOpacity] = useState(0.8);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineLength, setLineLength] = useState(5);
  const [lineGap, setLineGap] = useState(5);
  const [showOutline, setShowOutline] = useState(false);
  const [showCenterDot, setShowCenterDot] = useState(false);
  const [tShape, setTShape] = useState(false);

  const handlesave = async () => {
    const svg_text = document.getElementById("crosshair-customized")?.outerHTML;
    if (svg_text) {
      const blob = new Blob([svg_text], { type: "image/svg+xml" });
      try {
        const path = await save({
          defaultPath: "crosshair.svg",
          filters: [{ name: "svg", extensions: ["svg"] }],
        });

        if (path) {
          const reader = new FileReader();
          reader.onload = async function () {
            try {
              await fs.writeBinaryFile(path, new Uint8Array(reader.result as ArrayBuffer));
              toast.success($("Crosshair saved successfully"));
            } catch (err) {
              toast.error($("Error occurred while saving crosshair"));
            }
          };
          reader.readAsArrayBuffer(blob);
        }
      } catch (err) {
        console.error($("Error occurred while saving crosshair").concat(":"), err);
        toast.error($("Error occurred while saving crosshair"));
      }
    }
  };

  const copyCodes = async () => {
    try {
      const codes = convertToCS2({
        color,
        opacity,
        lineWidth,
        lineLength,
        lineGap,
        showOutline,
        showCenterDot,
        tShape,
      });
      await writeText(codes);
      toast.success($("Code copied to clipboard"));
    } catch (error) {
      toast.error($("Failed to export code"));
    }
  };

  const copyAsCS2 = () => copyCodes();

  return (
    <Box width={"100%"} px={"20px"} display="flex" flexDirection="column" alignItems="center">
      <h2>{$("Crosshair Palette")}</h2>
      <Box width={"100%"} display="flex" flexDirection="row" alignItems="center" height="fit-content">
        <Box
          className={classes(["crosshair-container", imgBgType === "grid" ? "img-grid-bg" : "img-grey-bg"])}
          display="flex"
          justifyContent="center"
          alignItems="center"
          m="2rem"
          flex={1}
          borderRadius={2}
          style={{
            aspectRatio: 1,
          }}
        >
          <svg
            id="crosshair-customized"
            width="100"
            style={{ aspectRatio: 1 }}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <line
              x1="50"
              y1={50 - lineGap - lineLength}
              x2="50"
              y2={50 - lineGap}
              stroke={color}
              strokeWidth={lineWidth}
              strokeOpacity={opacity}
              strokeLinecap="round"
              style={{ display: tShape ? "none" : "block" }}
            />
            <line
              x1="50"
              y1={50 + lineGap + lineLength}
              x2="50"
              y2={50 + lineGap}
              stroke={color}
              strokeWidth={lineWidth}
              strokeOpacity={opacity}
              strokeLinecap="round"
            />
            <line
              x1={50 - lineGap - lineLength}
              y1="50"
              x2={50 - lineGap}
              y2="50"
              stroke={color}
              strokeWidth={lineWidth}
              strokeOpacity={opacity}
              strokeLinecap="round"
            />
            <line
              x1={50 + lineGap + lineLength}
              y1="50"
              x2={50 + lineGap}
              y2="50"
              stroke={color}
              strokeWidth={lineWidth}
              strokeOpacity={opacity}
              strokeLinecap="round"
            />
            {showCenterDot && <circle cx="50" cy="50" r={lineWidth} fill={color} fillOpacity={opacity} />}
            {showOutline && (
              <>
                <line
                  x1="50"
                  y1={50 - lineGap - lineLength}
                  x2="50"
                  y2={50 - lineGap}
                  stroke="#000"
                  strokeWidth={lineWidth + 2}
                  strokeOpacity={opacity * 0.5}
                  strokeLinecap="round"
                  style={{ display: tShape ? "none" : "block" }}
                />
                <line
                  x1="50"
                  y1={50 + lineGap + lineLength}
                  x2="50"
                  y2={50 + lineGap}
                  stroke="#000"
                  strokeWidth={lineWidth + 2}
                  strokeOpacity={opacity * 0.5}
                  strokeLinecap="round"
                />
                <line
                  x1={50 - lineGap - lineLength}
                  y1="50"
                  x2={50 - lineGap}
                  y2="50"
                  stroke="#000"
                  strokeWidth={lineWidth + 2}
                  strokeOpacity={opacity * 0.5}
                  strokeLinecap="round"
                />
                <line
                  x1={50 + lineGap + lineLength}
                  y1="50"
                  x2={50 + lineGap}
                  y2="50"
                  stroke="#000"
                  strokeWidth={lineWidth + 2}
                  strokeOpacity={opacity * 0.5}
                  strokeLinecap="round"
                />
                {showCenterDot && <circle cx="50" cy="50" r={lineWidth + 2} fill="#000" fillOpacity={opacity * 0.5} />}
              </>
            )}
          </svg>
        </Box>
        <Box width={"50%"} p="4rem">
          <Box>
            <Typography>{$("Crosshair Color")}</Typography>
            <TextField type="color" fullWidth value={color} onChange={(e) => setColor(e.target.value)} />
          </Box>
          <Box>
            <Typography>{$("Opacity")}</Typography>
            <Slider
              value={opacity}
              onChange={(_e, newValue) => setOpacity(newValue as number)}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box>
            <Typography>{$("Line Width")}</Typography>
            <Slider
              value={lineWidth}
              onChange={(_e, newValue) => setLineWidth(newValue as number)}
              min={0}
              max={10}
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box>
            <Typography>{$("Line Length")}</Typography>
            <Slider
              value={lineLength}
              onChange={(_e, newValue) => setLineLength(newValue as number)}
              min={0}
              max={25}
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box>
            <Typography>{$("Line Gap")}</Typography>
            <Slider
              value={lineGap}
              onChange={(_e, newValue) => setLineGap(newValue as number)}
              min={-50}
              max={+50}
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box display="flex" alignItems="center" columnGap={"2rem"}>
            <Box display="flex" alignItems="center">
              <Typography>{$("Show Outline")}</Typography>
              <Switch
                checked={showOutline}
                onChange={(e) => setShowOutline(e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowOutline((prev) => !prev);
                  }
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>{$("Show Center Dot")}</Typography>
              <Switch
                checked={showCenterDot}
                onChange={(e) => setShowCenterDot(e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowCenterDot((prev) => !prev);
                  }
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>{$("T Shape")}</Typography>
              <Switch
                checked={tShape}
                onChange={(e) => setTShape(e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTShape((prev) => !prev);
                  }
                }}
              />
            </Box>
          </Box>
          <Box display="flex" columnGap="1rem" mt="1rem">
            <Button variant="contained" onClick={handlesave} size="small">
              {$("Save")}
            </Button>
            <Tooltip title={$("Copy as CS2 Crosshair Code")} placement="right" onClick={copyAsCS2}>
              <Button variant="contained" size="small">
                {$("Copy as Crosshair Code")}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

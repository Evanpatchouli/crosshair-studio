import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Radio,
  Slider,
  Stack,
  Switch,
  Tooltip,
} from "@mui/material";
import useLocalStorage from "@hooks/useLocalStorage";
import Label from "@public/components/Lable";
import InfoIcon from "@mui/icons-material/Info";
import AddBoxIcon from "@mui/icons-material/AddBox";
import "./App.css";

const crosshairs = Array.from({ length: 10 }).map((_, i) => ({
  img: `https://www.cscrosshair.com/img/crosshairimg/afro.png`,
  title: `准星${i}`,
  desc: i % 2 === 0 ? `这是准星${i}的描述` : "",
}));

export default function App() {
  const [current_crosshair_name] = useLocalStorage<string>("current_crosshair_name");
  const [width, setWidth] = useLocalStorage<number>("crosshair_width", 200);
  const [height, setHeight] = useLocalStorage<number>("crosshair_height", 200);
  const [lockRatio, setLockRatio] = useLocalStorage<boolean>("crosshair_lock_ratio", true);

  const [canvasSize, setCanvasSize] = useLocalStorage<number>("canvas_size", 200);
  const [canvasShape, setCanvasShape] = useLocalStorage<"rect" | "circle">("canvas_shape", "rect");
  const handleCanvasShapeRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasShape(e.target.value as any);
  };
  // 是否启用反色滤镜
  const [enableInvertFilter, setEnableInvertFilter] = useLocalStorage<boolean>("enable_canvas_invert_filter", false);

  return (
    <div id="crosshair-studio-monitor">
      <h2>准星参数配置</h2>
      <div>当前准星: {current_crosshair_name}</div>
      <Stack flexDirection="row" gap={12} mt="30px">
        <Box sx={{ width: 200 }}>
          <Stack>
            <Label>图片宽度</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={200}
              value={width}
              onChange={(_e, v) => {
                setWidth(v as number);
                if (lockRatio) {
                  setHeight(v as number);
                }
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack>
            <Label>图片高度</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={200}
              value={height}
              onChange={(_e, v) => {
                setHeight(v as number);
                if (lockRatio) {
                  setWidth(v as number);
                }
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="lock-ratio">锁定纵横比</Label>
            <Switch
              id="lock-ratio"
              checked={lockRatio}
              onChange={(e) => {
                setLockRatio(e.target.checked);
              }}
            />
          </Stack>
        </Box>
        <Box sx={{ width: 200 }}>
          <Stack>
            <Label>画布大小</Label>
            <Slider
              min={0}
              max={400}
              defaultValue={400}
              value={canvasSize}
              onChange={(_e, v) => {
                setCanvasSize(v as number);
              }}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="canvas-shape" style={{ marginRight: "1rem" }}>
              画布形状 :
            </Label>
            <Label>方</Label>
            <Radio
              checked={canvasShape === "rect"}
              onChange={handleCanvasShapeRadioClick}
              value="rect"
              name="canvas-shape"
              inputProps={{ "aria-label": "方形" }}
            />
            <Label>圆</Label>
            <Radio
              checked={canvasShape === "circle"}
              onChange={handleCanvasShapeRadioClick}
              value="circle"
              name="canvas-shape"
              inputProps={{ "aria-label": "圆形" }}
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Label for="enable-invert-filter">启用反色滤镜</Label>
            <Switch
              id="enable-invert-filter"
              checked={enableInvertFilter}
              onChange={(e) => {
                setEnableInvertFilter(e.target.checked);
              }}
            />
          </Stack>
        </Box>
      </Stack>
      <h2>浏览在线准星</h2>
      <ImageList sx={{ width: 600, height: 400, borderRadius: 3 }} cols={3} rowHeight={150} gap={20}>
        {crosshairs.map((item) => (
          <ImageListItem
            key={item.img}
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              // border: "1px solid #eaeaea",
              boxShadow: "0 0 1px rgba(0, 0, 0, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <img
              // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.img}`}
              alt={item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <ImageListItemBar
              title={item.title}
              // subtitle={item.subtitle}
              actionIcon={
                <Stack flexDirection="row" alignItems="center">
                  {item.desc && (
                    <Tooltip title={item.desc}>
                      <InfoIcon
                        sx={{
                          color: "rgba(255, 255, 255, 0.54)",
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        aria-label={`info about ${item.title}`}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="应用此准星">
                    <IconButton sx={{ color: "rgba(255, 255, 255, 0.54)" }} aria-label={`apply ${item.title}`}>
                      <AddBoxIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
}

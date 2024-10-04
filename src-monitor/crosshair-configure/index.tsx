import { Box, Radio, Slider, Stack, Switch } from "@mui/material";
import useLocalStorage from "@hooks/useLocalStorage";
import Label from "@public/components/Lable";
import GalleryMain from "@public/components/Gallery/GalleryMain";
import GallerySelector from "@public/components/Gallery/GallerySelector";
import { useEffect, useState } from "react";
import { blobType, getExtOfFile, getNameOfFilePath, invoke } from "@public/utils";

export default function CrosshaiConfigure() {
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

  const [cur, setCur] = useState(0);
  const [crosshairs_names, setCrosshairs_names] = useState<string[]>([]);
  const [$v_crosshair_dir] = useLocalStorage<string>("crosshair_dir");

  const [imgMap, setImgMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if ($v_crosshair_dir) {
      console.log("get_images_from_directory", { directory: $v_crosshair_dir });
      invoke("get_images_from_directory", { directory: $v_crosshair_dir }).then((paths) => {
        const names = paths.map((it) => getNameOfFilePath(it));
        setCrosshairs_names(names || []);
        paths.forEach((path) =>
          invoke("read_image", { path: path }).then((data) => {
            if (data) {
              const name = getNameOfFilePath(path);
              // 设置为图片 blobType[getExtOfFile(imglist[idx || 0])]
              const blob = new Blob([new Uint8Array(data)], {
                type: blobType[getExtOfFile(name)],
              });
              const url = URL.createObjectURL(blob);
              setImgMap((state) => ({
                ...state,
                [name]: url,
              }));
            }
          })
        );
      });
    }
  }, [$v_crosshair_dir]);

  // const crosshairs = (cache.imglist || []).map((item) => ({
  //   // id?: number | string;
  //   title: item,
  //   desc: item,
  //   url: item,
  // }));
  const crosshairs = crosshairs_names.map((name) => ({
    title: name,
    desc: name,
    url: imgMap[name] || "666",
  }));
  useEffect(() => {
    console.log(imgMap);
  }, [imgMap]);
  return (
    <>
      <h2>准星参数配置</h2>
      <div>当前准星: {current_crosshair_name}</div>
      <GalleryMain w={600} h={200} items={crosshairs} current={cur} setCurrent={setCur} />
      <GallerySelector column={4} w={600} h={300} itemH={140} items={crosshairs} current={cur} setCurrent={setCur} />
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
    </>
  );
}

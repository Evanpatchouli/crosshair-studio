import {
  Box,
  Button,
  Collapse,
  FormControl,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Add, Code, Delete, ExpandLess, ExpandMore, FolderOpen, Refresh } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOnlineCrosshairs, OnlineCrosshairItem } from "./api";
import { useResize } from "@evanpatchouli/react-hooks-kit";
import { classes, images_sorter } from "@public/utils";
import useLocale from "@public/hooks/uselocale";
import { useConfigStore } from "@public/hooks/useConfig";
import type { OnlineCrosshairConfig, OnlineCrosshairHeader } from "@public/config/defaults";
import toast from "react-hot-toast";

type HeaderEntry = OnlineCrosshairHeader & { _key: number };

let headerKeyCounter = 0;

export default function CrosshairOnline() {
  const $ = useLocale();
  const config = useConfigStore((s) => s.config.online_crosshair);
  const updateOnlineCrosshair = useConfigStore((s) => s.updateOnlineCrosshair);

  // ── 本地编辑状态（提交时才持久化） ──
  const [editUrl, setEditUrl] = useState(config.api_url);
  const [editMethod, setEditMethod] = useState<"GET" | "POST">(config.request_method);
  const [editHeaders, setEditHeaders] = useState<HeaderEntry[]>(
    config.headers.map((h) => ({ ...h, _key: ++headerKeyCounter }))
  );

  // ── 请求与展示状态 ──
  const [images, setImages] = useState<OnlineCrosshairItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(!!config.api_url);
  const [showConfig, setShowConfig] = useState(!config.api_url);

  // ── 加载准星列表 ──
  const load = useCallback(async () => {
    if (!config.api_url) return;
    setLoading(true);
    try {
      const list = await fetchOnlineCrosshairs();
      setImages(list);
    } catch {
      toast.error($("Unknown error"));
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [config.api_url, $]);

  // 首次加载（当 api_url 从空变为有值时）
  useEffect(() => {
    if (config.api_url && images.length === 0 && !loading) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.api_url]);

  // ── 保存配置并加载 ──
  const handleApplyAndLoad = async () => {
    const patch: Partial<OnlineCrosshairConfig> = {
      api_url: editUrl,
      request_method: editMethod,
      headers: editHeaders.map(({ field, value_type, value, value_from_file }) => ({
        field,
        value_type,
        value,
        value_from_file,
      })),
    };
    await updateOnlineCrosshair(patch);
    setConfigured(!!editUrl);
    setShowConfig(false);
  };

  // ── 配置表单行操作 ──
  const addHeader = () => {
    setEditHeaders((prev) => [
      ...prev,
      { field: "", value: "", value_from_file: "", value_type: "inline", _key: ++headerKeyCounter },
    ]);
  };

  const removeHeader = (key: number) => {
    setEditHeaders((prev) => prev.filter((h) => h._key !== key));
  };

  const updateHeader = (key: number, patch: Partial<OnlineCrosshairHeader>) => {
    setEditHeaders((prev) =>
      prev.map((h) => (h._key === key ? { ...h, ...patch } : h))
    );
  };

  // ── 渲染 ──
  const listRef = useRef<HTMLDivElement>(null);
  const listSize = useResize({ target: listRef });

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 0 }}>
        <h2>{$("Online Crosshair Library")}</h2>
        {configured && (
          <Button
            size="small"
            startIcon={showConfig ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowConfig((v) => !v)}
          >
            {$("Configure API")}
          </Button>
        )}
      </Stack>

      {/* ── 配置表单 ── */}
      <Collapse in={showConfig} sx={{ px: 2, mb: 1 }}>
        <Box
          sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}
        >
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              {$("API Configuration")}
            </Typography>

            {/* API URL + 请求方法 */}
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                label={$("API URL")}
                placeholder="https://example.com/api/crosshairs"
                size="small"
                fullWidth
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>{$("Request Method")}</InputLabel>
                <Select
                  value={editMethod}
                  label={$("Request Method")}
                  onChange={(e) => setEditMethod(e.target.value as "GET" | "POST")}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* ── 请求头列表 ── */}
            <Typography variant="body2" color="text.secondary">
              {$("Custom Headers (optional)")}
            </Typography>

            {editHeaders.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                {$("No custom headers configured")}
              </Typography>
            )}

            {editHeaders.map((h) => (
              <Stack key={h._key} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={$("Header Field")}
                  placeholder="Authorization"
                  size="small"
                  sx={{ flex: "0 0 180px" }}
                  value={h.field}
                  onChange={(e) => updateHeader(h._key, { field: e.target.value })}
                />
                <Tooltip title={h.value_type === "inline" ? $("Header Value") : $("Or read from file")}>
                  <IconButton
                    size="small"
                    color={h.value_type === "inline" ? "primary" : "warning"}
                    onClick={() => {
                      const newType = h.value_type === "inline" ? "file" : "inline";
                      const patch: Partial<OnlineCrosshairHeader> = { value_type: newType };
                      if (newType === "inline") patch.value_from_file = "";
                      else patch.value = "";
                      updateHeader(h._key, patch);
                    }}
                  >
                    {h.value_type === "inline" ? <Code fontSize="small" /> : <FolderOpen fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <TextField
                  label={h.value_type === "inline" ? $("Header Value") : $("Or read from file")}
                  placeholder={h.value_type === "inline" ? "Bearer xxxxx" : "C:\\path\\to\\token.txt"}
                  size="small"
                  sx={{ flex: 1 }}
                  value={h.value_type === "inline" ? h.value : h.value_from_file}
                  onChange={(e) => {
                    const patch = h.value_type === "inline"
                      ? { value: e.target.value }
                      : { value_from_file: e.target.value };
                    updateHeader(h._key, patch);
                  }}
                />
                <IconButton size="small" color="error" onClick={() => removeHeader(h._key)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<Add />} onClick={addHeader}>
                {$("Add Header")}
              </Button>
            </Stack>

            {/* ── 操作按钮 ── */}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                disabled={!editUrl || loading}
                onClick={handleApplyAndLoad}
              >
                {loading ? $("Loading...") : $("Save & Load")}
              </Button>
            </Stack>

            {/* 预期的 API 响应格式提示 */}
            <Typography variant="caption" color="text.disabled">
              {$("Expected API response")}: {`{ "list": [{ "name": "...", "url": "..." }] }`}
            </Typography>
          </Stack>
        </Box>
      </Collapse>

      {/* ── 未配置提示 ── */}
      {!configured && !showConfig && (
        <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
          <Typography>{$("No API endpoint configured.")}</Typography>
          <Button sx={{ mt: 1 }} onClick={() => setShowConfig(true)}>
            {$("Configure Now")}
          </Button>
        </Box>
      )}

      {/* ── 图片网格 ── */}
      {configured && (
        <div ref={listRef} style={{ width: "100%", height: "100%", overflowY: "auto" }}>
          {images.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              <Typography>{$("No crosshairs found. Click refresh to load.")}</Typography>
            </Box>
          )}
          <ImageList
            sx={{ width: "100%", height: "auto", borderRadius: 3, px: "20px", boxSizing: "border-box" }}
            cols={Math.floor(listSize.width / 200) || 1}
            rowHeight={150}
            gap={20}
          >
            {images.sort(images_sorter).map((item) => (
              <ImageListItem
                key={item.name}
                className={classes(["crosshair-container", "img-grid-bg"])}
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
                    <Stack flexDirection="row" alignItems="center" sx={{ mr: 0.5 }}>
                      {item.size != null && (
                        <Tooltip
                          title={`${$("Size")}: ${(item.size / 1024).toFixed(2)} KB`}
                        >
                          <IconButton
                            sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                            aria-label={`info about ${item.name}`}
                            size="small"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </div>
      )}

      {/* ── 右下刷新按钮 ── */}
      {configured && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24 }}>
          <Tooltip title={$("Refresh")}>
            <span>
              <IconButton
                color="primary"
                disabled={loading}
                onClick={load}
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </>
  );
}

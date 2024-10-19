import { Cached, OpenInBrowser } from "@mui/icons-material";
import {
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Flex from "@public/components/Flex";
import { compareVersion } from "@public/utils";
import { info } from "../../../package.json";
import fetch from "@public/utils/fetch";
import useLocale from "@public/hooks/uselocale";
import { useState } from "react";
import { shell } from "@tauri-apps/api";
import "./index.css";

export default function CheckUpdate() {
  const $ = useLocale();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [isQueryingUpdate, setIsQueryingUpdate] = useState(false);
  const [text, setText] = useState("");
  const [latest_version, setLatestVersion] = useState("");
  const [htmlURL, setHtmlURL] = useState("");
  return (
    <Flex>
      <Typography>{text}</Typography>
      <IconButton
        id="check update"
        size="small"
        onClick={async () => {
          setIsQueryingUpdate(true);
          const { data } = await fetch.get(
            "https://api.github.com/repos/Evanpatchouli/crosshair-studio/releases/latest",
            {
              headers: {
                "User-Agent": "crosshair-studio",
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );
          setIsQueryingUpdate(false);
          const resp = data as ApiGithub.ResponseLatestRelease;
          const latest_version = resp.tag_name;
          setLatestVersion(latest_version);
          setHtmlURL(resp.html_url);
          const shouldUpdate = compareVersion(info.version, latest_version) < 0;
          if (shouldUpdate) {
            setText($("Latest Version: ${v}").replace("${v}", latest_version));
            setOpen(true);
          } else {
            setText($("Already be the latest"));
          }
        }}
        sx={{
          animation: isQueryingUpdate ? "spin 2s linear infinite" : "none",
        }}
      >
        <Cached fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{$("Update Available")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {$("A new version of Crosshair Studio (${v}) is available.").replace("${v}", latest_version)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" size="small">
            {$("Cancel")}
          </Button>
          <Button
            onClick={() => {
              handleClose();
              shell.open(htmlURL);
            }}
            size="small"
            variant="contained"
            color="primary"
            endIcon={<OpenInBrowser />}
          >
            {$("Go to download")}
          </Button>
        </DialogActions>
      </Dialog>
    </Flex>
  );
}

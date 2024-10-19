import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import useLocale from "@public/hooks/uselocale";
import { invoke, validateURL } from "@public/utils";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import Tip from "@public/components/Tip";
import HelpText from "./HelpText";
import useLocalStorage from "@public/hooks/useLocalStorage";

const buildContent = (url: string) =>
  `[InternetShortcut]
URL=${url}`;

export default function URLCrosshairCreator({ crosshairs }: { crosshairs: string[] }) {
  const $ = useLocale();
  const [open, setOpen] = useState<boolean>(false);
  const close = () => setOpen(false);
  const [name, setName] = useState<string>("");
  const [helpTextName, setHelpTextName] = useState<string>("");
  const [crosshair_dir] = useLocalStorage<string>("crosshair_dir");
  const validateName = (s: string) => {
    if (/[\\/:*?"<>|]/.test(s)) {
      return $("Name can't contain any of the following characters: \\ / : * ? \" < > |");
    }
    console.log(crosshairs);
    if (crosshairs.includes(s + ".url")) {
      return $("Name already exists");
    }
    return "";
  };
  const [url, setUrl] = useState<string>("");
  const [helpTextUrl, setHelpTextUrl] = useState<string>("");
  const validateUrl = (u: string) => {
    if (!validateURL(u)) {
      return $("Invalid URL");
    }
    if (!/\.(png|jpg|jpeg|gif|svg|txt|url)$/i.test(u)) {
      return $("URL must end with.png,.jpg,.jpeg,.gif,.svg,.txt,.url");
    }
    return "";
  };
  const onConfirm = async () => {
    await invoke("create_url_crosshair", { path: `${crosshair_dir}/${name}.url`, content: buildContent(url) });
    close();
  };
  const unlistenFnRef = useRef<Function | null>(null);
  useEffect(() => {
    listen("create_url_crosshair_clicked", () => {
      setName("");
      setUrl("");
      setHelpTextUrl("");
      setHelpTextName("");
      setOpen(true);
    }).then((fn) => {
      unlistenFnRef.current = fn;
    });
    return () => {
      unlistenFnRef.current?.();
    };
  }, []);
  return (
    <Dialog open={open} onClose={close} fullWidth>
      <DialogTitle display="flex" alignItems="center" gap="0.5rem">
        {$("Create URL Crosshair")}
        <Tip>{$("A .url file target a image URL")}</Tip>
      </DialogTitle>
      <DialogContent>
        <FormControl variant="outlined" size="small" margin="dense" fullWidth>
          <InputLabel htmlFor="text_crosshair_name" required>
            {$("Name")}
          </InputLabel>
          <OutlinedInput
            id="text_crosshair_name"
            label={$("Name")}
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              setHelpTextName(validateName(v));
            }}
            endAdornment={<InputAdornment position="end">{".url"}</InputAdornment>}
            required
          />
          <HelpText>{helpTextName}</HelpText>
        </FormControl>
        <TextField
          label={$("Image URL")}
          required
          size="small"
          value={url}
          onChange={(e) => {
            const v = e.target.value;
            setUrl(v);
            setHelpTextUrl(validateUrl(v));
          }}
          fullWidth
          margin="dense"
          helperText={helpTextUrl}
        />
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={close}>
          {$("Cancel")}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onConfirm}
          disabled={name.trim() === "" || helpTextName !== "" || url.trim() === "" || helpTextUrl !== ""}
        >
          {$("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

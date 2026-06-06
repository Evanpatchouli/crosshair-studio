import { Box, Stack } from "@mui/material";
import Logo from "/logo.svg";
import { os as OS } from "@tauri-apps/api";
import { dependencies, devDependencies } from "../../package.json";
import useAsyncEffect from "@public/hooks/useAsyncEffect";
import { useState } from "react";
import useLocale from "@public/hooks/uselocale";

export default function About() {
  const $ = useLocale();
  const [os, setOs] = useState("");

  useAsyncEffect(async () => {
    const [os_type, os_arch, os_version] = await Promise.all([OS.type(), OS.arch(), OS.version()]);
    setOs(`${os_type} ${os_arch} ${os_version}`);
  }, []);
  return (
    <Box height={"100vh"} display="flex" alignItems="center">
      <div>
        <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mb="0.5rem">
          <img src={Logo} alt="logo" width="60" height="60" />
          <h1>Crosshair Studio</h1>
        </Box>
        <Stack pl="0.5rem">
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem">
            <span>{$("Version")}: </span>
            <span>{__APP_VERSION__}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>{$("Commit")}: </span>
            <span>{__GIT_COMMIT__}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>{$("Datetime")}: </span>
            <span>{new Date(__BUILD_TIME__).toLocaleString()}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>Tauri: </span>
            <span>{dependencies["@tauri-apps/api"]}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>Vite: </span>
            <span>{devDependencies["vite"]}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>React: </span>
            <span>{dependencies["react"]}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>Rust: </span>
            <span>{1.79}</span>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="0.5rem" mt={2}>
            <span>OS: </span>
            <span>{os}</span>
          </Box>
        </Stack>
      </div>
    </Box>
  );
}

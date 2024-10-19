import { Box } from "@mui/material";
import Md from "../md";
import useLocale from "@public/hooks/uselocale";

export default function Privacy() {
  const privacy = useLocale("#Privacy");
  return (
    <Box
      width="100%"
      height="100%"
      sx={{
        overflowY: "auto",
      }}
    >
      <Box p="2rem">
        <Md>{privacy}</Md>
      </Box>
    </Box>
  );
}

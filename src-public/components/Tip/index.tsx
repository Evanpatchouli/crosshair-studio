import { Info } from "@mui/icons-material";
import { styled, Tooltip } from "@mui/material";

const InfoStyled = styled(Info)(({ theme }) => {
  return {
    fontSize: "1rem",
    transform: "translateY(0.08rem)",
    color: theme.palette.mode === "dark" ? "#4f5d6d" : "#bbbbbb",
  };
});

const Tip = ({ children }: { children: string }) => {
  return (
    <Tooltip title={children || ""} placement="right">
      <InfoStyled />
    </Tooltip>
  );
};

export default Tip;

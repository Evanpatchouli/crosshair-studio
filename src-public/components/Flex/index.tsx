import { Box, styled } from "@mui/material";
import { CSSProperties } from "react";

const Flex = styled(Box)(
  (
    props: Partial<{
      display: CSSProperties["display"];
      justify: CSSProperties["justifyContent"];
      direction: CSSProperties["flexDirection"];
      align: CSSProperties["alignItems"];
      gap: CSSProperties["gap"];
      w: CSSProperties["width"];
      h: CSSProperties["height"];
      fullWidth: boolean;
      fullHeight: boolean;
      full: boolean;
    }>
  ) => {
    return {
      display: props.display || "flex",
      alignItems: props.align || "center",
      justifyContent: props.justify || "center",
      flexDirection: props.direction || "row",
      gap: props.gap || "0.5rem",
      width: props.w || (props.fullWidth ? "100%" : props.full ? "100%" : "auto"),
      height: props.h || (props.fullHeight ? "100%" : props.full ? "100%" : "auto"),
    };
  }
);

export default Flex;

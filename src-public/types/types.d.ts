declare interface SimpleStyleProps {
  w?: number | string;
  h?: number | string;
  p?: number | string;
  pl?: number | string;
  pr?: number | string;
  pt?: number | string;
  pb?: number | string;
  px?: number | string;
  py?: number | string;
  m?: number | string;
  ml?: number | string;
  mr?: number | string;
  mt?: number | string;
  mb?: number | string;
  mx?: number | string;
  my?: number | string;
  bg?: string;
}

declare type ImageInfo = {
  path: string;
  size: number;
  modified: number;
}

declare type ImageMeta = {
  name: string;
  url: string;
  desc?: string;
  path: string;
}

declare interface ICrosshairScheme {
  id?: string;
  name: string;
  crosshair: string;
  desc: string;
  width: number;
  height: number;
  lockRatio: boolean;
  canvasSize: number;
  canvasShape: "rect" | "circle";
  enableInvertFilter: boolean;
}

declare type KeyNames =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Enter"
  | "Escape"
  | "Backspace"
  | "Tab"
  | "Shift"
  | "CommandOrControl"
  | "Alt"
  | "Meta"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Space"
  | "Delete"
  | "Insert"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | (string & {});

declare type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
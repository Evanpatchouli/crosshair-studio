import { nanoid } from "nanoid";

namespace Model {
  export class CrosshairScheme implements ICrosshairScheme {
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

    constructor(props: ICrosshairScheme) {
      this.id = props.id ?? nanoid();
      this.name = props.name;
      this.crosshair = props.crosshair;
      this.desc = props.desc;
      this.width = props.width;
      this.height = props.height;
      this.lockRatio = props.lockRatio;
      this.canvasSize = props.canvasSize;
      this.canvasShape = props.canvasShape;
      this.enableInvertFilter = props.enableInvertFilter;
    }
  }
}

export default Model;

import "./index.css";

export default function Label(props: {
  for?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label className={["crosshairs-studio-label", props.className].join(" ")} htmlFor={props.for} style={props.style}>
      {props.children}
    </label>
  );
}

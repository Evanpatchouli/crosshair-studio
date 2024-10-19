import styles from "./index.module.css";

export default function HelpText(props: { children?: React.ReactNode }) {
  return props.children ? <p className={styles["helptext"]}>{props.children}</p> : null;
}

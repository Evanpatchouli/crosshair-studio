import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css";

export default function Md({ children }: { children: string }) {
  return (
    <Markdown className={"markdown"} remarkPlugins={[remarkGfm]}>
      {children}
    </Markdown>
  );
}

// import { appname } from "../../package.json";
import { useLayoutEffect, useState } from "react";
import { app } from "@tauri-apps/api";
import Loading from "@components/Loading";
import Logo from "/logo.svg";
import "./index.css";

export default function Splash() {
  const [appname, setAppname] = useState("");
  useLayoutEffect(() => {
    app.getName().then((s) => {
      setAppname(s);
    });
  }, []);
  return (
    <div className="splash">
      <img className="app-logo" src={Logo} alt="app-logo" />
      <h1 className="app-title">{appname}</h1>
      <div className="app-splash-description">
        应用启动中请稍等
        <span className="dotdotdot">...</span>
        <Loading on />
      </div>
    </div>
  );
}

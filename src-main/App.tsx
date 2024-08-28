import React from "react";
import { Toaster } from "react-hot-toast";
import useInit from "./hooks/useInit";
import Splash from "./splash";
import Crosshair from "./crosshair";
import "./App.css";

function Apploader() {
  // 初始化
  const isInitiated = useInit();
  if (!isInitiated) {
    return <Splash />;
  }
  return (
    <>
      <Crosshair />
    </>
  );
}

function App() {
  return (
    <>
      <Apploader />
      <Toaster />
    </>
  );
}

export default App;

import { Toaster } from "react-hot-toast";
import useInit from "./hooks/useInit";
import Splash from "@public/components/splash";
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
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Crosshair />
      </div>
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

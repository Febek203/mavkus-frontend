import { useState, useEffect } from "react";
import ChatContainer from "./components/ChatContainer";
import SettingsPanel from "./components/SettingsPanel";
import LoginRegister from "./components/LoginRegister";
import logo from "./assets/logo.png";

const BACKEND_URL = "https://mavkus-backend.onrender.com";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("error"));
  }, []);

  if (!isAuthenticated) {
    return <LoginRegister onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-bgDark text-textMain relative overflow-hidden">
      {/* Glow animated background */}
      <div className="absolute inset-0 bg-animated-glow bg-[length:200%_200%] animate-glow-bg -z-10" />

      {/* HEADER */}
      <header className="bg-bgCard/80 backdrop-blur-xl border-b border-borderSoft z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Mavkus logo"
              className="w-10 h-10 rounded-xl shadow-glowSm"
            />
            <h1 className="text-lg font-bold text-primary tracking-wide">
              MAVKUS AI
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                apiStatus === "connected"
                  ? "bg-accentCyan shadow-[0_0_8px_#22D3EE]"
                  : "bg-red-500"
              }`}
            />
            <span className="text-textMuted">{apiStatus}</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-3">
          <ChatContainer backendUrl={BACKEND_URL} />
        </div>

        <div className="lg:col-span-1">
          <SettingsPanel />
        </div>
      </main>
    </div>
  );
}

export default App;

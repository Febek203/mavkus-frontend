import { useState, useEffect } from "react";
import ChatContainer from "./components/ChatContainer";
import ChatInput from "./components/ChatInput";
import LoginRegister from "./components/LoginRegister";
import SettingsPanel from "./components/SettingsPanel";

import { auth, onAuthStateChanged, logout } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Controllo login utente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <LoginRegister onLogin={() => {}} />; // qui puoi passare funzione per login email/google
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgDark">
      <header className="flex justify-between items-center p-4 bg-bgCard/90 border-b border-borderSoft shadow-md">
        <h1 className="text-xl font-bold text-primary">Mavkus Chat</h1>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-primary rounded-xl hover:scale-105 transition"
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </button>
          <button
            className="px-4 py-2 bg-accentCyan rounded-xl hover:scale-105 transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        {showSettings && (
          <div className="absolute top-4 right-4 z-50">
            <SettingsPanel />
          </div>
        )}
        <ChatContainer user={user} />
      </main>

      <footer className="p-4 border-t border-borderSoft bg-bgCard/90">
        <ChatInput user={user} />
      </footer>
    </div>
  );
}

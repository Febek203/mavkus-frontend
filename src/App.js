import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, logout } from './firebase';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import SettingsPanel from './components/SettingsPanel';
import LoginRegister from './components/LoginRegister';
import Avatar from './assets/avatar.png';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [showSettings, setShowSettings] = useState(false);
  const [userStats, setUserStats] = useState(null);

  // Nuovi stati per le API Keys
  const [gropApiKey, setGropApiKey] = useState(() => localStorage.getItem('GROP_API_KEY') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await createUserProfileIfNeeded(firebaseUser);
        await Promise.all([checkApiStatus(), loadUserStats(firebaseUser.uid)]);
        setLoading(false);
      } else {
        setUser(null);
        setChatHistory([]);
        setUserStats(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const createUserProfileIfNeeded = async (firebaseUser) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photo_url: firebaseUser.photoURL
        })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const loadUserStats = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || isTyping) return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setIsTyping(true);

    try {
      // Se vuoi, puoi passare anche le API keys qui in body
      const chatResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.uid, 
          message: userMessage, 
          enable_critique: true,
          grop_api_key: gropApiKey,
          gemini_api_key: geminiApiKey
        })
      });

      const chatData = await chatResponse.json();
      if (chatData.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: chatData.response, metadata: chatData.metadata, timestamp: new Date().toISOString() }]);
      } else {
        throw new Error(chatData.detail || 'Errore sconosciuto');
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'error', content: `❌ Errore: ${error.message}`, timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    if (window.confirm('Cancellare tutta la conversazione?')) setChatHistory([]);
  };

  const handleLogout = async () => {
    try { await logout(); } catch (error) { console.error(error); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Salva le API key in localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('GROP_API_KEY', gropApiKey);
  }, [gropApiKey]);

  useEffect(() => {
    localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
  }, [geminiApiKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-neon-purple font-bold text-lg">Caricamento MAVKUS AI...</p>
      </div>
    );
  }

  if (!user) return <LoginRegister onAuthSuccess={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <header className="bg-cyber-panel/90 backdrop-blur-md border-b border-neon-purple shadow-lg z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Qui aggiungo la classe per fixare avatar proporzioni */}
            <img src={user.photoURL || Avatar} alt="Avatar" className="w-12 h-12 rounded-full shadow-neon avatar-fit-cover" />
            <div>
              <h1 className="text-2xl font-bold text-neon-purple tracking-wide glow">MAVKUS AI</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-300 text-sm">
                  Ciao, <span className="font-medium">{user.displayName?.split(' ')[0] || user.email?.split('@')[0]}</span>
                </p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-300">{apiStatus === 'connected' ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 neon-purple hover:opacity-80 text-black rounded-xl text-sm transition glow-button">⚙️ Impostazioni</button>
            <button onClick={clearChat} disabled={chatHistory.length===0} className="px-4 py-2 neon-purple hover:opacity-80 text-black rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed glow-button">🗑️ Pulisci</button>
            <button onClick={handleLogout} className="px-4 py-2 neon-red hover:opacity-80 text-black rounded-xl text-sm glow-button">🚪 Esci</button>
          </div>
        </div>
      </header>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4">
        <div className="flex-1 flex flex-col bg-cyber-panel backdrop-blur-sm rounded-3xl shadow-xl border border-neon-purple overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {chatHistory.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-gray-300 p-8 glow">
                  <div className="text-7xl mb-6 animate-pulse">👋</div>
                  <h2 className="text-2xl font-bold mb-2 glow">Benvenuto in MAVKUS AI!</h2>
                  <p className="text-gray-300 text-center max-w-md mb-8 glow">Sono il tuo assistente intelligente in stile cyberpunk neon.</p>
                </motion.div>
              ) : (
                chatHistory.map((msg, i) => <ChatMessage key={i} message={msg} isUser={msg.role==='user'} />)
              )}
            </AnimatePresence>
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="border-t border-neon-purple p-4 bg-cyber-panel/70 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  className="w-full border border-neon-purple rounded-xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent shadow-neon text-lg bg-cyber-input text-white placeholder-gray-400"
                  disabled={isTyping}
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">⏎</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!message.trim() || isTyping}
                className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-white rounded-xl w-14 h-14 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-neon"
              >
                {isTyping ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>➤</span>}
              </motion.button>
            </form>
          </div>
        </div>
      </main>

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel 
            user={user} 
            onClose={() => setShowSettings(false)} 
            gropApiKey={gropApiKey}
            setGropApiKey={setGropApiKey}
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

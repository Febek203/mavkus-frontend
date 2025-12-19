// App.js - VERSIONE SEMPLIFICATA CON SFONDO VIOLA E AVATAR
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, logout } from './firebase';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import SettingsPanel from './components/SettingsPanel';
import LoginRegister from './components/LoginRegister';
import Background from './components/Background';
import avatar from './assets/avatar.png';
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

    const userMsg = { role: 'user', content: message.trim(), timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, message: userMsg.content, enable_critique: true })
      });
      const data = await response.json();
      if (data.success) {
        const aiMsg = { role: 'assistant', content: data.response, metadata: data.metadata, timestamp: new Date().toISOString() };
        setChatHistory(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.detail || 'Errore sconosciuto');
      }
    } catch (error) {
      const errorMsg = { role: 'error', content: `❌ Errore: ${error.message}`, timestamp: new Date().toISOString() };
      setChatHistory(prev => [...prev, errorMsg]);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-purple-900">
      <div className="text-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        Caricamento MAVKUS AI...
      </div>
    </div>
  );

  if (!user) return <LoginRegister onAuthSuccess={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Canvas Background */}
      <Background />

      {/* HEADER */}
      <header className="z-10 relative flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm border-b border-purple-600">
        <div className="flex items-center gap-4">
          <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-purple-500" />
          <div>
            <h1 className="text-purple-400 font-bold text-xl">MAVKUS AI</h1>
            <p className="text-gray-200 text-sm">{user.displayName || user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="px-3 py-1 rounded bg-purple-500 text-black">⚙️</button>
          <button onClick={clearChat} className="px-3 py-1 rounded bg-purple-500 text-black">🗑️</button>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-black">🚪</button>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 z-10 relative flex flex-col max-w-3xl w-full mx-auto p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          {chatHistory.length === 0 && (
            <div className="text-gray-300 text-center mt-20">
              Benvenuto in MAVKUS AI! Scrivi un messaggio per iniziare.
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <ChatMessage key={i} message={msg} isUser={msg.role === 'user'} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi qui..."
            className="flex-1 rounded px-4 py-2 border border-purple-500 bg-black text-white"
          />
          <button type="submit" className="px-4 py-2 rounded bg-purple-500 text-black">➤</button>
        </form>
      </main>

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {showSettings && <SettingsPanel user={user} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;

// App.js - VERSIONE SEMPLIFICATA E CORRETTA
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, logout } from './firebase';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import SettingsPanel from './components/SettingsPanel';
import LoginRegister from './components/LoginRegister';
import './App.css';

function App() {
  // Stati principali
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [showSettings, setShowSettings] = useState(false);
  const [userStats, setUserStats] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ====================
  // EFFECT PRINCIPALE - GESTIONE AUTENTICAZIONE
  // ====================
  useEffect(() => {
    console.log('🔄 Controllo autenticazione...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Utente loggato:', firebaseUser.email);
        setUser(firebaseUser);
        
        // Crea profilo utente se necessario
        await createUserProfileIfNeeded(firebaseUser);
        
        // Carica dati utente
        await Promise.all([
          checkApiStatus(),
          loadUserStats(firebaseUser.uid)
        ]);
        
        setLoading(false);
      } else {
        console.log('🔐 Nessun utente loggato');
        setUser(null);
        setChatHistory([]);
        setUserStats(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // ====================
  // FUNZIONE - Crea profilo utente su backend
  // ====================
  const createUserProfileIfNeeded = async (firebaseUser) => {
    try {
      console.log('👤 Creazione/verifica profilo utente...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photo_url: firebaseUser.photoURL
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profilo utente:', data.message);
      } else {
        console.warn('⚠️ Errore creazione profilo, ma continuiamo...');
      }
    } catch (error) {
      console.error('❌ Errore creazione profilo:', error);
    }
  };

  // ====================
  // FUNZIONE - Verifica stato API backend
  // ====================
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
      setApiStatus(response.ok ? 'connected' : 'error');
      console.log('🔌 Backend status:', response.ok ? 'Online' : 'Offline');
    } catch (error) {
      setApiStatus('error');
      console.error('❌ Backend non raggiungibile');
    }
  };

  // ====================
  // FUNZIONE - Carica statistiche utente
  // ====================
  const loadUserStats = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        console.log('📊 Stats caricate:', data);
      }
    } catch (error) {
      console.error('❌ Errore caricamento stats:', error);
    }
  };

  // ====================
  // FUNZIONE - Invia messaggio alla chat
  // ====================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || isTyping) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Aggiungi messaggio utente
    const userMsg = { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, userMsg]);
    
    setIsTyping(true);

    try {
      const chatResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          message: userMessage,
          enable_critique: true
        })
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP ${chatResponse.status}`);
      }
      
      const chatData = await chatResponse.json();
      
      if (chatData.success) {
        const aiMsg = {
          role: 'assistant',
          content: chatData.response,
          metadata: chatData.metadata,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, aiMsg]);
      } else {
        throw new Error(chatData.detail || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMsg = {
        role: 'error',
        content: `❌ Errore: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  // ====================
  // FUNZIONE - Pulisci chat
  // ====================
  const clearChat = () => {
    if (window.confirm('Cancellare tutta la conversazione?')) {
      setChatHistory([]);
      console.log('🗑️ Chat pulita');
    }
  };

  // ====================
  // FUNZIONE - Logout
  // ====================
  const handleLogout = async () => {
    try {
      await logout();
      console.log('👋 Logout effettuato');
    } catch (error) {
      console.error('❌ Errore logout:', error);
    }
  };

  // ====================
  // FUNZIONE - Gestisci successo autenticazione
  // ====================
  const handleAuthSuccess = async (newUser) => {
    console.log('🎉 Auth success per:', newUser.email);
    setUser(newUser);
    setLoading(true);
    
    // Crea profilo e carica dati
    await createUserProfileIfNeeded(newUser);
    await Promise.all([
      checkApiStatus(),
      loadUserStats(newUser.uid)
    ]);
    
    setLoading(false);
  };

  // ====================
  // FUNZIONE - Auto-scroll ai nuovi messaggi
  // ====================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // ====================
  // RENDER - Loading
  // ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Caricamento MAVKUS AI...</p>
        </div>
      </div>
    );
  }

  // ====================
  // RENDER - Login/Register (se non loggato)
  // ====================
  if (!user) {
    console.log('🔐 Mostrando LoginRegister');
    return <LoginRegister onAuthSuccess={handleAuthSuccess} />;
  }

  // ====================
  // RENDER - Interfaccia Chat (se loggato)
  // ====================
  console.log('💬 Mostrando interfaccia chat per:', user.email);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* ==================== HEADER ==================== */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Info Utente */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🤖
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">MAVKUS AI</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    Ciao, <span className="font-medium">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {apiStatus === 'connected' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pulsanti Controllo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 flex items-center gap-2 text-sm"
              >
                ⚙️ Impostazioni
              </button>
              
              <button
                onClick={clearChat}
                disabled={chatHistory.length === 0}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Pulisci
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition duration-200 flex items-center gap-2 text-sm"
              >
                🚪 Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CHAT ==================== */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4">
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Contenitore Messaggi */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {chatHistory.length === 0 ? (
                // Schermata di benvenuto
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-gray-500 p-8"
                >
                  <div className="text-7xl mb-6">👋</div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">
                    Benvenuto in MAVKUS AI!
                  </h2>
                  <p className="text-gray-600 text-center max-w-md mb-8">
                    Sono il tuo assistente intelligente. Posso aiutarti con:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="text-blue-600 font-bold mb-1">💻 Coding</div>
                      <p className="text-sm text-gray-600">Python, JavaScript, algoritmi</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="text-green-600 font-bold mb-1">🔬 Scienze</div>
                      <p className="text-sm text-gray-600">Fisica, Chimica, Biologia</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <div className="text-purple-600 font-bold mb-1">🧮 Matematica</div>
                      <p className="text-sm text-gray-600">Calcolo, algebra, statistica</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm mb-2">
                      {userStats?.firebase_data?.api_keys_configured ? (
                        '✅ Le tue API keys personali sono configurate!'
                      ) : (
                        '💡 Configura le tue API keys per performance migliori'
                      )}
                    </p>
                    {!userStats?.firebase_data?.api_keys_configured && (
                      <button
                        onClick={() => setShowSettings(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Vai a Impostazioni →
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                // Messaggi chat
                <>
                  {chatHistory.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg}
                      isUser={msg.role === 'user'}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* ==================== INPUT AREA ==================== */}
          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  className="w-full border border-gray-300 rounded-xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
                  disabled={isTyping}
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ⏎
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!message.trim() || isTyping}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl w-14 h-14 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </form>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => setMessage("Spiegami la relatività generale")}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full transition"
              >
                🔬 Domanda scientifica
              </button>
              <button
                type="button"
                onClick={() => setMessage("Crea una funzione Python per ordinare una lista")}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full transition"
              >
                💻 Aiuto coding
              </button>
              <button
                type="button"
                onClick={() => setMessage("Calcola l'integrale di x^2 da 0 a 1")}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full transition"
              >
                🧮 Problema matematico
              </button>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Groq/LLaMA 3.3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Gemini Pro</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Apprendimento attivo</span>
            </div>
          </div>
          <p>MAVKUS AI • Sistema multi-AI intelligente</p>
        </div>
      </main>

      {/* ==================== SETTINGS PANEL ==================== */}
      <AnimatePresence>
        {showSettings && user && (
          <SettingsPanel
            user={user}
            onClose={() => setShowSettings(false)}
            onKeysUpdated={() => {
              loadUserStats(user.uid);
              console.log('🔄 API keys aggiornate');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
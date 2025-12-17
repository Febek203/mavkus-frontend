//SettingsPanel
import React, { useState, useEffect,useCallback } from 'react';
import { motion } from 'framer-motion';

const SettingsPanel = ({ user, onClose, onKeysUpdated }) => {
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userKeys, setUserKeys] = useState({});

  // useCallback per stabilizzare la funzione
  const loadUserKeys = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/get-keys/${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setUserKeys(data.api_keys);
        setGroqKey(data.api_keys.groq_api_key || '');
        setGeminiKey(data.api_keys.gemini_api_key || '');
      }
    } catch (error) {
      console.error('Errore caricamento keys:', error);
    }
  }, [user]);

  useEffect(() => {
    loadUserKeys();
  }, [loadUserKeys]);

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8000/api/auth/save-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          groq_api_key: groqKey.trim() || null,
          gemini_api_key: geminiKey.trim() || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '✅ API keys salvate con successo!' });
        await loadUserKeys();
        if (onKeysUpdated) onKeysUpdated();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.detail || 'Errore sconosciuto'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClearKeys = async () => {
    if (!user || !window.confirm('Sicuro di voler cancellare tutte le API keys?')) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/save-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          groq_api_key: null,
          gemini_api_key: null
        })
      });

      const data = await response.json();
      if (data.success) {
        setGroqKey('');
        setGeminiKey('');
        setUserKeys({});
        setMessage({ type: 'success', text: '✅ API keys cancellate' });
        if (onKeysUpdated) onKeysUpdated();
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">⚙️ Impostazioni Account</h2>
              <p className="text-blue-100 mt-1">Gestisci le tue API keys e preferenze</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full border-2 border-white shadow"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{user.displayName || 'Utente'}</h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-gray-500 text-xs mt-1">ID: {user.uid.substring(0, 12)}...</p>
              </div>
            </div>
          </div>

          {/* API Keys Form */}
          <form onSubmit={handleSaveKeys} className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔑 API Keys Personali
                {Object.keys(userKeys).length > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Configurate
                  </span>
                )}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ottienila gratuitamente da{' '}
                    <a 
                      href="https://console.groq.com/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      console.groq.com
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ottienila da{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      makersuite.google.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClearKeys}
                disabled={loading || Object.keys(userKeys).length === 0}
                className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition disabled:opacity-50"
              >
                Cancella Tutto
              </button>
              
              <button
                type="submit"
                disabled={loading || (!groqKey && !geminiKey)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvataggio...
                  </span>
                ) : (
                  '💾 Salva API Keys'
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informazioni importanti</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">🔒</span>
                <span>Le tue API keys vengono <strong>criptate</strong> prima di essere salvate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">🤖</span>
                <span>Vengono usate automaticamente quando chatti con MAVKUS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">💾</span>
                <span>Le tue conversazioni vengono salvate nel tuo account personale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">⚡</span>
                <span>Le keys personali garantiscono performance e limiti migliori</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <p className="text-center text-sm text-gray-500">
            Le tue API keys sono associate esclusivamente al tuo account
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
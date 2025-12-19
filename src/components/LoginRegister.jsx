// components/LoginRegister.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInWithGoogle, 
  registerWithEmail, 
  loginWithEmail,
  auth,
  onAuthStateChanged 
} from '../firebase';

const LoginRegister = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Utente già autenticato:', user.email);
      }
    });
    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.email) return setMessage({ type: 'error', text: '❌ L\'email è obbligatoria' });
    if (!formData.email.includes('@')) return setMessage({ type: 'error', text: '❌ Inserisci un\'email valida' });
    if (!formData.password) return setMessage({ type: 'error', text: '❌ La password è obbligatoria' });
    if (activeTab === 'register') {
      if (formData.password.length < 6) return setMessage({ type: 'error', text: '❌ La password deve avere almeno 6 caratteri' });
      if (formData.password !== formData.confirmPassword) return setMessage({ type: 'error', text: '❌ Le password non coincidono' });
      if (!formData.displayName.trim()) return setMessage({ type: 'error', text: '❌ Il nome è obbligatorio' });
    }
    return true;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        setMessage({ type: 'success', text: '✅ Login effettuato con successo!' });
        setTimeout(() => onAuthSuccess(result.user), 1000);
      } else {
        let errorMsg = result.error.includes('popup-closed-by-user')
          ? 'Login annullato'
          : result.error.includes('account-exists-with-different-credential')
          ? 'Account già esistente con un altro metodo'
          : result.error;
        setMessage({ type: 'error', text: `❌ ${errorMsg}` });
        setLoading(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const result = activeTab === 'login'
        ? await loginWithEmail(formData.email, formData.password)
        : await registerWithEmail(formData.email, formData.password, formData.displayName);

      if (result.success) {
        setMessage({ type: 'success', text: `✅ ${activeTab === 'login' ? 'Login' : 'Registrazione'} completata!` });
        setTimeout(() => onAuthSuccess(result.user), 1000);
      } else {
        let errorMsg = result.error;
        if (result.error.includes('auth/email-already-in-use')) errorMsg = 'Questa email è già registrata.';
        else if (result.error.includes('auth/user-not-found')) errorMsg = 'Account non trovato.';
        else if (result.error.includes('auth/wrong-password')) errorMsg = 'Password errata.';
        else if (result.error.includes('auth/too-many-requests')) errorMsg = 'Troppi tentativi, riprova più tardi.';
        else if (result.error.includes('auth/weak-password')) errorMsg = 'Password troppo debole.';
        else if (result.error.includes('auth/invalid-email')) errorMsg = 'Email non valida.';
        setMessage({ type: 'error', text: `❌ ${errorMsg}` });
        setLoading(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error.message}` });
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sfondo animato */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-700/50">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4 inline-block"
            >
              🤖
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MAVKUS AI
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Assistente AI intelligente • Accesso sicuro
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/50">
            <motion.button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 font-medium transition-all duration-300 ${
                activeTab === 'login'
                  ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              Accedi
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 font-medium transition-all duration-300 ${
                activeTab === 'register'
                  ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              Registrati
            </motion.button>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/20 border border-gray-600/50 text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continua con Google
            </motion.button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-600/50"></div>
              <span className="px-4 text-gray-500 text-sm">oppure con email</span>
              <div className="flex-1 border-t border-gray-600/50"></div>
            </div>

            <form onSubmit={handleEmailAuth}>
              <AnimatePresence mode="wait">
                {activeTab === 'register' && (
                  <motion.div
                    key="displayName"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="Come ti chiameremo?"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all duration-300"
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all duration-300"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="La tua password"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 pr-12 transition-all duration-300"
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'register' && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Conferma Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Ripeti la password"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all duration-300"
                      autoComplete="new-password"
                      required={activeTab === 'register'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'login' && (
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 focus:ring-2"
                    />
                    <span className="text-sm text-gray-400">Ricordami</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                    onClick={() => setMessage({ type: 'info', text: 'Contatta l\'amministratore per resettare la password' })}
                  >
                    Password dimenticata?
                  </button>
                </div>
              )}

              {/* Messaggi */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 p-4 rounded-xl border ${
                      message.type === 'success'
                        ? 'bg-green-900/30 text-green-300 border-green-700/50'
                        : message.type === 'error'
                        ? 'bg-red-900/30 text-red-300 border-red-700/50'
                        : 'bg-blue-900/30 text-blue-300 border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {message.type === 'success' && '✅'}
                      {message.type === 'error' && '❌'}
                      {message.type === 'info' && 'ℹ️'}
                      <span>{message.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {activeTab === 'login' ? 'Accesso in corso...' : 'Registrazione...'}
                  </>
                ) : (
                  activeTab === 'login' ? 'Accedi' : 'Crea Account'
                )}
              </motion.button>
            </form>

            {/* Switch Tab */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {activeTab === 'login' ? 'Non hai un account?' : 'Hai già un account?'}{' '}
                <button
                  onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {activeTab === 'login' ? 'Registrati' : 'Accedi'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegister;

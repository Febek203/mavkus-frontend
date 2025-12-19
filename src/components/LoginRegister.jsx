import { signInWithGoogle, loginWithEmail, registerWithEmail } from "../firebase";
import { useState } from "react";

export default function LoginRegister({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result.success) setError(result.error);
    else onLogin(result.user);
  };

  const handleEmailLogin = async () => {
    const result = await loginWithEmail(email, password);
    if (!result.success) setError(result.error);
    else onLogin(result.user);
  };

  const handleRegister = async () => {
    const result = await registerWithEmail(email, password, displayName);
    if (!result.success) setError(result.error);
    else onLogin(result.user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgDark px-4">
      <div className="bg-bgCard/90 border border-borderSoft rounded-3xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(124,58,237,0.35)]">
        <h2 className="text-center text-2xl font-bold text-primary mb-4">Benvenuto in Mavkus</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Nome"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full mb-2 px-3 py-2 rounded-lg bg-bgDark border border-borderSoft text-textMain"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 px-3 py-2 rounded-lg bg-bgDark border border-borderSoft text-textMain"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-bgDark border border-borderSoft text-textMain"
        />

        <button onClick={handleEmailLogin} className="w-full mb-2 py-2 bg-primary rounded-xl text-white hover:bg-primaryDark transition">
          Login
        </button>
        <button onClick={handleRegister} className="w-full mb-2 py-2 bg-accentCyan rounded-xl text-white hover:bg-accentCyanDark transition">
          Registrati
        </button>
        <button onClick={handleGoogleLogin} className="w-full py-2 bg-white rounded-xl text-black hover:scale-105 transition">
          Accedi con Google
        </button>
      </div>
    </div>
  );
}

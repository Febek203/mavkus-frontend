import { useState, useEffect } from "react";
import { db, auth, getUserData, updateUserLastLogin, createOrUpdateUserProfile } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function SettingsPanel() {
  const [userData, setUserData] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("default");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      const result = await getUserData(userId);
      if (result.success) {
        setUserData(result.data);
        setApiKey(result.data.apiKey || "");
        setModel(result.data.model || "default");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Aggiorna Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        apiKey: apiKey,
        model: model,
        apiKeysConfigured: !!apiKey,
        updatedAt: new Date().toISOString()
      });

      // Aggiorna anche il profilo locale
      await createOrUpdateUserProfile({ uid: userId, displayName: userData.displayName });

      setMessage("✅ Impostazioni salvate!");
    } catch (err) {
      console.error("Errore salvataggio settings:", err);
      setMessage("❌ Errore nel salvataggio. Riprova.");
    }
    setSaving(false);
  };

  if (!userData) return <p>Caricamento impostazioni...</p>;

  return (
    <div className="bg-bgCard border border-borderSoft rounded-2xl p-5 shadow-md w-72">
      <h3 className="text-lg font-semibold text-primary mb-4">Impostazioni</h3>

      <label className="block text-sm text-textMuted mb-1">Modello AI</label>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full bg-bgDark border border-borderSoft rounded-lg px-3 py-2 text-textMain focus:outline-none focus:ring-2 focus:ring-primary mb-4"
      >
        <option value="default">default</option>
        <option value="advanced">advanced</option>
      </select>

      <label className="block text-sm text-textMuted mb-1">API Key</label>
      <input
        type="text"
        placeholder="Inserisci la tua API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-bgDark border border-borderSoft text-textMain focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 bg-primary rounded-xl text-white hover:scale-105 transition"
      >
        {saving ? "Salvando..." : "Salva impostazioni"}
      </button>

      {message && <p className="mt-2 text-sm text-textMuted">{message}</p>}
    </div>
  );
}

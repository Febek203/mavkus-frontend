// firebase.js - VERSIONE PULITA E CORRETTA
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc
} from "firebase/firestore";

// ============================================
// CONFIGURAZIONE FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configura provider Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ============================================
// FUNZIONI DI AUTENTICAZIONE
// ============================================

/**
 * Login con Google
 */
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Salva su Firestore
    await createOrUpdateUserProfile(user);
    
    // Chiama il backend Python
    try {
      const backendResponse = await fetch('http://localhost:8000/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email,
          display_name: user.displayName || user.email?.split('@')[0],
          photo_url: user.photoURL || ""
        })
      });
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('✅ Backend sincronizzato:', backendData);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend non raggiungibile:', backendError.message);
    }
    
    return { 
      success: true, 
      user,
      message: 'Login con Google completato!'
    };
  } catch (error) {
    console.error("❌ Errore login Google:", error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Login annullato';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloccato dal browser. Consenti i popup per questo sito.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code 
    };
  }
};
/**
 * Registrazione con Email/Password
 */
const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { 
      displayName: displayName || email.split('@')[0] 
    });
    
    // Salva su Firestore
    const firestoreResult = await createOrUpdateUserProfile(user, displayName);
    
    // Chiama il backend Python
    const backendResponse = await fetch('http://localhost:8000/api/auth/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.uid,
        email: user.email,
        display_name: displayName || email.split('@')[0],
        photo_url: user.photoURL || ""
      })
    });
    
    if (!backendResponse.ok) {
      console.warn('⚠️ Backend non raggiungibile, ma utente creato su Firebase');
    } else {
      const backendData = await backendResponse.json();
      console.log('✅ Backend risposta:', backendData);
    }
    
    return { 
      success: true, 
      user,
      message: 'Registrazione completata!'
    };
  } catch (error) {
    console.error("❌ Errore registrazione:", error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email già registrata. Prova ad accedere.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password troppo debole. Usa almeno 6 caratteri.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email non valida.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code 
    };
  }
};

/**
 * Login con Email/Password
 */
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateUserLastLogin(user.uid);
    
    return { 
      success: true, 
      user,
      message: 'Login completato!'
    };
  } catch (error) {
    console.error("❌ Errore login:", error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Utente non trovato. Registrati prima.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Password errata. Riprova.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Troppi tentativi falliti. Riprova più tardi.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email non valida.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code 
    };
  }
};

/**
 * Logout
 */
const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, message: 'Logout effettuato' };
  } catch (error) {
    console.error("❌ Errore logout:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// FUNZIONI DATABASE FIRESTORE
// ============================================

/**
 * Crea o aggiorna profilo utente in Firestore
 */
const createOrUpdateUserProfile = async (user, customDisplayName = null) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    const displayName = customDisplayName || 
                       user.displayName || 
                       user.email?.split('@')[0] || 
                       "Utente";
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: user.photoURL || "",
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      totalConversations: userDoc.exists() ? userDoc.data().totalConversations || 0 : 0,
      totalTokensUsed: userDoc.exists() ? userDoc.data().totalTokensUsed || 0 : 0,
      apiKeysConfigured: userDoc.exists() ? userDoc.data().apiKeysConfigured || false : false,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(userRef, userData, { merge: true });
    console.log("✅ Profilo utente salvato:", user.uid);
    
    return { success: true, data: userData };
  } catch (error) {
    console.error("❌ Errore salvataggio profilo:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Aggiorna ultimo login
 */
const updateUserLastLogin = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Errore aggiornamento lastLogin:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Ottieni dati utente da Firestore
 */
const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { 
        success: true, 
        data: userDoc.data() 
      };
    } else {
      return { 
        success: false, 
        error: "Utente non trovato nel database" 
      };
    }
  } catch (error) {
    console.error("❌ Errore getUserData:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ============================================
// ESPORTAZIONE
// ============================================

export { 
  // Firebase app instances
  auth, 
  db,
  
  // Authentication functions
  signInWithGoogle, 
  registerWithEmail,
  loginWithEmail,
  logout, 
  onAuthStateChanged,
  
  // User profile functions
  createOrUpdateUserProfile,
  getUserData,
  updateUserLastLogin
};
/**
 * ─── Firebase SDK — Inicialización ────────────────────────────────────────────
 *
 * ⚠️ REEMPLAZAR los valores de firebaseConfig con los de tu proyecto Firebase:
 *   Firebase Console → Configuración del proyecto → Tus apps → SDK setup
 *
 * Una vez que tengas el firebaseConfig real, reemplazá TODOS los valores
 * que dicen "REEMPLAZAR_CON_..." con los valores reales.
 * Los valores de este archivo son públicos (van al cliente), no son secretos.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ⚠️ REEMPLAZAR: Pegar aquí el objeto firebaseConfig de Firebase Console
const firebaseConfig = {
  apiKey:            "REEMPLAZAR_CON_API_KEY",
  authDomain:        "REEMPLAZAR_CON_PROJECT_ID.firebaseapp.com",
  projectId:         "REEMPLAZAR_CON_PROJECT_ID",
  storageBucket:     "REEMPLAZAR_CON_PROJECT_ID.appspot.com",
  messagingSenderId: "REEMPLAZAR_CON_MESSAGING_SENDER_ID",
  appId:             "REEMPLAZAR_CON_APP_ID",
};

// Inicialización singleton (evita reinicializar en hot reload de Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;

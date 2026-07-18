/**
 * ─── Firebase Auth Helpers ─────────────────────────────────────────────────────
 *
 * Funciones centralizadas para autenticación en el frontend.
 * Reemplaza el manejo manual de tokens JWT en localStorage.
 *
 * COMPATIBILIDAD DURANTE LA TRANSICIÓN:
 * - getAuthToken() intenta Firebase primero, luego cae en JWT de localStorage
 * - Esto permite que ambos sistemas funcionen durante la migración
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Login con email y password.
 * Devuelve el user de Firebase.
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Registro con email y password.
 */
export async function registerWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Logout. Limpia también tokens JWT legacy de localStorage.
 */
export async function logout() {
  await signOut(auth);
  // Limpiar tokens legacy
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jn-auth-token');
    localStorage.removeItem('token');
    document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'adminRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'jn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

/**
 * Obtiene el token de autenticación actual.
 * Prioridad:
 *   1. Firebase ID Token (si hay usuario autenticado en Firebase)
 *   2. JWT de localStorage (fallback legacy durante la transición)
 *
 * @returns {Promise<string|null>}
 */
export async function getAuthToken() {
  // Intentar Firebase primero
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (_) {}
  }

  // Fallback: JWT legacy en localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jn-auth-token') || localStorage.getItem('token');
    if (token) return token;
  }

  return null;
}

/**
 * Obtiene el usuario actual de Firebase.
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Suscripción al estado de autenticación.
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Obtiene el rol del usuario actual desde los Custom Claims de Firebase.
 * @returns {Promise<string>} 'ADMIN' | 'OPERADOR' | 'FUTSAL' | 'SOCIO'
 */
export async function getCurrentUserRole() {
  if (!auth.currentUser) return null;
  const idTokenResult = await auth.currentUser.getIdTokenResult();
  return idTokenResult.claims.role || 'SOCIO';
}

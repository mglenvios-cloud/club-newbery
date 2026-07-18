/**
 * ─── Configuración Global de API — Club Jorge Newbery Digital ─────────────────
 *
 * La URL del backend se obtiene EXCLUSIVAMENTE desde la variable de entorno
 * NEXT_PUBLIC_API_URL.
 *
 * Entornos:
 *  - Desarrollo (.env.local):   NEXT_PUBLIC_API_URL=http://localhost:5000
 *  - Producción (Vercel):       NEXT_PUBLIC_API_URL=https://club-newbery-backend.onrender.com
 *
 * IMPORTANTE: Nunca escribir URLs hardcodeadas en componentes.
 * Siempre importar desde este archivo o usar apiFetch de @/lib/apiClient.
 */

if (!process.env.NEXT_PUBLIC_API_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '🚨 CONFIGURATION ERROR: The environment variable NEXT_PUBLIC_API_URL is NOT defined! ' +
      'Please configure it in Vercel → Settings → Environment Variables pointing to your production backend ' +
      '(e.g., https://club-newbery-backend.onrender.com).'
    );
  } else {
    console.warn(
      '⚠️ WARNING: NEXT_PUBLIC_API_URL is not defined. Defaulting to http://localhost:5000 for local development.'
    );
  }
}

/** URL base del backend. Se obtiene únicamente de la variable de entorno. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Ambiente de ejecución actual.
 * Valores posibles: 'development' | 'production'
 */
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production';

export const DEMO_MODE = false;

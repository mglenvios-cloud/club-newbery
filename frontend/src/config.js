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

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  // En producción esta variable es obligatoria. Si no está configurada en Vercel,
  // todas las llamadas a la API fallarán.
  console.error(
    '[Config] CRITICAL: NEXT_PUBLIC_API_URL no está definida. ' +
    'Configurarla en Vercel → Settings → Environment Variables.'
  );
}

/** URL base del backend. Se obtiene únicamente de la variable de entorno. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Ambiente de ejecución actual.
 * Valores posibles: 'development' | 'production'
 */
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production';

/**
 * Modo demo — SOLO para desarrollo local con NEXT_PUBLIC_DEMO_MODE=true.
 * En producción siempre es false, nunca se muestran datos simulados.
 */
export const DEMO_MODE = APP_ENV === 'development' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

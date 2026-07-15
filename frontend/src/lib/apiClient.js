import { API_URL } from '../config';

/**
 * ─── API Client Centralizado — Club Jorge Newbery Digital ─────────────────────
 *
 * ARQUITECTURA:
 * - En producción (Vercel), next.config.mjs redirige /api/* al backend de Render.
 *   Esto elimina CORS por completo ya que el origen es el mismo.
 * - En desarrollo, las rutas /api/* van a localhost:5000 según NEXT_PUBLIC_API_URL.
 *
 * NUNCA usar fetch() nativo directamente. Siempre usar apiFetch() o apiClient.
 */

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('jn-auth-token') || localStorage.getItem('token');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Función fetch centralizada que:
 * - Inyecta cabeceras de autenticación automáticamente
 * - Construye la URL correcta según el entorno
 * - Maneja respuestas de error comunes (401, 403, 500)
 * - Lanza errores descriptivos para facilitar debugging
 *
 * @param {string} path - Ruta relativa (e.g. '/api/players') o URL completa
 * @param {RequestInit} options - Opciones de fetch estándar
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  // Construir la URL:
  // - Si path comienza con http, se usa tal cual (URL absoluta externa)
  // - Si hay API_URL configurado, se concatena para llamadas cross-origin
  // - Si no hay API_URL (producción con rewrites), las rutas /api/* van al mismo origen
  let url;
  if (path.startsWith('http')) {
    url = path;
  } else if (API_URL) {
    url = `${API_URL}${path}`;
  } else {
    // En producción con next.config.mjs rewrites: /api/* → backend
    url = path;
  }

  // Combinar cabeceras
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  // Convertir body a JSON si es un objeto plano (no FormData)
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
    // FormData no debe tener Content-Type (el browser lo genera con boundary)
  } else if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    // Manejo de errores HTTP globales
    if (response.status === 401) {
      if (typeof window !== 'undefined' && !url.includes('/api/auth/login')) {
        // Limpiar tokens inválidos
        localStorage.removeItem('jn-auth-token');
        localStorage.removeItem('token');
        document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'adminRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'jn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        } else if (window.location.pathname.startsWith('/portal') && window.location.pathname !== '/portal/login') {
          window.location.href = '/portal/login';
        }
      }
    } else if (response.status === 403) {
      console.error(`[API] 403 Acceso denegado: ${url}`);
    } else if (response.status === 500) {
      console.error(`[API] 500 Error interno del servidor: ${url}`);
    } else if (response.status === 404) {
      console.error(`[API] 404 Endpoint no encontrado: ${url}`);
    }

    return response;
  } catch (error) {
    console.error(`[API] Error de red: ${url}`, error.message);
    throw error;
  }
}

/** Helper object con métodos tipados para operaciones CRUD */
export const apiClient = {
  get:    (path, options)        => apiFetch(path, { ...options, method: 'GET' }),
  post:   (path, body, options)  => apiFetch(path, { ...options, method: 'POST',   body }),
  put:    (path, body, options)  => apiFetch(path, { ...options, method: 'PUT',    body }),
  patch:  (path, body, options)  => apiFetch(path, { ...options, method: 'PATCH',  body }),
  delete: (path, options)        => apiFetch(path, { ...options, method: 'DELETE' }),
};

import { API_URL } from '../config';

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("jn-auth-token") || localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Función fetch centralizada y robusta que inyecta cabeceras de autenticación,
 * construye la URL correcta según el entorno y maneja respuestas de error comunes.
 */
export async function apiFetch(path, options = {}) {
  // Construir la URL completa
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  // Combinar cabeceras por defecto y las especificadas
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  // Convertir body a JSON si es un objeto plano
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Manejo de errores global
    if (response.status === 401) {
      if (typeof window !== 'undefined' && !url.includes('/api/auth/login')) {
        console.warn('Sesión expirada o inválida (401). Redirigiendo a login.');
        localStorage.removeItem("jn-auth-token");
        localStorage.removeItem("token");
        document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "adminRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "jn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = "/admin/login";
        } else if (window.location.pathname.startsWith('/portal') && window.location.pathname !== '/portal/login') {
          window.location.href = "/portal/login";
        }
      }
    } else if (response.status === 403) {
      console.error('Error 403: Acceso denegado. No tienes permisos suficientes.');
    } else if (response.status === 500) {
      console.error('Error 500: Error interno del servidor.');
    }

    return response;
  } catch (error) {
    console.error('Error de red en apiFetch:', error);
    throw error;
  }
}

export const apiClient = {
  get: (path, options) => apiFetch(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiFetch(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiFetch(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => apiFetch(path, { ...options, method: 'DELETE' }),
};

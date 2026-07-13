/**
 * Utilidad de respuestas uniformes para la API de Gestión Deportiva.
 *
 * Formato estándar:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any | null,
 *   errors: any | null,
 *   timestamp: string (ISO 8601)
 * }
 */

/**
 * Envía una respuesta exitosa.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {any}    options.data     - Payload de la respuesta
 * @param {string} [options.message='OK']
 * @param {number} [options.status=200]
 */
function sendSuccess(res, { data = null, message = 'OK', status = 200 } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString()
  });
}

/**
 * Envía una respuesta de error.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} [options.message='Error interno del servidor']
 * @param {any}    [options.errors=null]
 * @param {number} [options.status=500]
 */
function sendError(res, { message = 'Error interno del servidor', errors = null, status = 500 } = {}) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString()
  });
}

module.exports = { sendSuccess, sendError };

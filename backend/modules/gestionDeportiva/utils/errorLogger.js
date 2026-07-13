/**
 * Logger de errores centralizado para el módulo de Gestión Deportiva.
 *
 * Registra: ruta, método, usuario, fecha, mensaje de error y stack trace.
 * Nunca lanza excepciones — solo registra. El servidor continúa ejecutándose.
 */

/**
 * Registra un error estructurado en consola.
 * @param {object} options
 * @param {string}         options.module   - Nombre del módulo/servicio (ej: 'TrainingsService')
 * @param {string}         options.action   - Acción que falló (ej: 'getAll', 'create')
 * @param {Error}          options.error    - El objeto de error capturado
 * @param {import('express').Request} [options.req] - Request de Express (opcional)
 */
function logError({ module: mod, action, error, req = null }) {
  const entry = {
    timestamp: new Date().toISOString(),
    module: mod,
    action,
    method: req?.method || 'N/A',
    path: req?.originalUrl || req?.path || 'N/A',
    user: req?.user?.email || req?.user?.id || 'anónimo',
    message: error?.message || String(error),
    stack: error?.stack || null
  };

  console.error(
    `[GestionDeportiva][${entry.module}][${entry.action}]`,
    `${entry.method} ${entry.path}`,
    `| usuario: ${entry.user}`,
    `| ${entry.timestamp}`,
    '\n→ Error:', entry.message,
    entry.stack ? `\n→ Stack:\n${entry.stack}` : ''
  );

  return entry;
}

module.exports = { logError };

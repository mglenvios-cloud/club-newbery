/**
 * Validaciones centralizadas para el módulo de Gestión Deportiva.
 * Devuelven null si los datos son válidos, o un string con el mensaje de error.
 */

// Roles válidos para Coach
const VALID_COACH_ROLES = ['ENTRENADOR', 'AYUDANTE', 'PF'];

// Estados válidos para Training
const VALID_TRAINING_STATUS = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

// Categorías válidas para Document
const VALID_DOC_CATEGORIES = ['REGLAMENTO', 'PLANIFICACION', 'ACTA', 'CONTRATO', 'OTRO'];

/**
 * Valida un ID numérico de parámetro de ruta.
 * @param {string|number} id
 * @returns {string|null}
 */
function validateId(id) {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return 'El ID proporcionado no es válido. Debe ser un número entero positivo.';
  }
  return null;
}

/**
 * Valida los campos requeridos para crear/actualizar un entrenamiento.
 * @param {object} data
 * @returns {string|null}
 */
function validateTraining(data) {
  const { date, timeSlot, category, coach, court } = data;

  if (!date) return 'El campo "fecha" es obligatorio.';
  if (!timeSlot) return 'El campo "horario" es obligatorio.';
  if (!category) return 'El campo "categoría" es obligatorio.';
  if (!coach) return 'El campo "entrenador" es obligatorio.';
  if (!court) return 'El campo "cancha" es obligatorio.';

  if (isNaN(Date.parse(date))) return 'El campo "fecha" no tiene un formato válido.';

  if (data.status && !VALID_TRAINING_STATUS.includes(data.status.toUpperCase())) {
    return `El estado "${data.status}" no es válido. Valores aceptados: ${VALID_TRAINING_STATUS.join(', ')}.`;
  }

  return null;
}

/**
 * Valida los campos requeridos para crear un documento.
 * @param {object} data
 * @returns {string|null}
 */
function validateDocument(data) {
  const { title, url, category } = data;

  if (!title || title.trim() === '') return 'El campo "título" es obligatorio.';
  if (!url || url.trim() === '') return 'El campo "URL" es obligatorio.';
  if (!category || category.trim() === '') return 'El campo "categoría" es obligatorio.';

  return null;
}

/**
 * Valida los campos requeridos para crear/actualizar un coach.
 * @param {object} data
 * @returns {string|null}
 */
function validateCoach(data) {
  const { name, role } = data;

  if (!name || name.trim() === '') return 'El campo "nombre" es obligatorio.';
  if (!role || role.trim() === '') return 'El campo "rol" es obligatorio.';

  const roleUp = role.toUpperCase();
  if (!VALID_COACH_ROLES.includes(roleUp)) {
    return `El rol "${role}" no es válido. Valores aceptados: ${VALID_COACH_ROLES.join(', ')}.`;
  }

  return null;
}

/**
 * Valida que la query de búsqueda global tenga al menos 2 caracteres.
 * @param {string} q
 * @returns {string|null}
 */
function validateSearchQuery(q) {
  if (!q || q.trim().length < 2) {
    return 'La búsqueda debe tener al menos 2 caracteres.';
  }
  return null;
}

module.exports = {
  validateId,
  validateTraining,
  validateDocument,
  validateCoach,
  validateSearchQuery,
  VALID_COACH_ROLES,
  VALID_TRAINING_STATUS
};

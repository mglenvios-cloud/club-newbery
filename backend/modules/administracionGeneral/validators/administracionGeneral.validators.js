/**
 * Validaciones centralizadas para el módulo de Administración General.
 * Devuelven null si son válidos, o un string con el mensaje de error.
 */

const VALID_FACILITY_TYPES = ['CANCHA', 'GIMNASIO', 'VESTUARIO', 'OFICINA', 'SALON', 'QUINCHO', 'BUFFET', 'DEPOSITO', 'OTHER'];
const VALID_SEASON_STATUS = ['ACTIVE', 'FINISHED', 'PLANIFICADA'];

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
 * Valida los datos de configuración del club.
 * @param {object} data
 * @returns {string|null}
 */
function validateClubConfig(data) {
  if (!data.name || data.name.trim() === '') {
    return 'El nombre del club es obligatorio.';
  }
  return null;
}

/**
 * Valida los datos de una temporada.
 * @param {object} data
 * @returns {string|null}
 */
function validateSeason(data) {
  const { name, year, startDate, endDate, status } = data;

  if (!name || name.trim() === '') return 'El nombre de la temporada es obligatorio.';
  if (!year || isNaN(parseInt(year))) return 'El año de la temporada debe ser un número válido.';
  if (!startDate) return 'La fecha de inicio es obligatoria.';
  if (!endDate) return 'La fecha de finalización es obligatoria.';

  if (isNaN(Date.parse(startDate))) return 'La fecha de inicio no es válida.';
  if (isNaN(Date.parse(endDate))) return 'La fecha de finalización no es válida.';

  if (new Date(startDate) > new Date(endDate)) {
    return 'La fecha de inicio no puede ser posterior a la fecha de finalización.';
  }

  if (status && !VALID_SEASON_STATUS.includes(status.toUpperCase())) {
    return `El estado "${status}" no es válido. Valores aceptados: ${VALID_SEASON_STATUS.join(', ')}.`;
  }

  return null;
}

/**
 * Valida los datos de una disciplina.
 * @param {object} data
 * @returns {string|null}
 */
function validateDiscipline(data) {
  const { name } = data;
  if (!name || name.trim() === '') {
    return 'El nombre de la disciplina es obligatorio.';
  }
  return null;
}

/**
 * Valida los datos de una sede.
 * @param {object} data
 * @returns {string|null}
 */
function validateSede(data) {
  const { name } = data;
  if (!name || name.trim() === '') {
    return 'El nombre de la sede es obligatorio.';
  }
  return null;
}

/**
 * Valida los datos de una instalación (Facility).
 * @param {object} data
 * @returns {string|null}
 */
function validateFacility(data) {
  const { name, type, sedeId } = data;

  if (!name || name.trim() === '') return 'El nombre de la instalación es obligatorio.';
  if (!sedeId || isNaN(parseInt(sedeId))) return 'El ID de la Sede vinculada es obligatorio.';

  if (type && !VALID_FACILITY_TYPES.includes(type.toUpperCase())) {
    return `El tipo de instalación "${type}" no es válido. Valores aceptados: ${VALID_FACILITY_TYPES.join(', ')}.`;
  }

  return null;
}

/**
 * Valida los datos de un usuario.
 * @param {object} data
 * @param {boolean} [isUpdate=false]
 * @returns {string|null}
 */
function validateUser(data, isUpdate = false) {
  const { email, password } = data;

  if (!isUpdate) {
    if (!email || email.trim() === '') return 'El correo electrónico es obligatorio.';
    if (!password || password.trim().length < 4) return 'La contraseña es obligatoria y debe tener al menos 4 caracteres.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'El formato del correo electrónico no es válido.';
  }

  return null;
}

/**
 * Valida los datos de un rol.
 * @param {object} data
 * @returns {string|null}
 */
function validateRole(data) {
  const { name } = data;
  if (!name || name.trim() === '') {
    return 'El nombre del rol es obligatorio.';
  }
  return null;
}

module.exports = {
  validateId,
  validateClubConfig,
  validateSeason,
  validateDiscipline,
  validateSede,
  validateFacility,
  validateUser,
  validateRole,
  VALID_FACILITY_TYPES,
  VALID_SEASON_STATUS
};

/**
 * Validaciones centralizadas para el módulo de Socios y Carnet Digital.
 * Devuelven null si los datos son válidos, o un string con el mensaje de error.
 */

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
 * Valida los datos requeridos para crear/actualizar un Socio.
 * @param {object} data
 * @param {boolean} [isUpdate=false]
 * @returns {string|null}
 */
function validateSocio(data, isUpdate = false) {
  const { nombre, apellido, DNI, fechaNacimiento, email } = data;

  if (!isUpdate) {
    if (!nombre || nombre.trim() === '') return 'El nombre es obligatorio.';
    if (!apellido || apellido.trim() === '') return 'El apellido es obligatorio.';
    if (!DNI || DNI.trim() === '') return 'El DNI es obligatorio.';
    if (!fechaNacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (!email || email.trim() === '') return 'El correo electrónico es obligatorio.';
  }

  if (DNI && !/^\d{7,10}$/.test(DNI.trim())) {
    return 'El DNI debe contener únicamente números y tener entre 7 y 10 dígitos.';
  }

  if (fechaNacimiento && isNaN(Date.parse(fechaNacimiento))) {
    return 'La fecha de nacimiento proporcionada no es válida.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'El formato del correo electrónico no es válido.';
  }

  return null;
}

/**
 * Valida los datos requeridos para crear/actualizar un Tutor.
 * @param {object} data
 * @param {boolean} [isUpdate=false]
 * @returns {string|null}
 */
function validateTutor(data, isUpdate = false) {
  const { nombre, apellido, DNI, telefono, email, parentesco } = data;

  if (!isUpdate) {
    if (!nombre || nombre.trim() === '') return 'El nombre del tutor es obligatorio.';
    if (!apellido || apellido.trim() === '') return 'El apellido del tutor es obligatorio.';
    if (!DNI || DNI.trim() === '') return 'El DNI del tutor es obligatorio.';
    if (!telefono || telefono.trim() === '') return 'El teléfono es obligatorio.';
    if (!email || email.trim() === '') return 'El correo electrónico es obligatorio.';
    if (!parentesco || parentesco.trim() === '') return 'El parentesco es obligatorio.';
  }

  if (DNI && !/^\d{7,10}$/.test(DNI.trim())) {
    return 'El DNI del tutor debe contener únicamente números y tener entre 7 y 10 dígitos.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'El formato del correo electrónico del tutor no es válido.';
  }

  return null;
}

module.exports = {
  validateId,
  validateSocio,
  validateTutor
};

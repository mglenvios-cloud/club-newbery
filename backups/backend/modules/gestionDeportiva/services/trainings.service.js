/**
 * Servicio de Entrenamientos.
 * Encapsula toda la lógica de acceso a datos para el modelo Training.
 */

const prisma = require('../../../prismaClient');

/**
 * Obtiene todos los entrenamientos con filtros opcionales.
 * @param {{ category?: string, court?: string, team?: string }} filters
 * @returns {Promise<Training[]>}
 */
async function getAll(filters = {}) {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.court) where.court = filters.court;
  if (filters.team) where.team = filters.team;

  return prisma.training.findMany({
    where,
    orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }]
  });
}

/**
 * Crea un nuevo entrenamiento.
 * @param {object} data
 * @returns {Promise<Training>}
 */
async function create(data) {
  const { date, timeSlot, category, coach, court, team, objective, notes, status } = data;

  return prisma.training.create({
    data: {
      date: new Date(date),
      timeSlot,
      category,
      coach,
      court,
      team: team || '',
      objective: objective || '',
      notes: notes || '',
      status: status ? status.toUpperCase() : 'SCHEDULED'
    }
  });
}

/**
 * Actualiza un entrenamiento existente.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Training>}
 */
async function update(id, data) {
  const { date, timeSlot, category, coach, court, team, objective, notes, status } = data;

  return prisma.training.update({
    where: { id },
    data: {
      date: date ? new Date(date) : undefined,
      timeSlot,
      category,
      coach,
      court,
      team,
      objective,
      notes,
      status: status ? status.toUpperCase() : undefined
    }
  });
}

/**
 * Elimina un entrenamiento. Verifica que exista antes de eliminar.
 * @param {number} id
 * @returns {Promise<Training>}
 */
async function remove(id) {
  const existing = await prisma.training.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Entrenamiento no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return prisma.training.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };

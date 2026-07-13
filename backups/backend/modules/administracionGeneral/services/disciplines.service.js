const prisma = require('../../../prismaClient');

/**
 * Obtiene todas las disciplinas.
 * @param {number} [clubId=1]
 * @returns {Promise<Discipline[]>}
 */
async function getAll(clubId = 1) {
  return prisma.discipline.findMany({
    where: { clubId },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }]
  });
}

/**
 * Crea una nueva disciplina.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<Discipline>}
 */
async function create(clubId = 1, data) {
  const { name, icon, color, displayOrder, manager, isActive, description } = data;

  return prisma.discipline.create({
    data: {
      name: name.trim(),
      icon: icon || 'Trophy',
      color: color || '#CC0000',
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      manager: manager || '',
      isActive: isActive !== undefined ? !!isActive : true,
      description: description || '',
      clubId
    }
  });
}

/**
 * Actualiza una disciplina existente.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Discipline>}
 */
async function update(id, data) {
  const existing = await prisma.discipline.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Disciplina no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const { name, icon, color, displayOrder, manager, isActive, description } = data;

  return prisma.discipline.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      icon,
      color,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
      manager,
      isActive: isActive !== undefined ? !!isActive : undefined,
      description
    }
  });
}

/**
 * Elimina una disciplina.
 * @param {number} id
 * @returns {Promise<Discipline>}
 */
async function remove(id) {
  const existing = await prisma.discipline.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Disciplina no encontrada');
    err.statusCode = 404;
    throw err;
  }

  return prisma.discipline.delete({
    where: { id }
  });
}

module.exports = { getAll, create, update, remove };

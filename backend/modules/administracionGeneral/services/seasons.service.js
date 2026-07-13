const prisma = require('../../../prismaClient');

/**
 * Obtiene todas las temporadas de un club.
 * @param {number} [clubId=1]
 * @returns {Promise<Season[]>}
 */
async function getAll(clubId = 1) {
  return prisma.season.findMany({
    where: { clubId },
    orderBy: [{ year: 'desc' }, { startDate: 'desc' }]
  });
}

/**
 * Crea una nueva temporada.
 * Si es marcada como activa o por defecto, desactiva las anteriores.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<Season>}
 */
async function create(clubId = 1, data) {
  const { name, year, startDate, endDate, status, isActive, isDefault, sportYear } = data;

  if (isActive) {
    await prisma.season.updateMany({
      where: { clubId, isActive: true },
      data: { isActive: false }
    });
  }

  if (isDefault) {
    await prisma.season.updateMany({
      where: { clubId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return prisma.season.create({
    data: {
      name: name.trim(),
      year: parseInt(year),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'PLANIFICADA',
      isActive: !!isActive,
      isDefault: !!isDefault,
      sportYear: sportYear || String(year),
      clubId
    }
  });
}

/**
 * Actualiza una temporada existente.
 * Si es marcada como activa o por defecto, desactiva las otras.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Season>}
 */
async function update(id, data) {
  const existing = await prisma.season.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Temporada no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const { name, year, startDate, endDate, status, isActive, isDefault, sportYear } = data;
  const clubId = existing.clubId || 1;

  if (isActive && !existing.isActive) {
    await prisma.season.updateMany({
      where: { clubId, isActive: true },
      data: { isActive: false }
    });
  }

  if (isDefault && !existing.isDefault) {
    await prisma.season.updateMany({
      where: { clubId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return prisma.season.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      year: year ? parseInt(year) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      isActive: isActive !== undefined ? !!isActive : undefined,
      isDefault: isDefault !== undefined ? !!isDefault : undefined,
      sportYear
    }
  });
}

/**
 * Elimina una temporada.
 * @param {number} id
 * @returns {Promise<Season>}
 */
async function remove(id) {
  const existing = await prisma.season.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Temporada no encontrada');
    err.statusCode = 404;
    throw err;
  }

  return prisma.season.delete({
    where: { id }
  });
}

module.exports = { getAll, create, update, remove };

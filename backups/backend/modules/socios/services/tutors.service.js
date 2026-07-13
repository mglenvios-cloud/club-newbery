const prisma = require('../../../prismaClient');

/**
 * Obtiene todos los tutores registrados.
 * @returns {Promise<Tutor[]>}
 */
async function getAll() {
  return prisma.tutor.findMany({
    include: { socios: true },
    orderBy: { apellido: 'asc' }
  });
}

/**
 * Crea un tutor en el sistema.
 * @param {object} data
 * @returns {Promise<Tutor>}
 */
async function create(data) {
  const { nombre, apellido, DNI, telefono, email, parentesco, contactoEmergencia } = data;

  const existingDni = await prisma.tutor.findUnique({ where: { DNI: DNI.trim() } });
  if (existingDni) {
    const err = new Error('El DNI del tutor ya se encuentra registrado.');
    err.statusCode = 400;
    throw err;
  }

  return prisma.tutor.create({
    data: {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      DNI: DNI.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      parentesco: parentesco.trim(),
      contactoEmergencia: contactoEmergencia || ''
    }
  });
}

/**
 * Actualiza un tutor.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Tutor>}
 */
async function update(id, data) {
  const existing = await prisma.tutor.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Tutor no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const { nombre, apellido, DNI, telefono, email, parentesco, contactoEmergencia } = data;

  if (DNI && DNI.trim() !== existing.DNI) {
    const doubleDni = await prisma.tutor.findUnique({ where: { DNI: DNI.trim() } });
    if (doubleDni) {
      const err = new Error('El DNI del tutor ya se encuentra registrado.');
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.tutor.update({
    where: { id },
    data: {
      nombre: nombre ? nombre.trim() : undefined,
      apellido: apellido ? apellido.trim() : undefined,
      DNI: DNI ? DNI.trim() : undefined,
      telefono,
      email: email ? email.trim().toLowerCase() : undefined,
      parentesco,
      contactoEmergencia
    }
  });
}

/**
 * Elimina un tutor. Desvincula todos los socios asociados.
 * @param {number} id
 * @returns {Promise<Tutor>}
 */
async function remove(id) {
  const existing = await prisma.tutor.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Tutor no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  // Desvincular socios
  await prisma.member.updateMany({
    where: { tutorId: id },
    data: { tutorId: null }
  });

  return prisma.tutor.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };

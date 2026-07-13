const prisma = require('../../../prismaClient');

/**
 * Genera el siguiente número de socio secuencial.
 * @returns {Promise<number>}
 */
async function getNextSocioNumber() {
  const lastMember = await prisma.member.findFirst({
    orderBy: { socioNumber: 'desc' }
  });
  return lastMember ? lastMember.socioNumber + 1 : 1001;
}

/**
 * Obtiene todos los socios con filtros opcionales.
 * @param {object} filters
 * @param {number} [clubId=1]
 * @returns {Promise<Member[]>}
 */
async function getAll(filters = {}, clubId = 1) {
  const where = { clubId };

  if (filters.estado) {
    where.estado = filters.estado.toUpperCase();
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    const searchVal = filters.search.trim().toLowerCase();
    where.OR = [
      { firstName: { contains: searchVal } },
      { lastName: { contains: searchVal } },
      { dni: { contains: searchVal } },
      { email: { contains: searchVal } }
    ];
    // Si la búsqueda es un número, intentar buscar por socioNumber
    const num = parseInt(searchVal, 10);
    if (!isNaN(num)) {
      where.OR.push({ socioNumber: num });
    }
  }

  return prisma.member.findMany({
    where,
    include: { tutor: true, digitalCard: true, user: { select: { email: true } } },
    orderBy: { socioNumber: 'asc' }
  });
}

/**
 * Crea un nuevo socio en el sistema.
 * Genera de forma automática el número de socio y vincula la cuenta de usuario.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<Member>}
 */
async function create(clubId = 1, data) {
  const {
    nombre, apellido, DNI, fechaNacimiento, sexo, foto,
    direccion, ciudad, provincia, codigoPostal, telefono, email,
    estado, observaciones, tutorId, userId
  } = data;

  // Validar DNI único
  const existingDni = await prisma.member.findUnique({ where: { dni: DNI.trim() } });
  if (existingDni) {
    const err = new Error('El DNI ya se encuentra registrado por otro socio.');
    err.statusCode = 400;
    throw err;
  }

  // Validar email único
  const existingEmail = await prisma.member.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existingEmail) {
    const err = new Error('El correo electrónico ya se encuentra registrado por otro socio.');
    err.statusCode = 400;
    throw err;
  }

  // Si se provee userId, validar que no tenga ya un socio asociado
  if (userId) {
    const existingUserSocio = await prisma.member.findUnique({ where: { userId: parseInt(userId) } });
    if (existingUserSocio) {
      const err = new Error('El usuario ya cuenta con un perfil de socio vinculado.');
      err.statusCode = 400;
      throw err;
    }
  }

  const socioNumber = await getNextSocioNumber();

  // Si no se provee userId, creamos una cuenta de usuario desactivada por defecto para este socio
  let finalUserId = userId ? parseInt(userId) : null;
  if (!finalUserId) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(DNI.trim(), 10); // Clave por defecto es su DNI
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'SOCIO',
        isActive: true,
        name: `${nombre.trim()} ${apellido.trim()}`,
        clubId
      }
    });
    finalUserId = user.id;
  }

  return prisma.member.create({
    data: {
      socioNumber,
      firstName: nombre.trim(),
      lastName: apellido.trim(),
      dni: DNI.trim(),
      birthDate: new Date(fechaNacimiento),
      address: direccion || '',
      phone: telefono || '',
      category: data.category || 'ACTIVO',
      isActive: estado ? estado.toUpperCase() === 'ACTIVO' : true,
      email: email.trim().toLowerCase(),
      sexo: sexo || '',
      foto: foto || null,
      ciudad: ciudad || '',
      provincia: provincia || '',
      codigoPostal: codigoPostal || '',
      estado: estado || 'ACTIVO',
      fechaAlta: data.fechaAlta ? new Date(data.fechaAlta) : new Date(),
      observaciones: observaciones || '',
      userId: finalUserId,
      tutorId: tutorId ? parseInt(tutorId) : null,
      clubId
    },
    include: { tutor: true, digitalCard: true }
  });
}

/**
 * Actualiza la ficha de un socio.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Member>}
 */
async function update(id, data) {
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Socio no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const {
    nombre, apellido, DNI, fechaNacimiento, sexo, foto,
    direccion, ciudad, provincia, codigoPostal, telefono, email,
    estado, observaciones, tutorId, category
  } = data;

  // Validaciones de unicidad si cambian
  if (DNI && DNI.trim() !== existing.dni) {
    const doubleDni = await prisma.member.findUnique({ where: { dni: DNI.trim() } });
    if (doubleDni) {
      const err = new Error('El DNI ya se encuentra registrado por otro socio.');
      err.statusCode = 400;
      throw err;
    }
  }

  if (email && email.trim().toLowerCase() !== existing.email) {
    const doubleEmail = await prisma.member.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (doubleEmail) {
      const err = new Error('El correo electrónico ya se encuentra registrado por otro socio.');
      err.statusCode = 400;
      throw err;
    }
  }

  const updateData = {
    firstName: nombre ? nombre.trim() : undefined,
    lastName: apellido ? apellido.trim() : undefined,
    dni: DNI ? DNI.trim() : undefined,
    birthDate: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
    address: direccion,
    phone: telefono,
    category,
    isActive: estado ? estado.toUpperCase() === 'ACTIVO' : undefined,
    sexo,
    foto,
    ciudad,
    provincia,
    codigoPostal,
    estado,
    observaciones,
    tutorId: tutorId !== undefined ? (tutorId ? parseInt(tutorId) : null) : undefined
  };

  // Si cambia el correo del socio, sincronizarlo con el correo de su usuario vinculado
  const updatedSocio = await prisma.member.update({
    where: { id },
    data: updateData,
    include: { tutor: true, digitalCard: true }
  });

  if (email && existing.userId) {
    try {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { email: email.trim().toLowerCase(), name: `${updatedSocio.firstName} ${updatedSocio.lastName}` }
      });
    } catch {}
  }

  return updatedSocio;
}

/**
 * Elimina un socio.
 * @param {number} id
 * @returns {Promise<Member>}
 */
async function remove(id) {
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Socio no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  // Eliminar carnet digital asociado primero
  await prisma.digitalCard.deleteMany({ where: { socioId: id } });

  // Desvincular de transacciones
  await prisma.transaction.updateMany({
    where: { memberId: id },
    data: { memberId: null }
  });

  const deleted = await prisma.member.delete({ where: { id } });

  // Eliminar la cuenta del usuario para mantener consistencia
  if (existing.userId) {
    try {
      await prisma.user.delete({ where: { id: existing.userId } });
    } catch {}
  }

  return deleted;
}

module.exports = { getAll, create, update, remove };

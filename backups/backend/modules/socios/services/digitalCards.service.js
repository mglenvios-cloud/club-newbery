const prisma = require('../../../prismaClient');

/**
 * Obtiene todas las credenciales digitales.
 * @returns {Promise<DigitalCard[]>}
 */
async function getAll() {
  return prisma.digitalCard.findMany({
    include: { socio: true }
  });
}

/**
 * Genera o renueva el carnet digital de un socio.
 * @param {number} socioId
 * @returns {Promise<DigitalCard>}
 */
async function generate(socioId) {
  const socio = await prisma.member.findUnique({ where: { id: parseInt(socioId) } });
  if (!socio) {
    const err = new Error('Socio no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  // Generamos un hash/código QR único
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const qrCode = `jn-socio-${socio.id}-${socio.socioNumber}-${randomSuffix}`;
  
  // Vigencia por defecto: 5 años
  const issuedAt = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 5);

  // Buscar si ya tiene carnet para actualizarlo, de lo contrario crearlo
  const existingCard = await prisma.digitalCard.findUnique({ where: { socioId: parseInt(socioId) } });

  if (existingCard) {
    return prisma.digitalCard.update({
      where: { id: existingCard.id },
      data: {
        qrCode,
        issuedAt,
        expiresAt,
        status: 'ACTIVE'
      },
      include: { socio: true }
    });
  }

  return prisma.digitalCard.create({
    data: {
      socioId: parseInt(socioId),
      qrCode,
      issuedAt,
      expiresAt,
      status: 'ACTIVE'
    },
    include: { socio: true }
  });
}

/**
 * Obtiene un carnet por su ID.
 * @param {number} id
 * @returns {Promise<DigitalCard>}
 */
async function get(id) {
  return prisma.digitalCard.findUnique({
    where: { id: parseInt(id) },
    include: { socio: true }
  });
}

module.exports = { getAll, generate, get };

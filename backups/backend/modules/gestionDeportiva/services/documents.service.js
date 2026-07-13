/**
 * Servicio de Documentación.
 * Encapsula toda la lógica de acceso a datos para el modelo Document.
 */

const prisma = require('../../../prismaClient');

/**
 * Obtiene todos los documentos ordenados por fecha de creación (desc).
 * @returns {Promise<Document[]>}
 */
async function getAll() {
  return prisma.document.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Crea un nuevo documento.
 * @param {object} data
 * @returns {Promise<Document>}
 */
async function create(data) {
  const { title, url, category, description } = data;

  return prisma.document.create({
    data: {
      title: title.trim(),
      url: url.trim(),
      category: category.trim(),
      description: description ? description.trim() : ''
    }
  });
}

/**
 * Elimina un documento. Verifica que exista antes de eliminar.
 * @param {number} id
 * @returns {Promise<Document>}
 */
async function remove(id) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Documento no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return prisma.document.delete({ where: { id } });
}

module.exports = { getAll, create, remove };

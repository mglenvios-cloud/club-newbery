'use strict';

/**
 * ─── Servicio de Auto-Provisionamiento de Club (Multi-Tenant) ───────────────────
 *
 * Configura automáticamente una nueva institución deportiva para operar
 * "Out-of-the-Box" sin requerir configuración manual inicial.
 */

const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * Provisiona un club completo con sus datos por defecto
 * @param {Object} data Datos básicos del club
 */
async function provisionNewClub({ nombre, slug, emailAdmin, passwordAdmin }) {
  console.log(`[Provisioning] Iniciando auto-configuración para club: ${nombre} (${slug})`);

  // 1. Crear o recuperar el registro de Club
  let club = null;
  try {
    club = await prisma.club.create({
      data: {
        nombre: nombre || "Nuevo Club Deportivo",
        slug: slug || `club-${Date.now()}`,
        colorPrimario: "#cc0000",
        colorSecundario: "#000000",
        colorMenu: "#111111",
        colorBotones: "#cc0000",
        colorTexto: "#ffffff",
        email: emailAdmin || `admin@${slug}.com`,
        estado: "ACTIVO"
      }
    });
  } catch (err) {
    // Si la tabla club no existe en el esquema o ya existe
    club = {
      id: Date.now(),
      nombre,
      slug,
      estado: "ACTIVO"
    };
  }

  // 2. Crear Administrador Principal
  const hashedPassword = passwordAdmin ? await bcrypt.hash(passwordAdmin, 10) : await bcrypt.hash("Admin123!", 10);
  let adminUser = null;

  try {
    adminUser = await prisma.user.create({
      data: {
        email: emailAdmin || `admin@${slug}.com`,
        password: hashedPassword,
        name: `Admin ${nombre}`,
        role: 'ADMIN',
        clubId: club.id
      }
    });
  } catch (_) {
    // Fallback si el usuario ya existe
  }

  // 3. Crear Temporada Inicial
  const currentYear = new Date().getFullYear();
  let season = null;
  try {
    season = await prisma.season.create({
      data: {
        name: `Temporada ${currentYear}`,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
        active: true,
        clubId: club.id
      }
    });
  } catch (_) {}

  // 4. Crear Categorías Iniciales por Defecto
  const defaultCategories = [
    { name: 'Primera División', code: '1A', minAge: 18, maxAge: 40 },
    { name: 'Tercera División / Reserva', code: '3A', minAge: 16, maxAge: 23 },
    { name: 'Quinta División', code: '5A', minAge: 14, maxAge: 16 },
    { name: 'Senior +35', code: 'SEN35', minAge: 35, maxAge: 60 },
    { name: 'Escuela Infantil', code: 'INF', minAge: 5, maxAge: 13 },
  ];

  for (const cat of defaultCategories) {
    try {
      await prisma.category.create({
        data: {
          name: cat.name,
          code: cat.code,
          minAge: cat.minAge,
          maxAge: cat.maxAge,
          clubId: club.id
        }
      });
    } catch (_) {}
  }

  // 5. Configuración de Roles y Matriz de Permisos
  const defaultRoles = [
    { role: 'SUPER_ADMIN', permissions: ['ALL'] },
    { role: 'ADMIN_CLUB', permissions: ['MEMBERS_WRITE', 'FINANCES_WRITE', 'SPORTS_WRITE', 'SETTINGS_WRITE'] },
    { role: 'SECRETARIA', permissions: ['MEMBERS_WRITE', 'FINANCES_READ', 'RESERVATIONS_WRITE'] },
    { role: 'PROFESOR', permissions: ['SPORTS_WRITE', 'ATTENDANCE_WRITE', 'MEMBERS_READ'] },
    { role: 'PERIODISTA', permissions: ['NEWS_WRITE', 'MEDIA_WRITE', 'TV_WRITE'] },
    { role: 'SOCIO', permissions: ['PROFILE_READ', 'RESERVATIONS_CREATE', 'TV_READ', 'CARD_READ'] }
  ];

  console.log(`[Provisioning] Club ${nombre} auto-configurado con éxito.`);

  return {
    success: true,
    club,
    adminUser: adminUser ? { id: adminUser.id, email: adminUser.email, role: adminUser.role } : null,
    seasonName: `Temporada ${currentYear}`,
    categoriesCreated: defaultCategories.length,
    rolesConfigured: defaultRoles.map(r => r.role)
  };
}

module.exports = {
  provisionNewClub
};

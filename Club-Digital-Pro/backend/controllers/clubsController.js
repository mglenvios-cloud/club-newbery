// clubsController.js - Acciones para el Panel Maestro (SuperAdmin) e Inquilinos

// En producción esto se importará desde PrismaClient:
// const prisma = require('../database/prismaClient');

// Base de datos en memoria para inicialización y testing rápido de Fase 1
let CLUBS_DB = [
  {
    id: "club-1",
    nombre: "Jorge Newbery (Demo)",
    slug: "jorge-newbery",
    logo: "",
    escudo: "",
    banner: "",
    colorPrimario: "#cc0000",
    colorSecundario: "#000000",
    colorMenu: "#111111",
    colorBotones: "#cc0000",
    colorTexto: "#ffffff",
    email: "contacto@jorge-newbery.com",
    estado: "ACTIVO"
  },
  {
    id: "club-2",
    nombre: "Club Social Belgrano (Demo)",
    slug: "social-belgrano",
    logo: "",
    escudo: "",
    banner: "",
    colorPrimario: "#0066cc",
    colorSecundario: "#ffffff",
    colorMenu: "#0f172a",
    colorBotones: "#0066cc",
    colorTexto: "#334155",
    email: "info@socialbelgrano.com",
    estado: "ACTIVO"
  }
];

exports.getActiveClubConfig = (req, res) => {
  // Retorna la configuración dinámica del inquilino actual resuelto por el middleware
  return res.json(req.club);
};

// Panel Maestro: Listar todos los clubes registrados
exports.listAllClubs = (req, res) => {
  return res.json(CLUBS_DB);
};

// Panel Maestro: Crear nuevo club (Alta SaaS)
exports.createClub = (req, res) => {
  const { nombre, slug, colorPrimario, colorSecundario, colorMenu, colorBotones, colorTexto, email } = req.body;
  
  if (!nombre || !slug) {
    return res.status(400).json({ error: "Nombre y slug son obligatorios para dar de alta un club." });
  }

  const exists = CLUBS_DB.some(c => c.slug === slug);
  if (exists) {
    return res.status(400).json({ error: "El slug ya está registrado para otra institución." });
  }

  const newClub = {
    id: `club-${Date.now()}`,
    nombre,
    slug,
    colorPrimario: colorPrimario || "#cc0000",
    colorSecundario: colorSecundario || "#000000",
    colorMenu: colorMenu || "#1f2937",
    colorBotones: colorBotones || "#cc0000",
    colorTexto: colorTexto || "#ffffff",
    email: email || "",
    estado: "ACTIVO",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  CLUBS_DB.push(newClub);
  return res.status(201).json(newClub);
};

// Panel Maestro: Editar configuración visual o datos del club
exports.updateClub = (req, res) => {
  const { id } = req.params;
  const index = CLUBS_DB.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Club no encontrado en el panel maestro." });
  }

  const updated = {
    ...CLUBS_DB[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  CLUBS_DB[index] = updated;
  return res.json(updated);
};

// Panel Maestro: Activar o desactivar licencias
exports.toggleClubStatus = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'ACTIVO', 'INACTIVO', 'SUSPENDIDO'

  const index = CLUBS_DB.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Club no encontrado." });
  }

  CLUBS_DB[index].estado = estado;
  return res.json({ message: `Estado del club modificado a ${estado} con éxito.`, club: CLUBS_DB[index] });
};

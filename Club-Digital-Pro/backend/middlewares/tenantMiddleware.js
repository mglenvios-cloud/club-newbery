// tenantMiddleware.js - Resolución dinámica de inquilino (SaaS Multi-Club)

// Mock o simulación de repositorio de clubes para el arranque inicial
// En el futuro esto consultará mediante Prisma o Firestore
const CLUBS_MOCK_DB = [
  {
    id: "club-1",
    nombre: "Jorge Newbery (Demo)",
    slug: "jorge-newbery",
    logo: "/images/escudo.png",
    escudo: "/images/escudo.png",
    banner: "/images/banner-fallback.jpg",
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
    logo: "/images/belgrano-logo.png",
    escudo: "/images/belgrano-logo.png",
    banner: "/images/belgrano-banner.jpg",
    colorPrimario: "#0066cc",
    colorSecundario: "#ffffff",
    colorMenu: "#0f172a",
    colorBotones: "#0066cc",
    colorTexto: "#334155",
    email: "info@socialbelgrano.com",
    estado: "ACTIVO"
  }
];

module.exports = async function tenantMiddleware(req, res, next) {
  try {
    // 1. Extraer slug desde cabeceras, host o query strings
    let clubSlug = req.headers['x-club-slug'] || req.query.club;

    if (!clubSlug) {
      const host = req.headers.host || '';
      // Si el host es un subdominio (ej: club-a.clubdigital.pro)
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        clubSlug = parts[0];
      }
    }

    // Default o fallback para desarrollo
    if (!clubSlug) {
      clubSlug = 'jorge-newbery'; // Club por defecto para pruebas
    }

    // 2. Buscar club correspondiente en la BD (mock inicial, escalable a Prisma/Firestore)
    const activeClub = CLUBS_MOCK_DB.find(c => c.slug === clubSlug);

    if (!activeClub) {
      return res.status(404).json({ 
        error: "Club no registrado o inactivo en Club Digital Pro",
        slugAttempted: clubSlug
      });
    }

    if (activeClub.estado !== 'ACTIVO') {
      return res.status(403).json({ 
        error: "La licencia de este club se encuentra suspendida o inactiva." 
      });
    }

    // 3. Injectar inquilino en la request
    req.club = activeClub;
    next();
  } catch (err) {
    res.status(500).json({ error: "Error interno al resolver inquilino: " + err.message });
  }
};
